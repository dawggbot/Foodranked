#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { completeSfxProfile } = require('./lib/sfx-profiles');
const { completeMusicProfile } = require('./lib/music-profiles');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const publishedFoodsDir = path.join(repoRoot, 'docs', 'data', 'foods');
const episodesDir = path.join(repoRoot, 'outputs', 'episodes');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function withKeyAfter(source, key, value, afterKey) {
  const output = {};
  let inserted = false;
  for (const [entryKey, entryValue] of Object.entries(source)) {
    if (entryKey === key) continue;
    output[entryKey] = entryValue;
    if (entryKey === afterKey) {
      output[key] = value;
      inserted = true;
    }
  }
  if (!inserted) output[key] = value;
  return output;
}

function foodFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.sample.json'))
    .sort()
    .map(name => path.join(dir, name));
}

function foodIdFromFile(file) {
  return path.basename(file).replace(/\.sample\.json$/, '');
}

function assignFoodProfiles(dir, sourceProfiles = null) {
  let updated = 0;
  for (const file of foodFiles(dir)) {
    const food = readJson(file);
    const foodId = food.id || foodIdFromFile(file);
    const sourceProfile = sourceProfiles?.get(foodId) || {};
    const sfxProfile = sourceProfile.sfxProfile || completeSfxProfile(food.sfxProfile, foodId);
    const musicProfile = sourceProfile.musicProfile || completeMusicProfile(food.musicProfile, foodId);
    const withSfx = withKeyAfter(food, 'sfxProfile', sfxProfile, 'header');
    writeJson(file, withKeyAfter(withSfx, 'musicProfile', musicProfile, 'sfxProfile'));
    updated += 1;
  }
  return updated;
}

function loadSourceFoodProfiles() {
  const profiles = new Map();
  for (const file of foodFiles(foodsDir)) {
    const food = readJson(file);
    const foodId = food.id || foodIdFromFile(file);
    profiles.set(foodId, {
      sfxProfile: completeSfxProfile(food.sfxProfile, foodId),
      musicProfile: completeMusicProfile(food.musicProfile, foodId)
    });
  }
  return profiles;
}

function manifestFoodId(manifest, dirName) {
  if (manifest.food?.id) return manifest.food.id;
  return String(dirName || '').replace(/-compact$/, '');
}

function assignEpisodeProfiles(sourceProfiles) {
  if (!fs.existsSync(episodesDir)) return 0;
  let updated = 0;
  for (const dirName of fs.readdirSync(episodesDir).sort()) {
    const file = path.join(episodesDir, dirName, 'episode-manifest.json');
    if (!fs.existsSync(file)) continue;
    const manifest = readJson(file);
    const foodId = manifestFoodId(manifest, dirName);
    const sourceProfile = sourceProfiles.get(foodId) || {};
    const sfxProfile = completeSfxProfile(manifest.sfxProfile || sourceProfile.sfxProfile || null, foodId);
    const musicProfile = completeMusicProfile(manifest.musicProfile || sourceProfile.musicProfile || null, foodId);
    const withSfx = withKeyAfter(manifest, 'sfxProfile', sfxProfile, 'visualBinding');
    writeJson(file, withKeyAfter(withSfx, 'musicProfile', musicProfile, 'sfxProfile'));
    updated += 1;
  }
  return updated;
}

const sourceFoodCount = assignFoodProfiles(foodsDir);
const sourceProfiles = loadSourceFoodProfiles();
const publishedFoodCount = assignFoodProfiles(publishedFoodsDir, sourceProfiles);
const episodeCount = assignEpisodeProfiles(sourceProfiles);

console.log(JSON.stringify({
  sourceFoods: sourceFoodCount,
  publishedFoods: publishedFoodCount,
  episodeManifests: episodeCount
}, null, 2));
