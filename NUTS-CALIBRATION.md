# NUTS-CALIBRATION

This file tracks the current nuts-only calibration target.

## Target anchors
- **Walnuts** → `S`
- **Almonds** → `B`
- **Chestnuts** → `D`

## Current tuning decision

For the first nuts-only pass, use the **smallest practical change**:
- keep the current nuts metric logic intact
- keep the new major-only context adjustment model intact
- change only the **nuts tier thresholds**

## Rationale

The nuts category is currently score-compressed relative to the global thresholds:
- walnuts are clearly the category leader and should separate upward
- almonds should land as a strong but not elite nut
- chestnuts already behave like a weak nut-category fit

So the cleanest first pass is threshold calibration, not ruleset churn.

## Active nuts thresholds

```json
[
  { "tier": "S", "min": 60, "max": 100 },
  { "tier": "A", "min": 53, "max": 59 },
  { "tier": "B", "min": 45, "max": 52 },
  { "tier": "C", "min": 34, "max": 44 },
  { "tier": "D", "min": 0, "max": 33 }
]
```

## Why not change weights yet?

Because the three current anchors already separate in the right order by raw score:
- walnuts highest
- almonds middle
- chestnuts lowest

That means top-level tier mapping is the smallest valid correction.

## Likely second-pass refinements later
- reduce over-punishment of low omega-3 nuts that are still excellent overall
- reconsider whether `starch_g` should be rewarded at all in nuts
- decide whether vitamin contribution is too weak or appropriately minimal for this category
- add more anchors like pistachios, peanuts, pecans, cashews, and macadamias before touching weights
