# RULESET-JSON-SHAPE

This file defines a practical machine-readable JSON shape for FoodRanked v1 rulesets.

## Goal

Create a JSON structure that is:
- simple enough to build quickly
- explicit enough to audit
- versionable
- aligned with the current target scoring model

## Design principle

Keep the JSON split into:
1. ruleset identity
2. section weights
3. metric rules
4. context-item rules
5. score calibration
6. tier thresholds

## Recommended v1 JSON shape

```json
{
  "id": "nuts-v2",
  "foodType": "nuts",
  "version": 2,
  "status": "draft",
  "basis": {
    "value": 100,
    "unit": "g"
  },
  "sectionWeights": {
    "fats": 0.142857,
    "carbs": 0.142857,
    "proteins": 0.142857,
    "vitamins": 0.142857,
    "minerals": 0.142857,
    "pros": 0.142857,
    "cons": 0.142857
  },
  "metricRules": [
    {
      "metricKey": "saturated_fat_g",
      "sectionKey": "fats",
      "scoringRole": "scored",
      "applicability": "required",
      "weight": 3,
      "polarity": "higher_worse",
      "bands": [
        { "label": "3_green", "max": 2, "score": 100 },
        { "label": "2_green", "min": 2, "max": 4, "score": 80 },
        { "label": "1_green", "min": 4, "max": 6, "score": 60 },
        { "label": "1_red", "min": 6, "max": 9, "score": 40 },
        { "label": "2_red", "min": 9, "max": 12, "score": 20 },
        { "label": "3_red", "min": 12, "score": 0 }
      ]
    }
  ],
  "contextRules": {
    "requiredPros": 3,
    "requiredCons": 3,
    "scoreMap": {
      "minor_pro": 50,
      "major_pro": 100,
      "minor_con": 50,
      "major_con": 100
    },
    "processingPenaltyKeys": ["processing_penalty"]
  },
  "proteinFallback": {
    "metricKey": "protein_g_fallback",
    "weight": 2,
    "bands": [
      { "label": "3_red", "max": 6, "score": 0 },
      { "label": "2_red", "min": 6, "max": 8, "score": 20 },
      { "label": "1_red", "min": 8, "max": 10, "score": 40 },
      { "label": "1_green", "min": 10, "max": 12.5, "score": 60 },
      { "label": "2_green", "min": 12.5, "max": 15.5, "score": 80 },
      { "label": "3_green", "min": 15.5, "score": 100 }
    ]
  },
  "proteinDisplay": {
    "policyId": "protein-section-display.v1",
    "rowCount": 4,
    "visibleRows": [
      "collagen_g",
      "essential_amino_acids_score",
      "nonessential_amino_acids_score",
      "bioavailability_percent"
    ],
    "hiddenFallbackMetricKey": "protein_g_fallback",
    "missingValueDisplay": "N/A",
    "showProteinFallbackAsVisibleRow": false
  },
  "scoreCalibration": {
    "version": 1,
    "method": "piecewise_linear_raw_to_shared_tier_score",
    "input": "baseOverallScore",
    "output": "calibratedOverallScore",
    "anchors": [
      { "raw": 0, "calibrated": 0 },
      { "raw": 29.7171, "calibrated": 20 },
      { "raw": 39.9475, "calibrated": 40 },
      { "raw": 42.7319, "calibrated": 60 },
      { "raw": 49.8098, "calibrated": 80 },
      { "raw": 100, "calibrated": 100 }
    ],
    "notes": "Maps category-calibrated benchmark boundaries onto shared Slop/D/C/B/A/S score bands."
  },
  "tierScoreMap": {
    "Slop": -20,
    "D": 20,
    "C": 40,
    "B": 60,
    "A": 80,
    "S": 100
  },
  "tierThresholds": [
    { "tier": "S", "min": 80, "max": 100 },
    { "tier": "A", "min": 61, "max": 79.9999 },
    { "tier": "B", "min": 40, "max": 60.9999 },
    { "tier": "C", "min": 20, "max": 39.9999 },
    { "tier": "D", "min": 0, "max": 19.9999 },
    { "tier": "Slop", "min": -100, "max": -0.0001 }
  ]
}
```

## Practical rules

### 1. Use resolved color-band scores for submacros
Store the final scoring outcome explicitly.
That keeps implementation simple and avoids confusing arrow direction with score direction.

Use:
- `3_red = 0`
- `2_red = 20`
- `1_red = 40`
- `1_green = 60`
- `2_green = 80`
- `3_green = 100`

### 2. Keep macro totals out of `metricRules` scoring
If included, they should be:
- `scoringRole: display_only`
- no score contribution

### 2a. Keep shared submacro polarity stable
A given submacro keeps the same viewer-facing polarity in every food type. For example, `starch_g` stays `higher_better`; categories that care less about starch should adjust weight, thresholds, or applicability instead of flipping the arrow direction.

### 2b. Keep Vitamin B locked to B12
The v1 Vitamin B score/display slot is `vitamin_b12_dv`.
Do not add `vitamin_b1_dv`, `vitamin_b3_dv`, generic `vitamin_b_dv`, or B-complex metrics to score-bearing `metricRules` unless a future schema version explicitly adds and names those nutrients.
Generated narration/subtitles must say `Vitamin B12` whenever `vitamin_b12_dv` is selected.

