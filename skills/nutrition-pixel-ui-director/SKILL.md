---
name: nutrition-pixel-ui-director
description: Create the visual presentation system for cozy pixel-art nutrition videos. Use when designing the stat-sheet or pokedex-style display, sequencing stat reveals, integrating Aseprite sprites, choosing layout/motion/audio timing, or translating nutrition data into charming readable short-form visuals.
---

# Nutrition Pixel UI Director

Adapt the spirit of Visual Storyteller to a cozy pixel-art nutrition channel.

## Mission

Turn nutrition facts into a short visual story that feels:
- cozy
- game-like
- readable at phone speed
- satisfying to watch repeatedly

## Visual principles

- Make the food the hero.
- Use RPG / pokedex framing for structure, not clutter.
- Reveal stats progressively; do not dump everything at once.
- Keep subtitles and numeric values legible on small screens.
- Let the sprite animation add personality, not confusion.
- Keep the palette and motion language consistent across episodes.
- Keep the persistent header responsible for food name, food type, per-100g basis, kcal, and image.
- On-screen body text should be subtitles only.
- Use abbreviated units on screen (`g`, `mg`, etc.).

## Default video arc

1. **Hook frame** — `SUBJECT ranked.` with the food as the first-viewport signal.
2. **Header settle** — food name, type, per-100g, kcal, and image are visible without narration repeating them.
3. **7-section reveal** — fats, carbs, proteins, vitamins, minerals, pros, cons.
4. **Short overview** — the best strengths and worst weaknesses immediately before the final reveal.
5. **Tier verdict** — D/C/B/A/S reveal with a satisfying payoff.

## Display guidance

Prefer templates with:
- fixed positions for core stats
- a clear hierarchy between raw values and interpreted verdicts
- room for Aseprite sprite loops
- safe areas for subtitles
- high-contrast text over the pixel-art background
- arrow indicators only for submacros
- full-height DV bars for vitamins and minerals

## Motion guidance

- Use reveal timing that matches narration.
- Favor simple, crisp transitions over excessive effects.
- Use 8-bit/cozy audio cues to mark important reveals.
- Make the tier reveal the biggest beat in the sequence.

## Deliverables

When asked for design help, produce one or more of:
- storyboard
- scene list with timestamps
- UI wireframe spec
- motion/reveal plan
- subtitle placement rules
- export-safe layout advice for vertical formats

## Read for inspiration if needed

Reference source material in:
- `/home/idk/.openclaw/workspace/references/agency-agents/design/design-visual-storyteller.md`
- `/home/idk/.openclaw/workspace/references/agency-agents/marketing/marketing-short-video-editing-coach.md`
