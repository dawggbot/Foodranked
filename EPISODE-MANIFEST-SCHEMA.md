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

## `scenePlan`

`scenePlan` contains:
- `mode`
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

## Design rules

- keep episode folders deterministic and reviewable
- store snapshots, not references only
- keep timing estimated rather than fake-precise
- keep a human review step before publish
- make the compact narration path match the ElevenLabs block layout exactly
- treat `outputs/episodes/<food>-compact/` as the reusable source for published website script review, rather than maintaining separate hand-copied website narration text

## Success condition

This schema is doing its job when one command can generate a package that is:
- readable
- reviewable
- editable
- still aligned with the current scorer, script generator, and hardened food identity
