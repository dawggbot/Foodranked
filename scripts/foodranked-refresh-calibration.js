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
  const sMin = round4((sortedRows[4].overallScoreExact + sortedRows[5].overallScoreExact) / 2);
  const aMin = round4((sortedRows[9].overallScoreExact + sortedRows[10].overallScoreExact) / 2);
  const bMin = round4((sortedRows[14].overallScoreExact + sortedRows[15].overallScoreExact) / 2);
  const cMin = round4((sortedRows[19].overallScoreExact + sortedRows[20].overallScoreExact) / 2);
  if (sortedRows[4].overallScoreExact === sortedRows[5].overallScoreExact ||
      sortedRows[9].overallScoreExact === sortedRows[10].overallScoreExact ||
      sortedRows[14].overallScoreExact === sortedRows[15].overallScoreExact ||
      sortedRows[19].overallScoreExact === sortedRows[20].overallScoreExact) {
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
    overallScore: scored.overallScore,
    overallScoreExact: scored.overallScoreExact
  };
  categoryRows[food.foodType] ??= [];
  categoryRows[food.foodType].push(row);
}

const matrix = {
  version: 1,
  basis: { value: 100, unit: 'g' },
  methodology: 'Foods are sorted by calibrated score within each category, then assigned into fixed 5-food S/A/B/C/D buckets.',
  categories: {}
};

for (const [foodType, rows] of Object.entries(categoryRows).sort()) {
  if (rows.length !== 25) throw new Error(`${foodType} expected 25 foods, found ${rows.length}`);
  rows.sort((a, b) => b.overallScoreExact - a.overallScoreExact || a.name.localeCompare(b.name));
  rows.forEach((row, index) => { row.targetTier = assignTierByRank(index); });

  const thresholds = buildThresholds(rows);
  const rulesetPath = path.join(rulesetsDir, `${foodType}.v1.json`);
  const ruleset = readJson(rulesetPath);
  ruleset.tierThresholds = thresholds;
  fs.writeFileSync(rulesetPath, JSON.stringify(ruleset, null, 2) + '\n');

  for (const row of rows) {
    const foodPath = path.join(repoRoot, row.foodPath);
    const food = readJson(foodPath);
    food.expectedTier = row.targetTier;
    fs.writeFileSync(foodPath, JSON.stringify(food, null, 2) + '\n');
  }

  matrix.categories[foodType] = {
    thresholds,
    tiers: Object.fromEntries(tierOrder.map(tier => [tier, rows.filter(row => row.targetTier === tier).map(row => ({
      id: row.id,
      name: row.name,
      overallScore: row.overallScore,
      overallScoreExact: row.overallScoreExact
    }))]))
  };
}

writeJson(matrixPath, matrix);

let matrixMd = '# CALIBRATION-MATRIX\n\n';
matrixMd += 'This is the durable 25-food benchmark matrix for every FoodRanked category. Each category is partitioned into fixed 5-food S/A/B/C/D anchor buckets after scoring against the current calibrated ruleset.\n';
for (const [foodType, config] of Object.entries(matrix.categories)) {
  matrixMd += `\n## ${foodType}\n`;
  matrixMd += `- thresholds: ${config.thresholds.map(t => `${t.tier} ${t.min}-${t.max}`).join(' | ')}\n`;
  for (const tier of tierOrder) {
    matrixMd += `\n### ${tier}\n`;
    for (const row of config.tiers[tier]) {
      matrixMd += `- ${row.name} (${row.id}) - ${row.overallScoreExact}\n`;
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
        verification[foodType].mismatches.push({ name: row.name, id: row.id, targetTier: tier, actualTier: scored.tier, overallScoreExact: scored.overallScoreExact });
      }
    }
  }
}

let resultsMd = '# CALIBRATION-MATRIX-RESULTS\n\n';
resultsMd += 'Verification after writing the calibration matrix and per-category thresholds.\n';
for (const [foodType, result] of Object.entries(verification)) {
  resultsMd += `\n## ${foodType}\n`;
  resultsMd += `- matched: ${result.matchCount}/${result.total}\n`;
  if (result.mismatches.length) {
    resultsMd += '- mismatches:\n';
    for (const mismatch of result.mismatches) {
      resultsMd += `  - ${mismatch.name} (${mismatch.id}): target ${mismatch.targetTier}, actual ${mismatch.actualTier}, score ${mismatch.overallScoreExact}\n`;
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
