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
- pros/cons title fit for the 3-line layout-builder textboxes
- sample input structure for foods
- narration/subtitle packaging rules: subtitles stay at 2 lines max, subtitles keep compact units, spoken narration expands units, and macro/micronutrient sections mention the strongest plus weakest/lowest defensible section mark when two source-backed or approved display-backed values exist; arrow-band strength wins narration selection ties over raw weighted score, macro sections include good/bad-for context plus food-type section importance, non-meat protein narration avoids collagen as the weak callout when another protein-quality mark is available, and all-low vitamin sections may be grouped with category-specific context
- closing summary packaging: the final summary highlights strengths and weaknesses, includes evidence-derived good-for use cases with reasons, and keeps the tier reveal as the final separate spoken block
- protein display contract: generated protein sections keep the four visible rows `collagen_g`, `essential_amino_acids_score`, `nonessential_amino_acids_score`, and `bioavailability_percent`; `protein_g_fallback` may score/narrate but must not appear as a visible display row; visible protein rows display `N/A` only when the protein macro displays `N/A`, otherwise source gaps use labelled display-only estimates/defaults; EAA/NEAA estimates are useful-protein-gated, floor-based, and use non-overlapping integer arrow bands

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

Run the current pack with:

```bash
scripts/run-foodranked-test-pack.sh
```
