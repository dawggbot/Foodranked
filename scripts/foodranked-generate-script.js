#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const scorerPath = path.join(__dirname, 'foodranked-scorer.js');
const phraseBanksDir = path.join(repoRoot, 'references', 'phrase-banks');

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(p), 'utf8'));
}

function relativeRepoPath(p) {
  return path.relative(repoRoot, p).replace(/\\/g, '/');
}

const corePhrases = readJson(path.join(phraseBanksDir, 'narration-core.json'));
const categoryContext = readJson(path.join(phraseBanksDir, 'category-context.json'));
const DEFAULT_PROTEIN_DISPLAY_POLICY = {
  policyId: 'protein-section-display.v1',
  rowCount: 4,
  visibleRows: [
    'collagen_g',
    'essential_amino_acids_score',
    'nonessential_amino_acids_score',
    'protein_digestibility_percent'
  ],
  hiddenFallbackMetricKey: 'protein_g_fallback',
  missingValueDisplay: 'N/A',
  showProteinFallbackAsVisibleRow: false
};
const PROTEIN_SUBMACRO_KEYS = DEFAULT_PROTEIN_DISPLAY_POLICY.visibleRows;
const PROTEIN_QUALITY_METRIC_KEYS = new Set([
  'essential_amino_acids_score',
  'protein_digestibility_percent',
  'nonessential_amino_acids_score'
]);
const DISPLAY_BACKED_NARRATION_METRIC_KEYS = new Set([
  'glycemic_index',
  'collagen_g',
  'essential_amino_acids_score',
  'nonessential_amino_acids_score',
  'protein_digestibility_percent'
]);
const COLLAGEN_NARRATION_FOOD_TYPES = new Set(['meats']);
const LOW_STARCH_NARRATION_NEUTRAL_FOOD_TYPES = new Set(['dairy', 'fruits']);
const PLANT_FOOD_TYPES = new Set(['fruits', 'vegetables', 'grains', 'legumes', 'tubers', 'nuts', 'seeds']);
const LOW_PROTEIN_QUALITY_NARRATION_NEUTRAL_FOOD_TYPES = new Set(['fruits', 'vegetables', 'tubers']);
const LOW_FAT_UNSATURATED_NARRATION_NEUTRAL_FOOD_TYPES = new Set(['fruits', 'vegetables', 'tubers', 'grains']);
const PROTEIN_QUALITY_VISIBLE_METRIC_KEYS = new Set([
  'essential_amino_acids_score',
  'nonessential_amino_acids_score',
  'protein_digestibility_percent'
]);
const LONG_MG_DISPLAY_METRIC_KEYS = new Set(['omega3_mg', 'cholesterol_mg']);
const LONG_MG_DISPLAY_DIGITS = 5;
const MONOUNSATURATED_FAT_METRIC_KEY = 'monounsaturated_fat_g';
const POLYUNSATURATED_FAT_METRIC_KEY = 'polyunsaturated_fat_g';
const UNSATURATED_FAT_NARRATION_METRIC_KEYS = new Set([
  'omega3_mg',
  POLYUNSATURATED_FAT_METRIC_KEY,
  MONOUNSATURATED_FAT_METRIC_KEY
]);
const ZERO_CHOLESTEROL_NARRATION_RELEVANT_FOOD_TYPES = new Set(['dairy', 'meats']);
const LOW_FAT_UNSATURATED_NARRATION_MAX_FAT_G = 1;
const CLOSING_USE_CASE_LIMIT = 2;
const MACRO_SECTION_HEADER_KEYS = {
  fats: 'fat_g',
  carbs: 'carb_g',
  proteins: 'protein_g'
};
const MACRO_SECTION_LABELS = {
  fats: 'fat',
  carbs: 'carbs',
  proteins: 'protein'
};
const MACRO_SECTION_SUBMACRO_KEYS = {
  fats: ['saturated_fat_g', 'polyunsaturated_fat_g', 'omega3_mg', 'cholesterol_mg'],
  carbs: ['fibre_g', 'sugar_g', 'starch_g', 'glycemic_index'],
  proteins: ['collagen_g', 'essential_amino_acids_score', 'nonessential_amino_acids_score', 'protein_digestibility_percent']
};
const DEFAULT_SUBMACRO_POLARITIES = {
  saturated_fat_g: 'higher_worse',
  monounsaturated_fat_g: 'higher_better',
  polyunsaturated_fat_g: 'higher_better',
  omega3_mg: 'higher_better',
  cholesterol_mg: 'higher_worse',
  fibre_g: 'higher_better',
  sugar_g: 'higher_worse',
  starch_g: 'higher_better',
  glycemic_index: 'higher_worse',
  collagen_g: 'higher_better',
  essential_amino_acids_score: 'higher_better',
  nonessential_amino_acids_score: 'higher_better',
  protein_digestibility_percent: 'higher_better'
};
const SUBMACRO_DISPLAY_DEFAULT_VALUES = {
  saturated_fat_g: 0,
  monounsaturated_fat_g: 0,
  polyunsaturated_fat_g: 0,
  omega3_mg: 0,
  cholesterol_mg: 0,
  fibre_g: 0,
  sugar_g: 0,
  starch_g: 0,
  glycemic_index: 0,
  collagen_g: 0,
  essential_amino_acids_score: 0,
  nonessential_amino_acids_score: 0,
  protein_digestibility_percent: 0
};
const PROTEIN_DIGESTIBILITY_DISPLAY_ESTIMATES_BY_TYPE = {
  meats: 92,
  dairy: 90,
  legumes: 72,
  grains: 62,
  nuts: 74,
  seeds: 74,
  vegetables: 45,
  tubers: 42,
  fruits: 35,
  misc: 50,
  'oils-and-fats': 35
};
const AMINO_ACID_DISPLAY_USEFUL_SCORE_MIN = 60;
const DEFAULT_HIGHER_BETTER_BANDS = [
  { label: '3_red', max: 0, score: 0 },
  { label: '2_red', min: 0, max: 1, score: 20 },
  { label: '1_red', min: 1, max: 2, score: 40 },
  { label: '1_green', min: 2, max: 3, score: 60 },
  { label: '2_green', min: 3, max: 5, score: 80 },
  { label: '3_green', min: 5, score: 100 }
];
const DEFAULT_HIGHER_WORSE_BANDS = [
  { label: '3_green', max: 0, score: 100 },
  { label: '2_green', min: 0, max: 1, score: 80 },
  { label: '1_green', min: 1, max: 2, score: 60 },
  { label: '1_red', min: 2, max: 3, score: 40 },
  { label: '2_red', min: 3, max: 5, score: 20 },
  { label: '3_red', min: 5, score: 0 }
];
const METRIC_DISPLAY_NAMES = {
  protein_g_fallback: 'protein amount',
  monounsaturated_fat_g: 'monounsaturated fat',
  vitamin_b12_dv: 'vitamin B12',
  vitamin_b_dv: 'vitamin B12',
  vitamin_a_dv: 'vitamin A',
  vitamin_c_dv: 'vitamin C',
  vitamin_d_dv: 'vitamin D',
  vitamin_e_dv: 'vitamin E',
  vitamin_k_dv: 'vitamin K'
};

