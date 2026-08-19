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
  const hyphenatedUnit = raw.match(/^(\d+(?:\.\d+)?)-(mcg|mg|kg|kcal|g)([.,!?;:]*)$/i);
  if (hyphenatedUnit) {
    return [normalizeToken(`${hyphenatedUnit[1]}${unitWord(hyphenatedUnit[2], 1)}`)];
  }
  const compactUnit = raw.match(/^(\d+(?:\.\d+)?)(mcg|mg|kg|kcal|g)([.,!?;:]*)$/i);
  if (compactUnit) {
    return [normalizeToken(compactUnit[1]), normalizeToken(unitWord(compactUnit[2], compactUnit[1]))];
  }
  const alphabeticCompound = raw.match(/^([a-z]+(?:-[a-z]+)+)([.,!?;:]*)$/i);
  if (alphabeticCompound) {
    return alphabeticCompound[1].split('-').map(normalizeToken).filter(Boolean);
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
  return sceneBlockIndexes(scene.id)
    .flatMap(index => alignedBlocks[index]?.words || [])
    .flatMap(word => {
      const compound = String(word.text || '').match(/^([a-z]+(?:-[a-z]+)+)([.,!?;:]*)$/i);
      if (!compound) return [word];
      return distributeTargetWords(compound[1].split('-'), word.start, word.end).map(part => ({
        ...word,
        ...part,
        normalized: normalizeToken(part.text)
      }));
    });
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
    provider: alignment.provider || (alignment.blockMode ? 'elevenlabs-forced-alignment-blocks' : 'elevenlabs-forced-alignment'),
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

function longestCommonWordMatches(sourceTokens, targetTokens) {
  const rows = sourceTokens.length + 1;
  const columns = targetTokens.length + 1;
  const table = Array.from({ length: rows }, () => Array(columns).fill(0));
  for (let sourceIndex = sourceTokens.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
    for (let targetIndex = targetTokens.length - 1; targetIndex >= 0; targetIndex -= 1) {
      table[sourceIndex][targetIndex] = sourceTokens[sourceIndex] === targetTokens[targetIndex]
        ? table[sourceIndex + 1][targetIndex + 1] + 1
        : Math.max(table[sourceIndex + 1][targetIndex], table[sourceIndex][targetIndex + 1]);
    }
  }
  const matches = [];
  let sourceIndex = 0;
  let targetIndex = 0;
  while (sourceIndex < sourceTokens.length && targetIndex < targetTokens.length) {
    if (sourceTokens[sourceIndex] === targetTokens[targetIndex]) {
      matches.push({ sourceIndex, targetIndex });
      sourceIndex += 1;
      targetIndex += 1;
    } else if (table[sourceIndex + 1][targetIndex] >= table[sourceIndex][targetIndex + 1]) {
      sourceIndex += 1;
    } else {
      targetIndex += 1;
    }
  }
  return matches;
}

function distributeTargetWords(tokens, start, end) {
  if (!tokens.length) return [];
  const safeStart = Number.isFinite(Number(start)) ? Number(start) : 0;
  const safeEnd = Math.max(safeStart, Number.isFinite(Number(end)) ? Number(end) : safeStart);
  const weights = tokens.map(token => Math.max(1, token.length));
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  let cursor = safeStart;
  return tokens.map((token, index) => {
    const tokenEnd = index === tokens.length - 1
      ? safeEnd
      : cursor + ((safeEnd - safeStart) * weights[index] / totalWeight);
    const word = { text: token, start: roundSeconds(cursor), end: roundSeconds(tokenEnd) };
    cursor = tokenEnd;
    return word;
  });
}

function remapAlignedWordsToText(words, displayText) {
  const sourceWords = words.filter(word => hasSpeechToken(word.text));
  const sourceTokens = sourceWords.map(word => normalizeToken(word.text));
  const targetTokens = textSpeechTokens(displayText);
  if (targetTokens.length === sourceTokens.length && targetTokens.every((token, index) => token === sourceTokens[index])) {
    return sourceWords;
  }
  if (!targetTokens.length || !sourceWords.length) return sourceWords;

  const matches = longestCommonWordMatches(sourceTokens, targetTokens);
  if (!matches.length) {
    return distributeTargetWords(targetTokens, sourceWords[0].start, sourceWords[sourceWords.length - 1].end);
  }

  const remapped = Array(targetTokens.length);
  matches.forEach(match => {
    remapped[match.targetIndex] = {
      text: targetTokens[match.targetIndex],
      start: roundSeconds(sourceWords[match.sourceIndex].start),
      end: roundSeconds(sourceWords[match.sourceIndex].end)
    };
  });
  const anchors = [
    { sourceIndex: -1, targetIndex: -1 },
    ...matches,
    { sourceIndex: sourceWords.length, targetIndex: targetTokens.length }
  ];
  for (let index = 0; index < anchors.length - 1; index += 1) {
    const left = anchors[index];
    const right = anchors[index + 1];
    const targetStart = left.targetIndex + 1;
    const targetEnd = right.targetIndex;
    if (targetStart >= targetEnd) continue;
    const sourceStart = left.sourceIndex + 1;
    const sourceEnd = right.sourceIndex;
    const rangeStart = sourceStart < sourceEnd
      ? sourceWords[sourceStart].start
      : left.sourceIndex >= 0
        ? sourceWords[left.sourceIndex].end
        : sourceWords[0].start;
    const rangeEnd = sourceStart < sourceEnd
      ? sourceWords[sourceEnd - 1].end
      : right.sourceIndex < sourceWords.length
        ? sourceWords[right.sourceIndex].start
        : sourceWords[sourceWords.length - 1].end;
    const distributed = distributeTargetWords(targetTokens.slice(targetStart, targetEnd), rangeStart, rangeEnd);
    distributed.forEach((word, offset) => { remapped[targetStart + offset] = word; });
  }
  return remapped.filter(Boolean);
}

async function fetchSpeechToTextAlignment({ apiKey, audioPath, narrationText, alignmentPath, textPath }) {
  const form = new FormData();
  const audio = fs.readFileSync(audioPath);
  form.append('file', new Blob([audio], { type: 'audio/mpeg' }), path.basename(audioPath));
  form.append('model_id', 'scribe_v2');
  form.append('language_code', 'eng');
  form.append('tag_audio_events', 'false');
  form.append('diarize', 'false');
  form.append('timestamps_granularity', 'word');

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ElevenLabs speech-to-text alignment failed (${response.status}): ${message.slice(0, 400)}`);
  }
  const payload = await response.json();
  const spokenWords = (payload.words || []).filter(word => word.type === 'word' && hasSpeechToken(word.text));
  const wrapped = {
    schemaVersion: 'foodranked-speech-to-text-alignment.v1',
    provider: 'elevenlabs-scribe-v2',
    audioPath: relative(audioPath),
    textPath: relative(textPath),
    generatedAt: new Date().toISOString(),
    languageCode: payload.language_code || null,
    languageProbability: payload.language_probability ?? null,
    transcriptText: payload.text || null,
    loss: null,
    words: remapAlignedWordsToText(spokenWords, narrationText),
    characters: []
  };
  writeJson(alignmentPath, wrapped);
  return wrapped;
}

function maxWordEnd(alignment) {
  return Math.max(0, ...(alignment.words || []).map(word => Number(word.end) || 0));
}

function wordsFromNativeCharacterAlignment(nativeAlignment) {
  const characters = Array.isArray(nativeAlignment?.characters) ? nativeAlignment.characters : [];
  const starts = Array.isArray(nativeAlignment?.character_start_times_seconds)
    ? nativeAlignment.character_start_times_seconds
    : [];
  const ends = Array.isArray(nativeAlignment?.character_end_times_seconds)
    ? nativeAlignment.character_end_times_seconds
    : [];
  const words = [];
  let text = '';
  let start = null;
  let end = null;

  function flush() {
    if (!text || start == null || end == null) {
      text = '';
      start = null;
      end = null;
      return;
    }
    words.push({ text, start: roundSeconds(start), end: roundSeconds(end) });
    text = '';
    start = null;
    end = null;
  }

  characters.forEach((character, index) => {
    if (/\s/.test(String(character))) {
      flush();
      return;
    }
    const characterStart = Number(starts[index]);
    const characterEnd = Number(ends[index]);
    if (start == null && Number.isFinite(characterStart)) start = characterStart;
    if (Number.isFinite(characterEnd)) end = characterEnd;
    text += String(character);
  });
  flush();
  return words;
}

function nativeTtsTimingToAlignment(timing, displayText, timingPath) {
  const characterAlignment = timing?.alignment || timing?.normalizedAlignment || timing?.normalized_alignment;
  const nativeWords = wordsFromNativeCharacterAlignment(characterAlignment);
  if (!nativeWords.length) throw new Error(`Native TTS timing has no usable words: ${relative(timingPath)}`);
  return {
    schemaVersion: 'foodranked-tts-alignment.v1',
    provider: 'elevenlabs-tts-timestamps',
    generatedAt: timing.generatedAt || new Date().toISOString(),
    timingPath: relative(timingPath),
    loss: null,
    words: remapAlignedWordsToText(nativeWords, displayText),
    characters: []
  };
}

async function readOrFetchBlockAlignment({ apiKey, block, audioManifestPath, episodeDir, take, refresh }) {
  const blockAlignmentDir = path.join(episodeDir, `${take}-blocks`);
  ensureDir(blockAlignmentDir);
  const blockAlignmentPath = path.join(blockAlignmentDir, `${block.id}-forced-alignment.json`);
  if (exists(blockAlignmentPath) && !refresh) return readJson(blockAlignmentPath);
  const nativeTimingPath = block.timingFile ? path.join(repoRoot, block.timingFile) : null;
  if (nativeTimingPath && exists(nativeTimingPath)) {
    const alignment = nativeTtsTimingToAlignment(readJson(nativeTimingPath), block.text, nativeTimingPath);
    writeJson(blockAlignmentPath, alignment);
    return alignment;
  }
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required to create split forced alignment');
  const audioPath = path.join(repoRoot, block.audioFile);
  if (!exists(audioPath)) throw new Error(`Missing split audio block: ${relative(audioPath)}`);
  try {
    return await fetchForcedAlignment({
      apiKey,
      audioPath,
      narrationPath: audioManifestPath,
      textPath: audioManifestPath,
      narrationText: block.text,
      alignmentPath: blockAlignmentPath
    });
  } catch (forcedAlignmentError) {
    try {
      return await fetchSpeechToTextAlignment({
        apiKey,
        audioPath,
        narrationText: block.text,
        alignmentPath: blockAlignmentPath,
        textPath: audioManifestPath
      });
    } catch (speechToTextError) {
      throw new Error(`${forcedAlignmentError.message}; fallback failed: ${speechToTextError.message}`);
    }
  }
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
  const providers = new Set();

  for (const block of blocks) {
    const blockAlignment = await readOrFetchBlockAlignment({
      apiKey,
      block,
      audioManifestPath,
      episodeDir,
      take,
      refresh
    });
    providers.add(blockAlignment.provider || 'elevenlabs-forced-alignment');
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
    provider: providers.size === 1
      ? [...providers][0]
      : 'elevenlabs-mixed-block-alignment',
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
  const audioMetadataPath = path.join(docsAudioDir, foodId, `${take}.json`);
  const splitAudioManifestPath = path.join(docsAudioDir, foodId, `${take}-blocks.json`);
  const useSplitAudio = exists(splitAudioManifestPath);
  const audioMetadata = exists(audioMetadataPath) ? readJson(audioMetadataPath) : null;
  const nativeTimingPath = audioMetadata?.timingFile ? path.join(repoRoot, audioMetadata.timingFile) : null;
  const useNativeTiming = !useSplitAudio && nativeTimingPath && exists(nativeTimingPath);
  const alignmentPath = path.join(episodeDir, useSplitAudio
    ? `${take}-blocks-forced-alignment.json`
    : useNativeTiming
      ? `${take}-tts-alignment.json`
      : `${take}-forced-alignment.json`);
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
  } else if (useNativeTiming) {
    alignment = nativeTtsTimingToAlignment(readJson(nativeTimingPath), fs.readFileSync(narrationPath, 'utf8'), nativeTimingPath);
    writeJson(alignmentPath, alignment);
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

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  longestCommonWordMatches,
  remapAlignedWordsToText,
  wordsFromNativeCharacterAlignment
};
