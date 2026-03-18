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

function dvPoints(dvPercent) {
  return Math.min(Math.floor(dvPercent / 10), 10);
}

function normalizeArrowSection(items) {
  if (!items.length) return null;
  const raw = items.reduce((sum, i) => sum + i.weightedScore, 0);
  const max = items.reduce((sum, i) => sum + 3 * i.weight, 0);
  if (max === 0) return null;
  return clamp(((raw + max) / (2 * max)) * 100, 0, 100);
}

function normalizeDvSection(items) {
  if (!items.length) return null;
  const raw = items.reduce((sum, i) => sum + i.weightedScore, 0);
  const max = items.reduce((sum, i) => sum + 10 * i.weight, 0);
  if (max === 0) return null;
  return clamp((raw / max) * 100, 0, 100);
}

function normalizeContextSection(items, positive) {
  const raw = items.reduce((sum, i) => sum + (Number(i.scoreValue) || 0), 0);
  const max = items.length * 3;
  if (max === 0) return null;
  if (positive) return clamp((raw / max) * 100, 0, 100);
  return clamp((Math.abs(raw) / max) * 100, 0, 100);
}

function resolveContextScoreValue(item, scoreMap) {
  const impactLevel = String(item.impactLevel || '').toLowerCase();
  const side = item.side || item.kind || null;
  if (side && scoreMap?.[`${impactLevel}_${side}`] !== undefined) return scoreMap[`${impactLevel}_${side}`];
  if (item.scoreKey && scoreMap?.[item.scoreKey] !== undefined) return scoreMap[item.scoreKey];
  return 0;
}

