# TEMPLATE-SCHEMA-README

## Purpose

`templates/visual-template.v1.json` is the machine-usable version of the visual template spec.

It exists so future tools can consume stable layout data instead of trying to parse prose docs.

## What it defines
- format and canvas size
- global zones
- permanent header objects
- progress indicator geometry
- scene stack
- section templates
- reveal slots
- subtitle-safe area
- closing-scene objects
- palette bindings
- special category handling
- sync assumptions
- motion/effect bindings for stamps, shimmer, and screen shake

## Most important concept: reveal slots

Later automation should target the `revealSlots` arrays in the template.

Examples:
- fats/carbs/proteins:
  - `macro_headline`
  - `submetric_1`
  - `submetric_2`
  - `submetric_3`
- vitamins/minerals:
  - `micronutrient_1`
  - `micronutrient_2`
- pros/cons:
  - `bullet_1`
  - `bullet_2`
  - `bullet_3`
- closing:
  - `tier_stamp`

## Motion / effect bindings

Current video-builder effects that should be treated as schema-level behavior:

- `food-hero` intro stamp: the food image appears quickly, pulses only during the stamp-in, then settles still
- `ranked-sprite` intro stamp: the ranked sprite uses the same stamp weight as the food image, with a short stamp-in pulse and settled final frame
- `ranked-glimmer`: ranked sprite sparkle marks; current target is 5 glimmer marks with a shimmery glow
- `d-tier-stamp` / tier stamp: final reveal stamp uses the same heavy pulse language and settles still
- stamp screen shake: stage shake is triggered after a stamp has landed, not before the stamped sprite appears

These effects are driven by reveal scheduling and layer ids/effects in the builder. Future template exports should preserve enough metadata for tools to know which layers are stamp-driven, which layers are decorative glimmers, and which stage shake events are tied to stamp impact.

## Text rule

Inside the body of the video, the only text should come from subtitles derived from narration.

That means the template should avoid extra commentary labels, note tags, or closing text blocks beyond the subtitle system.

## Recommended next step

Build a timing/reveal planner that:
- takes generated script sections
- maps them onto the template reveal slots
- outputs a reveal timeline per scene
