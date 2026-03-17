# VEGETABLES-CALIBRATION-RESULTS

Vegetables-only calibration check against the initial `vegetables.v1` ruleset.

## Anchor results

- **Spinach** → **S** (`53`)
  - base score: 50
  - context adjustment: +3
  - fats: 66.7
  - carbs: 70.0
  - proteins: 61.1
  - vitamins: 65.7
  - minerals: 8.3

- **Carrots** → **B** (`28`)
  - base score: 25
  - context adjustment: +3
  - fats: 66.7
  - carbs: 41.7
  - proteins: 38.9
  - vitamins: 30.0
  - minerals: 0.0

- **Iceberg Lettuce** → **D** (`12`)
  - base score: 21
  - context adjustment: -9
  - fats: 66.7
  - carbs: 60.0
  - proteins: 38.9
  - vitamins: 4.3
  - minerals: 0.0

## Read of the category right now

This is a workable first vegetable pass:
- spinach lands as a clear elite vegetable anchor
- carrots work as a believable middle reference
- iceberg lettuce lands in D because the nutrient payoff is simply too weak for the category

## What the ruleset is currently saying

- vegetables are being judged mostly by micronutrient payoff, which is correct
- fibre and carb behaviour are still helping with separation
- context penalties are doing useful cleanup for weak low-payoff vegetables

## Remaining concerns

- carrots may still feel a touch low if the channel wants to be more generous to practical staple vegetables
- iceberg lettuce gets decent carb behaviour credit before the weak-payoff penalties and low micronutrients drag it down
- more anchors like broccoli, kale, cucumber, and bell peppers will tell us whether the bands are truly stable
