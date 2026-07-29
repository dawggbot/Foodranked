const CONTEXT_SIDES = ['pros', 'cons'];

const SECTION_RECAP_CONTEXT_TITLE_PATTERNS = [
  { pattern: /\bprotein contribution is tiny\b/i, message: 'plain protein-section recap in context item' },
  { pattern: /\bprotein is basically absent\b/i, message: 'plain protein-section recap in context item' },
  { pattern: /\bprotein support is weak\b/i, message: 'plain protein-section recap in context item' },
  { pattern: /\bprotein\b/i, message: 'plain protein-section recap in context item' },
  { pattern: /\bfib(?:re|er)\b/i, message: 'plain carb-submacro recap in context item' },
  { pattern: /\bglycemic\b|\bGI\b/i, message: 'plain carb-submacro recap in context item' },
  { pattern: /\bcarb load\b|\bstarch\b|\bsugar\b|\bsweetness\b/i, message: 'plain carb-section recap in context item' },
  { pattern: /\bmineral density is genuinely strong\b/i, message: 'plain mineral-section recap in context item' },
  { pattern: /\belite mineral density\b/i, message: 'plain mineral-section recap in context item' },
  { pattern: /\bunusually strong mineral density for a grain\b/i, message: 'plain mineral-section recap in context item' },
  { pattern: /\bmineral\b|\bmicronutrient\b|\bcalcium\b|\bpotassium\b|\biron\b|\bmagnesium\b|\bzinc\b/i, message: 'plain mineral-section recap in context item' },
  { pattern: /\bvitamin c reputation is a real strength\b/i, message: 'plain vitamin-section recap in context item' },
  { pattern: /\bvitamin\b|\bcarotenoid\b/i, message: 'plain vitamin-section recap in context item' },
  { pattern: /\bfat quality\b|\bfat support\b|\bsaturated fat\b|\bcholesterol\b/i, message: 'plain fat-section recap in context item' },
  { pattern: /\bcalorie density\b|\benergy density\b|\bcalories concentrate\b|\bnear-zero calories\b/i, message: 'plain energy-density recap in context item' }
];

