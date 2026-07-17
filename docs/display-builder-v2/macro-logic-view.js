(function () {
  const DISPLAY_SCHEMA = window.FOODRANKED_DISPLAY_SCHEMA || {};
  const BINDINGS = window.FOODRANKED_MACRO_BINDINGS || {};
  const ROOT_SPRITE_BASE = '../app/sprites';
  const AUTHOR_GRID = DISPLAY_SCHEMA.authorGrid || { width: 135, height: 240 };
  const DISPLAY_RULE_SECTIONS = [...new Set([
    ...(BINDINGS.macroSections || ['fats', 'carbs', 'protein']),
    ...(BINDINGS.micronutrientSections || ['vitamins', 'minerals'])
  ])];
  const MACRO_BAR_MIN_VISIBLE_FILL_RATIO = 0.0011;
  const AVAILABLE_FOOD_IMAGE_IDS = new Set(['bacon', 'kale']);

  const PROTEIN_QUALITY_METRIC_KEYS = new Set([
    'essential_amino_acids_score',
    'nonessential_amino_acids_score',
    'bioavailability_percent'
  ]);

  const DEFAULT_SUBMACRO_POLARITIES = {
    saturated_fat_g: 'higher_worse',
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
    misc: { top: '#ece7e2', bottom: '#cfc5bc', glowA: 'rgba(255,255,255,.66)', glowB: 'rgba(140,120,108,.22)' }
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
    return safe.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  function formatMetricText(value, unit = '') {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(safe)}${unit}`;
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

  function customFoodImagePath(food) {
    return localAssetPath(food?.assets?.customFoodImage?.path || food?.customFoodImage?.path || '');
  }

  function foodSpriteCandidates(food) {
    const slug = typeSpriteSlug(food?.foodType);
    const customPath = customFoodImagePath(food);
    const hasCommittedImage = AVAILABLE_FOOD_IMAGE_IDS.has(String(food?.id || '').toLowerCase());
    const fallback = `${ROOT_SPRITE_BASE}/header/food_plate/${slug}_food_plate.png`;
    return {
      primary: customPath || (hasCommittedImage ? `${ROOT_SPRITE_BASE}/header/food_images/${food?.id}.png` : fallback),
      fallback
    };
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
    return `${formatCompactNumber(safe)}g`;
  }

  function hasDisplayedMacro(food, sectionId) {
    const safe = macroTotalValue(food, sectionId);
    return safe != null && safe > 0;
  }

  function ruleSectionKey(sectionId) {
    return sectionId === 'protein' ? 'proteins' : sectionId;
  }

  function getEpisodeDisplayItemForMetric(food, sectionId, metricKey, displayMetricKeys = []) {
    const sectionKey = ruleSectionKey(sectionId);
    const sections = food?.episode?.script?.sections || [];
    const section = sections.find(item => item.key === sectionId || item.key === sectionKey);
    const metricKeys = [metricKey, ...displayMetricKeys];
    return (section?.displayItems || []).find(item => metricKeys.includes(item.metricKey)) || null;
  }

  function macroSubmetricDisplayValue(food, sectionId, metricKey) {
    if (!hasDisplayedMacro(food, sectionId)) return null;
    const displayItem = getEpisodeDisplayItemForMetric(food, sectionId, metricKey);
    const displayItemValue = asNumber(displayItem?.value, null);
    if (displayItemValue != null) return displayItemValue;
    const value = asNumber(food?.metrics?.[metricKey], null);
    if (value != null) return value;
    return 0;
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
    if (fromSection) return fromSection;
    const fromRuleset = (food?.ruleset?.metricRules || []).find(rule => {
      return rule.metricKey === metricKey && (!rule.sectionKey || rule.sectionKey === sectionKey || rule.sectionKey === sectionId);
    });
    if (fromRuleset) return fromRuleset;
    const polarity = DEFAULT_SUBMACRO_POLARITIES[metricKey];
    if (!polarity) return null;
    return {
      metricKey,
      sectionKey,
      scoringMode: 'arrow_bands',
      polarity,
      applicability: 'optional',
      weight: 1,
      bands: polarity === 'higher_worse' ? DEFAULT_HIGHER_WORSE_BANDS : DEFAULT_HIGHER_BETTER_BANDS
    };
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
    const entries = Object.values(BINDINGS.textBindings?.[sectionId] || {});
    return entries.find(binding => binding.metricKey === metricKey && /Value$/.test(binding.kind)) || null;
  }

  function specForMetric(sectionId, metricKey) {
    const binding = textSpecForMetric(sectionId, metricKey);
    return {
      key: metricKey,
      metricKey,
      label: BINDINGS.arrowRows?.[sectionId]?.find(row => row.metricKey === metricKey)?.label || metricKey,
      displayMetricKeys: binding?.displayMetricKeys || []
    };
  }

  function formatBindingValue(food, sectionId, binding) {
    if (!binding) return 'N/A';
    if (binding.kind === 'staticLabel' || binding.kind === 'metricLabel') return binding.label || '';
    if (binding.kind === 'macroTotal') return formatMacroTotalMetricText(food, sectionId);
    if (binding.kind === 'ratioMetricValue') return formatMacroRatioMetricText(food, sectionId, binding.metricKey, binding.denominator || 1);
    if (binding.kind === 'metricValue') return formatMacroMetricText(food, sectionId, binding.metricKey, binding.unit || '');
    const value = getByPath(food, binding.field, binding.alternateFields);
    return formatMetricText(value, binding.unit || '');
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
    const rows = BINDINGS.arrowRows?.[sectionId] || [];
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
      experimentalBindingMap: 'docs/display-builder-v2/macro-bindings.js macro, vitamin, and mineral bindings',
      storage: 'reads layout-builder keys only; writes foodranked-display-builder-v2-state-v1'
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
    typeSpriteSlug,
    backdropPalette,
    localAssetPath,
    canonicalSpritePath,
    spriteFilename,
    foodSpriteCandidates,
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
    activeRules,
    liveMetricEvaluation,
    sectionMetricBreakdown,
    sectionScoreCalculation,
    mainMacroScaling,
    sourceInformation,
    formatBasis
  };
})();
