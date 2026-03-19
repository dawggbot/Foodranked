# Raw Basis Decisions

Rule being applied:
- use **raw per-100g values** by default for base foods
- keep cooked / prepared / processed values only when that prepared state is the real thing being ranked

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
- So the safest approach is:
  - base ingredient -> raw values
  - prepared product / snack / dish -> prepared values

## Recommended next actions
1. create a raw cassava default entry
2. rename or replace the soy milk powder-basis entry
3. leave the other flagged files as prepared/product-specific episodes
4. continue auditing future files with the same rule
 with the same rule
odes
4. continue auditing future files with the same rule
