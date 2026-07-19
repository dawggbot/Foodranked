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
- `not_applicable`

`neutral_display_only` is reserved for non-submacro display values such as kcal and macro totals.
Source-backed numeric submacros must use `higher_better` or `higher_worse` with a six-band arrow ladder.
Only N/A submacro values may remain neutral/no-arrow.
Shared submacro metrics must keep the same polarity in every food type so viewers do not have to relearn arrow direction. Use category weights, thresholds, or `not_applicable` for food-type differences instead of flipping polarity.

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

Important B-vitamin identity rule:
- `vitamin_b12_dv` is the canonical v1 Vitamin B score/display metric.
- Do not use generic `vitamin_b_dv`, `Vitamin B`, or B-complex labels in score outputs.
- Other B-vitamin facts, such as thiamin/B1 or niacin/B3, may exist only as source-backed raw facts if explicitly added to a future schema version; they are not v1 score-bearing Vitamin B metrics.

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
- context_angle
- forbidden_if_plain_section_recap (`true` by default)

Context item quality rule:
- Pros/cons must be bonus context, not a restatement of visible score sections.
- Valid `context_angle` values can include `absorbability`, `anti_nutrients`, `antioxidants`, `polyphenols`, `fermentation`, `named_compound`, `preparation`, `storage`, `convenience`, `texture`, `tolerance`, `sourcing`, `processing_burden`, `portion_behavior`, `meal_role`, and `culinary_role`.
- Do not use `section_recap` as a context angle. Titles such as `protein contribution is tiny`, `protein is basically absent`, `protein support is weak`, `mineral density is genuinely strong`, `elite mineral density`, and `vitamin C reputation is a real strength` are invalid because those ideas belong in the protein, mineral, or vitamin sections.
- A nutrient-linked item is valid only when it explains a separate food-specific angle beyond the visible score, such as a named compound, absorbability caveat, or distinctive meal role.

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
- all 7 scored content sections use equal weights of `1/7`
- category differentiation should happen inside the ruleset, not by warping the final 7-way split

### protein_fallbacks
Bridge policy for the proteins section when amino-acid or bioavailability fields are weak, missing, intentionally withheld, or below a useful protein amount.

Suggested fields:
- id
- ruleset_id
- metric_key (`protein_g_fallback`)
- weight
- bands
- notes nullable

Protein quality fields should only score when the protein amount is useful enough for the category and the food has source-backed `amino_acids_mg` values. EAA/NEAA scores must be derived by counting only amino-acid groups that clear the useful-amount thresholds in `config/amino-acid-thresholds.v1.json`; do not let amino-acid presence or old aggregate proxy fields create a misleading protein-quality win.

Important display rule:
- `protein_g_fallback` is a scoring and narration bridge, not a visible protein submacro row.
- The protein macro bubble already displays `protein_g`, so fallback protein grams must not be repeated as an on-screen submacro.

### protein_display_policies
Display contract for the visible protein rows.

Suggested fields:
- id
- ruleset_id
- policy_id (`protein-section-display.v1`)
- row_count (`4`)
- visible_rows
- hidden_fallback_metric_key (`protein_g_fallback`)
- missing_value_display (`N/A`)
- show_protein_fallback_as_visible_row (`false`)

Locked v1 visible row order:
1. `collagen_g`
2. `essential_amino_acids_score`
3. `nonessential_amino_acids_score`
4. `bioavailability_percent`

Protein display rules:
- Always keep those four visible row slots for the proteins section.
- A numeric protein row may display only when it is scored or defensibly source-backed for the exact food identity.
- If the useful-protein gate skips EAA, NEAA, or bioavailability, display that row as `N/A` with no arrow.
- If collagen is not source-backed for the exact food identity, display collagen as `N/A` with no arrow.
- A displayed `0` is valid only when the score actually ran or a source-backed raw metric is truly zero; missing, skipped, or withheld protein-quality fields must never be converted to `0`.
- `protein_g_fallback` may contribute to the proteins section score and narration when quality metrics are not usable, but it must not appear in `sections[].displayItems`.

### score_calibrations
Category-specific mapping from raw ruleset score to the shared comparable score scale.

Suggested fields:
- id
- ruleset_id
- version
- method (`piecewise_linear_raw_to_shared_tier_score`)
- input_score_key (`baseOverallScore`)
- output_score_key (`calibratedOverallScore`)
- notes nullable

### score_calibration_anchors
Piecewise-linear anchor points for `score_calibrations`.

Suggested fields:
- id
- score_calibration_id
- raw_score
- calibrated_score
- display_order

Important note:
- raw thresholds stay category-relative
- calibrated scores are the comparable pre-adjustment scores
- anchors should be refreshed from benchmark foods whenever category rule bands or metric weights change materially

### score_adjustments
Food-specific anomaly adjustments that apply after calibration and before tier lookup.

Suggested fields:
- food_id
- item_key
- label
- points (positive or negative)
- reason
- source (`manual`, `ruleset`, or `audit`)
- scope (`food_specific_anomaly`)

Use score adjustments sparingly. They are for explicit anomalies that the normal seven scored sections cannot represent fairly, such as unusually strong protein for a vegetable, unusually strong fat quality for a fruit, or a processed/fried/sweetened format whose real-world category fit is weaker than the visible sections imply.

### tier_thresholds
Versioned shared mapping from anomaly-adjusted overall score to final tier.

Suggested fields:
- id
- version
- tier_label (`S`, `A`, `B`, `C`, `D`)
- min_score
- max_score

### tier_score_map
Locked public display score for each final tier:
- `D = 20`
- `C = 40`
- `B = 60`
- `A = 80`
- `S = 100`
- notes nullable

Important note:
- the active v1 threshold map is shared across food types
- fairness comes from category-specific `score_calibrations`, not from different final tier cutoffs

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
- there is no neutral middle band; a numeric submacro must resolve to red or green

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
12. Apply `proteinFallback` when the proteins section would otherwise depend on weak proxy fields; keep the visible protein rows controlled by `proteinDisplay`.
13. Average the 7 scored content section scores using equal top-level weights to produce `baseOverallScore`.
14. Apply the active category `scoreCalibration` to produce `calibratedOverallScore`.
15. Apply food-specific `scoreAdjustments`, when present, to produce `anomalyAdjustedScore` / `rankingScore`.
16. Map `anomalyAdjustedScore` to the tier using shared `tierThresholds`.
17. Set public `overallScore` from `tierScoreMap`.
18. Generate derived outputs:
   - summary
   - explanation notes
   - final tier
19. Generate video payloads.

## Required output payloads

The ruleset system should generate:
- header-ready values
- section-ready values for all 7 scored content sections
- strongest positives
- strongest negatives
- short summary
- all 7 scored content section scores
- overall score
- base overall score
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
