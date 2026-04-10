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
5. tier thresholds

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
  "tierThresholds": [
    { "tier": "S", "min": 90, "max": 100 },
    { "tier": "A", "min": 78, "max": 89 },
    { "tier": "B", "min": 64, "max": 77 },
    { "tier": "C", "min": 45, "max": 63 },
    { "tier": "D", "min": 0, "max": 44 }
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

### 3. Prefer explicit applicability
Use:
- `required`
- `optional`
- `not_applicable`

If a metric is parked for future use but should not score today, keep `weight: 0` or move it to `not_applicable`.
A zero weight must mean zero contribution.

### 4. Keep context items separate from nutrient metrics
Do not force antioxidants, pesticide risk, sodium concerns, convenience tradeoffs, and similar contextual notes into the same metric array as nutrient data.

### 5. Keep top-level section weights equal by default
Use `sectionWeights` for all 7 sections.

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
4. use `proteinFallback` when direct protein-quality metrics are intentionally unavailable
5. average all 7 section scores into the final overall score
6. map the final score to the tier

That keeps the math explainable while matching the visible video structure.
