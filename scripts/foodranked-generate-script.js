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

const corePhrases = readJson(path.join(phraseBanksDir, 'narration-core.json'));
const categoryContext = readJson(path.join(phraseBanksDir, 'category-context.json'));
const PROTEIN_SUBMACRO_KEYS = [
  'essential_amino_acids_score',
  'bioavailability_percent',
  'nonessential_amino_acids_score',
  'collagen_g'
];
const PROTEIN_QUALITY_METRIC_KEYS = new Set([
  'essential_amino_acids_score',
  'bioavailability_percent',
  'nonessential_amino_acids_score'
]);

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
  if (metricKey === 'protein_g_fallback') return 'protein amount';
  return metricKey
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
    return `${formatMetricKey(metric.metricKey)} at ${metricValueText(metric)}`;
  }
  if (metric.band) return `${formatMetricKey(metric.metricKey)} at ${metric.value}`;
  return formatMetricKey(metric.metricKey);
}

function metricValueText(metric) {
  if (!metric) return null;
  if (metric.scoringMode === 'dv_points' && metric.dvPercent != null) return `${metric.dvPercent}% DV`;
  if (metric.value === null || metric.value === undefined) return null;

  const key = String(metric.metricKey || '');
  if (key === 'protein_g_fallback' || key.endsWith('_g')) return `${metric.value}g`;
  if (key.endsWith('_mg')) return `${metric.value}mg`;
  if (key.endsWith('_mcg')) return `${metric.value}mcg`;
  if (key.endsWith('_kg')) return `${metric.value}kg`;
  if (key.endsWith('_percent')) return `${metric.value}%`;
  if (key === 'essential_amino_acids_score') return `${metric.value}/9`;
  if (key === 'nonessential_amino_acids_score') return `${metric.value}/11`;
  if (key.endsWith('_score')) return `${metric.value}/10`;
  if (/glycemic/i.test(key)) return `${metric.value} GI`;
  return String(metric.value);
}

function metricValuePhrase(metric) {
  const value = metricValueText(metric);
  if (!value) return formatMetricKey(metric?.metricKey);
  return `${formatMetricKey(metric.metricKey)} is ${value}`;
}

function rawProteinSubmetrics(result, limit = 4) {
  const rawMetrics = result.foodMetrics || {};
  const scoredMetrics = new Map((result.metricBreakdown || []).map(metric => [metric.metricKey, metric]));
  return PROTEIN_SUBMACRO_KEYS
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
      value: metric.value ?? null
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
  if (band?.color === 'green') return 1000 + (band.level * 100) + Math.max(0, metric.weightedScore ?? 0);
  if (metric.scoringMode === 'dv_points') return (metric.weightedScore ?? 0) + ((metric.dvPercent ?? 0) / 100);
  if ((metric.weightedScore ?? 0) > 0) return metric.weightedScore;
  return -Infinity;
}

