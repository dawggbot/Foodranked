# Food Audit Template

Use this for every current and future Foodranked entry.

## 1. Identity lock
- Food ID:
- Display name:
- Category:
- Exact ranked form:
- Basis:
- Notes on ambiguity:

Questions:
- Is this raw, cooked, dried, roasted, salted, fried, drained, canned, fermented, or packaged?
- Is this the actual thing viewers would think is being ranked?
- Could this be confused with another form that has materially different nutrition?

## 2. Canonical source set
List 2+ sources where possible.

- Source A:
- Source B:
- Source C:

For each source, note:
- exact food/form
- serving basis
- whether it covers macros/micros/GI/special compounds
- confidence level

## 3. Numeric verification
### Header
- kcal:
- fat_g:
- carb_g:
- protein_g:

### Submetrics
- saturated_fat_g:
- omega3_mg:
- polyunsaturated_fat_g:
- starch_g:
- fibre_g:
- sugar_g:
- glycemic_index:
- essential_amino_acids_score:
- nonessential_amino_acids_score:
- bioavailability_percent:

### Vitamins/minerals
- vitamin_a_dv:
- vitamin_c_dv:
- vitamin_d_dv:
- vitamin_e_dv:
- vitamin_k_dv:
- vitamin_b12_dv:
- iron_dv:
- magnesium_dv:
- zinc_dv:
- calcium_dv:
- potassium_dv:

For each changed value, note:
- old value
- candidate new value
- source basis
- confidence

## 4. Exception scan
Potential notable upsides:
- 
- 
- 

Potential notable downsides:
- 
- 
- 

Ask:
- Is there a signature compound or mechanism here?
- Is there an absorbability/bioavailability twist?
- Is there a meaningful tolerance issue?
- Is there a processing trap?
- Is there a common misconception to correct?

## 5. Top-3 pro selection
1.
2.
3.

## 6. Top-3 con selection
1.
2.
3.

Rule:
- No generic filler.
- No repeating category boilerplate unless it is genuinely differentiating this food.
- At most one practicality point unless practicality is the main reason the food matters.

## 7. Tier sanity check
Questions:
- Does this belong with foods in its current tier?
- Should it be above foods in the tier below?
- Should it be below foods in the tier above?
- Is the issue data, context, or ruleset calibration?

## 8. Output actions
- Update food JSON
- Update source notes
- Update category audit sheet if needed
- Re-run scorer/output
- Check website/render downstream if applicable
