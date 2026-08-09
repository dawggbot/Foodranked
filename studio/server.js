#!/usr/bin/env node
'use strict';

const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { validateVbv2PlacementPayload } = require('../scripts/vbv2-placement-validation');

const REPO_ROOT = path.resolve(process.env.FOODRANKED_REPO_ROOT || path.resolve(__dirname, '..'));
const PUBLIC_ROOT = path.join(__dirname, 'public');
const DATA_DIR = path.resolve(process.env.FOODRANKED_STUDIO_DATA_DIR || path.join(REPO_ROOT, 'studio-data'));
const RENDER_DIR = path.resolve(process.env.FOODRANKED_STUDIO_RENDER_DIR || path.join(DATA_DIR, 'renders'));
const UPLOAD_DIR = path.resolve(process.env.FOODRANKED_STUDIO_UPLOAD_DIR || path.join(DATA_DIR, 'uploads'));
const AGENT_EXPORT_DIR = path.resolve(process.env.FOODRANKED_STUDIO_AGENT_EXPORT_DIR || path.join(DATA_DIR, 'agent-exports'));
const AGENT_SYNC_DIR = path.resolve(process.env.FOODRANKED_STUDIO_AGENT_SYNC_DIR || path.join(DATA_DIR, 'agent-sync'));
const INPUT_DATABASE_FILE = path.join(DATA_DIR, 'studio-input-database.json');
const STATE_FILE = path.join(DATA_DIR, 'studio-state.json');
const AGENT_SYNC_STATE_FILE = path.join(AGENT_SYNC_DIR, 'agent-sync-state.json');
const UNIVERSAL_LAYOUT_FILE = path.join(__dirname, 'layout', 'universal-layout.json');
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4787;
const DEFAULT_RENDER_PORT_START = 4290;
const MAX_BODY_BYTES = 128 * 1024 * 1024;
const MAX_AGENT_SYNC_ASSET_BYTES = 64 * 1024 * 1024;
const MAX_LOG_LINES = 240;
const JOB_HISTORY_LIMIT = 30;
const AGENT_SYNC_INDEX_URL = process.env.FOODRANKED_AGENT_SYNC_INDEX_URL || 'https://raw.githubusercontent.com/dawggbot/Foodranked/main/studio/agent-sync/index.json';
const AGENT_SYNC_REPO_RAW_BASE_URL = process.env.FOODRANKED_AGENT_SYNC_REPO_RAW_BASE_URL || 'https://raw.githubusercontent.com/dawggbot/Foodranked/main/';
const PRODUCTION_DATABASE_KEY = 'foodranked-production-database-v1';
const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
const VIDEO_STATE_KEY = 'foodranked-video-builder-v2-state-v1';
const LAYOUT_WORKING_KEY = 'foodranked-layout-builder-v4';
const LAYOUT_SAVED_KEY = 'foodranked-layout-builder-sprite-layouts-v1';
const LAYOUT_FOOD_KEY = 'foodranked-layout-builder-food-layouts-v1';
const DBV2_STATE_KEY = 'foodranked-display-builder-v2-state-v1';
const CANONICAL_LAYOUT_FINGERPRINT_KEY = 'foodranked-studio-canonical-layout-fingerprint-v1';
const STUDIO_CANONICAL_LOCK_VERSION = '20260801-studio-universal-layout-json-v1';
const AGENT_BROWSER_TIMEOUT_MS = 45000;
const LOCKED_LAYOUT_PRESET_NAMES = Object.freeze(['test 1', 'test 2', 'test 3', 'test 4', 'test 5']);
const REQUIRED_LAYOUT_SECTION_IDS = Object.freeze(['intro', 'fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons', 'outro']);

const FINALISATION_SAMPLE_FOOD_IDS = new Set([
  'kale',
  'raspberries',
  'oats',
  'black-beans',
  'sweet-potato',
  'almonds',
  'chia-seeds',
  'bacon',
  'greek-yogurt',
  'extra-virgin-olive-oil',
  'cola-regular'
]);

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
  ['.wav', 'audio/wav'],
  ['.webp', 'image/webp']
]);

const TOOL_DEFINITIONS = Object.freeze([
  {
    id: 'database',
    label: 'Database',
    path: '/docs/database/index.html',
    role: 'food-library',
    state: 'browser-local'
  },
  {
    id: 'layout',
    label: 'Layout Builder',
    path: '/docs/layout-builder/index.html',
    role: 'layout-source',
    state: 'browser-local'
  },
  {
    id: 'display',
    label: 'DBv2',
    path: '/docs/display-builder-v2/index.html',
    role: 'display-proof',
    state: 'browser-local'
  },
  {
    id: 'video',
    label: 'VBv2',
    path: '/docs/video-builder-v2/index.html',
    role: 'video-proof-render',
    state: 'browser-local'
  }
]);

const renderState = {
  nextJobId: 1,
  currentJob: null,
  jobs: new Map()
};

function usage() {
  return `
Run the local FoodRanked Studio app.

Usage:
  node studio/server.js [options]

Options:
  --host <host>                Bind host. Default: ${DEFAULT_HOST}
  --port <number>              Studio port. Default: ${DEFAULT_PORT}
  --render-port-start <number> First private renderer port. Default: ${DEFAULT_RENDER_PORT_START}
  --help                       Show this help.
`.trim();
}

function parseArgs(argv) {
  const options = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    renderPortStart: DEFAULT_RENDER_PORT_START,
    portExplicit: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const readValue = name => {
      const value = argv[index + 1];
      if (value == null || value.startsWith('--')) throw new Error(`${name} requires a value.`);
      index += 1;
      return value;
    };

    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--host') options.host = readValue(arg);
    else if (arg === '--port') {
      options.port = Number(readValue(arg));
      options.portExplicit = true;
    }
    else if (arg === '--render-port-start') options.renderPortStart = Number(readValue(arg));
    else throw new Error(`Unknown option: ${arg}`);
  }

  for (const [name, value] of Object.entries({ port: options.port, renderPortStart: options.renderPortStart })) {
    if (!Number.isFinite(value) || value <= 0 || value > 65535) throw new Error(`Invalid ${name}: ${value}`);
  }
  if (!String(options.host || '').trim()) throw new Error('Invalid host.');
  return options;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const loaded = [];
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2] || '';
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
    loaded.push(key);
  }
  return loaded;
}

function loadLocalEnv() {
  const files = ['.env.local', '.env'].map(file => path.join(REPO_ROOT, file));
  const loaded = new Map();
  for (const file of files) {
    for (const key of loadEnvFile(file)) {
      if (!loaded.has(key)) loaded.set(key, []);
      loaded.get(key).push(path.basename(file));
    }
  }
  return loaded;
}

const loadedEnvFilesByKey = loadLocalEnv();

