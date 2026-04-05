# White Rice Audit

## 1. Identity lock
- Food ID: white-rice
- Display name: White Rice
- Category: grains
- Current ranked form: ambiguous; appears intended to be generic raw white rice per 100g
- Basis: per 100g
- Notes on ambiguity:
  - Need to clarify whether this is long-grain, short-grain, jasmine, basmati, or generic white rice.
  - Need to clarify enriched vs unenriched.
  - GI varies heavily by rice variety and preparation.

## 2. Current data snapshot
- kcal: 365
- fat_g: 0.7
- carb_g: 80
- protein_g: 7.1
- fibre_g: 1.3
- sugar_g: 0.1
- glycemic_index: 73
- iron_dv: 1
- magnesium_dv: 6
- zinc_dv: 10

## 3. Source pass status
Initial pass suggests the current profile is directionally plausible for raw unenriched white rice.

Working confidence:
- Base macros: medium-high
- Fibre: medium-high
- Mineral values: medium because enrichment and rice type can shift them
- GI: medium-low until exact variety/form is defined

## 4. Candidate notable upsides
1. easy digestion / low-residue use case
2. very practical staple value
3. broad culinary flexibility

## 5. Candidate notable downsides
1. very low fibre for a grain
2. harsher glycemic behaviour than stronger grains
3. refinement strips away much of the grain's upside
4. relatively weak micronutrient return unless fortified/enriched form is specifically intended

## 6. Best current top-3 draft
### Pros
1. easy to digest for many people
2. very practical staple base
3. can fit low-fibre or bland-food situations well

### Cons
1. fibre is very weak for a grain
2. glycemic behaviour is rougher than stronger grains
3. refinement strips away much of the grain's upside

## 7. What still needs verification before numeric changes
- USDA anchor identified: `fdcId 168877` / `ndbNumber 20044` for `Rice, white, long-grain, regular, raw, enriched`
- useful nutrient-row anchors confirmed: energy `foodNutrientId 1395697`, protein `1395721`, carbohydrate `1395696`, selenium `1395750`
- blocker: the confirmed canonical row is enriched, which conflicts with the earlier unenriched framing and even the current production filename
- GI source for the chosen standard form still needs an exact citation because USDA does not solve the variety/preparation GI question
- enriched/cooked/parboiled/jasmine/basmati variants still need separate files rather than being collapsed into one white-rice entry

## 8. Tier sanity view
Current expected tier: D
That feels plausible if the food remains generic refined white rice judged against stronger grains.
The main thing to guard against is giving it too much generic practicality credit and accidentally softening a deserved low placement.

## 9. System takeaway for future foods
White rice is a good reminder that practical usefulness and easy digestion can be real pros without letting them overwhelm category-defining weaknesses like low fibre, refinement, and rougher GI.
