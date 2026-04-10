# Sprites

Foodranked sprite assets are organized into the following structure:

- `header/`
  - `header_ui/`
  - `food_images/`
  - `food_plate/`
  - `food_type_plate/`
  - `calorie_bubble/`
- `macros_section/`
  - `arrow_indicators/`
  - `section_1_fats/`
  - `section_2_carbs/`
  - `section_3_protein/`
- `micros_section/`
  - `bars/`
  - `minerals/`
  - `vitamins/`
- `pros_and_cons/`
  - `pros/`
  - `cons/`
- `ui/`
  - `section_indicator/`
  - `section_separator/`
- `references/`

This structure is intended to stay stable so freshly exported sprite files can be dropped back into the correct folders.

## Asset usage contract

- Treat the exported `.png` and `.gif` files here as the runtime and edit-ready assets.
- Treat adjacent `.aseprite` files as the fidelity reference and re-export source.
- Builder manifests should point directly at `sprites/...` paths rather than inventing mirror asset folders.
- When both exist, prefer PNG/GIF first, then keep the `.aseprite` path alongside it for art tweaks.
