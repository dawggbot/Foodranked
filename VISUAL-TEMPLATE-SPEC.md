# VISUAL-TEMPLATE-SPEC

## Purpose

Define the locked visual system for FoodRanked short-form videos before building timing automation.

This spec is for:
- layout
- reveal zones
- scene flow
- section templates
- subtitle safe areas
- sync assumptions
- sprite binding rules and builder configuration

It is **not** the final renderer.
It is the blueprint the renderer, timing planner, and animation system will follow.

---

# 1. Core visual identity

## Format
- **vertical 9:16**
- target canvas: **1080 x 1920**
- all coordinates in this doc assume 1080 x 1920

## Style
- cozy pixel RPG stat sheet
- Pokédex-like info framing
- bright but soft pixel palette
- high contrast for phone screens
- satisfying, crisp reveals
- restrained motion: lively, not chaotic

## Design priorities
1. food is the hero
2. header stays stable
3. reveals are progressive
4. subtitles never fight the stats
5. the final tier reveal feels like a payoff

---

# 2. Global screen zones

## Zone map

### A. Header zone
- **position:** top 0–300 px
- **purpose:** permanent identity strip
- **stays visible almost the entire video**

### B. Main stat stage
- **position:** roughly y 300–1320
- **purpose:** section-specific content appears here
- this is the main reveal canvas

### C. Subtitle safe zone
- **position:** roughly y 1320–1670
- **purpose:** word-highlight subtitles
- must remain visually clear in every section

### D. Progress + footer zone
- **position:** roughly y 1670–1920
- **purpose:** progress dots, end stamp space, breathing room

---

# 3. Permanent header template

## Header layout
The header should feel like a stat-card identity bar.

### Left block: food badge
- circular or rounded-square food image badge
- size: **160 x 160**
- x: 40–200
- y: 70–230
- includes:
  - food image / sprite
  - thin pixel border
  - category-colour frame accent

### Center block: food identity
- food name
- food type
- `per 100g`
- x: 230–760
- y: 70–230

#### Text hierarchy
- food name = biggest text in header
- food type = secondary coloured tag
- per 100g = small utility label

### Right block: kcal plate
- badge/card aligned top-right
- x: 790–1030
- y: 70–230
- contents:
  - big kcal number
  - small `kcal`

## Header behavior
- static position throughout video
- can pulse subtly when new section starts
- should not animate heavily after initial settle-in
- builder should expose profile-level controls for hook style, subtitle lift, and macro density without changing this locked structure

## Header background
- translucent dark pixel panel
- 85–90% opacity equivalent look
- enough contrast to survive any background art

---

# 4. Opening sequence

## Scene 0 — hook frame

### Visuals
- blurred pixel-art background based on food image / palette
- oversized food art in center
- text: **`SUBJECT ranked`**
- `ranked` word pops/flys in

### Layout
- food art centered, large
- title above or over lower third of hero image
- no dense stat UI yet

### Timing feel
- about **1.0–1.8s**
- enough to establish subject fast

### Transition out
- hero image scales down / fades
- blur clears into the regular layout
- header locks into place
- section 1 starts immediately after

---

# 5. Core episode scene stack

## Scene 1 — header settle + section 1
- header becomes permanent
- progress dots appear
- fats section begins

## Scene 2 — carbs
## Scene 3 — proteins
## Scene 4 — vitamins
## Scene 5 — minerals
## Scene 6 — pros
## Scene 7 — cons
## Scene 8 — summary + final tier stamp

This stack is locked.

---

# 6. Progress indicator

## Progress dots
- **7 dots total**
- centered horizontally near bottom
- y: around **1710**
- each dot corresponds to one section

## Dot states
- inactive = dim grey/palette shadow
- active = bright category-colour glow/fill
- completed = softer filled state

## Recommended dot sizing
- 22–28 px diameter each
- 18–24 px gap

---

# 7. Section template system

Each section uses the same overall frame, but different widgets.

## Common section frame
- top of section title band: y ~ 330
- main content area: y ~ 410–1250
- subtitle safe floor starts below
- macro sections can switch between `stacked`, `compact-stack`, and `hero-sprite` builder profiles, but slot order stays the same

## Section title chip
- small pixel plaque near upper-left of main stat stage
- shows section title:
  - fats
  - carbs
  - proteins
  - vitamins
  - minerals
  - pros
  - cons

---

# 8. Fats / carbs / proteins template

These three use the same visual skeleton.

## Layout

### Macro headline row
- large macro gram count
- sits near top of stage
- ex:
  - `FAT 49.2g`
  - `CARBS 18.1g`
  - `PROTEIN 25.8g`

### Submacro reveal slots
- **max 3 visible slots** on screen at once
- arranged vertically or staggered cards
- each slot contains:
  - metric label
  - arrow indicator sprite
  - value text

### Optional commentary badge
- one small tag under submacro group
- used for lines like:
  - `exactly what you want from a legume`
  - `everything else is lackluster`

## Slot design
Each submacro slot should include:
- icon / sprite stub at left
- metric name
- arrow indicator at right
- tiny value text below or beside label

## Arrow indicator visuals
- 3-tier positive and negative arrow states
- use cozy pixel arrow sprites
- red for bad direction, green for good direction
- never tiny enough to become unreadable

## Reveal behavior
- macro amount appears first
- then submacro slot 1
- then slot 2
- then slot 3 if needed
- avoid ever dumping more than 3 submacro cards at once

---

# 9. Vitamins template

## Layout
- no arrows here
- use **DV fill bars** or pixel meter capsules

## Display structure
- max **2 major vitamins** shown in a section by default
- each vitamin row includes:
  - vitamin name/icon
  - DV percentage
  - horizontal fill bar

