# Wireframe Template Guide

These are editable SVG wireframes for the FoodRanked visual system.

## Files

- `wireframes/foodranked-hook-template.svg`
- `wireframes/foodranked-macro-template.svg`
- `wireframes/foodranked-micros-template.svg`
- `wireframes/foodranked-pros-cons-template.svg`
- `wireframes/foodranked-verdict-template.svg`

## Why SVG

SVG is useful here because you can:
- open it in browsers
- edit it in Figma, Illustrator, Inkscape, or Aseprite-adjacent workflows
- move boxes around quickly
- tweak spacing before committing to a heavier build

## What to edit first

### 1) Macro scene
Start with:
- macro bubble position
- macro headline size
- submetric card spacing
- subtitle gap

This is the most important layout in the whole format.

### 2) Pros/cons scene
Check:
- bullet height
- icon size
- how high subtitles need to lift
- whether 3 bullets feel too cramped

### 3) Verdict scene
Tweak:
- stamp size
- score plate placement
- how much empty space you want around the final hit

## Suggested workflow

1. Open the SVG wireframe.
2. Duplicate it before changing anything.
3. Move shapes until the layout feels right.
4. Once a version feels good, update the production template docs or JSON template later.

## Macro bubble system

The current default macro bubbles are:
- arm = protein
- lightning = carbs
- shield = fats

See:
- `production/templates/MACRO-BUBBLE-SYSTEM.md`

## Important reminder

These wireframes are not final art.
They are meant to help you discover:
- spacing
- hierarchy
- motion rhythm
- what feels too cramped or too empty

Once you like a direction, we can turn it into:
- a cleaner SVG component system
- a JSON template revision
- or build-ready scene comps
