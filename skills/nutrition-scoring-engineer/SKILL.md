---
name: "nutrition-scoring-engineer"
description: "FoodRanked scoring schemas, rulesets, anomaly adjustments, calibration, tier anchors, audits, and generated score alignment."
---

# Nutrition Scoring Engineer

FoodRanked scoring work must keep nutrition data, scoring math, generated scripts, website data, and production outputs aligned. Use this skill for score model changes, food-specific scoring revisions, nutrient schema updates, tier calibration, anomaly adjustments, and all-food recomputation passes.

## Start Here

Before changing scoring behavior, read the relevant source-of-truth files in the repo:
- `FOODRANKED-SPEC.md`
- `FOOD-TYPES.md`
- `RULESET-SCHEMA.md`
- `RULESET-JSON-SHAPE.md`
- `FOODRANKED-SCORING-SYSTEM.md`
- `METRICS-CATALOG.md`
- `SCRIPT-SCHEMA.md`
- `TEST-PACK.md`
- `TEST-PACK-OVERVIEW.md`
- `references/FoodRanked-blueprint.md`

Also inspect the active scorer and generators before editing:
- `scripts/foodranked-scorer.js`
- `scripts/foodranked-score-all.js`
- `scripts/foodranked-generate-script.js`
- `scripts/foodranked-generate-episode.js`
- `scripts/generate-dashboard-data.js`
- `scripts/foodranked-export-leaderboards.js`
- `scripts/foodranked-data-quality-audit.js`

## Non-Negotiables

- Score every food per `100g`.
- Use USDA FoodData Central first for whole foods/raw ingredients; use Open Food Facts for packaged, processed, or branded foods when it is the better identity match.
- Never invent nutrition values. Use `N/A` when a metric is not defensibly sourceable for the exact food identity.
- Keep factual nutrient values separate from derived scoring fields.
- Make every score reproducible from stored inputs, ruleset version, calibration, and food-specific adjustments.
- Keep units explicit.
- Keep ruleset changes versioned and auditable.
- Main macros are display-first; only submacros use arrow indicators.
- Vitamins and minerals score from DV% as `floor(DV% / 10)`, capped at 10.
- The FoodRanked `vitamin B` score means `vitamin B12`; scripts and narration must call it `vitamin B12` when discussing that score.
- Keep the seven scored body sections: fats, carbs, proteins, vitamins, minerals, pros, cons.
- Keep exactly 3 pros and exactly 3 cons in final outputs.
- Pros and cons must not merely repeat macro, submacro, vitamin, or mineral points already shown on screen. Prefer new tidbits or meaningful build-ons: antioxidants, polyphenols, fermentation, anti-nutrients, absorbability, sourcing, tolerance, digestion, processing burden, satiety, convenience, or meal role.
- Remember `weight = 0` is a real zero contribution, not a fallback to `1`.

## Locked Score Shape

Public final scores are tier anchors:
- `D = 20`
- `C = 40`
- `B = 60`
- `A = 80`
- `S = 100`

Keep fine-grained fairness values separate:
- `baseOverallScore`: raw 7-section score before category calibration
- `calibratedOverallScore`: category-calibrated score before food-specific anomaly adjustment
- `anomalyAdjustedScore`: calibrated score plus explicit food-specific adjustments
- `rankingScore`: score used for sorting and tier lookup; normally equals `anomalyAdjustedScore`
- `overallScore`: public display score snapped from the final tier via `tierScoreMap`

Do not sort leaderboards, studio views, or ranking outputs by `overallScore` alone now that it only has five possible values. Sort by `rankingScoreExact`, then fall back through `rankingScore`, `anomalyAdjustedScoreExact`, `calibratedOverallScoreExact`, and finally `overallScore`.

## Scoring Pipeline

Use this pipeline unless the repo has intentionally moved it:
1. Resolve food identity, food type, source basis, and per-100g values.
2. Score submacro items from ruleset bands.
3. Score vitamin/mineral items from DV% tiers.
4. Score pros and cons as first-class sections from major/minor/context levels.
5. Apply useful-protein gates and source-backed amino-acid logic; do not infer EAA/NEAA quality from trace presence or old aggregate proxies.
6. Average the seven top-level sections into `baseOverallScore` using the active section weights.
7. Apply category `scoreCalibration` to produce `calibratedOverallScore`.
8. Apply food-specific `scoreAdjustments[]`, if present, to produce `anomalyAdjustedScore` / `rankingScore`.
9. Map `rankingScore` to tier using shared `tierThresholds`.
10. Set public `overallScore` from `tierScoreMap`.
11. Emit explanations, score snapshots, generated script payloads, dashboard data, and leaderboards from the same score result.

## Food-Specific Anomaly Adjustments

Use `scoreAdjustments[]` sparingly, only when normal visible sections cannot fairly represent a true outlier or a format-specific mismatch.

Each adjustment should include:
- `itemKey`
- `label`
- `points`
- `reason`
- `source`
- `scope`

Good positive cases:
- unusually meaningful protein support for a vegetable
- unusually strong unsaturated-fat profile for a fruit
- a category-breaking trait that is real but undercounted by the seven visible sections

