(function () {
  const DEFAULT_HEADER_MAX_CHARS = 17;
  const DEFAULT_HEADER_MIN_FONT_SIZE = 4.6;
  const HEADER_FONT_WIDTH_RATIO = 0.58;
  const HEADER_TEXT_WIDTH_FIT_RATIO = 0.96;

  const HEADER_NAME_OVERRIDES = {
    'apple-cider-vinegar': 'ACV',
    'barbecue-sauce': 'BBQ Sauce',
    'dark-chocolate-85': 'Dark Choc 85%',
    'fruit-yogurt-sweetened': 'Swt Fruit Yogurt',
    'chocolate-covered-peanuts': 'Choc. Peanuts',
    'electrolyte-tablet-drink': 'Electrolyte Tabs',
    'energy-drink-zero': '0-Sugar Drink',
    'extra-virgin-olive-oil': 'Xtra Virgin Olive Oil',
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
    'sweetened-coffee-creamer': 'Swt Coffee Creamr',
    'sweetened-condensed-milk': 'Swt Cond. Milk',
    'sweetened-sunflower-spread': 'Swt Sunflwr Sprd',
    'trail-mix-chocolate': 'Trail Mix Choc.',
    'watermelon-seeds-roasted-salted': 'W-Melon Seeds R+S',
    'watermelon-seeds-unsalted': 'W-Melon Seeds'
  };

  const FAMILIAR_HEADER_SHORTHAND_REPLACEMENTS = [
    [/\bApple[-\s]+Cider[-\s]+Vinegar\b/gi, 'ACV'],
    [/\bExtra[-\s]+Virgin[-\s]+Olive[-\s]+Oil\b/gi, 'Xtra Virgin Olive Oil'],
    [/\bBarbecue\b/gi, 'BBQ']
  ];

  const HEADER_NAME_MAX_FONT_SIZE_OVERRIDES = {
    asparagus: 7.6,
    'baked-beans': 6.2
  };

  const ONES_NUMBER_WORD_VALUES = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9
  };

  const TENS_NUMBER_WORD_VALUES = {
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90
  };

  const SIMPLE_NUMBER_WORD_VALUES = {
    zero: 0,
    ...ONES_NUMBER_WORD_VALUES,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    ...TENS_NUMBER_WORD_VALUES
  };

  const COMPOUND_NUMBER_WORD_RE = new RegExp(
    `\\b(${Object.keys(TENS_NUMBER_WORD_VALUES).join('|')})[-\\s]+(${Object.keys(ONES_NUMBER_WORD_VALUES).join('|')})\\b`,
    'gi'
  );
  const SIMPLE_NUMBER_WORD_RE = new RegExp(`\\b(${Object.keys(SIMPLE_NUMBER_WORD_VALUES).join('|')})\\b`, 'gi');

  const PHRASE_REPLACEMENTS = [
    [/\s*\((?:plain|generic)\)\s*/gi, ' '],
    [/\s*\(unsweetened\)\s*/gi, ' '],
    [/\s*\(unsalted\)\s*/gi, ' Unslt '],
    [/\s*\(salted\)\s*/gi, ' Salted '],
    [/\s*\(sweetened\)\s*/gi, ' Sweet '],
    [/\s*\(roasted\s*&\s*salted\)\s*/gi, ' R+S '],
    [/\s*\(refined\)\s*/gi, ' Refined '],
    [/\bExtra Virgin Olive Oil\b/gi, 'Xtra Virgin Olive Oil'],
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

  const LIGHT_PHRASE_REPLACEMENTS = [
    [/\s*\(([^)]+)\)\s*/gi, ' $1 '],
    [/\broasted\s*(?:&|\+|and)\s*salted\b/gi, 'R+S'],
    [/\bextra\s+virgin\b/gi, 'Extra-Virgin'],
    [/\bwhole\s+grain\b/gi, 'Whole-Grain'],
    [/\bwhole\s+wheat\b/gi, 'Whole-Wheat']
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

  function numberWordsToDigits(value) {
    return normalizeWhitespace(value)
      .replace(COMPOUND_NUMBER_WORD_RE, (_, tens, ones) => {
        return String(TENS_NUMBER_WORD_VALUES[tens.toLowerCase()] + ONES_NUMBER_WORD_VALUES[ones.toLowerCase()]);
      })
      .replace(SIMPLE_NUMBER_WORD_RE, match => String(SIMPLE_NUMBER_WORD_VALUES[match.toLowerCase()]));
  }

  function applyFamiliarHeaderShorthand(value) {
    let text = normalizeWhitespace(value);
    for (const [pattern, replacement] of FAMILIAR_HEADER_SHORTHAND_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
    return normalizeWhitespace(text);
  }

  function headerNameBaseFontSize(layer) {
    const fontSize = Number(layer?.fontSize);
    return Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 8;
  }

  function headerNameMinFontSize(layer) {
    const configured = Number(layer?.minFoodNameFontSize ?? layer?.minAutoFontSize);
    return Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_HEADER_MIN_FONT_SIZE;
  }

  function headerNameCharLimit(layer, fontSize = headerNameBaseFontSize(layer)) {
    const width = Number(layer?.width);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(fontSize) || fontSize <= 0) {
      return DEFAULT_HEADER_MAX_CHARS;
    }
    return clamp(Math.floor(width / Math.max(1, fontSize * 0.58)), 10, 36);
  }

  function lightlyCompactByRules(name) {
    let text = applyFamiliarHeaderShorthand(numberWordsToDigits(name));
    for (const [pattern, replacement] of LIGHT_PHRASE_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
    return applyFamiliarHeaderShorthand(numberWordsToDigits(text));
  }

  function compactByRules(name) {
    let text = applyFamiliarHeaderShorthand(name);
    for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }
    return applyFamiliarHeaderShorthand(numberWordsToDigits(text));
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

  function headerNameFitForText(text, layer) {
    const baseFontSize = headerNameBaseFontSize(layer);
    const minFontSize = Math.min(baseFontSize, headerNameMinFontSize(layer));
    const width = Number(layer?.width);
    const clean = normalizeWhitespace(text);
    if (!clean || !Number.isFinite(width) || width <= 0) {
      return { fontSize: roundFontSize(baseFontSize), fits: true };
    }

    const requiredFontSize = (width * HEADER_TEXT_WIDTH_FIT_RATIO) / Math.max(1, clean.length * HEADER_FONT_WIDTH_RATIO);
    return {
      fontSize: roundFontSize(clamp(requiredFontSize, minFontSize, baseFontSize)),
      fits: requiredFontSize >= minFontSize
    };
  }

  function bestFittingHeaderName(candidates, layer) {
    const clean = candidates.map(normalizeWhitespace).filter(Boolean);
    for (const text of clean) {
      const fit = headerNameFitForText(text, layer);
      if (fit.fits) return { text, fontSize: fit.fontSize };
    }

    const fallback = clean[clean.length - 1] || 'Unknown';
    const maxChars = headerNameCharLimit(layer, headerNameMinFontSize(layer));
    const text = truncateMiddle(fallback, maxChars);
    return { text, fontSize: headerNameFitForText(text, layer).fontSize };
  }

  function fitFoodNameForHeader(food, layer) {
    const rawName = food?.header?.displayName
      || food?.displayName
      || food?.shortName
      || food?.name
      || 'Unknown';
    const foodId = String(food?.id || '');
    const maxFontSize = Number(HEADER_NAME_MAX_FONT_SIZE_OVERRIDES[foodId]);
    const fitLayer = Number.isFinite(maxFontSize) && maxFontSize > 0
      ? { ...(layer || {}), fontSize: Math.min(headerNameBaseFontSize(layer), maxFontSize) }
      : layer;
    const override = numberWordsToDigits(HEADER_NAME_OVERRIDES[foodId] || '');
    const displayRawName = applyFamiliarHeaderShorthand(numberWordsToDigits(rawName));
    const unshortenedRawName = numberWordsToDigits(rawName);
    const lightCompact = lightlyCompactByRules(rawName);
    const compact = compactByRules(rawName);
    const softDropped = removeSoftWords(compact);
    const result = bestFittingHeaderName([
      displayRawName,
      unshortenedRawName,
      lightCompact,
      compact,
      softDropped,
      override
    ], fitLayer);
    return {
      ...result,
      text: result.text.toUpperCase()
    };
  }

  function compactFoodNameForHeader(food, layer) {
    return fitFoodNameForHeader(food, layer).text;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function roundFontSize(value) {
    return Math.round(value * 10) / 10;
  }

  window.FOODRANKED_DISPLAY_NAME_UTILS = {
    compactFoodNameForHeader,
    fitFoodNameForHeader,
    headerNameCharLimit,
    numberWordsToDigits
  };
}());
