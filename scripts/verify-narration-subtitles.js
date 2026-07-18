#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const episodesDir = path.join(repoRoot, 'outputs', 'episodes');
const productionEpisodesDir = path.join(repoRoot, 'production', 'episodes');
const docsIndexPath = path.join(repoRoot, 'docs', 'data', 'foods-index.json');

const MAX_SUBTITLE_LINES = 2;
const MAX_SUBTITLE_LINE_CHARS = 18;
const MAX_SUMMARY_SUBTITLE_LINE_CHARS = 28;
const MACRO_SECTION_KEYS = new Set(['fats', 'carbs', 'proteins']);

const COMPACT_UNIT_RE = /\b\d+(?:\.\d+)?\s*(?:mcg|mg|kg|kcal|g)\b/i;
const EXPANDED_UNIT_RE = /\b\d+(?:\.\d+)?\s+(?:micrograms?|milligrams?|kilograms?|grams?|calories?)\b/i;
const SUBTITLE_UNIT_WORD_RE = /\b(?:micrograms?|milligrams?|kilograms?|grams?)\b/i;
const COMPACT_RATIO_RE = /\b\d+(?:\.\d+)?\/\d+(?:\.\d+)?\b/i;
const SPOKEN_RATIO_RE = /\b\d+(?:\.\d+)?\s+out of\s+\d+(?:\.\d+)?\b/i;
const EAA_TEN_RATIO_RE = /\bessential amino acids? score(?: is| at)? \d+(?:\.\d+)?(?:\/10|\s+out of\s+10)\b/i;
const TIER_REVEAL_RE = /^[SDCBA]\s+tier\.?$/i;
const PROTEIN_FALLBACK_RE = /\bprotein amount is\b/i;

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

function compactMetricValue(item) {
  if (!item) return null;
  if (item.displayValue === 'N/A' || item.notApplicableReason === 'main_macro_zero') return null;
  if (item.displaySource === 'macro_numeric_fallback' || item.scoringMode === 'display_fallback') return null;
  if (item.dvPercent != null) return `${item.dvPercent}% DV`;
  if (item.value === null || item.value === undefined) return null;

  const key = String(item.metricKey || '');
  if (key === 'protein_g_fallback' || key.endsWith('_g')) return `${item.value}g`;
  if (key.endsWith('_mg')) return `${item.value}mg`;
  if (key.endsWith('_mcg')) return `${item.value}mcg`;
  if (key.endsWith('_kg')) return `${item.value}kg`;
  if (key.endsWith('_percent')) return `${item.value}%`;
  if (key === 'essential_amino_acids_score') return `${item.value}/9`;
  if (key === 'nonessential_amino_acids_score') return `${item.value}/${item.denominator || 11}`;
  if (key.endsWith('_score')) return `${item.value}/10`;
  if (/glycemic/i.test(key)) return `${item.value} GI`;
  return String(item.value);
}

function formatMetricKey(metricKey) {
  const labels = {
    protein_g_fallback: 'protein amount',
    vitamin_b12_dv: 'vitamin B12',
    vitamin_b_dv: 'vitamin B12',
    vitamin_a_dv: 'vitamin A',
    vitamin_c_dv: 'vitamin C',
    vitamin_d_dv: 'vitamin D',
    vitamin_e_dv: 'vitamin E',
    vitamin_k_dv: 'vitamin K'
  };
  if (labels[metricKey]) return labels[metricKey];
  return String(metricKey || '')
    .replace(/_dv$/i, '')
    .replace(/_mg$/i, '')
    .replace(/_g$/i, '')
    .replace(/_percent$/i, '')
    .replace(/_/g, ' ')
    .replace(/\bomega3\b/i, 'omega 3')
    .replace(/\bgi\b/i, 'glycemic index')
    .trim();
}

function metricMentionLabels(metricKey) {
  const label = formatMetricKey(metricKey);
  const labels = new Set([label]);
  if (metricKey === 'protein_g_fallback') {
    labels.add('protein quantity');
    labels.add('protein amount');
  }
  if (metricKey === 'essential_amino_acids_score') {
    labels.add('essential amino acid score');
    labels.add('essential amino acids score');
    labels.add('essential amino acid support');
    labels.add('essential amino acid quality');
    labels.add('amino acid quality');
  }
  if (metricKey === 'nonessential_amino_acids_score') {
    labels.add('nonessential amino acid score');
    labels.add('nonessential amino acids score');
    labels.add('amino acid quality');
  }
  if (metricKey === 'bioavailability_percent') labels.add('bioavailability');
  if (metricKey === 'collagen_g') labels.add('collagen');
  return [...labels].filter(Boolean);
}

