# CALIBRATION-SET

This starter document is now historical.

## Current source of truth

Use these instead:
- `CALIBRATION-MATRIX.md` for the human-readable 25-food anchor set in every category
- `config/calibration-matrix.v1.json` for the machine-readable source of truth
- `CALIBRATION-MATRIX-RESULTS.md` for the post-calibration verification summary

## Calibration model

Every FoodRanked category now has:
- 25 benchmark foods total
- 5 intended anchors in each final tier: `S`, `A`, `B`, `C`, `D`
- category thresholds written to cleanly separate those 5-food buckets

## Notes

- These are calibration anchors, not immutable nutrition truth.
- Sample foods remain benchmark fixtures for tuning and regression checks.
- If a future ruleset change moves anchors around, regenerate the matrix and verification outputs instead of editing old starter docs by hand.
