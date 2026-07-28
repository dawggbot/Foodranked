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
2. big food image / food pixel art stamps in
3. spoken block: `SUBJECT!`
4. spoken block: `RANKED!` stamps in with the ranked sprite
5. transition into section 1

For narration-ready compact exports, the opening should be emitted as two separate ElevenLabs blocks:
- `SUBJECT!`
- `RANKED!`

Intro stamp rules:
- the food image stamp and ranked sprite stamp should feel symmetrical in weight
- each stamp can pulse while it is being stamped in, then must settle completely still
- the screen shake should happen after the sprite lands, not before
- bacon currently uses the custom header food image sprite and should appear quickly in the hook
- the ranked sprite carries 5 glimmer marks plus a sparkly glow; the effect should read shimmery rather than flat

## Permanent header

The header stays visible throughout the video and should contain:
- food name
- food image
- food type
- kcal
- per 100g label

Food-name display rule:
- on-screen food names always display number words as numerals, for example `Zero-Sugar` becomes `0-Sugar` and `Two` becomes `2`
- familiar food-name shorthand may be preferred when it is clearer and widely understood, for example `Barbecue Sauce` becomes `BBQ Sauce`, `Apple Cider Vinegar` becomes `ACV`, and `Extra Virgin Olive Oil` becomes `XTRA VIRGIN OLIVE OIL`
- header food names should prefer the full or very lightly abbreviated name; shrink the food-name font dynamically for longer names before falling back to heavier abbreviations
- when the header food-name font shrinks, anchor it to the bottom-left of the textbox so it still sits on the food-name line sprite
- header food type titles keep a constant font size; abbreviate the displayed type label so it fits inside the existing textbox

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

Timing rule:
- finished FoodRanked videos must stay at or below 180 seconds
- the video builder should insert a 0.5 second post-section dwell after every section except the final verdict/outro
- preview audio should be on by default, pause during each dwell, then resume with the next section

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
- pros/cons bullet text should be bite-sized source titles, capped at 64 characters and verified to fit the 3-line layout-builder textboxes

## Closing structure

Ending should include:
- a compact closing summary of the best strengths and worst weaknesses from all 7 scored content sections
- what the food is good for and why, using evidence-derived use cases such as energy, endurance sports, muscles, strength sports, hormone health, bone health, digestion, immune support, heart health, fluid balance, low-calorie volume, low-calorie flavour swaps, practical meals, cooking use, or narrow use cases
- no narrated overall score
- final `S-D tier` reveal as its own spoken block (for example `C tier.`)
- big stamped-in letter under the header on an emptier background

Outro stamp rules:
- the tier stamp uses the same heavy stamp language as the intro
- the pulse happens during the stamp-in only
- after the tier sprite has landed, screen shake can briefly shake the stage to sell impact
- the sprite should remain still after the stamp/pulse/shake finishes

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
- stamp motion should feel weighty enough to read on mobile, but should settle cleanly so screenshots/export frames are stable
- sparkle/glimmer effects should enhance ranked/tier sprites without turning the whole video into a busy particle field

## Reusable audio assets

Reusable SFX source files live in the top-level `audio/` folder:

- stamp impacts: `audio/sfx/stamps/`
- section-specific reveal accents: `audio/sfx/sections/`
- section transitions: `audio/sfx/transitions/`
- general UI-style clicks/ticks: `audio/sfx/ui/`
- music beds/stingers: `audio/music/`

Generated narration stays episode-specific in `production/episodes/<food-id>/voice/`, with browser-preview mirrors in `docs/audio/episodes/<food-id>/`.

If the video builder needs to load reusable SFX on GitHub Pages, mirror browser-ready files into `docs/audio/sfx/`.

Current stamp impact SFX:

```text
audio/sfx/stamps/impact_stamp_hit.mp3
docs/audio/sfx/stamps/impact_stamp_hit.mp3
```

Food entries may override reusable SFX through `episode.sfxProfile`. Video Builder v2 should use `stampImpact.path`, `sectionTransition.path`, and `highlightGlow.path` from that profile when present, then fall back to the default constants. `sectionTransition.volume` may lift quieter transition files; values above `1` use a gain boost. The paths are browser-facing `audio/sfx/...` paths and must have matching mirrors under `docs/audio/sfx/...`.

The video builder plays this slightly before the stamp impact point so the hit is audible as the sprite lands. The outro stamp SFX is allowed to finish even when playback naturally reaches the end of the timeline.

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

Generated website data exposes split narration as `episode.splitAudio`, including each block path, offset, and duration. The video builder should prefer that timed split take when available, while keeping `episode.audio` available for older single-file takes.

Rules:
- one spoken block per section
- abbreviations like `DV` should be spoken as `daily value`
- measurement abbreviations in audio should be expanded to full unit words, for example `3g` becomes `3 grams`; on-screen subtitles and stat values should keep short units and avoid full unit words like `grams`
- score-style ratios in audio should be expanded as spoken ratios, for example `8/9` becomes `8 out of 9`; subtitles and stat values should keep compact ratios like `8/9`
- fats, carbs, and proteins narration should aim to mention two displayed submacro values from that section whenever two defensible values exist: the strongest visible indicator and the weakest or lowest visible indicator; for arrow submacros, stronger green/red arrow bands outrank raw weighted score when choosing what sounds outstanding
- skip `N/A` or weakly sourced values, and do not use protein headline grams as the protein submacro or pad missing rows into narration just to hit two items; outside meats, do not use collagen as the weak protein callout when bioavailability or another protein-quality mark is available
- narration should be direct and easy to process at phone speed: short sentences, one idea per sentence, practical wording, and no abstract phrasing that makes the viewer decode the point
- macro narration should add a very brief benefit or drawback phrase for selected outstanding submacros, for example what fibre, polyunsaturated fat, omega-3, amino-acid quality, glycemic load, or saturated fat is good or bad for
- macro narration should end with a quick summary of why the mentioned scores matter to the food type, for example fat quality for meats/oils/nuts/seeds, carb behaviour for grains/fruits/legumes/tubers, or protein quality for meats/dairy/legumes
- worst outstanding explanations should stay short and food-type based, for example whether the weak point matters for meats, grains, vegetables, or another category
- vitamins and minerals follow the same strongest-plus-weakest pattern for DV-backed values when defensible values exist; each section should end with a quick food-type summary explaining why the mentioned vitamin or mineral scores matter to that category; if every vitamin mark is low, the section may group them as all-round low while still explaining which vitamins matter for the food type
- the closing summary should synthesize strengths and weaknesses from across the video, then say what the food is good for and explain why before the final tier reveal; normally surface the top one or two evidence-led use cases so the verdict stays simple
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
