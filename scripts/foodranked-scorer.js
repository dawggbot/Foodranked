#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(p), 'utf8'));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreFromBands(value, bands) {
  if (value === null || value === undefined || !Array.isArray(bands) || bands.length === 0) {
    return null;
  }

  for (const band of bands) {
    const hasMin = Object.prototype.hasOwnProperty.call(band, 'min');
    const hasMax = Object.prototype.hasOwnProperty.call(band, 'max');
    const minOk = !hasMin || value >= band.min;
    const maxOk = !hasMax || value <= band.max;
    if (minOk && maxOk) {
      return { label: band.label, score: band.score };
    }
  }

  return null;
}

function normalizeWeightedScores(items) {
  if (!items.length) return null;
  const raw = items.reduce((sum, i) => sum + i.weightedScore, 0);
  const max = items.reduce((sum, i) => sum + 3 * i.weight, 0);
  if (max === 0) return null;
  const normalized = ((raw + max) / (2 * max)) * 100;
  return clamp(normalized, 0, 100);
}

function normalizeContextSection(items, kind) {
  const filtered = items.filter(i => i.kind === kind);
  const raw = filtered.reduce((sum, i) => sum + i.scoreValue, 0);
  const max = 6; // up to 3 items × 2
  const normalized = ((raw + max) / (2 * max)) * 100;
  return clamp(normalized, 0, 100);
}

function metricBandFallback(metricKey, value, polarity) {
  if (value === null || value === undefined) return null;

  const dvMetric = metricKey.endsWith('_dv');
  if (dvMetric) {
    if (value <= 5) return { label: '↓↓↓', score: -3 };
    if (value <= 10) return { label: '↓↓', score: -2 };
    if (value <= 20) return { label: '↓', score: -1 };
    if (value <= 40) return { label: '↑', score: 1 };
    if (value <= 80) return { label: '↑↑', score: 2 };
    return { label: '↑↑↑', score: 3 };
  }

  if (polarity === 'higher_better') {
    if (value <= 1) return { label: '↓↓↓', score: -3 };
    if (value <= 2) return { label: '↓↓', score: -2 };
    if (value <= 3) return { label: '↓', score: -1 };
    if (value <= 4) return { label: '↑', score: 1 };
    if (value <= 5) return { label: '↑↑', score: 2 };
    return { label: '↑↑↑', score: 3 };
  }

  if (polarity === 'higher_worse') {
    if (value <= 1) return { label: '↓↓↓', score: 3 };
    if (value <= 2) return { label: '↓↓', score: 2 };
    if (value <= 3) return { label: '↓', score: 1 };
    if (value <= 4) return { label: '↑', score: -1 };
    if (value <= 5) return { label: '↑↑', score: -2 };
    return { label: '↑↑↑', score: -3 };
  }

  return null;
}

function getTier(score, thresholds) {
  for (const t of thresholds || []) {
    if (score >= t.min && score <= t.max) return t.tier;
  }
  return 'UNKNOWN';
}

function buildSummary(sectionScores, tier) {
  const entries = Object.entries(sectionScores)
    .filter(([, v]) => typeof v === 'number')
    .sort((a, b) => b[1] - a[1]);

  const best = entries[0]?.[0] || 'strengths';
  const worst = entries[entries.length - 1]?.[0] || 'weaknesses';
  return `${capitalize(best)} are carrying this food most, while ${worst} are the biggest drag. It lands in ${tier} tier.`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function main() {
  const [, , foodPath, rulesetPath] = process.argv;
  if (!foodPath || !rulesetPath) {
    console.error('Usage: node scripts/foodranked-scorer.js <food.json> <ruleset.json>');
    process.exit(1);
  }

  const food = readJson(foodPath);
  const ruleset = readJson(rulesetPath);

  const sectionMetricScores = {
    fats: [],
    carbs: [],
    proteins: [],
    vitamins: [],
    minerals: []
  };

  const missingRequired = [];
  const metricBreakdown = [];

  for (const rule of ruleset.metricRules || []) {
    if (rule.scoringRole !== 'scored') continue;
    if (rule.applicability === 'not_applicable') continue;

    const value = food.metrics?.[rule.metricKey];

    if ((value === null || value === undefined) && rule.applicability === 'required') {
      missingRequired.push(rule.metricKey);
      continue;
    }

    if (value === null || value === undefined) continue;

    const bandResult = scoreFromBands(value, rule.bands) || metricBandFallback(rule.metricKey, value, rule.polarity);
    if (!bandResult) continue;

    const weightedScore = bandResult.score * (rule.weight || 1);
    const row = {
      metricKey: rule.metricKey,
      sectionKey: rule.sectionKey,
      value,
      band: bandResult.label,
      score: bandResult.score,
      weight: rule.weight || 1,
      weightedScore
    };

    metricBreakdown.push(row);
    if (sectionMetricScores[rule.sectionKey]) {
      sectionMetricScores[rule.sectionKey].push(row);
    }
  }

  if (missingRequired.length) {
    console.error(JSON.stringify({
      status: 'incomplete',
      missingRequired
    }, null, 2));
    process.exit(2);
  }

  const contextItems = {
    pros: (food.contextItems?.pros || []).map(i => ({ ...i, kind: 'pros' })),
    cons: (food.contextItems?.cons || []).map(i => ({ ...i, kind: 'cons' }))
  };

  const sectionScores = {
    fats: normalizeWeightedScores(sectionMetricScores.fats),
    carbs: normalizeWeightedScores(sectionMetricScores.carbs),
    proteins: normalizeWeightedScores(sectionMetricScores.proteins),
    vitamins: normalizeWeightedScores(sectionMetricScores.vitamins),
    minerals: normalizeWeightedScores(sectionMetricScores.minerals),
    pros: normalizeContextSection(contextItems.pros, 'pros'),
    cons: normalizeContextSection(contextItems.cons, 'cons')
  };

  const weights = ruleset.sectionWeights || {};
  let overallScore = 0;
  for (const [section, score] of Object.entries(sectionScores)) {
    if (typeof score === 'number' && typeof weights[section] === 'number') {
      overallScore += score * weights[section];
    }
  }
  overallScore = Math.round(overallScore);

  const tier = getTier(overallScore, ruleset.tierThresholds);
  const summary = buildSummary(sectionScores, tier);

  const output = {
    status: 'ok',
    food: {
      id: food.id,
      name: food.name,
      foodType: food.foodType
    },
    ruleset: {
      id: ruleset.id,
      version: ruleset.version
    },
    header: food.header,
    sectionScores: Object.fromEntries(
      Object.entries(sectionScores).map(([k, v]) => [k, v === null ? null : Number(v.toFixed(1))])
    ),
    overallScore,
    tier,
    summary,
    contextItems: food.contextItems || { pros: [], cons: [] },
    metricBreakdown
  };

  console.log(JSON.stringify(output, null, 2));
}

main();