function secretPresence() {
  const usdaKeys = ['USDA_API_KEY', 'FOODDATA_CENTRAL_API_KEY', 'FDC_API_KEY'];
  return {
    elevenLabs: {
      available: Boolean(process.env.ELEVENLABS_API_KEY),
      envNames: process.env.ELEVENLABS_API_KEY ? ['ELEVENLABS_API_KEY'] : [],
      localFiles: loadedEnvFilesByKey.get('ELEVENLABS_API_KEY') || []
    },
    usda: {
      available: usdaKeys.some(key => Boolean(process.env[key])),
      envNames: usdaKeys.filter(key => Boolean(process.env[key])),
      localFiles: usdaKeys.flatMap(key => loadedEnvFilesByKey.get(key) || [])
    }
  };
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(RENDER_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.mkdirSync(AGENT_EXPORT_DIR, { recursive: true });
  fs.mkdirSync(AGENT_SYNC_DIR, { recursive: true });
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function universalLayoutStats(layout) {
  const sections = layout?.sections && typeof layout.sections === 'object' && !Array.isArray(layout.sections)
    ? layout.sections
    : {};
  const layerCounts = Object.fromEntries(REQUIRED_LAYOUT_SECTION_IDS.map(sectionId => [
    sectionId,
    Array.isArray(sections[sectionId]?.layers) ? sections[sectionId].layers.length : 0
  ]));
  return {
    sectionIds: Object.keys(sections),
    requiredSectionIds: [...REQUIRED_LAYOUT_SECTION_IDS],
    missingSectionIds: REQUIRED_LAYOUT_SECTION_IDS.filter(sectionId => !Array.isArray(sections[sectionId]?.layers)),
    layerCounts,
    totalLayers: Object.values(layerCounts).reduce((total, count) => total + count, 0)
  };
}

function readUniversalLayoutPayload({ includeLayout = true } = {}) {
  const raw = fs.readFileSync(UNIVERSAL_LAYOUT_FILE, 'utf8');
  const layout = JSON.parse(raw);
  const stats = universalLayoutStats(layout);
  if (stats.missingSectionIds.length) {
    throw new Error(`Universal layout is missing sections: ${stats.missingSectionIds.join(', ')}`);
  }
  if (!stats.totalLayers) throw new Error('Universal layout has no layers.');
  const fileFingerprint = crypto.createHash('sha256').update(raw).digest('hex');
  const layoutFingerprint = crypto.createHash('sha256').update(JSON.stringify(layout)).digest('hex');
  return {
    ok: true,
    storageKeys: {
      working: LAYOUT_WORKING_KEY,
      saved: LAYOUT_SAVED_KEY,
      food: LAYOUT_FOOD_KEY
    },
    lockNames: [...LOCKED_LAYOUT_PRESET_NAMES],
    layoutFingerprint,
    layoutFileFingerprint: fileFingerprint,
    sourceFileFingerprint: '78342e8cf934c98b7930b0c89d4ee947f8d05a9b42a31baffad2c5f42f52fb3f',
    layoutBytes: Buffer.byteLength(raw),
    importedFrom: 'universal_layout_json---874bfa4e-374f-4b0b-9ad0-e946caf75a65.txt',
    stats,
    layout: includeLayout ? layout : undefined
  };
}

function universalLayoutHealth() {
  try {
    const payload = readUniversalLayoutPayload({ includeLayout: false });
    return {
      available: true,
      fingerprint: payload.layoutFingerprint,
      fileFingerprint: payload.layoutFileFingerprint,
      sourceFileFingerprint: payload.sourceFileFingerprint,
      bytes: payload.layoutBytes,
      totalLayers: payload.stats.totalLayers,
      layerCounts: payload.stats.layerCounts,
      lockNames: payload.lockNames
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
}

function readJsonFile(filePath, fallback) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function defaultStudioState() {
  return {
    schemaVersion: 'foodranked-studio-state.v1',
    localOnly: true,
    selectedFoodId: 'bacon',
    episodeQueue: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: ''
  };
}

function readStudioState() {
  const state = readJsonFile(STATE_FILE, null);
  return state && state.schemaVersion === 'foodranked-studio-state.v1'
    ? { ...defaultStudioState(), ...state }
    : defaultStudioState();
}

function writeStudioState(nextState) {
  const normalized = {
    ...defaultStudioState(),
    ...(nextState && typeof nextState === 'object' ? nextState : {}),
    schemaVersion: 'foodranked-studio-state.v1',
    localOnly: true,
    updatedAt: new Date().toISOString()
  };
  writeJsonFile(STATE_FILE, normalized);
  return normalized;
}

function safeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanString(value) {
  return String(value ?? '').trim();
}

function finiteNumber(value, fallback = null) {
  if (value === '' || value == null) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function defaultInputDatabase() {
  return {
    schemaVersion: 'foodranked-production-database.v1',
    updatedAt: '',
    localOnly: true,
    assets: { files: {} },
    foods: {}
  };
}

function normalizeAssetKind(value) {
  const clean = cleanString(value).toLowerCase();
  if (['image', 'png', 'food-image', 'food_image'].includes(clean)) return 'image';
  if (['narration', 'audio', 'voice', 'mp3', 'wav', 'm4a'].includes(clean)) return 'narration';
  return 'asset';
}

function normalizeInputAsset(id, value) {
  const source = value && typeof value === 'object' ? clone(value) : {};
  const cleanId = cleanString(source.id || id);
  return {
    id: cleanId,
    label: cleanString(source.label) || cleanId,
    kind: normalizeAssetKind(source.kind),
    path: cleanString(source.path || source.url),
    mimeType: cleanString(source.mimeType),
    sizeBytes: finiteNumber(source.sizeBytes, null),
    foodId: safeSlug(source.foodId),
    role: cleanString(source.role),
    source: cleanString(source.source) || 'studio-input',
    createdAt: cleanString(source.createdAt),
    updatedAt: cleanString(source.updatedAt)
  };
}

function normalizeInputFood(id, value) {
  const entry = value && typeof value === 'object' ? clone(value) : {};
  entry.id = safeSlug(entry.id || id);
  entry.name = cleanString(entry.name || entry.displayName || entry.id);
  entry.displayName = cleanString(entry.displayName);
  entry.shortName = cleanString(entry.shortName);
  entry.foodType = safeSlug(entry.foodType) || 'misc';
  entry.foodTypeLabel = cleanString(entry.foodTypeLabel);
  entry.identity = cleanString(entry.identity);
  entry.tier = cleanString(entry.tier);
  entry.expectedTier = cleanString(entry.expectedTier);
  entry.header = entry.header && typeof entry.header === 'object' && !Array.isArray(entry.header) ? entry.header : {};
  entry.metrics = entry.metrics && typeof entry.metrics === 'object' && !Array.isArray(entry.metrics) ? entry.metrics : {};
  entry.assets = entry.assets && typeof entry.assets === 'object' && !Array.isArray(entry.assets) ? entry.assets : {};
  entry.episode = entry.episode && typeof entry.episode === 'object' && !Array.isArray(entry.episode) ? entry.episode : {};
  entry.status = entry.status && typeof entry.status === 'object' && !Array.isArray(entry.status) ? entry.status : {};
  entry.library = entry.library && typeof entry.library === 'object' && !Array.isArray(entry.library) ? entry.library : {};
  entry.foodPatch = entry.foodPatch && typeof entry.foodPatch === 'object' && !Array.isArray(entry.foodPatch) ? entry.foodPatch : {};
  entry.basis = entry.basis && typeof entry.basis === 'object' && !Array.isArray(entry.basis) ? entry.basis : { value: 100, unit: 'g' };
  const customFoodImagePath = cleanString(entry.customFoodImagePath || entry.foodSpritePath || entry.assets.customFoodImage?.path || entry.customFoodImage?.path);
  if (customFoodImagePath) {
    entry.customFoodImagePath = customFoodImagePath;
    const width = finiteNumber(entry.customFoodImageWidth ?? entry.assets.customFoodImage?.width ?? entry.customFoodImage?.width, null);
    const height = finiteNumber(entry.customFoodImageHeight ?? entry.assets.customFoodImage?.height ?? entry.customFoodImage?.height, null);
    entry.assets.customFoodImage = {
      ...(entry.assets.customFoodImage || {}),
      path: customFoodImagePath
    };
    if (width != null) {
      entry.customFoodImageWidth = width;
      entry.assets.customFoodImage.width = width;
    }
    if (height != null) {
      entry.customFoodImageHeight = height;
      entry.assets.customFoodImage.height = height;
    }
  }
  entry.kcal = finiteNumber(entry.kcal ?? entry.header.kcal, null);
  if (entry.kcal != null) entry.header.kcal = entry.kcal;
  entry.finalizedDownloaded = Boolean(entry.finalizedDownloaded || entry.status.finalizedDownloaded);
  entry.status.finalizedDownloaded = entry.finalizedDownloaded;
  entry.deleted = Boolean(entry.deleted);
  return entry;
}

function normalizeInputDatabase(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const normalized = defaultInputDatabase();
  normalized.updatedAt = cleanString(source.updatedAt);
  const assets = source.assets?.files && typeof source.assets.files === 'object' ? source.assets.files : {};
  Object.entries(assets).forEach(([id, asset]) => {
    const normalizedAsset = normalizeInputAsset(id, asset);
    if (normalizedAsset.id && normalizedAsset.path) normalized.assets.files[normalizedAsset.id] = normalizedAsset;
  });
  const foods = source.foods && typeof source.foods === 'object' ? source.foods : {};
  Object.entries(foods).forEach(([id, food]) => {
    const normalizedFood = normalizeInputFood(id, food);
    if (normalizedFood.id) normalized.foods[normalizedFood.id] = normalizedFood;
  });
  return normalized;
}

function readInputDatabase() {
  return normalizeInputDatabase(readJsonFile(INPUT_DATABASE_FILE, defaultInputDatabase()));
}

function writeInputDatabase(db) {
  const normalized = normalizeInputDatabase(db);
  normalized.updatedAt = new Date().toISOString();
  writeJsonFile(INPUT_DATABASE_FILE, normalized);
  return normalized;
}

function upsertInputFood(food) {
  const normalized = normalizeInputFood(food.id, food);
  if (!normalized.id) throw new Error('Food id is required.');
  const db = readInputDatabase();
  db.foods[normalized.id] = normalizeInputFood(normalized.id, {
    ...(db.foods[normalized.id] || {}),
    ...normalized,
    deleted: false,
    updatedAt: new Date().toISOString()
  });
  return { db: writeInputDatabase(db), food: db.foods[normalized.id] };
}

function deleteInputFood(foodId) {
  const id = safeSlug(foodId);
  if (!id) throw new Error('Food id is required.');
  const db = readInputDatabase();
  db.foods[id] = normalizeInputFood(id, {
    ...(db.foods[id] || {}),
    id,
    deleted: true,
    updatedAt: new Date().toISOString()
  });
  return { db: writeInputDatabase(db), food: db.foods[id] };
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
    kcal: entry.kcal ?? entry.header?.kcal ?? null,
    header: entry.header || {},
    metrics: entry.metrics || {},
    assets: entry.assets || {},
    episode: entry.episode || {},
    status: entry.status || {},
    foodPatch: entry.foodPatch || {},
    finalizedDownloaded: Boolean(entry.finalizedDownloaded),
    customDatabaseFood: true
  };
}

function mergeInputFood(baseFood, entry) {
  if (!entry || entry.deleted) return null;
  const base = baseFood && typeof baseFood === 'object' ? clone(baseFood) : baseFoodFromInputEntry(entry);
  const merged = {
    ...base,
    ...entry,
    basis: { ...(base.basis || {}), ...(entry.basis || {}) },
    header: { ...(base.header || {}), ...(entry.header || {}) },
    metrics: { ...(base.metrics || {}), ...(entry.metrics || {}) },
    assets: { ...(base.assets || {}), ...(entry.assets || {}) },
    episode: { ...(base.episode || {}), ...(entry.episode || {}) },
    status: { ...(base.status || {}), ...(entry.status || {}) },
    databaseEntry: {
      id: entry.id,
      updatedAt: entry.updatedAt || '',
      finalizedDownloaded: Boolean(entry.finalizedDownloaded),
      notes: cleanString(entry.notes)
    }
  };
  if (entry.customFoodImagePath || entry.foodSpritePath) {
    merged.assets.customFoodImage = {
      ...(merged.assets.customFoodImage || {}),
      path: entry.customFoodImagePath || entry.foodSpritePath
    };
    const width = finiteNumber(entry.customFoodImageWidth ?? entry.assets?.customFoodImage?.width, null);
    const height = finiteNumber(entry.customFoodImageHeight ?? entry.assets?.customFoodImage?.height, null);
    if (width != null) merged.assets.customFoodImage.width = width;
    if (height != null) merged.assets.customFoodImage.height = height;
  }
  if (entry.audioPath) {
    merged.episode.audio = {
      ...(merged.episode.audio || {}),
      path: entry.audioPath,
      take: entry.audioTake || merged.episode.audio?.take || 'studio-input'
    };
  }
  merged.kcal = entry.kcal ?? entry.header?.kcal ?? base.kcal ?? base.header?.kcal ?? null;
  merged.finalizedDownloaded = Boolean(entry.finalizedDownloaded);
  merged.customDatabaseFood = Boolean(base.customDatabaseFood || !baseFood);
  return merged;
}

function readFoodsIndex() {
  const file = path.join(REPO_ROOT, 'docs/data/foods-index.json');
  const foods = readJsonFile(file, []);
  return Array.isArray(foods) ? foods : [];
}

function readStudioFoods() {
  const baseFoods = readFoodsIndex();
  const inputDb = readInputDatabase();
  const seen = new Set();
  const foods = [];
  baseFoods.forEach(food => {
    if (!food?.id) return;
    const id = safeSlug(food.id || food.name);
    seen.add(id);
    const inputEntry = inputDb.foods[id];
    const merged = inputEntry ? mergeInputFood(food, inputEntry) : food;
    if (merged) foods.push(merged);
  });
  Object.values(inputDb.foods || {}).forEach(entry => {
    if (!entry?.id || seen.has(entry.id) || entry.deleted) return;
    const merged = mergeInputFood(null, entry);
    if (merged) foods.push(merged);
  });
  return foods;
}

function readAppAssets() {
  const file = path.join(REPO_ROOT, 'docs/data/app-assets.js');
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const matches = [...text.matchAll(/"id"\s*:\s*"([^"]+)"/g)];
  return { count: matches.length };
}

function publicFood(food) {
  const id = safeSlug(food.id || food.name);
  return {
    id,
    name: food.name || id,
    foodType: food.foodType || '',
    foodTypeLabel: food.foodTypeLabel || '',
    tier: food.episode?.tier || food.tier || '',
    overallScore: food.episode?.overallScore ?? food.overallScore ?? null,
    kcal: food.kcal ?? food.header?.kcal ?? null,
    finalized: FINALISATION_SAMPLE_FOOD_IDS.has(id) || Boolean(food.finalizedDownloaded || food.status?.finalizedDownloaded),
    hasVideo: fs.existsSync(renderFilePathForFoodId(id))
      || fs.existsSync(path.join(REPO_ROOT, `docs/video/episodes/${id}/${id}-vbv2.mp4`)),
    hasSplitAudio: Boolean(food.episode?.splitAudio?.manifestPath || food.splitAudio?.manifestPath)
  };
}

function findFood(foodId) {
  const safeId = safeSlug(foodId);
  return readStudioFoods().find(food => safeSlug(food.id) === safeId || safeSlug(food.name) === safeId) || null;
}

function downloadPathForFood(food) {
  const id = safeSlug(food.id || food.name);
  return `/studio-data/renders/${id}/${id}-vbv2.mp4`;
}

function filePathForDownload(downloadPath) {
  if (downloadPath.startsWith('/studio-data/renders/')) {
    const relative = downloadPath.replace(/^\/studio-data\/renders\/+/, '');
    return path.join(RENDER_DIR, relative);
  }
  return path.join(REPO_ROOT, downloadPath.replace(/^\/+/, ''));
}

function renderFilePathForFoodId(foodId) {
  const id = safeSlug(foodId);
  return path.join(RENDER_DIR, id, `${id}-vbv2.mp4`);
}

function requestBaseUrl(request, options) {
  const host = request.headers.host || `${options.host || DEFAULT_HOST}:${options.activePort || options.port || DEFAULT_PORT}`;
  return `http://${host}`;
}

function studioDataPathForFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!isInside(DATA_DIR, resolved)) throw new Error('File is outside the Studio data directory.');
  const relative = path.relative(DATA_DIR, resolved).split(path.sep).map(encodeURIComponent).join('/');
  return `/studio-data/${relative}`;
}

function agentExportDirForFoodId(foodId) {
  const id = safeSlug(foodId);
  if (!id) throw new Error('Food id is required.');
  return path.join(AGENT_EXPORT_DIR, id);
}

function agentPngDirForFoodId(foodId) {
  return path.join(agentExportDirForFoodId(foodId), 'png');
}

function normalizeSectionId(value) {
  const id = safeSlug(value);
  if (id === 'carbohydrates') return 'carbs';
  if (id === 'proteins') return 'protein';
  return id;
}

function normalizeAgentSectionIds(value) {
  if (value == null || value === '' || value === 'all') return [...REQUIRED_LAYOUT_SECTION_IDS];
  const source = Array.isArray(value) ? value : String(value).split(',');
  const allowed = new Set(REQUIRED_LAYOUT_SECTION_IDS);
  const sections = [];
  for (const item of source) {
    const sectionId = normalizeSectionId(item);
    if (!sectionId || sectionId === 'all') return [...REQUIRED_LAYOUT_SECTION_IDS];
    if (!allowed.has(sectionId)) throw new Error(`Unknown section: ${item}`);
    if (!sections.includes(sectionId)) sections.push(sectionId);
  }
  return sections.length ? sections : [...REQUIRED_LAYOUT_SECTION_IDS];
}

function dataUrlBuffer(dataUrl, expectedMime = 'image/png') {
  const match = String(dataUrl || '').match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) throw new Error('Invalid data URL returned by DBv2.');
  if (expectedMime && match[1] !== expectedMime) {
    throw new Error(`Expected ${expectedMime}, got ${match[1]}.`);
  }
  return Buffer.from(match[2].replace(/\s+/g, ''), 'base64');
}

function agentBrowserSeed(foodId, extraState = {}) {
  const layoutPayload = readUniversalLayoutPayload();
  const layout = clone(layoutPayload.layout);
  layout.selectedFoodId = foodId;
  layout.selectedSectionId = 'intro';
  layout.meta = {
    ...(layout.meta || {}),
    studioCanonicalLayout: {
      version: STUDIO_CANONICAL_LOCK_VERSION,
      fingerprint: layoutPayload.layoutFingerprint,
      importedFrom: layoutPayload.importedFrom || '',
      layerCount: layoutPayload.stats.totalLayers,
      seededBy: 'studio-agent'
    },
    studioAgentSeededAt: new Date().toISOString()
  };
  return {
    foodId,
    keys: {
      productionDatabase: PRODUCTION_DATABASE_KEY,
      placement: PLACEMENT_EXPORT_KEY,
      dbv2State: DBV2_STATE_KEY,
      videoState: VIDEO_STATE_KEY,
      layoutWorking: LAYOUT_WORKING_KEY,
      layoutSaved: LAYOUT_SAVED_KEY,
      layoutFood: LAYOUT_FOOD_KEY,
      canonicalLayoutFingerprint: CANONICAL_LAYOUT_FINGERPRINT_KEY
    },
    database: readInputDatabase(),
    layout,
    layoutFingerprint: layoutPayload.layoutFingerprint,
    dbv2State: {
      selectedFoodId: foodId,
      selectedSectionId: 'intro',
      selectedLayoutKey: 'working:current'
    },
    videoState: {
      ...(extraState.videoState && typeof extraState.videoState === 'object' ? extraState.videoState : {}),
      selectedFoodId: foodId,
      currentTime: 0,
      selectedSceneId: 'intro'
    }
  };
}

async function withAgentDbv2Page(foodId, baseUrl, callback, extraState = {}) {
  const playwright = optionalRequire('playwright');
  if (!playwright?.chromium) throw new Error('Playwright is required for agent DBv2 automation.');

  const seed = agentBrowserSeed(foodId, extraState);
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    deviceScaleFactor: 1
  });
  await context.addInitScript(payload => {
    const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    writeJson(payload.keys.productionDatabase, payload.database);
    writeJson(payload.keys.layoutWorking, payload.layout);
    writeJson(payload.keys.dbv2State, payload.dbv2State);
    writeJson(payload.keys.videoState, payload.videoState);
    localStorage.setItem(payload.keys.canonicalLayoutFingerprint, payload.layoutFingerprint);
    localStorage.removeItem(payload.keys.layoutSaved);
    localStorage.removeItem(payload.keys.layoutFood);
    localStorage.removeItem(payload.keys.placement);
  }, seed);

  const page = await context.newPage();
  try {
    const url = `${baseUrl}/docs/display-builder-v2/index.html?videoBuilderExportFood=${encodeURIComponent(foodId)}&app=studio-agent&t=${Date.now()}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => Boolean(window.FOODRANKED_DISPLAY_BUILDER_V2?.drawSectionStillToCanvas), null, {
      timeout: AGENT_BROWSER_TIMEOUT_MS
    });
    await page.evaluate(() => document.fonts?.ready || Promise.resolve()).catch(() => {});
    return await callback(page, seed);
  } finally {
    await browser.close();
  }
}

async function freshDbv2PlacementForFood(food, baseUrl, extraState = {}) {
  const foodId = safeSlug(food.id || food.name);
  return withAgentDbv2Page(foodId, baseUrl, async page => {
    await page.waitForFunction(({ key, selectedFoodId }) => {
      try {
        const payload = JSON.parse(localStorage.getItem(key) || '{}');
        const entry = payload?.layouts?.[selectedFoodId];
        return Boolean(entry?.layout?.sections?.fats?.layers?.length);
      } catch {
        return false;
      }
    }, { key: PLACEMENT_EXPORT_KEY, selectedFoodId: food.id || foodId }, { timeout: AGENT_BROWSER_TIMEOUT_MS });

    const placement = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), PLACEMENT_EXPORT_KEY);
    validateVbv2PlacementPayload(placement, food);
    return placement;
  }, extraState);
}

async function exportDbv2SectionPngs(food, baseUrl, body = {}) {
  const foodId = safeSlug(food.id || food.name);
  const sections = normalizeAgentSectionIds(body.sections);
  const outputDir = agentPngDirForFoodId(foodId);
  fs.mkdirSync(outputDir, { recursive: true });

  return withAgentDbv2Page(foodId, baseUrl, async page => {
    await page.waitForFunction(({ key, selectedFoodId }) => {
      try {
        const payload = JSON.parse(localStorage.getItem(key) || '{}');
        const entry = payload?.layouts?.[selectedFoodId];
        return Boolean(entry?.layout?.sections?.fats?.layers?.length);
      } catch {
        return false;
      }
    }, { key: PLACEMENT_EXPORT_KEY, selectedFoodId: food.id || foodId }, { timeout: AGENT_BROWSER_TIMEOUT_MS });

    const placement = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), PLACEMENT_EXPORT_KEY);
    validateVbv2PlacementPayload(placement, food);

    const files = [];
    for (const sectionId of sections) {
      const dataUrl = await page.evaluate(async section => {
        const api = window.FOODRANKED_DISPLAY_BUILDER_V2;
        const canvas = await api.drawSectionStillToCanvas(section);
        return canvas.toDataURL(api.sectionStillExport?.mimeType || 'image/png');
      }, sectionId);
      const filename = `${foodId}-${sectionId}-dbv2.png`;
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, dataUrlBuffer(dataUrl, 'image/png'));
      files.push({
        sectionId,
        filename,
        path: filePath,
        url: studioDataPathForFile(filePath)
      });
    }

    return {
      placement,
      files,
      outputDir
    };
  }, body);
}

async function startAgentRenderJob(food, baseUrl, body, options) {
  const foodId = safeSlug(food.id || food.name);
  const layoutPlacement = await freshDbv2PlacementForFood(food, baseUrl, body);
  const layout = agentBrowserSeed(foodId, body).layout;
  return startRenderJob(food, {
    ...body,
    foodId,
    layoutPlacement,
    layoutState: {
      [LAYOUT_WORKING_KEY]: layout,
      ...(body.layoutState && typeof body.layoutState === 'object' ? body.layoutState : {})
    },
    inputDatabase: body.inputDatabase && typeof body.inputDatabase === 'object' ? body.inputDatabase : readInputDatabase(),
    force: body.force !== false
  }, options);
}

function agentExportsForFood(foodId) {
  const root = agentExportDirForFoodId(foodId);
  const files = [];
  const visit = dir => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const filePath = path.join(dir, name);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) visit(filePath);
      else files.push({
        filename: name,
        path: filePath,
        url: studioDataPathForFile(filePath),
        sizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString()
      });
    }
  };
  visit(root);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  response.end(body);
}

function sendError(response, statusCode, message, extra = {}) {
  sendJson(response, statusCode, { ok: false, error: message, ...extra });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8').trim();
      if (!text) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

function publicJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    foodId: job.foodId,
    status: job.status,
    message: job.message,
    startedAt: job.startedAt,
    completedAt: job.completedAt || null,
    exitCode: job.exitCode,
    downloadUrl: job.downloadUrl,
    outputPath: job.outputPath,
    frame: job.frame || null,
    logTail: job.logs.slice(-30)
  };
}

function parseObjectValue(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  }
  return fallback;
}

function inputFoodFromBody(body) {
  const source = body?.food && typeof body.food === 'object' ? body.food : body || {};
  const id = safeSlug(source.id || source.foodId);
  if (!id) throw new Error('Food id is required.');
  return normalizeInputFood(id, {
    ...source,
    id,
    name: source.name || source.displayName || id.replace(/-/g, ' '),
    basis: parseObjectValue(source.basis, source.basis || { value: 100, unit: 'g' }),
    header: parseObjectValue(source.header, source.header || {}),
    metrics: parseObjectValue(source.metrics, source.metrics || {}),
    assets: parseObjectValue(source.assets, source.assets || {}),
    episode: parseObjectValue(source.episode, source.episode || {}),
    status: parseObjectValue(source.status, source.status || {}),
    library: parseObjectValue(source.library, source.library || {}),
    foodPatch: parseObjectValue(source.foodPatch, source.foodPatch || {})
  });
}

function publicInputAsset(asset) {
  return normalizeInputAsset(asset.id, asset);
}

function publicInputFood(food) {
  return normalizeInputFood(food.id, food);
}

function safeUploadFilename(value, kind) {
  const raw = path.basename(cleanString(value)).replace(/[^A-Za-z0-9._ -]/g, '_').replace(/\s+/g, '-');
  if (!raw || raw === '.' || raw === '..') throw new Error('Upload filename is required.');
  const ext = path.extname(raw).toLowerCase();
  if (kind === 'image' && ext !== '.png') throw new Error('Image uploads must be PNG files.');
  if (kind === 'narration' && !['.mp3', '.wav', '.m4a'].includes(ext)) {
    throw new Error('Narration uploads must be MP3, WAV, or M4A files.');
  }
  return raw;
}

function uploadSubdirForKind(kind) {
  if (kind === 'image') return 'images';
  if (kind === 'narration') return 'narration';
  return 'assets';
}

function bufferFromBase64Payload(value) {
  const text = cleanString(value);
  const payload = text.includes(',') && /^data:/i.test(text) ? text.slice(text.indexOf(',') + 1) : text;
  if (!payload) throw new Error('Upload dataBase64 is required.');
  const buffer = Buffer.from(payload, 'base64');
  if (!buffer.length) throw new Error('Upload payload is empty.');
  return buffer;
}

function uploadAssetFromBody(body) {
  const kind = normalizeAssetKind(body.kind || body.type || body.role);
  if (kind !== 'image' && kind !== 'narration') throw new Error('Asset kind must be image or narration.');
  const foodId = safeSlug(body.foodId || body.food?.id || '');
  const filename = safeUploadFilename(body.filename || body.name, kind);
  const buffer = bufferFromBase64Payload(body.dataBase64 || body.base64 || body.data);
  const subdir = path.join(uploadSubdirForKind(kind), foodId || 'shared');
  const targetDir = path.join(UPLOAD_DIR, subdir);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, filename);
  if (!isInside(UPLOAD_DIR, targetPath)) throw new Error('Invalid upload path.');
  fs.writeFileSync(targetPath, buffer);

  const relativePath = path.relative(UPLOAD_DIR, targetPath).split(path.sep).join('/');
  const publicPath = `/studio-data/uploads/${relativePath}`;
  const stem = safeSlug(path.basename(filename, path.extname(filename))) || Date.now().toString(36);
  const assetId = ['studio', 'uploads', kind, foodId || 'shared', stem].join('.');
  const now = new Date().toISOString();
  const asset = normalizeInputAsset(assetId, {
    id: assetId,
    label: cleanString(body.label) || filename,
    kind,
    path: publicPath,
    mimeType: cleanString(body.mimeType) || CONTENT_TYPES.get(path.extname(filename).toLowerCase()) || '',
    sizeBytes: buffer.length,
    foodId,
    role: cleanString(body.role) || kind,
    source: 'studio-input',
    createdAt: now,
    updatedAt: now
  });

  const db = readInputDatabase();
  db.assets.files[asset.id] = asset;

  let food = null;
  if (foodId && body.attachToFood !== false) {
    const existing = db.foods[foodId] || {
      id: foodId,
      name: body.foodName || foodId.replace(/-/g, ' '),
      foodType: body.foodType || 'misc',
      foodTypeLabel: body.foodTypeLabel || ''
    };
    food = normalizeInputFood(foodId, existing);
    food.library = {
      ...(food.library || {}),
      uploadedAssets: {
        ...(food.library?.uploadedAssets || {}),
        [asset.id]: publicPath
      }
    };
    if (kind === 'image') {
      food.customFoodImagePath = publicPath;
      food.assets = {
        ...(food.assets || {}),
        customFoodImage: {
          ...(food.assets?.customFoodImage || {}),
          path: publicPath
        }
      };
      const width = finiteNumber(body.customFoodImageWidth ?? body.assetPatch?.width ?? food.assets.customFoodImage.width, null);
      const height = finiteNumber(body.customFoodImageHeight ?? body.assetPatch?.height ?? food.assets.customFoodImage.height, null);
      if (width != null) {
        food.customFoodImageWidth = width;
        food.assets.customFoodImage.width = width;
      }
      if (height != null) {
        food.customFoodImageHeight = height;
        food.assets.customFoodImage.height = height;
      }
    }
    if (kind === 'narration') {
      food.audioPath = publicPath;
      food.library.audioPath = publicPath;
      food.episode = {
        ...(food.episode || {}),
        audio: {
          ...(food.episode?.audio || {}),
          path: publicPath,
          take: cleanString(body.take) || food.episode?.audio?.take || 'studio-input'
        }
      };
    }
    food.updatedAt = now;
    db.foods[foodId] = normalizeInputFood(foodId, food);
  }

  const savedDb = writeInputDatabase(db);
  return {
    db: savedDb,
    asset: savedDb.assets.files[asset.id],
    food: foodId ? savedDb.foods[foodId] || null : null
  };
}

function defaultAgentSyncState() {
  return {
    schemaVersion: 'foodranked-agent-sync-state.v1',
    sourceUrl: AGENT_SYNC_INDEX_URL,
    updatedAt: '',
    lastCheckedAt: '',
    lastRunAt: '',
    jobs: {},
    runs: []
  };
}

function readAgentSyncState() {
  const state = readJsonFile(AGENT_SYNC_STATE_FILE, null);
  return state && state.schemaVersion === 'foodranked-agent-sync-state.v1'
    ? {
        ...defaultAgentSyncState(),
        ...state,
        jobs: state.jobs && typeof state.jobs === 'object' && !Array.isArray(state.jobs) ? state.jobs : {},
        runs: Array.isArray(state.runs) ? state.runs.slice(-40) : []
      }
    : defaultAgentSyncState();
}

function writeAgentSyncState(nextState) {
  const normalized = {
    ...defaultAgentSyncState(),
    ...(nextState && typeof nextState === 'object' ? nextState : {}),
    schemaVersion: 'foodranked-agent-sync-state.v1',
    sourceUrl: nextState?.sourceUrl || AGENT_SYNC_INDEX_URL,
    updatedAt: new Date().toISOString()
  };
  normalized.runs = Array.isArray(normalized.runs) ? normalized.runs.slice(-40) : [];
  normalized.jobs = normalized.jobs && typeof normalized.jobs === 'object' && !Array.isArray(normalized.jobs)
    ? normalized.jobs
    : {};
  writeJsonFile(AGENT_SYNC_STATE_FILE, normalized);
  return normalized;
}

function packagedAgentSyncIndexPath() {
  return path.join(__dirname, 'agent-sync', 'index.json');
}

function agentSyncRunId(jobId) {
  const stamp = new Date().toISOString().replace(/[^0-9A-Za-z]+/g, '-').replace(/^-+|-+$/g, '');
  return `${safeSlug(jobId) || 'job'}-${stamp}`;
}

function repoRawUrlForPath(sourcePath, baseUrl = AGENT_SYNC_REPO_RAW_BASE_URL) {
  const cleanPath = String(sourcePath || '').trim().replace(/^repo:/, '').replace(/^\/+/, '');
  if (!cleanPath || cleanPath.includes('..')) throw new Error('Invalid repo asset path.');
  const prefix = String(baseUrl || AGENT_SYNC_REPO_RAW_BASE_URL).replace(/\/+$/, '');
  return `${prefix}/${cleanPath.split('/').map(encodeURIComponent).join('/')}`;
}

function assertAllowedAgentSyncUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol === 'file:') return;
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`Unsupported Agent Sync URL protocol: ${parsed.protocol}`);
  }
  if (parsed.protocol === 'http:' && !['127.0.0.1', 'localhost'].includes(parsed.hostname)) {
    throw new Error('Agent Sync HTTP URLs are only allowed for localhost testing.');
  }
  if (parsed.hostname === 'raw.githubusercontent.com') {
    if (!parsed.pathname.startsWith('/dawggbot/Foodranked/')) throw new Error('Agent Sync raw GitHub URLs must come from dawggbot/Foodranked.');
    return;
  }
  if (parsed.hostname === 'github.com') {
    if (!parsed.pathname.startsWith('/dawggbot/Foodranked/')) throw new Error('Agent Sync GitHub URLs must come from dawggbot/Foodranked.');
    return;
  }
  if (/\.githubusercontent\.com$/i.test(parsed.hostname)) return;
  if (['127.0.0.1', 'localhost'].includes(parsed.hostname)) return;
  throw new Error(`Agent Sync URL host is not allowed: ${parsed.hostname}`);
}

function fetchUrlBuffer(url, { maxBytes = MAX_AGENT_SYNC_ASSET_BYTES, redirects = 0 } = {}) {
  assertAllowedAgentSyncUrl(url);
  const parsed = new URL(url);
  if (parsed.protocol === 'file:') {
    const filePath = path.resolve(decodeURIComponent(parsed.pathname));
    if (!isInside(REPO_ROOT, filePath) && !isInside(DATA_DIR, filePath)) throw new Error('Agent Sync file URL is outside the allowed workspace.');
    const stat = fs.statSync(filePath);
    if (stat.size > maxBytes) throw new Error(`Agent Sync file is too large: ${stat.size} bytes.`);
    return Promise.resolve(fs.readFileSync(filePath));
  }

  const client = parsed.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const request = client.get(parsed, {
      headers: {
        'User-Agent': 'FoodRanked-Studio-Agent-Sync',
        'Accept': '*/*'
      }
    }, response => {
      const status = Number(response.statusCode) || 0;
      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
        response.resume();
        if (redirects >= 5) {
          reject(new Error('Agent Sync download redirected too many times.'));
          return;
        }
        const nextUrl = new URL(response.headers.location, parsed).toString();
        fetchUrlBuffer(nextUrl, { maxBytes, redirects: redirects + 1 }).then(resolve, reject);
        return;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        reject(new Error(`Agent Sync download failed with HTTP ${status}.`));
        return;
      }

      const chunks = [];
      let size = 0;
      response.on('data', chunk => {
        size += chunk.length;
        if (size > maxBytes) {
          request.destroy(new Error(`Agent Sync download is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve(Buffer.concat(chunks)));
    });
    request.on('error', reject);
    request.setTimeout(30000, () => request.destroy(new Error('Agent Sync download timed out.')));
  });
}

