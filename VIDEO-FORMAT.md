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

## Section structure

There are 7 sections in order:

1. fats + fat submicros
2. carbs + carb submicros
3. proteins + protein submicros
4. vitamins
5. minerals
6. pros
7. cons

## Progress indicator

- 7 small dots near the bottom
- current section is highlighted
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
- brief summary of strengths, weaknesses, and uses
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

<one spoken block per section>

-

<closing summary>

-

<X tier.>
```

Rules:
- one spoken block per section
- abbreviations like `DV` should be spoken as `daily value`
- pros/cons should keep all 3 items each when possible
- on-screen body text should remain subtitle-driven

## Open questions
- How locked are the exact timings for each section?
- Which visual elements are permanent versus category-specific?
- Which vitamins/minerals are always shown versus selectively shown?
- How much of the final closing wording should stay formulaic versus food-specific?