function scoreFood(foodPath, rulesetPath) {
  const res = spawnSync(process.execPath, [scorerPath, foodPath, rulesetPath], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  if (res.status !== 0) {
    throw new Error((res.stderr || res.stdout || 'Failed to score food').trim());
  }

  return JSON.parse(res.stdout);
}

function inferRulesetPath(food) {
  return path.join(repoRoot, 'rulesets', `${food.foodType}.v1.json`);
}

function configuredList(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function proteinDisplayPolicy(result) {
  const configured = result.rulesetConfig?.proteinDisplay || {};
  return {
    policyId: configured.policyId || DEFAULT_PROTEIN_DISPLAY_POLICY.policyId,
    rowCount: positiveInteger(configured.rowCount, DEFAULT_PROTEIN_DISPLAY_POLICY.rowCount),
    visibleRows: configuredList(configured.visibleRows, DEFAULT_PROTEIN_DISPLAY_POLICY.visibleRows),
    hiddenFallbackMetricKey: configured.hiddenFallbackMetricKey
      || result.rulesetConfig?.proteinFallback?.metricKey
      || DEFAULT_PROTEIN_DISPLAY_POLICY.hiddenFallbackMetricKey,
    missingValueDisplay: configured.missingValueDisplay || DEFAULT_PROTEIN_DISPLAY_POLICY.missingValueDisplay,
    showProteinFallbackAsVisibleRow: configured.showProteinFallbackAsVisibleRow === true
  };
}

function macroSubmetricKeysForSection(result, sectionKey) {
  if (sectionKey === 'proteins') {
    const policy = proteinDisplayPolicy(result);
    return policy.visibleRows.slice(0, policy.rowCount);
  }
  if (sectionKey === 'fats') {
    const hasMonounsaturatedFat = toFiniteNumber(result.foodMetrics?.[MONOUNSATURATED_FAT_METRIC_KEY]) !== null
      || (result.metricBreakdown || []).some(metric => metric.metricKey === MONOUNSATURATED_FAT_METRIC_KEY);
    const cholesterol = toFiniteNumber(result.foodMetrics?.cholesterol_mg);
    const cholesterolIsRelevant = cholesterol !== null
      && (cholesterol > 0 || ZERO_CHOLESTEROL_NARRATION_RELEVANT_FOOD_TYPES.has(result.food?.foodType));
    if (hasMonounsaturatedFat && !cholesterolIsRelevant) {
      return [
        'saturated_fat_g',
        'omega3_mg',
        POLYUNSATURATED_FAT_METRIC_KEY,
        MONOUNSATURATED_FAT_METRIC_KEY
      ];
    }
  }
  return MACRO_SECTION_SUBMACRO_KEYS[sectionKey] || [];
}

function hashString(input) {
  const str = String(input || '');
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return Math.abs(h);
}

function pick(list, fallback = '', seed = '') {
  if (!Array.isArray(list) || !list.length) return fallback;
  return list[hashString(seed) % list.length];
}

function titleForSection(key) {
  return {
    fats: 'Fats',
    carbs: 'Carbs',
    proteins: 'Proteins',
    vitamins: 'Vitamins',
    minerals: 'Minerals',
    pros: 'Pros',
    cons: 'Cons'
  }[key] || key;
}

function timingHintForSection(key) {
  return {
    fats: 'short-medium',
    carbs: 'short-medium',
    proteins: 'short-medium',
    vitamins: 'short-medium',
    minerals: 'short-medium',
    pros: 'medium',
    cons: 'medium'
  }[key] || 'short';
}

function formatMetricKey(metricKey) {
  if (METRIC_DISPLAY_NAMES[metricKey]) return METRIC_DISPLAY_NAMES[metricKey];
  return String(metricKey || '')
    .replace(/_dv$/, '')
    .replace(/_mg$/, '')
    .replace(/_g$/, '')
    .replace(/_percent$/, '')
    .replace(/_/g, ' ')
    .replace(/\bomega3\b/i, 'omega 3')
    .replace(/\bgi\b/i, 'glycemic index')
    .replace(/\bea\b/i, 'essential amino acids')
    .replace(/\bdv\b/i, 'daily value')
    .replace(/\bvitamin b12\b/i, 'vitamin B12')
    .replace(/\bvitamin d\b/i, 'vitamin D')
    .replace(/\bvitamin c\b/i, 'vitamin C')
    .replace(/\bvitamin a\b/i, 'vitamin A')
    .replace(/\bvitamin e\b/i, 'vitamin E')
    .replace(/\bvitamin k\b/i, 'vitamin K');
}

function metricDisplayText(metric, options = {}) {
  const speakDailyValue = options.speakDailyValue !== false;
  if (metric.scoringMode === 'dv_points') {
    return `${formatMetricKey(metric.metricKey)} at ${metric.dvPercent}% ${speakDailyValue ? 'daily value' : 'DV'}`;
  }
  if (metric.value !== null && metric.value !== undefined) {
    return `${formatMetricKey(metric.metricKey)} at ${displayMetricValueText(metric)}`;
  }
  if (metric.band) return `${formatMetricKey(metric.metricKey)} at ${metric.value}`;
  return formatMetricKey(metric.metricKey);
}

function metricValueText(metric) {
  if (!metric) return null;
  if (metric.scoringMode === 'dv_points' && metric.dvPercent != null) return `${metric.dvPercent}% DV`;
  if (metric.value === null || metric.value === undefined) return null;

  const key = String(metric.metricKey || '');
  if (key === 'protein_g_fallback' || key.endsWith('_g')) return `${displayNumberText(metric.value)}g`;
  if (key.endsWith('_mg')) return `${displayNumberText(metric.value)}mg`;
  if (key.endsWith('_mcg')) return `${displayNumberText(metric.value)}mcg`;
  if (key.endsWith('_kg')) return `${displayNumberText(metric.value)}kg`;
  if (key.endsWith('_percent')) return `${displayNumberText(metric.value)}%`;
  if (key === 'essential_amino_acids_score') return `${displayNumberText(metric.value, 0)}/${metric.denominator || 9}`;
  if (key === 'nonessential_amino_acids_score') return `${displayNumberText(metric.value, 0)}/${metric.denominator || 11}`;
  if (key.endsWith('_score')) return `${displayNumberText(metric.value, 0)}/10`;
  if (/glycemic/i.test(key)) return `${displayNumberText(metric.value, 0)} GI`;
  return String(metric.value);
}

function trimmedDecimal(value, decimals = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  const fixed = number.toFixed(decimals);
  const cleaned = fixed.includes('.')
    ? fixed.replace(/\.?0+$/g, '')
    : fixed;
  return cleaned === '' || cleaned === '-' ? '0' : cleaned;
}

// One decimal by default; tiny nonzero values stay visible, e.g. 0.017g -> 0.02g.
function submacroDisplayDecimalPlaces(value, decimals = 1) {
  const number = Number(value);
  const fallbackDecimals = Number.isFinite(Number(decimals)) ? Math.max(0, Math.trunc(Number(decimals))) : 1;
  if (!Number.isFinite(number)) return fallbackDecimals;
  return number !== 0 && Math.abs(number) < 1 && fallbackDecimals === 1 ? 2 : fallbackDecimals;
}

function displayNumberText(value, decimals = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return trimmedDecimal(number, submacroDisplayDecimalPlaces(number, decimals));
}

function longMgDisplayValue(metric) {
  if (!metric) return null;
  const key = String(metric.metricKey || '');
  if (!LONG_MG_DISPLAY_METRIC_KEYS.has(key)) return null;
  const value = toFiniteNumber(metric.value);
  if (value === null) return null;
  const integerDigits = String(Math.trunc(Math.abs(value))).length;
  if (integerDigits < LONG_MG_DISPLAY_DIGITS) return null;
  return `${trimmedDecimal(value / 1000, 2)}g`;
}

function displayMetricUnitValueText(metric) {
  if (!metric) return null;
  if (metric.scoringMode === 'dv_points' && metric.dvPercent != null) return `${displayNumberText(metric.dvPercent, 0)}% DV`;
  if (metric.value === null || metric.value === undefined) return null;

  const key = String(metric.metricKey || '');
  if (key === 'protein_g_fallback' || key.endsWith('_g')) return `${displayNumberText(metric.value)}g`;
  if (key.endsWith('_mg')) return `${displayNumberText(metric.value)}mg`;
  if (key.endsWith('_mcg')) return `${displayNumberText(metric.value)}mcg`;
  if (key.endsWith('_kg')) return `${displayNumberText(metric.value)}kg`;
  if (key.endsWith('_percent')) return `${displayNumberText(metric.value)}%`;
  if (key === 'essential_amino_acids_score') return `${displayNumberText(metric.value, 0)}/${metric.denominator || 9}`;
  if (key === 'nonessential_amino_acids_score') return `${displayNumberText(metric.value, 0)}/${metric.denominator || 11}`;
  if (key.endsWith('_score')) return `${displayNumberText(metric.value, 0)}/10`;
  if (/glycemic/i.test(key)) return `${displayNumberText(metric.value, 0)} GI`;
  return String(metric.value);
}

function displayMetricValueText(metric) {
  return longMgDisplayValue(metric) || displayMetricUnitValueText(metric) || metricValueText(metric);
}

function spokenMetricValueText(metric) {
  if (!metric) return null;
  if (/glycemic/i.test(String(metric.metricKey || '')) && metric.value !== null && metric.value !== undefined) {
    return String(metric.value);
  }
  return metricValueText(metric);
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function scoreFromBands(value, bands) {
  if (value === null || value === undefined || !Array.isArray(bands) || bands.length === 0) return null;
  for (const band of bands) {
    const hasMin = Object.prototype.hasOwnProperty.call(band, 'min');
    const hasMax = Object.prototype.hasOwnProperty.call(band, 'max');
    const minOk = !hasMin || value >= band.min;
    const maxOk = !hasMax || value <= band.max;
    if (minOk && maxOk) return { label: band.label, score: band.score };
  }
  return null;
}

function canonicalArrowBandFromScore(score) {
  const numericScore = toFiniteNumber(score);
  if (numericScore === null) return null;
  if (numericScore >= 100) return '3_green';
  if (numericScore >= 80) return '2_green';
  if (numericScore >= 60) return '1_green';
  if (numericScore >= 40) return '1_red';
  if (numericScore >= 20) return '2_red';
  return '3_red';
}

function canonicalArrowBand(metric) {
  const mode = String(metric?.scoringMode || '');
  if (mode !== 'arrow_bands' && mode !== 'display_fallback') return metric?.band || null;
  return canonicalArrowBandFromScore(metric?.score ?? metric?.weightedScore) || metric?.band || null;
}

function clampRounded(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function proteinDisplayProteinG(result) {
  return toFiniteNumber(result.header?.protein_g ?? result.proteinQualityGate?.proteinG);
}

function proteinFallbackBandScore(result) {
  const proteinG = proteinDisplayProteinG(result);
  if (proteinG === null || proteinG <= 0) return null;
  const band = scoreFromBands(proteinG, result.rulesetConfig?.proteinFallback?.bands || []);
  return toFiniteNumber(band?.score) ?? null;
}

function proteinDisplayUsefulProteinMin(result) {
  const configuredMin = toFiniteNumber(result.rulesetConfig?.proteinQualityGate?.minimumProteinG);
  if (configuredMin !== null) return configuredMin;
  const band = (result.rulesetConfig?.proteinFallback?.bands || [])
    .find(item => Number(item.score) >= AMINO_ACID_DISPLAY_USEFUL_SCORE_MIN && typeof item.min === 'number');
  return toFiniteNumber(band?.min);
}

function textKeyForFood(result) {
  return `${result.food?.id || ''} ${result.food?.name || ''}`.toLowerCase();
}

function estimatedCollagenDisplayValue(result) {
  if (result.food?.foodType !== 'meats') return 0;
  const key = textKeyForFood(result);
  if (/chicken.*breast|turkey.*breast|cod/.test(key)) return 0.4;
  if (/salmon|tuna/.test(key)) return 0.3;
  if (/herring|mackerel|trout|turkey.*sausage|chicken.*thigh/.test(key)) return 0.8;
  if (/anchov|sardine|shrimp|hot.?dog|pepperoni/.test(key)) return 1.2;
  if (/lamb/.test(key)) return 1.4;
  if (/bacon|corned|salami|pork|duck|venison|beef|liver/.test(key)) return 1.0;
  return 0.8;
}

function estimatedProteinDigestibilityDisplayValue(result) {
  const key = textKeyForFood(result);
  if (/whey/.test(key)) return 99;
  if (/protein.?bar/.test(key)) return 80;
  if (/salmon|tuna|cod|trout|mackerel|sardine|herring|anchov|shrimp/.test(key)) return 94;
  if (/hot.?dog|sausage|salami|pepperoni|bacon|corned/.test(key)) return 84;
  if (/chicken|turkey|beef|pork|lamb|venison|duck|liver/.test(key)) return 92;
  if (/yogurt|kefir|skyr|quark|labneh/.test(key)) return 90;
  if (/cheese|mozzarella|parmesan|cheddar|feta|ricotta|halloumi|cottage/.test(key)) return 92;
  if (/milk/.test(key)) return 88;
  if (/soy|tofu|tempeh|edamame/.test(key)) return 78;
  if (/protein/.test(key)) return 80;
  if (/cocoa/.test(key)) return 55;
  if (/matcha/.test(key)) return 45;
  return PROTEIN_DIGESTIBILITY_DISPLAY_ESTIMATES_BY_TYPE[result.food?.foodType] ?? 50;
}

function proteinDisplayQualityScore(result) {
  const proteinG = proteinDisplayProteinG(result) || 0;
  const usefulProteinMin = proteinDisplayUsefulProteinMin(result);
  if (usefulProteinMin !== null && proteinG < usefulProteinMin) return 0;
  const resolvedBaseScore = proteinFallbackBandScore(result);
  const baseScore = Math.max(resolvedBaseScore ?? 0, AMINO_ACID_DISPLAY_USEFUL_SCORE_MIN);
  const key = textKeyForFood(result);

  if (/whey/.test(key)) return 100;
  if (/salmon|tuna|cod|trout|mackerel|sardine|herring|anchov|shrimp|chicken|turkey|beef|pork|lamb|venison|duck|liver/.test(key)) {
    if (proteinG >= 18) return 100;
    if (proteinG >= 14) return Math.max(baseScore, 80);
    if (proteinG >= 10) return Math.max(baseScore, 60);
    return baseScore;
  }
  if (/cheese|mozzarella|parmesan|cheddar|feta|ricotta|halloumi|cottage|skyr|quark|labneh/.test(key)) {
    if (proteinG >= 18) return 100;
    if (proteinG >= 9) return Math.max(baseScore, 80);
    if (proteinG >= 3) return Math.max(baseScore, 60);
    return baseScore;
  }
  if (/milk|yogurt|kefir/.test(key)) {
    if (proteinG >= 8) return Math.max(baseScore, 80);
    if (proteinG >= 3) return Math.max(baseScore, 60);
    return baseScore;
  }
  if (/soy|tofu|tempeh|edamame/.test(key)) {
    if (proteinG >= 10) return Math.max(baseScore, 80);
    if (proteinG >= 4) return Math.max(baseScore, 60);
    return baseScore;
  }
  if (/protein.?bar|protein/.test(key)) return Math.max(baseScore, 80);
  return baseScore;
}

function proteinDisplayEstimate(result, metricKey) {
  if (!PROTEIN_SUBMACRO_KEYS.includes(metricKey)) return null;
  if (metricKey === 'collagen_g') {
    return {
      value: estimatedCollagenDisplayValue(result),
      basis: 'display-only estimate from FoodRanked protein source class; source metric remains N/A unless directly sourced'
    };
  }
  if (metricKey === 'protein_digestibility_percent') {
    return {
      value: estimatedProteinDigestibilityDisplayValue(result),
      basis: 'display-only estimate from FoodRanked protein source class; not a measured digestibility value'
    };
  }

  const score = proteinDisplayQualityScore(result);
  if (score === null) return null;
  if (metricKey === 'essential_amino_acids_score') {
    return {
      value: clampRounded(Math.floor((score / 100) * 9), 0, 9),
      basis: 'display-only estimate from useful-protein-gated amount band and protein source class; not a source amino-acid profile'
    };
  }
  if (metricKey === 'nonessential_amino_acids_score') {
    return {
      value: clampRounded(Math.floor((score / 100) * 11), 0, 11),
      basis: 'display-only estimate from useful-protein-gated amount band and protein source class; not a source amino-acid profile'
    };
  }
  return null;
}

function metricValuePhrase(metric) {
  if (metric?.metricKey === 'glycemic_index' && metric.displayDefault) {
    return 'glycemic index is in the strongest display band';
  }
  const value = spokenMetricValueText(metric);
  if (!value) return formatMetricKey(metric?.metricKey);
  return `${formatMetricKey(metric.metricKey)} is ${value}`;
}

function rawProteinSubmetrics(result, limit = 4) {
  const rawMetrics = result.foodMetrics || {};
  const scoredMetrics = new Map((result.metricBreakdown || []).map(metric => [metric.metricKey, metric]));
  return macroSubmetricKeysForSection(result, 'proteins')
    .map(metricKey => {
      const value = rawMetrics[metricKey];
      if (value === null || value === undefined) return null;
      const scored = scoredMetrics.get(metricKey);
      if (PROTEIN_QUALITY_METRIC_KEYS.has(metricKey) && !scored) return null;
      if (PROTEIN_QUALITY_METRIC_KEYS.has(metricKey) && result.proteinQualityGate?.eligible === false) return null;
      return {
        metricKey,
        text: metricDisplayText({ metricKey, value, scoringMode: scored?.scoringMode || 'reference_submacro' }),
        weightedScore: scored?.weightedScore ?? null,
        scoringMode: scored?.scoringMode || 'reference_submacro',
        band: scored?.band || null,
        dvPercent: scored?.dvPercent ?? null,
        value,
        score: scored?.score ?? null,
        denominator: scored?.denominator ?? null,
        referenceOnly: !scored
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}

function scoredMetricsForSection(result, sectionKey, options = {}) {
  return (result.metricBreakdown || [])
    .filter(item => item.sectionKey === sectionKey)
    .map(metric => ({
      metricKey: metric.metricKey,
      text: metricDisplayText(metric, options),
      weightedScore: metric.weightedScore,
      scoringMode: metric.scoringMode,
      band: metric.band || null,
      polarity: metric.polarity || null,
      dvPercent: metric.dvPercent ?? null,
      value: metric.value ?? null,
      score: metric.score ?? null,
      denominator: metric.denominator ?? null
    }));
}

function topMetricsForSection(result, sectionKey, limit = 3, options = {}) {
  const scoredMetrics = scoredMetricsForSection(result, sectionKey, options)
    .sort((a, b) => Math.abs(b.weightedScore) - Math.abs(a.weightedScore));

  if (sectionKey === 'proteins') {
    const nonFallbackMetrics = scoredMetrics.filter(metric => metric.metricKey !== 'protein_g_fallback');
    const referenceMetrics = rawProteinSubmetrics(result, limit);
    const merged = [
      ...nonFallbackMetrics,
      ...referenceMetrics.filter(metric => !nonFallbackMetrics.some(item => item.metricKey === metric.metricKey)),
      ...scoredMetrics.filter(metric => metric.metricKey === 'protein_g_fallback')
    ];
    if (merged.length) return merged.slice(0, limit);
    return scoredMetrics.slice(0, limit);
  }

  return scoredMetrics.slice(0, limit);
}

function metricHasDefensibleValue(metric) {
  return metric && (
    metric.value !== null
    || metric.dvPercent !== null
    || metric.band
  );
}

function arrowBand(metric) {
  const value = String(metric?.band || '').trim().toLowerCase();
  const named = value.match(/^(\d+)_(green|red)$/i);
  if (named) return { level: Number(named[1]) || 0, color: named[2].toLowerCase() };

  const up = (value.match(/↑/g) || []).length;
  const down = (value.match(/↓/g) || []).length;
  if (!up && !down) return null;

  const higherWorse = metric?.polarity === 'higher_worse';
  if (up) return { level: up, color: higherWorse ? 'red' : 'green' };
  return { level: down, color: higherWorse ? 'green' : 'red' };
}

function positiveMetricRank(metric) {
  if (!metricHasDefensibleValue(metric)) return -Infinity;
  const band = arrowBand(metric);
  if (band?.color === 'green') {
    const score = Math.max(0, toFiniteNumber(metric.score) ?? 0);
    const weighted = Math.max(0, toFiniteNumber(metric.weightedScore) ?? 0);
    return 100000 + (band.level * 10000) + (score * 10) + weighted;
  }
  if (metric.scoringMode === 'dv_points') {
    if ((metric.score ?? 0) <= 0) return -Infinity;
    return (metric.weightedScore ?? 0) + ((metric.dvPercent ?? 0) / 100);
  }
  if ((metric.weightedScore ?? 0) > 0) return metric.weightedScore;
  return -Infinity;
}

function weakMetricRank(metric) {
  if (!metricHasDefensibleValue(metric)) return -Infinity;
  const band = arrowBand(metric);
  if (band?.color === 'red') {
    const score = Math.max(0, 100 - (toFiniteNumber(metric.score) ?? 0));
    const weighted = Math.abs(toFiniteNumber(metric.weightedScore) ?? 0);
    return 100000 + (band.level * 10000) + (score * 10) + weighted;
  }
  if (band) return -Infinity;
  if (metric.scoringMode === 'dv_points' && metric.dvPercent !== null) {
    return 1000 - ((metric.weightedScore ?? 0) * 10) - (metric.dvPercent ?? 0);
  }
  if ((metric.weightedScore ?? 0) <= 0) return Math.abs(metric.weightedScore ?? 0) + 1;
  return -Infinity;
}

function strongestPositiveMetric(metrics) {
  return (metrics || [])
    .filter(metric => positiveMetricRank(metric) > -Infinity)
    .sort((a, b) => positiveMetricRank(b) - positiveMetricRank(a))[0] || null;
}

function weakestOutstandingMetric(metrics, exclude = null) {
  return (metrics || [])
    .filter(metric => metric !== exclude && weakMetricRank(metric) > -Infinity)
    .sort((a, b) => weakMetricRank(b) - weakMetricRank(a))[0] || null;
}

function uniqueMetrics(metrics, limit = 4) {
  const out = [];
  const seen = new Set();
  for (const metric of metrics || []) {
    if (!metric || seen.has(metric.metricKey)) continue;
    seen.add(metric.metricKey);
    out.push(metric);
    if (out.length >= limit) break;
  }
  return out;
}

function macroNarrationMetrics(result, sectionKey) {
  let metrics = sectionKey === 'proteins'
    ? topMetricsForSection(result, sectionKey, 8)
    : scoredMetricsForSection(result, sectionKey);

  if (sectionKey === 'carbs' || sectionKey === 'proteins') {
    const byKey = new Map(metrics.map(metric => [metric.metricKey, metric]));
    for (const displayMetric of completeMacroDisplayItems(result, sectionKey)) {
      if (!DISPLAY_BACKED_NARRATION_METRIC_KEYS.has(displayMetric.metricKey)) continue;
      if (!metricHasDefensibleValue(displayMetric) || displayMetric.notApplicableReason) continue;
      if (byKey.has(displayMetric.metricKey)) continue;
      byKey.set(displayMetric.metricKey, {
        ...displayMetric,
        narrationDisplayOnly: displayMetric.displaySource !== 'scored'
      });
    }
    metrics = Array.from(byKey.values());
  }

  return metrics.filter(metric => (
    metricHasDefensibleValue(metric)
    && !metric.notApplicableReason
    && !isNarrationMetricExcluded(result, sectionKey, metric)
  ));
}

function weakNarrationMetrics(result, metrics, sectionKey, exclude = null) {
  return (metrics || []).filter(metric => {
    if (!metric || metric === exclude) return false;
    if (isNarrationWeaknessException(result, sectionKey, metric)) return false;
    if (
      sectionKey === 'proteins'
      && metric.metricKey === 'collagen_g'
      && !COLLAGEN_NARRATION_FOOD_TYPES.has(result.food?.foodType)
    ) {
      return false;
    }
    return true;
  });
}

function isNarrationMetricExcluded(result, sectionKey, metric) {
  return isLowRelevanceZeroCholesterol(result, sectionKey, metric);
}

function isNarrationWeaknessException(result, sectionKey, metric) {
  return isLowStarchNarrationWeakness(result, sectionKey, metric)
    || isPlantB12NarrationWeakness(result, sectionKey, metric)
    || isLowProteinQualityNarrationWeakness(result, sectionKey, metric)
    || isLowFatUnsaturatedNarrationWeakness(result, sectionKey, metric);
}

function isLowRelevanceZeroCholesterol(result, sectionKey, metric) {
  if (sectionKey !== 'fats') return false;
  if (metric?.metricKey !== 'cholesterol_mg') return false;
  if (ZERO_CHOLESTEROL_NARRATION_RELEVANT_FOOD_TYPES.has(result.food?.foodType)) return false;
  return (toFiniteNumber(metric.value) ?? 0) === 0;
}

function isLowStarchNarrationWeakness(result, sectionKey, metric) {
  if (sectionKey !== 'carbs') return false;
  if (metric?.metricKey !== 'starch_g') return false;
  if (!LOW_STARCH_NARRATION_NEUTRAL_FOOD_TYPES.has(result.food?.foodType)) return false;
  return (metricSectionScore(metric) ?? 100) < 50;
}

function isPlantB12NarrationWeakness(result, sectionKey, metric) {
  if (sectionKey !== 'vitamins') return false;
  if (metric?.metricKey !== 'vitamin_b12_dv') return false;
  if (!PLANT_FOOD_TYPES.has(result.food?.foodType)) return false;
  return (metricSectionScore(metric) ?? 100) < 50;
}

function isLowProteinQualityNarrationWeakness(result, sectionKey, metric) {
  if (sectionKey !== 'proteins') return false;
  if (!PROTEIN_QUALITY_VISIBLE_METRIC_KEYS.has(metric?.metricKey)) return false;
  if (!LOW_PROTEIN_QUALITY_NARRATION_NEUTRAL_FOOD_TYPES.has(result.food?.foodType)) return false;
  const proteinG = proteinDisplayProteinG(result);
  const usefulMin = proteinDisplayUsefulProteinMin(result);
  if (proteinG === null || usefulMin === null) return false;
  return proteinG < usefulMin && (metricSectionScore(metric) ?? 100) < 50;
}

function isLowFatUnsaturatedNarrationWeakness(result, sectionKey, metric) {
  if (sectionKey !== 'fats') return false;
  if (!UNSATURATED_FAT_NARRATION_METRIC_KEYS.has(metric?.metricKey)) return false;
  if (!LOW_FAT_UNSATURATED_NARRATION_NEUTRAL_FOOD_TYPES.has(result.food?.foodType)) return false;
  const fatG = macroValueForSection(result, 'fats');
  if (fatG === null || fatG > LOW_FAT_UNSATURATED_NARRATION_MAX_FAT_G) return false;
  return (metricSectionScore(metric) ?? 100) < 50;
}

function narrationMetricByKey(result, sectionKey, metricKey) {
  return macroNarrationMetrics(result, sectionKey)
    .find(metric => metric.metricKey === metricKey && metricHasDefensibleValue(metric))
    || null;
}

function monounsaturatedFatCompanionLine(result, selectedMetrics = []) {
  const selected = (selectedMetrics || []).filter(Boolean);
  const mentionsPoly = selected.some(metric => metric.metricKey === POLYUNSATURATED_FAT_METRIC_KEY);
  const mentionsMono = selected.some(metric => metric.metricKey === MONOUNSATURATED_FAT_METRIC_KEY);
  if (!mentionsPoly || mentionsMono) return null;

  const mono = narrationMetricByKey(result, 'fats', MONOUNSATURATED_FAT_METRIC_KEY);
  if (!mono) return null;

  const monoScore = metricSectionScore(mono);
  if (monoScore !== null && monoScore >= 60) {
    return `${metricValuePhrase(mono)}, so low polyunsaturated fat does not mean low unsaturated fat overall`;
  }
  return `${metricValuePhrase(mono)}, keeping the unsaturated-fat picture separate from polyunsaturated fat alone`;
}

function outstandingMacroMetrics(result, sectionKey, limit = 4) {
  if (macroSectionDisplaysNa(result, sectionKey)) return [];

  const metrics = macroNarrationMetrics(result, sectionKey);
  const best = strongestPositiveMetric(metrics);
  const weakPool = weakNarrationMetrics(result, metrics, sectionKey, best);
  const weakest = weakestOutstandingMetric(weakPool, best) || weakestAvailableMetric(weakPool, best, sectionKey);
  const remaining = [...metrics].sort((a, b) => {
    const rankDiff = Math.max(positiveMetricRank(b), weakMetricRank(b)) - Math.max(positiveMetricRank(a), weakMetricRank(a));
    return rankDiff || Math.abs(b.weightedScore ?? 0) - Math.abs(a.weightedScore ?? 0);
  });
  return uniqueMetrics([best, weakest, ...remaining], limit);
}

function outstandingMicronMetrics(result, sectionKey, limit = 4, options = {}) {
  const metrics = scoredMetricsForSection(result, sectionKey, options)
    .filter(metric => metric.dvPercent !== null);
  const best = strongestPositiveMetric(metrics);
  const weakPool = weakNarrationMetrics(result, metrics, sectionKey, best);
  const weakest = weakestOutstandingMetric(weakPool, best);
  const remaining = [...metrics].sort((a, b) => Math.abs(b.weightedScore ?? 0) - Math.abs(a.weightedScore ?? 0));
  return uniqueMetrics([best, weakest, ...remaining], limit);
}

function highestDvMicronMetric(metrics, exclude = null, minDv = 30) {
  const strongest = (metrics || [])
    .filter(metric => metric && metric !== exclude && Number(metric.dvPercent) >= minDv)
    .sort((a, b) => Number(b.dvPercent) - Number(a.dvPercent))[0] || null;
  if (!strongest || !exclude) return strongest;
  return Number(strongest.dvPercent) > Number(exclude.dvPercent ?? -Infinity) ? strongest : null;
}

function headerMacro(result, key) {
  const v = result.header?.[key];
  if (v === null || v === undefined) return null;
  return Number(v);
}

function displayMacroGrams(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return (Math.round(numeric * 10) / 10).toFixed(1);
}

function macroValueForSection(result, sectionKey) {
  const headerKey = MACRO_SECTION_HEADER_KEYS[sectionKey];
  if (!headerKey) return null;
  return headerMacro(result, headerKey);
}

function macroSectionIsZero(result, sectionKey) {
  return macroValueForSection(result, sectionKey) === 0;
}

function macroSectionDisplaysNa(result, sectionKey) {
  const value = macroValueForSection(result, sectionKey);
  return value === null || value === undefined || value === 0;
}

function macroDisplayValue(result, sectionKey) {
  const value = macroValueForSection(result, sectionKey);
  if (value === null || value === undefined || value === 0) return 'N/A';
  return `${displayMacroGrams(value)}g`;
}

function macroLine(result, key) {
  const label = MACRO_SECTION_LABELS[key];
  const value = macroValueForSection(result, key);
  if (value === null || value === undefined) return null;
  if (value === 0) return null;
  return `${displayMacroGrams(value)}g of ${label}`;
}

function joinShort(parts) {
  const valid = parts.filter(Boolean).map(part => String(part).trim()).filter(Boolean);
  return valid.map(part => /[.!?]$/.test(part) ? part : `${part}.`).join(' ');
}

function capitalizeSentenceStarts(text) {
  const input = String(text || '').trim();
  if (!input) return '';
  return input
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`)
    .replace(/^([a-z])/, (_, char) => char.toUpperCase());
}

function polishNarration(text) {
  return capitalizeSentenceStarts(String(text || '').trim());
}

function unitWord(unit, value) {
  const normalized = String(unit || '').toLowerCase();
  const numeric = Number(value);
  const singular = Number.isFinite(numeric) && numeric === 1;
  const words = {
    g: ['gram', 'grams'],
    mg: ['milligram', 'milligrams'],
    mcg: ['microgram', 'micrograms'],
    'µg': ['microgram', 'micrograms'],
    kg: ['kilogram', 'kilograms'],
    kcal: ['calorie', 'calories']
  }[normalized];
  if (!words) return unit;
  return singular ? words[0] : words[1];
}

function audioOnlyText(text) {
  return String(text || '')
    .replace(/\b(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\b/g, (_, value, denominator) => `${value} out of ${denominator}`)
    .replace(/\b(\d+(?:\.\d+)?)\s*(mcg|µg|mg|kg|kcal|g)\b/gi, (_, value, unit) => `${value} ${unitWord(unit, value)}`)
    .replace(/\bDV\b/g, 'daily value');
}

function subtitleOnlyText(text) {
  return String(text || '')
    .replace(/\b(\d+(?:\.\d+)?)\s+out of\s+(\d+(?:\.\d+)?)\b/gi, '$1/$2')
    .replace(/\braw grams display\b/gi, 'raw values display')
    .replace(/\b([a-z]+) grams already shown\b/gi, '$1 numbers already shown')
    .replace(/\bmaintenance-and-repair\b/gi, 'maintenance repair')
    .replace(/\b(\d+(?:\.\d+)?)\s+micrograms?\b/gi, '$1mcg')
    .replace(/\b(\d+(?:\.\d+)?)\s+milligrams?\b/gi, '$1mg')
    .replace(/\b(\d+(?:\.\d+)?)\s+kilograms?\b/gi, '$1kg')
    .replace(/\b(\d+(?:\.\d+)?)\s+grams?\b/gi, '$1g')
    .replace(/\b(\d+(?:\.\d+)?)\s+calories?\b/gi, '$1kcal')
    .replace(/\bmicrograms?\b/gi, 'mcg')
    .replace(/\bmilligrams?\b/gi, 'mg')
    .replace(/\bkilograms?\b/gi, 'kg')
    .replace(/\bgrams?\b/gi, 'g');
}

function naturalList(items) {
  const valid = (items || []).filter(Boolean).map(item => String(item).trim()).filter(Boolean);
  if (!valid.length) return '';
  if (valid.length === 1) return valid[0];
  if (valid.length === 2) return `${valid[0]} and ${valid[1]}`;
  return `${valid.slice(0, -1).join(', ')}, and ${valid[valid.length - 1]}`;
}

function sectionContextLine(foodType, seed = '') {
  return pick(categoryContext[foodType], '', `${foodType}:${seed}`);
}

function strongestMetricLine(result, sectionKey) {
  const metrics = topMetricsForSection(result, sectionKey, 4);
  if (!metrics.length) return pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:lackluster`);

  const bestMetric = metrics[0];
  const strongestScore = bestMetric?.weightedScore ?? 0;
  const isPositive = strongestScore > 0;
  const sectionScore = result.sectionScores?.[sectionKey] ?? null;
  const foodType = result.food.foodType;

  if (sectionKey === 'fats') {
    const omega3 = metrics.find(metric => metric.metricKey === 'omega3_mg' && (metric.value || 0) > 0 && metric.weightedScore > 0);
    const saturatedFat = metrics.find(metric => metric.metricKey === 'saturated_fat_g' && (metric.value || 0) > 0);
    const cholesterol = metrics.find(metric => metric.metricKey === 'cholesterol_mg');
    const polyunsaturatedFat = metrics.find(metric => metric.metricKey === POLYUNSATURATED_FAT_METRIC_KEY && metric.weightedScore > 0);
    const monounsaturatedFat = metrics.find(metric => metric.metricKey === MONOUNSATURATED_FAT_METRIC_KEY && metric.weightedScore > 0);

    if (foodType === 'meats') {
      if (saturatedFat && (saturatedFat.value || 0) >= 8) return `${metricValuePhrase(saturatedFat)}, a big downside`;
      if (omega3 && (omega3.value || 0) >= 1000 && (!saturatedFat || (saturatedFat.value || 0) < 4)) {
        return `${metricValuePhrase(omega3)}, good fat support for meat`;
      }
      if (saturatedFat && sectionScore !== null && sectionScore < 65) return `${metricValuePhrase(saturatedFat)}, a big downside`;
      if (omega3 && (omega3.value || 0) >= 300) return `${metricValuePhrase(omega3)}, good fat support for meat`;
    }

    if (foodType === 'oils-and-fats') {
      if (saturatedFat && (saturatedFat.value || 0) >= 20) return `${metricValuePhrase(saturatedFat)}, a big downside`;
      if (monounsaturatedFat && (!saturatedFat || (saturatedFat.value || 0) <= 18)) return `${metricValuePhrase(monounsaturatedFat)}, doing a lot of the fat-quality work here`;
      if (polyunsaturatedFat && (!saturatedFat || (saturatedFat.value || 0) <= 15)) return `${metricValuePhrase(polyunsaturatedFat)}, doing most of the work here`;
    }

    if (saturatedFat && sectionScore !== null && sectionScore < 60) return `${metricValuePhrase(saturatedFat)}, a big downside`;
    if (omega3) return foodType === 'meats'
      ? `${metricValuePhrase(omega3)}, good fat support for meat`
      : `${metricValuePhrase(omega3)}, helping a lot here`;
    if (saturatedFat) return `${metricValuePhrase(saturatedFat)}, a big downside`;
    if (cholesterol && (cholesterol.value || 0) >= 100) return `${metricValuePhrase(cholesterol)}, adding to the tradeoff`;
    if (monounsaturatedFat) return `${metricValuePhrase(monounsaturatedFat)}, one of the better parts of the profile`;
    if (polyunsaturatedFat) return `${metricValuePhrase(polyunsaturatedFat)}, one of the better parts of the profile`;
  }

  if (sectionKey === 'carbs') {
    const fibre = metrics.find(metric => metric.metricKey === 'fibre_g' && (metric.value || 0) >= 3);
    const glycemicIndex = metrics.find(metric => metric.metricKey === 'glycemic_index' && (metric.value || 0) >= 55);
    const sugar = metrics.find(metric => metric.metricKey === 'sugar_g' && (metric.value || 0) >= 8);
    const starch = metrics.find(metric => metric.metricKey === 'starch_g' && (metric.value || 0) > 0);
    if (fibre) return `${metricValuePhrase(fibre)}, helping a lot here`;
    if (glycemicIndex) return `${metricValuePhrase(glycemicIndex)}, where this gets messy`;
    if (sugar) return `${metricValuePhrase(sugar)}, and that can add up fast`;
    if (starch) return `${metricValuePhrase(starch)}, doing most of the work here`;
  }

  if (sectionKey === 'proteins') {
    const proteinMetrics = topMetricsForSection(result, sectionKey, 4);
    const proteinAmount = proteinMetrics.find(metric => metric.metricKey === 'protein_g_fallback');
    const proteinDigestibility = proteinMetrics.find(metric => metric.metricKey === 'protein_digestibility_percent');
    const essentialAmino = proteinMetrics.find(metric => metric.metricKey === 'essential_amino_acids_score');
    const nonessentialAmino = proteinMetrics.find(metric => metric.metricKey === 'nonessential_amino_acids_score');
    const collagen = proteinMetrics.find(metric => metric.metricKey === 'collagen_g');
    if (proteinAmount) return `${metricValuePhrase(proteinAmount)}, so amount matters most here`;
    if (essentialAmino && Number(essentialAmino.value) < 6) {
      return `${metricValuePhrase(essentialAmino)}, after trace amino acids are filtered out`;
    }
    if (essentialAmino && proteinDigestibility) {
      return `${metricValuePhrase(essentialAmino)}, with protein digestibility at ${metricValueText(proteinDigestibility)}`;
    }
    if (proteinDigestibility) return `${metricValuePhrase(proteinDigestibility)}, one of the best parts of the protein story`;
    if (essentialAmino) return `${metricValuePhrase(essentialAmino)}, one of the better parts here`;
    if (nonessentialAmino) return `${metricValuePhrase(nonessentialAmino)}, adding supporting amino acid quality`;
    if (collagen) return `${metricValuePhrase(collagen)}, a specific protein-side detail`;

    const scoredProteinDigestibility = metrics.find(metric => metric.metricKey === 'protein_digestibility_percent' && metric.weightedScore > 0);
    const scoredEssentialAmino = metrics.find(metric => metric.metricKey === 'essential_amino_acids_score' && metric.weightedScore > 0);
    if (scoredProteinDigestibility && scoredEssentialAmino) return `${metricValuePhrase(scoredProteinDigestibility)}, and amino acid quality is strong`;
    if (scoredProteinDigestibility) return `${metricValuePhrase(scoredProteinDigestibility)}, one of the best parts of the protein story`;
    if (scoredEssentialAmino) return `${metricValuePhrase(scoredEssentialAmino)}, one of the better parts here`;
  }

  const names = metrics.map(m => formatMetricKey(m.metricKey));
  const lead = metricValuePhrase(metrics[0]);
  if (!isPositive) return `${lead}, where this gets weaker`;
  if (names.length === 1) return `${lead}, doing most of the work`;
  if (names.length === 2) return `${lead}, and ${names[1]} also matters`;
  return `${lead}, with ${names[1]} and ${names[2]} helping too`;
}

function foodTypeLabel(foodType) {
  return String(foodType || '')
    .replace(/-/g, ' ')
    .replace(/^oils and fats$/i, 'oils and fats');
}

function bestMetricContext(metric, sectionKey) {
  const key = metric?.metricKey;
  const contexts = {
    saturated_fat_g: 'supporting a cleaner fat profile',
    monounsaturated_fat_g: 'supporting the unsaturated-fat profile',
    polyunsaturated_fat_g: 'helping with cell structure and healthy signalling',
    omega3_mg: 'supporting a more useful fat profile',
    cholesterol_mg: 'keeping the fat tradeoff lighter',
    fibre_g: 'helping with digestion and steadier meals',
    sugar_g: 'helping keep the sugar load under control',
    starch_g: 'supporting useful staple-carb energy',
    glycemic_index: 'helping with steadier carb behaviour',
    collagen_g: 'supporting connective-tissue protein',
    essential_amino_acids_score: Number(metric?.value) >= 6
      ? 'making the protein useful for repair and maintenance'
      : 'after trace amino acids are filtered out',
    nonessential_amino_acids_score: 'adding supporting amino acid coverage',
    protein_digestibility_percent: 'meaning more of that protein can be digested and absorbed',
    vitamin_b12_dv: 'useful for nerve and blood-cell support',
    vitamin_d_dv: 'useful for bone and immune support',
    vitamin_c_dv: 'useful for collagen formation and antioxidant support',
    vitamin_a_dv: 'useful for vision and immune support',
    zinc_dv: 'useful for immune support',
    iron_dv: 'useful for oxygen transport',
    calcium_dv: 'useful for bone support',
    potassium_dv: 'useful for fluid balance'
  };
  if (contexts[key]) return contexts[key];
  if (sectionKey === 'fats') return 'supporting a better fat profile';
  if (sectionKey === 'carbs') return 'supporting better carb quality';
  if (sectionKey === 'proteins') return 'supporting protein quality';
  if (sectionKey === 'vitamins') return 'adding useful vitamin support';
  if (sectionKey === 'minerals') return 'adding useful mineral support';
  return '';
}

function weakMetricImpactContext(metric, sectionKey) {
  const key = metric?.metricKey;
  const dvPercent = Number(metric?.dvPercent);
  if (metric?.scoringMode === 'dv_points' && Number.isFinite(dvPercent) && dvPercent >= 50) {
    const context = bestMetricContext(metric, sectionKey);
    return context ? `${context}, but it is not the standout here` : 'still useful, but not the standout here';
  }
  const contexts = {
    saturated_fat_g: 'working against a cleaner fat profile',
    monounsaturated_fat_g: 'not adding much monounsaturated-fat support',
    polyunsaturated_fat_g: 'not adding much polyunsaturated-fat support',
    omega3_mg: 'not adding much omega 3',
    cholesterol_mg: 'adding to the cardiovascular tradeoff',
    fibre_g: 'with only modest fullness and digestion support',
    sugar_g: 'making sugar control harder',
    starch_g: 'not bringing much steady carb energy',
    glycemic_index: 'not great for steadier carb behaviour',
    collagen_g: 'not adding much structural protein',
    essential_amino_acids_score: 'not giving much repair-and-maintenance protein support',
    nonessential_amino_acids_score: 'not bringing much amino-acid coverage',
    protein_digestibility_percent: 'meaning less of that protein is digested and absorbed',
    vitamin_b12_dv: 'not bringing much nerve or blood-cell support',
    vitamin_d_dv: 'not bringing much bone or immune support',
    vitamin_c_dv: 'not bringing much collagen or antioxidant support',
    vitamin_a_dv: 'not bringing much vision or immune support',
    zinc_dv: 'not bringing much immune support',
    iron_dv: 'not bringing much oxygen-transport support',
    calcium_dv: 'not bringing much bone support',
    potassium_dv: 'not bringing much fluid-balance support'
  };
  if (contexts[key]) return contexts[key];
  if (sectionKey === 'fats') return 'working against the fat profile';
  if (sectionKey === 'carbs') return 'working against carb quality';
  if (sectionKey === 'proteins') return 'not bringing much protein quality';
  if (sectionKey === 'vitamins') return 'not bringing much vitamin support';
  if (sectionKey === 'minerals') return 'not bringing much mineral support';
  return '';
}

function categoryWeakContext(foodType, sectionKey, metric = null) {
  const type = foodTypeLabel(foodType);
  const impact = weakMetricImpactContext(metric, sectionKey);
  const combine = importance => {
    if (!impact) return importance;
    if (importance.startsWith('and ') || importance.startsWith('so ')) return `${impact}, ${importance}`;
    if (importance.startsWith('not great for ')) {
      return impact;
    }
    if (importance.startsWith('a small downside for ')) {
      return `${impact}, so that's a small downside for ${importance.slice('a small downside for '.length)}`;
    }
    if (importance.startsWith('a real downside for ')) {
      return `${impact}, so that's a real downside for ${importance.slice('a real downside for '.length)}`;
    }
    return `${impact}, which is ${importance}`;
  };
  if (sectionKey === 'fats') {
    if (foodType === 'meats') return combine('and for meats, fat quality is a major tradeoff');
    if (foodType === 'oils-and-fats') return combine('and for oils and fats, that matters a lot');
    if (foodType === 'nuts' || foodType === 'seeds') return combine(`a real downside for ${type}`);
    return combine(`not great for ${type || 'this category'}`);
  }
  if (sectionKey === 'carbs') {
    if (metric?.metricKey === 'starch_g' && LOW_STARCH_NARRATION_NEUTRAL_FOOD_TYPES.has(foodType)) {
      if (foodType === 'dairy') return `${impact}, but dairy carbs are about lactose, not starch`;
      return `${impact}, but low starch is normal for fruit`;
    }
    if (['grains', 'fruits', 'legumes', 'tubers'].includes(foodType)) return combine(`a real downside for ${type}`);
    return combine(`a small downside for ${type || 'this category'}`);
  }
  if (sectionKey === 'proteins') {
    if (foodType === 'meats' && metric?.metricKey === 'collagen_g') {
      return combine('so for meats, that collagen side of the protein score stays weak');
    }
    if (foodType === 'meats') return combine('so for meats, protein quality is a real scoring factor');
    return combine(`not great for ${type || 'this category'}`);
  }
  if (sectionKey === 'vitamins') {
    if (foodType === 'meats') return combine('a small downside for meats');
    return combine(`not great for ${type || 'this category'}`);
  }
  if (sectionKey === 'minerals') {
    if (foodType === 'meats') return combine('not great for meats');
    return combine(`not great for ${type || 'this category'}`);
  }
  return combine(`not great for ${type || 'this category'}`);
}

function lowVitaminSectionLine(result) {
  const foodType = result.food?.foodType;
  const lines = {
    grains: "vitamins are low overall. For grains, carbs and minerals matter more",
    meats: "vitamins are low overall. For meats, B12 and vitamin D matter most",
    dairy: "vitamins are low overall. For dairy, vitamin D and B12 matter most",
    fruits: "vitamins are low overall. For fruit, vitamin C and vitamin A matter most",
    vegetables: "vitamins are low overall. For vegetables, A, C, and K matter most",
    legumes: "vitamins are low overall. For legumes, fibre, protein, and minerals matter more",
    tubers: "vitamins are low overall. For tubers, vitamin C and vitamin A matter most",
    nuts: "vitamins are low overall. For nuts, vitamin E matters most",
    seeds: "vitamins are low overall. For seeds, vitamin E matters most",
    'oils-and-fats': "vitamins are low overall. For oils and fats, vitamin E matters most"
  };
  return lines[foodType] || `vitamins are low overall. For ${foodTypeLabel(foodType) || 'this category'}, vitamins need to show up clearly`;
}

function bestMetricLine(metric, sectionKey) {
  if (!metric) return null;
  const context = bestMetricContext(metric, sectionKey);
  return context ? `${metricValuePhrase(metric)}, ${context}` : metricValuePhrase(metric);
}

function weakMetricLine(metric, result, sectionKey) {
  if (!metric) return null;
  const context = categoryWeakContext(result.food.foodType, sectionKey, metric);
  if (metric.scoringMode === 'dv_points' && Number(metric.dvPercent) <= 5) {
    return `${formatMetricKey(metric.metricKey)} is only ${metric.dvPercent}% DV, ${context}`;
  }
  if (metric.metricKey === 'collagen_g' && Number(metric.value) <= 1) {
    return `collagen is only ${metricValueText(metric)}, ${context}`;
  }
  return `${metricValuePhrase(metric)}, ${context}`;
}

function metricSectionScore(metric) {
  const score = toFiniteNumber(metric?.score);
  if (score !== null) return score;
  if (metric?.scoringMode === 'dv_points') {
    const dvPercent = toFiniteNumber(metric.dvPercent);
    if (dvPercent !== null) return Math.min(100, Math.floor(dvPercent / 10) * 10);
  }
  const band = arrowBand(metric);
  if (band) {
    const bandScore = band.level <= 1 ? 60 : band.level === 2 ? 80 : 100;
    return band.color === 'green' ? bandScore : 100 - bandScore;
  }
  return null;
}

function metricTieValue(metric) {
  const weighted = toFiniteNumber(metric?.weightedScore);
  if (weighted !== null && weighted !== 0) return weighted;
  return toFiniteNumber(metric?.dvPercent)
    ?? toFiniteNumber(metric?.value)
    ?? weighted
    ?? 0;
}

function compareMetricsByStrength(a, b) {
  const scoreDiff = (metricSectionScore(b) ?? -Infinity) - (metricSectionScore(a) ?? -Infinity);
  if (scoreDiff) return scoreDiff;
  return metricTieValue(b) - metricTieValue(a);
}

function weakFallbackPriority(metric, sectionKey) {
  if (!metric) return 99;
  if (metric.polarity === 'higher_better') return 0;
  if (sectionKey === 'fats' && ['omega3_mg', POLYUNSATURATED_FAT_METRIC_KEY, MONOUNSATURATED_FAT_METRIC_KEY].includes(metric.metricKey)) return 0;
  return 1;
}

function strongestAvailableMetric(metrics, exclude = null) {
  return (metrics || [])
    .filter(metric => metric && metric !== exclude && metricHasDefensibleValue(metric))
    .sort(compareMetricsByStrength)[0] || null;
}

function weakestAvailableMetric(metrics, exclude = null, sectionKey = '') {
  return (metrics || [])
    .filter(metric => metric && metric !== exclude && metricHasDefensibleValue(metric))
    .sort((a, b) => {
      const scoreDiff = (metricSectionScore(a) ?? Infinity) - (metricSectionScore(b) ?? Infinity);
      if (scoreDiff) return scoreDiff;
      const priorityDiff = weakFallbackPriority(a, sectionKey) - weakFallbackPriority(b, sectionKey);
      if (priorityDiff) return priorityDiff;
      return metricTieValue(a) - metricTieValue(b);
    })[0] || null;
}

function preferredProteinQualityNarrationMetric(metrics, exclude = null) {
  const byKey = new Map((metrics || [])
    .filter(metric => (
      metric
      && metric !== exclude
      && metricHasDefensibleValue(metric)
      && PROTEIN_QUALITY_METRIC_KEYS.has(metric.metricKey)
    ))
    .map(metric => [metric.metricKey, metric]));
  return byKey.get('essential_amino_acids_score')
    || byKey.get('protein_digestibility_percent')
    || byKey.get('nonessential_amino_acids_score')
    || null;
}

function bestAvailableMetricLine(metric, sectionKey) {
  if (!metric) return null;
  const score = metricSectionScore(metric);
  if (score !== null && score < 20) {
    return `${metricValuePhrase(metric)}, the best number here but still too low to carry this section`;
  }
  if (score !== null && score < 50) {
    return `${metricValuePhrase(metric)}, the best number here but still only modest help`;
  }
  return bestMetricLine(metric, sectionKey);
}

function secondMetricLine(metric, result, sectionKey) {
  if (!metric) return null;
  if (weakMetricRank(metric) > -Infinity) return weakMetricLine(metric, result, sectionKey);

  const score = metricSectionScore(metric);
  const context = bestMetricContext(metric, sectionKey);
  if (score !== null && score >= 80) {
    const support = context ? `${context}, and it is still a strong secondary mark` : 'still a strong secondary mark';
    return `${metricValuePhrase(metric)}, ${support}`;
  }
  if (score !== null && score >= 50) {
    if (sectionKey === 'carbs' && metric.metricKey === 'fibre_g') return bestMetricLine(metric, sectionKey);
    const support = context ? `${context}, but it is ` : 'it is ';
    return `${metricValuePhrase(metric)}, ${support}the smaller helper in this section`;
  }
  return weakMetricLine(metric, result, sectionKey);
}

function proteinFallbackContext(result, score) {
  const foodType = result.food.foodType;
  if (score >= 60) return 'that amount is useful enough to count';
  if (foodType === 'meats') return 'for meats, that is lower than you want';
  if (foodType === 'dairy') return 'protein helps a bit, but it is not the main thing';
  if (foodType === 'seeds' || foodType === 'nuts') return 'protein helps, but most people pick this for other reasons';
  if (foodType === 'grains') return 'not enough to make protein the main thing';
  if (foodType === 'tubers') return 'protein barely matters here';
  return 'not enough protein to be a real strength';
}

function proteinQualityGateLine(result) {
  const gate = result.proteinQualityGate;
  if (gate?.eligible !== false || !gate.aminoAcidProfileAvailable) return null;
  const skipped = Array.isArray(gate.skippedMetricKeys) ? gate.skippedMetricKeys : [];
  if (!skipped.some(metricKey => PROTEIN_QUALITY_VISIBLE_METRIC_KEYS.has(metricKey))) return null;

  const proteinG = toFiniteNumber(gate.proteinG);
  const minimumProteinG = toFiniteNumber(gate.minimumProteinG);
  const essentialAmino = completeMacroDisplayItems(result, 'proteins')
    .find(metric => metric.metricKey === 'essential_amino_acids_score');
  const essentialAminoValue = metricValueText(essentialAmino) || '0/9';
  if (proteinG !== null && minimumProteinG !== null) {
    return `essential amino acids score is ${essentialAminoValue} after the protein gate, because ${proteinG}g is below the ${minimumProteinG}g useful-protein cutoff`;
  }
  return `essential amino acids score is ${essentialAminoValue} after the protein gate, because it is below the useful-protein cutoff`;
}

function outstandingMacroLine(result, sectionKey) {
  const metrics = outstandingMacroMetrics(result, sectionKey, 4);
  if (!metrics.length) {
    const label = sectionKey === 'carbs' ? 'carb' : sectionKey.slice(0, -1);
    return `no defensible ${label} submacros to call out`;
  }

  if (sectionKey === 'proteins') {
    const byKey = key => metrics.find(metric => metric.metricKey === key);
    const proteinAmount = byKey('protein_g_fallback');
    const essentialAmino = byKey('essential_amino_acids_score');
    const proteinDigestibility = byKey('protein_digestibility_percent');
    const score = result.sectionScores?.proteins ?? null;
    const gateLine = proteinQualityGateLine(result);
    if (gateLine) {
      return joinShort([
        proteinFallbackContext(result, score),
        gateLine
      ]).replace(/[.]$/g, '');
    }
    if (proteinAmount) {
      const secondPool = weakNarrationMetrics(result, metrics, sectionKey, proteinAmount);
      const second = preferredProteinQualityNarrationMetric(secondPool, proteinAmount)
        || weakestAvailableMetric(secondPool, proteinAmount, sectionKey);
      return joinShort([
        proteinFallbackContext(result, score),
        secondMetricLine(second, result, sectionKey)
      ]).replace(/[.]$/g, '');
    }
    const bestMetric = essentialAmino || proteinDigestibility || strongestAvailableMetric(metrics);
    const secondPool = weakNarrationMetrics(result, metrics, sectionKey, bestMetric);
    const second = weakestOutstandingMetric(secondPool, bestMetric) || weakestAvailableMetric(secondPool, bestMetric, sectionKey);
    const essentialAminoValue = Number(essentialAmino?.value);
    const best = essentialAmino && essentialAminoValue < 6
      ? `${metricValuePhrase(essentialAmino)}, meaning ${essentialAminoValue <= 0 ? 'none of the amino-acid groups' : 'only a few amino-acid groups'} hit a useful amount`
      : bestAvailableMetricLine(bestMetric, sectionKey);
    return joinShort([
      best,
      secondMetricLine(second, result, sectionKey)
    ]).replace(/[.]$/g, '');
  }

  const best = strongestPositiveMetric(metrics) || strongestAvailableMetric(metrics);
  const weakCandidates = weakNarrationMetrics(result, metrics, sectionKey, best);
  const weakest = weakestOutstandingMetric(weakCandidates, best) || weakestAvailableMetric(weakCandidates, best, sectionKey);
  const companion = sectionKey === 'fats'
    ? monounsaturatedFatCompanionLine(result, [best, weakest])
    : null;
  return joinShort([
    bestAvailableMetricLine(best, sectionKey),
    secondMetricLine(weakest, result, sectionKey),
    companion
  ]).replace(/[.]$/g, '');
}

function buildHook(result) {
  return `${result.food.name} ranked.`;
}

function buildIntro() {
  return '';
}

function sectionFoodTypeSummary(result, sectionKey) {
  const foodType = result.food.foodType;
  const type = foodTypeLabel(foodType);
  const lines = {
    meats: {
      fats: 'for meats, fat quality is the main tradeoff',
      carbs: 'for meats, carbs barely matter unless something is added',
      proteins: 'for meats, protein quality matters a lot',
      vitamins: 'for meats, vitamin B12 and vitamin D matter most',
      minerals: 'for meats, iron and zinc can add real value'
    },
    grains: {
      fats: 'for grains, fat usually matters less than carbs',
      carbs: 'for grains, carb quality matters most',
      proteins: 'for grains, protein helps, but carbs matter more',
      vitamins: 'for grains, vitamins are usually a bonus',
      minerals: 'for grains, minerals help round out the score'
    },
    fruits: {
      fats: 'for fruit, fat is usually just a small side note',
      carbs: 'for fruit, carbs come down to sugar control and fibre',
      proteins: 'for fruit, protein is usually too low to matter much',
      vitamins: 'for fruit, vitamin C and vitamin A matter most',
      minerals: 'for fruit, minerals are usually a bonus'
    },
    vegetables: {
      fats: 'for vegetables, fat is usually just a tiny side detail',
      carbs: 'for vegetables, light carbs are easy to work with',
      proteins: 'for vegetables, protein is a bonus, not something to rely on',
      vitamins: 'for vegetables, vitamins can move the ranking a lot',
      minerals: 'for vegetables, minerals help when the numbers are strong'
    },
    legumes: {
      carbs: 'for legumes, fibre and protein make carbs better',
      fats: 'for legumes, fat usually matters less than fibre and protein',
      proteins: 'for legumes, protein support is a big deal',
      vitamins: 'for legumes, fibre, protein, and minerals matter more',
      minerals: 'for legumes, minerals add real value'
    },
    dairy: {
      fats: 'for dairy, fat can help or drag the score down',
      carbs: 'for dairy, carbs mostly mean sugar control',
      proteins: 'for dairy, useful protein matters a lot',
      vitamins: 'for dairy, vitamin D and B12 matter most',
      minerals: 'for dairy, calcium is the main mineral check'
    },
    'oils-and-fats': {
      fats: 'for this category, fat quality is the point',
      carbs: "for oils and fats, carbs don't really matter",
      proteins: "for oils and fats, protein doesn't really matter",
      vitamins: 'for oils and fats, vitamin E matters most',
      minerals: 'for oils and fats, minerals are usually tiny'
    },
    nuts: {
      fats: 'for nuts, fat quality has to justify the calories',
      carbs: 'for nuts, carbs matter most when sugar or fibre changes the balance',
      proteins: 'for nuts, protein helps, but it is not the main thing',
      vitamins: 'for nuts, vitamin E matters most',
      minerals: 'for nuts, minerals help justify the calories'
    },
    seeds: {
      fats: 'for seeds, fat quality is a big reason to use them',
      carbs: 'for seeds, fibre matters much more than raw carb totals',
      proteins: 'for seeds, protein is a bonus here, but not enough by itself',
      vitamins: 'for seeds, fats and minerals usually matter more',
      minerals: 'for seeds, minerals can be a main strength'
    },
    tubers: {
      carbs: 'for tubers, carb quality decides a lot',
      fats: 'for tubers, fat is mostly a preparation check, not the main job',
      proteins: 'for tubers, protein is usually limited, so the other sections have to carry more',
      vitamins: 'for tubers, vitamins can lift a staple carb',
      minerals: 'for tubers, minerals matter most when potassium shows up strongly'
    },
    misc: {
      fats: 'for misc foods, fat only matters when it changes the use case',
      carbs: 'for misc foods, carbs matter when sugar or fuel is the point',
      proteins: 'for misc foods, protein only matters when it is part of the job',
      vitamins: 'for misc foods, vitamins need to change the real value',
      minerals: 'for misc foods, minerals need to change the real value'
    }
  };

  return lines[foodType]?.[sectionKey]
    || sectionContextLine(foodType, `${result.food.id}:${sectionKey}`)
    || `for ${type || 'this food type'}, this section matters when it changes the meal`;
}

function buildMacroSection(result, key) {
  const macro = macroLine(result, key);
  const outstanding = outstandingMacroLine(result, key);
  return joinShort([macro, outstanding, sectionFoodTypeSummary(result, key)]);
}

function buildMicrosSection(result, sectionKey) {
  const top = outstandingMicronMetrics(result, sectionKey, 4, { speakDailyValue: true });
  if (!top.length) {
    if (result.food.foodType === 'misc') {
      return sectionKey === 'vitamins' ? 'no real vitamin story here.' : 'no real mineral story here.';
    }
    const base = sectionKey === 'vitamins'
      ? pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:micro-lackluster`)
      : 'minerals are basically not adding much here';
    return joinShort([base, sectionFoodTypeSummary(result, sectionKey)]);
  }

  if (result.food.foodType === 'misc') {
    return sectionKey === 'vitamins' ? 'no real vitamin story here.' : 'no real mineral story here.';
  }

  const positive = strongestPositiveMetric(top);
  if (sectionKey === 'vitamins' && !positive) {
    return `${lowVitaminSectionLine(result)}.`;
  }
  const best = positive || strongestAvailableMetric(top);
  const highestDvMineral = sectionKey === 'minerals' ? highestDvMicronMetric(top, best, 30) : null;
  const weakCandidates = weakNarrationMetrics(result, top, sectionKey, best);
  const weakest = weakestOutstandingMetric(weakCandidates, best) || weakestAvailableMetric(weakCandidates, best, sectionKey);
  return joinShort([
    positive ? bestMetricLine(best, sectionKey) : bestAvailableMetricLine(best, sectionKey),
    highestDvMineral ? bestMetricLine(highestDvMineral, sectionKey) : secondMetricLine(weakest, result, sectionKey),
    sectionFoodTypeSummary(result, sectionKey)
  ]);
}

function lowerFirst(s) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function trimSentence(s) {
  return String(s || '').trim().replace(/[.]+$/g, '');
}

function condenseExplanation(explanation) {
  let text = trimSentence(explanation || '');
  if (!text) return '';

  const replacements = [
    [/^Adds extra /i, 'adds '],
    [/^Adds /i, 'adds '],
    [/^Works well as /i, 'works well as '],
    [/^Works /i, 'works '],
    [/^The overall /i, 'the '],
    [/^The /i, 'the '],
    [/^This is one of the clearest viewer-recognisable wins in the fruit category$/i, 'that gives it a clear in-category edge'],
    [/^A major category advantage beyond the raw table alone$/i, 'that gives it a real category edge'],
    [/^Useful practical strength in meals$/i, 'that makes it practical in real meals'],
    [/^Strong viewer-facing health halo that matches the data reasonably well$/i, 'that fits its strong health reputation'],
    [/^Adds extra cardiovascular and satiety context beyond the base nutrient display$/i, 'that helps with fullness too'],
    [/^Works well as a simple staple in many eating patterns$/i, 'that makes it easy to use regularly'],
    [/^The overall fibre profile can be practically useful beyond the raw grams display$/i, 'that can help with real-world digestion'],
    [/^Phytates may slightly reduce mineral uptake$/i, 'that can slightly reduce mineral absorption'],
    [/^Sugary toppings can shift the outcome a lot$/i, 'sweet add-ons can change the whole picture'],
    [/^Some people do not tolerate oats especially well$/i, 'some people just do not tolerate it that well'],
    [/^Price can limit practical use$/i, 'price can make it less practical'],
    [/^Wild vs farmed differences matter in practice$/i, 'sourcing changes the real-world quality'],
    [/^A practical downside compared with some shelf-stable foods$/i, 'it is less convenient than shelf-stable options']
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement);
      break;
    }
  }

  return lowerFirst(text);
}

function mergeContextItem(item) {
  const title = trimSentence(item.title || '');
  const explanation = condenseExplanation(item.explanation || '');
  if (!title) return explanation;
  if (!explanation) return title;
  return `${title}. ${explanation}`;
}

function shortContextTitle(item) {
  return lowerFirst(trimSentence(item?.title || ''))
    .replace(/ is a major drawback$/i, '')
    .replace(/ is a major negative$/i, '')
    .replace(/ is a brutal downside$/i, '')
    .replace(/^works as a /i, '')
    .replace(/^has /i, '')
    .replace(/^highly /i, '')
    .replace(/^very /i, '')
    .replace(/^can be /i, '');
}

function shortMetricLabel(metricKey) {
  return formatMetricKey(metricKey)
    .replace(/monounsaturated fat/i, 'fat quality')
    .replace(/polyunsaturated fat/i, 'fat quality')
    .replace(/protein g fallback/i, 'protein')
    .replace(/essential amino acids score/i, 'protein quality')
    .replace(/protein digestibility(?: percent)?/i, 'protein quality');
}

function positiveSectionHighlight(result, sectionKey) {
  const score = result.sectionScores?.[sectionKey] ?? null;
  const metrics = topMetricsForSection(result, sectionKey, 4, { speakDailyValue: false });
  if (score === null || !metrics.length) return null;

  if (sectionKey === 'proteins') {
    const proteinGrams = headerMacro(result, 'protein_g') ?? 0;
    const hasMeaningfulQualitySignal = metrics.some(metric => {
      if (!['protein_digestibility_percent', 'essential_amino_acids_score', 'nonessential_amino_acids_score'].includes(metric.metricKey)) return false;
      return (toFiniteNumber(metric.weightedScore) ?? 0) >= 60 || (toFiniteNumber(metric.score) ?? 0) >= 60;
    });
    if (proteinGrams >= 12 || score >= 60 || (proteinGrams >= 8 && hasMeaningfulQualitySignal)) return 'protein';
    return null;
  }

  if (sectionKey === 'fats' && score >= 55) {
    if (result.food.foodType === 'oils-and-fats') return 'fat quality';
    if (metrics.find(metric => metric.metricKey === 'omega3_mg' && (metric.value || 0) >= 100)) return 'omega 3';
    if (metrics.find(metric => metric.metricKey === MONOUNSATURATED_FAT_METRIC_KEY && (metric.value || 0) >= 5)) return 'fat quality';
    if (metrics.find(metric => metric.metricKey === POLYUNSATURATED_FAT_METRIC_KEY && (metric.value || 0) >= 2)) return 'fat quality';
  }

  if (sectionKey === 'carbs' && score >= 55) {
    if (metrics.find(metric => metric.metricKey === 'fibre_g' && (metric.value || 0) >= 3)) return 'fibre';
    return 'carb quality';
  }

  if (sectionKey === 'vitamins' && score >= 15) return shortMetricLabel(metrics[0].metricKey);
  if (sectionKey === 'minerals' && score >= 15) return shortMetricLabel(metrics[0].metricKey);

  return null;
}

function metricNumberForSummary(result, metricKey) {
  const metric = (result.metricBreakdown || []).find(item => item.metricKey === metricKey);
  if (metric?.dvPercent !== null && metric?.dvPercent !== undefined) return toFiniteNumber(metric.dvPercent);
  if (metric?.value !== null && metric?.value !== undefined) return toFiniteNumber(metric.value);
  if (result.foodMetrics && Object.prototype.hasOwnProperty.call(result.foodMetrics, metricKey)) {
    return toFiniteNumber(result.foodMetrics[metricKey]);
  }
  if (result.header && Object.prototype.hasOwnProperty.call(result.header, metricKey)) {
    return toFiniteNumber(result.header[metricKey]);
  }
  return null;
}

function summaryContextText(result, side) {
  return (result.contextItems?.[side] || [])
    .map(item => `${item.title || ''} ${item.explanation || ''}`)
    .join(' ')
    .toLowerCase();
}

function namedDvSupport(values) {
  return values
    .filter(item => Number(item.value) >= Number(item.threshold ?? 10))
    .map(item => item.label);
}

function addUseCase(cases, key, label, reason, score) {
  const safeScore = Number(score);
  if (!Number.isFinite(safeScore) || safeScore <= 0 || cases.some(item => item.key === key)) return;
  cases.push({ key, label, reason, score: safeScore });
}

function rankedFoodUseCases(result) {
  const cases = [];
  const type = result.food?.foodType;
  const prosText = summaryContextText(result, 'pros');
  const consText = summaryContextText(result, 'cons');
  const fatsScore = toFiniteNumber(result.sectionScores?.fats) ?? 0;
  const carbsScore = toFiniteNumber(result.sectionScores?.carbs) ?? 0;
  const proteinsScore = toFiniteNumber(result.sectionScores?.proteins) ?? 0;
  const vitaminsScore = toFiniteNumber(result.sectionScores?.vitamins) ?? 0;
  const mineralsScore = toFiniteNumber(result.sectionScores?.minerals) ?? 0;
  const processingPenalty = toFiniteNumber(result.processingPenalty) ?? 0;
  const kcal = toFiniteNumber(result.header?.kcal ?? result.food?.kcal) ?? 0;
  const fatG = metricNumberForSummary(result, 'fat_g') ?? 0;
  const carbsG = metricNumberForSummary(result, 'carb_g') ?? metricNumberForSummary(result, 'carbs_g') ?? 0;
  const proteinG = metricNumberForSummary(result, 'protein_g') ?? 0;
  const fibreG = metricNumberForSummary(result, 'fibre_g') ?? 0;
  const omega3Mg = metricNumberForSummary(result, 'omega3_mg') ?? 0;
  const monounsaturatedFatG = metricNumberForSummary(result, MONOUNSATURATED_FAT_METRIC_KEY) ?? 0;
  const polyunsaturatedFatG = metricNumberForSummary(result, POLYUNSATURATED_FAT_METRIC_KEY) ?? 0;
  const saturatedFatG = metricNumberForSummary(result, 'saturated_fat_g') ?? 0;
  const vitaminC = metricNumberForSummary(result, 'vitamin_c_dv') ?? 0;
  const vitaminA = metricNumberForSummary(result, 'vitamin_a_dv') ?? 0;
  const vitaminD = metricNumberForSummary(result, 'vitamin_d_dv') ?? 0;
  const vitaminB12 = metricNumberForSummary(result, 'vitamin_b12_dv') ?? 0;
  const calcium = metricNumberForSummary(result, 'calcium_dv') ?? 0;
  const magnesium = metricNumberForSummary(result, 'magnesium_dv') ?? 0;
  const potassium = metricNumberForSummary(result, 'potassium_dv') ?? 0;
  const zinc = metricNumberForSummary(result, 'zinc_dv') ?? 0;
  const iron = metricNumberForSummary(result, 'iron_dv') ?? 0;

  if (carbsG >= 25 && carbsScore >= 50 && fibreG < 7) {
    addUseCase(cases, 'energy_endurance', 'energy and endurance sports', 'the carb section gives usable fuel', carbsScore + carbsG);
  } else if (carbsG >= 15 && carbsScore >= 40) {
    addUseCase(cases, 'energy', 'energy', 'the carb section gives it a clear fuel role', carbsScore + carbsG);
  }

  if (proteinG >= 18 && proteinsScore >= 60) {
    addUseCase(cases, 'muscles_strength', 'muscles and strength sports', 'the protein section supports repair and maintenance', proteinsScore + proteinG);
  } else if (proteinG >= 10 || proteinsScore >= 60) {
    addUseCase(cases, 'muscles', 'muscles', 'protein still gives it some muscle support', proteinsScore + proteinG);
  }

  const hormoneFatCase = fatsScore >= 55 && (
    (type === 'oils-and-fats' && fatG >= 15 && saturatedFatG <= 20)
    || (saturatedFatG <= 8 && (polyunsaturatedFatG >= 2 || monounsaturatedFatG >= 5 || omega3Mg >= 100 || fatG >= 5))
  );
  if (hormoneFatCase) {
    addUseCase(
      cases,
      'hormone_health',
      'hormone health',
      type === 'oils-and-fats'
        ? 'fat quality is the main reason to use it when portions stay controlled'
        : 'the fat section has enough useful fats for a support role',
      fatsScore + polyunsaturatedFatG + (monounsaturatedFatG / 2) + (omega3Mg / 100)
    );
  }

  const boneNutrients = namedDvSupport([
    { label: 'calcium', value: calcium },
    { label: 'vitamin D', value: vitaminD },
    { label: 'magnesium', value: magnesium }
  ]);
  if (boneNutrients.length || (mineralsScore >= 30 && calcium >= 5)) {
    addUseCase(cases, 'bone_health', 'bone health', `${naturalList(boneNutrients.length ? boneNutrients : ['mineral support'])} can support bones`, mineralsScore + calcium + vitaminD + magnesium);
  }

  if (fibreG >= 3 || /\b(ferment|digestion|gut|tolerance|fibre|fiber)\b/.test(prosText)) {
    addUseCase(cases, 'digestion', 'digestion', fibreG >= 3 ? 'fibre helps digestion and keeps meals steadier' : 'the pros help with digestion or tolerance', carbsScore + fibreG * 8);
  }

  const immuneNutrients = namedDvSupport([
    { label: 'vitamin C', value: vitaminC },
    { label: 'vitamin A', value: vitaminA },
    { label: 'zinc', value: zinc }
  ]);
  if (immuneNutrients.length) {
    const verb = immuneNutrients.length === 1 ? 'helps' : 'help';
    addUseCase(cases, 'immune_support', 'immune support', `${naturalList(immuneNutrients)} ${verb} support the immune system`, vitaminsScore + mineralsScore + vitaminC + vitaminA + zinc);
  }

  const heartFromFibre = fibreG >= 5;
  const heartFromOmega = omega3Mg >= 250 && saturatedFatG <= 4 && processingPenalty < 10;
  const heartFromOilQuality = type === 'oils-and-fats'
    && fatsScore >= 55
    && saturatedFatG <= 16
    && /\b(polyphenol|olive|unsaturated|evoo|fat quality)\b/.test(`${prosText} ${consText}`);
  const heartFromFatQuality = fatsScore >= 65 && saturatedFatG <= 4 && (polyunsaturatedFatG >= 4 || monounsaturatedFatG >= 10);
  if (heartFromFibre || heartFromOmega || heartFromOilQuality || heartFromFatQuality) {
    const reason = heartFromFibre
      ? 'fibre is useful for heart health'
      : heartFromOilQuality
        ? 'unsaturated fats and polyphenols help explain the heart-health benefit'
        : heartFromOmega
          ? 'omega 3 helps the fat-quality story without a big saturated-fat tradeoff'
          : 'fat quality is useful for heart health';
    addUseCase(cases, 'heart_health', 'heart health', reason, fatsScore + carbsScore + fibreG * 4 + (monounsaturatedFatG / 2) + (omega3Mg / 100));
  }

  if (potassium >= 10) {
    addUseCase(cases, 'fluid_balance', 'fluid balance', 'potassium gives it electrolyte support', mineralsScore + potassium);
  }

  if ((kcal > 0 && kcal <= 70 && ['vegetables', 'fruits'].includes(type)) || /\b(volume|satiety|filling)\b/.test(prosText)) {
    addUseCase(cases, 'low_calorie_volume', 'low-calorie volume', 'it helps fill out a meal without many calories', 55 + Math.max(0, 80 - kcal));
  }

  if ((kcal <= 120 || type === 'misc') && /\b(flavou?r|swap|condiment|season|vinegar|acid|culinary)\b/.test(prosText)) {
    addUseCase(cases, 'flavour_swaps', 'low-calorie flavour swaps', 'it adds flavour without adding many calories', 65 + Math.max(0, 120 - kcal));
  }

  if (/\b(staple|cheap|batch|easy|convenient|shelf|meal|pair|practical)\b/.test(prosText) || (['grains', 'legumes', 'tubers'].includes(type) && carbsScore >= 45)) {
    addUseCase(cases, 'practical_meals', 'practical meals', "it's easy to build meals around", 50 + carbsScore);
  }

  if (type === 'oils-and-fats' && fatsScore >= 45) {
    addUseCase(cases, 'cooking_use', 'cooking use', 'the fat section is the main job and the use case depends on controlled portions', fatsScore);
  }

  if (vitaminB12 >= 10 || iron >= 10) {
    addUseCase(cases, 'blood_support', 'blood and oxygen support', `${naturalList(namedDvSupport([
      { label: 'vitamin B12', value: vitaminB12 },
      { label: 'iron', value: iron }
    ]))} supports the blood-and-oxygen side`, vitaminsScore + mineralsScore + vitaminB12 + iron);
  }

  if (!cases.length) {
    addUseCase(cases, 'narrow_use_cases', 'narrow use cases', 'the sections do not show one strong nutrition job', 1);
  }

  return cases.sort((a, b) => b.score - a.score);
}

function selectedFoodUseCases(result, limit = 3) {
  return rankedFoodUseCases(result).slice(0, limit);
}

function weakMetricSummaryPhrase(metric) {
  if (!metric) return null;
  const label = shortMetricLabel(metric.metricKey);
  const band = arrowBand(metric);
  if (metric.scoringMode === 'dv_points') return `low ${label}`;
  if (band?.color === 'red' && metric.polarity !== 'higher_worse') return `low ${label}`;
  if ((metric.weightedScore ?? 0) <= 0 && metric.polarity !== 'higher_worse') return `low ${label}`;
  return label;
}

function weakSectionHighlight(result, sectionKey) {
  const score = toFiniteNumber(result.sectionScores?.[sectionKey]);
  if (score === null || score >= 55) return null;
  if (sectionKey === 'carbs' && result.food?.foodType === 'misc' && (macroValueForSection(result, sectionKey) ?? 0) <= 1) {
    return null;
  }
  const metrics = ['fats', 'carbs', 'proteins'].includes(sectionKey)
    ? outstandingMacroMetrics(result, sectionKey, 4)
    : outstandingMicronMetrics(result, sectionKey, 4, { speakDailyValue: false });
  const strongest = strongestPositiveMetric(metrics);
  const weakCandidates = weakNarrationMetrics(result, metrics, sectionKey, strongest);
  const weakest = weakestOutstandingMetric(weakCandidates, strongest) || weakCandidates[0];
  if (!weakest) return sectionKey === 'proteins' ? 'low protein amount' : titleForSection(sectionKey).toLowerCase();
  return weakMetricSummaryPhrase(weakest);
}

function uniqueHighlights(items, limit = 2) {
  const out = [];
  const seen = new Set();
  for (const item of items) {
    const value = lowerFirst(trimSentence(item || ''));
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= limit) break;
  }
  return out;
}

function buildStrengthHighlights(result, limit = 3) {
  const nutritionStrengths = [
    { key: 'fats', phrase: positiveSectionHighlight(result, 'fats'), score: result.sectionScores?.fats ?? -1 },
    { key: 'proteins', phrase: positiveSectionHighlight(result, 'proteins'), score: result.sectionScores?.proteins ?? -1 },
    { key: 'carbs', phrase: positiveSectionHighlight(result, 'carbs'), score: result.sectionScores?.carbs ?? -1 },
    { key: 'vitamins', phrase: positiveSectionHighlight(result, 'vitamins'), score: result.sectionScores?.vitamins ?? -1 },
    { key: 'minerals', phrase: positiveSectionHighlight(result, 'minerals'), score: result.sectionScores?.minerals ?? -1 }
  ]
    .filter(item => item.phrase)
    .sort((a, b) => b.score - a.score)
    .map(item => item.phrase);

  return uniqueHighlights([
    ...nutritionStrengths,
    ...(result.contextItems?.pros || []).map(shortContextTitle)
  ], limit);
}

function buildWeaknessHighlights(result, limit = 3) {
  const nutritionWeaknesses = [
    { key: 'fats', phrase: weakSectionHighlight(result, 'fats'), score: result.sectionScores?.fats ?? 101 },
    { key: 'carbs', phrase: weakSectionHighlight(result, 'carbs'), score: result.sectionScores?.carbs ?? 101 },
    { key: 'proteins', phrase: weakSectionHighlight(result, 'proteins'), score: result.sectionScores?.proteins ?? 101 },
    { key: 'vitamins', phrase: weakSectionHighlight(result, 'vitamins'), score: result.sectionScores?.vitamins ?? 101 },
    { key: 'minerals', phrase: weakSectionHighlight(result, 'minerals'), score: result.sectionScores?.minerals ?? 101 }
  ]
    .filter(item => item.phrase)
    .sort((a, b) => a.score - b.score)
    .map(item => item.phrase);

  return uniqueHighlights([
    ...nutritionWeaknesses,
    ...(result.contextItems?.cons || []).map(shortContextTitle)
  ], limit);
}

function buildGoodForLine(result) {
  const useCases = selectedFoodUseCases(result, CLOSING_USE_CASE_LIMIT);
  if (useCases.length === 1 && useCases[0].key === 'narrow_use_cases') {
    return `best for ${useCases[0].label} because ${useCases[0].reason}`;
  }
  return `best for ${naturalList(useCases.map(item => item.label))} because ${naturalList(useCases.map(item => item.reason))}`;
}

function buildOverview(result) {
  const strengths = buildStrengthHighlights(result, 2);
  const weaknesses = buildWeaknessHighlights(result, 2);
  const lines = [];

  if (strengths.length) lines.push(`best bits are ${naturalList(strengths)}`);
  if (weaknesses.length) lines.push(`weak spots are ${naturalList(weaknesses)}`);
  if (!lines.length) lines.push(`${result.food.name} is pretty mixed overall`);
  lines.push(buildGoodForLine(result));

  return lines.join('. ');
}

function buildProsConsSection(result, side) {
  const items = side === 'pros' ? (result.contextItems?.pros || []) : (result.contextItems?.cons || []);
  const introOptions = side === 'pros'
    ? ['pros first:', 'the upsides first:', 'positives first:']
    : ['cons next:', 'the drawbacks next:', 'downsides next:'];
  const intro = pick(introOptions, side === 'pros' ? 'pros first:' : 'cons next:', `${result.food.id}:${side}:intro`);
  const body = items.map(mergeContextItem).filter(Boolean).join('. ');
  return body ? `${intro} ${body}.` : intro;
}

function bestUsesLine(result) {
  const type = result.food.foodType;
  const tier = result.tier;
  const strongByType = {
    meats: 'Best when you want efficient protein and can accept the category tradeoffs that come with it',
    grains: 'Best when you want a staple carb that actually brings something useful with it',
    fruits: 'Best when you want sweetness that still earns its place nutritionally',
    vegetables: 'Best when you want low downside and easy micronutrient support',
    legumes: 'Best when you want fibre, protein, and actual meal utility together',
    dairy: 'Best when the protein or fermentation benefit outweighs the fat and sodium tradeoffs',
    nuts: 'Best in small amounts where the fats and minerals matter more than sheer calories',
    seeds: 'Best as a support food that boosts meals instead of carrying them alone',
    tubers: 'Best when you want practical carbs and the rest of the profile is still reasonably clean',
    'oils-and-fats': 'Best in controlled amounts where fat quality is the main reason to use it',
    misc: 'Best treated as a context item rather than a nutritional cornerstone'
  };
  const weakByType = {
    meats: 'Best only if convenience, budget, or taste matters more than getting the cleanest meat option',
    grains: 'Best only as a light snack base or texture food, not as a strong staple by itself',
    fruits: 'Best only when the convenience or taste matters more than the nutrition return',
    vegetables: 'Best only when you need a low-commitment add-on rather than a nutrient-dense anchor',
    legumes: 'Best only when convenience matters more than the weaker fibre or protein support',
    dairy: 'Best only when the taste or format matters more than getting the strongest dairy profile',
    nuts: 'Best only in small amounts when the calories stay under control',
    seeds: 'Best only as a supporting add-on rather than something to lean on heavily',
    tubers: 'Best only when you want easy carbs and can accept the missing upside',
      'oils-and-fats': 'Best only in small amounts when the cooking job matters more than the nutrition story',
    misc: 'Best treated as an occasional context item, not a nutritional base'
  };
  if (tier === 'Slop' || tier === 'D' || tier === 'C') return weakByType[type] || 'Best only in narrow use cases where its limitations matter less';
  return strongByType[type] || 'Best when its strengths actually match the job you want it to do';
}

function buildClosing(result) {
  const tier = result.tier;
  const useCases = selectedFoodUseCases(result, 3);
  const strengthHighlights = buildStrengthHighlights(result, 3);
  const weaknessHighlights = buildWeaknessHighlights(result, 3);
  const overview = polishNarration(buildOverview(result) + '.');

  return {
    summary: overview,
    overview,
    useCases,
    strengthHighlights,
    weaknessHighlights,
    finalReveal: finalRevealForTier(tier),
    useCaseNote: bestUsesLine(result) + '.',
    cta: 'Would you rank it the same, or nah?'
  };
}

function finalRevealForTier(tier) {
  return String(tier || '').trim().toLowerCase() === 'slop' ? 'Slop tier.' : `${tier} tier.`;
}

function sectionNarration(result, sectionKey) {
  if (['fats', 'carbs', 'proteins'].includes(sectionKey)) return buildMacroSection(result, sectionKey);
  if (sectionKey === 'vitamins') return buildMicrosSection(result, 'vitamins');
  if (sectionKey === 'minerals') return buildMicrosSection(result, 'minerals');
  if (sectionKey === 'pros') return buildProsConsSection(result, 'pros');
  if (sectionKey === 'cons') return buildProsConsSection(result, 'cons');
  return '';
}

function displayItemsForSection(result, sectionKey) {
  if (sectionKey === 'pros') {
    return (result.contextItems?.pros || []).map(item => ({
      type: 'pro',
      title: item.title,
      explanation: item.explanation,
      impactLevel: item.impactLevel,
      resolvedScoreValue: item.resolvedScoreValue ?? null
    }));
  }
  if (sectionKey === 'cons') {
    return (result.contextItems?.cons || []).map(item => ({
      type: 'con',
      title: item.title,
      explanation: item.explanation,
      impactLevel: item.impactLevel,
      resolvedScoreValue: item.resolvedScoreValue ?? null
    }));
  }
  if (['fats', 'carbs', 'proteins'].includes(sectionKey)) {
    if (macroSectionDisplaysNa(result, sectionKey)) return naMacroDisplayItems(result, sectionKey);
    return completeMacroDisplayItems(result, sectionKey);
  }
  if (sectionKey === 'vitamins' || sectionKey === 'minerals') {
    return outstandingMicronMetrics(result, sectionKey, 4, { speakDailyValue: false });
  }
  return topMetricsForSection(result, sectionKey, 4);
}

function denominatorForMetric(metricKey) {
  if (metricKey === 'essential_amino_acids_score') return 9;
  if (metricKey === 'nonessential_amino_acids_score') return 11;
  return null;
}

function displayDenominatorForMetric(result, metricKey, scored = null) {
  if (scored?.denominator) return scored.denominator;
  if (metricKey === 'essential_amino_acids_score') return result.aminoAcidScoring?.essential?.denominator || 9;
  if (metricKey === 'nonessential_amino_acids_score') return result.aminoAcidScoring?.nonessential?.denominator || 11;
  return null;
}

function proteinQualityMetricSkipped(result, metricKey) {
  const skipped = result.proteinQualityGate?.skippedMetricKeys;
  return Array.isArray(skipped) && skipped.includes(metricKey);
}

function displayValueForSubmacro(result, metricKey) {
  if (proteinQualityMetricSkipped(result, metricKey)) return null;
  if (metricKey === 'essential_amino_acids_score') {
    return toFiniteNumber(result.aminoAcidScoring?.essential?.value)
      ?? toFiniteNumber(result.foodMetrics?.[metricKey]);
  }
  if (metricKey === 'nonessential_amino_acids_score') {
    return toFiniteNumber(result.aminoAcidScoring?.nonessential?.value)
      ?? toFiniteNumber(result.foodMetrics?.[metricKey]);
  }
  return toFiniteNumber(result.foodMetrics?.[metricKey]);
}

function displayDefaultValueForSubmacro(metricKey) {
  if (Object.prototype.hasOwnProperty.call(SUBMACRO_DISPLAY_DEFAULT_VALUES, metricKey)) {
    return SUBMACRO_DISPLAY_DEFAULT_VALUES[metricKey];
  }
  if (/_(g|mg|mcg|kg|percent|score)$/i.test(metricKey) || /glycemic/i.test(metricKey)) return 0;
  return null;
}

function displayRuleForSubmacro(result, sectionKey, metricKey) {
  const rules = result.rulesetConfig?.metricRules || [];
  const rule = rules.find(item => (
    item.metricKey === metricKey
    && item.sectionKey === sectionKey
    && item.scoringMode === 'arrow_bands'
    && item.applicability !== 'not_applicable'
    && Array.isArray(item.bands)
    && item.bands.length
  ));
  if (rule) return rule;
  const polarity = DEFAULT_SUBMACRO_POLARITIES[metricKey] || 'higher_better';
  return {
    metricKey,
    sectionKey,
    scoringMode: 'arrow_bands',
    polarity,
    bands: polarity === 'higher_worse' ? DEFAULT_HIGHER_WORSE_BANDS : DEFAULT_HIGHER_BETTER_BANDS
  };
}

function completeMacroDisplayItems(result, sectionKey) {
  const scoredByKey = new Map(scoredMetricsForSection(result, sectionKey).map(metric => [metric.metricKey, metric]));
  const metricKeys = macroSubmetricKeysForSection(result, sectionKey);

  return metricKeys.map(metricKey => {
    const scored = scoredByKey.get(metricKey);
    const denominator = displayDenominatorForMetric(result, metricKey, scored);
    if (scored) {
      const displayMetric = { ...scored, denominator };
      return {
        ...displayMetric,
        band: canonicalArrowBand(displayMetric),
        denominator,
        displayValue: displayMetricValueText(displayMetric),
        displaySource: 'scored'
      };
    }

    const sourceValue = displayValueForSubmacro(result, metricKey);
    const displayEstimate = sourceValue === null || sourceValue === undefined
      ? proteinDisplayEstimate(result, metricKey)
      : null;
    const usedDisplayEstimate = displayEstimate?.value !== null && displayEstimate?.value !== undefined;
    const usedDisplayDefault = !usedDisplayEstimate && (sourceValue === null || sourceValue === undefined);
    const value = usedDisplayEstimate
      ? displayEstimate.value
      : usedDisplayDefault
        ? displayDefaultValueForSubmacro(metricKey)
        : sourceValue;
    if (value === null || value === undefined) return {
      metricKey,
      text: `${formatMetricKey(metricKey)} at N/A`,
      weightedScore: null,
      scoringMode: 'not_applicable',
      band: null,
      polarity: null,
      dvPercent: null,
      value: null,
      score: null,
      denominator,
      displayValue: 'N/A',
      notApplicableReason: 'no_display_default'
    };
    const rule = displayRuleForSubmacro(result, sectionKey, metricKey);
    const bandResult = scoreFromBands(value, rule.bands || []);
    const row = {
      metricKey,
      text: null,
      weightedScore: null,
      scoringMode: 'display_fallback',
      band: bandResult?.label || null,
      polarity: rule.polarity || DEFAULT_SUBMACRO_POLARITIES[metricKey] || null,
      dvPercent: null,
      value,
      score: bandResult?.score ?? null,
      denominator,
      displaySource: usedDisplayEstimate ? 'protein_display_estimate' : usedDisplayDefault ? 'submacro_display_default' : 'macro_numeric_fallback',
      displayEstimated: usedDisplayEstimate || undefined,
      displayEstimateBasis: usedDisplayEstimate ? displayEstimate.basis : undefined,
      displayDefault: usedDisplayDefault,
      displayDefaultReason: usedDisplayDefault
        ? proteinQualityMetricSkipped(result, metricKey)
          ? 'protein_quality_gate'
          : 'missing_submacro_value'
        : null
    };
    row.band = canonicalArrowBand(row);
    row.text = metricDisplayText(row, { speakDailyValue: false });
    row.displayValue = displayMetricValueText(row);
    return row;
  });
}

function naMacroDisplayItems(result, sectionKey) {
  return macroSubmetricKeysForSection(result, sectionKey).map(metricKey => ({
    metricKey,
    text: `${formatMetricKey(metricKey)} at N/A`,
    weightedScore: null,
    scoringMode: 'not_applicable',
    band: null,
    polarity: null,
    dvPercent: null,
    value: null,
    score: null,
    denominator: denominatorForMetric(metricKey),
    displayValue: 'N/A',
    notApplicableReason: 'main_macro_zero'
  }));
}

function displayPolicyForSection(result, sectionKey) {
  if (sectionKey !== 'proteins') return null;
  const policy = proteinDisplayPolicy(result);
  return {
    policyId: policy.policyId,
    rowCount: policy.rowCount,
    visibleRows: policy.visibleRows.slice(0, policy.rowCount),
    hiddenFallbackMetricKey: policy.hiddenFallbackMetricKey,
    missingValueDisplay: policy.missingValueDisplay,
    showProteinFallbackAsVisibleRow: policy.showProteinFallbackAsVisibleRow,
    proteinQualityGate: result.proteinQualityGate ? {
      eligible: result.proteinQualityGate.eligible,
      proteinG: result.proteinQualityGate.proteinG,
      minimumProteinG: result.proteinQualityGate.minimumProteinG,
      aminoAcidProfileAvailable: result.proteinQualityGate.aminoAcidProfileAvailable
    } : null,
    rules: {
      visibleRowsOnly: true,
      visibleSubmacroRowsDisplayNaOnlyWhenMainMacroNa: true,
      missingSubmacroRowsUseDisplayDefault: true,
      proteinQualityGateSkippedRowsUseDisplayDefault: true,
      doNotDisplayProteinFallbackAsSubmacro: !policy.showProteinFallbackAsVisibleRow
    }
  };
}

function buildSections(result) {
  const order = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals', 'pros', 'cons'];
  return order.map(key => {
    const sourceText = polishNarration(sectionNarration(result, key));
    const subtitleText = polishNarration(subtitleOnlyText(sourceText));
    const section = {
      key,
      title: titleForSection(key),
      narration: polishNarration(audioOnlyText(sourceText)),
      displayItems: displayItemsForSection(result, key),
      macroDisplayValue: ['fats', 'carbs', 'proteins'].includes(key) ? macroDisplayValue(result, key) : null,
      subtitleText,
      timingHint: timingHintForSection(key),
      score: result.sectionScores?.[key] ?? null
    };
    const displayPolicy = displayPolicyForSection(result, key);
    if (displayPolicy) section.displayPolicy = displayPolicy;
    return section;
  });
}

function scriptOverridePath(foodId) {
  const safeFoodId = String(foodId || '').trim();
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(safeFoodId)) return null;
  return path.join(repoRoot, 'production', 'episodes', safeFoodId, 'script-overrides.json');
}

function loadScriptOverride(foodId) {
  const overridePath = scriptOverridePath(foodId);
  if (!overridePath || !fs.existsSync(overridePath)) return null;
  const data = readJson(overridePath);
  if (data.foodId && data.foodId !== foodId) {
    throw new Error(`Script override foodId mismatch: expected ${foodId}, found ${data.foodId}`);
  }
  return {
    data,
    source: relativeRepoPath(overridePath)
  };
}

function normalizeOverrideNarration(value) {
  return polishNarration(audioOnlyText(value));
}

function normalizeOverrideSubtitle(value) {
  return polishNarration(subtitleOnlyText(value));
}

function applyScriptOverrides(script, override) {
  if (!override?.data) return script;
  const data = override.data;

  if (data.sections && typeof data.sections === 'object') {
    for (const section of script.sections) {
      const sectionOverride = data.sections[section.key];
      if (!sectionOverride || typeof sectionOverride !== 'object') continue;
      if (typeof sectionOverride.narration === 'string') {
        section.narration = normalizeOverrideNarration(sectionOverride.narration);
      }
      if (typeof sectionOverride.subtitleText === 'string') {
        section.subtitleText = normalizeOverrideSubtitle(sectionOverride.subtitleText);
      } else if (typeof sectionOverride.narration === 'string') {
        section.subtitleText = normalizeOverrideSubtitle(sectionOverride.narration);
      }
    }
  }

  if (data.closing && typeof data.closing === 'object') {
    const closing = data.closing;
    if (typeof closing.summary === 'string') {
      script.closing.summary = normalizeOverrideNarration(closing.summary);
    }
    if (typeof closing.overview === 'string') {
      script.closing.overview = normalizeOverrideNarration(closing.overview);
    } else if (typeof closing.summary === 'string') {
      script.closing.overview = normalizeOverrideNarration(closing.summary);
    }
    if (typeof closing.useCaseNote === 'string') {
      script.closing.useCaseNote = normalizeOverrideNarration(closing.useCaseNote);
    }
    if (typeof closing.cta === 'string') {
      script.closing.cta = normalizeOverrideNarration(closing.cta);
    }
    if (typeof closing.finalReveal === 'string') {
      script.closing.finalReveal = normalizeOverrideNarration(closing.finalReveal);
    }
  }
  script.closing.finalReveal = finalRevealForTier(script.tier);

  script.scriptOverride = {
    schemaVersion: data.schemaVersion || 'foodranked-script-overrides.v1',
    source: override.source
  };
  return script;
}

function buildNarrationBlocks(script, options = {}) {
  const includeCta = options.includeCta === true;
  const blocks = [
    { kind: 'hook_food', text: `${script.food.name}!` },
    { kind: 'hook_ranked', text: 'Ranked!' },
    ...script.sections.map(section => ({ kind: 'section', sectionKey: section.key, text: section.narration })),
    { kind: 'closing_summary', text: script.closing.summary },
    ...(includeCta && script.closing.cta ? [{ kind: 'cta', text: script.closing.cta }] : []),
    { kind: 'final_reveal', text: script.closing.finalReveal }
  ];

  return blocks.map(block => ({
    ...block,
    text: polishNarration(audioOnlyText(block.text))
  }));
}

function main() {
  const [, , foodPathArg, rulesetPathArg] = process.argv;
  if (!foodPathArg) {
    console.error('Usage: node scripts/foodranked-generate-script.js <food.json> [ruleset.json]');
    process.exit(1);
  }

  const foodPath = path.resolve(foodPathArg);
  const food = readJson(foodPath);
  const rulesetPath = rulesetPathArg ? path.resolve(rulesetPathArg) : inferRulesetPath(food);
  const result = scoreFood(foodPath, rulesetPath);
  result.foodMetrics = food.metrics || {};
  result.metricProvenance = food.metricProvenance || {};
  result.rulesetConfig = readJson(rulesetPath);
  const sections = buildSections(result);

  const script = {
    status: 'ok',
    schemaVersion: 'foodranked-script.v2',
    narrationFormat: 'elevenlabs-blocks-v1',
    food: {
      ...result.food,
      basis: food.basis || null,
      identity: food.identity || null,
      scoreReadiness: food.scoreReadiness || null,
      sourceNotes: food.sourceNotes || []
    },
    ruleset: result.ruleset,
    header: result.header,
    hook: polishNarration(buildHook(result)),
    sections,
    closing: buildClosing(result),
    tier: result.tier,
    overallScore: result.overallScore,
    overallScoreExact: result.overallScoreExact,
    calibratedOverallScore: result.calibratedOverallScore ?? null,
    calibratedOverallScoreExact: result.calibratedOverallScoreExact ?? null,
    anomalyAdjustedScore: result.anomalyAdjustedScore ?? null,
    anomalyAdjustedScoreExact: result.anomalyAdjustedScoreExact ?? null,
    rankingScore: result.rankingScore ?? null,
    rankingScoreExact: result.rankingScoreExact ?? null,
    scoreAdjustmentTotal: result.scoreAdjustmentTotal ?? 0,
    scoreAdjustments: result.scoreAdjustments || [],
    baseOverallScore: result.baseOverallScore ?? null,
    baseOverallScoreExact: result.baseOverallScoreExact ?? null,
    sectionOrder: sections.map(section => section.key),
    narrationBlocks: [],
    explanation: result.explanation
  };

  applyScriptOverrides(script, loadScriptOverride(result.food.id));

  script.narrationBlocks = buildNarrationBlocks(script, { includeCta: false });

  console.log(JSON.stringify(script, null, 2));
}

main();
