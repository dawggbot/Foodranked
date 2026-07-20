---
name: "foodranked-micro-layout-builder"
description: "FoodRanked layout-builder workflow for vitamin/mineral micro bar sprites and percent overlays."
---

# FoodRanked Micro Layout Builder

Use this skill for FoodRanked layout-builder changes that affect vitamin or mineral micro bar graphs, DV bar sprites, and small percentage textbox overlays.

## Guardrails

- Work in `/home/idk/.openclaw/workspace/Foodranked`.
- Check `git status --short --branch` before editing.
- Keep changes scoped to layout-builder behavior unless James explicitly asks for display or video-builder behavior.
- Do not include unrelated workspace files, memory files, or OpenClaw state files in commits.
- Do not add, remove, move, or restyle canvas sprites/textboxes unless James directly asks for that placement work.
- Preserve vitamin graphs as six columns and mineral graphs as five columns.

## Primary Files

- Inspect `docs/app/index.html` for layout-builder migrations and render behavior.
- Inspect `docs/app/default-layout.js` when recovering default vitamin or mineral micro bar sprite positions.
- Avoid editing separate display-builder surfaces unless the request names them.

## Workflow

1. Find the existing micro helpers in `docs/app/index.html`, especially column detection, textbox generation, layout normalization, and render styling.
2. Prefer idempotent layout-builder migrations over browser-only edits.
3. Gate layout-builder-only work with `APP_MODE === 'layout-builder'`.
4. Use explicit `layout.meta` migration keys, and bump a key when existing saved layouts must rerun the migration.
5. For placeholder micro percent overlays, use `??%`, set manual text flags, and mark generated overlays so styling and cleanup stay scoped.
6. For mineral bar sprites, recover missing `/micros_section/bars/` sprites from the mineral section of `DEFAULT_LAYOUT`, make them visible when requested, and dedupe by `src`, `x`, `y`, `width`, and `height`.
7. When cleaning duplicate generated overlays, target generated bar-overlay IDs or explicit micro-overlay markers. Do not remove ordinary nutrient percent labels such as `minerals_percent_1`.

## Verification

- Run an inline script syntax check for the script embedded in `docs/app/index.html`.
- For micro graph changes, run a default-layout count check. Expected layout graph counts are vitamins: sixty DV bars across six columns plus one bar line; minerals: fifty DV bars across five columns plus one bar line.
- Run `git diff --check -- docs/app/index.html`.
- Commit and push only the relevant tracked files for meaningful FoodRanked builder changes.
