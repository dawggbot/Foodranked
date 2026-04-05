# Production Food File Shape

This document defines the minimum JSON shape for a **production** FoodRanked food file.

The goal is not just to store numbers.
The goal is to make every production food entry:
- identity-locked
- provenance-backed
- reproducible
- auditable later when a score or video is questioned

Sample/test files can stay lightweight.
Production files cannot.

## Why this exists

The current sample foods are useful fixtures, but they do not yet lock:
- exact form
- exact preparation state
- exact source row
- exact claim confidence
- exact context-item provenance

That means a file can look polished while still being nutritionally ambiguous.

Examples of ambiguity this shape is meant to prevent:
- oats meaning groats vs rolled oats vs instant oats
- rice meaning raw vs cooked and enriched vs unenriched
- tomato meaning raw whole tomato vs sauce vs paste
- chicken thigh meaning skin-on vs skinless and raw vs cooked
- yam meaning a true yam vs a sweet potato naming mix-up

## Production JSON shape

```json
{
  "id": "oats-rolled-dry-usda-v1",
  "name": "Oats",
  "displayName": "Rolled Oats",
  "foodType": "grains",
  "status": "production",
  "basis": { "value": 100, "unit": "g", "state": "dry" },
  "identityLock": {
    "canonicalSlug": "rolled-oats-dry",
    "commonName": "rolled oats",
    "scientificOrCommodityName": null,
    "foodType": "grains",
    "variant": "rolled",
    "state": "dry",
    "preparation": "plain, uncooked",
    "ediblePortionOnly": true,
    "includesSkin": null,
    "includesBone": null,
    "includesPeel": null,
    "salted": false,
    "fortified": false,
    "enriched": false,
    "sweetened": false,
    "drained": null,
    "packingMedium": null,
    "cutOrFormat": null,
    "rawVsCooked": "raw",
    "disambiguationNotes": [
      "Do not substitute instant oats values.",
      "Do not substitute cooked oatmeal values."
    ]
  },
  "provenance": {
    "canonicalSource": {
      "sourceName": "USDA FoodData Central",
      "sourceUrl": "https://fdc.nal.usda.gov/",
      "sourceFoodId": "example-id",
      "sourceRecordVersion": null,
      "retrievedAt": "2026-04-02T00:00:00Z",
      "licensedUseNotes": null
    },
    "secondarySources": [],
    "acquisitionMethod": "manual_verification",
    "confidenceLevel": "medium",
    "verificationStatus": "source_row_locked",
    "reviewedBy": null,
    "reviewedAt": null,
    "changeNotes": [
      "Initial production identity lock created before final peer calibration."
    ]
  },
  "header": {
    "kcal": 389,
    "fat_g": 6.9,
    "carb_g": 66.3,
    "protein_g": 16.9
  },
  "metrics": {
    "saturated_fat_g": 1.2,
    "omega3_mg": 111,
    "polyunsaturated_fat_g": 2.5,
    "cholesterol_mg": 0,
    "starch_g": 55,
    "fibre_g": 10.6,
    "sugar_g": 1,
    "glycemic_index": 55,
    "collagen_g": null,
    "essential_amino_acids_score": 5,
    "nonessential_amino_acids_score": 7,
    "bioavailability_percent": 55,
    "vitamin_a_dv": 0,
    "vitamin_c_dv": 0,
    "vitamin_d_dv": 0,
    "vitamin_e_dv": 3,
    "vitamin_k_dv": 2,
    "vitamin_b12_dv": 0,
    "iron_dv": 26,
    "magnesium_dv": 44,
    "zinc_dv": 36,
    "calcium_dv": 5,
    "potassium_dv": 12
  },
  "metricProvenance": {
    "mode": "inherits_canonical_source",
    "metricOverrides": {
      "glycemic_index": {
        "sourceName": "example GI source",
        "sourceUrl": null,
        "sourceFoodId": null,
        "note": "GI may require a non-FDC source."
      }
    }
  },
  "contextItems": {
    "pros": [
      {
        "itemKey": "oats_beta_glucans",
        "impactLevel": "major",
        "scoreValue": 2,
        "title": "beta-glucans are a real category-level advantage",
        "explanation": "Oats bring unusually useful soluble fibre for a grain.",
        "evidenceType": "source_linked",
        "evidence": {
          "sourceName": "example review or canonical note",
          "sourceUrl": null,
          "citationNote": "Must point to an evidence basis for the claim.",
          "claimStrength": "supported"
        }
      }
    ],
    "cons": []
  },
  "scoreReadiness": {
    "identityLocked": true,
    "canonicalSourceLocked": true,
    "allRequiredMetricsPresent": true,
    "contextEvidenceReviewed": false,
    "categoryCalibrationStatus": "starter_only",
    "safeForProductionRanking": false
  },
  "sourceNotes": []
}
```

