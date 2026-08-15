# Narration Ops

Use this as the default workflow for launch narration production.

## Source of truth
For voice generation, use:
- `production/episodes/<slug>/voice/final-narration.txt`

Do not use older generated script text if it disagrees with the voice file.

## Narration text format
Use this exact structure when a script is being prepared for narration tooling:
- food name on its own line in caps with `!`
- then `-`
- then `RANKED!`
- then `-`
- then one spoken block per section
- each block separated by a line containing only `-`
- final line should be the tier in caps like `D TIER!`

For spoken nutrition abbreviations:
- say `daily value`, not `DV`
- prefer fully spoken wording when abbreviations could confuse viewers

## Launch 5 queue
1. bacon
2. rice-cakes
3. regular-cola
4. extra-virgin-olive-oil
5. salmon

## ElevenLabs generation defaults

Use `config/elevenlabs-voice-settings.v1.json` as the source of truth. The model, output format, and voice settings stay fixed for all generated FoodRanked narration:

- model: `eleven_multilingual_v2`
- output: `mp3_44100_128`
- stability: `50%`
- similarity boost: `75%`
- style: `10%`
- speaker boost: enabled
- speed: `1.15x`

Keep `1.15x` as the constant FoodRanked narration speed for all new episodes and replacement takes. Keep 180 seconds as a review flag, but do not introduce per-video speed variation.

The legacy `--over-limit-speed` flag remains accepted for older commands, but it uses the same locked `1.15x` speed. The voice tool records the measured narration duration and whether the take is within the policy.

The voice can change per video. Default generation uses `random_suitable`, which chooses a clear, relatively professional English voice from ElevenLabs and avoids silly, character-style, or very strong-accent reads. Use `--profile <id>` or `--voice-id <id>` only when a voice needs to be pinned.

Tone notes still apply across voices:
- clear, confident, fair
- lightly punchy, not overhyped
- assume no prior nutrition knowledge: keep the general wording simple and explain necessary nutrition terms in plain English
- avoid technical words and abstract phrases unless they are real nutrition terminology that teaches the viewer something useful
- keep section breaks audible, but do not over-pause
- final line: `X tier.` should sound like a hard stop

## File naming
Inside each `production/episodes/<slug>/voice/` folder:
- `final-narration.txt` — approved script
- `voice-v1.mp3` — first usable export
- `voice-v2.mp3` — revised export if needed
- `voice-notes.md` — notes on speed, voice, retakes, and best take

## Review checklist
Before accepting a take:
- opener is clean and immediate
- submacro words are pronounced clearly
- no section feels rushed or dragged
- final summary sounds natural aloud
- final `X tier.` lands cleanly
- no extra spoken content after the tier line

## If a line sounds off in voice
Prefer fixing the script in `final-narration.txt`, then regenerate/re-record, instead of keeping hidden ad-lib differences.

## Pros and cons rule
Do not use pros/cons to repeat what the fats, carbs, proteins, vitamins, or minerals sections already said.
Use pros/cons for extra information instead, such as:
- antioxidants or polyphenols
- fermentation or probiotic angle
- absorbability or anti-nutrients
- processing burden
- sourcing / authenticity / contamination risk
- tolerance / digestion / practicality
- satiety / meal role / convenience

When narrating pros and cons, speak the exact displayed pro/con title first, word for word. Add the explanatory "after bulk" sentence only after that displayed phrase has been spoken.
