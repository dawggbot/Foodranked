# FoodRanked Video Sync Validation Checklist

Use this checklist when validating narration-to-video sync, especially after changes to Video Builder v2 timing, captions, audio playback, reveal mapping, or VFX/SFX.

## Static Checks

```bash
git status --short --branch
node --check docs/video-builder-v2/video-builder-v2.js
git diff --check -- docs/video-builder-v2/index.html docs/video-builder-v2/video-builder-v2.js
```

If supporting scripts changed, run the smallest relevant script checks too.

## Data Checks

Confirm the current episode data includes, when available:

- `episode.audio` fallback path.
- `episode.splitAudio` paths for all expected blocks.
- Aligned subtitle cues.
- Word timings or block timings derived from forced alignment.
- Scene timing that maps back to the 9-section shell.

Expected split block ids:

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

## Browser Smoke Test

Start a local server from the repo when the page needs browser APIs:

```bash
python3 -m http.server 8123 --bind 127.0.0.1
```

Open Video Builder v2 and verify these runtime facts with Playwright or a browser probe:

- Video Builder v2 loads without JavaScript errors.
- Display Builder v2 layout data is present, or the UI clearly reports `DBv2 missing` without using original-builder fallback.
- Split-audio mode is selected when split audio exists.
- The intro food stamp triggers from the food-name audio block.
- The `RANKED` stamp triggers from the ranked audio block.
- Body section reveal highlights follow narration timing closely enough to feel intentional.
- Section captions never exceed 2 lines.
- Section captions clear at section boundaries.
- Closing-summary subtitles are visible while the summary is spoken.
- Closing-summary subtitles disappear before the tier stamp animation begins.
- The tier stamp appears only for the final reveal block.
- The tier stamp uses the same fast timing feel as the intro stamp animations.
- The tier reveal audio plays to completion.
- The post-tier dwell window remains visible after final audio completion.

## Timing Measurements

When probing computed timing, check:

- Non-outro sections end no earlier than their active audio block duration.
- Section dwell starts after audio completion.
- Summary-to-tier breathing room is currently 1 second in Video Builder v2.
- Post-tier dwell is currently 2 seconds in Video Builder v2.
- Stamp reveal duration uses intro stamp timing constants rather than the whole outro scene duration.

## Regression Traps

Watch for these before signing off:

- Old summary subtitles remain visible under the tier reveal.
- Tier captions duplicate the tier stamp text.
- SFX playback resets or pauses narration audio.
- Audio transitions are driven by stale text estimates instead of actual metadata.
- Single-audio fallback is broken while split-audio playback works.
- Video Builder v2 code imports or mutates original video builder code.
- A fresh browser test is treated as passed even though `DBv2 missing` blocked layout-dependent assertions.
