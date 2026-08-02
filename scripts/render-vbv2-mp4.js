#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { validateVbv2PlacementPayload } = require('./vbv2-placement-validation');

const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(process.env.FOODRANKED_STUDIO_DATA_DIR || path.join(REPO_ROOT, 'studio-data'));
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;
const AUTHOR_GRID_WIDTH = 105;
const AUTHOR_GRID_HEIGHT = 186.666667;
const PRODUCTION_DATABASE_KEY = 'foodranked-production-database-v1';
const VIDEO_STATE_KEY = 'foodranked-video-builder-v2-state-v1';
const DISPLAY_STATE_KEY = 'foodranked-display-builder-v2-state-v1';
const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
const LAYOUT_STATE_KEYS = new Set([
  'foodranked-layout-builder-v4',
  'foodranked-layout-builder-sprite-layouts-v1'
]);
const DEFAULT_PORT = 4190;
const DEFAULT_FPS = 30;
const DEFAULT_MUSIC_VOLUME = 0.14;
const DEFAULT_NARRATION_VOLUME = 1;
const AUDIO_DURATION_CACHE = new Map();

const CONTENT_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.m4a', 'audio/mp4'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp']
]);

function usage() {
  return `
Render a VBv2 preview into a published MP4.

Usage:
  node scripts/render-vbv2-mp4.js <food-id> [options]

Examples:
  node scripts/render-vbv2-mp4.js bacon --placement-json /tmp/bacon-dbv2-placement.json
  node scripts/render-vbv2-mp4.js bacon --placement-json /tmp/bacon-dbv2-placement.json --seconds 3 --fps 10 --output /tmp/bacon-test.mp4

Options:
  --fps <number>             Frames per second. Default: ${DEFAULT_FPS}
  --width <pixels>           Output width. Default: ${DEFAULT_WIDTH}
  --height <pixels>          Output height. Default: ${DEFAULT_HEIGHT}
  --capture-width <pixels>   Browser capture width. Default: output width.
  --capture-height <pixels>  Browser capture height. Default: output height.
  --output <path>            Output MP4 path. Default: docs/video/episodes/<food-id>/<food-id>-vbv2.mp4
  --seconds <number>         Render only the first N seconds. Useful for smoke tests.
  --port <number>            Local static server port. Default: ${DEFAULT_PORT}
  --placement-json <path>    Seed VBv2 with a DBv2/VBv2 placement payload.
  --layout-state-json <path> Seed current Layout Builder localStorage keys before render.
  --video-state-json <path>  Seed VBv2 with a Video Builder v2 state payload.
  --database-json <path>     Seed the app input database for Studio-created foods/assets.
  --no-audio                 Encode video without narration/music.
  --no-music                 Keep narration, omit background music.
  --no-sfx                   Keep narration/music, omit VBv2 sound effects.
  --music-volume <number>    Background music volume. Default: ${DEFAULT_MUSIC_VOLUME}
  --narration-volume <num>   Narration volume. Default: ${DEFAULT_NARRATION_VOLUME}
  --sfx-volume <number>      Sound effects volume multiplier. Default: 1
  --keep-frames              Keep the temporary PNG frame directory.
  --help                     Show this help.
`.trim();
}

function parseArgs(argv) {
  const options = {
    fps: DEFAULT_FPS,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    captureWidth: null,
    captureHeight: null,
    output: '',
    seconds: null,
    port: DEFAULT_PORT,
    placementJson: '',
    layoutStateJson: '',
    videoStateJson: '',
    databaseJson: '',
    audio: true,
    music: true,
    sfx: true,
    musicVolume: DEFAULT_MUSIC_VOLUME,
    narrationVolume: DEFAULT_NARRATION_VOLUME,
    sfxVolume: 1,
    keepFrames: false
  };

  let foodId = '';
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (!arg.startsWith('--') && !foodId) {
      foodId = arg;
      continue;
    }

    const readValue = name => {
      const value = argv[index + 1];
      if (value == null || value.startsWith('--')) {
        throw new Error(`${name} requires a value.`);
      }
      index += 1;
      return value;
    };

    if (arg === '--fps') options.fps = Number(readValue(arg));
    else if (arg === '--width') options.width = Number(readValue(arg));
    else if (arg === '--height') options.height = Number(readValue(arg));
    else if (arg === '--capture-width') options.captureWidth = Number(readValue(arg));
    else if (arg === '--capture-height') options.captureHeight = Number(readValue(arg));
    else if (arg === '--output') options.output = readValue(arg);
    else if (arg === '--seconds') options.seconds = Number(readValue(arg));
    else if (arg === '--port') options.port = Number(readValue(arg));
    else if (arg === '--placement-json') options.placementJson = readValue(arg);
    else if (arg === '--layout-state-json') options.layoutStateJson = readValue(arg);
    else if (arg === '--video-state-json') options.videoStateJson = readValue(arg);
    else if (arg === '--database-json') options.databaseJson = readValue(arg);
    else if (arg === '--music-volume') options.musicVolume = Number(readValue(arg));
    else if (arg === '--narration-volume') options.narrationVolume = Number(readValue(arg));
    else if (arg === '--sfx-volume') options.sfxVolume = Number(readValue(arg));
    else if (arg === '--no-audio') options.audio = false;
    else if (arg === '--no-music') options.music = false;
    else if (arg === '--no-sfx') options.sfx = false;
    else if (arg === '--keep-frames') options.keepFrames = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!options.help && !foodId) throw new Error('Missing food id.');
  for (const [name, value] of Object.entries({
    fps: options.fps,
    width: options.width,
    height: options.height,
    port: options.port
  })) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid ${name}: ${value}`);
  }
  if (options.seconds != null && (!Number.isFinite(options.seconds) || options.seconds <= 0)) {
    throw new Error(`Invalid seconds: ${options.seconds}`);
  }
  if (options.captureWidth == null) options.captureWidth = Math.max(1, Math.round(options.width));
  if (options.captureHeight == null) options.captureHeight = Math.max(1, Math.round(options.height));
  for (const [name, value] of Object.entries({
    captureWidth: options.captureWidth,
    captureHeight: options.captureHeight
  })) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid ${name}: ${value}`);
  }
  if (!Number.isFinite(options.musicVolume) || options.musicVolume < 0) {
    throw new Error(`Invalid music volume: ${options.musicVolume}`);
  }
  if (!Number.isFinite(options.narrationVolume) || options.narrationVolume < 0) {
    throw new Error(`Invalid narration volume: ${options.narrationVolume}`);
  }
  if (!Number.isFinite(options.sfxVolume) || options.sfxVolume < 0) {
    throw new Error(`Invalid SFX volume: ${options.sfxVolume}`);
  }

  return { foodId: safeSlug(foodId), options };
}

function safeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function optionalRequire(moduleName) {
  try {
    return require(moduleName);
  } catch {
    return null;
  }
}

function bundledCommandPath(command) {
  if (command === 'ffmpeg') {
    const windowsFfmpeg = process.platform === 'win32' ? optionalRequire('@ffmpeg-installer/win32-x64') : null;
    if (windowsFfmpeg?.path) return process.env.FFMPEG_PATH || windowsFfmpeg.path;
    return process.env.FFMPEG_PATH || optionalRequire('ffmpeg-static') || command;
  }
  if (command === 'ffprobe') {
    const probe = optionalRequire('ffprobe-static');
    return process.env.FFPROBE_PATH || probe?.path || command;
  }
  return command;
}

function requireCommand(command, installHint) {
  const executable = bundledCommandPath(command);
  const result = spawnSync(executable, ['-version'], { stdio: 'ignore' });
  if (result.status === 0) return;
  throw new Error(`${command} is required to render MP4 files.\n${installHint}`);
}

function readFoodsIndex() {
  const file = path.join(REPO_ROOT, 'docs/data/foods-index.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readOptionalJson(filePath, fallback = null) {
  if (!filePath) return fallback;
  const resolved = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function cleanString(value) {
  return String(value ?? '').trim();
}

function cleanObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function finiteNumber(value, fallback = null) {
  if (value === '' || value == null) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function inputDatabaseFoods(database) {
  const foods = database?.foods && typeof database.foods === 'object' && !Array.isArray(database.foods)
    ? database.foods
    : {};
  return foods;
}

function baseFoodFromInputEntry(entry) {
  return {
    id: entry.id,
    name: entry.name || entry.displayName || entry.id,
    displayName: entry.displayName || '',
    shortName: entry.shortName || '',
    foodType: entry.foodType || 'misc',
    foodTypeLabel: entry.foodTypeLabel || '',
    identity: entry.identity || '',
    basis: entry.basis || { value: 100, unit: 'g' },
    kcal: finiteNumber(entry.kcal ?? entry.header?.kcal, null),
    header: cleanObject(entry.header),
    metrics: cleanObject(entry.metrics),
    assets: cleanObject(entry.assets),
    episode: cleanObject(entry.episode),
    status: cleanObject(entry.status),
    foodPatch: cleanObject(entry.foodPatch),
    customDatabaseFood: true
  };
}

function mergeInputFood(baseFood, entry) {
  if (!entry || entry.deleted) return null;
  const base = baseFood && typeof baseFood === 'object' ? JSON.parse(JSON.stringify(baseFood)) : baseFoodFromInputEntry(entry);
  const merged = {
    ...base,
    ...entry,
    basis: { ...(base.basis || {}), ...(entry.basis || {}) },
    header: { ...(base.header || {}), ...(entry.header || {}) },
    metrics: { ...(base.metrics || {}), ...(entry.metrics || {}) },
    assets: { ...(base.assets || {}), ...(entry.assets || {}) },
    episode: { ...(base.episode || {}), ...(entry.episode || {}) },
    status: { ...(base.status || {}), ...(entry.status || {}) },
    customDatabaseFood: Boolean(base.customDatabaseFood || !baseFood)
  };

  const customFoodImagePath = cleanString(entry.customFoodImagePath || entry.foodSpritePath || entry.assets?.customFoodImage?.path);
  if (customFoodImagePath) {
    merged.assets.customFoodImage = {
      ...(merged.assets.customFoodImage || {}),
      path: customFoodImagePath
    };
    const width = finiteNumber(entry.customFoodImageWidth || entry.assets?.customFoodImage?.width, null);
    const height = finiteNumber(entry.customFoodImageHeight || entry.assets?.customFoodImage?.height, null);
    if (width != null) merged.assets.customFoodImage.width = width;
    if (height != null) merged.assets.customFoodImage.height = height;
  }

  const audioPath = cleanString(entry.audioPath || entry.library?.audioPath);
  if (audioPath) {
    merged.episode.audio = {
      ...(merged.episode.audio || {}),
      path: audioPath,
      take: cleanString(entry.audioTake || entry.library?.audioTake) || merged.episode.audio?.take || 'studio-input'
    };
  }

  const splitManifestPath = cleanString(entry.splitAudioManifestPath || entry.library?.splitAudioManifestPath);
  if (splitManifestPath) {
    merged.episode.splitAudio = {
      ...(merged.episode.splitAudio || {}),
      manifestPath: splitManifestPath,
      take: cleanString(entry.splitAudioTake || entry.library?.splitAudioTake) || merged.episode.splitAudio?.take || 'studio-input'
    };
  }

  merged.kcal = finiteNumber(entry.kcal ?? entry.header?.kcal, base.kcal ?? base.header?.kcal ?? null);
  merged.finalizedDownloaded = Boolean(entry.finalizedDownloaded || entry.status?.finalizedDownloaded);
  return merged;
}

function findFood(foods, foodId, database = null) {
  const base = foods.find(food => safeSlug(food.id) === foodId || safeSlug(food.name) === foodId) || null;
  const dbFoods = inputDatabaseFoods(database);
  const entry = dbFoods[foodId] || Object.values(dbFoods).find(food => safeSlug(food?.id || food?.name) === foodId) || null;
  if (entry?.deleted) return null;
  if (entry) return mergeInputFood(base, entry);
  return base;
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

function publishedOutputPath(food, explicitOutput) {
  if (explicitOutput) return path.resolve(explicitOutput);
  const id = safeSlug(food.id || food.name);
  return path.join(REPO_ROOT, 'docs/video/episodes', id, `${id}-vbv2.mp4`);
}

function resolveDocsAsset(assetPath) {
  const raw = String(assetPath || '').trim();
  if (!raw || /^(?:https?:)?\/\//i.test(raw)) return '';
  const withoutDot = raw.replace(/^\.\//, '');
  const withoutLeadingSlash = withoutDot.replace(/^\/+/, '');
  if (withoutLeadingSlash.startsWith('studio-data/')) {
    return path.join(DATA_DIR, withoutLeadingSlash.slice('studio-data/'.length));
  }
  if (path.isAbsolute(withoutDot)) return withoutDot;
  if (withoutDot.startsWith('docs/')) return path.join(REPO_ROOT, withoutDot);
  return path.join(REPO_ROOT, 'docs', withoutDot);
}

function mediaDurationSeconds(filePath) {
  if (!filePath) return null;
  const key = path.resolve(filePath);
  if (AUDIO_DURATION_CACHE.has(key)) return AUDIO_DURATION_CACHE.get(key);
  let duration = null;
  try {
    const probe = readJsonFromCommand('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'json',
      key
    ], { label: `Probe audio ${path.basename(key)}` });
    const value = Number(probe?.format?.duration);
    if (Number.isFinite(value) && value > 0) duration = value;
  } catch {}
  AUDIO_DURATION_CACHE.set(key, duration);
  return duration;
}

function ffmpegNumber(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, match => (match === '.' ? '' : ''));
}

function normalizedPlaybackRate(value) {
  const rate = Number(value || 1);
  if (!Number.isFinite(rate) || rate <= 0) return 1;
  return Math.max(0.125, Math.min(16, rate));
}

function atempoFilters(playbackRate) {
  let remaining = normalizedPlaybackRate(playbackRate);
  const filters = [];
  while (remaining > 2) {
    filters.push('atempo=2');
    remaining /= 2;
  }
  while (remaining < 0.5) {
    filters.push('atempo=0.5');
    remaining /= 0.5;
  }
  if (Math.abs(remaining - 1) > 0.001) filters.push(`atempo=${ffmpegNumber(remaining)}`);
  return filters;
}

function run(command, args, { label = command } = {}) {
  return new Promise((resolve, reject) => {
    const executable = bundledCommandPath(command);
    console.log(`${label}: ${executable} ${args.map(shellQuote).join(' ')}`);
    const child = spawn(executable, args, {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'inherit', 'inherit']
    });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

function shellQuote(value) {
  const text = String(value);
  return /^[A-Za-z0-9_./:=+-]+$/.test(text) ? text : JSON.stringify(text);
}

function runCapture(command, args, { label = command } = {}) {
  const executable = bundledCommandPath(command);
  const result = spawnSync(executable, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status === 0) return result.stdout || '';
  const stderr = String(result.stderr || '').trim();
  throw new Error(`${label} failed with exit code ${result.status}${stderr ? `: ${stderr}` : ''}`);
}

function readJsonFromCommand(command, args, options = {}) {
  const output = runCapture(command, args, options);
  return JSON.parse(output || '{}');
}

function resolvePageAssetPath(src, pageUrl) {
  if (!src || /^(?:data:|blob:)/i.test(String(src))) return '';
  const url = new URL(src, pageUrl);
  if (url.protocol !== 'http:') return '';
  const pathname = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  if (pathname.startsWith('studio-data/')) {
    const filePath = path.normalize(path.join(DATA_DIR, pathname.slice('studio-data/'.length)));
    return isInside(DATA_DIR, filePath) ? filePath : '';
  }
  const filePath = path.normalize(path.join(REPO_ROOT, pathname));
  return isInside(REPO_ROOT, filePath) ? filePath : '';
}

function gifFrameProbe(gifPath) {
  const framesProbe = readJsonFromCommand('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'frame=duration_time,pkt_duration_time',
    '-of',
    'json',
    gifPath
  ], { label: `Probe GIF frames ${path.basename(gifPath)}` });
  const streamProbe = readJsonFromCommand('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height,duration,nb_frames',
    '-of',
    'json',
    gifPath
  ], { label: `Probe GIF stream ${path.basename(gifPath)}` });
  return {
    frames: Array.isArray(framesProbe.frames) ? framesProbe.frames : [],
    stream: Array.isArray(streamProbe.streams) ? streamProbe.streams[0] || {} : {}
  };
}

function dataUrlForPng(filePath) {
  return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
}

async function buildGifFrameOverride({ src, pageUrl, workDir, index }) {
  const gifPath = resolvePageAssetPath(src, pageUrl);
  if (!gifPath || path.extname(gifPath).toLowerCase() !== '.gif' || !fs.existsSync(gifPath)) return null;

  const frameDir = path.join(workDir, 'gif-frame-overrides', `gif-${String(index).padStart(3, '0')}`);
  fs.mkdirSync(frameDir, { recursive: true });
  const framePattern = path.join(frameDir, 'frame-%04d.png');
  await run('ffmpeg', [
    '-y',
    '-i',
    gifPath,
    '-fps_mode',
    'passthrough',
    framePattern
  ], { label: `Extract GIF frames ${path.basename(gifPath)}` });

  const frameFiles = fs.readdirSync(frameDir)
    .filter(name => /^frame-\d+\.png$/i.test(name))
    .sort()
    .map(name => path.join(frameDir, name));
  if (!frameFiles.length) return null;

  const probe = gifFrameProbe(gifPath);
  const stream = probe.stream || {};
  const frameDelaySeconds = probe.frames
    .slice(0, frameFiles.length)
    .map(frame => Number(frame.duration_time || frame.pkt_duration_time || 0))
    .map(value => (Number.isFinite(value) && value > 0 ? value : 0));
  const probedDuration = Number(stream.duration);
  const nativeSeconds = frameDelaySeconds.reduce((sum, value) => sum + value, 0)
    || (Number.isFinite(probedDuration) && probedDuration > 0 ? probedDuration : frameFiles.length * 0.1);
  const fallbackDelay = nativeSeconds / frameFiles.length;
  const normalizedDelays = frameFiles.map((_, frameIndex) => {
    const delay = frameDelaySeconds[frameIndex];
    return delay > 0 ? delay : fallbackDelay;
  });

  return {
    src,
    width: Number(stream.width) || null,
    height: Number(stream.height) || null,
    nativeSeconds,
    frameDelaySeconds: normalizedDelays,
    frames: frameFiles.map(dataUrlForPng)
  };
}

async function installGifFrameOverrides(page, workDir) {
  const gifSources = await page.evaluate(() => window.FoodRankedVBv2Renderer?.gifSources?.() || []);
  const uniqueSources = [...new Set((Array.isArray(gifSources) ? gifSources : []).filter(Boolean))];
  const overrides = [];
  for (let index = 0; index < uniqueSources.length; index += 1) {
    const override = await buildGifFrameOverride({
      src: uniqueSources[index],
      pageUrl: page.url(),
      workDir,
      index
    });
    if (override) overrides.push(override);
  }
  if (!overrides.length) return;
  await page.evaluate(payload => {
    window.FoodRankedVBv2Renderer?.installGifFrameOverrides?.(payload);
  }, overrides);
  console.log(`Installed ${overrides.length} GIF frame override${overrides.length === 1 ? '' : 's'}`);
}

function startStaticServer(port) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      response.writeHead(400);
      response.end('Bad request');
      return;
    }

    const relative = pathname.replace(/^\/+/, '');
    const servingStudioData = relative.startsWith('studio-data/');
    let filePath = servingStudioData
      ? path.normalize(path.join(DATA_DIR, relative.slice('studio-data/'.length)))
      : path.normalize(path.join(REPO_ROOT, pathname));
    const staticRoot = servingStudioData ? DATA_DIR : REPO_ROOT;
    if (!isInside(staticRoot, filePath)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    fs.readFile(filePath, (error, contents) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      const stat = fs.statSync(filePath);
      response.writeHead(200, {
        'Content-Type': CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': 'no-store'
      });
      if (request.method === 'HEAD') response.end();
      else response.end(contents);
    });
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise(closeResolve => server.close(closeResolve))
      });
    });
  });
}

