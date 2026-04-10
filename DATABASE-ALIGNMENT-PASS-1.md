# DATABASE-ALIGNMENT-PASS-1

First coherent database-wide cleanup batch after the calibrated 275-anchor matrix was locked.

## What this pass did

- removed stale legacy `scoreValue` fields from food `contextItems`
- normalized benchmark-sample `sourceNotes` so the sample database is more explicit and consistent
- preserved the distinct production-lane notes on the cleaned real-data entries (`chicken-thigh`, `oats`, `tomato`, `white-rice`)
- updated `scripts/expand-foods-dataset.js` so future dataset expansion does not reintroduce legacy `scoreValue` baggage
- added `scripts/foodranked-normalize-sample-data.js` so this normalization can be rerun deliberately instead of hand-editing files

## Why this matters

The calibrated scoring system now treats pros and cons through `impactLevel` plus the scorer's internal mapping. The old per-item `scoreValue` numbers were legacy leftovers from earlier scoring logic and had become stale, inconsistent, and easy to misread as live truth.

This pass makes the database better aligned with the current scorer without changing the calibrated tier outcomes.

## Validation

- `node --check` passed for:
  - `scripts/foodranked-normalize-sample-data.js`
  - `scripts/expand-foods-dataset.js`
  - `scripts/foodranked-scorer.js`
- JSON load validation passed for all `foods/*.sample.json`
- full calibration refresh passed via `scripts/foodranked-refresh-calibration.js`
- per-category bucket verification still holds at exactly `5` foods in each tier `S/A/B/C/D`

## Cleanup counts

- files scanned: `275`
- files changed: `158`
- files with legacy `scoreValue` removed: `157`
- legacy `scoreValue` entries removed: `937`
- files with normalized benchmark notes: `153`

## Remaining later work

- continue the broader audit for genuinely weak food identities or misleading placeholder metrics that should be upgraded, replaced, or split from benchmark-only entries
- keep separating benchmark sample data from production-truth nutrition entries as the real database hardens
