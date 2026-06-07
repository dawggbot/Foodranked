# VIDEO-FORMAT

This file describes the current FoodRanked video structure.

## Core identity
- short-form vertical video
- cozy pixel-art aesthetic
- cheery / cozy 8-bit background music
- nutrition info revealed in sync with narration
- word-highlighting subtitles for retention
- overall feel: RPG stat sheet / Pokédex entry

## Scope assumptions
- one food per video
- foods are not restricted to wholefoods only
- judged per 100g

## Opening hook

Sequence:
1. blurred background
2. big food image / food pixel art
3. spoken block: `SUBJECT!`
4. spoken block: `RANKED!`
5. transition into section 1

For narration-ready compact exports, the opening should be emitted as two separate ElevenLabs blocks:
- `SUBJECT!`
- `RANKED!`

## Permanent header

The header stays visible throughout the video and should contain:
- food name
- food image
- food type
- kcal
- per 100g label

## Video section structure

There are 9 video sections in order:

1. intro hook
2. fats + fat submicros
3. carbs + carb submicros
4. proteins + protein submicros
5. vitamins
6. minerals
7. pros
8. cons
9. final verdict / outro

The middle 7 sections are the scored content sections.

## Progress indicator

- 9 small dots near the bottom
- current section is highlighted
- intro and outro count as progress positions
- should remain clear even on simpler / emptier background frames

## Reveal style

- stats are revealed as narration lists them off
- information should appear progressively, not all dumped at once
- the system should favour clarity on small screens
- subtitles must not clash with header or key stat areas
- only submacros in fats/carbs/proteins use arrow-indicator visuals
- vitamins and minerals use DV% bar-fill visuals, not arrow-indicator visuals
- pros and cons should end on exactly 3 bullet points each in the final output

## Closing structure

Ending should include:
- a super short overview of the best strengths and worst weaknesses
- no narrated overall score
- final `S-D tier` reveal as its own spoken block (for example `C tier.`)
- big stamped-in letter under the header on an emptier background

## Visual language

### Food-type identity
- each of the 11 food types should have its own colour palette
- this palette should influence the display and help category recognition

### Tier identity
Current tier colour direction:
- D = purple
- C = green
- B = red
- A = light blue
- S = platinum / gold

### Assets / sprite ideas already identified
Potential asset classes:
- arrow indicator sprites
- vitamin sprite(s)
- mineral sprite(s)
- pro bullet-point sprite
- con bullet-point sprite
- food type sprite
- major sprite
- minor sprite
- food image badge sprite

## Current polish / TODO themes from blueprint
- polish display for final cozy pixel aesthetic
- review thresholds if needed
- tidy files / structure
- make more supporting sprites and badges
- potentially redo early videos once final format is locked

## Practical design rules
- keep the header consistent
- keep the layout readable on phones
- use pixel-art decoration to enhance, not clutter
- keep reveals satisfying and rhythmic
- let the final tier reveal feel like a payoff

## Narration packaging

Compact narration exports should use the locked ElevenLabs block layout:

```text
FOOD!

-

RANKED!

-

<one spoken block per scored content section>

-

<closing summary>

-

<X tier.>
```

For cleaner takes, the same locked block order can be generated as separate audio files:

```bash
node scripts/foodranked-generate-voice.js <food-id> --take voice-v7 --split-blocks
node scripts/foodranked-align-subtitles.js <food-id> --take voice-v7 --refresh
```

Split-block audio keeps the exact same spoken text and block order, but each block gets its own MP3 and forced-alignment request. The subtitle aligner then stitches block word timings into one episode timeline with controlled gaps.

Rules:
- one spoken block per section
- abbreviations like `DV` should be spoken as `daily value`
- measurement abbreviations in audio should be expanded to full unit words, for example `3g` becomes `3 grams`; on-screen subtitles and stat values should keep short units and avoid full unit words like `grams`
- score-style ratios in audio should be expanded as spoken ratios, for example `8/9` becomes `8 out of 9`; subtitles and stat values should keep compact ratios like `8/9`
- fats, carbs, and proteins narration should aim to mention two outstanding displayed submacro values from that section: one of the best defensible visible indicators and one of the worst defensible visible indicators; for arrow submacros, stronger green/red arrow bands outrank raw weighted score when choosing what sounds outstanding
- skip `N/A` or weakly sourced values, and do not use protein headline grams as the protein submacro
- macro narration may add a very brief benefit/context phrase for the best outstanding submacro, for example what fibre, polyunsaturated fat, omega-3, or amino-acid quality helps with; keep it selective so sections stay snappy
- worst outstanding explanations should stay short and food-type based, for example whether the weak point matters for meats, grains, vegetables, or another category
- vitamins and minerals follow the same best-outstanding plus worst-outstanding pattern for DV-backed values when defensible values exist
- generated subtitle cues should be wrapped to a maximum of 2 lines, with a tight default line length so editor/import wrapping does not create a third line
- generated subtitle wrapping must keep decimal values intact, for example `37.1g` and `12.6g` must not become `37. 1g` or split across cue boundaries
- the closing summary should use a wider-but-safe centered `summary-full` subtitle placement across the page, then the final `X tier.` cue should use centered `tier-center` placement until a tier sprite replaces it
- the video builder preview should render from generated subtitle cues, not spoken narration blocks, so the visible captions keep `g` while audio says `grams`
- the video builder preview should calibrate scene timing to the loaded narration audio duration when audio metadata is available
- when forced-alignment metadata exists for a narration take, generated subtitles should carry per-word timing data and preview/export tools should use those timings for highlighted-word sync instead of estimated word weights
- pros/cons should keep all 3 items each when possible
- on-screen body text should remain subtitle-driven

## Open questions
- How locked are the exact timings for each section?
- Which visual elements are permanent versus category-specific?
- Which vitamins/minerals are always shown versus selectively shown?
- How much of the final closing wording should stay formulaic versus food-specific?
