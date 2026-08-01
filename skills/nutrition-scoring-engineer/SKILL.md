---
name: "nutrition-scoring-engineer"
description: "Guard sports-use and electrolyte summary claims"
---

# Proposed Update: FoodRanked Script Claim Guardrails

Add these guardrails to the FoodRanked scoring/script workflow.

## Protein Narration Preference

- When both essential amino acid and nonessential amino acid display estimates are available for protein narration, prefer essential amino acids before nonessential amino acids.
- Treat EAA as the more meaningful protein-quality callout because essential amino acids are the limiting repair-and-maintenance signal viewers care about most.
- Use NEAA only when EAA is unavailable, less relevant to the selected contrast, or already handled in the same protein section.

## Pros And Cons Novelty Check

- Before finalising generated scripts, compare each pro/con title and explanation against the macro, submacro, vitamin, and mineral narration already selected for that food.
- Reject pro/con items that simply repeat visible nutrition facts or section verdicts, including titles like `protein quality is limited`, `protein support is weak`, `low calcium`, `low vitamin E`, `low fibre`, or `high sugar`, when those facts have already been shown in the scored sections.
- Use pros and cons as extra food-context or fun-fact style information: processing burden, preparation, tolerance, storage, sourcing, texture, flavour, meal role, culinary role, convenience, anti-nutrients, absorbability, named compounds, fermentation, or practical use cases.
- Nutrient-linked pro/con items are allowed only when they add a separate angle beyond the visible score, such as absorbability, a named compound, or a practical pairing/preparation caveat.

## Sports-Use Summary Claims

- Separate general training/daily-fuelling value from immediate pre-event or during-exercise suitability.
- High-carbohydrate foods can support energy or training meals when the carb section is strong, but do not call a high-fibre food broadly `good for endurance sports` unless the wording explains timing and tolerance.
- For high-fibre staples, especially beans, legumes, intact grains, and high-fibre pseudocereals, prefer labels such as `energy`, `practical meals`, `training meals`, or `recovery meals` over `energy and endurance sports`.
- Treat roughly `7g` fibre per 100g or higher as a caution threshold for the generic endurance-sports label. Use a stricter threshold when the food is likely eaten close to exercise, when fibre is a main scored strength, or when the food has oligosaccharide/FODMAP tolerance caveats.
- If a script mentions sport, avoid implying the food should be eaten right before training or racing. Add timing/context when needed: useful earlier in the day, as a normal training-meal staple, or after training, not as a low-residue pre-race option.

## Potassium And Electrolyte Claims

- Potassium can be mentioned as source-backed fluid-balance, nerve, or muscle-contraction support when DV% is meaningfully high or when it is the strongest raw mineral DV.
- Do not oversell potassium as a standalone acute performance aid. For sweat replacement and sports hydration, sodium usually needs separate consideration; potassium-rich foods are better framed as general electrolyte/mineral support unless the food is specifically a sports drink or electrolyte product.
- When a mineral has the highest raw DV but lower scoring weight, it can still deserve a spoken callout if it is at least about 30% daily value and the claim is phrased modestly.

## Review Step

For sample-entry finalisation, run a quick manual pass over the 7 body sections:

1. Identify the nutrition facts already spoken in fats, carbs, proteins, vitamins, and minerals.
2. Check all 3 pros and all 3 cons against that list.
3. Replace any recap item with a context item that is useful, food-specific, and not already covered on screen.
4. Check conclusion use cases for timing-sensitive claims, especially sport, digestion, and electrolyte wording.
5. Keep exactly 3 pros and exactly 3 cons after replacements.
