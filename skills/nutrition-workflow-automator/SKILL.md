---
name: "nutrition-workflow-automator"
description: "FoodRanked narration and proofing workflow"
---

# FoodRanked Workflow Automator

Use this skill for FoodRanked batch pipelines, episode generation, narration/subtitle prep, review queues, exports, and visual-proof handoffs.

## Visual Proof Handoffs

For FoodRanked visual/layout review, default to sharing live web-page proof URLs instead of MP4 files.

- Use the active pages for inspection: Database, Layout Builder, DBv2, and VBv2.
- For VBv2/video layout checking, provide a `docs/video-builder-v2/` URL with the relevant food query and a cache-busting version parameter when possible.
- Treat MP4s as final/export artifacts or explicit user-requested files, not the primary proof surface.
- When MP4 output appears to diverge from VBv2, do not keep asking James to inspect the MP4 first; use the live VBv2 page to confirm layout and then debug export parity separately.
- Do not revive or route work through stale/original builders unless James explicitly changes direction.

## Narration Pronunciation Overrides

Use these rules for FoodRanked generated split narration, especially Video Builder v2 episode audio.

### Principle

- Keep the script, subtitles, display text, and stored user-facing narration text clean and canonical.
- When ElevenLabs mispronounces a short food name or final tier reveal, generate that audio block with a separate `ttsText` value.
- Store the override in the split-audio manifest as `ttsText`, `ttsTextSha256`, `pronunciationNote`, and a top-level `pronunciationOverrides[]` entry.
- Do not rewrite the visible narration just to force pronunciation.

### Confirmed Overrides

- Kale hook: display text `Kale!`; TTS text `Kail!`. James confirmed this fixes the previous `kalay` pronunciation.
- A-tier final reveal: display text `A tier.`; TTS text `A-tier!`. James confirmed this fixes earlier `a tier` and `I tier` readings.
- S-tier final reveal: display text `S tier.`; TTS text `Ess tier!`. This remains the standing fix for clipped/blended `S tier` pronunciation.

### Workflow

1. Add or reuse a targeted override in `scripts/foodranked-generate-voice.js`.
2. Generate a new split take instead of editing an old MP3 in place.
3. Force-align the new take with `scripts/foodranked-align-subtitles.js`.
4. Regenerate dashboard data with `scripts/generate-dashboard-data.js`.
5. Verify the manifest points at the new take and records the pronunciation override.
6. Probe VBv2 for the affected food to confirm the new active take loads.

### Guardrails

- Only add food-name pronunciation overrides after James flags or confirms a mispronunciation.
- Prefer narrowly scoped overrides by `foodId`, block kind, and exact display text.
- Do not apply `A-tier!` or `Ess tier!` to subtitles or on-screen text; those remain `A tier.` and `S tier.`.
