# FOODRANKED-SCORING-SYSTEM

## Goal

Design a scoring model that is:
- fair across very different food types
- explainable on-video
- stable enough to be trusted
- flexible enough to refine later
- simple enough to maintain

## Core philosophy

FoodRanked should not judge every food by one universal ideal.
It should judge foods by **how well they perform within their category**.

That means the scoring system has 4 layers:
1. **Canonical facts** — raw per-100g nutrition data with explicit units
2. **Category ruleset** — thresholds, applicability, polarity, and weights for that food type
3. **Score computation** — section scores and overall tier
4. **Narrative derivation** — pros, cons, summary, and explanation payloads

## Locked assumptions
- one food belongs to one primary food type
- foods are judged per 100g
- final rank is one of: `S`, `A`, `B`, `C`, `D`
- output must support the locked 7 video sections:
  1. fats
  2. carbs
  3. proteins
  4. vitamins
  5. minerals
  6. pros
  7. cons

## Important scoring rule

### Display-only metrics
These are important for the viewer but do **not** directly affect the score:
- total fat
- total carbs
- total protein
- kcal

These are header / macro-context values.

### Score-bearing metrics
The actual score should come from:
- fat submetrics
  - saturated fat
  - omega 3
  - polyunsaturated fat
  - cholesterol
- carb submetrics
  - starch
  - fibre
  - sugar
  - glycemic index
- protein submetrics
  - collagen
  - essential amino acids
  - non-essential amino acids
  - bioavailability
- vitamins
- minerals

### Derived outputs
These are generated from the score breakdown and explanation rules:
- pros
- cons
- summary line
- final explanation

In v1, pros and cons should be **derived outputs**, not a separate primary scoring engine.
This avoids double-counting.

## Step 1: metric polarity and applicability

Do not treat every metric as universally meaningful in every category.

Use these states:
- `higher_better`
- `higher_worse`
- `neutral_display_only`
- `not_applicable`

Examples:
- sugar: usually `higher_worse`
- fibre: usually `higher_better`
- glycemic index: usually `higher_worse`
- collagen: often `not_applicable` for plant categories
- cholesterol: often `not_applicable` for plant categories
- macro grams: usually `neutral_display_only`

## Step 2: threshold band system

Each scored metric in a category-specific ruleset stores thresholds using the 6-band ladder:

- `↓↓↓`
- `↓↓`
- `↓`
- `↑`
- `↑↑`
- `↑↑↑`

Recommended numeric mapping:

- `↓↓↓ = -3`
- `↓↓ = -2`
- `↓ = -1`
- `↑ = +1`
- `↑↑ = +2`
- `↑↑↑ = +3`

There is no zero band on purpose. Every tracked metric should lean clearly positive or negative for the category.

## Step 3: score-bearing sections

The scoring engine should aggregate into 5 score-bearing sections:
- fats
- carbs
- proteins
- vitamins
- minerals

The video still has 7 sections, but:
- `pros` is a derived presentation section
- `cons` is a derived presentation section

## Step 4: section weighting

Recommended v1 default overall weighting:

- fats: **22%**
- carbs: **22%**
- proteins: **22%**
- vitamins: **17%**
- minerals: **17%**

Why this split:
- macro-adjacent submetrics drive much of category identity
- micronutrients still matter heavily
- the model remains understandable and auditable

### Category tuning rule
Food types should usually differ by changing:
- metric applicability
- metric weights
- narration priority

Prefer this over radically different top-level section formulas for every category.

Examples:
- nuts can heavily weight omega 3 and polyunsaturated fat inside fats
- grains can heavily weight fibre and glycemic index inside carbs
- meats can heavily weight essential amino acids and bioavailability inside proteins
- vegetables can heavily weight vitamins and minerals through metric weights rather than a brand-new math system

## Step 5: metric weighting

Each scored metric gets a weight from 1 to 3.

Suggested meaning:
- **1** = minor signal
- **2** = important signal
- **3** = major category-defining signal

