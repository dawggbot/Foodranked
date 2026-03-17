# TEST-PACK-OVERVIEW

This is the readable overview for the first FoodRanked v1 test pack.

## What this pack is for

This pack is meant to prove the **scoring backbone** works.
It is not final production data.

It tests:
- machine-readable rulesets
- sample food input structure
- threshold band handling
- context-item scoring
- tier assignment flow

## Included files

### Rulesets
- `rulesets/nuts.v1.json`
- `rulesets/grains.v1.json`
- `rulesets/meats.v1.json`

### Sample foods
- `foods/almonds.sample.json`
- `foods/oats.sample.json`
- `foods/chicken-thigh.sample.json`

---

# 1. RULESET SUMMARY

## Nuts ruleset
**File:** `rulesets/nuts.v1.json`

### Intent
Judges nuts mainly on:
- fat quality
- fibre
- useful protein support
- mineral density

### Main weighted ideas
- omega 3 = high importance
- polyunsaturated fat = high importance
- fibre = high importance
- magnesium = very high importance
- zinc = important
- sugar / saturated fat still matter as penalties

### Example category philosophy
Nuts should do well when they provide strong fats + fibre + minerals without getting dragged down too hard by sugar or weak protein usefulness.

## Grains ruleset
**File:** `rulesets/grains.v1.json`

### Intent
Judges grains mainly on:
- carb quality
- fibre
- glycemic index
- useful mineral support

### Main weighted ideas
- fibre = very high importance
- glycemic index = very high importance
- starch = important
- sugar matters, but not as much as GI/fibre

### Example category philosophy
Grains are judged on how good their carbs are, not simply on having lots of carbs.

## Meats ruleset
**File:** `rulesets/meats.v1.json`

### Intent
Judges meats mainly on:
- protein quality
- amino acid usefulness
- bioavailability
- mineral support
- fat/cholesterol tradeoffs

### Main weighted ideas
- essential amino acids = very high importance
- bioavailability = very high importance
- non-essential amino acids = high importance
- iron / zinc support matters
- carb metrics are not applicable

### Example category philosophy
Meats should win through protein usefulness and micronutrients, while still being penalized when fat quality is weak.

---

# 2. SAMPLE FOOD SUMMARY

## Almonds
**File:** `foods/almonds.sample.json`
**Type:** nuts

### Header values
- kcal: 579
- fat: 49.9g
- carbs: 21.6g
- protein: 21.2g

### Notable metric ideas in sample
- very low omega 3
- decent polyunsaturated fats
- strong fibre
- very strong vitamin E
- strong magnesium and zinc

### Context items
**Pros**
- fairly satiating for the portion

**Cons**
- contains some anti-nutrients

## Oats
**File:** `foods/oats.sample.json`
**Type:** grains

### Header values
- kcal: 389
- fat: 6.9g
- carbs: 66.3g
- protein: 16.9g

### Notable metric ideas in sample
- strong starch level for category
- strong fibre
- decent GI, not amazing
- low sugar
- useful iron / magnesium / zinc

### Context items
**Pros**
- contains useful beta-glucans

**Cons**
- contains some anti-nutrients

## Chicken Thigh
**File:** `foods/chicken-thigh.sample.json`
**Type:** meats

### Header values
- kcal: 209
- fat: 10.9g
- carbs: 0g
- protein: 26.0g

### Notable metric ideas in sample
- strong protein usefulness
- strong bioavailability
- decent zinc / B12 support
- cholesterol is a real penalty
- carb metrics are intentionally not applicable

### Context items
**Pros**
- protein is highly usable

**Cons**
- healthiness depends a lot on preparation

---

# 3. HOW TO TEST THE PACK

Use the scorer script in the workspace:

- `scripts/foodranked-scorer.js`

Example commands:

```bash
node scripts/foodranked-scorer.js foods/almonds.sample.json rulesets/nuts.v1.json
node scripts/foodranked-scorer.js foods/oats.sample.json rulesets/grains.v1.json
node scripts/foodranked-scorer.js foods/chicken-thigh.sample.json rulesets/meats.v1.json
```

---

# 4. IMPORTANT NOTE

All sample food values are approximate placeholders.
They are here to validate the system shape, not to act as final nutrition truth.

Before production use:
- replace values with sourced canonical data
- refine thresholds
- decide exactly how vitamins/minerals normalize when no custom bands are supplied
- test many foods per category
