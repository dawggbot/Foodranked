# TEST-PACK

This is the first FoodRanked v1 test pack.

## Included rulesets
- `rulesets/nuts.v1.json`
- `rulesets/grains.v1.json`
- `rulesets/meats.v1.json`

## Included sample foods
- `foods/almonds.sample.json`
- `foods/oats.sample.json`
- `foods/chicken-thigh.sample.json`

## Purpose

This pack exists to test the scoring backbone, not to serve as final production nutrition data.

It is meant to validate:
- machine-readable ruleset shape
- metric applicability
- threshold band structure
- context item scoring
- sample input structure for foods

## Important note

The nutrient values in the sample foods are approximate placeholders.
Before production use, replace them with canonical sourced values.

## Suggested next step

Build a small scorer that:
1. loads one ruleset
2. loads one food file
3. scores nutrient sections
4. scores pros/cons context items
5. outputs normalized section scores, overall score, tier, and summary payload