async function fetchJsonUrl(url, fallback = null) {
  const buffer = await fetchUrlBuffer(url, { maxBytes: 4 * 1024 * 1024 });
  const parsed = JSON.parse(buffer.toString('utf8'));
  return parsed && typeof parsed === 'object' ? parsed : fallback;
}

function cleanAgentActionType(value) {
  return cleanString(value).replace(/[^A-Za-z0-9_-]+/g, '');
}

function normalizeAgentSyncJob(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? clone(value) : {};
  const id = safeSlug(source.id || source.jobId || source.title);
  const actions = Array.isArray(source.actions)
    ? source.actions
        .map((action, index) => (
          action && typeof action === 'object' && !Array.isArray(action)
            ? { ...clone(action), type: cleanAgentActionType(action.type), index }
            : null
        ))
        .filter(action => action && action.type)
    : [];
  return {
    id,
    title: cleanString(source.title) || id,
    description: cleanString(source.description),
    status: cleanString(source.status) || 'ready',
    createdAt: cleanString(source.createdAt),
    updatedAt: cleanString(source.updatedAt),
    foodId: safeSlug(source.foodId || actions.find(action => action.foodId || action.food?.id)?.foodId || actions.find(action => action.food?.id)?.food?.id),
    tags: Array.isArray(source.tags) ? source.tags.map(cleanString).filter(Boolean).slice(0, 12) : [],
    actions
  };
}

