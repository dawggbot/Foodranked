# Oats Audit

## 1. Identity lock
- Food ID: oats
- Display name: Oats
- Category: grains
- Current ranked form: ambiguous; appears intended to be generic raw oats / plain oats per 100g
- Basis: per 100g
- Notes on ambiguity:
  - Need to clarify whether this is oat groats, rolled oats, or generic raw oats.
  - GI can differ materially by oat form and processing.
  - Context about toppings should be treated as a practical caveat, not as proof about plain oats themselves.

## 2. Current data snapshot
- kcal: 389
- fat_g: 6.9
- carb_g: 66.3
- protein_g: 16.9
- fibre_g: 10.6
- sugar_g: 1
- glycemic_index: 55
- iron_dv: 26
- magnesium_dv: 44
- zinc_dv: 36

## 3. Source pass status
Initial web pass suggests the current profile is broadly plausible for raw oats and aligns with common USDA-backed nutrition summaries.

Working confidence:
- Base macros: medium-high
- Fibre/minerals: medium-high
- GI: medium at best until exact oat form is fixed
- Beta-glucans: high confidence as a meaningful extra upside
- Avenanthramides: medium confidence as a worthwhile special-compound note, but phrasing should be literature-backed before being treated as locked

## 4. Candidate notable upsides
1. beta-glucans
2. strong fibre + mineral density for a grain
3. possible oat-specific extra compounds (avenanthramides) if evidence wording is tightened
4. practical satiety value

## 5. Candidate notable downsides
1. phytates can slightly reduce mineral uptake
2. some people do not tolerate oats especially well
3. GI depends a lot on processing/form and what the oats are turned into
4. common toppings can wreck the clean baseline, though this is more use-case than intrinsic food chemistry

## 6. Best current top-3 draft
### Pros
1. beta-glucans are a genuine standout
2. strong fibre and mineral package for a grain
3. may bring unusual extra compounds beyond typical grains

### Cons
1. phytates can slightly reduce mineral uptake
2. some people do not tolerate oats especially well
3. common add-ons can ruin the clean baseline

## 7. What still needs verification before numeric changes
- exact oat form to standardize against
- GI source for that exact form
- whether to explicitly name avenanthramides in the food JSON now or wait until the evidence note is documented

## 8. System takeaway for future foods
Oats is a good template example of how future foods should be handled:
- verify the exact food form first
- separate core nutrient truth from use-case traps
- leave room for special compounds when they are genuinely distinctive
- avoid replacing real food identity with generic practicality filler
