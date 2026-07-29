#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;
const AUTHOR_GRID_WIDTH = 105;
const AUTHOR_GRID_HEIGHT = 186.666667;
const VIDEO_STATE_KEY = 'foodranked-video-builder-v2-state-v1';
const DISPLAY_STATE_KEY = 'foodranked-display-builder-v2-state-v1';
const DEFAULT_PORT = 4190;
const DEFAULT_FPS = 30;
const DEFAULT_MUSIC_VOLUME = 0.14;
const DEFAULT_NARRATION_VOLUME = 1;

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
  node scripts/render-vbv2-mp4.js bacon
  node scripts/render-vbv2-mp4.js bacon --seconds 3 --fps 10 --output /tmp/bacon-test.mp4

Options:
  --fps <number>             Frames per second. Default: ${DEFAULT_FPS}
  --width <pixels>           Output width. Default: ${DEFAULT_WIDTH}
  --height <pixels>          Output height. Default: ${DEFAULT_HEIGHT}
  --output <path>            Output MP4 path. Default: docs/video/episodes/<food-id>/<food-id>-vbv2.mp4
  --seconds <number>         Render only the first N seconds. Useful for smoke tests.
  --port <number>            Local static server port. Default: ${DEFAULT_PORT}
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
    output: '',
    seconds: null,
    port: DEFAULT_PORT,
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
    else if (arg === '--output') options.output = readValue(arg);
    else if (arg === '--seconds') options.seconds = Number(readValue(arg));
    else if (arg === '--port') options.port = Number(readValue(arg));
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

function requireCommand(command, installHint) {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  if (result.status === 0) return;
  throw new Error(`${command} is required to render MP4 files.\n${installHint}`);
}

function readFoodsIndex() {
  const file = path.join(REPO_ROOT, 'docs/data/foods-index.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function findFood(foods, foodId) {
  return foods.find(food => safeSlug(food.id) === foodId || safeSlug(food.name) === foodId) || null;
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
  if (path.isAbsolute(withoutDot)) return withoutDot;
  if (withoutDot.startsWith('docs/')) return path.join(REPO_ROOT, withoutDot);
  return path.join(REPO_ROOT, 'docs', withoutDot);
}

function ffmpegNumber(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, match => (match === '.' ? '' : ''));
}

