# GRAINS-CALIBRATION

## Target anchors
- Oats → high B / A
- Brown Rice → B
- Rice Cakes → D

## Current calibration strategy
- keep the current grain metric logic intact for now
- keep the major-only context adjustment model intact
- use a grains-specific tier map to match the actual category score spread

## Why this pass is threshold-first

The current grain scores already separate in the right order:
- oats highest
- brown rice middle
- rice cakes lowest

The immediate problem is not category ordering.
It is that the global thresholds are too harsh for the current grains score distribution.

That means the smallest valid correction is a grains-only threshold pass.

## Active grains thresholds

```json
[
  { "tier": "S", "min": 75, "max": 100 },
  { "tier": "A", "min": 64, "max": 74 },
  { "tier": "B", "min": 35, "max": 63 },
  { "tier": "C", "min": 22, "max": 34 },
  { "tier": "D", "min": 0, "max": 21 }
]
```

## Interpretation
- oats at `65` now land in **A**, which is acceptable for a high-B / A target
- brown rice at `35` now lands in **B**
- rice cakes at `21` stay in **D**

## Likely second-pass refinements later
- revisit whether grain proteins still rescue too hard in some cases
- consider trimming fat noise if it keeps flattering weak grains
- add more anchors like barley, quinoa, white rice, corn flakes, and bread products before changing weights again
