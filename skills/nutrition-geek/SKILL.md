---
name: "nutrition-geek"
description: "Fill FoodRanked nutrition entries from USDA/OFF/research with provenance, estimates, pros/cons, and script handoff."
---

# Nutrition Geek

Use this skill when creating, auditing, or refreshing FoodRanked food entries and their nutrition profiles.

## Core Rules

- Work in `/home/idk/.openclaw/workspace/Foodranked`.
- Start with `git status --short --branch` and do not touch unrelated dirty files.
- Score and store all nutrition per `100g`.
- Preserve exact food identity. Whole foods usually use raw values; meats usually use raw forms; prepared/packaged foods are ranked as they come.
- Do not edit the approved finalisation samples unless James explicitly asks: `kale`, `raspberries`, `oats`, `black-beans`, `sweet-potato`, `almonds`, `chia-seeds`, `bacon`, `greek-yogurt`, `extra-virgin-olive-oil`, `cola-regular`.
- Do not invent nutrition values. If a metric cannot be defensibly sourced or estimated under the rules below, store `null` and explain `N/A` in `metricProvenance`.
- Keep the FoodRanked v1 metric set stable: header macros, fat submetrics, carb submetrics, protein rows, vitamins, minerals, and exactly 3 pros plus exactly 3 cons.
- Use `vitamin_b12_dv` for the v1 B-vitamin slot. Do not create or narrate generic `Vitamin B` as a score-bearing metric.

## Sources

- Use USDA FoodData Central as the primary source for whole foods, raw meats, grains, vegetables, fruits, legumes, nuts, seeds, dairy basics, oils, and baseline ingredients.
- Use Open Food Facts as the approved secondary source for packaged, processed, branded, or prepared foods when it is the better identity match.
- Use outside research for fields USDA/OFF often lacks, such as glycemic index, bioavailability context, collagen/hydroxyproline conversion support, food-specific named compounds, processing/tolerance caveats, or preparation effects.
- Prefer primary or highly transparent sources. Record enough source detail that James can audit the choice later: `sourceName`, `sourceUrl`, `recordId`, `retrievedAt`, and a short `notes` field.
- Never print API keys. Use a local USDA key if present; otherwise use public endpoints or manual source checks without exposing secrets.

## Field Fill Order

1. Read the current food file and identify `id`, `name`, `foodType`, `identity`, `basis`, and locked/prepared-state assumptions.
2. Read the relevant ruleset and metric docs only as needed: `METRICS-CATALOG.md`, `RULESET-SCHEMA.md`, `RULESET-JSON-SHAPE.md`, and the matching `rulesets/<foodType>.v*.json`.
3. Choose the best source record for the exact identity. Prefer a single primary source for most numeric fields, then add cross-checks for contested or missing values.
4. Fill `header.kcal`, `header.fat_g`, `header.carb_g`, and `header.protein_g` from source-backed per-100g values.
5. Fill fat metrics: `saturated_fat_g`, `polyunsaturated_fat_g`, `omega3_mg`, and `cholesterol_mg` when applicable. Plant cholesterol is normally `0mg` only when the identity clearly supports it; otherwise use `null` if unsure.
6. Fill carb metrics: `starch_g`, `fibre_g`, `sugar_g`, and `glycemic_index`. USDA rarely provides GI; use a credible GI source or a labelled food-class estimate only when defensible, otherwise `null`.
7. Fill protein metrics: `collagen_g`, `essential_amino_acids_score`, `nonessential_amino_acids_score`, and `bioavailability_percent`. Derive EAA/NEAA only from source-backed amino-acid rows and FoodRanked thresholds. Derive collagen only from source-backed hydroxyproline or a clearly documented meat-category assumption; otherwise leave source metrics null and let display policy handle presentation-only defaults.
8. Fill vitamins as DV percentages: `vitamin_a_dv`, `vitamin_c_dv`, `vitamin_d_dv`, `vitamin_e_dv`, `vitamin_k_dv`, and `vitamin_b12_dv`. Convert from source units to current adult daily value percentages, then use the FoodRanked scorer for floor/cap scoring.
9. Fill minerals as DV percentages: `calcium_dv`, `iron_dv`, `magnesium_dv`, `potassium_dv`, and `zinc_dv`.
10. Update `nutritionDataSources`, `sourceNotes`, and `metricProvenance` alongside the numeric edits. Provenance should distinguish source-backed data, DV-derived values, labelled estimates, display-only estimates, and `N/A` decisions.
11. Rewrite pros/cons only after the nutrition profile is clear. Keep exactly 3 pros and 3 cons, avoid section recap, and prefer context angles such as named compounds, antioxidants, polyphenols, fermentation, anti-nutrients, absorbability, sourcing, tolerance, digestion, processing burden, satiety, convenience, storage, meal role, or culinary role.

## Educated Estimates

- Use estimates sparingly and label them plainly in provenance.
- Do not estimate a value just to improve completeness. Estimate only when the estimate is stable, category-standard, and more honest than `N/A`.
- Acceptable examples: GI from a reputable GI table for the same food/preparation; collagen from source-backed hydroxyproline conversion; broad protein display estimates emitted by the existing generator/display policy rather than stored as source nutrition.
- Unacceptable examples: made-up vitamin/mineral percentages, amino-acid scores without source amino-acid rows, precise GI for a food identity with no credible match, or pros/cons pretending an unsourced compound is present.

## Script Handoff

- After entry updates, generate or refresh the scored/script outputs so the script writer sees the completed nutritional profile.
- Scripts should be written from the food profile: strongest and weakest meaningful section facts, food-type relevance, expected-vs-unusual context, and source-backed named compounds should drive narration.
- Do not let pros/cons repeat the macro, vitamin, or mineral rows already shown on screen.
- If script text changes, mark or handle existing split audio as stale until voice and subtitles are regenerated.

## Batch Workflow

1. Exclude the 11 approved sample foods unless James explicitly includes them.
2. Work in small batches by food type or source class, not all 263+ remaining files blindly in one edit.
3. For each batch, produce an audit list first: missing metrics, weak provenance, generic pros/cons, source mismatch, and risky estimates.
4. Update source-backed fields and pros/cons together so scoring, generated scripts, website data, and narration context stay aligned.
5. Regenerate the affected outputs only after the data pass is complete.
6. Commit and push meaningful finished batches because James mainly checks GitHub.

## Verification

Use the smallest meaningful verification for the batch:

```bash
node scripts/foodranked-data-quality-audit.js
node scripts/foodranked-scorer.js foods/<food>.sample.json
node scripts/foodranked-generate-script.js foods/<food>.sample.json
node scripts/foodranked-generate-episode.js <food-id> --compact --no-cta
git diff --check
```

For broad generator/data work, run `scripts/run-foodranked-test-pack.sh` or the relevant focused verifier before reporting success.
