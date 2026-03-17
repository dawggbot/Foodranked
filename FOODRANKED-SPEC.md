# FOODRANKED-SPEC

## Project summary

FoodRanked is a short-form nutrition content system focused on **general health, fitness, and longevity**.

Current scope:
- wholefoods only
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

### Video identity
- short-form vertical videos
- cozy / cheery pixel / 8-bit music
- pixel-art food imagery and animated sprites
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
Each video uses 7 sections:
1. fats + fat submicros
2. carbs + carb submicros
3. proteins + protein submicros
4. vitamins
5. minerals
6. pros
7. cons

Additional format rules:
- 7 progress dots indicate current section
- information is revealed in sync with narration
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
- fixed 7-section format
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
- lock the 7-section format
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
