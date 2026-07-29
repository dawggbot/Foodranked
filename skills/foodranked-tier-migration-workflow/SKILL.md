---
name: "foodranked-tier-migration-workflow"
description: "Reusable FoodRanked tier migration workflow"
---

# FoodRanked Tier Migration Workflow

Use this workflow when adding, renaming, resizing, retiring, or otherwise changing a FoodRanked tier.

## Scope

A tier change usually crosses these surfaces:

- Scoring constants and tier mapping.
- Category rulesets and calibration matrix.
- Generated batch results, compact episode outputs, leaderboards, and dashboard data.
- Display Builder v2 tier sprite and score display binding.
- Video Builder v2 tier sprite, reveal timing, SFX routing, renderer SFX events, and visual effects.
- Narration/script final reveal text and subtitle verifier rules.
- Public docs/specs that describe tier ranges and public score values.
- Browser smoke checks for at least one affected food and one nearby unaffected food.

## Procedure

1. Check repo state with `git status --short --branch` and preserve unrelated dirty files.
2. Read relevant docs/source files before editing: scorer, audit, generator, rulesets, DBv2, VBv2, narration verifier, and relevant spec docs.
3. Update scorer tier constants, score clamps, threshold mapping, and public tier score map.
4. Update every `rulesets/*.v1.json` and `config/calibration-matrix.v1.json` with the same thresholds and `tierScoreMap`.
5. If the tier should capture special real-world cases, add explicit source-food score adjustments with clear labels/reasons rather than distorting base section math.
6. Regenerate score batch and public data: `foodranked-score-all.js`, copied docs batch results, leaderboards, and dashboard data.
7. Regenerate only affected compact episode outputs where possible. Avoid broad output regeneration that overwrites already forced-aligned/synced manifests for unrelated approved episodes.
8. Update script/narration logic so final reveal text follows the actual final tier and stale overrides cannot keep an old tier.
9. Update `verify-narration-subtitles.js` to allow any new final reveal form.
10. Wire sprites in DBv2 and VBv2 with tier normalization, labels, aspect ratios, and cache-busted script URLs.
11. For VBv2 SFX, update both live playback events and `FoodRankedVBv2Renderer.sfxEvents()` so preview and renderer agree.
12. Add or adjust visual effects narrowly for the new tier without moving unrelated canvas/text layers.
13. Generate/sync narration for any final approved episode affected by the tier rename or final reveal wording. Use split blocks, force alignment, dashboard regeneration, and narration/subtitle verification.
14. Run focused checks: JS syntax, generated-data audit, narration/subtitle verifier for affected foods, pro/con title fit when copy changed, `git diff --check`.
15. Run Playwright smoke checks through DBv2/VBv2 for the affected tier and a nearby normal-tier control. Assert sprite path, tier, score, audio status, and SFX event kinds.
16. Stage only relevant files. Leave unrelated memory/skill edits untouched unless James explicitly asked to include them.
17. Commit and push meaningful project changes.

## Guardrails

- Keep score math defensible. Do not make a whole tier change just to fix one food if a targeted anomaly adjustment is clearer.
- Keep `S` rare among normal letter tiers. If a special bottom tier exists, keep it no more common than S unless James explicitly changes the rarity philosophy.
- Do not let a broad regeneration damage approved split-audio timings. If it does, restore unrelated episode output folders before committing.
- Do not trigger broken MP4 export/download workflows unless James explicitly reopens that task.
- When changing final reveal wording, keep display text, subtitles, and TTS overrides intentionally separate if pronunciation needs it.

## Verification Pattern

Use a paired smoke test:

- A target food in the changed tier, e.g. Regular Cola for Slop.
- A nearby unaffected control food, e.g. Banana for D.

Check both Display Builder v2 and Video Builder v2:

- Correct tier and public score data.
- Correct sprite file and aspect ratio.
- Correct final reveal text/subtitle.
- Correct SFX event kinds and paths.
- Synced split audio status when narration was regenerated.
