# OILS-AND-FATS-CALIBRATION-RESULTS

Oils-and-fats-only calibration check against the final first-pass `oils-and-fats.v1` ruleset.

## Anchor results

- **Extra Virgin Olive Oil** → **S** (`78`)
  - base score: 74
  - context adjustment: +4
  - fats: 86.9
  - vitamins: 56.0
  - minerals: 0.0

- **Butter** → **B** (`27`)
  - base score: 15
  - context adjustment: +12
  - fats: 17.9
  - vitamins: 8.0
  - minerals: 0.0

- **Margarine** → **D** (`7`)
  - base score: 34
  - context adjustment: -27
  - fats: 45.2
  - vitamins: 0.0
  - minerals: 0.0

## Read of the category right now

This category is deliberately more editorial than most.
That is intentional.

Why:
- raw fat chemistry alone was making some processed spreads look too good
- the user explicitly wants butter treated as a flawed but legitimate middle-ground fat
- the user explicitly wants margarine treated as a weak processed-fat anchor

## What the ruleset is currently saying

- fat chemistry still dominates the base score
- but context matters more here than in other categories because processing, trust, simplicity, and traditional legitimacy are central to how this category is being defined
- olive oil wins on both chemistry and context
- butter survives as a middle anchor because its positive context is deliberately strong
- margarine crashes because its processing/context penalties are deliberately extreme

## Important note

This is not a neutral scientific model of all fats.
It is an editorially shaped category model aligned to the channel philosophy currently being built.

## Remaining concerns

- if the project later wants a more chemistry-pure fats model, this category will need a second ruleset version
- avocado oil, canola oil, coconut oil, and ghee would be useful next anchors to pressure-test whether this editorial framing still holds up