function normalizeAgentSyncIndex(value, sourceUrl = AGENT_SYNC_INDEX_URL) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const jobs = Array.isArray(source.jobs)
    ? source.jobs.map(normalizeAgentSyncJob).filter(job => job.id && job.actions.length && job.status !== 'disabled')
    : [];
  return {
    ok: true,
    schemaVersion: cleanString(source.schemaVersion) || 'foodranked-agent-sync-index.v1',
    sourceUrl,
    repoRawBaseUrl: cleanString(source.repoRawBaseUrl) || AGENT_SYNC_REPO_RAW_BASE_URL,
    updatedAt: cleanString(source.updatedAt),
    jobs
  };
}

async function fetchAgentSyncIndex(sourceUrl = AGENT_SYNC_INDEX_URL) {
  try {
    const remote = await fetchJsonUrl(sourceUrl, null);
    return {
      ...normalizeAgentSyncIndex(remote, sourceUrl),
      source: 'remote'
    };
  } catch (remoteError) {
    const localPath = packagedAgentSyncIndexPath();
    if (!fs.existsSync(localPath)) throw remoteError;
    const local = readJsonFile(localPath, { jobs: [] });
    return {
      ...normalizeAgentSyncIndex(local, `file://${localPath}`),
      source: 'packaged',
      warning: remoteError.message
    };
  }
}

