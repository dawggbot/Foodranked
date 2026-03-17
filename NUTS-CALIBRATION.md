# NUTS-CALIBRATION

This file tracks the current nuts-only calibration target.

## Target anchors
- **Walnuts** → `S`
- **Almonds** → `B`
- **Chestnuts** → `D`

## Current tuning decision

For the first nuts-only pass, use the **smallest practical change**:
- keep the current nuts ruleset logic intact
- change only the **nuts tier thresholds**

## Rationale

The nuts category is currently score-compressed in the C range:
- walnuts are clearly the category leader and should separate upward
- almonds should land as a strong but not elite nut
- chestnuts already behave like a weak nut-category fit

So the first clean fix is threshold calibration, not ruleset churn.

## Current nuts thresholds

```json
[
  { "tier": "S", "min": 60, "max": 100 },
  { "tier": "A", "min": 53, "max": 59 },
  { "tier": "B", "min": 45, "max": 52 },
  { "tier": "C", "min": 34, "max": 44 },
  { "tier": "D", "min": 0, "max": 33 }
]
```

## Possible second-pass refinements later
- reduce vitamin influence for nuts
- reconsider whether `starch_g` should be rewarded at all in nuts
- consider whether exceptional omega-3 performance should get even more explicit category lift
