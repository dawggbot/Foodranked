#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.resolve(__dirname, '..');
const defaultConfigPath = path.join(repoRoot, 'config', 'elevenlabs-voice-settings.v1.json');

function usage() {
  console.error([
    'Usage: node scripts/foodranked-generate-voice.js <food-id> [options]',
    '',
    'Options:',
    '  --profile <id>       Voice profile id from config. Pins the voice only; generation settings stay locked.',
    '  --voice <value>      Voice profile id, ElevenLabs voice id, or random_suitable.',
    '  --voice-id <id>      Explicit ElevenLabs voice id.',
    '  --voice-label <text> Label to store when --voice-id is used.',
    '  --seed <value>       Deterministic seed for random_suitable voice selection.',
    '  --take <name>        Audio take filename without extension. Defaults to voice-v1.',
    '  --source <path>      Narration text path. Defaults to outputs/episodes/<food>-compact/narration.txt.',
    '  --config <path>      Voice config path.',
    '  --force              Regenerate even when metadata matches.',
    '  --split-blocks       Generate one audio file per narration block.',
    '  --list-suitable-voices  Print suitable random voice candidates and exit.',
    '  --dry-run            Resolve settings and selected voice without generating audio.',
    '  --no-docs-mirror     Do not copy audio and metadata into docs/audio.',
    '  --no-final-sync      Do not mirror narration into production final-narration.txt.'
  ].join('\n'));
}

