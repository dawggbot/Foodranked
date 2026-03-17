# CURRENT-BATCH-RESULTS

Generated from `scripts/foodranked-score-all.js`.

## Summary

- **Almonds** (nuts) → **C** (50)
  - fats: 40.7
  - carbs: 66.7
  - proteins: 56.7
  - vitamins: 66.7
  - minerals: 40
  - pros: 50
  - cons: 50
- **Chicken Thigh** (meats) → **C** (50)
  - fats: 44.4
  - carbs: null
  - proteins: 75.9
  - vitamins: 6.7
  - minerals: 3.3
  - pros: 66.7
  - cons: 50
- **Oats** (grains) → **B** (64)
  - fats: 72.2
  - carbs: 74.1
  - proteins: 93.3
  - vitamins: 0
  - minerals: 30
  - pros: 66.7
  - cons: 50

## Why these scores currently look the way they do

### Almonds
- Strong fibre, vitamin E, and useful minerals are helping.
- The big drag is that the current nuts ruleset treats very low omega-3 as a serious category miss.
- Result: **C** because almonds are good overall, but not a standout omega-3 nut.

### Oats
- Strong carb section, good grain fit, and decent support from context items.
- The main drag is still weak vitamin DV output in the current sample data.
- Result: now pushed into **B**, which better matches a grain that performs well on carb quality.

### Chicken Thigh
- Protein quality is carrying hard, which is exactly what should happen for meats.
- The main penalties are cholesterol plus low vitamin/mineral DV scores in the current sample data.
- Result: now sitting at the **C/D boundary**, which is much more believable than the earlier harsher output.

## Notes

- These are prototype outputs from current rulesets and sample data.
- Sample food values are still placeholders, not final canonical nutrition values.
- The biggest remaining realism issue is that DV-based vitamin/mineral scoring can be harsh for some foods unless the category weighting is tuned carefully.
