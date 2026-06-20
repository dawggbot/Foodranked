#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const episodesDir = path.join(repoRoot, 'outputs', 'episodes');
const dataDir = path.join(repoRoot, 'docs', 'data');
const finalisationConfig = path.join(repoRoot, 'config', 'finalisation-sample-foods.v1.json');

const args = new Set(process.argv.slice(2));
const scopeArg = process.argv.find(arg => arg.startsWith('--scope='));
const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

const HEADER_KEYS = ['kcal', 'fat_g', 'carb_g', 'protein_g'];
const CONTEXT_SIDES = ['pros', 'cons'];
const LABEL_SCORES = {
  '3_red': 0,
  '2_red': 20,
  '1_red': 40,
  '1_green': 60,
  '2_green': 80,
  '3_green': 100
};
const PLACEHOLDER_NOTE_RE = /placeholder|calibration benchmark|not a clinical nutrient database|tuning only/i;
const BAD_TEXT_PATTERNS = [
  { pattern: /\bnot a complete food on its own\b/i, message: 'generic complete-food con' },
  { pattern: /\bnitrous oxide\b/i, message: 'use nitric oxide for dietary nitrate context' },
  { pattern: /\bpoly unsaturated\b/i, message: 'standard term is polyunsaturated' },
  { pattern: /\bthresh holds\b/i, message: 'standard term is thresholds' },
  { pattern: /\bsubmracros?\b/i, message: 'standard term is submacros' },
  { pattern: /\bmore points then\b/i, message: 'use than for comparison' },
  { pattern: /\btheir to inform\b/i, message: 'use there to inform' }
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listJson(dir) {
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => path.join(dir, name));
}

function walkFiles(dir, includeFile, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      walkFiles(file, includeFile, results);
    } else if (!includeFile || includeFile(file)) {
      results.push(file);
    }
  }
  return results;
}

function issue(list, file, message, extra = {}) {
  list.push({ file: path.relative(repoRoot, file), message, ...extra });
}

function walkStrings(value, visit, pathParts = []) {
  if (typeof value === 'string') {
    visit(value, pathParts.join('.'));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, [...pathParts, String(index)]));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      walkStrings(child, visit, [...pathParts, key]);
    }
  }
}

function finalisationIds() {
  if (!fs.existsSync(finalisationConfig)) return new Set();
  const config = readJson(finalisationConfig);
  return new Set((config.foods || []).map(item => (typeof item === 'string' ? item : item.id || item.foodId)).filter(Boolean));
}

function expectedScoreForArrowLabel(label, polarity) {
  const value = String(label || '').trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(LABEL_SCORES, value)) return LABEL_SCORES[value];

  const up = (value.match(/↑/g) || []).length;
  const down = (value.match(/↓/g) || []).length;
  if (!up && !down) return null;

  const count = Math.max(up, down);
  const higherWorse = polarity === 'higher_worse';
  if (up) {
    if (higherWorse) return ({ 1: 40, 2: 20, 3: 0 })[count] ?? null;
    return ({ 1: 60, 2: 80, 3: 100 })[count] ?? null;
  }
  if (higherWorse) return ({ 1: 60, 2: 80, 3: 100 })[count] ?? null;
  return ({ 1: 40, 2: 20, 3: 0 })[count] ?? null;
}

function nutritionSources(food) {
  const direct = food.nutritionDataSources || food.sourceEvidence?.nutritionDataSources || [];
  return Array.isArray(direct) ? direct : [];
}

function hasTwoDistinctNutritionSources(food) {
  const distinct = new Set();
  for (const source of nutritionSources(food)) {
    const key = [
      String(source.sourceName || source.name || '').trim().toLowerCase(),
      String(source.recordId || source.fdcId || source.url || '').trim().toLowerCase()
    ].filter(Boolean).join('|');
    if (key) distinct.add(key);
  }
  return distinct.size >= 2;
}

function needsStrictSourceEvidence(food, finalIds) {
  if (scope === 'finalisation') return finalIds.has(food.id);
  if (scope === 'production') {
    return /production-safe|near-production-safe/i.test(food.scoreReadiness?.status || '')
      || (food.sourceNotes || []).some(note => /production-lane cleanup pass/i.test(note));
  }
  if (scope === 'all-strict') return true;
  return finalIds.has(food.id) || /production-safe/i.test(food.scoreReadiness?.status || '');
}

