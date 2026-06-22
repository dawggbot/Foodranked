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

  const TEMPLATE_CANVAS = { width: 1080, height: 1920 };
  const AUTHOR_GRID = { width: 135, height: 240 };
  const TEMPLATE_PROGRESS_INDICATOR = {
    id: 'progress_dots',
    type: 'dotRow',
    count: 9,
    x: 343,
    y: 1710,
    dotSize: 26,
    gap: 20,
    states: ['inactive', 'active', 'completed'],
    source: 'templates/visual-template.v1.json#progressIndicator'
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

  function roundGrid(value) {
    return Math.round(value * 1000) / 1000;
  }

  function getSectionIndicatorLayout() {
    const xScale = AUTHOR_GRID.width / TEMPLATE_CANVAS.width;
    const yScale = AUTHOR_GRID.height / TEMPLATE_CANVAS.height;
    const normalSize = roundGrid(TEMPLATE_PROGRESS_INDICATOR.dotSize * xScale);
    return {
      source: TEMPLATE_PROGRESS_INDICATOR.source,
      count: TEMPLATE_PROGRESS_INDICATOR.count,
      startX: roundGrid(TEMPLATE_PROGRESS_INDICATOR.x * xScale),
      y: roundGrid(TEMPLATE_PROGRESS_INDICATOR.y * yScale),
      stepX: roundGrid((TEMPLATE_PROGRESS_INDICATOR.dotSize + TEMPLATE_PROGRESS_INDICATOR.gap) * xScale),
      normalSize,
      highlightedSize: roundGrid(normalSize * 1.2)
    };
  }

  window.FOODRANKED_DISPLAY_SCHEMA = {
    version: '20260622-display-schema-v2',
    templateCanvas: TEMPLATE_CANVAS,
    authorGrid: AUTHOR_GRID,
    progressIndicator: TEMPLATE_PROGRESS_INDICATOR,
    sectionIndicatorLayout: getSectionIndicatorLayout(),
    macroFillRanges: MACRO_FILL_RANGES,
    defaultMacroFillRanges: DEFAULT_MACRO_FILL_RANGES,
    foodTypeAliases: FOOD_TYPE_ALIASES,
    normalizeFoodType,
    getMacroFillRange,
    getSectionIndicatorLayout
  };
})();
