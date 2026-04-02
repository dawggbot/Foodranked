# FoodRanked Production-Safety Blockers

This file lists what still blocks defensible "production-safe" nutrition claims.

## Still blocked

1. **Canonical source provenance is not attached to live food files.**
   - Current sample foods explicitly say they use approximate placeholder values.
   - There is no immutable per-food provenance bundle in the inspected food JSONs.

2. **Food identity is still ambiguous for several high-impact examples.**
   - Oats: raw oats vs groats vs rolled oats vs instant oats.
   - White rice: rice variety, enriched vs unenriched, and preparation basis.
   - Tomato: raw tomato must stay separate from cooked/paste/sauce forms.
   - Yam: species confusion risk is still unresolved in the audit notes.

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
