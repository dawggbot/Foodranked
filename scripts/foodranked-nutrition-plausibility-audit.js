#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const publishedFoodsDir = path.join(repoRoot, 'docs', 'data', 'foods');
const finalisationConfig = path.join(repoRoot, 'config', 'finalisation-sample-foods.v1.json');

const args = new Set(process.argv.slice(2));
const scopeArg = process.argv.find(arg => arg.startsWith('--scope='));
const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

const PUBLIC_SYNC_FIELDS = [
  'identity',
  'basis',
  'header',
  'metrics',
  'metricProvenance',
  'nutritionDataSources',
  'sourceNotes',
  'scoreReadiness',
  'contextItems'
];

const DV_WARNING_PERCENT = 1000;
const MAX_KCAL_PER_100G = 950;
const MACRO_PARENT_TOLERANCE_G = 0.25;
const FAT_PARENT_TOLERANCE_MG = 250;
const MACRO_SUM_TOLERANCE_G = 5;
const CARB_COMPONENT_BASE_TOLERANCE_G = 3;
const GI_MAX_REASONABLE = 110;

const PROTEIN_SCORE_LIMITS = {
  collagen_g: { maxFromHeader: 'protein_g' },
  essential_amino_acids_score: { min: 0, max: 9 },
  nonessential_amino_acids_score: { min: 0, max: 11 },
  bioavailability_percent: { min: 0, max: 100 }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listFoodFiles() {
  return fs.readdirSync(foodsDir)
    .filter(name => name.endsWith('.sample.json'))
    .sort()
    .map(name => path.join(foodsDir, name));
}

function relative(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function issue(list, file, message, extra = {}) {
  list.push({ file: relative(file), message, ...extra });
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function round(value, decimals = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return Number(number.toFixed(decimals));
}

function sameJson(left, right) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

function finalisationIds() {
  if (!fs.existsSync(finalisationConfig)) return new Set();
  const config = readJson(finalisationConfig);
  return new Set((config.foods || [])
    .map(item => (typeof item === 'string' ? item : item.id || item.foodId))
    .filter(Boolean));
}

function needsStrictSourceEvidence(food, finalIds) {
  if (scope === 'finalisation') return finalIds.has(food.id);
  if (scope === 'production') {
    return finalIds.has(food.id)
      || /production-safe|near-production-safe/i.test(food.scoreReadiness?.status || '')
      || (food.sourceNotes || []).some(note => /production-lane cleanup pass/i.test(note));
  }
  if (scope === 'all-strict') return true;
  return finalIds.has(food.id) || /production-safe/i.test(food.scoreReadiness?.status || '');
}

function selectedFoodFiles() {
  const finalIds = finalisationIds();
  return listFoodFiles().filter(file => {
    if (scope === 'all' || scope === 'all-strict') return true;
    const food = readJson(file);
    if (scope === 'finalisation') return finalIds.has(food.id);
    if (scope === 'production') return needsStrictSourceEvidence(food, finalIds);
    throw new Error(`Unknown scope: ${scope}. Expected all, all-strict, production, or finalisation.`);
  });
}

function auditPublicFoodSync(food, file, errors, warnings) {
  const publicFile = path.join(publishedFoodsDir, path.basename(file));
  if (!fs.existsSync(publicFile)) {
    issue(warnings, file, 'published docs/data food copy is missing');
    return;
  }

  const publicFood = readJson(publicFile);
  for (const field of PUBLIC_SYNC_FIELDS) {
    if (!sameJson(food[field], publicFood[field])) {
      issue(errors, file, 'source food and published docs/data food copy are out of sync', {
        field,
        publishedFile: relative(publicFile)
      });
    }
  }
}

function auditHeaderBounds(food, file, errors) {
  const header = food.header || {};
  for (const key of ['kcal', 'fat_g', 'carb_g', 'protein_g']) {
    const value = finiteNumber(header[key]);
    if (value === null) continue;
    if (value < 0) issue(errors, file, `header.${key} cannot be negative`, { value });
  }

  const kcal = finiteNumber(header.kcal);
  const fat = finiteNumber(header.fat_g);
  const carbs = finiteNumber(header.carb_g);
  const protein = finiteNumber(header.protein_g);

  if (kcal !== null && kcal > MAX_KCAL_PER_100G) {
    issue(errors, file, 'header.kcal is above a plausible per-100g food energy ceiling', { kcal });
  }
  for (const [key, value] of Object.entries({ fat_g: fat, carb_g: carbs, protein_g: protein })) {
    if (value !== null && value > 100) {
      issue(errors, file, `header.${key} cannot exceed 100g per 100g`, { value });
    }
  }
  if ([fat, carbs, protein].every(value => value !== null)) {
    const macroSum = fat + carbs + protein;
    if (macroSum > 100 + MACRO_SUM_TOLERANCE_G) {
      issue(errors, file, 'header macro grams exceed plausible per-100g total', {
        fat_g: fat,
        carb_g: carbs,
        protein_g: protein,
        macroSum: round(macroSum, 2)
      });
    }
  }
}

function auditMetricBounds(food, file, errors, warnings) {
  const header = food.header || {};
  const metrics = food.metrics || {};

  for (const [key, value] of Object.entries(metrics)) {
    if (key === 'amino_acids_mg') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
      for (const [aminoKey, aminoValue] of Object.entries(value)) {
        const number = finiteNumber(aminoValue);
        if (number !== null && number < 0) {
          issue(errors, file, 'amino acid value cannot be negative', { metricKey: aminoKey, value: number });
        }
      }
      continue;
    }

    const number = finiteNumber(value);
    if (number === null) continue;
    if (number < 0) issue(errors, file, `metrics.${key} cannot be negative`, { value: number });
    if (/_dv$/.test(key) && number > DV_WARNING_PERCENT) {
      issue(warnings, file, 'very high DV percentage; verify source unit and conversion', {
        metricKey: key,
        value: number
      });
    }
  }

  const fat = finiteNumber(header.fat_g);
  const carbs = finiteNumber(header.carb_g);
  const protein = finiteNumber(header.protein_g);
  const saturatedFat = finiteNumber(metrics.saturated_fat_g);
  const monounsaturatedFat = finiteNumber(metrics.monounsaturated_fat_g);
  const polyunsaturatedFat = finiteNumber(metrics.polyunsaturated_fat_g);
  const omega3 = finiteNumber(metrics.omega3_mg);
  const sugar = finiteNumber(metrics.sugar_g);
  const starch = finiteNumber(metrics.starch_g);
  const fibre = finiteNumber(metrics.fibre_g);
  const glycemicIndex = finiteNumber(metrics.glycemic_index);

  if (fat !== null && saturatedFat !== null && saturatedFat > fat + MACRO_PARENT_TOLERANCE_G) {
    issue(errors, file, 'saturated fat exceeds total fat', { saturated_fat_g: saturatedFat, fat_g: fat });
  }
  if (fat !== null && polyunsaturatedFat !== null && polyunsaturatedFat > fat + MACRO_PARENT_TOLERANCE_G) {
    issue(errors, file, 'polyunsaturated fat exceeds total fat', { polyunsaturated_fat_g: polyunsaturatedFat, fat_g: fat });
  }
  if (fat !== null && monounsaturatedFat !== null && monounsaturatedFat > fat + MACRO_PARENT_TOLERANCE_G) {
    issue(errors, file, 'monounsaturated fat exceeds total fat', { monounsaturated_fat_g: monounsaturatedFat, fat_g: fat });
  }
  if (fat !== null && [saturatedFat, monounsaturatedFat, polyunsaturatedFat].every(value => value !== null)) {
    const componentSum = saturatedFat + monounsaturatedFat + polyunsaturatedFat;
    const tolerance = Math.max(MACRO_PARENT_TOLERANCE_G, fat * 0.05);
    if (componentSum > fat + tolerance) {
      issue(warnings, file, 'fat subcomponents are higher than total fat; verify mixed source methods', {
        saturated_fat_g: saturatedFat,
        monounsaturated_fat_g: monounsaturatedFat,
        polyunsaturated_fat_g: polyunsaturatedFat,
        fat_g: fat
      });
    }
  }
  if (fat !== null && omega3 !== null && omega3 > fat * 1000 + FAT_PARENT_TOLERANCE_MG) {
    issue(errors, file, 'omega 3 milligrams exceed total fat grams converted to milligrams', {
      omega3_mg: omega3,
      fat_g: fat
    });
  }
  if (polyunsaturatedFat !== null && omega3 !== null && omega3 > polyunsaturatedFat * 1000 + FAT_PARENT_TOLERANCE_MG) {
    issue(errors, file, 'omega 3 milligrams exceed polyunsaturated fat grams converted to milligrams', {
      omega3_mg: omega3,
      polyunsaturated_fat_g: polyunsaturatedFat
    });
  }
  if (carbs !== null && sugar !== null && sugar > carbs + MACRO_PARENT_TOLERANCE_G) {
    issue(errors, file, 'sugar exceeds total carbohydrate', { sugar_g: sugar, carb_g: carbs });
  }
  if (carbs !== null && starch !== null && starch > carbs + MACRO_PARENT_TOLERANCE_G) {
    issue(errors, file, 'starch exceeds total carbohydrate', { starch_g: starch, carb_g: carbs });
  }
  if (carbs !== null && [sugar, starch, fibre].every(value => value !== null)) {
    const componentSum = sugar + starch + fibre;
    const tolerance = Math.max(CARB_COMPONENT_BASE_TOLERANCE_G, carbs * 0.1);
    if (componentSum > carbs + tolerance) {
      issue(warnings, file, 'carb subcomponents are higher than total carbohydrate; verify mixed source methods', {
        sugar_g: sugar,
        starch_g: starch,
        fibre_g: fibre,
        carb_g: carbs,
        componentSum: round(componentSum, 2),
        tolerance: round(tolerance, 2)
      });
    }
  }
  if (glycemicIndex !== null && (glycemicIndex < 0 || glycemicIndex > GI_MAX_REASONABLE)) {
    issue(errors, file, 'glycemic index is outside the plausible display/scoring range', {
      glycemic_index: glycemicIndex
    });
  }

  for (const [metricKey, limits] of Object.entries(PROTEIN_SCORE_LIMITS)) {
    const value = finiteNumber(metrics[metricKey]);
    if (value === null) continue;
    if (limits.min != null && value < limits.min) issue(errors, file, `${metricKey} is below its valid range`, { value });
    if (limits.max != null && value > limits.max) issue(errors, file, `${metricKey} is above its valid range`, { value });
    if (limits.maxFromHeader) {
      const parent = finiteNumber(header[limits.maxFromHeader]);
      if (parent !== null && value > parent + MACRO_PARENT_TOLERANCE_G) {
        issue(errors, file, `${metricKey} exceeds ${limits.maxFromHeader}`, { value, [limits.maxFromHeader]: parent });
      }
    }
  }
}

function provenanceComparableValue(metricKey, provenance) {
  if (!provenance || typeof provenance !== 'object') return null;
  if (metricKey === 'omega3_mg') return finiteNumber(provenance.derivedMgPer100g);
  if (/_dv$/.test(metricKey)) return finiteNumber(provenance.derivedDailyValuePercent);
  if (metricKey === 'glycemic_index') return finiteNumber(provenance.value);
  return finiteNumber(provenance.valuePer100g);
}

function auditStrictProvenance(food, file, errors) {
  const metrics = food.metrics || {};
  const provenance = food.metricProvenance || {};

  for (const [metricKey, value] of Object.entries(metrics)) {
    if (metricKey === 'amino_acids_mg') continue;
    if (!Object.prototype.hasOwnProperty.call(provenance, metricKey)) {
      issue(errors, file, 'production/finalisation metric is missing metricProvenance', { metricKey });
      continue;
    }

    const metricValue = finiteNumber(value);
    if (metricValue === null) continue;
    const provenanceValue = provenanceComparableValue(metricKey, provenance[metricKey]);
    if (provenanceValue !== null && Math.abs(provenanceValue - metricValue) > 0.001) {
      issue(errors, file, 'metric value does not match metricProvenance derived/source value', {
        metricKey,
        metricValue,
        provenanceValue
      });
    }
  }
}

function auditMacroEnergy(food, file, warnings) {
  const header = food.header || {};
  const kcal = finiteNumber(header.kcal);
  const fat = finiteNumber(header.fat_g);
  const carbs = finiteNumber(header.carb_g);
  const protein = finiteNumber(header.protein_g);
  if (![kcal, fat, carbs, protein].every(value => value !== null)) return;

  const genericAtwaterKcal = (fat * 9) + (carbs * 4) + (protein * 4);
  const delta = Math.abs(kcal - genericAtwaterKcal);
  const tolerance = Math.max(75, kcal * 0.4, genericAtwaterKcal * 0.35);
  if (delta > tolerance) {
    issue(warnings, file, 'kcal differs sharply from generic macro energy; verify source basis or fibre/Atwater method', {
      kcal,
      genericAtwaterKcal: round(genericAtwaterKcal, 1),
      delta: round(delta, 1),
      tolerance: round(tolerance, 1)
    });
  }
}

function main() {
  const errors = [];
  const warnings = [];
  const finalIds = finalisationIds();
  const files = selectedFoodFiles();

  for (const file of files) {
    const food = readJson(file);
    const strict = needsStrictSourceEvidence(food, finalIds) || scope === 'all-strict';
    auditPublicFoodSync(food, file, errors, warnings);
    auditHeaderBounds(food, file, errors);
    auditMetricBounds(food, file, errors, warnings);
    auditMacroEnergy(food, file, warnings);
    if (strict) auditStrictProvenance(food, file, errors);
  }

  const result = {
    status: errors.length ? 'fail' : 'ok',
    scope,
    checkedAt: new Date().toISOString(),
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      foodFiles: files.length
    },
    errors,
    warnings: args.has('--show-warnings') ? warnings : warnings.slice(0, 80)
  };

  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exit(1);
}

main();
