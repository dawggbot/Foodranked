# SCRIPT-GENERATOR-PLAN

## Current role

The script generator is now the narration layer between:
- food identity + readiness metadata
- scorer output
- ElevenLabs-ready narration blocks
- episode packaging

Main command:

```bash
node scripts/foodranked-generate-script.js foods/bacon.sample.json
```

## What the old system already did well

- kept the 7-section video order consistent
- generated compact narration that already sounded close to the intended voice
- made batch episode generation possible

## What needed updating

- the surrounding schema had drifted behind the newer scorer output
- some manifest fields still referenced removed score fields
- pros/cons display payloads still exposed dead `scoreValue` assumptions
- the ElevenLabs block structure was implicit rather than first-class
- a few narration heuristics had started making the wrong emphasis call for some foods, like bacon fats

## Current design

The updated generator should:
- treat `elevenlabs-blocks-v1` as a first-class narration format
- emit `narrationBlocks[]` in script output
- carry `identity`, `scoreReadiness`, and `sourceNotes` with the script payload
- use current scorer fields like `overallScoreExact`, strongest/weakest sections, and resolved context items
- stay deterministic enough for batch runs

## Locked section order

1. fats
2. carbs
3. proteins
4. vitamins
5. minerals
6. pros
7. cons
8. closing summary
9. final tier reveal

## Compact narration target

The compact narration path should sound like:

```text
Bacon!

-

Ranked!

-

<section spoken block>

-

<section spoken block>

-

...

-

<closing summary>

-

<D tier.>
```

## Success condition

The system is ready to generate all scripts when:
- script JSON stays aligned with the current scorer
- the compact narration file matches the required spoken block layout
- launch-lane foods generate cleanly without hand-fixing the structure afterward
