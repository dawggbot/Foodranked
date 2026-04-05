# FoodRanked Production-Safety Blockers

This file lists what still blocks defensible "production-safe" nutrition claims.

## Still blocked

1. **The database is structurally coherent, but a few entries still want citation/source-fit hardening before anyone should call them production-safe finals.**
   - The target production-lane drafts under `foods/production/` for oats, white rice, tomato, yam, and chicken thigh now carry explicit identity locks and source structures.
   - That is enough to finish the nutrition-build phase, but not enough to market the database as scientifically final truth.

2. **Remaining hardening work is now mostly citation/method quality, not core database structure.**
   - Oats: current source row in hand is still weaker than an ideal rolled-oats-specific canonical row.
   - White rice: current source row is explicit about enriched long-grain raw white rice and should not drift.
   - Tomato: raw tomato row is locked (`fdcId 170457`, `ndbNumber 11529`), but lycopene support still needs a cleaner citation bundle.
   - Chicken thigh: raw baseline is now locked to USDA `fdc:172385`; remaining work is method/citation hardening for special metrics.
   - Yam: source row is locked (`fdcId 170071`, `ndbNumber 11601`), but GI/citation hardening is still incomplete for the chosen canonical true-yam baseline.

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

### Production-draft triage snapshot

#### Closest to finish first
1. **tomato**
   - identity lock is clean and internally consistent
   - canonical USDA row is attached: `fdcId 170457` / `ndbNumber 11529`
   - biggest remaining work is evidence packaging, not identity rescue
   - current primary blocker is lycopene citation completion, with optional GI citation completion

2. **oats**
   - canonical project identity is rolled oats
   - current USDA row in hand is still a weaker fit than an ideal rolled-oats-specific source
   - placeholder-style `bioavailability_percent` handling is already explicit unsupported / `N/A`
   - biggest remaining work is source-fit hardening rather than a missing canonical direction

#### Still worth hardening
3. **white rice**
   - production-lane draft exists at path: `foods/production/white-rice-long-grain-enriched-raw-draft.json`
   - internal JSON identity is now cleaned up to match the attached enriched USDA row: `fdcId 168877` / `ndbNumber 20044`
   - path-level rename cleanup is now done; remaining work is deciding whether this enriched long-grain raw rice entry is actually the canonical white-rice production target
   - placeholder-style `bioavailability_percent` handling has now been converted to explicit unsupported / `N/A` state
   - enriched/cooked/parboiled variants still need separate future entries

4. **chicken thigh**
   - production-lane raw draft now exists: `foods/production/chicken-thigh-raw-draft.json`
   - cooked wholefood handling is superseded for the canonical lane
   - current raw baseline is now locked to USDA `fdc:172385` for chicken thigh meat and skin, raw
   - remaining work is method/citation hardening for special metrics rather than missing baseline macros
   - placeholder-style `collagen_g` and `bioavailability_percent` handling remains explicit unsupported / `N/A`

5. **yam**
   - production-lane draft exists: `foods/production/yam-true-yam-raw-draft.json`
   - exact USDA row is now attached: `fdcId 170071` / `ndbNumber 11601`
   - canonical project identity is now true yam, not sweet potato
   - remaining work is GI/citation hardening rather than identity indecision
   - placeholder-style `bioavailability_percent` handling has now been converted to explicit unsupported / `N/A` state

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
