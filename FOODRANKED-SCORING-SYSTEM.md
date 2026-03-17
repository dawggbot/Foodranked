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
3. **Score computation** — section scores, contextual adjustment, and overall tier
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
The base nutrition score comes from:
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

### Context items
Pros and cons are still present in every result, but they are **not section-weighted like fats/carbs/proteins**.
They act as a capped modifier layer after the 5 nutrition sections are scored.

### Derived outputs
These are generated from the score breakdown and explanation rules:
- pros
- cons
- summary line
- final explanation

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

## Step 2: submacro threshold system

Only **submacros** use the 6-band arrow ladder.
This applies to:
- fat submetrics
- carb submetrics
- protein submetrics

Each scored submacro in a category-specific ruleset stores thresholds using:

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

There is no zero band on purpose. Every tracked submacro should lean clearly positive or negative for the category.

## Step 3: vitamin/mineral DV scoring

Vitamins and minerals must be scored from **DV% bar fill**, not arrow bands.

Use this rule:

```text
metric_points = min(floor(DV_percent / 10), 10)
```

Examples:
- 9% DV = 0 points
- 10% DV = 1 point
- 47% DV = 4 points
- 90% DV = 9 points
- 100%+ DV = 10 points

For normalization, convert DV points to a 0–100 metric score:

```text
metric_normalized = metric_points × 10
```

Metric weights still apply at the section level.

## Step 4: score-bearing sections

The nutrition engine aggregates into 5 score-bearing sections:
- fats
- carbs
- proteins
- vitamins
- minerals

The video still has 7 sections, but:
- `pros` is a context/explanation section
- `cons` is a context/explanation section

## Step 5: section weighting

Top-level weights should exist only for the 5 nutrition sections.
Food types can still differ here, but the differences should stay explainable.

Recommended rule:
- all 5 section weights must sum to `1.0`
- `pros` and `cons` must not appear in `sectionWeights`

Category differences should mostly come from:
- metric applicability
- metric weights
- threshold bands
- modest section-weight shifts where needed

Not from turning pros/cons into a second hidden scoring engine.

## Step 6: metric weighting

Each scored metric gets a weight from 1 to 4.

Suggested meaning:
- **1** = minor signal
- **2** = important signal
- **3** = major category-defining signal
- **4** = dominant category-defining signal, use sparingly

## Step 7: section score calculation

For each scored arrow-band metric:

```text
weighted_metric_score = band_score × metric_weight
```

For each arrow-band section:

```text
section_raw_score = sum(weighted_metric_scores)
section_max_score = sum(3 × metric_weight for each scored metric in section)
section_normalized = ((section_raw_score + section_max_score) / (2 × section_max_score)) × 100
```

For DV sections:

```text
section_raw_score = sum(dv_points × metric_weight)
section_max_score = sum(10 × metric_weight for each scored metric in section)
section_normalized = (section_raw_score / section_max_score) × 100
```

Metrics marked `not_applicable` are excluded.
Metrics marked `display_only` are ignored by scoring.

## Step 8: base score calculation

```text
base_score =
  fats_score × fats_weight +
  carbs_score × carbs_weight +
  proteins_score × proteins_weight +
  vitamins_score × vitamins_weight +
  minerals_score × minerals_weight
```

Round to nearest whole number for display.

## Step 9: contextual adjustment

Pros and cons can still affect ranking, but only through **major** items.

### Scoring rule
- `major_pro = +3`
- `minor_pro = 0`
- `minor_con = 0`
- `major_con = -3`

### Caps
- max `3` scoring majors total
- max total context adjustment = `±9`

### Design intent
This keeps context meaningful without letting editorial judgment overpower the nutrition core.
Minor items are still valuable for narration and explanation, but they should not farm points.

## Step 10: final score calculation

```text
overall_score = clamp(base_score + context_adjustment, 0, 100)
```

## Step 11: tier mapping

Recommended v1 tier thresholds:

- **S** = 90–100
- **A** = 78–89
- **B** = 64–77
- **C** = 45–63
- **D** = 0–44

These can be tuned later if calibration data proves they are too strict or too lenient, but category-specific tier maps should be avoided unless clearly justified.

## Step 12: narration-friendly explanation rules

Every scored food should produce:
- 1 short overall summary
- top pros
- top cons
- section highlights
- final tier explanation

The summary should synthesize what the earlier sections and contextual flags mean together.

Example summary shape:

```text
Strong fat quality and fibre carry this food, but weaker protein usefulness keeps it out of S tier.
```

## Step 13: missing-data policy

Missing values must not silently break fairness.

Recommended v1 rule:
- if a metric is `not_applicable`, exclude it fully
- if a metric is `optional` and missing, exclude it from that section denominator
- if a metric is `required` and missing, mark the food as `incomplete` and block final scoring

This prevents fake precision.

## Step 14: score outputs needed by the tool

The scoring engine should output:
- header-ready values
- section-ready metric payloads
- raw band results
- weighted contributions
- section scores
- base score
- applied context adjustment
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

That means every category should eventually be tuned against anchor foods rather than only abstract philosophy.
