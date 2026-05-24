(function () {
  const DISPLAY_LAYOUT_KEY = 'foodranked-display-builder-v4';
  const SAVED_LAYOUTS_KEY = 'foodranked-display-builder-sprite-layouts-v1';
  const VIDEO_STATE_KEY = 'foodranked-video-builder-state-v1';
  const AUTHOR_GRID = { width: 135, height: 240 };
  const ROOT_SPRITE_BASE = './sprites';
  const SECTION_INDICATOR_LAYOUT = { normalSize: 10, highlightedSize: 12 };
  const CAPTION_SAFE_X = 7;
  const CAPTION_MAX_LINES = 2;
  const CAPTION_MAX_LINE_CHARS = 18;
  const CAPTION_SUMMARY_LINE_CHARS = 24;
  const CAPTION_TIER_LINE_CHARS = 28;
  const CAPTION_WORD_LOOKAHEAD_SECONDS = 0.002;
  const AUDIO_REVEAL_LEAD_SECONDS = 0.11;
  const AUDIO_REVEAL_WINDOW_SECONDS = 0.36;
  const AUDIO_TIMELINE_SYNC_TOLERANCE_SECONDS = 0.12;
  const SECTION_HOLD_SECONDS = 2;
  const SECTION_HOLD_IDS = new Set(['fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons']);
  const HIDDEN_CAPTION_SECTION_IDS = new Set(['intro']);
  const INTRO_RANKED_SPRITE_PATH = './sprites/ui/intro_&_outro/ranked.png';
  const INTRO_RANKED_VISIBLE_CENTER = { x: 0.5, y: 0.47 };
  const INTRO_HERO_SIZE = { ranked: 80, foodWidth: 48, foodHeight: 24 };
  const SUBMACRO_VALUE_COLORS = {
    green: '#7cf2a7',
    red: '#ff6f6f',
    neutral: '#ffffff'
  };

  const SECTIONS = [
    { id: 'intro', label: 'Hook', duration: 2.4, reveal: 'pop', motion: 'bob' },
    { id: 'fats', label: 'Fats', duration: 4.2, reveal: 'cascade', motion: 'bob' },
    { id: 'carbs', label: 'Carbs', duration: 3.8, reveal: 'cascade', motion: 'bob' },
    { id: 'protein', label: 'Protein', duration: 4.2, reveal: 'cascade', motion: 'pulse' },
    { id: 'vitamins', label: 'Vitamins', duration: 3.6, reveal: 'wipe', motion: 'drift' },
    { id: 'minerals', label: 'Minerals', duration: 3.6, reveal: 'wipe', motion: 'drift' },
    { id: 'pros', label: 'Pros', duration: 5.2, reveal: 'slide', motion: 'pulse' },
    { id: 'cons', label: 'Cons', duration: 5.2, reveal: 'slide', motion: 'pulse' },
    { id: 'outro', label: 'Verdict', duration: 4.0, reveal: 'pop', motion: 'bob' }
  ];

  const VITAMIN_TEXT_SPECS = [
    { key: 'vitamin_a_dv', shortLabel: 'A' },
    { key: 'vitamin_c_dv', shortLabel: 'C' },
    { key: 'vitamin_d_dv', shortLabel: 'D' },
    { key: 'vitamin_e_dv', shortLabel: 'E' },
    { key: 'vitamin_k_dv', shortLabel: 'K' },
    { key: 'vitamin_b12_dv', shortLabel: 'B12' }
  ];

  const MINERAL_TEXT_SPECS = [
    { key: 'calcium_dv', shortLabel: 'Ca' },
    { key: 'iron_dv', shortLabel: 'Fe' },
    { key: 'magnesium_dv', shortLabel: 'Mg' },
    { key: 'potassium_dv', shortLabel: 'K' },
    { key: 'zinc_dv', shortLabel: 'Zn' }
  ];

  const MACRO_SUBMETRIC_SPECS = {
    fats: [
      { key: 'saturated_fat_g', label: 'SAT FAT', value: food => formatMetric(food?.metrics?.saturated_fat_g, 'g') },
      { key: 'polyunsaturated_fat_g', label: 'POLY FAT', value: food => formatMetric(food?.metrics?.polyunsaturated_fat_g, 'g') },
      { key: 'omega3_mg', label: 'OMEGA 3', value: food => formatMetric(food?.metrics?.omega3_mg, 'mg') },
      { key: 'cholesterol_mg', label: 'CHOLEST.', value: food => formatMetric(food?.metrics?.cholesterol_mg, 'mg') }
    ],
    carbs: [
      { key: 'fibre_g', label: 'FIBRE', value: food => formatMetric(food?.metrics?.fibre_g, 'g') },
      { key: 'sugar_g', label: 'SUGAR', value: food => formatMetric(food?.metrics?.sugar_g, 'g') },
      { key: 'starch_g', label: 'STARCH', value: food => formatMetric(food?.metrics?.starch_g, 'g') },
      { key: 'glycemic_index', label: 'GI', value: food => formatMetric(food?.metrics?.glycemic_index, '') }
    ],
    protein: [
      { key: 'collagen_g', label: 'COLLAGEN', value: food => formatMetric(food?.metrics?.collagen_g, 'g') },
      { key: 'essential_amino_acids_score', label: 'EAA', value: food => formatRatio(food?.metrics?.essential_amino_acids_score, 9) },
      { key: 'nonessential_amino_acids_score', label: 'N-EAA', value: food => formatRatio(food?.metrics?.nonessential_amino_acids_score, 11) },
      { key: 'bioavailability_percent', label: 'BIOAVAIL.', value: food => formatMetric(food?.metrics?.bioavailability_percent, '%') }
    ]
  };

  const METRIC_SPEECH_TERMS = {
    saturated_fat_g: ['saturated fat', 'sat fat'],
    polyunsaturated_fat_g: ['polyunsaturated fat', 'polyunsaturated', 'poly fat'],
    omega3_mg: ['omega 3', 'omega3'],
    cholesterol_mg: ['cholesterol'],
    fibre_g: ['fibre', 'fiber'],
    sugar_g: ['sugar'],
    starch_g: ['starch'],
    glycemic_index: ['glycemic index', 'gi'],
    collagen_g: ['collagen'],
    essential_amino_acids_score: ['essential amino', 'eaa'],
    nonessential_amino_acids_score: ['nonessential amino', 'non essential amino', 'n eaa'],
    bioavailability_percent: ['bioavailability'],
    vitamin_a_dv: ['vitamin a'],
    vitamin_c_dv: ['vitamin c'],
    vitamin_d_dv: ['vitamin d'],
    vitamin_e_dv: ['vitamin e'],
    vitamin_k_dv: ['vitamin k'],
    vitamin_b12_dv: ['vitamin b12', 'b12'],
    calcium_dv: ['calcium'],
    iron_dv: ['iron'],
    magnesium_dv: ['magnesium'],
    potassium_dv: ['potassium'],
    zinc_dv: ['zinc']
  };

  const SECTION_ANCHOR_TERMS = {
    fats: ['fat', 'saturated fat', 'fat quality'],
    carbs: ['carbs', 'lackluster'],
    protein: ['protein', 'protein quantity', 'bioavailability'],
    vitamins: ['vitamin', 'daily value'],
    minerals: ['zinc', 'daily value'],
    pros: ['pros first', 'plus side'],
    cons: ['drawbacks next', 'drawbacks'],
    outro: ['tier']
  };
  const TIER_REVEAL_RE = /^[SDCBA]\s+tier\.?$/i;

  const els = {
    foodSearch: document.getElementById('foodSearch'),
    foodList: document.getElementById('foodList'),
    layoutSource: document.getElementById('layoutSource'),
    layoutStatus: document.getElementById('layoutStatus'),
    sceneList: document.getElementById('sceneList'),
    videoStage: document.getElementById('videoStage'),
    narrationAudio: document.getElementById('narrationAudio'),
    playPause: document.getElementById('playPause'),
    audioToggle: document.getElementById('audioToggle'),
    audioStatus: document.getElementById('audioStatus'),
    timeReadout: document.getElementById('timeReadout'),
    timeScrub: document.getElementById('timeScrub'),
    timelineStrip: document.getElementById('timelineStrip'),
    activeSceneTitle: document.getElementById('activeSceneTitle'),
    sceneStatus: document.getElementById('sceneStatus'),
    sceneDuration: document.getElementById('sceneDuration'),
    revealStyle: document.getElementById('revealStyle'),
    spriteMotion: document.getElementById('spriteMotion'),
    captionSize: document.getElementById('captionSize'),
    captionText: document.getElementById('captionText'),
    resetCaptions: document.getElementById('resetCaptions'),
    copyManifest: document.getElementById('copyManifest'),
    manifestOutput: document.getElementById('manifestOutput')
  };

  const foods = Array.isArray(window.FOODS_INDEX) ? window.FOODS_INDEX : [];
  const BATCH_RESULTS_CACHE = new Map();
  const savedState = readJson(localStorage.getItem(VIDEO_STATE_KEY), {});
  const state = {
    foodFilter: '',
    selectedFoodId: savedState.selectedFoodId || 'bacon',
    layoutSourceId: savedState.layoutSourceId || 'display-builder',
    selectedSceneId: savedState.selectedSceneId || 'intro',
    audioEnabled: savedState.audioEnabled !== false,
    currentTime: 0,
    playing: false,
    startedAt: 0,
    playheadStart: 0,
    scenes: [],
    layout: null,
    savedLayouts: loadSavedLayouts(),
    backgroundKey: '',
    backgroundToken: 0,
    lastFrameAt: performance.now(),
    audioTimelineKey: '',
    audioDurationSeconds: null,
    audioInHold: false
  };

  function readJson(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function clone(value) {
    return structuredClone(value);
  }

  function selectedFood() {
    return attachBatchResult(foods.find(food => food.id === state.selectedFoodId) || foods[0] || null);
  }

  async function loadBatchResults() {
    if (BATCH_RESULTS_CACHE.size) return;
    try {
      const response = await fetch('../data/batch-results.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const details = Array.isArray(json?.details) ? json.details : [];
      details.forEach(item => {
        const result = item?.result;
        const id = result?.food?.id;
        if (id) BATCH_RESULTS_CACHE.set(id, result);
      });
    } catch {
      // Batch results refine arrow presentation; the builder can still render from food data alone.
    }
  }

  function attachBatchResult(food) {
    if (!food?.id) return food;
    const batchResult = BATCH_RESULTS_CACHE.get(food.id);
    return batchResult ? { ...food, batchResult } : food;
  }

  function asNumber(value, fallback = null) {
    if (value == null || value === '') return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function cssPixels(value, fallback = 0) {
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function easeOutCubic(value) {
    const t = clamp(value, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }

  function formatCompactNumber(value, decimals = 1) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    if (Number.isInteger(safe)) return String(safe);
    return safe.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  function formatMetric(value, unit) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(safe)}${unit}`;
  }

  function formatRatio(value, denominator) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    return `${formatCompactNumber(safe, 0)}/${denominator}`;
  }

  function formatDvPercent(food, metricKey) {
    const value = asNumber(food?.metrics?.[metricKey], null);
    if (value == null || value <= 0) return 'N/A';
    return `${formatCompactNumber(value, 0)}%`;
  }

  function normalizeFoodType(foodType) {
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
      oil: 'oils-and-fats', oils: 'oils-and-fats', fat: 'oils-and-fats', fats: 'oils-and-fats', 'oil-fat': 'oils-and-fats', 'oils-and-fats': 'oils-and-fats',
      misc: 'misc', miscellaneous: 'misc'
    };
    return aliases[raw] || raw || 'misc';
  }

  function prettyFoodType(foodType) {
    return normalizeFoodType(foodType).replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  function typeSpriteSlug(foodType) {
    const normalized = normalizeFoodType(foodType);
    return {
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
    }[normalized] || 'misc';
  }

  function spritePath(path) {
    if (!path) return '';
    if (/^(data:|https?:|blob:)/i.test(path)) return path;
    if (path.startsWith('./sprites/')) return `../app/${path.slice(2)}`;
    if (path.startsWith('sprites/')) return `../app/${path}`;
    if (path.startsWith('./app/')) return `../${path.slice(2)}`;
    if (path.startsWith('app/')) return `../${path}`;
    if (path.startsWith('../app/')) return path;
    return path;
  }

  function docsAssetPath(path) {
    if (!path) return '';
    if (/^(data:|https?:|blob:)/i.test(path)) return path;
    if (path.startsWith('../') || path.startsWith('./')) return path;
    return `../${path}`;
  }

  function appSpritePath(path) {
    return `${ROOT_SPRITE_BASE}/${path}`.replace(/\/+/g, '/').replace(':/', '://');
  }

  function foodImagePath(food) {
    const customPath = food?.assets?.customFoodImage?.path || food?.customFoodImage?.path;
    if (customPath) return customPath;
    return appSpritePath(`header/food_images/${food?.id || 'bacon'}.png`);
  }

  function hasCustomFoodImage(food) {
    return Boolean(food?.assets?.customFoodImage?.path || food?.customFoodImage?.path);
  }

  function foodPlatePath(food) {
    return appSpritePath(`header/food_plate/${typeSpriteSlug(food?.foodType)}_food_plate.png`);
  }

  function foodSpriteCandidates(food) {
    return {
      primary: foodImagePath(food),
      fallback: foodPlatePath(food)
    };
  }

  function visibleCanvasGridBounds() {
    const shell = els.videoStage?.closest('.phone-shell');
    if (!shell) {
      return { left: 0, top: 0, right: AUTHOR_GRID.width, bottom: AUTHOR_GRID.height };
    }

    const pixelUnit = cssPixels(getComputedStyle(document.documentElement).getPropertyValue('--pixel-unit'), 4);
    const stageRect = els.videoStage.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const shellStyle = getComputedStyle(shell);
    const contentLeft = shellRect.left
      + cssPixels(shellStyle.borderLeftWidth)
      + cssPixels(shellStyle.paddingLeft);
    const contentRight = shellRect.right
      - cssPixels(shellStyle.borderRightWidth)
      - cssPixels(shellStyle.paddingRight);
    const contentTop = shellRect.top
      + cssPixels(shellStyle.borderTopWidth)
      + cssPixels(shellStyle.paddingTop);
    const contentBottom = shellRect.bottom
      - cssPixels(shellStyle.borderBottomWidth)
      - cssPixels(shellStyle.paddingBottom);
    return {
      left: Math.max(0, (Math.max(stageRect.left, contentLeft) - stageRect.left) / pixelUnit),
      right: Math.min(AUTHOR_GRID.width, (Math.min(stageRect.right, contentRight) - stageRect.left) / pixelUnit),
      top: Math.max(0, (Math.max(stageRect.top, contentTop) - stageRect.top) / pixelUnit),
      bottom: Math.min(AUTHOR_GRID.height, (Math.min(stageRect.bottom, contentBottom) - stageRect.top) / pixelUnit)
    };
  }

  function introHeroLayout() {
    const visible = visibleCanvasGridBounds();
    const centerX = (visible.left + visible.right) / 2;
    const centerY = (visible.top + visible.bottom) / 2;
    const rankedSize = INTRO_HERO_SIZE.ranked;
    const ranked = {
      x: centerX - (rankedSize * INTRO_RANKED_VISIBLE_CENTER.x),
      y: centerY - (rankedSize * INTRO_RANKED_VISIBLE_CENTER.y),
      width: rankedSize,
      height: rankedSize
    };
    return {
      ranked,
      food: {
        x: ranked.x + 16,
        y: ranked.y + 20.75,
        width: INTRO_HERO_SIZE.foodWidth,
        height: INTRO_HERO_SIZE.foodHeight
      }
    };
  }

  function introHookLayers(food) {
    const layout = introHeroLayout();
    const foodBox = layout.food;
    const rankedBox = layout.ranked;
    return [
      {
        id: 'intro_food_hero',
        kind: 'sprite',
        label: 'Hook food image',
        src: foodImagePath(food),
        fallbackSrc: foodPlatePath(food),
        x: foodBox.x,
        y: foodBox.y,
        z: 56,
        width: foodBox.width,
        height: foodBox.height,
        visible: true,
        foodDriven: true,
        preserveAspect: true
      },
      {
        id: 'intro_ranked_sprite',
        kind: 'sprite',
        label: 'Hook ranked sprite',
        src: INTRO_RANKED_SPRITE_PATH,
        x: rankedBox.x,
        y: rankedBox.y,
        z: 55,
        width: rankedBox.width,
        height: rankedBox.height,
        visible: true,
        preserveAspect: true,
        aspectRatio: 1,
        effect: 'ranked-shine'
      },
      ...introRankedGlimmerLayers(rankedBox)
    ];
  }

  function introRankedGlimmerLayers(rankedBox) {
    const scaleX = rankedBox.width / 92;
    const scaleY = rankedBox.height / 92;
    return [
      { x: rankedBox.x + (10 * scaleX), y: rankedBox.y + (6 * scaleY), delay: 0.02 },
      { x: rankedBox.x + (74 * scaleX), y: rankedBox.y + (12 * scaleY), delay: 0.16 },
      { x: rankedBox.x + (5 * scaleX), y: rankedBox.y + (66 * scaleY), delay: 0.3 },
      { x: rankedBox.x + (78 * scaleX), y: rankedBox.y + (61 * scaleY), delay: 0.44 }
    ].map((glimmer, index) => ({
      id: `intro_ranked_glimmer_${index + 1}`,
      kind: 'text',
      label: 'Hook ranked glimmer',
      text: index % 2 ? '+' : '*',
      x: glimmer.x,
      y: glimmer.y,
      z: 64 + index,
      width: 6,
      fontSize: 10,
      align: 'center',
      visible: true,
      color: '#fff8c9',
      effect: 'ranked-glimmer',
      animationDelay: `${glimmer.delay}s`,
      sparkleDelay: glimmer.delay
    }));
  }

  function typePlatePath(food) {
    return appSpritePath(`header/food_type_plate/${typeSpriteSlug(food?.foodType)}_type_plate.png`);
  }

  function calorieBubblePath(food) {
    return appSpritePath(`header/calorie_bubble/${typeSpriteSlug(food?.foodType)}_calorie_bubble.png`);
  }

  function separatorPath(food) {
    return appSpritePath(`ui/section_separator/${typeSpriteSlug(food?.foodType)}_section_separator.png`);
  }

  function indicatorPath(food, highlighted = false) {
    return appSpritePath(`ui/section_indicator/${typeSpriteSlug(food?.foodType)}_${highlighted ? 'highlighted_' : ''}section_indicator.png`);
  }

  function defaultLayout() {
    return clone(window.FOODRANKED_DISPLAY_BUILDER_DEFAULT_LAYOUT || {
      canvas: { width: AUTHOR_GRID.width, height: AUTHOR_GRID.height, background: '#d6d6d6' },
      sections: {}
    });
  }

  function loadSavedLayouts() {
    const raw = readJson(localStorage.getItem(SAVED_LAYOUTS_KEY), []);
    const entries = Array.isArray(raw) ? raw : Object.values(raw || {});
    return entries.filter(entry => entry?.sections && entry.id);
  }

  function loadDisplayBuilderLayout() {
    const saved = readJson(localStorage.getItem(DISPLAY_LAYOUT_KEY), null);
    return saved?.sections ? saved : null;
  }

  function layoutSourceOptions() {
    const options = [
      { id: 'display-builder', label: loadDisplayBuilderLayout() ? 'Display builder saved layout' : 'Display builder saved layout (empty)' },
      { id: 'default', label: 'Repo default layout' },
      ...state.savedLayouts.map(layout => ({ id: `saved:${layout.id}`, label: layout.name || 'Saved layout' }))
    ];
    return options;
  }

  function selectedLayoutBase() {
    if (state.layoutSourceId === 'display-builder') {
      return clone(loadDisplayBuilderLayout() || window.FOODRANKED_DISPLAY_BUILDER_DEFAULT_LAYOUT);
    }
    if (state.layoutSourceId.startsWith('saved:')) {
      const id = state.layoutSourceId.slice(6);
      const saved = state.savedLayouts.find(layout => layout.id === id);
      if (saved) {
        const base = defaultLayout();
        base.sections = clone(saved.sections);
        return base;
      }
    }
    return defaultLayout();
  }

  function getSectionLayers(layout, sectionId) {
    if (!layout.sections) layout.sections = {};
    if (!layout.sections[sectionId]) layout.sections[sectionId] = { layers: [] };
    if (!Array.isArray(layout.sections[sectionId].layers)) layout.sections[sectionId].layers = [];
    return layout.sections[sectionId].layers;
  }

  function isSpriteLayer(layer) {
    return layer?.kind === 'sprite' && typeof layer.src === 'string';
  }

  function isTextLayer(layer) {
    return layer?.kind === 'text';
  }

  function isHeaderSprite(layer) {
    const fingerprint = `${layer?.src || ''} ${layer?.label || ''}`.toLowerCase();
    return isSpriteLayer(layer) && fingerprint.includes('/header/');
  }

  function isHeaderText(layer) {
    if (!isTextLayer(layer)) return false;
    const id = String(layer.id || '').toLowerCase();
    const fingerprint = `${layer.id || ''} ${layer.label || ''}`.toLowerCase();
    if (['food_name_text', 'kcal_label_text', 'kcal_value_text', 'basis_text', 'script_caption', 'subline_c'].includes(id)) return true;
    return /header/.test(fingerprint) && /(food|name|type|basis|100g|per|calorie|kcal|score|tier)/.test(fingerprint);
  }

  function isUiSprite(layer) {
    return isSpriteLayer(layer) && String(layer.src || '').toLowerCase().includes('/ui/');
  }

  function isSectionIndicator(layer) {
    const fingerprint = `${layer?.src || ''} ${layer?.label || ''} ${layer?.id || ''}`.toLowerCase();
    return isSpriteLayer(layer) && (fingerprint.includes('/ui/section_indicator/') || fingerprint.includes('section indicator'));
  }

  function isPersistentChrome(layer) {
    return isHeaderSprite(layer) || isHeaderText(layer) || (isUiSprite(layer) && !isSectionIndicator(layer));
  }

  function indicatorSectionIndex(sectionId) {
    return SECTIONS.findIndex(section => section.id === sectionId);
  }

  function compareIndicatorsByPosition(a, b) {
    return (Number(a.x) || 0) - (Number(b.x) || 0) || (Number(a.y) || 0) - (Number(b.y) || 0);
  }

  function isMicrosBar(layer) {
    return isSpriteLayer(layer) && /\/micros_section\/bars\/\d+(?:%25|%)_bar\./i.test(String(layer.src || ''));
  }

  function microsBarPercent(layer) {
    const match = String(layer?.src || '').match(/\/(\d+)(?:%25|%)_bar\./i);
    return match ? Number(match[1]) : null;
  }

  function layerCenterX(layer) {
    return (Number(layer?.x) || 0) + ((Number(layer?.width) || 0) / 2);
  }

  function microsColumns(layers) {
    const columns = layers
      .filter(isMicrosBar)
      .map(layer => ({ layer, percent: microsBarPercent(layer), centerX: layerCenterX(layer) }))
      .sort((a, b) => a.centerX - b.centerX || a.percent - b.percent)
      .reduce((result, item) => {
        const column = result.find(candidate => Math.abs(candidate.centerX - item.centerX) <= 4);
        if (column) {
          column.items.push(item);
          column.centerX = column.items.reduce((sum, current) => sum + current.centerX, 0) / column.items.length;
        } else {
          result.push({ centerX: item.centerX, items: [item] });
        }
        return result;
      }, []);
    return columns
      .map(column => ({ ...column, items: column.items.sort((a, b) => a.percent - b.percent) }))
      .sort((a, b) => a.centerX - b.centerX);
  }

  function nearestColumn(columns, layer, fallbackIndex) {
    if (!columns.length) return null;
    const targetX = layer ? layerCenterX(layer) : null;
    if (targetX == null) return columns[fallbackIndex] || columns[0];
    return columns.reduce((closest, column) => (
      Math.abs(column.centerX - targetX) < Math.abs(closest.centerX - targetX) ? column : closest
    ), columns[0]);
  }

  function micronutrientStep(value) {
    const safe = asNumber(value, null);
    if (safe == null || safe <= 0) return null;
    return clamp(Math.max(1, Math.floor(safe / 10)), 1, 10);
  }

  function syncHeader(layout, food) {
    const values = {
      food_name_text: food?.name || 'Unknown',
      kcal_value_text: String(food?.header?.kcal ?? food?.kcal ?? 'N/A'),
      basis_text: `PER\n${food?.basis?.value || 100}${String(food?.basis?.unit || 'g').toUpperCase()}`,
      script_caption: prettyFoodType(food?.foodType).toUpperCase(),
      outro_score_value: formatOverallScore(food)
    };

    for (const section of SECTIONS) {
      for (const layer of getSectionLayers(layout, section.id)) {
        if (isTextLayer(layer) && values[layer.id] != null) {
          layer.text = values[layer.id];
        }
        if (!isSpriteLayer(layer)) continue;
        const fingerprint = `${layer.src || ''} ${layer.label || ''}`.toLowerCase();
        if (fingerprint.includes('/header/food_images/') || /header food image$/.test(fingerprint)) {
          layer.src = foodImagePath(food);
          layer.fallbackSrc = foodPlatePath(food);
        } else if (fingerprint.includes('/header/food_type_plate/') || /header food type/.test(fingerprint)) {
          layer.src = typePlatePath(food);
        } else if (fingerprint.includes('/header/calorie_bubble/') || /header calorie bubble/.test(fingerprint)) {
          layer.src = calorieBubblePath(food);
        } else if (fingerprint.includes('/header/food_plate/') || fingerprint.includes('/header/food_image_plate/') || /header food image plate/.test(fingerprint)) {
          layer.src = foodPlatePath(food);
        } else if (fingerprint.includes('/ui/section_separator/') || /section separator/.test(fingerprint)) {
          layer.src = separatorPath(food);
        }
      }
    }
  }

  function syncSectionIndicators(layout, food) {
    for (const section of SECTIONS) {
      const layers = getSectionLayers(layout, section.id).filter(isSectionIndicator)
        .sort(compareIndicatorsByPosition);
      const activeIndex = indicatorSectionIndex(section.id);
      layers.forEach((layer, index) => {
        const highlighted = index === activeIndex;
        layer.src = indicatorPath(food, highlighted);
        layer.width = highlighted ? SECTION_INDICATOR_LAYOUT.highlightedSize : SECTION_INDICATOR_LAYOUT.normalSize;
        layer.height = highlighted ? SECTION_INDICATOR_LAYOUT.highlightedSize : SECTION_INDICATOR_LAYOUT.normalSize;
        layer.visible = true;
      });
    }
  }

  function syncMacroText(layout, food) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      const layers = getSectionLayers(layout, sectionId);
      macroSubmetricBindings(layout, sectionId).forEach((binding, index) => {
        const spec = binding.spec;
        const label = layers.find(layer => layer.id === `${sectionId}_submacro_label_${index + 1}`);
        const value = layers.find(layer => layer.id === `${sectionId}_submacro_value_${index + 1}`);
        if (label && !label.manualText) label.text = spec.label;
        if (value) {
          if (!value.manualText) value.text = spec.value(food);
          value.color = macroArrowPresentation(food, sectionId, spec).textColor;
        }
      });
    }
  }

  function macroScoreRows(layers) {
    const candidates = layers
      .filter(layer => isMacroScoreCard(layer) || isMacroArrow(layer))
      .map(layer => ({
        layer,
        id: layer.id || '',
        label: layer.label || '',
        src: layer.src || '',
        x: Number(layer.x) || 0,
        y: Number(layer.y) || 0,
        width: Number(layer.width) || 0,
        height: Number(layer.height) || 0
      }))
      .sort((a, b) => a.y - b.y || a.x - b.x);

    const rows = [];
    for (const item of candidates) {
      const centerY = item.y + ((item.height || 0) / 2);
      const existing = rows.find(row => Math.abs(centerY - row.centerY) <= 9);
      if (existing) {
        existing.items.push(item);
        existing.minX = Math.min(existing.minX, item.x);
        existing.maxX = Math.max(existing.maxX, item.x + item.width);
        existing.minY = Math.min(existing.minY, item.y);
        existing.maxY = Math.max(existing.maxY, item.y + item.height);
        existing.centerY = (existing.minY + existing.maxY) / 2;
      } else {
        rows.push({
          items: [item],
          minX: item.x,
          maxX: item.x + item.width,
          minY: item.y,
          maxY: item.y + item.height,
          centerY
        });
      }
    }
    return rows.sort((a, b) => a.minY - b.minY).slice(0, 4);
  }

  function macroSubmetricBindings(layout, sectionId) {
    const layers = getSectionLayers(layout, sectionId);
    const rows = macroScoreRows(layers);
    const specs = MACRO_SUBMETRIC_SPECS[sectionId] || [];
    return specs.map((spec, index) => {
      const row = rows[index] || { items: [], minX: 8, maxX: 91, minY: 74 + (index * 18) };
      const arrowLayers = row.items.filter(item => isMacroArrow(item.layer)).map(item => item.layer);
      const arrowMinX = arrowLayers.length ? Math.min(...arrowLayers.map(layer => Number(layer.x) || 0)) : null;
      const valueWidth = 22;
      const labelX = clamp(Math.round(row.minX + 12), 4, 96);
      const valueX = arrowMinX == null
        ? clamp(Math.round(Math.max(labelX + 24, row.maxX - 30)), 34, 124)
        : clamp(Math.round(arrowMinX - valueWidth - 3), 34, 124);
      const y = clamp(Math.round(row.minY + 3), 42, 220);
      return {
        spec,
        row,
        arrowLayers,
        arrowMinX,
        labelX,
        valueX,
        y,
        labelWidth: Math.max(26, valueX - labelX - 4),
        valueWidth
      };
    });
  }

  function ensureMacroTextLayers(layout) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      const layers = getSectionLayers(layout, sectionId);
      const topZ = layers.reduce((max, layer) => Math.max(max, Number(layer.z) || 0), 0) + 2;
      macroSubmetricBindings(layout, sectionId).forEach((binding, index) => {
        const labelId = `${sectionId}_submacro_label_${index + 1}`;
        const valueId = `${sectionId}_submacro_value_${index + 1}`;
        let label = layers.find(layer => layer.id === labelId);
        let value = layers.find(layer => layer.id === valueId);
        if (!label) {
          label = {
            id: labelId,
            kind: 'text',
            label: `${sectionId.toUpperCase()} score card label ${index + 1}`,
            x: binding.labelX,
            y: binding.y,
            z: topZ,
            visible: true,
            text: binding.spec.label,
            fontSize: 4,
            width: binding.labelWidth,
            align: 'left'
          };
          layers.push(label);
        }
        if (!value) {
          value = {
            id: valueId,
            kind: 'text',
            label: `${sectionId.toUpperCase()} score card value ${index + 1}`,
            x: binding.valueX,
            y: binding.y,
            z: topZ,
            visible: true,
            text: 'N/A',
            fontSize: 4,
            width: binding.valueWidth,
            align: 'right'
          };
          layers.push(value);
        }
        label.label = `${sectionId.toUpperCase()} score card label ${index + 1}`;
        label.fontSize = label.fontSize || 4;
        label.align = label.align || 'left';
        label.width = label.width || binding.labelWidth;
        label.z = label.z || topZ;
        value.label = `${sectionId.toUpperCase()} score card value ${index + 1}`;
        value.fontSize = value.fontSize || 4;
        value.align = value.align || 'right';
        value.z = value.z || topZ;
        const valueRight = (Number(value.x) || 0) + (Number(value.width) || binding.valueWidth);
        const overlapsArrowSlot = binding.arrowMinX != null && valueRight > binding.arrowMinX - 2;
        if (overlapsArrowSlot && !value.manualPosition) {
          value.x = binding.valueX;
          value.y = binding.y;
          value.width = binding.valueWidth;
        }
      });
    }
  }

  function ruleSectionKey(sectionId) {
    return sectionId === 'protein' ? 'proteins' : sectionId;
  }

  function episodeDisplayItemForSpec(food, sectionId, spec) {
    const sectionKey = ruleSectionKey(sectionId);
    const section = food?.episode?.script?.sections?.find(item => item.key === sectionId || item.key === sectionKey);
    return (section?.displayItems || []).find(item => item.metricKey === spec.key) || null;
  }

  function metricRuleForSpec(food, sectionId, spec) {
    const sectionKey = ruleSectionKey(sectionId);
    const bySection = food?.ruleset?.metricRulesBySection?.[sectionKey] || food?.ruleset?.metricRulesBySection?.[sectionId] || [];
    return bySection.find(rule => rule.metricKey === spec.key) || null;
  }

  function rawMetricValueForSpec(food, sectionId, spec) {
    if (sectionId === 'protein' && spec.key === 'protein_g') return asNumber(food?.header?.protein_g, null);
    return asNumber(food?.metrics?.[spec.key], null);
  }

  function ruleBandForValue(rule, value) {
    if (!rule || value == null) return null;
    return (rule.bands || []).find(band => {
      const aboveMin = band.min == null || value >= Number(band.min);
      const belowMax = band.max == null || value < Number(band.max);
      return aboveMin && belowMax;
    }) || null;
  }

  function batchMetricBreakdownItemForSpec(food, sectionId, spec) {
    const sectionKey = ruleSectionKey(sectionId);
    const metricKeys = [spec.key, ...(spec.displayMetricKeys || [])];
    const breakdown = food?.batchResult?.metricBreakdown || [];
    return breakdown.find(item => {
      return metricKeys.includes(item.metricKey) && (!item.sectionKey || item.sectionKey === sectionId || item.sectionKey === sectionKey);
    }) || null;
  }

  function arrowBandForSpec(food, sectionId, spec) {
    const displayItem = episodeDisplayItemForSpec(food, sectionId, spec);
    if (displayItem?.band) return displayItem.band;
    const batchBreakdownItem = batchMetricBreakdownItemForSpec(food, sectionId, spec);
    if (batchBreakdownItem?.band) return batchBreakdownItem.band;
    const rule = metricRuleForSpec(food, sectionId, spec);
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

  function macroArrowPresentation(food, sectionId, spec) {
    const rule = metricRuleForSpec(food, sectionId, spec);
    const parsed = parseArrowBand(arrowBandForSpec(food, sectionId, spec), rule?.polarity);
    const higherWorse = rule?.polarity === 'higher_worse';
    const proteinReferenceValue = sectionId === 'protein' ? rawMetricValueForSpec(food, sectionId, spec) : null;
    const proteinReferenceColor = proteinReferenceTextColor(spec.key, proteinReferenceValue);
    const proteinReferenceArrow = sectionId === 'protein'
      ? proteinReferenceArrowPresentation(spec.key, proteinReferenceValue)
      : null;
    const count = parsed.count || proteinReferenceArrow?.count || 0;
    const color = parsed.count ? parsed.color : proteinReferenceArrow?.color || parsed.color;
    const direction = parsed.count ? parsed.direction : proteinReferenceArrow?.direction || parsed.direction;
    const pointsDown = direction ? direction === 'down' : color === 'green' ? higherWorse : !higherWorse;
    return {
      ...parsed,
      count,
      color,
      direction,
      flipY: !!count && pointsDown,
      textColor: parsed.count
        ? (SUBMACRO_VALUE_COLORS[color] || SUBMACRO_VALUE_COLORS.neutral)
        : proteinReferenceValue != null
          ? proteinReferenceColor
          : SUBMACRO_VALUE_COLORS.neutral
    };
  }

  function proteinReferenceTextColor(metricKey, value) {
    const safe = asNumber(value, null);
    if (safe == null) return SUBMACRO_VALUE_COLORS.neutral;
    if (metricKey === 'collagen_g') return safe >= 3 ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red;
    if (metricKey === 'essential_amino_acids_score') return safe >= 6 ? SUBMACRO_VALUE_COLORS.green : safe >= 3 ? SUBMACRO_VALUE_COLORS.neutral : SUBMACRO_VALUE_COLORS.red;
    if (metricKey === 'nonessential_amino_acids_score') return safe >= 8 ? SUBMACRO_VALUE_COLORS.green : safe >= 4 ? SUBMACRO_VALUE_COLORS.neutral : SUBMACRO_VALUE_COLORS.red;
    if (metricKey === 'bioavailability_percent') return safe >= 60 ? SUBMACRO_VALUE_COLORS.green : safe >= 40 ? SUBMACRO_VALUE_COLORS.neutral : SUBMACRO_VALUE_COLORS.red;
    return SUBMACRO_VALUE_COLORS.green;
  }

  function proteinReferenceArrowPresentation(metricKey, value) {
    const safe = asNumber(value, null);
    if (safe == null) return null;
    if (metricKey === 'collagen_g') return safe >= 3
      ? { count: 2, color: 'green', direction: null }
      : { count: 1, color: 'red', direction: null };
    if (metricKey === 'essential_amino_acids_score') {
      if (safe >= 8) return { count: 3, color: 'green', direction: null };
      if (safe >= 6) return { count: 2, color: 'green', direction: null };
      if (safe >= 3) return { count: 1, color: 'green', direction: null };
      return { count: 3, color: 'red', direction: null };
    }
    if (metricKey === 'nonessential_amino_acids_score') {
      if (safe >= 10) return { count: 3, color: 'green', direction: null };
      if (safe >= 8) return { count: 2, color: 'green', direction: null };
      if (safe >= 4) return { count: 1, color: 'green', direction: null };
      return { count: 3, color: 'red', direction: null };
    }
    if (metricKey === 'bioavailability_percent') {
      if (safe >= 85) return { count: 3, color: 'green', direction: null };
      if (safe >= 60) return { count: 2, color: 'green', direction: null };
      if (safe >= 40) return { count: 1, color: 'green', direction: null };
      return { count: 3, color: 'red', direction: null };
    }
    return { count: 1, color: 'green', direction: null };
  }

  function visibleArrowIndexes(count, total) {
    if (count >= total) return new Set(Array.from({ length: total }, (_, index) => index));
    if (count === 1) return new Set([Math.floor(total / 2)]);
    if (count === 2 && total >= 3) return new Set([0, total - 1]);
    return new Set(Array.from({ length: Math.max(0, count) }, (_, index) => index));
  }

  function syncMacroArrows(layout, food) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      macroSubmetricBindings(layout, sectionId).forEach(binding => {
        const arrows = binding.arrowLayers.sort((a, b) => (Number(a.x) || 0) - (Number(b.x) || 0));
        if (!arrows.length) return;
        const presentation = macroArrowPresentation(food, sectionId, binding.spec);
        const visibleIndexes = visibleArrowIndexes(presentation.count, arrows.length);
        arrows.forEach((layer, index) => {
          layer.src = appSpritePath(`macros_section/arrow_indicators/${presentation.color === 'red' ? 'red' : 'green'}_arrow.png`);
          layer.label = `${presentation.color === 'red' ? 'Red' : 'Green'} ${presentation.flipY ? 'down' : 'up'} arrow indicator`;
          layer.flipY = !!presentation.flipY;
          layer.visible = visibleIndexes.has(index);
        });
      });
    }
  }

  function syncMicros(layout, food, sectionId, specs, labelPrefix, valuePrefix) {
    const layers = getSectionLayers(layout, sectionId);
    const columns = microsColumns(layers);
    specs.forEach((spec, index) => {
      const label = layers.find(layer => layer.id === `${labelPrefix}_${index + 1}`);
      const value = layers.find(layer => layer.id === `${valuePrefix}_${index + 1}`);
      if (label && !label.manualText) label.text = spec.shortLabel;
      if (value && !value.manualText) value.text = formatDvPercent(food, spec.key);

      const step = micronutrientStep(food?.metrics?.[spec.key]);
      const visiblePercent = step == null ? 0 : step * 10;
      const column = nearestColumn(columns, value || label, index);
      if (!column) return;
      column.items.forEach(item => {
        item.layer.visible = step != null && item.percent <= visiblePercent;
      });
      if (value) {
        if (value.manualPosition) return;
        const anchorPercent = Math.max(10, visiblePercent);
        const anchor = column.items.find(item => item.percent === anchorPercent) || column.items[0];
        if (anchor) {
          const bar = anchor.layer;
          const barWidth = Number(bar.width) || 11;
          value.width = Math.max(6, Math.min(10, barWidth));
          value.x = Math.round((Number(bar.x) || 0) + ((barWidth - value.width) / 2));
          value.y = clamp(Math.round((Number(bar.y) || 0) + 1), 44, 220);
          value.align = 'center';
          value.fontSize = 2.5;
          value.z = Math.max(Number(value.z) || 0, (Number(bar.z) || 0) + 5);
        }
      }
    });
  }

  function syncProsCons(layout, food) {
    for (const sectionId of ['pros', 'cons']) {
      const layers = getSectionLayers(layout, sectionId);
      const items = food?.contextItems?.[sectionId] || [];
      for (let index = 0; index < 3; index += 1) {
        const impact = layers.find(layer => layer.id === `${sectionId}_impact_${index + 1}`);
        const item = layers.find(layer => layer.id === `${sectionId}_item_${index + 1}`);
        if (impact && !impact.manualText) impact.text = formatImpact(items[index]?.impactLevel);
        if (item && !item.manualText) item.text = items[index]?.title || `${sectionId === 'pros' ? 'Positive' : 'Negative'} point ${index + 1}`;
      }
    }
  }

  function formatImpact(level) {
    const value = String(level || '').toLowerCase();
    if (value.includes('major')) return 'MAJOR';
    if (value.includes('minor')) return 'MINOR';
    return 'POINT';
  }

  function overallScore(food) {
    return food?.episode?.overallScore ?? food?.overallScore ?? null;
  }

  function formatOverallScore(food) {
    const score = asNumber(overallScore(food), null);
    return score == null ? 'N/A' : formatCompactNumber(score, 0);
  }

  function normalizeOutroScoreLayout(layout) {
    const layer = getSectionLayers(layout, 'outro').find(item => item.id === 'outro_score_value');
    if (!layer) return;
    layer.x = 64;
    layer.y = 24;
    layer.fontSize = 5;
    layer.width = 5;
    layer.align = 'center';
    layer.z = 11;
  }

  function hydrateLayoutForFood() {
    const food = selectedFood();
    const layout = selectedLayoutBase();
    normalizeOutroScoreLayout(layout);
    ensureMacroTextLayers(layout);
    syncHeader(layout, food);
    syncSectionIndicators(layout, food);
    syncMacroText(layout, food);
    syncMacroArrows(layout, food);
    syncMicros(layout, food, 'vitamins', VITAMIN_TEXT_SPECS, 'vitamins_label', 'vitamins_percent');
    syncMicros(layout, food, 'minerals', MINERAL_TEXT_SPECS, 'minerals_label', 'minerals_percent');
    syncProsCons(layout, food);
    state.layout = layout;
    els.layoutStatus.textContent = state.layoutSourceId === 'display-builder' && loadDisplayBuilderLayout() ? 'Saved layout' : 'Default layout';
  }

  function captionFromEpisode(food, sectionId) {
    const subtitleCues = subtitleCuesForScene(food, sectionId);
    if (subtitleCues.length) return subtitleCues.map(cue => cue.lines.join(' ')).join(' ');

    const blocks = food?.episode?.script?.narrationBlocks || [];
    if (sectionId === 'intro') return `${food?.name || 'This food'} ranked.`;
    if (sectionId === 'outro') {
      const summary = blocks.find(block => block.kind === 'closing_summary')?.text || food?.episode?.summary || '';
      const final = blocks.find(block => block.kind === 'final_reveal')?.text || `${food?.episode?.tier || food?.expectedTier || '—'} tier.`;
      return subtitleOnlyCaptionText([summary, final].filter(Boolean).join(' '));
    }
    const episodeKey = sectionId === 'protein' ? 'proteins' : sectionId;
    const sectionSubtitle = food?.episode?.script?.sections?.find(section => section.key === sectionId || section.key === episodeKey)?.subtitleText;
    const narrationFallback = blocks.find(block => block.kind === 'section' && (block.sectionKey === sectionId || block.sectionKey === episodeKey))?.text;
    return subtitleOnlyCaptionText(sectionSubtitle || narrationFallback || fallbackCaption(food, sectionId));
  }

  function episodeSceneId(sectionId) {
    return {
      intro: 'hook',
      protein: 'proteins',
      outro: 'final'
    }[sectionId] || sectionId;
  }

  function subtitleOnlyCaptionText(text) {
    return String(text || '')
      .replace(/\braw grams display\b/gi, 'raw values display')
      .replace(/\b([a-z]+) grams already shown\b/gi, '$1 numbers already shown')
      .replace(/\bmaintenance-and-repair\b/gi, 'maintenance repair')
      .replace(/\b(\d+(?:\.\d+)?)\s+micrograms?\b/gi, '$1mcg')
      .replace(/\b(\d+(?:\.\d+)?)\s+milligrams?\b/gi, '$1mg')
      .replace(/\b(\d+(?:\.\d+)?)\s+kilograms?\b/gi, '$1kg')
      .replace(/\b(\d+(?:\.\d+)?)\s+grams?\b/gi, '$1g')
      .replace(/\b(\d+(?:\.\d+)?)\s+calories?\b/gi, '$1kcal')
      .replace(/\bmicrograms?\b/gi, 'mcg')
      .replace(/\bmilligrams?\b/gi, 'mg')
      .replace(/\bkilograms?\b/gi, 'kg')
      .replace(/\bgrams?\b/gi, 'g')
      .replace(/\b(\d+)\.\s+(\d+)(?=\s*(?:mcg|mg|kg|kcal|g|%|\b))/gi, '$1.$2')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function subtitleCuesForScene(food, sectionId) {
    const sceneId = episodeSceneId(sectionId);
    const cues = food?.episode?.subtitles || [];
    if (!Array.isArray(cues)) return [];
    return cues
      .filter(cue => cue.sceneId === sceneId)
      .map(normalizeSubtitleCue);
  }

  function normalizeSubtitleCue(cue) {
    const rawLines = Array.isArray(cue?.lines) && cue.lines.length
      ? cue.lines
      : String(cue?.text || '').split(/\r?\n/);
    const text = subtitleOnlyCaptionText(rawLines.join(' '));
    const placement = captionPlacementForCue(cue, text);
    const chunks = captionChunks(text, captionLineCharsForPlacement(placement));
    const firstChunk = chunks[0] || { lines: [text].filter(Boolean), text };
    const lines = firstChunk.lines.slice(0, CAPTION_MAX_LINES);
    return {
      ...cue,
      placement,
      maxLines: CAPTION_MAX_LINES,
      maxCharactersPerLine: captionLineCharsForPlacement(placement),
      lines,
      text: lines.join('\n')
    };
  }

  function captionPlacementForCue(cue, text) {
    const normalizedText = subtitleOnlyCaptionText(text || cue?.text || (cue?.lines || []).join(' '));
    if (cue?.sceneId === 'final' && TIER_REVEAL_RE.test(normalizedText)) return 'tier-center';
    if (cue?.placement) {
      const placement = String(cue.placement);
      if (placement === 'tier-center') return 'tier-center';
      if (placement === 'summary-full') return 'summary-full';
      if (cue?.sceneId === 'final' && ['subtitle-floor', 'verdict-payoff', 'outro-center', 'center', 'center-stage'].includes(placement)) {
        return 'summary-full';
      }
      return placement;
    }
    if (cue?.sceneId === 'final') return 'summary-full';
    return 'lower-third';
  }

  function captionLineCharsForPlacement(placement) {
    if (placement === 'summary-full') return CAPTION_SUMMARY_LINE_CHARS;
    if (placement === 'tier-center') return CAPTION_TIER_LINE_CHARS;
    return CAPTION_MAX_LINE_CHARS;
  }

  function fallbackCaption(food, sectionId) {
    const name = food?.name || 'This food';
    const metrics = food?.metrics || {};
    const header = food?.header || {};
    const fallbacks = {
      fats: `${formatMetric(header.fat_g, 'g')} of fat. Saturated fat: ${formatMetric(metrics.saturated_fat_g, 'g')}.`,
      carbs: `${formatMetric(header.carb_g, 'g')} of carbs. Fibre: ${formatMetric(metrics.fibre_g, 'g')}.`,
      protein: `${formatMetric(header.protein_g, 'g')} of protein. Bioavailability: ${formatMetric(metrics.bioavailability_percent, '%')}.`,
      vitamins: `Vitamin support: B12 ${formatDvPercent(food, 'vitamin_b12_dv')}, E ${formatDvPercent(food, 'vitamin_e_dv')}.`,
      minerals: `Mineral support: iron ${formatDvPercent(food, 'iron_dv')}, zinc ${formatDvPercent(food, 'zinc_dv')}.`,
      pros: `${name} has three useful upside points.`,
      cons: `${name} has three practical drawbacks.`
    };
    return fallbacks[sectionId] || `${name} ranked.`;
  }

  function episodeSceneTiming(food, sectionId) {
    const episodeId = episodeSceneId(sectionId);
    return food?.episode?.sceneTimings?.find(scene => scene.id === episodeId) || null;
  }

  function buildScenes(food, previous = []) {
    return SECTIONS.map(section => {
      const existing = previous.find(scene => scene.id === section.id);
      const episodeTiming = episodeSceneTiming(food, section.id);
      const holdSeconds = sectionHoldSeconds(section.id);
      const existingHold = asNumber(existing?.holdSeconds, holdSeconds);
      const contentDuration = Math.max(
        0.4,
        asNumber(existing?.contentDurationSeconds, null)
          ?? (asNumber(existing?.duration, null) != null ? Math.max(0.4, asNumber(existing.duration, 0) - existingHold) : null)
          ?? episodeTiming?.durationSeconds
          ?? section.duration
      );
      return {
        id: section.id,
        label: section.label,
        duration: Number((contentDuration + holdSeconds).toFixed(3)),
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        holdSeconds,
        reveal: existing?.reveal || section.reveal,
        motion: existing?.motion || section.motion,
        captionSize: existing?.captionSize || 22,
        caption: existing?.caption || captionFromEpisode(food, section.id),
        subtitleCues: existing?.subtitleCues || subtitleCuesForScene(food, section.id)
      };
    });
  }

  function sectionHoldSeconds(sectionId) {
    return SECTION_HOLD_IDS.has(sectionId) ? SECTION_HOLD_SECONDS : 0;
  }

  function hideSceneCaptions(scene) {
    return HIDDEN_CAPTION_SECTION_IDS.has(scene?.id);
  }

  function sceneHoldSeconds(scene) {
    return Math.max(0, asNumber(scene?.holdSeconds, sectionHoldSeconds(scene?.id)) || 0);
  }

  function sceneContentDuration(scene) {
    const holdSeconds = sceneHoldSeconds(scene);
    return Math.max(0.4, asNumber(scene?.contentDurationSeconds, null) ?? ((asNumber(scene?.duration, 0) || 0) - holdSeconds));
  }

  function setSceneDuration(scene, duration) {
    const holdSeconds = sceneHoldSeconds(scene);
    const safeDuration = Math.max(0.4 + holdSeconds, asNumber(duration, scene.duration) || scene.duration || 1);
    scene.duration = Number(safeDuration.toFixed(3));
    scene.contentDurationSeconds = Number(Math.max(0.4, safeDuration - holdSeconds).toFixed(3));
    scene.holdSeconds = holdSeconds;
  }

  function sceneStarts() {
    let cursor = 0;
    return state.scenes.map(scene => {
      const start = cursor;
      cursor += scene.duration;
      return { ...scene, start, end: cursor };
    });
  }

  function totalDuration() {
    return state.scenes.reduce((sum, scene) => sum + scene.duration, 0);
  }

  function totalNarrationDuration() {
    return state.scenes.reduce((sum, scene) => sum + sceneContentDuration(scene), 0);
  }

  function totalHoldDuration() {
    return state.scenes.reduce((sum, scene) => sum + sceneHoldSeconds(scene), 0);
  }

  function isSceneHoldAt(time = state.currentTime) {
    const scene = activeSceneAt(time);
    if (!scene) return false;
    const elapsed = clamp(time - scene.start, 0, scene.duration);
    return sceneHoldSeconds(scene) > 0 && elapsed >= sceneContentDuration(scene);
  }

  function videoTimeToAudioTime(time = state.currentTime) {
    const scenes = sceneStarts();
    let audioCursor = 0;
    for (const scene of scenes) {
      const contentDuration = sceneContentDuration(scene);
      if (time < scene.start) return audioCursor;
      if (time <= scene.end) {
        const elapsed = clamp(time - scene.start, 0, scene.duration);
        return audioCursor + Math.min(elapsed, contentDuration);
      }
      audioCursor += contentDuration;
    }
    return audioCursor;
  }

  function audioTimeToVideoTime(audioTime = 0) {
    const scenes = sceneStarts();
    let audioCursor = 0;
    for (const scene of scenes) {
      const contentDuration = sceneContentDuration(scene);
      if (audioTime <= audioCursor + contentDuration) {
        return scene.start + clamp(audioTime - audioCursor, 0, contentDuration);
      }
      audioCursor += contentDuration;
    }
    return totalDuration();
  }

  function audioTimelineKey(food = selectedFood(), duration = null) {
    const audio = audioForFood(food);
    return [
      food?.id || '',
      audio?.take || '',
      audio?.path || '',
      audio?.generatedAt || '',
      Number.isFinite(duration) ? duration.toFixed(3) : ''
    ].join('|');
  }

  function calibrateSceneDurationsToAudio(duration) {
    const audioDuration = asNumber(duration, null);
    if (audioDuration == null || audioDuration <= 0 || !state.scenes.length) return false;

    const key = audioTimelineKey(selectedFood(), audioDuration);
    if (state.audioTimelineKey === key) return false;

    state.audioTimelineKey = key;
    state.audioDurationSeconds = audioDuration;
    const currentNarrationTotal = totalNarrationDuration();
    if (currentNarrationTotal <= 0 || Math.abs(currentNarrationTotal - audioDuration) <= AUDIO_TIMELINE_SYNC_TOLERANCE_SECONDS) {
      return false;
    }

    const ratio = audioDuration / currentNarrationTotal;
    const playheadAudioTime = videoTimeToAudioTime(state.currentTime);
    state.scenes = state.scenes.map(scene => ({
      ...scene,
      contentDurationSeconds: Number(Math.max(0.4, sceneContentDuration(scene) * ratio).toFixed(3)),
      holdSeconds: sceneHoldSeconds(scene),
      duration: Number((Math.max(0.4, sceneContentDuration(scene) * ratio) + sceneHoldSeconds(scene)).toFixed(3))
    }));
    state.currentTime = clamp(audioTimeToVideoTime(playheadAudioTime * ratio), 0, totalDuration());
    return true;
  }

  function activeSceneAt(time = state.currentTime) {
    const scenes = sceneStarts();
    return scenes.find(scene => time >= scene.start && time < scene.end) || scenes[scenes.length - 1];
  }

  function persist() {
    localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify({
      selectedFoodId: state.selectedFoodId,
      layoutSourceId: state.layoutSourceId,
      selectedSceneId: state.selectedSceneId,
      audioEnabled: state.audioEnabled
    }));
  }

  function renderLayoutSourceOptions() {
    const options = layoutSourceOptions();
    els.layoutSource.innerHTML = options.map(option => (
      `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`
    )).join('');
    if (!options.some(option => option.id === state.layoutSourceId)) state.layoutSourceId = 'display-builder';
    els.layoutSource.value = state.layoutSourceId;
  }

  function renderFoodList() {
    const query = state.foodFilter.trim().toLowerCase();
    const visibleFoods = foods
      .filter(food => !query || [food.id, food.name, food.foodType, food.foodTypeLabel].filter(Boolean).some(value => String(value).toLowerCase().includes(query)))
      .slice(0, 80);
    els.foodList.innerHTML = '';
    visibleFoods.forEach(food => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `food-button${food.id === state.selectedFoodId ? ' active' : ''}`;
      button.innerHTML = `<strong>${escapeHtml(food.name)}</strong><span>${escapeHtml(food.foodTypeLabel || prettyFoodType(food.foodType))} · ${escapeHtml(String(food.header?.kcal ?? food.kcal ?? 'N/A'))} kcal</span>`;
      button.addEventListener('click', () => {
        state.selectedFoodId = food.id;
        state.currentTime = 0;
        state.selectedSceneId = 'intro';
        state.audioTimelineKey = '';
        state.audioDurationSeconds = null;
        state.scenes = buildScenes(food);
        hydrateLayoutForFood();
        syncAudioForFood();
        persist();
        renderAll();
      });
      els.foodList.appendChild(button);
    });
  }

  function renderSceneList() {
    const activeTimedScene = activeSceneAt();
    els.sceneList.innerHTML = '';
    sceneStarts().forEach(scene => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `scene-button${scene.id === activeTimedScene.id ? ' active' : ''}`;
      const holdLabel = sceneHoldSeconds(scene) ? ` · ${sceneHoldSeconds(scene).toFixed(1)}s hold` : '';
      button.innerHTML = `<strong>${escapeHtml(scene.label)}</strong><span>${scene.start.toFixed(1)}s - ${scene.end.toFixed(1)}s${holdLabel} · ${escapeHtml(scene.reveal)} · ${escapeHtml(scene.motion)}</span>`;
      button.addEventListener('click', () => {
        state.currentTime = scene.start + 0.02;
        state.selectedSceneId = scene.id;
        stopPlayback();
        renderAll();
      });
      els.sceneList.appendChild(button);
    });
  }

  function renderTimelineStrip() {
    const activeTimedScene = activeSceneAt();
    const total = totalDuration();
    els.timelineStrip.innerHTML = '';
    sceneStarts().forEach(scene => {
      const segment = document.createElement('div');
      segment.className = `strip-segment${scene.id === activeTimedScene.id ? ' active' : ''}`;
      segment.style.width = `${Math.max(42, (scene.duration / total) * 100)}%`;
      const fill = document.createElement('span');
      const progress = scene.id === activeTimedScene.id
        ? clamp((state.currentTime - scene.start) / scene.duration, 0, 1)
        : state.currentTime >= scene.end ? 1 : 0;
      fill.style.transform = `scaleX(${progress})`;
      segment.appendChild(fill);
      els.timelineStrip.appendChild(segment);
    });
  }

  function renderControls() {
    const scene = state.scenes.find(item => item.id === state.selectedSceneId) || activeSceneAt();
    const timedScene = activeSceneAt();
    if (timedScene && state.selectedSceneId !== timedScene.id) state.selectedSceneId = timedScene.id;
    const selected = state.scenes.find(item => item.id === state.selectedSceneId) || scene;
    els.activeSceneTitle.textContent = selected?.label || 'Scene';
    els.sceneStatus.textContent = selected
      ? `${selected.duration.toFixed(1)}s${sceneHoldSeconds(selected) ? ` · ${sceneHoldSeconds(selected).toFixed(1)}s hold` : ''}`
      : '0.0s';
    els.sceneDuration.value = selected?.duration ?? '';
    els.revealStyle.value = selected?.reveal || 'cascade';
    els.spriteMotion.value = selected?.motion || 'bob';
    els.captionSize.value = selected?.captionSize || 22;
    els.captionText.value = selected?.caption || '';
    els.playPause.textContent = state.playing ? 'Pause' : 'Play';
    updateAudioControls();

    const total = totalDuration();
    els.timeScrub.max = String(Math.max(1, Math.round(total * 100)));
    els.timeScrub.value = String(Math.round(state.currentTime * 100));
    els.timeReadout.textContent = `${state.currentTime.toFixed(1)}s / ${total.toFixed(1)}s`;
  }

  function renderManifest() {
    els.manifestOutput.value = JSON.stringify(buildManifest(), null, 2);
  }

  function buildManifest() {
    const food = selectedFood();
    return {
      version: 'foodranked-video-builder-v1',
      foodId: food?.id || null,
      foodName: food?.name || null,
      layoutSource: state.layoutSourceId,
      canvas: { width: AUTHOR_GRID.width, height: AUTHOR_GRID.height, aspect: '9:16' },
      audio: audioForFood(food),
      duration: Number(totalDuration().toFixed(2)),
      narrationDuration: Number(totalNarrationDuration().toFixed(2)),
      totalHoldSeconds: Number(totalHoldDuration().toFixed(2)),
      holdMode: 'post-section-dwell',
      audioHoldSeconds: Number(totalHoldDuration().toFixed(2)),
      scenes: sceneStarts().map(scene => sceneManifestEntry(scene, food))
    };
  }

  function sceneManifestEntry(scene, food) {
    const timing = sceneTimingModel(scene);
    const layerSchedule = sceneLayerRevealSchedule(scene, food);
    const contentDuration = sceneContentDuration(scene);
    const holdSeconds = sceneHoldSeconds(scene);
    const captionsHidden = hideSceneCaptions(scene);
    return {
      id: scene.id,
      label: scene.label,
      start: Number(scene.start.toFixed(2)),
      end: Number(scene.end.toFixed(2)),
      duration: Number(scene.duration.toFixed(2)),
      narrationDuration: Number(contentDuration.toFixed(2)),
      holdSeconds: Number(holdSeconds.toFixed(2)),
      holdMode: holdSeconds ? 'post-section-dwell' : null,
      holdStart: holdSeconds ? Number((scene.start + contentDuration).toFixed(2)) : null,
      holdEnd: holdSeconds ? Number(scene.end.toFixed(2)) : null,
      reveal: scene.reveal,
      spriteMotion: scene.motion,
      captionSize: scene.captionSize,
      caption: scene.caption,
      captionsHidden,
      subtitleCues: captionsHidden ? [] : (scene.subtitleCues || []).map(cue => {
        const chunk = timing.chunks.find(item => item.cueId && item.cueId === cue.id);
        return {
          id: cue.id,
          startSeconds: cue.startSeconds,
          endSeconds: cue.endSeconds,
          videoStartSeconds: chunk ? Number((scene.start + (chunk.start * contentDuration)).toFixed(3)) : null,
          videoEndSeconds: chunk ? Number((scene.start + (chunk.end * contentDuration)).toFixed(3)) : null,
          placement: cue.placement || null,
          maxLines: CAPTION_MAX_LINES,
          lines: cue.lines,
          text: cue.text,
          wordTimings: Array.isArray(cue.wordTimings) ? clone(cue.wordTimings) : undefined
        };
      }),
      timingModel: {
        source: timing.source || 'weighted-caption-v3',
        sceneStartSeconds: Number(scene.start.toFixed(3)),
        sceneDurationSeconds: Number(scene.duration.toFixed(3)),
        narrationDurationSeconds: Number(contentDuration.toFixed(3)),
        holdSeconds: Number(holdSeconds.toFixed(3)),
        holdMode: holdSeconds ? 'post-section-dwell' : null,
        revealLeadSeconds: AUDIO_REVEAL_LEAD_SECONDS,
        revealWindowSeconds: AUDIO_REVEAL_WINDOW_SECONDS
      },
      revealBeats: timing.sentences.map(segment => ({
        start: Number(segment.start.toFixed(3)),
        end: Number(segment.end.toFixed(3)),
        absoluteStart: Number((scene.start + (segment.start * contentDuration)).toFixed(3)),
        absoluteEnd: Number((scene.start + (segment.end * contentDuration)).toFixed(3)),
        text: segment.text
      })),
      activeWords: timing.words.map(word => ({
        text: word.text,
        start: Number(word.start.toFixed(4)),
        end: Number(word.end.toFixed(4)),
        absoluteStart: Number((scene.start + (word.start * contentDuration)).toFixed(3)),
        absoluteEnd: Number((scene.start + (word.end * contentDuration)).toFixed(3))
      })),
      layerRevealSchedule: layerSchedule.map(entry => ({
        ...entry,
        start: Number(entry.start.toFixed(4)),
        absoluteStart: Number((scene.start + entry.startSeconds).toFixed(3))
      }))
    };
  }

  function backdropPalette(food = selectedFood()) {
    const palettes = {
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
    return palettes[normalizeFoodType(food?.foodType)] || palettes.misc;
  }

  function backgroundFieldGradient(food = selectedFood()) {
    const palette = backdropPalette(food);
    return `radial-gradient(circle at 18% 12%, ${palette.glowA}, transparent 24%), radial-gradient(circle at 82% 16%, ${palette.glowB}, transparent 28%), linear-gradient(180deg, ${palette.top} 0%, ${palette.bottom} 100%)`;
  }

  function persistentChromeLayers(sectionId, food) {
    const sectionLayers = getSectionLayers(state.layout, sectionId);
    const introLayers = getSectionLayers(state.layout, 'intro');
    const sectionChrome = sectionLayers.filter(layer => isPersistentChrome(layer) || isSectionIndicator(layer));
    const introChrome = introLayers.filter(layer => isPersistentChrome(layer) || isSectionIndicator(layer));
    const layers = (sectionChrome.length ? sectionChrome : introChrome).map(clone);
    const indicators = layers.filter(isSectionIndicator).sort(compareIndicatorsByPosition);
    const activeIndex = indicatorSectionIndex(sectionId);
    indicators.forEach((layer, index) => {
      const highlighted = index === activeIndex;
      layer.src = indicatorPath(food, highlighted);
      layer.label = highlighted ? 'Highlighted section indicator' : 'Section indicator';
      layer.width = highlighted ? SECTION_INDICATOR_LAYOUT.highlightedSize : SECTION_INDICATOR_LAYOUT.normalSize;
      layer.height = highlighted ? SECTION_INDICATOR_LAYOUT.highlightedSize : SECTION_INDICATOR_LAYOUT.normalSize;
      layer.z = Math.max(Number(layer.z) || 0, highlighted ? 36 : 25);
      if (highlighted) {
        layer.x = (Number(layer.x) || 0) - 1;
        layer.y = (Number(layer.y) || 0) - 1;
      }
    });
    return layers;
  }

  function sceneContentLayers(sectionId) {
    const layers = getSectionLayers(state.layout, sectionId)
      .filter(layer => !isPersistentChrome(layer) && !isSectionIndicator(layer));
    if (sectionId === 'intro') return [...layers, ...introHookLayers(selectedFood())];
    return layers;
  }

  function sceneLayerRevealSchedule(scene, food = selectedFood()) {
    if (!state.layout || !scene) return [];
    const content = sceneContentLayers(scene.id).map((layer, index) => ({ layer, index, persistent: false }));
    const chrome = persistentChromeLayers(scene.id, food).map((layer, index) => ({ layer, index, persistent: true }));
    const layers = [...content, ...chrome].sort((a, b) => {
      return (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0)
        || (a.persistent === b.persistent ? 0 : a.persistent ? 1 : -1);
    });
    const layerList = layers.map(item => item.layer);
    return layers
      .filter(({ layer }) => layer.visible !== false)
      .map(({ layer, index, persistent }) => layerRevealSchedule(layer, scene, index, persistent, layerList));
  }

  function ensureStageRoots() {
    let bg = els.videoStage.querySelector('.stage-bg');
    let phoneBg = els.videoStage.querySelector('.stage-phone-bg');
    let layerRoot = els.videoStage.querySelector('.stage-layer-root');
    let vignette = els.videoStage.querySelector('.stage-vignette');
    let caption = els.videoStage.querySelector('.caption-box');
    if (bg && phoneBg && layerRoot && vignette && caption) {
      return { bg, phoneBg, layerRoot, vignette, caption };
    }

    els.videoStage.innerHTML = '';
    bg = document.createElement('div');
    bg.className = 'stage-bg';
    phoneBg = document.createElement('div');
    phoneBg.className = 'stage-phone-bg';
    layerRoot = document.createElement('div');
    layerRoot.className = 'stage-layer-root';
    vignette = document.createElement('div');
    vignette.className = 'stage-vignette';
    caption = document.createElement('div');
    caption.className = 'caption-box';
    els.videoStage.append(bg, phoneBg, layerRoot, vignette, caption);
    return { bg, phoneBg, layerRoot, vignette, caption };
  }

  function renderStage() {
    const food = selectedFood();
    const scene = activeSceneAt();
    if (!state.layout || !scene) return;

    const roots = ensureStageRoots();
    const contentDuration = sceneContentDuration(scene);
    const sceneElapsed = clamp(state.currentTime - scene.start, 0, scene.duration);
    const sceneProgress = clamp(sceneElapsed / contentDuration, 0, 1);
    const inHold = sceneHoldSeconds(scene) > 0 && sceneElapsed >= contentDuration;
    const content = sceneContentLayers(scene.id).map((layer, index) => ({ layer, index, persistent: false }));
    const chrome = persistentChromeLayers(scene.id, food).map((layer, index) => ({ layer, index, persistent: true }));
    const layers = [...content, ...chrome].sort((a, b) => {
      return (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0)
        || (a.persistent === b.persistent ? 0 : a.persistent ? 1 : -1);
    });
    els.videoStage.style.backgroundColor = state.layout?.canvas?.background || '#d6d6d6';
    roots.bg.style.background = backgroundFieldGradient(food);
    void renderDynamicBackground(roots.bg, food);
    roots.layerRoot.innerHTML = '';

    const layerList = layers.map(item => item.layer);
    layers.forEach(({ layer, index, persistent }) => {
      if (layer.visible === false) return;
      const node = document.createElement(layer.kind === 'sprite' ? 'img' : 'div');
      const effectClass = layer.effect ? ` ${String(layer.effect).replace(/[^a-z0-9_-]+/gi, '-')}` : '';
      node.className = `layer-node ${layer.kind}${layer.kind === 'text' ? ' pixel-text' : ''}${effectClass}`;
      if (layer.animationDelay != null) node.style.animationDelay = String(layer.animationDelay);
      node.dataset.layerId = layer.id || '';
      node.dataset.persistent = persistent ? 'true' : 'false';
      const revealSchedule = layerRevealSchedule(layer, scene, index, persistent, layerList);
      const revealDelay = revealSchedule.start;
      node.dataset.revealDelay = revealDelay.toFixed(3);
      node.dataset.revealFamily = revealSchedule.family;
      node.dataset.revealKind = revealSchedule.kind;
      node.style.zIndex = String(Number(layer.z) || 0);
      applyLayerBox(node, layer);
      applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent, revealDelay);
      if (layer.kind === 'sprite') {
        node.src = spritePath(layer.src);
        node.alt = layer.label || '';
        node.onerror = () => {
          if (layer.fallbackSrc && node.src !== new URL(spritePath(layer.fallbackSrc), window.location.href).href) {
            node.src = spritePath(layer.fallbackSrc);
          }
        };
      } else {
        node.textContent = layer.text || '';
        node.style.color = layer.color || '#fff7e9';
        node.style.fontSize = `calc(${Number(layer.fontSize) || 6}px * var(--pixel-unit))`;
        if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit))`;
        node.style.textAlign = layer.align || 'left';
      }
      roots.layerRoot.appendChild(node);
    });

    syncCaptionSafeArea(roots.caption);
    if (hideSceneCaptions(scene)) {
      roots.caption.dataset.captionKey = '';
      roots.caption.removeAttribute('aria-label');
      roots.caption.replaceChildren();
      roots.caption.style.opacity = '0';
    } else {
      const frame = captionFrame(scene, sceneProgress);
      roots.caption.style.fontSize = captionFontSize(scene, frame);
      renderCaption(roots.caption, scene, sceneProgress, frame);
      roots.caption.style.opacity = inHold ? '0' : String(easeOutCubic((sceneProgress + 0.05) * 4));
    }
  }

  function captionFontSize(scene, frame) {
    if (frame.placement === 'tier-center') return 'calc(44px * 0.25 * var(--pixel-unit))';
    if (frame.placement === 'summary-full') return 'calc(22px * 0.25 * var(--pixel-unit))';
    return `calc(${Number(scene.captionSize) || 22}px * 0.25 * var(--pixel-unit))`;
  }

  function defaultBackgroundMotion() {
    return window.FOODRANKED_DISPLAY_BUILDER_DEFAULT_LAYOUT?.canvas?.backgroundMotion || {
      enabled: true,
      mode: 'foodType',
      density: 12,
      opacity: 0.18,
      minDuration: 14,
      maxDuration: 24,
      minSize: 24,
      maxSize: 40,
      drift: 16
    };
  }

  function getResponsiveAssetScale() {
    const desktopComfortable = window.innerWidth >= 1600 && window.innerHeight >= 900;
    if (desktopComfortable) return 4;

    const compactLaptop = (window.innerWidth <= 1500 || window.innerHeight <= 850) && window.innerWidth > 920;
    const laptopCanvasCrop = window.innerWidth <= 1500 && window.innerWidth > 920;
    const tightLaptop = window.innerWidth <= 1180 && window.innerWidth > 920;
    const reservedWidth = tightLaptop ? 530 : (compactLaptop ? 660 : 690);
    const reservedHeight = tightLaptop ? 154 : (compactLaptop ? 150 : 210);
    const minimumScale = tightLaptop ? 1.12 : (compactLaptop ? 1.30 : 1.45);
    const verticalRoom = Math.max(300, window.innerHeight - reservedHeight);
    const scaleFromHeight = laptopCanvasCrop
      ? (verticalRoom - 12) / (AUTHOR_GRID.height * (7 / 9))
      : (((verticalRoom * 9) / 16) - 12) / AUTHOR_GRID.width;
    const scaleFromWidth = laptopCanvasCrop
      ? (Math.max(280, window.innerWidth - reservedWidth) - 24) / (AUTHOR_GRID.width * (7 / 9))
      : (Math.max(280, window.innerWidth - reservedWidth) - 24) / AUTHOR_GRID.width;
    return Math.max(minimumScale, Math.min(4, scaleFromHeight, scaleFromWidth));
  }

  function setCanvasScale() {
    document.documentElement.style.setProperty('--pixel-unit', String(getResponsiveAssetScale()));
  }

  async function renderDynamicBackground(field, food) {
    const motion = { ...defaultBackgroundMotion(), ...((state.layout?.canvas?.backgroundMotion) || {}) };
    const key = JSON.stringify({
      foodId: food?.id || '',
      foodType: normalizeFoodType(food?.foodType),
      motion
    });
    if (state.backgroundKey === key && field.childElementCount) return;
    state.backgroundKey = key;
    const token = state.backgroundToken + 1;
    state.backgroundToken = token;
    field.innerHTML = '';
    if (motion.enabled === false) return;

    let sourcePool = [];
    if (motion.mode === 'allFoods') {
      sourcePool = [...foods];
    } else if (motion.mode === 'selectedFood') {
      sourcePool = [food];
    } else {
      sourcePool = [food, ...foods.filter(item => item.id !== food?.id && normalizeFoodType(item.foodType) === normalizeFoodType(food?.foodType))];
    }
    sourcePool = sourcePool.filter(Boolean);
    if (!sourcePool.length && food) sourcePool = [food];
    if (!sourcePool.length) return;

    const enrichedPool = sourcePool.map(item => {
      const candidates = foodSpriteCandidates(item);
      const hasPrimary = hasCustomFoodImage(item);
      return {
        food: item,
        src: spritePath(hasPrimary ? candidates.primary : candidates.fallback),
        usedFallback: !hasPrimary,
        fallback: spritePath(candidates.fallback)
      };
    });
    if (token !== state.backgroundToken) return;

    const selectedPrimary = enrichedPool.find(item => item.food?.id === food?.id && !item.usedFallback);
    const primaryPool = enrichedPool.filter(item => !item.usedFallback);
    const renderPool = selectedPrimary
      ? [selectedPrimary, ...primaryPool.filter(item => item.food?.id !== food?.id)]
      : (primaryPool.length ? primaryPool : enrichedPool);
    const onlyFallbacks = !primaryPool.length;

    const density = Math.max(1, Number(motion.density) || defaultBackgroundMotion().density);
    const minDuration = Math.max(4, Number(motion.minDuration) || defaultBackgroundMotion().minDuration);
    const maxDuration = Math.max(minDuration, Number(motion.maxDuration) || defaultBackgroundMotion().maxDuration);
    const minSize = Math.max(12, Number(motion.minSize) || defaultBackgroundMotion().minSize);
    const maxSize = Math.max(minSize, Number(motion.maxSize) || defaultBackgroundMotion().maxSize);
    const drift = Math.max(0, Number(motion.drift) || 0);
    const opacity = Math.min(0.5, Math.max(0.04, Number(motion.opacity) || defaultBackgroundMotion().opacity));

    Array.from({ length: density }).forEach((_, index) => {
      const choice = renderPool[index % renderPool.length] || renderPool[0];
      const img = document.createElement('img');
      const progress = density <= 1 ? 0.5 : index / (density - 1);
      const sizeBias = onlyFallbacks ? 0.72 : 1;
      const size = Math.round((minSize + (maxSize - minSize) * ((index % 5) / 4 || 0)) * sizeBias);
      const duration = Math.round(minDuration + (maxDuration - minDuration) * ((index % 7) / 6 || 0) + (onlyFallbacks ? 4 : 0));
      img.className = 'bg-sprite';
      img.src = choice?.src || choice?.fallback;
      img.alt = '';
      img.style.left = `${8 + progress * 76}%`;
      img.style.top = `${-40 - (index % 5) * 26}px`;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center';
      img.style.opacity = String(onlyFallbacks ? Math.min(opacity, 0.12) : opacity);
      img.style.animationDuration = `${duration}s`;
      img.style.animationDelay = `${-(index * 1.7)}s`;
      img.style.setProperty('--drift-x', `${(index % 2 === 0 ? 1 : -1) * Math.max(2, drift - (index % 4) * 2)}px`);
      img.onerror = () => {
        if (choice?.fallback && img.src !== new URL(choice.fallback, window.location.href).href) {
          img.src = choice.fallback;
        }
      };
      field.appendChild(img);
    });
  }

  function captionChunks(text, maxLineChars = CAPTION_MAX_LINE_CHARS) {
    const source = subtitleOnlyCaptionText(text);
    if (!source) return [];
    const chunks = [];
    let current = '';
    source.split(/(?<=[.!?])\s+/).forEach(sentence => {
      if ((current + ' ' + sentence).trim().length > maxLineChars * CAPTION_MAX_LINES && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = `${current} ${sentence}`.trim();
      }
    });
    if (current) chunks.push(current.trim());

    const wrapped = [];
    chunks.forEach(chunk => {
      let remaining = chunk;
      while (remaining) {
        const result = wrapCaptionLines(remaining, maxLineChars);
        wrapped.push({
          text: result.lines.join(' '),
          lines: result.lines
        });
        remaining = result.overflow.trim();
      }
    });
    return wrapped;
  }

  function wrapCaptionLines(text, maxLineChars = CAPTION_MAX_LINE_CHARS, maxLines = CAPTION_MAX_LINES) {
    const words = subtitleOnlyCaptionText(text)
      .replace(/\b(\d+)\.\s+(\d+)(?=\s*(?:mcg|mg|kg|kcal|g|%|\b))/gi, '$1.$2')
      .split(/\s+/)
      .filter(Boolean);
    const lines = [];
    let current = '';

    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxLineChars || !current) {
        current = candidate;
        continue;
      }
      lines.push(current);
      current = word;
      if (lines.length === maxLines) {
        return {
          lines,
          overflow: [current, ...words.slice(index + 1)].join(' ')
        };
      }
    }

    if (current) lines.push(current);
    return { lines: lines.slice(0, maxLines), overflow: lines.slice(maxLines).join(' ') };
  }

  function captionWordWeight(word) {
    const text = String(word || '');
    const coreLength = text.replace(/[^a-z0-9]/gi, '').length;
    const punctuationPause = /[.!?]$/.test(text) ? 0.55 : /[,;:]$/.test(text) ? 0.2 : 0;
    const numericExpansion = /\d/.test(text) ? 1.12 : 0;
    const acronymExpansion = /^[A-Z0-9]{2,}$/.test(text.replace(/[^a-z0-9]/gi, '')) ? 0.36 : 0;
    return Math.max(0.68, 0.54 + (coreLength * 0.155) + numericExpansion + acronymExpansion + punctuationPause);
  }

  function speechTokens(value) {
    return normalizeSpeechSearch(value)
      .split(' ')
      .filter(token => token.length > 0);
  }

  function captionSentences(text) {
    const source = String(text || '').replace(/\s+/g, ' ').trim();
    if (!source) return [];
    return source.split(/(?<=[.!?])\s+/).map(item => item.trim()).filter(Boolean);
  }

  function sectionAnchorSeed(scene) {
    const sectionTerms = SECTION_ANCHOR_TERMS[scene?.id] || [];
    if (sectionTerms.length) return sectionTerms;
    return [scene?.label, scene?.id].filter(Boolean);
  }

  function sceneTimingModel(scene) {
    const cueTiming = sceneCueTimingModel(scene);
    if (cueTiming) return cueTiming;

    const source = String(scene?.caption || '').replace(/\s+/g, ' ').trim();
    const rawSentences = captionSentences(source);
    if (!rawSentences.length) {
      return {
        source: 'weighted-caption-v3',
        text: '',
        duration: sceneContentDuration(scene),
        totalWeight: 0,
        sentences: [],
        chunks: [],
        words: [],
        anchors: {}
      };
    }

    const duration = Math.max(1, sceneContentDuration(scene));
    const sentences = rawSentences.map((sentence, sentenceIndex) => {
      const words = sentence.split(/\s+/).filter(Boolean).map((word, index) => ({
        text: word,
        clean: normalizeSpeechSearch(word),
        tokens: speechTokens(word),
        sentenceIndex,
        index,
        weight: captionWordWeight(word)
      }));
      const pauseWeight = sentenceIndex === rawSentences.length - 1 ? 0 : 0.35;
      return {
        text: sentence,
        sentenceIndex,
        words,
        weight: words.reduce((sum, word) => sum + word.weight, 0) + pauseWeight
      };
    });
    const totalWeight = sentences.reduce((sum, sentence) => sum + sentence.weight, 0) || 1;
    let cursor = 0;
    const timedSentences = sentences.map(sentence => {
      const start = cursor / totalWeight;
      const wordStartCursor = cursor;
      sentence.words.forEach(word => {
        const wordStart = cursor / totalWeight;
        cursor += word.weight;
        word.start = wordStart;
        word.end = cursor / totalWeight;
        word.startSeconds = word.start * duration;
        word.endSeconds = word.end * duration;
      });
      const wordEnd = cursor / totalWeight;
      cursor += Math.max(0, sentence.weight - (cursor - wordStartCursor));
      return { ...sentence, start, end: cursor / totalWeight, wordEnd };
    });

    const words = timedSentences.flatMap(sentence => sentence.words);
    const chunks = captionChunks(source).map(chunk => {
      const chunkTokens = chunk.text.split(/\s+/).filter(Boolean);
      const chunkStartIndex = words.findIndex((word, index) => (
        chunkTokens.every((token, offset) => words[index + offset]?.text === token)
      ));
      const startIndex = chunkStartIndex >= 0 ? chunkStartIndex : 0;
      const endIndex = chunkStartIndex >= 0 ? startIndex + chunkTokens.length - 1 : Math.max(0, words.length - 1);
      return {
        text: chunk.text,
        lines: chunk.lines,
        startWordIndex: startIndex,
        endWordIndex: endIndex,
        start: words[startIndex]?.start || 0,
        end: words[endIndex]?.end || 1
      };
    });

    const anchors = {};
    sectionAnchorSeed(scene).forEach(term => {
      const start = termStartForTiming({ words, sentences: timedSentences }, [term]);
      if (start != null) anchors[normalizeSpeechSearch(term)] = start;
    });

    return {
      source: 'weighted-caption-v3',
      text: source,
      duration,
      totalWeight,
      sentences: timedSentences,
      chunks,
      words: words.map((word, globalIndex) => ({ ...word, globalIndex })),
      anchors
    };
  }

  function sceneCueTimingModel(scene) {
    const cues = (scene?.subtitleCues || []).filter(cue => cue?.lines?.length);
    if (!cues.length) return null;

    const duration = Math.max(1, sceneContentDuration(scene));
    const sourceTimes = cues.flatMap(cue => {
      const values = [asNumber(cue.startSeconds, null), asNumber(cue.endSeconds, null)];
      if (Array.isArray(cue.wordTimings)) {
        cue.wordTimings.forEach(word => {
          values.push(asNumber(word.startSeconds, null), asNumber(word.endSeconds, null));
        });
      }
      return values.filter(value => Number.isFinite(value));
    });
    const sourceStart = sourceTimes.length ? Math.min(...sourceTimes) : 0;
    const sourceEnd = sourceTimes.length ? Math.max(...sourceTimes) : sourceStart + duration;
    const sourceDuration = Math.max(0.001, sourceEnd - sourceStart);
    const words = [];
    const chunks = [];
    let hasAlignedWords = false;

    cues.forEach(cue => {
      const cueText = subtitleOnlyCaptionText((cue.lines || []).join(' '));
      const timedCueWords = Array.isArray(cue.wordTimings)
        ? cue.wordTimings.filter(word => (
          word?.text
          && Number.isFinite(asNumber(word.startSeconds, null))
          && Number.isFinite(asNumber(word.endSeconds, null))
        ))
        : [];
      const cueWords = timedCueWords.length ? timedCueWords.map(word => word.text) : cueText.split(/\s+/).filter(Boolean);
      const relativeStart = clamp((asNumber(cue.startSeconds, sourceStart) - sourceStart) / sourceDuration, 0, 1);
      const relativeEnd = clamp((asNumber(cue.endSeconds, sourceEnd) - sourceStart) / sourceDuration, relativeStart + 0.001, 1);
      const span = Math.max(0.001, relativeEnd - relativeStart);
      const totalWeight = cueWords.reduce((sum, word) => sum + captionWordWeight(word), 0) || 1;
      let cursor = 0;
      const startWordIndex = words.length;

      if (timedCueWords.length) {
        hasAlignedWords = true;
        timedCueWords.forEach((wordTiming, index) => {
          const word = wordTiming.text;
          const absoluteStart = asNumber(wordTiming.startSeconds, asNumber(cue.startSeconds, sourceStart));
          const absoluteEnd = Math.max(absoluteStart + 0.001, asNumber(wordTiming.endSeconds, absoluteStart + 0.001));
          const start = clamp((absoluteStart - sourceStart) / sourceDuration, 0, 1);
          const end = clamp((absoluteEnd - sourceStart) / sourceDuration, start + 0.001, 1);
          const weight = captionWordWeight(word);
          words.push({
            text: word,
            clean: normalizeSpeechSearch(word),
            tokens: speechTokens(word),
            sentenceIndex: chunks.length,
            index,
            weight,
            start,
            end,
            startSeconds: start * duration,
            endSeconds: end * duration
          });
        });
      } else {
        cueWords.forEach((word, index) => {
          const weight = captionWordWeight(word);
          const start = relativeStart + ((cursor / totalWeight) * span);
          cursor += weight;
          const end = relativeStart + ((cursor / totalWeight) * span);
          words.push({
            text: word,
            clean: normalizeSpeechSearch(word),
            tokens: speechTokens(word),
            sentenceIndex: chunks.length,
            index,
            weight,
            start,
            end,
            startSeconds: start * duration,
            endSeconds: end * duration
          });
        });
      }
      chunks.push({
        text: cueText,
        lines: cue.lines.slice(0, CAPTION_MAX_LINES),
        placement: captionPlacementForCue(cue, cueText),
        role: cue.role || null,
        cueId: cue.id,
        startWordIndex,
        endWordIndex: Math.max(startWordIndex, words.length - 1),
        start: relativeStart,
        end: relativeEnd,
        wordEnd: words[words.length - 1]?.end || relativeEnd
      });
    });

    const timedWords = words.map((word, globalIndex) => ({ ...word, globalIndex }));
    const anchors = {};
    sectionAnchorSeed(scene).forEach(term => {
      const start = termStartForTiming({ words: timedWords, sentences: chunks }, [term]);
      if (start != null) anchors[normalizeSpeechSearch(term)] = start;
    });

    return {
      source: hasAlignedWords ? 'subtitle-forced-alignment-v1' : 'subtitle-cues-v3',
      text: cues.map(cue => cue.lines.join(' ')).join(' '),
      duration,
      totalWeight: words.reduce((sum, word) => sum + word.weight, 0) || 1,
      sentences: chunks.map((chunk, sentenceIndex) => ({ ...chunk, sentenceIndex })),
      chunks,
      words: timedWords,
      anchors
    };
  }

  function sceneTimedSentences(scene) {
    return sceneTimingModel(scene).sentences.map(sentence => ({
      text: sentence.text,
      start: sentence.start,
      end: sentence.end
    }));
  }

  function captionFrame(scene, progress) {
    const timing = sceneTimingModel(scene);
    if (!timing.words.length) return { chunk: '', lines: [], words: [], activeWordIndex: -1 };

    const lookahead = CAPTION_WORD_LOOKAHEAD_SECONDS / timing.duration;
    const target = clamp(progress + lookahead, 0, 0.999);
    const timeChunk = timing.chunks.find(chunk => target >= chunk.start && target < chunk.end);
    const candidateWords = timeChunk
      ? timing.words.slice(timeChunk.startWordIndex, timeChunk.endWordIndex + 1)
      : timing.words;
    const activeWord = candidateWords.find(word => target >= word.start && target < word.end)
      || [...candidateWords].reverse().find(word => target >= word.end)
      || candidateWords.find(word => target < word.start)
      || timing.words[timing.words.length - 1];
    const activeChunk = timeChunk
      || timing.chunks.find(chunk => activeWord.globalIndex >= chunk.startWordIndex && activeWord.globalIndex <= chunk.endWordIndex)
      || timing.chunks[0]
      || { text: timing.text, startWordIndex: 0, endWordIndex: timing.words.length - 1 };
    const chunkWords = timing.words.slice(activeChunk.startWordIndex, activeChunk.endWordIndex + 1);
    const activeWordIndex = chunkWords.findIndex(word => word.globalIndex === activeWord.globalIndex);
    const lines = captionFrameLines(activeChunk, timing.words, activeWord.globalIndex);
    return {
      chunk: activeChunk.text,
      lines,
      placement: activeChunk.placement || 'lower-third',
      words: chunkWords.map(word => word.text),
      activeWordIndex: activeWordIndex >= 0 ? activeWordIndex : 0,
      activeWord: activeWord.text,
      activeWordStart: activeWord.start,
      activeWordEnd: activeWord.end
    };
  }

  function captionFrameLines(chunk, words, activeGlobalIndex) {
    const maxLineChars = captionLineCharsForPlacement(chunk.placement || 'lower-third');
    const chunkLines = (chunk.lines?.length ? chunk.lines : wrapCaptionLines(chunk.text, maxLineChars).lines).slice(0, CAPTION_MAX_LINES);
    let cursor = chunk.startWordIndex;
    return chunkLines.map(line => {
      const lineWords = line.split(/\s+/).filter(Boolean);
      return lineWords.map(text => {
        const word = words[cursor];
        cursor += 1;
        return {
          text,
          active: word?.globalIndex === activeGlobalIndex
        };
      });
    });
  }

  function renderCaption(container, scene, progress, precomputedFrame = null) {
    const frame = precomputedFrame || captionFrame(scene, progress);
    container.classList.toggle('summary-full', frame.placement === 'summary-full');
    container.classList.toggle('tier-center', frame.placement === 'tier-center');
    container.classList.toggle('lower-third', !['summary-full', 'tier-center'].includes(frame.placement));
    const key = `${frame.placement}::${frame.chunk}::${frame.activeWord}`;
    if (container.dataset.captionKey === key) return;
    container.dataset.captionKey = key;
    container.setAttribute('aria-label', frame.chunk);
    container.replaceChildren(...frame.lines.map(line => {
      const lineNode = document.createElement('div');
      lineNode.className = 'caption-line';
      line.forEach(word => {
        const node = document.createElement('span');
        node.className = `caption-word${word.active ? ' active' : ''}`;
        node.textContent = word.text;
        lineNode.appendChild(node);
      });
      return lineNode;
    }));
  }

  function syncCaptionSafeArea(caption) {
    const shell = els.videoStage.closest('.phone-shell');
    if (!shell) return;

    const pixelUnit = cssPixels(getComputedStyle(document.documentElement).getPropertyValue('--pixel-unit'), 4);
    const safe = CAPTION_SAFE_X * pixelUnit;
    const stageRect = els.videoStage.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const shellStyle = getComputedStyle(shell);
    const contentLeft = shellRect.left
      + cssPixels(shellStyle.borderLeftWidth)
      + cssPixels(shellStyle.paddingLeft);
    const contentRight = shellRect.right
      - cssPixels(shellStyle.borderRightWidth)
      - cssPixels(shellStyle.paddingRight);
    const visibleLeft = Math.max(stageRect.left, contentLeft);
    const visibleRight = Math.min(stageRect.right, contentRight);
    const visibleTop = Math.max(stageRect.top, shellRect.top + cssPixels(shellStyle.borderTopWidth) + cssPixels(shellStyle.paddingTop));
    const visibleBottom = Math.min(stageRect.bottom, shellRect.bottom - cssPixels(shellStyle.borderBottomWidth) - cssPixels(shellStyle.paddingBottom));
    const leftInset = Math.max(0, visibleLeft - stageRect.left) + safe;
    const rightInset = Math.max(0, stageRect.right - visibleRight) + safe;
    const topInset = Math.max(0, visibleTop - stageRect.top);
    const bottomInset = Math.max(0, stageRect.bottom - visibleBottom);
    caption.style.setProperty('--caption-safe-left', `${leftInset.toFixed(2)}px`);
    caption.style.setProperty('--caption-safe-right', `${rightInset.toFixed(2)}px`);
    caption.style.setProperty('--caption-safe-top', `${topInset.toFixed(2)}px`);
    caption.style.setProperty('--caption-safe-bottom', `${bottomInset.toFixed(2)}px`);
  }

  function normalizeSpeechSearch(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function segmentStartForTerms(segments, terms) {
    const normalized = terms.map(normalizeSpeechSearch).filter(Boolean);
    if (!normalized.length) return null;
    for (const segment of segments) {
      const haystack = normalizeSpeechSearch(segment.text);
      if (normalized.some(term => haystack.includes(term))) return segment.start;
      if (normalized.some(term => {
        const tokens = term.split(' ').filter(token => token.length > 1);
        return tokens.length > 1 && tokens.every(token => haystack.includes(token));
      })) return segment.start;
    }
    return null;
  }

  function termStartForTiming(timing, terms) {
    const normalizedTerms = terms.map(speechTokens).filter(tokens => tokens.length);
    if (!normalizedTerms.length || !timing?.words?.length) return null;

    const wordTokens = timing.words.map(word => word.tokens?.join(' ') || word.clean || '');
    for (const termTokens of normalizedTerms) {
      for (let index = 0; index <= wordTokens.length - termTokens.length; index += 1) {
        const matches = termTokens.every((token, offset) => wordTokens[index + offset] === token);
        if (matches) return timing.words[index].start;
      }
    }

    for (const termTokens of normalizedTerms) {
      const looseMatch = timing.words.find(word => termTokens.every(token => (word.clean || '').includes(token)));
      if (looseMatch) return looseMatch.start;
    }

    return segmentStartForTerms(timing.sentences || [], terms);
  }

  function metricTerms(metricKey, fallbackLabel = '') {
    const fallback = normalizeSpeechSearch(fallbackLabel);
    return [
      ...(METRIC_SPEECH_TERMS[metricKey] || []),
      ...(fallback.length > 1 ? [fallbackLabel] : [])
    ].filter(Boolean);
  }

  function rowIndexFromY(layer, startY, stepY, maxIndex) {
    const y = asNumber(layer?.y, null);
    if (y == null) return null;
    return clamp(Math.round((y - startY) / stepY), 0, maxIndex);
  }

  function macroRowIndex(layer) {
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    if (!/(submacro|arrow indicator|green_arrow|red_arrow|yellow_arrow)/.test(fingerprint)) return null;
    return rowIndexFromY(layer, 73, 18, 3);
  }

  function proConRowIndex(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    const idMatch = id.match(new RegExp(`^${sectionId}_(?:impact|item)_(\\d+)$`));
    if (idMatch) return clamp(Number(idMatch[1]) - 1, 0, 2);
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (!fingerprint.includes(sectionId === 'pros' ? 'pro' : 'con')) return null;
    return rowIndexFromY(layer, 47, 28, 2);
  }

  function micronTextIndex(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    const match = id.match(new RegExp(`^${sectionId}_(?:label|percent)_(\\d+)$`));
    return match ? Number(match[1]) - 1 : null;
  }

  function micronColumnIndex(layer, sectionId, allLayers) {
    const textIndex = micronTextIndex(layer, sectionId);
    if (textIndex != null) return textIndex;
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (fingerprint.includes('bar_line')) return null;
    if (!/(micro|micros|dv bar|bar_line|bar)/.test(fingerprint)) return null;
    const labels = allLayers
      .filter(candidate => micronTextIndex(candidate, sectionId) != null)
      .map(candidate => ({ index: micronTextIndex(candidate, sectionId), centerX: layerCenterX(candidate) }));
    if (!labels.length) return null;
    const centerX = layerCenterX(layer);
    return labels.reduce((closest, item) => (
      Math.abs(item.centerX - centerX) < Math.abs(closest.centerX - centerX) ? item : closest
    ), labels[0]).index;
  }

  function layerTextTerms(layer) {
    const text = String(layer?.text || '').trim();
    if (!text || /^n\/a$/i.test(text)) return [];
    const words = normalizeSpeechSearch(text).split(' ').filter(word => word.length > 2);
    return [text, words.slice(0, 4).join(' ')].filter(Boolean);
  }

  function isMacroIcon(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return /\/macros|macro|fat_icon|carb_icon|protein_icon/.test(fingerprint) && /icon/.test(fingerprint);
  }

  function isMacroScoreCard(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return /submacro_bullet|score card sprite|bullet_point/.test(fingerprint);
  }

  function isMacroArrow(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return /arrow indicator|green_arrow|red_arrow|yellow_arrow|\/arrow_indicators\//.test(fingerprint);
  }

  function macroTextKind(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    if (id.startsWith(`${sectionId}_submacro_label_`)) return 'label';
    if (id.startsWith(`${sectionId}_submacro_value_`)) return 'value';
    return null;
  }

  function isMicronTitleLayer(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes(sectionId.slice(0, -1)) && /title|main|section/.test(fingerprint);
  }

  function isMicronIconLayer(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return fingerprint.includes(sectionId.slice(0, -1)) && /icon/.test(fingerprint);
  }

  function isMicronBarLine(layer) {
    return String(layer?.src || '').toLowerCase().includes('/bars/bar_line.');
  }

  function micronTextKind(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    if (id.match(new RegExp(`^${sectionId}_label_\\d+$`))) return 'label';
    if (id.match(new RegExp(`^${sectionId}_percent_\\d+$`))) return 'value';
    return null;
  }

  function proConLayerKind(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    if (id.match(new RegExp(`^${sectionId}_impact_\\d+$`))) return 'impact';
    if (id.match(new RegExp(`^${sectionId}_item_\\d+$`))) return 'item';
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (/badge|impact|label/.test(fingerprint)) return 'impact';
    if (fingerprint.includes(sectionId === 'pros' ? 'pro' : 'con')) return 'item';
    return null;
  }

  function introHookLayerKind(layer) {
    const id = String(layer?.id || '').toLowerCase();
    if (id === 'intro_food_hero') return 'food-hero';
    if (id === 'intro_ranked_sprite') return 'ranked-sprite';
    if (id.startsWith('intro_ranked_glimmer_')) return 'glimmer';
    return null;
  }

  function layerRevealClassification(layer, scene, persistent, allLayers = []) {
    const sectionId = scene?.id || '';
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (persistent) return { family: 'chrome', kind: 'persistent' };
    if (sectionId === 'intro') return { family: 'intro', kind: introHookLayerKind(layer) || (isSpriteLayer(layer) ? 'sprite' : 'text') };
    if (sectionId === 'outro') {
      if (String(layer?.id || '').toLowerCase() === 'outro_score_value' || /score|tier|verdict/.test(fingerprint)) {
        return { family: 'outro', kind: 'tier' };
      }
      return { family: 'outro', kind: isSpriteLayer(layer) ? 'frame' : 'summary' };
    }
    if (['fats', 'carbs', 'protein'].includes(sectionId)) {
      const rowIndex = macroRowIndex(layer);
      if (isMacroIcon(layer)) return { family: 'macro', kind: 'icon' };
      if (rowIndex != null) {
        return {
          family: 'macro',
          kind: macroTextKind(layer, sectionId) || (isMacroArrow(layer) ? 'arrow' : isMacroScoreCard(layer) ? 'score-card' : 'row'),
          rowIndex
        };
      }
      return { family: 'macro', kind: 'decor' };
    }
    if (sectionId === 'vitamins' || sectionId === 'minerals') {
      const columnIndex = micronColumnIndex(layer, sectionId, allLayers);
      if (isMicronTitleLayer(layer, sectionId) || (isMicronIconLayer(layer, sectionId) && (Number(layer?.y) || 0) < 70)) {
        return { family: 'micron', kind: 'title' };
      }
      if (columnIndex != null) {
        return {
          family: 'micron',
          kind: micronTextKind(layer, sectionId) || (isMicrosBar(layer) ? 'dv-bar' : isMicronBarLine(layer) ? 'bar-line' : isMicronIconLayer(layer, sectionId) ? 'icon' : 'column'),
          columnIndex,
          percent: microsBarPercent(layer)
        };
      }
      return { family: 'micron', kind: isMicronBarLine(layer) ? 'bar-line' : 'decor' };
    }
    if (sectionId === 'pros' || sectionId === 'cons') {
      const rowIndex = proConRowIndex(layer, sectionId);
      if (rowIndex != null) {
        return { family: sectionId, kind: proConLayerKind(layer, sectionId) || 'item', rowIndex };
      }
      return { family: sectionId, kind: 'decor' };
    }
    return { family: 'generic', kind: isSpriteLayer(layer) ? 'sprite' : 'text' };
  }

  function distributedRevealDelay(order, count, segments, { start = 0.05, end = 0.82 } = {}) {
    if (segments[order]) return segments[order].start;
    if (count <= 1) return start;
    return clamp(start + ((order / Math.max(1, count - 1)) * (end - start)), start, end);
  }

  function revealAnchorForLayer(layer, scene, classification, timing, index = 0) {
    const sectionId = scene?.id || '';
    const segments = timing.sentences || sceneTimedSentences(scene);

    if (sectionId === 'intro') {
      const food = selectedFood();
      const foodName = String(food?.name || '').trim();
      const firstFoodWord = foodName.split(/\s+/).find(Boolean);
      const rankedAnchor = termStartForTiming(timing, ['ranked']) ?? 0.54;
      if (classification.kind === 'food-hero') {
        return termStartForTiming(timing, [foodName, firstFoodWord, 'bacon'].filter(Boolean)) ?? 0.04;
      }
      if (classification.kind === 'ranked-sprite') return rankedAnchor;
      if (classification.kind === 'glimmer') return clamp(rankedAnchor + (asNumber(layer?.sparkleDelay, 0) || 0), 0.02, 0.9);
      return termStartForTiming(timing, [foodName, 'ranked'].filter(Boolean))
        ?? distributedRevealDelay(index, 3, segments, { start: 0.05, end: 0.58 });
    }

    if (sectionId === 'outro' && classification.kind === 'tier') {
      return termStartForTiming(timing, ['tier', `${selectedFood()?.episode?.tier || selectedFood()?.expectedTier || ''} tier`])
        ?? segments[Math.max(0, segments.length - 1)]?.start
        ?? 0.72;
    }

    if (['fats', 'carbs', 'protein'].includes(sectionId)) {
      if (classification.kind === 'icon') return 0.025;
      const rowIndex = classification.rowIndex;
      if (rowIndex != null) {
        const specs = MACRO_SUBMETRIC_SPECS[sectionId] || [];
        const spec = specs[rowIndex];
        if (sectionId === 'protein') return proteinRowRevealAnchor(timing, rowIndex);
        return termStartForTiming(timing, [...metricTerms(spec?.key, spec?.label), ...layerTextTerms(layer)])
          ?? distributedRevealDelay(rowIndex + 1, Math.max(4, segments.length), segments, { start: 0.16, end: 0.72 });
      }
    }

    if (sectionId === 'vitamins' || sectionId === 'minerals') {
      const specs = sectionId === 'vitamins' ? VITAMIN_TEXT_SPECS : MINERAL_TEXT_SPECS;
      if (classification.kind === 'title') return 0.025;
      const columnIndex = classification.columnIndex;
      if (columnIndex != null) {
        const spec = specs[columnIndex];
        return termStartForTiming(timing, [...metricTerms(spec?.key, spec?.shortLabel), ...layerTextTerms(layer)])
          ?? distributedRevealDelay(columnIndex + 1, Math.max(specs.length + 1, segments.length), segments, { start: 0.12, end: 0.74 });
      }
      return 0.08;
    }

    if (sectionId === 'pros' || sectionId === 'cons') {
      const rowIndex = classification.rowIndex;
      if (rowIndex != null) {
        const itemLayerTerms = classification.kind === 'item' ? layerTextTerms(layer) : [];
        const matched = termStartForTiming(timing, itemLayerTerms);
        return matched ?? distributedRevealDelay(rowIndex * 2, 5, segments, { start: 0.06, end: 0.66 });
      }
    }

    const row = clamp(((Number(layer?.y) || 0) - 42) / 120, 0, 1);
    return 0.08 + (row * 0.48) + ((index % 3) * 0.025);
  }

  function proteinRowRevealAnchor(timing, rowIndex) {
    const eaaAnchor = termStartForTiming(timing, ['essential amino', 'eaa', '8/9'])
      ?? distributedRevealDelay(1, 5, timing.sentences || [], { start: 0.16, end: 0.56 });
    const bioAnchor = termStartForTiming(timing, ['bioavailability', '90%'])
      ?? distributedRevealDelay(3, 5, timing.sentences || [], { start: 0.16, end: 0.56 });
    const nEaaAnchor = eaaAnchor + ((bioAnchor - eaaAnchor) * 0.5);
    const anchors = [
      Math.max(0.14, eaaAnchor - 0.04),
      eaaAnchor,
      nEaaAnchor,
      bioAnchor
    ];
    return clamp(anchors[rowIndex] ?? distributedRevealDelay(rowIndex + 1, 5, timing.sentences || [], { start: 0.16, end: 0.56 }), 0.12, 0.72);
  }

  function layerRevealSchedule(layer, scene, index, persistent, allLayers = []) {
    const timing = sceneTimingModel(scene);
    const classification = layerRevealClassification(layer, scene, persistent, allLayers);
    let anchor = persistent ? 0 : revealAnchorForLayer(layer, scene, classification, timing, index);
    let offset = 0;

    if (classification.family === 'intro') {
      offset = ['food-hero', 'ranked-sprite', 'glimmer'].includes(classification.kind) ? 0 : Math.min(0.12, index * 0.025);
    }
    if (classification.family === 'macro') {
      if (classification.kind === 'score-card') offset = -0.035;
      if (classification.kind === 'label') offset = -0.008;
      if (classification.kind === 'value') offset = 0.018;
      if (classification.kind === 'arrow') offset = 0.035;
    }
    if (classification.family === 'micron') {
      if (classification.kind === 'bar-line') offset = -0.045;
      if (classification.kind === 'icon') offset = -0.026;
      if (classification.kind === 'label') offset = -0.012;
      if (classification.kind === 'value') offset = 0.025;
      if (classification.kind === 'dv-bar') offset = 0.01 + Math.min(0.14, (asNumber(classification.percent, 0) || 0) / 100 * 0.16);
    }
    if (classification.family === 'pros' || classification.family === 'cons') {
      if (classification.kind === 'impact') offset = -0.035;
      if (classification.kind === 'item') offset = 0.012;
    }
    if (classification.family === 'outro') {
      if (classification.kind === 'frame') offset = -0.08;
      if (classification.kind === 'tier') offset = 0;
    }

    const delay = clamp((anchor ?? 0.08) + offset, persistent ? 0 : 0.015, 0.94);
    return {
      layerId: layer?.id || null,
      label: layer?.label || null,
      family: classification.family,
      kind: classification.kind,
      rowIndex: classification.rowIndex ?? null,
      columnIndex: classification.columnIndex ?? null,
      start: delay,
      startSeconds: Number((delay * Math.max(1, sceneContentDuration(scene))).toFixed(3))
    };
  }

  function audioRevealDelayForLayer(layer, scene, index, persistent, allLayers = []) {
    return layerRevealSchedule(layer, scene, index, persistent, allLayers).start;
  }

  function applyLayerBox(node, layer) {
    node.style.left = `calc(${Number(layer.x) || 0}px * var(--pixel-unit))`;
    node.style.top = `calc(${Number(layer.y) || 0}px * var(--pixel-unit))`;
    if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit))`;
    if (layer.kind === 'sprite') {
      if (layer.height) node.style.height = `calc(${Number(layer.height)}px * var(--pixel-unit))`;
      node.style.objectFit = layer.preserveAspect ? 'contain' : 'fill';
      if (layer.preserveAspect && layer.aspectRatio) node.style.aspectRatio = String(layer.aspectRatio);
    }
  }

  function layerRevealDelay(layer, index) {
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    if (fingerprint.includes('header') || ['food_name_text', 'kcal_value_text', 'basis_text', 'script_caption', 'subline_c', 'kcal_label_text'].includes(layer.id)) return 0.02;
    if (fingerprint.includes('section indicator') || fingerprint.includes('/ui/section_indicator/')) return 0.08;
    const row = clamp(((Number(layer.y) || 0) - 42) / 120, 0, 1);
    return 0.12 + (row * 0.42) + ((index % 4) * 0.035);
  }

  function applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent = false, revealDelay = null) {
    if (persistent) {
      node.style.opacity = '1';
      if (layer.flipY) {
        node.style.transformOrigin = 'center';
        node.style.transform = 'scaleY(-1)';
      }
      return;
    }

    const delay = revealDelay == null ? layerRevealDelay(layer, index) : revealDelay;
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealLead = Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    const revealWindow = Math.min(0.14, Math.max(0.045, AUDIO_REVEAL_WINDOW_SECONDS / sceneDuration));
    const revealProgress = easeOutCubic((sceneProgress + revealLead - delay) / revealWindow);
    const visible = clamp(revealProgress, 0, 1);
    const phase = state.currentTime * Math.PI * 2;
    let x = 0;
    let y = 0;
    let scale = layer.kind === 'text' ? 1 : 0.96 + (visible * 0.04);
    let clip = '';
    const lockSpriteLayout = layer.kind === 'sprite' && !persistent;

    if (lockSpriteLayout) {
      scale = 1;
    } else if (scene.reveal === 'slide') {
      x -= (1 - visible) * 10;
    } else if (scene.reveal === 'wipe') {
      clip = `inset(0 ${Math.round((1 - visible) * 100)}% 0 0)`;
    } else if (scene.reveal === 'pop') {
      scale = layer.kind === 'text' ? 1 : 0.8 + (visible * 0.2);
    } else {
      y += (1 - visible) * 7;
    }

    if (layer.kind === 'sprite' && !lockSpriteLayout) {
      if (scene.motion === 'bob') y += Math.sin(phase + index) * 0.7;
      if (scene.motion === 'pulse') scale += Math.sin(phase * 0.8 + index) * 0.018;
      if (scene.motion === 'drift') x += Math.sin(phase * 0.45 + index) * 0.55;
    }

    const flip = layer.flipY ? ' scaleY(-1)' : '';
    node.style.transformOrigin = layer.flipY ? 'center' : 'top left';
    node.style.opacity = String(visible);
    node.style.transform = `translate3d(calc(${x}px * var(--pixel-unit)), calc(${y}px * var(--pixel-unit)), 0) scale(${scale})${flip}`;
    if (clip) node.style.clipPath = clip;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function stopPlayback() {
    state.playing = false;
    state.audioInHold = false;
    els.playPause.textContent = 'Play';
    if (els.narrationAudio) els.narrationAudio.pause();
  }

  function startPlayback() {
    state.playing = true;
    state.startedAt = performance.now();
    state.playheadStart = state.currentTime;
    state.lastFrameAt = performance.now();
    state.audioInHold = false;
    els.playPause.textContent = 'Pause';
    syncAudioPlaybackState();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!state.playing) return;
    const elapsed = (now - state.startedAt) / 1000;
    state.currentTime = state.playheadStart + elapsed;
    if (state.currentTime >= totalDuration()) {
      state.currentTime = totalDuration();
      stopPlayback();
    }
    syncAudioPlaybackState();
    renderDynamic();
    if (state.playing) requestAnimationFrame(tick);
  }

  function renderDynamic() {
    renderStage();
    renderSceneList();
    renderTimelineStrip();
    renderControls();
  }

  function renderAll() {
    state.currentTime = clamp(state.currentTime, 0, totalDuration());
    setCanvasScale();
    syncAudioForFood();
    renderLayoutSourceOptions();
    renderFoodList();
    renderSceneList();
    renderTimelineStrip();
    renderControls();
    renderManifest();
    renderStage();
  }

  function updateSelectedScene(mutator) {
    const scene = state.scenes.find(item => item.id === state.selectedSceneId);
    if (!scene) return;
    mutator(scene);
    renderAll();
  }

  els.foodSearch.addEventListener('input', () => {
    state.foodFilter = els.foodSearch.value;
    renderFoodList();
  });

  els.layoutSource.addEventListener('change', () => {
    state.layoutSourceId = els.layoutSource.value;
    hydrateLayoutForFood();
    persist();
    renderAll();
  });

  window.addEventListener('storage', event => {
    if (event.key !== DISPLAY_LAYOUT_KEY || state.layoutSourceId !== 'display-builder') return;
    hydrateLayoutForFood();
    renderAll();
  });

  els.playPause.addEventListener('click', () => {
    if (state.playing) {
      stopPlayback();
    } else {
      if (state.currentTime >= totalDuration()) state.currentTime = 0;
      startPlayback();
    }
  });

  els.timeScrub.addEventListener('input', () => {
    state.currentTime = Number(els.timeScrub.value) / 100;
    stopPlayback();
    syncAudioTime({ force: true });
    renderDynamic();
  });

  els.audioToggle.addEventListener('click', () => {
    if (!audioForFood(selectedFood())) return;
    state.audioEnabled = !state.audioEnabled;
    if (!state.audioEnabled) els.narrationAudio.pause();
    else if (state.playing) syncAudioPlaybackState();
    persist();
    updateAudioControls();
  });

  els.sceneDuration.addEventListener('input', () => {
    state.audioTimelineKey = '';
    state.audioDurationSeconds = null;
    updateSelectedScene(scene => {
      setSceneDuration(scene, clamp(asNumber(els.sceneDuration.value, scene.duration), 0.4 + sceneHoldSeconds(scene), 30));
    });
  });

  els.revealStyle.addEventListener('change', () => {
    updateSelectedScene(scene => {
      scene.reveal = els.revealStyle.value;
    });
  });

  els.spriteMotion.addEventListener('change', () => {
    updateSelectedScene(scene => {
      scene.motion = els.spriteMotion.value;
    });
  });

  els.captionSize.addEventListener('input', () => {
    updateSelectedScene(scene => {
      scene.captionSize = clamp(asNumber(els.captionSize.value, scene.captionSize), 12, 34);
    });
  });

  els.captionText.addEventListener('input', () => {
    updateSelectedScene(scene => {
      scene.caption = els.captionText.value;
    });
  });

  els.resetCaptions.addEventListener('click', () => {
    state.scenes = buildScenes(selectedFood());
    state.currentTime = 0;
    state.selectedSceneId = 'intro';
    state.audioTimelineKey = '';
    state.audioDurationSeconds = null;
    renderAll();
  });

  els.copyManifest.addEventListener('click', async () => {
    const text = JSON.stringify(buildManifest(), null, 2);
    els.manifestOutput.value = text;
    try {
      await navigator.clipboard.writeText(text);
      els.copyManifest.textContent = 'Copied';
      setTimeout(() => { els.copyManifest.textContent = 'Copy manifest'; }, 1000);
    } catch {
      els.manifestOutput.select();
    }
  });

  window.addEventListener('resize', () => {
    setCanvasScale();
    renderStage();
  });

  async function init() {
    await loadBatchResults();
    const food = selectedFood();
    if (!foods.some(item => item.id === state.selectedFoodId) && foods[0]) state.selectedFoodId = foods[0].id;
    state.scenes = buildScenes(food);
    hydrateLayoutForFood();
    syncAudioForFood();
    renderAll();
    requestAnimationFrame(() => {
      setCanvasScale();
      renderStage();
    });
  }

  function audioForFood(food) {
    const audio = food?.episode?.audio || food?.audio || null;
    if (!audio?.path) return null;
    return {
      take: audio.take || null,
      path: audio.path,
      metadataPath: audio.metadataPath || null,
      productionPath: audio.productionPath || null,
      profileId: audio.profileId || null,
      voiceLabel: audio.voiceLabel || null,
      modelId: audio.modelId || null,
      generatedAt: audio.generatedAt || null
    };
  }

  function syncAudioForFood() {
    const audio = audioForFood(selectedFood());
    if (!els.narrationAudio) return;
    if (!audio) {
      els.narrationAudio.removeAttribute('src');
      els.narrationAudio.load();
      updateAudioControls();
      return;
    }
    const nextSrc = new URL(docsAssetPath(audio.path), window.location.href).href;
    if (els.narrationAudio.src !== nextSrc) {
      state.audioTimelineKey = '';
      state.audioDurationSeconds = null;
      els.narrationAudio.src = nextSrc;
      els.narrationAudio.load();
    }
    syncAudioTime({ force: true });
    updateAudioControls();
  }

  function syncAudioPlaybackState() {
    if (!state.audioEnabled || !els.narrationAudio?.src) return;
    if (isSceneHoldAt(state.currentTime)) {
      if (!state.audioInHold) {
        syncAudioTime({ force: true });
        state.audioInHold = true;
      }
      if (!els.narrationAudio.paused) els.narrationAudio.pause();
      return;
    }

    const wasInHold = state.audioInHold;
    state.audioInHold = false;
    if (state.playing && els.narrationAudio.paused) {
      playAudioFromCurrentTime({ forceSync: true });
      return;
    }
    if (wasInHold) syncAudioTime({ force: true });
  }

  function syncAudioTime({ force = false } = {}) {
    if (!els.narrationAudio?.src) return;
    const safeTime = clamp(videoTimeToAudioTime(state.currentTime), 0, Math.max(0, totalNarrationDuration() - 0.01));
    try {
      if (force) {
        els.narrationAudio.currentTime = safeTime;
      }
    } catch {}
  }

  function playAudioFromCurrentTime({ forceSync = true } = {}) {
    if (!state.audioEnabled || !els.narrationAudio?.src) return;
    if (isSceneHoldAt(state.currentTime)) return;
    syncAudioTime({ force: forceSync });
    const playPromise = els.narrationAudio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        state.audioEnabled = false;
        updateAudioControls('Audio blocked');
      });
    }
  }

  function updateAudioControls(overrideStatus) {
    const audio = audioForFood(selectedFood());
    if (!els.audioToggle || !els.audioStatus) return;
    els.audioToggle.disabled = !audio;
    els.audioToggle.textContent = state.audioEnabled && audio ? 'Audio on' : 'Audio off';
    const syncLabel = state.audioDurationSeconds
      ? ` · synced ${state.audioDurationSeconds.toFixed(1)}s + ${totalHoldDuration().toFixed(1)}s dwell`
      : '';
    els.audioStatus.textContent = overrideStatus || (audio ? `${audio.take || 'Audio'} ready${syncLabel}` : 'No audio');
  }

  els.narrationAudio.addEventListener('loadedmetadata', () => {
    if (calibrateSceneDurationsToAudio(els.narrationAudio.duration)) {
      syncAudioTime({ force: true });
      renderAll();
      return;
    }
    updateAudioControls();
  });

  void init();
}());
