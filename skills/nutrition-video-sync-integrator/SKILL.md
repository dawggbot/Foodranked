---
name: "nutrition-video-sync-integrator"
description: "Add app-local split narration sync guardrails."
---

# FoodRanked App-Local Split Narration Guardrail

When a FoodRanked entry is meant to work in the installed Studio app, do not rely on hosted `docs/audio/...` split-audio block paths just because the webpage VBv2 works.

## Required Agent Sync Shape

For app-facing Agent Sync jobs:

- Download each split narration MP3 with `downloadAsset` actions using `kind: "narration"`, `role: "split-audio-block"`, and `attachToFood: false`.
- Download the local split-audio manifest with `kind: "split-audio"`, `attachToFood: true`, and the correct `take`.
- The app-local split manifest must use block `audioFile` paths under `/studio-data/uploads/narration/<food-id>/`.
- The `upsertFood` payload should set `episode.splitAudio.manifestPath` to `/studio-data/uploads/split-audio/<food-id>/<take>-blocks-local.json` but should not include inline `episode.splitAudio.blocks` unless every block path is app-local.

## Why

VBv2 can have perfect narration on the hosted webpage while the installed app is silent if inline split-audio blocks point at `audio/episodes/...` paths that are not available in the packaged or local app state. If inline blocks exist, older VBv2 code may skip hydrating the downloaded local manifest.

## Verification

Before calling app narration done:

1. Run the Agent Sync job against a clean temp `FOODRANKED_STUDIO_DATA_DIR`.
2. Confirm all 11 MP3 blocks exist in `studio-data/uploads/narration/<food-id>/`.
3. Confirm the stored input database either has no inline `episode.splitAudio.blocks` or has 11 blocks with `/studio-data/uploads/narration/<food-id>/...` paths.
4. Render a short app-path VBv2 MP4 with narration only and verify it has an audio stream and audible loudness.
5. Keep the hosted webpage proof, but do not treat it as proof of installed-app narration parity.
