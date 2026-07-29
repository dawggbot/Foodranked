#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { normalizeFoodContextItems } = require('./lib/context-item-normalizer');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const docsFoodsDir = path.join(repoRoot, 'docs', 'data', 'foods');
const args = new Set(process.argv.slice(2));
const contextItemsOnly = args.has('--context-items-only');

const STANDARD_BENCHMARK_NOTES = [
  'Calibration benchmark sample for FoodRanked.',
  'Values are approximate representative placeholders for ruleset tuning, not a clinical nutrient database.'
];

const GENERIC_BENCHMARK_NOTES = new Set([
  'Calibration benchmark sample for FoodRanked.',
  'Values are approximate representative placeholders for ruleset tuning, not a clinical nutrient database.',
  'Expanded dataset sample for FoodRanked pressure-testing.',
  'Values are approximate representative placeholders for category tuning, not a clinical nutrient database.',
  'Calibration sample for FoodRanked.',
  'Values are approximate placeholders for tuning only.',
  'Pressure-test sample for category instability.'
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function dedupeNotes(notes) {
  const seen = new Set();
  const out = [];
  for (const note of notes) {
    if (!note || seen.has(note)) continue;
    seen.add(note);
    out.push(note);
  }
  return out;
}

function isProductionLane(notes) {
  return Array.isArray(notes) && notes.some(note => /^Production-lane\b/.test(note));
}

function normalizeSourceNotes(notes) {
  const current = Array.isArray(notes) ? notes : [];
  if (isProductionLane(current)) return dedupeNotes(current.filter(note => !GENERIC_BENCHMARK_NOTES.has(note)));

  const preserved = current.filter(note => !GENERIC_BENCHMARK_NOTES.has(note));
  return dedupeNotes([...STANDARD_BENCHMARK_NOTES, ...preserved]);
}

function stripLegacyScoreValues(items) {
  let removed = 0;
  const normalized = (Array.isArray(items) ? items : []).map(item => {
    if (!item || typeof item !== 'object') return item;
    if (!Object.prototype.hasOwnProperty.call(item, 'scoreValue')) return item;
    const { scoreValue, ...rest } = item;
    removed += 1;
    return rest;
  });
  return { normalized, removed };
}

const targetDirs = [foodsDir, docsFoodsDir].filter(dir => fs.existsSync(dir));

let filesChanged = 0;
let filesWithScoreValueRemoved = 0;
let scoreValuesRemoved = 0;
let filesWithNormalizedNotes = 0;
let filesWithNormalizedContextItems = 0;
let filesScanned = 0;

for (const targetDir of targetDirs) {
  const files = fs.readdirSync(targetDir)
    .filter(name => name.endsWith('.sample.json'))
    .sort();

  for (const name of files) {
    const filePath = path.join(targetDir, name);
    const food = readJson(filePath);
    let changed = false;
    filesScanned += 1;

    if (!contextItemsOnly) {
      const originalNotes = JSON.stringify(food.sourceNotes ?? []);
      const normalizedNotes = normalizeSourceNotes(food.sourceNotes);
      if (JSON.stringify(normalizedNotes) !== originalNotes) {
        food.sourceNotes = normalizedNotes;
        filesWithNormalizedNotes += 1;
        changed = true;
      }
    }

    const contextItems = food.contextItems || {};
    const prosResult = stripLegacyScoreValues(contextItems.pros);
    const consResult = stripLegacyScoreValues(contextItems.cons);
    const removedHere = prosResult.removed + consResult.removed;

    if (removedHere > 0) {
      food.contextItems = {
        ...contextItems,
        pros: prosResult.normalized,
        cons: consResult.normalized
      };
      filesWithScoreValueRemoved += 1;
      scoreValuesRemoved += removedHere;
      changed = true;
    }

    const originalContextItems = JSON.stringify(food.contextItems || {});
    const normalizedContextItems = normalizeFoodContextItems(food);
    if (JSON.stringify(normalizedContextItems) !== originalContextItems) {
      food.contextItems = normalizedContextItems;
      filesWithNormalizedContextItems += 1;
      changed = true;
    }

    if (changed) {
      writeJson(filePath, food);
      filesChanged += 1;
    }
  }
}

console.log(JSON.stringify({
  status: 'ok',
  filesScanned,
  directoriesScanned: targetDirs.map(dir => path.relative(repoRoot, dir)),
  filesChanged,
  filesWithScoreValueRemoved,
  scoreValuesRemoved,
  filesWithNormalizedNotes,
  filesWithNormalizedContextItems
}, null, 2));
