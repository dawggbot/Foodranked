# RULESET-JSON-SHAPE

This file defines a practical machine-readable JSON shape for FoodRanked v1 rulesets.

## Goal

Create a JSON structure that is:
- simple enough to build quickly
- explicit enough to audit
- versionable
- aligned with the current docs

## Design principle

Keep the JSON split into:
1. ruleset identity
2. section weights
3. metric rules
4. context-item rules
5. tier thresholds

## Recommended v1 JSON shape

This file still describes **ruleset JSON** rather than food-entry JSON.
For the production food-entry contract, see `docs/nutrition-audit/production-food-file-shape.md`.

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
    "fats": 0.18,
    "carbs": 0.18,
    "proteins": 0.18,
    "vitamins": 0.14,
    "minerals": 0.14,
    "pros": 0.09,
    "cons": 0.09
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
      "major_pro": 2,
      "minor_pro": 1,
      "minor_con": -1,
      "major_con": -2
    }
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

### 5. Treat provenance as required before production claims
Production food files should carry explicit source metadata for canonical values, including at minimum:
- `sourceName`
- `sourceUrl` or source citation note
- `sourceFoodId` or equivalent row identifier when available
- `collectedAt`
- `confidenceLevel`
- a locked food identity/form description

That means provenance is not enough by itself.
The file must also say exactly what was sourced.

### 6. Add identity lock before promoting any sample into production
Production food files should include a dedicated identity block that resolves questions like:
- raw vs cooked
- dry vs prepared
- skin-on vs skinless
- enriched vs unenriched
- fortified vs not fortified
- instant/refined/rolled/whole format differences

Recommended location:
- `identityLock` in the food JSON
- `provenance` for source-row lock
- `scoreReadiness` for production gating

## Recommended starter files

Use this folder layout:

```text
rulesets/
  nuts.v1.json
  seeds.v1.json
  grains.v1.json
foods/
  production/
    PRODUCTION-FOOD.template.json
contexts/
  context-items.catalog.json
```

## Suggested starter categories

Best first categories to implement:
1. **nuts**
   - already has clear threshold drafts
   - rich enough to test fat + fibre + mineral weighting
2. **grains**
   - good test of carb-quality logic
   - useful for GI/fibre/starch handling
3. **meats** or **vegetables**
   - meats test animal-protein logic and not-applicable carbs
   - vegetables test micronutrient-heavy scoring

If you want the cleanest initial spread, use:
- nuts
- grains
- vegetables

That gives you:
- dense-fat category
- dense-carb category
- micronutrient-first category

## Implementation note

The first code pass should support:
- load food JSON
- load one ruleset JSON
- score nutrient sections
- score context items
- output normalized sections + final tier + summary payload

That is enough to make the project feel real.
