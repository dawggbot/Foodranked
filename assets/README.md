# Assets

This folder holds reusable visual assets for FoodRanked production.

## Structure

- `heroes/` — final or candidate food hero images
- `backgrounds/` — blurred or low-detail background plates
- `icons/pros/` — reusable pro-side bullet icons
- `icons/cons/` — reusable con-side bullet icons
- `icons/ui/` — generic UI icons / badges / chips
- `sprites/` — optional pixel-art food sprite assets
- `motifs/` — animated or static motif references (glycemic spike, omega wave, bubbles, etc.)
- `thumbnails/` — thumbnail source comps / exports

## Naming convention

Prefer deterministic names like:
- `bacon-hero-main.v1.png`
- `rice-cakes-glycemic-spike.v1.png`
- `salmon-omega-wave.v1.png`
- `olive-oil-thumbnail-s-tier.v1.png`

## Rule

Keep generated source assets here.
Episode-specific working files should live under `production/episodes/<food-id>/`.
