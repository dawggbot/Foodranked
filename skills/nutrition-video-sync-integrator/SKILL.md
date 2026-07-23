---
name: "nutrition-video-sync-integrator"
description: "Sync FoodRanked narration, subtitles, split audio, reveal timing, trigger highlights, VFX/SFX, and Video Builder v2 playback."
---

# Nutrition Video Sync Integrator

Use this skill when creating or fixing FoodRanked narration-to-video integration: split narration audio, section timing, subtitles, word highlights, trigger-word animations, stat reveals, VFX/SFX cues, and final tier-reveal pacing in Video Builder v2.

## Scope

- Work in the FoodRanked repo root: `/home/idk/.openclaw/workspace/Foodranked`.
- For video builder implementation changes, edit `docs/video-builder-v2/` only unless James gives explicit one-time permission to touch another builder.
- Do not edit `docs/video-builder/`; the original video builder is locked unless James explicitly unlocks it.
- Preserve the Display Builder v2 placement contract. Video Builder v2 should use Display Builder v2 layout data and should not silently fall back to original/default placement when DBv2 data is missing.
- Keep scoring, nutrition, and narration rules aligned with the FoodRanked source docs. Do not change scoring behavior while fixing sync unless the user explicitly asks.

## Read First

Open only the relevant files for the current task, usually in this order:

- `VIDEO-FORMAT.md` for the 9-section shell, visual sequence, dwell rules, stamp rules, and SFX paths.
- `NARRATION-AUDIO-SCHEMA.md` for split audio block ids, output paths, alignment files, and dashboard sync.
- `SCRIPT-SCHEMA.md` for canonical narration block order and speech/subtitle format.
- `EPISODE-MANIFEST-SCHEMA.md` for timing/alignment source-of-truth rules.
- `NARRATION-STYLE.md` for narration wording constraints, especially opener and final tier line.
- `skills/nutrition-pixel-ui-director/SKILL.md` when changing visual layer behavior, sprite timing, subtitles, or reveal choreography.
- `references/video-sync-validation.md` from this skill when validating changes.

## Locked Video Structure

- Keep the 9-section shell: intro, fats, carbs, proteins, vitamins, minerals, pros, cons, outro.
- Keep the 7-section scoring body: fats, carbs, proteins, vitamins, minerals, pros, cons.
- The opener is always split into separate narration blocks: `FOOD!`, pause marker, `RANKED!`.
- The final reveal is always a separate final narration block: `X tier.`
- The final tier line must not be folded into the closing summary.
- Overall score is display-only and must not be spoken.
- On-screen food names and stat values use compact display wording and units. Spoken narration expands measurement units.
- Generated subtitles must stay at no more than 2 lines per cue.

## Split Audio Workflow

Prefer split narration audio when it exists, with full-audio playback as the timing authority.

Canonical commands when regenerating audio or alignment:

```bash
node scripts/foodranked-generate-voice.js <food-slug> --take <take-id> --split-blocks
node scripts/foodranked-align-subtitles.js <food-slug> --take <take-id> --refresh
node scripts/generate-dashboard-data.js
```

Expected split block ids are:

```text
01-hook_food
02-hook_ranked
03-fats
04-carbs
05-proteins
06-vitamins
07-minerals
08-pros
09-cons
10-closing_summary
11-final_reveal
```

Integration rules:

- Prefer `episode.splitAudio` and timed blocks from dashboard data.
- Keep `episode.audio` as fallback only when split audio is absent.
- Use forced-alignment word timings when available.
- Use audio metadata durations when available to prevent early section transitions.
- If timing estimates and audio duration disagree, guard toward letting the full audio file play.
- Never advance to the next section before the active section's audio block has finished.
- Section dwell happens after audio completion, not by cutting audio short.

## Timeline Pacing

- Non-outro sections have a short dwell after their narration. Use the project default from `VIDEO-FORMAT.md` unless the task updates it.
- Recent v2 outro pacing preference: leave 1 second between the final summary finishing and the tier reveal beginning.
- Recent v2 outro pacing preference: leave a 2 second window after the final tier reveal audio finishes.
- Treat these outro values as Video Builder v2 behavior until James changes them again.
- The final tier reveal should begin on the final `X tier.` audio block, not during the closing summary.
- The tier stamp/SFX/VFX timeline must allow the final reveal audio to play out fully and then dwell naturally.

## Subtitle And Caption Rules

