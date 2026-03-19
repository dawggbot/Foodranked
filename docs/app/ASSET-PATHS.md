# Dashboard Asset Paths

GitHub Pages serves the dashboard from `docs/app/`, so preview assets used by the dashboard should live under that tree.

## Current dashboard-served sprite files

- `docs/app/assets/macro-protein-arm.gif`
- `docs/app/assets/macro-carbs-lightning.gif`
- `docs/app/assets/macro-fats-shield.gif`
- `docs/app/assets/vitamin-sprite.svg`
- `docs/app/assets/arrow-up-green.svg`
- `docs/app/assets/arrow-down-green.svg`
- `docs/app/assets/arrow-up-red.svg`
- `docs/app/assets/arrow-down-red.svg`

## Rule of thumb

- **Source-of-truth / project assets** can still live in broader project folders like `assets/`
- **Anything the GitHub Pages dashboard needs to render directly** should also exist under `docs/app/assets/`

This avoids broken asset paths on Pages.

## Future tidy-up direction

When more sprite systems exist, prefer a mirrored structure like:
- `docs/app/assets/macros/`
- `docs/app/assets/micros/`
- `docs/app/assets/verdict/`
- `docs/app/assets/backgrounds/`

For now, keeping the 3 macro GIFs in `docs/app/assets/` is fine and stable.
