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

## Suggested ElevenLabs defaults
- speed: **1.15x**
- style: clear, confident, lightly punchy
- tone: fair, not preachy
- pauses: keep section breaks audible, but do not over-pause
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
