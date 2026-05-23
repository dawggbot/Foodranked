#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const episodesDir = path.join(repoRoot, 'outputs', 'episodes');
const docsIndexPath = path.join(repoRoot, 'docs', 'data', 'foods-index.json');

const MAX_SUBTITLE_LINES = 2;
const MAX_SUBTITLE_LINE_CHARS = 26;

const COMPACT_UNIT_RE = /\b\d+(?:\.\d+)?\s*(?:mcg|mg|kg|kcal|g)\b/i;
const EXPANDED_UNIT_RE = /\b\d+(?:\.\d+)?\s+(?:micrograms?|milligrams?|kilograms?|grams?|calories?)\b/i;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function exists(file) {
  return fs.existsSync(file);
}

function relative(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function addFailure(failures, file, message) {
  failures.push(`${relative(file)}: ${message}`);
}

function checkSubtitleCue(failures, file, cue) {
  const lines = Array.isArray(cue.lines) ? cue.lines : String(cue.text || '').split(/\r?\n/);
  if (lines.length > MAX_SUBTITLE_LINES) {
    addFailure(failures, file, `${cue.id || 'cue'} has ${lines.length} subtitle lines`);
  }
  const longLine = lines.find(line => String(line).length > MAX_SUBTITLE_LINE_CHARS);
  if (longLine) {
    addFailure(failures, file, `${cue.id || 'cue'} line exceeds ${MAX_SUBTITLE_LINE_CHARS} chars: "${longLine}"`);
  }
  if (EXPANDED_UNIT_RE.test(String(cue.text || ''))) {
    addFailure(failures, file, `${cue.id || 'cue'} subtitle text contains expanded spoken unit`);
  }
}

function checkScript(failures, file, script) {
  for (const section of script.sections || []) {
    if (COMPACT_UNIT_RE.test(String(section.narration || ''))) {
      addFailure(failures, file, `${section.key} narration contains compact unit`);
    }
    if (EXPANDED_UNIT_RE.test(String(section.subtitleText || ''))) {
      addFailure(failures, file, `${section.key} subtitleText contains expanded spoken unit`);
    }
  }
  for (const block of script.narrationBlocks || []) {
    if (COMPACT_UNIT_RE.test(String(block.text || ''))) {
      addFailure(failures, file, `${block.kind || 'block'} narration block contains compact unit`);
    }
  }
}

function checkManifest(failures, file, manifest) {
  const rules = manifest.scenePlan?.subtitleRules || {};
  if (rules.maxLines && Number(rules.maxLines) > MAX_SUBTITLE_LINES) {
    addFailure(failures, file, `subtitleRules.maxLines is ${rules.maxLines}`);
  }
  if (rules.maxCharactersPerLine && Number(rules.maxCharactersPerLine) > MAX_SUBTITLE_LINE_CHARS) {
    addFailure(failures, file, `subtitleRules.maxCharactersPerLine is ${rules.maxCharactersPerLine}`);
  }

  for (const scene of manifest.scenePlan?.scenes || []) {
    if (COMPACT_UNIT_RE.test(String(scene.narrationText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} narrationText contains compact unit`);
    }
    if (EXPANDED_UNIT_RE.test(String(scene.subtitleText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} subtitleText contains expanded spoken unit`);
    }
    for (const cue of scene.subtitleCues || []) checkSubtitleCue(failures, file, cue);
  }
}

function checkEpisodeDir(failures, episodeDir) {
  const scriptFile = path.join(episodeDir, 'script.json');
  const manifestFile = path.join(episodeDir, 'episode-manifest.json');
  const subtitlesFile = path.join(episodeDir, 'subtitles.json');
  const narrationFile = path.join(episodeDir, 'narration.txt');

  if (exists(scriptFile)) checkScript(failures, scriptFile, readJson(scriptFile));
  if (exists(manifestFile)) checkManifest(failures, manifestFile, readJson(manifestFile));
  if (exists(subtitlesFile)) {
    for (const cue of readJson(subtitlesFile)) checkSubtitleCue(failures, subtitlesFile, cue);
  }
  if (exists(narrationFile) && COMPACT_UNIT_RE.test(fs.readFileSync(narrationFile, 'utf8'))) {
    addFailure(failures, narrationFile, 'narration text contains compact unit');
  }
}

function checkDocsIndex(failures) {
  if (!exists(docsIndexPath)) return;
  for (const food of readJson(docsIndexPath)) {
    const episode = food.episode;
    if (!episode) continue;
    if (episode.script) checkScript(failures, docsIndexPath, episode.script);
    for (const cue of episode.subtitles || []) checkSubtitleCue(failures, docsIndexPath, cue);
    if (COMPACT_UNIT_RE.test(String(episode.narrationText || ''))) {
      addFailure(failures, docsIndexPath, `${food.id} episode narrationText contains compact unit`);
    }
  }
}

function main() {
  const failures = [];

  if (exists(episodesDir)) {
    for (const name of fs.readdirSync(episodesDir).sort()) {
      const episodeDir = path.join(episodesDir, name);
      if (fs.statSync(episodeDir).isDirectory()) checkEpisodeDir(failures, episodeDir);
    }
  }
  checkDocsIndex(failures);

  if (failures.length) {
    console.error(`Narration/subtitle verification failed with ${failures.length} issue(s):`);
    for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
    if (failures.length > 100) console.error(`...and ${failures.length - 100} more.`);
    process.exit(1);
  }

  console.log(JSON.stringify({
    status: 'ok',
    maxSubtitleLines: MAX_SUBTITLE_LINES,
    maxSubtitleLineChars: MAX_SUBTITLE_LINE_CHARS
  }, null, 2));
}

main();
