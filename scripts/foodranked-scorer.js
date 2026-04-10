#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(p), 'utf8'));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function round1(n) {
  return Number(n.toFixed(1));
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

function metricBandFallback(value, polarity) {
  if (value === null || value === undefined) return null;
  if (polarity === 'higher_better') {
    if (value <= 1) return { label: '3_red', score: 0 };
    if (value <= 2) return { label: '2_red', score: 20 };
    if (value <= 3) return { label: '1_red', score: 40 };
    if (value <= 4) return { label: '1_green', score: 60 };
    if (value <= 5) return { label: '2_green', score: 80 };
    return { label: '3_green', score: 100 };
  }
  if (polarity === 'higher_worse') {
    if (value <= 1) return { label: '3_green', score: 100 };
    if (value <= 2) return { label: '2_green', score: 80 };
    if (value <= 3) return { label: '1_green', score: 60 };
    if (value <= 4) return { label: '1_red', score: 40 };
    if (value <= 5) return { label: '2_red', score: 20 };
    return { label: '3_red', score: 0 };
  }
  return null;
}

function dvPoints(dvPercent) {
  return Math.min(Math.floor(dvPercent / 10), 10);
}

function resolveContextScoreValue(item, scoreMap) {
  const impactLevel = String(item.impactLevel || '').toLowerCase();
  const side = item.side || item.kind || null;
  if (side && scoreMap?.[`${impactLevel}_${side}`] !== undefined) return scoreMap[`${impactLevel}_${side}`];
  if (item.scoreKey && scoreMap?.[item.scoreKey] !== undefined) return scoreMap[item.scoreKey];
  if (typeof item.scoreValue === 'number') return item.scoreValue;
  return 0;
}

function weightedAverage(items, valueKey = 'score') {
  if (!items.length) return null;
  const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  if (!totalWeight) return null;
  const weightedSum = items.reduce((sum, item) => sum + (item[valueKey] * (item.weight ?? 1)), 0);
  return clamp(weightedSum / totalWeight, 0, 100);
}

function computeContextSections(contextItems, contextRules, food) {
  const scoreMap = contextRules?.scoreMap || {};
  const processingPenaltyKeys = new Set(contextRules?.processingPenaltyKeys || []);
  const processingPenalty = Number(food?.processingPenalty || 0);

  const pros = (contextItems?.pros || []).map(item => ({
    ...item,
    side: 'pro',
    resolvedScoreValue: resolveContextScoreValue({ ...item, side: 'pro' }, scoreMap)
  }));
  const cons = (contextItems?.cons || []).map(item => {
    const baseScore = resolveContextScoreValue({ ...item, side: 'con' }, scoreMap);
    const extraPenalty = processingPenaltyKeys.has(item.itemKey) ? processingPenalty : 0;
    return {
      ...item,
      side: 'con',
      resolvedScoreValue: clamp(baseScore + extraPenalty, 0, 100)
    };
  });

  const prosScore = pros.length
    ? clamp(pros.reduce((sum, item) => sum + item.resolvedScoreValue, 0) / pros.length, 0, 100)
    : null;

  const consSeverity = cons.length
    ? clamp(cons.reduce((sum, item) => sum + item.resolvedScoreValue, 0) / cons.length, 0, 100)
    : null;

  const consScore = consSeverity === null ? null : clamp(100 - consSeverity, 0, 100);

  return {
    pros,
    cons,
    prosScore,
    consSeverity,
    consScore
  };
}

