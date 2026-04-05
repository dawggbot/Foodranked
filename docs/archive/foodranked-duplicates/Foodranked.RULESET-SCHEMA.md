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
4. **Context rules**
   - Which pros/cons can affect rank, how much they can move it, and where the caps are
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
These are the main numeric inputs for the **base nutrition score**:
- fat submetrics
- carb submetrics
- protein submetrics
- vitamins
- minerals

### Context items
Pros/cons can still influence rank, but only through major flags.
They are not treated as normal weighted sections.

### Derived outputs
These are generated from the scored evidence:
- pros
- cons
- summary line
- final explanation

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

### rule_bands
Threshold ladder for a scored metric.

Suggested fields:
- id
- ruleset_metric_id
- band_label (`↓↓↓`, `↓↓`, `↓`, `↑`, `↑↑`, `↑↑↑`)
- min_value nullable
- max_value nullable
- unit
- score_value
- display_order
- explanation_template nullable

### section_weights
Top-level nutrition section weights.

Suggested fields:
- id
- ruleset_id or ruleset_pack_version
- fats_weight
- carbs_weight
- proteins_weight
- vitamins_weight
- minerals_weight

### context_rules
Context adjustment policy.

Suggested fields:
- id
- ruleset_id
- required_pros
- required_cons
- major_pro_score
- minor_pro_score
- minor_con_score
- major_con_score
- max_scoring_majors
- max_score_adjustment

### tier_thresholds
Versioned mapping from overall score to final tier.

Suggested fields:
- id
- version
- tier_label (`S`, `A`, `B`, `C`, `D`)
- min_score
- max_score
- notes nullable

## Default band scoring

Suggested default mapping:
- `↓↓↓` = -3
- `↓↓` = -2
- `↓` = -1
- `↑` = +1
- `↑↑` = +2
- `↑↑↑` = +3

There is no neutral zero band in v1. Each scored metric should lean clearly positive or negative inside its category context.

## Score flow

1. Load canonical nutrient profile for a food.
2. Identify the food type.
3. Load the active ruleset for that type.
4. Load metric applicability, roles, weights, and thresholds.
5. Ignore `display_only` metrics for scoring.
6. For each `scored` metric, resolve the matching threshold band.
7. Convert the band to score value.
8. Multiply by metric weight.
9. Aggregate metric scores by nutrition section.
10. Normalize each score-bearing section.
11. Apply nutrition section weights to compute the `baseScore`.
12. Apply the capped context adjustment.
13. Map the final score to the tier.
14. Generate derived outputs:
   - summary
   - explanation notes
   - final tier
15. Generate video payloads.

## Required output payloads

The ruleset system should generate:
- header-ready values
- section-ready values for all 7 video sections
- strongest positives
- strongest negatives
- short summary
- base score
- applied context adjustment
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
    "baseScore": 74,
    "contextAdjustment": 3,
    "overall": 77
  },
  "finalTier": "B",
  "summary": "Strong fat quality and mineral density carry this food, but protein usefulness is more moderate for the category."
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
If obviously bad in-category foods are not landing in D, or elite in-category foods are not landing in S, the answer is to recalibrate the ruleset — not to hide the problem with arbitrary editorial adjustments.