function splitSentences(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const decimals = [];
  const protectedText = normalized.replace(/\d+\.\d+/g, match => {
    const token = `__DECIMAL_${decimals.length}__`;
    decimals.push(match);
    return token;
  });
  const sentences = protectedText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [protectedText];
  return sentences
    .map(sentence => sentence.replace(/__DECIMAL_(\d+)__/g, (_, index) => decimals[Number(index)] || ''))
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

function sectionHasSubmacroValueMention(section) {
  const sentences = splitSentences(section.subtitleText);
  return (section.displayItems || [])
    .filter(item => !(section.key === 'proteins' && item.metricKey === 'protein_g_fallback'))
    .some(item => {
    const value = compactMetricValue(item);
    if (!value) return false;
    const labels = metricMentionLabels(item.metricKey);
    return sentences.some(sentence => (
      sentence.includes(value) &&
      labels.some(label => new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(sentence))
    ));
  });
}

function checkSubtitleCue(failures, file, cue) {
  const lines = Array.isArray(cue.lines) ? cue.lines : String(cue.text || '').split(/\r?\n/);
  const text = String(cue.text || '');
  const textWords = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const maxLineChars = cue.placement === 'summary-full'
    ? MAX_SUMMARY_SUBTITLE_LINE_CHARS
    : MAX_SUBTITLE_LINE_CHARS;
  if (lines.length > MAX_SUBTITLE_LINES) {
    addFailure(failures, file, `${cue.id || 'cue'} has ${lines.length} subtitle lines`);
  }
  const longLine = lines.find(line => String(line).length > maxLineChars);
  if (longLine) {
    addFailure(failures, file, `${cue.id || 'cue'} line exceeds ${maxLineChars} chars: "${longLine}"`);
  }
  if (cue.placement === 'tier-center' && !TIER_REVEAL_RE.test(text.replace(/\s+/g, ' ').trim())) {
    addFailure(failures, file, `${cue.id || 'cue'} tier-center cue is not a tier reveal`);
  }
  if (EXPANDED_UNIT_RE.test(text)) {
    addFailure(failures, file, `${cue.id || 'cue'} subtitle text contains expanded spoken unit`);
  }
  if (SUBTITLE_UNIT_WORD_RE.test(text)) {
    addFailure(failures, file, `${cue.id || 'cue'} subtitle text contains unit word`);
  }
  if (SPOKEN_RATIO_RE.test(text)) {
    addFailure(failures, file, `${cue.id || 'cue'} subtitle text contains spoken ratio`);
  }
  if (EAA_TEN_RATIO_RE.test(text)) {
    addFailure(failures, file, `${cue.id || 'cue'} subtitle text uses /10 for essential amino acids`);
  }
  if (cue.wordTimings != null) {
    const wordTimings = Array.isArray(cue.wordTimings) ? cue.wordTimings : [];
    if (!wordTimings.length) {
      addFailure(failures, file, `${cue.id || 'cue'} has empty wordTimings`);
    }
    if (wordTimings.length !== textWords.length) {
      addFailure(failures, file, `${cue.id || 'cue'} has ${wordTimings.length} word timings for ${textWords.length} subtitle words`);
    }
    let previousStart = -Infinity;
    wordTimings.forEach((word, index) => {
      const start = Number(word.startSeconds);
      const end = Number(word.endSeconds);
      if (word.text !== textWords[index]) {
        addFailure(failures, file, `${cue.id || 'cue'} wordTiming ${index + 1} text does not match subtitle word`);
      }
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        addFailure(failures, file, `${cue.id || 'cue'} wordTiming ${index + 1} has invalid timing`);
      }
      if (Number.isFinite(start) && start < previousStart) {
        addFailure(failures, file, `${cue.id || 'cue'} wordTimings are not monotonic`);
      }
      previousStart = start;
    });
    const firstStart = Number(wordTimings[0]?.startSeconds);
    const lastEnd = Number(wordTimings[wordTimings.length - 1]?.endSeconds);
    if (Number.isFinite(firstStart) && Number(cue.startSeconds) - firstStart > 0.02) {
      addFailure(failures, file, `${cue.id || 'cue'} starts after its first aligned word`);
    }
    if (Number.isFinite(lastEnd) && lastEnd - Number(cue.endSeconds) > 0.02) {
      addFailure(failures, file, `${cue.id || 'cue'} ends before its last aligned word`);
    }
  }
}