function publicAgentSyncJob(job, syncState = readAgentSyncState()) {
  const local = syncState.jobs[job.id] || {};
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    status: job.status,
    localStatus: local.status || 'new',
    lastRunAt: local.lastRunAt || '',
    lastResult: local.lastResult || null,
    foodId: job.foodId,
    tags: job.tags,
    actionCount: job.actions.length,
    actions: job.actions.map(action => ({
      index: action.index,
      type: action.type,
      label: cleanString(action.label) || '',
      foodId: safeSlug(action.foodId || action.food?.id || job.foodId),
      filename: cleanString(action.filename || action.name),
      sourcePath: cleanString(action.sourcePath || action.path),
      sections: action.sections || null
    }))
  };
}

function reconcileAgentSyncState() {
  const syncState = readAgentSyncState();
  let changed = false;
  Object.entries(syncState.jobs).forEach(([jobId, entry]) => {
    const renderJobId = entry?.lastResult?.renderJob?.id;
    if (!renderJobId) return;
    const liveJob = renderState.jobs.get(String(renderJobId));
    if (!liveJob) return;
    const publicLiveJob = publicJob(liveJob);
    entry.lastResult = {
      ...(entry.lastResult || {}),
      renderJob: publicLiveJob
    };
    if (entry.status === 'rendering' && (liveJob.status === 'complete' || liveJob.status === 'failed')) {
      entry.status = liveJob.status;
      changed = true;
    }
    changed = true;
    syncState.runs.forEach(run => {
      if (run.jobId !== jobId || run.status !== 'rendering') return;
      run.status = liveJob.status === 'complete' ? 'complete' : liveJob.status === 'failed' ? 'failed' : run.status;
      run.completedAt = liveJob.completedAt || run.completedAt;
      changed = true;
    });
  });
  return changed ? writeAgentSyncState(syncState) : syncState;
}

function publicAgentSyncStatus({ index = null } = {}) {
  const syncState = reconcileAgentSyncState();
  return {
    ok: true,
    enabled: true,
    sourceUrl: AGENT_SYNC_INDEX_URL,
    repoRawBaseUrl: AGENT_SYNC_REPO_RAW_BASE_URL,
    localOnly: true,
    state: {
      lastCheckedAt: syncState.lastCheckedAt,
      lastRunAt: syncState.lastRunAt,
      knownJobs: Object.keys(syncState.jobs).length,
      recentRuns: syncState.runs.slice(-8).reverse()
    },
    renderer: {
      busy: Boolean(renderState.currentJob),
      currentJob: publicJob(renderState.currentJob)
    },
    index: index ? {
      source: index.source,
      sourceUrl: index.sourceUrl,
      updatedAt: index.updatedAt,
      warning: index.warning || '',
      jobs: index.jobs.map(job => publicAgentSyncJob(job, syncState))
    } : null
  };
}

function agentSyncSourceUrlForAction(action, index) {
  const direct = cleanString(action.sourceUrl || action.url);
  if (direct) return direct;
  const sourcePath = cleanString(action.sourcePath || action.path || action.repoPath);
  if (!sourcePath) throw new Error('Asset action requires sourcePath or sourceUrl.');
  if (/^https?:\/\//i.test(sourcePath) || sourcePath.startsWith('file:')) return sourcePath;
  return repoRawUrlForPath(sourcePath, index?.repoRawBaseUrl || AGENT_SYNC_REPO_RAW_BASE_URL);
}

function safeAgentSyncFilename(value, kind) {
  const filename = safeUploadFilename(value, kind === 'image' ? 'image' : kind === 'narration' ? 'narration' : 'asset');
  const ext = path.extname(filename).toLowerCase();
  const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.mp3', '.wav', '.m4a', '.json', '.txt']);
  if (!allowed.has(ext)) throw new Error(`Agent Sync asset extension is not allowed: ${ext || '(none)'}`);
  if (kind === 'image' && ext !== '.png') throw new Error('Food image assets must be PNG files.');
  if (kind === 'narration' && !['.mp3', '.wav', '.m4a'].includes(ext)) throw new Error('Narration assets must be MP3, WAV, or M4A files.');
  return filename;
}

function agentSyncSubdirForKind(kind) {
  const clean = cleanString(kind).toLowerCase();
  if (clean === 'image') return 'images';
  if (clean === 'narration') return 'narration';
  if (clean === 'split-audio' || clean === 'splitAudio') return 'split-audio';
  if (clean === 'script') return 'scripts';
  if (clean === 'subtitles') return 'subtitles';
  return 'assets';
}

function normalizeSplitAudioManifestPath(value) {
  const clean = cleanString(value).replace(/\\/g, '/');
  if (!clean) return '';
  if (clean.startsWith('docs/')) return clean.slice('docs/'.length);
  if (clean.startsWith('studio-data/')) return `/${clean}`;
  return clean;
}

function splitAudioFromManifestBuffer(buffer, manifestPath, existing = {}, take = '') {
  let manifest = null;
  try {
    manifest = JSON.parse(buffer.toString('utf8'));
  } catch {
    throw new Error('Split-audio asset must be a JSON manifest.');
  }

  const blocks = Array.isArray(manifest.blocks) ? manifest.blocks : [];
  if (!blocks.length) throw new Error('Split-audio manifest has no blocks.');

  const blockGapSeconds = finiteNumber(
    manifest.blockGapSeconds ?? existing.blockGapSeconds,
    0.08
  );
  let cursor = 0;
  const normalizedBlocks = blocks.map((block, index) => {
    const audioPath = normalizeSplitAudioManifestPath(block.path || block.audioFile);
    const durationSeconds = finiteNumber(block.durationSeconds ?? block.mediaDurationSeconds, null);
    const explicitOffsetSeconds = finiteNumber(block.offsetSeconds, null);
    const offsetSeconds = explicitOffsetSeconds ?? (durationSeconds != null ? cursor : null);
    if (durationSeconds != null && durationSeconds > 0 && offsetSeconds != null) {
      cursor = offsetSeconds + durationSeconds + blockGapSeconds;
    }
    return {
      id: cleanString(block.id),
      index: finiteNumber(block.index, index),
      kind: cleanString(block.kind),
      sectionKey: cleanString(block.sectionKey) || null,
      path: audioPath,
      productionPath: cleanString(block.productionPath || block.productionAudioFile) || null,
      text: cleanString(block.text),
      offsetSeconds,
      durationSeconds,
      mediaDurationSeconds: finiteNumber(block.mediaDurationSeconds, null)
    };
  }).filter(block => block.path && block.offsetSeconds != null && block.durationSeconds != null && block.durationSeconds > 0);

  if (!normalizedBlocks.length) throw new Error('Split-audio manifest has no playable blocks.');
  const inferredDurationSeconds = Math.max(...normalizedBlocks.map(block => block.offsetSeconds + block.durationSeconds));
  return {
    mode: 'split-blocks',
    take: cleanString(take || manifest.take || existing.take) || 'agent-sync',
    manifestPath,
    productionManifestPath: cleanString(manifest.productionManifestPath || manifest.productionAudioManifestFile || existing.productionManifestPath) || null,
    profileId: cleanString(manifest.profileId || manifest.settings?.profileId || existing.profileId) || null,
    voiceLabel: cleanString(manifest.voice?.label || manifest.voiceLabel || manifest.settings?.voiceLabel || existing.voiceLabel) || null,
    modelId: cleanString(manifest.modelId || manifest.settings?.modelId || existing.modelId) || null,
    generatedAt: cleanString(manifest.generatedAt || existing.generatedAt) || null,
    blockCount: finiteNumber(manifest.blockCount, normalizedBlocks.length),
    blockGapSeconds,
    durationSeconds: finiteNumber(manifest.durationSeconds ?? existing.durationSeconds, inferredDurationSeconds),
    pronunciationOverrides: Array.isArray(manifest.pronunciationOverrides)
      ? manifest.pronunciationOverrides
      : Array.isArray(existing.pronunciationOverrides)
        ? existing.pronunciationOverrides
        : [],
    blocks: normalizedBlocks
  };
}

function baseInputFoodShell(foodId, body = {}) {
  const base = findFood(foodId) || {};
  return {
    id: foodId,
    name: cleanString(body.foodName) || base.name || foodId.replace(/-/g, ' '),
    foodType: safeSlug(body.foodType || base.foodType || 'misc') || 'misc',
    foodTypeLabel: cleanString(body.foodTypeLabel || base.foodTypeLabel),
    kcal: finiteNumber(body.kcal ?? base.kcal ?? base.header?.kcal, null),
    basis: base.basis || { value: 100, unit: 'g' },
    header: base.header || {},
    metrics: {},
    assets: {},
    episode: {},
    status: {}
  };
}

function writeAgentSyncAsset(body, buffer) {
  const rawKind = cleanString(body.kind || body.type || body.role || 'asset');
  const normalizedKind = normalizeAssetKind(rawKind);
  const foodId = safeSlug(body.foodId || body.food?.id || '');
  const filename = safeAgentSyncFilename(body.filename || body.name || path.basename(cleanString(body.sourcePath || body.sourceUrl || 'asset')), normalizedKind);
  const subdir = path.join(agentSyncSubdirForKind(rawKind), foodId || 'shared');
  const targetDir = path.join(UPLOAD_DIR, subdir);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, filename);
  if (!isInside(UPLOAD_DIR, targetPath)) throw new Error('Invalid Agent Sync upload path.');
  fs.writeFileSync(targetPath, buffer);

  const relativePath = path.relative(UPLOAD_DIR, targetPath).split(path.sep).join('/');
  const publicPath = `/studio-data/uploads/${relativePath}`;
  const stem = safeSlug(path.basename(filename, path.extname(filename))) || Date.now().toString(36);
  const assetId = cleanString(body.assetId) || ['agent-sync', normalizedKind, foodId || 'shared', stem].join('.');
  const now = new Date().toISOString();
  const asset = normalizeInputAsset(assetId, {
    id: assetId,
    label: cleanString(body.label) || filename,
    kind: normalizedKind,
    path: publicPath,
    mimeType: cleanString(body.mimeType) || CONTENT_TYPES.get(path.extname(filename).toLowerCase()) || '',
    sizeBytes: buffer.length,
    foodId,
    role: cleanString(body.role || rawKind),
    source: 'agent-sync',
    createdAt: now,
    updatedAt: now
  });

  const db = readInputDatabase();
  db.assets.files[asset.id] = asset;

  let food = null;
  if (foodId && body.attachToFood !== false) {
    food = normalizeInputFood(foodId, {
      ...(baseInputFoodShell(foodId, body)),
      ...(db.foods[foodId] || {})
    });
    food.library = {
      ...(food.library || {}),
      uploadedAssets: {
        ...(food.library?.uploadedAssets || {}),
        [asset.id]: publicPath
      }
    };
    if (normalizedKind === 'image') {
      food.customFoodImagePath = publicPath;
      food.assets = {
        ...(food.assets || {}),
        customFoodImage: {
          ...(food.assets?.customFoodImage || {}),
          ...(body.assetPatch && typeof body.assetPatch === 'object' ? body.assetPatch : {}),
          path: publicPath
        }
      };
      const width = finiteNumber(body.customFoodImageWidth ?? body.assetPatch?.width ?? food.assets.customFoodImage.width, null);
      const height = finiteNumber(body.customFoodImageHeight ?? body.assetPatch?.height ?? food.assets.customFoodImage.height, null);
      if (width != null) {
        food.customFoodImageWidth = width;
        food.assets.customFoodImage.width = width;
      }
      if (height != null) {
        food.customFoodImageHeight = height;
        food.assets.customFoodImage.height = height;
      }
    } else if (normalizedKind === 'narration') {
      food.audioPath = publicPath;
      food.library.audioPath = publicPath;
      food.episode = {
        ...(food.episode || {}),
        audio: {
          ...(food.episode?.audio || {}),
          path: publicPath,
          take: cleanString(body.take) || food.episode?.audio?.take || 'agent-sync'
        }
      };
    } else if (rawKind === 'split-audio' || rawKind === 'splitAudio') {
      const splitAudioManifest = splitAudioFromManifestBuffer(
        buffer,
        publicPath,
        food.episode?.splitAudio || {},
        cleanString(body.take) || ''
      );
      food.splitAudioManifestPath = publicPath;
      food.library.splitAudioManifestPath = publicPath;
      food.episode = {
        ...(food.episode || {}),
        splitAudio: splitAudioManifest
      };
    } else if (rawKind === 'script') {
      food.library.scriptAssetPath = publicPath;
    } else if (rawKind === 'subtitles') {
      food.library.subtitlesPath = publicPath;
    }
    food.updatedAt = now;
    db.foods[foodId] = normalizeInputFood(foodId, food);
  }

  const savedDb = writeInputDatabase(db);
  return {
    db: savedDb,
    asset: savedDb.assets.files[asset.id],
    food: foodId ? savedDb.foods[foodId] || null : null
  };
}