## Supporting note area
- if only 1–2 vitamins matter, a small note can say:
  - `everything else is lackluster`

## Reveal order
- first vitamin bar
- second vitamin bar
- quick commentary pulse

---

# 10. Minerals template

Same structure as vitamins.

## Layout
- max **2 major minerals** highlighted by default
- DV bars only, no arrows

## Row contents
- mineral icon
- mineral name
- DV %
- fill bar

## Note behavior
- allow one short trailing note if the rest is weak

---

# 11. Pros template

## Goal
Pros should feel like payoff bullets, not technical stats.

## Layout
- 3 bullet rows, fixed
- each row contains:
  - pro sprite / badge
  - optional major/minor badge
  - exact text bullet

## Behavior
- reveal one bullet per narration beat
- keep text readable and large
- do **not** paraphrase in the visual layer; use the actual pro text

## Tone
- cozy but punchy
- feels like “wins” being tallied in an RPG menu

---

# 12. Cons template

Same as pros, but with different accent treatment.

## Layout
- 3 bullet rows, fixed
- each row contains:
  - con sprite / badge
  - optional major/minor badge
  - exact text bullet

## Colour treatment
- slightly harsher accent than pros
- still in-channel, not horror red neon

---

# 13. Subtitle system

## Safe area
- subtitles must live in **y 1320–1600** by default
- center aligned or slightly raised lower-third

## Subtitle style
- high contrast
- word highlighting allowed
- chunky pixel-safe font or pixel-compatible rounded font
- 2 lines max ideal
- 3 only in emergencies

## Rules
- never overlap progress dots
- never overlap pros/cons rows
- never overlap header
- if a section gets visually dense, subtitles rise slightly

---

# 14. Final summary + tier reveal scene

## Scene layout
- background becomes cleaner and emptier
- header remains at top
- summary text sits mid-lower stage
- giant tier stamp lands below header and above subtitle zone

## Tier stamp
- huge single letter:
  - S / A / B / C / D
- stamped into place with impact frame
- size should dominate the scene

## Tier colours
- D = purple
- C = green
- B = red
- A = light blue
- S = platinum/gold

## Animation feel
- impact pop
- small screen shake or pixel hit flash
- audio cue synced to stamp

---

# 15. Category palette application

Each episode inherits food-type colour identity.

## Palette usage areas
- header trim
- section chip
- progress active dot glow
- panel accents
- subtle background motifs

## Rule
Palette should guide identity, not overwhelm readability.

---

# 16. Asset classes required

## Asset path strategy
- use exported PNG and GIF files as the primary edit/runtime assets
- keep `.aseprite` sources alongside them as the fidelity reference and re-export source
- manifests and builders should point to both, with PNG/GIF first and `.aseprite` second
- do not invent parallel `app/assets` paths, bind directly to the real `sprites/` inventory

## Core universal assets
- panel corners / borders
- section title chips
- 7 progress dots states
- tier stamp set
- subtitle backing strip optional

## Metric assets
- arrow indicator sprites
- vitamin icon set
- mineral icon set
- macro label plaques

## Context assets
- pro bullet sprite
- con bullet sprite
- major badge
- minor badge

## Identity assets
- food image badge frame
- food-type icon set

---

# 17. Reveal slot schema

This is the important automation bridge.

Every section should expose fixed reveal slots.

## Fats / carbs / proteins
- `macro_headline`
- `submetric_1`
- `submetric_2`
- `submetric_3`
- `commentary_note`

## Vitamins / minerals
- `micronutrient_1`
- `micronutrient_2`
- `commentary_note`

## Pros / cons
- `bullet_1`
- `bullet_2`
- `bullet_3`

## Final scene
- `summary_text`
- `tier_stamp`
- `final_line`

These slots are what later timing automation should target.

---

# 18. Timing assumptions for future sync

Do **not** lock exact seconds yet.
Lock reveal rhythm.

## Default rhythm
- one major reveal per spoken clause
- no more than 1 new meaningful stat every ~0.5–0.9s
- macro headline appears slightly before its spoken line completes
- bullet reveals should hit on their own clauses
- final tier stamp must land on the exact verdict beat

## Important
Timing engine should sync to:
- section count
- slot count
- narration chunks
- locked narration-story roles (`opening-promise`, `macro-foundation`, `micronutrient-proof`, `real-world-upside`, `real-world-downside`, `verdict-payoff`)

Not to arbitrary fixed timestamps.

---

# 19. Special handling rules

## Misc category
- fats/carbs/proteins sections still appear
- but should visually feel lighter / more informational
- real dramatic weight should shift to pros/cons and final verdict

## Oils & fats
- fats section gets the strongest visual emphasis
- carbs/proteins can appear minimal and quickly dismissed

## Debate foods
- allow one extra small commentary tag under macro sections if needed
- ex: butter category clarification

---

# 20. Recommended next build after this spec

1. create a **visual template JSON schema** mirroring these slots
2. create a **timing/reveal planner** that targets the slots
3. create a **subtitle chunker** that respects the safe area
4. only then move to renderer automation

---

# 21. Builder profiles

The builder can expose a small set of named profiles as long as they do not break the locked flow.

## Allowed profiles
- `balanced` = default launch profile
- `tight` = denser macro handling, raised subtitles, reduced visible submetric count
- `showcase` = sprite-forward presentation with more breathing room

## Non-negotiables
- header remains stable
- scene stack remains hook → fats → carbs → proteins → vitamins → minerals → pros → cons → final
- subtitle safe area still wins over decorative motion
- no profile may hide the final tier stamp or reorder reveal slots

---

# Final design intent

The FoodRanked visual system should feel like:
- a cozy pixel RPG stat sheet
- a fast readable nutrition reveal
- a satisfying tier verdict machine

Not a spreadsheet in costume.
