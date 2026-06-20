#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const thresholdPath = path.join(repoRoot, 'config', 'amino-acid-thresholds.v1.json');
const aminoAcidThresholds = readJson(thresholdPath);

const FDC_NUTRIENTS = {
  501: 'tryptophan_mg',
  502: 'threonine_mg',
  503: 'isoleucine_mg',
  504: 'leucine_mg',
  505: 'lysine_mg',
  506: 'methionine_mg',
  507: 'cystine_mg',
  508: 'phenylalanine_mg',
  509: 'tyrosine_mg',
  510: 'valine_mg',
  511: 'arginine_mg',
  512: 'histidine_mg',
  513: 'alanine_mg',
  514: 'aspartic_acid_mg',
  515: 'glutamic_acid_mg',
  516: 'glycine_mg',
  517: 'proline_mg',
  518: 'serine_mg',
  521: 'hydroxyproline_mg'
};
const MIN_AMINO_ACID_ROWS_FOR_PROFILE = 8;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function readLocalEnv() {
  const env = {};
  for (const file of ['.env.local', '.env']) {
    const envPath = path.join(repoRoot, file);
    if (!fs.existsSync(envPath)) continue;
    for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const equals = line.indexOf('=');
      if (equals === -1) continue;
      const key = line.slice(0, equals).trim();
      const value = line.slice(equals + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && value) env[key] = value;
    }
  }
  return env;
}

function apiKey() {
  const localEnv = readLocalEnv();
  return process.env.USDA_API_KEY
    || process.env.FDC_API_KEY
    || process.env.FOODDATA_CENTRAL_API_KEY
    || localEnv.USDA_API_KEY
    || localEnv.FDC_API_KEY
    || localEnv.FOODDATA_CENTRAL_API_KEY
    || 'DEMO_KEY';
}

function fdcIdsFromSource(source) {
  const text = `${source.recordId || ''} ${source.fdcId || ''} ${source.url || ''}`;
  const ids = [];
  for (const match of text.matchAll(/FDC\s*(\d+)|food-details\/(\d+)/ig)) {
    ids.push(Number(match[1] || match[2]));
  }
  return ids.filter(Number.isFinite);
}

function isExactFoodSource(source) {
  const text = `${source.sourceType || ''} ${source.sourceName || ''}`.toLowerCase();
  return !/context|contrast|search/.test(text);
}

function fdcSourcesForFood(food) {
  const out = [];
  for (const source of food.nutritionDataSources || []) {
    if (!isExactFoodSource(source)) continue;
    for (const fdcId of fdcIdsFromSource(source)) {
      out.push({
        fdcId,
        sourceName: source.sourceName || 'USDA FoodData Central',
        sourceType: source.sourceType || null,
        url: source.url || `https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`
      });
    }
  }
  return out;
}

function chunk(items, size) {
  const out = [];
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
  return out;
}

