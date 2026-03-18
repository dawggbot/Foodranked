# Overnight progress — 2026-03-18

## What changed

### 1) Expanded the foods dataset heavily
Added a broad representative pressure-test set across the current food types.

Net result:
- most categories now sit at **14 foods**
- `fruits` and `misc` ended up at **15 foods** because the added set was especially useful for pressure-testing those categories
- total food records now cover the original calibration set plus **112 newly written sample records**

High-level additions include:
- fruits: apple, orange, blueberries, strawberries, pear, kiwi, mango, pineapple, avocado, lemon, pomegranate
- vegetables: kale, red bell pepper, cauliflower, cabbage, zucchini, brussels sprouts, asparagus, tomato, mushrooms, onion
- grains: barley, buckwheat, whole wheat, millet, cornmeal, white rice, air-popped popcorn, rye, bulgur, whole-wheat couscous
- legumes: black beans, kidney beans, split peas, navy beans, edamame, green peas, black-eyed peas, pinto beans, lima beans, unsweetened soy milk (pressure-test case)
- tubers: yam, purple sweet potato, green plantain, taro, parsnip, rutabaga, beetroot, jerusalem artichoke, turnip, cassava
- nuts: pistachios, hazelnuts, cashews, pecans, brazil nuts, macadamia, pine nuts, acorns, mixed nuts, almond butter
- seeds: pumpkin, hemp, sunflower, poppy, cumin, watermelon, nigella, mustard, caraway, ground flaxseed
- meats: sardines, mackerel, cod, tuna, lean beef, turkey breast, pork loin, shrimp, anchovies, lamb
- dairy: skimmed milk, whole milk, kefir, mozzarella, parmesan, ricotta, feta, plain yogurt, whey isolate, cream cheese
- misc: black tea, cocoa powder, dark chocolate 85%, zero-sugar energy drink, cola, sports drink, apple cider vinegar, protein bar, electrolyte drink, kombucha, jam
- oils and fats: avocado oil, canola oil, ghee, lard, beef tallow, sesame oil, peanut oil, palm oil, duck fat, flaxseed oil

### 2) Fixed output generation for larger datasets
The original leaderboard export flow was still sized for the tiny calibration set and could overflow its process buffer once the dataset became much bigger.

Fix made:
- increased the process buffer in:
  - `scripts/foodranked-score-all.js`
  - `scripts/foodranked-export-leaderboards.js`

That means the repo can now actually regenerate category outputs from the expanded dataset instead of silently failing partway through.

### 3) Refined rulesets where the larger sample exposed inflation
I kept the underlying scoring philosophy intact and only tightened category tier thresholds where the expanded data clearly made top tiers too easy.

Refinements made:
- `rulesets/oils-and-fats.v1.json`
  - S-tier was too permissive once more oils were added
  - top-tier now requires a more clearly elite result
- `rulesets/dairy.v1.json`
  - too many dairy items were landing in S by default
  - S-tier is now narrower and better reserved for the strongest dairy profiles

### 4) Expanded phrase banks in a way the system can actually use
I expanded:
- `references/phrase-banks/narration-core.json`
- `references/phrase-banks/category-context.json`
- `references/phrase-banks/exaggeration-rules.json`

And updated:
- `scripts/foodranked-generate-script.js`

Key improvement:
- the generator no longer always picks the first phrase in each bank
- phrase selection is now deterministic but food-specific, so expansion produces real narration variety without random unstable outputs

### 5) Regenerated leaderboard outputs
Refreshed:
- `outputs/leaderboards/all-categories.json`
- every per-category leaderboard JSON
- `outputs/leaderboards/leaderboards.md`

### 6) Wrote workflow automation research
Added:
- `WORKFLOW-AUTOMATION-RESEARCH.md`

This proposes the most efficient practical path to automate the channel end-to-end without over-automating editorial taste too early.

## Current category behavior after expansion

### Strong / mostly healthy
- **grains** now look much more informative across refinement quality
- **legumes** still read as a very strong category, which matches the project philosophy
- **misc** now behaves more like a use-case category instead of a fake nutrition category
- **oils-and-fats** is more believable after threshold tightening

### Still somewhat unstable / worth watching
- **nuts** may still punish non-walnut nuts a bit too hard because omega-3 weighting strongly shapes the hierarchy
- **vegetables** has several very low placements for low-payoff vegetables; this may be philosophically okay, but it is worth checking whether the floor is too harsh for broadly useful low-calorie vegetables
- **tubers** still lean harsh on several realistic staples; this may be correct, but it is a category to review again with cooked/prepared-state assumptions written more explicitly
- **dairy** is more believable now, but whey isolate versus whole-food dairy still needs an editorial judgment pass

## Biggest remaining risks
1. The expanded food set is intentionally representative and pressure-test oriented, but many values are still **approximate placeholders**, not a rigorously sourced nutrient database.
2. Some categories are still partially driven by philosophy embedded in threshold choices rather than a large validated real-world benchmark set.
3. The narration generator is more varied now, but the voice system could still be expanded further with section-specific lead-ins, debate lines, and tighter food-type-specific closes.
4. There is still no full episode manifest / render pipeline yet — only the scoring + script side is substantially automated.

## Recommended next task
Build the first end-to-end production backbone:

**`scripts/foodranked-generate-episode.js`**

It should:
- accept a food id
- score the food
- generate script JSON
- generate narration text
- write an episode manifest
- save everything into an episode output folder

That is the highest-leverage next step because it turns the repo from a ranking system into a repeatable content production machine.
