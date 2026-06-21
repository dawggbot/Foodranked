#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const outputsDir = path.join(repoRoot, 'outputs', 'episodes');
const outDir = path.join(repoRoot, 'docs', 'data');
const publishedFoodsDir = path.join(outDir, 'foods');
const docsAppDir = path.join(repoRoot, 'docs', 'app');
const docsAudioDir = path.join(repoRoot, 'docs', 'audio', 'episodes');
const sourceSpritesDir = path.join(repoRoot, 'sprites');

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

function findCustomFoodImage(foodId) {
  const docsPath = path.join(docsAppDir, 'sprites', 'header', 'food_images', `${foodId}.png`);
  const sourcePath = path.join(sourceSpritesDir, 'header', 'food_images', `${foodId}.png`);
  if (!exists(docsPath) && !exists(sourcePath)) return null;
  return {
    path: `app/sprites/header/food_images/${foodId}.png`,
    sourcePath: `sprites/header/food_images/${foodId}.png`,
    docsPath: `app/sprites/header/food_images/${foodId}.png`
  };
}

function takeRank(fileName) {
  const match = String(fileName || '').match(/voice-v(\d+)\.mp3$/i);
  return match ? Number(match[1]) : 0;
}

function splitTakeRank(fileName) {
  const match = String(fileName || '').match(/voice-v(\d+)-blocks\.json$/i);
  return match ? Number(match[1]) : 0;
}

function findEpisodeAudio(foodId) {
  const dir = path.join(docsAudioDir, foodId);
  if (!exists(dir)) return null;
  const audioFiles = fs.readdirSync(dir)
    .filter(name => name.toLowerCase().endsWith('.mp3'))
    .sort((a, b) => takeRank(b) - takeRank(a) || a.localeCompare(b));
  const fileName = audioFiles[0];
  if (!fileName) return null;
  const take = fileName.replace(/\.mp3$/i, '');
  const metadataName = `${take}.json`;
  const metadataPath = path.join(dir, metadataName);
  const metadata = exists(metadataPath) ? readJson(metadataPath) : null;
  return {
    take,
    path: `audio/episodes/${foodId}/${fileName}`,
    metadataPath: exists(metadataPath) ? `audio/episodes/${foodId}/${metadataName}` : null,
    productionPath: metadata?.productionAudioFile || `production/episodes/${foodId}/voice/${fileName}`,
    profileId: metadata?.profileId || null,
    voiceLabel: metadata?.voice?.label || null,
    modelId: metadata?.modelId || null,
    generatedAt: metadata?.generatedAt || null
  };
}