async function fetchFoods(fdcIds, key) {
  const nutrients = Object.keys(FDC_NUTRIENTS);
  const rows = [];
  for (const group of chunk(fdcIds, 25)) {
    const params = new URLSearchParams({ api_key: key });
    for (const nutrient of nutrients) params.append('nutrients', nutrient);
    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fdcIds: group, format: 'full' })
    });
    if (!response.ok) {
      throw new Error(`FDC fetch failed with ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) rows.push(...data);
  }
  return rows;
}

function aminoAcidValuesFromFdc(food) {
  const values = {};
  for (const item of food.foodNutrients || []) {
    const number = Number(item.nutrient?.number);
    const key = FDC_NUTRIENTS[number];
    const amount = Number(item.amount);
    if (!key || !Number.isFinite(amount)) continue;
    values[key] = Number((amount * 1000).toFixed(1));
  }
  return values;
}

function finiteMetric(food, metricKey) {
  const value = food.metrics?.amino_acids_mg?.[metricKey];
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function aminoGroupScore(food, groups) {
  return (groups || []).filter(group => {
    const values = (group.metricKeys || []).map(metricKey => finiteMetric(food, metricKey));
    if (values.every(value => value === null)) return false;
    const total = values.reduce((sum, value) => sum + (value || 0), 0);
    return total >= Number(group.thresholdMg);
  }).length;
}

function applyDerivedProteinScores(food, hasExactAminoProfile) {
  food.metrics ||= {};
  food.metricProvenance ||= {};

  if (hasExactAminoProfile) {
    food.metrics.essential_amino_acids_score = aminoGroupScore(food, aminoAcidThresholds.essentialGroups);
    food.metrics.nonessential_amino_acids_score = aminoGroupScore(food, aminoAcidThresholds.nonessentialGroups);
    food.metricProvenance.essential_amino_acids_score = `Derived from source-backed amino_acids_mg using ${path.relative(repoRoot, thresholdPath)}; only amino-acid groups meeting useful amount thresholds count.`;
    food.metricProvenance.nonessential_amino_acids_score = `Derived from source-backed amino_acids_mg using ${path.relative(repoRoot, thresholdPath)}; only amino-acid groups meeting useful amount thresholds count.`;
    food.metricProvenance.amino_acids_mg = 'USDA FoodData Central amino-acid nutrient rows converted from g to mg per 100g.';
    return;
  }

  food.metrics.essential_amino_acids_score = null;
  food.metrics.nonessential_amino_acids_score = null;
  food.metrics.bioavailability_percent = null;
  food.metricProvenance.essential_amino_acids_score = 'N/A until source-backed specific amino-acid amounts are available; trace/presence proxy scores are not used.';
  food.metricProvenance.nonessential_amino_acids_score = 'N/A until source-backed specific amino-acid amounts are available; trace/presence proxy scores are not used.';
  food.metricProvenance.bioavailability_percent = 'N/A until protein quality is source-backed for this exact food identity.';
}

async function main() {
  const key = apiKey();
  const foodFiles = fs.readdirSync(foodsDir)
    .filter(file => file.endsWith('.sample.json'))
    .sort()
    .map(file => path.join(foodsDir, file));

  const foods = foodFiles.map(file => ({ file, food: readJson(file) }));
  const sourcesByFood = new Map();
  const uniqueFdcIds = new Set();
  for (const item of foods) {
    const sources = fdcSourcesForFood(item.food);
    sourcesByFood.set(item.food.id, sources);
    for (const source of sources) uniqueFdcIds.add(source.fdcId);
  }

  const fdcFoods = await fetchFoods([...uniqueFdcIds], key);
  const byFdcId = new Map(fdcFoods.map(food => [food.fdcId, food]));
  let updatedProfiles = 0;
  let clearedProxyScores = 0;

  for (const item of foods) {
    const sources = sourcesByFood.get(item.food.id) || [];
    let selected = null;
    for (const source of sources) {
      const fdcFood = byFdcId.get(source.fdcId);
      if (!fdcFood) continue;
      const values = aminoAcidValuesFromFdc(fdcFood);
      if (Object.keys(values).length < MIN_AMINO_ACID_ROWS_FOR_PROFILE) continue;
      selected = { source, fdcFood, values };
      break;
    }

    if (selected) {
      item.food.metrics ||= {};
      item.food.metrics.amino_acids_mg = selected.values;
      item.food.aminoAcidDataSource = {
        sourceName: selected.source.sourceName,
        sourceType: selected.source.sourceType,
        recordId: `FDC ${selected.source.fdcId}`,
        url: selected.source.url,
        fetchedAt: new Date().toISOString().slice(0, 10),
        thresholdPolicy: path.relative(repoRoot, thresholdPath),
        fdcDescription: selected.fdcFood.description || null
      };
      applyDerivedProteinScores(item.food, true);
      updatedProfiles += 1;
    } else {
      if (item.food.metrics?.amino_acids_mg) delete item.food.metrics.amino_acids_mg;
      if (item.food.aminoAcidDataSource) delete item.food.aminoAcidDataSource;
      applyDerivedProteinScores(item.food, false);
      clearedProxyScores += 1;
    }

    writeJson(item.file, item.food);
  }

  console.log(JSON.stringify({
    status: 'ok',
    apiKeyMode: key === 'DEMO_KEY' ? 'DEMO_KEY' : 'configured',
    fdcIdsRequested: uniqueFdcIds.size,
    fdcFoodsReturned: fdcFoods.length,
    updatedProfiles,
    clearedProxyScores
  }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
