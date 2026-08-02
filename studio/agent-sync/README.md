# FoodRanked Agent Sync

Agent Sync is a local-only pull workflow. The installed Studio app fetches this
index from GitHub, shows available jobs, and runs only approved local actions.

Default index URL:

```text
https://raw.githubusercontent.com/dawggbot/Foodranked/main/studio/agent-sync/index.json
```

Supported job actions:

- `upsertFood`: adds or updates a Studio input food entry. Jobs can include IDs,
  display fields, food type, kcal, metrics, episode data, script text,
  narration text, subtitles, and food patches.
- `upsertScript`: updates script/narration fields for an existing or new food.
- `downloadAsset`: downloads a repo/GitHub asset into the app's local
  `studio-data/uploads/` folder. Use `kind: "image"` for PNG food sprites,
  `kind: "narration"` for MP3/WAV/M4A narration, or `kind: "split-audio"` for a
  split-audio manifest.
- `exportPngs`: exports DBv2 section stills locally.
- `renderMp4`: starts a local VBv2 MP4 render from fresh DBv2 placement; use
  `options` for renderer fields like `seconds`, `fps`, or `noAudio`.
- `selectFood`: selects a food ID as context for later actions.

Jobs should not contain arbitrary commands. They are data instructions for the
Studio backend.
