# Narration

This folder is the GitHub-facing narration section.

Generated episode voiceover MP3s stay in their production and docs mirror locations so Video Builder v2 can keep using stable paths:

- `production/episodes/<food-id>/voice/`
- `docs/audio/episodes/<food-id>/`

The organized catalogue of generated narration files lives in:

- `audio/narration/episodes/README.md`
- `audio/narration/episodes/index.json`
- `audio/narration/episodes/<food-id>.md`

Use this folder for reusable narration notes, voice references, manually supplied voice assets, and generated narration indexes.

Current generated narration workflow:

```bash
node scripts/foodranked-generate-voice.js <food-id> --take voice-v7 --split-blocks
node scripts/foodranked-align-subtitles.js <food-id> --take voice-v7 --refresh
node scripts/generate-dashboard-data.js
node scripts/generate-narration-index.js
```