## Required top-level fields for production files

### 1. `status`
Use one of:
- `sample`
- `draft`
- `production`
- `retired`

A file without `status: "production"` should not be treated as production-safe.

### 2. `basis`
Add `state` in addition to value/unit when needed.

Minimum expectation:
```json
{ "value": 100, "unit": "g", "state": "raw" }
```

That prevents hidden basis drift.

### 3. `identityLock`
This is the most important addition.
It prevents false equivalence between similar but nutritionally different foods.

Minimum required fields:
- `canonicalSlug`
- `commonName`
- `foodType`
- `variant`
- `state`
- `preparation`
- `rawVsCooked`
- `ediblePortionOnly`
- `disambiguationNotes`

Use nullable booleans for fields that matter only in some categories:
- `includesSkin`
- `includesBone`
- `includesPeel`
- `salted`
- `fortified`
- `enriched`
- `sweetened`
- `drained`

## Universal identity defaults

Unless the project explicitly overrides a food, future production entries should follow these defaults:
- wholefoods use the most common public-facing raw/uncooked form
- meats default to raw forms
- oats means uncooked rolled oats
- white rice means uncooked white rice
- yam and sweet potato remain separate uncooked entries
- cooked variations of wholefoods are not canonical default entries
- prepared/product foods are ranked as they come

These defaults exist to keep the database understandable and to stop identity sprawl from creating multiple near-duplicate entries.

## Universal production-entry rules

Every future production entry should follow this order of operations:
1. lock the canonical food identity first
2. lock the primary source row second
3. fill standard nutrient values from that row
4. add metric-level overrides only where a different trustworthy source is genuinely required
5. use explicit `N/A` for unsupported displayed metrics rather than fake placeholders

### Canonical-entry rule
Each canonical wholefood entry should describe one plain ingredient identity only.
Do not mix:
- raw and cooked forms
- enriched and unenriched forms
- skin-on and skinless forms
- generic and specific variants

For wholefoods, the canonical active entry should be the raw/uncooked form.
If a cooked variation is later ranked, it should be created as a separate intentional prepared-state entry rather than replacing the raw wholefood baseline.

### Trustworthy-source rule
For future entries, the preferred source hierarchy is:
1. USDA FoodData Central
2. NCCDB
3. UK McCance & Widdowson / GOV nutrition tables when they better match the intended public-facing identity
4. manufacturer nutrition data for branded packaged foods only

### Hard-metric rule
GI, amino-acid scores, collagen, bioavailability, and similarly interpretation-heavy metrics must either:
- cite a repeatable defensible method/source for the exact identity
- or remain `null` with explicit `N/A` provenance notes

### Finalization rule
A production-lane file should not remain full of unresolved-decision wording once the project has chosen the canonical identity.
Once the decision is made, update:
- `id`
- `displayName`
- `identityLock`
- `verificationStatus`
- `primaryRemainingBlockers`
- `sourceNotes`
so the file reflects the chosen final direction rather than the old debate.

## Identity-lock examples by risky food

### Oats
Must distinguish at least:
- groats
- rolled oats
- instant oats
- cooked oatmeal

### White rice
Must distinguish at least:
- long-grain vs short-grain if materially different source rows are used
- raw dry rice vs cooked rice
- enriched vs unenriched

### Tomato
Must distinguish at least:
- raw tomato
- canned tomato
- sauce
- paste

