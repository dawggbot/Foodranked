(function () {
  const DEFAULT_HEADER_MAX_CHARS = 17;

  const HEADER_NAME_OVERRIDES = {
    'apple-cider-vinegar': 'Apple Cider Vnr',
    'dark-chocolate-85': 'Dark Choc 85%',
    'fruit-yogurt-sweetened': 'Swt Fruit Yogurt',
    'chocolate-covered-peanuts': 'Choc. Peanuts',
    'electrolyte-tablet-drink': 'Electrolyte Tabs',
    'energy-drink-zero': 'Zero-Sugar Drink',
    'extra-virgin-olive-oil': 'E.V. Olive Oil',
    'honey-roasted-peanuts': 'Honey-Rstd Pnuts',
    'instant-mashed-potatoes': 'Instant Mash Pot.',
    'jerusalem-artichoke': 'Jerusalem Artich.',
    'milk-chocolate-bar': 'Milk Choc Bar',
    'mixed-nuts-unsalted': 'Unslt Mixed Nuts',
    'pistachios-roasted-salted': 'Pistachios R+S',
    'popcorn-air-popped': 'Air-Popped Corn',
    'pumpkin-seed-butter': 'Pumpkin Sd Butter',
    'pumpkin-seeds-roasted-salted': 'Pumpkin Seeds R+S',
    'purple-sweet-potato': 'Purple Sweet Pot.',
    'salted-mixed-nuts': 'Salted Mixed Nuts',
    'sunflower-seed-butter': 'Sunflwr Sd Butter',
    'sunflower-seeds-roasted-salted': 'Sunflwr Seeds R+S',
    'sweetened-chia-pudding': 'Swt Chia Pudding',
    'sweetened-coffee-creamer': 'Swt Coffee Cream',
    'sweetened-condensed-milk': 'Swt Cond. Milk',
    'sweetened-sunflower-spread': 'Swt Sunflwr Sprd',
    'trail-mix-chocolate': 'Trail Mix Choc.',
    'watermelon-seeds-roasted-salted': 'W-Melon Seeds R+S',
    'watermelon-seeds-unsalted': 'W-Melon Seeds'
  };

  const PHRASE_REPLACEMENTS = [
    [/\s*\((?:plain|generic)\)\s*/gi, ' '],
    [/\s*\(unsweetened\)\s*/gi, ' '],
    [/\s*\(unsalted\)\s*/gi, ' Unslt '],
    [/\s*\(salted\)\s*/gi, ' Salted '],
    [/\s*\(sweetened\)\s*/gi, ' Sweet '],
    [/\s*\(roasted\s*&\s*salted\)\s*/gi, ' R+S '],
    [/\s*\(refined\)\s*/gi, ' Refined '],
    [/\bExtra Virgin Olive Oil\b/gi, 'E.V. Olive Oil'],
    [/\bZero[- ]Sugar Energy Drink\b/gi, 'Zero-Sugar Drink'],
    [/\bWhole[- ]Wheat\b/gi, 'W-Wheat'],
    [/\bWhole[- ]Grain\b/gi, 'W-Grain'],
    [/\bChocolate[- ]Covered\b/gi, 'Choc.'],
    [/\bwith Chocolate\b/gi, 'Choc.'],
    [/\bSunflower\b/gi, 'Sunflwr'],
    [/\bWatermelon\b/gi, 'W-Melon'],
    [/\bUnsweetened\b/gi, 'Unswt'],
    [/\bSweetened\b/gi, 'Swt'],
    [/\bCondensed\b/gi, 'Cond.'],
    [/\bProtein\b/gi, 'Prot'],
    [/\bIsolate\b/gi, 'Isolate'],
    [/\bVegetable\b/gi, 'Veg'],
    [/\bShortening\b/gi, 'Shortening'],
    [/\bPowder\b/gi, 'Powder'],
    [/\bRoasted\b/gi, 'Rstd'],
    [/\bSalted\b/gi, 'Salted'],
    [/\bPotatoes\b/gi, 'Pot.']
  ];

  const SOFT_DROP_WORDS = [
    'unsweetened',
    'plain',
    'generic',
    'drink',
    'slices'
  ];

  function normalizeWhitespace(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,])/g, '$1')
      .trim();
  }

  function headerNameCharLimit(layer) {
    const width = Number(layer?.width);
    const fontSize = Number(layer?.fontSize);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(fontSize) || fontSize <= 0) {
      return DEFAULT_HEADER_MAX_CHARS;
    }
    return clamp(Math.floor(width / Math.max(1, fontSize * 0.58)), 10, 22);
  }

  function compactByRules(name) {
    let text = normalizeWhitespace(name);
    for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
    return normalizeWhitespace(text);
  }

  function removeSoftWords(name) {
    const words = normalizeWhitespace(name).split(' ');
    return normalizeWhitespace(words.filter(word => {
      const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      return !SOFT_DROP_WORDS.includes(normalized);
    }).join(' '));
  }

  function truncateMiddle(name, maxChars) {
    const safeMax = Math.max(5, Number(maxChars) || DEFAULT_HEADER_MAX_CHARS);
    const text = normalizeWhitespace(name);
    if (text.length <= safeMax) return text;
    const keep = safeMax - 3;
    const start = Math.ceil(keep * 0.62);
    const end = Math.max(1, keep - start);
    return `${text.slice(0, start)}...${text.slice(-end)}`;
  }

  function bestCandidate(candidates, maxChars) {
    const clean = candidates.map(normalizeWhitespace).filter(Boolean);
    const fitting = clean.find(text => text.length <= maxChars);
    if (fitting) return fitting;
    return truncateMiddle(clean[clean.length - 1] || 'Unknown', maxChars);
  }

  function compactFoodNameForHeader(food, layer) {
    const rawName = food?.header?.displayName
      || food?.displayName
      || food?.shortName
      || food?.name
      || 'Unknown';
    const maxChars = headerNameCharLimit(layer);
    const override = HEADER_NAME_OVERRIDES[String(food?.id || '')];
    const compact = compactByRules(rawName);
    const softDropped = removeSoftWords(compact);
    return bestCandidate([
      override,
      rawName,
      compact,
      softDropped
    ], maxChars).toUpperCase();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  window.FOODRANKED_DISPLAY_NAME_UTILS = {
    compactFoodNameForHeader,
    headerNameCharLimit
  };
}());
