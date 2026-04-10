# FOODRANKED-SCORING-SYSTEM

## Goal

Design a scoring model that is:
- fair across very different food types
- explainable on-video
- stable enough to be trusted
- flexible enough to refine later
- simple enough to maintain
- calibratable against real benchmark foods

## Core philosophy

FoodRanked should not judge every food by one universal ideal.
It should judge foods by **how well they perform within their category**.

That means the scoring system has 4 layers:
1. **Canonical facts** — raw per-100g nutrition data with explicit units
2. **Category ruleset** — thresholds, applicability, polarity, and weights for that food type
3. **Score computation** — 7 section scores and one final overall score
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
- the on-video section order and the score structure should stay aligned
- overall score is for display/review/header context, not something the narration has to say out loud
- once a scored result reaches the script generator, website/script review surfaces should inherit from that generated output rather than from separate hand-written copies

## Important scoring distinction

### Display-only metrics
These are important for the viewer but do **not** directly affect the score:
- total fat
- total carbs
- total protein
- kcal

These are header / macro-context values.

### Score-bearing metrics
These are the real inputs used to build the section scores:
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
- contextual pros
- contextual cons

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

## Step 2: submacro band system

Only **submacros** use the 6-band arrow-color ladder.
This applies to:
- fat submetrics
- carb submetrics
- protein submetrics

Important clarification:
- submacro scoring is based on the **resolved good/bad color outcome**
- it is **not** based on literal arrow direction
- so a lower-is-better metric like saturated fat can still resolve to a green result when low

Each scored submacro in a category-specific ruleset stores thresholds that resolve to one of these 6 outcomes:
- 3 red
- 2 red
- 1 red
- 1 green
- 2 green
- 3 green

Numeric mapping:
- `3_red = 0`
- `2_red = 20`
- `1_red = 40`
- `1_green = 60`
- `2_green = 80`
- `3_green = 100`

There is no neutral middle band on purpose.
Every scored submacro should land in a clearly good or clearly bad visual state for its category.

## Step 3: vitamin and mineral DV scoring

Vitamins and minerals must be scored from **DV% bar fill**, not arrow bands.

Use this rule:

```text
metric_points = min(floor(DV_percent / 10), 10)
metric_score = metric_points × 10
```

Examples:
- 0 to 9% DV = 0
- 10 to 19% DV = 10
- 20 to 29% DV = 20
- 47% DV = 40
- 90 to 99% DV = 90
- 100%+ DV = 100

Metric weights still apply at the section level.

## Step 4: pros and cons scoring

Pros and cons are not a post-score adjustment layer.
They are real score-bearing sections.

Required default structure:
- exactly 3 pros
- exactly 3 cons

Each item has a 2-tier classification:
- `minor`
- `major`

Recommended default score values:
- `minor_pro = 50`
- `major_pro = 100`
- `minor_con = 50`
- `major_con = 100`

### Pros section

```text
pros_section_score = average(pro_item_scores)
```

Examples:
- 3 major pros = 100
- 2 major + 1 minor = 83.3
- 1 major + 2 minor = 66.7
- 3 minor pros = 50

### Cons section

Cons should still behave like a negative force while remaining a normal 0 to 100 section.

```text
cons_severity_score = average(con_item_scores)
cons_section_score = 100 - cons_severity_score
```

Examples:
- 3 major cons = 0
- 2 major + 1 minor = 16.7
- 1 major + 2 minor = 33.3
- 3 minor cons = 50

This keeps cons as a first-class section while still making worse cons reduce the final average.

## Step 5: score-bearing sections

The scoring engine aggregates across all 7 visible video sections:
- fats
- carbs
- proteins
- vitamins
- minerals
- pros
- cons

That means the on-video structure and the score structure are aligned.

## Step 6: top-level section weighting

Top-level section weighting should default to an even split across all 7 sections.

Recommended rule:
- all 7 section weights must sum to `1.0`
- default weighting is `1/7` each (about `14.3%` per section)

Final score:

```text
overall_score =
  (fats_score + carbs_score + proteins_score + vitamins_score + minerals_score + pros_score + cons_score) / 7
```

Round to nearest whole number for display.

