# FOOD-TYPES

This file defines the **11 FoodRanked food types** and their category logic.

## Core rules
- Each food belongs to **one primary food type**.
- Food type determines which **ruleset** is applied.
- Food type influences:
  - palette and sprite language
  - metric applicability
  - metric weights
  - explanation style
- Food types do **not** change the locked 7-section video format.

## The 11 food types

### Vegetables
- Purpose: judge foods that are primarily valued for micronutrients, fibre, and general health support rather than energy density.
- Description: low-energy plant foods used mainly for maintenance, repair, and nutrient density.
- Colour palette: Leaf Green `#4CAF50`
- Icon / sprite idea: leaf, vine, sprout, herb satchel
- Main nutritional priorities:
  - vitamins
  - minerals
  - fibre
  - low sugar / low glycemic impact
- Main penalties:
  - unusually high sugar for category
  - weak fibre density
  - poor micronutrient return
- Notes:
  - fat metrics are usually low-priority
  - philosophy: not fuel — maintenance and repair inputs

### Fruits
- Purpose: judge naturally sweet plant foods by how well sugar is moderated by fibre and micronutrients.
- Description: sweet or semi-sweet whole plant foods with moderate carbs and strong public-health relevance.
- Colour palette: Bright Red `#E53935`
- Icon / sprite idea: fruit badge, basket, orchard crest
- Main nutritional priorities:
  - fibre
  - low-to-moderate glycemic impact
  - useful vitamin density
  - supportive mineral density
- Main penalties:
  - excessive sugar for category
  - weak fibre support
  - poor micronutrient payoff
- Notes:
  - philosophy: sugar moderated by fibre + micronutrients

### Grains
- Purpose: judge staple carbohydrate foods by carb quality, not just carb quantity.
- Description: starch-forward wholefood staples such as rice, oats, barley, and similar foods.
- Colour palette: Golden Wheat `#D4A017`
- Icon / sprite idea: wheat stalk, grain sack, mill sigil
- Main nutritional priorities:
  - starch quality
  - fibre
  - glycemic index control
  - useful protein support
  - supportive minerals
- Main penalties:
  - high glycemic index
  - weak fibre density
  - excessive sugar where relevant
- Notes:
  - philosophy: grains are judged on carb quality, not carb amount

### Legumes
- Purpose: judge beans, lentils, peas, and similar foods by slow carbs plus useful protein.
- Description: mixed carb/protein plant staples with strong fibre and mineral potential.
- Colour palette: Earth Brown `#8D6E63`
- Icon / sprite idea: bean pod, lentil pouch, harvest token
- Main nutritional priorities:
  - fibre
  - low glycemic impact
  - useful protein submetrics
  - mineral density
  - supportive vitamins
- Main penalties:
  - weak fibre
  - poor protein usefulness
  - high glycemic behaviour for category
- Notes:
  - philosophy: legumes win when they are slow carbs + useful protein

### Tubers
- Purpose: judge root and tuber energy foods mostly by carb behaviour and support nutrients.
- Description: root-based staples whose main role is energy provision.
- Colour palette: Rust Orange `#BF6D2A`
- Icon / sprite idea: root badge, shovel sigil, cellar crate
- Main nutritional priorities:
  - glycemic index control
  - fibre
  - useful vitamin support
  - useful mineral support
- Main penalties:
  - very high glycemic impact
  - weak fibre
  - poor micronutrient return
- Notes:
  - protein and fat submetrics are usually deprioritised
  - philosophy: pure energy foods — carb behaviour matters most

### Nuts
- Purpose: judge dense wholefood fat/protein foods by fat quality, fibre, and supportive protein/mineral value.
- Description: calorie-dense wholefood foods where beneficial fats and fibre are major category signals.
- Colour palette: Walnut Brown `#6D4C41`
- Icon / sprite idea: shell crest, nut emblem, woodland token
- Main nutritional priorities:
  - omega 3
  - polyunsaturated fat
  - fibre
  - useful protein submetrics
  - minerals
- Main penalties:
  - saturated fat
  - sugar
  - glycemic index
  - poor bioavailability where relevant
- Notes:
  - philosophy: fat quality + fibre density define nuts

