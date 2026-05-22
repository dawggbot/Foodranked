#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const uploadDir = path.join(repoRoot, 'production', 'inbox', 'food-image-uploads');
const sourceSpriteDir = path.join(repoRoot, 'sprites', 'header', 'food_images');
const docsSpriteDir = path.join(repoRoot, 'docs', 'app', 'sprites', 'header', 'food_images');
const foodsDir = path.join(repoRoot, 'foods');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function relativeRepoPath(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function uploadFilesFromArgs(args) {
  if (args.length) return args.map(file => path.resolve(repoRoot, file));
  if (!fs.existsSync(uploadDir)) return [];
  return fs.readdirSync(uploadDir)
    .filter(name => /\.png$/i.test(name))
    .sort()
    .map(name => path.join(uploadDir, name));
}

function foodIdFromUpload(file) {
  return path.basename(file, path.extname(file)).toLowerCase();
}

function validateUpload(file, foodId) {
  if (path.extname(file).toLowerCase() !== '.png') {
    throw new Error(`Only PNG uploads are supported for now: ${relativeRepoPath(file)}`);
  }
  if (!fs.existsSync(file)) throw new Error(`Upload file does not exist: ${relativeRepoPath(file)}`);
  const foodPath = path.join(foodsDir, `${foodId}.sample.json`);
  if (!fs.existsSync(foodPath)) {
    throw new Error(`No matching food profile for ${foodId}. Expected ${relativeRepoPath(foodPath)}.`);
  }
}

function importSprite(file, foodId) {
  ensureDir(sourceSpriteDir);
  ensureDir(docsSpriteDir);
  const sourceTarget = path.join(sourceSpriteDir, `${foodId}.png`);
  const docsTarget = path.join(docsSpriteDir, `${foodId}.png`);
  fs.copyFileSync(file, sourceTarget);
  fs.copyFileSync(file, docsTarget);
  return { sourceTarget, docsTarget };
}

function main() {
  const uploads = uploadFilesFromArgs(process.argv.slice(2));
  if (!uploads.length) {
    console.log('No food image uploads found.');
    return;
  }

  const processed = [];
  for (const upload of uploads) {
    const foodId = foodIdFromUpload(upload);
    validateUpload(upload, foodId);
    const imported = importSprite(upload, foodId);
    run(process.execPath, ['scripts/foodranked-generate-episode.js', foodId, '--compact', '--no-cta']);
    run(process.execPath, ['scripts/foodranked-generate-voice.js', foodId, '--take', 'voice-v1']);
    processed.push({
      foodId,
      upload: relativeRepoPath(upload),
      sourceSprite: relativeRepoPath(imported.sourceTarget),
      docsSprite: relativeRepoPath(imported.docsTarget)
    });
  }

  run(process.execPath, ['scripts/generate-dashboard-data.js']);
  console.log(JSON.stringify({ status: 'ok', processed }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
