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
    '  --profile <id>       Voice profile id from config. Defaults to config.defaultProfile.',
    '  --take <name>        Audio take filename without extension. Defaults to voice-v1.',
    '  --source <path>      Narration text path. Defaults to outputs/episodes/<food>-compact/narration.txt.',
    '  --config <path>      Voice config path.',
    '  --force              Regenerate even when metadata matches.',
    '  --no-docs-mirror     Do not copy audio and metadata into docs/audio.',
    '  --no-final-sync      Do not mirror narration into production final-narration.txt.'
  ].join('\n'));
}

function parseArgs(argv) {
  const options = {
    configPath: defaultConfigPath,
    profile: null,
    take: 'voice-v1',
    source: null,
    force: false,
    docsMirror: true,
    finalSync: true
  };
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') options.force = true;
    else if (arg === '--no-docs-mirror') options.docsMirror = false;
    else if (arg === '--no-final-sync') options.finalSync = false;
    else if (arg === '--profile') {
      options.profile = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--profile=')) options.profile = arg.split('=')[1];
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

function apiErrorMessage(status, bodyText) {
  try {
    const body = JSON.parse(bodyText);
    if (body?.detail) return `${status}: ${typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)}`;
    if (body?.message) return `${status}: ${body.message}`;
  } catch {}
  return `${status}: ${bodyText.slice(0, 500)}`;
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

async function main() {
  const { foodId, options } = parseArgs(process.argv.slice(2));
  if (!foodId) {
    usage();
    process.exit(1);
  }

  loadDotEnvLocal();

  const config = readJson(options.configPath);
  const profileId = options.profile || config.defaultProfile;
  const profile = config.profiles?.[profileId];
  if (!profile) throw new Error(`Unknown ElevenLabs voice profile: ${profileId}`);

  const take = safeTakeName(options.take);
  const sourcePath = path.resolve(repoRoot, options.source || path.join('outputs', 'episodes', `${foodId}-compact`, 'narration.txt'));
  if (!fs.existsSync(sourcePath)) throw new Error(`Narration source does not exist: ${relativeRepoPath(sourcePath)}`);

  const text = fs.readFileSync(sourcePath, 'utf8').trim();
  if (!text) throw new Error(`Narration source is empty: ${relativeRepoPath(sourcePath)}`);

  const productionDir = path.join(repoRoot, resolvePattern(config.paths?.productionVoicePattern || 'production/episodes/{foodId}/voice', foodId));
  const docsDir = path.join(repoRoot, resolvePattern(config.paths?.docsAudioPattern || 'docs/audio/episodes/{foodId}', foodId));
  ensureDir(productionDir);
  if (options.docsMirror) ensureDir(docsDir);

  if (options.finalSync) {
    fs.writeFileSync(path.join(productionDir, 'final-narration.txt'), `${text}\n`);
  }

  const textHash = sha256(text);
  const settingsForHash = {
    profileId,
    voiceId: profile.voiceId,
    modelId: profile.modelId,
    outputFormat: profile.outputFormat,
    voiceSettings: profile.voiceSettings
  };
  const settingsHash = sha256(JSON.stringify(settingsForHash));
  const outputFile = path.join(productionDir, `${take}.mp3`);
  const metadataFile = path.join(productionDir, `${take}.json`);
  const docsAudioFile = path.join(docsDir, `${take}.mp3`);
  const docsMetadataFile = path.join(docsDir, `${take}.json`);

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

  const apiKeyName = config.environment?.apiKeyVariable || 'ELEVENLABS_API_KEY';
  const apiKey = process.env[apiKeyName];
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