function parseArgs(argv) {
  const options = {
    configPath: defaultConfigPath,
    profile: null,
    voice: null,
    voiceId: null,
    voiceLabel: null,
    seed: null,
    take: 'voice-v1',
    source: null,
    force: false,
    splitBlocks: false,
    listSuitableVoices: false,
    dryRun: false,
    docsMirror: true,
    finalSync: true
  };
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') options.force = true;
    else if (arg === '--split-blocks' || arg === '--split-sections') options.splitBlocks = true;
    else if (arg === '--list-suitable-voices') options.listSuitableVoices = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--no-docs-mirror') options.docsMirror = false;
    else if (arg === '--no-final-sync') options.finalSync = false;
    else if (arg === '--profile') {
      options.profile = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--profile=')) options.profile = arg.split('=')[1];
    else if (arg === '--voice') {
      options.voice = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--voice=')) options.voice = arg.slice('--voice='.length);
    else if (arg === '--voice-id') {
      options.voiceId = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--voice-id=')) options.voiceId = arg.slice('--voice-id='.length);
    else if (arg === '--voice-label') {
      options.voiceLabel = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--voice-label=')) options.voiceLabel = arg.slice('--voice-label='.length);
    else if (arg === '--seed') {
      options.seed = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--seed=')) options.seed = arg.slice('--seed='.length);
    else if (arg === '--take') {
      options.take = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--take=')) options.take = arg.split('=')[1];
    else if (arg === '--source') {
      options.source = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--source=')) options.source = arg.slice('--source='.length);
    else if (arg === '--config') {
      options.configPath = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--config=')) options.configPath = path.resolve(arg.slice('--config='.length));
    else positional.push(arg);
  }

  return { foodId: positional[0], options };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function loadDotEnvLocal() {
  const envFile = path.join(repoRoot, '.env.local');
  if (!fs.existsSync(envFile)) return;
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

function resolvePattern(pattern, foodId) {
  return pattern.replace(/\{foodId\}/g, foodId);
}

function safeTakeName(value) {
  return String(value || 'voice-v1')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'voice-v1';
}

function relativeRepoPath(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function metadataMatches(file, textHash, settingsHash) {
  if (!fs.existsSync(file)) return false;
  try {
    const metadata = readJson(file);
    return metadata.textSha256 === textHash && metadata.settingsSha256 === settingsHash;
  } catch {
    return false;
  }
}

function sameJsonValue(left, right) {
  return JSON.stringify(left || null) === JSON.stringify(right || null);
}

function generationSettingsMatch(metadata, settings) {
  const source = metadata?.settings || metadata || {};
  return source.modelId === settings.modelId
    && source.outputFormat === settings.outputFormat
    && sameJsonValue(source.voiceSettings, settings.voiceSettings);
}

function metadataMatchesGeneration(file, textHash, settings) {
  if (!fs.existsSync(file)) return false;
  try {
    const metadata = readJson(file);
    return metadata.textSha256 === textHash && generationSettingsMatch(metadata, settings);
  } catch {
    return false;
  }
}

function splitMetadataMatchesGeneration(file, textHash, settings, blockCount) {
  if (!fs.existsSync(file)) return false;
  try {
    const metadata = readJson(file);
    if (metadata.textSha256 !== textHash || !generationSettingsMatch(metadata, settings)) return false;
    if (!Array.isArray(metadata.blocks) || metadata.blocks.length !== blockCount) return false;
    return metadata.blocks.every(block => block.audioFile && fs.existsSync(path.join(repoRoot, block.audioFile)));
  } catch {
    return false;
  }
}

function transcriptBlocks(text) {
  return String(text || '')
    .split(/\r?\n\s*-\s*\r?\n/)
    .map(block => block.trim())
    .filter(Boolean);
}

function safeBlockSlug(value, fallback) {
  return String(value || fallback || 'block')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'block';
}

function episodeScriptPathForSource(sourcePath) {
  const candidate = path.join(path.dirname(sourcePath), 'script.json');
  return fs.existsSync(candidate) ? candidate : null;
}

function narrationBlockDescriptors(sourcePath, text) {
  const textBlocks = transcriptBlocks(text);
  const scriptPath = episodeScriptPathForSource(sourcePath);
  const script = scriptPath ? readJson(scriptPath) : null;
  const scriptBlocks = Array.isArray(script?.narrationBlocks) ? script.narrationBlocks : [];
  return textBlocks.map((blockText, index) => {
    const scriptBlock = scriptBlocks[index] || {};
    const kind = scriptBlock.kind || `block_${index + 1}`;
    const role = scriptBlock.sectionKey || kind;
    const id = `${String(index + 1).padStart(2, '0')}-${safeBlockSlug(role, kind)}`;
    return {
      id,
      index,
      kind,
      sectionKey: scriptBlock.sectionKey || null,
      text: blockText
    };
  });
}

function apiErrorMessage(status, bodyText) {
  try {
    const body = JSON.parse(bodyText);
    if (body?.detail) return `${status}: ${typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)}`;
    if (body?.message) return `${status}: ${body.message}`;
  } catch {}
  return `${status}: ${bodyText.slice(0, 500)}`;
}

function asList(value) {
  return Array.isArray(value) ? value.filter(item => item != null) : [];
}

function lowerText(value) {
  return String(value == null ? '' : value).toLowerCase();
}

function voiceLabelsText(labels) {
  if (!labels || typeof labels !== 'object') return '';
  return Object.entries(labels)
    .flatMap(([key, value]) => [key, value])
    .map(value => String(value == null ? '' : value))
    .join(' ');
}

function voiceLanguageText(voice) {
  return asList(voice.verified_languages)
    .map(language => [
      language.language,
      language.locale,
      language.accent
    ].filter(Boolean).join(' '))
    .join(' ');
}

function voiceSearchText(voice) {
  return lowerText([
    voice.name,
    voice.category,
    voice.description,
    voiceLabelsText(voice.labels),
    voiceLanguageText(voice),
    voice.recording_quality,
    voice.sharing?.category
  ].filter(Boolean).join(' '));
}

function voiceSupportsEnglish(voice) {
  const languages = asList(voice.verified_languages);
  if (!languages.length) return true;
  return languages.some(language => {
    const code = lowerText(language.language || language.locale);
    return code === 'en' || code.startsWith('en_') || code.startsWith('en-') || code === 'english';
  });
}

function voiceSupportsModel(voice, modelId) {
  const modelIds = asList(voice.high_quality_base_model_ids);
  if (!modelIds.length) return true;
  return modelIds.includes(modelId);
}

function termMatches(text, term) {
  const normalized = lowerText(term).trim();
  return normalized && text.includes(normalized);
}

function scoreVoiceCandidate(voice, config, modelId) {
  const suitability = config.voiceSelection?.suitability || {};
  const text = voiceSearchText(voice);
  const category = lowerText(voice.category);
  const excludedCategories = asList(suitability.excludedCategories).map(lowerText);
  const excludedTerms = asList(suitability.excludedTerms);
  const preferredTerms = asList(suitability.preferredTerms);

  if (!voice.voice_id || !voice.name) {
    return { accepted: false, score: 0, reasons: ['missing voice id or name'] };
  }
  if (excludedCategories.includes(category)) {
    return { accepted: false, score: 0, reasons: [`excluded category: ${category}`] };
  }
  const excludedTerm = excludedTerms.find(term => termMatches(text, term));
  if (excludedTerm) {
    return { accepted: false, score: 0, reasons: [`excluded term: ${excludedTerm}`] };
  }
  if (suitability.requireEnglish !== false && !voiceSupportsEnglish(voice)) {
    return { accepted: false, score: 0, reasons: ['no English language metadata'] };
  }
  if (!voiceSupportsModel(voice, modelId)) {
    return { accepted: false, score: 0, reasons: [`not marked for ${modelId}`] };
  }

  let score = 0;
  const reasons = [];
  if (category === 'professional') {
    score += 3;
    reasons.push('professional category');
  } else if (category === 'premade') {
    score += 2;
    reasons.push('premade category');
  } else if (category === 'generated') {
    score += 1;
    reasons.push('generated category');
  }
  if (lowerText(voice.recording_quality) === 'studio') {
    score += 2;
    reasons.push('studio recording quality');
  }
  if (asList(voice.high_quality_base_model_ids).includes(modelId)) {
    score += 2;
    reasons.push(`high-quality ${modelId} support`);
  }

  for (const term of preferredTerms) {
    if (termMatches(text, term)) {
      score += 1;
      reasons.push(`matches ${term}`);
    }
  }

  const minScore = Number.isFinite(Number(suitability.minScore)) ? Number(suitability.minScore) : 1;
  if (score < minScore) {
    return { accepted: false, score, reasons: [`score below ${minScore}`] };
  }
  return { accepted: true, score, reasons };
}

function generationDefaults(config) {
  const fallbackProfile = config.profiles?.[config.defaultProfile] || {};
  const defaults = config.generationDefaults || {};
  return {
    modelId: defaults.modelId || fallbackProfile.modelId || 'eleven_multilingual_v2',
    outputFormat: defaults.outputFormat || fallbackProfile.outputFormat || 'mp3_44100_128',
    voiceSettings: {
      ...(fallbackProfile.voiceSettings || {}),
      ...(defaults.voiceSettings || {})
    }
  };
}

function normalizeProfileFromVoice({ profileId, label, voiceId, settings, voiceSelection }) {
  return {
    label,
    voiceId,
    modelId: settings.modelId,
    outputFormat: settings.outputFormat,
    voiceSettings: settings.voiceSettings,
    voiceSelection,
    profileId
  };
}

function profileFromConfig(config, profileId, settings) {
  const profile = config.profiles?.[profileId];
  if (!profile) throw new Error(`Unknown ElevenLabs voice profile: ${profileId}`);
  return normalizeProfileFromVoice({
    profileId,
    label: profile.label,
    voiceId: profile.voiceId,
    settings,
    voiceSelection: {
      mode: 'profile',
      profileId
    }
  });
}

function sortedVoiceCandidates(voices, config, modelId) {
  return voices
    .map(voice => ({
      voice,
      suitability: scoreVoiceCandidate(voice, config, modelId)
    }))
    .filter(candidate => candidate.suitability.accepted)
    .sort((a, b) => {
      const scoreDiff = b.suitability.score - a.suitability.score;
      if (scoreDiff) return scoreDiff;
      return String(a.voice.name || '').localeCompare(String(b.voice.name || ''))
        || String(a.voice.voice_id || '').localeCompare(String(b.voice.voice_id || ''));
    });
}

function seededIndex(seed, count) {
  if (!seed) return crypto.randomInt(count);
  const hash = crypto.createHash('sha256').update(String(seed)).digest();
  const value = hash.readUInt32BE(0);
  return value % count;
}

async function fetchVoicePage({ apiKey, endpoint, pageSize, voiceType, pageToken }) {
  const url = new URL(endpoint);
  url.searchParams.set('page_size', String(pageSize));
  url.searchParams.set('include_total_count', 'false');
  if (voiceType) url.searchParams.set('voice_type', voiceType);
  if (pageToken) url.searchParams.set('next_page_token', pageToken);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey
    }
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs voice list failed: ${apiErrorMessage(response.status, await response.text())}`);
  }
  return response.json();
}

async function fetchAvailableVoices({ apiKey, config }) {
  if (!apiKey) {
    throw new Error('Missing ElevenLabs API key; random voice selection needs the ElevenLabs voice list. Use --profile <id> or --voice-id <id> to pin a voice.');
  }
  const selection = config.voiceSelection || {};
  const endpoint = selection.endpoint || 'https://api.elevenlabs.io/v2/voices';
  const pageSize = Math.max(1, Math.min(100, Number(selection.pageSize) || 100));
  const voiceTypes = asList(selection.voiceTypes);
  const queryVoiceTypes = voiceTypes.length ? voiceTypes : [null];
  const voicesById = new Map();

  for (const voiceType of queryVoiceTypes) {
    let pageToken = null;
    for (let page = 0; page < 20; page += 1) {
      const body = await fetchVoicePage({ apiKey, endpoint, pageSize, voiceType, pageToken });
      for (const voice of asList(body.voices)) {
        if (voice?.voice_id && !voicesById.has(voice.voice_id)) voicesById.set(voice.voice_id, voice);
      }
      if (!body.has_more || !body.next_page_token) break;
      pageToken = body.next_page_token;
    }
  }

  return [...voicesById.values()];
}

async function suitableVoiceCandidates({ apiKey, config, settings }) {
  const voices = await fetchAvailableVoices({ apiKey, config });
  return sortedVoiceCandidates(voices, config, settings.modelId);
}

async function randomSuitableProfile({ apiKey, config, settings, seed }) {
  const candidates = await suitableVoiceCandidates({ apiKey, config, settings });
  if (!candidates.length) {
    const fallbackProfile = config.voiceSelection?.fallbackProfile || config.defaultProfile;
    const profile = profileFromConfig(config, fallbackProfile, settings);
    profile.profileId = 'random_suitable_fallback';
    profile.voiceSelection = {
      mode: 'random_suitable_fallback',
      fallbackProfile,
      reason: 'no suitable ElevenLabs voice candidates matched the configured filters'
    };
    return {
      profile,
      candidates
    };
  }

  const index = seededIndex(seed, candidates.length);
  const selected = candidates[index];
  return {
    profile: normalizeProfileFromVoice({
      profileId: 'random_suitable',
      label: selected.voice.name,
      voiceId: selected.voice.voice_id,
      settings,
      voiceSelection: {
        mode: 'random_suitable',
        seed: seed || null,
        candidateCount: candidates.length,
        selectedIndex: index,
        score: selected.suitability.score,
        reasons: selected.suitability.reasons.slice(0, 8),
        category: selected.voice.category || null,
        labels: selected.voice.labels || {}
      }
    }),
    candidates
  };
}

async function resolveProfile({ apiKey, config, options }) {
  const settings = generationDefaults(config);
  if (options.voiceId) {
    return {
      profile: normalizeProfileFromVoice({
        profileId: 'explicit_voice_id',
        label: options.voiceLabel || `ElevenLabs voice ${options.voiceId}`,
        voiceId: options.voiceId,
        settings,
        voiceSelection: {
          mode: 'explicit_voice_id'
        }
      }),
      candidates: null
    };
  }

  const requested = options.profile || options.voice || config.voiceSelection?.defaultMode || config.defaultProfile;
  if (requested === 'random' || requested === 'random_suitable') {
    return randomSuitableProfile({ apiKey, config, settings, seed: options.seed });
  }
  if (config.profiles?.[requested]) {
    return {
      profile: profileFromConfig(config, requested, settings),
      candidates: null
    };
  }

  return {
    profile: normalizeProfileFromVoice({
      profileId: 'explicit_voice_id',
      label: options.voiceLabel || `ElevenLabs voice ${requested}`,
      voiceId: requested,
      settings,
      voiceSelection: {
        mode: 'explicit_voice_id'
      }
    }),
    candidates: null
  };
}

async function generateSpeech({ apiKey, profile, text, outputFile }) {
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${profile.voiceId}`);
  url.searchParams.set('output_format', profile.outputFormat || 'mp3_44100_128');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text,
      model_id: profile.modelId || 'eleven_multilingual_v2',
      voice_settings: profile.voiceSettings || {}
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs request failed: ${apiErrorMessage(response.status, await response.text())}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputFile, audio);
  return {
    bytes: audio.length,
    requestId: response.headers.get('request-id') || response.headers.get('x-request-id') || null,
    historyItemId: response.headers.get('history-item-id') || response.headers.get('x-history-item-id') || null
  };
}

function splitMetadataMatches(file, textHash, settingsHash, blockCount) {
  if (!fs.existsSync(file)) return false;
  try {
    const metadata = readJson(file);
    if (metadata.textSha256 !== textHash || metadata.settingsSha256 !== settingsHash) return false;
    if (!Array.isArray(metadata.blocks) || metadata.blocks.length !== blockCount) return false;
    return metadata.blocks.every(block => block.audioFile && fs.existsSync(path.join(repoRoot, block.audioFile)));
  } catch {
    return false;
  }
}

function mirrorSplitMetadata(metadata, docsBlocksDir, docsMetadataFile, productionMetadataFile) {
  const docsBlocks = metadata.blocks.map(block => {
    const productionAudioFile = path.join(repoRoot, block.audioFile);
    const docsAudioFile = path.join(docsBlocksDir, path.basename(block.audioFile));
    fs.copyFileSync(productionAudioFile, docsAudioFile);
    return {
      ...block,
      audioFile: relativeRepoPath(docsAudioFile),
      productionAudioFile: block.audioFile
    };
  });

  writeJson(docsMetadataFile, {
    ...metadata,
    audioManifestFile: relativeRepoPath(docsMetadataFile),
    productionAudioManifestFile: relativeRepoPath(productionMetadataFile),
    blocks: docsBlocks,
    mirrors: [
      {
        purpose: 'video-builder-preview',
        audioManifestFile: relativeRepoPath(docsMetadataFile),
        audioDirectory: relativeRepoPath(docsBlocksDir)
      }
    ]
  });
}

async function generateSplitBlockSpeech({
  apiKey,
  profile,
  profileId,
  foodId,
  take,
  sourcePath,
  text,
  textHash,
  settingsHash,
  settingsForHash,
  productionDir,
  docsDir,
  options
}) {
  const blocks = narrationBlockDescriptors(sourcePath, text);
  if (!blocks.length) throw new Error(`No narration blocks found in ${relativeRepoPath(sourcePath)}`);

  const productionBlocksDir = path.join(productionDir, `${take}-blocks`);
  const docsBlocksDir = path.join(docsDir, `${take}-blocks`);
  const metadataFile = path.join(productionDir, `${take}-blocks.json`);
  const docsMetadataFile = path.join(docsDir, `${take}-blocks.json`);

  if (!options.force && splitMetadataMatches(metadataFile, textHash, settingsHash, blocks.length)) {
    const metadata = readJson(metadataFile);
    if (options.docsMirror) {
      ensureDir(docsBlocksDir);
      mirrorSplitMetadata(metadata, docsBlocksDir, docsMetadataFile, metadataFile);
    }
    console.log(JSON.stringify({
      status: 'skipped',
      reason: 'split audio already matches narration and settings',
      foodId,
      take,
      blockCount: blocks.length,
      audioManifestFile: relativeRepoPath(metadataFile)
    }, null, 2));
    return;
  }

  if (!apiKey) throw new Error('Missing ElevenLabs API key; split audio is not cached and must be generated.');

  ensureDir(productionBlocksDir);
  if (options.docsMirror) ensureDir(docsBlocksDir);

  const generatedBlocks = [];
  for (const block of blocks) {
    const outputFile = path.join(productionBlocksDir, `${block.id}.mp3`);
    const blockTextHash = sha256(block.text);
    const result = await generateSpeech({ apiKey, profile, text: block.text, outputFile });
    generatedBlocks.push({
      id: block.id,
      index: block.index,
      kind: block.kind,
      sectionKey: block.sectionKey,
      text: block.text,
      textSha256: blockTextHash,
      characterCount: block.text.length,
      byteLength: result.bytes,
      audioFile: relativeRepoPath(outputFile),
      elevenLabs: {
        requestId: result.requestId,
        historyItemId: result.historyItemId
      }
    });
  }

  const metadata = {
    schemaVersion: 'foodranked-elevenlabs-audio-blocks.v1',
    generatedAt: new Date().toISOString(),
    foodId,
    take,
    sourceNarration: relativeRepoPath(sourcePath),
    profileId,
    voice: {
      label: profile.label,
      voiceId: profile.voiceId
    },
    voiceSelection: profile.voiceSelection || null,
    modelId: profile.modelId,
    outputFormat: profile.outputFormat,
    voiceSettings: profile.voiceSettings,
    settings: settingsForHash,
    textSha256: textHash,
    settingsSha256: settingsHash,
    characterCount: text.length,
    blockCount: generatedBlocks.length,
    audioDirectory: relativeRepoPath(productionBlocksDir),
    audioManifestFile: relativeRepoPath(metadataFile),
    blocks: generatedBlocks,
    mirrors: []
  };

  writeJson(metadataFile, metadata);
  if (options.docsMirror) mirrorSplitMetadata(metadata, docsBlocksDir, docsMetadataFile, metadataFile);

  console.log(JSON.stringify({
    status: 'generated',
    mode: 'split-blocks',
    foodId,
    take,
    blockCount: generatedBlocks.length,
    audioManifestFile: relativeRepoPath(metadataFile),
    docsAudioManifestFile: options.docsMirror ? relativeRepoPath(docsMetadataFile) : null
  }, null, 2));
}

async function main() {
  const { foodId, options } = parseArgs(process.argv.slice(2));
  if (!foodId && !options.listSuitableVoices) {
    usage();
    process.exit(1);
  }

  loadDotEnvLocal();

  const config = readJson(options.configPath);
  const apiKeyName = config.environment?.apiKeyVariable || 'ELEVENLABS_API_KEY';
  const apiKey = process.env[apiKeyName];
  const defaultSettings = generationDefaults(config);

  if (options.listSuitableVoices) {
    const candidates = await suitableVoiceCandidates({ apiKey, config, settings: defaultSettings });
    console.log(JSON.stringify({
      status: 'ok',
      mode: 'list-suitable-voices',
      candidateCount: candidates.length,
      modelId: defaultSettings.modelId,
      outputFormat: defaultSettings.outputFormat,
      voiceSettings: defaultSettings.voiceSettings,
      voices: candidates.map(candidate => ({
        voiceId: candidate.voice.voice_id,
        name: candidate.voice.name,
        category: candidate.voice.category || null,
        score: candidate.suitability.score,
        reasons: candidate.suitability.reasons.slice(0, 8)
      }))
    }, null, 2));
    return;
  }

  const take = safeTakeName(options.take);
  const sourcePath = path.resolve(repoRoot, options.source || path.join('outputs', 'episodes', `${foodId}-compact`, 'narration.txt'));
  if (!fs.existsSync(sourcePath)) throw new Error(`Narration source does not exist: ${relativeRepoPath(sourcePath)}`);

  const text = fs.readFileSync(sourcePath, 'utf8').trim();
  if (!text) throw new Error(`Narration source is empty: ${relativeRepoPath(sourcePath)}`);

  const productionDir = path.join(repoRoot, resolvePattern(config.paths?.productionVoicePattern || 'production/episodes/{foodId}/voice', foodId));
  const docsDir = path.join(repoRoot, resolvePattern(config.paths?.docsAudioPattern || 'docs/audio/episodes/{foodId}', foodId));
  ensureDir(productionDir);
  if (options.docsMirror) ensureDir(docsDir);

  const textHash = sha256(text);
  const outputFile = path.join(productionDir, `${take}.mp3`);
  const metadataFile = path.join(productionDir, `${take}.json`);
  const docsAudioFile = path.join(docsDir, `${take}.mp3`);
  const docsMetadataFile = path.join(docsDir, `${take}.json`);
  const splitMetadataFile = path.join(productionDir, `${take}-blocks.json`);
  const docsSplitMetadataFile = path.join(docsDir, `${take}-blocks.json`);
  const docsBlocksDir = path.join(docsDir, `${take}-blocks`);

  if (options.finalSync && !options.dryRun) {
    fs.writeFileSync(path.join(productionDir, 'final-narration.txt'), `${text}\n`);
  }

  const requestedVoice = options.profile || options.voice || options.voiceId;
  const implicitRandomVoice = !requestedVoice && ['random', 'random_suitable'].includes(config.voiceSelection?.defaultMode);
  if (!options.force && !options.dryRun && implicitRandomVoice) {
    if (options.splitBlocks) {
      const blockCount = narrationBlockDescriptors(sourcePath, text).length;
      if (splitMetadataMatchesGeneration(splitMetadataFile, textHash, defaultSettings, blockCount)) {
        const metadata = readJson(splitMetadataFile);
        if (options.docsMirror) {
          ensureDir(docsBlocksDir);
          mirrorSplitMetadata(metadata, docsBlocksDir, docsSplitMetadataFile, splitMetadataFile);
        }
        console.log(JSON.stringify({
          status: 'skipped',
          reason: 'existing split audio already matches narration and locked generation settings',
          foodId,
          take,
          voice: metadata.voice || null,
          blockCount,
          audioManifestFile: relativeRepoPath(splitMetadataFile)
        }, null, 2));
        return;
      }
    } else if (fs.existsSync(outputFile) && metadataMatchesGeneration(metadataFile, textHash, defaultSettings)) {
      const metadata = readJson(metadataFile);
      if (options.docsMirror) {
        fs.copyFileSync(outputFile, docsAudioFile);
        writeJson(docsMetadataFile, {
          ...metadata,
          audioFile: relativeRepoPath(docsAudioFile),
          productionAudioFile: relativeRepoPath(outputFile),
          productionMetadataFile: relativeRepoPath(metadataFile)
        });
      }
      console.log(JSON.stringify({
        status: 'skipped',
        reason: 'existing audio already matches narration and locked generation settings',
        foodId,
        take,
        voice: metadata.voice || null,
        audioFile: relativeRepoPath(outputFile)
      }, null, 2));
      return;
    }
  }

  const { profile, candidates } = await resolveProfile({ apiKey, config, options });
  const profileId = profile.profileId;
  const settingsForHash = {
    profileId,
    voiceId: profile.voiceId,
    voiceLabel: profile.label,
    modelId: profile.modelId,
    outputFormat: profile.outputFormat,
    voiceSettings: profile.voiceSettings,
    voiceSelection: profile.voiceSelection || null
  };
  const settingsHash = sha256(JSON.stringify(settingsForHash));

  if (options.dryRun) {
    console.log(JSON.stringify({
      status: 'dry-run',
      foodId,
      take,
      sourceNarration: relativeRepoPath(sourcePath),
      profileId,
      voice: {
        label: profile.label,
        voiceId: profile.voiceId
      },
      modelId: profile.modelId,
      outputFormat: profile.outputFormat,
      voiceSettings: profile.voiceSettings,
      settingsSha256: settingsHash,
      randomCandidateCount: candidates ? candidates.length : null
    }, null, 2));
    return;
  }

  if (options.splitBlocks) {
    await generateSplitBlockSpeech({
      apiKey,
      profile,
      profileId,
      foodId,
      take,
      sourcePath,
      text,
      textHash,
      settingsHash,
      settingsForHash,
      productionDir,
      docsDir,
      options
    });
    return;
  }

  if (!options.force && fs.existsSync(outputFile) && metadataMatches(metadataFile, textHash, settingsHash)) {
    if (options.docsMirror) {
      const metadata = readJson(metadataFile);
      fs.copyFileSync(outputFile, docsAudioFile);
      writeJson(docsMetadataFile, {
        ...metadata,
        audioFile: relativeRepoPath(docsAudioFile),
        productionAudioFile: relativeRepoPath(outputFile),
        productionMetadataFile: relativeRepoPath(metadataFile)
      });
    }
    console.log(JSON.stringify({
      status: 'skipped',
      reason: 'audio already matches narration and settings',
      foodId,
      take,
      audioFile: relativeRepoPath(outputFile)
    }, null, 2));
    return;
  }

  if (!apiKey) throw new Error(`Missing ${apiKeyName}. Set it in the environment, GitHub Actions secret, or local .env.local.`);

  const result = await generateSpeech({ apiKey, profile, text, outputFile });
  const metadata = {
    schemaVersion: 'foodranked-elevenlabs-audio.v1',
    generatedAt: new Date().toISOString(),
    foodId,
    sourceNarration: relativeRepoPath(sourcePath),
    profileId,
    voice: {
      label: profile.label,
      voiceId: profile.voiceId
    },
    voiceSelection: profile.voiceSelection || null,
    modelId: profile.modelId,
    outputFormat: profile.outputFormat,
    voiceSettings: profile.voiceSettings,
    audioFile: relativeRepoPath(outputFile),
    textSha256: textHash,
    settingsSha256: settingsHash,
    characterCount: text.length,
    byteLength: result.bytes,
    elevenLabs: {
      requestId: result.requestId,
      historyItemId: result.historyItemId
    },
    mirrors: options.docsMirror ? [
      {
        purpose: 'video-builder-preview',
        audioFile: relativeRepoPath(docsAudioFile),
        metadataFile: relativeRepoPath(docsMetadataFile)
      }
    ] : []
  };

  writeJson(metadataFile, metadata);
  if (options.docsMirror) {
    fs.copyFileSync(outputFile, docsAudioFile);
    writeJson(docsMetadataFile, {
      ...metadata,
      audioFile: relativeRepoPath(docsAudioFile),
      productionAudioFile: relativeRepoPath(outputFile),
      productionMetadataFile: relativeRepoPath(metadataFile)
    });
  }

  console.log(JSON.stringify({
    status: 'generated',
    foodId,
    take,
    audioFile: relativeRepoPath(outputFile),
    docsAudioFile: options.docsMirror ? relativeRepoPath(docsAudioFile) : null,
    bytes: result.bytes
  }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
