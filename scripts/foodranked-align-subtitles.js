#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outputsDir = path.join(repoRoot, 'outputs', 'episodes');
const docsAudioDir = path.join(repoRoot, 'docs', 'audio', 'episodes');

const SUBTITLE_MAX_LINES = 2;
const SUBTITLE_MAX_CHARACTERS_PER_LINE = 18;
const SUMMARY_SUBTITLE_MAX_CHARACTERS_PER_LINE = 24;
const TIER_SUBTITLE_MAX_CHARACTERS_PER_LINE = 28;
const CUE_LEAD_SECONDS = 0.045;
const SCENE_LEAD_SECONDS = 0.08;
const AUDIO_TAIL_SECONDS = 0.05;
const FINAL_REVEAL_AUDIO_TAIL_SECONDS = 0.3;
const BLOCK_AUDIO_GAP_SECONDS = 0.08;

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function exists(file) { return fs.existsSync(file); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function relative(file) { return path.relative(repoRoot, file).replace(/\\/g, '/'); }
function roundSeconds(value) { return Number(Math.max(0, value).toFixed(3)); }
function positiveSeconds(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function loadLocalEnv() {
  const file = path.join(repoRoot, '.env.local');
  if (!exists(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function parseArgs(argv) {
  const options = { take: null, refresh: false };
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--refresh') options.refresh = true;
    else if (arg.startsWith('--take=')) options.take = arg.slice('--take='.length);
    else if (arg === '--take') {
      options.take = argv[index + 1] || null;
      index += 1;
    } else positional.push(arg);
  }
  return { foodId: positional[0], options };
}

function latestAudioTake(foodId) {
  const dir = path.join(docsAudioDir, foodId);
  if (!exists(dir)) return null;
  const files = fs.readdirSync(dir).filter(name => /^voice-v\d+(?:\.mp3|-blocks\.json)$/i.test(name));
  files.sort((a, b) => {
    const av = Number(a.match(/voice-v(\d+)/i)?.[1] || 0);
    const bv = Number(b.match(/voice-v(\d+)/i)?.[1] || 0);
    return bv - av || (a.includes('-blocks') ? -1 : 1);
  });
  return files[0]?.replace(/(?:\.mp3|-blocks\.json)$/i, '') || null;
}

function resolveEpisodeDir(foodId) {
  const compact = path.join(outputsDir, `${foodId}-compact`);
  if (exists(compact)) return compact;
  return path.join(outputsDir, foodId);
}

function normalizeToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9.%]+/g, '')
    .replace(/(^|[^\d])\./g, '$1')
    .replace(/\.(?!\d)/g, '');
}

function hasSpeechToken(value) {
  return /[A-Za-z0-9%]/.test(String(value || ''));
}

function transcriptBlocks(text) {
  return String(text || '')
    .split(/\r?\n\s*-\s*\r?\n/)
    .map(block => block.trim())
    .filter(Boolean);
}

function textSpeechTokens(text) {
  return String(text || '')
    .split(/\s+/)
    .map(normalizeToken)
    .filter(token => token && token !== '-');
}

function subtitleWords(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}

function unitWord(unit, value) {
  const singular = Number(value) === 1;
  const words = {
    g: ['gram', 'grams'],
    mg: ['milligram', 'milligrams'],
    mcg: ['microgram', 'micrograms'],
    kg: ['kilogram', 'kilograms'],
    kcal: ['calorie', 'calories']
  }[String(unit || '').toLowerCase()];
  return words ? (singular ? words[0] : words[1]) : unit;
}

function displayWordSpeechTokens(word) {
  const raw = String(word || '');
  if (/^DV[.,!?;:]*$/i.test(raw)) {
    return ['daily', 'value'];
  }
  const compactUnit = raw.match(/^(\d+(?:\.\d+)?)(mcg|mg|kg|kcal|g)([.,!?;:]*)$/i);
  if (compactUnit) {
    return [normalizeToken(compactUnit[1]), normalizeToken(unitWord(compactUnit[2], compactUnit[1]))];
  }
  const ratio = raw.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)([.,!?;:]*)$/);
  if (ratio) {
    return [normalizeToken(ratio[1]), 'out', 'of', normalizeToken(ratio[2])];
  }
  return [normalizeToken(raw)].filter(Boolean);
}

function findMatch(words, cursor, tokens) {
  const cleanedTokens = tokens.filter(Boolean);
  if (!cleanedTokens.length) return null;
  const searchLimit = Math.min(words.length, cursor + 8);
  for (let start = cursor; start < searchLimit; start += 1) {
    let ok = true;
    for (let offset = 0; offset < cleanedTokens.length; offset += 1) {
      if (words[start + offset]?.normalized !== cleanedTokens[offset]) {
        ok = false;
        break;
      }
    }
    if (ok) return { start, end: start + cleanedTokens.length - 1 };
  }
  return null;
}

