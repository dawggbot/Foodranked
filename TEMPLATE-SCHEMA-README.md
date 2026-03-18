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

## Text rule

Inside the body of the video, the only text should come from subtitles derived from narration.

That means the template should avoid extra commentary labels, note tags, or closing text blocks beyond the subtitle system.

## Recommended next step

Build a timing/reveal planner that:
- takes generated script sections
- maps them onto the template reveal slots
- outputs a reveal timeline per scene
