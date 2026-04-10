#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const outputsDir = path.join(repoRoot, 'outputs', 'episodes');
const outDir = path.join(repoRoot, 'docs', 'data');

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function exists(file) { return fs.existsSync(file); }

function titleCase(value) {
  return String(value || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function findEpisode(foodId) {
  const compactDir = path.join(outputsDir, `${foodId}-compact`, 'episode-manifest.json');
  const standardDir = path.join(outputsDir, `${foodId}`, 'episode-manifest.json');
  if (exists(compactDir)) return readJson(compactDir);
  if (exists(standardDir)) return readJson(standardDir);
  return null;
}

function ruleSummary(ruleset) {
  const sections = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals'];
  const summary = {};
  for (const section of sections) {
    summary[section] = (ruleset.metricRules || [])
      .filter(rule => rule.sectionKey === section)
      .map(rule => ({
        metricKey: rule.metricKey,
        scoringMode: rule.scoringMode,
        polarity: rule.polarity || null,
        applicability: rule.applicability || null,
        weight: rule.weight ?? null,
        bands: rule.bands || []
      }));
  }
  return summary;
}

const foods = fs.readdirSync(foodsDir)
  .filter(name => name.endsWith('.sample.json'))
  .sort()
  .map(name => {
    const file = path.join(foodsDir, name);
    const food = readJson(file);
    const episode = findEpisode(food.id);
    const score = episode?.scoreSnapshot || null;
    const scenes = episode?.scenePlan?.scenes || [];
    const rulesetPath = path.join(rulesetsDir, `${food.foodType}.v1.json`);
    const ruleset = exists(rulesetPath) ? readJson(rulesetPath) : null;

    return {
      id: food.id,
      name: food.name,
      foodType: food.foodType,
      foodTypeLabel: titleCase(food.foodType),
      basis: food.basis,
      kcal: food.header?.kcal ?? null,
      header: food.header || {},
      metrics: food.metrics || {},
      contextItems: food.contextItems || { pros: [], cons: [] },
      path: `data/foods/${name}`,
      sourceFile: path.relative(repoRoot, file),
      ruleset: ruleset ? {
        id: ruleset.id,
        version: ruleset.version,
        sectionWeights: ruleset.sectionWeights || {},
        contextRules: ruleset.contextRules || {},
        metricRulesBySection: ruleSummary(ruleset)
      } : null,
      episode: episode ? {
        mode: episode.mode,
        overallScore: score?.overallScore ?? null,
        tier: score?.tier ?? null,
        sectionScores: score?.sectionScores ?? {},
        summary: score?.explanation?.summary ?? null,
        whyThisTier: score?.explanation?.whyThisTier ?? null,
        durationSeconds: episode.scenePlan?.totalEstimatedDurationSeconds ?? null,
        outputDir: episode.outputs?.directory ?? null,
        sceneCount: scenes.length,
        accent: episode.visualBinding?.categoryAccent ?? null,
        tierColor: episode.visualBinding?.tierColor ?? null,
        script: exists(path.join(repoRoot, episode.outputs?.directory || '', 'script.json'))
          ? readJson(path.join(repoRoot, episode.outputs.directory, 'script.json'))
          : null,
        narrationText: exists(path.join(repoRoot, episode.outputs?.directory || '', 'narration.txt'))
          ? fs.readFileSync(path.join(repoRoot, episode.outputs.directory, 'narration.txt'), 'utf8')
          : null
      } : null
    };
  });

const payload = {
  generatedAt: new Date().toISOString(),
  count: foods.length,
  foods
};

const outFile = path.join(outDir, 'foods-index.json');
const outJsFile = path.join(outDir, 'foods-index.js');
ensureDir(outDir);
fs.writeFileSync(outFile, JSON.stringify(foods, null, 2) + '\n');
fs.writeFileSync(
  outJsFile,
  `window.FOODS_INDEX = ${JSON.stringify(foods, null, 2)};\nwindow.FOODRANKED_DATA = ${JSON.stringify(payload, null, 2)};\n`
);
console.log(`Wrote ${outFile} and ${outJsFile} with ${foods.length} foods.`);
