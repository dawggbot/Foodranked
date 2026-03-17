# MEATS-CALIBRATION

## Target anchors
- Salmon → S
- Chicken Thigh → C / low B
- Bacon → D

## Current calibration strategy
- keep the current meat metric logic intact for now
- keep the major-only context adjustment model intact
- use a meats-specific tier map to match the current score spread

## Why this pass is threshold-first

The current meat anchors already separate in the right order:
- salmon highest
- chicken thigh middle
- bacon lowest

So the first clean move is to calibrate the meat tier map rather than immediately changing fat/protein weights again.

## Active meats thresholds

```json
[
  { "tier": "S", "min": 80, "max": 100 },
  { "tier": "A", "min": 68, "max": 79 },
  { "tier": "B", "min": 54, "max": 67 },
  { "tier": "C", "min": 42, "max": 53 },
  { "tier": "D", "min": 0, "max": 41 }
]
```

## Interpretation
- salmon at `81` now lands in **S**
- chicken thigh at `53` stays in **C**, right on the edge of B
- bacon at `39` stays in **D**

## Likely second-pass refinements later
- decide whether minerals are underpowered for meats
- decide whether cholesterol is hitting some otherwise-solid meats too hard
- add more anchors like sardines, sirloin, liver, turkey breast, and processed deli meats before changing weights
