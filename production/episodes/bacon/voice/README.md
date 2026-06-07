# Bacon Voice

Place narration scripts, ElevenLabs exports, and timing notes here.

Current automated take:
- `voice-v2.mp3` - generated with `config/elevenlabs-voice-settings.v1.json`
- `voice-v2.json` - non-secret generation metadata
- `final-narration.txt` - narration text used for the current generated take

Split-block take workflow:

```bash
node scripts/foodranked-generate-voice.js bacon --take voice-v7 --split-blocks
node scripts/foodranked-align-subtitles.js bacon --take voice-v7 --refresh
```

This creates one MP3 per locked narration block, then aligns each block separately before stitching the subtitle timeline back together.

Suggested notes to track:
- chosen voice
- speed (e.g. 1.15)
- delivery style
- retake notes
