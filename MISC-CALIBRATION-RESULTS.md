# MISC-CALIBRATION-RESULTS

Misc-only calibration check against the blueprint-aligned `misc.v1` ruleset.

## Anchor results

- **Green Tea** → **S** (`24`)
  - base score: 0
  - context adjustment: +24
  - vitamins: 0.0
  - minerals: 0.0

- **Coffee** → **B** (`8`)
  - base score: 0
  - context adjustment: +8
  - vitamins: 0.0
  - minerals: 0.0

- **Processed Honey** → **D** (`0`)
  - base score: 0
  - context adjustment: -24
  - vitamins: 0.0
  - minerals: 0.0

## Read of the category right now

This category behaves exactly like the blueprint said it should:
- macros/submacros do nothing
- vitamins/minerals matter only if they actually exist in meaningful amounts
- pros/cons dominate the result

## What the ruleset is currently saying

- green tea wins because it has unusually clean upside with low downside
- coffee lands in the middle because it has real benefits but also real stimulant tradeoffs
- processed honey crashes because, in a context-driven category, concentrated sugar with weak overall payoff is a clean D anchor

## Important note

This category is intentionally not composition-driven.
It is effectively an effects/use-case/context category.
That is why it works for items like:
- tea
- coffee
- honey
- seasonings
- similar edge-case ingestibles

## Remaining concerns

- raw honey should be added later as a pressure-test case because it should score above processed honey if the context model is doing its job
- seasonings like cinnamon or turmeric may need careful handling because per-100g data can look absurd for tiny-dose items
- this category may eventually want a separate serving-reality layer, but the current context-heavy model is a good first simplification
