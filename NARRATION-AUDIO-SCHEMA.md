# NARRATION-AUDIO-SCHEMA

## Purpose

Narration audio artifacts connect the locked compact narration text to:
- ElevenLabs voice generation
- forced-alignment word timings
- subtitle cues
- video-builder preview
- production handoff files

The script text remains the source of truth. Audio metadata should describe generated files, not change narration order or wording.

## Commands

Single-file narration:

```bash
node scripts/foodranked-generate-voice.js bacon --take voice-v6
node scripts/foodranked-align-subtitles.js bacon --take voice-v6 --refresh
```

Split-block narration:

```bash
node scripts/foodranked-generate-voice.js bacon --take voice-v7 --split-blocks
node scripts/foodranked-align-subtitles.js bacon --take voice-v7 --refresh
node scripts/generate-dashboard-data.js
```

Use split-block narration when one long take sounds choppy or when subtitle timing is drifting across section boundaries.

## File layout

Reusable source audio assets:

```text
audio/sfx/
audio/music/
audio/narration/
```

Production voice files:

```text
production/episodes/<food-id>/voice/<take>.mp3
production/episodes/<food-id>/voice/<take>.json
production/episodes/<food-id>/voice/<take>-blocks.json
production/episodes/<food-id>/voice/<take>-blocks/<block-id>.mp3
```

Docs mirror files:

```text
docs/audio/episodes/<food-id>/<take>.mp3
docs/audio/episodes/<food-id>/<take>.json
docs/audio/episodes/<food-id>/<take>-blocks.json
docs/audio/episodes/<food-id>/<take>-blocks/<block-id>.mp3
docs/audio/sfx/
```

Alignment files:

```text
outputs/episodes/<food-id>-compact/<take>-forced-alignment.json
outputs/episodes/<food-id>-compact/<take>-blocks-forced-alignment.json
outputs/episodes/<food-id>-compact/<take>-blocks/<block-id>-forced-alignment.json
```

## Single audio metadata

Schema:

```text
foodranked-elevenlabs-audio.v1
```

Fields:
- `schemaVersion`
- `generatedAt`
- `foodId`
- `sourceNarration`
- `profileId`
- `voice.label`
- `voice.voiceId`
- `modelId`
- `outputFormat`
- `voiceSettings`
- `audioFile`
- `textSha256`
- `settingsSha256`
- `characterCount`
- `byteLength`
- `elevenLabs.requestId`
- `elevenLabs.historyItemId`
- `mirrors[]`

Docs mirror metadata also includes:
- `productionAudioFile`
- `productionMetadataFile`

## Split audio metadata

Schema:

```text
foodranked-elevenlabs-audio-blocks.v1
```

Top-level fields:
- `schemaVersion`
- `generatedAt`
- `foodId`
- `take`
- `sourceNarration`
- `profileId`
- `voice.label`
- `voice.voiceId`
- `modelId`
- `outputFormat`
- `voiceSettings`
- `settings`
- `textSha256`
- `settingsSha256`
- `characterCount`
- `blockCount`
- `audioDirectory`
- `audioManifestFile`
- `blocks[]`
- `mirrors[]`

Each block includes:
- `id`
- `index`
- `kind`
- `sectionKey`
- `text`
- `textSha256`
- `characterCount`
- `byteLength`
- `audioFile`
- `elevenLabs.requestId`
- `elevenLabs.historyItemId`

Docs mirror block metadata also includes:
- `productionAudioFile`

Block ids are created from `script.json` / `narrationBlocks[]`:
- `01-hook_food`
- `02-hook_ranked`
- `03-fats`
- `04-carbs`
- `05-proteins`
- `06-vitamins`
- `07-minerals`
- `08-pros`
- `09-cons`
- `10-closing_summary`
- `11-final_reveal`

## Single forced alignment

Schema:

```text
foodranked-forced-alignment.v1
```

Fields:
- `schemaVersion`
- `provider`
- `audioPath`
- `textPath`
- `generatedAt`
- `loss`
- `words[]`
- `characters[]`

The aligner applies `words[]` to `episode-manifest.json` and `subtitles.json`.

## Split forced alignment

Per-block alignment files still use `foodranked-forced-alignment.v1`.

The stitched aggregate uses:

```text
foodranked-forced-alignment-blocks.v1
```

Top-level fields:
- `schemaVersion`
- `provider`
- `blockMode`
- `audioManifestPath`
- `generatedAt`
- `blockGapSeconds`
- `loss`
- `blocks[]`
- `words[]`
- `characters[]`

Each aggregate block includes:
- `id`
- `index`
- `kind`
- `sectionKey`
- `text`
- `audioPath`
- `alignmentPath`
- `offsetSeconds`
- `durationSeconds`
- `wordCount`
- `loss`

Each aggregate word is copied from its block alignment and offset onto the stitched timeline. Split-mode words additionally carry:
- `blockId`
- `blockIndex`

## Dashboard data

After generating or aligning narration audio, run:

```bash
node scripts/generate-dashboard-data.js
```

This keeps `docs/data/foods-index.json` and `docs/data/foods-index.js` aligned with:
- latest episode timings
- subtitle `wordTimings[]`
- single-file `episode.audio`
- split-block `episode.splitAudio`

The video builder should prefer `episode.splitAudio` when it has timed blocks, while preserving `episode.audio` as a single-file fallback for older takes.

## Reusable SFX

The top-level `audio/` folder is the source home for reusable sounds that are not generated per episode.

Use:
- `audio/sfx/stamps/` for intro/outro stamp impacts and screen-shake hits
- `audio/sfx/sections/` for section-specific macro, micron, pro, and con reveal accents
- `audio/sfx/transitions/` for section changes and reveal accents
- `audio/sfx/ui/` for general interface-style sounds shared across sections
- `audio/music/` for reusable music beds and stingers

When the video builder needs to load a reusable sound in the browser, mirror the browser-ready file under `docs/audio/sfx/` with the same stable lowercase path.

Current mirrored stamp SFX:

```text
audio/sfx/stamps/impact-stamp-hit.mp3
docs/audio/sfx/stamps/impact-stamp-hit.mp3
```
