# Kale Voice

Use `final-narration.txt` as the review draft for finalisation sample voice generation.

Suggested notes to track:
- chosen voice
- speed
- delivery style
- retake notes

## Current take

- `voice-v4` is the current VBv2 take.
- `voice-v4` keeps the `voice-v3` timing-tail fix and replaces only `11-final_reveal`.
- The `voice-v4` final reveal uses TTS prompt `Ess tier!`, while the stored/display text stays `S tier.`, so Adam gives the letter `S` a clearer start.
- The `11-final_reveal` block stores `mediaDurationSeconds: 0.929`; use the full MP3 duration for VBv2 timing.

## Previous take

- `voice-v3` split blocks use ElevenLabs `Adam - Dominant, Firm` (`pNInz6obpgDQGcFmaJgB`).
- `voice-v3` keeps the `voice-v2` opener fix (`Kale.`) and regenerates only the final reveal MP3 with the TTS prompt `S. Tier!`, while the stored/display text stays `S tier.`.
- The `11-final_reveal` block stores `mediaDurationSeconds: 0.882`; use the full MP3 duration for VBv2 timing so the end of Adam's `S tier` reveal is not clipped.
- Generation keeps the fixed FoodRanked settings from `config/elevenlabs-voice-settings.v1.json`.
- Forced alignment lives at `outputs/episodes/kale-compact/voice-v3-blocks-forced-alignment.json`.
