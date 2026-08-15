# Raw Basis Audit

Default rule:
- whole foods should use one **raw per-100g base entry** where reasonably available
- do not keep separate cooked or prepared whole-food entries
- packaged, processed, or branded products may use the prepared state in which they are sold or eaten

## Production-lane audit status

### Locked enough for production or near-production use
- `foods/tomato.sample.json`
  - locked to **tomatoes, red, ripe, raw, year round average**
  - raw edible-portion basis is coherent
  - weak protein proxy metrics removed
  - currently safe to treat as the first genuinely production-safe entry
- `foods/oats.sample.json`
  - locked to **plain rolled oats, dry**
  - dry per-100g basis is coherent for packaging and scoring inputs
  - grain GI intentionally withheld because dry-record GI is not a stable canonical fact
  - near-production-safe, not fully production-safe yet
- `foods/white-rice.sample.json`
  - locked to **plain unenriched long-grain white rice, dry**
  - dry per-100g basis is coherent for packaging and scoring inputs
  - GI intentionally withheld because rice variety and preparation swing the value too much
  - near-production-safe, not fully production-safe yet
- `foods/chicken-thigh.sample.json`
  - locked to **chicken thigh, meat only, raw**
  - raw meat-only basis is coherent
  - weak amino-acid, collagen, and bioavailability proxy metrics removed
  - near-production-safe, not fully production-safe yet

### Still blocked on identity honesty
- `foods/yam.sample.json`
  - still blocked
  - "yam" is too ambiguous for production without locking the actual species / common-market identity
  - do not treat the current record as canonical until that identity is resolved honestly

## Obvious entries to review
These file names still strongly suggest prepared-state or format-specific entries:

- `foods/baked-beans.sample.json`
- `foods/popcorn-air-popped.sample.json`
- `foods/soy-milk-unsweetened-powder-basis.sample.json`
- `foods/watermelon-seeds-roasted-salted.sample.json`
- `foods/watermelon-seeds-unsalted.sample.json`
- `foods/mixed-nuts-unsalted.sample.json`

## Likely treatment
- keep as-is **only if** the prepared / mixed / processed format is a packaged, processed, or branded product that is the real episode subject
- remove cooked/prepared whole-food variants and keep the raw-base food; treat preparation as context, not a second food entry
- see `RAW-BASIS-DECISIONS.md` for the current keep / convert calls

## Notes
- some foods like fries, baked beans, roasted salted seeds, and drinks may reasonably stay prepared-format because they are packaged or processed products viewers judge in that form
- the important rule is to keep one raw/base identity for whole foods instead of separate cooking-state variants
- a second rule is now explicit too: if a metric is only a weak proxy for the locked food identity, remove it instead of pretending it is canonical
