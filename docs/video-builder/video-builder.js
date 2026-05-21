(function () {
  const DISPLAY_LAYOUT_KEY = 'foodranked-display-builder-v4';
  const SAVED_LAYOUTS_KEY = 'foodranked-display-builder-sprite-layouts-v1';
  const VIDEO_STATE_KEY = 'foodranked-video-builder-state-v1';
  const AUTHOR_GRID = { width: 135, height: 240 };
  const ROOT_SPRITE_BASE = './sprites';
  const SECTION_INDICATOR_LAYOUT = { normalSize: 10, highlightedSize: 12 };
  const CUSTOM_FOOD_IMAGE_IDS = new Set(['bacon']);

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

  const els = {
    foodSearch: document.getElementById('foodSearch'),
    foodList: document.getElementById('foodList'),
    layoutSource: document.getElementById('layoutSource'),
    layoutStatus: document.getElementById('layoutStatus'),
    sceneList: document.getElementById('sceneList'),
    videoStage: document.getElementById('videoStage'),
    playPause: document.getElementById('playPause'),
    timeReadout: document.getElementById('timeReadout'),
    timeScrub: document.getElementById('timeScrub'),
    timelineStrip: document.getElementById('timelineStrip'),
    phoneShell: document.querySelector('.phone-shell'),
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
  const savedState = readJson(localStorage.getItem(VIDEO_STATE_KEY), {});
  const state = {
    foodFilter: '',
    selectedFoodId: savedState.selectedFoodId || 'bacon',
    layoutSourceId: savedState.layoutSourceId || 'display-builder',
    selectedSceneId: savedState.selectedSceneId || 'intro',
    currentTime: 0,
    playing: false,
    startedAt: 0,
    playheadStart: 0,
    scenes: [],
    layout: null,
    savedLayouts: loadSavedLayouts(),
    backgroundKey: '',
    backgroundToken: 0,
    lastFrameAt: performance.now()
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
    return foods.find(food => food.id === state.selectedFoodId) || foods[0] || null;
  }

  function asNumber(value, fallback = null) {
    if (value == null || value === '') return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOutCubic(value) {
    const t = clamp(value, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }

  function formatCompactNumber(value, decimals = 1) {
    const safe = asNumber(value, null);
    if (safe == null) return 'N/A';
    const fixed = Number.isInteger(safe) || Math.abs(safe) >= 10 ? 0 : decimals;
    return safe.toLocaleString(undefined, { maximumFractionDigits: fixed });
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
    if (path.startsWith('../app/')) return path;
    return path;
  }

  function appSpritePath(path) {
    return `${ROOT_SPRITE_BASE}/${path}`.replace(/\/+/g, '/').replace(':/', '://');
  }

  function foodImagePath(food) {
    return appSpritePath(`header/food_images/${food?.id || 'bacon'}.png`);
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
      const specs = MACRO_SUBMETRIC_SPECS[sectionId] || [];
      specs.forEach((spec, index) => {
        const label = layers.find(layer => layer.id === `${sectionId}_submacro_label_${index + 1}`);
        const value = layers.find(layer => layer.id === `${sectionId}_submacro_value_${index + 1}`);
        if (label && !label.manualText) label.text = spec.label;
        if (value && !value.manualText) value.text = spec.value(food);
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

  function hydrateLayoutForFood() {
    const food = selectedFood();
    const layout = selectedLayoutBase();
    syncHeader(layout, food);
    syncSectionIndicators(layout, food);
    syncMacroText(layout, food);
    syncMicros(layout, food, 'vitamins', VITAMIN_TEXT_SPECS, 'vitamins_label', 'vitamins_percent');
    syncMicros(layout, food, 'minerals', MINERAL_TEXT_SPECS, 'minerals_label', 'minerals_percent');
    syncProsCons(layout, food);
    state.layout = layout;
    els.layoutStatus.textContent = state.layoutSourceId === 'display-builder' && loadDisplayBuilderLayout() ? 'Saved layout' : 'Default layout';
  }

  function captionFromEpisode(food, sectionId) {
    const blocks = food?.episode?.script?.narrationBlocks || [];
    if (sectionId === 'intro') return `${food?.name || 'This food'} ranked.`;
    if (sectionId === 'outro') {
      const summary = blocks.find(block => block.kind === 'closing_summary')?.text || food?.episode?.summary || '';
      const final = blocks.find(block => block.kind === 'final_reveal')?.text || `${food?.episode?.tier || food?.expectedTier || '—'} tier.`;
      return [summary, final].filter(Boolean).join(' ');
    }
    const episodeKey = sectionId === 'protein' ? 'proteins' : sectionId;
    return blocks.find(block => block.kind === 'section' && (block.sectionKey === sectionId || block.sectionKey === episodeKey))?.text
      || food?.episode?.script?.sections?.find(section => section.key === sectionId || section.key === episodeKey)?.subtitleText
      || fallbackCaption(food, sectionId);
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

  function buildScenes(food, previous = []) {
    return SECTIONS.map(section => {
      const existing = previous.find(scene => scene.id === section.id);
      return {
        id: section.id,
        label: section.label,
        duration: existing?.duration || section.duration,
        reveal: existing?.reveal || section.reveal,
        motion: existing?.motion || section.motion,
        captionSize: existing?.captionSize || 22,
        caption: existing?.caption || captionFromEpisode(food, section.id)
      };
    });
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
        state.scenes = buildScenes(food);
        hydrateLayoutForFood();
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
      button.innerHTML = `<strong>${escapeHtml(scene.label)}</strong><span>${scene.start.toFixed(1)}s - ${scene.end.toFixed(1)}s · ${escapeHtml(scene.reveal)} · ${escapeHtml(scene.motion)}</span>`;
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
    els.sceneStatus.textContent = selected ? `${selected.duration.toFixed(1)}s` : '0.0s';
    els.sceneDuration.value = selected?.duration ?? '';
    els.revealStyle.value = selected?.reveal || 'cascade';
    els.spriteMotion.value = selected?.motion || 'bob';
    els.captionSize.value = selected?.captionSize || 22;
    els.captionText.value = selected?.caption || '';
    els.playPause.textContent = state.playing ? 'Pause' : 'Play';

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
      duration: Number(totalDuration().toFixed(2)),
      scenes: sceneStarts().map(scene => ({
        id: scene.id,
        label: scene.label,
        start: Number(scene.start.toFixed(2)),
        end: Number(scene.end.toFixed(2)),
        duration: Number(scene.duration.toFixed(2)),
        reveal: scene.reveal,
        spriteMotion: scene.motion,
        captionSize: scene.captionSize,
        caption: scene.caption
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
    const sourceLayers = getSectionLayers(state.layout, 'intro');
    const fallbackLayers = getSectionLayers(state.layout, sectionId);
    const sourceChrome = sourceLayers.filter(layer => isPersistentChrome(layer) || isSectionIndicator(layer));
    const fallbackChrome = fallbackLayers.filter(layer => isPersistentChrome(layer) || isSectionIndicator(layer));
    const layers = (sourceChrome.length ? sourceChrome : fallbackChrome).map(clone);
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
    return getSectionLayers(state.layout, sectionId)
      .filter(layer => !isPersistentChrome(layer) && !isSectionIndicator(layer));
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
    const sceneProgress = clamp((state.currentTime - scene.start) / scene.duration, 0, 1);
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

    layers.forEach(({ layer, index, persistent }) => {
      if (layer.visible === false) return;
      const node = document.createElement(layer.kind === 'sprite' ? 'img' : 'div');
      node.className = `layer-node ${layer.kind}${layer.kind === 'text' ? ' pixel-text' : ''}`;
      node.dataset.layerId = layer.id || '';
      node.dataset.persistent = persistent ? 'true' : 'false';
      node.style.zIndex = String(Number(layer.z) || 0);
      applyLayerBox(node, layer);
      applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent);
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

    roots.caption.style.fontSize = `calc(${Number(scene.captionSize) || 22}px * 0.25 * var(--pixel-unit))`;
    roots.caption.textContent = captionChunk(scene.caption, sceneProgress);
    roots.caption.style.opacity = String(easeOutCubic((sceneProgress + 0.05) * 4));
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
      const hasPrimary = CUSTOM_FOOD_IMAGE_IDS.has(String(item?.id || ''));
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

  function fitStage() {
    const rect = els.phoneShell?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return;
    const scale = clamp(Math.min(rect.width / AUTHOR_GRID.width, rect.height / AUTHOR_GRID.height, 4), 1.6, 4);
    els.videoStage.style.setProperty('--pixel-unit', String(scale));
  }

  function captionChunk(text, progress) {
    const source = String(text || '').replace(/\s+/g, ' ').trim();
    if (!source) return '';
    const chunks = [];
    let current = '';
    source.split(/(?<=[.!?])\s+/).forEach(sentence => {
      if ((current + ' ' + sentence).trim().length > 92 && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = `${current} ${sentence}`.trim();
      }
    });
    if (current) chunks.push(current.trim());
    const index = clamp(Math.floor(progress * chunks.length), 0, chunks.length - 1);
    return chunks[index] || source;
  }

  function applyLayerBox(node, layer) {
    node.style.left = `calc(${Number(layer.x) || 0}px * var(--pixel-unit))`;
    node.style.top = `calc(${Number(layer.y) || 0}px * var(--pixel-unit))`;
    if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit))`;
    if (layer.height) node.style.height = `calc(${Number(layer.height)}px * var(--pixel-unit))`;
    if (layer.kind === 'sprite') {
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

  function applyLayerAnimation(node, layer, scene, sceneProgress, index, persistent = false) {
    if (persistent) {
      node.style.opacity = '1';
      if (layer.flipY) {
        node.style.transform = 'scaleY(-1)';
      }
      return;
    }

    const delay = layerRevealDelay(layer, index);
    const revealWindow = scene.reveal === 'cascade' ? 0.28 : 0.22;
    const revealProgress = easeOutCubic((sceneProgress + 0.05 - delay) / revealWindow);
    const visible = clamp(revealProgress, 0, 1);
    const phase = state.currentTime * Math.PI * 2;
    let x = 0;
    let y = 0;
    let scale = 0.96 + (visible * 0.04);
    let clip = '';

    if (scene.reveal === 'slide') {
      x -= (1 - visible) * 10;
    } else if (scene.reveal === 'wipe') {
      clip = `inset(0 ${Math.round((1 - visible) * 100)}% 0 0)`;
    } else if (scene.reveal === 'pop') {
      scale = 0.8 + (visible * 0.2);
    } else {
      y += (1 - visible) * 7;
    }

    if (layer.kind === 'sprite') {
      if (scene.motion === 'bob') y += Math.sin(phase + index) * 0.7;
      if (scene.motion === 'pulse') scale += Math.sin(phase * 0.8 + index) * 0.018;
      if (scene.motion === 'drift') x += Math.sin(phase * 0.45 + index) * 0.55;
    }

    const flip = layer.flipY ? ' scaleY(-1)' : '';
    node.style.opacity = String(visible);
    node.style.transform = `translate3d(calc(${x}px * var(--pixel-unit)), calc(${y}px * var(--pixel-unit)), 0) scale(${scale})${flip}`;
    if (clip) node.style.clipPath = clip;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function stopPlayback() {
    state.playing = false;
    els.playPause.textContent = 'Play';
  }

  function startPlayback() {
    state.playing = true;
    state.startedAt = performance.now();
    state.playheadStart = state.currentTime;
    state.lastFrameAt = performance.now();
    els.playPause.textContent = 'Pause';
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
    fitStage();
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
    renderDynamic();
  });

  els.sceneDuration.addEventListener('input', () => {
    updateSelectedScene(scene => {
      scene.duration = clamp(asNumber(els.sceneDuration.value, scene.duration), 1, 12);
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
    fitStage();
    renderStage();
  });

  function init() {
    const food = selectedFood();
    if (!foods.some(item => item.id === state.selectedFoodId) && foods[0]) state.selectedFoodId = foods[0].id;
    state.scenes = buildScenes(food);
    hydrateLayoutForFood();
    renderAll();
    requestAnimationFrame(() => {
      fitStage();
      renderStage();
    });
  }

  init();
}());
