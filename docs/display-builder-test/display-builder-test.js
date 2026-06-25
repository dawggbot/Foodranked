(function () {
  const LOGIC = window.FOODRANKED_MACRO_LOGIC;
  const BINDINGS = window.FOODRANKED_MACRO_BINDINGS;
  const MACRO_SECTIONS = BINDINGS.macroSections || ['fats', 'carbs', 'protein'];
  const SECTION_LABELS = { fats: 'Fats', carbs: 'Carbohydrates', protein: 'Protein' };
  const LAYOUT_BUILDER_WORKING_KEY = 'foodranked-layout-builder-v4';
  const LAYOUT_BUILDER_FOOD_LAYOUTS_KEY = 'foodranked-layout-builder-food-layouts-v1';
  const LAYOUT_BUILDER_SAVED_KEY = 'foodranked-layout-builder-sprite-layouts-v1';
  const TEST_STATE_KEY = 'foodranked-display-builder-test-state-v1';
  const FOOD_JSON_CACHE = new Map();
  const BATCH_RESULTS_CACHE = new Map();
  const SPRITE_EXISTENCE_CACHE = new Map();
  const renderToken = { value: 0 };

  const DEFAULT_BACKGROUND = {
    color: '#d6d6d6',
    motion: {
      enabled: true,
      mode: 'foodType',
      density: 24,
      opacity: 0.23,
      minDuration: 20,
      maxDuration: 40,
      minSize: 40,
      maxSize: 100,
      drift: 48
    }
  };

  const state = {
    foods: Array.isArray(window.FOODS_INDEX) ? window.FOODS_INDEX : [],
    foodFilter: '',
    selectedFoodId: '',
    selectedSectionId: 'fats',
    selectedLayoutKey: '',
    layoutOptions: [],
    fullFood: null,
    renderedLayout: null,
    bindingReport: { text: [], arrows: [], warnings: [] },
    spriteFailures: new Map(),
    background: LOGIC.clone(DEFAULT_BACKGROUND),
    lastLogic: null,
    loadingFoodId: ''
  };

  const els = {
    statusLine: document.getElementById('statusLine'),
    layoutSelect: document.getElementById('layoutSelect'),
    layoutStatus: document.getElementById('layoutStatus'),
    foodSearch: document.getElementById('foodSearch'),
    foodList: document.getElementById('foodList'),
    sectionList: document.getElementById('sectionList'),
    displayCanvas: document.getElementById('displayCanvas'),
    canvasMeta: document.getElementById('canvasMeta'),
    foodTypePill: document.getElementById('foodTypePill'),
    activeFoodTypeTitle: document.getElementById('activeFoodTypeTitle'),
    programmerLogic: document.getElementById('programmerLogic'),
    bgColor: document.getElementById('bgColor'),
    bgMotionEnabled: document.getElementById('bgMotionEnabled'),
    bgMotionMode: document.getElementById('bgMotionMode'),
    bgMotionDensity: document.getElementById('bgMotionDensity'),
    bgMotionOpacity: document.getElementById('bgMotionOpacity'),
    bgMotionMinDuration: document.getElementById('bgMotionMinDuration'),
    bgMotionMaxDuration: document.getElementById('bgMotionMaxDuration'),
    bgMotionMinSize: document.getElementById('bgMotionMinSize'),
    bgMotionMaxSize: document.getElementById('bgMotionMaxSize'),
    bgMotionDrift: document.getElementById('bgMotionDrift')
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
      background: state.background
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

  function validLayout(layout) {
    return !!layout && typeof layout === 'object' && !!layout.sections && typeof layout.sections === 'object';
  }

  function countMacroLayers(layout) {
    return MACRO_SECTIONS.reduce((sum, sectionId) => {
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
      layout: {
        canvas: null,
        selectedSectionId: entry.selectedSectionId || 'fats',
        sections: LOGIC.clone(entry.sections),
        meta: { source: LAYOUT_BUILDER_SAVED_KEY }
      }
    };
  }

  function refreshLayoutOptions({ keepSelection = true } = {}) {
    const previousKey = keepSelection ? state.selectedLayoutKey : '';
    const options = [];
    const working = parseStorageJson(LAYOUT_BUILDER_WORKING_KEY, null);
    if (validLayout(working)) {
      options.push({
        key: 'working:current',
        id: 'current-working-layout',
        name: 'Current working layout',
        kind: 'layout-builder working layout',
        updatedAt: working.meta?.updatedAt || '',
        layout: LOGIC.clone(working)
      });
    }

    const savedRaw = parseStorageJson(LAYOUT_BUILDER_SAVED_KEY, []);
    const savedEntries = Array.isArray(savedRaw) ? savedRaw : Object.values(savedRaw || {});
    savedEntries
      .map(normalizeSavedPreset)
      .filter(Boolean)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)) || a.name.localeCompare(b.name))
      .forEach(option => options.push(option));

    state.layoutOptions = options.filter(option => countMacroLayers(option.layout) > 0);
    if (previousKey && state.layoutOptions.some(option => option.key === previousKey)) {
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
      els.layoutStatus.textContent = 'Open the layout builder and save or keep a working macro layout, then refocus this tab.';
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
      ? `${selected.kind}; ${countMacroLayers(selected.layout)} macro-section layers read from layout-builder storage.`
      : '';
    els.layoutStatus.classList.remove('warn');
  }

  function selectedLayoutOption() {
    return state.layoutOptions.find(option => option.key === state.selectedLayoutKey) || state.layoutOptions[0] || null;
  }

  function selectedFoodStub() {
    return state.foods.find(food => food.id === state.selectedFoodId) || state.foods[0] || null;
  }

  async function loadFullFood(stub) {
    if (!stub?.path) return stub || null;
    if (FOOD_JSON_CACHE.has(stub.path)) return FOOD_JSON_CACHE.get(stub.path);
    try {
      const response = await fetch(`../${stub.path}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      FOOD_JSON_CACHE.set(stub.path, json);
      return json;
    } catch {
      return stub || null;
    }
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
      state.bindingReport.warnings.push({ type: 'data', message: 'Generated batch-results.json could not be loaded.' });
    }
  }

  function attachBatchResult(food) {
    if (!food?.id) return food;
    const batchResult = BATCH_RESULTS_CACHE.get(food.id);
    return batchResult ? { ...food, batchResult } : food;
  }

  async function loadSelectedFood() {
    const stub = selectedFoodStub();
    if (!stub) {
      state.fullFood = null;
      return null;
    }
    state.loadingFoodId = stub.id;
    await loadBatchResults();
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
        writeTestState();
        renderFoodList();
        await renderAll();
      });
      els.foodList.appendChild(button);
    }
  }

  function renderSections() {
    els.sectionList.innerHTML = '';
    for (const sectionId of MACRO_SECTIONS) {
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
      els.sectionList.appendChild(button);
    }
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

  function isMacroFillLayer(layer) {
    const fingerprint = `${layer?.id || ''} ${layer?.label || ''} ${layer?.src || ''}`.toLowerCase();
    return isSpriteLayer(layer) && /(macro_bar_fill|bar_fill|macro bar fill)/.test(fingerprint);
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
    const layers = layout?.sections?.[sectionId]?.layers;
    return Array.isArray(layers) ? layers : [];
  }

  function cloneLayoutForRender(option) {
    const base = LOGIC.clone(option?.layout || {});
    base.canvas = {
      width: LOGIC.AUTHOR_GRID.width,
      height: LOGIC.AUTHOR_GRID.height,
      ...(base.canvas || {})
    };
    base.selectedSectionId = state.selectedSectionId;
    base.selectedFoodId = state.selectedFoodId;
    base.sections = base.sections || {};
    for (const sectionId of MACRO_SECTIONS) {
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
        } else if (src.includes('/header/food_plate/') || src.includes('/header/food_image_plate/') || /header food image plate/.test(label)) {
          layer.src = LOGIC.headerFoodPlateSpritePath(food);
        } else if (src.includes('/header/food_images/') || /^header food image$/.test(label)) {
          layer.src = imageCandidates.primary;
          layer.fallbackSrc = imageCandidates.fallback;
        } else if (src.includes('/ui/section_separator/') || /^section separator$/.test(label)) {
          layer.src = LOGIC.sectionSeparatorSpritePath(food);
        }
      }
    }
  }

  function syncFoodText(layout, food) {
    const values = {
      food_name_text: String(food?.name || 'Unknown').toUpperCase(),
      kcal_value_text: String(food?.header?.kcal ?? food?.kcal ?? 'N/A'),
      basis_text: LOGIC.formatBasis(food),
      script_caption: LOGIC.prettyFoodType(food?.foodType).toUpperCase()
    };
    for (const sectionId of Object.keys(layout.sections || {})) {
      for (const layer of getSectionLayers(layout, sectionId)) {
        if (!isTextLayer(layer) || !(layer.id in values)) continue;
        layer.text = values[layer.id];
      }
    }
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

  function directTextBinding(sectionId, layer) {
    return BINDINGS.textBindings?.[sectionId]?.[layer.id] || null;
  }

  function textFallbackBinding(sectionId, fallbackIndex) {
    const fallbackId = BINDINGS.textFallbackOrder?.[sectionId]?.[fallbackIndex];
    return fallbackId ? BINDINGS.textBindings?.[sectionId]?.[fallbackId] || null : null;
  }

  function shouldResolveKnownBinding(layer, binding) {
    if (!binding) return false;
    if (String(layer.text || '').trim() === '?') return true;
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
        const isQuestion = String(layer.text || '').trim() === '?';
        const direct = directTextBinding(sectionId, layer);
        const fallbackIndex = fallbackIndexes.get(layer);
        const fallback = direct ? null : (isQuestion ? textFallbackBinding(sectionId, fallbackIndex) : null);
        const binding = direct || fallback;
        const before = layer.text;
        const resolvedValue = binding ? LOGIC.formatBindingValue(food, sectionId, binding) : null;
        const shouldResolve = direct ? shouldResolveKnownBinding(layer, binding) : !!fallback;
        if (binding && shouldResolve) layer.text = safeDisplayText(resolvedValue);
        if (binding && binding.metricKey && ['metricValue', 'ratioMetricValue'].includes(binding.kind)) {
          const presentation = LOGIC.arrowPresentationForSpec(food, sectionId, LOGIC.specForMetric(sectionId, binding.metricKey));
          layer.color = presentation.textColor;
        }
        if (isQuestion || (direct && shouldResolve)) {
          report.push({
            sectionId,
            layerId: layer.id || '',
            bindingMode: direct ? 'stable layer id' : fallback ? 'section visual-order fallback' : 'unbound',
            boundFoodDataField: binding?.field || binding?.kind || null,
            metricKey: binding?.metricKey || null,
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

  function arrowRowsWithSpecs(layout, sectionId) {
    const rows = clusterArrowRows(layout, sectionId);
    const specs = BINDINGS.arrowRows?.[sectionId] || [];
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
      const rows = arrowRowsWithSpecs(layout, sectionId);
      const expectedRows = BINDINGS.arrowRows?.[sectionId] || [];
      if (!rows.length && expectedRows.length) {
        state.bindingReport.warnings.push({ type: 'arrow', sectionId, message: 'No arrow rows found in selected layout section.' });
      }
      rows.forEach((row, rowIndex) => {
        const rowSpec = row.spec;
        if (!rowSpec) {
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
    state.bindingReport = { text: [], arrows: [], warnings: [] };
    if (!option || !validLayout(option.layout)) return null;
    const layout = cloneLayoutForRender(option);
    syncFoodSprites(layout, food);
    syncFoodText(layout, food);
    syncMacroFills(layout, food);
    state.bindingReport.text = resolveTextBindings(layout, food);
    state.bindingReport.arrows = syncArrowRows(layout, food);
    return layout;
  }

  function safeDisplayText(value) {
    const text = String(value ?? 'N/A');
    if (/^(undefined|null|NaN|\[object Object\])$/i.test(text)) return 'N/A';
    return text;
  }

  function renderCanvas(layout, food) {
    els.displayCanvas.innerHTML = '';
    els.displayCanvas.style.backgroundColor = state.background.color || DEFAULT_BACKGROUND.color;
    updatePixelUnit();

    const bgField = document.createElement('div');
    bgField.className = 'canvas-bg-field';
    const palette = LOGIC.backdropPalette(food);
    bgField.style.background = `radial-gradient(circle at 18% 12%, ${palette.glowA}, transparent 24%), radial-gradient(circle at 82% 16%, ${palette.glowB}, transparent 28%), linear-gradient(180deg, ${palette.top} 0%, ${palette.bottom} 100%)`;
    els.displayCanvas.appendChild(bgField);

    const phoneBg = document.createElement('div');
    phoneBg.className = 'phone-bg';
    els.displayCanvas.appendChild(phoneBg);

    if (!layout) {
      const empty = document.createElement('div');
      empty.className = 'canvas-empty';
      empty.textContent = 'No layout-builder macro layout is available.';
      els.displayCanvas.appendChild(empty);
      return;
    }

    const sectionLayers = getSectionLayers(layout, state.selectedSectionId);
    if (!sectionLayers.length) {
      const empty = document.createElement('div');
      empty.className = 'canvas-empty';
      empty.textContent = 'The selected layout does not contain this macro section.';
      els.displayCanvas.appendChild(empty);
      return;
    }

    const sorted = sectionLayers
      .map((layer, originalIndex) => ({ layer, originalIndex }))
      .sort((a, b) => (Number(a.layer.z) || 0) - (Number(b.layer.z) || 0) || a.originalIndex - b.originalIndex);

    for (const { layer } of sorted) {
      if (layer.visible === false) continue;
      const node = document.createElement(layer.kind === 'sprite' ? 'img' : 'div');
      node.className = `layer-node ${layer.kind}${layer.kind === 'text' ? ' pixel-text' : ''}`;
      node.dataset.layerId = layer.id || '';
      node.dataset.sectionId = state.selectedSectionId;
      node.style.zIndex = String(Number(layer.z) || 0);
      node.style.left = `calc(${Number(layer.x) || 0}px * var(--pixel-unit))`;
      node.style.top = `calc(${Number(layer.y) || 0}px * var(--pixel-unit))`;

      if (layer.kind === 'sprite') {
        renderSpriteNode(node, layer, food);
      } else {
        renderTextNode(node, layer);
      }
      els.displayCanvas.appendChild(node);
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
    node.onerror = () => handleSpriteError(node, layer);
  }

  function renderedSpriteSrc(layer, food) {
    if (isManagedSectionIndicator(layer)) {
      const index = Number(String(layer.id || '').match(/_(\d+)$/)?.[1] || 0) - 1;
      const activeIndex = MACRO_SECTIONS.indexOf(state.selectedSectionId) + 1;
      return LOGIC.sectionIndicatorSpritePath(food, index === activeIndex);
    }
    return LOGIC.canonicalSpritePath(layer.src || layer.fallbackSrc || '');
  }

  function isManagedSectionIndicator(layer) {
    return isSpriteLayer(layer)
      && new RegExp(`^${state.selectedSectionId}_indicator_\\d+$`, 'i').test(String(layer.id || ''))
      && String(layer.src || '').toLowerCase().includes('/section_indicator/');
  }

  function renderTextNode(node, layer) {
    node.textContent = safeDisplayText(layer.text || '');
    node.style.fontSize = `calc(${Number(layer.fontSize) || 6}px * var(--pixel-unit))`;
    node.style.color = layer.color || '';
    node.style.textAlign = layer.align || 'left';
    if (layer.width) node.style.width = `calc(${Number(layer.width)}px * var(--pixel-unit))`;
    const height = Number(layer.textBoxHeight || layer.height || defaultTextLayerHeight(layer));
    if (height) {
      node.style.height = `calc(${height}px * var(--pixel-unit))`;
      node.style.maxHeight = `calc(${height}px * var(--pixel-unit))`;
    }
  }

  function defaultTextLayerHeight(layer) {
    const fontSize = Number(layer?.fontSize) || 6;
    const lines = Math.max(1, String(layer?.text || '').split(/\r\n|\r|\n/).length);
    return Math.max(1, Math.ceil(fontSize * 1.15 * lines));
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

  async function renderBackgroundSprites(food) {
    const field = els.displayCanvas.querySelector('.canvas-bg-field');
    if (!field || !food) return;
    field.innerHTML = '';
    const motion = state.background.motion || DEFAULT_BACKGROUND.motion;
    if (motion.enabled === false) return;

    let pool = [];
    if (motion.mode === 'allFoods') {
      pool = [...state.foods];
    } else if (motion.mode === 'selectedFood') {
      pool = [food];
    } else {
      pool = [food, ...state.foods.filter(item => item.id !== food.id && LOGIC.normalizeFoodType(item.foodType) === LOGIC.normalizeFoodType(food.foodType))];
    }
    if (!pool.length) pool = [food];

    const enriched = await Promise.all(pool.map(async item => {
      const candidates = LOGIC.foodSpriteCandidates(item);
      const hasPrimary = await probeSpriteExists(candidates.primary);
      return {
        food: item,
        src: hasPrimary ? candidates.primary : candidates.fallback,
        fallback: candidates.fallback,
        hasPrimary
      };
    }));
    const real = enriched.filter(item => item.hasPrimary);
    const selectedReal = real.find(item => item.food?.id === food.id);
    const renderPool = selectedReal ? [selectedReal, ...real.filter(item => item.food?.id !== food.id)] : (real.length ? real : enriched);
    const onlyFallbacks = !real.length;
    const density = Math.max(1, Number(motion.density) || DEFAULT_BACKGROUND.motion.density);
    const minDuration = Math.max(4, Number(motion.minDuration) || DEFAULT_BACKGROUND.motion.minDuration);
    const maxDuration = Math.max(minDuration, Number(motion.maxDuration) || DEFAULT_BACKGROUND.motion.maxDuration);
    const minSize = Math.max(12, Number(motion.minSize) || DEFAULT_BACKGROUND.motion.minSize);
    const maxSize = Math.max(minSize, Number(motion.maxSize) || DEFAULT_BACKGROUND.motion.maxSize);
    const drift = Math.max(0, Number(motion.drift) || 0);
    const opacity = Math.min(0.5, Math.max(0.04, Number(motion.opacity) || DEFAULT_BACKGROUND.motion.opacity));

    Array.from({ length: density }).forEach((_, index) => {
      const choice = renderPool[index % renderPool.length] || renderPool[0];
      const img = document.createElement('img');
      img.className = 'bg-sprite';
      img.src = LOGIC.canonicalSpritePath(choice?.src || choice?.fallback || '');
      img.alt = '';
      const progress = density <= 1 ? 0.5 : index / (density - 1);
      const sizeBias = onlyFallbacks ? 0.72 : 1;
      const size = Math.round((minSize + (maxSize - minSize) * ((index % 5) / 4 || 0)) * sizeBias);
      const duration = Math.round(minDuration + (maxDuration - minDuration) * ((index % 7) / 6 || 0) + (onlyFallbacks ? 4 : 0));
      img.style.left = `${8 + progress * 76}%`;
      img.style.top = `${-40 - (index % 5) * 26}px`;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.style.objectFit = 'contain';
      img.style.opacity = String(onlyFallbacks ? Math.min(opacity, 0.12) : opacity);
      img.style.animationDuration = `${duration}s`;
      img.style.animationDelay = `${-(index * 1.7)}s`;
      img.style.setProperty('--drift-x', `${(index % 2 === 0 ? 1 : -1) * Math.max(2, drift - (index % 4) * 2)}px`);
      img.onerror = () => {
        recordSpriteFailure(img.currentSrc || img.src, LOGIC.canonicalSpritePath(choice?.fallback || ''), choice?.food?.name || '');
        if (choice?.fallback) img.src = LOGIC.canonicalSpritePath(choice.fallback);
        else img.remove();
      };
      field.appendChild(img);
    });
  }

  function probeSpriteExists(src) {
    const safeSrc = LOGIC.canonicalSpritePath(src);
    if (!safeSrc) return Promise.resolve(false);
    if (SPRITE_EXISTENCE_CACHE.has(safeSrc)) return SPRITE_EXISTENCE_CACHE.get(safeSrc);
    const promise = new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = safeSrc;
    });
    SPRITE_EXISTENCE_CACHE.set(safeSrc, promise);
    return promise;
  }

  function updatePixelUnit() {
    const width = els.displayCanvas.getBoundingClientRect().width;
    const unit = width > 0 ? width / LOGIC.AUTHOR_GRID.width : 4;
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
      activeFoodTypeMacroRules: LOGIC.activeRules(food || {}).map(rule => ({
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
      ['C. ACTIVE FOOD-TYPE MACRO RULES', logic.activeFoodTypeMacroRules],
      ['D. LIVE METRIC EVALUATION', logic.liveMetricEvaluation],
      ['E. SECTION SCORE CALCULATION', logic.sectionScoreCalculation],
      ['F. LAYOUT BINDING REPORT', logic.layoutBindingReport],
      ['G. SOURCE INFORMATION', logic.sourceInformation]
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
    if (!title.startsWith('F.')) return [];
    const flags = [];
    const text = payload.textPlaceholders || [];
    const arrows = payload.arrowLayers || [];
    if (text.some(item => item.unbound)) flags.push('unbound text placeholders');
    if (arrows.some(item => item.unbound)) flags.push('unbound arrow slots');
    if ((payload.warnings || []).some(item => item.type === 'sprite')) flags.push('missing sprite assets');
    if (text.some(item => item.overflowWarning)) flags.push('text overflow');
    return flags;
  }

  function updateBackgroundControls() {
    const motion = state.background.motion;
    els.bgColor.value = state.background.color || DEFAULT_BACKGROUND.color;
    els.bgMotionEnabled.checked = motion.enabled !== false;
    els.bgMotionMode.value = motion.mode || 'foodType';
    els.bgMotionDensity.value = String(motion.density ?? DEFAULT_BACKGROUND.motion.density);
    els.bgMotionOpacity.value = String(motion.opacity ?? DEFAULT_BACKGROUND.motion.opacity);
    els.bgMotionMinDuration.value = String(motion.minDuration ?? DEFAULT_BACKGROUND.motion.minDuration);
    els.bgMotionMaxDuration.value = String(motion.maxDuration ?? DEFAULT_BACKGROUND.motion.maxDuration);
    els.bgMotionMinSize.value = String(motion.minSize ?? DEFAULT_BACKGROUND.motion.minSize);
    els.bgMotionMaxSize.value = String(motion.maxSize ?? DEFAULT_BACKGROUND.motion.maxSize);
    els.bgMotionDrift.value = String(motion.drift ?? DEFAULT_BACKGROUND.motion.drift);
  }

  async function renderAll() {
    const token = ++renderToken.value;
    const layoutOption = selectedLayoutOption();
    const food = await loadSelectedFood();
    if (token !== renderToken.value) return;

    const layout = resolveLayout(layoutOption, food);
    state.renderedLayout = layout;
    renderCanvas(layout, food);
    await renderBackgroundSprites(food);
    updateTextFitReport();
    renderProgrammerPanel(food, layoutOption);
    renderCanvasMeta(food, layoutOption);
    updateStatus(food, layoutOption);
  }

  function renderCanvasMeta(food, layoutOption) {
    const section = SECTION_LABELS[state.selectedSectionId] || state.selectedSectionId;
    const layoutName = layoutOption?.name || 'No layout';
    els.canvasMeta.textContent = `${food?.name || 'No food'} · ${section} · ${layoutName}`;
  }

  function updateStatus(food, layoutOption) {
    const warnings = [
      ...state.bindingReport.text.filter(item => item.unbound),
      ...state.bindingReport.arrows.filter(item => item.unbound),
      ...state.bindingReport.text.filter(item => item.overflowWarning),
      ...state.spriteFailures.values()
    ];
    const warningText = warnings.length ? ` · ${warnings.length} binding/sprite warning${warnings.length === 1 ? '' : 's'}` : '';
    els.statusLine.textContent = layoutOption
      ? `${food?.name || 'No food'} rendered from ${layoutOption.name}${warningText}`
      : 'No layout-builder layout available';
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
    els.bgMotionEnabled.addEventListener('change', async () => {
      state.background.motion.enabled = !!els.bgMotionEnabled.checked;
      writeTestState();
      await renderAll();
    });
    els.bgMotionMode.addEventListener('change', async () => {
      state.background.motion.mode = els.bgMotionMode.value || 'foodType';
      writeTestState();
      await renderAll();
    });
    [
      ['bgMotionDensity', 'density', Number],
      ['bgMotionOpacity', 'opacity', Number],
      ['bgMotionMinDuration', 'minDuration', Number],
      ['bgMotionMaxDuration', 'maxDuration', Number],
      ['bgMotionMinSize', 'minSize', Number],
      ['bgMotionMaxSize', 'maxSize', Number],
      ['bgMotionDrift', 'drift', Number]
    ].forEach(([id, key, caster]) => {
      els[id].addEventListener('input', async () => {
        state.background.motion[key] = caster(els[id].value);
        writeTestState();
        await renderAll();
      });
    });
    window.addEventListener('resize', updatePixelUnit);
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
    state.selectedFoodId = saved.selectedFoodId && state.foods.some(food => food.id === saved.selectedFoodId)
      ? saved.selectedFoodId
      : state.foods[0]?.id || '';
    state.selectedSectionId = MACRO_SECTIONS.includes(saved.selectedSectionId) ? saved.selectedSectionId : 'fats';
    state.selectedLayoutKey = saved.selectedLayoutKey || '';
    state.background = {
      ...LOGIC.clone(DEFAULT_BACKGROUND),
      ...(saved.background || {}),
      motion: {
        ...DEFAULT_BACKGROUND.motion,
        ...((saved.background || {}).motion || {})
      }
    };
    updateBackgroundControls();
    refreshLayoutOptions();
    renderFoodList();
    renderSections();
    bindEvents();
    await renderAll();
  }

  window.FOODRANKED_DISPLAY_BUILDER_TEST = {
    state,
    refreshLayoutOptions,
    renderAll,
    storageKeys: {
      read: [LAYOUT_BUILDER_WORKING_KEY, LAYOUT_BUILDER_SAVED_KEY, LAYOUT_BUILDER_FOOD_LAYOUTS_KEY],
      write: [TEST_STATE_KEY]
    }
  };

  init().catch(error => {
    console.error(error);
    els.statusLine.textContent = 'Food data or layout render failed.';
  });
})();