function weakMetricRank(metric) {
  if (!metricHasDefensibleValue(metric)) return -Infinity;
  const band = arrowBand(metric);
  if (band?.color === 'red') return 1000 + (band.level * 100) + Math.abs(metric.weightedScore ?? 0);
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

function outstandingMacroMetrics(result, sectionKey, limit = 4) {
  if (sectionKey === 'proteins') {
    return topMetricsForSection(result, sectionKey, limit);
  }

  const metrics = scoredMetricsForSection(result, sectionKey);
  const best = strongestPositiveMetric(metrics);
  const weakest = weakestOutstandingMetric(metrics, best);
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
  const weakest = weakestOutstandingMetric(metrics, best);
  const remaining = [...metrics].sort((a, b) => Math.abs(b.weightedScore ?? 0) - Math.abs(a.weightedScore ?? 0));
  return uniqueMetrics([best, weakest, ...remaining], limit);
}

function headerMacro(result, key) {
  const v = result.header?.[key];
  if (v === null || v === undefined) return null;
  return Number(v);
}

function macroLine(result, key) {
  const map = {
    fats: ['fat_g', 'fat'],
    carbs: ['carb_g', 'carbs'],
    proteins: ['protein_g', 'protein']
  };
  const [headerKey, label] = map[key] || [];
  const value = headerMacro(result, headerKey);
  if (value === null || value === undefined) return null;
  return `${value}g of ${label}`;
}

function joinShort(parts) {
  const valid = parts.filter(Boolean).map(part => String(part).trim()).filter(Boolean);
  return valid.join('. ') + (valid.length ? '.' : '');
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
    const polyunsaturatedFat = metrics.find(metric => metric.metricKey === 'polyunsaturated_fat_g' && metric.weightedScore > 0);

    if (foodType === 'meats') {
      if (saturatedFat && (saturatedFat.value || 0) >= 8) return `${metricValuePhrase(saturatedFat)}, a major pressure point`;
      if (omega3 && (omega3.value || 0) >= 1000 && (!saturatedFat || (saturatedFat.value || 0) < 4)) {
        return `${metricValuePhrase(omega3)}, exactly the kind of fat support you want from a meat`;
      }
      if (saturatedFat && sectionScore !== null && sectionScore < 65) return `${metricValuePhrase(saturatedFat)}, a major pressure point`;
      if (omega3 && (omega3.value || 0) >= 300) return `${metricValuePhrase(omega3)}, exactly the kind of fat support you want from a meat`;
    }

    if (foodType === 'oils-and-fats') {
      if (saturatedFat && (saturatedFat.value || 0) >= 20) return `${metricValuePhrase(saturatedFat)}, a major pressure point`;
      if (polyunsaturatedFat && (!saturatedFat || (saturatedFat.value || 0) <= 15)) return `${metricValuePhrase(polyunsaturatedFat)}, doing most of the work here`;
    }

    if (saturatedFat && sectionScore !== null && sectionScore < 60) return `${metricValuePhrase(saturatedFat)}, a major pressure point`;
    if (omega3) return foodType === 'meats'
      ? `${metricValuePhrase(omega3)}, exactly the kind of fat support you want from a meat`
      : `${metricValuePhrase(omega3)}, doing a lot of the work here`;
    if (saturatedFat) return `${metricValuePhrase(saturatedFat)}, a major pressure point`;
    if (cholesterol && (cholesterol.value || 0) >= 100) return `${metricValuePhrase(cholesterol)}, adding to the tradeoff`;
    if (polyunsaturatedFat) return `${metricValuePhrase(polyunsaturatedFat)}, one of the better parts of the profile`;
  }

  if (sectionKey === 'carbs') {
    const fibre = metrics.find(metric => metric.metricKey === 'fibre_g' && (metric.value || 0) >= 3);
    const glycemicIndex = metrics.find(metric => metric.metricKey === 'glycemic_index' && (metric.value || 0) >= 55);
    const sugar = metrics.find(metric => metric.metricKey === 'sugar_g' && (metric.value || 0) >= 8);
    const starch = metrics.find(metric => metric.metricKey === 'starch_g' && (metric.value || 0) > 0);
    if (fibre) return `${metricValuePhrase(fibre)}, doing a lot of the work here`;
    if (glycemicIndex) return `${metricValuePhrase(glycemicIndex)}, where this starts to get messy`;
    if (sugar) return `${metricValuePhrase(sugar)}, and the load matters more than you would want`;
    if (starch) return `${metricValuePhrase(starch)}, doing most of the heavy lifting here`;
  }

  if (sectionKey === 'proteins') {
    const proteinMetrics = topMetricsForSection(result, sectionKey, 4);
    const proteinAmount = proteinMetrics.find(metric => metric.metricKey === 'protein_g_fallback');
    const bioavailability = proteinMetrics.find(metric => metric.metricKey === 'bioavailability_percent');
    const essentialAmino = proteinMetrics.find(metric => metric.metricKey === 'essential_amino_acids_score');
    const nonessentialAmino = proteinMetrics.find(metric => metric.metricKey === 'nonessential_amino_acids_score');
    const collagen = proteinMetrics.find(metric => metric.metricKey === 'collagen_g');
    if (proteinAmount) return `${metricValuePhrase(proteinAmount)}, so the protein score is about useful amount rather than amino acid presence`;
    if (essentialAmino && bioavailability) {
      return `${metricValuePhrase(essentialAmino)}, with ${metricValueText(bioavailability)} bioavailability`;
    }
    if (bioavailability) return `${metricValuePhrase(bioavailability)}, one of the best parts of the protein story`;
    if (essentialAmino) return `${metricValuePhrase(essentialAmino)}, one of the better parts here`;
    if (nonessentialAmino) return `${metricValuePhrase(nonessentialAmino)}, adding supporting amino acid quality`;
    if (collagen) return `${metricValuePhrase(collagen)}, a specific protein-side detail`;

    const scoredBioavailability = metrics.find(metric => metric.metricKey === 'bioavailability_percent' && metric.weightedScore > 0);
    const scoredEssentialAmino = metrics.find(metric => metric.metricKey === 'essential_amino_acids_score' && metric.weightedScore > 0);
    if (scoredBioavailability && scoredEssentialAmino) return `${metricValuePhrase(scoredBioavailability)}, and amino acid quality is strong`;
    if (scoredBioavailability) return `${metricValuePhrase(scoredBioavailability)}, one of the best parts of the protein story`;
    if (scoredEssentialAmino) return `${metricValuePhrase(scoredEssentialAmino)}, one of the better parts here`;
  }

  const names = metrics.map(m => formatMetricKey(m.metricKey));
  const lead = metricValuePhrase(metrics[0]);
  if (!isPositive) return `${lead}, where things start to fall off`;
  if (names.length === 1) return `${lead}, doing most of the work`;
  if (names.length === 2) return `${lead}, while ${names[1]} also matters here`;
  return `${lead}, with ${names[1]} and ${names[2]} doing more of the work`;
}

