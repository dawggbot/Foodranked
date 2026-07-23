# Kale Voice

Use `final-narration.txt` as the review draft for finalisation sample voice generation.

Suggested notes to track:
- chosen voice
- speed
- delivery style
- retake notes

## Current take

- `voice-v3` split blocks use ElevenLabs `Adam - Dominant, Firm` (`pNInz6obpgDQGcFmaJgB`).
- `voice-v3` keeps the `voice-v2` opener fix (`Kale.`) and regenerates only the final reveal MP3 with the TTS prompt `S. Tier!`, while the stored/display text stays `S tier.`.
- Generation keeps the fixed FoodRanked settings from `config/elevenlabs-voice-settings.v1.json`.
- Forced alignment lives at `outputs/episodes/kale-compact/voice-v3-blocks-forced-alignment.json`.