### 3. Prefer explicit applicability
Use:
- `required`
- `optional`
- `not_applicable`

If a source-backed submacro has a numeric value for any food in that food type, it must not be parked as `not_applicable`; give it a six-band arrow ladder so it displays as red or green.
Use `not_applicable` only when the metric is genuinely N/A for that food type's entries.
A zero weight must mean zero contribution.
Visible macro subrows may display `N/A` only when the main macro for that section also displays `N/A`; any visible numeric subrow must resolve an arrow indicator.

### 3a. Lock the protein section display contract
The visible protein submacro rows are not inferred from whatever scored the protein section.
Every v1 ruleset should include `proteinDisplay`, and it should lock these four visible rows in this order:

1. `collagen_g`
2. `essential_amino_acids_score`
3. `nonessential_amino_acids_score`
4. `bioavailability_percent`

The related `proteinFallback.metricKey` is intentionally hidden from the visible protein row list:
- `protein_g_fallback` may score the proteins section when amino-acid quality is missing, skipped by the useful-protein gate, or intentionally withheld.
- it may guide narration, because the protein amount is still relevant context
- it must not be displayed as a protein submacro row, because the protein macro bubble already displays `protein_g`

Final production entries fill missing protein-quality fields from exact-food database data first, then exact-identity Google research with AI Overview values checked against a linked or corroborating source, and a source-backed protein analogue only as the last resort. Analogue-derived EAA/NEAA scores require source-backed `amino_acids_mg`; provenance records the matched identity, preparation relationship, and derivation.
Plant collagen resolves to `0g`. Bioavailability may use food-specific research or a documented category estimate.
Display defaults of `0g`, `0/9`, `0/11`, and `0%` remain draft/runtime safeguards. They must not be the unreviewed basis of a finalized entry.
Finished narration states the selected production values confidently while the data layer preserves whether each value was exact, analogue-derived, or estimated.

### 4. Keep context items separate from nutrient metrics
Do not force antioxidants, pesticide risk, sodium concerns, convenience tradeoffs, and similar contextual notes into the same metric array as nutrient data.

### 4a. Keep pros/cons out of section-recap territory
Pros/cons should read as bonus context, practical caveats, or food-specific fun facts. They must not simply repeat visible score sections such as protein, minerals, vitamins, macro totals, or submacro arrows.

Allowed context angles include:
- absorbability and anti-nutrients
- antioxidants, polyphenols, fermentation, or named compounds
- sourcing, tolerance, preparation, storage, processing burden, convenience, portion behavior, meal role, texture, or culinary role

Plain recap titles such as `protein contribution is tiny`, `protein is basically absent`, `protein support is weak`, `mineral density is genuinely strong`, `elite mineral density`, and `vitamin C reputation is a real strength` should be treated as invalid context copy. A nutrient-linked item is acceptable only when it adds a separate angle beyond the visible score.

### 5. Keep top-level section weights equal by default
Use `sectionWeights` for all 7 scored content sections.

Recommended default:
- fats = `1/7`
- carbs = `1/7`
- proteins = `1/7`
- vitamins = `1/7`
- minerals = `1/7`
- pros = `1/7`
- cons = `1/7`

Food-type weighting should usually happen through:
- metric applicability
- metric weight
- band thresholds
- category-specific protein fallback bands where protein-quality proxies are not trusted yet

not by changing the final top-level split.

### 6. Keep public score values tied to the tier
The public `overallScore` is the tier display value, not the fine-grained ranking score:
- `D = 20`
- `C = 40`
- `B = 60`
- `A = 80`
- `S = 100`

Keep the fine-grained score in `calibratedOverallScore` and `anomalyAdjustedScore` / `rankingScore`.

### 7. Use food-specific anomaly adjustments sparingly
Food files may include `scoreAdjustments[]` when a visible 7-section score cannot fairly represent a true outlier.

Each adjustment should include:
- `itemKey`
- `label`
- `points`
- `reason`
- `source`
- `scope`

Use positive adjustments for unusually strong category-breaking traits, such as a fruit with a serious unsaturated-fat profile or a vegetable with unusually meaningful protein support. Use negative adjustments for formats where normal section math over-rewards the food, such as fried tuber snacks, sweet sauces, candy-style bars, or heavily processed convenience products.

## Implementation note

The scorer should:
1. compute submacro section scores from resolved color bands
2. compute vitamin/mineral section scores from DV% tiers
3. compute pros/cons as first-class sections from major/minor levels
4. derive EAA/NEAA scores from exact-food or closest-defensible-analogue source-backed `amino_acids_mg` and the useful-amount threshold policy, never from trace presence or old aggregate proxy fields; source thresholds include a 100mg essential material floor and a 500mg nonessential material floor
5. use `proteinFallback` when the food fails the useful-protein gate, while finalized foods with useful protein complete visible protein rows through exact data, source-backed analogues, or documented estimates
6. average all 7 scored content section scores into `baseOverallScore`
7. apply `scoreCalibration` to produce `calibratedOverallScore`
8. apply any food-specific `scoreAdjustments` to produce `anomalyAdjustedScore` / `rankingScore`
9. map `anomalyAdjustedScore` to the tier with shared `tierThresholds`
10. set public `overallScore` from `tierScoreMap`; the special `Slop` tier displays a negative score

That keeps the math explainable while matching the visible video structure.
