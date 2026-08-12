#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'studio', 'agent-sync', 'index.json');
const FOODS_PATH = path.join(ROOT, 'docs', 'data', 'foods-index.json');
const BLOCK_GAP_SECONDS = 0.08;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function roundSeconds(value) {
  return Math.round(value * 1000) / 1000;
}

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : '';
}

function foodIdsFromArgs() {
  const optionsWithValues = new Set(['--date', '--timestamp']);
  const ids = [];
  for (let index = 2; index < process.argv.length; index += 1) {
    const value = process.argv[index];
    if (optionsWithValues.has(value)) {
      index += 1;
      continue;
    }
    if (!value.startsWith('--')) ids.push(value);
  }
  return ids;
}

function localManifestFor(foodId, foodName, sourceManifest) {
  let offsetSeconds = 0;
  const blocks = sourceManifest.blocks.map((block, index) => {
    const filename = block.filename || `${block.id}.mp3`;
    const durationSeconds = roundSeconds(Number(block.mediaDurationSeconds ?? block.durationSeconds));
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      throw new Error(`${foodId}: invalid duration for narration block ${block.id}`);
    }
    const localBlock = {
      ...block,
      audioFile: `/studio-data/uploads/narration/${foodId}/${filename}`,
      productionAudioFile: block.productionAudioFile || `production/episodes/${foodId}/voice/voice-v1-blocks/${filename}`,
      filename,
      docsAudioFile: block.docsAudioFile || `audio/episodes/${foodId}/voice-v1-blocks/${filename}`,
      durationSeconds,
      offsetSeconds: roundSeconds(offsetSeconds),
      wordCount: block.wordCount ?? null,
      loss: block.loss ?? null
    };
    offsetSeconds += durationSeconds;
    if (index < sourceManifest.blocks.length - 1) offsetSeconds += BLOCK_GAP_SECONDS;
    return localBlock;
  });

  return {
    ...sourceManifest,
    audioDirectory: `/studio-data/uploads/narration/${foodId}`,
    audioManifestFile: `/studio-data/uploads/split-audio/${foodId}/voice-v1-blocks-local.json`,
    blocks,
    productionAudioManifestFile: `production/episodes/${foodId}/voice/voice-v1-blocks.json`,
    title: `${foodName} voice-v1 split narration (Studio-local)`,
    durationSeconds: roundSeconds(offsetSeconds),
    docsManifestFile: `docs/audio/episodes/${foodId}/voice-v1-blocks.json`,
    blockGapSeconds: BLOCK_GAP_SECONDS
  };
}

function localSplitAudioFor(foodId, existing, localManifest) {
  return {
    ...existing,
    mode: 'split-blocks',
    take: 'voice-v1',
    manifestPath: `/studio-data/uploads/split-audio/${foodId}/voice-v1-blocks-local.json`,
    productionManifestPath: `production/episodes/${foodId}/voice/voice-v1-blocks.json`,
    blockCount: localManifest.blocks.length,
    blockGapSeconds: BLOCK_GAP_SECONDS,
    durationSeconds: localManifest.durationSeconds,
    blocks: localManifest.blocks,
    voice: localManifest.voice,
    voiceSelection: localManifest.voiceSelection,
    audioDirectory: localManifest.audioDirectory,
    docsManifestPath: `audio/episodes/${foodId}/voice-v1-blocks.json`
  };
}

function appFoodFor(food, localSplitAudio) {
  const image = {
    path: `/studio-data/uploads/images/${food.id}/${food.id}.png`,
    sourcePath: `sprites/header/food_images/${food.id}.png`,
    docsPath: `app/sprites/header/food_images/${food.id}.png`,
    width: 30,
    height: 30,
    naturalWidth: 30,
    naturalHeight: 30
  };
  return {
    ...food,
    assets: {
      ...(food.assets || {}),
      customFoodImage: image,
      sprite: {
        path: image.path,
        width: 30,
        height: 30,
        naturalWidth: 30,
        naturalHeight: 30
      }
    },
    episode: {
      ...(food.episode || {}),
      splitAudio: localSplitAudio
    }
  };
}

