# EPISODE-MANIFEST-SCHEMA

## Purpose

`outputs/episodes/<food-id>/episode-manifest.json` is the first production handoff file for a single FoodRanked episode.

It turns the repo from:
- scorer + script generator

into:
- scorer + script generator + episode package

So one command can produce a reviewable output folder for a food.

## Current generator

Use:

```bash
node scripts/foodranked-generate-episode.js oats
```

Or generate the shorter-form package:

```bash
node scripts/foodranked-generate-episode.js oats --compact --no-cta
```

Or pass an explicit file:

```bash
node scripts/foodranked-generate-episode.js foods/oats.sample.json
```

## Output folder

The generator writes to:

```text
outputs/episodes/<food-id>/
```

Files:
- `score.json` — raw scorer output snapshot
- `script.json` — structured narration/script payload
- `subtitles.json` — simple subtitle cue list derived from scene timing
- `episode-manifest.json` — production handoff manifest
- `narration.txt` — plain text narration draft

## Manifest shape

### Top-level fields
- `id` — deterministic episode package id
- `generatedAt` — ISO timestamp
- `status` — current package status, starts as `draft`
- `mode` — `standard` or `compact`
- `food` — identity and source file info
- `sourceOfTruth` — which source files produced the package
- `outputs` — filenames in the generated folder
- `scoreSnapshot` — scoring verdict and explanation snapshot
- `scriptSnapshot` — key script pieces for quick inspection
- `visualBinding` — template id and palette/tier bindings
- `reviewChecklist` — human QA steps before publish
- `nextHumanStep` — plain-language handoff instruction
- `scenePlan` — estimated scene-by-scene timing and render bindings

### `scenePlan`

`scenePlan` contains:
- `totalEstimatedDurationSeconds`
- `scenes[]`

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

This is intentionally simple.
It is not the final renderer.
It is the bridge between:
- narration structure
- template slot mapping
- future motion / edit automation

## Current design decisions

### 1) One folder per food
Keep outputs deterministic and easy to inspect.

### 2) Store snapshots, not references only
Each episode folder should remain reviewable even if rulesets or scripts later change.

### 3) Keep timing estimated, not fake-precise
Current timings are narration-length estimates.
Later phases can replace them with TTS-informed timing or editor-derived timing.

### 4) Keep human review in the loop
This package is a draft production asset, not an auto-publish artifact.

## Recommended next step after this

Build one of these next:

1. **Render binder / scene expander**
   - expand `scenePlan` into more detailed per-slot visual payloads
2. **Voice generation hook**
   - produce TTS audio and real subtitle timings
3. **Episode queue runner**
   - batch-generate episode packages for selected foods

## Definition of success

This schema is doing its job if future-you can:
- generate one food episode package in one command
- inspect the verdict quickly
- read the narration draft
- hand the package into design/editing work without rebuilding context
