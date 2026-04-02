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

As of the 2026-04-02 nutrition audit, this pack should be treated as **scoring-backbone scaffolding only**:
- useful for validating ruleset logic
- useful for validating strict scorer behaviour
- **not** acceptable as production nutrition truth
- **not** acceptable for final tier claims without sourced canonical data

The scorer and sample files are now intentionally stricter so placeholder/editorial drift fails more loudly instead of looking deceptively finished.

## Suggested next step

Build or extend the scorer so it:
1. loads one ruleset
2. loads one food file
3. refuses vague fallback scoring for scored metrics
4. validates pros/cons against ruleset scoring policy
5. outputs normalized section scores, overall score, tier, and summary payload