function run(command, args, { label = command } = {}) {
  return new Promise((resolve, reject) => {
    console.log(`${label}: ${command} ${args.map(shellQuote).join(' ')}`);
    const child = spawn(command, args, {
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

    let filePath = path.normalize(path.join(REPO_ROOT, pathname));
    if (!filePath.startsWith(REPO_ROOT)) {
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

async function renderFrames({ food, foodId, options, framesDir, baseUrl }) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    throw new Error('Playwright is required. Install project dependencies before rendering.');
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: options.width, height: options.height },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  try {
    await page.addInitScript(({ selectedFoodId, videoStateKey, displayStateKey }) => {
      const mergeState = (key, patch) => {
        let current = {};
        try {
          current = JSON.parse(localStorage.getItem(key) || '{}') || {};
        } catch {
          current = {};
        }
        localStorage.setItem(key, JSON.stringify({ ...current, ...patch }));
      };
      mergeState(videoStateKey, {
        selectedFoodId,
        currentTime: 0,
        selectedSceneId: 'intro'
      });
      mergeState(displayStateKey, { selectedFoodId });
    }, {
      selectedFoodId: food.id || foodId,
      videoStateKey: VIDEO_STATE_KEY,
      displayStateKey: DISPLAY_STATE_KEY
    });

    await page.goto(`${baseUrl}/docs/video-builder-v2/index.html?render=mp4&food=${encodeURIComponent(foodId)}`, {
      waitUntil: 'networkidle'
    });

    await page.addStyleTag({ content: renderCss(options.width, options.height) });
    await page.waitForSelector('#videoStage', { state: 'attached' });
    await page.waitForFunction(() => window.FoodRankedVBv2Renderer?.ready?.(), null, { timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('#videoStage')?.childElementCount > 0, null, { timeout: 30000 });
    await waitForStageImages(page);

    const pixelUnit = options.width / AUTHOR_GRID_WIDTH;
    const browserDuration = await page.evaluate(() => window.FoodRankedVBv2Renderer?.duration?.() || 0);
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
    if (roundedWidth !== options.width || roundedHeight !== options.height) {
      throw new Error(`VBv2 stage rendered at ${roundedWidth}x${roundedHeight}, expected ${options.width}x${options.height}.`);
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

    return { duration, frameCount, width: roundedWidth, height: roundedHeight, sfxEvents };
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

async function setVideoTime(page, time, pixelUnit) {
  await page.evaluate(({ value, unit }) => new Promise(resolve => {
    document.documentElement.style.setProperty('--pixel-unit', String(unit));
    if (window.FoodRankedVBv2Renderer?.setTime) {
      window.FoodRankedVBv2Renderer.setTime(value, { pixelUnit: unit });
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
      id: block.id || block.kind || ''
    }))
    .filter(block => block.path && fs.existsSync(block.path));
}

function singleNarrationTrack(food) {
  const audio = food?.episode?.audio || food?.audio || null;
  const audioPath = resolveDocsAsset(audio?.path);
  if (!audioPath || !fs.existsSync(audioPath)) return [];
  return [{ path: audioPath, offsetSeconds: 0, durationSeconds: Number(audio?.durationSeconds || 0), id: 'narration' }];
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
        playbackRate: Math.max(0.5, Math.min(2, Number(event.playbackRate || 1))),
        sourceOffsetSeconds: Math.max(0, Number(event.sourceOffsetSeconds || 0)),
        durationSeconds: Number.isFinite(Number(event.durationSeconds)) && Number(event.durationSeconds) > 0
          ? Number(event.durationSeconds)
          : null
      };
    })
    .filter(Boolean);

  for (const item of missing) console.warn(`Skipping missing SFX asset: ${item}`);
  return normalized;
}

function inputAudioFilter(inputIndex, label, options) {
  const parts = [];
  if (options.sourceOffsetSeconds || options.durationSeconds) {
    const trim = [`start=${ffmpegNumber(options.sourceOffsetSeconds || 0)}`];
    if (options.durationSeconds) trim.push(`duration=${ffmpegNumber(options.durationSeconds)}`);
    parts.push(`atrim=${trim.join(':')}`);
  }
  parts.push('asetpts=PTS-STARTPTS');
  if (options.playbackRate && Math.abs(options.playbackRate - 1) > 0.001) {
    parts.push(`atempo=${ffmpegNumber(options.playbackRate)}`);
  }
  parts.push(`volume=${ffmpegNumber(options.volume)}`);
  if (options.delayMs) parts.push(`adelay=${options.delayMs}:all=1`);
  return `[${inputIndex}:a]${parts.join(',')}${label}`;
}

async function buildAudioTrack({ food, options, duration, workDir, sfxEvents = [] }) {
  if (!options.audio) return '';

  const narrationBlocks = splitAudioBlocks(food);
  const narrationInputs = narrationBlocks.length ? narrationBlocks : singleNarrationTrack(food);
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
    filters.push(inputAudioFilter(index, label, {
      delayMs,
      volume: options.narrationVolume
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
      durationSeconds: event.durationSeconds
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

  const foods = readFoodsIndex();
  const food = findFood(foods, foodId);
  if (!food) throw new Error(`Food not found in docs/data/foods-index.json: ${foodId}`);

  const outputPath = publishedOutputPath(food, options.output);
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `foodranked-vbv2-${foodId}-`));
  const framesDir = path.join(workDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });

  let server;
  try {
    server = await startStaticServer(options.port);
    console.log(`Rendering ${food.name || food.id} from ${server.url}`);
    const frameResult = await renderFrames({ food, foodId, options, framesDir, baseUrl: server.url });
    const audioPath = await buildAudioTrack({
      food,
      options,
      duration: frameResult.duration,
      workDir,
      sfxEvents: frameResult.sfxEvents
    });
    await encodeMp4({
      framesDir,
      outputPath,
      options,
      duration: frameResult.duration,
      audioPath
    });
    console.log(`Wrote ${path.relative(REPO_ROOT, outputPath)}`);
    console.log(`Frames: ${frameResult.frameCount} at ${frameResult.width}x${frameResult.height}, ${options.fps}fps`);
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