function checkScript(failures, file, script) {
  for (const section of script.sections || []) {
    if (COMPACT_UNIT_RE.test(String(section.narration || ''))) {
      addFailure(failures, file, `${section.key} narration contains compact unit`);
    }
    if (COMPACT_RATIO_RE.test(String(section.narration || ''))) {
      addFailure(failures, file, `${section.key} narration contains compact ratio`);
    }
    if (EAA_TEN_RATIO_RE.test(String(section.narration || ''))) {
      addFailure(failures, file, `${section.key} narration uses out of 10 for essential amino acids`);
    }
    if (SPOKEN_RATIO_RE.test(String(section.subtitleText || ''))) {
      addFailure(failures, file, `${section.key} subtitleText contains spoken ratio`);
    }
    if (EAA_TEN_RATIO_RE.test(String(section.subtitleText || ''))) {
      addFailure(failures, file, `${section.key} subtitleText uses /10 for essential amino acids`);
    }
    if (EXPANDED_UNIT_RE.test(String(section.subtitleText || ''))) {
      addFailure(failures, file, `${section.key} subtitleText contains expanded spoken unit`);
    }
    if (SUBTITLE_UNIT_WORD_RE.test(String(section.subtitleText || ''))) {
      addFailure(failures, file, `${section.key} subtitleText contains unit word`);
    }
    if (section.key === 'proteins') {
      if (PROTEIN_FALLBACK_RE.test(String(section.narration || '')) || PROTEIN_FALLBACK_RE.test(String(section.subtitleText || ''))) {
        addFailure(failures, file, 'proteins section repeats protein amount fallback instead of a submacro');
      }
    }
    for (const item of section.displayItems || []) {
      if (EAA_TEN_RATIO_RE.test(String(item.text || ''))) {
        addFailure(failures, file, `${section.key} display item uses /10 for essential amino acids`);
      }
    }
    if (MACRO_SECTION_KEYS.has(section.key)) {
      const displayedValues = (section.displayItems || [])
        .filter(item => !(section.key === 'proteins' && item.metricKey === 'protein_g_fallback'))
        .map(compactMetricValue)
        .filter(Boolean);
      if (displayedValues.length && !sectionHasSubmacroValueMention(section)) {
        addFailure(failures, file, `${section.key} subtitleText is missing a displayed submacro value`);
      }
    }
  }
  for (const block of script.narrationBlocks || []) {
    if (COMPACT_UNIT_RE.test(String(block.text || ''))) {
      addFailure(failures, file, `${block.kind || 'block'} narration block contains compact unit`);
    }
    if (COMPACT_RATIO_RE.test(String(block.text || ''))) {
      addFailure(failures, file, `${block.kind || 'block'} narration block contains compact ratio`);
    }
    if (EAA_TEN_RATIO_RE.test(String(block.text || ''))) {
      addFailure(failures, file, `${block.kind || 'block'} narration block uses out of 10 for essential amino acids`);
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
    if (COMPACT_RATIO_RE.test(String(scene.narrationText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} narrationText contains compact ratio`);
    }
    if (EAA_TEN_RATIO_RE.test(String(scene.narrationText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} narrationText uses out of 10 for essential amino acids`);
    }
    if (SPOKEN_RATIO_RE.test(String(scene.subtitleText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} subtitleText contains spoken ratio`);
    }
    if (EAA_TEN_RATIO_RE.test(String(scene.subtitleText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} subtitleText uses /10 for essential amino acids`);
    }
    if (EXPANDED_UNIT_RE.test(String(scene.subtitleText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} subtitleText contains expanded spoken unit`);
    }
    if (SUBTITLE_UNIT_WORD_RE.test(String(scene.subtitleText || ''))) {
      addFailure(failures, file, `${scene.id || 'scene'} subtitleText contains unit word`);
    }
    for (const cue of scene.subtitleCues || []) checkSubtitleCue(failures, file, cue);
    if (scene.id === 'final') {
      const finalCues = scene.subtitleCues || [];
      const tierIndex = finalCues.findIndex(cue => cue.placement === 'tier-center');
      if (tierIndex >= 0 && tierIndex !== finalCues.length - 1) {
        addFailure(failures, file, 'final tier reveal cue is not last');
      }
      if (finalCues.length > 1 && !finalCues.slice(0, -1).every(cue => cue.placement === 'summary-full')) {
        addFailure(failures, file, 'final summary cues are not using summary-full placement');
      }
    }
  }
  for (const cue of manifest.scenePlan?.subtitleCues || []) checkSubtitleCue(failures, file, cue);
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
  if (exists(narrationFile)) {
    const narrationText = fs.readFileSync(narrationFile, 'utf8');
    if (COMPACT_UNIT_RE.test(narrationText)) addFailure(failures, narrationFile, 'narration text contains compact unit');
    if (COMPACT_RATIO_RE.test(narrationText)) addFailure(failures, narrationFile, 'narration text contains compact ratio');
    if (EAA_TEN_RATIO_RE.test(narrationText)) addFailure(failures, narrationFile, 'narration text uses out of 10 for essential amino acids');
  }
}

function checkProductionNarration(failures) {
  if (!exists(productionEpisodesDir)) return;
  for (const foodId of fs.readdirSync(productionEpisodesDir).sort()) {
    const file = path.join(productionEpisodesDir, foodId, 'voice', 'final-narration.txt');
    if (!exists(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (COMPACT_RATIO_RE.test(text)) addFailure(failures, file, 'production narration contains compact ratio');
    if (EAA_TEN_RATIO_RE.test(text)) addFailure(failures, file, 'production narration uses out of 10 for essential amino acids');
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
  checkProductionNarration(failures);
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
