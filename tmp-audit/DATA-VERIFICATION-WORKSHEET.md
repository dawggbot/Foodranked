# Data Verification Worksheet

## Current approach
Before changing numeric values, confirm each food's exact ranked form and collect at least 2 reputable references where possible.
The project currently contains many approximate placeholders, so this worksheet is the staging area for moving foods toward canonical values.

## Source quality ladder
1. USDA FoodData Central
2. National/academic databases (e.g. McCance & Widdowson, NCCDB when accessible)
3. Peer-reviewed reviews for special compounds, GI nuance, anti-nutrient notes, and bioavailability context
4. Secondary nutrition aggregators only as support, not sole authority
5. Manufacturer labels only when the ranked item is specifically a packaged product

## Important normalization rules
- Always verify the ranked form:
  - raw vs cooked
  - dry vs hydrated
  - whole vs flour
  - salted vs unsalted
  - fried vs baked
  - product vs ingredient
- Keep basis at per 100g of the actual ranked form.
- GI often needs a different source path than standard nutrient tables.
- Special compounds (lycopene, beta-glucans, avenanthramides, glucosinolates, etc.) often need literature support rather than generic nutrient tables.

---

## Food verification queue

### Oats
Current profile looks directionally plausible for raw oats:
- kcal 389
- fat 6.9g
- carbs 66.3g
- protein 16.9g
- fibre 10.6g
- iron 26% DV
- magnesium 44% DV
- zinc 36% DV
- GI 55

Confidence so far:
- High confidence that base macros/minerals are in the right ballpark for raw oats.
- Medium confidence on GI because GI depends on oat form and processing.
- High confidence that beta-glucans deserve a pro.
- Medium confidence that avenanthramides deserve explicit permanent mention pending a literature-backed phrasing pass.

Needed checks:
- exact oat form being ranked (raw rolled oats? whole oats? generic raw oats?)
- beta-glucan framing source
- avenanthramide framing source
- GI source for the exact oat form

### White Rice
Current profile looks plausible for raw unenriched white rice:
- kcal 365
- carbs 80g
- fibre 1.3g
- protein 7.1g
- GI 73

Confidence so far:
- High confidence that the broad macro/fibre story is directionally right.
- Medium confidence on exact mineral values because enrichment / grain type can change them a lot.
- Medium confidence on GI because rice GI varies a lot by variety and preparation.

Needed checks:
- exact rice type intended (long-grain? generic white rice?)
- unenriched vs enriched
- GI source for the chosen standard form

### Tomato
Current profile looks plausible for raw tomato:
- kcal 18
- carbs 3.9g
- fibre 1.2g
- vitamin C 17% DV

Confidence so far:
- High confidence that the basic nutrient profile is close.
- High confidence that lycopene is a legitimate special-note candidate.
- Medium confidence on whether lycopene should be emphasized in raw tomato versus cooked tomato products.

Needed checks:
- lycopene wording for raw tomato specifically
- whether cooked tomato products should eventually be treated separately from raw tomato in the database

### Kale
Current profile looks plausible for raw kale:
- kcal 49
- fibre 4.1g
- vitamin A 57% DV
- vitamin C 80% DV
- vitamin K 570% DV
- calcium 11% DV

Confidence so far:
- High confidence that kale is an elite vegetable nutritionally.
- High confidence that vitamin K density is a defining feature.
- Medium confidence on how strongly to phrase glucosinolate/carotenoid specifics without literature notes.

Needed checks:
- glucosinolate framing source
- whether calcium / magnesium / iron values are still the best chosen anchors

### Whole Wheat
Current profile looks plausible for a whole-wheat / whole-grain form, but identity is ambiguous.
Potential problem:
- "whole wheat" could mean whole grain kernels, flour, bread ingredient context, etc.
This must be disambiguated before values are treated as canonical.

Needed checks:
- exact ranked form
- whether GI 45 is tied to the chosen form or borrowed from another context
- mineral values against USDA / equivalent source

---

## Immediate conclusions
1. The current placeholder data is often directionally reasonable.
2. The bigger issue right now is exact form ambiguity and source confidence, not that every number is obviously insane.
3. GI and special compounds need extra care because they are easy to overstate.
4. Context improvements can proceed in parallel with source verification, but numeric changes should wait for exact source matching.

## Next data-side tasks
1. Pull exact USDA-compatible rows or equivalent references for:
   - oats
   - white rice
   - tomato
   - kale
   - whole wheat
2. Record exact form choices for each food.
3. Compare current JSON values field-by-field.
4. Only then update numeric values and source notes.
