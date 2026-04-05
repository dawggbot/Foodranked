# Display Metric Sourcing Pass 1

> Historical sourcing-pass note. Some sections reflect earlier audit uncertainty and are preserved as research history, not as the current source of truth.
> For the live future-entry rules, use `FOODRANKED-ENTRY-RULEBOOK.md`.

Date: 2026-04-03
Scope: `foods/production/tomato-red-raw-draft.json`, `foods/production/oats-rolled-dry-draft.json`, `foods/production/white-rice-long-grain-enriched-raw-draft.json`, `foods/production/yam-true-yam-raw-draft.json`, and the now-superseded cooked chicken-thigh draft that was later replaced in the canonical lane by `foods/production/chicken-thigh-raw-draft.json`

Policy lens used:
- `docs/nutrition-audit/display-metric-sourcing-policy.md`
- `docs/nutrition-audit/production-food-file-shape.md`

Working rule for this pass: be conservative. A metric only counts as safe if I found a defensible numeric source for the exact locked food identity/state. Otherwise the recommendation is to keep the field and show `N/A` (`null`) with provenance notes.

## Overall take

- **Tomato:** standard USDA nutrient panel is in good shape. Hard metrics are mixed. `omega3_mg` is sourceable from USDA and should be corrected downward. GI is plausible but I did **not** lock a strong exact GI citation in this pass.
- **Oats:** current file is still identity-drifting between **generic raw oats** and **rolled oats**. Standard numbers and `omega3_mg` do not fully match the locked USDA row. GI and amino-acid scores should not be treated as settled until identity is decided.
- **White rice:** standard USDA nutrient panel matches the locked **raw enriched long-grain** row fairly well. GI is still too preparation-sensitive for the current raw-row setup. `omega3_mg` should be corrected upward if this exact identity is kept.
- **Yam:** USDA standard nutrients are sourceable for `fdc:170071`, but the broader canonical yam identity is still unresolved. That makes GI and most hard metrics not production-safe yet.
- **Chicken thigh:** I found a much better USDA candidate row than the draft currently cites: **`fdc:172388` = "Chicken, broilers or fryers, thigh, meat only, cooked, roasted"**. That is a defensible match for the current intended identity and materially changes several displayed numbers. GI stays `N/A`; collagen and bioavailability stay `N/A`; amino-acid scores remain method-unlocked.

## Source anchors found in this pass

- Tomato raw red ripe: USDA FoodData Central `fdc:170457`
- Generic raw oats: USDA FoodData Central `fdc:2708489`
- White rice, long-grain, regular, raw, enriched: USDA FoodData Central `fdc:168877`
- Yam, raw: USDA FoodData Central `fdc:170071`
- **Better chicken match found:** USDA FoodData Central `fdc:172388` (cooked roasted thigh meat only)

## Food-by-food recommendations

### 1) Tomato — `tomato-red-raw-draft.json`

Exact identity quality: **good** for standard USDA nutrients.

| Metric | Current | Recommendation | Notes |
|---|---:|---|---|
| `glycemic_index` | 15 | **Best source candidate only; not locked** | Value is plausible for raw tomato, but I did not lock a strong exact source in this pass. Conservative move: keep as provisional only if a Sydney/International GI database citation is attached; otherwise switch to `N/A`. |
| `essential_amino_acids_score` | 1 | **Change to `N/A`** | I did not find a defensible project method that turns tomato amino-acid data into this displayed 1–10 style score. Current value reads editorial. |
| `nonessential_amino_acids_score` | 2 | **Change to `N/A`** | Same issue as above. No explicit reusable scoring method/source locked. |
| `bioavailability_percent` | `null` | **Keep `N/A`** | Matches policy. No defensible exact-food method adopted. |
| `collagen_g` | `null` | **Keep `N/A`** | Correct; biologically irrelevant for tomato. |
| `omega3_mg` | 10 | **Change to 3 mg** | USDA `fdc:170457` shows `PUFA 18:3` = `0.003 g` per 100 g, i.e. about **3 mg** total omega-3 if this project uses ALA+EPA+DPA+DHA sum. Current 10 mg is too high for this row. |
| `cholesterol_mg` | `null` | **Change to 0** | USDA row shows cholesterol `0 mg`; for plant foods this should be explicit zero rather than `N/A`. |

Verdict: tomato is close, but the clean conservative finish is **fix `omega3_mg`, set cholesterol to 0, and convert amino-acid scores to `N/A` unless/until a real scoring method exists**. GI still needs a proper citation if it stays numeric.

### 2) Oats — `oats-rolled-dry-draft.json`

