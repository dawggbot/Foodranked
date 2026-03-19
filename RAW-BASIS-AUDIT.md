# Raw Basis Audit

Default rule:
- base foods should use **raw per-100g values** where reasonably available
- cooked / prepared / processed values should only be used when that prepared state is the actual thing being ranked

## Obvious entries to review
These file names strongly suggest prepared-state or format-specific entries:

- `foods/baked-beans.sample.json`
- `foods/cassava-boiled.sample.json`
- `foods/popcorn-air-popped.sample.json`
- `foods/soy-milk-unsweetened-powder-basis.sample.json`
- `foods/watermelon-seeds-roasted-salted.sample.json`
- `foods/watermelon-seeds-unsalted.sample.json`
- `foods/mixed-nuts-unsalted.sample.json`

## Likely treatment
- keep as-is **only if** the prepared / mixed / processed format is the real episode subject
- otherwise replace with a raw-base version and treat preparation as context, not the main nutrient basis

## Notes
- some foods like fries, baked beans, roasted salted seeds, and drinks may reasonably stay prepared-format because the prepared format is the actual thing viewers are judging
- the important rule is to avoid using cooked/prepared values as the default basis for a base ingredient when a raw-base entry is what people actually expect