## Step 7: where food-type weighting belongs

Food-type weighting should happen **inside the section logic**, not by changing the final top-level 7-way split.

Category differences should come from:
- metric applicability
- metric weights
- threshold bands
- threshold harshness or generosity
- ruleset-specific interpretation of what counts as exceptional or poor in-category performance

Example:
- a grain with unusually strong protein for a grain should be rewarded accordingly
- that same protein amount might score much less impressively for a meat
- this is correct, because the thresholds are category-relative

This is the intended architecture.

## Step 8: metric weighting

Each scored metric gets a weight from 1 to 4.

Suggested meaning:
- **1** = minor signal
- **2** = important signal
- **3** = major category-defining signal
- **4** = dominant category-defining signal, use sparingly

Important implementation rule:
- `weight: 0` means the metric is fully ignored for scoring
- it must not quietly fall back to a weight of `1`

That matters for metrics kept in the schema for display, future use, or category-specific overrides.

## Step 9: protein fallback policy

Protein-quality proxies are still uneven across the current food library.
When amino-acid or bioavailability fields are missing, weak, or intentionally withheld, the ruleset may use a `proteinFallback` based on plain `protein_g` from the header.

This is the intended bridge rule for v1:
- prefer direct protein submetrics when they are genuinely source-backed and trusted
- otherwise mark those protein-quality metrics `not_applicable`
- let a category-specific `proteinFallback` keep the proteins section alive in a stable, auditable way

That is stronger than forcing fake precision from shaky proxy fields.

## Step 10: section score calculation

## Step 10: section score calculation

### Arrow-color sections

For each scored submacro:

```text
weighted_metric_score = band_score × metric_weight
```

For each arrow-color section:

```text
section_score = sum(weighted_metric_scores) / sum(metric_weights)
```

Because each band score already resolves to 0 to 100, the section score also lands on a 0 to 100 scale.

### DV sections

For each scored vitamin or mineral:

```text
weighted_metric_score = metric_score × metric_weight
```

For each DV section:

```text
section_score = sum(weighted_metric_scores) / sum(metric_weights)
```

Again, the section score lands on a 0 to 100 scale.

### Missing-data policy inside sections

- if a metric is `not_applicable`, exclude it fully
- if a metric is `optional` and missing, exclude it from the denominator
- if a metric is `required` and missing, mark the food as `incomplete` and block final scoring

This prevents fake precision.

## Step 11: tier mapping

Tier thresholds should be calibrated per category against benchmark foods.
A universal threshold map can be a starting point, but the real production rule is category-relative calibration.

That means:
- use stable thresholds inside each category once tuned
- do not force every category to share the same raw score cutoffs
- re-check thresholds whenever the ruleset architecture changes materially

## Step 12: benchmark calibration

The scoring system should not be trusted purely because the math looks tidy.
It should be checked against benchmark foods with real data.

Recommended calibration method:
1. pull trustworthy nutrient data, preferably USDA-backed where possible
2. score anchor foods in each category
3. check whether they land in the intuitively correct tier
4. check whether the section breakdown looks defensible
5. adjust ruleset thresholds and metric weights when needed

Calibration should be done repeatedly during ruleset development, not only after the system is fully built.

## Step 13: narration-friendly explanation rules

Every scored food should produce:
- 1 short overall summary
- top pros
- top cons
- section highlights
- final tier explanation

The summary should synthesize what the earlier sections and contextual flags mean together.

Example summary shape:

```text
Strong fat quality and fibre carry this food, while harsher cons and weaker vitamin density keep it out of S tier.
```

## Step 14: score outputs needed by the tool

The scoring engine should output:
- header-ready values
- section-ready metric payloads
- resolved submacro band outcomes
- weighted metric contributions
- section scores for all 7 sections
- overall score
- final tier
- generated pros
- generated cons
- short summary
- ruleset version used

## Calibration target

When tuning rulesets, the practical target is:
- D-tier foods should land in D
- S-tier foods should land in S
- middle tiers should feel stable and believable
- section scores should feel relatively balanced before category-specific weighting is applied

That means every category should eventually be tuned against anchor foods rather than only abstract philosophy.
