# FoodRanked Entry Rulebook

This is the single-source rulebook for creating and maintaining future FoodRanked food entries.

Use this file as the default authority for:
- food identity rules
- sourcing rules
- raw vs cooked handling
- metric fill rules
- `N/A` rules
- context-item rules
- production-readiness rules

If a future file or draft conflicts with this rulebook, update the file to match the rulebook unless James explicitly changes the project direction.

---

## 1. Core principle

Every FoodRanked entry should be:
- easy to understand publicly
- consistent across the database
- backed by trustworthy sources
- explicit about uncertainty
- strict about food identity

The goal is not to cram a number into every box.
The goal is to make every displayed field either:
- trustworthy
- or honestly `N/A`

---

## 2. Canonical entry defaults

### Wholefoods
- Wholefoods should use the most common public-facing **raw / uncooked** form.
- Wholefood entries should use **per 100 g** values for that raw / uncooked form.
- Cooked variations of wholefoods should **not** be the canonical default entries.

### Meats
- Meats follow the same wholefood rule.
- Canonical meat entries should use **raw** values.
- Do not use cooked meat entries as the canonical default wholefood entry.
- If a cooked meat entry is ever ranked, it should be a separate intentional prepared-state entry.

### Oats
- `oats` means **uncooked rolled oats**.
- Do not silently drift to generic oats, instant oats, or cooked oatmeal.
- If those are ever ranked, they should be separate explicit entries.

### White rice
- `white rice` means **uncooked white rice**.
- Enriched vs unenriched must be explicit.
- Do not silently mix raw and cooked rice values.
- Other rice identities should be separate entries when intentionally ranked.

### Yam / sweet potato
- `yam` means **yam**.
- `sweet potato` means **sweet potato**.
- They are separate entries.
- Keep labeling explicit so the public-facing identity stays clear.

### Prepared / product foods
- Prepared foods and packaged products should be ranked **as they come**.
- In those cases, the prepared/product form is the canonical identity.

---

## 3. Identity lock rules

Before filling nutrition values, lock the exact food identity.

Every entry should explicitly define:
- common name
- canonical slug
- food type
- raw vs cooked
- state / basis
- preparation
- variant / format
- edible portion assumptions
- skin / bone / peel state where relevant
- enriched / fortified / sweetened status where relevant
- disambiguation notes

### Never mix these inside one canonical entry
- raw and cooked
- enriched and unenriched
- skin-on and skinless
- plain ingredient and prepared product
- generic and specific variants
- yam and sweet potato

If the identity materially changes, make a **new entry**.
Do not quietly morph the old one.

---

## 4. Source hierarchy

When sourcing nutrition data, use this priority order:

1. **USDA FoodData Central**
2. **NCCDB**
3. **UK McCance & Widdowson / GOV nutrition tables** when they better match the intended public-facing identity
4. **Manufacturer nutrition data** only for branded packaged foods/products

### Source rule
- Prefer one primary source row for the base nutrient panel.
- Record its durable id in the file.
- If a special metric needs a different source, keep it as a metric-level override.
- Do not mix multiple nearby source rows into one fake “best guess” identity.

---

## 5. Standard nutrient fill rules

Use standard nutrient values only when:
- the food identity is locked
- the metric is clearly defined
- the source matches the exact identity/state
- the value is defensible for that exact food

### Usually source numerically when possible
- kcal
- fat_g
- carb_g
- protein_g
- saturated_fat_g
- cholesterol_mg
- polyunsaturated_fat_g
- fibre_g
- sugar_g
- vitamin/mineral DVs in schema

### Use extra care with
- omega3_mg
- starch_g
- glycemic_index

---

## 6. Hard-metric rules

These metrics require stricter handling:
- glycemic_index
- essential_amino_acids_score
- nonessential_amino_acids_score
- collagen_g
- bioavailability_percent

### Rule
Only use a numeric value if there is:
- a clear method
- a repeatable rule
- a trustworthy source for the exact identity

Otherwise:
- keep the field in the schema
- set the value to `null`
- display it as `N/A`
- explain why in `metricProvenance`

### Default posture
Until a stronger method exists:
- `collagen_g` → usually `N/A`
- `bioavailability_percent` → usually `N/A`
- amino-acid score fields → `N/A` unless a documented reusable scoring method is adopted
- `glycemic_index` → numeric only when form/preparation/source fit is strong enough

---

## 7. Zero vs N/A rules