### Seeds
- Purpose: judge seed foods as extreme dense-fat / dense-fibre foods with strong mineral potential.
- Description: compact wholefoods similar to nuts but often even more fibre- and omega-heavy.
- Colour palette: Sand Beige `#C2A878`
- Icon / sprite idea: seed pod, sand rune, grain mote cluster
- Main nutritional priorities:
  - omega 3
  - polyunsaturated fat
  - fibre
  - minerals
  - useful protein support
- Main penalties:
  - saturated fat
  - sugar
  - glycemic index
- Notes:
  - philosophy: seeds are extreme versions of nuts — fibre + omega-3 + minerals dominate

### Meats
- Purpose: judge animal flesh foods by protein quality, micronutrients, and fat quality tradeoffs.
- Description: protein-forward animal foods with near-zero carbs and strong bioavailability relevance.
- Colour palette: Deep Red `#8B0000`
- Icon / sprite idea: butcher crest, cut icon, iron blade emblem
- Main nutritional priorities:
  - essential amino acids
  - non-essential amino acids
  - bioavailability
  - minerals
  - vitamins
- Main penalties:
  - saturated fat
  - cholesterol
  - weak fat quality
- Notes:
  - carb metrics are mostly not applicable
  - philosophy: protein quality + micronutrients define meat

### Dairy
- Purpose: judge milk-based foods by protein usefulness, calcium/minerals, vitamin support, and fat/lactose tradeoffs.
- Description: animal-derived foods with mixed macro profiles and strong calcium identity.
- Colour palette: Cream White `#F5F5DC`
- Icon / sprite idea: milk crest, cheese wedge, dairy seal
- Main nutritional priorities:
  - protein submetrics
  - calcium and minerals
  - vitamins
  - good overall balance
- Main penalties:
  - excessive saturated fat
  - excessive sugar / lactose load
  - weak protein usefulness
- Notes:
  - philosophy: growth-support system — protein + calcium dominate

### Oils & Fats
- Purpose: judge pure-fat foods almost entirely by fat chemistry.
- Description: foods where fat composition overwhelmingly defines category value.
- Colour palette: Amber Yellow `#FFC107`
- Icon / sprite idea: oil drop, bottle icon, golden vial
- Main nutritional priorities:
  - omega 3
  - polyunsaturated fat
  - low saturated fat
  - useful cholesterol profile where relevant
- Main penalties:
  - very high saturated fat
  - poor fat quality
  - unnecessary negative tradeoffs
- Notes:
  - carb and protein metrics are mostly not applicable
  - philosophy: pure fat chemistry — almost nothing else matters

### Misc
- Purpose: hold uncategorisable wholefoods that do not fit cleanly into the other 10 categories.
- Description: context-driven category for edge-case foods that need judgment beyond standard composition patterns.
- Colour palette: Neutral Grey `#9E9E9E`
- Icon / sprite idea: question badge, neutral rune, wildcard token
- Main nutritional priorities:
  - vitamins
  - minerals
  - context-specific strengths
  - evidence-backed pros
- Main penalties:
  - context-specific weaknesses
  - evidence-backed cons
  - poor overall usefulness
- Notes:
  - philosophy: context-driven category — judged more by effects and use-case than by one macro identity
  - this category still needs tighter inclusion criteria later

## Category weighting philosophy

Food type weighting should mostly happen through:
- **metric applicability** (`required`, `optional`, `not_applicable`)
- **metric weight**
- **narration emphasis**

Prefer this over radically different top-level score formulas per category.

## Metric applicability guidance

### Usually relevant across many plant categories
- saturated fat
- omega 3
- polyunsaturated fat
- starch
- fibre
- sugar
- glycemic index
- vitamins
- minerals

### Usually relevant across many animal categories
- saturated fat
- omega 3
- polyunsaturated fat
- cholesterol
- collagen
- essential amino acids
- non-essential amino acids
- bioavailability
- vitamins
- minerals

### Common not-applicable examples
- carbs for meats and oils & fats
- fibre for meats and most dairy
- collagen for most plant categories
- cholesterol for plant categories

## Open questions
- What exactly qualifies for `misc`?
- Will wholefoods-only remain permanent or just v1 scope?
- Which icon/sprite system should be universal versus category-specific?
- Should some categories later split into subtypes, e.g. red meat vs seafood, leafy veg vs starchy veg?
