#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { validateVbv2PlacementPayload } = require('./vbv2-placement-validation');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4173;
const DEFAULT_RENDER_PORT_START = 4190;
const MAX_LOG_LINES = 200;
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const JOB_HISTORY_LIMIT = 20;

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

const state = {
  nextJobId: 1,
  currentJob: null,
  jobs: new Map()
};

function usage() {
  return `
Serve VBv2 with a local MP4 render helper.

Usage:
  node scripts/serve-vbv2-render-helper.js [options]

Options:
  --port <number>              Web server port. Default: ${DEFAULT_PORT}
  --host <host>                Bind host. Default: ${DEFAULT_HOST}
  --render-port-start <number> First port to try for renderer's private server. Default: ${DEFAULT_RENDER_PORT_START}
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

function safeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readFoodsIndex() {
  const file = path.join(REPO_ROOT, 'docs/data/foods-index.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function findFood(foodId) {
  const safeId = safeSlug(foodId);
  const foods = readFoodsIndex();
  return foods.find(food => safeSlug(food.id) === safeId || safeSlug(food.name) === safeId) || null;
}

function downloadPathForFood(food) {
  const id = safeSlug(food.id || food.name);
  return `/docs/video/episodes/${id}/${id}-vbv2.mp4`;
}

function filePathForDownload(downloadPath) {
  return path.join(REPO_ROOT, downloadPath.replace(/^\/+/, ''));
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
    logTail: job.logs.slice(-20)
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
      if (/Build audio mix/i.test(line)) job.message = 'Mixing narration, music, and SFX';
      if (/Encode MP4/i.test(line)) job.message = 'Encoding MP4';
      if (/Wrote\s+/i.test(line)) job.message = 'MP4 ready';
    });
}

function trimJobHistory() {
  const entries = [...state.jobs.values()].sort((a, b) => a.id - b.id);
  while (entries.length > JOB_HISTORY_LIMIT) {
    const job = entries.shift();
    if (job && job !== state.currentJob) state.jobs.delete(String(job.id));
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
  if (!job.tempDir) job.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `foodranked-vbv2-render-${job.id}-`));
  const filePath = path.join(job.tempDir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload), 'utf8');
  return filePath;
}

function helperPagePath() {
  return '/docs/video-builder-v2/index.html';
}

function networkHosts() {
  const hosts = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.family === 'IPv4' && !entry.internal) hosts.push(entry.address);
    }
  }
  return [...new Set(hosts)];
}

function helperUrls(host, port) {
  const path = helperPagePath();
  const urls = [];
  if (host === '0.0.0.0' || host === '::') {
    urls.push(`http://127.0.0.1:${port}${path}`);
    for (const address of networkHosts()) urls.push(`http://${address}:${port}${path}`);
  } else {
    urls.push(`http://${host}:${port}${path}`);
  }
  return urls;
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
  const job = {
    id: state.nextJobId,
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
  state.nextJobId += 1;
  state.currentJob = job;
  state.jobs.set(String(job.id), job);
  trimJobHistory();

  const renderPort = await findFreePort(options.renderPortStart);
  const args = [
    path.join(REPO_ROOT, 'scripts/render-vbv2-mp4.js'),
    job.foodId,
    '--port',
    String(renderPort)
  ];

  if (body.output) args.push('--output', outputPath);
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
    stdio: ['ignore', 'pipe', 'pipe']
  });
  job.child = child;
  pushLog(job, `${process.execPath} ${args.join(' ')}`);

  child.stdout.on('data', chunk => pushLog(job, chunk));
  child.stderr.on('data', chunk => pushLog(job, chunk));
  child.on('error', error => {
    job.status = 'failed';
    job.message = error.message;
    job.completedAt = new Date().toISOString();
    state.currentJob = null;
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
    if (state.currentJob === job) state.currentJob = null;
    cleanupJobTempFiles(job);
  });

  return job;
}

async function handleApi(request, response, url, options) {
  if (request.method === 'GET' && url.pathname === '/api/vbv2-renderer/status') {
    sendJson(response, 200, {
      ok: true,
      rendererAvailable: true,
      busy: Boolean(state.currentJob),
      currentJob: publicJob(state.currentJob),
      latestJob: publicJob([...state.jobs.values()].sort((a, b) => b.id - a.id)[0] || null)
    });
    return true;
  }

  const jobMatch = url.pathname.match(/^\/api\/vbv2-renderer\/jobs\/(\d+)$/);
  if (request.method === 'GET' && jobMatch) {
    const job = state.jobs.get(jobMatch[1]);
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
      sendJson(response, 200, {
        ok: true,
        status: 'ready',
        downloadUrl,
        outputPath
      });
      return true;
    }

    if (state.currentJob) {
      if (state.currentJob.foodId === safeSlug(food.id || food.name)) {
        sendJson(response, 202, { ok: true, status: 'running', job: publicJob(state.currentJob) });
        return true;
      }
      sendError(response, 409, `Renderer is busy with ${state.currentJob.foodId}.`, {
        job: publicJob(state.currentJob)
      });
      return true;
    }

    try {
      const job = await startRenderJob(food, body, options);
      sendJson(response, 202, { ok: true, status: 'running', job: publicJob(job) });
    } catch (error) {
      state.currentJob = null;
      sendError(response, 500, error.message);
    }
    return true;
  }

  return false;
}

function serveStatic(request, response, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405);
    response.end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  if (pathname === '/') pathname = '/docs/video-builder-v2/index.html';

  let filePath = path.normalize(path.join(REPO_ROOT, pathname));
  const insideRoot = filePath === REPO_ROOT || filePath.startsWith(`${REPO_ROOT}${path.sep}`);
  if (!insideRoot) {
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
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

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
      console.log('VBv2 render helper running:');
      for (const helperUrl of helperUrls(options.host, activePort)) console.log(`  ${helperUrl}`);
      if (activePort !== options.port) console.log(`Port ${options.port} was busy, so the helper used ${activePort}.`);
      return;
    } catch (error) {
      if (options.portExplicit || error.code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error(`No free helper port found starting at ${options.port}.`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
