---
name: "nutrition-video-sync-integrator"
description: "Render and publish VBv2 MP4s without browser recording."
---

# nutrition-video-sync-integrator

Use this skill when FoodRanked work involves VBv2 video timing, direct MP4 export, published video artifacts, audio/subtitle alignment, or making the website download an existing video file rather than recording the browser.

## Core Rule

VBv2 downloads must be direct downloads of already-published MP4 files. Do not solve download requests by screen recording, `getDisplayMedia`, `canvas.captureStream`, or browser `MediaRecorder` unless James explicitly asks for a recording-based prototype.

## Published MP4 Contract

Published videos live at:

```text
docs/video/episodes/<food-id>/<food-id>-vbv2.mp4
```

The VBv2 `Download MP4` button should check for that file, enable only when it exists, and download it directly with an `<a download>` link. If the file is missing, the UI should say no published MP4 exists rather than recording the preview.

## Renderer Workflow

1. Ensure the episode is current:
   - regenerate script/manifest when narration changed,
   - generate or choose the active split audio take,
   - run forced alignment,
   - refresh `docs/data/foods-index.*`.
2. Render the VBv2 timeline offline from local source-of-truth assets.
3. Encode H.264/AAC MP4 at 9:16, normally `1080x1920` and 30 fps.
4. Write the final file to `docs/video/episodes/<food-id>/<food-id>-vbv2.mp4`.
5. Verify the file exists, has nonzero size, and VBv2 enables `Download MP4` for that food.
6. Use Playwright to confirm the download button starts a direct file download and does not invoke screen/canvas recording.

## Guardrails

- Preserve sprites, layer coordinates, subtitles, reveal timing, and audio mix from VBv2 unless James asks for visual changes.
- Treat missing sprites as render blockers unless there is an approved fallback already used by VBv2.
- Keep downloaded files in MP4 format.
- Do not invent or fake a published MP4; if a renderer cannot complete, say what is missing.
- Commit both the renderer changes and any published MP4 artifacts when James asks for a finished downloadable video.