### Chicken thigh
Must distinguish at least:
- raw vs cooked
- skin-on vs skinless
- bone-in vs edible portion only

### Yam
Must distinguish at least:
- true yam species vs sweet potato naming confusion

## Provenance requirements

### `provenance.canonicalSource`
Required for production files.

Minimum required fields:
- `sourceName`
- `sourceUrl` or a durable citation note elsewhere
- `sourceFoodId` when the dataset provides one
- `retrievedAt`

### `metricProvenance`
Needed because some metrics may come from outside the main nutrient row.
This is especially relevant for:
- glycemic index
- amino acid quality proxies
- bioavailability estimates
- special compounds discussed in context items

Default pattern:
- all standard nutrient values inherit canonical source
- special metrics declare explicit overrides when needed

## Context-item evidence requirements

Production context items should not stay as purely manual editorial lines.
Each context item should eventually be one of:
- `source_linked`
- `derived_from_canonical_metrics`
- `editorial_but_non_scoring`

For any scoring context item, include an `evidence` object.

Minimum evidence fields:
- `sourceName`
- `citationNote` or `sourceUrl`
- `claimStrength`

Suggested `claimStrength` values:
- `supported`
- `plausible`
- `editorial`
- `contested`

## Metric display-status contract

Important output rule:
**If a metric is part of the final displayed schema, the field should usually stay present even when the value is not defensibly known yet.**
Do not solve provenance problems by silently dropping display fields.

Why this matters:
- the final videos are expected to show the listed nutrition fields consistently
- a missing field creates schema drift between foods
- explicit uncertainty is more honest than fake precision

### Recommended states for displayed metrics

#### 1. Sourced numeric value
Use when the metric has a defensible value.
Example:
```json
"glycemic_index": 15
```

#### 2. Explicit unsupported / `N/A` display state
Use when the metric is part of the output schema but does not yet have a defensible value for the current food identity.
Preferred pattern:
- keep the metric key in `metrics`
- set the value to `null`
- explain the unsupported state in `metricProvenance.metricOverrides`

Example:
```json
"metrics": {
  "bioavailability_percent": null
},
"metricProvenance": {
  "mode": "inherits_canonical_source_with_exceptions",
  "metricOverrides": {
    "bioavailability_percent": {
      "sourceName": "unsupported_for_current_contract",
      "sourceUrl": null,
      "sourceFoodId": null,
      "note": "Displayed as N/A until the project adopts a defensible sourced method for this metric."
    }
  }
}
```

#### 3. Placeholder scaffolding state
Avoid this state in late production drafts.
A numeric placeholder that looks real is worse than explicit `N/A`.
If a draft still contains scaffolding numbers, the file should say so plainly and be queued either for:
- replacement with a real sourced number, or
- conversion to explicit unsupported / `N/A`

### Rule of thumb
- **keep field** if the videos/display schema expects it
- **use `null` + provenance note** if the value is not yet defensible
- **never leave a fake-precise placeholder number** just because the schema wants a slot

## Score-readiness gate

A food file should not be treated as rank-ready until all of these are clear:
- `identityLocked`
- `canonicalSourceLocked`
- `allRequiredMetricsPresent`
- `contextEvidenceReviewed`
- `categoryCalibrationStatus`

If `safeForProductionRanking` is false, the system should still be able to score it for internal testing, but not present it as production-safe truth.

## Minimal file policy by maturity stage

### Sample
Allowed:
- loose `sourceNotes`
- no formal provenance object
- manual context items

### Draft
Required:
- `identityLock`
- `provenance.canonicalSource`
- `scoreReadiness`

### Production
Required:
- full identity lock
- canonical source row id
- explicit metric provenance strategy
- evidence-reviewed scoring context items
- category calibration status that is better than `starter_only`

## Practical recommendation

Keep current `.sample.json` files as fixtures.
Do **not** quietly upgrade them into production.

Instead, introduce a second lane later:
- `foods/*.sample.json` for fixtures
- `foods/production/*.json` for identity-locked, provenance-backed entries

That makes maturity obvious at a glance.