### Use `0` when
- the value is defensibly zero or effectively zero for that food identity
- example: cholesterol in plant foods
- example: fibre/starch/sugars in plain raw meat where the source and project model support zero

### Use `N/A` when
- the metric is part of the schema but not defensibly sourceable yet
- the source quality is too weak
- the method is not defined
- the food identity is still unresolved
- a numeric value would just be a fake placeholder

### Never do this
- never leave fake-precise placeholder numbers in late production drafts
- never hide uncertainty by deleting display fields

---

## 8. Context-item rules

Pros and cons should **not** just repeat:
- macro values
- submacro values
- vitamin values
- mineral values
already shown on screen

They should add extra context such as:
- food-specific compounds
- anti-nutrients
- digestion/tolerance
- absorbability
- preparation traps
- satiety
- processing burden
- real-world usefulness
- sourcing/authenticity when relevant

### Good examples
- oats → beta-glucans, avenanthramides, phytate caveat
- tomato → lycopene
- white rice → refinement / digestibility context
- meat → protein usefulness / mineral usefulness

### Evidence rules for context
Each context item should be one of:
- `source_linked`
- `derived_from_canonical_metrics`
- `editorial_but_non_scoring`

For scoring context items, include:
- sourceName
- sourceUrl or citationNote
- claimStrength

Suggested claimStrength values:
- `supported`
- `plausible`
- `editorial`
- `contested`

---

## 9. Production-lane file rules

Production-lane files should include:
- `status`
- `basis`
- `identityLock`
- `provenance`
- `metricProvenance`
- `scoreReadiness`

### Status meanings
- `sample` = fixture / test material
- `draft` = structured but not final
- `production` = production-safe
- `retired` = no longer active

Do not treat `draft` as final truth.

---

## 10. Score-readiness rules

A file is not production-safe just because it looks tidy.

Before treating an entry as production-ready, these should be clear:
- `identityLocked`
- `canonicalSourceLocked`
- `allRequiredMetricsPresent`
- `contextEvidenceReviewed`
- `categoryCalibrationStatus`

### Important
If `safeForProductionRanking` is false:
- it can still exist in the production lane as a draft
- but it should not be presented as final ranking truth

---

## 11. Naming rules

### Use names the public will understand
But do not sacrifice identity clarity.

### Good naming pattern
Use:
- a simple public name
- a more exact locked identity underneath
- explicit disambiguation notes where needed

### Examples
- `Tomato` / `Raw Red Tomato`
- `Oats` / `Rolled Oats`
- `White Rice` / `Long-Grain White Rice`
- `Yam` / `Raw Yam`
- `Chicken Thigh` / `Raw Chicken Thigh`

If a more specific variant is needed later, add a new entry rather than mutating the old one silently.

---

## 12. Future-entry checklist

Before adding a new food entry, check all of these:

### Identity
- [ ] Is this the canonical public-facing food identity?
- [ ] Is it raw/uncooked if it is a wholefood?
- [ ] Are skin/bone/peel/enriched/fortified/prepared details explicit?
- [ ] Are disambiguation notes clear?

### Source
- [ ] Is there one primary trustworthy source row?
- [ ] Is its id recorded?
- [ ] Are metric overrides only used when necessary?

### Metrics
- [ ] Are standard nutrients filled from the locked source?
- [ ] Are unsupported hard metrics explicit `N/A` instead of fake numbers?
- [ ] Are zeros and `N/A` used correctly?

### Context
- [ ] Do pros/cons avoid repeating on-screen metric points?
- [ ] Are the strongest context items source-linked or clearly derived?
- [ ] Are editorial items kept modest and honest?

### Readiness
- [ ] Does `scoreReadiness` tell the truth?
- [ ] Is the file still a draft or truly production-safe?
- [ ] Would a future session understand the identity without guessing?

---

## 13. Current canonical baseline examples

The current active baseline direction is:
- tomato → raw red tomato
- oats → uncooked rolled oats
- white rice → uncooked long-grain white rice
- yam → true yam
- chicken thigh → raw chicken thigh

These are the model examples for future wholefood entries.

---

## 14. Rulebook intent

This file exists so future FoodRanked entry work does not drift.

If future work starts doing any of these, it is breaking the rulebook:
- using cooked values for canonical wholefoods
- mixing identities inside one file
- inventing hard-metric numbers without a method
- deleting fields instead of using `N/A`
- quietly changing what a food means without a new entry

When in doubt:
- lock identity harder
- source more conservatively
- prefer `N/A` over fake certainty