function getTier(score, thresholds) {
  for (const t of thresholds || []) {
    if (score >= t.min && score <= t.max) return t.tier;
  }
  return 'UNKNOWN';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function prettySectionName(section) {
  const map = {
    fats: 'fats',
    carbs: 'carbs',
    proteins: 'proteins',
    vitamins: 'vitamins',
    minerals: 'minerals',
    pros: 'pros',
    cons: 'cons'
  };
  return map[section] || section;
}

function buildSummary(sectionScores, tier) {
  const entries = Object.entries(sectionScores)
    .filter(([, score]) => typeof score === 'number')
    .sort((a, b) => b[1] - a[1]);

  const best = entries[0];
  const worst = entries[entries.length - 1];
  if (!best || !worst) return `This food lands in ${tier} tier.`;
  return `${capitalize(prettySectionName(best[0]))} are carrying this food most, while ${prettySectionName(worst[0])} are holding it back most. It lands in ${tier} tier.`;
}

function buildTierReason(tier, overallScore, sectionScores) {
  const scoreList = Object.entries(sectionScores)
    .filter(([, score]) => typeof score === 'number')
    .map(([section, score]) => `${prettySectionName(section)} ${round1(score)}`)
    .join(', ');
  return `This food lands in ${tier} tier with an overall score of ${overallScore}. Section scores: ${scoreList}.`;
}

function pickSectionExtremes(sectionScores) {
  const entries = Object.entries(sectionScores)
    .filter(([, score]) => typeof score === 'number')
    .map(([section, score]) => ({ section, score }))
    .sort((a, b) => b.score - a.score);
  return {
    strongest: entries[0] || null,
    weakest: entries[entries.length - 1] || null
  };
}

function buildNarrationNotes(extremes, tier) {
  const notes = [];
  if (extremes.strongest) notes.push(`Strongest section: ${capitalize(prettySectionName(extremes.strongest.section))}.`);
  if (extremes.weakest) notes.push(`Weakest section: ${capitalize(prettySectionName(extremes.weakest.section))}.`);
  notes.push(`Final verdict: ${tier} tier.`);
  return notes;
}

function trimContextItems(items, side, limit = 3) {
  return (items || [])
    .map(item => ({
      title: item.title,
      explanation: item.explanation,
      impactLevel: item.impactLevel,
      side,
      resolvedScoreValue: item.resolvedScoreValue ?? 0
    }))
    .sort((a, b) => Math.abs(b.resolvedScoreValue) - Math.abs(a.resolvedScoreValue))
    .slice(0, limit);
}

function validateExactContextCount(food, ruleset) {
  const requiredPros = ruleset.contextRules?.requiredPros ?? 3;
  const requiredCons = ruleset.contextRules?.requiredCons ?? 3;
  const pros = food.contextItems?.pros || [];
  const cons = food.contextItems?.cons || [];
  const errors = [];
  if (pros.length !== requiredPros) errors.push(`Expected exactly ${requiredPros} pros, got ${pros.length}`);
  if (cons.length !== requiredCons) errors.push(`Expected exactly ${requiredCons} cons, got ${cons.length}`);
  return errors;
}

function maybeApplyProteinFallback(food, ruleset, sectionMetricScores, metricBreakdown) {
  const fallback = ruleset.proteinFallback;
  if (!fallback) return;
  if ((sectionMetricScores.proteins || []).length) return;

  const proteinGrams = food.header?.protein_g;
  if (proteinGrams === null || proteinGrams === undefined) return;

  const bandResult = scoreFromBands(proteinGrams, fallback.bands || []);
  if (!bandResult) return;

  const row = {
    metricKey: fallback.metricKey || 'protein_g_fallback',
    sectionKey: 'proteins',
    scoringMode: 'protein_fallback',
    value: proteinGrams,
    band: bandResult.label,
    score: bandResult.score,
    weight: fallback.weight ?? 1,
    weightedScore: bandResult.score * (fallback.weight ?? 1),
    fallbackApplied: true
  };

  metricBreakdown.push(row);
  sectionMetricScores.proteins.push(row);
}

function main() {
  const [, , foodPath, rulesetPath] = process.argv;
  if (!foodPath || !rulesetPath) {
    console.error('Usage: node scripts/foodranked-scorer.js <food.json> <ruleset.json>');
    process.exit(1);
  }

  const food = readJson(foodPath);
  const ruleset = readJson(rulesetPath);

  const exactCountErrors = validateExactContextCount(food, ruleset);
  if (exactCountErrors.length) {
    console.error(JSON.stringify({ status: 'invalid_context_items', errors: exactCountErrors }, null, 2));
    process.exit(3);
  }

  const sectionMetricScores = { fats: [], carbs: [], proteins: [], vitamins: [], minerals: [] };
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

    if (rule.scoringMode === 'dv_points') {
      const points = dvPoints(value);
      const score = points * 10;
      const row = {
        metricKey: rule.metricKey,
        sectionKey: rule.sectionKey,
        scoringMode: 'dv_points',
        dvPercent: value,
        points,
        score,
        weight: rule.weight ?? 1,
        weightedScore: score * (rule.weight ?? 1)
      };
      metricBreakdown.push(row);
      sectionMetricScores[rule.sectionKey].push(row);
      continue;
    }

    const bandResult = scoreFromBands(value, rule.bands) || metricBandFallback(value, rule.polarity);
    if (!bandResult) continue;
    const row = {
      metricKey: rule.metricKey,
      sectionKey: rule.sectionKey,
      scoringMode: 'arrow_bands',
      value,
      band: bandResult.label,
      score: bandResult.score,
      weight: rule.weight ?? 1,
      weightedScore: bandResult.score * (rule.weight ?? 1)
    };
    metricBreakdown.push(row);
    sectionMetricScores[rule.sectionKey].push(row);
  }

  if (missingRequired.length) {
    console.error(JSON.stringify({ status: 'incomplete', missingRequired }, null, 2));
    process.exit(2);
  }

  maybeApplyProteinFallback(food, ruleset, sectionMetricScores, metricBreakdown);

  const contextComputation = computeContextSections(food.contextItems || {}, ruleset.contextRules || {}, food);

  const sectionScores = {
    fats: weightedAverage(sectionMetricScores.fats),
    carbs: weightedAverage(sectionMetricScores.carbs),
    proteins: weightedAverage(sectionMetricScores.proteins),
    vitamins: weightedAverage(sectionMetricScores.vitamins),
    minerals: weightedAverage(sectionMetricScores.minerals),
    pros: contextComputation.prosScore,
    cons: contextComputation.consScore
  };

  const sectionWeights = ruleset.sectionWeights || {};
  const scoredSections = Object.entries(sectionScores).filter(([, score]) => typeof score === 'number');
  const weightedDenominator = scoredSections.reduce((sum, [section]) => sum + (typeof sectionWeights[section] === 'number' ? sectionWeights[section] : 0), 0);
  const rawOverallScore = scoredSections.length
    ? (scoredSections.reduce((sum, [section, score]) => sum + (score * (typeof sectionWeights[section] === 'number' ? sectionWeights[section] : 0)), 0) / (weightedDenominator || 1))
    : 0;
  const overallScore = round1(rawOverallScore);

  const tier = getTier(rawOverallScore, ruleset.tierThresholds);
  const summary = buildSummary(sectionScores, tier);
  const extremes = pickSectionExtremes(sectionScores);
  const topPros = trimContextItems(contextComputation.pros, 'pro');
  const topCons = trimContextItems(contextComputation.cons, 'con');

  const explanation = {
    summary,
    whyThisTier: buildTierReason(tier, overallScore, sectionScores),
    strongestSection: extremes.strongest ? {
      key: extremes.strongest.section,
      label: capitalize(prettySectionName(extremes.strongest.section)),
      score: round1(extremes.strongest.score)
    } : null,
    weakestSection: extremes.weakest ? {
      key: extremes.weakest.section,
      label: capitalize(prettySectionName(extremes.weakest.section)),
      score: round1(extremes.weakest.score)
    } : null,
    topPros,
    topCons,
    narrationNotes: buildNarrationNotes(extremes, tier)
  };

  const output = {
    status: 'ok',
    food: { id: food.id, name: food.name, foodType: food.foodType },
    ruleset: { id: ruleset.id, version: ruleset.version },
    header: food.header,
    sectionScores: Object.fromEntries(Object.entries(sectionScores).map(([k, v]) => [k, v === null ? null : round1(v)])),
    overallScore,
    overallScoreExact: Number(rawOverallScore.toFixed(4)),
    tier,
    summary,
    explanation,
    contextItems: {
      pros: contextComputation.pros,
      cons: contextComputation.cons
    },
    metricBreakdown
  };

  console.log(JSON.stringify(output, null, 2));
}

main();