function computeContextAdjustment(contextItems, contextRules) {
  const scoreMap = contextRules?.scoreMap || {};
  const maxScoringMajors = contextRules?.maxScoringMajors ?? 3;
  const maxScoreAdjustment = contextRules?.maxScoreAdjustment ?? 9;

  const flattened = [
    ...((contextItems?.pros || []).map(item => ({ ...item, side: 'pro' }))),
    ...((contextItems?.cons || []).map(item => ({ ...item, side: 'con' })))
  ].map(item => ({
    ...item,
    resolvedScoreValue: resolveContextScoreValue(item, scoreMap)
  }));

  const scoringMajors = flattened.filter(item => item.resolvedScoreValue !== 0);
  const appliedItems = scoringMajors.slice(0, maxScoringMajors);
  const rawAdjustment = appliedItems.reduce((sum, item) => sum + item.resolvedScoreValue, 0);
  const appliedAdjustment = clamp(rawAdjustment, -maxScoreAdjustment, maxScoreAdjustment);

  return {
    contextDisplayScores: {
      pros: normalizeContextSection(flattened.filter(item => item.side === 'pro').map(item => ({ scoreValue: item.resolvedScoreValue })), true),
      cons: normalizeContextSection(flattened.filter(item => item.side === 'con').map(item => ({ scoreValue: item.resolvedScoreValue })), false)
    },
    appliedItems,
    ignoredItems: scoringMajors.slice(maxScoringMajors),
    rawAdjustment,
    appliedAdjustment
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
  const nutritionEntries = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals']
    .map(section => [section, sectionScores[section]])
    .filter(([, v]) => typeof v === 'number')
    .sort((a, b) => b[1] - a[1]);

  const best = nutritionEntries[0]?.[0] || null;
  const worst = nutritionEntries[nutritionEntries.length - 1]?.[0] || null;
  const bestScore = nutritionEntries[0]?.[1] ?? null;

  if (bestScore === null || bestScore === 0) {
    return `This food is being judged mostly by contextual strengths and weaknesses rather than nutrient sections. It lands in ${tier} tier.`;
  }

  return `${capitalize(prettySectionName(best))} are carrying this food most, while ${prettySectionName(worst)} are the biggest drag. It lands in ${tier} tier.`;
}

function buildTierReason(tier, overallScore, baseScore, contextAdjustment) {
  const contextBit = contextAdjustment === 0
    ? 'Context barely changed the result.'
    : contextAdjustment > 0
      ? `Context lifted it by ${contextAdjustment} point${contextAdjustment === 1 ? '' : 's'}.`
      : `Context dragged it down by ${Math.abs(contextAdjustment)} point${Math.abs(contextAdjustment) === 1 ? '' : 's'}.`;
  return `This food lands in ${tier} tier with an overall score of ${overallScore} from a base nutrition score of ${baseScore}. ${contextBit}`;
}

function pickSectionExtremes(sectionScores) {
  const nutritionSections = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals'];
  const entries = nutritionSections
    .map(section => ({ section, score: sectionScores[section] }))
    .filter(entry => typeof entry.score === 'number')
    .sort((a, b) => b.score - a.score);

  const strongest = entries[0] && entries[0].score > 0 ? entries[0] : null;
  const weakest = entries.length && entries[entries.length - 1].score > 0 ? entries[entries.length - 1] : null;

  return { strongest, weakest };
}

function buildNarrationNotes(extremes, tier, contextAdjustment) {
  const notes = [];
  if (extremes.strongest) notes.push(`Strongest section: ${capitalize(prettySectionName(extremes.strongest.section))}.`);
  if (extremes.weakest) notes.push(`Weakest section: ${capitalize(prettySectionName(extremes.weakest.section))}.`);
  if (contextAdjustment > 0) notes.push(`Context improved the final tier case by ${contextAdjustment} point${contextAdjustment === 1 ? '' : 's'}.`);
  if (contextAdjustment < 0) notes.push(`Context weakened the final tier case by ${Math.abs(contextAdjustment)} point${Math.abs(contextAdjustment) === 1 ? '' : 's'}.`);
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
      const weightedScore = points * (rule.weight || 1);
      const row = {
        metricKey: rule.metricKey,
        sectionKey: rule.sectionKey,
        scoringMode: 'dv_points',
        dvPercent: value,
        points,
        weight: rule.weight || 1,
        weightedScore
      };
      metricBreakdown.push(row);
      sectionMetricScores[rule.sectionKey].push(row);
      continue;
    }

    const bandResult = scoreFromBands(value, rule.bands) || metricBandFallback(value, rule.polarity);
    if (!bandResult) continue;
    const weightedScore = bandResult.score * (rule.weight || 1);
    const row = {
      metricKey: rule.metricKey,
      sectionKey: rule.sectionKey,
      scoringMode: 'arrow_bands',
      value,
      band: bandResult.label,
      score: bandResult.score,
      weight: rule.weight || 1,
      weightedScore
    };
    metricBreakdown.push(row);
    sectionMetricScores[rule.sectionKey].push(row);
  }

  if (missingRequired.length) {
    console.error(JSON.stringify({ status: 'incomplete', missingRequired }, null, 2));
    process.exit(2);
  }

  const contextComputation = computeContextAdjustment(food.contextItems || {}, ruleset.contextRules || {});

  const sectionScores = {
    fats: normalizeArrowSection(sectionMetricScores.fats),
    carbs: normalizeArrowSection(sectionMetricScores.carbs),
    proteins: normalizeArrowSection(sectionMetricScores.proteins),
    vitamins: normalizeDvSection(sectionMetricScores.vitamins),
    minerals: normalizeDvSection(sectionMetricScores.minerals),
    pros: contextComputation.contextDisplayScores.pros,
    cons: contextComputation.contextDisplayScores.cons
  };

  const weights = ruleset.sectionWeights || {};
  let baseScore = 0;
  for (const section of ['fats', 'carbs', 'proteins', 'vitamins', 'minerals']) {
    const score = sectionScores[section];
    if (typeof score === 'number' && typeof weights[section] === 'number') baseScore += score * weights[section];
  }
  baseScore = Math.round(baseScore);

  const overallScore = clamp(baseScore + contextComputation.appliedAdjustment, 0, 100);
  const tier = getTier(overallScore, ruleset.tierThresholds);
  const summary = buildSummary(sectionScores, tier);
  const extremes = pickSectionExtremes(sectionScores);
  const topPros = trimContextItems(contextComputation.appliedItems.filter(item => item.side === 'pro'), 'pro');
  const topCons = trimContextItems(contextComputation.appliedItems.filter(item => item.side === 'con'), 'con');
  const fallbackPros = topPros.length ? topPros : trimContextItems((food.contextItems?.pros || []).map(item => ({ ...item, resolvedScoreValue: 0 })), 'pro');
  const fallbackCons = topCons.length ? topCons : trimContextItems((food.contextItems?.cons || []).map(item => ({ ...item, resolvedScoreValue: 0 })), 'con');

  const explanation = {
    summary,
    whyThisTier: buildTierReason(tier, overallScore, baseScore, contextComputation.appliedAdjustment),
    strongestSection: extremes.strongest ? {
      key: extremes.strongest.section,
      label: capitalize(prettySectionName(extremes.strongest.section)),
      score: Number(extremes.strongest.score.toFixed(1))
    } : null,
    weakestSection: extremes.weakest ? {
      key: extremes.weakest.section,
      label: capitalize(prettySectionName(extremes.weakest.section)),
      score: Number(extremes.weakest.score.toFixed(1))
    } : null,
    topPros: fallbackPros,
    topCons: fallbackCons,
    narrationNotes: buildNarrationNotes(extremes, tier, contextComputation.appliedAdjustment)
  };

  const output = {
    status: 'ok',
    food: { id: food.id, name: food.name, foodType: food.foodType },
    ruleset: { id: ruleset.id, version: ruleset.version },
    header: food.header,
    sectionScores: Object.fromEntries(Object.entries(sectionScores).map(([k, v]) => [k, v === null ? null : Number(v.toFixed(1))])),
    baseScore,
    contextAdjustment: {
      rawAdjustment: contextComputation.rawAdjustment,
      appliedAdjustment: contextComputation.appliedAdjustment,
      appliedItems: contextComputation.appliedItems,
      ignoredItems: contextComputation.ignoredItems
    },
    overallScore,
    tier,
    summary,
    explanation,
    contextItems: food.contextItems,
    metricBreakdown
  };

  console.log(JSON.stringify(output, null, 2));
}

main();