function foodTypeLabel(foodType) {
  return String(foodType || '')
    .replace(/-/g, ' ')
    .replace(/^oils and fats$/i, 'oils and fats');
}

function bestMetricContext(metric, sectionKey) {
  const key = metric?.metricKey;
  const contexts = {
    polyunsaturated_fat_g: 'helping with cell structure and healthy signalling',
    omega3_mg: 'supporting a more useful fat profile',
    fibre_g: 'helping with digestion and steadier meals',
    essential_amino_acids_score: 'making the protein useful for repair and maintenance',
    bioavailability_percent: 'helping more of that protein count',
    vitamin_b12_dv: 'useful for nerve and blood-cell support',
    vitamin_d_dv: 'useful for bone and immune support',
    vitamin_c_dv: 'useful for collagen formation and antioxidant support',
    vitamin_a_dv: 'useful for vision and immune support',
    zinc_dv: 'useful for immune support',
    iron_dv: 'useful for oxygen transport',
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

function categoryWeakContext(foodType, sectionKey, metric = null) {
  const type = foodTypeLabel(foodType);
  if (sectionKey === 'fats') {
    if (foodType === 'meats') return 'and for meats, fat quality is a major tradeoff';
    if (foodType === 'oils-and-fats') return 'and for oils and fats, that matters a lot';
    if (foodType === 'nuts' || foodType === 'seeds') return `and for ${type}, fat quality has to justify the calories`;
    return `a weak mark for ${type || 'this category'}`;
  }
  if (sectionKey === 'carbs') {
    if (['grains', 'fruits', 'legumes', 'tubers'].includes(foodType)) return `a meaningful miss for ${type}`;
    return `a small miss for ${type || 'this category'}`;
  }
  if (sectionKey === 'proteins') {
    if (foodType === 'meats') return 'so for meats, it is not bringing much connective-tissue protein';
    return `a weak mark for ${type || 'this category'}`;
  }
  if (sectionKey === 'vitamins') {
    if (foodType === 'meats') return 'a small miss for meats';
    return `a weak mark for ${type || 'this category'}`;
  }
  if (sectionKey === 'minerals') {
    if (foodType === 'meats') return 'a weak mark for meats';
    return `a weak mark for ${type || 'this category'}`;
  }
  return `a weak mark for ${type || 'this category'}`;
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

function proteinFallbackContext(result, score) {
  const foodType = result.food.foodType;
  if (score >= 60) return 'that amount is useful enough to count';
  if (foodType === 'meats') return 'for meats, that is lower than you want';
  if (foodType === 'dairy') return 'a modest protein point, but not the whole argument';
  if (foodType === 'seeds' || foodType === 'nuts') return 'protein is support here, not the main reason to pick it';
  if (foodType === 'grains') return 'not enough to make protein the main story';
  if (foodType === 'tubers') return 'so protein is barely part of the case';
  return 'not enough to make protein a serious strength';
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
    const bioavailability = byKey('bioavailability_percent');
    const collagen = byKey('collagen_g');
    if (proteinAmount) {
      const score = result.sectionScores?.proteins ?? null;
      return joinShort([
        proteinFallbackContext(result, score),
        collagen ? weakMetricLine(collagen, result, sectionKey) : null
      ]).replace(/[.]$/g, '');
    }
    const best = essentialAmino && bioavailability
      ? `${metricValuePhrase(essentialAmino)}, with ${metricValueText(bioavailability)} bioavailability, making the protein useful for repair and maintenance`
      : bestMetricLine(essentialAmino || bioavailability || metrics[0], sectionKey);
    return joinShort([
      best,
      collagen ? weakMetricLine(collagen, result, sectionKey) : null
    ]).replace(/[.]$/g, '');
  }

  const best = strongestPositiveMetric(metrics);
  const weakest = weakestOutstandingMetric(metrics, best);
  return joinShort([
    bestMetricLine(best, sectionKey),
    weakMetricLine(weakest, result, sectionKey)
  ]).replace(/[.]$/g, '');
}

function buildHook(result) {
  return `${result.food.name} ranked.`;
}

function buildIntro() {
  return '';
}

function buildMacroSection(result, key) {
  const macro = macroLine(result, key);
  const outstanding = outstandingMacroLine(result, key);
  const foodType = result.food.foodType;

  const categoryLines = {
    meats: {
      fats: 'for meats, fat quality matters a lot once the protein is already there',
      carbs: 'in this category, carbs barely matter',
      proteins: 'strong protein is expected here, so the rest of the profile decides how high it climbs'
    },
    grains: {
      fats: 'fat is basically not the story here',
      carbs: 'for grains, the carb quality matters much more than the raw number',
      proteins: 'protein helps, but not enough if the carb side is weak'
    },
    fruits: {
      carbs: 'for fruit, the real question is whether the sweetness stays under control'
    },
    vegetables: {
      carbs: 'for vegetables, low downside is useful, but there still needs to be real payoff',
      proteins: 'protein is not the main pitch here, but extra support still matters'
    },
    legumes: {
      carbs: 'for legumes, the carbs look much better when fibre and protein are both backing them up',
      proteins: 'protein support is a big part of what makes legumes worth it'
    },
    dairy: {
      fats: 'for dairy, the fat side can either add richness or drag the whole thing down',
      proteins: 'useful protein can rescue a lot of weaker traits here'
    },
    'oils-and-fats': {
      fats: 'for this category, the real question is fat quality',
      carbs: 'not relevant here',
      proteins: 'also not relevant here'
    },
    nuts: {
      fats: 'for nuts, fat quality has to justify the calorie density',
      proteins: 'protein is support here, not the whole argument'
    },
    seeds: {
      fats: 'for seeds, the fat profile is one of the biggest reasons they earn their place',
      proteins: 'protein is a bonus, but not enough by itself'
    },
    tubers: {
      carbs: 'for tubers, the carb side decides whether the food feels stable or flimsy',
      proteins: 'protein is usually limited here, so the other sections have to carry more'
    },
    misc: {
      carbs: 'and that is basically the whole nutrition story',
      proteins: 'no real protein story here'
    }
  };

  const categoryLine = categoryLines[foodType]?.[key] || sectionContextLine(foodType, `${result.food.id}:${key}`);
  const useCategoryLine = !outstanding || /^no defensible /.test(outstanding);
  return joinShort([macro, outstanding, useCategoryLine ? categoryLine : null]);
}

function buildMicrosSection(result, sectionKey) {
  const top = outstandingMicronMetrics(result, sectionKey, 4, { speakDailyValue: true });
  if (!top.length) {
    if (result.food.foodType === 'misc') {
      return sectionKey === 'vitamins' ? 'no real vitamin story here.' : 'no real mineral story here.';
    }
    return sectionKey === 'vitamins'
      ? `${pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:micro-lackluster`)}.`
      : 'minerals are basically not adding much here.';
  }

  if (result.food.foodType === 'misc') {
    return sectionKey === 'vitamins' ? 'no real vitamin story here.' : 'no real mineral story here.';
  }

  const best = strongestPositiveMetric(top) || top[0];
  const weakest = weakestOutstandingMetric(top, best);
  return joinShort([
    bestMetricLine(best, sectionKey),
    weakMetricLine(weakest, result, sectionKey)
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
    [/^Adds extra cardiovascular and satiety context beyond the base nutrient display$/i, 'that helps with fullness and overall payoff'],
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
    .replace(/polyunsaturated fat/i, 'fat quality')
    .replace(/protein g fallback/i, 'protein')
    .replace(/essential amino acids score/i, 'protein quality')
    .replace(/bioavailability/i, 'protein quality');
}

function positiveSectionHighlight(result, sectionKey) {
  const score = result.sectionScores?.[sectionKey] ?? null;
  const metrics = topMetricsForSection(result, sectionKey, 4, { speakDailyValue: false });
  if (score === null || !metrics.length) return null;

  if (sectionKey === 'proteins') {
    const proteinGrams = headerMacro(result, 'protein_g') ?? 0;
    const hasQualitySignal = metrics.some(metric => ['bioavailability_percent', 'essential_amino_acids_score'].includes(metric.metricKey));
    if (hasQualitySignal || proteinGrams >= 12 || score >= 35) return 'protein';
    return null;
  }

  if (sectionKey === 'fats' && score >= 55) {
    if (result.food.foodType === 'oils-and-fats') return 'fat quality';
    if (metrics.find(metric => metric.metricKey === 'omega3_mg' && (metric.value || 0) > 0)) return 'omega 3';
    if (metrics.find(metric => metric.metricKey === 'polyunsaturated_fat_g' && (metric.value || 0) > 0)) return 'fat quality';
  }

  if (sectionKey === 'carbs' && score >= 55) {
    if (metrics.find(metric => metric.metricKey === 'fibre_g' && (metric.value || 0) >= 3)) return 'fibre';
    return 'carb quality';
  }

  if (sectionKey === 'vitamins' && score >= 15) return shortMetricLabel(metrics[0].metricKey);
  if (sectionKey === 'minerals' && score >= 15) return shortMetricLabel(metrics[0].metricKey);

  return null;
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

function buildOverview(result) {
  const nutritionStrengths = [
    { key: 'fats', phrase: positiveSectionHighlight(result, 'fats'), score: result.sectionScores?.fats ?? -1 },
    { key: 'proteins', phrase: positiveSectionHighlight(result, 'proteins'), score: result.sectionScores?.proteins ?? -1 },
    { key: 'carbs', phrase: positiveSectionHighlight(result, 'carbs'), score: result.sectionScores?.carbs ?? -1 },
    { key: 'vitamins', phrase: positiveSectionHighlight(result, 'vitamins'), score: result.sectionScores?.vitamins ?? -1 },
    { key: 'minerals', phrase: positiveSectionHighlight(result, 'minerals'), score: result.sectionScores?.minerals ?? -1 }
  ]
    .filter(item => item.phrase)
    .map(item => item.phrase);

  const strengths = uniqueHighlights([
    ...nutritionStrengths,
    ...(result.contextItems?.pros || []).map(shortContextTitle)
  ], 2);

  const weaknesses = uniqueHighlights([
    ...(result.contextItems?.cons || []).map(shortContextTitle)
  ], 2);

  if (strengths.length && weaknesses.length) {
    return `big strengths are ${naturalList(strengths)}, but the biggest weaknesses are ${naturalList(weaknesses)}`;
  }
  if (strengths.length) return `big strengths here are ${naturalList(strengths)}`;
  if (weaknesses.length) return `the biggest weaknesses are ${naturalList(weaknesses)}`;
  return `${result.food.name} is pretty mixed overall`;
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
    dairy: 'Best when the protein payoff or fermentation angle outweighs the fat and sodium tradeoffs',
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
    legumes: 'Best only when convenience outweighs the weaker fibre or protein payoff',
    dairy: 'Best only when the taste or format matters more than getting the strongest dairy profile',
    nuts: 'Best only in small amounts when the calories stay under control',
    seeds: 'Best only as a supporting add-on rather than something to lean on heavily',
    tubers: 'Best only when you want easy carbs and can accept the missing upside',
    'oils-and-fats': 'Best only in small amounts when the cooking job matters more than the nutrition case',
    misc: 'Best treated as an occasional context item, not a nutritional base'
  };
  if (tier === 'D' || tier === 'C') return weakByType[type] || 'Best only in narrow use cases where its limitations matter less';
  return strongByType[type] || 'Best when its strengths actually match the job you want it to do';
}

function buildClosing(result) {
  const tier = result.tier;
  const overview = polishNarration(buildOverview(result) + '.');

  return {
    summary: overview,
    overview,
    finalReveal: `${tier} tier.`,
    useCaseNote: bestUsesLine(result) + '.',
    cta: 'Would you rank it the same, or nah?'
  };
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
    return outstandingMacroMetrics(result, sectionKey, 4);
  }
  if (sectionKey === 'vitamins' || sectionKey === 'minerals') {
    return outstandingMicronMetrics(result, sectionKey, 4, { speakDailyValue: false });
  }
  return topMetricsForSection(result, sectionKey, 4);
}

function buildSections(result) {
  const order = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals', 'pros', 'cons'];
  return order.map(key => {
    const sourceText = polishNarration(sectionNarration(result, key));
    const subtitleText = polishNarration(subtitleOnlyText(sourceText));
    return {
      key,
      title: titleForSection(key),
      narration: polishNarration(audioOnlyText(sourceText)),
      displayItems: displayItemsForSection(result, key),
      subtitleText,
      timingHint: timingHintForSection(key),
      score: result.sectionScores?.[key] ?? null
    };
  });
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
    baseOverallScore: result.baseOverallScore ?? null,
    baseOverallScoreExact: result.baseOverallScoreExact ?? null,
    sectionOrder: sections.map(section => section.key),
    narrationBlocks: [],
    explanation: result.explanation
  };

  script.narrationBlocks = buildNarrationBlocks(script, { includeCta: false });

  console.log(JSON.stringify(script, null, 2));
}

main();
