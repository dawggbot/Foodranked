---
name: "nutrition-workflow-automator"
description: "FoodRanked narration, proofing, batch refresh, episode generation, subtitle prep, and visual handoff workflow."
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

## Non-Sample Nutrition Refresh Workflow

When James asks to redo food entries after skill/profile improvements:

- Exclude the approved 11 finalisation samples unless James explicitly asks to include them: `kale`, `raspberries`, `oats`, `black-beans`, `sweet-potato`, `almonds`, `chia-seeds`, `bacon`, `greek-yogurt`, `extra-virgin-olive-oil`, `cola-regular`.
- Do not regenerate or overwrite their scripts, narration, split audio, subtitles, generated episode outputs, production narration, or food JSON during a broad cleanup.
- Work in small batches by food type or source class, so nutrition source quality and pros/cons quality can be reviewed without burying mistakes.
- Start each batch with an audit table: food id, food type, likely source, missing/weak fields, generic pro/con candidates, and expected verification commands.
- Run the `nutrition-geek` workflow before script generation so food data, provenance, estimates, and context items are cleaned first.
- Then run `foodranked-script-writer` or generator workflows so scripts follow the nutritional profile rather than stale generic copy.
- Keep `foods/`, `outputs/episodes/`, `docs/data/foods-index.json`, and `docs/data/foods-index.js` aligned for any food changed in the batch.
- Prefer web-page proofs for visual review; treat MP4s as final/export artifacts.

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
