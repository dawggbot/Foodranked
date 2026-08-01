#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { validateVbv2PlacementPayload } = require('../scripts/vbv2-placement-validation');

const REPO_ROOT = path.resolve(process.env.FOODRANKED_REPO_ROOT || path.resolve(__dirname, '..'));
const PUBLIC_ROOT = path.join(__dirname, 'public');
const DATA_DIR = path.resolve(process.env.FOODRANKED_STUDIO_DATA_DIR || path.join(REPO_ROOT, 'studio-data'));
const RENDER_DIR = path.resolve(process.env.FOODRANKED_STUDIO_RENDER_DIR || path.join(DATA_DIR, 'renders'));
const STATE_FILE = path.join(DATA_DIR, 'studio-state.json');
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4787;
const DEFAULT_RENDER_PORT_START = 4290;
const MAX_BODY_BYTES = 8 * 1024 * 1024;
const MAX_LOG_LINES = 240;
const JOB_HISTORY_LIMIT = 30;
const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
const VIDEO_STATE_KEY = 'foodranked-video-builder-v2-state-v1';

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
    label: 'Layout',
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
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
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
  ensureDataDir();
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

function readFoodsIndex() {
  const file = path.join(REPO_ROOT, 'docs/data/foods-index.json');
  const foods = readJsonFile(file, []);
  return Array.isArray(foods) ? foods : [];
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
    tier: food.episode?.tier || '',
    overallScore: food.episode?.overallScore ?? null,
    kcal: food.kcal ?? food.header?.kcal ?? null,
    finalized: FINALISATION_SAMPLE_FOOD_IDS.has(id) || Boolean(food.finalizedDownloaded || food.status?.finalizedDownloaded),
    hasVideo: fs.existsSync(renderFilePathForFoodId(id))
      || fs.existsSync(path.join(REPO_ROOT, `docs/video/episodes/${id}/${id}-vbv2.mp4`)),
    hasSplitAudio: Boolean(food.episode?.splitAudio?.manifestPath || food.splitAudio?.manifestPath)
  };
}

function findFood(foodId) {
  const safeId = safeSlug(foodId);
  return readFoodsIndex().find(food => safeSlug(food.id) === safeId || safeSlug(food.name) === safeId) || null;
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
  const videoStateJson = writeJobPayload(job, 'video-state', body.videoState);
  if (videoStateJson) args.push('--video-state-json', videoStateJson);
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
  const foods = readFoodsIndex().map(publicFood);
  const finalized = foods.filter(food => food.finalized).length;
  const videos = foods.filter(food => food.hasVideo).length;
  const assets = readAppAssets();
  return {
    foods: foods.length,
    finalized,
    unfinalized: Math.max(0, foods.length - finalized),
    videos,
    assets: assets.count
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

  if (request.method === 'GET' && url.pathname === '/api/foods') {
    const foods = readFoodsIndex().map(publicFood).sort((a, b) => a.name.localeCompare(b.name));
    sendJson(response, 200, { ok: true, foods });
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
