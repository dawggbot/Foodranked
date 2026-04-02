# Foodranked Master Nutrition Audit Checklist

## Goal
Upgrade Foodranked from calibration/sample-grade nutrition data to a defensible, auditable food database with stronger per-category scoring, smarter pros/cons, and cleaner tier placement.

## Immediate observations from first pass

### Ruleset philosophy confirmed
- **Tubers**: carbs dominate, vitamins/minerals are strong separators, fats should barely matter, protein should barely matter.
- **Vegetables**: vitamins + minerals dominate heavily; carbs matter but mainly via fibre / sugar / GI.
- **Grains**: carbs dominate strongly; fibre and GI are major levers; minerals matter; protein matters a bit.

### Weaknesses already visible
- Food files still explicitly say many values are approximate placeholders.
- Context items are structured, but many are generic/manual and not yet special enough.
- The framework supports exceptions, but the database needs stronger food-specific evidence and less filler.

## Core audit loop for every food
1. Confirm food identity and format being ranked.
   - raw vs cooked vs packaged vs drained vs roasted vs salted
   - make sure basis is truly per 100g of the ranked form
2. Cross-check nutrition values against multiple reputable sources.
3. Decide canonical values and document confidence.
4. Review current ruleset fit.
5. Review current pros/cons.
6. Add food-specific exception notes where deserved.
7. Ask tier sanity questions:
   - Does this belong with the foods currently in this tier?
   - Should it rank below foods in the tier above?
   - Should it rank above foods in the tier below?
8. Adjust food data, context items, or ruleset bands/weights as needed.
9. Re-run outputs and compare leaderboard placement.

## Canonical source hierarchy
Use multiple sources where possible; prefer agreement across them over blind single-source trust.

Primary sources:
- USDA FoodData Central
- NCCDB when available
- UK McCance & Widdowson / GOV nutrition tables if relevant
- NIH ODS fact sheets for vitamin/mineral context
- Peer-reviewed review papers for special compounds / phytonutrients / bioavailability notes
- Manufacturer label for packaged foods when the product itself is the thing being ranked

Secondary support sources:
- Harvard T.H. Chan Nutrition Source
- Cleveland Clinic / Mayo / NHS for practical digestion/tolerance context
- PubMed reviews for specific compounds or preparation effects

## Required numeric verification fields
For each food, verify where relevant:
- kcal
- fat_g
- carb_g
- protein_g
- saturated_fat_g
- omega3_mg
- polyunsaturated_fat_g
- starch_g
- fibre_g
- sugar_g
- glycemic_index
- essential_amino_acids_score
- nonessential_amino_acids_score
- bioavailability_percent
- vitamin_a_dv
- vitamin_c_dv
- vitamin_d_dv
- vitamin_e_dv
- vitamin_k_dv
- vitamin_b12_dv
- iron_dv
- magnesium_dv
- zinc_dv
- calcium_dv
- potassium_dv

## Extended context field checklist
These are candidate extra-value or extra-risk fields for pros/cons. Not every food gets them. Use only when genuinely notable.

### Beneficial / notable upside candidates
- beta-glucans
- resistant starch
- soluble fibre quality
- insoluble fibre quality
- prebiotic potential
- probiotic relevance
- fermentation benefits
- polyphenols
- flavonoids
- avenanthramides
- carotenoids
- glucosinolates
- lignans
- anthocyanins
- catechins
- lycopene
- lutein / zeaxanthin
- selenium richness
- choline richness
- iodine relevance
- omega-3 form quality (ALA vs EPA/DHA)
- amino acid quality beyond raw protein total
- unusually good bioavailability
- satiety advantage
- hydration / volume advantage
- culinary versatility / practical adherence value
- low processing burden
- whole-food integrity

### Negative / caution candidates
- sodium burden
- free sugar / added sugar burden
- glycemic volatility
- saturated fat burden
- trans fat risk
- oxidation vulnerability
- contaminant concern (e.g. mercury)
- pesticide residue concern when materially relevant
- anti-nutrients
- phytates
- oxalates
- lectins
- goitrogen relevance
- purine burden
- histamine relevance
- digestive tolerance issues
- allergen relevance
- hyper-palatability / overconsumption risk
- processing burden
- additive burden
- poor satiety for calories
- preparation trap (healthy baseline, bad common preparation)
- rancidity/storage fragility

## Food-specific exception policy
Do NOT flatten foods into generic pros/cons.
Ask:
- Is there a signature compound or mechanism here?
- Is it meaningfully stronger than peers in the same category?
- Does it matter enough to deserve one of the top 3 slots?

Examples:
- Oats -> beta-glucans, possibly avenanthramides, mineral-binding phytate caveat
- Extra virgin olive oil -> polyphenols, oxidation/handling nuance, energy density
- Kale -> vitamin K density, carotenoids/glucosinolates, oxalate/goitrogen nuance if relevant
- Walnuts -> ALA omega-3 standout
- Salmon -> EPA/DHA, selenium, contaminant/farming nuance
- Salted seed variants -> sodium only if materially high enough to matter

## First-pass category focus
1. Tubers
2. Vegetables
3. Grains

Reason:
- already have calibration clues
- enough nuance to improve scoring quality quickly
- strong opportunity for food-specific exception handling

## Immediate food notes from first read

### White Potato
Current position makes sense as a respectable but not elite tuber.
Likely durable positives:
- practical staple / affordability / meal utility
- potassium contribution
- decent satiety in minimally processed forms
Likely durable negatives:
- only moderate fibre
- middling GI depending on preparation/cooling
- micronutrients not exceptional vs best tubers
Need to verify whether GI and potassium values are still the right anchors.

### Yam
Looks like it may deserve stronger micronutrient framing than the current generic context gives it.
Current pros/cons are too generic.
Potential better direction:
- highlight fibre + potassium + vitamin C / carotenoid profile if truly standout for the specific yam entry
- reduce vague category-level filler like "still a carb-heavy category"
Need canonical-source check because yam data can vary wildly by species and confusion with sweet potato is common.

### Oats
Already closer to the right shape.
Likely notable positives worth keeping room for:
- beta-glucans
- good fibre density
- strong mineral density for a grain
- possibly avenanthramides if evidence threshold is met
Likely notable negatives worth refining:
- phytates / anti-nutrient mineral-binding nuance
- topping/preparation trap should only be used carefully if the ranked item is plain oats
- digestive tolerance note should stay only if it remains more useful than other candidate cons

## Ruleset tightening hypotheses

### Tubers ruleset
- Probably good overall philosophy.
- Need to verify whether fibre/GI bands create enough separation between white potato, yam, sweet potato, fries.
- Context majors currently matter a lot because only majors score (+3 / -3). That may be fine, but generic context lines must be removed if they influence final tiers.

### Vegetables ruleset
- Very micronutrient-forward, which is right.
- Need to make sure vegetables are not over-punished for natural sugars when those sugars are trivial in practice.
- Need exception capacity for crucifers, leafy greens, tomato products, etc.

### Grains ruleset
- GI + fibre dominance makes sense.
- Need to ensure oats, whole wheat, white rice, rice cakes etc. land intuitively.
- Consider whether protein/bioavailability treatment is too crude for grains.

## Deliverables to produce during this audit
- canonical-source notes per food
- cleaned food JSON values
- upgraded context item catalog / logic
- category calibration notes
- rerun leaderboard outputs
- site/output sync check

## Next concrete actions
1. Pull more representative foods for tubers, vegetables, and grains.
2. Create per-category audit sheets.
3. Create a context-item shortlist catalog so pros/cons are selected from meaningful candidates rather than filler.
4. Re-score anchor foods after first corrections.