const TYPE_FALLBACKS = {
  fruits: {
    pros: [
      item('easy whole-food sweet swap', 'Useful when you want something sweet that still feels like real food.'),
      item('simple snack format', 'No recipe needed, which helps it survive normal routines.'),
      item('fresh texture helps meals', 'It can brighten a plate without much fuss.')
    ],
    cons: [
      item('easy to eat quickly', 'Snackable fruit can disappear before it feels like much food.'),
      item('satiety can fade quickly', 'Many fruits work better with a fuller meal around them.'),
      item('freshness window is short', 'Ripeness, bruising, and storage can limit real-world use.')
    ]
  },
  vegetables: {
    pros: [
      item('very low-downside whole food baseline', 'It is easy to add without making the meal feel heavier.'),
      item('helps make meals feel more balanced', 'A practical plus because good foods need realistic use cases.'),
      item('easy to build meals around', 'It works as a flexible add-on instead of a special project.')
    ],
    cons: [
      item('prep can decide whether it actually gets eaten', 'Washing, chopping, or cooking can become the real barrier.'),
      item('texture or flavour can limit repeat use', 'Good food still has to survive normal eating habits.'),
      item('very light profile can feel underpowered', 'For some vegetables, the payoff is more volume and texture than meal impact.')
    ]
  },
  grains: {
    pros: [
      item('works as a practical staple', 'It is easy to understand, batch, and build meals around.'),
      item('easy to cook at scale', 'That matters for a food people might actually use often.'),
      item('works as a meal anchor', 'Useful staples make the rest of the plate easier to plan.')
    ],
    cons: [
      item('pairing quality changes the result', 'A plain staple can become much weaker or stronger depending on the meal.'),
      item('portions can creep up', 'Staple foods are easy to serve casually.'),
      item('refinement changes it fast', 'Processing can strip away much of the reason to choose it.')
    ]
  },
  legumes: {
    pros: [
      item('does a lot of meal jobs at once', 'That multi-use role is why legumes stay valuable.'),
      item('usually filling in real meals', 'They often make a plate feel more complete.'),
      item('cheap way to buy real food', 'Budget usefulness matters when ranking everyday staples.')
    ],
    cons: [
      item('digestion can vary', 'The same traits that make them useful can bother some people.'),
      item('prep can be a barrier', 'Soaking, cooking, or rinsing can decide whether they actually get used.'),
      item('packaged versions can drift', 'Sauces, snacks, and shortcuts can weaken the plain-legume case.')
    ]
  },
  tubers: {
    pros: [
      item('practical staple base', 'Tubers are often judged by how usable they are day to day.'),
      item('can be fairly filling when kept simple', 'That is a useful strength when preparation stays sensible.'),
      item('works across lots of cooking styles', 'Utility counts for staple foods.')
    ],
    cons: [
      item('preparation changes outcomes a lot', 'What you do to a tuber can make or break it.'),
      item('not usually grab-and-go', 'Most tubers need cooking before they become useful.'),
      item('plain versions may need help', 'The toppings or format can end up deciding the real result.')
    ]
  },
  nuts: {
    pros: [
      item('portable snack format is genuinely useful', 'Convenience matters when the serving stays sensible.'),
      item('texture helps satiety', 'Crunch and richness can make small servings feel more satisfying.'),
      item('better default than many packaged snacks', 'A plain nut usually has a cleaner role than snack foods built around coating or crunch.')
    ],
    cons: [
      item('portions are easy to overshoot', 'A small handful change can matter quickly.'),
      item('cost or allergy issues can limit use', 'A good profile still has to be practical for real people.'),
      item('coated versions can drift fast', 'Roasting, salting, and sweet coatings can change the whole case.')
    ]
  },
  seeds: {
    pros: [
      item('easy to sprinkle into meals', 'Small add-ons can be realistic when they do not need a full recipe.'),
      item('small amounts can change texture fast', 'That makes them useful as a support food.'),
      item('useful support-food role', 'Seeds are better at boosting meals than carrying them alone.')
    ],
    cons: [
      item('real serving sizes are often small', 'The practical impact can be smaller than the stat sheet suggests.'),
      item('texture or prep can be a barrier', 'Grinding, soaking, or chewing can decide whether the payoff is real.'),
      item('100-gram numbers overstate normal use', 'Most people use seeds in much smaller amounts.')
    ]
  },
  meats: {
    pros: [
      item('satisfying centre-of-plate role', 'It can make meal planning straightforward.'),
      item('easy to build meals around', 'A clear anchor helps the rest of the plate make sense.'),
      item('simple meal-planning anchor', 'That practicality is a real category strength.')
    ],
    cons: [
      item('cut and cooking method change it fast', 'The exact version matters more than the broad name.'),
      item('storage and cost can be annoying', 'Fresh meat asks more from the shopper than shelf-stable staples.'),
      item('sourcing and processing matter a lot', 'The category can swing sharply depending on how it is produced and sold.')
    ]
  },
  dairy: {
    pros: [
      item('easy to fit into familiar meals', 'Convenience is one of the category strengths.'),
      item('convenient meal add-on', 'It can improve a meal without much prep.'),
      item('fermented formats can bring extra value', 'Some dairy gives a food-culture angle beyond the basic label.')
    ],
    cons: [
      item('not everyone tolerates dairy well', 'Digestive comfort can decide whether the food is useful.'),
      item('processing changes the category a lot', 'Plain, fermented, sweetened, and heavily salted versions behave very differently.'),
      item('sweetened or salty formats can drift fast', 'The category label alone does not tell the whole story.')
    ]
  },
  'oils-and-fats': {
    pros: [
      item('very useful in cooking', 'A small amount can change texture, flavour, and whether the meal works.'),
      item('small amounts can change a whole meal', 'That leverage matters when the use case is controlled.'),
      item('can make the rest of the meal work better', 'Cooking value counts when the portion stays deliberate.')
    ],
    cons: [
      item('easy to overpour without noticing', 'Liquid and spreadable formats are slippery in the kitchen.'),
      item('small serving errors matter quickly', 'Tiny changes can shift the whole meal.'),
      item('heat handling and processing matter', 'The best use depends on choosing the right fat for the job.')
    ]
  },
  misc: {
    pros: [
      item('clear real-world role', 'Some foods are useful because of what they replace or support.'),
      item('context matters more than purity here', 'The use case decides whether it earns a place.'),
      item('can sometimes be a better swap', 'A limited food can still help if it replaces something worse.')
    ],
    cons: [
      item('easy to oversell beyond the evidence', 'A useful role is not the same thing as a strong nutrition case.'),
      item('small portions can still add up', 'Condiments, drinks, and extras can move a meal quietly.'),
      item('habit fit matters more than the label', 'The real-world pattern decides whether it helps or hurts.')
    ]
  }
};