function splitAlignedBlocks(alignment, blocks) {
  const spokenWords = (alignment.words || [])
    .filter(word => hasSpeechToken(word.text))
    .map(word => ({
      ...word,
      normalized: normalizeToken(word.text)
    }));

  let cursor = 0;
  return blocks.map((block, blockIndex) => {
    const tokens = textSpeechTokens(block);
    const words = spokenWords.slice(cursor, cursor + tokens.length);
    const mismatches = tokens
      .map((token, index) => ({ token, word: words[index]?.normalized || null, index }))
      .filter(item => item.token !== item.word);
    if (mismatches.length) {
      const sample = mismatches.slice(0, 3).map(item => `${item.token}/${item.word}`).join(', ');
      throw new Error(`Alignment token mismatch in block ${blockIndex + 1}: ${sample}`);
    }
    cursor += tokens.length;
    return { block, tokens, words };
  });
}

function sceneBlockIndexes(sceneId) {
  return {
    hook: [0, 1],
    fats: [2],
    carbs: [3],
    proteins: [4],
    protein: [4],
    vitamins: [5],
    minerals: [6],
    pros: [7],
    cons: [8],
    final: [9, 10],
    outro: [9, 10]
  }[sceneId] || [];
}

function sceneAlignedWords(scene, alignedBlocks) {
  return sceneBlockIndexes(scene.id).flatMap(index => alignedBlocks[index]?.words || []);
}

function alignmentAudioEndSeconds(alignment) {
  const wordEnd = Math.max(0, ...(alignment.words || []).map(word => Number(word.end) || 0)) + AUDIO_TAIL_SECONDS;
  const blockEnd = Math.max(0, ...(alignment.blocks || []).map(block => {
    const offsetSeconds = positiveSeconds(block.offsetSeconds) ?? 0;
    const durationSeconds = positiveSeconds(block.durationSeconds) ?? 0;
    return offsetSeconds + durationSeconds;
  }));
  return roundSeconds(Math.max(wordEnd, blockEnd));
}

function applyForcedAlignment(manifest, subtitles, alignment, narrationText, alignmentPath) {
  const blocks = transcriptBlocks(narrationText);
  const alignedBlocks = splitAlignedBlocks(alignment, blocks);
  const scenes = manifest.scenePlan?.scenes || [];
  const audioEnd = alignmentAudioEndSeconds(alignment);
  const sceneWords = new Map();

  scenes.forEach(scene => {
    sceneWords.set(scene.id, sceneAlignedWords(scene, alignedBlocks));
  });

  const starts = scenes.map((scene, index) => {
    const words = sceneWords.get(scene.id) || [];
    if (index === 0) return 0;
    return roundSeconds(Math.max(0, (words[0]?.start || scenes[index - 1].endSeconds || 0) - SCENE_LEAD_SECONDS));
  });

  const allCues = [];
  scenes.forEach((scene, sceneIndex) => {
    const words = sceneWords.get(scene.id) || [];
    const start = starts[sceneIndex];
    const end = sceneIndex === scenes.length - 1 ? audioEnd : starts[sceneIndex + 1];
    scene.startSeconds = roundSeconds(start);
    scene.endSeconds = roundSeconds(Math.max(end, start + 0.25));
    scene.durationSeconds = roundSeconds(scene.endSeconds - scene.startSeconds);

    let wordCursor = 0;
    const cues = scene.subtitleCues || [];
    cues.forEach(cue => {
      const timedWords = [];
      for (const displayWord of subtitleWords(cue.text || (cue.lines || []).join(' '))) {
        const tokens = displayWordSpeechTokens(displayWord);
        const match = findMatch(words, wordCursor, tokens);
        if (!match) {
          throw new Error(`Could not map subtitle word "${displayWord}" in cue ${cue.id}`);
        }
        timedWords.push({
          text: displayWord,
          startSeconds: roundSeconds(words[match.start].start),
          endSeconds: roundSeconds(words[match.end].end)
        });
        wordCursor = match.end + 1;
      }
      cue.wordTimings = timedWords;
    });

    let previousWordEnd = scene.startSeconds;
    cues.forEach((cue, cueIndex) => {
      const firstWord = cue.wordTimings?.[0];
      const desiredCueStart = cueIndex === 0
        ? scene.startSeconds
        : Math.max(scene.startSeconds, (firstWord?.startSeconds || scene.startSeconds) - CUE_LEAD_SECONDS);
      cue.startSeconds = roundSeconds(cueIndex === 0 ? desiredCueStart : Math.max(desiredCueStart, previousWordEnd));
      previousWordEnd = cue.wordTimings?.[cue.wordTimings.length - 1]?.endSeconds || cue.startSeconds;
    });

    cues.forEach((cue, cueIndex) => {
      cue.endSeconds = cueIndex === cues.length - 1
        ? scene.endSeconds
        : roundSeconds(Math.max(cue.startSeconds + 0.05, Math.min(scene.endSeconds, cues[cueIndex + 1].startSeconds)));
      cue.maxLines = SUBTITLE_MAX_LINES;
      cue.maxCharactersPerLine = cue.placement === 'summary-full'
        ? SUMMARY_SUBTITLE_MAX_CHARACTERS_PER_LINE
        : cue.placement === 'tier-center'
          ? TIER_SUBTITLE_MAX_CHARACTERS_PER_LINE
          : SUBTITLE_MAX_CHARACTERS_PER_LINE;
      allCues.push(cue);
    });
  });

  manifest.scenePlan.totalEstimatedDurationSeconds = audioEnd;
  manifest.scenePlan.subtitleCues = allCues;
  manifest.scenePlan.alignment = {
    provider: alignment.blockMode ? 'elevenlabs-forced-alignment-blocks' : 'elevenlabs-forced-alignment',
    source: 'word',
    alignmentPath: relative(alignmentPath),
    audioManifestPath: alignment.audioManifestPath || null,
    blockCount: Array.isArray(alignment.blocks) ? alignment.blocks.length : null,
    loss: alignment.loss ?? null,
    wordCount: (alignment.words || []).filter(word => hasSpeechToken(word.text)).length
  };
  manifest.outputs = {
    ...(manifest.outputs || {}),
    alignmentJson: path.basename(alignmentPath)
  };

  subtitles.splice(0, subtitles.length, ...allCues);
  return { scenes: scenes.length, cues: allCues.length, duration: audioEnd };
}