function findEpisodeSplitAudio(foodId, episode) {
  const dir = path.join(docsAudioDir, foodId);
  if (!exists(dir)) return null;
  const manifestFiles = fs.readdirSync(dir)
    .filter(name => /^voice-v\d+-blocks\.json$/i.test(name))
    .sort((a, b) => splitTakeRank(b) - splitTakeRank(a) || a.localeCompare(b));
  const fileName = manifestFiles[0];
  if (!fileName) return null;

  const metadataPath = path.join(dir, fileName);
  const metadata = readJson(metadataPath);
  const take = String(metadata.take || fileName.replace(/-blocks\.json$/i, ''));
  const episodeDir = episode?.outputs?.directory ? path.join(repoRoot, episode.outputs.directory) : null;
  const alignmentPath = episodeDir && episode?.outputs?.alignmentJson
    ? path.join(episodeDir, episode.outputs.alignmentJson)
    : null;
  const alignment = alignmentPath && exists(alignmentPath) ? readJson(alignmentPath) : null;
  const alignedById = new Map((alignment?.blocks || []).map(block => [block.id, block]));
  const blocks = (metadata.blocks || []).map(block => {
    const aligned = alignedById.get(block.id) || {};
    return {
      id: block.id,
      index: block.index,
      kind: block.kind,
      sectionKey: block.sectionKey || null,
      path: String(block.audioFile || '').replace(/^docs\//, ''),
      productionPath: block.productionAudioFile || null,
      text: block.text || '',
      offsetSeconds: aligned.offsetSeconds ?? null,
      durationSeconds: aligned.durationSeconds ?? null,
      wordCount: aligned.wordCount ?? null,
      loss: aligned.loss ?? null
    };
  });
  const timedBlocks = blocks.filter(block => Number.isFinite(Number(block.offsetSeconds)) && Number.isFinite(Number(block.durationSeconds)));
  const durationSeconds = timedBlocks.length
    ? Math.max(...timedBlocks.map(block => Number(block.offsetSeconds) + Number(block.durationSeconds)))
    : null;

  return {
    mode: 'split-blocks',
    take,
    manifestPath: `audio/episodes/${foodId}/${fileName}`,
    productionManifestPath: metadata.productionAudioManifestFile || null,
    profileId: metadata.profileId || null,
    voiceLabel: metadata.voice?.label || null,
    modelId: metadata.modelId || null,
    generatedAt: metadata.generatedAt || null,
    blockCount: metadata.blockCount ?? blocks.length,
    blockGapSeconds: alignment?.blockGapSeconds ?? null,
    durationSeconds,
    alignmentPath: alignmentPath && exists(alignmentPath) ? path.relative(repoRoot, alignmentPath) : null,
    blocks
  };
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
    const publishedFoodFile = path.join(publishedFoodsDir, name);
    const publishedFood = exists(publishedFoodFile) ? readJson(publishedFoodFile) : null;
    // The builders fetch item.path from docs/data/foods; keep indexed nutrition in step with that public copy.
    const displayFood = publishedFood ? {
      ...food,
      identity: publishedFood.identity ?? food.identity,
      basis: publishedFood.basis || food.basis,
      header: publishedFood.header || food.header,
      metrics: publishedFood.metrics || food.metrics,
      metricProvenance: publishedFood.metricProvenance || food.metricProvenance,
      nutritionDataSources: publishedFood.nutritionDataSources || food.nutritionDataSources,
      sourceNotes: publishedFood.sourceNotes || food.sourceNotes,
      scoreReadiness: publishedFood.scoreReadiness || food.scoreReadiness,
      contextItems: publishedFood.contextItems || food.contextItems
    } : food;
    const episode = findEpisode(food.id);
    const score = episode?.scoreSnapshot || null;
    const scenes = episode?.scenePlan?.scenes || [];
    const rulesetPath = path.join(rulesetsDir, `${food.foodType}.v1.json`);
    const ruleset = exists(rulesetPath) ? readJson(rulesetPath) : null;
    const customFoodImage = findCustomFoodImage(food.id);
    const episodeAudio = findEpisodeAudio(food.id);
    const episodeSplitAudio = findEpisodeSplitAudio(food.id, episode);

    return {
      id: food.id,
      name: displayFood.name || food.name,
      foodType: displayFood.foodType || food.foodType,
      foodTypeLabel: titleCase(displayFood.foodType || food.foodType),
      identity: displayFood.identity || null,
      basis: displayFood.basis,
      kcal: displayFood.header?.kcal ?? null,
      header: displayFood.header || {},
      metrics: displayFood.metrics || {},
      metricProvenance: displayFood.metricProvenance || {},
      nutritionDataSources: displayFood.nutritionDataSources || [],
      sourceNotes: displayFood.sourceNotes || [],
      scoreReadiness: displayFood.scoreReadiness || null,
      contextItems: displayFood.contextItems || { pros: [], cons: [] },
      path: `data/foods/${name}`,
      sourceFile: path.relative(repoRoot, file),
      ...(customFoodImage ? { assets: { customFoodImage } } : {}),
      ruleset: ruleset ? {
        id: ruleset.id,
        version: ruleset.version,
        sectionWeights: ruleset.sectionWeights || {},
        contextRules: ruleset.contextRules || {},
        proteinFallback: ruleset.proteinFallback || null,
        metricRulesBySection: ruleSummary(ruleset)
      } : null,
      episode: episode ? {
        mode: episode.mode,
        overallScore: score?.overallScore ?? null,
        overallScoreExact: score?.overallScoreExact ?? null,
        baseOverallScore: score?.baseOverallScore ?? null,
        baseOverallScoreExact: score?.baseOverallScoreExact ?? null,
        tier: score?.tier ?? null,
        sectionScores: score?.sectionScores ?? {},
        summary: score?.explanation?.summary ?? null,
        whyThisTier: score?.explanation?.whyThisTier ?? null,
        durationSeconds: episode.scenePlan?.totalEstimatedDurationSeconds ?? null,
        outputDir: episode.outputs?.directory ?? null,
        ...(episodeAudio ? {
          audio: episodeAudio,
          ...(episodeSplitAudio ? { splitAudio: episodeSplitAudio } : {}),
          sceneTimings: scenes.map(scene => ({
            id: scene.id,
            kind: scene.kind,
            startSeconds: scene.startSeconds,
            endSeconds: scene.endSeconds,
            durationSeconds: scene.durationSeconds
          }))
        } : episodeSplitAudio ? {
          splitAudio: episodeSplitAudio,
          sceneTimings: scenes.map(scene => ({
            id: scene.id,
            kind: scene.kind,
            startSeconds: scene.startSeconds,
            endSeconds: scene.endSeconds,
            durationSeconds: scene.durationSeconds
          }))
        } : {}),
        sceneCount: scenes.length,
        accent: episode.visualBinding?.categoryAccent ?? null,
        tierColor: episode.visualBinding?.tierColor ?? null,
        script: exists(path.join(repoRoot, episode.outputs?.directory || '', 'script.json'))
          ? readJson(path.join(repoRoot, episode.outputs.directory, 'script.json'))
          : null,
        subtitles: exists(path.join(repoRoot, episode.outputs?.directory || '', 'subtitles.json'))
          ? readJson(path.join(repoRoot, episode.outputs.directory, 'subtitles.json'))
          : [],
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
