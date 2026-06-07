# Narration

Generated episode voiceover should stay with the episode:

- `production/episodes/<food-id>/voice/`
- `docs/audio/episodes/<food-id>/`

Use this folder only for reusable narration notes, voice references, or manually supplied voice assets that are not tied to one generated episode.

Current generated narration workflow:

```bash
node scripts/foodranked-generate-voice.js <food-id> --take voice-v7 --split-blocks
node scripts/foodranked-align-subtitles.js <food-id> --take voice-v7 --refresh
node scripts/generate-dashboard-data.js
```
