# BATCH-SCORING

This file describes how to score all current FoodRanked sample foods at once.

## Script

Use:

```bash
node scripts/foodranked-score-all.js
```

## What it does

- reads every `*.sample.json` file in `foods/`
- infers the matching ruleset from `foodType`
- runs `scripts/foodranked-scorer.js`
- returns a combined JSON result with:
  - summary rows
  - per-food detailed results

## Current matching rule

A sample food with:

```json
{ "foodType": "nuts" }
```

expects this ruleset:

```text
rulesets/nuts.v1.json
```

## Why this matters

This is the first useful tuning loop for FoodRanked.

Once you can score all current test foods in one run, you can:
- compare tiers side by side
- spot broken weighting fast
- see whether one section is dominating too hard
- tune rulesets much faster than one food at a time

## Next likely step after this

- add more sample foods per category
- add more category rulesets
- tune thresholds using batch output
