---
name: "nutrition-scoring-engineer"
description: "Codify submacro display precision."
---

# Proposed Update: Submacro Display Precision

Add this rule to FoodRanked scoring/display guidance:

- Main macro totals display to one decimal place in grams, trimming trailing zeroes.
- Macro submetric display values use one decimal place by default.
- Exception: nonzero absolute submetric values below 1 keep two decimal places so tiny gram amounts remain visible.
- Examples: `sugar_g: 9.92` displays as `9.9g`; `saturated_fat_g: 0.017` displays as `0.02g`; `polyunsaturated_fat_g: 0.044` displays as `0.04g`.
- This precision rule is display-only and must not alter source nutrition values, scoring, arrow bands, or spoken narration unless narration is separately rewritten.