Historical sourcing note: at the time of this pass, oats identity/source-fit was still under debate. Current canonical project direction is rolled oats, with remaining work focused on source-fit/citation hardening rather than deciding the target identity.

| Metric | Current | Recommendation | Notes |
|---|---:|---|---|
| `glycemic_index` | 55 | **Best candidate only; do not treat as locked yet** | 55 is a plausible rolled-oats GI, but current canonical row is generic raw oats and GI is form-sensitive. If file stays generic raw oats, I would lean `N/A` until an exact oats-form GI source is attached. |
| `essential_amino_acids_score` | 5 | **Change to `N/A`** | No explicit scoring method/source attached. Current value looks like an editorial proxy. |
| `nonessential_amino_acids_score` | 7 | **Change to `N/A`** | Same issue. |
| `bioavailability_percent` | `null` | **Keep `N/A`** | Correct under current policy. |
| `collagen_g` | `null` | **Keep `N/A`** | Correct; biologically irrelevant for oats. |
| `omega3_mg` | 111 | **Change to ~100 mg if staying on `fdc:2708489`** | USDA generic raw oats row shows `PUFA 18:3` = `0.1 g` per 100 g, i.e. about **100 mg**. Current 111 mg does not match the locked row. |

Other important drift found:
- `kcal`: current 389 vs locked USDA row 379
- `protein_g`: current 16.9 vs locked USDA row 13.2
- `fibre_g`: current 10.6 vs locked USDA row 10.1

Historical verdict: this captured the earlier decision stage. Current live direction is to keep oats as the canonical rolled-oats entry and improve source-fit/citation quality over time.

### 3) White rice — `white-rice-long-grain-enriched-raw-draft.json`

Exact identity quality: **acceptable for standard nutrients** if the project really wants **raw enriched long-grain white rice**.

| Metric | Current | Recommendation | Notes |
|---|---:|---|---|
| `glycemic_index` | 73 | **Best candidate only; likely not production-safe on current raw-row identity** | Numerically plausible for white rice in many compilations, but GI depends heavily on variety and cooking method. Because this file is raw rice, I would not call 73 locked without a very explicit form/prep citation. Conservative move: `N/A` unless exact GI source is attached and matches intended preparation. |
| `essential_amino_acids_score` | 3 | **Change to `N/A`** | No explicit source-backed scoring method attached. |
| `nonessential_amino_acids_score` | 4 | **Change to `N/A`** | Same issue. |
| `bioavailability_percent` | `null` | **Keep `N/A`** | Correct under current policy. |
| `collagen_g` | `null` | **Keep `N/A`** | Correct; biologically irrelevant for rice. |
| `omega3_mg` | 20 | **Change to 31 mg** | USDA `fdc:168877` shows `PUFA 18:3` = `0.031 g` per 100 g, i.e. about **31 mg**. Current 20 mg understates the locked row. |
| `cholesterol_mg` | `null` | **Change to 0** | USDA row shows cholesterol `0 mg`; plant food should show zero, not `N/A`. |

Verdict: standard row is mostly usable, but **GI should probably go to `N/A` unless an exact form/prep citation is attached**, and amino-acid scores should become `N/A` unless a repeatable scoring method is adopted.

### 4) Yam — `yam-true-yam-raw-draft.json`

Exact identity quality: **blocked**. USDA row exists, but canonical "yam" identity is still unresolved at the species/market-label level.

| Metric | Current | Recommendation | Notes |
|---|---:|---|---|
| `glycemic_index` | 54 | **Change to `N/A`** | Even if 54 is plausible for some yam preparations, this is not defensible until the exact yam species and preparation basis are locked. |
| `essential_amino_acids_score` | 2 | **Change to `N/A`** | No explicit scoring method/source. |
| `nonessential_amino_acids_score` | 3 | **Change to `N/A`** | Same issue. |
| `bioavailability_percent` | `null` | **Keep `N/A`** | Correct under current policy. |
| `collagen_g` | `null` | **Keep `N/A`** | Correct; biologically irrelevant for yam. |
| `omega3_mg` | 20 | **Change to 12 mg if staying on `fdc:170071`** | USDA `fdc:170071` shows `PUFA 18:3` = `0.012 g` per 100 g, i.e. about **12 mg**. Current 20 mg is too high for the locked row. |
| `cholesterol_mg` | `null` | **Change to 0** | USDA row shows cholesterol `0 mg`; plant food should show zero, not `N/A`. |

Verdict: the file should stay **blocked**. Standard nutrient values can be sourced to `fdc:170071`, but hard metrics should be treated as unresolved until the project decides what canonical "true yam" actually means.

### 5) Chicken thigh — cooked-draft note

