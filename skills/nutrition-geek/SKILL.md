---
name: "nutrition-geek"
description: "Complete FoodRanked submetrics using exact data, checked Google AI results, then last-resort analogues."
---

# Nutrition Geek

Use this skill when creating, auditing, or refreshing FoodRanked food entries and their nutrition profiles.

## Core Rules

- Work in `/home/idk/.openclaw/workspace/Foodranked`.
- Start with `git status --short --branch` and do not touch unrelated dirty files.
- Score and store all nutrition per `100g`.
- Preserve exact food identity. Whole foods usually use raw values; meats usually use raw forms; prepared/packaged foods are ranked as they come.
- Do not edit the approved finalisation samples unless James explicitly asks: `kale`, `raspberries`, `oats`, `black-beans`, `sweet-potato`, `almonds`, `chia-seeds`, `bacon`, `greek-yogurt`, `extra-virgin-olive-oil`, `cola-regular`.
- Final production entries must fill every required visible submetric. Never invent arbitrary values: use the exact USDA/OFF record first, then search Google for the exact food, preparation, metric, and per-100g basis. Use the AI Overview as a discovery or documented estimate after checking its linked source or corroborating the value. Use another food or food-class analogue only as the last resort.
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
5. Fill fat metrics: `saturated_fat_g`, `polyunsaturated_fat_g`, `omega3_mg`, and `cholesterol_mg`. Plant cholesterol and collagen may use structural zeroes when biologically applicable. Search the exact food and preparation on Google next, checking the AI Overview against its linked or corroborating source. Use another food analogue only as the last resort.
6. Fill carb metrics: `starch_g`, `fibre_g`, `sugar_g`, and `glycemic_index`. USDA rarely provides GI; search Google for the exact food and preparation, use a tested result when available, and use a checked or corroborated AI Overview value as a documented estimate when needed. Do not leave a required production row empty.
7. Fill protein metrics: `collagen_g`, `essential_amino_acids_score`, `nonessential_amino_acids_score`, and `bioavailability_percent`. Search for exact-food amino-acid and digestibility research first. Derive EAA/NEAA from source-backed amino-acid rows for the exact food or last-resort protein analogue and the FoodRanked thresholds. Use food-specific research, a checked or corroborated Google AI Overview estimate, or a documented category estimate for bioavailability. Plant collagen is `0g`; meat collagen may use hydroxyproline conversion or a documented meat-category estimate.
8. Fill vitamins as DV percentages: `vitamin_a_dv`, `vitamin_c_dv`, `vitamin_d_dv`, `vitamin_e_dv`, `vitamin_k_dv`, and `vitamin_b12_dv`. Convert from source units to current adult daily value percentages, then use the FoodRanked scorer for floor/cap scoring.
9. Fill minerals as DV percentages: `calcium_dv`, `iron_dv`, `magnesium_dv`, `potassium_dv`, and `zinc_dv`.
10. Update `nutritionDataSources`, `sourceNotes`, and `metricProvenance` alongside the numeric edits. Provenance must distinguish exact source data, DV-derived values, Google-discovered values, AI-Overview estimates, matched analogues, and other estimates, including the query, linked or corroborating source, derivation, and source tier.
11. Rewrite pros/cons only after the nutrition profile is clear. Keep exactly 3 pros and 3 cons, avoid section recap, and prefer context angles such as named compounds, antioxidants, polyphenols, fermentation, anti-nutrients, absorbability, sourcing, tolerance, digestion, processing burden, satiety, convenience, storage, meal role, or culinary role.

## Source Completion Hierarchy

1. Use an exact USDA/OFF analytical record for the exact food identity and preparation.
2. Search Google for the exact food identity, preparation, missing metric, and per-100g basis.
3. Use the Google AI Overview as a discovery layer and inspect its linked source. If the overview supplies the only exact-food value, corroborate it with another credible result or a second tightly phrased query before accepting it as a documented estimate.
4. Use a closely matched variety, preparation, or food-class analogue only after exact-identity web research is exhausted.

- Production completeness is required for every visible submetric; `N/A` and unreviewed display defaults are draft-only safeguards.
- Label every fallback plainly in provenance. For Google AI Overview values, store the exact query, answer date, selected value, and linked or corroborating source. For analogues, explain why the match is defensible.
- EAA/NEAA values always require actual source amino-acid rows from the exact or analogue profile. Do not invent aggregate amino-acid counts.
- Never use arbitrary vitamin/mineral percentages, a precise GI with no credible same-food or food-class basis, or unsourced named-compound claims.
- Finished narration states the selected working values directly and confidently. Audit caveats stay in provenance unless they materially change the food identity or safety.

## Script Handoff

- After entry updates, generate or refresh the scored/script outputs so the script writer sees the completed nutritional profile.
- Scripts should be written from the completed production profile: strongest and weakest meaningful section facts, food-type relevance, expected-vs-unusual context, and source-backed named compounds should drive narration. Do not use phrases such as `not source-backed`, `uncertain`, or `less certain` for an approved analogue or estimate.
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
