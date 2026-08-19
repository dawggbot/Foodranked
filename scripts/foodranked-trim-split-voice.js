#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function durationSeconds(file) {
  const raw = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1',
    file
  ], { encoding: 'utf8' }).trim();
  const duration = Number(raw);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Could not read audio duration: ${relative(file)}`);
  return Number(duration.toFixed(3));
}

function transcriptBlocks(text) {
  return String(text || '')
    .split(/\r?\n\s*-\s*\r?\n/)
    .map(block => block.trim())
    .filter(Boolean);
}

function removalRanges(text, phrases, blockId) {
  const ranges = phrases.map(phrase => {
    const start = text.indexOf(phrase);
    if (start < 0) throw new Error(`${blockId}: removal phrase not found: ${JSON.stringify(phrase)}`);
    if (text.indexOf(phrase, start + 1) >= 0) {
      throw new Error(`${blockId}: removal phrase is ambiguous: ${JSON.stringify(phrase)}`);
    }
    return { phrase, start, end: start + phrase.length };
  }).sort((left, right) => left.start - right.start);

  for (let index = 1; index < ranges.length; index += 1) {
    if (ranges[index].start < ranges[index - 1].end) throw new Error(`${blockId}: removal phrases overlap`);
  }
  return ranges;
}

function desiredTextAfterRemovals(text, ranges, edit) {
  let result = text;
  for (const range of [...ranges].sort((left, right) => right.start - left.start)) {
    result = `${result.slice(0, range.start)}${result.slice(range.end)}`;
  }
  result = result.trim();
  for (const replacement of edit.replacements || []) {
    if (String(replacement.from || '').length !== String(replacement.to || '').length) {
      throw new Error('Silent text replacements must preserve character length');
    }
    const index = result.indexOf(replacement.from);
    if (index < 0 || result.indexOf(replacement.from, index + 1) >= 0) {
      throw new Error(`Silent text replacement is missing or ambiguous: ${JSON.stringify(replacement.from)}`);
    }
    result = `${result.slice(0, index)}${replacement.to}${result.slice(index + replacement.from.length)}`;
  }
  if (edit.capitalizeFirst === true && result) result = `${result[0].toUpperCase()}${result.slice(1)}`;
  return result;
}

function speechEquivalent(left, right) {
  const normalize = value => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalize(left) === normalize(right);
}

function retainedSegments(duration, alignment, ranges) {
  const segments = [];
  let cursor = 0;
  for (const range of ranges) {
    const start = Number(alignment.character_start_times_seconds[range.start]);
    const end = Number(alignment.character_end_times_seconds[range.end - 1]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      throw new Error(`Invalid character timing for removal ${JSON.stringify(range.phrase)}`);
    }
    if (start > cursor) segments.push({ start: cursor, end: start });
    cursor = end;
  }
  if (cursor < duration) segments.push({ start: cursor, end: duration });
  return segments.filter(segment => segment.end - segment.start > 0.001);
}

function trimAudio(input, output, segments) {
  const filters = segments.map((segment, index) => (
    `[0:a]atrim=start=${segment.start.toFixed(6)}:end=${segment.end.toFixed(6)},asetpts=PTS-STARTPTS[a${index}]`
  ));
  filters.push(`${segments.map((_, index) => `[a${index}]`).join('')}concat=n=${segments.length}:v=0:a=1[out]`);
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', input,
    '-filter_complex', filters.join(';'),
    '-map', '[out]',
    '-codec:a', 'libmp3lame', '-b:a', '128k',
    output
  ]);
}

function trimmedAlignment(original, ranges, desiredText) {
  const removed = new Set();
  for (const range of ranges) {
    for (let index = range.start; index < range.end; index += 1) removed.add(index);
  }

  const removedBefore = index => ranges.reduce((total, range) => {
    if (range.end > index) return total;
    const start = Number(original.character_start_times_seconds[range.start]);
    const end = Number(original.character_end_times_seconds[range.end - 1]);
    return total + (end - start);
  }, 0);

  const sourceCharacters = [];
  const starts = [];
  const ends = [];
  original.characters.forEach((character, index) => {
    if (removed.has(index)) return;
    const shift = removedBefore(index);
    sourceCharacters.push(character);
    starts.push(Number(Math.max(0, Number(original.character_start_times_seconds[index]) - shift).toFixed(6)));
    ends.push(Number(Math.max(0, Number(original.character_end_times_seconds[index]) - shift).toFixed(6)));
  });

  const sourceText = sourceCharacters.join('').trim();
  if (sourceText.length !== desiredText.length || !speechEquivalent(sourceText, desiredText)) {
    throw new Error(`Trimmed timing text does not match desired text: ${JSON.stringify(sourceText)} != ${JSON.stringify(desiredText)}`);
  }

  const leading = sourceCharacters.join('').length - sourceCharacters.join('').trimStart().length;
  const trailing = sourceCharacters.join('').length - sourceCharacters.join('').trimEnd().length;
  const endIndex = sourceCharacters.length - trailing;
  return {
    characters: [...desiredText],
    character_start_times_seconds: starts.slice(leading, endIndex),
    character_end_times_seconds: ends.slice(leading, endIndex)
  };
}

function main() {
  const planArg = process.argv[2];
  if (!planArg) throw new Error('Usage: node scripts/foodranked-trim-split-voice.js <trim-plan.json>');
  const planFile = path.resolve(planArg);
  const plan = readJson(planFile);
  if (plan.schemaVersion !== 'foodranked-voice-trim-plan.v1') throw new Error('Unsupported trim-plan schema');

  const foodId = plan.foodId;
  const take = plan.take || 'voice-v1';
  const voiceDir = path.join(ROOT, 'production', 'episodes', foodId, 'voice');
  const manifestFile = path.join(voiceDir, `${take}-blocks.json`);
  const narrationFile = path.join(ROOT, 'outputs', 'episodes', `${foodId}-compact`, 'narration.txt');
  const manifest = readJson(manifestFile);
  const narrationText = fs.readFileSync(narrationFile, 'utf8').trim();
  const desiredBlocks = transcriptBlocks(narrationText);
  const desiredHash = sha256(narrationText);

  if (manifest.textSha256 === desiredHash) {
    console.log(JSON.stringify({ status: 'skipped', reason: 'voice already matches trimmed narration', foodId, take }, null, 2));
    return;
  }
  if (manifest.textSha256 !== plan.sourceTextSha256) {
    throw new Error(`Source narration hash mismatch for ${foodId}; refusing to trim unexpected audio`);
  }
  if (manifest.blocks.length !== desiredBlocks.length) throw new Error('Narration block count changed');

  const editedBlocks = [];
  for (const block of manifest.blocks) {
    const desiredText = desiredBlocks[block.index];
    const edit = plan.blocks?.[block.id];
    if (!edit) {
      if (block.text !== desiredText) throw new Error(`${block.id}: changed without a trim plan`);
      continue;
    }

    const timingFile = path.join(ROOT, block.timingFile);
    const audioFile = path.join(ROOT, block.audioFile);
    const timing = readJson(timingFile);
    const alignment = timing.alignment || timing.normalizedAlignment;
    if (!alignment) throw new Error(`${block.id}: no native character alignment`);
    const originalText = alignment.characters.join('');
    if (originalText !== block.text) throw new Error(`${block.id}: alignment text does not match manifest text`);

    const ranges = removalRanges(originalText, edit.remove || [], block.id);
    const plannedText = desiredTextAfterRemovals(originalText, ranges, edit);
    if (plannedText !== desiredText) {
      throw new Error(`${block.id}: trim result does not match generated narration`);
    }

    const originalDuration = durationSeconds(audioFile);
    const segments = retainedSegments(originalDuration, alignment, ranges);
    const temporaryFile = `${audioFile}.trimmed.mp3`;
    trimAudio(audioFile, temporaryFile, segments);
    fs.renameSync(temporaryFile, audioFile);
    const newDuration = durationSeconds(audioFile);
    const newAlignment = trimmedAlignment(alignment, ranges, desiredText);
    const generatedAt = new Date().toISOString();
    writeJson(timingFile, {
      ...timing,
      provider: 'elevenlabs-postprocessed',
      source: 'timestamp-aligned-phrase-removal',
      generatedAt,
      text: desiredText,
      alignment: newAlignment,
      normalizedAlignment: newAlignment,
      postProcessing: {
        method: 'timestamp-aligned-phrase-removal',
        reason: plan.reason,
        removedPhrases: ranges.map(range => range.phrase),
        sourceDurationSeconds: originalDuration,
        durationSeconds: newDuration,
        ...(timing.postProcessing ? { previous: timing.postProcessing } : {})
      }
    });

    block.text = desiredText;
    block.textSha256 = sha256(desiredText);
    block.characterCount = desiredText.length;
    block.byteLength = fs.statSync(audioFile).size;
    block.mediaDurationSeconds = newDuration;
    block.postProcessing = {
      method: 'timestamp-aligned-phrase-removal',
      planFile: relative(planFile),
      removedPhrases: ranges.map(range => range.phrase),
      sourceDurationSeconds: originalDuration,
      durationSeconds: newDuration,
      ...(block.postProcessing ? { previous: block.postProcessing } : {})
    };
    editedBlocks.push(block.id);
  }

  manifest.generatedAt = new Date().toISOString();
  manifest.textSha256 = desiredHash;
  manifest.characterCount = narrationText.length;
  manifest.narrationDurationSeconds = Number(manifest.blocks
    .reduce((total, block) => total + Number(block.mediaDurationSeconds), 0)
    .toFixed(3));
  manifest.durationPolicyReview = {
    ...manifest.durationPolicyReview,
    durationSeconds: manifest.narrationDurationSeconds,
    overLimit: manifest.narrationDurationSeconds > Number(manifest.durationPolicyReview?.maximumSeconds || 180),
    status: manifest.narrationDurationSeconds > Number(manifest.durationPolicyReview?.maximumSeconds || 180)
      ? 'over-limit-at-locked-speed'
      : 'within-limit'
  };
  manifest.postProcessing = {
    method: 'timestamp-aligned-phrase-removal',
    planFile: relative(planFile),
    reason: plan.reason,
    editedBlocks,
    ...(manifest.postProcessing ? { previous: manifest.postProcessing } : {})
  };
  writeJson(manifestFile, manifest);

  console.log(JSON.stringify({
    status: 'trimmed',
    foodId,
    take,
    editedBlocks,
    narrationDurationSeconds: manifest.narrationDurationSeconds,
    manifestFile: relative(manifestFile)
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
