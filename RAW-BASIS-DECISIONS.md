# Raw Basis Decisions

Rule being applied:
- use **raw per-100g values** by default for base foods
- keep cooked / prepared / processed values only when that prepared state is the real thing being ranked

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

## Convert to raw-base episode or replace with raw equivalent
These should not be the default basis if the goal is to rank the base food.

### Convert
- `foods/cassava-boiled.sample.json`
  - **Decision:** convert or replace with a raw cassava-default entry if cassava is meant to be the base food.
  - **Reason:** `boiled` is a preparation state, not the core identity. if the episode is meant to be cassava generally, raw should be the default basis and boiling should be treated as preparation context.

## Rename / restructure recommended
These are probably fine to keep conceptually, but should be clearer in the dataset.

### Rename / clarify
- soy milk cleanup complete:
  - `foods/soy-milk-unsweetened.sample.json`
  - **Reason:** cleaner product-style naming that matches how people actually think about the food.

## Notes
- The real mistake is not having prepared-food entries.
- The real mistake is letting a prepared state quietly stand in for the base food by default.
- The other real mistake is letting approximate proxy metrics sneak through as if they were canonical source-backed facts.
- So the safest approach is:
  - base ingredient -> raw values
  - prepared product / snack / dish -> prepared values
  - weak proxy metric -> remove or explicitly block
- `foods/bacon.sample.json` has been switched back to a raw-bacon basis so the published numbers reflect what people actually buy and what package labels usually show, rather than cooked concentration.