- Subtitles are the only on-screen body text over narration.
- Use forced-aligned word timing for caption highlight when available.
- Keep cues short enough to fit, with a maximum of 2 lines.
- Compact units remain on screen; expanded units belong only in spoken audio.
- Pros and cons subtitles should include the displayed pro/con title spoken word-for-word before the explanation.
- Before the final tier stamp animation plays, clear or suppress the previous closing-summary subtitles.
- During the tier stamp payoff, suppress the normal tier caption if the stamped tier text is the intended on-screen reveal.
- Do not leave stale summary captions visible under or behind the tier reveal.

## Trigger Words And Reveal Mapping

Map narration words to visual events only when the timing source supports it, and keep fallbacks deterministic.

Intro:

- Trigger the food-image stamp on the spoken food name block, usually `01-hook_food`.
- Trigger the `RANKED` stamp on `02-hook_ranked`.
- Match the stamp timing and SFX style used by the existing intro implementation.

Body sections:

- Reveal section metrics progressively with narration.
- Macro and submacro reveals should align with the named nutrient/submacro when word timings are available.
- Submacro labels, values, cards, and arrow indicators should reveal together.
- Micronutrient icons/labels appear first, then bars reveal together in stepped levels.
- Highlight the current narrated item, then let highlight state clear at the section end.
- Use binary micron glow behavior unless a current project rule says otherwise: below 10 percent daily value red, 10 percent daily value or above green.

Outro:

- Let the closing summary finish first.
- Clear subtitles during the breathing-room gap.
- Trigger the tier stamp with the final reveal block, `11-final_reveal`.
- Use the same animation speed, SFX feel, and stamp energy as the intro food-image and `RANKED` stamp animations.
- The tier stamp should land quickly, shake on impact, pulse only on entry, then settle still.

## VFX And SFX Rules

- Reuse project SFX paths defined in `VIDEO-FORMAT.md`.
- Browser-facing SFX should use the `docs/audio/sfx/...` mirror paths.
- The stamp impact SFX is `docs/audio/sfx/stamps/impact-stamp-hit.mp3` for browser playback.
- Play stamp SFX slightly before visual impact when that matches the existing intro feel.
- SFX must not truncate narration audio.
- Outro stamp SFX may finish at the natural timeline end.
- Do not make the tier reveal slower than the intro stamp animations unless James explicitly requests a different style.

## Implementation Approach

1. Check `git status --short --branch` before editing.
2. Confirm the request targets Video Builder v2 when builder code is involved.
3. Locate the exact v2 timing, audio, subtitle, and animation code paths before changing behavior.
4. Preserve existing public data shapes unless the task requires a schema update.
5. If changing split-audio handling, verify both split-audio and single-audio fallback behavior.
6. If changing animation timing, compare it against the intro food/ranked stamp constants and reuse those constants when possible.
7. If changing captions, verify summary captions, section captions, and tier-reveal caption suppression.
8. Keep edits scoped to Video Builder v2 and the smallest supporting data/docs needed.
9. Run syntax/static checks and a browser smoke test when behavior depends on real playback.
10. Commit and push meaningful FoodRanked project changes when ready, following repo discipline.

## Common Failure Modes

- A section changes before its split MP3 finishes.
- Duration logic uses estimated text length instead of actual audio metadata when metadata exists.
- Section dwell is counted from section start instead of audio end.
- The closing summary and tier reveal share a scene, causing the final audio to be cut off.
- The tier stamp animation is stretched across the whole outro scene and appears slow.
- The tier reveal starts while summary subtitles are still visible.
- VFX/SFX playback interrupts narration or resets the audio element.
- Video Builder v2 silently uses original builder layout behavior.
- Fresh browser validation shows `DBv2 missing`; this can be expected without a seeded Display Builder v2 export, but must not be mistaken for a successful layout fallback.

## Validation

Use `references/video-sync-validation.md` for the full checklist. At minimum, run:

```bash
node --check docs/video-builder-v2/video-builder-v2.js
git diff --check -- docs/video-builder-v2/index.html docs/video-builder-v2/video-builder-v2.js
```

For browser behavior, serve the docs directory or repo root locally and use Playwright to verify:

- Split audio mode is selected when available.
- Each section's audio block reaches its end before the next section starts.
- Captions show during the closing summary, then disappear before the tier stamp.
- The tier stamp appears only during the final reveal.
- The tier reveal uses fast intro-style stamp timing.
- The final tier audio completes and the post-tier dwell window remains visible.

## Reporting Back

When done, summarize only the changed v2 behavior, the checks run, and any limitations. If DBv2 data had to be seeded for validation, say that clearly. Do not imply the original video builder was changed.