Example for a `nuts` ruleset:
- omega 3 = 3
- polyunsaturated fat = 3
- fibre = 2
- sugar = 2
- saturated fat = 2
- glycemic index = 1
- essential amino acids = 2
- bioavailability = 2
- key minerals = 2 or 3

## Step 6: section score calculation

For each scored metric:

```text
weighted_metric_score = band_score × metric_weight
```

For each score-bearing section:

```text
section_raw_score = sum(weighted_metric_scores)
section_max_score = sum(3 × metric_weight for each scored metric in section)
section_normalized = ((section_raw_score + section_max_score) / (2 × section_max_score)) × 100
```

This converts each section onto a 0–100 scale.

Metrics marked `not_applicable` are excluded.
Metrics marked `display_only` are ignored by scoring.

## Step 7: overall score calculation

```text
overall_score =
  fats_score × 0.22 +
  carbs_score × 0.22 +
  proteins_score × 0.22 +
  vitamins_score × 0.17 +
  minerals_score × 0.17
```

Round to nearest whole number for display.

## Step 8: tier mapping

Recommended v1 tier thresholds:

- **S** = 90–100
- **A** = 78–89
- **B** = 64–77
- **C** = 45–63
- **D** = 0–44

Why these ranges:
- `S` stays rare and meaningful
- `A` still feels genuinely strong
- `B` represents solid / decent
- `C` represents weak or mixed
- `D` represents poor category fit

## Step 9: pros / cons generation

Generate `pros` and `cons` from the score breakdown.

### Pros
Take the strongest positive scored signals.
Prefer:
- `↑↑↑`
- `↑↑`
- then strongest `↑`

### Cons
Take the strongest negative scored signals.
Prefer:
- `↓↓↓`
- `↓↓`
- then strongest `↓`

### Editorial/context rule
Some foods may justify short context-aware notes that are not captured cleanly by the core nutrient table.
Examples:
- heme iron absorbability
- antioxidants
- polyphenols
- sodium concerns
- agricultural concerns

In v1 these should be treated as **editorial explanation notes** or optional future overrides, not a separate score source.

### Output style
Convert pros/cons into short viewer-friendly lines, not raw metric names.

Example:
- Pro: `excellent omega-3 content for this category`
- Pro: `strong fibre density`
- Con: `sugar is higher than ideal here`
- Con: `bioavailability is weaker than stronger contenders`

## Step 10: narration-friendly explanation rules

Every scored food should produce:
- 1 short overall summary
- top 2–3 pros
- top 2–3 cons
- section highlights
- final tier explanation

The summary should synthesize what the earlier sections and contextual pros/cons mean together.
It should not be mistaken for the pros/cons section itself.

Example summary shape:

```text
Strong fat quality and fibre carry this food, but weaker protein usefulness keeps it out of S tier.
```

## Step 11: missing-data policy

Missing values must not silently break fairness.

Recommended v1 rule:
- if a metric is `not_applicable`, exclude it fully
- if a metric is `optional` and missing, exclude it from that section denominator
- if a metric is `required` and missing, mark the food as `incomplete` and block final scoring

This prevents fake precision.

## Step 12: score outputs needed by the tool

The scoring engine should output:
- header-ready values
- section-ready metric payloads
- raw band results
- weighted contributions
- section scores
- overall score
- final tier
- generated pros
- generated cons
- short summary
- ruleset version used

## Step 13: why this model is a good v1

This system is good because it is:
- strict enough to be real
- flexible enough for 11 categories
- easy to explain visually
- easy to version
- cleanly separated from presentation logic

## Open questions for later refinement
- Should some vitamins/minerals later contribute only as bonuses instead of full section scores?
- Should calories influence final score directly or stay header-only?
- Should editorial pros/cons ever affect score in v2, or remain display-only forever?
- Should tier thresholds later be tuned using real scored-food distributions?
core directly or stay header-only?
- Should editorial pros/cons ever affect score in v2, or remain display-only forever?
- Should tier thresholds later be tuned using real scored-food distributions?
-food distributions?
