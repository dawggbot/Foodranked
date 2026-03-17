# METRICS-CATALOG

This file defines the canonical FoodRanked metric set.

## Goal

Make every metric explicit before implementing rulesets or code.

For each metric, define:
- key
- display name
- unit
- default section
- default polarity
- v1 role
- notes

## Display-only context metrics

These are important for the video UI and viewer understanding, but do not directly score the food.

### kcal
- Display name: Calories
- Unit: kcal
- Default section: header
- Default polarity: `neutral_display_only`
- V1 role: display-only
- Notes: included in permanent header

### fat_g
- Display name: Fat
- Unit: g
- Default section: fats
- Default polarity: `neutral_display_only`
- V1 role: display-only
- Notes: main macro bubble and bar for section 1

### carb_g
- Display name: Carbs
- Unit: g
- Default section: carbs
- Default polarity: `neutral_display_only`
- V1 role: display-only
- Notes: main macro bubble and bar for section 2

### protein_g
- Display name: Protein
- Unit: g
- Default section: proteins
- Default polarity: `neutral_display_only`
- V1 role: display-only
- Notes: main macro bubble and bar for section 3

## Fat submetrics

### saturated_fat_g
- Display name: Saturated Fat
- Unit: g
- Default section: fats
- Default polarity: `higher_worse`
- V1 role: scored
- Notes: widely applicable, especially important in fats/oils, meats, dairy, nuts, seeds

### omega3_mg
- Display name: Omega 3
- Unit: mg
- Default section: fats
- Default polarity: `higher_better`
- V1 role: scored
- Notes: major signal in nuts, seeds, oils & fats; sometimes minor elsewhere

### polyunsaturated_fat_g
- Display name: Polyunsaturated Fat
- Unit: g
- Default section: fats
- Default polarity: `higher_better`
- V1 role: scored
- Notes: not equally important in every category

### cholesterol_mg
- Display name: Cholesterol
- Unit: mg
- Default section: fats
- Default polarity: `higher_worse`
- V1 role: scored or not applicable depending on category
- Notes: usually not applicable for plant categories

## Carb submetrics

### starch_g
- Display name: Starch
- Unit: g
- Default section: carbs
- Default polarity: `higher_better`
- V1 role: scored in relevant categories
- Notes: useful mainly in starch-bearing categories like grains and tubers; not truly universal

### fibre_g
- Display name: Fibre
- Unit: g
- Default section: carbs
- Default polarity: `higher_better`
- V1 role: scored
- Notes: major signal for fruits, vegetables, grains, legumes, nuts, seeds

### sugar_g
- Display name: Sugar
- Unit: g
- Default section: carbs
- Default polarity: `higher_worse`
- V1 role: scored where relevant
- Notes: especially important in fruits, vegetables, dairy, some grains/tubers

### glycemic_index
- Display name: Glycemic Index
- Unit: score
- Default section: carbs
- Default polarity: `higher_worse`
- V1 role: scored where relevant
- Notes: major category signal for grains, legumes, tubers, fruits

## Protein submetrics

### collagen_g
- Display name: Collagen
- Unit: g
- Default section: proteins
- Default polarity: `higher_better`
- V1 role: scored or not applicable depending on category
- Notes: usually not applicable for plant categories

### essential_amino_acids_score
- Display name: Essential Amino Acids
- Unit: score
- Default section: proteins
- Default polarity: `higher_better`
- V1 role: scored where meaningful
- Notes: blueprint suggests `/9` style framing; scoring should reflect meaningful amount, not mere presence

### nonessential_amino_acids_score
- Display name: Non-essential Amino Acids
- Unit: score
- Default section: proteins
- Default polarity: `higher_better`
- V1 role: scored where meaningful
- Notes: blueprint suggests `/11` style framing

### bioavailability_percent
- Display name: Bioavailability
- Unit: %
- Default section: proteins
- Default polarity: `higher_better`
- V1 role: scored where meaningful
- Notes: major signal in animal categories; context-dependent elsewhere

## Vitamin metrics

### vitamin_a_dv
- Display name: Vitamin A
- Unit: %DV
- Default section: vitamins
- Default polarity: `higher_better`
- V1 role: scored

### vitamin_c_dv
- Display name: Vitamin C
- Unit: %DV
- Default section: vitamins
- Default polarity: `higher_better`
- V1 role: scored

### vitamin_d_dv
- Display name: Vitamin D
- Unit: %DV
- Default section: vitamins
- Default polarity: `higher_better`
- V1 role: scored

### vitamin_e_dv
- Display name: Vitamin E
- Unit: %DV
- Default section: vitamins
- Default polarity: `higher_better`
- V1 role: scored

### vitamin_k_dv
- Display name: Vitamin K
- Unit: %DV
- Default section: vitamins
- Default polarity: `higher_better`
- V1 role: scored

### vitamin_b12_dv
- Display name: Vitamin B12
- Unit: %DV
- Default section: vitamins
- Default polarity: `higher_better`
- V1 role: scored

## Mineral metrics

### iron_dv
- Display name: Iron
- Unit: %DV
- Default section: minerals
- Default polarity: `higher_better`
- V1 role: scored

### magnesium_dv
- Display name: Magnesium
- Unit: %DV
- Default section: minerals
- Default polarity: `higher_better`
- V1 role: scored

### zinc_dv
- Display name: Zinc
- Unit: %DV
- Default section: minerals
- Default polarity: `higher_better`
- V1 role: scored

### calcium_dv
- Display name: Calcium
- Unit: %DV
- Default section: minerals
- Default polarity: `higher_better`
- V1 role: scored

### potassium_dv
- Display name: Potassium
- Unit: %DV
- Default section: minerals
- Default polarity: `higher_better`
- V1 role: scored

## Derived narrative outputs

These are not canonical nutrient facts and should not be mixed into the raw data layer.

### pros
- Unit: n/a
- Section: pros
- Role: derived output
- Notes: generated from strongest positive evidence, optionally edited for phrasing

### cons
- Unit: n/a
- Section: cons
- Role: derived output
- Notes: generated from strongest negative evidence, optionally edited for phrasing

### summary
- Unit: n/a
- Section: closing
- Role: derived output
- Notes: one short synthesis line for narration and end sequence

## Applicability reminders
- `cholesterol_mg` is usually `not_applicable` for plant categories
- `collagen_g` is usually `not_applicable` for plant categories
- `fibre_g` is usually `not_applicable` for meats and most dairy
- `starch_g` is category-dependent and should not be treated as universally positive
- macro totals are always display-only in v1

## Context item examples

Examples of valid pros/cons evidence items:
- antioxidant richness
- polyphenol content
- sodium concerns
- pesticide risk
- anti-nutrient load
- unusually absorbable nutrient forms

These should eventually live in a separate structured source, e.g. `context-items.schema.json`.

## Next step

Turn this catalog into machine-readable data later, e.g.:
- `metrics.catalog.json`
- `food-types.json`
- `rulesets/<food_type>.json`
- `context-items.schema.json`
