# Raw Basis Decisions

Rule being applied:
- use one **raw per-100g entry** for whole foods
- do not keep separate cooked or prepared whole-food variants
- allow packaged, processed, or branded products to use the state in which they are sold or eaten

## Production-lane decisions from the focused cleanup pass

### Locked now
- `foods/tomato.sample.json`
  - **Decision:** keep and treat as production-safe.
  - **Locked identity:** tomatoes, red, ripe, raw, year round average.
  - **Reason:** identity and basis are specific enough, and the remaining metrics are defensible without fake proxy protein scoring.

- `foods/oats.sample.json`
  - **Decision:** keep, but only as near-production-safe for now.
  - **Locked identity:** plain rolled oats, dry.
  - **Reason:** the raw dry basis is coherent, but glycemic index is too preparation-dependent to lock cleanly from the dry record.

- `foods/white-rice.sample.json`
  - **Decision:** keep, but only as near-production-safe for now.
  - **Locked identity:** plain unenriched long-grain white rice, dry.
  - **Reason:** the raw dry basis is coherent, but glycemic index is too rice-type and preparation dependent to lock as a single canonical number.

- `foods/chicken-thigh.sample.json`
  - **Decision:** keep, but only as near-production-safe for now.
  - **Locked identity:** chicken thigh, meat only, raw.
  - **Reason:** basis is now honest, but the old protein-quality proxy fields were not strong enough to keep as canonical production facts.

### Explicitly blocked
- `foods/yam.sample.json`
  - **Decision:** block for production until identity is resolved.
  - **Reason:** "yam" can point to materially different foods depending on region and marketplace usage, so the current record is too ambiguous.

## Keep as prepared / format-specific episode
These should stay as they are, because the prepared or format-specific version is meaningfully different from the raw ingredient and is plausibly the real subject viewers care about.

### Keep
- `foods/baked-beans.sample.json`
  - **Reason:** this is not just "beans". it is a canned sweet-sauce processed food with a distinct nutritional and practical identity.
- `foods/popcorn-air-popped.sample.json`
  - **Reason:** viewers are judging popcorn as eaten, not raw corn kernels. air-popped is also the cleanest practical popcorn format.
- `foods/watermelon-seeds-roasted-salted.sample.json`
  - **Reason:** the roasted + salted format is the actual snack product being judged.
- `foods/watermelon-seeds-unsalted.sample.json`
  - **Reason:** this is still a real consumer-ready seed-snack format, distinct from raw in-shell melon seeds.
- `foods/mixed-nuts-unsalted.sample.json`
  - **Reason:** this is a deliberate snack mix/product category, not a base single food.
- `foods/fries.sample.json`
  - **Reason:** fries are clearly a prepared food, not a raw potato entry in disguise.
- `foods/soy-milk-unsweetened-powder-basis.sample.json`
  - **Tentative keep, but rename/rework recommended.**
  - **Reason:** soy milk is a real finished format, but the current `powder basis` naming is awkward and easy to misunderstand.

## Removed cooked whole-food variant
- `foods/cassava-boiled.sample.json`
  - **Decision:** removed from the dataset; keep the existing raw cassava entry instead.
  - **Reason:** `boiled` is a preparation state, not a separate whole-food identity. Boiling belongs in preparation context rather than a second food entry.

## Rename / restructure recommended
These are probably fine to keep conceptually, but should be clearer in the dataset.

### Rename / clarify
- soy milk cleanup complete:
  - `foods/soy-milk-unsweetened.sample.json`
  - **Reason:** cleaner product-style naming that matches how people actually think about the food.

## Notes
- The real mistake is not having prepared-food entries.
- The real mistake is keeping separate cooking-state entries for a whole food when a raw/base identity already exists.
- The other real mistake is letting approximate proxy metrics sneak through as if they were canonical source-backed facts.
- So the safest approach is:
  - whole food -> one raw/base entry
  - packaged, processed, or branded product -> prepared/as-sold values when appropriate
  - weak proxy metric -> remove or explicitly block
- `foods/bacon.sample.json` has been switched back to a raw-bacon basis so the published numbers reflect what people actually buy and what package labels usually show, rather than cooked concentration.