const KIND_COPY = {
  pros: {
    protein: [
      item('helps make meals feel complete', 'That practical meal role matters beyond the score rows.'),
      item('works as a practical meal anchor', 'Useful when the plate needs something more substantial.')
    ],
    fibre: [
      item('fuller texture helps real meals', 'That practical fullness is one reason it can work beyond the numbers.'),
      item('helps the meal feel more complete', 'Satiety value counts when people actually use the food.')
    ],
    carb: [
      item('works as a practical meal base', 'Useful when the meal needs an easy anchor that people actually eat.'),
      item('simple fuel role is clear', 'There is an obvious job for it in everyday meals.')
    ],
    sweet: [
      item('sweet role is easy to understand', 'It can be useful when sweetness is the job and the portion is deliberate.'),
      item('can satisfy a sweet spot', 'That matters when it replaces something heavier.')
    ],
    micronutrient: [
      item('has a more specific food identity', 'There is a reason it earns attention beyond the basic role.'),
      item('brings a clearer food story', 'That extra identity helps it stand out in the category.')
    ],
    fat: [
      item('richer texture can help satisfaction', 'That can make a small amount feel more useful in real meals.'),
      item('works when the portion has a job', 'The practical value depends on using it deliberately.')
    ],
    portion: [
      item('small amounts can still be useful', 'A controlled serving can support the meal without taking it over.'),
      item('strong practical leverage', 'A little can change how the whole plate eats.')
    ]
  },
  cons: {
    protein: [
      item('needs the right supporting foods', 'It works better as part of a fuller plate than as the whole answer.'),
      item('not the main meal anchor', 'The food usually needs help from the rest of the plate.')
    ],
    fibre: [
      item('fullness payoff is weaker than expected', 'It may need a fuller plate around it to feel satisfying.'),
      item('not as filling as the category can be', 'The practical meal payoff is only moderate.')
    ],
    carb: [
      item('staple role needs portion context', 'It works best when the rest of the meal keeps it grounded.'),
      item('easy base to overbuild around', 'The format can push portions larger than intended.')
    ],
    sweet: [
      item('sweet format can stack up fast', 'Small-looking portions can still push a meal away from the cleaner use case.'),
      item('sweet habit can be sticky', 'The wider pattern matters more than one neat label.')
    ],
    micronutrient: [
      item('not enough extra payoff for a top slot', 'The wider food still has to earn its place through more than one angle.'),
      item('category payoff is only modest', 'It is useful, but not a standout reason to lean on the food.')
    ],
    fat: [
      item('format choices can drag it down fast', 'The exact version and how it is used matter a lot.'),
      item('rich format needs portion control', 'Small serving changes can move the whole meal quickly.')
    ],
    portion: [
      item('portions are easy to overshoot', 'Dense or snackable formats punish casual serving sizes.'),
      item('small serving errors matter quickly', 'The food asks for more portion awareness than it first suggests.')
    ]
  }
};

const FOOD_CONTEXT_OVERRIDES = {
  'white-potato': {
    pros: [
      item('very practical staple food', 'Cheap, common, and easy to build meals around.', 'major', 'practical_staple'),
      item('can be fairly filling', 'Especially when eaten in less processed forms.', 'minor', 'good_satiety'),
      item('flexible meal base', 'Baked, boiled, or mashed, it pairs easily with stronger foods.', 'minor', 'kitchen_flexibility')
    ],
    cons: [
      item('needs cooking before it works', 'It is not a grab-and-go food.', 'minor', 'prep_friction'),
      item('prep method changes it fast', 'Fries, butter, and heavy toppings can drag it down.', 'minor', 'preparation_variability'),
      item('plain flavour often needs help', 'The simple potato does not always stay simple.', 'minor', 'plain_flavour_needs_help')
    ]
  }
};