async function executeAgentSyncAction(action, context, options) {
  const type = action.type;
  const result = { type, label: cleanString(action.label), ok: true };

  if (type === 'upsertFood' || type === 'upsertFoodEntry' || type === 'food') {
    const source = action.food && typeof action.food === 'object' ? action.food : action.entry || action.patch || action;
    const foodId = safeSlug(source.id || source.foodId || action.foodId || context.lastFoodId || context.job?.foodId);
    const { db, food } = upsertInputFood(inputFoodFromBody({ food: { ...source, id: foodId } }));
    context.lastFoodId = food.id;
    result.food = publicInputFood(food);
    result.databaseUpdatedAt = db.updatedAt;
    return result;
  }

  if (type === 'upsertScript' || type === 'script') {
    const foodId = safeSlug(action.foodId || context.lastFoodId || action.food?.id);
    if (!foodId) throw new Error('Script action requires foodId.');
    const existing = readInputDatabase().foods[foodId] || baseInputFoodShell(foodId, action);
    const scriptText = cleanString(action.scriptText || action.narrationText || action.text);
    const patch = {
      ...existing,
      id: foodId,
      scriptText: scriptText || existing.scriptText || existing.narrationText || '',
      narrationText: cleanString(action.narrationText) || scriptText || existing.narrationText || '',
      episode: {
        ...(existing.episode || {}),
        ...(action.episode && typeof action.episode === 'object' ? action.episode : {})
      },
      library: {
        ...(existing.library || {}),
        scriptText: scriptText || existing.library?.scriptText || ''
      }
    };
    const { db, food } = upsertInputFood(patch);
    context.lastFoodId = food.id;
    result.food = publicInputFood(food);
    result.databaseUpdatedAt = db.updatedAt;
    return result;
  }

  if (type === 'downloadAsset' || type === 'attachAsset' || type === 'asset') {
    const url = agentSyncSourceUrlForAction(action, context.index);
    const buffer = await fetchUrlBuffer(url, { maxBytes: MAX_AGENT_SYNC_ASSET_BYTES });
    const { db, asset, food } = writeAgentSyncAsset(action, buffer);
    if (food?.id) context.lastFoodId = food.id;
    result.sourceUrl = url;
    result.asset = publicInputAsset(asset);
    result.food = food ? publicInputFood(food) : null;
    result.databaseUpdatedAt = db.updatedAt;
    return result;
  }

  if (type === 'exportPngs' || type === 'pngs') {
    const foodId = safeSlug(action.foodId || context.lastFoodId);
    const food = findFood(foodId);
    if (!food) throw new Error(`Food not found for PNG export: ${foodId}`);
    const exported = await exportDbv2SectionPngs(food, context.baseUrl, action);
    context.lastFoodId = safeSlug(food.id || food.name);
    result.sections = exported.files.map(file => file.sectionId);
    result.files = exported.files;
    return result;
  }

  if (type === 'renderMp4' || type === 'mp4' || type === 'renderVideo') {
    const foodId = safeSlug(action.foodId || context.lastFoodId);
    const food = findFood(foodId);
    if (!food) throw new Error(`Food not found for MP4 render: ${foodId}`);
    if (renderState.currentJob) throw new Error(`Renderer is busy with ${renderState.currentJob.foodId}.`);
    const renderOptions = action.options && typeof action.options === 'object' ? action.options : {};
    const job = await startAgentRenderJob(food, context.baseUrl, {
      ...renderOptions,
      ...action,
      force: action.force !== false
    }, options);
    context.lastFoodId = safeSlug(food.id || food.name);
    context.renderJob = job;
    result.job = publicJob(job);
    return result;
  }

  if (type === 'selectFood') {
    const foodId = safeSlug(action.foodId || context.lastFoodId);
    if (!findFood(foodId)) throw new Error(`Food not found: ${foodId}`);
    context.lastFoodId = foodId;
    result.foodId = foodId;
    return result;
  }

  throw new Error(`Unsupported Agent Sync action: ${type}`);
}

async function runAgentSyncJob(jobId, request, options) {
  const index = await fetchAgentSyncIndex();
  const job = index.jobs.find(item => item.id === safeSlug(jobId));
  if (!job) throw new Error(`Agent Sync job not found: ${jobId}`);
  if (job.status !== 'ready') throw new Error(`Agent Sync job is not ready: ${job.status}`);

  const syncState = readAgentSyncState();
  const run = {
    id: agentSyncRunId(job.id),
    jobId: job.id,
    title: job.title,
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: '',
    actions: [],
    error: ''
  };
  syncState.runs.push(run);
  syncState.jobs[job.id] = {
    ...(syncState.jobs[job.id] || {}),
    status: 'running',
    lastRunAt: run.startedAt,
    lastResult: null
  };
  writeAgentSyncState(syncState);

  const context = {
    index,
    job,
    baseUrl: requestBaseUrl(request, options),
    lastFoodId: job.foodId,
    renderJob: null
  };

  try {
    for (const action of job.actions) {
      if (action.enabled === false) {
        run.actions.push({ type: action.type, label: cleanString(action.label), skipped: true });
        continue;
      }
      const actionResult = await executeAgentSyncAction(action, context, options);
      run.actions.push(actionResult);
    }
    run.status = context.renderJob ? 'rendering' : 'complete';
    run.completedAt = new Date().toISOString();
    const latest = readAgentSyncState();
    latest.lastRunAt = run.completedAt;
    latest.jobs[job.id] = {
      status: run.status,
      lastRunAt: run.startedAt,
      lastResult: {
        runId: run.id,
        completedAt: run.completedAt,
        renderJob: publicJob(context.renderJob)
      }
    };
    latest.runs = [...latest.runs.filter(item => item.id !== run.id), run];
    writeAgentSyncState(latest);
    return { index, job, run, renderJob: context.renderJob };
  } catch (error) {
    run.status = 'failed';
    run.completedAt = new Date().toISOString();
    run.error = error.message;
    const latest = readAgentSyncState();
    latest.lastRunAt = run.completedAt;
    latest.jobs[job.id] = {
      status: 'failed',
      lastRunAt: run.startedAt,
      lastResult: {
        runId: run.id,
        completedAt: run.completedAt,
        error: error.message
      }
    };
    latest.runs = [...latest.runs.filter(item => item.id !== run.id), run];
    writeAgentSyncState(latest);
    throw error;
  }
}

function pushLog(job, chunk) {
  String(chunk)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => {
      job.logs.push(line);
      while (job.logs.length > MAX_LOG_LINES) job.logs.shift();
      const frameMatch = line.match(/Rendered\s+(\d+)\/(\d+)\s+frames\s+\(([^)]+)\)/i);
      if (frameMatch) {
        const current = Number(frameMatch[1]);
        const total = Number(frameMatch[2]);
        job.frame = {
          current,
          total,
          time: frameMatch[3],
          percent: total > 0 ? Number(((current / total) * 100).toFixed(1)) : 0
        };
        job.message = `Rendering frames ${current}/${total}`;
        return;
      }
      if (/Build audio mix/i.test(line)) job.message = 'Mixing audio';
      if (/Encode MP4/i.test(line)) job.message = 'Encoding MP4';
      if (/Wrote\s+/i.test(line)) job.message = 'MP4 ready';
    });
}

