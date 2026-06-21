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

const PROTEIN_QUALITY_METRIC_KEYS = new Set([
  'essential_amino_acids_score',
  'nonessential_amino_acids_score',
  'bioavailability_percent'
]);
const AMINO_ACID_SCORE_METRIC_KEYS = new Set([
  'essential_amino_acids_score',
  'nonessential_amino_acids_score'
]);
const MACRO_SECTION_HEADER_KEYS = {
  fats: 'fat_g',
  carbs: 'carb_g',
  proteins: 'protein_g'
};
const aminoAcidThresholds = readJson(path.join(__dirname, '..', 'config', 'amino-acid-thresholds.v1.json'));

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

function applyScoreCalibration(score, calibration) {
  const anchors = (calibration?.anchors || [])
    .filter(anchor => typeof anchor.raw === 'number' && typeof anchor.calibrated === 'number')
    .sort((a, b) => a.raw - b.raw);

  if (anchors.length < 2) return clamp(score, 0, 100);
  if (score <= anchors[0].raw) return clamp(anchors[0].calibrated, 0, 100);

  for (let i = 1; i < anchors.length; i += 1) {
    const lower = anchors[i - 1];
    const upper = anchors[i];
    if (score > upper.raw) continue;
    if (upper.raw === lower.raw) return clamp(upper.calibrated, 0, 100);
    const ratio = (score - lower.raw) / (upper.raw - lower.raw);
    return clamp(lower.calibrated + (ratio * (upper.calibrated - lower.calibrated)), 0, 100);
  }

  return clamp(anchors[anchors.length - 1].calibrated, 0, 100);
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

function firstUsefulProteinBandMin(ruleset) {
  const band = (ruleset.proteinFallback?.bands || [])
    .find(item => Number(item.score) >= 60 && typeof item.min === 'number');
  return typeof band?.min === 'number' ? band.min : null;
}

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function aminoAcidDisplayDenominator(kind, fallback) {
  const configured = toFiniteNumber(aminoAcidThresholds.displayDenominators?.[kind]);
  return configured ?? fallback;
}

function sectionMainMacroIsZero(food, sectionKey) {
  const headerKey = MACRO_SECTION_HEADER_KEYS[sectionKey];
  if (!headerKey) return false;
  return toFiniteNumber(food.header?.[headerKey]) === 0;
}

function aminoAcidValueMg(food, metricKey) {
  const aminoAcids = food.metrics?.amino_acids_mg || {};
  const nested = toFiniteNumber(aminoAcids[metricKey]);
  if (nested !== null) return nested;
  return toFiniteNumber(food.metrics?.[metricKey]);
}

function scoreAminoAcidGroups(food, groups, denominator = null) {
  const details = (groups || []).map(group => {
    const values = (group.metricKeys || [])
      .map(metricKey => ({ metricKey, valueMg: aminoAcidValueMg(food, metricKey) }));
    const presentValues = values.filter(item => item.valueMg !== null);
    const amountMg = presentValues.length
      ? round1(presentValues.reduce((sum, item) => sum + item.valueMg, 0))
      : null;
    const thresholdMg = toFiniteNumber(group.thresholdMg);
    return {
      key: group.key,
      label: group.label,
      metricKeys: group.metricKeys || [],
      amountMg,
      thresholdMg,
      useful: amountMg !== null && thresholdMg !== null && amountMg >= thresholdMg,
      missingMetricKeys: values.filter(item => item.valueMg === null).map(item => item.metricKey)
    };
  });

  return {
    value: details.filter(item => item.useful).length,
    denominator: denominator ?? details.length,
    details
  };
}

function buildAminoAcidScoring(food) {
  const aminoAcids = food.metrics?.amino_acids_mg || {};
  const profileAvailable = Object.values(aminoAcids).some(value => toFiniteNumber(value) !== null);
  const essentialDenominator = aminoAcidDisplayDenominator('essential', aminoAcidThresholds.essentialGroups?.length || 9);
  const nonessentialDenominator = aminoAcidDisplayDenominator('nonessential', 11);
  if (!profileAvailable) {
    return {
      policyId: aminoAcidThresholds.id,
      profileAvailable: false,
      sourceMetric: 'amino_acids_mg',
      essential: { value: null, denominator: essentialDenominator, details: [] },
      nonessential: { value: null, denominator: nonessentialDenominator, details: [] }
    };
  }

  return {
    policyId: aminoAcidThresholds.id,
    profileAvailable: true,
    sourceMetric: 'amino_acids_mg',
    essential: scoreAminoAcidGroups(food, aminoAcidThresholds.essentialGroups || [], essentialDenominator),
    nonessential: scoreAminoAcidGroups(food, aminoAcidThresholds.nonessentialGroups || [], nonessentialDenominator)
  };
}

function derivedAminoAcidMetric(aminoAcidScoring, metricKey) {
  if (!aminoAcidScoring?.profileAvailable) return null;
  if (metricKey === 'essential_amino_acids_score') return aminoAcidScoring.essential;
  if (metricKey === 'nonessential_amino_acids_score') return aminoAcidScoring.nonessential;
  return null;
}

function buildProteinQualityGate(food, ruleset, aminoAcidScoring) {
  const configuredMin = ruleset.proteinQualityGate?.minimumProteinG;
  const fallbackMin = firstUsefulProteinBandMin(ruleset);
  const minimumProteinG = typeof configuredMin === 'number'
    ? configuredMin
    : typeof fallbackMin === 'number'
      ? fallbackMin
      : 5;
  const proteinG = Number(food.header?.protein_g);
  return {
    proteinG: Number.isFinite(proteinG) ? proteinG : null,
    minimumProteinG,
    eligible: Number.isFinite(proteinG) && proteinG >= minimumProteinG,
    aminoAcidProfileAvailable: Boolean(aminoAcidScoring?.profileAvailable),
    usefulEssentialAminoAcidGroups: aminoAcidScoring?.essential?.value ?? null,
    usefulNonessentialAminoAcidGroups: aminoAcidScoring?.nonessential?.value ?? null,
    aminoAcidThresholdPolicy: aminoAcidScoring?.policyId || null,
    skippedMetricKeys: []
  };
}

function shouldSkipProteinQualityRule(rule, gate) {
  if (!PROTEIN_QUALITY_METRIC_KEYS.has(rule.metricKey)) return false;
  const weight = rule.weight ?? 1;
  if (weight <= 0 || !gate.eligible) return true;
  return !gate.aminoAcidProfileAvailable;
}

function trackSkippedProteinQuality(gate, rule) {
  if (!PROTEIN_QUALITY_METRIC_KEYS.has(rule.metricKey)) return;
  if (!gate.skippedMetricKeys.includes(rule.metricKey)) gate.skippedMetricKeys.push(rule.metricKey);
}

function maybeApplyProteinFallback(food, ruleset, sectionMetricScores, metricBreakdown) {
  const fallback = ruleset.proteinFallback;
  if (!fallback) return;
  if (sectionMainMacroIsZero(food, 'proteins')) return;
  const proteinRows = sectionMetricScores.proteins || [];
  const fallbackMetricKey = fallback.metricKey || 'protein_g_fallback';
  if (proteinRows.some(item => item.metricKey === fallbackMetricKey)) return;
  if (proteinRows.some(item => PROTEIN_QUALITY_METRIC_KEYS.has(item.metricKey) && (item.weight ?? 1) > 0)) return;

  const proteinGrams = food.header?.protein_g;
  if (proteinGrams === null || proteinGrams === undefined) return;

  const bandResult = scoreFromBands(proteinGrams, fallback.bands || []);
  if (!bandResult) return;

  const row = {
    metricKey: fallbackMetricKey,
    sectionKey: 'proteins',
    scoringMode: 'arrow_bands',
    value: proteinGrams,
    band: bandResult.label,
    polarity: 'higher_better',
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
  const aminoAcidScoring = buildAminoAcidScoring(food);
  const proteinQualityGate = buildProteinQualityGate(food, ruleset, aminoAcidScoring);

  for (const rule of ruleset.metricRules || []) {
    if (rule.scoringRole !== 'scored') continue;
    if (rule.applicability === 'not_applicable') continue;
    if (sectionMainMacroIsZero(food, rule.sectionKey)) continue;
    if (shouldSkipProteinQualityRule(rule, proteinQualityGate)) {
      trackSkippedProteinQuality(proteinQualityGate, rule);
      continue;
    }

    const derivedAminoAcid = AMINO_ACID_SCORE_METRIC_KEYS.has(rule.metricKey)
      ? derivedAminoAcidMetric(aminoAcidScoring, rule.metricKey)
      : null;
    const value = derivedAminoAcid ? derivedAminoAcid.value : food.metrics?.[rule.metricKey];
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
      polarity: rule.polarity || null,
      score: bandResult.score,
      weight: rule.weight ?? 1,
      weightedScore: bandResult.score * (rule.weight ?? 1)
    };
    if (derivedAminoAcid) {
      row.denominator = derivedAminoAcid.denominator;
      row.derivedFrom = aminoAcidScoring.sourceMetric;
      row.aminoAcidThresholdPolicy = aminoAcidScoring.policyId;
      row.aminoAcidGroups = derivedAminoAcid.details;
    }
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
  const baseOverallScoreExact = scoredSections.length
    ? (scoredSections.reduce((sum, [section, score]) => sum + (score * (typeof sectionWeights[section] === 'number' ? sectionWeights[section] : 0)), 0) / (weightedDenominator || 1))
    : 0;
  const calibratedOverallScoreExact = applyScoreCalibration(baseOverallScoreExact, ruleset.scoreCalibration);
  const overallScore = round1(calibratedOverallScoreExact);

  const tier = getTier(calibratedOverallScoreExact, ruleset.tierThresholds);
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
    ruleset: {
      id: ruleset.id,
      version: ruleset.version,
      scoreCalibration: ruleset.scoreCalibration ? {
        version: ruleset.scoreCalibration.version ?? null,
        method: ruleset.scoreCalibration.method ?? null
      } : null
    },
    header: food.header,
    foodMetrics: food.metrics || {},
    aminoAcidScoring,
    proteinQualityGate,
    sectionScores: Object.fromEntries(Object.entries(sectionScores).map(([k, v]) => [k, v === null ? null : round1(v)])),
    overallScore,
    overallScoreExact: Number(calibratedOverallScoreExact.toFixed(4)),
    baseOverallScore: round1(baseOverallScoreExact),
    baseOverallScoreExact: Number(baseOverallScoreExact.toFixed(4)),
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
