---
name: "nutrition-workflow-automator"
description: "Add non-sample FoodRanked nutrition refresh batch workflow and web-proof/data verification handoff."
---

# Proposed Update: Non-Sample Nutrition Refresh Batches

Add this section to the FoodRanked `nutrition-workflow-automator` skill under batch/data workflows.

## Non-Sample Nutrition Refresh Workflow

When James asks to redo food entries after skill/profile improvements:

- Exclude the approved 11 finalisation samples unless James explicitly asks to include them: `kale`, `raspberries`, `oats`, `black-beans`, `sweet-potato`, `almonds`, `chia-seeds`, `bacon`, `greek-yogurt`, `extra-virgin-olive-oil`, `cola-regular`.
- Do not regenerate or overwrite their scripts, narration, split audio, subtitles, generated episode outputs, production narration, or food JSON during a broad cleanup.
- Work in small batches by food type or source class, so nutrition source quality and pros/cons quality can be reviewed without burying mistakes.
- Start each batch with an audit table: food id, food type, likely source, missing/weak fields, generic pro/con candidates, and expected verification commands.
- Run the `nutrition-geek` workflow before script generation so food data, provenance, estimates, and context items are cleaned first.
- Then run `foodranked-script-writer` or generator workflows so scripts follow the nutritional profile rather than stale generic copy.
- Keep `foods/`, `outputs/episodes/`, `docs/data/foods-index.json`, and `docs/data/foods-index.js` aligned for any food changed in the batch.
- Prefer web-page proofs for visual review; treat MP4s as final/export artifacts.

## Batch Verification

For a data/script batch, use the smallest meaningful set from:

```bash
node scripts/foodranked-data-quality-audit.js
node scripts/foodranked-score-all.js
node scripts/foodranked-generate-episode-batch.js <batch-config>
node scripts/verify-narration-subtitles.js
node scripts/verify-pros-cons-title-fit.js
git diff --check
```

Before committing, run a guard check that the 11 approved sample food files and approved output/audio paths are unchanged unless explicitly included.
