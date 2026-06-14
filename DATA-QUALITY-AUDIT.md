# DATA-QUALITY-AUDIT

FoodRanked keeps nutrition facts on a per-100g basis. Production-facing foods should be auditable from stored source references rather than prose claims hidden in notes.

## Current strict check

Run:

```bash
node scripts/foodranked-data-quality-audit.js --scope=finalisation --show-warnings
```

This checks the representative finalisation batch from `config/finalisation-sample-foods.v1.json` for:

- exact `100 g` basis
- numeric header and metric values, with unavailable facts stored as `null`
- exactly 3 pros and exactly 3 cons
- two or more structured `nutritionDataSources`
- no placeholder source notes
- duplicate food names/ids
- ruleset band, arrow-colour, score, and section-weight integrity
- generated episode text for stale blocked wording
- obvious wording errors such as `nitrous oxide` where the intended nutrition context is nitric oxide

As of this pass, the finalisation batch passes the strict audit with `0` errors and `0` warnings across 11 food files, 11 rulesets, and 70 generated episode files.

Production-lane foods can also be checked directly:

```bash
node scripts/foodranked-data-quality-audit.js --scope=production --show-warnings
```

Result: `0` errors and `0` warnings across 16 production/near-production food files, 11 rulesets, and 97 generated episode files.

## Wider library status

The canonical library currently contains 274 foods after removing the duplicate `barley-s-tier` benchmark from the food list. Most of the wider library is still calibration/pressure-test data. Those files intentionally remain labelled with placeholder source notes until they receive the same two-source production treatment. The audit reports them as warnings in broad scans instead of silently treating them as final data.

Current broad audit:

```bash
node scripts/foodranked-data-quality-audit.js --scope=all
```

Result: `0` errors across 274 food files, 11 rulesets, and 797 generated output/index files, with placeholder warnings for non-production calibration entries.

Use the stricter full-library mode only when upgrading the entire food library:

```bash
node scripts/foodranked-data-quality-audit.js --scope=all-strict --show-warnings
```
