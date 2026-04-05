# Display Metric Sourcing Policy

This document defines how FoodRanked should fill every displayed metric on production food entries.

## Core rule

All displayed metrics are **core**.
That means every displayed metric should end in one of two states for a production-lane food file:
1. a trustworthy, defensible numeric value for the exact food identity being ranked
2. explicit `N/A` when the metric is none, negligible, or not defensibly sourceable for that exact identity

Do not silently remove display metrics.
Do not leave fake-precise placeholder numbers in late production drafts.

## Universal identity defaults for the database

These identity rules should apply across current and future FoodRanked food entries unless James explicitly overrides them for a specific case.

### Wholefoods
- wholefoods should use the most common public-facing raw/uncooked form
- all wholefood entries should use per-100g values for that raw/uncooked form
- cooked variations of wholefoods should not exist as canonical default entries
- the canonical database entry should describe the plain ingredient itself, not a common serving method

### Meats
- meats are wholefoods in this system and should also use raw forms
- do not keep cooked meat variations as canonical wholefood entries
- only keep cooked meat values when a specific prepared/cooked product is intentionally being ranked as its own separate food
- if a cooked source is found while researching a raw wholefood entry, treat it as a temporary research aid rather than the final canonical entry

### Oats
- oats means uncooked rolled oats
- do not treat generic raw oats as the final default if a rolled-oats-specific identity is intended
- do not keep separate generic-oats / instant-oats / cooked-oatmeal variants as default database entries unless the project explicitly decides to rank those as separate foods

### White rice
- white rice means uncooked white rice
- prefer the most common plain public-facing form
- enriched vs unenriched must be locked explicitly in the entry rather than implied
- do not keep multiple white-rice identity variants as default database entries unless the project explicitly decides to rank them separately

### Tuber distinction
- yam means yam
- sweet potato means sweet potato
- keep them as separate entries
- both should default to uncooked/raw values for wholefood handling
- when a food is commonly confused in public naming, the entry should still pick one canonical food identity and document the disambiguation clearly

### Prepared foods
- prepared/product foods should be ranked as they come
- for those entries, the prepared/product identity is the canonical one

## Universal sourcing rules for future food entries

These rules apply to every future production-lane food file.

### 1. Lock identity first
Before filling nutrition values, explicitly lock:
- raw vs cooked
- plain ingredient vs prepared product
- enriched / fortified / sweetened status where relevant
- skin / bone / peel / drained state where relevant
- public-facing canonical name and disambiguation notes

### 2. Prefer one canonical primary source row per entry
- use one best-fit primary source row for the base nutrient panel whenever possible
- record its durable id in the file
- if a different source is needed for a special metric, keep that as a metric-level override instead of mixing multiple base identities together

### 3. Use trustworthy source hierarchy consistently
For future entries, default source order is:
1. USDA FoodData Central
2. NCCDB
3. UK McCance & Widdowson / GOV nutrition tables when the exact identity is better represented there
4. manufacturer nutrition data only for clearly branded packaged products

### 4. Never use convenient drift
- do not borrow cooked values for a raw entry
- do not keep cooked-variation wholefood files in the active canonical lane
- do not borrow generic values for a more specific identity if the difference is meaningful
- do not borrow a nearby variety just to fill the box
- when the exact identity is not defensibly sourceable yet, use `N/A` rather than pretending

### 5. Separate standard nutrients from harder metrics
- standard nutrient panel should come from the locked canonical row where possible
- GI, amino-acid scoring, collagen, bioavailability, and similar harder metrics need their own explicit method/source rule
- if that extra rule is missing, display `N/A`

### 6. Keep production entries honest
A production-lane entry is only ready to be treated as final when:
- identity is locked
- canonical source row is locked
- required displayed metrics are either sourced numerically or explicitly `N/A`
- context claims are either source-linked, derived from locked metrics, or clearly marked editorial non-scoring
- the file no longer contains blocker language that contradicts the chosen canonical identity

## Decision rule for every displayed metric

For each metric on each food:

### Use a numeric value only if all are true
- the food identity is locked tightly enough
- the metric definition is clear enough
- the source is defensible for that exact food identity/state
- the value is not just an editorial guess or convenience placeholder

### Use `N/A` if any of these apply
- the metric is truly absent or biologically irrelevant for that food
- the amount is negligible enough that the project chooses not to display a numeric figure
- the exact food identity is unresolved
- the source quality is too weak or too indirect for a trustworthy display number
- the metric would require a hand-wavy proxy rather than a real source-backed value

## Source hierarchy

### Best sources for standard nutrient values
1. USDA FoodData Central
2. NCCDB
3. UK McCance & Widdowson / GOV nutrition tables where relevant
4. manufacturer label if the ranked item is a specific packaged product

Implementation note:
- when working inside this workspace, use the locally stored USDA FoodData Central API key from `TOOLS.md`
- do not duplicate the key into GitHub-facing docs or committed skill content

### Best sources for harder metrics
- glycemic index: exact form-specific GI sources or strong secondary compilations
- amino-acid / protein quality metrics: only if the method is explicit and reusable across foods
- collagen: only if the exact cut/state has a defensible source; otherwise `N/A`
- bioavailability: only if the project adopts a clear, repeatable sourcing/method policy; otherwise `N/A`
- food-specific compounds: use for context claims, not automatically as displayed metrics unless the display schema explicitly requires them

## Strong recommendation by metric class

### Usually numeric if identity is locked
- kcal
- fat_g
- carb_g
- protein_g
- saturated_fat_g
- cholesterol_mg
- starch_g
- fibre_g
- sugar_g
- vitamin/mineral DVs already in schema

### Numeric only with extra care
- omega3_mg
- polyunsaturated_fat_g
- glycemic_index
- essential_amino_acids_score
- nonessential_amino_acids_score

### Default to `N/A` unless method/source is strong
- collagen_g
- bioavailability_percent

## Negligible vs zero vs N/A

### Use `0` when
- the value is defensibly zero or effectively zero from a trustworthy source for that identity

### Use `N/A` when
- the metric is part of the schema but the project does not yet have a defensible exact value for that food identity
- the metric is not meaningfully sourceable for the current file state
- the project is refusing to pretend certainty where it does not exist

## Output contract for JSON

Preferred pattern for unsupported displayed metrics:

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
      "note": "Displayed as N/A because no defensible sourced method has been adopted yet for this metric on this exact food identity."
    }
  }
}
```

## Current production-lane implication

For the current audited production drafts:
- tomato is the closest near-finish file
- oats and white rice are more finishable for standard nutrients than for hard metrics like bioavailability
- chicken thigh should not regain collagen/bioavailability numbers until the exact identity/source problem is solved
- yam should not get aggressive hard-metric filling until the canonical yam identity decision is made

## Working principle

The target is not to force every box to contain a number.
The target is to make every displayed box either:
- numerically trustworthy
- or honestly `N/A`
