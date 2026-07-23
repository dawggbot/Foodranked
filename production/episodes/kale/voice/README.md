# Kale Voice

Use `final-narration.txt` as the review draft for finalisation sample voice generation.

Suggested notes to track:
- chosen voice
- speed
- delivery style
- retake notes

## Current take

- `voice-v2` split blocks use ElevenLabs `Adam - Dominant, Firm` (`pNInz6obpgDQGcFmaJgB`).
- `voice-v2` regenerates the opener block with calmer punctuation (`Kale.`) to avoid Adam adding an extra vowel after the food name.
- Generation keeps the fixed FoodRanked settings from `config/elevenlabs-voice-settings.v1.json`.
- Forced alignment lives at `outputs/episodes/kale-compact/voice-v2-blocks-forced-alignment.json`.
