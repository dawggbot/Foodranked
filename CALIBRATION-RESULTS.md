# CALIBRATION-RESULTS

Compares expected tiers vs current scorer output.

## Summary

- **Almonds** (nuts)
  - expected: **n/a**
  - actual: **C** (47)
  - verdict: **n/a**
- **Bacon** (meats)
  - expected: **D**
  - actual: **C** (50)
  - verdict: **MISMATCH**
- **Brown Rice** (grains)
  - expected: **B**
  - actual: **C** (47)
  - verdict: **MISMATCH**
- **Chestnuts** (nuts)
  - expected: **D**
  - actual: **D** (33)
  - verdict: **MATCH**
- **Chicken Thigh** (meats)
  - expected: **n/a**
  - actual: **C** (51)
  - verdict: **n/a**
- **Oats** (grains)
  - expected: **n/a**
  - actual: **C** (63)
  - verdict: **n/a**
- **Rice Cakes** (grains)
  - expected: **D**
  - actual: **C** (57)
  - verdict: **MISMATCH**
- **Salmon** (meats)
  - expected: **S**
  - actual: **A** (75)
  - verdict: **MISMATCH**
- **Walnuts** (nuts)
  - expected: **S**
  - actual: **C** (62)
  - verdict: **MISMATCH**

## Structural-pass read

- Context scoring now behaves without a neutral floor, so weak foods are less cushioned.
- Nuts reward omega-3 leadership harder.
- Meats now give elite fish a more realistic path upward through fats/protein and gentler tier thresholds.
- Grains now punish low-satiety / high-GI weak performers more aggressively through context and section weighting.
