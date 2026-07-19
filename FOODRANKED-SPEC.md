# FOODRANKED-SPEC

## Project summary

FoodRanked is a short-form nutrition content system focused on **general health, fitness, and longevity**.

Current scope:
- foods are no longer limited to wholefoods only
- one food per episode
- nutrition judged **per 100g**
- cozy pixel-art / RPG stat-sheet / Pokédex aesthetic
- narration + word-highlighting subtitles
- S/A/B/C/D final tier
- 11 food types, each with its own ruleset

## Project goal

Build a repeatable system that can:
- store food entries and nutrient data
- assign each food to a food type
- apply the correct ruleset automatically
- compute a score and final tier
- produce section-ready outputs for videos
- support the current manual workflow first
- gradually automate repetitive parts later

## Locked / near-locked assumptions

### Content scope
- wholefoods only for now
- avoid processed / multi-ingredient foods for now
- examples in scope: rice, apples, chicken thigh

### Basis
- all food values judged per 100g
- default to **raw** values for base foods whenever that is reasonably available
- only use cooked / prepared / processed values when that prepared state is the actual food being ranked
- pros/cons must feel like extra food-specific context, not a recap of macro, submacro, vitamin, or mineral sections already shown on screen
- a pro/con may build on a previous section only when it adds a genuinely separate angle such as absorbability, fermentation, antioxidants, anti-nutrients, processing burden, sourcing, tolerance, preparation, storage, convenience, meal role, or a named food-specific compound; for example, `ALA omega-3 is the headline fat` is acceptable because it explains why chia is distinctive, while `protein contribution is tiny` and `mineral density is genuinely strong` are not acceptable because they merely summarize sections the viewer already saw
- public final score is locked to the tier: `D=20`, `C=40`, `B=60`, `A=80`, `S=100`; use internal calibrated/anomaly-adjusted scores for fairness, sorting, and audit

### Video identity
- short-form vertical videos
- cozy / cheery pixel / 8-bit music
- pixel-art food imagery and animated sprites shown at crisp integer scaling
- visual feel like a pixel RPG stat sheet or Pokédex entry

### Opening
- opening hook: `SUBJECT ranked`
- big image of the food
- `RANKED` animated into frame
- blurred background opening sequence

### Permanent header
Persistent header should contain:
- food name
- food image
- food type
- kcal
- per 100g label

### Section structure
Each video uses 9 video sections:
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

Additional format rules:
- 9 progress dots indicate current section, including intro and outro
- information is revealed in sync with narration
- macro scenes use the macro sprite plus a bar for the main macro only
- submacros use arrow indicators only, with repeated arrow sprites for 1/2/3 strength bands
- protein section visible submacros stay locked to collagen, essential amino acids, non-essential amino acids, and bioavailability
- `protein_g_fallback` is hidden scoring/narration support only; it must not replace a visible protein submacro row because protein grams already appear in the macro bubble
- missing, source-withheld, or protein-gate-skipped protein-quality rows display as `N/A`, never fake `0`
- vitamins use their own sprite treatment while vitamins and minerals keep full-height DV bars
- pros and cons are bullet points with major or minor labels
- final screen stamps in the tier result

### Tier colours
Current theme direction:
- D = purple
- C = green
- B = red
- A = light blue
- S = platinum / gold

## Product pillars

### 1. Ranking system
- food types
- metric directions
- threshold ladders
- score calculation
- tier mapping
- explanation logic

### 2. Episode structure
- fixed 9-scene video format with 7 scored content sections
- section payloads
- narration-friendly reveal order
- retention pacing

### 3. Visual identity system
- permanent header
- section tracker
- food-type palettes
- tier colour themes
- pixel-art sprites / icons

### 4. Creator workflow
- food entry
- source notes
- ruleset application
- script support
- asset management
- status tracking

### 5. Growth / publishing
- backlog management
- multi-platform adaptation
- account/channel workflow
- iteration from performance

## Current project stage

FoodRanked is **past concept stage**.

There are already 10+ manually produced test videos, so the current priority is:
1. formalise the existing system
2. structure the rulesets and data
3. support the manual workflow with better tooling
4. automate carefully later

## Recommended roadmap

### Phase 1 — Formalise the blueprint
- lock the 11 food types
- lock the metric list
- lock the 9-scene video format and 7-section scoring body
- lock header fields
- lock tier/palette rules

### Phase 2 — Build the scoring backbone
- design schema for foods, nutrients, rulesets, and scores
- store threshold ladders and universal metric directions
- generate auditable score outputs

### Phase 3 — Build a creator console
- manage foods and nutrient profiles
- apply rulesets
- preview score breakdowns
- generate section-ready outputs

### Phase 4 — Standardise the visual template
- finalise cozy pixel display rules
- standardise sprite/icon usage
- standardise timing/layout

### Phase 5 — Add automation carefully
- automate scoring
- automate section draft generation
- automate script scaffolding and production tracking
- keep final creative control manual

## Key risks
- threshold sprawl
- too much information on screen
- project knowledge scattered across docs/files/head
- fairness drift when rules evolve

## Guiding principle

Do not reinvent the format from scratch.
Formalise, clean up, and systemise the format that already works.
