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
  "scoreCalibration": {
    "version": 1,
    "method": "piecewise_linear_raw_to_shared_tier_score",
    "input": "baseOverallScore",
    "output": "overallScore",
    "anchors": [
      { "raw": 0, "calibrated": 0 },
      { "raw": 29.7171, "calibrated": 20 },
      { "raw": 39.9475, "calibrated": 40 },
      { "raw": 42.7319, "calibrated": 60 },
      { "raw": 49.8098, "calibrated": 80 },
      { "raw": 100, "calibrated": 100 }
    ],
    "notes": "Maps category-calibrated benchmark boundaries onto shared D/C/B/A/S 20-point score bands."
  },
  "tierThresholds": [
    { "tier": "S", "min": 80, "max": 100 },
    { "tier": "A", "min": 60, "max": 79.9999 },
    { "tier": "B", "min": 40, "max": 59.9999 },
    { "tier": "C", "min": 20, "max": 39.9999 },
    { "tier": "D", "min": 0, "max": 19.9999 }
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

### 3. Prefer explicit applicability
Use:
- `required`
- `optional`
- `not_applicable`

If a source-backed submacro has a numeric value for any food in that food type, it must not be parked as `not_applicable`; give it a six-band arrow ladder so it displays as red or green.
Use `not_applicable` only when the metric is genuinely N/A for that food type's entries.
A zero weight must mean zero contribution.
Only N/A submacro rows may display without an arrow indicator.

### 4. Keep context items separate from nutrient metrics
Do not force antioxidants, pesticide risk, sodium concerns, convenience tradeoffs, and similar contextual notes into the same metric array as nutrient data.

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

## Implementation note

The scorer should:
1. compute submacro section scores from resolved color bands
2. compute vitamin/mineral section scores from DV% tiers
3. compute pros/cons as first-class sections from major/minor levels
4. derive EAA/NEAA scores from source-backed `amino_acids_mg` and the useful-amount threshold policy, never from trace presence or old aggregate proxy fields
5. use `proteinFallback` when direct protein-quality metrics are intentionally unavailable or the food fails the useful-protein gate, so protein amount still resolves to an arrow band
6. average all 7 scored content section scores into `baseOverallScore`
7. apply `scoreCalibration` to produce the calibrated display `overallScore`
8. map the calibrated `overallScore` to the tier with shared `tierThresholds`

That keeps the math explainable while matching the visible video structure.