Good negative cases:
- fried snack formats over-rewarded by normal tuber/grain math
- sweet sauces, candy-style bars, or processed convenience products that look stronger in section math than they are as foods
- branded/processed forms whose ingredient burden is not fully captured elsewhere

Audit every adjustment for fairness. It should explain why the normal seven-section score is not enough, not act as a hidden preference knob.

## Data And Schema Alignment

When adding or changing scoring fields, update all affected layers together:
- `RULESET-SCHEMA.md`
- `RULESET-JSON-SHAPE.md`
- `SCRIPT-SCHEMA.md`
- `FOODRANKED-SCORING-SYSTEM.md`
- rulesets under `rulesets/`
- foods under `foods/` and mirrored generated food data under `docs/data/foods/`
- `config/calibration-matrix.v1.json` when calibration output shape changes
- generated outputs under `outputs/episodes/`, `outputs/leaderboards/`, `docs/data/foods-index.json`, `docs/data/foods-index.js`, and `docs/data/batch-results.json`

If a generated site/studio consumer sorts or filters by score, confirm it uses `rankingScore` for ordering and `overallScore` only for display.

## Recommended Project Workflow

1. Check `git status --short --branch`; do not disturb unrelated dirty files.
2. Read the relevant docs, scorer, generators, and sample foods.
3. Patch scorer/data/schema in the smallest coherent set.
4. Regenerate affected outputs rather than hand-editing generated payloads.
5. Run all-food scoring and spot-check anomaly examples.
6. Rebuild dashboard data, batch results, leaderboards, and affected episodes.
7. Verify title/subtitle/layout constraints if script-visible text changed.
8. Stage only relevant files.
9. Commit and push meaningful FoodRanked changes when ready.

Useful regeneration commands:

```bash
node scripts/foodranked-score-all.js > docs/data/batch-results.json
node scripts/generate-dashboard-data.js
node scripts/foodranked-export-leaderboards.js
```

For compact episode regeneration, prefer regenerating the existing compact episode set:

```bash
find outputs/episodes -maxdepth 1 -type d -name '*-compact' -printf '%f\n' | sed 's/-compact$//' | sort > /tmp/foodranked-existing-compact-ids.txt
while IFS= read -r id; do
  node scripts/foodranked-generate-episode.js "$id" --compact --no-cta >/tmp/foodranked-generate-${id}.log || {
    cat /tmp/foodranked-generate-${id}.log
    exit 1
  }
done < /tmp/foodranked-existing-compact-ids.txt
```

## Verification Checklist

Run the smallest meaningful checks for the change, and broaden when changing shared score behavior.

For scoring-engine changes, run:

```bash
for f in scripts/foodranked-scorer.js scripts/foodranked-score-all.js scripts/foodranked-export-leaderboards.js scripts/foodranked-generate-script.js scripts/foodranked-generate-episode.js scripts/foodranked-refresh-calibration.js scripts/generate-dashboard-data.js scripts/foodranked-data-quality-audit.js; do
  node --check "$f" >/dev/null || exit 1
done
node scripts/foodranked-data-quality-audit.js
node scripts/verify-pros-cons-title-fit.js
node scripts/verify-narration-subtitles.js
git diff --check
```

For public tier-anchor changes, also verify every food and compact episode has an anchored public score and a numeric ranking score:

```bash
node scripts/foodranked-score-all.js > /tmp/foodranked-score-all-verify.json
node - <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const tierScoreMap = { D: 20, C: 40, B: 60, A: 80, S: 100 };
const payload = JSON.parse(fs.readFileSync('/tmp/foodranked-score-all-verify.json', 'utf8'));
const badRows = [];
const missingRank = [];
for (const row of payload.summary) {
  const expected = tierScoreMap[row.tier];
  if (row.overallScore !== expected || row.overallScoreExact !== expected) badRows.push(row.food);
  if (typeof row.rankingScoreExact !== 'number') missingRank.push(row.food);
}
const episodeScoreBad = [];
const episodesDir = path.join(root, 'outputs/episodes');
const compactDirs = fs.existsSync(episodesDir)
  ? fs.readdirSync(episodesDir).filter(name => name.endsWith('-compact'))
  : [];
for (const dir of compactDirs) {
  const scorePath = path.join(episodesDir, dir, 'score.json');
  if (!fs.existsSync(scorePath)) continue;
  const score = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
  const expected = tierScoreMap[score.tier];
  if (score.overallScore !== expected || score.overallScoreExact !== expected || typeof score.rankingScoreExact !== 'number') {
    episodeScoreBad.push(dir);
  }
}
if (badRows.length || missingRank.length || episodeScoreBad.length) {
  console.error(JSON.stringify({ badRows, missingRank, episodeScoreBad }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ foods: payload.summary.length, compactEpisodes: compactDirs.length, ok: true }, null, 2));
NODE
```

## Reporting

When finished, report:
- the commit hash if committed/pushed
- the scoring model changes in plain language
- the number of foods/episodes regenerated or verified
- any audit warnings that remain and whether they are pre-existing
- any unrelated dirty files left untouched
