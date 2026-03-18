# Dashboard Troubleshoot Notes

## What was fixed in this cleanup pass

- Rebuilt `docs/app/app.js` cleanly to remove corruption from repeated incremental edits.
- Kept the script-viewer tab.
- Kept preset save/load controls.
- Kept macro sprite integration.
- Replaced the text food-type tag in the preview header with the new food-type sprite files.
- Applied food-type accent palettes to the display shell (background tint, chip accent, header thumb accent).

## Current known design constraint

Macro scenes currently support:
- 1 main macro headline
- 3 supporting submetric slots

They do **not** yet support 4 supporting submacro cards.

## Pages asset rule

Anything the dashboard needs directly should live under:
- `docs/app/assets/`

That includes:
- macro GIF sprites
- food type header sprites