function item(title, explanation, impactLevel = 'minor', itemKey = null) {
  return {
    ...(itemKey ? { itemKey } : {}),
    impactLevel,
    title,
    explanation,
    evidenceType: 'manual'
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizedTitleKey(title) {
  return String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function contextTitleRecapIssue(title) {
  for (const issue of SECTION_RECAP_CONTEXT_TITLE_PATTERNS) {
    if (issue.pattern.test(title || '')) return issue;
  }
  return null;
}

function contextKind(item) {
  const text = `${item?.itemKey || ''} ${item?.title || ''} ${item?.explanation || ''}`.toLowerCase();
  if (/\b(protein|amino|collagen|bioavailability)\b/.test(text)) return 'protein';
  if (/\b(fibre|fiber|satiety|filling)\b/.test(text)) return 'fibre';
  if (/\b(glycemic|gi\b|carb|starch)\b/.test(text)) return 'carb';
  if (/\b(sugar|sweet|syrup|honey|jam)\b/.test(text)) return 'sweet';
  if (/\b(vitamin|mineral|micronutrient|calcium|potassium|iron|magnesium|zinc|carotenoid)\b/.test(text)) return 'micronutrient';
  if (/\b(fat quality|saturated|cholesterol|omega|fat support)\b/.test(text)) return 'fat';
  if (/\b(calorie|energy density|portion|overpour|serving)\b/.test(text)) return 'portion';
  return null;
}

function candidateCopies(food, itemToNormalize, side) {
  const type = food.foodType || 'misc';
  const kind = contextKind(itemToNormalize);
  return [
    ...((kind && KIND_COPY[side]?.[kind]) || []),
    ...(TYPE_FALLBACKS[type]?.[side] || []),
    ...(TYPE_FALLBACKS.misc[side] || [])
  ];
}

function applyCopy(baseItem, copy) {
  return {
    ...baseItem,
    title: copy.title,
    explanation: copy.explanation,
    evidenceType: baseItem.evidenceType || copy.evidenceType || 'manual'
  };
}

function fallbackItem(food, side, index) {
  const type = food.foodType || 'misc';
  const copy = (TYPE_FALLBACKS[type]?.[side] || TYPE_FALLBACKS.misc[side])[index % 3];
  return {
    ...clone(copy),
    itemKey: `${type}_${side}_${index + 1}`.replace(/[^a-z0-9_]+/g, '_')
  };
}

function uniqueItem(food, itemToNormalize, side, usedTitles, index) {
  const originalTitleKey = normalizedTitleKey(itemToNormalize.title);
  const needsRewrite = !itemToNormalize.title
    || !itemToNormalize.explanation
    || contextTitleRecapIssue(itemToNormalize.title)
    || usedTitles.has(originalTitleKey);

  if (!needsRewrite) return itemToNormalize;

  for (const copy of candidateCopies(food, itemToNormalize, side)) {
    const titleKey = normalizedTitleKey(copy.title);
    if (!usedTitles.has(titleKey)) return applyCopy(itemToNormalize, copy);
  }

  return fallbackItem(food, side, index);
}

function normalizeSide(food, side, items) {
  const usedTitles = new Set();
  const normalized = [];
  for (const rawItem of (Array.isArray(items) ? items : [])) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    const next = uniqueItem(food, clone(rawItem), side, usedTitles, normalized.length);
    const titleKey = normalizedTitleKey(next.title);
    if (!titleKey || usedTitles.has(titleKey)) continue;
    usedTitles.add(titleKey);
    normalized.push(next);
    if (normalized.length === 3) break;
  }

  while (normalized.length < 3) {
    const next = uniqueItem(food, fallbackItem(food, side, normalized.length), side, usedTitles, normalized.length);
    const titleKey = normalizedTitleKey(next.title);
    if (!titleKey || usedTitles.has(titleKey)) break;
    usedTitles.add(titleKey);
    normalized.push(next);
  }

  return normalized.slice(0, 3);
}

function normalizeFoodContextItems(food) {
  const override = FOOD_CONTEXT_OVERRIDES[food.id];
  if (override) return clone(override);

  const contextItems = food.contextItems || {};
  return Object.fromEntries(CONTEXT_SIDES.map(side => [
    side,
    normalizeSide(food, side, contextItems[side] || [])
  ]));
}

module.exports = {
  contextTitleRecapIssue,
  normalizeFoodContextItems
};
