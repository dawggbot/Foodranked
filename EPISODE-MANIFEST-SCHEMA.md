# EPISODE-MANIFEST-SCHEMA

## Purpose

`outputs/episodes/<food-id>/episode-manifest.json` is the production handoff package for a single FoodRanked episode.

It bundles:
- scored output
- structured script output
- narration text
- subtitle cues
- scene timing
- visual bindings
- food identity/readiness context

## Main generator

```bash
node scripts/foodranked-generate-episode.js oats
```

Short-form / ElevenLabs-style package:

```bash
node scripts/foodranked-generate-episode.js oats --compact --no-cta
```

## Output folder

```text
outputs/episodes/<food-id>/
outputs/episodes/<food-id>-compact/
```

Files:
- `score.json`
- `script.json`
- `subtitles.json`
- `episode-manifest.json`
- `narration.txt`
- optional `<take>-forced-alignment.json` for single-file narration alignment
- optional `<take>-blocks-forced-alignment.json` plus `<take>-blocks/` for split-block narration alignment

## Top-level fields

- `id`
- `generatedAt`
- `status`
- `mode`
- `food`
- `sourceOfTruth`
- `outputs`
- `scoreSnapshot`
- `scriptSnapshot`
- `visualBinding`
- optional `sfxProfile`
- `reviewChecklist`
- `nextHumanStep`
- `scenePlan`

## `food`

The manifest now carries more of the hardened food context:

- `id`
- `name`
- `foodType`
- `basis`
- `identity`
- `scoreReadiness`
- `sourceNotes`
- `sourceFile`

## `scoreSnapshot`

Use the current scorer shape, not stale legacy fields.

Includes:
- `overallScore`
- `overallScoreExact`
- `tier`
- `sectionScores`
- `strongestSection`
- `weakestSection`
- `topPros`
- `topCons`
- `explanation`

Do **not** depend on removed legacy fields like:
- `baseScore`
- `contextAdjustment`

## `scriptSnapshot`

Includes:
- `schemaVersion`
- `narrationFormat`
- `hook`
- `closing`
- `sectionOrder`
- `narrationBlockCount`

This should stay aligned with `SCRIPT-SCHEMA.md`.

## `sfxProfile`

`sfxProfile` stores the per-episode reusable SFX choices used by Video Builder v2.

Fields:
- `version`
- `selectionMode`
- `stampImpact.path`
- `sectionTransition.path`
- `highlightGlow.path`

Paths are browser-facing `audio/sfx/...` paths. The matching source file should live under `audio/sfx/...`, and any file loaded by the builder must also be mirrored under `docs/audio/sfx/...`.

## `scenePlan`

`scenePlan` contains:
- `mode`
- `totalEstimatedDurationSeconds`
- `scenes[]`
- optional `subtitleCues[]`
- optional `alignment`

Each scene includes:
- `id`
- `kind`
- `startSeconds`
- `durationSeconds`
- `endSeconds`
- `narrationText`
- `subtitleText`
- `visualBinding`
- `revealPlan`
- optional `subtitleCues[]`

Subtitle cues may include:
- `id`
- `sceneId`
- `startSeconds`
- `endSeconds`
- `lines[]`
- `text`
- `placement`
- `maxLines`
- `maxCharactersPerLine`
- optional `wordTimings[]`

`wordTimings[]` are created by the forced-alignment pass. Each entry includes:
- `text`
- `startSeconds`
- `endSeconds`

## `scenePlan.alignment`

Forced alignment metadata is written after narration audio exists.

Single-file narration alignment uses:

```json
{
  "provider": "elevenlabs-forced-alignment",
  "source": "word",
  "alignmentPath": "outputs/episodes/bacon-compact/voice-v6-forced-alignment.json",
  "audioManifestPath": null,
  "blockCount": null,
  "loss": 0.123,
  "wordCount": 238
}
```

Split-block narration alignment uses:

```json
{
  "provider": "elevenlabs-forced-alignment-blocks",
  "source": "word",
  "alignmentPath": "outputs/episodes/bacon-compact/voice-v7-blocks-forced-alignment.json",
  "audioManifestPath": "docs/audio/episodes/bacon/voice-v7-blocks.json",
  "blockCount": 11,
  "loss": null,
  "wordCount": 238
}
```

When `provider` is `elevenlabs-forced-alignment-blocks`, `alignmentPath` points to the stitched alignment artifact and `audioManifestPath` points to the docs-facing split audio manifest. The stitched alignment is the timeline source for:
- `scenePlan.totalEstimatedDurationSeconds`
- each scene `startSeconds`, `durationSeconds`, and `endSeconds`
- `scenePlan.subtitleCues[]`
- `subtitles.json`
- subtitle `wordTimings[]`

## `outputs`

`outputs` includes deterministic filenames for the episode handoff:
- `directory`
- `scoreJson`
- `scriptJson`
- `manifestJson`
- `narrationTxt`
- `subtitlesJson`
- optional `alignmentJson`

For split-block alignment, `alignmentJson` is named:

```text
<take>-blocks-forced-alignment.json
```

Per-block forced-alignment files live in:

```text
outputs/episodes/<food-id>-compact/<take>-blocks/<block-id>-forced-alignment.json
```

## Design rules

- keep episode folders deterministic and reviewable
- store snapshots, not references only
- keep timing estimated rather than fake-precise
- replace estimated timing with forced-aligned timing when alignment metadata exists
- keep a human review step before publish
- make the compact narration path match the ElevenLabs block layout exactly
- make split-block narration preserve the same block order and spoken text as `narration.txt`
- treat `outputs/episodes/<food>-compact/` as the reusable source for published website script review, rather than maintaining separate hand-copied website narration text

## Success condition

This schema is doing its job when one command can generate a package that is:
- readable
- reviewable
- editable
- still aligned with the current scorer, script generator, and hardened food identity
