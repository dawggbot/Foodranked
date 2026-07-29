(function () {
  const LOGIC = window.FOODRANKED_MACRO_LOGIC;
  const BINDINGS = window.FOODRANKED_MACRO_BINDINGS;
  const MACRO_SECTIONS = BINDINGS.macroSections || ['fats', 'carbs', 'protein'];
  const MICRONUTRIENT_SECTIONS = BINDINGS.micronutrientSections || ['vitamins', 'minerals'];
  const CONTEXT_SECTIONS = BINDINGS.contextSections || ['pros', 'cons'];
  const CONTEXT_ITEM_COUNT = Math.max(1, Number(BINDINGS.contextItemCount) || 3);
  const DISPLAY_SECTIONS = BINDINGS.displaySections || ['intro', ...MACRO_SECTIONS];
  const SECTION_LABELS = {
    intro: 'Intro',
    fats: 'Fats',
    carbs: 'Carbohydrates',
    protein: 'Protein',
    vitamins: 'Vitamins',
    minerals: 'Minerals',
    pros: 'Pros',
    cons: 'Cons',
    outro: 'Outro'
  };
  const SECTION_ID_ALIASES = {
    carbohydrates: 'carbs',
    proteins: 'protein'
  };
  const LAYOUT_BUILDER_WORKING_KEY = 'foodranked-layout-builder-v4';
  const LAYOUT_BUILDER_FOOD_LAYOUTS_KEY = 'foodranked-layout-builder-food-layouts-v1';
  const LAYOUT_BUILDER_SAVED_KEY = 'foodranked-layout-builder-sprite-layouts-v1';
  const PREFERRED_SAVED_LAYOUT_NAME = 'test';
  const TEST_STATE_KEY = 'foodranked-display-builder-v2-state-v1';
  const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
  const PLACEMENT_EXPORT_LIMIT = 60;
  const PAGE_URL_PARAMS = new URLSearchParams(window.location.search);
  const DISPLAY_BUILDER_V2_BUILD_ID = PAGE_URL_PARAMS.get('build') || '20260729-evoo-header-full-v1';
  const DATA_CACHE_BUST = '20260729-evoo-header-full-v1';
  const FOOD_JSON_CACHE = new Map();
  const BATCH_RESULTS_CACHE = new Map();
  const TEXT_LAYER_CLIP_BLEED = 2;
  const TEXT_LAYER_LINE_HEIGHT = 1.15;
  const CONTEXT_ITEM_TEXTBOX_LINES = 3;
  const MICRO_BAR_TEXTBOX_FONT_SIZE = 4.5;
  const MICRO_BAR_TEXTBOX_WIDTH = 11;
  const MICRO_BAR_TEXTBOX_STROKE_WIDTH = 1.15;
  const LAYOUT_BUILDER_CANVAS_VIEW_ZOOM = 1.36;
  const LAYOUT_BUILDER_REFERENCE_DISPLAY_WIDTH = 408;
  const MACRO_REVEAL_SECONDS = 0.08;
  const MACRO_BAR_START_DWELL_SECONDS = 0.5;
  const MACRO_BAR_FILL_SECONDS = 1.55;
  const MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER = 1.65;
  const MACRO_BAR_LAST_QUARTER_END_SPEED_RATIO = 0.42;
  const MACRO_BAR_GIF_NATIVE_SECONDS = 8.1;
  const MACRO_BAR_GIF_FINAL_HOLD_CENTISECONDS = 65535;
  const MACRO_BAR_GIF_SOURCE_CACHE = new Map();
  const MACRO_BAR_GIF_FRAME_CACHE = new Map();
  const SECTION_STILL_EXPORT_MIME = 'image/png';
  const SECTION_STILL_EXPORT_EXTENSION = 'png';
  const SECTION_STILL_EXPORT_MIN_OUTPUT_WIDTH = 1080;
  const SECTION_STILL_EXPORT_STATUS_CLEAR_MS = 3200;
  const SECTION_STILL_EXPORT_GIF_TIMEOUT_MS = 8000;
  const SECTION_STILL_EXPORT_IMAGE_CACHE = new Map();
  const INTRO_RANKED_SPRITE_PATH = './sprites/ui/intro_&_outro/ranked.png';
  const OUTRO_TIER_SPRITE_PATHS = Object.freeze({
    S: './sprites/ui/intro_&_outro/S_tier.png',
    A: './sprites/ui/intro_&_outro/A_tier.png',
    B: './sprites/ui/intro_&_outro/B_tier.png',
    C: './sprites/ui/intro_&_outro/C_tier.png',
    D: './sprites/ui/intro_&_outro/D_tier.png'
  });
  const OUTRO_LIKE_SPRITE_PATH = './sprites/ui/intro_&_outro/like.png';
  const OUTRO_FOLLOW_SPRITE_PATH = './sprites/ui/intro_&_outro/follow.png';
  const OUTRO_SHARE_SPRITE_PATH = './sprites/ui/intro_&_outro/share.png';
  const INTRO_RANKED_VISIBLE_CENTER = { x: 0.5, y: 0.47 };
  const INTRO_HERO_SIZE = { ranked: 80, foodWidth: 48, foodHeight: 24 };
  const OUTRO_TIER_STAMP_SIZE = 78;
  const OUTRO_TIER_STAMP_ASSET_SIZE = 50;
  const OUTRO_CTA_STAMP_ASSET_SIZE = 15;
  const OUTRO_CTA_STAMP_SCALE = 0.5;
  const OUTRO_CTA_STAMP_SIZE = OUTRO_TIER_STAMP_SIZE * (OUTRO_CTA_STAMP_ASSET_SIZE / OUTRO_TIER_STAMP_ASSET_SIZE) * OUTRO_CTA_STAMP_SCALE;
  const OUTRO_CTA_STAMP_GAP_X = (OUTRO_TIER_STAMP_SIZE - (OUTRO_CTA_STAMP_SIZE * 3)) / 2;
  const OUTRO_CTA_STAMP_GAP_Y = 4;
  const OUTRO_CTA_STAMP_CENTER_Y = (OUTRO_TIER_STAMP_SIZE / 2) + OUTRO_CTA_STAMP_GAP_Y + (OUTRO_CTA_STAMP_SIZE / 2);
  const INTRO_FOCUS_BLUR_PX = 2;
  const INTRO_FOCUS_CLEAR_LAYER_IDS = new Set(['intro_ranked_sprite', 'intro_food_hero']);
  const DBV2_STATIC_STAMP_LAYER_FLAG = 'displayBuilderV2StaticStamp';
  const renderToken = { value: 0 };
  const PLACEMENT_LAYER_KEYS = [
    'id',
    'kind',
    'label',
    'src',
    'fallbackSrc',
    'x',
    'y',
    'z',
    'width',
    'height',
    'visible',
    'preserveAspect',
    'aspectRatio',
    'naturalWidth',
    'naturalHeight',
    'rotation',
    'rotate',
    'flipX',
    'flipY',
    'manualPosition',
    'centerAnchor',
    'centerOffsetX',
    'centerOffsetY',
    'fontSize',
    'autoFontSize',
    'align',
    'textAlign',
    'lineHeight',
    'textBoxHeight',
    'textStrokeWidth',
    'textStrokeColor',
    'color',
    'textGlowColor',
    'manualText',
    'layoutBuilderManualText',
    'generatedForDisplayV2',
    'generatedForDisplayV2Percent',
    'foodDriven',
    'effect',
    'animationDelay',
    'sparkleDelay',
    'fillRatio',
    'fillRange',
    'fillValue',
    'text'
  ];
  const FOOD_IMAGE_PLACEMENT_KEYS = [
    'x',
    'y',
    'z',
    'width',
    'height',
    'preserveAspect',
    'rotation',
    'rotate',
    'manualPosition'
  ];
  const LAYOUT_GUIDE_LAYER_KEYS = [
    'x',
    'y',
    'z',
    'width',
    'height',
    'preserveAspect',
    'aspectRatio',
    'naturalWidth',
    'naturalHeight',
    'rotation',
    'rotate',
    'flipX',
    'flipY',
    'centerAnchor',
    'centerOffsetX',
    'centerOffsetY',
    'fontSize',
    'autoFontSize',
    'align',
    'textAlign',
    'lineHeight',
    'textBoxHeight',
    'textStrokeWidth',
    'textStrokeColor',
    'manualPosition'
  ];

  const DEFAULT_BACKGROUND = {
    color: '#d6d6d6'
  };

  const state = {
    foods: Array.isArray(window.FOODS_INDEX) ? window.FOODS_INDEX : [],
    foodFilter: '',
    selectedFoodId: '',
    selectedSectionId: 'intro',
    selectedLayoutKey: '',
    layoutOptions: [],
    fullFood: null,
    renderedLayout: null,
    bindingReport: { text: [], arrows: [], micronutrientBars: [], contextItems: [], warnings: [] },
    spriteFailures: new Map(),
    background: LOGIC.clone(DEFAULT_BACKGROUND),
    canvasMetrics: null,
    lastLogic: null,
    loadingFoodId: '',
    batchResultsPromise: null,
    imageExportingSectionId: '',
    imageExportStatus: '',
    imageExportStatusTone: '',
    imageExportStatusTimer: 0
  };

  const els = {
    layoutSelect: document.getElementById('layoutSelect'),
    layoutStatus: document.getElementById('layoutStatus'),
    foodSearch: document.getElementById('foodSearch'),
    foodList: document.getElementById('foodList'),
    sectionList: document.getElementById('sectionList'),
    canvasWrap: document.querySelector('.canvas-wrap'),
    displayCanvas: document.getElementById('displayCanvas'),
    canvasMeta: document.getElementById('canvasMeta'),
    sectionExportStatus: document.getElementById('sectionExportStatus'),
    foodTypePill: document.getElementById('foodTypePill'),
    activeFoodTypeTitle: document.getElementById('activeFoodTypeTitle'),
    programmerLogic: document.getElementById('programmerLogic'),
    bgColor: document.getElementById('bgColor')
  };

  function readTestState() {
    try {
      const raw = localStorage.getItem(TEST_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
    return {};
  }

  function writeTestState() {
    const payload = {
      selectedFoodId: state.selectedFoodId,
      selectedSectionId: state.selectedSectionId,
      selectedLayoutKey: state.selectedLayoutKey,
      background: {
        color: state.background.color || DEFAULT_BACKGROUND.color
      }
    };
    localStorage.setItem(TEST_STATE_KEY, JSON.stringify(payload));
  }

  function parseStorageJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function normalizeDisplaySectionId(sectionId) {
    const raw = String(sectionId || '').trim();
    return SECTION_ID_ALIASES[raw] || raw;
  }

  function normalizeLayoutSections(layout) {
    if (!layout || typeof layout !== 'object') return layout;
    if (layout.selectedSectionId) layout.selectedSectionId = normalizeDisplaySectionId(layout.selectedSectionId);
    if (!layout.sections || typeof layout.sections !== 'object') return layout;

    const normalizedSections = {};
    for (const [rawSectionId, section] of Object.entries(layout.sections)) {
      const sectionId = normalizeDisplaySectionId(rawSectionId);
      if (!normalizedSections[sectionId]) {
        normalizedSections[sectionId] = section;
        continue;
      }

      const currentLayers = Array.isArray(normalizedSections[sectionId]?.layers)
        ? normalizedSections[sectionId].layers
        : [];
      const incomingLayers = Array.isArray(section?.layers) ? section.layers : [];
      const currentIds = new Set(currentLayers.map(layer => layer?.id).filter(Boolean));
      const mergedLayers = [...currentLayers];
      incomingLayers.forEach(layer => {
        if (layer?.id && currentIds.has(layer.id)) return;
        mergedLayers.push(layer);
      });
      normalizedSections[sectionId] = {
        ...(normalizedSections[sectionId] || {}),
        ...(section || {}),
        layers: mergedLayers
      };
    }
    layout.sections = normalizedSections;
    return layout;
  }

  function validLayout(layout) {
    return !!layout && typeof layout === 'object' && !!layout.sections && typeof layout.sections === 'object';
  }

  function countDisplayLayers(layout) {
    normalizeLayoutSections(layout);
    return DISPLAY_SECTIONS.reduce((sum, sectionId) => {
      const layers = layout?.sections?.[sectionId]?.layers;
      return sum + (Array.isArray(layers) ? layers.length : 0);
    }, 0);
  }

  function normalizeSavedPreset(entry) {
    if (!entry || !entry.id || !entry.sections || typeof entry.sections !== 'object') return null;
    return {
      key: `saved:${entry.id}`,
      id: String(entry.id),
      name: String(entry.name || 'Untitled layout'),
      kind: 'saved layout preset',
      updatedAt: entry.updatedAt || entry.createdAt || '',
      layout: normalizeLayoutSections({
        canvas: null,
        selectedSectionId: entry.selectedSectionId || 'intro',
        sections: LOGIC.clone(entry.sections),
        meta: { source: LAYOUT_BUILDER_SAVED_KEY }
      })
    };
  }

  function readFoodLayoutMap() {
    const parsed = parseStorageJson(LAYOUT_BUILDER_FOOD_LAYOUTS_KEY, {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }

  function layoutBuilderWorkingOption() {
    const working = parseStorageJson(LAYOUT_BUILDER_WORKING_KEY, null);
    if (!validLayout(working)) return null;
    return {
      key: 'working:current',
      id: 'current-working-layout',
      name: 'Current working layout',
      kind: 'layout-builder working layout',
      updatedAt: working.meta?.updatedAt || '',
      layout: normalizeLayoutSections(LOGIC.clone(working))
    };
  }

  function repoDefaultLayoutOption() {
    const layout = window.FOODRANKED_DISPLAY_BUILDER_DEFAULT_LAYOUT;
    if (!validLayout(layout)) return null;
    return {
      key: 'default:repo',
      id: 'repo-default-layout',
      name: 'Repo default layout',
      kind: 'repo default layout',
      updatedAt: layout.meta?.updatedAt || '',
      layout: normalizeLayoutSections({
        ...LOGIC.clone(layout),
        meta: {
          ...(layout.meta || {}),
          source: 'docs/app/default-layout.js'
        }
      })
    };
  }

  function isPreferredSavedLayoutOption(option) {
    return /^saved:/.test(String(option?.key || ''))
      && String(option?.name || '').trim().toLowerCase() === PREFERRED_SAVED_LAYOUT_NAME;
  }

  function isHeaderFoodImageLayer(layer) {
    if (!isSpriteLayer(layer)) return false;
    if (layer?.[DBV2_STATIC_STAMP_LAYER_FLAG] || layer?.id === 'intro_food_hero') return false;
    const src = String(layer.src || '').toLowerCase();
    const label = String(layer.label || '').toLowerCase().replace(/^library:\s*/, '');
    return src.includes('/header/food_images/') || /^header food image$/.test(label);
  }

  function isHeaderUnderlineSpriteLayer(layer) {
    if (!isSpriteLayer(layer)) return false;
    const src = String(layer.src || '').toLowerCase();
    const label = String(layer.label || '').toLowerCase().replace(/^library:\s*/, '');
    return src.includes('/header/header_ui/food_name_line')
      || src.includes('/header/header_ui/per_100g_line')
      || /^header food name underline$/.test(label)
      || /^header per-100g underline$/.test(label);
  }

  function foodImagePlacementSnapshot(layer) {
    if (!layer) return null;
    const placement = {};
    for (const key of FOOD_IMAGE_PLACEMENT_KEYS) {
      if (Object.prototype.hasOwnProperty.call(layer, key)) placement[key] = layer[key];
    }
    const naturalWidth = Number(layer?.naturalWidth);
    const naturalHeight = Number(layer?.naturalHeight);
    if (Number.isFinite(naturalWidth) && naturalWidth > 0) placement.templateNaturalWidth = naturalWidth;
    if (Number.isFinite(naturalHeight) && naturalHeight > 0) placement.templateNaturalHeight = naturalHeight;
    return Object.keys(placement).length ? placement : null;
  }

  function roundedLayoutNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Number(number.toFixed(3));
  }

  function positiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function foodImageNaturalSize(food) {
    const geometry = LOGIC.foodImageLayerGeometry?.(food);
    if (!geometry) return null;
    const naturalWidth = positiveNumber(geometry.naturalWidth);
    const naturalHeight = positiveNumber(geometry.naturalHeight);
    if (naturalWidth && naturalHeight) return { width: naturalWidth, height: naturalHeight };
    const width = positiveNumber(geometry.width);
    const height = positiveNumber(geometry.height);
    return width && height ? { width, height } : null;
  }

  function foodImageTemplateScale(placement) {
    const width = positiveNumber(placement?.width);
    const height = positiveNumber(placement?.height);
    const naturalWidth = positiveNumber(placement?.templateNaturalWidth);
    const naturalHeight = positiveNumber(placement?.templateNaturalHeight);
    if (!width || !height || !naturalWidth || !naturalHeight) return null;
    const scale = Math.min(width / naturalWidth, height / naturalHeight);
    return Number.isFinite(scale) && scale > 0 ? scale : null;
  }

  function sameFoodImageNaturalSize(placement, size) {
    const templateWidth = positiveNumber(placement?.templateNaturalWidth);
    const templateHeight = positiveNumber(placement?.templateNaturalHeight);
    return !!templateWidth
      && !!templateHeight
      && !!size?.width
      && !!size?.height
      && Math.abs(templateWidth - size.width) < 0.001
      && Math.abs(templateHeight - size.height) < 0.001;
  }

  function applyFoodImageScaledPlacement(layer, placement, food) {
    const width = positiveNumber(placement?.width);
    const height = positiveNumber(placement?.height);
    const x = Number(placement?.x);
    const y = Number(placement?.y);
    const scale = foodImageTemplateScale(placement);
    const naturalSize = foodImageNaturalSize(food);
    if (!width || !height || !Number.isFinite(x) || !Number.isFinite(y) || !scale || !naturalSize) return false;
    if (sameFoodImageNaturalSize(placement, naturalSize)) return false;

    const centerX = x + (width / 2);
    const centerY = y + (height / 2);
    const nextWidth = naturalSize.width * scale;
    const nextHeight = naturalSize.height * scale;
    layer.x = roundedLayoutNumber(centerX - (nextWidth / 2));
    layer.y = roundedLayoutNumber(centerY - (nextHeight / 2));
    layer.width = roundedLayoutNumber(nextWidth);
    layer.height = roundedLayoutNumber(nextHeight);
    layer.naturalWidth = naturalSize.width;
    layer.naturalHeight = naturalSize.height;
    layer.aspectRatio = naturalSize.height ? naturalSize.width / naturalSize.height : null;
    layer.preserveAspect = true;
    layer.manualPosition = true;
    return true;
  }

  function foodImagePlacementTemplateFromLayout(layout) {
    if (!validLayout(layout)) return null;
    const normalized = normalizeLayoutSections(LOGIC.clone(layout));
    const sectionIds = [
      normalized.selectedSectionId,
      state.selectedSectionId,
      'intro',
      ...DISPLAY_SECTIONS,
      ...Object.keys(normalized.sections || {})
    ]
      .map(normalizeDisplaySectionId)
      .filter(Boolean);
    for (const sectionId of [...new Set(sectionIds)]) {
      const layer = getSectionLayers(normalized, sectionId)
        .find(item => isHeaderFoodImageLayer(item) && item.manualPosition);
      const placement = foodImagePlacementSnapshot(layer);
      if (placement) return placement;
    }
    return null;
  }

  function addLayoutGuideCandidate(candidates, layout) {
    if (validLayout(layout)) candidates.push(layout);
  }

  function layoutBuilderFoodImagePlacementTemplate(foodId = state.selectedFoodId, preferredLayout = null) {
    const foodLayoutMap = readFoodLayoutMap();
    const candidates = [];
    addLayoutGuideCandidate(candidates, preferredLayout);
    const workingLayout = parseStorageJson(LAYOUT_BUILDER_WORKING_KEY, null);
    addLayoutGuideCandidate(candidates, workingLayout);
    addLayoutGuideCandidate(candidates, foodLayoutMap[foodId]);
    for (const [candidateFoodId, layout] of Object.entries(foodLayoutMap)) {
      if (candidateFoodId === foodId) continue;
      addLayoutGuideCandidate(candidates, layout);
    }
    for (const layout of candidates) {
      const placement = foodImagePlacementTemplateFromLayout(layout);
      if (placement) return placement;
    }
    return null;
  }

  function applyFoodImagePlacementToLayer(layer, placement, food) {
    if (!layer || !placement) return false;
    const scaledPlacementApplied = applyFoodImageScaledPlacement(layer, placement, food);
    let changed = false;
    for (const key of FOOD_IMAGE_PLACEMENT_KEYS) {
      if (scaledPlacementApplied && ['x', 'y', 'width', 'height', 'preserveAspect', 'manualPosition'].includes(key)) continue;
      if (!Object.prototype.hasOwnProperty.call(placement, key)) continue;
      if (layer[key] === placement[key]) continue;
      layer[key] = placement[key];
      changed = true;
    }
    return scaledPlacementApplied || changed;
  }

  function applyLayoutBuilderFoodImagePlacement(layout, food, preferredLayout = null) {
    const placement = layoutBuilderFoodImagePlacementTemplate(food?.id, preferredLayout);
    if (!placement) return false;
    let changed = false;
    for (const sectionId of Object.keys(layout.sections || {})) {
      for (const layer of getSectionLayers(layout, sectionId)) {
        if (!isHeaderFoodImageLayer(layer)) continue;
        changed = applyFoodImagePlacementToLayer(layer, placement, food) || changed;
      }
    }
    return changed;
  }

  function layoutGuideKey(sectionId, layer) {
    const id = String(layer?.id || '').trim();
    if (id) return `${sectionId}:id:${id}`;
    const label = String(layer?.label || '').trim().toLowerCase();
    return label ? `${sectionId}:label:${label}` : '';
  }

  function layoutGuideLayerSnapshot(layer) {
    if (!isSpriteLayer(layer) && !isTextLayer(layer)) return null;
    const placement = {};
    for (const key of LAYOUT_GUIDE_LAYER_KEYS) {
      if (Object.prototype.hasOwnProperty.call(layer, key)) placement[key] = layer[key];
    }
    return Object.keys(placement).length ? placement : null;
  }

  function layoutBuilderGuideCandidates(foodId = state.selectedFoodId, preferredLayout = null) {
    const candidates = [];
    addLayoutGuideCandidate(candidates, preferredLayout);
    const workingOption = layoutBuilderWorkingOption();
    addLayoutGuideCandidate(candidates, workingOption?.layout);
    const foodLayoutMap = readFoodLayoutMap();
    addLayoutGuideCandidate(candidates, foodLayoutMap[foodId]);
    for (const [candidateFoodId, layout] of Object.entries(foodLayoutMap)) {
      if (candidateFoodId === foodId) continue;
      addLayoutGuideCandidate(candidates, layout);
    }
    return candidates;
  }

  function layoutBuilderPlacementGuide(foodId = state.selectedFoodId, preferredLayout = null) {
    const guide = new Map();
    for (const candidate of layoutBuilderGuideCandidates(foodId, preferredLayout)) {
      const layout = normalizeLayoutSections(LOGIC.clone(candidate));
      for (const [sectionId, section] of Object.entries(layout.sections || {})) {
        const normalizedSectionId = normalizeDisplaySectionId(sectionId);
        const layers = Array.isArray(section?.layers) ? section.layers : [];
        for (const layer of layers) {
          const key = layoutGuideKey(normalizedSectionId, layer);
          if (!key || guide.has(key)) continue;
          const placement = layoutGuideLayerSnapshot(layer);
          if (placement) guide.set(key, placement);
        }
      }
    }
    return guide;
  }

  function applyPlacementGuideToLayer(layer, placement) {
    if (!layer || !placement) return false;
    let changed = false;
    for (const key of LAYOUT_GUIDE_LAYER_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(placement, key)) continue;
      if (layer[key] === placement[key]) continue;
      layer[key] = placement[key];
      changed = true;
    }
    return changed;
  }

  function applyLayoutBuilderPlacementGuide(layout, food, preferredLayout = null) {
    const guide = layoutBuilderPlacementGuide(food?.id, preferredLayout);
    if (!guide.size) return false;
    let changed = false;
    for (const [sectionId] of Object.entries(layout.sections || {})) {
      const normalizedSectionId = normalizeDisplaySectionId(sectionId);
      for (const layer of getSectionLayers(layout, normalizedSectionId)) {
        const placement = guide.get(layoutGuideKey(normalizedSectionId, layer));
        changed = applyPlacementGuideToLayer(layer, placement) || changed;
      }
    }
    return changed;
  }

  function normalizeFoodLayoutOption(foodId, layout) {
    if (!foodId || !validLayout(layout)) return null;
    const food = state.foods.find(item => item.id === foodId);
    const clonedLayout = normalizeLayoutSections(LOGIC.clone(layout));
    return {
      key: `food:${foodId}`,
      id: `food-layout:${foodId}`,
      name: `${food?.name || foodId} food layout`,
      kind: 'layout-builder food layout',
      updatedAt: clonedLayout.meta?.updatedAt || clonedLayout.updatedAt || '',
      layout: {
        ...clonedLayout,
        meta: {
          ...(clonedLayout.meta || {}),
          source: LAYOUT_BUILDER_FOOD_LAYOUTS_KEY,
          foodId
        }
      }
    };
  }

  function refreshLayoutOptions({ keepSelection = true } = {}) {
    const previousKey = keepSelection ? state.selectedLayoutKey : '';
    const options = [];
    const working = layoutBuilderWorkingOption();
    if (working) options.push(working);

    const foodLayoutOption = normalizeFoodLayoutOption(
      state.selectedFoodId,
      readFoodLayoutMap()[state.selectedFoodId]
    );
    if (foodLayoutOption) options.push(foodLayoutOption);

    const savedRaw = parseStorageJson(LAYOUT_BUILDER_SAVED_KEY, []);
    const savedEntries = Array.isArray(savedRaw) ? savedRaw : Object.values(savedRaw || {});
    const savedOptions = savedEntries
      .map(normalizeSavedPreset)
      .filter(Boolean)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)) || a.name.localeCompare(b.name));
    savedOptions.forEach(option => options.push(option));
    const repoDefault = repoDefaultLayoutOption();
    if (repoDefault) options.push(repoDefault);

    state.layoutOptions = options.filter(option => countDisplayLayers(option.layout) > 0);
    const preferredSaved = state.layoutOptions.find(isPreferredSavedLayoutOption);
    const previousStillAvailable = previousKey && state.layoutOptions.some(option => option.key === previousKey);
    if (preferredSaved && (!previousKey || previousKey === 'working:current' || /^food:/.test(previousKey) || !previousStillAvailable)) {
      state.selectedLayoutKey = preferredSaved.key;
    } else if (working && (!previousKey || /^food:/.test(previousKey))) {
      state.selectedLayoutKey = working.key;
    } else if (previousStillAvailable) {
      state.selectedLayoutKey = previousKey;
    } else {
      state.selectedLayoutKey = state.layoutOptions[0]?.key || '';
    }
    renderLayoutSelect();
  }

  function renderLayoutSelect() {
    els.layoutSelect.innerHTML = '';
    if (!state.layoutOptions.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No layout-builder layouts available';
      els.layoutSelect.appendChild(option);
      els.layoutStatus.textContent = 'Open the layout builder and save or keep a working display layout, then refocus this tab.';
      els.layoutStatus.classList.add('warn');
      return;
    }

    for (const option of state.layoutOptions) {
      const node = document.createElement('option');
      node.value = option.key;
      const stamp = option.updatedAt ? ` · ${new Date(option.updatedAt).toLocaleDateString()}` : '';
      node.textContent = `${option.name} · ${option.kind}${stamp}`;
      els.layoutSelect.appendChild(node);
    }
    els.layoutSelect.value = state.selectedLayoutKey;
    const selected = selectedLayoutOption();
    els.layoutStatus.textContent = selected
      ? `${selected.kind}; ${countDisplayLayers(selected.layout)} display-section layers available.`
      : '';
    els.layoutStatus.classList.remove('warn');
  }

  function selectedLayoutOption() {
    return state.layoutOptions.find(option => option.key === state.selectedLayoutKey) || state.layoutOptions[0] || null;
  }

  function readPlacementExport() {
    const parsed = parseStorageJson(PLACEMENT_EXPORT_KEY, {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }

  function placementLayerSnapshot(layer) {
    if (!layer || (!isSpriteLayer(layer) && !isTextLayer(layer))) return null;
    if (layer[DBV2_STATIC_STAMP_LAYER_FLAG]) return null;
    const snapshot = {};
    PLACEMENT_LAYER_KEYS.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(layer, key)) snapshot[key] = LOGIC.clone(layer[key]);
    });
    return snapshot.id && snapshot.kind ? snapshot : null;
  }

  function placementLayoutSnapshot(layout, food, layoutOption, exportedAt) {
    const sections = {};
    DISPLAY_SECTIONS.forEach(sectionId => {
      sections[sectionId] = {
        layers: getSectionLayers(layout, sectionId)
          .map(placementLayerSnapshot)
          .filter(Boolean)
      };
    });
    return normalizeLayoutSections({
      canvas: LOGIC.clone(layout?.canvas || {}),
      selectedFoodId: food?.id || state.selectedFoodId,
      selectedSectionId: state.selectedSectionId,
      sections,
      meta: {
        source: PLACEMENT_EXPORT_KEY,
        sourceBuilder: 'display-builder-v2',
        sourceLayoutKey: layoutOption?.key || '',
        sourceLayoutName: layoutOption?.name || '',
        exportBuildId: DISPLAY_BUILDER_V2_BUILD_ID,
        exportedAt
      }
    });
  }

  function writeRenderedPlacementExport(layout, food, layoutOption) {
    if (!validLayout(layout) || !food?.id) return;
    const exportedAt = new Date().toISOString();
    const entry = {
      foodId: food.id,
      foodName: food.name || food.id,
      foodType: food.foodType || '',
      sourceLayoutKey: layoutOption?.key || '',
      sourceLayoutName: layoutOption?.name || '',
      selectedSectionId: state.selectedSectionId,
      buildId: DISPLAY_BUILDER_V2_BUILD_ID,
      exportedAt,
      layout: placementLayoutSnapshot(layout, food, layoutOption, exportedAt)
    };
    const existing = readPlacementExport();
    const layouts = existing.layouts && typeof existing.layouts === 'object' && !Array.isArray(existing.layouts)
      ? existing.layouts
      : {};
    layouts[food.id] = entry;
    const orderedEntries = Object.values(layouts)
      .filter(item => item?.foodId && item.layout)
      .sort((a, b) => String(b.exportedAt || '').localeCompare(String(a.exportedAt || '')))
      .slice(0, PLACEMENT_EXPORT_LIMIT);
    const payload = {
      version: 1,
      key: PLACEMENT_EXPORT_KEY,
      buildId: DISPLAY_BUILDER_V2_BUILD_ID,
      currentFoodId: food.id,
      updatedAt: exportedAt,
      layouts: Object.fromEntries(orderedEntries.map(item => [item.foodId, item]))
    };
    try {
      localStorage.setItem(PLACEMENT_EXPORT_KEY, JSON.stringify(payload));
    } catch {
      try {
        localStorage.setItem(PLACEMENT_EXPORT_KEY, JSON.stringify({
          ...payload,
          layouts: { [food.id]: entry }
        }));
      } catch {}
    }
  }

  function selectedFoodStub() {
    return state.foods.find(food => food.id === state.selectedFoodId) || state.foods[0] || null;
  }

  async function loadFullFood(stub) {
    if (!stub?.path) return stub || null;
    if (FOOD_JSON_CACHE.has(stub.path)) return FOOD_JSON_CACHE.get(stub.path);
    try {
      const response = await fetch(withDataCacheBust(`../${stub.path}`));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      FOOD_JSON_CACHE.set(stub.path, json);
      return json;
    } catch {
      return stub || null;
    }
  }

  async function loadBatchResults() {
    if (BATCH_RESULTS_CACHE.size) return true;
    if (state.batchResultsPromise) return state.batchResultsPromise;
    state.batchResultsPromise = (async () => {
      try {
        const response = await fetch(withDataCacheBust('../data/batch-results.json'));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        const details = Array.isArray(json?.details) ? json.details : [];
        details.forEach(item => {
          const result = item?.result;
          const id = result?.food?.id;
          if (id) BATCH_RESULTS_CACHE.set(id, result);
        });
        return true;
      } catch {
        state.bindingReport.warnings.push({ type: 'data', message: 'Generated batch-results.json could not be loaded.' });
        return false;
      }
    })();
    return state.batchResultsPromise;
  }

  function attachBatchResult(food) {
    if (!food?.id) return food;
    const batchResult = BATCH_RESULTS_CACHE.get(food.id);
    return batchResult ? { ...food, batchResult } : food;
  }

  function withDataCacheBust(path) {
    const separator = String(path).includes('?') ? '&' : '?';
    return `${path}${separator}v=${DATA_CACHE_BUST}`;
  }

  async function loadSelectedFood() {
    const stub = selectedFoodStub();
    if (!stub) {
      state.fullFood = null;
      return null;
    }
    state.loadingFoodId = stub.id;
    const fullFood = await loadFullFood(stub);
    const merged = {
      ...stub,
      ...(fullFood || {}),
      header: { ...(stub.header || {}), ...((fullFood || {}).header || {}) },
      metrics: { ...(stub.metrics || {}), ...((fullFood || {}).metrics || {}) },
      assets: (fullFood || {}).assets || stub.assets || null,
      episode: (fullFood || {}).episode || stub.episode,
      ruleset: (fullFood || {}).ruleset || stub.ruleset
    };
    state.fullFood = attachBatchResult(merged);
    state.loadingFoodId = '';
    return state.fullFood;
  }

  function renderFoodList() {
    const q = state.foodFilter.trim().toLowerCase();
    const matches = state.foods.filter(food => {
      if (!q) return true;
      return [food.id, food.name, food.foodType, food.foodTypeLabel]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(q));
    });
    els.foodList.innerHTML = '';
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'notice warn';
      empty.textContent = 'No foods match this search.';
      els.foodList.appendChild(empty);
      return;
    }

    for (const food of matches) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `food-button${food.id === state.selectedFoodId ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', food.id === state.selectedFoodId ? 'true' : 'false');
      button.innerHTML = `<strong>${escapeHtml(food.name)}</strong><div class="tiny muted">${escapeHtml(food.foodType || 'Unknown')} · ${escapeHtml(String(food.basis?.value || 100))}${escapeHtml(food.basis?.unit || 'g')}</div>`;
      button.addEventListener('click', async () => {
        state.selectedFoodId = food.id;
        refreshLayoutOptions({ keepSelection: false });
        writeTestState();
        renderFoodList();
        await renderAll();
      });
      els.foodList.appendChild(button);
    }
  }

  function renderSections() {
    els.sectionList.innerHTML = '';
    for (const sectionId of DISPLAY_SECTIONS) {
      const row = document.createElement('div');
      row.className = 'section-row';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `section-button${sectionId === state.selectedSectionId ? ' active' : ''}`;
      button.textContent = SECTION_LABELS[sectionId] || sectionId;
      button.addEventListener('click', async () => {
        state.selectedSectionId = sectionId;
        writeTestState();
        renderSections();
        await renderAll();
      });

      const downloadButton = document.createElement('button');
      downloadButton.type = 'button';
      downloadButton.className = 'section-download-button';
      downloadButton.textContent = state.imageExportingSectionId === sectionId ? '...' : 'PNG';
      downloadButton.title = `Download ${SECTION_LABELS[sectionId] || sectionId} still as PNG`;
      downloadButton.setAttribute('aria-label', downloadButton.title);
      downloadButton.disabled = Boolean(state.imageExportingSectionId);
      downloadButton.addEventListener('click', event => {
        event.stopPropagation();
        void downloadSectionStill(sectionId);
      });

      row.append(button, downloadButton);
      els.sectionList.appendChild(row);
    }
    renderImageExportStatus();
  }

  function isTextLayer(layer) {
    return layer?.kind === 'text';
  }

  function isSpriteLayer(layer) {
    return layer?.kind === 'sprite' && typeof layer.src === 'string';
  }

  function isArrowLayer(layer) {
    if (!isSpriteLayer(layer)) return false;
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    return fingerprint.includes('/arrow_indicators/') || /arrow indicator/.test(fingerprint);
  }

  function isSectionIndicatorLayer(layer) {
    if (!isSpriteLayer(layer)) return false;
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    return fingerprint.includes('/ui/section_indicator/') || /section indicator/.test(fingerprint);
  }

  function isMacroFillLayer(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return isSpriteLayer(layer) && /(macro_bar_fill|bar_fill|macro bar fill)/.test(fingerprint);
  }

  function isMicrosBarSpriteLayer(layer) {
    const src = String(layer?.src || '').toLowerCase();
    return isSpriteLayer(layer) && src.includes('/micros_section/bars/');
  }

  function microsDvBarPercent(layer) {
    const src = String(layer?.src || '').toLowerCase();
    const match = src.match(/\/(\d+)(?:%25|%)_bar\./);
    return match ? Number(match[1]) : null;
  }

  function isMicrosDvBarSpriteLayer(layer) {
    return isMicrosBarSpriteLayer(layer) && microsDvBarPercent(layer) != null;
  }

  function isMicroBarTextboxLayer(layer) {
    if (!isTextLayer(layer)) return false;
    const id = String(layer.id || '').toLowerCase();
    return /^(vitamins|minerals)_bar_percent_c\d+_\d+$/.test(id)
      || layer.microBarTextbox === true;
  }

  function isLegacyMicronutrientPercentLayer(layer, sectionId) {
    if (!isTextLayer(layer)) return false;
    return new RegExp(`^${sectionId}_percent_\\d+$`).test(String(layer.id || ''));
  }

  function contextLayerIndex(layer, sectionId, kind) {
    const match = String(layer?.id || '').match(new RegExp(`^${sectionId}_${kind}_(\\d+)$`));
    return match ? Number(match[1]) - 1 : null;
  }

  function isContextItemTextLayer(layer) {
    return isTextLayer(layer) && /^(pros|cons)_item_\d+$/.test(String(layer.id || ''));
  }

  function microBarTextboxPercent(layer) {
    const match = String(layer?.id || '').match(/_bar_percent_c\d+_(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  function microBarTextboxId(sectionId, columnIndex, percent) {
    return `${sectionId}_bar_percent_c${columnIndex + 1}_${percent}`;
  }

  function microBarTextboxColumnIndex(layer, sectionId) {
    const match = String(layer?.id || '').match(new RegExp(`^${sectionId}_bar_percent_c(\\d+)_\\d+$`));
    return match ? Number(match[1]) - 1 : null;
  }

  function microBarTextboxFrame(barLayer) {
    const barWidth = Number(barLayer?.width) || MICRO_BAR_TEXTBOX_WIDTH;
    return {
      x: Math.round((Number(barLayer?.x) || 0) + ((barWidth - MICRO_BAR_TEXTBOX_WIDTH) / 2)),
      y: clamp(Math.round((Number(barLayer?.y) || 0) - 1), 44, 220),
      width: MICRO_BAR_TEXTBOX_WIDTH
    };
  }

  function createRenderMicroBarTextbox(sectionId, columnIndex, item) {
    const percent = item.percent;
    const frame = microBarTextboxFrame(item.layer);
    return {
      id: microBarTextboxId(sectionId, columnIndex, percent),
      kind: 'text',
      label: `${SECTION_LABELS[sectionId] || sectionId} ${percent}% bar textbox ${columnIndex + 1}`,
      x: frame.x,
      y: frame.y,
      z: (Number(item.layer?.z) || 0) + 5,
      visible: false,
      text: '',
      fontSize: MICRO_BAR_TEXTBOX_FONT_SIZE,
      width: frame.width,
      textBoxHeight: Math.ceil(MICRO_BAR_TEXTBOX_FONT_SIZE * TEXT_LAYER_LINE_HEIGHT),
      align: 'center',
      manualText: true,
      layoutBuilderManualText: true,
      microBarTextbox: true,
      textStrokeWidth: MICRO_BAR_TEXTBOX_STROKE_WIDTH,
      generatedForDisplayV2: true
    };
  }

  function ensureRenderMicroBarTextboxes(sectionLayers, sectionId, columns) {
    const created = [];
    columns.forEach((column, columnIndex) => {
      column.items.forEach(item => {
        const id = microBarTextboxId(sectionId, columnIndex, item.percent);
        if (sectionLayers.some(layer => String(layer.id || '') === id)) return;
        const layer = createRenderMicroBarTextbox(sectionId, columnIndex, item);
        sectionLayers.push(layer);
        created.push(layer.id);
      });
    });
    return created;
  }

  function micronutrientSpecs(sectionId) {
    return BINDINGS.micronutrientSpecs?.[sectionId] || [];
  }

  function macroBarLayerSection(layer, fallbackSectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (fingerprint.includes('section_1_fats') || /\bfat(?:s)?[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'fats';
    if (fingerprint.includes('section_2_carbs') || /\bcarb(?:s)?[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'carbs';
    if (fingerprint.includes('section_3_protein') || /\bprotein[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'protein';
    return MACRO_SECTIONS.includes(fallbackSectionId) ? fallbackSectionId : '';
  }

  function normalizeQuarterRotation(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return ((Math.round(number / 90) * 90) % 360 + 360) % 360;
  }

  function getSectionLayers(layout, sectionId) {
    const normalizedSectionId = normalizeDisplaySectionId(sectionId);
    const layers = layout?.sections?.[normalizedSectionId]?.layers;
    return Array.isArray(layers) ? layers : [];
  }

  function sectionIndicatorLayerIndex(layout, sectionId, layer) {
    const indicators = getSectionLayers(layout, sectionId)
      .filter(isSectionIndicatorLayer)
      .sort((a, b) => (Number(a.x) || 0) - (Number(b.x) || 0) || (Number(a.y) || 0) - (Number(b.y) || 0));
    return indicators.findIndex(item => item === layer || (item.id && item.id === layer.id));
  }

  function sectionIndicatorSrcForLayer(layout, sectionId, layer, food) {
    const layerIndex = sectionIndicatorLayerIndex(layout, sectionId, layer);
    const activeIndex = DISPLAY_SECTIONS.indexOf(sectionId);
    return LOGIC.sectionIndicatorSpritePath(food, layerIndex >= 0 && layerIndex === activeIndex);
  }

  function layerRight(layer) {
    return (Number(layer?.x) || 0) + (Number(layer?.width) || 0);
  }

  function layerCenterX(layer) {
    return (Number(layer?.x) || 0) + ((Number(layer?.width) || 0) / 2);
  }

  function getMicrosDvBarColumns(sectionLayers) {
    const columns = [];
    const barItems = sectionLayers
      .filter(isMicrosDvBarSpriteLayer)
      .map(layer => ({
        layer,
        percent: microsDvBarPercent(layer),
        centerX: layerCenterX(layer)
      }))
      .sort((a, b) => a.centerX - b.centerX || a.percent - b.percent);

    for (const item of barItems) {
      const column = columns.find(candidate => Math.abs(candidate.centerX - item.centerX) <= 4);
      if (column) {
        column.items.push(item);
        column.centerX = column.items.reduce((sum, current) => sum + current.centerX, 0) / column.items.length;
      } else {
        columns.push({ centerX: item.centerX, items: [item] });
      }
    }

    return columns
      .map(column => ({
        ...column,
        items: column.items.sort((a, b) => a.percent - b.percent)
      }))
      .sort((a, b) => a.centerX - b.centerX);
  }

  function nearestMicrosDvBarColumn(columns, layer, fallbackIndex) {
    if (!columns.length) return null;
    const targetX = layer ? layerCenterX(layer) : null;
    if (targetX == null) return columns[fallbackIndex] || columns[0];
    return columns.reduce((closest, column) => {
      return Math.abs(column.centerX - targetX) < Math.abs(closest.centerX - targetX) ? column : closest;
    }, columns[0]);
  }

  function microsDvBarColumnIndex(columns, column, fallbackIndex) {
    const index = columns.indexOf(column);
    return index >= 0 ? index : fallbackIndex;
  }

  function micronutrientBarStep(value) {
    const safe = asNumber(value, null);
    if (safe == null || safe <= 0) return null;
    return clamp(Math.max(1, Math.floor(safe / 10)), 1, 10);
  }

  function formatMicronutrientPercent(food, metricKey) {
    const value = asNumber(food?.metrics?.[metricKey], null);
    return value == null || value <= 0 ? 'N/A' : `${LOGIC.formatCompactNumber(value, 0)}%`;
  }

  function isSectionSeparatorLayer(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes('/ui/section_separator/') || fingerprint.includes('section separator');
  }

  function isMainMacroBarLayer(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes(`${sectionId}_macro_bar_frame`)
      || fingerprint.includes(`${sectionId}_macro_bar_fill`)
      || fingerprint.includes('macro bar frame')
      || fingerprint.includes('macro bar fill');
  }

  function alignedWidthForLayers(sectionId, layers) {
    const separators = layers.filter(isSectionSeparatorLayer);
    const macroBars = layers.filter(layer => isMainMacroBarLayer(layer, sectionId));
    if (!separators.length || !macroBars.length) return null;

    const separatorLeft = Math.min(...separators.map(layer => Number(layer.x) || 0));
    const macroBarRight = Math.max(...macroBars.map(layerRight));
    const width = separatorLeft + macroBarRight;
    return Number.isFinite(width) && width > 0 ? width : null;
  }

  function macroReferenceCanvasGridWidth(layout, fallbackWidth) {
    const widths = MACRO_SECTIONS
      .map(sectionId => alignedWidthForLayers(sectionId, getSectionLayers(layout, sectionId)))
      .filter(width => Number.isFinite(width) && width > 0);
    if (!widths.length) return fallbackWidth;
    return Math.min(fallbackWidth, Math.max(...widths));
  }

  function applyLayoutBuilderCanvasMetrics(layout) {
    const authorGrid = LOGIC.AUTHOR_GRID;
    const gridWidth = macroReferenceCanvasGridWidth(layout, authorGrid.width);
    const gridHeight = gridWidth * (authorGrid.height / authorGrid.width);
    const referencePixelUnit = LAYOUT_BUILDER_REFERENCE_DISPLAY_WIDTH / authorGrid.width;
    const displayWidth = gridWidth * referencePixelUnit * LAYOUT_BUILDER_CANVAS_VIEW_ZOOM;
    const displayHeight = gridHeight * referencePixelUnit * LAYOUT_BUILDER_CANVAS_VIEW_ZOOM;
    state.canvasMetrics = { gridWidth, gridHeight, displayWidth, displayHeight };
    els.canvasWrap?.style.setProperty('--layout-builder-canvas-view-width', `${displayWidth.toFixed(3)}px`);
    els.displayCanvas.style.setProperty('--layout-builder-canvas-grid-width', String(gridWidth));
    els.displayCanvas.style.setProperty('--layout-builder-canvas-grid-height', String(gridHeight));
    els.displayCanvas.style.aspectRatio = `${gridWidth} / ${gridHeight}`;
  }

  function displayBuilderVisibleGridBounds(layout) {
    const authorGrid = LOGIC.AUTHOR_GRID;
    const gridWidth = macroReferenceCanvasGridWidth(layout, authorGrid.width);
    const gridHeight = gridWidth * (authorGrid.height / authorGrid.width);
    return {
      left: 0,
      top: 0,
      right: gridWidth,
      bottom: gridHeight
    };
  }

  function displayBuilderGridCenter(layout) {
    const visible = displayBuilderVisibleGridBounds(layout);
    return {
      x: (visible.left + visible.right) / 2,
      y: (visible.top + visible.bottom) / 2
    };
  }

  function introStaticStampLayers(layout, food) {
    const center = displayBuilderGridCenter(layout);
    const rankedSize = INTRO_HERO_SIZE.ranked;
    const ranked = {
      x: roundedLayoutNumber(center.x - (rankedSize * INTRO_RANKED_VISIBLE_CENTER.x)),
      y: roundedLayoutNumber(center.y - (rankedSize * INTRO_RANKED_VISIBLE_CENTER.y)),
      width: rankedSize,
      height: rankedSize
    };
    const foodCandidates = LOGIC.foodSpriteCandidates(food);
    const foodGeometry = LOGIC.foodImageLayerGeometry?.(food) || {};
    return [
      {
        id: 'intro_ranked_sprite',
        kind: 'sprite',
        label: 'Hook ranked sprite',
        src: INTRO_RANKED_SPRITE_PATH,
        x: ranked.x,
        y: ranked.y,
        z: 55,
        width: ranked.width,
        height: ranked.height,
        visible: true,
        preserveAspect: true,
        aspectRatio: 1
      },
      {
        id: 'intro_food_hero',
        kind: 'sprite',
        label: 'Hook food image',
        src: foodCandidates.primary,
        fallbackSrc: foodCandidates.fallback,
        x: roundedLayoutNumber(ranked.x + 16),
        y: roundedLayoutNumber(ranked.y + 20.75),
        z: 56,
        width: INTRO_HERO_SIZE.foodWidth,
        height: INTRO_HERO_SIZE.foodHeight,
        naturalWidth: foodGeometry.naturalWidth || null,
        naturalHeight: foodGeometry.naturalHeight || null,
        visible: true,
        foodDriven: true,
        preserveAspect: true,
        aspectRatio: foodGeometry.naturalHeight ? foodGeometry.naturalWidth / foodGeometry.naturalHeight : null
      }
    ];
  }

  function scoreTier(food) {
    return food?.episode?.tier || food?.batchResult?.tier || food?.tier || food?.expectedTier || '';
  }

  function normalizedTier(value) {
    const normalized = String(value || '').trim().toUpperCase();
    const match = normalized.match(/^([SABCD])(?:\s*TIER)?\.?$/);
    const tier = match?.[1] || '';
    return OUTRO_TIER_SPRITE_PATHS[tier] ? tier : '';
  }

  function outroTierForFood(food) {
    return normalizedTier(scoreTier(food));
  }

  function outroTierSpritePath(tier) {
    return OUTRO_TIER_SPRITE_PATHS[normalizedTier(tier)] || '';
  }

  function outroTierStampLabel(tier) {
    const normalized = normalizedTier(tier);
    return normalized ? `${normalized} tier verdict stamp` : 'Tier verdict stamp';
  }

  function outroStaticStampLayers(layout, food) {
    const center = displayBuilderGridCenter(layout);
    const tier = outroTierForFood(food);
    const tierSrc = outroTierSpritePath(tier);
    const displayTierSrc = tierSrc || OUTRO_TIER_SPRITE_PATHS.D;
    const ctaStepX = OUTRO_CTA_STAMP_SIZE + OUTRO_CTA_STAMP_GAP_X;
    const tierLayer = {
      id: 'outro_tier_stamp',
      kind: 'sprite',
      label: outroTierStampLabel(tier),
      src: displayTierSrc,
      x: roundedLayoutNumber(center.x - (OUTRO_TIER_STAMP_SIZE / 2)),
      y: roundedLayoutNumber(center.y - (OUTRO_TIER_STAMP_SIZE / 2)),
      z: 38,
      width: OUTRO_TIER_STAMP_SIZE,
      height: OUTRO_TIER_STAMP_SIZE,
      visible: Boolean(tierSrc),
      preserveAspect: true,
      aspectRatio: 1,
      tier,
      stampRole: 'tier'
    };
    return [
      tierLayer,
      { id: 'outro_like_stamp', label: 'Like stamp', src: OUTRO_LIKE_SPRITE_PATH, centerOffsetX: -ctaStepX },
      { id: 'outro_follow_stamp', label: 'Follow stamp', src: OUTRO_FOLLOW_SPRITE_PATH, centerOffsetX: 0 },
      { id: 'outro_share_stamp', label: 'Share stamp', src: OUTRO_SHARE_SPRITE_PATH, centerOffsetX: ctaStepX }
    ].map((spec, index) => {
      if (index === 0) return spec;
      return {
        id: spec.id,
        kind: 'sprite',
        label: spec.label,
        src: spec.src,
        x: roundedLayoutNumber(center.x + spec.centerOffsetX - (OUTRO_CTA_STAMP_SIZE / 2)),
        y: roundedLayoutNumber(center.y + OUTRO_CTA_STAMP_CENTER_Y - (OUTRO_CTA_STAMP_SIZE / 2)),
        z: 38 + index,
        width: OUTRO_CTA_STAMP_SIZE,
        height: OUTRO_CTA_STAMP_SIZE,
        visible: Boolean(tierSrc),
        preserveAspect: true,
        aspectRatio: 1,
        tier,
        stampRole: 'cta'
      };
    });
  }

  function applyStaticStampLayerSpec(layer, spec, isNewLayer) {
    layer.kind = spec.kind;
    layer.label = spec.label;
    layer.src = spec.src;
    if (Object.prototype.hasOwnProperty.call(spec, 'fallbackSrc')) layer.fallbackSrc = spec.fallbackSrc;
    layer.visible = spec.visible;
    layer.preserveAspect = spec.preserveAspect;
    layer.aspectRatio = spec.aspectRatio;
    layer.width = spec.width;
    layer.height = spec.height;
    layer.foodDriven = Boolean(spec.foodDriven);
    layer[DBV2_STATIC_STAMP_LAYER_FLAG] = true;
    if (Object.prototype.hasOwnProperty.call(spec, 'naturalWidth')) layer.naturalWidth = spec.naturalWidth;
    if (Object.prototype.hasOwnProperty.call(spec, 'naturalHeight')) layer.naturalHeight = spec.naturalHeight;
    if (Object.prototype.hasOwnProperty.call(spec, 'tier')) layer.tier = spec.tier;
    if (Object.prototype.hasOwnProperty.call(spec, 'stampRole')) layer.stampRole = spec.stampRole;
    if (isNewLayer || !Number.isFinite(Number(layer.x))) layer.x = spec.x;
    if (isNewLayer || !Number.isFinite(Number(layer.y))) layer.y = spec.y;
    if (isNewLayer || !Number.isFinite(Number(layer.z))) layer.z = spec.z;
  }

  function upsertStaticStampLayers(layout, sectionId, specs) {
    const layers = getSectionLayers(layout, sectionId);
    specs.forEach(spec => {
      let layer = layers.find(item => item.id === spec.id);
      const isNewLayer = !layer;
      if (!layer) {
        layer = { id: spec.id };
        layers.push(layer);
      }
      applyStaticStampLayerSpec(layer, spec, isNewLayer);
    });
  }

  function syncStaticIntroOutroStampSprites(layout, food) {
    upsertStaticStampLayers(layout, 'intro', introStaticStampLayers(layout, food));
    upsertStaticStampLayers(layout, 'outro', outroStaticStampLayers(layout, food));
  }

  function cloneLayoutForRender(option) {
    const base = normalizeLayoutSections(LOGIC.clone(option?.layout || {}));
    base.canvas = {
      width: LOGIC.AUTHOR_GRID.width,
      height: LOGIC.AUTHOR_GRID.height,
      ...(base.canvas || {})
    };
    base.selectedSectionId = state.selectedSectionId;
    base.selectedFoodId = state.selectedFoodId;
    base.sections = base.sections || {};
    for (const sectionId of DISPLAY_SECTIONS) {
      if (!base.sections[sectionId]) base.sections[sectionId] = { layers: [] };
      if (!Array.isArray(base.sections[sectionId].layers)) base.sections[sectionId].layers = [];
    }
    return base;
  }

  function syncFoodSprites(layout, food) {
    const imageCandidates = LOGIC.foodSpriteCandidates(food);
    for (const sectionId of Object.keys(layout.sections || {})) {
      for (const layer of getSectionLayers(layout, sectionId)) {
        if (!isSpriteLayer(layer)) continue;
        const src = String(layer.src || '').toLowerCase();
        const label = String(layer.label || '').toLowerCase().replace(/^library:\s*/, '');
        if (src.includes('/header/food_type_plate/') || /header food type/.test(label)) {
          layer.src = LOGIC.headerFoodTypeSpritePath(food);
        } else if (src.includes('/header/calorie_bubble/') || /header calorie bubble/.test(label)) {
          layer.src = LOGIC.headerCalorieBubbleSpritePath(food);
        } else if (isHeaderFoodImageLayer(layer)) {
          layer.src = imageCandidates.primary;
          layer.fallbackSrc = imageCandidates.fallback;
          LOGIC.syncFoodImageLayerGeometry?.(layer, food);
        } else if (src.includes('/header/food_plate/') || src.includes('/header/food_image_plate/') || /header food image plate/.test(label)) {
          layer.src = LOGIC.headerFoodPlateSpritePath(food);
        } else if (src.includes('/ui/section_separator/') || /^section separator$/.test(label)) {
          layer.src = LOGIC.sectionSeparatorSpritePath(food);
        } else if (isSectionIndicatorLayer(layer)) {
          layer.src = sectionIndicatorSrcForLayer(layout, sectionId, layer, food);
        }
      }
    }
  }

  function syncFoodText(layout, food) {
    const values = {
      kcal_value_text: String(food?.header?.kcal ?? food?.kcal ?? 'N/A'),
      basis_text: LOGIC.formatBasis(food),
      script_caption: LOGIC.foodTypeTitle(food?.foodType),
      outro_score_value: formatScoreTally(food)
    };
    for (const sectionId of Object.keys(layout.sections || {})) {
      for (const layer of getSectionLayers(layout, sectionId)) {
        if (!isTextLayer(layer)) continue;
        if (layer.id === 'food_name_text') {
          layer.text = headerFoodNameText(food, layer);
          continue;
        }
        if (layer.id in values) {
          layer.text = values[layer.id];
          continue;
        }
      }
    }
  }

  function scoreTally(food) {
    const candidates = [
      food?.episode?.rankingScore,
      food?.batchResult?.rankingScore,
      food?.rankingScore,
      food?.episode?.rankingScoreExact,
      food?.batchResult?.rankingScoreExact,
      food?.rankingScoreExact,
      food?.episode?.anomalyAdjustedScore,
      food?.batchResult?.anomalyAdjustedScore,
      food?.anomalyAdjustedScore,
      food?.episode?.anomalyAdjustedScoreExact,
      food?.batchResult?.anomalyAdjustedScoreExact,
      food?.anomalyAdjustedScoreExact,
      food?.episode?.calibratedOverallScore,
      food?.batchResult?.calibratedOverallScore,
      food?.calibratedOverallScore,
      food?.episode?.overallScore,
      food?.batchResult?.overallScore,
      food?.overallScore
    ];
    for (const candidate of candidates) {
      const score = asNumber(candidate, null);
      if (score != null) return score;
    }
    return null;
  }

  function formatScoreTally(food) {
    const score = scoreTally(food);
    return score == null ? 'N/A' : LOGIC.formatCompactNumber(score, 0);
  }

  function headerFoodNameText(food, layer) {
    const fit = window.FOODRANKED_DISPLAY_NAME_UTILS?.fitFoodNameForHeader?.(food, layer);
    if (fit) {
      layer.autoFontSize = fit.fontSize;
      return fit.text;
    }
    delete layer.autoFontSize;
    return String(food?.name || 'Unknown').toUpperCase();
  }

  function syncMacroFills(layout, food) {
    for (const sectionId of MACRO_SECTIONS) {
      for (const layer of getSectionLayers(layout, sectionId)) {
        if (!isMacroFillLayer(layer)) continue;
        const layerSection = macroBarLayerSection(layer, sectionId) || sectionId;
        const fill = LOGIC.macroFillEvaluation(food, layerSection);
        layer.fillRatio = fill.fillRatio;
        layer.fillRange = [fill.min, fill.max];
        layer.fillValue = fill.rawValue;
        layer.visible = fill.fillRatio > 0.001;
      }
    }
  }

  function proteinSubmacroTextLayerInfo(layer) {
    const match = String(layer?.id || '').match(/^protein_submacro_(label|value)_(\d+)$/i);
    if (!match) return null;
    return { kind: match[1].toLowerCase(), index: Number(match[2]) - 1 };
  }

  function proteinTextBinding(layer, food) {
    const info = proteinSubmacroTextLayerInfo(layer);
    if (!info) return null;
    const row = LOGIC.metricRowsForSection(food, 'protein')[info.index];
    if (!row) return null;
    if (info.kind === 'label') {
      return { kind: 'metricLabel', metricKey: row.metricKey, label: row.label, source: 'generated protein scoring breakdown' };
    }
    return row.valueBinding || null;
  }

  function isProteinScoreCardLayer(layer) {
    if (!isSpriteLayer(layer)) return false;
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    return fingerprint.includes('protein_submacro_bullet') || fingerprint.includes('protein score card');
  }

  function syncProteinRows(layout, food) {
    const rows = LOGIC.metricRowsForSection(food, 'protein');
    const layers = getSectionLayers(layout, 'protein');
    for (const layer of layers) {
      const info = proteinSubmacroTextLayerInfo(layer);
      if (info) layer.visible = info.index < rows.length;
    }
    layers
      .filter(isProteinScoreCardLayer)
      .sort((a, b) => (Number(a.y) || 0) - (Number(b.y) || 0) || (Number(a.x) || 0) - (Number(b.x) || 0))
      .forEach((layer, index) => {
        layer.visible = index < rows.length;
      });
  }

  function microTextboxesForColumn(layers, sectionId, columnIndex) {
    return layers
      .filter(layer => isMicroBarTextboxLayer(layer))
      .filter(layer => {
        const idColumnIndex = microBarTextboxColumnIndex(layer, sectionId);
        return idColumnIndex == null ? false : idColumnIndex === columnIndex;
      })
      .sort((a, b) => (microBarTextboxPercent(a) || 0) - (microBarTextboxPercent(b) || 0));
  }

  function chooseMicroTextboxForPercent(candidates, targetPercent) {
    if (!candidates.length) return null;
    return candidates.find(layer => microBarTextboxPercent(layer) === targetPercent)
      || candidates.reduce((closest, layer) => {
        return Math.abs((microBarTextboxPercent(layer) || 0) - targetPercent) < Math.abs((microBarTextboxPercent(closest) || 0) - targetPercent)
          ? layer
          : closest;
      }, candidates[0]);
  }

  function applyMicronutrientTextLayer(layer, text, sectionId, spec, index, mode) {
    if (!layer) return null;
    const before = layer.text;
    layer.text = text;
    layer.visible = true;
    delete layer.textGlowColor;
    return {
      sectionId,
      layerId: layer.id || '',
      bindingMode: mode,
      boundFoodDataField: `metrics.${spec.key}`,
      metricKey: spec.key,
      previousText: before,
      resolvedValue: text,
      fitsBox: null,
      overflowWarning: null,
      unbound: false,
      fallbackIndex: index
    };
  }

  function syncMicronutrientSection(layout, food, sectionId) {
    const specs = micronutrientSpecs(sectionId);
    const sectionLayers = getSectionLayers(layout, sectionId);
    const textReport = [];
    const barReport = [];
    if (!specs.length || !sectionLayers.length) return { text: textReport, bars: barReport };

    const columns = getMicrosDvBarColumns(sectionLayers).slice(0, specs.length);
    if (!columns.length) {
      state.bindingReport.warnings.push({ type: 'micronutrient', sectionId, message: 'No micronutrient DV bar columns found in selected layout section.' });
    }
    const generatedTextboxIds = ensureRenderMicroBarTextboxes(sectionLayers, sectionId, columns);
    if (generatedTextboxIds.length) {
      state.bindingReport.warnings.push({
        type: 'micronutrient-layout',
        sectionId,
        message: 'Generated missing per-bar micronutrient value textboxes in the Display Builder v2 render clone. Open Layout Builder once to migrate/save this layout natively.',
        generatedTextboxCount: generatedTextboxIds.length,
        generatedTextboxIds
      });
    }

    sectionLayers
      .filter(layer => isMicrosDvBarSpriteLayer(layer))
      .forEach(layer => { layer.visible = false; });

    sectionLayers
      .filter(layer => {
        const id = String(layer.id || '');
        return (isMicroBarTextboxLayer(layer) && id.startsWith(`${sectionId}_`))
          || isLegacyMicronutrientPercentLayer(layer, sectionId);
      })
      .forEach(layer => {
        layer.visible = false;
        delete layer.textGlowColor;
      });

    specs.forEach((spec, index) => {
      const labelLayer = sectionLayers.find(layer => layer.id === `${sectionId}_label_${index + 1}`);
      const valueLayer = sectionLayers.find(layer => layer.id === `${sectionId}_percent_${index + 1}`);
      if (labelLayer) {
        const preserveManualLabel = labelLayer.manualText === true || labelLayer.layoutBuilderManualText === true;
        if (!preserveManualLabel) labelLayer.text = spec.shortLabel;
        labelLayer.visible = true;
      }

      const column = nearestMicrosDvBarColumn(columns, valueLayer || labelLayer, index);
      const columnIndex = column ? microsDvBarColumnIndex(columns, column, index) : index;
      const rawValue = asNumber(food?.metrics?.[spec.key], null);
      const visibleStep = micronutrientBarStep(rawValue);
      const visiblePercent = visibleStep == null ? 0 : visibleStep * 10;
      const anchorPercent = visibleStep == null ? 10 : visiblePercent;
      const formattedValue = formatMicronutrientPercent(food || {}, spec.key);
      let activeTextLayer = null;
      let shownPercents = [];

      if (column) {
        column.items.forEach(item => {
          item.layer.visible = visibleStep != null && item.percent <= visiblePercent;
        });
        shownPercents = column.items.filter(item => item.layer.visible !== false).map(item => item.percent);

        const candidates = microTextboxesForColumn(sectionLayers, sectionId, columnIndex);
        activeTextLayer = chooseMicroTextboxForPercent(candidates, anchorPercent);
        candidates.forEach(layer => { layer.visible = layer === activeTextLayer; });
      }

      if (activeTextLayer) {
        if (valueLayer) valueLayer.visible = false;
        const report = applyMicronutrientTextLayer(activeTextLayer, formattedValue, sectionId, spec, index, 'micronutrient bar textbox');
        if (report) textReport.push(report);
      } else if (valueLayer) {
        valueLayer.visible = true;
        const report = applyMicronutrientTextLayer(valueLayer, formattedValue, sectionId, spec, index, 'legacy micronutrient percent layer');
        if (report) textReport.push(report);
      }

      barReport.push({
        sectionId,
        metricKey: spec.key,
        label: spec.label || spec.shortLabel,
        rawValue,
        formattedValue,
        visibleStep,
        visiblePercent,
        anchorPercent,
        shownBarPercents: shownPercents,
        matchedColumnIndex: columnIndex + 1,
        matchedColumnCenterX: column?.centerX ?? null,
        anchorLayerId: (valueLayer || labelLayer)?.id || '',
        activeTextLayerId: activeTextLayer?.id || valueLayer?.id || '',
        activeTextLayerSource: activeTextLayer?.generatedForDisplayV2
          ? 'display-builder-v2 render fallback'
          : activeTextLayer
            ? 'layout-builder per-bar textbox'
            : valueLayer
              ? 'legacy micronutrient percent layer'
              : '',
        source: 'metrics DV% -> floor(DV% / 10), capped at 10 visible bars'
      });
    });

    return { text: textReport, bars: barReport };
  }

  function syncMicronutrients(layout, food) {
    return MICRONUTRIENT_SECTIONS.reduce((report, sectionId) => {
      const sectionReport = syncMicronutrientSection(layout, food, sectionId);
      report.text.push(...sectionReport.text);
      report.bars.push(...sectionReport.bars);
      return report;
    }, { text: [], bars: [] });
  }

  function ensureContextItemTextBox(layer) {
    if (!isContextItemTextLayer(layer)) return;
    const fontSize = Number(layer.fontSize) || 5;
    const minimumHeight = Math.ceil(fontSize * TEXT_LAYER_LINE_HEIGHT * CONTEXT_ITEM_TEXTBOX_LINES);
    const currentHeight = Number(layer.textBoxHeight);
    if (!Number.isFinite(currentHeight) || currentHeight < minimumHeight) {
      layer.textBoxHeight = minimumHeight;
    }
    layer.contextItemTextbox = true;
  }

  function applyContextTextLayer(layer, text, sectionId, item, index, kind) {
    const layerId = `${sectionId}_${kind}_${index + 1}`;
    const dataField = `contextItems.${sectionId}[${index}].${kind === 'impact' ? 'impactLevel' : 'title'}`;
    if (!layer) {
      state.bindingReport.warnings.push({
        type: 'context-layout',
        sectionId,
        layerId,
        contextIndex: index + 1,
        message: `Missing ${layerId} text layer in the selected layout section.`
      });
      return null;
    }

    const before = layer.text;
    layer.text = safeDisplayText(text);
    layer.visible = true;
    delete layer.textGlowColor;
    if (kind === 'item') {
      ensureContextItemTextBox(layer);
      layer.align = layer.align || 'left';
    } else {
      layer.align = layer.align || 'center';
    }

    return {
      sectionId,
      layerId: layer.id || '',
      bindingMode: 'stable context item id',
      boundFoodDataField: dataField,
      metricKey: null,
      contextKind: kind,
      contextIndex: index + 1,
      itemKey: item?.itemKey || null,
      impactLevel: item?.impactLevel || null,
      previousText: before,
      resolvedValue: layer.text,
      fitsBox: null,
      overflowWarning: null,
      unbound: false,
      fallbackIndex: null
    };
  }

  function syncContextSection(layout, food, sectionId) {
    const sectionLayers = getSectionLayers(layout, sectionId);
    const textReport = [];
    const itemReport = [];
    if (!sectionLayers.length) return { text: textReport, items: itemReport };

    const items = LOGIC.contextItemsForSection(food || {}, sectionId);
    for (let index = 0; index < CONTEXT_ITEM_COUNT; index += 1) {
      const item = items[index] || null;
      if (!item) {
        state.bindingReport.warnings.push({
          type: 'context-data',
          sectionId,
          contextIndex: index + 1,
          message: `Missing ${sectionId} context item ${index + 1} for the selected food.`
        });
      }

      const impactLayer = sectionLayers.find(layer => contextLayerIndex(layer, sectionId, 'impact') === index);
      const itemLayer = sectionLayers.find(layer => contextLayerIndex(layer, sectionId, 'item') === index);
      const impactText = item ? LOGIC.formatImpactLevelLabel(item.impactLevel) : 'N/A';
      const itemText = item?.title || 'N/A';
      const impactReport = applyContextTextLayer(impactLayer, impactText, sectionId, item, index, 'impact');
      const titleReport = applyContextTextLayer(itemLayer, itemText, sectionId, item, index, 'item');
      if (impactReport) textReport.push(impactReport);
      if (titleReport) textReport.push(titleReport);

      itemReport.push({
        sectionId,
        contextIndex: index + 1,
        itemKey: item?.itemKey || null,
        impactLevel: item?.impactLevel || null,
        impactLabel: impactText,
        title: safeDisplayText(itemText),
        impactLayerId: impactLayer?.id || '',
        itemLayerId: itemLayer?.id || '',
        missingData: !item,
        source: `food.contextItems.${sectionId}[${index}]`
      });
    }

    return { text: textReport, items: itemReport };
  }

  function syncContextSections(layout, food) {
    return CONTEXT_SECTIONS.reduce((report, sectionId) => {
      const sectionReport = syncContextSection(layout, food, sectionId);
      report.text.push(...sectionReport.text);
      report.items.push(...sectionReport.items);
      return report;
    }, { text: [], items: [] });
  }

  function directTextBinding(sectionId, layer, food) {
    if (sectionId === 'protein') {
      const dynamic = proteinTextBinding(layer, food);
      if (dynamic) return dynamic;
    }
    return BINDINGS.textBindings?.[sectionId]?.[layer.id] || null;
  }

  function textFallbackBinding(sectionId, fallbackIndex, food) {
    if (sectionId === 'protein') {
      const row = LOGIC.metricRowsForSection(food, 'protein')[fallbackIndex];
      return row?.valueBinding || null;
    }
    const fallbackId = BINDINGS.textFallbackOrder?.[sectionId]?.[fallbackIndex];
    return fallbackId ? BINDINGS.textBindings?.[sectionId]?.[fallbackId] || null : null;
  }

  function shouldResolveKnownBinding(layer, binding) {
    if (!binding) return false;
    if (String(layer.text || '').trim() === '?') return true;
    if (binding.kind === 'metricLabel' || binding.kind === 'staticLabel') return false;
    return ['macroTotal', 'metricValue', 'ratioMetricValue'].includes(binding.kind);
  }

  function resolveTextBindings(layout, food) {
    const report = [];
    for (const sectionId of MACRO_SECTIONS) {
      const layers = getSectionLayers(layout, sectionId);
      const exactQuestionLayers = layers
        .filter(layer => isTextLayer(layer) && String(layer.text || '').trim() === '?')
        .sort((a, b) => (Number(a.y) || 0) - (Number(b.y) || 0) || (Number(a.x) || 0) - (Number(b.x) || 0));
      const fallbackIndexes = new Map(exactQuestionLayers.map((layer, index) => [layer, index]));

      for (const layer of layers.filter(isTextLayer)) {
        if (sectionId === 'protein' && layer.visible === false && proteinSubmacroTextLayerInfo(layer)) continue;
        const isQuestion = String(layer.text || '').trim() === '?';
        const direct = directTextBinding(sectionId, layer, food);
        const fallbackIndex = fallbackIndexes.get(layer);
        const fallback = direct ? null : (isQuestion ? textFallbackBinding(sectionId, fallbackIndex, food) : null);
        const binding = direct || fallback;
        const before = layer.text;
        const resolvedValue = binding ? LOGIC.formatBindingValue(food, sectionId, binding) : null;
        const shouldResolve = direct ? shouldResolveKnownBinding(layer, binding) : !!fallback;
        if (binding && shouldResolve) layer.text = safeDisplayText(resolvedValue);
        if (binding && binding.metricKey && ['metricValue', 'ratioMetricValue'].includes(binding.kind)) {
          const metricKey = LOGIC.bindingMetricKey(food, sectionId, binding);
          const presentation = LOGIC.arrowPresentationForSpec(food, sectionId, LOGIC.specForMetric(sectionId, metricKey));
          layer.color = presentation.textColor;
        }
        if (isQuestion || (direct && shouldResolve)) {
          report.push({
            sectionId,
            layerId: layer.id || '',
            bindingMode: direct ? 'stable layer id' : fallback ? 'section visual-order fallback' : 'unbound',
            boundFoodDataField: binding?.field || binding?.kind || null,
            metricKey: binding ? LOGIC.bindingMetricKey(food, sectionId, binding) : null,
            previousText: before,
            resolvedValue: binding && shouldResolve ? safeDisplayText(resolvedValue) : before,
            fitsBox: null,
            overflowWarning: null,
            unbound: !binding,
            fallbackIndex: fallback ? fallbackIndex : null
          });
        }
      }
    }
    return report;
  }

  function clusterArrowRows(layout, sectionId) {
    const arrows = getSectionLayers(layout, sectionId)
      .filter(isArrowLayer)
      .map(layer => ({
        layer,
        x: Number(layer.x) || 0,
        y: Number(layer.y) || 0,
        width: Number(layer.width) || 0,
        height: Number(layer.height) || 0
      }))
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const rows = [];
    for (const item of arrows) {
      const centerY = item.y + ((item.height || 0) / 2);
      const row = rows.find(candidate => Math.abs(centerY - candidate.centerY) <= 9);
      if (row) {
        row.items.push(item);
        row.minY = Math.min(row.minY, item.y);
        row.maxY = Math.max(row.maxY, item.y + item.height);
        row.centerY = (row.minY + row.maxY) / 2;
      } else {
        rows.push({
          items: [item],
          minY: item.y,
          maxY: item.y + item.height,
          centerY
        });
      }
    }
    return rows
      .map(row => ({ ...row, items: row.items.sort((a, b) => a.x - b.x) }))
      .sort((a, b) => a.minY - b.minY)
      .slice(0, 4);
  }

  function arrowRowsWithSpecs(layout, sectionId, food) {
    const rows = clusterArrowRows(layout, sectionId);
    const specs = LOGIC.metricRowsForSection(food, sectionId);
    return rows.map((row, index) => {
      const fingerprint = row.items
        .map(item => `${item.layer.id || ''} ${item.layer.label || ''} ${item.layer.src || ''}`.toLowerCase())
        .join(' ');
      let spec = null;
      spec = specs.find(item => {
        if (item.metricKey === 'omega3_mg') return /omega[ _-]?3|omega3|ala/.test(fingerprint);
        if (item.metricKey === 'cholesterol_mg') return /chol|cholesterol/.test(fingerprint);
        if (item.metricKey === 'polyunsaturated_fat_g') return /poly|polyunsaturated|pufa/.test(fingerprint);
        if (item.metricKey === 'saturated_fat_g') return /sat|saturated/.test(fingerprint);
        if (item.metricKey === 'fibre_g') return /fibre|fiber/.test(fingerprint);
        if (item.metricKey === 'sugar_g') return /sugar/.test(fingerprint);
        if (item.metricKey === 'starch_g') return /starch/.test(fingerprint);
        if (item.metricKey === 'glycemic_index') return /glycemic|\bgi\b/.test(fingerprint);
        if (item.metricKey === 'collagen_g') return /collagen/.test(fingerprint);
        if (item.metricKey === 'bioavailability_percent') return /bioavail/.test(fingerprint);
        if (item.metricKey === 'nonessential_amino_acids_score') return /non[ _-]?eaa|nonessential/.test(fingerprint);
        if (item.metricKey === 'essential_amino_acids_score') return /\beaa\b|essential/.test(fingerprint);
        return false;
      }) || specs[index] || null;
      return { ...row, spec };
    });
  }

  function syncArrowRows(layout, food) {
    const report = [];
    for (const sectionId of MACRO_SECTIONS) {
      const rows = arrowRowsWithSpecs(layout, sectionId, food);
      const expectedRows = LOGIC.metricRowsForSection(food, sectionId);
      if (!rows.length && expectedRows.length) {
        state.bindingReport.warnings.push({ type: 'arrow', sectionId, message: 'No arrow rows found in selected layout section.' });
      }
      rows.forEach((row, rowIndex) => {
        const rowSpec = row.spec;
        if (!rowSpec) {
          if (sectionId === 'protein') {
            row.items.forEach(item => { item.layer.visible = false; });
            return;
          }
          row.items.forEach(item => {
            report.push(arrowReport(sectionId, item.layer, null, null, true));
          });
          return;
        }
        const spec = LOGIC.specForMetric(sectionId, rowSpec.metricKey);
        const presentation = LOGIC.arrowPresentationForSpec(food, sectionId, spec);
        const layers = row.items.map(item => item.layer);
        applyArrowPresentation(layers, presentation);
        layers.forEach(layer => {
          report.push(arrowReport(sectionId, layer, rowSpec.metricKey, presentation, false, rowIndex));
        });
      });
    }
    return report;
  }

  function applyArrowPresentation(layers, presentation) {
    const count = presentation.count || 0;
    const sorted = [...layers].sort((a, b) => (Number(a.x) || 0) - (Number(b.x) || 0));
    const multiSpriteRow = sorted.length === 1 || sorted.some(layer => /_arrow_[23]\.png(?:$|[?#])/i.test(String(layer.src || '')));
    if (multiSpriteRow) {
      sorted.forEach((layer, index) => {
        const visible = index === 0 && count > 0;
        layer.visible = visible;
        if (visible) layer.src = LOGIC.arrowSpritePath(presentation.color, count);
        layer.label = `${presentation.color === 'red' ? 'Red' : 'Green'} ${presentation.flipY ? 'down' : 'up'} ${count}-arrow indicator`;
        layer.rotation = normalizeQuarterRotation(Number(layer.rotation || layer.rotate || 0) + (presentation.flipY ? 180 : 0));
        layer.flipY = false;
      });
      return;
    }

    const visibleIndexes = LOGIC.visibleArrowIndexes(count, sorted.length);
    sorted.forEach((layer, index) => {
      layer.src = LOGIC.arrowSpritePath(presentation.color, 1);
      layer.label = `${presentation.color === 'red' ? 'Red' : 'Green'} ${presentation.flipY ? 'down' : 'up'} arrow indicator`;
      layer.visible = visibleIndexes.has(index);
      layer.rotation = normalizeQuarterRotation(Number(layer.rotation || layer.rotate || 0) + (presentation.flipY ? 180 : 0));
      layer.flipY = false;
    });
  }

  function arrowReport(sectionId, layer, metricKey, presentation, unbound, rowIndex = null) {
    return {
      sectionId,
      layerId: layer.id || '',
      boundMetric: metricKey || null,
      rowIndex,
      resolvedBand: presentation?.band || null,
      chosenSpriteFilename: layer.visible === false ? '' : LOGIC.spriteFilename(layer.src),
      appliedRotation: layer.visible === false ? null : normalizeQuarterRotation(layer.rotation || layer.rotate || 0),
      visibility: layer.visible !== false,
      unbound: !!unbound,
      source: metricKey ? 'experimental arrow row binding plus existing arrow resolver' : 'unbound'
    };
  }

  function resolveLayout(option, food) {
    state.bindingReport = { text: [], arrows: [], micronutrientBars: [], contextItems: [], warnings: [] };
    if (!option || !validLayout(option.layout)) return null;
    const layout = cloneLayoutForRender(option);
    syncFoodSprites(layout, food);
    syncFoodText(layout, food);
    syncStaticIntroOutroStampSprites(layout, food);
    applyLayoutBuilderPlacementGuide(layout, food, option.layout);
    applyLayoutBuilderFoodImagePlacement(layout, food, option.layout);
    syncStaticIntroOutroStampSprites(layout, food);
    syncMacroFills(layout, food);
    syncProteinRows(layout, food);
    const micronutrientReport = syncMicronutrients(layout, food);
    const contextReport = syncContextSections(layout, food);
    state.bindingReport.text = [
      ...resolveTextBindings(layout, food),
      ...micronutrientReport.text,
      ...contextReport.text
    ];
    state.bindingReport.micronutrientBars = micronutrientReport.bars;
    state.bindingReport.contextItems = contextReport.items;
    state.bindingReport.arrows = syncArrowRows(layout, food);
    return layout;
  }

  function safeDisplayText(value) {
    const text = String(value ?? 'N/A');
    if (/^(undefined|null|NaN|\[object Object\])$/i.test(text)) return 'N/A';
    return text;
  }

  function formatCanvasNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '0';
    return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  }

  function asNumber(value, fallback = null) {
    return LOGIC.asNumber(value, fallback);
  }

  function clamp(value, min, max) {
    return LOGIC.clamp(value, min, max);
  }

  function cubicHermite(progress, startSlope, endSlope) {
    const t = clamp(progress, 0, 1);
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * 0 + h10 * startSlope + h01 * 1 + h11 * endSlope;
  }

  function macroBarFillMotionTiming(fillRatio) {
    const ratio = clamp(asNumber(fillRatio, 1), 0.0011, 1);
    const firstSeconds = MACRO_BAR_FILL_SECONDS * ratio * 0.75;
    const tailSeconds = MACRO_BAR_FILL_SECONDS * ratio * 0.25 * MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER;
    return {
      ratio,
      firstSeconds,
      tailSeconds,
      totalSeconds: firstSeconds + tailSeconds
    };
  }

  function macroBarFillCurrentRatio(elapsedSeconds, fillRatio) {
    const timing = macroBarFillMotionTiming(fillRatio);
    const elapsed = Math.max(0, asNumber(elapsedSeconds, 0));
    if (elapsed <= timing.firstSeconds) {
      return clamp(elapsed / MACRO_BAR_FILL_SECONDS, 0, timing.ratio * 0.75);
    }
    const tailProgress = clamp((elapsed - timing.firstSeconds) / Math.max(0.001, timing.tailSeconds), 0, 1);
    const tailPosition = cubicHermite(
      tailProgress,
      MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER,
      MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER * MACRO_BAR_LAST_QUARTER_END_SPEED_RATIO
    );
    return clamp((timing.ratio * 0.75) + (timing.ratio * 0.25 * tailPosition), 0, timing.ratio);
  }

  function macroBarAnimationEndSeconds(fillRatio) {
    return MACRO_REVEAL_SECONDS
      + MACRO_BAR_START_DWELL_SECONDS
      + macroBarFillMotionTiming(fillRatio).totalSeconds
      + 0.12;
  }

  function introFocusBlurFilter(baseFilter = '') {
    const filters = [];
    if (baseFilter && baseFilter !== 'none') filters.push(baseFilter);
    filters.push(`blur(calc(${INTRO_FOCUS_BLUR_PX}px * var(--pixel-unit)))`);
    return filters.join(' ');
  }

  function shouldBlurIntroLayer(layer) {
    return state.selectedSectionId === 'intro'
      && !INTRO_FOCUS_CLEAR_LAYER_IDS.has(String(layer?.id || ''));
  }

  function applyIntroFocusBlur(node, layer) {
    if (!shouldBlurIntroLayer(layer)) return;
    node.style.filter = introFocusBlurFilter(node.style.filter || '');
    node.dataset.introFocusBlur = 'true';
  }

  function applyIntroFocusBackdropBlur(node) {
    if (state.selectedSectionId !== 'intro') return;
    node.style.filter = introFocusBlurFilter(node.style.filter || '');
    node.dataset.introFocusBlur = 'true';
  }

  function renderCanvas(layout, food) {
    els.displayCanvas.innerHTML = '';
    els.displayCanvas.style.backgroundColor = state.background.color || DEFAULT_BACKGROUND.color;
    applyLayoutBuilderCanvasMetrics(layout);
    updatePixelUnit();
    renderCanvasBackground(food);
    const animationStartMs = performance.now();
    const animationToken = renderToken.value;

    if (!layout) {
      const empty = document.createElement('div');
      empty.className = 'canvas-empty';
      empty.textContent = 'No layout-builder display layout is available.';
      els.displayCanvas.appendChild(empty);
      return;
    }

    const sectionLayers = getSectionLayers(layout, state.selectedSectionId);
    if (!sectionLayers.length) {
      const empty = document.createElement('div');
      empty.className = 'canvas-empty';
      empty.textContent = 'The selected layout does not contain this display section.';
      els.displayCanvas.appendChild(empty);
      return;
    }

    const sorted = sectionLayers
      .map((layer, originalIndex) => ({ layer, originalIndex }))
      .sort((a, b) => (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0) || a.originalIndex - b.originalIndex);

    for (const { layer } of sorted) {
      if (layer.visible === false) continue;
      const macroBarFillLayer = layer.kind === 'sprite' && isMacroFillLayer(layer);
      const node = document.createElement(macroBarFillLayer ? 'canvas' : layer.kind === 'sprite' ? 'img' : 'div');
      node.className = `layer-node ${layer.kind}${layer.kind === 'text' ? ' pixel-text' : ''}`;
      node.dataset.layerId = layer.id || '';
      node.dataset.sectionId = state.selectedSectionId;
      node.style.zIndex = String(Number(layer.z) || 0);
      node.style.left = `calc(${Number(layer.x) || 0}px * var(--pixel-unit))`;
      node.style.top = `calc(${Number(layer.y) || 0}px * var(--pixel-unit))`;

      if (macroBarFillLayer) {
        renderMacroBarFillCanvasNode(node, layer, food, animationStartMs, animationToken);
      } else if (layer.kind === 'sprite') {
        renderSpriteNode(node, layer, food);
      } else {
        renderTextNode(node, layer);
      }
      applyIntroFocusBlur(node, layer);
      els.displayCanvas.appendChild(node);
    }
  }

  function renderCanvasBackground(food) {
    const bgField = document.createElement('div');
    bgField.className = 'canvas-bg-field';
    const palette = LOGIC.backdropPalette(food);
    bgField.style.background = `radial-gradient(circle at 18% 12%, ${palette.glowA}, transparent 24%), radial-gradient(circle at 82% 16%, ${palette.glowB}, transparent 28%), linear-gradient(180deg, ${palette.top} 0%, ${palette.bottom} 100%)`;
    applyIntroFocusBackdropBlur(bgField);
    els.displayCanvas.appendChild(bgField);

    const phoneBg = document.createElement('div');
    phoneBg.className = 'phone-bg';
    applyIntroFocusBackdropBlur(phoneBg);
    els.displayCanvas.appendChild(phoneBg);
  }

  function renderImageExportStatus() {
    if (!els.sectionExportStatus) return;
    els.sectionExportStatus.textContent = state.imageExportStatus || '';
    els.sectionExportStatus.classList.toggle('warn', state.imageExportStatusTone === 'warn');
    els.sectionExportStatus.classList.toggle('ok', state.imageExportStatusTone === 'ok');
  }

  function setImageExportStatus(message, tone = '', autoClear = false) {
    state.imageExportStatus = message || '';
    state.imageExportStatusTone = tone || '';
    if (state.imageExportStatusTimer) {
      window.clearTimeout(state.imageExportStatusTimer);
      state.imageExportStatusTimer = 0;
    }
    if (autoClear && message) {
      state.imageExportStatusTimer = window.setTimeout(() => {
        state.imageExportStatus = '';
        state.imageExportStatusTone = '';
        state.imageExportStatusTimer = 0;
        renderImageExportStatus();
      }, SECTION_STILL_EXPORT_STATUS_CLEAR_MS);
    }
    renderImageExportStatus();
  }

  function exportBoundsForLayout(layout) {
    const bounds = displayBuilderVisibleGridBounds(layout);
    const gridWidth = Math.max(1, (Number(bounds.right) || 0) - (Number(bounds.left) || 0));
    const gridHeight = Math.max(1, (Number(bounds.bottom) || 0) - (Number(bounds.top) || 0));
    const scale = Math.max(1, Math.ceil(SECTION_STILL_EXPORT_MIN_OUTPUT_WIDTH / gridWidth));
    const outputWidth = Math.round(gridWidth * scale);
    const outputHeight = Math.round(gridHeight * scale);
    return {
      ...bounds,
      gridWidth,
      gridHeight,
      outputWidth,
      outputHeight,
      scale
    };
  }

  function exportLayerRect(layer, exportBounds) {
    const width = Number(layer.width || layer.naturalWidth || 1);
    const height = Number(layer.height || layer.naturalHeight || 1);
    return {
      x: ((Number(layer.x) || 0) - exportBounds.left) * exportBounds.scale,
      y: ((Number(layer.y) || 0) - exportBounds.top) * exportBounds.scale,
      width: Math.max(1, width * exportBounds.scale),
      height: Math.max(1, height * exportBounds.scale)
    };
  }

  function exportTextLayerRect(layer, exportBounds) {
    const x = Number(layer.x) || 0;
    const y = Number(layer.y) || 0;
    const width = Number(layer.width) || Math.max(1, exportBounds.right - x);
    const height = Number(layer.textBoxHeight || layer.height || defaultTextLayerHeight(layer));
    return {
      x: (x - exportBounds.left) * exportBounds.scale,
      y: (y - exportBounds.top) * exportBounds.scale,
      width: Math.max(1, width * exportBounds.scale),
      height: Math.max(1, height * exportBounds.scale)
    };
  }

  function drawExportBackdrop(ctx, food, exportBounds) {
    const { outputWidth, outputHeight, scale } = exportBounds;
    const palette = LOGIC.backdropPalette(food);
    const base = ctx.createLinearGradient(0, 0, 0, outputHeight);
    base.addColorStop(0, palette.top);
    base.addColorStop(1, palette.bottom);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    drawExportRadialGlow(ctx, outputWidth * 0.18, outputHeight * 0.12, Math.max(outputWidth, outputHeight) * 0.24, palette.glowA);
    drawExportRadialGlow(ctx, outputWidth * 0.82, outputHeight * 0.16, Math.max(outputWidth, outputHeight) * 0.28, palette.glowB);

    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,.08)';
    ctx.lineWidth = Math.max(1, scale);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, outputWidth - ctx.lineWidth, outputHeight - ctx.lineWidth);
    ctx.restore();
  }

  function drawExportRadialGlow(ctx, x, y, radius, color) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function isGifSpriteSrc(src) {
    return /\.gif(?:[?#]|$)/i.test(String(src || ''));
  }

  function isMacroSectionGifSprite(src) {
    const normalizedSrc = String(src || '').toLowerCase();
    return isGifSpriteSrc(src) && normalizedSrc.includes('/macros_section/');
  }

  function isMicronutrientSectionGifSprite(src) {
    const normalizedSrc = String(src || '').toLowerCase();
    return isGifSpriteSrc(src) && normalizedSrc.includes('/micros_section/');
  }

  function sectionStillGifFrameMode(sectionId, src) {
    if (!isGifSpriteSrc(src)) return 'final';
    const normalizedSectionId = normalizeDisplaySectionId(sectionId);
    if (MACRO_SECTIONS.includes(normalizedSectionId) || MICRONUTRIENT_SECTIONS.includes(normalizedSectionId)) return 'start';
    return isMacroSectionGifSprite(src) || isMicronutrientSectionGifSprite(src) ? 'start' : 'final';
  }

  function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  function imageNaturalSize(image) {
    const width = Number(image?.naturalWidth || image?.videoWidth || image?.width || 0);
    const height = Number(image?.naturalHeight || image?.videoHeight || image?.height || 0);
    return { width, height };
  }

  function preserveAspectExportRect(image, layer, rect) {
    if (!layer.preserveAspect || isMacroFillLayer(layer)) return rect;
    const natural = imageNaturalSize(image);
    if (isArrowLayer(layer) && natural.width > 0 && natural.height > 0) {
      const pixelScale = Math.max(1, Math.floor(Math.min(rect.width / natural.width, rect.height / natural.height)));
      const width = natural.width * pixelScale;
      const height = natural.height * pixelScale;
      return {
        x: rect.x + ((rect.width - width) / 2),
        y: rect.y + ((rect.height - height) / 2),
        width,
        height
      };
    }

    const aspectRatio = Number(layer.aspectRatio) || (natural.width > 0 && natural.height > 0 ? natural.width / natural.height : 0);
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) return rect;

    const boxAspectRatio = rect.width / rect.height;
    if (!Number.isFinite(boxAspectRatio) || boxAspectRatio <= 0) return rect;
    if (aspectRatio > boxAspectRatio) {
      const height = rect.width / aspectRatio;
      return {
        x: rect.x,
        y: rect.y + ((rect.height - height) / 2),
        width: rect.width,
        height
      };
    }

    const width = rect.height * aspectRatio;
    return {
      x: rect.x + ((rect.width - width) / 2),
      y: rect.y,
      width,
      height: rect.height
    };
  }

  async function waitForGifFrames(src, timeoutMs = SECTION_STILL_EXPORT_GIF_TIMEOUT_MS) {
    const frames = requestMacroBarGifFrames(src);
    const startedAt = performance.now();
    while (performance.now() - startedAt < timeoutMs) {
      if (frames.status === 'error') throw frames.error || new Error(`GIF failed to load: ${src}`);
      const imagesReady = frames.status === 'ready'
        && frames.images?.length
        && frames.images.every(image => image.complete && image.naturalWidth > 0);
      if (imagesReady) {
        await Promise.all(frames.images.map(image => image.decode ? image.decode().catch(() => {}) : Promise.resolve()));
        return frames;
      }
      await wait(40);
    }
    throw new Error(`GIF frames did not finish loading: ${src}`);
  }

  function drawImageWithLayerTransform(ctx, image, layer, rect, exportBounds, sectionId) {
    const drawRect = preserveAspectExportRect(image, layer, rect);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (sectionId === 'intro' && !INTRO_FOCUS_CLEAR_LAYER_IDS.has(String(layer?.id || ''))) {
      ctx.filter = `blur(${INTRO_FOCUS_BLUR_PX * exportBounds.scale}px)`;
    }

    const rotation = Number(layer.rotation ?? layer.rotate ?? 0);
    if (Number.isFinite(rotation) && rotation) {
      const centerX = rect.x + (rect.width / 2);
      const centerY = rect.y + (rect.height / 2);
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.drawImage(
        image,
        drawRect.x - centerX,
        drawRect.y - centerY,
        drawRect.width,
        drawRect.height
      );
    } else {
      ctx.drawImage(image, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
    }
    ctx.restore();
  }

  function exportImageUrl(src) {
    return new URL(src, window.location.href).href;
  }

  function loadExportImage(src) {
    const url = exportImageUrl(src);
    const cached = SECTION_STILL_EXPORT_IMAGE_CACHE.get(url);
    if (cached) return cached;
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'sync';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Image failed to load: ${src}`));
      image.src = url;
    });
    SECTION_STILL_EXPORT_IMAGE_CACHE.set(url, promise);
    return promise;
  }

  async function loadExportSpriteImage(src, fallbackSrc = '') {
    try {
      return await loadExportImage(src);
    } catch (error) {
      if (!fallbackSrc) throw error;
      return loadExportImage(fallbackSrc);
    }
  }

  async function drawGifSpriteFrame(ctx, src, layer, rect, exportBounds, sectionId, frameMode = 'final') {
    const frames = await waitForGifFrames(src);
    if (frameMode === 'start') {
      const firstFrame = frames.images?.[0];
      if (!firstFrame?.complete || !firstFrame.naturalWidth) throw new Error(`GIF first frame is unavailable: ${src}`);
      drawImageWithLayerTransform(ctx, firstFrame, layer, rect, exportBounds, sectionId);
      return;
    }

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = frames.width || Number(layer.width) || 1;
    frameCanvas.height = frames.height || Number(layer.height) || 1;
    const frameCtx = frameCanvas.getContext('2d');
    frameCtx.imageSmoothingEnabled = false;
    for (const image of frames.images || []) {
      if (image.complete) frameCtx.drawImage(image, 0, 0);
    }
    drawImageWithLayerTransform(ctx, frameCanvas, layer, rect, exportBounds, sectionId);
  }

  async function drawMacroBarFillFrame(ctx, src, layer, rect, exportBounds, sectionId, frameMode = 'final') {
    await waitForGifFrames(src);
    const frameCanvas = document.createElement('canvas');
    frameCanvas.dataset.spriteSrc = src;
    const targetRatio = clamp(asNumber(layer?.fillRatio, 0), 0, 1);
    const elapsedSeconds = frameMode === 'start' ? 0 : macroBarAnimationEndSeconds(targetRatio);
    drawMacroBarFillCanvas(frameCanvas, layer, elapsedSeconds);
    drawImageWithLayerTransform(ctx, frameCanvas, layer, rect, exportBounds, sectionId);
  }

  async function drawSpriteLayerToExport(ctx, layout, food, sectionId, layer, exportBounds) {
    const src = renderedSpriteSrcForSection(layout, sectionId, layer, food);
    if (!src) return;
    const fallbackSrc = LOGIC.canonicalSpritePath(layer.fallbackSrc || '');
    const rect = exportLayerRect(layer, exportBounds);
    const macroFillLayer = isMacroFillLayer(layer);
    const gifFrameMode = macroFillLayer ? 'final' : sectionStillGifFrameMode(sectionId, src);
    try {
      if (macroFillLayer) {
        await drawMacroBarFillFrame(ctx, src, layer, rect, exportBounds, sectionId, gifFrameMode);
      } else if (isGifSpriteSrc(src)) {
        await drawGifSpriteFrame(ctx, src, layer, rect, exportBounds, sectionId, gifFrameMode);
      } else {
        const image = await loadExportSpriteImage(src, fallbackSrc);
        drawImageWithLayerTransform(ctx, image, layer, rect, exportBounds, sectionId);
      }
    } catch (error) {
      recordSpriteFailure(src, fallbackSrc, layer.label || layer.id || 'Section export sprite');
      if (fallbackSrc && fallbackSrc !== src && !isGifSpriteSrc(fallbackSrc)) {
        const image = await loadExportImage(fallbackSrc);
        drawImageWithLayerTransform(ctx, image, layer, rect, exportBounds, sectionId);
      } else {
        throw error;
      }
    }
  }

  function textLayerLinesForExport(ctx, layer, maxWidth) {
    const text = safeDisplayText(layer.text || '');
    if (!isContextItemTextLayer(layer)) return text.split(/\r\n|\r|\n/);

    const lines = [];
    for (const paragraph of text.split(/\r\n|\r|\n/)) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push('');
        continue;
      }
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
    }
    return lines;
  }

  function drawTextLayerToExport(ctx, layer, sectionId, exportBounds) {
    const rect = exportTextLayerRect(layer, exportBounds);
    const fontSize = textLayerFontSize(layer) * exportBounds.scale;
    const bleed = TEXT_LAYER_CLIP_BLEED * exportBounds.scale;
    const align = String(layer.align || layer.textAlign || 'left').toLowerCase();
    const textAlign = ['left', 'center', 'right'].includes(align) ? align : 'left';
    const strokeWidth = isMicroBarTextboxLayer(layer)
      ? (Number(layer.textStrokeWidth) > 0 ? Number(layer.textStrokeWidth) : MICRO_BAR_TEXTBOX_STROKE_WIDTH)
      : 1.3;

    ctx.save();
    ctx.rect(rect.x - bleed, rect.y - bleed, rect.width + (bleed * 2), rect.height + (bleed * 2));
    ctx.clip();
    if (sectionId === 'intro' && !INTRO_FOCUS_CLEAR_LAYER_IDS.has(String(layer?.id || ''))) {
      ctx.filter = `blur(${INTRO_FOCUS_BLUR_PX * exportBounds.scale}px)`;
    }
    ctx.font = `700 ${fontSize}px "Tiny5", monospace`;
    ctx.textBaseline = 'top';
    ctx.textAlign = textAlign;
    ctx.lineWidth = Math.max(1, strokeWidth * exportBounds.scale);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = layer.textStrokeColor || '#000';
    ctx.fillStyle = layer.color || '#fff';

    const textX = textAlign === 'center'
      ? rect.x + (rect.width / 2)
      : textAlign === 'right'
      ? rect.x + rect.width
      : rect.x;
    const yOffset = textLayerBaselineOffset(layer) * exportBounds.scale;
    const lineHeight = fontSize * TEXT_LAYER_LINE_HEIGHT;
    const lines = textLayerLinesForExport(ctx, layer, Math.max(1, rect.width));

    lines.forEach((line, index) => {
      const y = rect.y + yOffset + (index * lineHeight);
      ctx.strokeText(line, textX, y);
      ctx.fillText(line, textX, y);
    });
    ctx.restore();
  }

  async function drawSectionStillToCanvas(sectionId) {
    const food = await loadSelectedFood();
    const layout = state.renderedLayout || resolveLayout(selectedLayoutOption(), food);
    if (!layout) throw new Error('No DBv2 layout is available to export.');

    const sectionLayers = getSectionLayers(layout, sectionId);
    if (!sectionLayers.length) throw new Error(`${SECTION_LABELS[sectionId] || sectionId} has no layers to export.`);

    await document.fonts?.ready;
    const exportBounds = exportBoundsForLayout(layout);
    const canvas = document.createElement('canvas');
    canvas.width = exportBounds.outputWidth;
    canvas.height = exportBounds.outputHeight;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('PNG export canvas is unavailable.');
    ctx.imageSmoothingEnabled = false;

    drawExportBackdrop(ctx, food, exportBounds);

    const sorted = sectionLayers
      .map((layer, originalIndex) => ({ layer, originalIndex }))
      .filter(item => item.layer.visible !== false)
      .sort((a, b) => (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0) || a.originalIndex - b.originalIndex);

    for (const { layer } of sorted) {
      if (layer.kind === 'sprite') {
        await drawSpriteLayerToExport(ctx, layout, food, sectionId, layer, exportBounds);
      } else if (layer.kind === 'text') {
        drawTextLayerToExport(ctx, layer, sectionId, exportBounds);
      }
    }

    return canvas;
  }

  function canvasToBlob(canvas, mimeType) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('PNG export failed.'));
      }, mimeType);
    });
  }

  function slugForFilename(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'food';
  }

  function sectionStillFilename(food, sectionId) {
    const foodSlug = slugForFilename(food?.id || food?.name || 'food');
    const sectionSlug = slugForFilename(sectionId);
    return `${foodSlug}-${sectionSlug}-dbv2.${SECTION_STILL_EXPORT_EXTENSION}`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadSectionStill(sectionId) {
    if (state.imageExportingSectionId) return;
    state.imageExportingSectionId = sectionId;
    renderSections();
    setImageExportStatus(`Preparing ${SECTION_LABELS[sectionId] || sectionId} PNG...`);
    try {
      const canvas = await drawSectionStillToCanvas(sectionId);
      const blob = await canvasToBlob(canvas, SECTION_STILL_EXPORT_MIME);
      downloadBlob(blob, sectionStillFilename(state.fullFood, sectionId));
      setImageExportStatus(`${SECTION_LABELS[sectionId] || sectionId} PNG download started.`, 'ok', true);
    } catch (error) {
      console.error(error);
      setImageExportStatus(error?.message || 'PNG export failed.', 'warn');
    } finally {
      state.imageExportingSectionId = '';
      renderSections();
    }
  }

  function renderSpriteNode(node, layer, food) {
    const width = Number(layer.width || layer.naturalWidth || 1);
    const height = Number(layer.height || layer.naturalHeight || 1);
    node.src = renderedSpriteSrc(layer, food);
    node.alt = layer.label || '';
    node.style.width = `calc(${width}px * var(--pixel-unit))`;
    node.style.height = `calc(${height}px * var(--pixel-unit))`;
    if (layer.preserveAspect) {
      node.style.objectFit = 'contain';
      node.style.objectPosition = 'center';
    } else {
      node.style.objectFit = 'fill';
    }
    if (layer.fillRatio != null && isMacroFillLayer(layer)) {
      const hiddenPercent = Math.max(0, 100 - (Number(layer.fillRatio) * 100));
      node.style.clipPath = `inset(0 ${hiddenPercent}% 0 0)`;
    }
    const rotation = Number(layer.rotation ?? layer.rotate ?? 0);
    if (Number.isFinite(rotation) && rotation) node.style.transform = `rotate(${rotation}deg)`;
    if (Number.isFinite(rotation) && rotation) node.style.transformOrigin = 'center';
    applyHeaderUnderlinePixelSnap(node, layer);
    node.onerror = () => handleSpriteError(node, layer);
  }

  function displayPixelUnit() {
    const cssValue = parseFloat(getComputedStyle(els.displayCanvas).getPropertyValue('--pixel-unit'));
    if (Number.isFinite(cssValue) && cssValue > 0) return cssValue;
    const width = els.displayCanvas.getBoundingClientRect().width;
    const gridWidth = Number(state.canvasMetrics?.gridWidth) || LOGIC.AUTHOR_GRID.width;
    return width > 0 && gridWidth > 0 ? width / gridWidth : 4;
  }

  function devicePixelRatioValue() {
    const ratio = Number(window.devicePixelRatio);
    return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  }

  function snapCssPixel(value) {
    const ratio = devicePixelRatioValue();
    return Math.round(value * ratio) / ratio;
  }

  function snapCssSize(value) {
    const ratio = devicePixelRatioValue();
    return Math.max(1 / ratio, Math.round(value * ratio) / ratio);
  }

  function applyHeaderUnderlinePixelSnap(node, layer) {
    if (!isHeaderUnderlineSpriteLayer(layer)) return;
    const pixelUnit = displayPixelUnit();
    const y = Number(layer.y) || 0;
    const height = Number(layer.height || layer.naturalHeight || 1) || 1;
    node.style.top = `${snapCssPixel(y * pixelUnit)}px`;
    node.style.height = `${snapCssSize(height * pixelUnit)}px`;
    node.style.objectFit = 'fill';
    node.style.objectPosition = 'center';
  }

  function applyHeaderUnderlinePixelSnaps() {
    if (!state.renderedLayout) return;
    for (const layer of getSectionLayers(state.renderedLayout, state.selectedSectionId)) {
      if (!isHeaderUnderlineSpriteLayer(layer)) continue;
      const node = els.displayCanvas.querySelector(`.layer-node[data-layer-id="${CSS.escape(layer.id || '')}"]`);
      if (node) applyHeaderUnderlinePixelSnap(node, layer);
    }
  }

  function renderMacroBarFillCanvasNode(canvas, layer, food, animationStartMs, animationToken) {
    const width = Number(layer.width || layer.naturalWidth || 104);
    const height = Number(layer.height || layer.naturalHeight || 17);
    canvas.style.width = `calc(${width}px * var(--pixel-unit))`;
    canvas.style.height = `calc(${height}px * var(--pixel-unit))`;
    canvas.style.imageRendering = 'pixelated';
    canvas.dataset.spriteSrc = renderedSpriteSrc(layer, food);
    const rotation = Number(layer.rotation ?? layer.rotate ?? 0);
    if (Number.isFinite(rotation) && rotation) canvas.style.transform = `rotate(${rotation}deg)`;
    if (Number.isFinite(rotation) && rotation) canvas.style.transformOrigin = 'center';
    animateMacroBarFillCanvas(canvas, layer, animationStartMs, animationToken);
  }

  function animateMacroBarFillCanvas(canvas, layer, animationStartMs, animationToken) {
    const targetRatio = clamp(asNumber(layer?.fillRatio, 0), 0, 1);
    const animationEndSeconds = macroBarAnimationEndSeconds(targetRatio);
    const maxPendingSeconds = Math.max(animationEndSeconds, 8);
    const tick = now => {
      if (animationToken !== renderToken.value || !canvas.isConnected) return;
      const elapsedSeconds = Math.max(0, (now - animationStartMs) / 1000);
      const frames = drawMacroBarFillCanvas(canvas, layer, elapsedSeconds);
      const framesStillLoading = frames?.status === 'pending'
        || (frames?.status === 'ready' && (frames.images || []).some(image => !image.complete));
      if (elapsedSeconds < animationEndSeconds || (framesStillLoading && elapsedSeconds < maxPendingSeconds)) {
        window.requestAnimationFrame(tick);
      }
    };
    window.requestAnimationFrame(tick);
  }

  function drawMacroBarFillCanvas(canvas, layer, elapsedSeconds) {
    const src = canvas.dataset.spriteSrc || LOGIC.canonicalSpritePath(layer.src || layer.fallbackSrc || '');
    const targetRatio = clamp(asNumber(layer?.fillRatio, 0), 0, 1);
    const frames = requestMacroBarGifFrames(src);
    const width = frames?.width || Number(layer.width) || 104;
    const height = frames?.height || Number(layer.height) || 17;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    if (frames?.status === 'error') {
      if (canvas.dataset.spriteErrorRecorded !== src) {
        canvas.dataset.spriteErrorRecorded = src;
        recordSpriteFailure(src, '', layer.label || layer.id || 'Macro bar fill');
      }
      return frames;
    }
    if (!frames?.images?.length || targetRatio <= 0.001) return frames;

    const fillElapsed = Math.max(0, asNumber(elapsedSeconds, 0)) - MACRO_REVEAL_SECONDS - MACRO_BAR_START_DWELL_SECONDS;
    const currentFillRatio = macroBarFillCurrentRatio(fillElapsed, targetRatio);
    if (frames.static) {
      const image = frames.images[0];
      if (!image?.complete) return frames;
      const fillWidth = clamp(Math.round(width * currentFillRatio), 0, width);
      if (fillWidth > 0) ctx.drawImage(image, 0, 0, fillWidth, height, 0, 0, fillWidth, height);
      return frames;
    }

    const targetIndex = clamp(Math.round((frames.images.length - 1) * targetRatio), 0, frames.images.length - 1);
    const currentIndex = clamp(Math.round((frames.images.length - 1) * currentFillRatio), 0, targetIndex);
    for (let frameIndex = 0; frameIndex <= currentIndex; frameIndex += 1) {
      const image = frames.images[frameIndex];
      if (image?.complete) ctx.drawImage(image, 0, 0);
    }
    return frames;
  }

  function macroBarGifSource(src) {
    const cached = MACRO_BAR_GIF_SOURCE_CACHE.get(src);
    if (cached) return cached;
    const promise = fetch(src)
      .then(response => {
        if (!response.ok) throw new Error(`GIF fetch failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => parseGifBytes(new Uint8Array(buffer)));
    MACRO_BAR_GIF_SOURCE_CACHE.set(src, promise);
    return promise;
  }

  function parseGifBytes(bytes) {
    const signature = String.fromCharCode(...bytes.slice(0, 6));
    if (!/^GIF8[79]a$/.test(signature)) throw new Error('Unsupported GIF signature');

    const packed = bytes[10];
    const width = bytes[6] | (bytes[7] << 8);
    const height = bytes[8] | (bytes[9] << 8);
    const globalColorTableSize = packed & 0x80 ? 3 * (1 << ((packed & 0x07) + 1)) : 0;
    let pos = 13 + globalColorTableSize;
    const leadParts = [bytes.slice(0, pos)];
    const frames = [];
    let pendingGce = null;
    let sawFrame = false;

    while (pos < bytes.length) {
      const marker = bytes[pos];
      if (marker === 0x3b) break;
      if (marker === 0x21) {
        const label = bytes[pos + 1];
        const end = skipGifSubBlocks(bytes, pos + 2);
        const block = bytes.slice(pos, end);
        if (label === 0xf9) {
          pendingGce = block;
        } else if (!sawFrame) {
          leadParts.push(block);
        }
        pos = end;
        continue;
      }
      if (marker === 0x2c) {
        const imageStart = pos;
        const imagePacked = bytes[pos + 9];
        pos += 10;
        if (imagePacked & 0x80) pos += 3 * (1 << ((imagePacked & 0x07) + 1));
        pos += 1;
        pos = skipGifSubBlocks(bytes, pos);
        frames.push({ gce: pendingGce, image: bytes.slice(imageStart, pos) });
        pendingGce = null;
        sawFrame = true;
        continue;
      }
      throw new Error(`Unsupported GIF block 0x${marker.toString(16)}`);
    }

    if (!frames.length) throw new Error('GIF has no frames');
    const nativeSeconds = frames.reduce((sum, frame) => sum + gifFrameDelayCentiseconds(frame.gce), 0) / 100;
    return { leadParts, frames, width, height, nativeSeconds };
  }

  function gifFrameDelayCentiseconds(gce) {
    if (!gce || gce.length < 8) return 10;
    const delay = gce[4] | (gce[5] << 8);
    return delay > 0 ? delay : 10;
  }

  function skipGifSubBlocks(bytes, pos) {
    let cursor = pos;
    while (cursor < bytes.length) {
      const size = bytes[cursor];
      cursor += 1;
      if (size === 0) break;
      cursor += size;
    }
    return cursor;
  }

  function requestMacroBarGifFrames(src) {
    const cached = MACRO_BAR_GIF_FRAME_CACHE.get(src);
    if (cached?.status === 'ready' || cached?.status === 'pending' || cached?.status === 'error') return cached;

    const entry = { status: 'pending', width: 104, height: 17, images: [] };
    MACRO_BAR_GIF_FRAME_CACHE.set(src, entry);
    if (!/\.gif(?:[?#]|$)/i.test(src)) {
      entry.static = true;
      const image = new Image();
      image.decoding = 'sync';
      image.onload = () => {
        entry.width = image.naturalWidth || entry.width;
        entry.height = image.naturalHeight || entry.height;
        entry.images = [image];
        entry.status = 'ready';
      };
      image.onerror = error => {
        entry.status = 'error';
        entry.error = error;
      };
      image.src = src;
      return entry;
    }

    macroBarGifSource(src)
      .then(parsed => {
        entry.width = parsed.width || entry.width;
        entry.height = parsed.height || entry.height;
        entry.nativeSeconds = asNumber(parsed.nativeSeconds, null) || MACRO_BAR_GIF_NATIVE_SECONDS;
        entry.images = parsed.frames.map((frame, index) => {
          const image = new Image();
          image.decoding = 'sync';
          image.src = URL.createObjectURL(new Blob([buildSingleMacroBarFrameGifBytes(parsed, index)], { type: 'image/gif' }));
          return image;
        });
        entry.status = 'ready';
      })
      .catch(error => {
        entry.status = 'error';
        entry.error = error;
      });
    return entry;
  }

  function buildSingleMacroBarFrameGifBytes(parsed, frameIndex) {
    const frame = parsed.frames[frameIndex];
    const parts = [...parsed.leadParts, gifGraphicControlWithDelay(frame.gce, 100), frame.image, Uint8Array.of(0x3b)];
    return concatBytes(parts);
  }

  function gifGraphicControlWithDelay(gce, delayCs) {
    const safeDelay = clamp(Math.round(delayCs), 1, MACRO_BAR_GIF_FINAL_HOLD_CENTISECONDS);
    const out = gce && gce.length >= 8
      ? new Uint8Array(gce)
      : new Uint8Array([0x21, 0xf9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]);
    out[4] = safeDelay & 0xff;
    out[5] = (safeDelay >> 8) & 0xff;
    return out;
  }

  function concatBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    parts.forEach(part => {
      out.set(part, offset);
      offset += part.length;
    });
    return out;
  }

  function renderedSpriteSrcForSection(layout, sectionId, layer, food) {
    if (isSectionIndicatorLayer(layer)) {
      return sectionIndicatorSrcForLayer(layout, sectionId, layer, food);
    }
    return LOGIC.canonicalSpritePath(layer.src || layer.fallbackSrc || '');
  }

  function renderedSpriteSrc(layer, food) {
    return renderedSpriteSrcForSection(state.renderedLayout, state.selectedSectionId, layer, food);
  }

  function renderTextNode(node, layer) {
    node.textContent = safeDisplayText(layer.text || '');
    node.style.fontSize = `calc(${textLayerFontSize(layer)}px * var(--pixel-unit))`;
    node.style.color = layer.color || '';
    node.style.textAlign = layer.align || 'left';
    applyTextBaselineAnchor(node, layer);
    if (isContextItemTextLayer(layer)) node.classList.add('context-item-text');
    if (isMicroBarTextboxLayer(layer)) {
      const strokeWidth = Number(layer.textStrokeWidth);
      const resolvedStrokeWidth = Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 1.15;
      node.style.setProperty('-webkit-text-stroke', `calc(${resolvedStrokeWidth}px * var(--pixel-unit)) #000`);
      node.style.removeProperty('text-shadow');
      node.style.removeProperty('filter');
    }
    if (layer.width) node.style.width = `calc(${Number(layer.width) + (TEXT_LAYER_CLIP_BLEED * 2)}px * var(--pixel-unit))`;
    const height = Number(layer.textBoxHeight || layer.height || defaultTextLayerHeight(layer));
    if (height) {
      node.style.height = `calc(${height + (TEXT_LAYER_CLIP_BLEED * 2)}px * var(--pixel-unit))`;
      node.style.maxHeight = `calc(${height + (TEXT_LAYER_CLIP_BLEED * 2)}px * var(--pixel-unit))`;
      node.style.marginLeft = `calc(${-TEXT_LAYER_CLIP_BLEED}px * var(--pixel-unit))`;
      node.style.marginTop = `calc(${-TEXT_LAYER_CLIP_BLEED}px * var(--pixel-unit))`;
      node.style.padding = `calc(${TEXT_LAYER_CLIP_BLEED}px * var(--pixel-unit))`;
    }
  }

  function defaultTextLayerHeight(layer) {
    const fontSize = textLayerFontSize(layer);
    const lines = Math.max(1, String(layer?.text || '').split(/\r\n|\r|\n/).length);
    return Math.max(1, Math.ceil(fontSize * 1.15 * lines));
  }

  function textLayerFontSize(layer) {
    return Number(layer?.autoFontSize ?? layer?.fontSize) || 6;
  }

  function textLayerBaselineOffset(layer) {
    if (layer?.id !== 'food_name_text') return 0;
    const baseFontSize = Number(layer?.fontSize);
    const autoFontSize = Number(layer?.autoFontSize);
    if (!Number.isFinite(baseFontSize) || !Number.isFinite(autoFontSize) || autoFontSize >= baseFontSize) return 0;
    return Math.round((baseFontSize - autoFontSize) * TEXT_LAYER_LINE_HEIGHT * 1000) / 1000;
  }

  function applyTextBaselineAnchor(node, layer) {
    const offset = textLayerBaselineOffset(layer);
    if (offset > 0) {
      node.style.transform = `translateY(calc(${offset}px * var(--pixel-unit)))`;
      node.style.transformOrigin = 'bottom left';
    } else {
      node.style.removeProperty('transform');
      node.style.removeProperty('transform-origin');
    }
  }

  function handleSpriteError(node, layer) {
    const failedSrc = node.currentSrc || node.src || layer.src;
    const fallback = LOGIC.canonicalSpritePath(layer.fallbackSrc || '');
    recordSpriteFailure(failedSrc, fallback, layer.label || layer.id || '');
    if (fallback && node.src !== new URL(fallback, window.location.href).href) {
      node.src = fallback;
      return;
    }
    node.onerror = null;
    node.remove();
  }

  function recordSpriteFailure(source, fallback, label) {
    const key = `${source}|${fallback}`;
    const existing = state.spriteFailures.get(key);
    state.spriteFailures.set(key, {
      source,
      fallback,
      label,
      count: (existing?.count || 0) + 1
    });
  }

  function updateTextFitReport() {
    const textByLayer = new Map(state.bindingReport.text.map(item => [`${item.sectionId}:${item.layerId}`, item]));
    els.displayCanvas.querySelectorAll('.layer-node.text').forEach(node => {
      const key = `${node.dataset.sectionId}:${node.dataset.layerId}`;
      const report = textByLayer.get(key);
      if (!report) return;
      const fits = node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1;
      report.fitsBox = fits;
      report.overflowWarning = fits ? null : 'Text overflows or clips in the designed text box.';
    });
  }

  function updatePixelUnit() {
    const width = els.displayCanvas.getBoundingClientRect().width;
    const gridWidth = Number(state.canvasMetrics?.gridWidth) || LOGIC.AUTHOR_GRID.width;
    const unit = width > 0 ? width / gridWidth : 4;
    els.displayCanvas.style.setProperty('--pixel-unit', String(unit));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function renderProgrammerPanel(food, layoutOption) {
    const normalizedType = LOGIC.normalizeFoodType(food?.foodType);
    const sectionId = state.selectedSectionId;
    const activeContext = {
      selectedFood: food?.name || null,
      selectedFoodId: food?.id || null,
      selectedFoodType: food?.foodType || null,
      normalisedFoodType: normalizedType,
      selectedLayout: layoutOption?.name || null,
      selectedLayoutId: layoutOption?.id || null,
      selectedDisplaySection: sectionId,
      rulesetId: food?.ruleset?.id || null,
      rulesetVersion: food?.ruleset?.version || null
    };
    const logic = {
      activeContext,
      mainMacroDisplayScaling: LOGIC.mainMacroScaling(food || {}),
      micronutrientDisplay: state.bindingReport.micronutrientBars,
      contextItemDisplay: state.bindingReport.contextItems,
      activeFoodTypeDisplayRules: LOGIC.activeRules(food || {}).map(rule => ({
        metricKey: rule.metricKey,
        section: rule.displaySection || rule.sectionKey,
        scoringRole: rule.scoringRole || 'scored',
        scoringMode: rule.scoringMode || null,
        applicability: rule.applicability || null,
        polarity: rule.polarity || null,
        weight: rule.weight ?? null,
        bands: rule.bands || []
      })),
      liveMetricEvaluation: LOGIC.liveMetricEvaluation(food || {}, sectionId),
      sectionScoreCalculation: LOGIC.sectionScoreCalculation(food || {}, sectionId),
      layoutBindingReport: {
        textPlaceholders: state.bindingReport.text,
        arrowLayers: state.bindingReport.arrows,
        micronutrientBars: state.bindingReport.micronutrientBars,
        contextItems: state.bindingReport.contextItems,
        warnings: [
          ...state.bindingReport.warnings,
          ...[...state.spriteFailures.values()].map(item => ({ type: 'sprite', ...item }))
        ]
      },
      sourceInformation: LOGIC.sourceInformation()
    };
    state.lastLogic = logic;

    els.activeFoodTypeTitle.textContent = `ACTIVE FOOD TYPE: ${String(normalizedType || 'unknown').toUpperCase()}`;
    els.foodTypePill.textContent = `ACTIVE FOOD TYPE: ${String(normalizedType || 'unknown').toUpperCase()}`;
    els.programmerLogic.innerHTML = '';
    const sections = [
      ['A. ACTIVE CONTEXT', logic.activeContext],
      ['B. MAIN MACRO DISPLAY SCALING', logic.mainMacroDisplayScaling],
      ['C. MICRONUTRIENT DISPLAY', logic.micronutrientDisplay],
      ['D. PROS/CONS DISPLAY', logic.contextItemDisplay],
      ['E. ACTIVE FOOD-TYPE DISPLAY RULES', logic.activeFoodTypeDisplayRules],
      ['F. LIVE METRIC EVALUATION', logic.liveMetricEvaluation],
      ['G. SECTION SCORE CALCULATION', logic.sectionScoreCalculation],
      ['H. LAYOUT BINDING REPORT', logic.layoutBindingReport],
      ['I. SOURCE INFORMATION', logic.sourceInformation]
    ];
    for (const [title, payload] of sections) {
      const card = document.createElement('section');
      card.className = 'logic-card';
      const flags = collectFlags(title, payload);
      card.innerHTML = `<h3>${escapeHtml(title)}</h3>${flags.map(flag => `<span class="flag">${escapeHtml(flag)}</span>`).join('')}<pre>${escapeHtml(JSON.stringify(sanitizeForDisplay(payload), null, 2))}</pre>`;
      els.programmerLogic.appendChild(card);
    }
  }

  function sanitizeForDisplay(value) {
    if (value == null) return 'N/A';
    if (typeof value === 'number') return Number.isFinite(value) ? value : 'N/A';
    if (Array.isArray(value)) return value.map(sanitizeForDisplay);
    if (typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, sanitizeForDisplay(entry)]));
    }
    return value;
  }

  function collectFlags(title, payload) {
    if (!payload || typeof payload !== 'object' || (!('textPlaceholders' in payload) && !('arrowLayers' in payload))) return [];
    const flags = [];
    const text = payload.textPlaceholders || [];
    const arrows = payload.arrowLayers || [];
    const micronutrientBars = payload.micronutrientBars || [];
    const contextItems = payload.contextItems || [];
    if (text.some(item => item.unbound)) flags.push('unbound text placeholders');
    if (arrows.some(item => item.unbound)) flags.push('unbound arrow slots');
    if (micronutrientBars.some(item => !item.shownBarPercents?.length && item.formattedValue !== 'N/A')) flags.push('micronutrient bar mismatch');
    if (contextItems.some(item => item.missingData)) flags.push('missing pro/con data');
    if ((payload.warnings || []).some(item => item.type === 'micronutrient-layout')) flags.push('micronutrient layout fallback');
    if ((payload.warnings || []).some(item => item.type === 'context-layout')) flags.push('missing pro/con layers');
    if ((payload.warnings || []).some(item => item.type === 'sprite')) flags.push('missing sprite assets');
    if (text.some(item => item.overflowWarning)) flags.push('text overflow');
    return flags;
  }

  function updateBackgroundControls() {
    els.bgColor.value = state.background.color || DEFAULT_BACKGROUND.color;
  }

  async function renderAll() {
    const token = ++renderToken.value;
    const layoutOption = selectedLayoutOption();
    const food = await loadSelectedFood();
    if (token !== renderToken.value) return;

    const layout = resolveLayout(layoutOption, food);
    state.renderedLayout = layout;
    writeRenderedPlacementExport(layout, food, layoutOption);
    renderCanvas(layout, food);
    updateTextFitReport();
    renderProgrammerPanel(food, layoutOption);
    renderCanvasMeta(food, layoutOption);
  }

  function renderCanvasMeta(food, layoutOption) {
    const section = SECTION_LABELS[state.selectedSectionId] || state.selectedSectionId;
    const layoutName = layoutOption?.name || 'No layout';
    const gridWidth = Number(state.canvasMetrics?.gridWidth) || LOGIC.AUTHOR_GRID.width;
    const gridHeight = Number(state.canvasMetrics?.gridHeight) || LOGIC.AUTHOR_GRID.height;
    const sourceText = layoutOption
      ? `${food?.name || 'No food'} rendered from ${layoutName}${bindingWarningText()}`
      : 'No layout-builder layout available';
    els.canvasMeta.textContent = `${sourceText} · ${section} · Canvas ${formatCanvasNumber(gridWidth)}x${formatCanvasNumber(gridHeight)}`;
  }

  function bindingWarningText() {
    const warnings = [
      ...state.bindingReport.text.filter(item => item.unbound),
      ...state.bindingReport.arrows.filter(item => item.unbound),
      ...state.bindingReport.warnings,
      ...state.bindingReport.text.filter(item => item.overflowWarning),
      ...state.spriteFailures.values()
    ];
    return warnings.length ? ` · ${warnings.length} binding/sprite warning${warnings.length === 1 ? '' : 's'}` : '';
  }

  function bindEvents() {
    els.layoutSelect.addEventListener('change', async () => {
      state.selectedLayoutKey = els.layoutSelect.value;
      writeTestState();
      await renderAll();
    });
    els.foodSearch.addEventListener('input', () => {
      state.foodFilter = els.foodSearch.value || '';
      renderFoodList();
    });
    els.bgColor.addEventListener('input', async () => {
      state.background.color = els.bgColor.value || DEFAULT_BACKGROUND.color;
      writeTestState();
      await renderAll();
    });
    window.addEventListener('resize', () => {
      updatePixelUnit();
      applyHeaderUnderlinePixelSnaps();
    });
    window.addEventListener('focus', async () => {
      refreshLayoutOptions();
      await renderAll();
    });
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState !== 'visible') return;
      refreshLayoutOptions();
      await renderAll();
    });
    window.addEventListener('storage', async event => {
      if (![LAYOUT_BUILDER_WORKING_KEY, LAYOUT_BUILDER_SAVED_KEY, LAYOUT_BUILDER_FOOD_LAYOUTS_KEY].includes(event.key)) return;
      refreshLayoutOptions();
      await renderAll();
    });
  }

  async function init() {
    const saved = readTestState();
    const requestedExportFoodId = PAGE_URL_PARAMS.get('videoBuilderExportFood') || '';
    state.selectedFoodId = requestedExportFoodId && state.foods.some(food => food.id === requestedExportFoodId)
      ? requestedExportFoodId
      : saved.selectedFoodId && state.foods.some(food => food.id === saved.selectedFoodId)
      ? saved.selectedFoodId
      : state.foods[0]?.id || '';
    state.selectedSectionId = DISPLAY_SECTIONS.includes(saved.selectedSectionId) ? saved.selectedSectionId : 'intro';
    state.selectedLayoutKey = saved.selectedLayoutKey || '';
    state.background = {
      ...LOGIC.clone(DEFAULT_BACKGROUND),
      ...(saved.background || {})
    };
    updateBackgroundControls();
    refreshLayoutOptions({ keepSelection: Boolean(saved.selectedLayoutKey && saved.selectedLayoutKey !== 'working:current') });
    renderFoodList();
    renderSections();
    bindEvents();
    await renderAll();
    void loadBatchResults().then(async loaded => {
      if (loaded) await renderAll();
    });
  }

  window.FOODRANKED_DISPLAY_BUILDER_V2 = {
    state,
    refreshLayoutOptions,
    renderAll,
    downloadSectionStill,
    drawSectionStillToCanvas,
    sectionStillExport: {
      mimeType: SECTION_STILL_EXPORT_MIME,
      extension: SECTION_STILL_EXPORT_EXTENSION,
      minimumOutputWidth: SECTION_STILL_EXPORT_MIN_OUTPUT_WIDTH
    },
    storageKeys: {
      read: [LAYOUT_BUILDER_WORKING_KEY, LAYOUT_BUILDER_SAVED_KEY, LAYOUT_BUILDER_FOOD_LAYOUTS_KEY],
      write: [TEST_STATE_KEY, PLACEMENT_EXPORT_KEY]
    }
  };

  init().catch(error => {
    console.error(error);
    els.canvasMeta.textContent = 'Food data or layout render failed.';
  });
})();
