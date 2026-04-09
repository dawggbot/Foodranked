# Production Safety Blockers

Focused pass for first production-lane foods.

## Reached production-safe
- `foods/tomato.sample.json`
  - locked raw identity
  - weak proxy protein metrics removed
  - provenance notes attached at metric level
  - score readiness can honestly be treated as production-safe

## Near-production-safe
- `foods/oats.sample.json`
  - main blocker: glycemic index is too preparation-dependent for the locked dry rolled-oats identity
  - secondary blocker: proxy amino-acid / bioavailability fields were removed and not yet replaced with source-backed equivalents
- `foods/white-rice.sample.json`
  - main blocker: glycemic index is too variety- and preparation-dependent for the locked dry unenriched long-grain identity
  - secondary blocker: proxy amino-acid / bioavailability fields were removed and not yet replaced with source-backed equivalents
- `foods/chicken-thigh.sample.json`
  - main blocker: old protein-quality fields were proxy estimates and were removed
  - secondary blocker: should attach the exact canonical source record for the chosen raw meat-only form before calling it fully production-safe

## Blocked
- `foods/yam.sample.json`
  - blocker: identity ambiguity
  - note: do not publish until the food is resolved to an honest species / market identity, not just the word "yam"

## Cross-cutting system blockers
- grain rulesets currently lean heavily on glycemic index, but several honest raw dry ingredient records do not have a single production-safe GI number
- meats rulesets still assume protein-quality proxy fields that are not yet attached from exact source-backed records
- provenance schema exists only informally in the food JSONs for now; if this pattern sticks, it should be formalized in docs/schema next
