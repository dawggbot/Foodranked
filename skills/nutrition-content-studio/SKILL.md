---
name: nutrition-content-studio
description: End-to-end planning, building, and operating of a short-form nutrition content system with food scoring, tier lists, cozy pixel-art presentation, narration/subtitles, workflow automation, and cross-platform publishing. Use when the user is designing or improving the overall nutrition-video engine, deciding project architecture, choosing what to build next, defining food categories/rulesets, or coordinating data, visuals, automation, and channel strategy.
---

# Nutrition Content Studio

Treat the project as a **content engine**, not just an app.

## Core framing

Break work into these layers:
1. **Data layer** — foods, nutrients, food types, scoring rules, tiers, assets, episode metadata.
2. **Scoring layer** — per-category rulesets that explain what counts as good/bad and why.
3. **Presentation layer** — cozy pixel-art stat sheet / pokedex / RPG reveal UI with sprites, subtitles, narration timing, and export templates.
4. **Operations layer** — batching, review, publishing, analytics, and iteration across YouTube, TikTok, Instagram, and Facebook.

## Default workflow

When helping on this project:
1. Clarify which layer the task belongs to.
2. Prefer reusable systems over one-off hacks.
3. Keep the first version small enough to ship.
4. Preserve the channel's identity: cozy, pixel-art, playful, but still methodical and fair.
5. Make scoring auditable: every food score should be explainable from stored rules.

## Design rules

- Keep **food type** and **scoring ruleset** separate. A food belongs to a type; the type determines scoring logic.
- Store raw nutrition facts separately from derived scores and tier outputs.
- Make rulesets versionable so rankings can evolve without corrupting history.
- Keep visuals template-driven so multiple foods can render through the same sequence.
- Prefer workflows that support batch production.
- When forced to choose, optimize for: clarity, repeatability, and speed of shipping.

## Suggested initial entities

Use these as the default mental model unless the repo says otherwise:
- food_types
- foods
- nutrient_profiles
- scoring_rulesets
- scoring_rule_items
- food_scores
- visual_themes
- sprite_assets
- episodes
- platform_exports

## Trigger the support skills

Read these only when needed:
- `../nutrition-scoring-engineer/SKILL.md` for schema, rules, formulas, and ranking logic.
- `../nutrition-pixel-ui-director/SKILL.md` for cozy pixel-art presentation, reveal pacing, sprites, subtitles, and narration choreography.
- `../nutrition-workflow-automator/SKILL.md` for batching, automation, publishing pipeline, and analytics loop.
- `../nutrition-content-strategist/SKILL.md` for hooks, packaging, platform adaptation, and growth strategy.

## Good output shapes

Prefer producing one of:
- system architecture outline
- phased implementation plan
- schema + scoring design
- storyboard / video template spec
- automation workflow
- experiment backlog for growth

## Avoid

- Mixing ranking philosophy into random code comments instead of formal rulesets.
- Hard-coding platform-specific logic into the core scoring engine.
- Letting aesthetics overpower legibility.
- Overengineering before the first shippable prototype exists.
