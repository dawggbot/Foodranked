# RULESET-SCHEMA

This file defines how FoodRanked scoring rules should be represented.

## Goal

Store scoring logic in a way that is:
- explainable
- versioned
- auditable
- easy to edit
- easy to recompute
- compatible with the locked FoodRanked video format

## Core principle

Separate these layers:

1. **Canonical nutrition facts**
   - Raw per-100g values with explicit units and sources
2. **Metric registry**
   - What each metric means, how it is displayed, and its default polarity
3. **Food-type ruleset**
   - Which metrics apply to a category, how much they matter, and which thresholds they use
4. **Context item rules**
   - How pros/cons are classified and scored
5. **Derived outputs**
   - section payloads, strengths, weaknesses, summary, and tier

## Important scoring distinction

### Display-only metrics
These are shown prominently in the video but do **not** directly score the food:
- fat (g)
- carbs (g)
- protein (g)
- kcal

### Score-bearing metrics
These are the main numeric inputs for the section scores:
- fat submetrics
- carb submetrics
- protein submetrics
- vitamins
- minerals
- pros
- cons

### Architecture note
Pros and cons are real score-bearing sections in the current target system.
They are not a later capped modifier layer.

## Metric polarity model

Do not assume every metric has a fully universal meaning.

Use this model instead:
- `higher_better`
- `higher_worse`
- `neutral_display_only`
- `not_applicable`

## Main entities

### food_types
One of the 11 major categories.

Suggested fields:
- id
- name
- slug
- palette_primary
- palette_secondary nullable
- icon_asset nullable
- philosophy
- status

### foods
Suggested fields:
- id
- name
- slug
- food_type_id
- default_image_asset nullable
- notes nullable
- status

### nutrient_profiles
Canonical raw data for a food.

Suggested fields:
- id
- food_id
- basis_value (`100`)
- basis_unit (`g`)
- source_name
- source_url nullable
- collected_at
- completeness_status (`complete`, `partial`, `incomplete`)

### metrics
Canonical metric registry.

Suggested fields:
- metric_key
- display_name
- unit
- default_polarity
- default_section_key
- description
- display_order

### rulesets
Versioned scoring policy for a food type.

Suggested fields:
- id
- food_type_id
- version
- name
- description
- status (`draft`, `active`, `retired`)
- created_at

### ruleset_metrics
One metric as interpreted inside one ruleset.

Suggested fields:
- id
- ruleset_id
- metric_key
- section_key (`fats`, `carbs`, `proteins`, `vitamins`, `minerals`)
- scoring_role (`scored`, `display_only`, `derived_only`)
- applicability (`required`, `optional`, `not_applicable`)
- weight
- polarity_override nullable
- narration_priority (`low`, `medium`, `high`)
- notes

Important implementation note:
- `weight = 0` means zero scoring contribution, not a fallback to `1`

### rule_bands
Threshold ladder for a scored submacro.

Suggested fields:
- id
- ruleset_metric_id
- band_label (`3_red`, `2_red`, `1_red`, `1_green`, `2_green`, `3_green`)
- min_value nullable
- max_value nullable
- unit
- score_value
- display_order
- explanation_template nullable

### context_item_rules
Rules for scoring pros and cons.

Suggested fields:
- id
- ruleset_id
- side (`pro`, `con`)
- impact_level (`minor`, `major`)
- score_value

### section_weights
Top-level section weights.

Suggested fields:
- id
- ruleset_id or ruleset_pack_version
- fats_weight
- carbs_weight
- proteins_weight
- vitamins_weight
- minerals_weight
- pros_weight
- cons_weight

Recommended default:
- all 7 sections use equal weights of `1/7`
- category differentiation should happen inside the ruleset, not by warping the final 7-way split

### protein_fallbacks
Bridge policy for the proteins section when amino-acid or bioavailability fields are weak, missing, or intentionally withheld.

Suggested fields:
- id
- ruleset_id
- metric_key (`protein_g_fallback`)
- weight
- bands
- notes nullable

### tier_thresholds
Versioned mapping from overall score to final tier.

Suggested fields:
- id
- version
- tier_label (`S`, `A`, `B`, `C`, `D`)
- min_score
- max_score
- notes nullable

Important note:
- thresholds should be calibrated per category after the ruleset architecture is stable enough to test against benchmark foods

## Default band scoring

Suggested default mapping for scored submacros:
- `3_red` = 0
- `2_red` = 20
- `1_red` = 40
- `1_green` = 60
- `2_green` = 80
- `3_green` = 100

Important:
- this is a resolved **good/bad color outcome** scale
- it is not a literal arrow-direction scale
- lower-is-better metrics can still resolve to green when low

## Default context scoring

Suggested default mapping:
- `minor_pro` = 50
- `major_pro` = 100
- `minor_con` = 50
- `major_con` = 100

Recommended section formulas:

```text
pros_section_score = average(pro_item_scores)
cons_severity_score = average(con_item_scores)
cons_section_score = 100 - cons_severity_score
```

## Score flow

1. Load canonical nutrient profile for a food.
2. Identify the food type.
3. Load the active ruleset for that type.
4. Load metric applicability, roles, weights, and thresholds.
5. Ignore `display_only` metrics for scoring.
6. For each scored submacro, resolve the matching category-specific band.
7. Convert the resolved band to a 0 to 100 score.
8. Apply metric weights.
9. Aggregate metric scores by section.
10. Score vitamins/minerals from DV% tiers.
11. Score pros and cons from major/minor item levels.
12. Apply `proteinFallback` when the proteins section would otherwise depend on weak proxy fields.
13. Average the 7 section scores using equal top-level weights.
14. Map the final score to the tier.
15. Generate derived outputs:
   - summary
   - explanation notes
   - final tier
16. Generate video payloads.

## Required output payloads

The ruleset system should generate:
- header-ready values
- section-ready values for all 7 video sections
- strongest positives
- strongest negatives
- short summary
- all 7 section scores
- overall score
- final tier
- explanation snapshot referencing the ruleset version used

## Example output shape

```json
{
  "header": {
    "foodName": "Almonds",
    "foodType": "Nuts",
    "kcal": 579,
    "basis": "Per 100g"
  },
  "sections": [
    { "key": "fats", "items": [] },
    { "key": "carbs", "items": [] },
    { "key": "proteins", "items": [] },
    { "key": "vitamins", "items": [] },
    { "key": "minerals", "items": [] },
    { "key": "pros", "items": [] },
    { "key": "cons", "items": [] }
  ],
  "scores": {
    "fats": 84,
    "carbs": 76,
    "proteins": 63,
    "vitamins": 58,
    "minerals": 81,
    "pros": 83,
    "cons": 50,
    "overall": 71
  },
  "finalTier": "B",
  "summary": "Strong fat quality and mineral density carry this food, while moderate cons keep it out of A tier."
}
```

## Versioning rule

Never overwrite rules in a way that destroys history.
Published videos should always be explainable using:
- the nutrient profile snapshot
- the food type
- the exact ruleset version
- the tier threshold version

## Calibration note

Tier tuning should be driven by anchor foods.
If obviously bad in-category foods are not landing in D, or elite in-category foods are not landing in S, the answer is to recalibrate the ruleset, not to hide the problem with arbitrary editorial adjustments.
