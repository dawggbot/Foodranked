(function () {
  const DISPLAY_LAYOUT_KEY = 'foodranked-display-builder-v4';
  const SAVED_LAYOUTS_KEY = 'foodranked-display-builder-sprite-layouts-v1';
  const VIDEO_STATE_KEY = 'foodranked-video-builder-state-v1';
  const BUILDER_BUILD_ID = '20260614-major-pro-sparkle-sfx-v1';
  const REPO_LAYOUT_VERSION = '20260529-layout-sync-v1';
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
  const SUBMACRO_REVEAL_WINDOW_SECONDS = 1.25;
  const SUBMACRO_REVEAL_WINDOW_MAX_PROGRESS = 0.28;
  const SECTION_NARRATION_AFTER_REVEAL_PAD_SECONDS = 0.03;
  const PRO_CON_ROW_REVEAL_SECONDS = 0.18;
  const PRO_CON_ROW_STEP_SECONDS = 0.24;
  const PRO_CON_NARRATION_AFTER_REVEAL_PAD_SECONDS = 0.18;
  const MICRON_GRAPH_REVEAL_SECONDS = 0.08;
  const MICRON_BAR_AFTER_GRAPH_SECONDS = 0.38;
  const MICRON_BAR_STEP_SECONDS = 0.12;
  const MICRON_STAMP_REVEAL_SECONDS = 0.28;
  const MICRON_BAR_STAMP_REVEAL_SECONDS = 0.12;
  const MICRON_100_FIREWORK_SECONDS = 1.35;
  const MICRON_100_FIREWORK_SPARKS = [
    { x: -7.8, y: -7.2, color: '#fff7b0' },
    { x: -3.6, y: -10.4, color: '#ffffff' },
    { x: 1.4, y: -10.8, color: '#7cf2a7' },
    { x: 6.8, y: -7.0, color: '#fff7b0' },
    { x: 8.8, y: -1.4, color: '#88d7ff' },
    { x: 5.2, y: 4.8, color: '#ffffff' },
    { x: -1.6, y: 6.2, color: '#7cf2a7' },
    { x: -7.5, y: 2.4, color: '#88d7ff' },
    { x: -9.4, y: -2.8, color: '#ffffff' },
    { x: 9.6, y: 3.3, color: '#fff7b0' },
    { x: -4.8, y: 7.5, color: '#fff7b0' },
    { x: 3.2, y: 8.0, color: '#88d7ff' }
  ];
  const MAJOR_PRO_SPARKLES = [
    { x: -10.2, y: -5.5, color: '#fff8be', size: 1.5, delay: 0.00 },
    { x: -6.8, y: 3.4, color: '#ffffff', size: 1.2, delay: 0.08 },
    { x: -1.9, y: -8.5, color: '#7cf2a7', size: 1.35, delay: 0.13 },
    { x: 3.8, y: 5.6, color: '#fff8be', size: 1.1, delay: 0.20 },
    { x: 8.6, y: -3.9, color: '#ffffff', size: 1.45, delay: 0.05 },
    { x: 12.0, y: 2.8, color: '#88d7ff', size: 1.15, delay: 0.18 },
    { x: -12.4, y: 7.6, color: '#7cf2a7', size: 1.0, delay: 0.27 },
    { x: -4.4, y: 9.0, color: '#fff8be', size: 1.35, delay: 0.32 },
    { x: 6.0, y: -9.2, color: '#ffffff', size: 1.0, delay: 0.24 },
    { x: 11.0, y: 8.2, color: '#fff8be', size: 1.25, delay: 0.36 },
    { x: -8.6, y: -1.6, color: '#ffffff', size: 1.1, delay: 0.42 },
    { x: -0.6, y: 8.4, color: '#88d7ff', size: 1.05, delay: 0.48 },
    { x: 4.9, y: -5.8, color: '#fff8be', size: 1.32, delay: 0.54 },
    { x: 13.4, y: -0.4, color: '#7cf2a7', size: 1.08, delay: 0.60 }
  ];
  const STAMP_REVEAL_SECONDS = 0.36;
  const FOOD_STAMP_REVEAL_SECONDS = 0.22;
  const STAMP_SHAKE_MAX_PIXELS = 2.8;
  const STAMP_SFX_PATH = 'audio/sfx/stamps/impact-stamp-hit.mp3';
  const STAMP_SFX_VOLUME = 0.18;
  const STAMP_SFX_VOLUME_VARIATION = 0.025;
  const STAMP_SFX_PLAYBACK_RATE_RANGE = { min: 0.93, max: 1.07 };
  const STAMP_SFX_START_OFFSET_RANGE_SECONDS = { min: 0, max: 0.045 };
  const STAMP_SFX_LEAD_SECONDS = 0.1;
  const STAMP_SFX_POOL_SIZE = 4;
  const SECTION_TRANSITION_SFX_PATH = 'audio/sfx/transitions/section-transition-whoosh.mp3';
  const SECTION_TRANSITION_SFX_VOLUME = 0.22;
  const SECTION_TRANSITION_SFX_POOL_SIZE = 3;
  const MICRON_BAR_CONFIRM_SFX_PATH = 'audio/sfx/ui/micron-bar-confirm-tap.mp3';
  const MICRON_BAR_CONFIRM_SFX_VOLUME = 0.22;
  const MICRON_BAR_CONFIRM_SFX_POOL_SIZE = 8;
  const MICRON_BAR_CONFIRM_SFX_PLAY_SECONDS = 0.18;
  const MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE = { min: 0.78, max: 1.58 };
  const MICRON_100_FIREWORK_LEAD_SFX_PATH = 'audio/sfx/sparkles/micron-100-firework-lead-pop.mp3';
  const MICRON_100_FIREWORK_LEAD_SFX_VOLUME = 0.2;
  const MICRON_100_FIREWORK_LEAD_SFX_SECONDS = 0.06;
  const MICRON_100_FIREWORK_LEAD_SFX_POOL_SIZE = 2;
  const MICRON_100_FIREWORK_SFX_PATH = 'audio/sfx/sparkles/micron-100-firework-cluster.mp3';
  const MICRON_100_FIREWORK_SFX_VOLUME = 0.28;
  const MICRON_100_FIREWORK_CLUSTER_SFX_DELAY_SECONDS = 0.22;
  const MICRON_100_FIREWORK_SFX_POOL_SIZE = 2;
  const MAJOR_PRO_SPARKLE_SFX_PATH = 'audio/sfx/sparkles/major-pro-sparkle-shine.mp3';
  const MAJOR_PRO_SPARKLE_SFX_VOLUME = 0.24;
  const MAJOR_PRO_SPARKLE_SFX_POOL_SIZE = 4;
  const MAJOR_PRO_SPARKLE_SFX_PLAYBACK_RATE_RANGE = { min: 0.96, max: 1.08 };
  const HIGHLIGHT_GLOW_SFX_PATH = 'audio/sfx/ui/highlight-glow-loop.mp3';
  const HIGHLIGHT_GLOW_SFX_VOLUME = 0.36;
  const HIGHLIGHT_GLOW_SFX_FADE_IN_SPEED = 5.2;
  const HIGHLIGHT_GLOW_SFX_FADE_OUT_SPEED = 3.4;
  const HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_FADE_SPEED = 4.8;
  const HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES = {
    green: { min: 1.16, max: 1.42 },
    red: { min: 0.58, max: 0.82 },
    neutral: { min: 0.9, max: 1.12 }
  };
  const HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE = 0.12;
  const HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD = 0.0015;
  const MACRO_BAR_FILL_SFX_PATH = 'audio/sfx/ui/macro-bar-fill-highscore.mp3';
  const MACRO_BAR_FILL_SFX_SOURCE_SECONDS = 9.408;
  const MACRO_BAR_FILL_SFX_VOLUME = 0.31;
  const MACRO_BAR_FILL_SFX_GAIN = 0.31;
  const MACRO_BAR_FILL_SFX_FILTER_HZ = 3600;
  const MACRO_BAR_FILL_SFX_FILTER_Q = 0.25;
  const MACRO_BAR_FILL_SFX_POOL_SIZE = 1;
  const MACRO_BAR_FILL_SFX_FADE_IN_SECONDS = 0.045;
  const MACRO_BAR_FILL_SFX_FADE_OUT_SECONDS = 0.18;
  const MACRO_BAR_FILL_SFX_ENVELOPE_STEPS = 96;
  const AUDIO_TIMELINE_SYNC_TOLERANCE_SECONDS = 0.12;
  const SECTION_HOLD_SECONDS = 0.5;
  const SECTION_HOLD_IDS = new Set(['intro', 'fats', 'carbs', 'protein', 'vitamins', 'minerals', 'pros', 'cons']);
  const HIDDEN_CAPTION_SECTION_IDS = new Set(['intro']);
  const MACRO_REVEAL_SECONDS = 0.08;
  const MACRO_HEAD_REVEAL_SECONDS = 0.22;
  const MACRO_BAR_START_DWELL_SECONDS = 0.5;
  const MACRO_BAR_FILL_SECONDS = 1.55;
  const MACRO_BAR_LAST_QUARTER_DURATION_MULTIPLIER = 1.65;
  const MACRO_BAR_LAST_QUARTER_END_SPEED_RATIO = 0.42;
  const MACRO_BAR_GIF_NATIVE_SECONDS = 8.1;
  const MACRO_BAR_FULL_SFX_SOURCE_SECONDS = Math.min(MACRO_BAR_FILL_SFX_SOURCE_SECONDS, MACRO_BAR_GIF_NATIVE_SECONDS);
  const MACRO_BAR_MIN_VISIBLE_FILL_RATIO = 0.0011;
  const MACRO_ROW_AFTER_BAR_SECONDS = 0.14;
  const MACRO_BAR_GIF_FRAME_STEPS = 80;
  const MACRO_BAR_GIF_FINAL_HOLD_CENTISECONDS = 65535;
  const INTRO_RANKED_SPRITE_PATH = './sprites/ui/intro_&_outro/ranked.png';
  const OUTRO_D_TIER_SPRITE_PATH = './sprites/ui/intro_&_outro/D tier.png';
  const INTRO_RANKED_VISIBLE_CENTER = { x: 0.5, y: 0.47 };
  const INTRO_HERO_SIZE = { ranked: 80, foodWidth: 48, foodHeight: 24 };
  const AVAILABLE_FOOD_IMAGE_IDS = new Set(['bacon']);
  const STALE_LAYOUT_MIN_LAYER_RATIO = 0.72;
  let ignoredDisplayBuilderLayoutInfo = null;
  const SUBMACRO_VALUE_COLORS = {
    green: '#7cf2a7',
    red: '#ff6f6f',
    neutral: '#ffffff'
  };
  const MACRO_BAR_GIF_SOURCE_CACHE = new Map();
  const MACRO_BAR_GIF_FRAME_CACHE = new Map();

  const DISPLAY_SCHEMA = window.FOODRANKED_DISPLAY_SCHEMA || {};

  const SECTIONS = [
    { id: 'intro', label: 'Hook', duration: 2.4, reveal: 'pop' },
    { id: 'fats', label: 'Fats', duration: 4.2, reveal: 'cascade' },
    { id: 'carbs', label: 'Carbs', duration: 3.8, reveal: 'cascade' },
    { id: 'protein', label: 'Protein', duration: 4.2, reveal: 'cascade' },
    { id: 'vitamins', label: 'Vitamins', duration: 3.6, reveal: 'wipe' },
    { id: 'minerals', label: 'Minerals', duration: 3.6, reveal: 'wipe' },
    { id: 'pros', label: 'Pros', duration: 5.2, reveal: 'slide' },
    { id: 'cons', label: 'Cons', duration: 5.2, reveal: 'slide' },
    { id: 'outro', label: 'Verdict', duration: 4.0, reveal: 'pop' }
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
    captionSize: document.getElementById('captionSize'),
    captionText: document.getElementById('captionText'),
    resetCaptions: document.getElementById('resetCaptions'),
    copyManifest: document.getElementById('copyManifest'),
    manifestOutput: document.getElementById('manifestOutput'),
    spriteDiagnostics: document.getElementById('spriteDiagnostics'),
    copySpriteReport: document.getElementById('copySpriteReport')
  };

  const foods = Array.isArray(window.FOODS_INDEX) ? window.FOODS_INDEX : [];
  const BATCH_RESULTS_CACHE = new Map();
  const savedState = readJson(localStorage.getItem(VIDEO_STATE_KEY), {});
  const urlParams = new URLSearchParams(window.location.search);
  const requestedLayoutSourceId = urlParams.get('layoutSource') || '';
  if (Object.prototype.hasOwnProperty.call(savedState, 'audioEnabled')) {
    delete savedState.audioEnabled;
    localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify(savedState));
  }
  const state = {
    foodFilter: '',
    selectedFoodId: savedState.selectedFoodId || 'bacon',
    layoutSourceId: requestedLayoutSourceId || savedState.layoutSourceId || 'display-builder',
    selectedSceneId: savedState.selectedSceneId || 'intro',
    audioEnabled: true,
    currentTime: 0,
    playing: false,
    startedAt: 0,
    playheadStart: 0,
    scenes: [],
    layout: null,
    savedLayouts: loadSavedLayouts(),
    backgroundKey: '',
    backgroundToken: 0,
    audioTimelineKey: '',
    audioDurationSeconds: null,
    audioInHold: false,
    stampSfxPool: [],
    stampSfxPoolIndex: 0,
    playedStampSfxKeys: new Set(),
    transitionSfxPool: [],
    transitionSfxPoolIndex: 0,
    playedTransitionSfxKeys: new Set(),
    micronBarConfirmSfxPool: [],
    micronBarConfirmSfxPoolIndex: 0,
    playedMicronBarConfirmSfxKeys: new Set(),
    micron100FireworkLeadSfxPool: [],
    micron100FireworkLeadSfxPoolIndex: 0,
    micron100FireworkSfxPool: [],
    micron100FireworkSfxPoolIndex: 0,
    playedMicron100FireworkSfxKeys: new Set(),
    majorProSparkleSfxPool: [],
    majorProSparkleSfxPoolIndex: 0,
    playedMajorProSparkleSfxKeys: new Set(),
    barFillSfxPool: [],
    barFillSfxPoolIndex: 0,
    playedBarFillSfxKeys: new Set(),
    barFillSfxAudioContext: null,
    barFillSfxBuffer: null,
    barFillSfxBufferPromise: null,
    barFillSfxSources: new Set(),
    highlightGlowSfxAudio: null,
    highlightGlowSfxVolume: 0,
    highlightGlowSfxKey: '',
    highlightGlowSfxPlaybackRate: 1,
    highlightGlowSfxTargetPlaybackRate: 1,
    highlightGlowSfxLastFrameAt: performance.now(),
    spriteFailures: new Map(),
    diagnosticsTimer: 0
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

  function countLayoutLayers(layout) {
    return SECTIONS.reduce((total, section) => {
      const layers = layout?.sections?.[section.id]?.layers;
      return total + (Array.isArray(layers) ? layers.length : 0);
    }, 0);
  }

  function defaultLayoutLayerCount() {
    return countLayoutLayers(window.FOODRANKED_DISPLAY_BUILDER_DEFAULT_LAYOUT || {});
  }

  function layoutHealth(layout) {
    const defaultCount = defaultLayoutLayerCount();
    const layerCount = countLayoutLayers(layout);
    const threshold = Math.floor(defaultCount * STALE_LAYOUT_MIN_LAYER_RATIO);
    const missingSections = SECTIONS
      .filter(section => !Array.isArray(layout?.sections?.[section.id]?.layers))
      .map(section => section.id);
    return {
      layerCount,
      defaultLayerCount: defaultCount,
      threshold,
      missingSections,
      stale: !!layout?.sections && (layerCount < threshold || missingSections.length > 0)
    };
  }

  function layoutSyncIssue(layout) {
    if (!layout?.sections) return null;
    const health = layoutHealth(layout);
    const savedVersion = layout?.meta?.repoLayoutVersion || 'unversioned';
    if (savedVersion !== REPO_LAYOUT_VERSION) {
      return {
        ...health,
        reason: 'repo layout version changed',
        savedVersion,
        repoVersion: REPO_LAYOUT_VERSION
      };
    }
    if (health.stale) {
      return {
        ...health,
        reason: 'stale or incomplete local layout',
        savedVersion,
        repoVersion: REPO_LAYOUT_VERSION
      };
    }
    return null;
  }

  function spriteReportUrl(src) {
    if (!src) return '';
    const raw = String(src);
    if (raw.startsWith('data:')) return 'inline fallback image';
    try {
      const url = new URL(raw, window.location.href);
      const repoMarker = '/Foodranked/';
      const markerIndex = url.pathname.indexOf(repoMarker);
      const path = markerIndex === -1
        ? url.pathname.replace(/^\//, '')
        : url.pathname.slice(markerIndex + repoMarker.length);
      return `${path}${url.search}`;
    } catch {
      return raw;
    }
  }

  function recordSpriteFailure(src, fallbackSrc = '', label = '') {
    const source = spriteReportUrl(src);
    if (!source || source === 'inline fallback image') return;
    const fallback = spriteReportUrl(fallbackSrc);
    const key = `${source}|${fallback}`;
    const existing = state.spriteFailures.get(key);
    state.spriteFailures.set(key, {
      source,
      fallback,
      label: label || existing?.label || '',
      count: (existing?.count || 0) + 1
    });
    scheduleSpriteDiagnostics();
  }

  function currentBrokenImages() {
    return [...document.images]
      .filter(img => img.src && (!img.complete || img.naturalWidth === 0))
      .map(img => spriteReportUrl(img.currentSrc || img.src))
      .filter(Boolean);
  }

  function spriteDiagnosticsLines(limit = 8) {
    const broken = currentBrokenImages();
    const failures = [...state.spriteFailures.values()].slice(-limit);
    const food = selectedFood();
    const foodImageIds = [...AVAILABLE_FOOD_IMAGE_IDS].sort();
    const rawDisplayLayout = rawDisplayBuilderLayout();
    const displayLayout = loadDisplayBuilderLayout();
    const sourceLabel = state.layoutSourceId === 'display-builder'
      ? displayLayout
        ? `display builder synced local layout (${REPO_LAYOUT_VERSION})`
        : ignoredDisplayBuilderLayoutInfo
          ? `repo default fallback; ignored display-builder local layout (${ignoredDisplayBuilderLayoutInfo.reason})`
          : 'repo default fallback'
      : state.layoutSourceId === 'default'
        ? 'repo default layout'
        : `saved layout ${state.layoutSourceId.replace(/^saved:/, '')}`;
    const ignored = ignoredDisplayBuilderLayoutInfo;
    const allLayerCount = countLayoutLayers(state.layout);
    const lines = [
      'FoodRanked sprite report',
      `build: ${BUILDER_BUILD_ID}`,
      `page: ${window.location.href}`,
      `layout source: ${sourceLabel}`,
      `display-builder local layout present: ${rawDisplayLayout ? 'yes' : 'no'}`,
      `selected food: ${food?.id || 'none'} (${food?.name || 'unknown'})`,
      `layout layers: ${allLayerCount}`,
      `repo default layers: ${defaultLayoutLayerCount()}`,
      `ignored local layout layers: ${ignored ? ignored.layerCount : 'none'}`,
      `ignored local layout version: ${ignored ? ignored.savedVersion : 'none'}`,
      `repo layout version: ${REPO_LAYOUT_VERSION}`,
      `committed custom food images: ${foodImageIds.join(', ') || 'none'}`,
      `selected food has committed image: ${AVAILABLE_FOOD_IMAGE_IDS.has(String(food?.id || '').toLowerCase()) ? 'yes' : 'no, using food-type plate fallback'}`,
      `remembered failures: ${state.spriteFailures.size}`,
      `currently broken images: ${broken.length}`
    ];
    failures.forEach(item => {
      const fallback = item.fallback ? ` -> fallback ${item.fallback}` : '';
      const label = item.label ? ` (${item.label})` : '';
      lines.push(`failed ${item.source}${fallback}${label}`);
    });
    broken.slice(0, limit).forEach(src => lines.push(`broken now ${src}`));
    return lines;
  }

  function updateSpriteDiagnostics() {
    if (!els.spriteDiagnostics) return;
    const broken = currentBrokenImages();
    const issueCount = state.spriteFailures.size + broken.length;
    els.spriteDiagnostics.classList.toggle('ok', issueCount === 0);
    els.spriteDiagnostics.classList.toggle('warn', issueCount > 0);
    if (!issueCount) {
      const layoutNote = ignoredDisplayBuilderLayoutInfo ? ` - using repo default; ignored ${ignoredDisplayBuilderLayoutInfo.reason}` : '';
      els.spriteDiagnostics.textContent = `Sprite check OK - ${BUILDER_BUILD_ID}${layoutNote}`;
      return;
    }
    const details = spriteDiagnosticsLines(6).slice(11);
    els.spriteDiagnostics.textContent = `Sprite issues ${issueCount} - ${BUILDER_BUILD_ID}\n${details.join('\n')}`;
  }

  function scheduleSpriteDiagnostics(delay = 300) {
    window.clearTimeout(state.diagnosticsTimer);
    state.diagnosticsTimer = window.setTimeout(updateSpriteDiagnostics, delay);
  }

  function spriteDiagnosticsReport() {
    return spriteDiagnosticsLines(20).join('\n');
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
    path = canonicalSpritePath(path);
    if (/^(data:|https?:|blob:)/i.test(path)) return path;
    if (path.startsWith('./sprites/')) return `../app/${path.slice(2)}`;
    if (path.startsWith('sprites/')) return `../app/${path}`;
    if (path.startsWith('./app/')) return `../${path.slice(2)}`;
    if (path.startsWith('app/')) return `../${path}`;
    if (path.startsWith('../app/')) return path;
    return path;
  }

  function canonicalSpritePath(src) {
    if (!src || /^(data:|https?:|blob:)/i.test(src)) return src;
    const next = String(src)
      .replace('/header/food_image_plate/', '/header/food_plate/')
      .replace(/\/macros\/protein\/protein_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif')
      .replace(/\/macros_section\/section_3_protein\/protein_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif')
      .replace(/\/macros\/protein\/protein_macro_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif')
      .replace(/\/macros_section\/section_3_protein\/protein_macro_bar_fill\.(svg|png|gif|webp)/i, '/macros_section/section_3_protein/protein_macro_bar_fill.gif');
    if (next.toLowerCase().includes('/macros_section/section_3_protein/protein_macro_bar_fill.gif')) return next;
    return next
      .replace('/macros/fats/fat_bar_frame.svg', '/macros_section/macro_bar_frame.png')
      .replace('/macros/fats/fat_bar_fill.svg', '/macros_section/section_1_fats/fat_macro_bar_fill.gif')
      .replace('/macros/carbs/carb_bar_frame.svg', '/macros_section/macro_bar_frame.png')
      .replace('/macros/carbs/carb_bar_fill.svg', '/macros_section/section_2_carbs/carb_macro_bar_fill.gif')
      .replace('/macros/arrow_indicators/', '/macros_section/arrow_indicators/')
      .replace('/macros/fats/', '/macros_section/section_1_fats/')
      .replace('/macros/carbs/', '/macros_section/section_2_carbs/')
      .replace('/macros/protein/', '/macros_section/section_3_protein/')
      .replace('/micros/vitamins/', '/micros_section/vitamins/')
      .replace('/micros/minerals/', '/micros_section/minerals/')
      .replace('/pros-cons/', '/pros_and_cons/');
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
    if (!AVAILABLE_FOOD_IMAGE_IDS.has(String(food?.id || '').toLowerCase())) return foodPlatePath(food);
    return appSpritePath(`header/food_images/${food?.id || 'bacon'}.png`);
  }

  function hasCustomFoodImage(food) {
    return Boolean(food?.assets?.customFoodImage?.path || food?.customFoodImage?.path)
      || AVAILABLE_FOOD_IMAGE_IDS.has(String(food?.id || '').toLowerCase());
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
      { x: rankedBox.x + (10 * scaleX), y: rankedBox.y + (6 * scaleY), delay: 0.02, text: '*', size: 11 },
      { x: rankedBox.x + (74 * scaleX), y: rankedBox.y + (12 * scaleY), delay: 0.14, text: '+', size: 9 },
      { x: rankedBox.x + (5 * scaleX), y: rankedBox.y + (66 * scaleY), delay: 0.26, text: '+', size: 9 },
      { x: rankedBox.x + (78 * scaleX), y: rankedBox.y + (61 * scaleY), delay: 0.38, text: '*', size: 11 },
      { x: rankedBox.x + (45 * scaleX), y: rankedBox.y + (0 * scaleY), delay: 0.50, text: '*', size: 8 }
    ].map((glimmer, index) => ({
      id: `intro_ranked_glimmer_${index + 1}`,
      kind: 'text',
      label: 'Hook ranked glimmer',
      text: glimmer.text,
      x: glimmer.x,
      y: glimmer.y,
      z: 64 + index,
      width: 6,
      fontSize: glimmer.size,
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

  function rawDisplayBuilderLayout() {
    const saved = readJson(localStorage.getItem(DISPLAY_LAYOUT_KEY), null);
    return saved?.sections ? saved : null;
  }

  function loadDisplayBuilderLayout() {
    const saved = rawDisplayBuilderLayout();
    ignoredDisplayBuilderLayoutInfo = null;
    const syncIssue = layoutSyncIssue(saved);
    if (syncIssue) {
      ignoredDisplayBuilderLayoutInfo = syncIssue;
      return null;
    }
    return saved;
  }

  function layoutSourceOptions() {
    state.savedLayouts = loadSavedLayouts();
    const rawDisplayLayout = rawDisplayBuilderLayout();
    const displayLayout = loadDisplayBuilderLayout();
    const displayLabel = ignoredDisplayBuilderLayoutInfo
      ? 'Display builder saved layout (ignored; using repo default)'
      : displayLayout
        ? 'Display builder synced saved layout'
        : rawDisplayLayout
          ? 'Display builder saved layout (unavailable)'
          : 'Display builder saved layout (empty)';
    const options = [
      { id: 'display-builder', label: displayLabel },
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
    layout.sections[sectionId].layers.forEach(layer => {
      if (!isSpriteLayer(layer)) return;
      layer.src = canonicalSpritePath(layer.src);
      if (layer.fallbackSrc) layer.fallbackSrc = canonicalSpritePath(layer.fallbackSrc);
    });
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

  function isOutroTierStamp(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.effect || ''}`.toLowerCase();
    return fingerprint.includes('outro_d_tier_stamp') || fingerprint.includes('d-tier-stamp');
  }

  function isPersistentChrome(layer) {
    if (isOutroTierStamp(layer)) return false;
    return isHeaderSprite(layer) || isHeaderText(layer) || (isUiSprite(layer) && !isSectionIndicator(layer));
  }

  function isHeaderChrome(layer) {
    return isHeaderSprite(layer) || isHeaderText(layer);
  }

  function indicatorSectionIndex(sectionId) {
    return SECTIONS.findIndex(section => section.id === sectionId);
  }

  function compareIndicatorsByPosition(a, b) {
    return (Number(a.x) || 0) - (Number(b.x) || 0) || (Number(a.y) || 0) - (Number(b.y) || 0);
  }

  function normalizeProgressIndicatorSlots(indicators) {
    const sorted = [...(indicators || [])].sort(compareIndicatorsByPosition);
    const slotCount = SECTIONS.length;
    const candidateVisible = sorted.filter(layer => layer.visible !== false);
    const visible = (candidateVisible.length >= slotCount ? candidateVisible : sorted).slice(0, slotCount);
    const visibleSet = new Set(visible);
    sorted.forEach(layer => {
      layer.visible = visibleSet.has(layer);
    });
    if (!visible.length) return visible;
    visible.forEach(layer => { layer.visible = true; });
    return visible;
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

  function micronSpecsForSection(sectionId) {
    if (sectionId === 'vitamins') return VITAMIN_TEXT_SPECS;
    if (sectionId === 'minerals') return MINERAL_TEXT_SPECS;
    return [];
  }

  function micronStepForColumn(sectionId, columnIndex, food = selectedFood()) {
    const spec = micronSpecsForSection(sectionId)[columnIndex];
    return spec ? micronutrientStep(food?.metrics?.[spec.key]) : null;
  }

  function maxMicronStepForSection(sectionId, food = selectedFood()) {
    return micronSpecsForSection(sectionId).reduce((maxStep, spec) => {
      return Math.max(maxStep, micronutrientStep(food?.metrics?.[spec.key]) || 0);
    }, 0);
  }

  function sectionNarrationDelaySeconds(sectionId, food = selectedFood()) {
    if (['fats', 'carbs', 'protein'].includes(sectionId)) {
      return Number((macroSubmacroRevealDelaySeconds(sectionId, food) + SECTION_NARRATION_AFTER_REVEAL_PAD_SECONDS).toFixed(3));
    }
    if (sectionId === 'vitamins' || sectionId === 'minerals') {
      const maxStep = Math.max(1, maxMicronStepForSection(sectionId, food));
      return Number((
        MICRON_GRAPH_REVEAL_SECONDS
        + MICRON_BAR_AFTER_GRAPH_SECONDS
        + ((maxStep - 1) * MICRON_BAR_STEP_SECONDS)
        + MICRON_BAR_STAMP_REVEAL_SECONDS
        + SECTION_NARRATION_AFTER_REVEAL_PAD_SECONDS
      ).toFixed(3));
    }
    if (sectionId === 'pros' || sectionId === 'cons') {
      return Number((PRO_CON_ROW_REVEAL_SECONDS + (2 * PRO_CON_ROW_STEP_SECONDS) + PRO_CON_NARRATION_AFTER_REVEAL_PAD_SECONDS).toFixed(3));
    }
    return 0;
  }

  function macroSubmacroRevealDelaySeconds(sectionId = null, food = selectedFood()) {
    return MACRO_REVEAL_SECONDS
      + MACRO_BAR_START_DWELL_SECONDS
      + macroBarFillDurationSeconds(sectionId ? macroBarFillRatio(food, sectionId) : 1)
      + MACRO_ROW_AFTER_BAR_SECONDS;
  }

  function macroBarFillDurationSeconds(fillRatio) {
    return macroBarFillMotionTiming(fillRatio).totalSeconds;
  }

  function macroBarFillMotionTiming(fillRatio) {
    const ratio = clamp(asNumber(fillRatio, 1), MACRO_BAR_MIN_VISIBLE_FILL_RATIO, 1);
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

  function cubicHermite(progress, startSlope, endSlope) {
    const t = clamp(progress, 0, 1);
    const t2 = t * t;
    const t3 = t2 * t;
    return ((2 * t3) - (3 * t2) + 1) * 0
      + (t3 - (2 * t2) + t) * startSlope
      + ((-2 * t3) + (3 * t2)) * 1
      + (t3 - t2) * endSlope;
  }

  function macroFillRange(foodType, sectionId) {
    if (typeof DISPLAY_SCHEMA.getMacroFillRange === 'function') {
      return DISPLAY_SCHEMA.getMacroFillRange(foodType, sectionId);
    }
    const fallback = DISPLAY_SCHEMA.defaultMacroFillRanges?.[sectionId];
    return Array.isArray(fallback) ? fallback : [0, 30];
  }

  function macroValue(food, sectionId) {
    const header = food?.header || {};
    if (sectionId === 'fats') return asNumber(header.fat_g, null);
    if (sectionId === 'carbs') return asNumber(header.carb_g, null);
    if (sectionId === 'protein') return asNumber(header.protein_g, null);
    return null;
  }

  function macroBarFillRatio(food, sectionId) {
    const value = macroValue(food, sectionId);
    if (value == null || value <= 0) return 0;
    const [min, max] = macroFillRange(food?.foodType, sectionId);
    if (max <= min) return MACRO_BAR_MIN_VISIBLE_FILL_RATIO;
    const ratio = (value - min) / (max - min);
    return ratio <= 0 ? MACRO_BAR_MIN_VISIBLE_FILL_RATIO : clamp(ratio, 0, 1);
  }

  function syncHeader(layout, food) {
    const values = {
      food_name_text: String(food?.name || 'Unknown').toUpperCase(),
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
      const layers = normalizeProgressIndicatorSlots(getSectionLayers(layout, section.id).filter(isSectionIndicator));
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

  function ensureMacroTotalTextLayers(layout) {
    const specsBySection = {
      fats: [
        { id: 'fats_macro_label', label: 'FATS macro label', x: 35, y: 43, fontSize: 8, text: 'fats', width: 40, align: 'left' },
        { id: 'fats_macro_value', label: 'FATS macro grams', x: 35, y: 54, fontSize: 7, text: 'N/A', width: 34, align: 'left' }
      ],
      carbs: [
        { id: 'carbs_macro_label', label: 'CARBS macro label', x: 35, y: 43, fontSize: 8, text: 'CARBS', width: 40, align: 'left' },
        { id: 'carbs_macro_value', label: 'CARBS macro grams', x: 35, y: 54, fontSize: 7, text: 'N/A', width: 34, align: 'left' }
      ],
      protein: [
        { id: 'protein_macro_label', label: 'PROTEIN macro label', x: 35, y: 43, fontSize: 8, text: 'PROTEIN', width: 50, align: 'left' },
        { id: 'protein_macro_value', label: 'PROTEIN macro grams', x: 35, y: 54, fontSize: 7, text: 'N/A', width: 34, align: 'left' }
      ]
    };
    for (const [sectionId, specs] of Object.entries(specsBySection)) {
      const layers = getSectionLayers(layout, sectionId);
      const topZ = Math.max(9, layers.reduce((max, layer) => Math.max(max, Number(layer.z) || 0), 0) + 1);
      specs.forEach(spec => {
        let layer = layers.find(item => item.id === spec.id);
        if (!layer) {
          layer = {
            id: spec.id,
            kind: 'text',
            label: spec.label,
            x: spec.x,
            y: spec.y,
            z: topZ,
            visible: true,
            text: spec.text,
            fontSize: spec.fontSize,
            width: spec.width,
            align: spec.align
          };
          layers.push(layer);
        }
        layer.label = spec.label;
        layer.fontSize = layer.fontSize || spec.fontSize;
        layer.width = layer.width || spec.width;
        layer.align = layer.align || spec.align;
        layer.z = Math.max(Number(layer.z) || 0, topZ);
      });
    }
  }

  function syncMacroTotalTextForSection(layout, sectionId, labelText, valueText) {
    const layers = getSectionLayers(layout, sectionId);
    const label = layers.find(layer => layer.id === `${sectionId}_macro_label`);
    const value = layers.find(layer => layer.id === `${sectionId}_macro_value`);
    if (label && !label.manualText) label.text = labelText;
    if (value && !value.manualText) value.text = valueText;
  }

  function syncMacroTotalText(layout, food) {
    syncMacroTotalTextForSection(layout, 'fats', 'fats', formatMetric(food?.header?.fat_g, 'g'));
    syncMacroTotalTextForSection(layout, 'carbs', 'CARBS', 'N/A');
    syncMacroTotalTextForSection(layout, 'protein', 'PROTEIN', formatMetric(food?.header?.protein_g, 'g'));
  }

  function macroBarLayerSection(layer, fallbackSectionId = '') {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (fingerprint.includes('section_1_fats') || /\bfat(?:s)?[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'fats';
    if (fingerprint.includes('section_2_carbs') || /\bcarb(?:s)?[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'carbs';
    if (fingerprint.includes('section_3_protein') || /\bprotein[_ -]?(?:macro_)?bar/.test(fingerprint)) return 'protein';
    return ['fats', 'carbs', 'protein'].includes(fallbackSectionId) ? fallbackSectionId : '';
  }

  function isMacroBarFrame(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return isSpriteLayer(layer) && /(macro_bar_frame|bar_frame|macro bar frame)/.test(fingerprint);
  }

  function isMacroBarFill(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return isSpriteLayer(layer) && /(macro_bar_fill|bar_fill|macro bar fill)/.test(fingerprint);
  }

  const MACRO_BAR_LAYER_SPECS = {
    fats: {
      fillId: 'fats_macro_bar_fill',
      fillLabel: 'FATS macro bar fill',
      fillSrc: './sprites/macros_section/section_1_fats/fat_macro_bar_fill.gif',
      frameId: 'fats_macro_bar_frame'
    },
    carbs: {
      fillId: 'carbs_macro_bar_fill',
      fillLabel: 'CARBS macro bar fill',
      fillSrc: './sprites/macros_section/section_2_carbs/carb_macro_bar_fill.gif'
    },
    protein: {
      fillId: 'protein_macro_bar_fill',
      fillLabel: 'PROTEIN macro bar fill',
      fillSrc: './sprites/macros_section/section_3_protein/protein_macro_bar_fill.gif'
    }
  };

  function ensureMacroBarLayers(layout) {
    for (const [sectionId, spec] of Object.entries(MACRO_BAR_LAYER_SPECS)) {
      const layers = getSectionLayers(layout, sectionId);
      layers.forEach(layer => {
        if (!isMacroBarFill(layer) || macroBarLayerSection(layer, sectionId) !== sectionId) return;
        const isLibraryLayer = String(layer?.label || '').startsWith('Library: ') || /^lib_/i.test(String(layer?.id || ''));
        layer.src = spec.fillSrc;
        if (isLibraryLayer) return;
        layer.label = spec.fillLabel;
        if (sectionId === 'protein') layer.id = spec.fillId;
      });
      const hasFrame = spec.frameId
        ? layers.some(layer => isMacroBarFrame(layer) && macroBarLayerSection(layer, sectionId) === sectionId)
        : true;
      const hasFill = layers.some(layer => isMacroBarFill(layer) && macroBarLayerSection(layer, sectionId) === sectionId);
      if (!hasFill) {
        layers.push({
          id: spec.fillId,
          kind: 'sprite',
          label: spec.fillLabel,
          src: spec.fillSrc,
          x: 31,
          y: 48,
          z: 7,
          width: 88,
          height: 14,
          visible: true,
          foodDriven: true,
          preserveAspect: false,
          manualPosition: false
        });
      }
      if (!hasFrame) {
        layers.push({
          id: spec.frameId,
          kind: 'sprite',
          label: 'Macro bar frame',
          src: './sprites/macros_section/macro_bar_frame.png',
          x: 31,
          y: 48,
          z: 8,
          width: 88,
          height: 14,
          visible: true,
          foodDriven: false,
          preserveAspect: false,
          manualPosition: false
        });
      }
    }
  }

  function syncMacroBars(layout, food) {
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      const sectionLayers = getSectionLayers(layout, sectionId);
      const frameZ = sectionLayers
        .filter(isMacroBarFrame)
        .reduce((maxZ, layer) => Math.max(maxZ, Number(layer.z) || 0), 0);
      for (const layer of sectionLayers) {
        if (isMacroBarFrame(layer)) {
          layer.label = layer.label || 'Macro bar frame';
        }
        if (!isMacroBarFill(layer)) continue;
        const layerSection = macroBarLayerSection(layer, sectionId) || sectionId;
        layer.label = layer.label || `${layerSection.toUpperCase()} macro bar fill`;
        layer.fillRatio = macroBarFillRatio(food, layerSection);
        layer.fillRange = macroFillRange(food?.foodType, layerSection);
        layer.fillValue = macroValue(food, layerSection);
        layer.z = Math.max(Number(layer.z) || 0, frameZ + 1);
      }
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

  function scoreTier(food) {
    return food?.episode?.tier || food?.tier || food?.expectedTier || '';
  }

  function formatOverallScore(food) {
    const score = asNumber(overallScore(food), null);
    return score == null ? 'N/A' : formatCompactNumber(score, 0);
  }

  function hexToRgb(color) {
    const value = String(color || '').trim();
    const match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    const hex = match[1].length === 3
      ? match[1].split('').map(char => `${char}${char}`).join('')
      : match[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map(value => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`;
  }

  function mixHexColor(from, to, amount) {
    const start = hexToRgb(from);
    const end = hexToRgb(to);
    if (!start || !end) return to;
    const t = clamp(amount, 0, 1);
    return rgbToHex({
      r: start.r + ((end.r - start.r) * t),
      g: start.g + ((end.g - start.g) * t),
      b: start.b + ((end.b - start.b) * t)
    });
  }

  function scoreGradeColor(score) {
    const safe = asNumber(score, null);
    if (safe == null) return SUBMACRO_VALUE_COLORS.neutral;
    if (safe < 20) return SUBMACRO_VALUE_COLORS.red;
    if (safe >= 60) return SUBMACRO_VALUE_COLORS.green;
    if (safe < 40) return mixHexColor(SUBMACRO_VALUE_COLORS.red, '#f6c65f', (safe - 20) / 20);
    return mixHexColor('#f6c65f', SUBMACRO_VALUE_COLORS.green, (safe - 40) / 20);
  }

  function outroScoreGlowStyle(food) {
    const tier = String(scoreTier(food)).toUpperCase();
    const score = overallScore(food);
    if (tier === 'S' || asNumber(score, 0) >= 80) {
      return {
        gradeClass: 'score-grade-s',
        color: '#00bfa5',
        core: 'rgba(196, 255, 246, 0.98)',
        soft: 'rgba(0, 191, 165, 0.86)',
        wide: 'rgba(124, 242, 167, 0.46)'
      };
    }

    const color = scoreGradeColor(score);
    return {
      gradeClass: 'score-grade-standard',
      color,
      core: colorWithAlpha(color, 0.98),
      soft: colorWithAlpha(color, 0.72),
      wide: colorWithAlpha(color, 0.38)
    };
  }

  function applyOutroScoreGlow(node, layer, food) {
    if (String(layer?.id || '').toLowerCase() !== 'outro_score_value') return;
    const style = outroScoreGlowStyle(food);
    node.classList.add('outro-score-glow', style.gradeClass);
    node.style.color = style.color;
    node.style.setProperty('--outro-score-color', style.color);
    node.style.setProperty('--outro-score-glow-core', style.core);
    node.style.setProperty('--outro-score-glow-soft', style.soft);
    node.style.setProperty('--outro-score-glow-wide', style.wide);
  }

  function ensureOutroTierStampLayer(layout, food) {
    const layers = getSectionLayers(layout, 'outro');
    let layer = layers.find(item => item.id === 'outro_d_tier_stamp');
    const hadExistingLayer = Boolean(layer);
    if (!layer) {
      layer = {
        id: 'outro_d_tier_stamp',
        kind: 'sprite',
        label: 'D tier verdict stamp',
        src: OUTRO_D_TIER_SPRITE_PATH,
        x: 28.5,
        y: 62.5,
        z: 38,
        width: 78,
        height: 78,
        visible: true,
        foodDriven: false,
        preserveAspect: true,
        aspectRatio: 1,
        centerAnchor: 'visible-canvas',
        centerOffsetX: 0,
        centerOffsetY: 0,
        effect: 'd-tier-stamp'
      };
      layers.push(layer);
    }

    const tier = String(scoreTier(food)).trim().toUpperCase();
    layer.src = OUTRO_D_TIER_SPRITE_PATH;
    layer.label = 'D tier verdict stamp';
    layer.visible = tier === 'D';
    layer.effect = 'd-tier-stamp';
    if (layer.preserveAspect !== false) layer.preserveAspect = true;
    if (!Number.isFinite(Number(layer.x))) layer.x = 28.5;
    if (!Number.isFinite(Number(layer.y))) layer.y = 62.5;
    if (!Number.isFinite(Number(layer.z))) layer.z = 38;
    if (!Number.isFinite(Number(layer.width))) layer.width = 78;
    if (!Number.isFinite(Number(layer.height))) layer.height = 78;
    if (!Number.isFinite(Number(layer.aspectRatio))) layer.aspectRatio = 1;
    if (!hadExistingLayer && !layer.centerAnchor) layer.centerAnchor = 'visible-canvas';
    if (layer.centerAnchor === 'visible-canvas') {
      if (!Number.isFinite(Number(layer.centerOffsetX))) layer.centerOffsetX = 0;
      if (!Number.isFinite(Number(layer.centerOffsetY))) layer.centerOffsetY = 0;
    }
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

  function deletedLayerIdSet(layout) {
    return new Set((Array.isArray(layout?.meta?.deletedLayerIds) ? layout.meta.deletedLayerIds : [])
      .map(id => String(id || '').trim())
      .filter(Boolean));
  }

  function filterDeletedLayers(layout) {
    const deletedIds = deletedLayerIdSet(layout);
    if (!deletedIds.size) return;
    for (const section of SECTIONS) {
      layout.sections[section.id].layers = getSectionLayers(layout, section.id)
        .filter(layer => !layer.id || !deletedIds.has(String(layer.id)));
    }
  }

  function hydrateLayoutForFood() {
    const food = selectedFood();
    const layout = selectedLayoutBase();
    normalizeOutroScoreLayout(layout);
    ensureOutroTierStampLayer(layout, food);
    ensureMacroTextLayers(layout);
    ensureMacroTotalTextLayers(layout);
    ensureMacroBarLayers(layout);
    syncHeader(layout, food);
    syncSectionIndicators(layout, food);
    syncMacroTotalText(layout, food);
    syncMacroText(layout, food);
    syncMacroBars(layout, food);
    syncMacroArrows(layout, food);
    syncMicros(layout, food, 'vitamins', VITAMIN_TEXT_SPECS, 'vitamins_label', 'vitamins_percent');
    syncMicros(layout, food, 'minerals', MINERAL_TEXT_SPECS, 'minerals_label', 'minerals_percent');
    syncProsCons(layout, food);
    filterDeletedLayers(layout);
    state.layout = layout;
    prewarmMacroBarGifVariants(layout, food);
    const displayLayout = loadDisplayBuilderLayout();
    const layoutLabel = state.layoutSourceId === 'display-builder'
      ? displayLayout
        ? 'Saved layout synced to repo version'
        : ignoredDisplayBuilderLayoutInfo
          ? 'Default layout (ignored old saved layout)'
          : 'Default layout'
      : state.layoutSourceId === 'default'
        ? 'Default layout'
        : 'Saved layout preset';
    els.layoutStatus.textContent = `${layoutLabel} · ${BUILDER_BUILD_ID}`;
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
      const narrationDelay = sectionNarrationDelaySeconds(section.id, food);
      const narrationDuration = Math.max(
        0.4,
        asNumber(existing?.narrationDurationSeconds, null)
          ?? (asNumber(existing?.contentDurationSeconds, null) != null
            ? Math.max(0.4, asNumber(existing.contentDurationSeconds, 0) - asNumber(existing.narrationDelaySeconds, 0))
            : null)
          ?? (asNumber(existing?.duration, null) != null ? Math.max(0.4, asNumber(existing.duration, 0) - existingHold) : null)
          ?? episodeTiming?.durationSeconds
          ?? section.duration
      );
      const contentDuration = narrationDelay + narrationDuration;
      return {
        id: section.id,
        label: section.label,
        duration: Number((contentDuration + holdSeconds).toFixed(3)),
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        narrationDelaySeconds: Number(narrationDelay.toFixed(3)),
        narrationDurationSeconds: Number(narrationDuration.toFixed(3)),
        holdSeconds,
        reveal: existing?.reveal || section.reveal,
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

  function sceneNarrationDelaySeconds(scene) {
    return Math.max(0, asNumber(scene?.narrationDelaySeconds, sectionNarrationDelaySeconds(scene?.id)) || 0);
  }

  function sceneNarrationDuration(scene) {
    const storedDuration = asNumber(scene?.narrationDurationSeconds, null);
    if (storedDuration != null) return Math.max(0.4, storedDuration);
    return Math.max(0.4, sceneContentDuration(scene) - sceneNarrationDelaySeconds(scene));
  }

  function sceneNarrationProgress(scene, sceneElapsed) {
    const narrationElapsed = sceneElapsed - sceneNarrationDelaySeconds(scene);
    return clamp(narrationElapsed / sceneNarrationDuration(scene), 0, 1);
  }

  function setSceneDuration(scene, duration) {
    const holdSeconds = sceneHoldSeconds(scene);
    const narrationDelay = sceneNarrationDelaySeconds(scene);
    const safeDuration = Math.max(narrationDelay + 0.4 + holdSeconds, asNumber(duration, scene.duration) || scene.duration || 1);
    const contentDuration = Math.max(narrationDelay + 0.4, safeDuration - holdSeconds);
    scene.duration = Number(safeDuration.toFixed(3));
    scene.contentDurationSeconds = Number(contentDuration.toFixed(3));
    scene.narrationDelaySeconds = Number(narrationDelay.toFixed(3));
    scene.narrationDurationSeconds = Number(Math.max(0.4, contentDuration - narrationDelay).toFixed(3));
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
    return state.scenes.reduce((sum, scene) => sum + sceneNarrationDuration(scene), 0);
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

  function isSceneNarrationDelayAt(time = state.currentTime) {
    const scene = activeSceneAt(time);
    if (!scene) return false;
    const delay = sceneNarrationDelaySeconds(scene);
    if (delay <= 0) return false;
    const elapsed = clamp(time - scene.start, 0, scene.duration);
    return elapsed < delay;
  }

  function videoTimeToAudioTime(time = state.currentTime) {
    const scenes = sceneStarts();
    let audioCursor = 0;
    for (const scene of scenes) {
      const narrationDelay = sceneNarrationDelaySeconds(scene);
      const narrationDuration = sceneNarrationDuration(scene);
      if (time < scene.start) return audioCursor;
      if (time <= scene.end) {
        const elapsed = clamp(time - scene.start, 0, scene.duration);
        return audioCursor + clamp(elapsed - narrationDelay, 0, narrationDuration);
      }
      audioCursor += narrationDuration;
    }
    return audioCursor;
  }

  function audioTimeToVideoTime(audioTime = 0) {
    const scenes = sceneStarts();
    let audioCursor = 0;
    for (const scene of scenes) {
      const narrationDelay = sceneNarrationDelaySeconds(scene);
      const narrationDuration = sceneNarrationDuration(scene);
      if (audioTime <= audioCursor + narrationDuration) {
        return scene.start + narrationDelay + clamp(audioTime - audioCursor, 0, narrationDuration);
      }
      audioCursor += narrationDuration;
    }
    return totalDuration();
  }

  function audioTimelineKey(food = selectedFood(), duration = null) {
    const audio = audioForFood(food);
    return [
      food?.id || '',
      audio?.mode || '',
      audio?.take || '',
      audio?.path || '',
      audio?.manifestPath || '',
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
    state.scenes = state.scenes.map(scene => {
      const narrationDelay = sceneNarrationDelaySeconds(scene);
      const narrationDuration = Math.max(0.4, sceneNarrationDuration(scene) * ratio);
      const contentDuration = narrationDelay + narrationDuration;
      const holdSeconds = sceneHoldSeconds(scene);
      return {
        ...scene,
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        narrationDelaySeconds: Number(narrationDelay.toFixed(3)),
        narrationDurationSeconds: Number(narrationDuration.toFixed(3)),
        holdSeconds,
        duration: Number((contentDuration + holdSeconds).toFixed(3))
      };
    });
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
      selectedSceneId: state.selectedSceneId
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
      button.innerHTML = `<strong>${escapeHtml(scene.label)}</strong><span>${scene.start.toFixed(1)}s - ${scene.end.toFixed(1)}s${holdLabel} · ${escapeHtml(scene.reveal)}</span>`;
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
    const holdDuration = totalHoldDuration();
    return {
      version: 'foodranked-video-builder-v1',
      foodId: food?.id || null,
      foodName: food?.name || null,
      layoutSource: state.layoutSourceId,
      canvas: { width: AUTHOR_GRID.width, height: AUTHOR_GRID.height, aspect: '9:16' },
      audio: audioForFood(food),
      duration: Number(totalDuration().toFixed(2)),
      narrationDuration: Number(totalNarrationDuration().toFixed(2)),
      totalHoldSeconds: Number(holdDuration.toFixed(2)),
      holdMode: holdDuration ? 'post-section-dwell' : null,
      audioHoldSeconds: Number(holdDuration.toFixed(2)),
      scenes: sceneStarts().map(scene => sceneManifestEntry(scene, food))
    };
  }

  function sceneManifestEntry(scene, food) {
    const timing = sceneTimingModel(scene);
    const layerSchedule = sceneLayerRevealSchedule(scene, food);
    const contentDuration = sceneContentDuration(scene);
    const narrationDelay = sceneNarrationDelaySeconds(scene);
    const narrationDuration = sceneNarrationDuration(scene);
    const holdSeconds = sceneHoldSeconds(scene);
    const captionsHidden = hideSceneCaptions(scene);
    return {
      id: scene.id,
      label: scene.label,
      start: Number(scene.start.toFixed(2)),
      end: Number(scene.end.toFixed(2)),
      duration: Number(scene.duration.toFixed(2)),
      contentDuration: Number(contentDuration.toFixed(2)),
      narrationDelaySeconds: Number(narrationDelay.toFixed(2)),
      narrationStart: Number((scene.start + narrationDelay).toFixed(2)),
      narrationDuration: Number(narrationDuration.toFixed(2)),
      holdSeconds: Number(holdSeconds.toFixed(2)),
      holdMode: holdSeconds ? 'post-section-dwell' : null,
      holdStart: holdSeconds ? Number((scene.start + contentDuration).toFixed(2)) : null,
      holdEnd: holdSeconds ? Number(scene.end.toFixed(2)) : null,
      reveal: scene.reveal,
      captionSize: scene.captionSize,
      caption: scene.caption,
      captionsHidden,
      subtitleCues: captionsHidden ? [] : (scene.subtitleCues || []).map(cue => {
        const chunk = timing.chunks.find(item => item.cueId && item.cueId === cue.id);
        return {
          id: cue.id,
          startSeconds: cue.startSeconds,
          endSeconds: cue.endSeconds,
          videoStartSeconds: chunk ? Number((scene.start + narrationDelay + (chunk.start * narrationDuration)).toFixed(3)) : null,
          videoEndSeconds: chunk ? Number((scene.start + narrationDelay + (chunk.end * narrationDuration)).toFixed(3)) : null,
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
        contentDurationSeconds: Number(contentDuration.toFixed(3)),
        narrationDelaySeconds: Number(narrationDelay.toFixed(3)),
        narrationDurationSeconds: Number(narrationDuration.toFixed(3)),
        holdSeconds: Number(holdSeconds.toFixed(3)),
        holdMode: holdSeconds ? 'post-section-dwell' : null,
        revealLeadSeconds: AUDIO_REVEAL_LEAD_SECONDS,
        revealWindowSeconds: AUDIO_REVEAL_WINDOW_SECONDS
      },
      revealBeats: timing.sentences.map(segment => ({
        start: Number(segment.start.toFixed(3)),
        end: Number(segment.end.toFixed(3)),
        absoluteStart: Number((scene.start + narrationDelay + (segment.start * narrationDuration)).toFixed(3)),
        absoluteEnd: Number((scene.start + narrationDelay + (segment.end * narrationDuration)).toFixed(3)),
        text: segment.text
      })),
      activeWords: timing.words.map(word => ({
        text: word.text,
        start: Number(word.start.toFixed(4)),
        end: Number(word.end.toFixed(4)),
        absoluteStart: Number((scene.start + narrationDelay + (word.start * narrationDuration)).toFixed(3)),
        absoluteEnd: Number((scene.start + narrationDelay + (word.end * narrationDuration)).toFixed(3))
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
    const sectionHeader = sectionLayers.filter(isHeaderChrome);
    const introHeader = introLayers.filter(isHeaderChrome);
    const sectionUiChrome = sectionLayers.filter(layer => isPersistentChrome(layer) && !isHeaderChrome(layer));
    const introUiChrome = introLayers.filter(layer => isPersistentChrome(layer) && !isHeaderChrome(layer));
    const sectionIndicators = sectionLayers.filter(isSectionIndicator);
    const introIndicators = introLayers.filter(isSectionIndicator);
    const rawLayers = [
      ...(sectionHeader.length ? sectionHeader : introHeader),
      ...(sectionUiChrome.length ? sectionUiChrome : introUiChrome),
      ...(sectionIndicators.length ? sectionIndicators : introIndicators)
    ].map(clone);
    const indicators = normalizeProgressIndicatorSlots(rawLayers.filter(isSectionIndicator));
    const visibleIndicatorSet = new Set(indicators);
    const layers = rawLayers.filter(layer => !isSectionIndicator(layer) || visibleIndicatorSet.has(layer));
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
    const narrationDelay = sceneNarrationDelaySeconds(scene);
    const narrationElapsed = sceneElapsed - narrationDelay;
    const narrationProgress = sceneNarrationProgress(scene, sceneElapsed);
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

    const layerList = layers.map(item => item.layer);
    const revealSchedules = layers.map(({ layer, index, persistent }) => (
      layer.visible === false ? null : layerRevealSchedule(layer, scene, index, persistent, layerList)
    ));
    applyStageShake(roots, scene, sceneProgress, revealSchedules);
    const macroHighlightMap = macroSubmetricHighlightMap(scene, narrationProgress);
    const micronHighlightMap = micronMetricHighlightMap(scene, narrationProgress);
    const proConHighlightMap = proConNarrationHighlightMap(scene, narrationProgress);
    updateHighlightGlowSfx(strongestHighlightCue(scene, macroHighlightMap, micronHighlightMap, proConHighlightMap));
    const existingNodes = new Map(
      Array.from(roots.layerRoot.querySelectorAll('[data-render-key]')).map(node => [node.dataset.renderKey || '', node])
    );
    const nextLayerNodes = document.createDocumentFragment();
    const macroHeadSchedules = revealSchedules.filter(isMacroHeadRevealSchedule);
    const macroHeadMaxZ = layers.reduce((maxZ, { layer }, scheduleIndex) => (
      isMacroHeadRevealSchedule(revealSchedules[scheduleIndex])
        ? Math.max(maxZ, Number(layer.z) || 0)
        : maxZ
    ), 0);
    const macroHeadGroupKey = `scene:macro-head-group:${scene.id}`;
    let macroHeadGroup = null;
    if (macroHeadSchedules.length) {
      macroHeadGroup = existingNodes.get(macroHeadGroupKey);
      if (!macroHeadGroup || !macroHeadGroup.classList?.contains('macro-head-group')) {
        macroHeadGroup = document.createElement('div');
      }
      macroHeadGroup.replaceChildren();
      macroHeadGroup.removeAttribute('style');
      macroHeadGroup.className = 'layer-group macro-head-group';
      macroHeadGroup.dataset.renderKey = macroHeadGroupKey;
      macroHeadGroup.dataset.revealFamily = 'macro';
      macroHeadGroup.dataset.revealKind = 'macro-head-group';
      macroHeadGroup.style.position = 'absolute';
      macroHeadGroup.style.inset = '0';
      macroHeadGroup.style.pointerEvents = 'none';
      macroHeadGroup.style.isolation = 'isolate';
      macroHeadGroup.style.willChange = 'opacity';
      macroHeadGroup.style.opacity = String(macroHeadRevealOpacity(scene, sceneProgress, revealSchedules));
      macroHeadGroup.style.zIndex = String(macroHeadMaxZ);
      nextLayerNodes.appendChild(macroHeadGroup);
    }
    layers.forEach(({ layer, index, persistent }, renderIndex) => {
      if (layer.visible === false) return;
      const macroBarFillLayer = !persistent && isMacroBarFill(layer);
      const tagName = macroBarFillLayer ? 'CANVAS' : layer.kind === 'sprite' ? 'IMG' : 'DIV';
      const renderKey = `${persistent ? 'persistent' : 'scene'}:${layer.kind}:${layer.id || index}`;
      let node = existingNodes.get(renderKey);
      if (!node || node.tagName !== tagName) node = document.createElement(tagName.toLowerCase());
      const effectClass = layer.effect ? ` ${String(layer.effect).replace(/[^a-z0-9_-]+/gi, '-')}` : '';
      node.className = `layer-node ${layer.kind}${layer.kind === 'text' ? ' pixel-text' : ''}${effectClass}`;
      node.removeAttribute('style');
      if (layer.animationDelay != null) node.style.animationDelay = String(layer.animationDelay);
      node.dataset.renderKey = renderKey;
      node.dataset.layerId = layer.id || '';
      node.dataset.persistent = persistent ? 'true' : 'false';
      const revealSchedule = revealSchedules[renderIndex];
      const revealDelay = revealSchedule.start;
      node.dataset.revealDelay = revealDelay.toFixed(3);
      node.dataset.revealFamily = revealSchedule.family;
      node.dataset.revealKind = revealSchedule.kind;
      const groupedMacroHeadReveal = Boolean(macroHeadGroup && isMacroHeadRevealSchedule(revealSchedule));
      node.style.zIndex = String(
        groupedMacroHeadReveal && revealSchedule.kind === 'icon'
          ? macroHeadMaxZ + 2
          : Number(layer.z) || 0
      );
      applyLayerBox(node, layer);
      applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent, revealSchedule, {
        groupedReveal: groupedMacroHeadReveal,
        opaqueSpriteReveal: shouldRevealStackedMacroSpriteOpaque(layer, revealSchedule, layerList)
      });
      const renderParent = groupedMacroHeadReveal ? macroHeadGroup : nextLayerNodes;
      if (macroBarFillLayer) {
        drawMacroBarFillCanvas(node, layer, sceneElapsed, revealSchedule);
        renderParent.appendChild(node);
        return;
      }
      if (layer.kind === 'sprite') {
        const nextSpriteSrc = spritePath(layer.src);
        if (node.dataset.spriteSrc !== nextSpriteSrc) {
          node.dataset.spriteSrc = nextSpriteSrc;
          node.src = nextSpriteSrc;
        }
        node.alt = layer.label || '';
        node.onerror = () => {
          const failedSrc = node.currentSrc || node.src || spritePath(layer.src);
          if (layer.fallbackSrc && node.src !== new URL(spritePath(layer.fallbackSrc), window.location.href).href) {
            const fallbackSrc = spritePath(layer.fallbackSrc);
            recordSpriteFailure(failedSrc, fallbackSrc, layer.label || '');
            node.dataset.spriteSrc = fallbackSrc;
            node.src = fallbackSrc;
            return;
          }
          recordSpriteFailure(failedSrc, '', layer.label || '');
        };
      } else {
        node.textContent = layer.text || '';
        node.style.color = layer.color || '#fff7e9';
        node.style.fontSize = `calc(${Number(layer.fontSize) || 6}px * var(--pixel-unit))`;
        if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit))`;
        node.style.textAlign = layer.align || 'left';
        applyOutroScoreGlow(node, layer, food);
      }
      applySubmacroNarrationHighlight(node, scene, revealSchedule, macroHighlightMap);
      applyMicronNarrationHighlight(node, scene, revealSchedule, micronHighlightMap);
      applyProConNarrationHighlight(node, scene, revealSchedule, proConHighlightMap);
      renderParent.appendChild(node);
    });
    appendMicron100Fireworks(nextLayerNodes, scene, layers, sceneElapsed);
    appendMajorProSparkles(nextLayerNodes, scene, layers, sceneElapsed, sceneProgress, proConHighlightMap);
    roots.layerRoot.replaceChildren(nextLayerNodes);

    syncCaptionSafeArea(roots.caption);
    if (hideSceneCaptions(scene)) {
      roots.caption.dataset.captionKey = '';
      roots.caption.removeAttribute('aria-label');
      roots.caption.replaceChildren();
      roots.caption.style.opacity = '0';
    } else {
      const narrationActive = narrationElapsed >= 0 && !inHold;
      const frame = captionFrame(scene, narrationProgress);
      roots.caption.style.fontSize = captionFontSize(scene, frame);
      renderCaption(roots.caption, scene, narrationProgress, frame);
      roots.caption.style.opacity = narrationActive
        ? String(easeOutCubic(clamp((narrationElapsed + 0.05) * 4, 0, 1)))
        : '0';
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

    const compactLaptop = (window.innerWidth <= 1500 || window.innerHeight <= 850) && window.innerWidth > 760;
    const laptopCanvasCrop = compactLaptop;
    const tightLaptop = window.innerWidth <= 1180 && window.innerWidth > 760;
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
        const failedSrc = img.currentSrc || img.src || choice?.src;
        if (choice?.fallback && img.src !== new URL(choice.fallback, window.location.href).href) {
          recordSpriteFailure(failedSrc, choice.fallback, choice?.food?.name || '');
          img.src = choice.fallback;
          return;
        }
        recordSpriteFailure(failedSrc, '', choice?.food?.name || '');
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
    const punctuationPause = /[.!?]$/.test(text) ? 0.38 : /[,;:]$/.test(text) ? 0.12 : 0;
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
        duration: sceneNarrationDuration(scene),
        totalWeight: 0,
        sentences: [],
        chunks: [],
        words: [],
        anchors: {}
      };
    }

    const duration = Math.max(1, sceneNarrationDuration(scene));
    const sentences = rawSentences.map((sentence, sentenceIndex) => {
      const words = sentence.split(/\s+/).filter(Boolean).map((word, index) => ({
        text: word,
        clean: normalizeSpeechSearch(word),
        tokens: speechTokens(word),
        sentenceIndex,
        index,
        weight: captionWordWeight(word)
      }));
      const pauseWeight = sentenceIndex === rawSentences.length - 1 ? 0 : 0.1;
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

    const duration = Math.max(1, sceneNarrationDuration(scene));
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
      role: activeChunk.role || null,
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
    if (shouldSuppressCaptionFrame(scene, frame)) {
      container.classList.remove('summary-full', 'tier-center');
      container.classList.add('lower-third');
      container.dataset.captionKey = 'suppressed-tier-reveal';
      container.removeAttribute('aria-label');
      container.replaceChildren();
      return;
    }
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

  function shouldSuppressCaptionFrame(scene, frame) {
    if (scene?.id !== 'outro') return false;
    if (String(scoreTier(selectedFood())).trim().toUpperCase() !== 'D') return false;
    if (frame?.role === 'tier-reveal') return true;
    return frame?.placement === 'tier-center' && TIER_REVEAL_RE.test(subtitleOnlyCaptionText(frame?.chunk || ''));
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

    const tokenStream = timingTokenStream(timing);
    for (const termTokens of normalizedTerms) {
      for (let index = 0; index <= tokenStream.length - termTokens.length; index += 1) {
        const matches = termTokens.every((token, offset) => tokenStream[index + offset]?.token === token);
        if (matches) return timing.words[tokenStream[index].wordIndex]?.start;
      }
    }

    for (const termTokens of normalizedTerms) {
      if (termTokens.length !== 1 || termTokens[0].length <= 1) continue;
      const looseMatch = timing.words.find(word => (word.clean || '').includes(termTokens[0]));
      if (looseMatch) return looseMatch.start;
    }

    return segmentStartForTerms(timing.sentences || [], terms);
  }

  function timingTokenStream(timing) {
    return (timing?.words || []).flatMap((word, wordIndex) => {
      const tokens = Array.isArray(word.tokens) && word.tokens.length
        ? word.tokens
        : speechTokens(word.clean || word.text || '');
      return tokens.map(token => ({ token, wordIndex }));
    });
  }

  function termSpanForTiming(timing, terms) {
    const normalizedTerms = terms.map(speechTokens).filter(tokens => tokens.length);
    if (!normalizedTerms.length || !timing?.words?.length) return null;

    const tokenStream = timingTokenStream(timing);
    let best = null;
    for (const termTokens of normalizedTerms) {
      for (let index = 0; index <= tokenStream.length - termTokens.length; index += 1) {
        const matches = termTokens.every((token, offset) => tokenStream[index + offset]?.token === token);
        if (!matches) continue;
        const start = timing.words[tokenStream[index].wordIndex]?.start;
        const end = timing.words[tokenStream[index + termTokens.length - 1].wordIndex]?.end;
        if (start == null || end == null) continue;
        if (!best || start < best.start) best = { start, end };
      }
    }
    if (best) return best;

    const fallbackStart = termStartForTiming(timing, terms);
    if (fallbackStart == null) return null;
    const segment = (timing.sentences || []).find(item => fallbackStart >= item.start && fallbackStart <= item.end);
    return {
      start: fallbackStart,
      end: Math.max(fallbackStart + 0.04, segment?.end ?? fallbackStart + 0.14)
    };
  }

  function metricTerms(metricKey, fallbackLabel = '') {
    const fallback = normalizeSpeechSearch(fallbackLabel);
    return [
      ...(METRIC_SPEECH_TERMS[metricKey] || []),
      ...(fallback.length > 1 ? [fallbackLabel] : [])
    ].filter(Boolean);
  }

  function macroSubmetricNarrationWindow(scene, timing, spec) {
    if (!spec) return null;
    const span = termSpanForTiming(timing, metricTerms(spec.key, spec.label || spec.shortLabel || ''));
    if (!span) return null;
    const segment = (timing.chunks || timing.sentences || []).find(item => span.start >= item.start - 0.001 && span.start <= item.end + 0.001);
    return {
      start: clamp(span.start - 0.015, 0, 1),
      end: clamp(Math.max(span.end, segment?.end ?? span.end) + 0.045, 0, 1)
    };
  }

  function submacroHighlightStrength(scene, sceneProgress, window) {
    const fade = clamp(0.22 / Math.max(1, sceneNarrationDuration(scene)), 0.018, 0.08);
    const fadeIn = clamp((sceneProgress - window.start) / fade, 0, 1);
    const fadeOut = clamp((window.end - sceneProgress) / fade, 0, 1);
    return easeOutCubic(Math.min(fadeIn, fadeOut));
  }

  function macroSubmetricHighlightMap(scene, sceneProgress) {
    const sectionId = scene?.id || '';
    const specs = MACRO_SUBMETRIC_SPECS[sectionId] || [];
    if (!specs.length) return new Map();
    const timing = sceneTimingModel(scene);
    const fade = clamp(0.22 / Math.max(1, sceneNarrationDuration(scene)), 0.018, 0.08);
    const windows = specs
      .map((spec, index) => {
        const window = macroSubmetricNarrationWindow(scene, timing, spec);
        return window ? { index, window } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.window.start - b.window.start);
    const highlights = new Map();
    windows.forEach((item, index) => {
      const next = windows[index + 1];
      const window = {
        ...item.window,
        end: next ? next.window.start + fade : 1
      };
      const strength = submacroHighlightStrength(scene, sceneProgress, window);
      if (strength > 0) highlights.set(item.index, { rowIndex: item.index, strength });
    });
    return highlights;
  }

  function micronMetricHighlightMap(scene, sceneProgress) {
    const sectionId = scene?.id || '';
    const specs = micronSpecsForSection(sectionId);
    if (!specs.length) return new Map();
    const timing = sceneTimingModel(scene);
    const fade = clamp(0.22 / Math.max(1, sceneNarrationDuration(scene)), 0.018, 0.08);
    const windows = specs
      .map((spec, index) => {
        const window = macroSubmetricNarrationWindow(scene, timing, spec);
        return window ? { index, window } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.window.start - b.window.start);
    const colors = micronRelativeHighlightColors(sectionId, windows.map(item => item.index));
    const highlights = new Map();
    windows.forEach((item, index) => {
      const next = windows[index + 1];
      const window = {
        ...item.window,
        end: next ? next.window.start + fade : 1
      };
      const strength = submacroHighlightStrength(scene, sceneProgress, window);
      if (strength > 0) highlights.set(item.index, {
        columnIndex: item.index,
        color: colors.get(item.index) || micronMetricHighlightColor(sectionId, item.index),
        strength
      });
    });
    return highlights;
  }

  function proConItemTerms(sectionId, rowIndex, layer = null) {
    const item = selectedFood()?.contextItems?.[sectionId]?.[rowIndex];
    return [
      item?.title,
      item?.explanation,
      ...layerTextTerms(layer)
    ].filter(Boolean);
  }

  function proConNarrationWindow(scene, timing, sectionId, rowIndex, layer = null) {
    const span = termSpanForTiming(timing, proConItemTerms(sectionId, rowIndex, layer));
    if (!span) return null;
    return {
      start: clamp(span.start - 0.002, 0, 1),
      end: clamp(span.end + 0.004, 0, 1)
    };
  }

  function proConNarrationHighlightMap(scene, sceneProgress) {
    const sectionId = scene?.id || '';
    if (sectionId !== 'pros' && sectionId !== 'cons') return new Map();
    const timing = sceneTimingModel(scene);
    const fade = clamp(0.18 / Math.max(1, sceneNarrationDuration(scene)), 0.016, 0.055);
    const windows = [0, 1, 2]
      .map(index => {
        const window = proConNarrationWindow(scene, timing, sectionId, index);
        return window ? { index, window } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.window.start - b.window.start);
    const highlights = new Map();
    windows.forEach((item, index) => {
      const next = windows[index + 1];
      const cueWindow = {
        ...item.window,
        end: next ? next.window.start + fade : 1
      };
      const strength = easeOutCubic(clamp((sceneProgress - item.window.start) / fade, 0, 1));
      const cueStrength = submacroHighlightStrength(scene, sceneProgress, cueWindow);
      if (strength > 0) highlights.set(item.index, {
        rowIndex: item.index,
        color: sectionId === 'pros' ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red,
        impactLevel: selectedFood()?.contextItems?.[sectionId]?.[item.index]?.impactLevel || null,
        strength,
        cueStrength
      });
    });
    return highlights;
  }

  function strongestHighlightCue(scene, macroHighlightMap, micronHighlightMap, proConHighlightMap) {
    const sceneId = scene?.id || 'scene';
    const candidates = [];
    for (const [rowIndex, item] of macroHighlightMap || []) {
      const safeRowIndex = item?.rowIndex ?? rowIndex;
      const color = macroSubmetricHighlightColor(sceneId, safeRowIndex);
      candidates.push({
        key: `${sceneId}:macro:${safeRowIndex}`,
        tone: highlightToneFromColor(color),
        strength: clamp(asNumber(item?.strength, 0), 0, 1)
      });
    }
    for (const [columnIndex, item] of micronHighlightMap || []) {
      candidates.push({
        key: `${sceneId}:micron:${item?.columnIndex ?? columnIndex}`,
        tone: highlightToneFromColor(item?.color),
        strength: clamp(asNumber(item?.strength, 0), 0, 1)
      });
    }
    for (const [rowIndex, item] of proConHighlightMap || []) {
      candidates.push({
        key: `${sceneId}:${sceneId === 'cons' ? 'con' : 'pro'}:${item?.rowIndex ?? rowIndex}`,
        tone: sceneId === 'cons' ? 'red' : sceneId === 'pros' ? 'green' : highlightToneFromColor(item?.color),
        strength: clamp(asNumber(item?.cueStrength ?? item?.strength, 0), 0, 1)
      });
    }
    return candidates
      .filter(item => item.strength > 0)
      .sort((a, b) => b.strength - a.strength || a.key.localeCompare(b.key))[0] || { key: '', strength: 0 };
  }

  function highlightToneFromColor(color) {
    const normalized = String(color || '').trim().toLowerCase();
    if (normalized === SUBMACRO_VALUE_COLORS.green.toLowerCase() || normalized.includes('green')) return 'green';
    if (normalized === SUBMACRO_VALUE_COLORS.red.toLowerCase() || normalized.includes('red')) return 'red';
    return 'neutral';
  }

  function randomHighlightGlowPlaybackRate(previousRate, tone = 'neutral') {
    const rangeSpec = HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES[tone] || HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_RANGES.neutral;
    const min = rangeSpec.min;
    const max = rangeSpec.max;
    const range = max - min;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = min + (Math.random() * range);
      if (Math.abs(candidate - previousRate) >= HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE) return candidate;
    }
    const lower = clamp(previousRate - HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE, min, max);
    const upper = clamp(previousRate + HIGHLIGHT_GLOW_SFX_MIN_RATE_CHANGE, min, max);
    return Math.abs(lower - previousRate) > Math.abs(upper - previousRate) ? lower : upper;
  }

  function retuneHighlightGlowSfx(audio, cue) {
    const nextKey = cue?.key || '';
    if (!nextKey || nextKey === state.highlightGlowSfxKey) return;
    const playbackRate = randomHighlightGlowPlaybackRate(
      state.highlightGlowSfxTargetPlaybackRate || state.highlightGlowSfxPlaybackRate || 1,
      cue?.tone
    );
    state.highlightGlowSfxKey = nextKey;
    state.highlightGlowSfxTargetPlaybackRate = playbackRate;
    try {
      if ('preservesPitch' in audio) audio.preservesPitch = false;
      if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = false;
      if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
    } catch {}
  }

  function ensureHighlightGlowSfxAudio() {
    if (!state.highlightGlowSfxAudio) {
      const audio = new Audio(docsAssetPath(HIGHLIGHT_GLOW_SFX_PATH));
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0;
      state.highlightGlowSfxAudio = audio;
    }
    return state.highlightGlowSfxAudio;
  }

  function highlightGlowFrameDeltaSeconds() {
    const now = performance.now();
    const deltaSeconds = clamp((now - state.highlightGlowSfxLastFrameAt) / 1000, 0.016, 0.12);
    state.highlightGlowSfxLastFrameAt = now;
    return deltaSeconds;
  }

  function highlightGlowFadeStep(targetStrength) {
    const targetVolume = state.audioEnabled && state.playing
      ? clamp(targetStrength, 0, 1) * HIGHLIGHT_GLOW_SFX_VOLUME
      : 0;
    const deltaSeconds = highlightGlowFrameDeltaSeconds();
    const speed = targetVolume > state.highlightGlowSfxVolume
      ? HIGHLIGHT_GLOW_SFX_FADE_IN_SPEED
      : HIGHLIGHT_GLOW_SFX_FADE_OUT_SPEED;
    const blend = 1 - Math.exp(-speed * deltaSeconds);
    state.highlightGlowSfxVolume += (targetVolume - state.highlightGlowSfxVolume) * blend;
    return { volume: state.highlightGlowSfxVolume, deltaSeconds };
  }

  function smoothHighlightGlowPlaybackRate(audio, deltaSeconds) {
    const targetRate = state.highlightGlowSfxTargetPlaybackRate || state.highlightGlowSfxPlaybackRate || 1;
    const currentRate = asNumber(audio.playbackRate, state.highlightGlowSfxPlaybackRate || targetRate);
    const blend = 1 - Math.exp(-HIGHLIGHT_GLOW_SFX_PLAYBACK_RATE_FADE_SPEED * deltaSeconds);
    const nextRate = currentRate + ((targetRate - currentRate) * blend);
    state.highlightGlowSfxPlaybackRate = nextRate;
    try {
      audio.playbackRate = nextRate;
    } catch {}
  }

  function updateHighlightGlowSfx(cue) {
    const { volume, deltaSeconds } = highlightGlowFadeStep(cue?.strength || 0);
    const audio = state.highlightGlowSfxAudio || (volume > HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD ? ensureHighlightGlowSfxAudio() : null);
    if (!audio) return;

    retuneHighlightGlowSfx(audio, cue);
    smoothHighlightGlowPlaybackRate(audio, deltaSeconds);
    audio.volume = clamp(volume, 0, 1);
    if (volume > HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD && state.audioEnabled && state.playing) {
      const playPromise = audio.paused ? audio.play() : null;
      if (playPromise?.catch) playPromise.catch(() => {});
      return;
    }

    if (volume <= HIGHLIGHT_GLOW_SFX_STOP_THRESHOLD) {
      try {
        audio.pause();
      } catch {}
    }
  }

  function pauseHighlightGlowSfx({ reset = true } = {}) {
    const audio = state.highlightGlowSfxAudio;
    state.highlightGlowSfxVolume = 0;
    state.highlightGlowSfxKey = '';
    state.highlightGlowSfxPlaybackRate = 1;
    state.highlightGlowSfxTargetPlaybackRate = 1;
    state.highlightGlowSfxLastFrameAt = performance.now();
    if (!audio) return;
    try {
      audio.volume = 0;
      audio.playbackRate = 1;
      audio.pause();
      if (reset) audio.currentTime = 0;
    } catch {}
  }

  function macroSubmetricHighlightColor(sectionId, rowIndex) {
    const spec = MACRO_SUBMETRIC_SPECS[sectionId]?.[rowIndex];
    if (!spec) return SUBMACRO_VALUE_COLORS.neutral;
    const presentation = macroArrowPresentation(selectedFood(), sectionId, spec);
    return presentation.textColor || SUBMACRO_VALUE_COLORS[presentation.color] || SUBMACRO_VALUE_COLORS.neutral;
  }

  function micronMetricHighlightColor(sectionId, columnIndex) {
    const step = micronStepForColumn(sectionId, columnIndex);
    if (step == null) return SUBMACRO_VALUE_COLORS.red;
    if (step >= 2) return SUBMACRO_VALUE_COLORS.green;
    return SUBMACRO_VALUE_COLORS.red;
  }

  function micronDvValue(sectionId, columnIndex, food = selectedFood()) {
    const spec = micronSpecsForSection(sectionId)[columnIndex];
    return spec ? asNumber(food?.metrics?.[spec.key], null) : null;
  }

  function micronRelativeHighlightColors(sectionId, columnIndexes) {
    const colors = new Map();
    const uniqueIndexes = [...new Set(columnIndexes)].filter(index => index != null);
    const values = uniqueIndexes.map(index => ({ index, value: micronDvValue(sectionId, index) }));
    const validValues = values.filter(item => item.value != null && item.value > 0);
    if (!values.length) return colors;
    if (!validValues.length) {
      values.forEach(item => colors.set(item.index, SUBMACRO_VALUE_COLORS.red));
      return colors;
    }

    const maxValue = Math.max(...validValues.map(item => item.value));
    const minValue = Math.min(...validValues.map(item => item.value));
    values.forEach(item => {
      if (item.value == null || item.value <= 0) {
        colors.set(item.index, SUBMACRO_VALUE_COLORS.red);
      } else if (maxValue === minValue) {
        colors.set(item.index, item.value >= 20 ? SUBMACRO_VALUE_COLORS.green : SUBMACRO_VALUE_COLORS.red);
      } else if (item.value === maxValue) {
        colors.set(item.index, SUBMACRO_VALUE_COLORS.green);
      } else if (item.value === minValue) {
        colors.set(item.index, SUBMACRO_VALUE_COLORS.red);
      } else {
        colors.set(item.index, SUBMACRO_VALUE_COLORS.neutral);
      }
    });
    return colors;
  }

  function colorWithAlpha(color, alpha) {
    const value = String(color || '').trim();
    const match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return value;
    const hex = match[1].length === 3
      ? match[1].split('').map(char => `${char}${char}`).join('')
      : match[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1).toFixed(3)})`;
  }

  function applyNarrationHighlightStyles(node, color, strength) {
    node.classList.add('submacro-narration-highlight');
    node.style.setProperty('--submacro-highlight', color);
    node.style.setProperty('--submacro-highlight-strength', strength.toFixed(3));
    node.style.setProperty('--submacro-highlight-glow', colorWithAlpha(color, 0.9 * strength));
    node.style.setProperty('--submacro-highlight-glow-soft', colorWithAlpha(color, 0.55 * strength));
    node.style.setProperty('--submacro-highlight-glow-wide', colorWithAlpha(color, 0.3 * strength));
  }

  function applySubmacroNarrationHighlight(node, scene, revealSchedule, highlightMap) {
    if (!highlightMap || revealSchedule?.family !== 'macro') return;
    const activeHighlight = highlightMap.get(revealSchedule.rowIndex);
    if (!activeHighlight) return;
    if (!['score-card', 'arrow', 'label', 'value', 'row'].includes(revealSchedule.kind)) return;
    const color = macroSubmetricHighlightColor(scene?.id || '', activeHighlight.rowIndex);
    const strength = clamp(activeHighlight.strength, 0, 1);
    applyNarrationHighlightStyles(node, color, strength);
    if (revealSchedule.kind === 'arrow') {
      node.style.filter = [
        `brightness(${(1 + (0.24 * strength)).toFixed(3)})`,
        `saturate(${(1 + (0.32 * strength)).toFixed(3)})`,
        `drop-shadow(0 0 calc(${(1.2 + (1.8 * strength)).toFixed(2)}px * var(--pixel-unit)) ${colorWithAlpha(color, 0.42 + (0.42 * strength))})`,
        `drop-shadow(0 0 calc(${(2.2 + (1.8 * strength)).toFixed(2)}px * var(--pixel-unit)) ${colorWithAlpha(color, 0.18 + (0.2 * strength))})`
      ].join(' ');
    }
  }

  function applyMicronNarrationHighlight(node, scene, revealSchedule, highlightMap) {
    if (!highlightMap || revealSchedule?.family !== 'micron') return;
    if (revealSchedule.columnIndex == null) return;
    const activeHighlight = highlightMap.get(revealSchedule.columnIndex);
    if (!activeHighlight) return;
    if (!['dv-bar', 'icon', 'label', 'value', 'column'].includes(revealSchedule.kind)) return;
    const color = activeHighlight.color || micronMetricHighlightColor(scene?.id || '', activeHighlight.columnIndex);
    const strength = clamp(activeHighlight.strength, 0, 1);
    applyNarrationHighlightStyles(node, color, strength);
  }

  function applyProConNarrationHighlight(node, scene, revealSchedule, highlightMap) {
    if (!highlightMap || (revealSchedule?.family !== 'pros' && revealSchedule?.family !== 'cons')) return;
    if (revealSchedule.rowIndex == null) return;
    if (!['bullet', 'impact', 'item', 'row'].includes(revealSchedule.kind)) return;
    applyProConRestingState(node, layerKindClass(node, 'text'));
    const activeHighlight = highlightMap.get(revealSchedule.rowIndex);
    if (!activeHighlight) return;
    const strength = clamp(activeHighlight.strength, 0, 1);
    if (layerKindClass(node, 'text')) {
      node.style.color = '#fffdf4';
      node.style.setProperty('--pro-con-text-core-glow', colorWithAlpha('#fffdf4', 0.92 * strength));
    }
    applyNarrationHighlightStyles(node, activeHighlight.color, strength);
    node.style.setProperty('--submacro-highlight-glow', colorWithAlpha(activeHighlight.color, 0.96 * strength));
    node.style.setProperty('--submacro-highlight-glow-soft', colorWithAlpha(activeHighlight.color, 0.72 * strength));
    node.style.setProperty('--submacro-highlight-glow-wide', colorWithAlpha(activeHighlight.color, 0.46 * strength));
    node.classList.add('pro-con-point-highlight');
  }

  function layerKindClass(node, kind) {
    return node?.classList?.contains(kind);
  }

  function applyProConRestingState(node, isText) {
    node.classList.add('pro-con-row-resting');
    if (isText) node.style.color = '#d9cec1';
  }

  function seededHash(value) {
    return String(value || '').split('').reduce((hash, char) => (
      ((hash << 5) - hash + char.charCodeAt(0)) | 0
    ), 0);
  }

  function seededUnit(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
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

  function macroArrowGlowRgb(layer) {
    const fingerprint = `${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    if (fingerprint.includes('red')) return '255, 111, 111';
    if (fingerprint.includes('green')) return '124, 242, 167';
    return '255, 247, 205';
  }

  function macroRevealWindowProgress(scene, seconds) {
    return Math.min(SUBMACRO_REVEAL_WINDOW_MAX_PROGRESS, Math.max(0.075, seconds / Math.max(1, sceneContentDuration(scene))));
  }

  function macroTextKind(layer, sectionId) {
    const id = String(layer?.id || '').toLowerCase();
    if (id === `${sectionId}_macro_label`) return 'macro-label';
    if (id === `${sectionId}_macro_value`) return 'macro-value';
    if (id.startsWith(`${sectionId}_submacro_label_`)) return 'label';
    if (id.startsWith(`${sectionId}_submacro_value_`)) return 'value';
    return null;
  }

  function isMacroTotalText(layer, sectionId) {
    const kind = macroTextKind(layer, sectionId);
    return kind === 'macro-label' || kind === 'macro-value';
  }

  function isMicronTitleLayer(layer, sectionId) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''}`.toLowerCase();
    return fingerprint.includes(sectionId.slice(0, -1)) && /title|main/.test(fingerprint);
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
    if (/bullet|bullet_point/.test(fingerprint)) return 'bullet';
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
      if (isMacroBarFrame(layer)) return { family: 'macro', kind: 'bar-frame' };
      if (isMacroIcon(layer)) return { family: 'macro', kind: 'icon' };
      if (macroTextKind(layer, sectionId) === 'macro-label') return { family: 'macro', kind: 'macro-label' };
      if (isMacroBarFill(layer)) {
        return {
          family: 'macro',
          kind: 'bar-fill',
          fillRatio: asNumber(layer?.fillRatio, null),
          src: layer?.src || null
        };
      }
      if (isMacroTotalText(layer, sectionId)) return { family: 'macro', kind: macroTextKind(layer, sectionId) };
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

  function micronTierRevealAnchor(scene, sectionId, step, graphAnchor) {
    const maxStep = Math.max(1, maxMicronStepForSection(sectionId));
    const safeStep = clamp(step || 1, 1, maxStep);
    return clamp(
      graphAnchor + ((MICRON_BAR_AFTER_GRAPH_SECONDS + ((safeStep - 1) * MICRON_BAR_STEP_SECONDS)) / sceneContentDuration(scene)),
      graphAnchor,
      0.94
    );
  }

  function isMacroHeadRevealSchedule(schedule) {
    return schedule?.family === 'macro'
      && ['icon', 'bar-frame', 'bar-fill', 'macro-label'].includes(schedule?.kind);
  }

  function macroHeadRevealOpacity(scene, sceneProgress, revealSchedules = []) {
    const schedule = revealSchedules.find(isMacroHeadRevealSchedule);
    if (!schedule) return 1;
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealWindow = Math.min(0.94, Math.max(0.001, MACRO_HEAD_REVEAL_SECONDS / sceneDuration));
    return clamp(easeOutCubic((sceneProgress - schedule.start) / revealWindow), 0, 1);
  }

  function revealAnchorForLayer(layer, scene, classification, timing, index = 0) {
    const sectionId = scene?.id || '';
    const segments = timing.sentences || sceneTimedSentences(scene);
    const secondsAnchor = seconds => clamp(seconds / sceneContentDuration(scene), 0.005, 0.94);

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
      if (['icon', 'bar-frame', 'bar-fill', 'decor'].includes(classification.kind)) return secondsAnchor(MACRO_REVEAL_SECONDS);
      if (classification.kind === 'macro-label') return secondsAnchor(MACRO_REVEAL_SECONDS);
      if (classification.rowIndex != null || classification.kind === 'macro-value') {
        return secondsAnchor(macroSubmacroRevealDelaySeconds(sectionId));
      }
    }

    if (sectionId === 'vitamins' || sectionId === 'minerals') {
      const graphAnchor = secondsAnchor(MICRON_GRAPH_REVEAL_SECONDS);
      if (classification.kind === 'title') return graphAnchor;
      if (classification.kind === 'dv-bar') {
        const barStep = clamp(Math.round((asNumber(classification.percent, 10) || 10) / 10), 1, 10);
        return micronTierRevealAnchor(scene, sectionId, barStep, graphAnchor);
      }
      if (classification.kind === 'label') {
        return graphAnchor;
      }
      if (classification.kind === 'icon') {
        return graphAnchor;
      }
      if (classification.kind === 'value') {
        return micronTierRevealAnchor(
          scene,
          sectionId,
          micronStepForColumn(sectionId, classification.columnIndex) || 1,
          graphAnchor
        );
      }
      return graphAnchor;
    }

    if (sectionId === 'pros' || sectionId === 'cons') {
      const rowIndex = classification.rowIndex;
      if (rowIndex != null) {
        return secondsAnchor(PRO_CON_ROW_REVEAL_SECONDS + (rowIndex * PRO_CON_ROW_STEP_SECONDS));
      }
    }

    const row = clamp(((Number(layer?.y) || 0) - 42) / 120, 0, 1);
    return 0.08 + (row * 0.48) + ((index % 3) * 0.025);
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
      offset = 0;
    }
    if (classification.family === 'micron') {
      offset = 0;
    }
    if (classification.family === 'pros' || classification.family === 'cons') {
      offset = 0;
    }
    if (classification.family === 'outro') {
      if (classification.kind === 'frame') offset = -0.08;
      if (classification.kind === 'tier') offset = 0;
    }

    const minimumDelay = !persistent && ['macro', 'micron', 'pros', 'cons'].includes(classification.family) ? 0.005 : 0.015;
    const delay = clamp((anchor ?? 0.08) + offset, persistent ? 0 : minimumDelay, 0.94);
    return {
      layerId: layer?.id || null,
      label: layer?.label || null,
      src: layer?.src || null,
      family: classification.family,
      kind: classification.kind,
      rowIndex: classification.rowIndex ?? null,
      columnIndex: classification.columnIndex ?? null,
      fillRatio: classification.fillRatio ?? null,
      start: delay,
      startSeconds: Number((delay * Math.max(1, sceneContentDuration(scene))).toFixed(3))
    };
  }

  function audioRevealDelayForLayer(layer, scene, index, persistent, allLayers = []) {
    return layerRevealSchedule(layer, scene, index, persistent, allLayers).start;
  }

  function layerGridBox(layer) {
    let layerX = Number(layer?.x) || 0;
    let layerY = Number(layer?.y) || 0;
    const layerWidth = Number(layer?.width) || 0;
    const layerHeight = Number(layer?.height) || 0;
    if (layer?.centerAnchor === 'visible-canvas') {
      const visible = visibleCanvasGridBounds();
      layerX = ((visible.left + visible.right) / 2) - (layerWidth / 2) + (Number(layer.centerOffsetX) || 0);
      layerY = ((visible.top + visible.bottom) / 2) - (layerHeight / 2) + (Number(layer.centerOffsetY) || 0);
    }
    return {
      left: layerX,
      top: layerY,
      right: layerX + layerWidth,
      bottom: layerY + layerHeight
    };
  }

  function boxesOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function appendMicron100Fireworks(container, scene, layers, sceneElapsed) {
    const sectionId = scene?.id || '';
    if (sectionId !== 'vitamins' && sectionId !== 'minerals') return;
    if (maxMicronStepForSection(sectionId) < 10) return;

    layers.forEach(({ layer, persistent }) => {
      if (persistent || layer?.visible === false || !isMicrosBar(layer)) return;
      if (asNumber(microsBarPercent(layer), 0) < 100) return;

      const burstStartSeconds = MICRON_GRAPH_REVEAL_SECONDS + MICRON_BAR_AFTER_GRAPH_SECONDS + (9 * MICRON_BAR_STEP_SECONDS);
      const burstElapsed = sceneElapsed - burstStartSeconds;
      if (burstElapsed < 0 || burstElapsed > MICRON_100_FIREWORK_SECONDS) return;

      const progress = clamp(burstElapsed / MICRON_100_FIREWORK_SECONDS, 0, 1);
      const box = layerGridBox(layer);
      const centerX = (box.left + box.right) / 2;
      const centerY = box.top + 1.2;
      const fade = Math.sin(progress * Math.PI);
      const ringScale = easeOutCubic(progress);
      const zIndex = Math.max((Number(layer.z) || 0) + 50, 140);

      const core = document.createElement('div');
      core.className = 'micron-100-firework-core';
      core.style.left = `calc(${centerX.toFixed(2)}px * var(--pixel-unit))`;
      core.style.top = `calc(${centerY.toFixed(2)}px * var(--pixel-unit))`;
      core.style.width = `calc(${(0.9 + ((1 - progress) * 0.45)).toFixed(2)}px * var(--pixel-unit))`;
      core.style.height = core.style.width;
      core.style.zIndex = String(zIndex + MICRON_100_FIREWORK_SPARKS.length + 1);
      core.style.opacity = String(clamp((1 - progress) * 0.42, 0, 0.42).toFixed(3));
      core.style.transform = `translate3d(-50%, -50%, 0) scale(${(1 + (ringScale * 0.18)).toFixed(3)})`;
      container.appendChild(core);

      MICRON_100_FIREWORK_SPARKS.forEach((spark, sparkIndex) => {
        const node = document.createElement('div');
        const twinkle = sparkIndex % 2 === 0 ? Math.sin(progress * Math.PI * 5) * 0.65 : Math.cos(progress * Math.PI * 4) * 0.55;
        const driftX = spark.x * (0.22 + (ringScale * 1.05));
        const driftY = spark.y * (0.22 + (ringScale * 1.05)) + (progress * progress * 2.6);
        const size = 1.55 + (sparkIndex % 3 === 0 && progress < 0.5 ? 0.65 : 0);
        node.className = 'micron-100-firework-spark';
        node.style.left = `calc(${(centerX + driftX).toFixed(2)}px * var(--pixel-unit))`;
        node.style.top = `calc(${(centerY + driftY).toFixed(2)}px * var(--pixel-unit))`;
        node.style.width = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.height = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.zIndex = String(zIndex + sparkIndex);
        node.style.opacity = String(clamp((fade * 1.18) + (twinkle * 0.12), 0, 1).toFixed(3));
        node.style.background = spark.color;
        node.style.transform = `translate3d(-50%, -50%, 0) scale(${(1.24 - (progress * 0.34)).toFixed(3)})`;
        container.appendChild(node);
      });
    });
  }

  function majorProSparkleRows(scene, layers) {
    if (scene?.id !== 'pros') return [];
    const pros = selectedFood()?.contextItems?.pros || [];
    return pros
      .map((item, rowIndex) => ({ item, rowIndex }))
      .filter(({ item, rowIndex }) => rowIndex < 3 && String(item?.impactLevel || '').toLowerCase() === 'major')
      .map(({ rowIndex }) => {
        const allLayers = layers.map(item => item.layer);
        const rowLayers = layers
          .filter(({ layer, persistent }) => !persistent && layer?.visible !== false)
          .map(({ layer }) => ({ layer, classification: layerRevealClassification(layer, scene, false, allLayers) }))
          .filter(item => item.classification.family === 'pros' && item.classification.rowIndex === rowIndex);
        const boxes = rowLayers.map(({ layer }) => layerGridBox(layer));
        if (!boxes.length) return null;
        const rowBox = boxes.reduce((box, item) => ({
          left: Math.min(box.left, item.left),
          top: Math.min(box.top, item.top),
          right: Math.max(box.right, item.right),
          bottom: Math.max(box.bottom, item.bottom)
        }), boxes[0]);
        const itemTextZ = rowLayers
          .filter(item => item.classification.kind === 'item' && item.layer.kind === 'text')
          .map(item => asNumber(item.layer.z, null))
          .filter(value => value != null);
        const sparkleZIndex = Math.max(0, (itemTextZ.length ? Math.min(...itemTextZ) : 11) - 1);
        return { rowIndex, rowBox, sparkleZIndex };
      })
      .filter(Boolean);
  }

  function appendMajorProSparkles(container, scene, layers, sceneElapsed, sceneProgress, proConHighlightMap) {
    for (const row of majorProSparkleRows(scene, layers)) {
      const activeHighlight = proConHighlightMap?.get(row.rowIndex);
      const activeStrength = clamp(asNumber(activeHighlight?.cueStrength ?? activeHighlight?.strength, 0), 0, 1);
      if (activeStrength <= 0.015) continue;

      const phase = (sceneElapsed * 1.55 + (row.rowIndex * 0.21)) % 1;
      const rowHeight = Math.max(1, row.rowBox.bottom - row.rowBox.top);
      const rowWidth = Math.max(1, row.rowBox.right - row.rowBox.left);
      const spreadLeft = Math.min(8, rowWidth * 0.12);
      const spreadRight = Math.min(12, rowWidth * 0.18);
      const spreadTop = Math.min(6, rowHeight * 0.7);
      const spreadBottom = Math.min(7, rowHeight * 0.85);
      const sparkleLeft = row.rowBox.left - spreadLeft;
      const sparkleTop = row.rowBox.top - spreadTop;
      const sparkleWidth = rowWidth + spreadLeft + spreadRight;
      const sparkleHeight = rowHeight + spreadTop + spreadBottom;
      const zIndex = row.sparkleZIndex;

      MAJOR_PRO_SPARKLES.forEach((spark, sparkIndex) => {
        const seed = seededHash(`major-pro-sparkle:${row.rowIndex}:${sparkIndex}`);
        const xRatio = clamp((sparkIndex + 0.35 + (seededUnit(seed) * 0.42)) / MAJOR_PRO_SPARKLES.length, 0.02, 0.98);
        const yRatio = 0.08 + (seededUnit(seed + 11) * 0.84);
        const twinklePhase = (phase + spark.delay + (sparkIndex * 0.073)) % 1;
        const twinkle = 0.7 + (Math.sin((twinklePhase * Math.PI * 2) + sparkIndex) * 0.3);
        const driftX = Math.sin((sceneProgress * Math.PI * 10) + seed) * 1.45 + (spark.x * 0.12);
        const driftY = Math.cos((sceneProgress * Math.PI * 8) + seed) * 0.95 + (spark.y * 0.08);
        const size = spark.size + (activeStrength * 0.76) + (twinkle * 0.55);
        const node = document.createElement('div');
        node.className = 'major-pro-sparkle';
        node.style.left = `calc(${(sparkleLeft + (sparkleWidth * xRatio) + driftX).toFixed(2)}px * var(--pixel-unit))`;
        node.style.top = `calc(${(sparkleTop + (sparkleHeight * yRatio) + driftY).toFixed(2)}px * var(--pixel-unit))`;
        node.style.width = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.height = `calc(${size.toFixed(2)}px * var(--pixel-unit))`;
        node.style.zIndex = String(zIndex);
        node.style.opacity = String(clamp(activeStrength * twinkle, 0, 1).toFixed(3));
        node.style.background = spark.color;
        node.style.transform = `translate3d(-50%, -50%, 0) rotate(${sparkIndex % 2 ? 45 : 0}deg) scale(${(0.92 + (activeStrength * 0.18)).toFixed(3)})`;
        container.appendChild(node);
      });
    }
  }

  function shouldRevealStackedMacroSpriteOpaque(layer, revealSchedule, sortedLayers = []) {
    if (revealSchedule?.family !== 'macro' || !isSpriteLayer(layer)) return false;
    const layerIndex = sortedLayers.indexOf(layer);
    if (layerIndex <= 0) return false;
    const box = layerGridBox(layer);
    if (box.right <= box.left || box.bottom <= box.top) return false;
    return sortedLayers.slice(0, layerIndex).some(other => {
      if (other?.visible === false || !isSpriteLayer(other)) return false;
      const otherBox = layerGridBox(other);
      return otherBox.right > otherBox.left && otherBox.bottom > otherBox.top && boxesOverlap(box, otherBox);
    });
  }

  function applyLayerBox(node, layer) {
    let layerX = Number(layer.x) || 0;
    let layerY = Number(layer.y) || 0;
    if (layer.centerAnchor === 'visible-canvas') {
      const visible = visibleCanvasGridBounds();
      const layerWidth = Number(layer.width) || 0;
      const layerHeight = Number(layer.height) || 0;
      layerX = ((visible.left + visible.right) / 2) - (layerWidth / 2) + (Number(layer.centerOffsetX) || 0);
      layerY = ((visible.top + visible.bottom) / 2) - (layerHeight / 2) + (Number(layer.centerOffsetY) || 0);
    }
    node.style.left = `calc(${layerX}px * var(--pixel-unit))`;
    node.style.top = `calc(${layerY}px * var(--pixel-unit))`;
    if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit))`;
    if (layer.kind === 'sprite') {
      if (layer.height) node.style.height = `calc(${Number(layer.height)}px * var(--pixel-unit))`;
      node.style.objectFit = layer.preserveAspect ? 'contain' : 'fill';
      if (layer.preserveAspect && layer.aspectRatio) node.style.aspectRatio = String(layer.aspectRatio);
    }
  }

  function prewarmMacroBarGifVariants(layout, food) {
    if (!layout) return;
    for (const sectionId of ['fats', 'carbs', 'protein']) {
      for (const layer of getSectionLayers(layout, sectionId)) {
        if (!isMacroBarFill(layer)) continue;
        requestMacroBarGifFrames(spritePath(layer.src));
      }
    }
  }

  function drawMacroBarFillCanvas(canvas, layer, sceneElapsed, revealSchedule) {
    const src = spritePath(layer.src);
    const targetRatio = clamp(asNumber(layer?.fillRatio, revealSchedule?.fillRatio ?? 0), 0, 1);
    const frames = requestMacroBarGifFrames(src);
    const width = frames?.width || 104;
    const height = frames?.height || 17;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    canvas.style.imageRendering = 'pixelated';

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    if (!frames?.images?.length || targetRatio <= 0.001) return;

    const localElapsed = Math.max(0, Number(sceneElapsed) || 0);
    const fillElapsed = localElapsed - MACRO_REVEAL_SECONDS - MACRO_BAR_START_DWELL_SECONDS;
    const currentFillRatio = macroBarFillCurrentRatio(fillElapsed, targetRatio);
    if (frames.static) {
      const image = frames.images[0];
      if (!image?.complete) return;
      const fillWidth = clamp(Math.round(width * currentFillRatio), 0, width);
      if (fillWidth <= 0) return;
      ctx.drawImage(image, 0, 0, fillWidth, height, 0, 0, fillWidth, height);
      return;
    }
    const targetIndex = clamp(Math.round((frames.images.length - 1) * targetRatio), 0, frames.images.length - 1);
    const currentIndex = clamp(Math.round((frames.images.length - 1) * currentFillRatio), 0, targetIndex);
    for (let frameIndex = 0; frameIndex <= currentIndex; frameIndex += 1) {
      const image = frames.images[frameIndex];
      if (image?.complete) ctx.drawImage(image, 0, 0);
    }
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
    if (cached?.status === 'ready') return cached;
    if (cached?.status === 'pending') return cached;

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
        if (state.layout) window.requestAnimationFrame(renderStage);
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
          image.onload = () => {
            if (state.layout) window.requestAnimationFrame(renderStage);
          };
          image.src = URL.createObjectURL(new Blob([buildSingleMacroBarFrameGifBytes(parsed, index)], { type: 'image/gif' }));
          return image;
        });
        entry.status = 'ready';
        window.requestAnimationFrame(() => {
          if (state.layout) renderStage();
        });
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

  function layerRevealDelay(layer, index) {
    const fingerprint = `${layer.id || ''} ${layer.label || ''} ${layer.src || ''}`.toLowerCase();
    if (fingerprint.includes('header') || ['food_name_text', 'kcal_value_text', 'basis_text', 'script_caption', 'subline_c', 'kcal_label_text'].includes(layer.id)) return 0.02;
    if (fingerprint.includes('section indicator') || fingerprint.includes('/ui/section_indicator/')) return 0.08;
    const row = clamp(((Number(layer.y) || 0) - 42) / 120, 0, 1);
    return 0.12 + (row * 0.42) + ((index % 4) * 0.035);
  }

  function isStampRevealSchedule(schedule) {
    if (!schedule) return false;
    if (schedule.family === 'intro' && ['food-hero', 'ranked-sprite'].includes(schedule.kind)) return true;
    return schedule.layerId === 'outro_d_tier_stamp';
  }

  function stampRevealWindowProgress(scene, schedule = null) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealSeconds = schedule?.family === 'intro' && schedule?.kind === 'food-hero'
      ? FOOD_STAMP_REVEAL_SECONDS
      : STAMP_REVEAL_SECONDS;
    return Math.min(0.2, Math.max(0.055, revealSeconds / sceneDuration));
  }

  function stampRevealRawProgress(scene, sceneProgress, schedule) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealLead = Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    return (sceneProgress + revealLead - schedule.start) / stampRevealWindowProgress(scene, schedule);
  }

  function stampShakeStyle(scene, sceneProgress, revealSchedules) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    let strongest = 0;
    for (const schedule of revealSchedules) {
      if (!isStampRevealSchedule(schedule)) continue;
      const raw = stampRevealRawProgress(scene, sceneProgress, schedule);
      const afterStampProgress = raw - 1;
      if (afterStampProgress < 0 || afterStampProgress > 0.55) continue;
      const hit = Math.sin(clamp(afterStampProgress / 0.55, 0, 1) * Math.PI);
      const snap = Math.max(0, 1 - (afterStampProgress / 0.55));
      strongest = Math.max(strongest, hit * (0.62 + snap * 0.38));
    }
    if (strongest <= 0.015) return { transform: '', strength: 0 };

    const phase = sceneProgress * sceneDuration * 28;
    const x = (Math.sin(phase * Math.PI * 2) + (Math.sin(phase * Math.PI * 5.4) * 0.45)) * STAMP_SHAKE_MAX_PIXELS * strongest;
    const y = (Math.cos(phase * Math.PI * 2.3) + (Math.sin(phase * Math.PI * 4.2) * 0.35)) * STAMP_SHAKE_MAX_PIXELS * 0.72 * strongest;
    const rotate = Math.sin(phase * Math.PI * 3.6) * 0.34 * strongest;
    return {
      transform: `translate3d(calc(${x.toFixed(2)}px * var(--pixel-unit)), calc(${y.toFixed(2)}px * var(--pixel-unit)), 0) rotate(${rotate.toFixed(2)}deg)`,
      strength: strongest
    };
  }

  function applyStageShake(roots, scene, sceneProgress, revealSchedules) {
    const shake = stampShakeStyle(scene, sceneProgress, revealSchedules);
    [roots.bg, roots.phoneBg, roots.layerRoot, roots.vignette, roots.caption].forEach(node => {
      if (!node) return;
      node.style.transformOrigin = 'center';
      node.style.transform = shake.transform;
    });
    roots.layerRoot.dataset.stampShakeStrength = shake.strength.toFixed(3);
  }

  function stampSfxImpactTime(scene, schedule) {
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const revealLead = Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    const impactProgress = clamp(schedule.start + stampRevealWindowProgress(scene, schedule) - revealLead, 0, 1);
    const impactTime = scene.start + (impactProgress * sceneContentDuration(scene));
    return Number(Math.max(scene.start, impactTime - STAMP_SFX_LEAD_SECONDS).toFixed(3));
  }

  function stampSfxEvents() {
    return sceneStarts().flatMap(scene => (
      sceneLayerRevealSchedule(scene)
        .filter(isStampRevealSchedule)
        .map(schedule => ({
          key: `${scene.id}:${schedule.layerId || schedule.kind}:${schedule.start.toFixed(3)}`,
          sceneId: scene.id,
          layerId: schedule.layerId,
          kind: schedule.kind,
          time: stampSfxImpactTime(scene, schedule)
        }))
    )).sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextStampSfxAudio() {
    if (!state.stampSfxPool.length) {
      state.stampSfxPool = Array.from({ length: STAMP_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(STAMP_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = STAMP_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.stampSfxPool[state.stampSfxPoolIndex % state.stampSfxPool.length];
    state.stampSfxPoolIndex += 1;
    return audio;
  }

  function randomStampSfxPlaybackRate() {
    const range = STAMP_SFX_PLAYBACK_RATE_RANGE.max - STAMP_SFX_PLAYBACK_RATE_RANGE.min;
    return STAMP_SFX_PLAYBACK_RATE_RANGE.min + (Math.random() * range);
  }

  function randomStampSfxVolume() {
    return clamp(
      STAMP_SFX_VOLUME + ((Math.random() * 2 - 1) * STAMP_SFX_VOLUME_VARIATION),
      0,
      1
    );
  }

  function randomStampSfxStartOffset(audio) {
    const min = STAMP_SFX_START_OFFSET_RANGE_SECONDS.min;
    const max = STAMP_SFX_START_OFFSET_RANGE_SECONDS.max;
    const safeMax = Number.isFinite(audio?.duration) && audio.duration > 0
      ? Math.min(max, Math.max(min, audio.duration - 0.08))
      : max;
    return min + (Math.random() * Math.max(0, safeMax - min));
  }

  function allowSfxPitchShift(audio) {
    if ('preservesPitch' in audio) audio.preservesPitch = false;
    if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = false;
    if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
  }

  function playStampSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextStampSfxAudio();
    try {
      audio.pause();
      audio.currentTime = randomStampSfxStartOffset(audio);
      allowSfxPitchShift(audio);
      audio.volume = randomStampSfxVolume();
      audio.playbackRate = randomStampSfxPlaybackRate();
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function pauseStampSfx() {
    for (const audio of state.stampSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerStampSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of stampSfxEvents()) {
      if (state.playedStampSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedStampSfxKeys.add(event.key);
      playStampSfx(event);
    }
  }

  function sectionTransitionSfxEvents() {
    return sceneStarts()
      .slice(1)
      .map(scene => ({
        key: `section-transition:${scene.id}:${scene.start.toFixed(3)}`,
        sceneId: scene.id,
        time: Number(scene.start.toFixed(3))
      }));
  }

  function nextTransitionSfxAudio() {
    if (!state.transitionSfxPool.length) {
      state.transitionSfxPool = Array.from({ length: SECTION_TRANSITION_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(SECTION_TRANSITION_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = SECTION_TRANSITION_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.transitionSfxPool[state.transitionSfxPoolIndex % state.transitionSfxPool.length];
    state.transitionSfxPoolIndex += 1;
    return audio;
  }

  function playTransitionSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextTransitionSfxAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = SECTION_TRANSITION_SFX_VOLUME;
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function pauseTransitionSfx() {
    for (const audio of state.transitionSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerTransitionSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of sectionTransitionSfxEvents()) {
      if (state.playedTransitionSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedTransitionSfxKeys.add(event.key);
      playTransitionSfx(event);
    }
  }

  function micronBarConfirmSfxPlaybackRate(step) {
    const safeStep = clamp(Math.round(asNumber(step, 1)), 1, 10);
    const range = MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE.max - MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE.min;
    return MICRON_BAR_CONFIRM_SFX_PLAYBACK_RATE_RANGE.min + (((safeStep - 1) / 9) * range);
  }

  function micronBarConfirmSfxEvents() {
    return sceneStarts()
      .filter(scene => scene.id === 'vitamins' || scene.id === 'minerals')
      .flatMap(scene => {
        const maxStep = maxMicronStepForSection(scene.id);
        if (!maxStep) return [];
        return Array.from({ length: maxStep }, (_, index) => {
          const step = index + 1;
          return {
            key: `micron-bar-confirm:${scene.id}:step-${step}`,
            sceneId: scene.id,
            step,
            time: Number((
              scene.start
              + MICRON_GRAPH_REVEAL_SECONDS
              + MICRON_BAR_AFTER_GRAPH_SECONDS
              + ((step - 1) * MICRON_BAR_STEP_SECONDS)
            ).toFixed(3)),
            playbackRate: micronBarConfirmSfxPlaybackRate(step)
          };
        });
      })
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextMicronBarConfirmSfxAudio() {
    if (!state.micronBarConfirmSfxPool.length) {
      state.micronBarConfirmSfxPool = Array.from({ length: MICRON_BAR_CONFIRM_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MICRON_BAR_CONFIRM_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MICRON_BAR_CONFIRM_SFX_VOLUME;
        allowSfxPitchShift(audio);
        return audio;
      });
    }
    const audio = state.micronBarConfirmSfxPool[state.micronBarConfirmSfxPoolIndex % state.micronBarConfirmSfxPool.length];
    state.micronBarConfirmSfxPoolIndex += 1;
    return audio;
  }

  function playMicronBarConfirmSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextMicronBarConfirmSfxAudio();
    const token = `${event.key}:${performance.now().toFixed(3)}`;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.dataset.playToken = token;
      allowSfxPitchShift(audio);
      audio.volume = MICRON_BAR_CONFIRM_SFX_VOLUME;
      audio.playbackRate = event.playbackRate;
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
      window.setTimeout(() => {
        if (audio.dataset.playToken !== token) return;
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      }, Math.round(MICRON_BAR_CONFIRM_SFX_PLAY_SECONDS * 1000));
    } catch {}
  }

  function pauseMicronBarConfirmSfx() {
    for (const audio of state.micronBarConfirmSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.dataset.playToken = '';
      } catch {}
    }
  }

  function triggerMicronBarConfirmSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of micronBarConfirmSfxEvents()) {
      if (state.playedMicronBarConfirmSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedMicronBarConfirmSfxKeys.add(event.key);
      playMicronBarConfirmSfx(event);
    }
  }

  function micron100FireworkSfxEvents() {
    return sceneStarts()
      .filter(scene => scene.id === 'vitamins' || scene.id === 'minerals')
      .filter(scene => maxMicronStepForSection(scene.id) >= 10)
      .flatMap(scene => {
        const burstTime = Number((
          scene.start
          + MICRON_GRAPH_REVEAL_SECONDS
          + MICRON_BAR_AFTER_GRAPH_SECONDS
          + (9 * MICRON_BAR_STEP_SECONDS)
        ).toFixed(3));
        return [
          {
            key: `micron-100-firework-lead:${scene.id}`,
            sceneId: scene.id,
            role: 'lead',
            time: Number(Math.max(scene.start, burstTime - MICRON_100_FIREWORK_LEAD_SFX_SECONDS).toFixed(3))
          },
          {
            key: `micron-100-firework:${scene.id}`,
            sceneId: scene.id,
            role: 'cluster',
            time: Number((burstTime + MICRON_100_FIREWORK_CLUSTER_SFX_DELAY_SECONDS).toFixed(3))
          }
        ];
      })
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextMicron100FireworkLeadSfxAudio() {
    if (!state.micron100FireworkLeadSfxPool.length) {
      state.micron100FireworkLeadSfxPool = Array.from({ length: MICRON_100_FIREWORK_LEAD_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MICRON_100_FIREWORK_LEAD_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MICRON_100_FIREWORK_LEAD_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.micron100FireworkLeadSfxPool[state.micron100FireworkLeadSfxPoolIndex % state.micron100FireworkLeadSfxPool.length];
    state.micron100FireworkLeadSfxPoolIndex += 1;
    return audio;
  }

  function nextMicron100FireworkSfxAudio() {
    if (!state.micron100FireworkSfxPool.length) {
      state.micron100FireworkSfxPool = Array.from({ length: MICRON_100_FIREWORK_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MICRON_100_FIREWORK_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MICRON_100_FIREWORK_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.micron100FireworkSfxPool[state.micron100FireworkSfxPoolIndex % state.micron100FireworkSfxPool.length];
    state.micron100FireworkSfxPoolIndex += 1;
    return audio;
  }

  function playMicron100FireworkSfx(event) {
    if (!state.audioEnabled || !event) return;
    const isLead = event.role === 'lead';
    const audio = isLead ? nextMicron100FireworkLeadSfxAudio() : nextMicron100FireworkSfxAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = isLead ? MICRON_100_FIREWORK_LEAD_SFX_VOLUME : MICRON_100_FIREWORK_SFX_VOLUME;
      audio.playbackRate = 1;
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function pauseMicron100FireworkSfx() {
    for (const audio of state.micron100FireworkLeadSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
    for (const audio of state.micron100FireworkSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerMicron100FireworkSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of micron100FireworkSfxEvents()) {
      if (state.playedMicron100FireworkSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedMicron100FireworkSfxKeys.add(event.key);
      playMicron100FireworkSfx(event);
    }
  }

  function majorProSparkleSfxEvents() {
    const pros = selectedFood()?.contextItems?.pros || [];
    return sceneStarts()
      .filter(scene => scene.id === 'pros')
      .flatMap(scene => {
        const timing = sceneTimingModel(scene);
        return pros
          .map((item, rowIndex) => ({ item, rowIndex }))
          .filter(({ item, rowIndex }) => rowIndex < 3 && String(item?.impactLevel || '').toLowerCase() === 'major')
          .map(({ rowIndex }) => {
            const window = proConNarrationWindow(scene, timing, 'pros', rowIndex);
            if (!window) return null;
            return {
              key: `major-pro-sparkle:${selectedFood()?.id || 'food'}:${rowIndex}`,
              sceneId: scene.id,
              rowIndex,
              time: Number((scene.start + sceneNarrationDelaySeconds(scene) + (window.start * sceneNarrationDuration(scene))).toFixed(3))
            };
          })
          .filter(Boolean);
      })
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function nextMajorProSparkleSfxAudio() {
    if (!state.majorProSparkleSfxPool.length) {
      state.majorProSparkleSfxPool = Array.from({ length: MAJOR_PRO_SPARKLE_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MAJOR_PRO_SPARKLE_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MAJOR_PRO_SPARKLE_SFX_VOLUME;
        return audio;
      });
    }
    const audio = state.majorProSparkleSfxPool[state.majorProSparkleSfxPoolIndex % state.majorProSparkleSfxPool.length];
    state.majorProSparkleSfxPoolIndex += 1;
    return audio;
  }

  function majorProSparklePlaybackRate() {
    const range = MAJOR_PRO_SPARKLE_SFX_PLAYBACK_RATE_RANGE.max - MAJOR_PRO_SPARKLE_SFX_PLAYBACK_RATE_RANGE.min;
    return MAJOR_PRO_SPARKLE_SFX_PLAYBACK_RATE_RANGE.min + (Math.random() * range);
  }

  function playMajorProSparkleSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextMajorProSparkleSfxAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = MAJOR_PRO_SPARKLE_SFX_VOLUME;
      audio.playbackRate = majorProSparklePlaybackRate();
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } catch {}
  }

  function pauseMajorProSparkleSfx() {
    for (const audio of state.majorProSparkleSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerMajorProSparkleSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of majorProSparkleSfxEvents()) {
      if (state.playedMajorProSparkleSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedMajorProSparkleSfxKeys.add(event.key);
      playMajorProSparkleSfx(event);
    }
  }

  function macroBarFillSfxEvents() {
    return sceneStarts()
      .filter(scene => ['fats', 'carbs', 'protein'].includes(scene.id))
      .flatMap(scene => (
        sceneLayerRevealSchedule(scene)
          .filter(schedule => schedule.family === 'macro' && schedule.kind === 'bar-fill' && asNumber(schedule.fillRatio, 0) > 0.001)
          .map(schedule => {
            const fillRatio = clamp(asNumber(schedule.fillRatio, 0), 0, 1);
            const gifNativeSeconds = macroBarGifNativeSecondsForSrc(schedule.src);
            const fullSourceSeconds = macroBarFillSfxFullSourceSeconds(gifNativeSeconds);
            const sourceSliceSeconds = macroBarFillSfxSourceSliceSeconds(fillRatio, gifNativeSeconds);
            const targetSeconds = macroBarFillDurationSeconds(fillRatio);
            return {
              key: `macro-bar-fill:${scene.id}:${schedule.layerId || schedule.kind}:${schedule.startSeconds}`,
              sceneId: scene.id,
              layerId: schedule.layerId,
              fillRatio,
              sourceOffsetSeconds: 0,
              fullSourceSeconds,
              sourceSliceSeconds,
              gifNativeSeconds,
              gifPlaybackRate: macroBarFillSfxPlaybackRate(fillRatio, gifNativeSeconds),
              targetSeconds,
              time: Number((scene.start + schedule.startSeconds + MACRO_BAR_START_DWELL_SECONDS).toFixed(3))
            };
          })
      ))
      .sort((a, b) => a.time - b.time || a.key.localeCompare(b.key));
  }

  function macroBarGifNativeSecondsForSrc(src) {
    if (!src) return MACRO_BAR_GIF_NATIVE_SECONDS;
    const frames = requestMacroBarGifFrames(spritePath(src));
    return asNumber(frames?.nativeSeconds, null) || MACRO_BAR_GIF_NATIVE_SECONDS;
  }

  function macroBarFillSfxFullSourceSeconds(gifNativeSeconds = MACRO_BAR_GIF_NATIVE_SECONDS) {
    return Math.min(
      MACRO_BAR_FILL_SFX_SOURCE_SECONDS,
      macroBarFillSfxPlaybackRate(1, gifNativeSeconds) * macroBarFillDurationSeconds(1)
    );
  }

  function macroBarFillSfxSourceSliceSeconds(fillRatio, gifNativeSeconds = MACRO_BAR_GIF_NATIVE_SECONDS) {
    return Math.min(
      MACRO_BAR_FILL_SFX_SOURCE_SECONDS,
      macroBarFillSfxPlaybackRate(fillRatio, gifNativeSeconds) * macroBarFillDurationSeconds(fillRatio)
    );
  }

  function macroBarFillSfxPlaybackRate(fillRatio, gifNativeSeconds = MACRO_BAR_GIF_NATIVE_SECONDS) {
    return Math.max(
      0.001,
      Math.min(MACRO_BAR_FILL_SFX_SOURCE_SECONDS, Math.max(0.001, asNumber(gifNativeSeconds, MACRO_BAR_FULL_SFX_SOURCE_SECONDS))) / MACRO_BAR_FILL_SECONDS
    );
  }

  function nextBarFillSfxAudio() {
    if (!state.barFillSfxPool.length) {
      state.barFillSfxPool = Array.from({ length: MACRO_BAR_FILL_SFX_POOL_SIZE }, () => {
        const audio = new Audio(docsAssetPath(MACRO_BAR_FILL_SFX_PATH));
        audio.preload = 'auto';
        audio.volume = MACRO_BAR_FILL_SFX_VOLUME;
        allowSfxPitchShift(audio);
        return audio;
      });
    }
    const audio = state.barFillSfxPool[state.barFillSfxPoolIndex % state.barFillSfxPool.length];
    state.barFillSfxPoolIndex += 1;
    return audio;
  }

  function ensureBarFillSfxAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!state.barFillSfxAudioContext) state.barFillSfxAudioContext = new AudioContextClass();
    if (state.barFillSfxAudioContext.state === 'suspended') {
      state.barFillSfxAudioContext.resume().catch(() => {});
    }
    return state.barFillSfxAudioContext;
  }

  function barFillSfxBufferPromise() {
    if (state.barFillSfxBuffer) return Promise.resolve(state.barFillSfxBuffer);
    if (state.barFillSfxBufferPromise) return state.barFillSfxBufferPromise;
    const context = ensureBarFillSfxAudioContext();
    if (!context) return null;
    state.barFillSfxBufferPromise = fetch(docsAssetPath(MACRO_BAR_FILL_SFX_PATH))
      .then(response => {
        if (!response.ok) throw new Error(`Bar fill SFX fetch failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => context.decodeAudioData(buffer.slice(0)))
      .then(decoded => {
        state.barFillSfxBuffer = decoded;
        return decoded;
      })
      .catch(error => {
        state.barFillSfxBufferPromise = null;
        throw error;
      });
    return state.barFillSfxBufferPromise;
  }

  function primeBarFillSfx() {
    if (!state.audioEnabled) return;
    const promise = barFillSfxBufferPromise();
    if (promise?.catch) promise.catch(() => {});
  }

  function macroBarFillSfxTiming(event, sourceDuration = MACRO_BAR_FILL_SFX_SOURCE_SECONDS) {
    const safeDuration = Math.max(0.001, asNumber(sourceDuration, MACRO_BAR_FILL_SFX_SOURCE_SECONDS));
    const targetSeconds = Math.max(0.001, asNumber(event?.targetSeconds, MACRO_BAR_FILL_SECONDS));
    const sourceSliceSeconds = Math.min(
      asNumber(event?.sourceSliceSeconds, null) ?? macroBarFillSfxSourceSliceSeconds(event?.fillRatio, event?.gifNativeSeconds),
      safeDuration
    );
    const sourceOffsetSeconds = clamp(
      asNumber(event?.sourceOffsetSeconds, 0),
      0,
      Math.max(0, safeDuration - sourceSliceSeconds)
    );
    const playbackRate = Math.max(0.001, asNumber(event?.gifPlaybackRate, null) ?? (sourceSliceSeconds / targetSeconds));
    const playSeconds = Math.min(
      targetSeconds,
      Math.max(0.001, sourceSliceSeconds / playbackRate),
      Math.max(0.001, (safeDuration - sourceOffsetSeconds) / playbackRate)
    );
    return {
      playbackRate,
      playSeconds,
      sourceOffsetSeconds,
      fadeInSeconds: Math.min(MACRO_BAR_FILL_SFX_FADE_IN_SECONDS, playSeconds * 0.4),
      fadeOutSeconds: Math.min(MACRO_BAR_FILL_SFX_FADE_OUT_SECONDS, playSeconds * 0.45)
    };
  }

  function barFillSfxEnvelope(elapsedSeconds, timing) {
    const playSeconds = Math.max(0.001, timing?.playSeconds || MACRO_BAR_FILL_SECONDS);
    const fadeInSeconds = Math.max(0, timing?.fadeInSeconds || 0);
    const fadeOutSeconds = Math.max(0, timing?.fadeOutSeconds || 0);
    const fadeIn = fadeInSeconds > 0 ? smoothstep(clamp(elapsedSeconds / fadeInSeconds, 0, 1)) : 1;
    const fadeOut = fadeOutSeconds > 0 ? smoothstep(clamp((playSeconds - elapsedSeconds) / fadeOutSeconds, 0, 1)) : 1;
    return Math.min(fadeIn, fadeOut);
  }

  function smoothstep(progress) {
    const safeProgress = clamp(progress, 0, 1);
    return safeProgress * safeProgress * (3 - (2 * safeProgress));
  }

  function applyBarFillHtmlSfxEnvelope(audio, timing) {
    const startMs = performance.now();
    const step = () => {
      if (audio.paused) return;
      const elapsedSeconds = (performance.now() - startMs) / 1000;
      audio.volume = MACRO_BAR_FILL_SFX_VOLUME * barFillSfxEnvelope(elapsedSeconds, timing);
      if (elapsedSeconds < timing.playSeconds) window.requestAnimationFrame(step);
    };
    step();
  }

  function applyBarFillWebAudioEnvelope(gain, context, timing) {
    const now = context.currentTime;
    const playSeconds = Math.max(0.001, timing.playSeconds);
    const steps = Math.max(8, MACRO_BAR_FILL_SFX_ENVELOPE_STEPS);
    const curve = Float32Array.from({ length: steps }, (_, index) => {
      const elapsedSeconds = playSeconds * (index / Math.max(1, steps - 1));
      return MACRO_BAR_FILL_SFX_GAIN * barFillSfxEnvelope(elapsedSeconds, timing);
    });
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.setValueCurveAtTime(curve, now, playSeconds);
  }

  function playBarFillHtmlSfx(event) {
    if (!state.audioEnabled || !event) return;
    const audio = nextBarFillSfxAudio();
    const timing = macroBarFillSfxTiming(event, audio.duration || MACRO_BAR_FILL_SFX_SOURCE_SECONDS);
    try {
      audio.pause();
      audio.currentTime = timing.sourceOffsetSeconds;
      allowSfxPitchShift(audio);
      audio.volume = 0;
      audio.playbackRate = timing.playbackRate;
      const playPromise = audio.play();
      if (playPromise?.catch) playPromise.catch(() => {});
      applyBarFillHtmlSfxEnvelope(audio, timing);
      window.setTimeout(() => {
        try {
          audio.pause();
          audio.currentTime = timing.sourceOffsetSeconds;
        } catch {}
      }, Math.round(timing.playSeconds * 1000));
    } catch {}
  }

  function playBarFillWebAudioSfx(event) {
    const context = ensureBarFillSfxAudioContext();
    const promise = context ? barFillSfxBufferPromise() : null;
    if (!context || !promise) {
      playBarFillHtmlSfx(event);
      return;
    }
    if (!state.barFillSfxBuffer) {
      promise.catch(() => {});
      playBarFillHtmlSfx(event);
      return;
    }
    promise
      .then(buffer => {
        if (!state.audioEnabled || !state.playing) return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();
        const timing = macroBarFillSfxTiming(event, buffer.duration);
        source.buffer = buffer;
        source.playbackRate.value = timing.playbackRate;
        filter.type = 'lowpass';
        filter.frequency.value = MACRO_BAR_FILL_SFX_FILTER_HZ;
        filter.Q.value = MACRO_BAR_FILL_SFX_FILTER_Q;
        applyBarFillWebAudioEnvelope(gain, context, timing);
        source.connect(filter).connect(gain).connect(context.destination);
        state.barFillSfxSources.add(source);
        source.onended = () => {
          state.barFillSfxSources.delete(source);
        };
        source.start(0, timing.sourceOffsetSeconds);
        source.stop(context.currentTime + timing.playSeconds);
      })
      .catch(() => {
        playBarFillHtmlSfx(event);
      });
  }

  function playBarFillSfx(event) {
    if (!state.audioEnabled || !event) return;
    playBarFillWebAudioSfx(event);
  }

  function pauseBarFillSfx() {
    for (const source of state.barFillSfxSources || []) {
      try {
        source.stop();
      } catch {}
    }
    state.barFillSfxSources.clear();
    for (const audio of state.barFillSfxPool || []) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }

  function triggerBarFillSfxBetween(previousTime, currentTime) {
    if (!state.playing || !state.audioEnabled || currentTime <= previousTime) return;
    for (const event of macroBarFillSfxEvents()) {
      if (state.playedBarFillSfxKeys.has(event.key)) continue;
      if (event.time <= previousTime || event.time > currentTime) continue;
      state.playedBarFillSfxKeys.add(event.key);
      playBarFillSfx(event);
    }
  }

  function applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent = false, revealSchedule = null, options = {}) {
    if (persistent) {
      node.style.opacity = '1';
      if (layer.flipY) {
        node.style.transformOrigin = 'center';
        node.style.transform = 'scaleY(-1)';
      }
      return;
    }

    const delay = revealSchedule?.start ?? layerRevealDelay(layer, index);
    const sceneDuration = Math.max(1, sceneContentDuration(scene));
    const isMacroRowReveal = revealSchedule?.family === 'macro' && revealSchedule.rowIndex != null;
    const isMacroArrowReveal = isMacroRowReveal && revealSchedule?.kind === 'arrow';
    const isMacroBarFillReveal = revealSchedule?.family === 'macro' && revealSchedule?.kind === 'bar-fill';
    const isMacroHeadReveal = isMacroHeadRevealSchedule(revealSchedule);
    const isMicronReveal = revealSchedule?.family === 'micron';
    const isMicronTierReveal = isMicronReveal && ['dv-bar', 'icon', 'label', 'value'].includes(revealSchedule?.kind);
    const isProConRowReveal = (revealSchedule?.family === 'pros' || revealSchedule?.family === 'cons') && revealSchedule.rowIndex != null;
    const isIntroStampSprite = revealSchedule?.family === 'intro'
      && ['food-hero', 'ranked-sprite'].includes(revealSchedule?.kind);
    const isOutroTierStamp = revealSchedule?.family === 'outro'
      && revealSchedule?.kind === 'tier'
      && String(layer?.effect || '').includes('d-tier-stamp');
    const revealWindowSeconds = isIntroStampSprite || isOutroTierStamp
      ? STAMP_REVEAL_SECONDS
      : isMacroHeadReveal
      ? MACRO_HEAD_REVEAL_SECONDS
      : isMacroRowReveal
      ? SUBMACRO_REVEAL_WINDOW_SECONDS
      : isMicronTierReveal
        ? MICRON_BAR_STAMP_REVEAL_SECONDS
        : isMicronReveal
          ? MICRON_STAMP_REVEAL_SECONDS
      : AUDIO_REVEAL_WINDOW_SECONDS;
    const revealLead = isMacroRowReveal || isMacroHeadReveal || isMicronReveal ? 0 : Math.min(0.035, AUDIO_REVEAL_LEAD_SECONDS / sceneDuration);
    const revealWindow = isMacroHeadReveal
      ? Math.min(0.94, Math.max(0.001, revealWindowSeconds / sceneDuration))
      : isMacroRowReveal
      ? macroRevealWindowProgress(scene, revealWindowSeconds)
      : isIntroStampSprite || isOutroTierStamp
        ? stampRevealWindowProgress(scene, revealSchedule)
        : isMicronReveal
          ? Math.min(0.12, Math.max(isMicronTierReveal ? 0.008 : 0.028, revealWindowSeconds / sceneDuration))
          : Math.min(0.18, Math.max(0.045, revealWindowSeconds / sceneDuration));
    const rawRevealProgress = (sceneProgress + revealLead - delay) / revealWindow;
    const revealProgress = easeOutCubic(rawRevealProgress);
    let visible = clamp(revealProgress, 0, 1);
    let opacity = visible;
    const revealPulse = isMacroArrowReveal
      ? Math.sin(visible * Math.PI)
      : 0;
    let x = 0;
    let y = 0;
    let rotate = 0;
    let scale = layer.kind === 'text' ? 1 : 0.96 + (visible * 0.04);
    let clip = '';
    let stampImpactPulse = 0;
    const lockSpriteLayout = layer.kind === 'sprite' && !persistent && !isProConRowReveal;

    if (isMacroHeadReveal) {
      const targetFill = clamp(asNumber(layer?.fillRatio, revealSchedule?.fillRatio ?? 0), 0, 1);
      visible = options.groupedReveal
        ? (isMacroBarFillReveal && targetFill <= 0.001 ? 0 : 1)
        : (isMacroBarFillReveal && targetFill <= 0.001 ? 0 : visible);
      opacity = visible;
      scale = 1;
    } else if (isOutroTierStamp || isIntroStampSprite) {
      const impactPulse = Math.sin(visible * Math.PI);
      stampImpactPulse = impactPulse;
      const entryTilt = isOutroTierStamp || revealSchedule?.kind === 'ranked-sprite' ? -4 : 4;
      scale = 1.62 - (visible * 0.62) + (impactPulse * 0.22);
      y += (1 - visible) * -20;
      rotate = (entryTilt * (1 - visible)) + (impactPulse * (entryTilt < 0 ? -1.4 : 1.4));
    } else if (isMacroRowReveal) {
      scale = 1;
    } else if (isMicronReveal) {
      const stampPulse = Math.sin(visible * Math.PI);
      scale = 0.965 + (visible * 0.035) + (stampPulse * (isMicronTierReveal ? 0.018 : 0.012));
      y += (1 - visible) * 2.4;
    } else if (lockSpriteLayout) {
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

    const flip = layer.flipY ? ' scaleY(-1)' : '';
    if (options.opaqueSpriteReveal && rawRevealProgress > 0 && !isMacroHeadReveal) opacity = 1;
    node.style.transformOrigin = isMacroArrowReveal || isOutroTierStamp || isIntroStampSprite || layer.flipY ? 'center' : 'top left';
    node.style.opacity = String(opacity);
    node.style.transform = `translate3d(calc(${x}px * var(--pixel-unit)), calc(${y}px * var(--pixel-unit)), 0) rotate(${rotate.toFixed(2)}deg) scale(${scale})${flip}`;
    if (clip) node.style.clipPath = clip;
    if ((isOutroTierStamp || isIntroStampSprite) && stampImpactPulse > 0.02) {
      const glowRgb = isOutroTierStamp ? '255, 113, 113' : '255, 244, 184';
      node.style.filter = [
        `brightness(${(1.18 + stampImpactPulse * 0.48).toFixed(3)})`,
        `saturate(${(1.18 + stampImpactPulse * 0.38).toFixed(3)})`,
        `contrast(${(1.08 + stampImpactPulse * 0.16).toFixed(3)})`,
        `drop-shadow(0 0 calc(${(2.2 + stampImpactPulse * 4.8).toFixed(2)}px * var(--pixel-unit)) rgba(${glowRgb}, ${(0.50 + stampImpactPulse * 0.32).toFixed(3)}))`,
        `drop-shadow(0 0 calc(${(7 + stampImpactPulse * 9).toFixed(2)}px * var(--pixel-unit)) rgba(255, 255, 255, ${(0.20 + stampImpactPulse * 0.22).toFixed(3)}))`
      ].join(' ');
    } else if (isMacroArrowReveal && revealPulse > 0.02) {
      const glowRgb = macroArrowGlowRgb(layer);
      const glowStrength = 0.35 + (revealPulse * 0.45);
      node.style.filter = [
        `brightness(${(1.08 + revealPulse * 0.28).toFixed(3)})`,
        `saturate(${(1.16 + revealPulse * 0.28).toFixed(3)})`,
        `drop-shadow(0 0 calc(${(1.15 + revealPulse * 2.1).toFixed(2)}px * var(--pixel-unit)) rgba(${glowRgb}, ${glowStrength.toFixed(3)}))`
      ].join(' ');
    } else if (isMacroArrowReveal) {
      const glowRgb = macroArrowGlowRgb(layer);
      node.style.filter = [
        'brightness(1.08)',
        'saturate(1.16)',
        `drop-shadow(0 0 calc(1.15px * var(--pixel-unit)) rgba(${glowRgb}, 0.35))`
      ].join(' ');
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function stopPlayback({ pauseSfx = true } = {}) {
    state.playing = false;
    state.audioInHold = false;
    els.playPause.textContent = 'Play';
    if (els.narrationAudio) els.narrationAudio.pause();
    pauseHighlightGlowSfx();
    if (pauseSfx) {
      pauseStampSfx();
      pauseTransitionSfx();
      pauseMicronBarConfirmSfx();
      pauseMicron100FireworkSfx();
      pauseMajorProSparkleSfx();
      pauseBarFillSfx();
    }
  }

  function startPlayback() {
    state.playing = true;
    state.startedAt = performance.now();
    state.playheadStart = state.currentTime;
    state.highlightGlowSfxLastFrameAt = performance.now();
    state.audioInHold = false;
    state.playedStampSfxKeys = new Set();
    state.playedTransitionSfxKeys = new Set();
    state.playedMicronBarConfirmSfxKeys = new Set();
    state.playedMicron100FireworkSfxKeys = new Set();
    state.playedMajorProSparkleSfxKeys = new Set();
    state.playedBarFillSfxKeys = new Set();
    els.playPause.textContent = 'Pause';
    primeBarFillSfx();
    syncAudioPlaybackState();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!state.playing) return;
    const elapsed = (now - state.startedAt) / 1000;
    const previousTime = state.currentTime;
    state.currentTime = state.playheadStart + elapsed;
    triggerTransitionSfxBetween(previousTime, state.currentTime);
    triggerStampSfxBetween(previousTime, state.currentTime);
    triggerMicronBarConfirmSfxBetween(previousTime, state.currentTime);
    triggerMicron100FireworkSfxBetween(previousTime, state.currentTime);
    triggerMajorProSparkleSfxBetween(previousTime, state.currentTime);
    triggerBarFillSfxBetween(previousTime, state.currentTime);
    if (state.currentTime >= totalDuration()) {
      state.currentTime = totalDuration();
      stopPlayback({ pauseSfx: false });
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
    scheduleSpriteDiagnostics(650);
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
    if (event.key === SAVED_LAYOUTS_KEY) {
      state.savedLayouts = loadSavedLayouts();
      if (state.layoutSourceId.startsWith('saved:')) hydrateLayoutForFood();
      renderAll();
      return;
    }
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
    if (!state.audioEnabled) {
      els.narrationAudio.pause();
      pauseStampSfx();
      pauseHighlightGlowSfx();
      pauseTransitionSfx();
      pauseBarFillSfx();
    }
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

  els.copySpriteReport.addEventListener('click', async () => {
    const text = spriteDiagnosticsReport();
    try {
      await navigator.clipboard.writeText(text);
      els.copySpriteReport.textContent = 'Copied';
      setTimeout(() => { els.copySpriteReport.textContent = 'Copy sprite report'; }, 1000);
    } catch {
      els.spriteDiagnostics.textContent = text;
    }
  });

  window.addEventListener('resize', () => {
    setCanvasScale();
    renderStage();
    scheduleSpriteDiagnostics(450);
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

  function normalizeSplitAudioBlocks(blocks) {
    return (Array.isArray(blocks) ? blocks : [])
      .map(block => {
        const offsetSeconds = asNumber(block.offsetSeconds, null);
        const durationSeconds = asNumber(block.durationSeconds, null);
        return {
          id: block.id || null,
          index: asNumber(block.index, null),
          kind: block.kind || null,
          sectionKey: block.sectionKey || null,
          path: block.path || null,
          productionPath: block.productionPath || null,
          text: block.text || '',
          offsetSeconds,
          durationSeconds,
          endSeconds: offsetSeconds != null && durationSeconds != null ? offsetSeconds + durationSeconds : null
        };
      })
      .filter(block => block.path && block.offsetSeconds != null && block.durationSeconds != null && block.durationSeconds > 0)
      .sort((a, b) => a.offsetSeconds - b.offsetSeconds || (a.index ?? 0) - (b.index ?? 0));
  }

  function audioForFood(food) {
    const splitAudio = food?.episode?.splitAudio || food?.splitAudio || null;
    const splitBlocks = normalizeSplitAudioBlocks(splitAudio?.blocks);
    if (splitAudio?.mode === 'split-blocks' && splitBlocks.length) {
      let durationSeconds = asNumber(splitAudio.durationSeconds, null);
      if (durationSeconds == null) {
        durationSeconds = Math.max(...splitBlocks.map(block => block.endSeconds || 0));
      }
      return {
        mode: 'split-blocks',
        take: splitAudio.take || null,
        manifestPath: splitAudio.manifestPath || null,
        productionManifestPath: splitAudio.productionManifestPath || null,
        profileId: splitAudio.profileId || null,
        voiceLabel: splitAudio.voiceLabel || null,
        modelId: splitAudio.modelId || null,
        generatedAt: splitAudio.generatedAt || null,
        durationSeconds,
        blockGapSeconds: asNumber(splitAudio.blockGapSeconds, null),
        blocks: splitBlocks
      };
    }

    const audio = food?.episode?.audio || food?.audio || null;
    if (!audio?.path) return null;
    return {
      mode: 'single-audio',
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

  function splitAudioBlockAtAudioTime(audio, audioTime) {
    if (audio?.mode !== 'split-blocks') return null;
    const timelineTime = asNumber(audioTime, 0);
    for (const block of audio.blocks || []) {
      const start = block.offsetSeconds;
      const end = block.endSeconds;
      if (timelineTime >= start && timelineTime < end) {
        return {
          block,
          audioTime: timelineTime,
          localTime: clamp(timelineTime - start, 0, Math.max(0, block.durationSeconds - 0.01))
        };
      }
    }
    return null;
  }

  function splitAudioPositionForVideoTime(audio, time = state.currentTime) {
    if (audio?.mode !== 'split-blocks') return null;
    const duration = asNumber(audio.durationSeconds, totalNarrationDuration());
    const audioTime = clamp(videoTimeToAudioTime(time), 0, Math.max(0, duration - 0.001));
    return splitAudioBlockAtAudioTime(audio, audioTime);
  }

  function setNarrationAudioSource(path) {
    const nextSrc = new URL(docsAssetPath(path), window.location.href).href;
    if (els.narrationAudio.src === nextSrc) return false;
    els.narrationAudio.src = nextSrc;
    els.narrationAudio.load();
    return true;
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
    if (audio.mode === 'split-blocks') {
      if (audio.durationSeconds) calibrateSceneDurationsToAudio(audio.durationSeconds);
      syncAudioTime({ force: true });
      updateAudioControls();
      return;
    }
    const sourceChanged = setNarrationAudioSource(audio.path);
    if (sourceChanged) {
      state.audioTimelineKey = '';
      state.audioDurationSeconds = null;
    }
    syncAudioTime({ force: true });
    updateAudioControls();
  }

  function syncAudioPlaybackState() {
    const audio = audioForFood(selectedFood());
    if (!state.audioEnabled || !audio) return;
    const splitPosition = audio.mode === 'split-blocks' ? splitAudioPositionForVideoTime(audio) : null;
    const waitingForNarration = isSceneHoldAt(state.currentTime)
      || isSceneNarrationDelayAt(state.currentTime)
      || (audio.mode === 'split-blocks' && !splitPosition);
    if (waitingForNarration) {
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
    const audio = audioForFood(selectedFood());
    if (!audio) return false;
    if (audio.mode === 'split-blocks') {
      const position = splitAudioPositionForVideoTime(audio);
      if (!position?.block) return false;
      setNarrationAudioSource(position.block.path);
      try {
        if (force) els.narrationAudio.currentTime = position.localTime;
      } catch {}
      return true;
    }
    if (!els.narrationAudio?.src) return false;
    const safeTime = clamp(videoTimeToAudioTime(state.currentTime), 0, Math.max(0, totalNarrationDuration() - 0.01));
    try {
      if (force) {
        els.narrationAudio.currentTime = safeTime;
      }
    } catch {}
    return true;
  }

  function playAudioFromCurrentTime({ forceSync = true } = {}) {
    const audio = audioForFood(selectedFood());
    if (!state.audioEnabled || !audio) return;
    if (isSceneHoldAt(state.currentTime) || isSceneNarrationDelayAt(state.currentTime)) return;
    if (!syncAudioTime({ force: forceSync })) return;
    if (!els.narrationAudio?.src) return;
    const playPromise = els.narrationAudio.play();
    if (playPromise?.catch) {
      playPromise.catch(error => {
        if (error?.name === 'NotAllowedError') {
          state.audioEnabled = false;
          updateAudioControls('Audio blocked');
          return;
        }
        if (state.playing) syncAudioPlaybackState();
      });
    }
  }

  function updateAudioControls(overrideStatus) {
    const audio = audioForFood(selectedFood());
    if (!els.audioToggle || !els.audioStatus) return;
    els.audioToggle.disabled = !audio;
    els.audioToggle.textContent = state.audioEnabled && audio ? 'Audio on' : 'Audio off';
    const holdDuration = totalHoldDuration();
    const syncLabel = state.audioDurationSeconds
      ? ` · synced ${state.audioDurationSeconds.toFixed(1)}s${holdDuration ? ` + ${holdDuration.toFixed(1)}s dwell` : ''}`
      : '';
    const modeLabel = audio?.mode === 'split-blocks' ? ' split' : '';
    els.audioStatus.textContent = overrideStatus || (audio ? `${audio.take || 'Audio'}${modeLabel} ready${syncLabel}` : 'No audio');
  }

  els.narrationAudio.addEventListener('loadedmetadata', () => {
    if (audioForFood(selectedFood())?.mode === 'split-blocks') {
      updateAudioControls();
      return;
    }
    if (calibrateSceneDurationsToAudio(els.narrationAudio.duration)) {
      syncAudioTime({ force: true });
      renderAll();
      return;
    }
    updateAudioControls();
  });

  void init();
}());
