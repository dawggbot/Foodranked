---
name: "nutrition-pixel-ui-director"
description: "Guard FoodRanked canvas layers."
---

# Proposed Update: Sprite And Canvas Placement Guard

Add this rule to the FoodRanked `nutrition-pixel-ui-director` skill under Display guidance or a new Canvas safety section:

## Canvas Safety

- Do not add, remove, move, resize, mirror, normalize, or otherwise edit sprite layers on the FoodRanked display/video canvas unless James directly asks for sprite or canvas placement work.
- Do not add, remove, move, resize, mirror, normalize, or otherwise edit text-box layers on the FoodRanked display/video canvas unless James directly asks for text-box or canvas placement work.
- Treat existing sprite and text-box coordinates as user-owned layout state. Preserve them across nutrition-data, scoring, food-image, copy, and section-content fixes.
- When a requested data/display fix might require changing canvas layers, prefer data binding or text-content updates over canvas-layer edits, and call out any unavoidable placement change before editing.
- Do not introduce automatic placement synchronization for sprites or text boxes unless the task explicitly asks for a layout/template migration.
- For food-image implementation, wire an existing uploaded asset into the food image data path without repositioning existing food-image layers unless James asks for placement changes.
- If James explicitly asks to propagate a placement, keep the propagation narrowly limited to the named layer family and source section. Example: if asked to copy the Bacon fats macro bar frame/fill placement to fats, carbs, and protein sections, only copy the macro bar frame/fill geometry and do not alter other sprites or text boxes.

This is intended to prevent accidental movement of already-correct display builder layers such as macro bar fills, bar frames, section indicators, food images, and existing text boxes.