function jobFor(food, localManifest, localSplitAudio, timestamp, dateStamp) {
  const narrationText = String(food.episode?.narrationText || '').trim();
  if (!narrationText) throw new Error(`${food.id}: missing episode narrationText`);
  const installedFood = appFoodFor(food, localSplitAudio);
  const { episode: installedEpisode, ...installedFoodWithoutEpisode } = installedFood;
  const actions = [
    {
      type: 'downloadAsset',
      label: `${food.name} food image sprite`,
      kind: 'image',
      foodId: food.id,
      filename: `${food.id}.png`,
      sourcePath: `sprites/header/food_images/${food.id}.png`,
      attachToFood: true,
      assetPatch: { width: 30, height: 30, naturalWidth: 30, naturalHeight: 30 }
    },
    {
      type: 'upsertFood',
      label: `Install ${food.name} food entry`,
      food: installedFoodWithoutEpisode
    },
    {
      type: 'downloadAsset',
      label: `${food.name} approved narration script`,
      kind: 'script',
      foodId: food.id,
      filename: 'final-narration.txt',
      sourcePath: `production/episodes/${food.id}/voice/final-narration.txt`,
      attachToFood: true
    },
    ...localManifest.blocks.map(block => ({
      type: 'downloadAsset',
      label: `${food.name} voice-v1 narration block ${block.id}`,
      kind: 'narration',
      foodId: food.id,
      filename: block.filename,
      sourcePath: `docs/audio/episodes/${food.id}/voice-v1-blocks/${block.filename}`,
      attachToFood: false,
      role: 'split-audio-block',
      take: 'voice-v1'
    })),
    {
      type: 'downloadAsset',
      label: `${food.name} voice-v1 local split-audio manifest`,
      kind: 'split-audio',
      foodId: food.id,
      filename: 'voice-v1-blocks-local.json',
      sourcePath: `studio/agent-sync/assets/${food.id}/voice-v1-blocks-local.json`,
      attachToFood: true,
      take: 'voice-v1'
    },
    {
      type: 'upsertScript',
      label: `Install ${food.name} approved script and episode`,
      foodId: food.id,
      scriptText: narrationText,
      narrationText,
      episode: installedEpisode
    },
    {
      type: 'selectFood',
      label: `Open ${food.name} in Video Builder V2`,
      foodId: food.id
    }
  ];

  return {
    id: `${food.id}-full-entry-sprite-update-${dateStamp}`,
    title: `${food.name} full entry, sprite, and app-local split narration update`,
    description: `Install the approved ${food.name} episode data, attach the 30x30 food image sprite, and pull the ElevenLabs voice-v1 split narration into the local Studio app with app-local audio paths.`,
    status: 'ready',
    foodId: food.id,
    createdAt: timestamp,
    updatedAt: timestamp,
    tags: ['food-entry', 'script', 'narration', 'sprite', 'food-image', 'agent-sync', 'audio', 'split-audio', 'voice-v1', 'app-local-audio'],
    actions
  };
}

function main() {
  const foodIds = foodIdsFromArgs();
  if (!foodIds.length) {
    throw new Error('Usage: node scripts/foodranked-build-agent-sync-jobs.js <food-id> [...] [--date YYYYMMDD] [--timestamp ISO]');
  }
  const timestamp = optionValue('--timestamp') || new Date().toISOString();
  const dateStamp = optionValue('--date') || timestamp.slice(0, 10).replaceAll('-', '');
  const foods = readJson(FOODS_PATH);
  const index = readJson(INDEX_PATH);
  const jobs = [];

  for (const foodId of foodIds) {
    const food = foods.find(entry => entry.id === foodId);
    if (!food) throw new Error(`${foodId}: missing from docs/data/foods-index.json`);
    const manifestPath = path.join(ROOT, 'production', 'episodes', foodId, 'voice', 'voice-v1-blocks.json');
    const sourceManifest = readJson(manifestPath);
    if (!Array.isArray(sourceManifest.blocks) || sourceManifest.blocks.length !== 11) {
      throw new Error(`${foodId}: expected 11 split narration blocks`);
    }
    const spritePath = path.join(ROOT, 'sprites', 'header', 'food_images', `${foodId}.png`);
    if (!fs.existsSync(spritePath)) throw new Error(`${foodId}: missing canonical sprite ${spritePath}`);

    const localManifest = localManifestFor(foodId, food.name, sourceManifest);
    const localSplitAudio = localSplitAudioFor(foodId, food.episode?.splitAudio || {}, localManifest);
    const assetDir = path.join(ROOT, 'studio', 'agent-sync', 'assets', foodId);
    fs.mkdirSync(assetDir, { recursive: true });
    fs.writeFileSync(path.join(assetDir, 'voice-v1-blocks-local.json'), `${JSON.stringify(localManifest, null, 2)}\n`);
    jobs.push(jobFor(food, localManifest, localSplitAudio, timestamp, dateStamp));
  }

  const newIds = new Set(jobs.map(job => job.id));
  index.jobs = [...jobs, ...index.jobs.filter(job => !newIds.has(job.id))];
  index.updatedAt = timestamp;
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
  console.log(JSON.stringify({ status: 'ok', jobs: jobs.map(job => ({ id: job.id, actions: job.actions.length })) }, null, 2));
}

main();