async function renderFrames({ food, foodId, options, framesDir, baseUrl, workDir }) {
  const placementPayload = validateVbv2PlacementPayload(readOptionalJson(options.placementJson, null), food);
  const layoutStatePayload = readOptionalJson(options.layoutStateJson, {});
  const videoStatePayload = readOptionalJson(options.videoStateJson, {});
  const databasePayload = readOptionalJson(options.databaseJson, {});

  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    throw new Error('Playwright is required. Install project dependencies before rendering.');
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: options.captureWidth, height: options.captureHeight },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  try {
    await page.addInitScript(({ selectedFoodId, databaseKey, videoStateKey, displayStateKey, placementExportKey, layoutStateKeys, layoutStatePayload, placementPayload, videoStatePayload, databasePayload }) => {
      const mergeState = (key, patch) => {
        let current = {};
        try {
          current = JSON.parse(localStorage.getItem(key) || '{}') || {};
        } catch {
          current = {};
        }
        localStorage.setItem(key, JSON.stringify({ ...current, ...patch }));
      };
      if (layoutStatePayload && typeof layoutStatePayload === 'object') {
        for (const [key, raw] of Object.entries(layoutStatePayload)) {
          if (!layoutStateKeys.includes(key) || raw == null) continue;
          localStorage.setItem(key, typeof raw === 'string' ? raw : JSON.stringify(raw));
        }
      }
      if (databasePayload && typeof databasePayload === 'object') {
        localStorage.setItem(databaseKey, JSON.stringify(databasePayload));
      }
      if (placementPayload && typeof placementPayload === 'object') {
        localStorage.setItem(placementExportKey, JSON.stringify(placementPayload));
      }
      mergeState(videoStateKey, {
        ...(videoStatePayload && typeof videoStatePayload === 'object' ? videoStatePayload : {}),
        selectedFoodId,
        currentTime: 0,
        selectedSceneId: 'intro'
      });
      mergeState(displayStateKey, { selectedFoodId });
    }, {
      selectedFoodId: food.id || foodId,
      databaseKey: PRODUCTION_DATABASE_KEY,
      videoStateKey: VIDEO_STATE_KEY,
      displayStateKey: DISPLAY_STATE_KEY,
      placementExportKey: PLACEMENT_EXPORT_KEY,
      layoutStateKeys: [...LAYOUT_STATE_KEYS],
      layoutStatePayload,
      placementPayload,
      videoStatePayload,
      databasePayload
    });

    await page.goto(`${baseUrl}/docs/video-builder-v2/index.html?render=mp4&food=${encodeURIComponent(foodId)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.addStyleTag({ content: renderCss(options.captureWidth, options.captureHeight) });
    await page.waitForSelector('#videoStage', { state: 'attached' });
    await page.waitForFunction(() => window.FoodRankedVBv2Renderer?.ready?.(), null, { timeout: 60000 });
    await page.evaluate(() => document.fonts?.ready || Promise.resolve()).catch(() => {});
    await page.waitForFunction(() => document.querySelector('#videoStage')?.childElementCount > 0, null, { timeout: 30000 });
    await waitForStageImages(page);
    await installGifFrameOverrides(page, workDir);
    await page.evaluate(() => window.FoodRankedVBv2Renderer?.waitForAssets?.()).catch(error => {
      console.warn(`Renderer asset wait skipped: ${error?.message || error}`);
    });

    const pixelUnit = await rendererPixelUnit(page, options.captureWidth);
    const browserDuration = await page.evaluate(() => window.FoodRankedVBv2Renderer?.duration?.() || 0);
    const rendererManifest = await page.evaluate(() => window.FoodRankedVBv2Renderer?.manifest?.() || null);
    const narrationEvents = await page.evaluate(() => window.FoodRankedVBv2Renderer?.narrationEvents?.() || []);
    const sfxEvents = await page.evaluate(() => window.FoodRankedVBv2Renderer?.sfxEvents?.() || []);
    const sourceDuration = Number(food?.episode?.splitAudio?.durationSeconds || food?.episode?.duration || 0);
    const duration = options.seconds || Math.max(browserDuration, sourceDuration);
    const frameCount = Math.max(1, Math.ceil(duration * options.fps));
    const stage = await page.$('#videoStage');

    await setVideoTime(page, 0, pixelUnit);
    const box = await stage.boundingBox();
    if (!box) throw new Error('Could not read the VBv2 stage size.');
    const roundedWidth = Math.round(box.width);
    const roundedHeight = Math.round(box.height);
    if (roundedWidth !== options.captureWidth || roundedHeight !== options.captureHeight) {
      throw new Error(`VBv2 stage rendered at ${roundedWidth}x${roundedHeight}, expected ${options.captureWidth}x${options.captureHeight}.`);
    }

    for (let index = 0; index < frameCount; index += 1) {
      const time = Math.min(duration, index / options.fps);
      await setVideoTime(page, time, pixelUnit);
      const framePath = path.join(framesDir, `frame-${String(index + 1).padStart(6, '0')}.png`);
      await stage.screenshot({ path: framePath, type: 'png' });
      if ((index + 1) % Math.max(1, options.fps * 2) === 0 || index + 1 === frameCount) {
        console.log(`Rendered ${index + 1}/${frameCount} frames (${time.toFixed(2)}s)`);
      }
    }

    return { duration, frameCount, width: roundedWidth, height: roundedHeight, sfxEvents, narrationEvents, rendererManifest };
  } finally {
    await browser.close();
  }
}

function renderCss(width, height) {
  return `
    html,
    body {
      width: ${width}px !important;
      height: ${height}px !important;
      min-width: ${width}px !important;
      min-height: ${height}px !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: #000 !important;
    }

    .app-shell {
      width: ${width}px !important;
      height: ${height}px !important;
      min-height: ${height}px !important;
      display: block !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: #000 !important;
    }

    .left-panel,
    .right-panel,
    .preview-toolbar,
    .diagnostics-row,
    .timeline-strip {
      display: none !important;
    }

    .preview-column {
      width: ${width}px !important;
      height: ${height}px !important;
      max-width: none !important;
      max-height: none !important;
      display: block !important;
      padding: 0 !important;
      margin: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      overflow: hidden !important;
      background: transparent !important;
    }

    .phone-shell {
      width: ${width}px !important;
      height: ${height}px !important;
      min-width: ${width}px !important;
      min-height: ${height}px !important;
      max-width: none !important;
      max-height: none !important;
      aspect-ratio: auto !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
      overflow: hidden !important;
    }

    .video-stage {
      width: ${width}px !important;
      height: ${height}px !important;
      min-width: ${width}px !important;
      min-height: ${height}px !important;
      max-width: none !important;
      max-height: none !important;
      aspect-ratio: auto !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
  `;
}

async function waitForStageImages(page) {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('#videoStage img'));
    return images.every(image => image.complete && image.naturalWidth > 0);
  }, null, { timeout: 30000 }).catch(() => {
    console.warn('Some stage images were still loading after 30s; continuing with current frame state.');
  });
}

async function rendererPixelUnit(page, fallbackWidth) {
  return page.evaluate(({ authorGridWidth, outputWidth }) => {
    const positiveNumber = value => {
      const parsed = Number.parseFloat(String(value || ''));
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };
    const rootStyle = getComputedStyle(document.documentElement);
    const gridWidth = positiveNumber(rootStyle.getPropertyValue('--layout-builder-canvas-grid-width'))
      || positiveNumber(rootStyle.getPropertyValue('--grid-width'))
      || authorGridWidth;
    const stageWidth = positiveNumber(document.querySelector('#videoStage')?.getBoundingClientRect?.().width)
      || outputWidth;
    const pixelUnit = stageWidth / gridWidth;
    return Number.isFinite(pixelUnit) && pixelUnit > 0 ? pixelUnit : outputWidth / authorGridWidth;
  }, {
    authorGridWidth: AUTHOR_GRID_WIDTH,
    outputWidth: fallbackWidth
  });
}

async function setVideoTime(page, time, pixelUnit) {
  await page.evaluate(({ value, unit }) => new Promise(resolve => {
    document.documentElement.style.setProperty('--pixel-unit', String(unit));
    const renderer = window.FoodRankedVBv2Renderer;
    if (renderer?.prepareFrame) {
      Promise.resolve(renderer.prepareFrame(value, { pixelUnit: unit }))
        .catch(() => renderer.setTime?.(value, { pixelUnit: unit }))
        .then(() => {
          document.documentElement.style.setProperty('--pixel-unit', String(unit));
          requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--pixel-unit', String(unit));
            requestAnimationFrame(resolve);
          });
        });
      return;
    }
    if (renderer?.setTime) {
      renderer.setTime(value, { pixelUnit: unit });
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pixel-unit', String(unit));
        requestAnimationFrame(resolve);
      });
      return;
    }
    const input = document.querySelector('#timeScrub');
    if (!input) {
      resolve();
      return;
    }
    input.value = String(Math.round(value * 100));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.documentElement.style.setProperty('--pixel-unit', String(unit));
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--pixel-unit', String(unit));
      requestAnimationFrame(resolve);
    });
  }), { value: time, unit: pixelUnit });
}

function splitAudioBlocks(food) {
  const audio = food?.episode?.splitAudio || food?.splitAudio || null;
  if (audio?.mode !== 'split-blocks' || !Array.isArray(audio.blocks)) return [];
  return audio.blocks
    .map(block => ({
      path: resolveDocsAsset(block.path),
      offsetSeconds: Number(block.offsetSeconds || 0),
      durationSeconds: Number(block.durationSeconds || 0),
      sourceOffsetSeconds: 0,
      id: block.id || block.kind || ''
    }))
    .filter(block => block.path && fs.existsSync(block.path));
}

function singleNarrationTrack(food) {
  const audio = food?.episode?.audio || food?.audio || null;
  const audioPath = resolveDocsAsset(audio?.path);
  if (!audioPath || !fs.existsSync(audioPath)) return [];
  return [{ path: audioPath, offsetSeconds: 0, durationSeconds: Number(audio?.durationSeconds || 0), sourceOffsetSeconds: 0, id: 'narration' }];
}

function normalizeRendererNarrationEvents(events) {
  if (!Array.isArray(events)) return [];
  const missing = new Set();
  const normalized = events
    .map((event, index) => {
      const audioPath = resolveDocsAsset(event?.path);
      if (!audioPath || !fs.existsSync(audioPath)) {
        if (event?.path) missing.add(event.path);
        return null;
      }
      const offsetSeconds = Number(event.time ?? event.offsetSeconds ?? 0);
      if (!Number.isFinite(offsetSeconds) || offsetSeconds < 0) return null;
      const eventDurationSeconds = Number(event.durationSeconds ?? 0);
      const sourceOffsetSeconds = Number(event.sourceOffsetSeconds ?? 0);
      const availableMediaSeconds = Math.max(0, (mediaDurationSeconds(audioPath) || 0) - Math.max(0, Number.isFinite(sourceOffsetSeconds) ? sourceOffsetSeconds : 0));
      const durationSeconds = Math.max(
        Number.isFinite(eventDurationSeconds) && eventDurationSeconds > 0 ? eventDurationSeconds : 0,
        availableMediaSeconds
      );
      const volume = Number(event.volume);
      return {
        path: audioPath,
        offsetSeconds,
        durationSeconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 0,
        sourceOffsetSeconds: Number.isFinite(sourceOffsetSeconds) && sourceOffsetSeconds > 0 ? sourceOffsetSeconds : 0,
        volume: Number.isFinite(volume) && volume >= 0 ? volume : null,
        id: event.id || event.key || event.kind || `narration-${index}`
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.offsetSeconds - b.offsetSeconds || a.id.localeCompare(b.id));

  for (const item of missing) console.warn(`Skipping missing narration asset: ${item}`);
  return normalized;
}

function narrationInputsForFood(food, rendererNarrationEvents = []) {
  const rendererInputs = normalizeRendererNarrationEvents(rendererNarrationEvents);
  if (rendererInputs.length) return rendererInputs;
  const narrationBlocks = splitAudioBlocks(food);
  return narrationBlocks.length ? narrationBlocks : singleNarrationTrack(food);
}

function musicPathForFood(food) {
  const profile = food?.episode?.musicProfile || food?.musicProfile || {};
  const backgroundMusic = profile.backgroundMusic || profile.background || profile.music;
  const value = typeof backgroundMusic === 'string' ? backgroundMusic : backgroundMusic?.path;
  const musicPath = resolveDocsAsset(value);
  return musicPath && fs.existsSync(musicPath) ? musicPath : '';
}

function normalizeSfxEvents(events, options, duration) {
  if (!options.sfx || !Array.isArray(events)) return [];
  const missing = new Set();
  const normalized = events
    .map((event, index) => {
      const assetPath = resolveDocsAsset(event?.path);
      if (!assetPath || !fs.existsSync(assetPath)) {
        if (event?.path) missing.add(event.path);
        return null;
      }
      const time = Number(event.time || 0);
      if (!Number.isFinite(time) || time > duration) return null;
      const volume = Number(event.volume == null ? 1 : event.volume) * options.sfxVolume;
      if (!Number.isFinite(volume) || volume <= 0) return null;
      return {
        id: event.key || `${event.kind || 'sfx'}-${index}`,
        kind: event.kind || 'sfx',
        path: assetPath,
        time: Math.max(0, time),
        volume,
        playbackRate: normalizedPlaybackRate(event.playbackRate),
        sourceOffsetSeconds: Math.max(0, Number(event.sourceOffsetSeconds || 0)),
        sourceSliceSeconds: Number.isFinite(Number(event.sourceSliceSeconds)) && Number(event.sourceSliceSeconds) > 0
          ? Number(event.sourceSliceSeconds)
          : null,
        durationSeconds: Number.isFinite(Number(event.durationSeconds)) && Number(event.durationSeconds) > 0
          ? Number(event.durationSeconds)
          : null,
        fadeInSeconds: Number.isFinite(Number(event.fadeInSeconds)) && Number(event.fadeInSeconds) > 0
          ? Number(event.fadeInSeconds)
          : 0,
        fadeOutSeconds: Number.isFinite(Number(event.fadeOutSeconds)) && Number(event.fadeOutSeconds) > 0
          ? Number(event.fadeOutSeconds)
          : 0,
        lowpassFrequencyHz: Number.isFinite(Number(event.lowpassFrequencyHz)) && Number(event.lowpassFrequencyHz) > 0
          ? Number(event.lowpassFrequencyHz)
          : null,
        lowpassQ: Number.isFinite(Number(event.lowpassQ)) && Number(event.lowpassQ) > 0
          ? Number(event.lowpassQ)
          : null
      };
    })
    .filter(Boolean);

  for (const item of missing) console.warn(`Skipping missing SFX asset: ${item}`);
  return normalized;
}

function inputAudioFilter(inputIndex, label, options) {
  const parts = [];
  const playbackRate = normalizedPlaybackRate(options.playbackRate);
  const outputDuration = Number(options.durationSeconds || 0);
  const sourceSliceSeconds = Number(options.sourceSliceSeconds || 0);
  const trimDurationSeconds = sourceSliceSeconds > 0
    ? sourceSliceSeconds
    : outputDuration > 0
      ? outputDuration * playbackRate
      : 0;
  if (options.sourceOffsetSeconds || trimDurationSeconds) {
    const trim = [`start=${ffmpegNumber(options.sourceOffsetSeconds || 0)}`];
    if (trimDurationSeconds) trim.push(`duration=${ffmpegNumber(trimDurationSeconds)}`);
    parts.push(`atrim=${trim.join(':')}`);
  }
  parts.push('asetpts=PTS-STARTPTS');
  parts.push(...atempoFilters(playbackRate));
  if (options.lowpassFrequencyHz) {
    const frequency = Math.max(1, Number(options.lowpassFrequencyHz));
    const q = Math.max(0.001, Number(options.lowpassQ || 0.707));
    parts.push(`lowpass=f=${ffmpegNumber(frequency)}:t=q:w=${ffmpegNumber(q)}`);
  }
  parts.push(`volume=${ffmpegNumber(options.volume)}`);
  const fadeInSeconds = Math.max(0, Number(options.fadeInSeconds || 0));
  const fadeOutSeconds = Math.max(0, Number(options.fadeOutSeconds || 0));
  if (fadeInSeconds > 0) parts.push(`afade=t=in:st=0:d=${ffmpegNumber(fadeInSeconds)}`);
  if (fadeOutSeconds > 0 && outputDuration > 0) {
    const fadeStart = Math.max(0, outputDuration - fadeOutSeconds);
    parts.push(`afade=t=out:st=${ffmpegNumber(fadeStart)}:d=${ffmpegNumber(fadeOutSeconds)}`);
  }
  if (options.delayMs) parts.push(`adelay=${options.delayMs}:all=1`);
  return `[${inputIndex}:a]${parts.join(',')}${label}`;
}

async function buildAudioTrack({ food, options, duration, workDir, sfxEvents = [], narrationEvents = [] }) {
  if (!options.audio) return '';

  const narrationInputs = narrationInputsForFood(food, narrationEvents);
  const musicPath = options.music ? musicPathForFood(food) : '';
  const sfxInputs = normalizeSfxEvents(sfxEvents, options, duration);
  if (!narrationInputs.length && !musicPath && !sfxInputs.length) return '';

  const outputPath = path.join(workDir, 'audio.wav');
  const args = ['-y'];
  const filters = [];
  const labels = [];

  narrationInputs.forEach((block, index) => {
    args.push('-i', block.path);
    const delayMs = Math.max(0, Math.round(block.offsetSeconds * 1000));
    const label = `[n${index}]`;
    const eventVolume = Number(block.volume);
    filters.push(inputAudioFilter(index, label, {
      delayMs,
      volume: (Number.isFinite(eventVolume) ? eventVolume : 1) * options.narrationVolume,
      sourceOffsetSeconds: block.sourceOffsetSeconds,
      durationSeconds: block.durationSeconds
    }));
    labels.push(label);
  });

  if (musicPath) {
    args.push('-stream_loop', '-1', '-i', musicPath);
    const musicInputIndex = narrationInputs.length;
    filters.push(
      `[${musicInputIndex}:a]atrim=0:${ffmpegNumber(duration)},asetpts=PTS-STARTPTS,volume=${ffmpegNumber(options.musicVolume)}[music]`
    );
    labels.push('[music]');
  }

  sfxInputs.forEach((event, index) => {
    const inputIndex = narrationInputs.length + (musicPath ? 1 : 0) + index;
    args.push('-i', event.path);
    const label = `[sfx${index}]`;
    filters.push(inputAudioFilter(inputIndex, label, {
      delayMs: Math.max(0, Math.round(event.time * 1000)),
      volume: event.volume,
      playbackRate: event.playbackRate,
      sourceOffsetSeconds: event.sourceOffsetSeconds,
      sourceSliceSeconds: event.sourceSliceSeconds,
      durationSeconds: event.durationSeconds,
      fadeInSeconds: event.fadeInSeconds,
      fadeOutSeconds: event.fadeOutSeconds,
      lowpassFrequencyHz: event.lowpassFrequencyHz,
      lowpassQ: event.lowpassQ
    }));
    labels.push(label);
  });

  if (labels.length === 1) {
    filters.push(`${labels[0]}atrim=0:${ffmpegNumber(duration)},apad=whole_dur=${ffmpegNumber(duration)},atrim=0:${ffmpegNumber(duration)},asetpts=PTS-STARTPTS[aout]`);
  } else {
    filters.push(`${labels.join('')}amix=inputs=${labels.length}:duration=longest:normalize=0,apad=whole_dur=${ffmpegNumber(duration)},atrim=0:${ffmpegNumber(duration)},asetpts=PTS-STARTPTS[aout]`);
  }

  args.push(
    '-filter_complex', filters.join(';'),
    '-map', '[aout]',
    '-c:a', 'pcm_s16le',
    outputPath
  );

  await run('ffmpeg', args, { label: 'Build audio mix' });
  return outputPath;
}

async function encodeMp4({ framesDir, outputPath, options, duration, audioPath }) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const args = [
    '-y',
    '-framerate', String(options.fps),
    '-start_number', '1',
    '-i', path.join(framesDir, 'frame-%06d.png')
  ];

  if (audioPath) args.push('-i', audioPath);

  args.push(
    '-t', ffmpegNumber(duration),
    '-vf', `scale=${options.width}:${options.height}:flags=neighbor`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart'
  );

  if (audioPath) {
    args.push('-c:a', 'aac', '-b:a', '192k');
  } else {
    args.push('-an');
  }

  args.push(outputPath);
  await run('ffmpeg', args, { label: 'Encode MP4' });
}

function removeDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

async function main() {
  const { foodId, options } = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  requireCommand('ffmpeg', [
    'Install ffmpeg, then rerun this command.',
    'Windows: winget install Gyan.FFmpeg',
    'macOS: brew install ffmpeg',
    'Ubuntu/Debian: sudo apt-get install ffmpeg'
  ].join('\n'));
  requireCommand('ffprobe', [
    'Install ffmpeg, then rerun this command.',
    'Windows: winget install Gyan.FFmpeg',
    'macOS: brew install ffmpeg',
    'Ubuntu/Debian: sudo apt-get install ffmpeg'
  ].join('\n'));

  const foods = readFoodsIndex();
  const databasePayload = readOptionalJson(options.databaseJson, {});
  const food = findFood(foods, foodId, databasePayload);
  if (!food) throw new Error(`Food not found in docs/data/foods-index.json or Studio input database: ${foodId}`);

  const outputPath = publishedOutputPath(food, options.output);
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `foodranked-vbv2-${foodId}-`));
  const framesDir = path.join(workDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });

  let server;
  try {
    server = await startStaticServer(options.port);
    console.log(`Rendering ${food.name || food.id} from ${server.url}`);
    const frameResult = await renderFrames({ food, foodId, options, framesDir, baseUrl: server.url, workDir });
    const audioPath = await buildAudioTrack({
      food,
      options,
      duration: frameResult.duration,
      workDir,
      sfxEvents: frameResult.sfxEvents,
      narrationEvents: frameResult.narrationEvents
    });
    await encodeMp4({
      framesDir,
      outputPath,
      options,
      duration: frameResult.duration,
      audioPath
    });
    console.log(`Wrote ${path.relative(REPO_ROOT, outputPath)}`);
    console.log(`Frames: ${frameResult.frameCount} captured at ${frameResult.width}x${frameResult.height}, encoded at ${options.width}x${options.height}, ${options.fps}fps`);
  } finally {
    if (server) await server.close();
    if (!options.keepFrames) removeDir(workDir);
    else console.log(`Kept frames in ${framesDir}`);
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
