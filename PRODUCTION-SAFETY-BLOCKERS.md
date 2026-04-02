# FoodRanked Production-Safety Blockers

This file lists what still blocks defensible "production-safe" nutrition claims.

## Still blocked

1. **Canonical source provenance is now partially attached, but not fully reconciled into production-safe finals.**
   - Current sample foods explicitly say they use approximate placeholder values.
   - The target production-lane drafts under `foods/production/` for oats, white rice, tomato, yam, and chicken thigh now carry explicit USDA anchors where available.
   - That is a real upgrade from pure docs work: each draft carries `identityLock`, `provenance`, `metricProvenance`, and `scoreReadiness`, and several now also include exact `fdcId`, `ndbNumber`/`foodCode`, and example `foodNutrientId` anchors.
   - Remaining blocker: some files still contain numbers or identities that do not fully reconcile with the locked source row, so they are still not production-safe finals.

2. **Food identity is still ambiguous or mismatched for several high-impact examples.**
   - Oats: source row is now locked to generic `Oats, raw` (`fdcId 2708489`, `foodCode 57602100`), but that is still weaker than a rolled-oats-specific canonical row.
   - White rice: source row is now locked to enriched long-grain raw white rice (`fdcId 168877`, `ndbNumber 20044`), which exposed that the existing draft/filename had claimed unenriched.
   - Tomato: raw tomato row is locked (`fdcId 170457`, `ndbNumber 11529`), but lycopene support still needs a separate citation bundle and many nutrient rows are aggregated/calculated.
   - Chicken thigh: candidate row found (`fdcId 172385`, `ndbNumber 5091`), but it conflicts with the current draft identity because it is raw meat-and-skin, not roasted skinless thigh meat.
   - Yam: source row is locked (`fdcId 170071`, `ndbNumber 11601`), but species/market-label ambiguity is still unresolved enough that the file remains blocked from production ranking.

3. **Tier thresholds are still starter thresholds, not category-calibrated production thresholds.**
   - Current thresholds may be acceptable for scaffolding.
   - They are not yet justified by broad within-category comparison sets.

4. **Ruleset coverage is still incomplete across the full intended food universe.**
   - Nuts, grains, meats exist in the main ruleset set.
   - Tubers and vegetables are now promoted into the main ruleset set as draft rulesets.
   - Other major food types are still not visibly implemented in the inspected pack.

5. **Context-item quality is improved but still not source-backed enough for hard claims.**
   - Many context items are thoughtful and plausible.
   - They are still mostly `manual` editorial items rather than evidence-linked, provenance-tagged notes.

6. **No whole-repo shell inventory was possible in this subagent context.**
   - `exec` required interactive approval, so this pass could not verify every undiscovered file or hidden duplicate.
   - Findings are careful and useful, but not a mathematically complete filesystem census.

7. **No scorer regression run was possible from this subagent without command approval.**
   - The ruleset and doc changes are structurally consistent with the inspected scorer.
   - They were not execution-tested here.

## Highest-risk next categories / foods

### Highest-risk foods next
1. **white rice**
   - production-lane draft exists: `foods/production/white-rice-long-grain-unenriched-dry-draft.json`
   - exact USDA row is now attached: `fdcId 168877` / `ndbNumber 20044`
   - remaining blocker: the attached row is enriched, so the file name and earlier identity assumptions are wrong and need cleanup
   - enriched/cooked/parboiled variants still need separate future entries

2. **tomato**
   - production-lane raw tomato draft exists: `foods/production/tomato-red-raw-draft.json`
   - exact USDA row is now attached: `fdcId 170457` / `ndbNumber 11529`
   - remaining blocker: form-specific lycopene citation bundling plus the fact that several nutrient derivations are aggregated/calculated rather than clean direct analytical rows
   - sauce/paste/cooked variants must remain separate future files

3. **yam**
   - production-lane draft exists: `foods/production/yam-true-yam-raw-draft.json`
   - exact USDA row is now attached: `fdcId 170071` / `ndbNumber 11601`
   - still the weakest of the group because species identity is intentionally unresolved
   - this one is blocked more by identity-class confidence than by missing numeric anchors

4. **oats**
   - production-lane draft exists: `foods/production/oats-rolled-dry-draft.json`
   - exact USDA row is now attached: `fdcId 2708489` / `foodCode 57602100`
   - remaining blocker: the locked row is generic raw oats rather than a cleaner rolled-oats-specific row, and several file numbers still need reconciliation to that row
   - still one of the better near-finishable grain entries once numeric reconciliation is done

5. **chicken thigh**
   - production-lane draft exists: `foods/production/chicken-thigh-skinless-roasted-draft.json`
   - candidate USDA row is now attached for audit purposes: `fdcId 172385` / `ndbNumber 5091`
   - remaining blocker: the located row conflicts with the draft identity because it is raw meat-and-skin, not roasted skinless thigh meat
   - proxy metrics like `collagen_g` and `bioavailability_percent` still need better sourcing or removal

### Highest-risk categories next
1. **grains**
   - many familiar foods, but heavy refinement/preparation variance
   - strong chance of quietly mixing incomparable forms

2. **vegetables**
   - context quality risk is high because phytonutrient claims can get hand-wavy fast
   - tomato / kale / zucchini need very different treatment despite sharing the category

3. **tubers**
   - identity lock matters a lot and GI narratives are easy to oversimplify
   - yam / sweet potato / white potato need cleaner separation

## Minimum bar before claiming production-safe nutrition output

- Every production food file has explicit provenance fields and a locked identity/form.
- Every production ruleset is pressure-tested against a broad peer set inside its category.
- Context items are reviewed for food-specificity and evidence quality.
- Scorer runs are regression-tested on the active food/ruleset pack.
- Temporary audit drafts are either promoted into permanent docs or removed so policy cannot fork silently.

## Current safe wording

Safe:
- "draft"
- "starter ruleset"
- "sample/test fixture"
- "directionally plausible"
- "needs canonical source verification"

Not safe yet:
- "spot on"
- "production ready"
- "scientifically validated database"
- strong absolute ranking claims presented as final truth
