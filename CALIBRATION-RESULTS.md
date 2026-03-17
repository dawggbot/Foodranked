# CALIBRATION-RESULTS

Compares expected tiers vs current scorer output.

## Summary

- **Almonds** (nuts)
  - expected: **n/a**
  - actual: **C** (50)
  - verdict: **n/a**
- **Bacon** (meats)
  - expected: **D**
  - actual: **C** (49)
  - verdict: **MISMATCH**
- **Brown Rice** (grains)
  - expected: **B**
  - actual: **C** (49)
  - verdict: **MISMATCH**
- **Chestnuts** (nuts)
  - expected: **D**
  - actual: **D** (29)
  - verdict: **MATCH**
- **Chicken Thigh** (meats)
  - expected: **n/a**
  - actual: **C** (50)
  - verdict: **n/a**
- **Oats** (grains)
  - expected: **n/a**
  - actual: **B** (64)
  - verdict: **n/a**
- **Rice Cakes** (grains)
  - expected: **D**
  - actual: **C** (46)
  - verdict: **MISMATCH**
- **Salmon** (meats)
  - expected: **S**
  - actual: **B** (72)
  - verdict: **MISMATCH**
- **Walnuts** (nuts)
  - expected: **S**
  - actual: **C** (53)
  - verdict: **MISMATCH**

## Initial read

- This file is for tuning category logic, not judging the foods as final truth yet.
- Mismatches tell us where ruleset weights or thresholds are off.
- Because sample nutrient values are placeholders, some mismatches may still be data-quality problems rather than model problems.
