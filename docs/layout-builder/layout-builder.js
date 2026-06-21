(function () {
  const SECTIONS = [
    { id: 'intro', label: '1. Intro' },
    { id: 'fats', label: '2. Fats' },
    { id: 'carbs', label: '3. Carbs' },
    { id: 'protein', label: '4. Protein' },
    { id: 'vitamins', label: '5. Vitamins' },
    { id: 'minerals', label: '6. Minerals' },
    { id: 'pros', label: '7. Pros' },
    { id: 'cons', label: '8. Cons' },
    { id: 'outro', label: '9. Outro' }
  ];

  const AUTHOR_GRID = { width: 135, height: 240 };
  const SCALE = 4;
  const SECTION_INDICATOR_COUNT = SECTIONS.length;
  const SECTION_INDICATOR_LAYOUT = { normalSize: 10, highlightedSize: 12 };
  const LOCAL_STORAGE_KEY = 'foodranked-layout-builder-universal-layout-v1';
  const DISPLAY_BUILDER_STORAGE_KEY = 'foodranked-display-builder-v4';
  const DISPLAY_BUILDER_REPO_LAYOUT_VERSION = '20260620-layout-restore-v1';
  const LAYOUT_BUILDER_VERSION = '20260621-layout-builder-v2';
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

  const DEFAULT_LAYOUT = window.FOODRANKED_DISPLAY_BUILDER_DEFAULT_LAYOUT || {
    canvas: { ...AUTHOR_GRID, background: '#d6d6d6', showGrid: true },
    selectedSectionId: 'intro',
    sections: Object.fromEntries(SECTIONS.map(section => [section.id, { layers: [] }]))
  };

  const els = {
    status: document.getElementById('layoutStatus'),
    sectionList: document.getElementById('sectionList'),
    layerList: document.getElementById('layerList'),
    layerFilter: document.getElementById('layerFilter'),
    sectionTitle: document.getElementById('sectionTitle'),
    canvasMeta: document.getElementById('canvasMeta'),
    canvas: document.getElementById('canvas'),
    showGrid: document.getElementById('showGrid'),
    showBounds: document.getElementById('showBounds'),
    showHidden: document.getElementById('showHidden'),
    emptyInspector: document.getElementById('emptyInspector'),
    inspector: document.getElementById('inspector'),
    constraintPanel: document.getElementById('constraintPanel'),
    propLabel: document.getElementById('propLabel'),
    propText: document.getElementById('propText'),
    propX: document.getElementById('propX'),
    propY: document.getElementById('propY'),
    propWidth: document.getElementById('propWidth'),
    propHeight: document.getElementById('propHeight'),
    propZ: document.getElementById('propZ'),
    propFontSize: document.getElementById('propFontSize'),
    propVisible: document.getElementById('propVisible'),
    propAlign: document.getElementById('propAlign'),
    textValueWrap: document.getElementById('textValueWrap'),
    minX: document.getElementById('minX'),
    maxX: document.getElementById('maxX'),
    minY: document.getElementById('minY'),
    maxY: document.getElementById('maxY'),
    minWidth: document.getElementById('minWidth'),
    maxWidth: document.getElementById('maxWidth'),
    minHeight: document.getElementById('minHeight'),
    maxHeight: document.getElementById('maxHeight'),
    fitBoundsToCanvas: document.getElementById('fitBoundsToCanvas'),
    lockBoundsToLayer: document.getElementById('lockBoundsToLayer'),
    clearBounds: document.getElementById('clearBounds'),
    addTextLayer: document.getElementById('addTextLayer'),
    duplicateLayer: document.getElementById('duplicateLayer'),
    deleteLayer: document.getElementById('deleteLayer'),
    saveLocal: document.getElementById('saveLocal'),
    saveDisplayBuilder: document.getElementById('saveDisplayBuilder'),
    resetFromRepo: document.getElementById('resetFromRepo'),
    copyJson: document.getElementById('copyJson'),
    applyJson: document.getElementById('applyJson'),
    layoutJson: document.getElementById('layoutJson')
  };

  const state = {
    layout: loadInitialLayout(),
    selectedSectionId: null,
    selectedLayerId: null,
    drag: null
  };

  state.selectedSectionId = state.layout.selectedSectionId || 'intro';

  function clone(value) {
    return structuredClone(value);
  }

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function loadInitialLayout() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return normalizeLayout(JSON.parse(stored));
    } catch {
      // Ignore invalid local drafts and fall back to the repo default.
    }
    return normalizeLayout(clone(DEFAULT_LAYOUT));
  }

  function normalizeLayout(layout) {
    const next = {
      ...clone(layout || DEFAULT_LAYOUT),
      canvas: {
        width: AUTHOR_GRID.width,
        height: AUTHOR_GRID.height,
        background: layout?.canvas?.background || DEFAULT_LAYOUT.canvas?.background || '#d6d6d6',
        showGrid: layout?.canvas?.showGrid ?? true,
        ...(layout?.canvas || {})
      },
      sections: { ...(layout?.sections || {}) },
      meta: { ...(layout?.meta || {}) }
    };
    next.canvas.width = AUTHOR_GRID.width;
    next.canvas.height = AUTHOR_GRID.height;
    for (const section of SECTIONS) {
      const layers = Array.isArray(next.sections?.[section.id]?.layers) ? next.sections[section.id].layers : [];
      next.sections[section.id] = { layers: layers.map(normalizeLayer) };
    }
    next.selectedSectionId = next.selectedSectionId || 'intro';
    return next;
  }

  function normalizeLayer(layer) {
    const next = { ...layer };
    next.id = String(next.id || `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    next.kind = next.kind === 'text' ? 'text' : 'sprite';
    next.label = String(next.label || next.id);
    next.x = finiteNumber(next.x);
    next.y = finiteNumber(next.y);
    next.z = finiteNumber(next.z);
    next.width = Math.max(1, finiteNumber(next.width, next.kind === 'text' ? 42 : 12));
    next.height = Math.max(1, finiteNumber(next.height, next.kind === 'text' ? 7 : 12));
    next.visible = next.visible !== false;
    if (next.kind === 'text') {
      next.text = String(next.text || 'TEXT');
      next.fontSize = Math.max(1, finiteNumber(next.fontSize, 4));
      next.align = ['left', 'center', 'right'].includes(next.align) ? next.align : 'left';
    }
    if (next.constraints && typeof next.constraints === 'object') {
      next.constraints = normalizeConstraints(next.constraints);
    }
    clampLayer(next);
    return next;
  }

  function normalizeConstraints(raw) {
    const out = {};
    for (const key of constraintKeys()) {
      if (raw[key] === '' || raw[key] === null || raw[key] === undefined) continue;
      const value = Number(raw[key]);
      if (Number.isFinite(value)) out[key] = value;
    }
    return out;
  }

  function constraintKeys() {
    return ['minX', 'maxX', 'minY', 'maxY', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'];
  }

  function currentSection() {
    return SECTIONS.find(section => section.id === state.selectedSectionId) || SECTIONS[0];
  }

  function currentLayers() {
    const section = state.layout.sections[state.selectedSectionId];
    if (!section || !Array.isArray(section.layers)) return [];
    return section.layers;
  }

  function selectedLayer() {
    return currentLayers().find(layer => layer.id === state.selectedLayerId) || null;
  }

  function layerSort(a, b) {
    return (finiteNumber(a.z) - finiteNumber(b.z)) || String(a.id).localeCompare(String(b.id));
  }

  function resolveSpriteSrc(src) {
    const raw = String(src || '');
    if (!raw) return '';
    if (/^(data:|https?:|blob:)/i.test(raw)) return raw;
    if (raw.startsWith('./sprites/')) return `../app/${raw.slice(2)}`;
    if (raw.startsWith('sprites/')) return `../app/${raw}`;
    if (raw.startsWith('../app/')) return raw;
    return raw;
  }

  function canvasPixel(value) {
    return `calc(${Number(value) || 0}px * var(--pixel-unit))`;
  }

  function normalizeFoodType(foodType) {
    const raw = String(foodType || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
    const aliases = {
      meat: 'meats',
      vegetable: 'vegetables',
      fruit: 'fruits',
      grain: 'grains',
      legume: 'legumes',
      tuber: 'tubers',
      nut: 'nuts',
      seed: 'seeds',
      oil: 'oils-and-fats',
      fat: 'oils-and-fats',
      oils: 'oils-and-fats',
      fats: 'oils-and-fats',
      'oil-fat': 'oils-and-fats',
      'oils-and-fat': 'oils-and-fats'
    };
    return aliases[raw] || raw || 'meats';
  }

  function foodTypeFromSpriteSlug(slug) {
    const normalized = String(slug || '').trim().toLowerCase().replace(/-/g, '_');
    const foodTypes = {
      vegetable: 'vegetables',
      fruit: 'fruits',
      grain: 'grains',
      legume: 'legumes',
      tuber: 'tubers',
      nut: 'nuts',
      seed: 'seeds',
      meat: 'meats',
      dairy: 'dairy',
      oil_fat: 'oils-and-fats',
      misc: 'misc'
    };
    return foodTypes[normalized] || '';
  }

  function inferFoodTypeFromLayerAssets() {
    const sections = Object.values(state.layout?.sections || {});
    for (const section of sections) {
      const layers = Array.isArray(section.layers) ? section.layers : [];
      for (const layer of layers) {
        const haystack = `${layer.src || ''} ${layer.fallbackSrc || ''}`;
        const indicator = haystack.match(/\/ui\/section_indicator\/([^/]+?)_(?:highlighted_)?section_indicator\.png/i);
        if (indicator) return foodTypeFromSpriteSlug(indicator[1]);
        const header = haystack.match(/\/header\/(?:food_type_plate|food_plate|calorie_bubble)\/([^/]+?)_(?:type_plate|food_plate|calorie_bubble)\.png/i);
        if (header) return foodTypeFromSpriteSlug(header[1]);
      }
    }
    return '';
  }

  function selectedFoodType() {
    return normalizeFoodType(state.layout.foodType || state.layout.selectedFoodType || state.layout.selectedFood?.foodType || inferFoodTypeFromLayerAssets() || 'meats');
  }

  function backdropPalette() {
    return BACKDROP_PALETTES[selectedFoodType()] || BACKDROP_PALETTES.misc;
  }

  function typeSpriteSlug(foodType = selectedFoodType()) {
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
    return slugs[normalizeFoodType(foodType)] || 'meat';
  }

  function sectionIndicatorSpritePath(highlighted = false) {
    return `./sprites/ui/section_indicator/${typeSpriteSlug()}_${highlighted ? 'highlighted_' : ''}section_indicator.png`;
  }

  function isHighlightedSectionIndicatorSrc(src = '') {
    return /\/ui\/section_indicator\/[^/]+_highlighted_section_indicator\.png$/i.test(String(src));
  }

  function isSectionIndicatorSpriteLayer(layer) {
    if (!layer || layer.kind !== 'sprite') return false;
    const fingerprint = `${layer.src || ''} ${layer.fallbackSrc || ''} ${layer.label || ''}`.toLowerCase();
    return fingerprint.includes('/ui/section_indicator/') || /section indicator/.test(fingerprint);
  }

  function sectionIndicatorLayers() {
    return currentLayers()
      .filter(isSectionIndicatorSpriteLayer)
      .sort((a, b) => (finiteNumber(a.x) - finiteNumber(b.x)) || (finiteNumber(a.y) - finiteNumber(b.y)) || String(a.id).localeCompare(String(b.id)))
      .slice(0, SECTION_INDICATOR_COUNT);
  }

  function activeSectionIndicatorIndex() {
    return Math.max(0, SECTIONS.findIndex(section => section.id === state.selectedSectionId));
  }

  function isActiveSectionIndicatorLayer(layer) {
    if (!isSectionIndicatorSpriteLayer(layer)) return false;
    const indicators = sectionIndicatorLayers();
    const index = indicators.findIndex(item => item === layer || item.id === layer.id);
    return index === activeSectionIndicatorIndex();
  }

  function renderedSectionIndicatorSrc(layer) {
    if (!isSectionIndicatorSpriteLayer(layer)) return layer?.src || '';
    return sectionIndicatorSpritePath(isActiveSectionIndicatorLayer(layer));
  }

  function setStatus(message) {
    els.status.textContent = message;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampLayer(layer) {
    const c = layer.constraints || {};
    const minWidth = c.minWidth ?? 1;
    const maxWidth = c.maxWidth ?? AUTHOR_GRID.width;
    const minHeight = c.minHeight ?? 1;
    const maxHeight = c.maxHeight ?? AUTHOR_GRID.height;
    layer.width = clamp(finiteNumber(layer.width, 1), minWidth, maxWidth);
    layer.height = clamp(finiteNumber(layer.height, 1), minHeight, maxHeight);

    const minX = c.minX ?? 0;
    const maxX = c.maxX ?? (AUTHOR_GRID.width - layer.width);
    const minY = c.minY ?? 0;
    const maxY = c.maxY ?? (AUTHOR_GRID.height - layer.height);
    layer.x = clamp(finiteNumber(layer.x), Math.min(minX, maxX), Math.max(minX, maxX));
    layer.y = clamp(finiteNumber(layer.y), Math.min(minY, maxY), Math.max(minY, maxY));
  }

  function render() {
    renderSections();
    renderCanvas();
    renderLayerList();
    renderInspector();
    updateJson();
  }

  function renderSections() {
    els.sectionList.innerHTML = '';
    for (const section of SECTIONS) {
      const count = state.layout.sections[section.id]?.layers?.length || 0;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `section-button${section.id === state.selectedSectionId ? ' active' : ''}`;
      button.innerHTML = `<span class="layer-name">${escapeHtml(section.label)}</span><span class="layer-kind">${count}</span>`;
      button.addEventListener('click', () => {
        state.selectedSectionId = section.id;
        state.layout.selectedSectionId = section.id;
        state.selectedLayerId = currentLayers()[0]?.id || null;
        render();
      });
      els.sectionList.appendChild(button);
    }
  }

  function renderLayerList() {
    const query = String(els.layerFilter.value || '').trim().toLowerCase();
    els.layerList.innerHTML = '';
    currentLayers()
      .filter(layer => {
        if (!query) return true;
        return `${layer.id} ${layer.label} ${layer.text || ''} ${layer.src || ''}`.toLowerCase().includes(query);
      })
      .sort(layerSort)
      .forEach(layer => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `layer-button${layer.id === state.selectedLayerId ? ' active' : ''}`;
        const marker = layer.visible === false ? 'hidden' : layer.kind;
        button.innerHTML = `<span class="layer-name">${escapeHtml(layer.label || layer.id)}</span><span class="layer-kind">${escapeHtml(marker)}</span>`;
        button.addEventListener('click', () => {
          state.selectedLayerId = layer.id;
          render();
        });
        els.layerList.appendChild(button);
      });
  }

  function renderCanvas() {
    els.canvas.innerHTML = '';
    els.canvas.style.backgroundColor = state.layout.canvas.background || '#d6d6d6';
    els.canvas.classList.toggle('hide-grid', !els.showGrid.checked);
    els.sectionTitle.textContent = currentSection().label;
    els.canvasMeta.textContent = `${currentLayers().length} layers | ${AUTHOR_GRID.width} x ${AUTHOR_GRID.height}`;

    const bgField = document.createElement('div');
    bgField.className = 'canvas-bg-field';
    const palette = backdropPalette();
    bgField.style.background = `radial-gradient(circle at 18% 12%, ${palette.glowA}, transparent 24%), radial-gradient(circle at 82% 16%, ${palette.glowB}, transparent 28%), linear-gradient(180deg, ${palette.top} 0%, ${palette.bottom} 100%)`;
    els.canvas.appendChild(bgField);

    const phoneBg = document.createElement('div');
    phoneBg.className = 'phone-bg';
    els.canvas.appendChild(phoneBg);

    const layers = currentLayers().slice().sort(layerSort);
    for (const layer of layers) {
      if (layer.visible === false && !els.showHidden.checked) continue;
      if (els.showBounds.checked && layer.constraints) addBoundsBox(layer, layer.id === state.selectedLayerId);
      const node = layer.kind === 'text' ? renderTextLayer(layer) : renderSpriteLayer(layer);
      node.dataset.layerId = layer.id;
      node.classList.toggle('selected', layer.id === state.selectedLayerId);
      node.classList.toggle('hidden-layer', layer.visible === false);
      node.addEventListener('pointerdown', event => startDrag(event, layer));
      node.addEventListener('click', event => {
        event.stopPropagation();
        state.selectedLayerId = layer.id;
        render();
      });
      els.canvas.appendChild(node);
    }
  }

  function layerStyle(node, layer, options = {}) {
    node.classList.add('layout-layer');
    const x = finiteNumber(layer.x) + finiteNumber(options.offsetX);
    const y = finiteNumber(layer.y) + finiteNumber(options.offsetY);
    node.style.left = canvasPixel(x);
    node.style.top = canvasPixel(y);
    if (options.width != null || layer.width) node.style.width = canvasPixel(options.width ?? layer.width);
    if (options.includeHeight !== false && (options.height != null || layer.height)) {
      node.style.height = canvasPixel(options.height ?? layer.height);
    }
    node.style.zIndex = String(finiteNumber(layer.z) + finiteNumber(options.zOffset));
  }

  function renderSpriteLayer(layer) {
    const img = document.createElement('img');
    const isIndicator = isSectionIndicatorSpriteLayer(layer);
    const renderedSrc = isIndicator ? renderedSectionIndicatorSrc(layer) : (layer.src || layer.fallbackSrc);
    const isHighlightedIndicator = isIndicator && isHighlightedSectionIndicatorSrc(renderedSrc);
    const indicatorSize = isHighlightedIndicator ? SECTION_INDICATOR_LAYOUT.highlightedSize : SECTION_INDICATOR_LAYOUT.normalSize;
    img.className = 'layer-node sprite sprite-layer';
    img.alt = layer.label || layer.id;
    img.draggable = false;
    img.src = resolveSpriteSrc(renderedSrc);
    if (layer.fallbackSrc) {
      img.addEventListener('error', () => {
        const fallback = resolveSpriteSrc(layer.fallbackSrc);
        if (fallback && img.src !== fallback) img.src = fallback;
      }, { once: true });
    }
    layerStyle(img, layer, {
      offsetX: isHighlightedIndicator ? -1 : 0,
      offsetY: isHighlightedIndicator ? -1 : 0,
      zOffset: isHighlightedIndicator ? 10 : 0,
      width: isIndicator ? indicatorSize : layer.width,
      height: isIndicator ? indicatorSize : layer.height
    });
    if (layer.preserveAspect && layer.aspectRatio) img.style.aspectRatio = String(layer.aspectRatio);
    img.style.objectFit = layer.preserveAspect ? 'contain' : 'fill';
    img.style.objectPosition = layer.preserveAspect ? 'center' : '';
    if (layer.flipY) {
      img.style.transform = 'scaleY(-1)';
      img.style.transformOrigin = 'center';
    }
    return img;
  }

  function renderTextLayer(layer) {
    const div = document.createElement('div');
    div.className = 'layer-node text text-layer pixel-text';
    div.textContent = layer.text || '';
    div.style.fontSize = canvasPixel(finiteNumber(layer.fontSize, 4));
    div.style.textAlign = layer.align || 'left';
    if (layer.color) div.style.color = layer.color;
    layerStyle(div, layer, { includeHeight: false });
    return div;
  }

  function addBoundsBox(layer, selected) {
    const box = document.createElement('div');
    box.className = `bounds-box${selected ? '' : ' all-bounds'}`;
    const c = layer.constraints || {};
    const minX = c.minX ?? layer.x;
    const maxX = c.maxX ?? layer.x;
    const minY = c.minY ?? layer.y;
    const maxY = c.maxY ?? layer.y;
    const maxWidth = c.maxWidth ?? layer.width;
    const maxHeight = c.maxHeight ?? layer.height;
    box.style.left = canvasPixel(minX);
    box.style.top = canvasPixel(minY);
    box.style.width = canvasPixel(Math.max(1, (maxX - minX) + maxWidth));
    box.style.height = canvasPixel(Math.max(1, (maxY - minY) + maxHeight));
    box.style.zIndex = selected ? '999' : '998';
    els.canvas.appendChild(box);
  }

  function renderInspector() {
    const layer = selectedLayer();
    els.emptyInspector.hidden = !!layer;
    els.inspector.hidden = !layer;
    els.constraintPanel.hidden = !layer;
    if (!layer) return;

    els.propLabel.value = layer.label || '';
    els.propText.value = layer.text || '';
    els.propX.value = layer.x;
    els.propY.value = layer.y;
    els.propWidth.value = layer.width;
    els.propHeight.value = layer.height;
    els.propZ.value = layer.z;
    els.propFontSize.value = layer.kind === 'text' ? (layer.fontSize || 4) : '';
    els.propVisible.value = String(layer.visible !== false);
    els.propAlign.value = layer.align || 'left';
    els.textValueWrap.hidden = layer.kind !== 'text';
    els.propFontSize.disabled = layer.kind !== 'text';
    els.propAlign.disabled = layer.kind !== 'text';

    const c = layer.constraints || {};
    for (const key of constraintKeys()) {
      els[key].value = c[key] ?? '';
    }
  }

  function updateJson() {
    els.layoutJson.value = JSON.stringify(prepareLayoutForSave(), null, 2);
  }

  function prepareLayoutForSave() {
    const layout = normalizeLayout(clone(state.layout));
    layout.selectedSectionId = state.selectedSectionId;
    layout.meta = {
      ...(layout.meta || {}),
      layoutBuilderVersion: LAYOUT_BUILDER_VERSION
    };
    return layout;
  }

  function saveLocal() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prepareLayoutForSave()));
    setStatus('Saved locally');
  }

  function saveForDisplayBuilder() {
    const layout = prepareLayoutForSave();
    layout.meta = {
      ...(layout.meta || {}),
      repoLayoutVersion: DISPLAY_BUILDER_REPO_LAYOUT_VERSION,
      layoutBuilderVersion: LAYOUT_BUILDER_VERSION
    };
    localStorage.setItem(DISPLAY_BUILDER_STORAGE_KEY, JSON.stringify(layout));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
    setStatus('Display builder layout saved');
  }

  function startDrag(event, layer) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    state.selectedLayerId = layer.id;
    state.drag = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layer.x,
      startY: layer.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    render();
  }

  function continueDrag(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) return;
    const layer = selectedLayer();
    if (!layer) return;
    const dx = Math.round((event.clientX - state.drag.startClientX) / SCALE);
    const dy = Math.round((event.clientY - state.drag.startClientY) / SCALE);
    layer.x = state.drag.startX + dx;
    layer.y = state.drag.startY + dy;
    clampLayer(layer);
    renderCanvas();
    renderInspector();
    updateJson();
  }

  function endDrag(event) {
    if (!state.drag || event.pointerId !== state.drag.pointerId) return;
    state.drag = null;
    render();
  }

  function updateSelectedLayer(prop, value) {
    const layer = selectedLayer();
    if (!layer) return;
    if (['x', 'y', 'width', 'height', 'z', 'fontSize'].includes(prop)) {
      layer[prop] = finiteNumber(value, layer[prop] || 0);
    } else if (prop === 'visible') {
      layer.visible = value === 'true';
    } else {
      layer[prop] = value;
    }
    clampLayer(layer);
    render();
  }

  function updateConstraint(key, value) {
    const layer = selectedLayer();
    if (!layer) return;
    layer.constraints = normalizeConstraints({ ...(layer.constraints || {}), [key]: value });
    if (!Object.keys(layer.constraints).length) delete layer.constraints;
    clampLayer(layer);
    render();
  }

  function fitBoundsToCanvas() {
    const layer = selectedLayer();
    if (!layer) return;
    layer.constraints = {
      minX: 0,
      maxX: Math.max(0, AUTHOR_GRID.width - layer.width),
      minY: 0,
      maxY: Math.max(0, AUTHOR_GRID.height - layer.height),
      minWidth: 1,
      maxWidth: AUTHOR_GRID.width,
      minHeight: 1,
      maxHeight: AUTHOR_GRID.height
    };
    render();
  }

  function lockBoundsToLayer() {
    const layer = selectedLayer();
    if (!layer) return;
    layer.constraints = {
      minX: layer.x,
      maxX: layer.x,
      minY: layer.y,
      maxY: layer.y,
      minWidth: layer.width,
      maxWidth: layer.width,
      minHeight: layer.height,
      maxHeight: layer.height
    };
    render();
  }

  function addTextLayer() {
    const layers = currentLayers();
    const topZ = layers.reduce((max, layer) => Math.max(max, finiteNumber(layer.z)), 0) + 1;
    const layer = normalizeLayer({
      id: `layout_text_${Date.now().toString(36)}`,
      kind: 'text',
      label: 'Layout text slot',
      text: 'TEXT',
      x: 12,
      y: 64,
      z: topZ,
      width: 54,
      height: 8,
      fontSize: 4,
      align: 'left',
      visible: true
    });
    layers.push(layer);
    state.selectedLayerId = layer.id;
    render();
  }

  function duplicateLayer() {
    const layer = selectedLayer();
    if (!layer) return;
    const copy = normalizeLayer({
      ...clone(layer),
      id: `${layer.id}_copy_${Date.now().toString(36)}`,
      label: `${layer.label || layer.id} copy`,
      x: layer.x + 2,
      y: layer.y + 2,
      z: finiteNumber(layer.z) + 1
    });
    currentLayers().push(copy);
    state.selectedLayerId = copy.id;
    render();
  }

  function deleteLayer() {
    const layers = currentLayers();
    const index = layers.findIndex(layer => layer.id === state.selectedLayerId);
    if (index === -1) return;
    layers.splice(index, 1);
    state.selectedLayerId = layers[Math.min(index, layers.length - 1)]?.id || null;
    render();
  }

  function nudgeSelected(dx, dy) {
    const layer = selectedLayer();
    if (!layer) return;
    layer.x += dx;
    layer.y += dy;
    clampLayer(layer);
    render();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function bindEvents() {
    els.canvas.addEventListener('click', () => {
      state.selectedLayerId = null;
      render();
    });
    els.canvas.addEventListener('pointermove', continueDrag);
    els.canvas.addEventListener('pointerup', endDrag);
    els.canvas.addEventListener('pointercancel', endDrag);
    els.canvas.addEventListener('keydown', event => {
      const step = event.shiftKey ? 10 : 1;
      const moves = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step]
      };
      if (moves[event.key]) {
        event.preventDefault();
        nudgeSelected(...moves[event.key]);
      }
      if (event.key === 'Delete' || event.key === 'Backspace') deleteLayer();
    });

    els.layerFilter.addEventListener('input', renderLayerList);
    els.showGrid.addEventListener('change', renderCanvas);
    els.showBounds.addEventListener('change', renderCanvas);
    els.showHidden.addEventListener('change', renderCanvas);

    [
      ['propLabel', 'label'],
      ['propText', 'text'],
      ['propX', 'x'],
      ['propY', 'y'],
      ['propWidth', 'width'],
      ['propHeight', 'height'],
      ['propZ', 'z'],
      ['propFontSize', 'fontSize'],
      ['propVisible', 'visible'],
      ['propAlign', 'align']
    ].forEach(([id, prop]) => {
      els[id].addEventListener('input', () => updateSelectedLayer(prop, els[id].value));
      els[id].addEventListener('change', () => updateSelectedLayer(prop, els[id].value));
    });

    for (const key of constraintKeys()) {
      els[key].addEventListener('input', () => updateConstraint(key, els[key].value));
      els[key].addEventListener('change', () => updateConstraint(key, els[key].value));
    }

    els.fitBoundsToCanvas.addEventListener('click', fitBoundsToCanvas);
    els.lockBoundsToLayer.addEventListener('click', lockBoundsToLayer);
    els.clearBounds.addEventListener('click', () => {
      const layer = selectedLayer();
      if (!layer) return;
      delete layer.constraints;
      render();
    });
    els.addTextLayer.addEventListener('click', addTextLayer);
    els.duplicateLayer.addEventListener('click', duplicateLayer);
    els.deleteLayer.addEventListener('click', deleteLayer);
    els.saveLocal.addEventListener('click', saveLocal);
    els.saveDisplayBuilder.addEventListener('click', saveForDisplayBuilder);
    els.resetFromRepo.addEventListener('click', () => {
      state.layout = normalizeLayout(clone(DEFAULT_LAYOUT));
      state.selectedSectionId = state.layout.selectedSectionId || 'intro';
      state.selectedLayerId = null;
      setStatus('Repo default loaded');
      render();
    });
    els.copyJson.addEventListener('click', async () => {
      await navigator.clipboard.writeText(els.layoutJson.value);
      setStatus('JSON copied');
    });
    els.applyJson.addEventListener('click', () => {
      try {
        state.layout = normalizeLayout(JSON.parse(els.layoutJson.value));
        state.selectedSectionId = state.layout.selectedSectionId || 'intro';
        state.selectedLayerId = null;
        setStatus('JSON applied');
        render();
      } catch (error) {
        setStatus(`Invalid JSON: ${error.message}`);
      }
    });
  }

  bindEvents();
  render();
})();