This section now applies only as a record of the older cooked-draft research pass.
The canonical wholefood lane has since moved to `foods/production/chicken-thigh-raw-draft.json` because wholefoods should use raw values.

**Research-only cooked source noted here:** USDA FoodData Central **`fdc:172388`** — `Chicken, broilers or fryers, thigh, meat only, cooked, roasted`

That row was useful for the old cooked draft, but should no longer be treated as the canonical wholefood entry.

| Metric | Current | Recommendation | Notes |
|---|---:|---|---|
| `glycemic_index` | `null` | **Keep `N/A`** | Correct; GI is not meaningful for plain chicken thigh. |
| `essential_amino_acids_score` | 8 | **Change to `N/A` unless the project formalizes a protein-quality scoring method** | Directionally plausible that chicken scores high, but I did not find a defensible exact source for the current 1–10 display number itself. If the project later adopts PDCAAS/DIAAS-derived bins, revisit. |
| `nonessential_amino_acids_score` | 10 | **Change to `N/A`** | Same issue. |
| `bioavailability_percent` | `null` | **Keep `N/A`** | Correct under current policy. |
| `collagen_g` | `null` | **Keep `N/A`** | Correct for now. Even though chicken contains connective tissue, I did not lock an exact defensible collagen number for this exact roasted skinless thigh-meat-only identity. |
| `omega3_mg` | 110 | **Change to ~79 mg if using `fdc:172388`** | Better matching USDA row shows ALA 61 mg + EPA 5 mg + DPA 8 mg + DHA 5 mg per 100 g = about **79 mg total omega-3**. Current 110 mg is too high for the better identity match. |
| `cholesterol_mg` | 128 | **Change to 133 mg if using `fdc:172388`** | Better matching USDA row shows **133 mg** per 100 g. |
| `starch_g` | `null` | **Change to 0** | Animal tissue; starch is not just unsupported but effectively zero for the matched USDA row context. |
| `fibre_g` | `null` | **Change to 0** | USDA meat row gives fiber 0; should be zero, not `N/A`. |
| `sugar_g` | `null` | **Change to 0** | USDA row gives sugars 0; should be zero, not `N/A`. |

Additional standard-panel numbers from the better row `fdc:172388`:
- `kcal`: **179**
- `protein_g`: **24.76 g**
- `fat_g`: **8.15 g**
- `saturated_fat_g`: **2.311 g**
- `polyunsaturated_fat_g`: **1.695 g**

Verdict: this section is now historical research only. The active wholefood task is to lock a trustworthy **raw** chicken-thigh source row for `foods/production/chicken-thigh-raw-draft.json` rather than finishing the cooked variation.

## Best source candidates for unresolved metrics

### Glycemic index
Best candidate source family for all GI work still unresolved here:
- **University of Sydney / International Glycemic Index Database**
- **Atkinson, Foster-Powell, Brand-Miller international GI tables / updates**

But the food-specific caution differs:
- **Tomato:** likely sourceable if the team is happy with a secondary GI compilation and raw tomato specifically appears.
- **Oats:** only source after the identity is settled (rolled vs generic raw vs instant vs cooked oatmeal).
- **White rice:** only source if the intended cooked/preparation form is defined, not just raw grain identity.
- **Yam:** do not source until species/prep identity is locked.
- **Chicken:** should stay `N/A`.

### Amino-acid scores
Best source candidate path if the project wants these to stay in the schema:
- adopt one explicit reusable method such as **PDCAAS/DIAAS-derived binning** or a documented amino-acid-profile scoring rule built from USDA amino-acid data
- document the method once and apply it consistently across foods

Current state: I did **not** find a defensible exact source for the present integer values on any of the five foods.

### Bioavailability percent
Best candidate path:
- keep `N/A` across these foods unless the project first adopts a category-specific, literature-backed, reproducible method. Right now the policy already points this way.

### Collagen
Best candidate path:
- keep `N/A` unless a food/cut-specific source is found for the exact edible identity.
- chicken thigh is the only one here where people will be tempted to force a number; I would still resist until an exact roasted skinless thigh-meat-only collagen source is in hand.

## Practical next moves

1. **Chicken:** switch provenance target to `fdc:172388` and reconcile the full nutrient panel.
2. **Plant foods:** change `cholesterol_mg` from `null` to `0` where USDA clearly gives zero.
3. **Tomato / rice / yam / oats:** correct `omega3_mg` to the USDA-backed values above if those exact canonical rows remain.
4. **All five files:** convert the current amino-acid scores to `null` unless/until the project writes and adopts a real scoring method.
5. **GI:** do a separate exact-citation pass against a single approved GI source family after identity lock issues are solved.
