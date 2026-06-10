(function () {
  const MACRO_FILL_RANGES = {
    nuts: { fats: [30, 75], carbs: [5, 30], protein: [10, 30] },
    seeds: { fats: [25, 70], carbs: [5, 35], protein: [10, 30] },
    grains: { fats: [1, 10], carbs: [50, 85], protein: [5, 18] },
    legumes: { fats: [1, 10], carbs: [40, 65], protein: [15, 30] },
    tubers: { fats: [0, 2], carbs: [15, 35], protein: [1, 5] },
    fruits: { fats: [0, 5], carbs: [8, 25], protein: [0, 4] },
    vegetables: { fats: [0, 3], carbs: [3, 15], protein: [1, 6] },
    meats: { fats: [2, 35], carbs: [0, 0], protein: [15, 30] },
    dairy: { fats: [0, 35], carbs: [3, 10], protein: [3, 25] },
    'oils-and-fats': { fats: [80, 100], carbs: [0, 0], protein: [0, 0] },
    misc: { fats: [0, 40], carbs: [0, 50], protein: [0, 35] }
  };

  const DEFAULT_MACRO_FILL_RANGES = {
    fats: [0, 40],
    carbs: [0, 50],
    protein: [0, 35]
  };

  const FOOD_TYPE_ALIASES = {
    vegetable: 'vegetables',
    vegetables: 'vegetables',
    fruit: 'fruits',
    fruits: 'fruits',
    grain: 'grains',
    grains: 'grains',
    legume: 'legumes',
    legumes: 'legumes',
    tuber: 'tubers',
    tubers: 'tubers',
    nut: 'nuts',
    nuts: 'nuts',
    seed: 'seeds',
    seeds: 'seeds',
    meat: 'meats',
    meats: 'meats',
    dairy: 'dairy',
    oil: 'oils-and-fats',
    oils: 'oils-and-fats',
    fat: 'oils-and-fats',
    fats: 'oils-and-fats',
    'oil-fat': 'oils-and-fats',
    'oils-and-fats': 'oils-and-fats',
    misc: 'misc',
    miscellaneous: 'misc'
  };

  function normalizeFoodType(foodType) {
    const raw = String(foodType || '').trim().toLowerCase();
    return FOOD_TYPE_ALIASES[raw] || raw;
  }

  function cloneRange(range) {
    return Array.isArray(range) ? [Number(range[0]) || 0, Number(range[1]) || 0] : null;
  }

  function getMacroFillRange(foodType, sectionId) {
    const normalized = normalizeFoodType(foodType);
    return cloneRange(MACRO_FILL_RANGES[normalized]?.[sectionId])
      || cloneRange(DEFAULT_MACRO_FILL_RANGES[sectionId])
      || [0, 30];
  }

  window.FOODRANKED_DISPLAY_SCHEMA = {
    version: '20260610-display-schema-v1',
    macroFillRanges: MACRO_FILL_RANGES,
    defaultMacroFillRanges: DEFAULT_MACRO_FILL_RANGES,
    foodTypeAliases: FOOD_TYPE_ALIASES,
    normalizeFoodType,
    getMacroFillRange
  };
})();