function trimJobHistory() {
  const entries = [...renderState.jobs.values()].sort((a, b) => a.id - b.id);
  while (entries.length > JOB_HISTORY_LIMIT) {
    const job = entries.shift();
    if (job && job !== renderState.currentJob) renderState.jobs.delete(String(job.id));
  }
}

function cleanupJobTempFiles(job) {
  if (!job?.tempDir) return;
  try {
    fs.rmSync(job.tempDir, { recursive: true, force: true });
  } catch {}
  job.tempDir = '';
}

function writeJobPayload(job, name, payload) {
  if (!payload || typeof payload !== 'object') return '';
  if (!job.tempDir) job.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `foodranked-studio-render-${job.id}-`));
  const filePath = path.join(job.tempDir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload), 'utf8');
  return filePath;
}

function childNodeEnvironment() {
  const env = { ...process.env };
  if (process.versions?.electron) env.ELECTRON_RUN_AS_NODE = '1';
  return env;
}

function canListen(port) {
  return new Promise(resolve => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 100 && port <= 65535; port += 1) {
    if (await canListen(port)) return port;
  }
  throw new Error(`No free render port found starting at ${startPort}.`);
}

async function startRenderJob(food, body, options) {
  const downloadUrl = downloadPathForFood(food);
  const outputPath = body.output ? path.resolve(String(body.output)) : filePathForDownload(downloadUrl);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const job = {
    id: renderState.nextJobId,
    foodId: safeSlug(food.id || food.name),
    status: 'running',
    message: 'Starting renderer',
    startedAt: new Date().toISOString(),
    completedAt: null,
    exitCode: null,
    downloadUrl,
    outputPath,
    logs: [],
    frame: null,
    child: null,
    tempDir: ''
  };
  renderState.nextJobId += 1;
  renderState.currentJob = job;
  renderState.jobs.set(String(job.id), job);
  trimJobHistory();

  const renderPort = await findFreePort(options.renderPortStart);
  const args = [
    path.join(REPO_ROOT, 'scripts/render-vbv2-mp4.js'),
    job.foodId,
    '--port',
    String(renderPort)
  ];

  args.push('--output', outputPath);
  if (Number.isFinite(Number(body.seconds)) && Number(body.seconds) > 0) args.push('--seconds', String(Number(body.seconds)));
  if (Number.isFinite(Number(body.fps)) && Number(body.fps) > 0) args.push('--fps', String(Number(body.fps)));
  const placementJson = writeJobPayload(job, 'placement', body.layoutPlacement);
  if (placementJson) args.push('--placement-json', placementJson);
  const layoutStateJson = writeJobPayload(job, 'layout-state', body.layoutState);
  if (layoutStateJson) args.push('--layout-state-json', layoutStateJson);
  const videoStateJson = writeJobPayload(job, 'video-state', body.videoState);
  if (videoStateJson) args.push('--video-state-json', videoStateJson);
  const inputDatabaseJson = writeJobPayload(job, 'input-database', body.inputDatabase || readInputDatabase());
  if (inputDatabaseJson) args.push('--database-json', inputDatabaseJson);
  if (body.noAudio) args.push('--no-audio');
  if (body.noMusic) args.push('--no-music');
  if (body.noSfx) args.push('--no-sfx');

  const child = spawn(process.execPath, args, {
    cwd: REPO_ROOT,
    env: childNodeEnvironment(),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  job.child = child;
  pushLog(job, `${process.execPath} ${args.map(arg => (/\s/.test(arg) ? JSON.stringify(arg) : arg)).join(' ')}`);

  child.stdout.on('data', chunk => pushLog(job, chunk));
  child.stderr.on('data', chunk => pushLog(job, chunk));
  child.on('error', error => {
    job.status = 'failed';
    job.message = error.message;
    job.completedAt = new Date().toISOString();
    renderState.currentJob = null;
    cleanupJobTempFiles(job);
  });
  child.on('exit', code => {
    job.exitCode = code;
    job.completedAt = new Date().toISOString();
    job.child = null;
    if (code === 0 && fs.existsSync(outputPath)) {
      job.status = 'complete';
      job.message = 'MP4 ready';
    } else {
      job.status = 'failed';
      job.message = code === 0 ? 'Renderer finished, but MP4 file was not found.' : `Renderer failed with exit code ${code}.`;
    }
    if (renderState.currentJob === job) renderState.currentJob = null;
    cleanupJobTempFiles(job);
  });

  return job;
}

function databaseSummary() {
  const foods = readStudioFoods().map(publicFood);
  const finalized = foods.filter(food => food.finalized).length;
  const videos = foods.filter(food => food.hasVideo).length;
  const assets = readAppAssets();
  const inputDb = readInputDatabase();
  return {
    foods: foods.length,
    finalized,
    unfinalized: Math.max(0, foods.length - finalized),
    videos,
    assets: assets.count + Object.keys(inputDb.assets.files || {}).length,
    inputFoods: Object.values(inputDb.foods || {}).filter(food => food && !food.deleted).length,
    inputAssets: Object.keys(inputDb.assets.files || {}).length
  };
}

function commandAvailable(command, args = ['-version']) {
  const result = spawnSync(bundledCommandPath(command), args, { stdio: 'ignore' });
  return result.status === 0;
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

async function handleApi(request, response, url, options) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, {
      ok: true,
      app: 'FoodRanked Studio',
      localOnly: true,
      repoRoot: REPO_ROOT,
      dataDir: DATA_DIR,
      secrets: secretPresence(),
      tools: TOOL_DEFINITIONS,
      layout: universalLayoutHealth(),
      summary: databaseSummary(),
      runtime: {
        node: process.version,
        ffmpeg: commandAvailable('ffmpeg'),
        ffprobe: commandAvailable('ffprobe')
      }
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/tools') {
    sendJson(response, 200, { ok: true, tools: TOOL_DEFINITIONS });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/layout/universal') {
    try {
      sendJson(response, 200, readUniversalLayoutPayload());
    } catch (error) {
      sendError(response, 500, error.message);
    }
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/foods') {
    const foods = readStudioFoods().map(publicFood).sort((a, b) => a.name.localeCompare(b.name));
    sendJson(response, 200, { ok: true, foods });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/input/database') {
    sendJson(response, 200, { ok: true, database: readInputDatabase() });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/input/foods') {
    const foods = Object.values(readInputDatabase().foods || {})
      .filter(food => food && !food.deleted)
      .map(publicInputFood)
      .sort((a, b) => a.name.localeCompare(b.name));
    sendJson(response, 200, { ok: true, foods });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/input/foods') {
    let body;
    try {
      body = await readJsonBody(request);
      const { db, food } = upsertInputFood(inputFoodFromBody(body));
      sendJson(response, 200, { ok: true, food: publicInputFood(food), database: db });
    } catch (error) {
      sendError(response, 400, error.message);
    }
    return true;
  }

  const inputFoodMatch = url.pathname.match(/^\/api\/input\/foods\/([^/]+)$/);
  if (inputFoodMatch) {
    const foodId = safeSlug(inputFoodMatch[1]);
    if (request.method === 'GET') {
      const food = readInputDatabase().foods[foodId] || null;
      if (!food || food.deleted) sendError(response, 404, 'Input food not found.');
      else sendJson(response, 200, { ok: true, food: publicInputFood(food) });
      return true;
    }
    if (request.method === 'DELETE') {
      try {
        const { db, food } = deleteInputFood(foodId);
        sendJson(response, 200, { ok: true, food: publicInputFood(food), database: db });
      } catch (error) {
        sendError(response, 400, error.message);
      }
      return true;
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/input/assets') {
    const assets = Object.values(readInputDatabase().assets.files || {})
      .map(publicInputAsset)
      .sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label));
    sendJson(response, 200, { ok: true, assets });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/input/assets') {
    let body;
    try {
      body = await readJsonBody(request);
      const { db, asset, food } = uploadAssetFromBody(body);
      sendJson(response, 200, {
        ok: true,
        asset: publicInputAsset(asset),
        food: food ? publicInputFood(food) : null,
        database: db
      });
    } catch (error) {
      sendError(response, 400, error.message);
    }
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/agent/capabilities') {
    sendJson(response, 200, {
      ok: true,
      localOnly: true,
      purpose: 'Durable local automation for Studio food entry, DBv2 PNG export, and VBv2 MP4 rendering.',
      storage: {
        dataDir: DATA_DIR,
        inputDatabaseFile: INPUT_DATABASE_FILE,
        renderDir: RENDER_DIR,
        uploadDir: UPLOAD_DIR,
        agentExportDir: AGENT_EXPORT_DIR
      },
      endpoints: {
        upsertFood: 'POST /api/agent/foods',
        uploadAsset: 'POST /api/agent/assets',
        freshPlacement: 'POST /api/agent/foods/:foodId/placement',
        pngs: 'POST /api/agent/foods/:foodId/pngs',
        mp4: 'POST /api/agent/foods/:foodId/mp4',
        combinedExport: 'POST /api/agent/foods/:foodId/export',
        listExports: 'GET /api/agent/foods/:foodId/exports'
      },
      sections: [...REQUIRED_LAYOUT_SECTION_IDS],
      renderer: {
        busy: Boolean(renderState.currentJob),
        currentJob: publicJob(renderState.currentJob)
      }
    });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/agent/foods') {
    try {
      const body = await readJsonBody(request);
      const { db, food } = upsertInputFood(inputFoodFromBody(body));
      sendJson(response, 200, {
        ok: true,
        food: publicInputFood(food),
        database: db,
        note: 'Food saved in the local Studio input database.'
      });
    } catch (error) {
      sendError(response, 400, error.message);
    }
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/agent/assets') {
    try {
      const body = await readJsonBody(request);
      const { db, asset, food } = uploadAssetFromBody(body);
      sendJson(response, 200, {
        ok: true,
        asset: publicInputAsset(asset),
        food: food ? publicInputFood(food) : null,
        database: db,
        note: 'Asset saved in the local Studio input database.'
      });
    } catch (error) {
      sendError(response, 400, error.message);
    }
    return true;
  }

  const agentFoodMatch = url.pathname.match(/^\/api\/agent\/foods\/([^/]+)\/(placement|pngs|mp4|export|exports)$/);
  if (agentFoodMatch) {
    const foodId = safeSlug(agentFoodMatch[1]);
    const action = agentFoodMatch[2];
    const food = findFood(foodId);
    if (!food) {
      sendError(response, 404, `Food not found: ${foodId}`);
      return true;
    }

    if (request.method === 'GET' && action === 'exports') {
      try {
        sendJson(response, 200, { ok: true, food: publicFood(food), files: agentExportsForFood(foodId) });
      } catch (error) {
        sendError(response, 400, error.message);
      }
      return true;
    }

    if (request.method !== 'POST') {
      sendError(response, 405, 'Method not allowed.');
      return true;
    }

    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      sendError(response, 400, error.message);
      return true;
    }

    try {
      const baseUrl = requestBaseUrl(request, options);
      if (action === 'placement') {
        const placement = await freshDbv2PlacementForFood(food, baseUrl, body);
        sendJson(response, 200, { ok: true, food: publicFood(food), placement });
        return true;
      }
      if (action === 'pngs') {
        const exported = await exportDbv2SectionPngs(food, baseUrl, body);
        sendJson(response, 200, {
          ok: true,
          food: publicFood(food),
          sections: exported.files.map(file => file.sectionId),
          files: exported.files,
          outputDir: exported.outputDir
        });
        return true;
      }
      if (action === 'mp4') {
        if (renderState.currentJob) {
          if (renderState.currentJob.foodId === foodId) {
            sendJson(response, 202, { ok: true, status: 'running', job: publicJob(renderState.currentJob) });
            return true;
          }
          sendError(response, 409, `Renderer is busy with ${renderState.currentJob.foodId}.`, {
            job: publicJob(renderState.currentJob)
          });
          return true;
        }
        const job = await startAgentRenderJob(food, baseUrl, body, options);
        sendJson(response, 202, { ok: true, status: 'running', job: publicJob(job) });
        return true;
      }
      if (action === 'export') {
        const result = { ok: true, food: publicFood(food) };
        if (body.pngs !== false) {
          const exported = await exportDbv2SectionPngs(food, baseUrl, body);
          result.pngs = {
            sections: exported.files.map(file => file.sectionId),
            files: exported.files,
            outputDir: exported.outputDir
          };
        }
        if (body.mp4 !== false) {
          if (renderState.currentJob) {
            result.mp4 = {
              status: 'running',
              job: publicJob(renderState.currentJob),
              warning: `Renderer is already busy with ${renderState.currentJob.foodId}.`
            };
          } else {
            const job = await startAgentRenderJob(food, baseUrl, body, options);
            result.mp4 = { status: 'running', job: publicJob(job) };
            response.statusCode = 202;
          }
        }
        sendJson(response, response.statusCode || 200, result);
        return true;
      }
    } catch (error) {
      if ((action === 'mp4' || action === 'export') && renderState.currentJob?.foodId === foodId && !renderState.currentJob.child) {
        renderState.currentJob = null;
      }
      sendError(response, 500, error.message);
      return true;
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/agent-sync/status') {
    sendJson(response, 200, publicAgentSyncStatus());
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/agent-sync/check') {
    try {
      const index = await fetchAgentSyncIndex();
      const syncState = readAgentSyncState();
      syncState.lastCheckedAt = new Date().toISOString();
      syncState.sourceUrl = index.sourceUrl;
      index.jobs.forEach(job => {
        syncState.jobs[job.id] = {
          status: syncState.jobs[job.id]?.status || 'new',
          lastRunAt: syncState.jobs[job.id]?.lastRunAt || '',
          lastResult: syncState.jobs[job.id]?.lastResult || null
        };
      });
      writeAgentSyncState(syncState);
      sendJson(response, 200, publicAgentSyncStatus({ index }));
    } catch (error) {
      sendError(response, 500, error.message);
    }
    return true;
  }

  const agentSyncRunMatch = url.pathname.match(/^\/api\/agent-sync\/jobs\/([^/]+)\/run$/);
  if (request.method === 'POST' && agentSyncRunMatch) {
    try {
      await readJsonBody(request);
      const result = await runAgentSyncJob(agentSyncRunMatch[1], request, options);
      sendJson(response, result.renderJob ? 202 : 200, {
        ok: true,
        status: result.run.status,
        job: publicAgentSyncJob(result.job, readAgentSyncState()),
        run: result.run,
        renderJob: publicJob(result.renderJob)
      });
    } catch (error) {
      sendError(response, 500, error.message);
    }
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/state') {
    sendJson(response, 200, { ok: true, state: readStudioState() });
    return true;
  }

  if ((request.method === 'PUT' || request.method === 'PATCH') && url.pathname === '/api/state') {
    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      sendError(response, 400, error.message);
      return true;
    }
    const next = request.method === 'PATCH'
      ? { ...readStudioState(), ...(body.state || body || {}) }
      : (body.state || body || {});
    sendJson(response, 200, { ok: true, state: writeStudioState(next) });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/backups/export') {
    sendJson(response, 200, {
      ok: true,
      exportedAt: new Date().toISOString(),
      state: readStudioState(),
      summary: databaseSummary(),
      tools: TOOL_DEFINITIONS,
      inputDatabase: readInputDatabase(),
      note: 'Browser-local builder state is added by the Studio UI during backup download.'
    });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/vbv2-renderer/status') {
    sendJson(response, 200, {
      ok: true,
      rendererAvailable: true,
      busy: Boolean(renderState.currentJob),
      currentJob: publicJob(renderState.currentJob),
      latestJob: publicJob([...renderState.jobs.values()].sort((a, b) => b.id - a.id)[0] || null)
    });
    return true;
  }

  const jobMatch = url.pathname.match(/^\/api\/vbv2-renderer\/jobs\/(\d+)$/);
  if (request.method === 'GET' && jobMatch) {
    const job = renderState.jobs.get(jobMatch[1]);
    if (!job) {
      sendError(response, 404, 'Render job not found.');
      return true;
    }
    sendJson(response, 200, { ok: true, job: publicJob(job) });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/vbv2-renderer/render') {
    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      sendError(response, 400, error.message);
      return true;
    }

    const foodId = safeSlug(body.foodId);
    if (!foodId) {
      sendError(response, 400, 'Missing foodId.');
      return true;
    }
    const food = findFood(foodId);
    if (!food) {
      sendError(response, 404, `Food not found: ${foodId}`);
      return true;
    }
    try {
      validateVbv2PlacementPayload(body.layoutPlacement, food);
    } catch (error) {
      sendError(response, 400, error.message || 'Missing DBv2 layout placement. Open the food in DBv2/VBv2 first, then render again.');
      return true;
    }

    const downloadUrl = downloadPathForFood(food);
    const outputPath = body.output ? path.resolve(String(body.output)) : filePathForDownload(downloadUrl);
    if (!body.force && !body.output && fs.existsSync(outputPath)) {
      sendJson(response, 200, { ok: true, status: 'ready', downloadUrl, outputPath });
      return true;
    }

    if (renderState.currentJob) {
      if (renderState.currentJob.foodId === safeSlug(food.id || food.name)) {
        sendJson(response, 202, { ok: true, status: 'running', job: publicJob(renderState.currentJob) });
        return true;
      }
      sendError(response, 409, `Renderer is busy with ${renderState.currentJob.foodId}.`, {
        job: publicJob(renderState.currentJob)
      });
      return true;
    }

    try {
      const job = await startRenderJob(food, body, options);
      sendJson(response, 202, { ok: true, status: 'running', job: publicJob(job) });
    } catch (error) {
      renderState.currentJob = null;
      sendError(response, 500, error.message);
    }
    return true;
  }

  return false;
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

