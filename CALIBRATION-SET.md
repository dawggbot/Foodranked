# CALIBRATION-SET

This file defines the first FoodRanked tuning anchors.

## Purpose

Use a small set of foods with **expected tiers** to calibrate rulesets.

This is better than tuning from isolated foods, because it lets the system answer:
- do obvious strong foods land high enough?
- do obvious weak foods land low enough?
- do middle foods land somewhere sensible?

## Current project direction

Wholefoods-only is no longer a hard rule.
That means calibration can now include more processed foods where useful.

## Starter calibration set

### Nuts
- **Walnuts** — expected tier: `S`
  - rationale: standout omega-3 nut, strong fats profile, credible category leader
- **Almonds** — expected tier: `B`
  - rationale: clearly strong overall, but not the best possible nut for the category
- **Chestnuts** — expected tier: `D`
  - rationale: much weaker fit for a nut category focused on fat quality/fibre/mineral density

### Grains
- **Oats** — expected tier: `A`
  - rationale: strong grain benchmark with good fibre and decent carb behaviour
- **Brown Rice** — expected tier: `B`
  - rationale: respectable staple grain, but not exceptional
- **Rice Cakes** — expected tier: `D`
  - rationale: weak fibre support and poor grain-category payoff relative to stronger options

### Meats
- **Salmon** — expected tier: `S`
  - rationale: very strong protein usefulness plus standout fats/micronutrients
- **Chicken Thigh** — expected tier: `B`
  - rationale: solid useful meat, but not a category best-in-class
- **Bacon** — expected tier: `D`
  - rationale: can now be included with the wholefoods-only rule removed; useful weak-anchor because fat/cholesterol/sodium concerns should drag it down hard

## Tuning rule

When the actual output differs from the expected tier, prefer to adjust:
1. metric applicability
2. metric weights or band harshness
3. category-specific tier thresholds

Do not solve category problems by warping the final top-level 7-section split.

## Notes
- Expected tiers are calibration targets, not final truth.
- These foods are chosen because they create clear contrast inside each category.
- The point is not perfection on day one — it is to make the rulesets obviously less wrong.