function auditFoods(errors, warnings) {
  const finalIds = finalisationIds();
  const foodFiles = listJson(foodsDir).filter(file => file.endsWith('.sample.json'));
  const selected = foodFiles.filter(file => {
    const food = readJson(file);
    if (scope === 'finalisation') return finalIds.has(food.id);
    if (scope === 'production') return needsStrictSourceEvidence(food, finalIds);
    return true;
  });
  const seenIds = new Map();
  const seenNames = new Map();
  const repeatedTitles = new Map();

  for (const file of selected) {
    const food = readJson(file);
    if (!food.id) issue(errors, file, 'missing food id');
    if (!food.name) issue(errors, file, 'missing food name');

    if (food.id) {
      if (seenIds.has(food.id)) issue(errors, file, `duplicate food id with ${seenIds.get(food.id)}`);
      else seenIds.set(food.id, path.relative(repoRoot, file));
    }

    const normalizedName = String(food.name || '').trim().toLowerCase();
    if (normalizedName) {
      const previous = seenNames.get(normalizedName);
      if (previous) issue(errors, file, `duplicate food name with ${previous}`);
      else seenNames.set(normalizedName, path.relative(repoRoot, file));
    }

    if (food.basis?.value !== 100 || food.basis?.unit !== 'g') {
      issue(errors, file, 'basis must be exactly per 100g', { basis: food.basis || null });
    }

    for (const key of HEADER_KEYS) {
      if (typeof food.header?.[key] !== 'number') {
        issue(errors, file, `header.${key} must be a number`);
      }
    }

    for (const [key, value] of Object.entries(food.metrics || {})) {
      if (value !== null && typeof value !== 'number') {
        issue(errors, file, `metrics.${key} must be number or null`);
      }
    }

    for (const side of CONTEXT_SIDES) {
      const items = food.contextItems?.[side] || [];
      if (items.length !== 3) issue(errors, file, `${side} must contain exactly 3 items`, { count: items.length });
      const localTitles = new Set();
      for (const item of items) {
        if (!item.title || !item.explanation || !item.impactLevel) {
          issue(errors, file, `${side} item missing title, explanation, or impactLevel`, { itemKey: item.itemKey || null });
        }
        const titleKey = String(item.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        if (titleKey) {
          if (localTitles.has(titleKey)) issue(errors, file, `duplicate ${side} title inside food`, { title: item.title });
          localTitles.add(titleKey);
          const globalKey = `${side}:${titleKey}`;
          const rows = repeatedTitles.get(globalKey) || [];
          rows.push(food.id || path.basename(file));
          repeatedTitles.set(globalKey, rows);
        }
      }
    }

    const notes = food.sourceNotes || [];
    const strictSources = needsStrictSourceEvidence(food, finalIds);
    if (strictSources && !hasTwoDistinctNutritionSources(food)) {
      issue(errors, file, 'production/finalisation food needs at least two structured nutritionDataSources');
    }
    if (strictSources && notes.some(note => PLACEHOLDER_NOTE_RE.test(note))) {
      issue(errors, file, 'production/finalisation food still carries placeholder source notes');
    }
    if (!strictSources && notes.some(note => PLACEHOLDER_NOTE_RE.test(note))) {
      issue(warnings, file, 'calibration placeholder data, not production source-backed');
    }

    walkStrings(food, (text, pointer) => {
      for (const { pattern, message } of BAD_TEXT_PATTERNS) {
        if (pattern.test(text)) issue(errors, file, message, { pointer, text });
      }
    });
  }

  for (const [title, rows] of repeatedTitles.entries()) {
    if (rows.length >= 12) {
      warnings.push({
        file: 'foods/',
        message: 'highly repeated context item title; consider making future production copy more food-specific',
        title,
        count: rows.length,
        examples: rows.slice(0, 8)
      });
    }
  }

  return { foodFiles: selected.length };
}

function auditRulesets(errors) {
  const ruleFiles = listJson(rulesetsDir);
  const foods = listJson(foodsDir).map(readJson);
  const numericMetricValuesByType = {};
  for (const food of foods) {
    numericMetricValuesByType[food.foodType] ??= {};
    for (const [metricKey, value] of Object.entries(food.metrics || {})) {
      if (typeof value !== 'number') continue;
      numericMetricValuesByType[food.foodType][metricKey] ??= 0;
      numericMetricValuesByType[food.foodType][metricKey] += 1;
    }
  }

  for (const file of ruleFiles) {
    const ruleset = readJson(file);
    const weights = Object.values(ruleset.sectionWeights || {});
    const sum = weights.reduce((total, value) => total + Number(value || 0), 0);
    if (Math.abs(sum - 1) > 0.00001) issue(errors, file, 'section weights must sum to 1', { sum });

    for (const rule of ruleset.metricRules || []) {
      if (rule.scoringRole === 'scored' && rule.weight === 0 && rule.applicability !== 'not_applicable') {
        issue(errors, file, 'zero-weight scored metric must be not_applicable', { metricKey: rule.metricKey });
      }

      const bands = rule.bands || [];
      if (rule.scoringRole === 'scored' && rule.scoringMode === 'arrow_bands' && rule.applicability !== 'not_applicable' && bands.length !== 6) {
        issue(errors, file, 'scored arrow metric should use six bands', { metricKey: rule.metricKey, bandCount: bands.length });
      }

      if (rule.scoringRole === 'scored' && rule.scoringMode === 'arrow_bands' && rule.applicability === 'not_applicable') {
        const numericCount = numericMetricValuesByType[ruleset.foodType]?.[rule.metricKey] || 0;
        if (numericCount > 0) {
          issue(errors, file, 'numeric submacro metric cannot be not_applicable; use bands or make the food value N/A', {
            metricKey: rule.metricKey,
            numericCount
          });
        }
      }

      for (let index = 0; index < bands.length; index += 1) {
        const band = bands[index];
        const expected = expectedScoreForArrowLabel(band.label, rule.polarity);
        if (expected !== null && expected !== band.score) {
          issue(errors, file, 'arrow label score does not match polarity/colour rules', {
            metricKey: rule.metricKey,
            label: band.label,
            score: band.score,
            expected
          });
        }
        const previous = bands[index - 1];
        if (previous && typeof previous.max === 'number' && typeof band.min === 'number' && previous.max !== band.min) {
          issue(errors, file, 'band min/max should be continuous', {
            metricKey: rule.metricKey,
            previous: previous.label,
            current: band.label,
            previousMax: previous.max,
            currentMin: band.min
          });
        }
      }
    }

    if (ruleset.proteinFallback) {
      const bands = ruleset.proteinFallback.bands || [];
      if (bands.length !== 6) {
        issue(errors, file, 'protein fallback should use six arrow bands', { bandCount: bands.length });
      }
      for (const band of bands) {
        const expected = expectedScoreForArrowLabel(band.label, 'higher_better');
        if (expected !== null && expected !== band.score) {
          issue(errors, file, 'protein fallback arrow label score does not match higher-better rules', {
            label: band.label,
            score: band.score,
            expected
          });
        }
      }
    }

    for (const [index, anchor] of (ruleset.scoreCalibration?.anchors || []).entries()) {
      const previous = ruleset.scoreCalibration.anchors[index - 1];
      if (!previous) continue;
      if (anchor.raw < previous.raw || anchor.calibrated < previous.calibrated) {
        issue(errors, file, 'score calibration anchors must be monotonic');
      }
    }
  }
  return { ruleFiles: ruleFiles.length };
}

function generatedEpisodeIdsForScope() {
  if (!fs.existsSync(episodesDir)) return new Set();
  const finalIds = finalisationIds();
  if (scope === 'finalisation') return finalIds;

  if (scope === 'production') {
    const ids = new Set();
    for (const file of listJson(foodsDir).filter(name => name.endsWith('.sample.json'))) {
      const food = readJson(file);
      if (needsStrictSourceEvidence(food, finalIds)) ids.add(food.id);
    }
    return ids;
  }

  return new Set(fs.readdirSync(episodesDir)
    .filter(name => name.endsWith('-compact') || name.endsWith('-standard'))
    .map(name => name.replace(/-(compact|standard)$/, '')));
}

function auditGeneratedText(errors) {
  const ids = generatedEpisodeIdsForScope();
  const textExtensions = new Set(['.json', '.txt', '.js', '.md']);
  const generatedFiles = [];

  for (const id of ids) {
    for (const suffix of ['compact', 'standard']) {
      const dir = path.join(episodesDir, `${id}-${suffix}`);
      walkFiles(dir, file => textExtensions.has(path.extname(file)), generatedFiles);
    }
  }

  if (scope !== 'finalisation') {
    for (const name of ['foods-index.json', 'foods-index.js']) {
      const file = path.join(dataDir, name);
      if (fs.existsSync(file)) generatedFiles.push(file);
    }
  }

  for (const file of generatedFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const { pattern, message } of BAD_TEXT_PATTERNS) {
      if (pattern.test(text)) issue(errors, file, `generated output contains ${message}`);
    }
  }

  return { generatedFiles: generatedFiles.length };
}

function main() {
  const errors = [];
  const warnings = [];
  const foodStats = auditFoods(errors, warnings);
  const ruleStats = auditRulesets(errors);
  const generatedStats = auditGeneratedText(errors);
  const result = {
    status: errors.length ? 'fail' : 'ok',
    scope,
    checkedAt: new Date().toISOString(),
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      ...foodStats,
      ...ruleStats,
      ...generatedStats
    },
    errors,
    warnings: args.has('--show-warnings') ? warnings : warnings.slice(0, 80)
  };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exit(1);
}

main();
