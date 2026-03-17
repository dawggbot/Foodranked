# CALIBRATION-RESULTS

Compares expected tiers vs current scorer output.

## Summary

- **Almonds** (nuts)
  - expected: **n/a**
  - actual: **C** (49)
  - verdict: **n/a**
- **Bacon** (meats)
  - expected: **D**
  - actual: **C** (50)
  - verdict: **MISMATCH**
- **Brown Rice** (grains)
  - expected: **B**
  - actual: **C** (49)
  - verdict: **MISMATCH**
- **Chestnuts** (nuts)
  - expected: **D**
  - actual: **D** (34)
  - verdict: **MATCH**
- **Chicken Thigh** (meats)
  - expected: **n/a**
  - actual: **C** (51)
  - verdict: **n/a**
- **Oats** (grains)
  - expected: **n/a**
  - actual: **B** (66)
  - verdict: **n/a**
- **Rice Cakes** (grains)
  - expected: **D**
  - actual: **C** (51)
  - verdict: **MISMATCH**
- **Salmon** (meats)
  - expected: **S**
  - actual: **B** (75)
  - verdict: **MISMATCH**
- **Walnuts** (nuts)
  - expected: **S**
  - actual: **C** (62)
  - verdict: **MISMATCH**

## Recalibration read

- Nuts now lean harder into fats as the defining category signal.
- Grains now care more about carb quality and less about inflated starch/protein rescue.
- Meats now reward protein usefulness more strongly while reducing mineral drag.
- Remaining mismatches point to threshold and context-floor problems, not just section weights.