function safeStaticPath(urlPathname) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPathname);
  } catch {
    return { status: 400, message: 'Bad request' };
  }

  if (pathname === '/') return { filePath: path.join(PUBLIC_ROOT, 'index.html') };
  if (pathname.startsWith('/studio/')) {
    const filePath = path.normalize(path.join(PUBLIC_ROOT, pathname.slice('/studio/'.length)));
    if (!isInside(PUBLIC_ROOT, filePath)) return { status: 403, message: 'Forbidden' };
    return { filePath };
  }
  if (pathname.startsWith('/docs/')) {
    const filePath = path.normalize(path.join(REPO_ROOT, pathname));
    if (!isInside(path.join(REPO_ROOT, 'docs'), filePath)) return { status: 403, message: 'Forbidden' };
    return { filePath };
  }
  if (pathname.startsWith('/studio-data/renders/')) {
    const filePath = path.normalize(path.join(RENDER_DIR, pathname.slice('/studio-data/renders/'.length)));
    if (!isInside(RENDER_DIR, filePath)) return { status: 403, message: 'Forbidden' };
    return { filePath };
  }
  if (pathname.startsWith('/studio-data/uploads/')) {
    const filePath = path.normalize(path.join(UPLOAD_DIR, pathname.slice('/studio-data/uploads/'.length)));
    if (!isInside(UPLOAD_DIR, filePath)) return { status: 403, message: 'Forbidden' };
    return { filePath };
  }
  if (pathname.startsWith('/studio-data/agent-exports/')) {
    const filePath = path.normalize(path.join(AGENT_EXPORT_DIR, pathname.slice('/studio-data/agent-exports/'.length)));
    if (!isInside(AGENT_EXPORT_DIR, filePath)) return { status: 403, message: 'Forbidden' };
    return { filePath };
  }
  return { status: 404, message: 'Not found' };
}

function attachmentFilename(filePath) {
  return path.basename(filePath).replace(/[^A-Za-z0-9._ -]/g, '_');
}

function serveStatic(request, response, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405);
    response.end('Method not allowed');
    return;
  }

  const resolved = safeStaticPath(url.pathname);
  if (!resolved.filePath) {
    response.writeHead(resolved.status || 404);
    response.end(resolved.message || 'Not found');
    return;
  }

  let filePath = resolved.filePath;
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
    const headers = {
      'Content-Type': CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store'
    };
    if (url.pathname.startsWith('/studio-data/renders/') && path.extname(filePath).toLowerCase() === '.mp4') {
      headers['Content-Disposition'] = `attachment; filename="${attachmentFilename(filePath)}"`;
    }
    response.writeHead(200, headers);
    if (request.method === 'HEAD') response.end();
    else response.end(contents);
  });
}

function studioUrl(host, port) {
  const printableHost = host === '0.0.0.0' || host === '::' ? '127.0.0.1' : host;
  return `http://${printableHost}:${port}/`;
}

async function startStudioServer(options = {}) {
  ensureDataDir();
  options = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    renderPortStart: DEFAULT_RENDER_PORT_START,
    portExplicit: false,
    ...options
  };
  let activePort = options.port;
  const server = http.createServer(async (request, response) => {
    const baseHost = request.headers.host || `${options.host}:${activePort}`;
    const url = new URL(request.url || '/', `http://${baseHost}`);
    try {
      if (await handleApi(request, response, url, options)) return;
      serveStatic(request, response, url);
    } catch (error) {
      sendError(response, 500, error.message || String(error));
    }
  });

  for (let port = options.port; port < options.port + 20 && port <= 65535; port += 1) {
    try {
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, options.host, () => {
          server.off('error', reject);
          resolve();
        });
      });
      activePort = port;
      return {
        server,
        host: options.host,
        port: activePort,
        url: studioUrl(options.host, activePort),
        dataDir: DATA_DIR,
        renderDir: RENDER_DIR
      };
    } catch (error) {
      if (options.portExplicit || error.code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error(`No free Studio port found starting at ${options.port}.`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const started = await startStudioServer(options);
  console.log(`FoodRanked Studio running: ${started.url}`);
  if (started.port !== options.port) console.log(`Port ${options.port} was busy, so Studio used ${started.port}.`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = {
  startStudioServer,
  parseArgs,
  secretPresence,
  databaseSummary
};