async function fetchForcedAlignment({ apiKey, audioPath, narrationPath, narrationText, alignmentPath, textPath = narrationPath }) {
  const form = new FormData();
  const audio = fs.readFileSync(audioPath);
  form.append('file', new Blob([audio], { type: 'audio/mpeg' }), path.basename(audioPath));
  form.append('text', narrationText);

  const response = await fetch('https://api.elevenlabs.io/v1/forced-alignment', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ElevenLabs forced alignment failed (${response.status}): ${message.slice(0, 400)}`);
  }
  const payload = await response.json();
  const wrapped = {
    schemaVersion: 'foodranked-forced-alignment.v1',
    provider: 'elevenlabs',
    audioPath: relative(audioPath),
    textPath: relative(textPath),
    generatedAt: new Date().toISOString(),
    loss: payload.loss ?? null,
    words: payload.words || [],
    characters: payload.characters || []
  };
  writeJson(alignmentPath, wrapped);
  return wrapped;
}

function maxWordEnd(alignment) {
  return Math.max(0, ...(alignment.words || []).map(word => Number(word.end) || 0));
}

async function readOrFetchBlockAlignment({ apiKey, block, audioManifestPath, episodeDir, take, refresh }) {
  const blockAlignmentDir = path.join(episodeDir, `${take}-blocks`);
  ensureDir(blockAlignmentDir);
  const blockAlignmentPath = path.join(blockAlignmentDir, `${block.id}-forced-alignment.json`);
  if (exists(blockAlignmentPath) && !refresh) return readJson(blockAlignmentPath);
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required to create split forced alignment');
  const audioPath = path.join(repoRoot, block.audioFile);
  if (!exists(audioPath)) throw new Error(`Missing split audio block: ${relative(audioPath)}`);
  return fetchForcedAlignment({
    apiKey,
    audioPath,
    narrationPath: audioManifestPath,
    textPath: audioManifestPath,
    narrationText: block.text,
    alignmentPath: blockAlignmentPath
  });
}

function alignmentTailSecondsForBlock(block) {
  return String(block?.kind || '').toLowerCase() === 'final_reveal'
    ? FINAL_REVEAL_AUDIO_TAIL_SECONDS
    : AUDIO_TAIL_SECONDS;
}

async function buildSplitForcedAlignment({ apiKey, audioManifestPath, episodeDir, take, alignmentPath, refresh }) {
  if (exists(alignmentPath) && !refresh) return readJson(alignmentPath);
  if (!exists(audioManifestPath)) throw new Error(`Missing split audio manifest: ${relative(audioManifestPath)}`);
  const audioManifest = readJson(audioManifestPath);
  const blocks = Array.isArray(audioManifest.blocks) ? audioManifest.blocks : [];
  if (!blocks.length) throw new Error(`Split audio manifest has no blocks: ${relative(audioManifestPath)}`);

  let offsetSeconds = 0;
  const alignedBlocks = [];
  const words = [];

  for (const block of blocks) {
    const blockAlignment = await readOrFetchBlockAlignment({
      apiKey,
      block,
      audioManifestPath,
      episodeDir,
      take,
      refresh
    });
    const mediaDurationSeconds = positiveSeconds(block.mediaDurationSeconds);
    const alignedSpeechDuration = maxWordEnd(blockAlignment) + alignmentTailSecondsForBlock(block);
    const blockDuration = roundSeconds(Math.max(alignedSpeechDuration, mediaDurationSeconds || 0));
    const offsetWords = (blockAlignment.words || []).map(word => ({
      ...word,
      start: roundSeconds((Number(word.start) || 0) + offsetSeconds),
      end: roundSeconds((Number(word.end) || 0) + offsetSeconds),
      blockId: block.id,
      blockIndex: block.index
    }));
    words.push(...offsetWords);
    alignedBlocks.push({
      id: block.id,
      index: block.index,
      kind: block.kind,
      sectionKey: block.sectionKey || null,
      text: block.text,
      audioPath: block.audioFile,
      alignmentPath: relative(path.join(episodeDir, `${take}-blocks`, `${block.id}-forced-alignment.json`)),
      offsetSeconds: roundSeconds(offsetSeconds),
      durationSeconds: blockDuration,
      ...(mediaDurationSeconds ? { mediaDurationSeconds: roundSeconds(mediaDurationSeconds) } : {}),
      wordCount: offsetWords.filter(word => hasSpeechToken(word.text)).length,
      loss: blockAlignment.loss ?? null
    });
    offsetSeconds = roundSeconds(offsetSeconds + blockDuration + BLOCK_AUDIO_GAP_SECONDS);
  }

  const aggregate = {
    schemaVersion: 'foodranked-forced-alignment-blocks.v1',
    provider: 'elevenlabs',
    blockMode: true,
    audioManifestPath: relative(audioManifestPath),
    generatedAt: new Date().toISOString(),
    blockGapSeconds: BLOCK_AUDIO_GAP_SECONDS,
    loss: null,
    blocks: alignedBlocks,
    words,
    characters: []
  };
  writeJson(alignmentPath, aggregate);
  return aggregate;
}

async function main() {
  const { foodId, options } = parseArgs(process.argv.slice(2));
  if (!foodId) {
    console.error('Usage: node scripts/foodranked-align-subtitles.js <food-id> [--take voice-v4] [--refresh]');
    process.exit(1);
  }

  const take = options.take || latestAudioTake(foodId);
  if (!take) throw new Error(`No audio take found for ${foodId}`);
  const episodeDir = resolveEpisodeDir(foodId);
  const manifestPath = path.join(episodeDir, 'episode-manifest.json');
  const subtitlesPath = path.join(episodeDir, 'subtitles.json');
  const narrationPath = path.join(episodeDir, 'narration.txt');
  const audioPath = path.join(docsAudioDir, foodId, `${take}.mp3`);
  const splitAudioManifestPath = path.join(docsAudioDir, foodId, `${take}-blocks.json`);
  const useSplitAudio = exists(splitAudioManifestPath);
  const alignmentPath = path.join(episodeDir, useSplitAudio ? `${take}-blocks-forced-alignment.json` : `${take}-forced-alignment.json`);
  if (!exists(manifestPath) || !exists(subtitlesPath) || !exists(narrationPath)) {
    throw new Error(`Missing generated episode files in ${relative(episodeDir)}`);
  }
  if (!useSplitAudio && !exists(audioPath)) throw new Error(`Missing audio file: ${relative(audioPath)}`);

  const localEnv = loadLocalEnv();
  const apiKey = process.env.ELEVENLABS_API_KEY || localEnv.ELEVENLABS_API_KEY;
  let alignment;
  if (useSplitAudio) {
    alignment = await buildSplitForcedAlignment({
      apiKey,
      audioManifestPath: splitAudioManifestPath,
      episodeDir,
      take,
      alignmentPath,
      refresh: options.refresh
    });
  } else if (exists(alignmentPath) && !options.refresh) {
    alignment = readJson(alignmentPath);
  } else {
    if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required to create forced alignment');
    ensureDir(path.dirname(alignmentPath));
    alignment = await fetchForcedAlignment({
      apiKey,
      audioPath,
      narrationPath,
      narrationText: fs.readFileSync(narrationPath, 'utf8'),
      alignmentPath
    });
  }

  const manifest = readJson(manifestPath);
  const subtitles = readJson(subtitlesPath);
  const result = applyForcedAlignment(
    manifest,
    subtitles,
    alignment,
    fs.readFileSync(narrationPath, 'utf8'),
    alignmentPath
  );
  writeJson(manifestPath, manifest);
  writeJson(subtitlesPath, subtitles);
  console.log(JSON.stringify({
    status: 'ok',
    foodId,
    take,
    mode: useSplitAudio ? 'split-blocks' : 'single-audio',
    alignmentPath: relative(alignmentPath),
    ...result,
    loss: alignment.loss ?? null
  }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
