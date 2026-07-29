#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const scorerPath = path.join(__dirname, 'foodranked-scorer.js');
const matrixPath = path.join(repoRoot, 'config', 'calibration-matrix.v1.json');
const matrixMdPath = path.join(repoRoot, 'CALIBRATION-MATRIX.md');
const resultsMdPath = path.join(repoRoot, 'CALIBRATION-MATRIX-RESULTS.md');

const tierOrder = ['S', 'A', 'B', 'C', 'D'];
const bucketSize = 5;
const sharedTierThresholds = [
  { tier: 'S', min: 80, max: 100 },
  { tier: 'A', min: 61, max: 79.9999 },
  { tier: 'B', min: 40, max: 60.9999 },
  { tier: 'C', min: 20, max: 39.9999 },
  { tier: 'D', min: 0, max: 19.9999 },
  { tier: 'Slop', min: -100, max: -0.0001 }
];
const tierScoreMap = {
  Slop: -20,
  D: 20,
  C: 40,
  B: 60,
  A: 80,
  S: 100
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function round4(n) {
  return Number(n.toFixed(4));
}

function round1(n) {
  return Number(n.toFixed(1));
}

function scoreFood(foodPath, rulesetPath) {
  const res = spawnSync(process.execPath, [scorerPath, foodPath, rulesetPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });
  if (res.status !== 0) {
    throw new Error(`${path.basename(foodPath)} failed: ${(res.stderr || res.stdout || '').trim()}`);
  }
  return JSON.parse(res.stdout);
}

function assignTierByRank(index) {
  return tierOrder[Math.floor(index / bucketSize)];
}

function buildThresholds(sortedRows) {
  const sMin = round4((sortedRows[4].baseOverallScoreExact + sortedRows[5].baseOverallScoreExact) / 2);
  const aMin = round4((sortedRows[9].baseOverallScoreExact + sortedRows[10].baseOverallScoreExact) / 2);
  const bMin = round4((sortedRows[14].baseOverallScoreExact + sortedRows[15].baseOverallScoreExact) / 2);
  const cMin = round4((sortedRows[19].baseOverallScoreExact + sortedRows[20].baseOverallScoreExact) / 2);
  if (sortedRows[4].baseOverallScoreExact === sortedRows[5].baseOverallScoreExact ||
      sortedRows[9].baseOverallScoreExact === sortedRows[10].baseOverallScoreExact ||
      sortedRows[14].baseOverallScoreExact === sortedRows[15].baseOverallScoreExact ||
      sortedRows[19].baseOverallScoreExact === sortedRows[20].baseOverallScoreExact) {
    throw new Error('Exact tie on a bucket boundary, thresholds cannot separate cleanly.');
  }
  return [
    { tier: 'S', min: sMin, max: 100 },
    { tier: 'A', min: aMin, max: round4(sMin - 0.0001) },
    { tier: 'B', min: bMin, max: round4(aMin - 0.0001) },
    { tier: 'C', min: cMin, max: round4(bMin - 0.0001) },
    { tier: 'D', min: 0, max: round4(cMin - 0.0001) }
  ];
}

function buildScoreCalibration(rawThresholds) {
  const byTier = Object.fromEntries(rawThresholds.map(threshold => [threshold.tier, threshold.min]));
  return {
    version: 1,
    method: 'piecewise_linear_raw_to_shared_tier_score',
    input: 'baseOverallScore',
    output: 'calibratedOverallScore',
    anchors: [
      { raw: 0, calibrated: 0 },
      { raw: byTier.C, calibrated: 20 },
      { raw: byTier.B, calibrated: 40 },
      { raw: byTier.A, calibrated: 60 },
      { raw: byTier.S, calibrated: 80 },
      { raw: 100, calibrated: 100 }
    ],
    notes: 'Maps category-calibrated benchmark boundaries onto shared Slop/D/C/B/A/S score bands.'
  };
}

function applyScoreCalibration(score, calibration) {
  const anchors = (calibration.anchors || []).slice().sort((a, b) => a.raw - b.raw);
  if (score <= anchors[0].raw) return anchors[0].calibrated;
  for (let i = 1; i < anchors.length; i += 1) {
    const lower = anchors[i - 1];
    const upper = anchors[i];
    if (score > upper.raw) continue;
    if (upper.raw === lower.raw) return upper.calibrated;
    const ratio = (score - lower.raw) / (upper.raw - lower.raw);
    return Math.max(0, Math.min(100, lower.calibrated + (ratio * (upper.calibrated - lower.calibrated))));
  }
  return anchors[anchors.length - 1].calibrated;
}

const foodFiles = fs.readdirSync(foodsDir)
  .filter(name => name.endsWith('.sample.json'))
  .sort();

const categoryRows = {};
for (const name of foodFiles) {
  const foodPath = path.join(foodsDir, name);
  const food = readJson(foodPath);
  const rulesetPath = path.join(rulesetsDir, `${food.foodType}.v1.json`);
  const scored = scoreFood(foodPath, rulesetPath);
  const row = {
    id: food.id,
    name: food.name,
    foodType: food.foodType,
    foodPath: path.relative(repoRoot, foodPath),
    baseOverallScore: scored.baseOverallScore ?? scored.overallScore,
    baseOverallScoreExact: scored.baseOverallScoreExact ?? scored.overallScoreExact
  };
  categoryRows[food.foodType] ??= [];
  categoryRows[food.foodType].push(row);
}

const matrix = {
  version: 1,
  basis: { value: 100, unit: 'g' },
  methodology: 'Foods are sorted by raw ruleset score within each category, calibrated onto shared universal tier thresholds, and checked with generated-data rarity guards that keep S rare among normal letter tiers and keep Slop as a small special bottom bucket.',
  sharedTierThresholds,
  tierScoreMap,
  categories: {}
};

for (const [foodType, rows] of Object.entries(categoryRows).sort()) {
  if (rows.length !== 25) throw new Error(`${foodType} expected 25 foods, found ${rows.length}`);
  rows.sort((a, b) => b.baseOverallScoreExact - a.baseOverallScoreExact || a.name.localeCompare(b.name));
  rows.forEach((row, index) => { row.targetTier = assignTierByRank(index); });

  const rawThresholds = buildThresholds(rows);
  const scoreCalibration = buildScoreCalibration(rawThresholds);
  rows.forEach(row => {
    row.calibratedOverallScoreExact = round4(applyScoreCalibration(row.baseOverallScoreExact, scoreCalibration));
    row.calibratedOverallScore = round1(row.calibratedOverallScoreExact);
  });

  const rulesetPath = path.join(rulesetsDir, `${foodType}.v1.json`);
  const ruleset = readJson(rulesetPath);
  ruleset.scoreCalibration = scoreCalibration;
  ruleset.tierThresholds = sharedTierThresholds;
  ruleset.tierScoreMap = tierScoreMap;
  fs.writeFileSync(rulesetPath, JSON.stringify(ruleset, null, 2) + '\n');

  for (const row of rows) {
    const foodPath = path.join(repoRoot, row.foodPath);
    const food = readJson(foodPath);
    food.expectedTier = row.targetTier;
    fs.writeFileSync(foodPath, JSON.stringify(food, null, 2) + '\n');
  }

  matrix.categories[foodType] = {
    rawThresholds,
    scoreCalibration,
    tiers: Object.fromEntries(tierOrder.map(tier => [tier, rows.filter(row => row.targetTier === tier).map(row => ({
      id: row.id,
      name: row.name,
      baseOverallScore: row.baseOverallScore,
      baseOverallScoreExact: row.baseOverallScoreExact,
      calibratedOverallScore: row.calibratedOverallScore,
      calibratedOverallScoreExact: row.calibratedOverallScoreExact
    }))]))
  };
}

writeJson(matrixPath, matrix);

let matrixMd = '# CALIBRATION-MATRIX\n\n';
matrixMd += 'This is the durable 25-food benchmark matrix for every FoodRanked category. Each category uses fixed 5-food S/A/B/C/D raw-score benchmark buckets to build category-specific calibration anchors, then food-specific anomaly adjustments can push clearly negative foods into the special Slop tier below D.\n';
matrixMd += `\nShared tier thresholds for internal calibrated/ranking scores: ${sharedTierThresholds.map(t => `${t.tier} ${t.min}-${t.max}`).join(' | ')}\n`;
matrixMd += '\nPublic `overallScore` is snapped from the final tier, using `Slop=-20`, `D=20`, `C=40`, `B=60`, `A=80`, `S=100`. The calibrated scores below remain the audit and tier-placement benchmark values, not the displayed final score.\n';
for (const [foodType, config] of Object.entries(matrix.categories)) {
  matrixMd += `\n## ${foodType}\n`;
  matrixMd += `- raw thresholds: ${config.rawThresholds.map(t => `${t.tier} ${t.min}-${t.max}`).join(' | ')}\n`;
  matrixMd += `- calibration anchors: ${config.scoreCalibration.anchors.map(a => `${a.raw}->${a.calibrated}`).join(' | ')}\n`;
  for (const tier of tierOrder) {
    matrixMd += `\n### ${tier}\n`;
    for (const row of config.tiers[tier]) {
      matrixMd += `- ${row.name} (${row.id}) - calibrated ${row.calibratedOverallScoreExact}, raw ${row.baseOverallScoreExact}\n`;
    }
  }
}
fs.writeFileSync(matrixMdPath, matrixMd);

const verification = {};
for (const [foodType, config] of Object.entries(matrix.categories)) {
  const rulesetPath = path.join(rulesetsDir, `${foodType}.v1.json`);
  verification[foodType] = { matchCount: 0, total: 0, mismatches: [] };
  for (const tier of tierOrder) {
    for (const row of config.tiers[tier]) {
      const foodPath = path.join(foodsDir, `${row.id}.sample.json`);
      const scored = scoreFood(foodPath, rulesetPath);
      verification[foodType].total += 1;
      if (scored.tier === tier) {
        verification[foodType].matchCount += 1;
      } else {
        verification[foodType].mismatches.push({
          name: row.name,
          id: row.id,
          targetTier: tier,
          actualTier: scored.tier,
          anomalyAdjustedScoreExact: scored.anomalyAdjustedScoreExact,
          baseOverallScoreExact: scored.baseOverallScoreExact
        });
      }
    }
  }
}

let resultsMd = '# CALIBRATION-MATRIX-RESULTS\n\n';
resultsMd += 'Verification after writing the calibration matrix, category score calibrations, and shared tier thresholds.\n';
resultsMd += '\nThis verifies internal calibrated/ranking score tier placement. Public `overallScore` is snapped from the final tier with `Slop=-20`, `D=20`, `C=40`, `B=60`, `A=80`, `S=100`.\n';
for (const [foodType, result] of Object.entries(verification)) {
  resultsMd += `\n## ${foodType}\n`;
  resultsMd += `- matched: ${result.matchCount}/${result.total}\n`;
  if (result.mismatches.length) {
    resultsMd += '- mismatches:\n';
    for (const mismatch of result.mismatches) {
      resultsMd += `  - ${mismatch.name} (${mismatch.id}): target ${mismatch.targetTier}, actual ${mismatch.actualTier}, adjusted ${mismatch.anomalyAdjustedScoreExact}, raw ${mismatch.baseOverallScoreExact}\n`;
    }
  } else {
    resultsMd += '- mismatches: none\n';
  }
}
fs.writeFileSync(resultsMdPath, resultsMd);

console.log(JSON.stringify({
  status: 'ok',
  matrixPath: path.relative(repoRoot, matrixPath),
  resultsPath: path.relative(repoRoot, resultsMdPath)
}, null, 2));
