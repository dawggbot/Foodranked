(function () {
  const DISPLAY_SCHEMA = window.FOODRANKED_DISPLAY_SCHEMA || {};
  const BINDINGS = window.FOODRANKED_MACRO_BINDINGS || {};
  const ROOT_SPRITE_BASE = '../app/sprites';
  const AUTHOR_GRID = DISPLAY_SCHEMA.authorGrid || { width: 105, height: 186.666667 };
  const DISPLAY_RULE_SECTIONS = [...new Set([
    ...(BINDINGS.macroSections || ['fats', 'carbs', 'protein']),
    ...(BINDINGS.micronutrientSections || ['vitamins', 'minerals'])
  ])];
  const MACRO_BAR_MIN_VISIBLE_FILL_RATIO = 0.0011;
  const AVAILABLE_FOOD_IMAGE_IDS = new Set(['bacon', 'black-beans', 'buckwheat', 'chia-seeds', 'cola-regular', 'cranberries', 'greek-yogurt', 'hazelnuts', 'kale', 'raspberries', 'white-potato']);
  const FOOD_IMAGE_BACON_REFERENCE = {
    x: 8,
    y: 10,
    width: 23,
    height: 10,
    naturalWidth: 30,
    naturalHeight: 13
  };
  const FOOD_IMAGE_REFERENCE_SCALE = FOOD_IMAGE_BACON_REFERENCE.width / FOOD_IMAGE_BACON_REFERENCE.naturalWidth;
  const FOOD_IMAGE_REFERENCE_CENTER = {
    x: FOOD_IMAGE_BACON_REFERENCE.x + (FOOD_IMAGE_BACON_REFERENCE.width / 2),
    y: FOOD_IMAGE_BACON_REFERENCE.y + (FOOD_IMAGE_BACON_REFERENCE.height / 2)
  };
  const FOOD_IMAGE_PLATE_REFERENCE = {
    x: 5,
    y: 2,
    width: 29,
    height: 29
  };
  const FOOD_IMAGE_PLATE_CENTER = {
    x: FOOD_IMAGE_PLATE_REFERENCE.x + (FOOD_IMAGE_PLATE_REFERENCE.width / 2),
    y: FOOD_IMAGE_PLATE_REFERENCE.y + (FOOD_IMAGE_PLATE_REFERENCE.height / 2)
  };
  const FOOD_IMAGE_SPRITE_SIZES = {
    bacon: { width: 30, height: 13 },
    'black-beans': { width: 30, height: 30 },
    buckwheat: { width: 30, height: 30 },
    'chia-seeds': { width: 30, height: 30 },
    'cola-regular': { width: 30, height: 30 },
    cranberries: { width: 30, height: 30 },
    'greek-yogurt': { width: 30, height: 30 },
    hazelnuts: { width: 30, height: 30 },
    kale: { width: 30, height: 30 },
    raspberries: { width: 30, height: 30 },
    'white-potato': { width: 30, height: 30 }
  };

  const PROTEIN_QUALITY_METRIC_KEYS = new Set([
    'essential_amino_acids_score',
    'nonessential_amino_acids_score',
    'bioavailability_percent'
  ]);

  const DEFAULT_SUBMACRO_POLARITIES = {
    saturated_fat_g: 'higher_worse',
    monounsaturated_fat_g: 'higher_better',
    polyunsaturated_fat_g: 'higher_better',
    omega3_mg: 'higher_better',
    cholesterol_mg: 'higher_worse',
    fibre_g: 'higher_better',
    sugar_g: 'higher_worse',
    starch_g: 'higher_better',
    glycemic_index: 'higher_worse',
    collagen_g: 'higher_better',
    essential_amino_acids_score: 'higher_better',
    nonessential_amino_acids_score: 'higher_better',
    bioavailability_percent: 'higher_better'
  };
  const SUBMACRO_DISPLAY_DEFAULT_VALUES = {
    saturated_fat_g: 0,
    monounsaturated_fat_g: 0,
    polyunsaturated_fat_g: 0,
    omega3_mg: 0,
    cholesterol_mg: 0,
    fibre_g: 0,
    sugar_g: 0,
    starch_g: 0,
    glycemic_index: 0,
    collagen_g: 0,
    essential_amino_acids_score: 0,
    nonessential_amino_acids_score: 0,
    bioavailability_percent: 0
  };
  const BIOAVAILABILITY_DISPLAY_ESTIMATES_BY_TYPE = {
    meats: 92,
    dairy: 90,
    legumes: 72,
    grains: 62,
    nuts: 74,
    seeds: 74,
    vegetables: 45,
    tubers: 42,
    fruits: 35,
    misc: 50,
    'oils-and-fats': 35
  };
  const AMINO_ACID_DISPLAY_USEFUL_SCORE_MIN = 60;
  const METRIC_SHORT_LABELS = {
    saturated_fat_g: 'SAT FAT',
    monounsaturated_fat_g: 'MONO FAT',
    polyunsaturated_fat_g: 'POLY FAT',
    omega3_mg: 'OMEGA 3',
    cholesterol_mg: 'CHOLEST.',
    fibre_g: 'FIBRE',
    sugar_g: 'SUGAR',
    starch_g: 'STARCH',
    glycemic_index: 'GI',
    collagen_g: 'COLLAGEN',
    essential_amino_acids_score: 'EAA',
    nonessential_amino_acids_score: 'NEAA',
    bioavailability_percent: 'BIOAVAIL.'
  };

  const DEFAULT_HIGHER_BETTER_BANDS = [
    { label: '3_red', max: 0, score: 0 },
    { label: '2_red', min: 0, max: 1, score: 20 },
    { label: '1_red', min: 1, max: 2, score: 40 },
    { label: '1_green', min: 2, max: 3, score: 60 },
    { label: '2_green', min: 3, max: 5, score: 80 },
    { label: '3_green', min: 5, score: 100 }
  ];

  const DEFAULT_HIGHER_WORSE_BANDS = [
    { label: '3_green', max: 0, score: 100 },
    { label: '2_green', min: 0, max: 1, score: 80 },
    { label: '1_green', min: 1, max: 2, score: 60 },
    { label: '1_red', min: 2, max: 3, score: 40 },
    { label: '2_red', min: 3, max: 5, score: 20 },
    { label: '3_red', min: 5, score: 0 }
  ];

  function defaultBandsForPolarity(polarity) {
    return polarity === 'higher_worse' ? DEFAULT_HIGHER_WORSE_BANDS : DEFAULT_HIGHER_BETTER_BANDS;
  }

  function displayRuleWithFallbackBands(rule, metricKey, sectionKey) {
    const polarity = rule?.polarity || DEFAULT_SUBMACRO_POLARITIES[metricKey];
    if (!polarity) return rule || null;
    const bands = Array.isArray(rule?.bands) && rule.bands.length ? rule.bands : defaultBandsForPolarity(polarity);
    return {
      metricKey,
      sectionKey,
      scoringMode: 'arrow_bands',
      polarity,
      applicability: 'optional',
      weight: 1,
      ...(rule || {}),
      bands
    };
  }

  const BACKDROP_PALETTES = {
    vegetables: { top: '#dff4cf', bottom: '#bfd8b0', glowA: 'rgba(219,255,183,.78)', glowB: 'rgba(108,169,104,.38)' },
    fruits: { top: '#ffe0dc', bottom: '#e7b8b5', glowA: 'rgba(255,173,165,.78)', glowB: 'rgba(219,109,101,.34)' },
    grains: { top: '#f6e7bf', bottom: '#dbc48a', glowA: 'rgba(255,235,163,.78)', glowB: 'rgba(199,151,66,.30)' },
    legumes: { top: '#e5d8c9', bottom: '#c0a78a', glowA: 'rgba(234,204,163,.76)', glowB: 'rgba(142,102,62,.28)' },
    tubers: { top: '#f5d7bf', bottom: '#d2a17d', glowA: 'rgba(255,196,144,.74)', glowB: 'rgba(182,106,58,.28)' },
    nuts: { top: '#ead8c8', bottom: '#c39b7f', glowA: 'rgba(243,207,175,.76)', glowB: 'rgba(128,77,47,.28)' },
    seeds: { top: '#f2e2c8', bottom: '#cfb48f', glowA: 'rgba(255,231,188,.76)', glowB: 'rgba(162,128,80,.26)' },
    meats: { top: '#f2d0d3', bottom: '#c08a90', glowA: 'rgba(255,188,196,.72)', glowB: 'rgba(146,61,73,.28)' },
    dairy: { top: '#f4f0e8', bottom: '#d9d2c2', glowA: 'rgba(255,255,255,.68)', glowB: 'rgba(214,196,155,.22)' },
    'oils-and-fats': { top: '#f6e7a9', bottom: '#d1b851', glowA: 'rgba(255,235,135,.74)', glowB: 'rgba(175,138,28,.28)' },
    misc: { top: '#eadcff', bottom: '#b98bea', glowA: 'rgba(229,118,255,.72)', glowB: 'rgba(70,205,220,.28)', thumbnailTop: '#f2d7ff', thumbnailMid: '#ce8dff', thumbnailBottom: '#8d65d8', thumbnailGlowA: 'rgba(231,75,255,.80)', thumbnailGlowB: 'rgba(62,216,219,.36)' }
  };

  function clone(value) {
    return value == null ? value : structuredClone(value);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function asNumber(value, fallback = null) {
    if (value == null || value === '') return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function formatCompactNumber(value, decimals = 1) {
    const safe = asNumber(value, null);
    if (safe == null) return '—';
    if (Number.isInteger(safe)) return String(safe);
    const displayDecimals = displayDecimalPlaces(safe, decimals);
    return safe.toFixed(displayDecimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  // One decimal by default; tiny nonzero values stay visible, e.g. 0.017g -> 0.02g.
  function displayDecimalPlaces(value, decimals = 1) {
    const fallbackDecimals = Number.isFinite(Number(decimals)) ? Math.max(0, Math.trunc(Number(decimals))) : 1;
    const safe = asNumber(value, null);
    if (safe == null) return fallbackDecimals;
    return fallbackDecimals === 1 && safe !== 0 && Math.abs(safe) < 1 ? 2 : fallbackDecimals;
  }

  function formatMetricText(value, unit = '') {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(safe)}${unit}`;
  }

  function formatMacroTotalNumber(value) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    return safe.toFixed(1);
  }

  function longMgDisplayValue(item) {
    const key = String(item?.metricKey || '');
    if (key !== 'omega3_mg' && key !== 'cholesterol_mg') return null;
    const value = asNumber(item?.value, null);
    if (value == null) return null;
    if (String(Math.trunc(Math.abs(value))).length < 5) return null;
    return `${formatCompactNumber(value / 1000, 2)}g`;
  }

  function getByPath(object, path, alternatePaths = []) {
    const paths = [path, ...(alternatePaths || [])].filter(Boolean);
    for (const candidatePath of paths) {
      const value = String(candidatePath).split('.').reduce((current, key) => current?.[key], object);
      if (value != null) return value;
    }
    return null;
  }

  function normalizeFoodType(foodType) {
    if (typeof DISPLAY_SCHEMA.normalizeFoodType === 'function') return DISPLAY_SCHEMA.normalizeFoodType(foodType);
    const raw = String(foodType || '').trim().toLowerCase();
    const aliases = {
      vegetable: 'vegetables', vegetables: 'vegetables',
      fruit: 'fruits', fruits: 'fruits',
      grain: 'grains', grains: 'grains',
      legume: 'legumes', legumes: 'legumes',
      tuber: 'tubers', tubers: 'tubers',
      nut: 'nuts', nuts: 'nuts',
      seed: 'seeds', seeds: 'seeds',
      meat: 'meats', meats: 'meats',
      dairy: 'dairy',
      oil: 'oils-and-fats', oils: 'oils-and-fats', fat: 'oils-and-fats', fats: 'oils-and-fats',
      'oil-fat': 'oils-and-fats', 'oils-and-fats': 'oils-and-fats',
      misc: 'misc', miscellaneous: 'misc'
    };
    return aliases[raw] || raw || 'misc';
  }

  function prettyFoodType(foodType) {
    const normalized = normalizeFoodType(foodType);
    if (normalized === 'vegetables') return 'Veg';
    return normalized.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  function foodTypeTitle(foodType) {
    if (typeof DISPLAY_SCHEMA.foodTypeTitle === 'function') return DISPLAY_SCHEMA.foodTypeTitle(foodType);
    const normalized = normalizeFoodType(foodType);
    return DISPLAY_SCHEMA.foodTypeTitleLabels?.[normalized] || 'MISC';
  }

  function typeSpriteSlug(foodType) {
    const normalized = normalizeFoodType(foodType);
    const slugs = {
      vegetables: 'vegetable',
      fruits: 'fruit',
      grains: 'grain',
      legumes: 'legume',
      tubers: 'tuber',
      nuts: 'nut',
      seeds: 'seed',
      meats: 'meat',
      dairy: 'dairy',
      'oils-and-fats': 'oil_fat',
      misc: 'misc'
    };
    return slugs[normalized] || 'misc';
  }

  function backdropPalette(food) {
    return BACKDROP_PALETTES[normalizeFoodType(food?.foodType)] || BACKDROP_PALETTES.misc;
  }

  function localAssetPath(path) {
    if (!path || /^(data:|https?:|blob:)/i.test(path)) return path || '';
    const raw = String(path);
    if (raw.startsWith('../app/')) return raw;
    if (raw.startsWith('./sprites/')) return `../app/${raw.slice(2)}`;
    if (raw.startsWith('sprites/')) return `../app/${raw}`;
    if (raw.startsWith('app/')) return `../${raw}`;
    if (raw.startsWith('./app/')) return `../${raw.slice(2)}`;
    if (raw.startsWith('docs/app/')) return `../app/${raw.slice('docs/app/'.length)}`;
    if (raw.startsWith('/docs/app/')) return `../app/${raw.slice('/docs/app/'.length)}`;
    const marker = '/docs/app/';
    const markerIndex = raw.indexOf(marker);
    if (markerIndex >= 0) return `../app/${raw.slice(markerIndex + marker.length)}`;
    return raw;
  }

  function canonicalSpritePath(src) {
    if (!src || /^(data:|https?:|blob:)/i.test(src)) return src || '';
    const next = String(src)
      .replace('/header/food_image_plate/', '/header/food_plate/')
      .replace(/\/macros\/arrow_indicators\//i, '/macros_section/arrow_indicators/')
      .replace(/\/macros\/fats\//i, '/macros_section/section_1_fats/')
      .replace(/\/macros\/carbs\//i, '/macros_section/section_2_carbs/')
      .replace(/\/macros\/protein\//i, '/macros_section/section_3_protein/')
      .replace(/\/micros\/vitamins\//i, '/micros_section/vitamins/')
      .replace(/\/micros\/minerals\//i, '/micros_section/minerals/')
      .replace(/\/pros-cons\//i, '/pros_and_cons/');
    return localAssetPath(next);
  }

  function spriteFilename(src) {
    return String(src || '').split(/[?#]/)[0].split('/').filter(Boolean).pop() || '';
  }

  function customFoodImageAsset(food) {
    const asset = food?.assets?.customFoodImage || food?.customFoodImage || {};
    return {
      ...asset,
      path: asset.path || food?.customFoodImagePath || food?.foodSpritePath || ''
    };
  }

  function customFoodImagePath(food) {
    return localAssetPath(customFoodImageAsset(food).path || '');
  }

  function foodSpriteCandidates(food) {
    const slug = typeSpriteSlug(food?.foodType);
    const customPath = customFoodImagePath(food);
    const foodId = String(food?.id || '').toLowerCase();
    const committedPath = AVAILABLE_FOOD_IMAGE_IDS.has(foodId)
      ? `${ROOT_SPRITE_BASE}/header/food_images/${foodId}.png`
      : '';
    const fallback = `${ROOT_SPRITE_BASE}/header/food_plate/${slug}_food_plate.png`;
    return {
      primary: customPath || committedPath || fallback,
      fallback: customPath && committedPath && customPath !== committedPath ? committedPath : fallback
    };
  }

  function customFoodImageNaturalSize(food) {
    const id = String(food?.id || '').toLowerCase();
    const asset = customFoodImageAsset(food);
    const assetWidth = Number(asset.width || asset.naturalWidth || food?.customFoodImageWidth || 0);
    const assetHeight = Number(asset.height || asset.naturalHeight || food?.customFoodImageHeight || 0);
    if (Number.isFinite(assetWidth) && assetWidth > 0 && Number.isFinite(assetHeight) && assetHeight > 0) {
      return { width: assetWidth, height: assetHeight };
    }
    return FOOD_IMAGE_SPRITE_SIZES[id] || null;
  }

  function foodImageLayerGeometry(food) {
    const size = customFoodImageNaturalSize(food);
    if (!size) {
      const hasCustomImage = Boolean(customFoodImagePath(food))
        || AVAILABLE_FOOD_IMAGE_IDS.has(String(food?.id || '').toLowerCase());
      if (!hasCustomImage) return null;
      return {
        x: FOOD_IMAGE_PLATE_CENTER.x - (FOOD_IMAGE_BACON_REFERENCE.width / 2),
        y: FOOD_IMAGE_PLATE_CENTER.y - (FOOD_IMAGE_BACON_REFERENCE.width / 2),
        width: FOOD_IMAGE_BACON_REFERENCE.width,
        height: FOOD_IMAGE_BACON_REFERENCE.width,
        naturalWidth: null,
        naturalHeight: null
      };
    }
    if (
      size.width === FOOD_IMAGE_BACON_REFERENCE.naturalWidth
      && size.height === FOOD_IMAGE_BACON_REFERENCE.naturalHeight
    ) {
      return { ...FOOD_IMAGE_BACON_REFERENCE };
    }
    const width = size.width * FOOD_IMAGE_REFERENCE_SCALE;
    const height = size.height * FOOD_IMAGE_REFERENCE_SCALE;
    const center = FOOD_IMAGE_PLATE_CENTER;
    return {
      x: center.x - (width / 2),
      y: center.y - (height / 2),
      width,
      height,
      naturalWidth: size.width,
      naturalHeight: size.height
    };
  }

  function syncFoodImageLayerGeometry(layer, food, options = {}) {
    const geometry = foodImageLayerGeometry(food);
    if (!geometry) return;
    if (options.force === true || layer.foodDriven === true || !layer.manualPosition) {
      layer.x = Number(geometry.x.toFixed(3));
      layer.y = Number(geometry.y.toFixed(3));
      layer.width = Number(geometry.width.toFixed(3));
      layer.height = Number(geometry.height.toFixed(3));
    }
    layer.naturalWidth = geometry.naturalWidth || null;
    layer.naturalHeight = geometry.naturalHeight || null;
    layer.preserveAspect = true;
    layer.aspectRatio = geometry.naturalHeight ? geometry.naturalWidth / geometry.naturalHeight : null;
  }

  function headerFoodTypeSpritePath(food) {
    return `${ROOT_SPRITE_BASE}/header/food_type_plate/${typeSpriteSlug(food?.foodType)}_type_plate.png`;
  }

  function headerCalorieBubbleSpritePath(food) {
    return `${ROOT_SPRITE_BASE}/header/calorie_bubble/${typeSpriteSlug(food?.foodType)}_calorie_bubble.png`;
  }

  function headerFoodPlateSpritePath(food) {
    return `${ROOT_SPRITE_BASE}/header/food_plate/${typeSpriteSlug(food?.foodType)}_food_plate.png`;
  }

  function sectionSeparatorSpritePath(food) {
    return `${ROOT_SPRITE_BASE}/ui/section_separator/${typeSpriteSlug(food?.foodType)}_section_separator.png`;
  }

  function sectionIndicatorSpritePath(food, highlighted = false) {
    return `${ROOT_SPRITE_BASE}/ui/section_indicator/${typeSpriteSlug(food?.foodType)}_${highlighted ? 'highlighted_' : ''}section_indicator.png`;
  }

  function arrowSpritePath(color = 'green', count = 1) {
    const safeColor = color === 'red' ? 'red' : 'green';
    const safeCount = count >= 3 ? 3 : count === 2 ? 2 : 1;
    const suffix = safeCount > 1 ? `_${safeCount}` : '';
    return `${ROOT_SPRITE_BASE}/macros_section/arrow_indicators/${safeColor}_arrow${suffix}.png`;
  }

  function macroTotalValue(food, sectionId) {
    const header = food?.header || {};
    if (sectionId === 'fats') return asNumber(header.fat_g, null);
    if (sectionId === 'carbs') return asNumber(header.carb_g ?? header.carbs_g, null);
    if (sectionId === 'protein') return asNumber(header.protein_g, null);
    return null;
  }

  function formatMacroTotalMetricText(food, sectionId) {
    const safe = macroTotalValue(food, sectionId);
    if (safe == null || safe === 0) return 'N/A';
    return `${formatMacroTotalNumber(safe)}g`;
  }

  function hasDisplayedMacro(food, sectionId) {
    const safe = macroTotalValue(food, sectionId);
    return safe != null && safe > 0;
  }

  function ruleSectionKey(sectionId) {
    return sectionId === 'protein' ? 'proteins' : sectionId;
  }

  function sectionDisplayItems(food, sectionId) {
    const sectionKey = ruleSectionKey(sectionId);
    const sections = food?.episode?.script?.sections || [];
    const section = sections.find(item => item.key === sectionId || item.key === sectionKey);
    return Array.isArray(section?.displayItems) ? section.displayItems : [];
  }

  function sectionDisplayPolicy(food, sectionId) {
    const sectionKey = ruleSectionKey(sectionId);
    const sections = food?.episode?.script?.sections || [];
    const section = sections.find(item => item.key === sectionId || item.key === sectionKey);
    return section?.displayPolicy && typeof section.displayPolicy === 'object' ? section.displayPolicy : null;
  }

  function metricLabelForKey(sectionId, metricKey) {
    const row = BINDINGS.arrowRows?.[sectionId]?.find(item => item.metricKey === metricKey);
    return METRIC_SHORT_LABELS[metricKey] || row?.label || String(metricKey || '')
      .replace(/_dv$/i, '')
      .replace(/_mg$/i, '')
      .replace(/_g$/i, '')
      .replace(/_percent$/i, '')
      .replace(/_/g, ' ')
      .toUpperCase();
  }

  function formatDisplayItemValue(item) {
    if (!item) return 'N/A';
    if (item.displayValue != null) return String(item.displayValue);
    if (item.value == null) return 'N/A';
    const key = String(item.metricKey || '');
    const longMgDisplay = longMgDisplayValue(item);
    if (longMgDisplay) return longMgDisplay;
    if (key === 'protein_g_fallback' || key.endsWith('_g')) return formatMetricText(item.value, 'g');
    if (key.endsWith('_mg')) return formatMetricText(item.value, 'mg');
    if (key.endsWith('_percent')) return formatMetricText(item.value, '%');
    if (key === 'essential_amino_acids_score') return `${formatCompactNumber(item.value, 0)}/${item.denominator || 9}`;
    if (key === 'nonessential_amino_acids_score') return `${formatCompactNumber(item.value, 0)}/${item.denominator || 11}`;
    return String(item.value);
  }

  function getEpisodeDisplayItemForMetric(food, sectionId, metricKey, displayMetricKeys = []) {
    const metricKeys = [metricKey, ...displayMetricKeys];
    return sectionDisplayItems(food, sectionId).find(item => metricKeys.includes(item.metricKey)) || null;
  }

  function displayItemForBinding(food, sectionId, binding) {
    const index = Number(binding?.displayItemIndex);
    if (Number.isInteger(index) && index >= 0) {
      return sectionDisplayItems(food, sectionId)[index] || null;
    }
    return binding?.metricKey ? getEpisodeDisplayItemForMetric(food, sectionId, binding.metricKey, binding.displayMetricKeys || []) : null;
  }

  function bindingMetricKey(food, sectionId, binding) {
    return displayItemForBinding(food, sectionId, binding)?.metricKey || binding?.metricKey || null;
  }

  function displayMetricSpecsForSection(food, sectionId) {
    const items = sectionDisplayItems(food, sectionId).filter(item => item?.metricKey).slice(0, 4);
    if (!items.length) return BINDINGS.arrowRows?.[sectionId] || [];
    return items.map(item => ({
      metricKey: item.metricKey,
      label: metricLabelForKey(sectionId, item.metricKey),
      displayMetricKeys: []
    }));
  }

  function displayDefaultValueForSubmacro(metricKey) {
    if (Object.prototype.hasOwnProperty.call(SUBMACRO_DISPLAY_DEFAULT_VALUES, metricKey)) {
      return SUBMACRO_DISPLAY_DEFAULT_VALUES[metricKey];
    }
    if (/_(g|mg|mcg|kg|percent|score)$/i.test(metricKey) || /glycemic/i.test(metricKey)) return 0;
    return null;
  }

  function clampRounded(value, min, max) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function proteinDisplayProteinG(food) {
    return macroTotalValue(food, 'protein');
  }

  function proteinFallbackBandScore(food) {
    const proteinG = proteinDisplayProteinG(food);
    if (proteinG == null || proteinG <= 0) return null;
    const band = ruleBandForValue({ bands: food?.ruleset?.proteinFallback?.bands || [] }, proteinG);
    return asNumber(band?.score, null);
  }

  function proteinDisplayUsefulProteinMin(food) {
    const configuredMin = asNumber(food?.ruleset?.proteinQualityGate?.minimumProteinG, null);
    if (configuredMin != null) return configuredMin;
    const band = (food?.ruleset?.proteinFallback?.bands || [])
      .find(item => Number(item.score) >= AMINO_ACID_DISPLAY_USEFUL_SCORE_MIN && typeof item.min === 'number');
    return asNumber(band?.min, null);
  }

  function textKeyForFood(food) {
    return `${food?.id || ''} ${food?.name || ''}`.toLowerCase();
  }

  function estimatedCollagenDisplayValue(food) {
    if (normalizeFoodType(food?.foodType) !== 'meats') return 0;
    const key = textKeyForFood(food);
    if (/chicken.*breast|turkey.*breast|cod/.test(key)) return 0.4;
    if (/salmon|tuna/.test(key)) return 0.3;
    if (/herring|mackerel|trout|turkey.*sausage|chicken.*thigh/.test(key)) return 0.8;
    if (/anchov|sardine|shrimp|hot.?dog|pepperoni/.test(key)) return 1.2;
    if (/lamb/.test(key)) return 1.4;
    if (/bacon|corned|salami|pork|duck|venison|beef|liver/.test(key)) return 1.0;
    return 0.8;
  }

  function estimatedBioavailabilityDisplayValue(food) {
    const key = textKeyForFood(food);
    if (/whey/.test(key)) return 99;
    if (/protein.?bar/.test(key)) return 80;
    if (/salmon|tuna|cod|trout|mackerel|sardine|herring|anchov|shrimp/.test(key)) return 94;
    if (/hot.?dog|sausage|salami|pepperoni|bacon|corned/.test(key)) return 84;
    if (/chicken|turkey|beef|pork|lamb|venison|duck|liver/.test(key)) return 92;
    if (/yogurt|kefir|skyr|quark|labneh/.test(key)) return 90;
    if (/cheese|mozzarella|parmesan|cheddar|feta|ricotta|halloumi|cottage/.test(key)) return 92;
    if (/milk/.test(key)) return 88;
    if (/soy|tofu|tempeh|edamame/.test(key)) return 78;
    if (/protein/.test(key)) return 80;
    if (/cocoa/.test(key)) return 55;
    if (/matcha/.test(key)) return 45;
    return BIOAVAILABILITY_DISPLAY_ESTIMATES_BY_TYPE[normalizeFoodType(food?.foodType)] ?? 50;
  }

  function proteinDisplayQualityScore(food) {
    const proteinG = proteinDisplayProteinG(food) || 0;
    const usefulProteinMin = proteinDisplayUsefulProteinMin(food);
    if (usefulProteinMin != null && proteinG < usefulProteinMin) return 0;
    const resolvedBaseScore = proteinFallbackBandScore(food);
    const baseScore = Math.max(resolvedBaseScore ?? 0, AMINO_ACID_DISPLAY_USEFUL_SCORE_MIN);
    const key = textKeyForFood(food);

    if (/whey/.test(key)) return 100;
    if (/salmon|tuna|cod|trout|mackerel|sardine|herring|anchov|shrimp|chicken|turkey|beef|pork|lamb|venison|duck|liver/.test(key)) {
      if (proteinG >= 18) return 100;
      if (proteinG >= 14) return Math.max(baseScore, 80);
      if (proteinG >= 10) return Math.max(baseScore, 60);
      return baseScore;
    }
    if (/cheese|mozzarella|parmesan|cheddar|feta|ricotta|halloumi|cottage|skyr|quark|labneh/.test(key)) {
      if (proteinG >= 18) return 100;
      if (proteinG >= 9) return Math.max(baseScore, 80);
      if (proteinG >= 3) return Math.max(baseScore, 60);
      return baseScore;
    }
    if (/milk|yogurt|kefir/.test(key)) {
      if (proteinG >= 8) return Math.max(baseScore, 80);
      if (proteinG >= 3) return Math.max(baseScore, 60);
      return baseScore;
    }
    if (/soy|tofu|tempeh|edamame/.test(key)) {
      if (proteinG >= 10) return Math.max(baseScore, 80);
      if (proteinG >= 4) return Math.max(baseScore, 60);
      return baseScore;
    }
    if (/protein.?bar|protein/.test(key)) return Math.max(baseScore, 80);
    return baseScore;
  }

  function proteinDisplayEstimate(food, metricKey) {
    if (metricKey === 'collagen_g') return estimatedCollagenDisplayValue(food);
    if (metricKey === 'bioavailability_percent') return estimatedBioavailabilityDisplayValue(food);
    const score = proteinDisplayQualityScore(food);
    if (score == null) return null;
    if (metricKey === 'essential_amino_acids_score') return clampRounded(Math.floor((score / 100) * 9), 0, 9);
    if (metricKey === 'nonessential_amino_acids_score') return clampRounded(Math.floor((score / 100) * 11), 0, 11);
    return null;
  }

  function macroSubmetricDisplayValue(food, sectionId, metricKey) {
    if (!hasDisplayedMacro(food, sectionId)) return null;
    if (sectionId === 'protein' && metricKey === 'protein_g_fallback') return asNumber(food?.header?.protein_g, null);
    const displayItem = getEpisodeDisplayItemForMetric(food, sectionId, metricKey);
    const displayItemValue = asNumber(displayItem?.value, null);
    if (displayItemValue != null) return displayItemValue;
    if (displayItem && (displayItem.value == null || displayItem.displayValue === 'N/A')) return null;
    const batchItem = getBatchMetricBreakdownItemForSpec(food, sectionId, { metricKey });
    const batchItemValue = asNumber(batchItem?.value, null);
    if (batchItemValue != null) return batchItemValue;
    const value = asNumber(food?.metrics?.[metricKey], null);
    if (value != null) return value;
    if (sectionId === 'protein') {
      const estimate = proteinDisplayEstimate(food, metricKey);
      if (estimate != null) return estimate;
    }
    return displayDefaultValueForSubmacro(metricKey);
  }

  function formatMacroMetricText(food, sectionId, metricKey, unit = '') {
    return formatMetricText(macroSubmetricDisplayValue(food, sectionId, metricKey), unit);
  }

  function formatMacroRatioMetricText(food, sectionId, metricKey, denominator) {
    const safe = macroSubmetricDisplayValue(food, sectionId, metricKey);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(Math.min(safe, denominator), 0)}/${denominator}`;
  }

  function getMacroFillRange(foodType, sectionId) {
    if (typeof DISPLAY_SCHEMA.getMacroFillRange === 'function') {
      return DISPLAY_SCHEMA.getMacroFillRange(foodType, sectionId);
    }
    const fallback = DISPLAY_SCHEMA.defaultMacroFillRanges?.[sectionId];
    return Array.isArray(fallback) ? fallback : [0, 30];
  }

  function macroFillEvaluation(food, sectionId) {
    const rawValue = macroTotalValue(food, sectionId);
    const [min, max] = getMacroFillRange(food?.foodType, sectionId);
    let fillRatio = 0;
    if (rawValue != null && rawValue > 0) {
      if (max <= min) fillRatio = MACRO_BAR_MIN_VISIBLE_FILL_RATIO;
      else {
        const ratio = (rawValue - min) / (max - min);
        fillRatio = ratio <= 0 ? MACRO_BAR_MIN_VISIBLE_FILL_RATIO : clamp(ratio, 0, 1);
      }
    }
    return {
      sectionId,
      dataField: sectionId === 'fats' ? 'header.fat_g' : sectionId === 'carbs' ? 'header.carb_g' : 'header.protein_g',
      rawValue,
      unit: 'g',
      foodType: normalizeFoodType(food?.foodType),
      min,
      max,
      clampedValue: rawValue == null ? null : clamp(rawValue, min, max),
      fillRatio,
      fillPercentage: Number((fillRatio * 100).toFixed(2)),
      label: 'MAIN MACRO DISPLAY SCALING -- NOT DIRECT SCORE INPUT'
    };
  }

  function getMetricRuleForSpec(food, sectionId, spec) {
    const sectionKey = ruleSectionKey(sectionId);
    const metricKey = spec.metricKey || spec.key;
    if (sectionId === 'protein' && ['protein_g', 'protein_g_fallback'].includes(metricKey) && food?.ruleset?.proteinFallback) {
      return {
        metricKey: food.ruleset.proteinFallback.metricKey || 'protein_g_fallback',
        sectionKey: 'proteins',
        scoringMode: 'arrow_bands',
        polarity: 'higher_better',
        applicability: 'optional',
        weight: food.ruleset.proteinFallback.weight ?? 1,
        bands: food.ruleset.proteinFallback.bands || []
      };
    }
    const bySection = food?.ruleset?.metricRulesBySection?.[sectionKey] || food?.ruleset?.metricRulesBySection?.[sectionId] || [];
    const fromSection = bySection.find(rule => rule.metricKey === metricKey);
    if (fromSection) return displayRuleWithFallbackBands(fromSection, metricKey, sectionKey);
    const fromRuleset = (food?.ruleset?.metricRules || []).find(rule => {
      return rule.metricKey === metricKey && (!rule.sectionKey || rule.sectionKey === sectionKey || rule.sectionKey === sectionId);
    });
    if (fromRuleset) return displayRuleWithFallbackBands(fromRuleset, metricKey, sectionKey);
    const polarity = DEFAULT_SUBMACRO_POLARITIES[metricKey];
    if (!polarity) return null;
    return displayRuleWithFallbackBands(null, metricKey, sectionKey);
  }

  function proteinQualitySpecAllowed(food, sectionId, spec) {
    const metricKey = spec.metricKey || spec.key;
    if (sectionId !== 'protein' || !PROTEIN_QUALITY_METRIC_KEYS.has(metricKey)) return true;
    return hasDisplayedMacro(food, 'protein');
  }

  function rawMetricValueForSpec(food, sectionId, spec) {
    const metricKey = spec.metricKey || spec.key;
    if (!proteinQualitySpecAllowed(food, sectionId, spec)) return null;
    if (sectionId === 'protein' && ['protein_g', 'protein_g_fallback'].includes(metricKey)) return asNumber(food?.header?.protein_g, null);
    if (['fats', 'carbs', 'protein'].includes(sectionId)) return macroSubmetricDisplayValue(food, sectionId, metricKey);
    return asNumber(food?.metrics?.[metricKey], null);
  }

  function ruleBandForValue(rule, value) {
    if (!rule || value == null) return null;
    return (rule.bands || []).find(band => {
      const aboveMin = band.min == null || value >= Number(band.min);
      const belowMax = band.max == null || value <= Number(band.max);
      return aboveMin && belowMax;
    }) || null;
  }

  function getBatchMetricBreakdownItemForSpec(food, sectionId, spec) {
    const sectionKey = ruleSectionKey(sectionId);
    const metricKey = spec.metricKey || spec.key;
    const metricKeys = [metricKey, ...(spec.displayMetricKeys || [])];
    const breakdown = food?.batchResult?.metricBreakdown || [];
    return breakdown.find(item => metricKeys.includes(item.metricKey) && (!item.sectionKey || item.sectionKey === sectionId || item.sectionKey === sectionKey)) || null;
  }

  function arrowBandForSpec(food, sectionId, spec) {
    const metricKey = spec.metricKey || spec.key;
    const displayItem = getEpisodeDisplayItemForMetric(food, sectionId, metricKey, spec.displayMetricKeys || []);
    if (displayItem?.band) return displayItem.band;
    const batchBreakdownItem = getBatchMetricBreakdownItemForSpec(food, sectionId, spec);
    if (batchBreakdownItem?.band) return batchBreakdownItem.band;
    const rule = getMetricRuleForSpec(food, sectionId, spec);
    return ruleBandForValue(rule, rawMetricValueForSpec(food, sectionId, spec))?.label || null;
  }

  function parseArrowBand(band, polarity = null) {
    const normalized = String(band || '').trim().toLowerCase();
    const named = normalized.match(/^([123])_(green|red)$/);
    if (named) return { count: Number(named[1]), color: named[2], direction: null };
    const higherWorse = polarity === 'higher_worse';
    const upCount = (normalized.match(/↑/g) || []).length;
    if (upCount) return { count: clamp(upCount, 1, 3), color: higherWorse ? 'red' : 'green', direction: 'up' };
    const downCount = (normalized.match(/↓/g) || []).length;
    if (downCount) return { count: clamp(downCount, 1, 3), color: higherWorse ? 'green' : 'red', direction: 'down' };
    return { count: 0, color: 'green', direction: null };
  }

  function arrowPresentationForSpec(food, sectionId, spec) {
    const rule = getMetricRuleForSpec(food, sectionId, spec);
    const band = arrowBandForSpec(food, sectionId, spec);
    const parsed = parseArrowBand(band, rule?.polarity);
    const higherWorse = rule?.polarity === 'higher_worse';
    const count = parsed.count || 0;
    const color = parsed.color;
    const direction = parsed.direction;
    const pointsDown = direction ? direction === 'down' : color === 'green' ? higherWorse : !higherWorse;
    return {
      ...parsed,
      band,
      count,
      color,
      direction,
      flipY: !!count && pointsDown,
      rotation: !!count && pointsDown ? 180 : 0,
      textColor: count ? (color === 'red' ? '#ff6f6f' : '#7cf2a7') : '#ffffff',
      sprite: count ? arrowSpritePath(color, Math.min(count, 3)) : '',
      spriteFilename: count ? spriteFilename(arrowSpritePath(color, Math.min(count, 3))) : '',
      rule
    };
  }

  function visibleArrowIndexes(count, total) {
    if (count >= total) return new Set(Array.from({ length: total }, (_, index) => index));
    if (count === 1) return new Set([Math.floor(total / 2)]);
    if (count === 2 && total >= 3) return new Set([0, total - 1]);
    return new Set(Array.from({ length: Math.max(0, count) }, (_, index) => index));
  }

  function textSpecForMetric(sectionId, metricKey) {
    if (sectionId === 'protein') {
      const proteinSpec = proteinRowSpecForMetric(metricKey);
      if (proteinSpec?.valueBinding) return proteinSpec.valueBinding;
    }
    const entries = Object.values(BINDINGS.textBindings?.[sectionId] || {});
    return entries.find(binding => binding.metricKey === metricKey && /Value$/.test(binding.kind)) || null;
  }

  function specForMetric(sectionId, metricKey) {
    const binding = textSpecForMetric(sectionId, metricKey);
    const proteinSpec = sectionId === 'protein' ? proteinRowSpecForMetric(metricKey) : null;
    return {
      key: metricKey,
      metricKey,
      label: proteinSpec?.longLabel || metricLabelForKey(sectionId, metricKey),
      displayMetricKeys: binding?.displayMetricKeys || proteinSpec?.displayMetricKeys || []
    };
  }

  function formatBindingValue(food, sectionId, binding) {
    if (!binding) return 'N/A';
    const displayItem = displayItemForBinding(food, sectionId, binding);
    if (displayItem && binding.kind === 'metricLabel') return binding.label || metricLabelForKey(sectionId, displayItem.metricKey);
    if (displayItem && ['metricValue', 'ratioMetricValue'].includes(binding.kind)) return formatDisplayItemValue(displayItem);
    if (binding.kind === 'staticLabel' || binding.kind === 'metricLabel') return binding.label || '';
    if (binding.kind === 'macroTotal') return formatMacroTotalMetricText(food, sectionId);
    if (binding.kind === 'ratioMetricValue') return formatMacroRatioMetricText(food, sectionId, binding.metricKey, binding.denominator || 1);
    if (binding.kind === 'metricValue') return formatMacroMetricText(food, sectionId, binding.metricKey, binding.unit || '');
    const value = getByPath(food, binding.field, binding.alternateFields);
    return formatMetricText(value, binding.unit || '');
  }

  function formatImpactLevelLabel(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'major') return 'MAJOR';
    if (normalized === 'minor') return 'MINOR';
    return 'N/A';
  }

  function contextItemsForSection(food, sectionId) {
    const items = food?.contextItems?.[sectionId];
    return Array.isArray(items) ? items : [];
  }

  function activeRules(food) {
    const ruleset = food?.ruleset || {};
    const sectionIds = DISPLAY_RULE_SECTIONS;
    const rules = [];
    for (const sectionId of sectionIds) {
      const sectionKey = ruleSectionKey(sectionId);
      const bySection = ruleset.metricRulesBySection?.[sectionKey] || ruleset.metricRulesBySection?.[sectionId];
      const sectionRules = Array.isArray(bySection)
        ? bySection
        : (ruleset.metricRules || []).filter(rule => rule.sectionKey === sectionKey || rule.sectionKey === sectionId);
      sectionRules.forEach(rule => rules.push({ ...rule, displaySection: sectionId }));
    }
    if (ruleset.proteinFallback) {
      rules.push({
        ...ruleset.proteinFallback,
        metricKey: ruleset.proteinFallback.metricKey || 'protein_g_fallback',
        sectionKey: 'proteins',
        displaySection: 'protein',
        scoringRole: 'scored fallback',
        scoringMode: 'arrow_bands',
        applicability: 'fallback',
        polarity: 'higher_better'
      });
    }
    return rules;
  }

  function liveMetricEvaluation(food, sectionId) {
    const rows = metricRowsForSection(food, sectionId);
    return rows.map(row => {
      const spec = specForMetric(sectionId, row.metricKey);
      const rule = getMetricRuleForSpec(food, sectionId, spec);
      const displayItem = getEpisodeDisplayItemForMetric(food, sectionId, row.metricKey);
      const batchItem = getBatchMetricBreakdownItemForSpec(food, sectionId, spec);
      const rawValue = rawMetricValueForSpec(food, sectionId, spec);
      const band = arrowBandForSpec(food, sectionId, spec);
      const bandFromRule = ruleBandForValue(rule, rawValue);
      const presentation = arrowPresentationForSpec(food, sectionId, spec);
      const score = asNumber(displayItem?.score, asNumber(batchItem?.score, asNumber(bandFromRule?.score, null)));
      const weight = asNumber(batchItem?.weight, asNumber(rule?.weight, null));
      const weightedContribution = asNumber(batchItem?.weightedScore, score != null && weight != null ? score * weight : null);
      const binding = textSpecForMetric(sectionId, row.metricKey);
      return {
        metricKey: row.metricKey,
        section: sectionId,
        resolvedSourceField: binding?.field || `metrics.${row.metricKey}`,
        rawValue,
        formattedValue: formatBindingValue(food, sectionId, binding),
        applicability: rule?.applicability || null,
        polarity: rule?.polarity || presentation.polarity || null,
        matchedThresholdBand: band || null,
        bandScore: score,
        colourOutcome: presentation.count ? presentation.color : 'none',
        arrowDirection: presentation.count ? (presentation.flipY ? 'down' : 'up') : 'none',
        arrowSpriteFilename: presentation.spriteFilename || '',
        arrowRotation: presentation.count ? presentation.rotation : null,
        metricWeight: weight,
        weightedContribution,
        scoringMode: displayItem?.scoringMode || batchItem?.scoringMode || rule?.scoringMode || null,
        sourcePriority: displayItem?.band ? 'episode display item' : batchItem?.band ? 'batch metric breakdown' : rule ? 'ruleset band evaluation' : 'no rule'
      };
    });
  }

  function sectionMetricBreakdown(food, sectionId) {
    const sectionKey = ruleSectionKey(sectionId);
    return (food?.batchResult?.metricBreakdown || [])
      .filter(item => item.sectionKey === sectionId || item.sectionKey === sectionKey)
      .map(item => ({ ...item }));
  }

  function proteinRowSpecForMetric(metricKey) {
    const configured = BINDINGS.proteinRows?.[metricKey];
    if (!configured) return null;
    return {
      ...configured,
      metricKey,
      label: configured.label || configured.longLabel || metricKey,
      longLabel: configured.longLabel || configured.label || metricKey,
      valueBinding: configured.valueBinding ? { ...configured.valueBinding, metricKey } : null
    };
  }

  function proteinDisplayItems(food) {
    const policy = sectionDisplayPolicy(food, 'protein');
    const visibleRows = new Set(Array.isArray(policy?.visibleRows) ? policy.visibleRows : []);
    const hiddenFallbackMetricKey = policy?.showProteinFallbackAsVisibleRow === true ? '' : String(policy?.hiddenFallbackMetricKey || '');
    const maxRows = Number.isFinite(Number(policy?.rowCount)) && Number(policy.rowCount) > 0 ? Number(policy.rowCount) : 4;
    const items = sectionDisplayItems(food, 'protein').filter(item => {
      const metricKey = String(item?.metricKey || '');
      if (!metricKey) return false;
      if (hiddenFallbackMetricKey && metricKey === hiddenFallbackMetricKey) return false;
      return !visibleRows.size || visibleRows.has(metricKey);
    });
    return items.slice(0, maxRows);
  }

  function metricRowsForSection(food, sectionId) {
    if (sectionId !== 'protein') return BINDINGS.arrowRows?.[sectionId] || [];
    const displayItems = proteinDisplayItems(food);
    if (displayItems.length) {
      return displayItems
        .map((item, index) => {
          const spec = proteinRowSpecForMetric(item.metricKey);
          if (!spec) return null;
          return {
            ...spec,
            displayItemIndex: index,
            valueBinding: spec.valueBinding ? { ...spec.valueBinding, displayItemIndex: index } : null
          };
        })
        .filter(Boolean);
    }

    return (BINDINGS.arrowRows?.protein || [])
      .map(item => proteinRowSpecForMetric(item.metricKey))
      .filter(Boolean)
      .slice(0, 4);
  }

  function weightedAverage(rows) {
    const included = rows.filter(item => asNumber(item.score, null) != null && asNumber(item.weight, null) != null);
    const totalWeight = included.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    if (!included.length || !totalWeight) return null;
    const weightedSum = included.reduce((sum, item) => sum + (item.score * (item.weight ?? 1)), 0);
    return clamp(weightedSum / totalWeight, 0, 100);
  }

  function sectionScoreCalculation(food, sectionId) {
    const rows = sectionMetricBreakdown(food, sectionId);
    const includedMetrics = rows.filter(item => asNumber(item.score, null) != null && asNumber(item.weight, null) != null);
    const includedKeys = new Set(includedMetrics.map(item => item.metricKey));
    const sectionKey = ruleSectionKey(sectionId);
    const rules = activeRules(food).filter(rule => rule.displaySection === sectionId || rule.sectionKey === sectionKey || rule.sectionKey === sectionId);
    const excludedMetrics = rules
      .filter(rule => !includedKeys.has(rule.metricKey))
      .filter(rule => rule.applicability === 'not_applicable' || (rule.weight ?? 1) <= 0 || rule.scoringRole === 'display_only')
      .map(rule => ({ metricKey: rule.metricKey, reason: rule.applicability === 'not_applicable' ? 'not_applicable' : (rule.weight ?? 1) <= 0 ? 'zero weight' : 'display only' }));
    const naMetrics = rules
      .filter(rule => !includedKeys.has(rule.metricKey))
      .filter(rule => !excludedMetrics.some(item => item.metricKey === rule.metricKey))
      .map(rule => ({ metricKey: rule.metricKey, reason: 'not included in generated metric breakdown for this food/section' }));
    const weightedMetricScoreSum = includedMetrics.reduce((sum, item) => sum + (item.weightedScore ?? ((item.score ?? 0) * (item.weight ?? 1))), 0);
    const includedMetricWeightSum = includedMetrics.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    const generatedScore = food?.batchResult?.sectionScores?.[sectionKey] ?? food?.batchResult?.sectionScores?.[sectionId] ?? food?.episode?.sectionScores?.[sectionKey] ?? null;
    const calculatedScore = weightedAverage(includedMetrics);
    return {
      section: sectionId,
      includedMetrics,
      excludedMetrics,
      naMetrics,
      weightedMetricScoreSum,
      includedMetricWeightSum,
      finalSectionScore: generatedScore ?? (calculatedScore == null ? null : Number(calculatedScore.toFixed(1))),
      calculationSource: generatedScore != null ? 'generated batch-results section score' : 'browser weighted-average fallback'
    };
  }

  function mainMacroScaling(food) {
    return Object.fromEntries(['fats', 'carbs', 'protein'].map(sectionId => [sectionId, macroFillEvaluation(food, sectionId)]));
  }

  function sourceInformation() {
    return {
      generatedFoodData: 'docs/data/foods-index.js and docs/data/foods/*.sample.json',
      generatedScoreData: 'docs/data/batch-results.json',
      displaySchema: 'docs/app/display-schema.js',
      foodTypeRuleset: 'food.ruleset embedded in generated food data, matching rulesets/*.v1.json',
      arrowResolver: 'adapted from docs/app/index.html arrowPresentationForSpec and syncArrowLayersToPresentation',
      macroFillRanges: 'FOODRANKED_DISPLAY_SCHEMA.getMacroFillRange',
      experimentalBindingMap: 'docs/display-builder-v2/macro-bindings.js macro, vitamin, mineral, and pros/cons bindings',
      storage: 'reads layout-builder keys; writes foodranked-display-builder-v2-state-v1 and foodranked-display-builder-v2-placement-layouts-v1'
    };
  }

  function formatBasis(food) {
    if (!food?.basis) return 'PER\n100G';
    if (typeof food.basis === 'string') return food.basis.toUpperCase().replace(/\s+/g, '\n');
    return `PER\n${food.basis.value || 100}${String(food.basis.unit || 'g').toUpperCase()}`;
  }

  window.FOODRANKED_MACRO_LOGIC = {
    AUTHOR_GRID,
    clone,
    clamp,
    asNumber,
    formatCompactNumber,
    formatMetricText,
    formatMacroTotalMetricText,
    formatBindingValue,
    getByPath,
    normalizeFoodType,
    prettyFoodType,
    foodTypeTitle,
    typeSpriteSlug,
    backdropPalette,
    localAssetPath,
    canonicalSpritePath,
    spriteFilename,
    foodSpriteCandidates,
    foodImageLayerGeometry,
    syncFoodImageLayerGeometry,
    headerFoodTypeSpritePath,
    headerCalorieBubbleSpritePath,
    headerFoodPlateSpritePath,
    sectionSeparatorSpritePath,
    sectionIndicatorSpritePath,
    arrowSpritePath,
    macroTotalValue,
    macroSubmetricDisplayValue,
    getMacroFillRange,
    macroFillEvaluation,
    ruleSectionKey,
    getMetricRuleForSpec,
    rawMetricValueForSpec,
    ruleBandForValue,
    arrowBandForSpec,
    parseArrowBand,
    arrowPresentationForSpec,
    visibleArrowIndexes,
    specForMetric,
    proteinRowSpecForMetric,
    metricRowsForSection,
    displayMetricSpecsForSection,
    bindingMetricKey,
    formatImpactLevelLabel,
    contextItemsForSection,
    activeRules,
    liveMetricEvaluation,
    sectionMetricBreakdown,
    sectionScoreCalculation,
    mainMacroScaling,
    sourceInformation,
    formatBasis
  };
})();
