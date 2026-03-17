# RULESET-JSON-SHAPE

This file defines a practical machine-readable JSON shape for FoodRanked v1 rulesets.

## Goal

Create a JSON structure that is:
- simple enough to build quickly
- explicit enough to audit
- versionable
- aligned with the current repo logic

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
  "id": "nuts-v1",
  "foodType": "nuts",
  "version": 1,
  "status": "draft",
  "basis": {
    "value": 100,
    "unit": "g"
  },
  "sectionWeights": {
    "fats": 0.51,
    "carbs": 0.20,
    "proteins": 0.07,
    "vitamins": 0.07,
    "minerals": 0.15
  },
  "metricRules": [
    {
      "metricKey": "saturated_fat_g",
      "sectionKey": "fats",
      "scoringRole": "scored",
      "applicability": "required",
      "weight": 2,
      "polarity": "higher_worse",
      "bands": [
        { "label": "↓↓↓", "max": 3, "score": 3 },
        { "label": "↓↓", "min": 3, "max": 6, "score": 2 },
        { "label": "↓", "min": 6, "max": 9, "score": 1 },
        { "label": "↑", "min": 9, "max": 12, "score": -1 },
        { "label": "↑↑", "min": 12, "max": 18, "score": -2 },
        { "label": "↑↑↑", "min": 18, "score": -3 }
      ]
    }
  ],
  "contextRules": {
    "requiredPros": 3,
    "requiredCons": 3,
    "allowedItemKeys": [],
    "scoreMap": {
      "major_pro": 3,
      "minor_pro": 0,
      "minor_con": 0,
      "major_con": -3
    },
    "maxScoringMajors": 3,
    "maxScoreAdjustment": 9
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

### 1. Use signed scores in bands
Even if the label arrow looks positive or negative on-screen, the stored `score` should be explicit.
That keeps implementation simple.

### 2. Keep macro totals out of `metricRules` scoring
If included, they should be:
- `scoringRole: display_only`
- no score contribution

### 3. Prefer explicit applicability
Use:
- `required`
- `optional`
- `not_applicable`

### 4. Keep context items separate from nutrient metrics
Do not force antioxidants, pesticide risk, sodium concerns, etc. into the same metric array as nutrient data.

### 5. Keep section weights limited to nutrition sections
Use `sectionWeights` only for:
- fats
- carbs
- proteins
- vitamins
- minerals

Do **not** include `pros` or `cons` in `sectionWeights`.
Those are handled later through the capped context adjustment layer.

## Implementation note

The scorer should:
1. compute 5 nutrition section scores
2. combine them into a `baseScore`
3. apply only major contextual modifiers
4. cap context adjustment at `±9`
5. map the final score to the tier

That keeps the math explainable while still allowing a few genuinely important pros/cons to matter.
