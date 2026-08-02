(function () {
  const STORAGE = Object.freeze({
    productionDatabase: 'foodranked-production-database-v1',
    layoutWorking: 'foodranked-layout-builder-v4',
    layoutFoodLayouts: 'foodranked-layout-builder-food-layouts-v1',
    layoutSavedLayouts: 'foodranked-layout-builder-sprite-layouts-v1',
    dbv2State: 'foodranked-display-builder-v2-state-v1',
    dbv2Placement: 'foodranked-display-builder-v2-placement-layouts-v1',
    vbv2State: 'foodranked-video-builder-v2-state-v1',
    canonicalLayoutFingerprint: 'foodranked-studio-canonical-layout-fingerprint-v1'
  });
  const LAYOUT_STATE_KEYS = [STORAGE.layoutWorking];
  const BACKUP_STORAGE_KEYS = [
    STORAGE.productionDatabase,
    ...LAYOUT_STATE_KEYS,
    STORAGE.dbv2State,
    STORAGE.dbv2Placement,
    STORAGE.vbv2State
  ];
  const QUOTA_HEAVY_LAYOUT_PREFIXES = [
    'foodranked-layout-builder-before-save',
    'foodranked-layout-builder-before-macro-arrow-sync',
    'foodranked-layout-builder-before-intro-header-sync',
    'foodranked-layout-builder-before-micro-bar-completion'
  ];
  const QUOTA_HEAVY_LAYOUT_KEYS = [
    STORAGE.layoutSavedLayouts,
    STORAGE.layoutFoodLayouts,
    'foodranked-layout-builder-save-backups-v1',
    'foodranked-layout-builder-macro-arrow-sync-backups-v1',
    'foodranked-layout-builder-intro-header-sync-backups-v1',
    'foodranked-layout-builder-micro-bar-completion-backups-v1'
  ];
  const STALE_LAYOUT_KEYS = [
    'foodranked-display-builder-v4',
    'foodranked-display-builder-food-layouts-v1',
    'foodranked-display-builder-sprite-layouts-v1',
    'foodranked-display-builder-state-v1',
    'foodranked-display-builder-test-v1',
    'foodranked-video-builder-v1',
    'foodranked-video-builder-state-v1',
    STORAGE.layoutFoodLayouts,
    'foodranked-layout-builder-v3',
    'foodranked-layout-builder-sprite-layouts'
  ];
  const PLACEMENT_EXPORT_TIMEOUT_MS = 30000;
  const PLACEMENT_EXPORT_POLL_MS = 250;
  const REVOKED_LAYOUT_SEED_VERSIONS = new Set(['20260801-current-builder-layout-v1']);
  const REVOKED_LAYOUT_SEED_SOURCES = new Set(['docs/layout-builder/canonical-test-layout.js']);
  const REVOKED_LAYOUT_SEED_IDS = new Set(['layout_test_current_builder_20260801']);
  const LOCKED_LAYOUT_PRESET_NAMES = ['test 1', 'test 2', 'test 3', 'test 4', 'test 5'];
  const LOCKED_LAYOUT_PRESET_NAME_SET = new Set(LOCKED_LAYOUT_PRESET_NAMES);
  const STUDIO_CANONICAL_LOCK_VERSION = '20260801-studio-universal-layout-json-v1';

  const els = {
    foodSearch: document.getElementById('foodSearch'),
    foodResults: document.getElementById('foodResults'),
    toolNav: document.getElementById('toolNav'),
    systemStatus: document.getElementById('systemStatus'),
    activeFoodType: document.getElementById('activeFoodType'),
    activeTitle: document.getElementById('activeTitle'),
    openTool: document.getElementById('openTool'),
    clearWrongLayouts: document.getElementById('clearWrongLayouts'),
    downloadBackup: document.getElementById('downloadBackup'),
    dashboard: document.getElementById('dashboard'),
    layoutStatePill: document.getElementById('layoutStatePill'),
    layoutState: document.getElementById('layoutState'),
    inputPanel: document.getElementById('inputPanel'),
    toolFrameShell: document.getElementById('toolFrameShell'),
    toolFrame: document.getElementById('toolFrame'),
    metricFoods: document.getElementById('metricFoods'),
    metricFinalized: document.getElementById('metricFinalized'),
    metricVideos: document.getElementById('metricVideos'),
    metricAssets: document.getElementById('metricAssets'),
    renderState: document.getElementById('renderState'),
    renderVideo: document.getElementById('renderVideo'),
    downloadVideo: document.getElementById('downloadVideo'),
    renderLog: document.getElementById('renderLog'),
    inputSyncState: document.getElementById('inputSyncState'),
    entryFoodId: document.getElementById('entryFoodId'),
    entryName: document.getElementById('entryName'),
    entryDisplayName: document.getElementById('entryDisplayName'),
    entryFoodType: document.getElementById('entryFoodType'),
    entryFoodTypeLabel: document.getElementById('entryFoodTypeLabel'),
    entryKcal: document.getElementById('entryKcal'),
    entryTier: document.getElementById('entryTier'),
    entryOverallScore: document.getElementById('entryOverallScore'),
    entryNarration: document.getElementById('entryNarration'),
    entryFoodPatch: document.getElementById('entryFoodPatch'),
    loadSelectedEntry: document.getElementById('loadSelectedEntry'),
    clearEntry: document.getElementById('clearEntry'),
    saveEntry: document.getElementById('saveEntry'),
    uploadModeLabel: document.getElementById('uploadModeLabel'),
    uploadFoodId: document.getElementById('uploadFoodId'),
    uploadFile: document.getElementById('uploadFile'),
    uploadAsset: document.getElementById('uploadAsset'),
    refreshInputData: document.getElementById('refreshInputData'),
    inputLog: document.getElementById('inputLog'),
    inputCounts: document.getElementById('inputCounts'),
    inputRecords: document.getElementById('inputRecords')
  };

  const state = {
    health: null,
    foods: [],
    selectedFoodId: 'bacon',
    foodQuery: '',
    inputDatabase: null,
    uploadKind: 'image',
    activeToolId: 'dashboard',
    latestJobId: null,
    renderDownloadedJobId: null,
    renderPoll: null,
    canonicalLayout: null
  };

  function clean(value) {
    return String(value || '').trim();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function delay(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function safeSlug(value, fallback = '') {
    return String(value || fallback)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function videoFileName(food) {
    return `${safeSlug(food?.id || food?.name, 'foodranked-video')}-vbv2.mp4`;
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function removeStorageKey(key, removed = []) {
    if (!key || localStorage.getItem(key) == null) return removed;
    localStorage.removeItem(key);
    removed.push(key);
    return removed;
  }

  function removeQuotaHeavyLayoutStorage(removed = []) {
    QUOTA_HEAVY_LAYOUT_KEYS.forEach(key => removeStorageKey(key, removed));
    const matchingKeys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (QUOTA_HEAVY_LAYOUT_PREFIXES.some(prefix => key && key.startsWith(prefix))) matchingKeys.push(key);
    }
    matchingKeys.forEach(key => removeStorageKey(key, removed));
    return removed;
  }

  function api(path, options = {}) {
    return fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || response.statusText);
      return data;
    });
  }

  function selectedFood() {
    return state.foods.find(food => food.id === state.selectedFoodId) || state.foods[0] || null;
  }

  function selectedTool() {
    return (state.health?.tools || []).find(tool => tool.id === state.activeToolId) || null;
  }

  function toolUrl(tool, food = selectedFood()) {
    const foodId = encodeURIComponent(food?.id || state.selectedFoodId || 'bacon');
    const bust = Date.now();
    if (!tool) return '';
    if (tool.id === 'layout') return `${tool.path}?app=studio&t=${bust}`;
    if (tool.id === 'display') return `${tool.path}?videoBuilderExportFood=${foodId}&app=studio&t=${bust}`;
    if (tool.id === 'video') return `${tool.path}?food=${foodId}&app=studio&t=${bust}`;
    return `${tool.path}?app=studio&t=${bust}`;
  }

  function setRenderText(message, lines = []) {
    els.renderState.textContent = message || 'Idle';
    els.renderLog.textContent = lines.filter(Boolean).join('\n');
  }

  function setInputText(message, lines = []) {
    els.inputSyncState.textContent = message || 'Synced';
    els.inputLog.textContent = lines.filter(Boolean).join('\n');
  }

  function countLayoutLayers(layout) {
    if (!layout?.sections || typeof layout.sections !== 'object') return 0;
    return Object.values(layout.sections)
      .reduce((total, section) => total + (Array.isArray(section?.layers) ? section.layers.length : 0), 0);
  }

  function isRevokedLayoutSeed(value) {
    const meta = value?.meta || {};
    const sourcePlacementMeta = meta.sourcePlacementMeta || {};
    return REVOKED_LAYOUT_SEED_IDS.has(String(value?.id || ''))
      || REVOKED_LAYOUT_SEED_VERSIONS.has(String(meta.canonicalLayoutVersion || ''))
      || REVOKED_LAYOUT_SEED_VERSIONS.has(String(sourcePlacementMeta.canonicalLayoutVersion || ''))
      || REVOKED_LAYOUT_SEED_SOURCES.has(String(meta.canonicalLayoutSource || ''))
      || REVOKED_LAYOUT_SEED_SOURCES.has(String(sourcePlacementMeta.canonicalLayoutSource || ''));
  }

  function layoutNameKey(value) {
    return clean(value).toLowerCase();
  }

  function isLockedLayoutEntry(entry) {
    return LOCKED_LAYOUT_PRESET_NAME_SET.has(layoutNameKey(entry?.name));
  }

  function isAcceptedDbv2PlacementSource(entry) {
    const sourceName = layoutNameKey(entry?.sourceLayoutName);
    const sourceKey = clean(entry?.sourceLayoutKey).toLowerCase();
    return LOCKED_LAYOUT_PRESET_NAME_SET.has(sourceName)
      || sourceName === 'current working layout'
      || sourceKey === 'working:current';
  }

  function canonicalFingerprint() {
    return clean(state.canonicalLayout?.layoutFingerprint);
  }

  function canonicalLayoutLayerCount() {
    return Number(state.canonicalLayout?.stats?.totalLayers) || countLayoutLayers(state.canonicalLayout?.layout);
  }

  function isCanonicalLayoutEntry(entry) {
    const fingerprint = canonicalFingerprint();
    if (!fingerprint) return true;
    return clean(entry?.meta?.studioCanonicalLayout?.fingerprint) === fingerprint
      && clean(entry?.meta?.lockedLayout?.version) === STUDIO_CANONICAL_LOCK_VERSION;
  }

  function canonicalSavedLayoutId(name) {
    const key = layoutNameKey(name).replace(/\s+/g, '_');
    const suffix = canonicalFingerprint().slice(0, 12) || 'pending';
    return `layout_${key}_studio_canonical_${suffix}`;
  }

  function canonicalSavedLayoutEntry(name, index) {
    const layout = state.canonicalLayout?.layout;
    const now = state.canonicalLayout?.importedAt || new Date().toISOString();
    return {
      id: canonicalSavedLayoutId(name),
      name,
      createdAt: now,
      updatedAt: now,
      selectedFoodId: layout?.selectedFoodId || '',
      selectedSectionId: layout?.selectedSectionId || 'intro',
      canvas: clone(layout?.canvas || null),
      sections: clone(layout?.sections || {}),
      meta: {
        ...(clone(layout?.meta || {})),
        studioCanonicalLayout: {
          version: STUDIO_CANONICAL_LOCK_VERSION,
          fingerprint: canonicalFingerprint(),
          importedFrom: state.canonicalLayout?.importedFrom || '',
          layerCount: canonicalLayoutLayerCount(),
          lockedName: name,
          lockIndex: index + 1
        },
        lockedLayout: {
          version: STUDIO_CANONICAL_LOCK_VERSION,
          lockedAt: now,
          lockedName: name,
          sourceName: 'Studio canonical universal layout',
          sourceId: canonicalFingerprint()
        }
      }
    };
  }

  function canonicalSavedLayoutEntries() {
    if (!state.canonicalLayout?.layout?.sections) return [];
    return LOCKED_LAYOUT_PRESET_NAMES.map(canonicalSavedLayoutEntry);
  }

  function lockedLayoutSortIndex(entry) {
    const index = LOCKED_LAYOUT_PRESET_NAMES.indexOf(layoutNameKey(entry?.name));
    return index >= 0 ? index : Number.POSITIVE_INFINITY;
  }

  function readSavedLayoutEntries() {
    const parsed = readJsonStorage(STORAGE.layoutSavedLayouts, []);
    const entries = (Array.isArray(parsed) ? parsed : Object.values(parsed || {}))
      .filter(entry => !isRevokedLayoutSeed(entry))
      .filter(entry => entry && entry.id && entry.sections && typeof entry.sections === 'object');
    return entries.filter(isLockedLayoutEntry)
      .filter(isCanonicalLayoutEntry)
      .sort((a, b) => lockedLayoutSortIndex(a) - lockedLayoutSortIndex(b));
  }

  function lockedTestLayout() {
    const saved = readSavedLayoutEntries()
      .sort((a, b) => lockedLayoutSortIndex(a) - lockedLayoutSortIndex(b))[0];
    if (saved) return saved;

    const working = readJsonStorage(STORAGE.layoutWorking, null);
    if (countLayoutLayers(working) !== canonicalLayoutLayerCount()) return null;
    return {
      id: 'layout_studio_canonical_working',
      name: 'Universal working layout',
      selectedFoodId: working.selectedFoodId || '',
      selectedSectionId: working.selectedSectionId || 'intro',
      canvas: clone(working.canvas || null),
      sections: clone(working.sections || {}),
      meta: {
        ...(clone(working.meta || {})),
        studioCanonicalLayout: {
          version: STUDIO_CANONICAL_LOCK_VERSION,
          fingerprint: canonicalFingerprint(),
          layerCount: canonicalLayoutLayerCount(),
          storageMode: 'working-layout-only'
        }
      }
    };
  }

  function hasCanonicalLayoutState() {
    const fingerprint = canonicalFingerprint();
    if (!fingerprint) return false;
    const working = readJsonStorage(STORAGE.layoutWorking, null);
    return localStorage.getItem(STORAGE.canonicalLayoutFingerprint) === fingerprint
      && countLayoutLayers(working) === canonicalLayoutLayerCount();
  }

  async function loadCanonicalLayoutState() {
    const payload = await api('/api/layout/universal');
    if (!payload?.layout?.sections || payload.stats?.missingSectionIds?.length) {
      throw new Error('Packaged universal layout is missing required sections.');
    }
    state.canonicalLayout = payload;
    return payload;
  }

  async function seedCanonicalLayoutState({ force = false, report = false } = {}) {
    if (!state.canonicalLayout) await loadCanonicalLayoutState();
    if (!force && hasCanonicalLayoutState()) return [];

    const removed = clearWrongLayoutCaches();
    removeQuotaHeavyLayoutStorage(removed);
    const layout = clone(state.canonicalLayout.layout);
    writeJsonStorage(STORAGE.layoutWorking, layout);
    localStorage.setItem(STORAGE.canonicalLayoutFingerprint, canonicalFingerprint());
    localStorage.removeItem(STORAGE.layoutSavedLayouts);
    localStorage.removeItem(STORAGE.layoutFoodLayouts);
    localStorage.removeItem(STORAGE.dbv2Placement);

    const changes = [
      ...removed,
      STORAGE.layoutWorking,
      STORAGE.canonicalLayoutFingerprint,
      `${STORAGE.layoutSavedLayouts}:removed`,
      `${STORAGE.layoutFoodLayouts}:removed`,
      `${STORAGE.dbv2Placement}:removed`
    ];
    if (report) {
      setRenderText('Canonical layout restored', [
        `Seeded the quota-safe universal layout from ${canonicalFingerprint().slice(0, 12)}.`,
        `${canonicalLayoutLayerCount()} layers stored once as the current Layout Builder state.`
      ]);
    }
    return changes;
  }

  function currentLayoutSummary(food = selectedFood()) {
    const working = readJsonStorage(STORAGE.layoutWorking, null);
    const saved = readSavedLayoutEntries();
    const test = lockedTestLayout();
    const placement = placementEntryForFood(food);
    const staleKeys = STALE_LAYOUT_KEYS.filter(key => localStorage.getItem(key) != null);
    const canonicalReady = hasCanonicalLayoutState();
    return {
      workingLayers: countLayoutLayers(working),
      savedCount: saved.length,
      savedNames: saved.map(entry => clean(entry.name) || entry.id).filter(Boolean),
      canonicalFingerprint: canonicalFingerprint(),
      canonicalLayers: canonicalLayoutLayerCount(),
      canonicalReady,
      test,
      testLayers: countLayoutLayers(test ? { sections: test.sections } : null),
      foodLayoutCount: 0,
      selectedFoodLayout: false,
      placement,
      staleKeys,
      renderReady: Boolean(canonicalReady && test && countLayoutLayers({ sections: test.sections }) > 0)
    };
  }

  function renderLayoutState() {
    const summary = currentLayoutSummary();
    els.layoutStatePill.textContent = summary.renderReady ? 'Ready' : 'Needs locked layout';
    els.layoutStatePill.className = summary.renderReady ? 'good' : 'warn';
    const placement = summary.placement;
    const rows = [
      ['Canonical JSON', summary.canonicalFingerprint ? `${summary.canonicalFingerprint.slice(0, 12)} · ${summary.canonicalLayers} layers` : 'Missing'],
      ['Canonical seeded', summary.canonicalReady ? 'Yes' : 'No'],
      ['Locked layout source', summary.test ? `${summary.test.name} · ${summary.testLayers} layers` : 'Missing'],
      ['Saved layouts', summary.savedNames.length ? summary.savedNames.join(', ') : 'Skipped for app storage'],
      ['Working layout', summary.workingLayers ? `${summary.workingLayers} layers` : 'None'],
      ['Food layouts', 'Disabled for Layout Builder'],
      ['DBv2 placement', placement ? `${placement.sourceLayoutName || placement.sourceLayoutKey || 'DBv2'} @ ${placement.exportedAt || 'unknown time'}` : 'Will rebuild fresh'],
      ['Stale old keys', summary.staleKeys.length ? summary.staleKeys.join(', ') : 'None']
    ];
    els.layoutState.innerHTML = rows.map(([label, value]) => (
      `<dt>${escapeHtml(label)}</dt><dd class="${value === 'Missing' ? 'warn' : ''}">${escapeHtml(value)}</dd>`
    )).join('');
  }

  function renderSystemStatus() {
    const health = state.health;
    if (!health) return;
    const secrets = health.secrets || {};
    const runtime = health.runtime || {};
    const rows = [
      ['ElevenLabs', secrets.elevenLabs?.available ? 'Ready' : 'Missing', secrets.elevenLabs?.available ? 'ok' : 'warn'],
      ['USDA', secrets.usda?.available ? 'Ready' : 'Missing', secrets.usda?.available ? 'ok' : 'warn'],
      ['FFmpeg', runtime.ffmpeg ? 'Ready' : 'Missing', runtime.ffmpeg ? 'ok' : 'bad'],
      ['Universal layout', health.layout?.available ? 'Ready' : 'Missing', health.layout?.available ? 'ok' : 'bad'],
      ['Mode', 'Local', 'ok']
    ];
    els.systemStatus.innerHTML = rows.map(([label, value, tone]) => (
      `<dt>${escapeHtml(label)}</dt><dd class="${tone}">${escapeHtml(value)}</dd>`
    )).join('');
  }

  function normalizeSearchText(value) {
    return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function foodSearchRank(food, query, tokens) {
    const name = normalizeSearchText(food?.name);
    const id = normalizeSearchText(food?.id);
    const type = normalizeSearchText(food?.foodTypeLabel || food?.foodType);
    const tier = normalizeSearchText(food?.tier);
    const haystack = [name, id, type, tier].filter(Boolean).join(' ');
    if (!tokens.every(token => haystack.includes(token))) return null;
    if (name === query || id === query) return 0;
    if (name.startsWith(query) || id.startsWith(query)) return 1;
    if (name.includes(` ${query}`) || id.includes(` ${query}`)) return 2;
    if (tokens.every(token => name.includes(token))) return 3;
    if (tokens.every(token => id.includes(token))) return 4;
    return 8;
  }

  function foodSearchResults() {
    const query = normalizeSearchText(state.foodQuery);
    const foods = state.foods.slice();
    if (!query) return foods.slice(0, 48);
    const tokens = query.split(/\s+/).filter(Boolean);
    return foods
      .map(food => ({ food, rank: foodSearchRank(food, query, tokens) }))
      .filter(entry => entry.rank != null)
      .sort((a, b) => a.rank - b.rank || (a.food.name || a.food.id).localeCompare(b.food.name || b.food.id))
      .map(entry => entry.food)
      .slice(0, 48);
  }

  function foodMeta(food) {
    return [
      food.foodTypeLabel || food.foodType || 'Food',
      food.tier ? `${food.tier} tier` : '',
      food.finalized ? 'finalised' : '',
      food.hasVideo ? 'video' : ''
    ].filter(Boolean).join(' - ');
  }

  function renderFoodSearch() {
    const food = selectedFood();
    const focused = document.activeElement === els.foodSearch;
    const selectedLabel = food?.name || food?.id || '';
    const inputValue = focused ? state.foodQuery : state.foodQuery || selectedLabel;
    if (els.foodSearch.value !== inputValue) els.foodSearch.value = inputValue;

    const results = foodSearchResults();
    els.foodResults.innerHTML = results.map(result => (
      `<button type="button" class="food-result${result.id === state.selectedFoodId ? ' active' : ''}" data-food-id="${escapeHtml(result.id)}" role="option" aria-selected="${result.id === state.selectedFoodId ? 'true' : 'false'}">
        <strong>${escapeHtml(result.name || result.id)}</strong>
        <span>${escapeHtml(foodMeta(result))}</span>
      </button>`
    )).join('') || '<div class="food-empty">No matching foods</div>';
  }

  function orderedTools() {
    const tools = state.health?.tools || [];
    const order = ['layout', 'display', 'video', 'database'];
    return [...tools].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }

  function renderToolNav() {
    const tools = [{ id: 'dashboard', label: 'Dashboard' }, { id: 'input', label: 'Input' }, ...orderedTools()];
    els.toolNav.innerHTML = tools.map(tool => (
      `<button type="button" data-tool-id="${tool.id}" aria-current="${tool.id === state.activeToolId ? 'page' : 'false'}">${escapeHtml(tool.label)}</button>`
    )).join('');
  }

  function renderMetrics() {
    const summary = state.health?.summary || {};
    els.metricFoods.textContent = summary.foods ?? '0';
    els.metricFinalized.textContent = summary.finalized ?? '0';
    els.metricVideos.textContent = summary.videos ?? '0';
    els.metricAssets.textContent = summary.assets ?? '0';
  }

  function inputFoodEntries() {
    return Object.values(state.inputDatabase?.foods || {}).filter(food => food && !food.deleted);
  }

  function inputAssetEntries() {
    return Object.values(state.inputDatabase?.assets?.files || {}).filter(asset => asset && asset.path);
  }

  function renderInputPanel() {
    const foods = inputFoodEntries().sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    const assets = inputAssetEntries().sort((a, b) => (
      String(a.kind || '').localeCompare(String(b.kind || '')) ||
      String(a.label || a.id).localeCompare(String(b.label || b.id))
    ));
    els.inputCounts.textContent = `${foods.length} foods - ${assets.length} assets`;
    const foodRows = foods.slice(0, 18).map(food => (
      `<button type="button" class="record-row" data-input-food-id="${escapeHtml(food.id)}">
        <strong>${escapeHtml(food.name || food.id)}</strong>
        <span>${escapeHtml([food.foodTypeLabel || food.foodType || 'Food', food.tier ? `${food.tier} tier` : '', food.kcal != null ? `${food.kcal} kcal` : ''].filter(Boolean).join(' - '))}</span>
      </button>`
    ));
    const assetRows = assets.slice(0, 18).map(asset => (
      `<a class="record-row" href="${escapeHtml(asset.path)}" target="_blank" rel="noopener">
        <strong>${escapeHtml(asset.label || asset.id)}</strong>
        <span>${escapeHtml([asset.kind || 'asset', asset.foodId || 'shared', asset.sizeBytes ? `${Math.round(asset.sizeBytes / 1024)} KB` : ''].filter(Boolean).join(' - '))}</span>
      </a>`
    ));
    els.inputRecords.innerHTML = [...foodRows, ...assetRows].join('') || '<div class="food-empty">No app input records yet</div>';
  }

  function renderWorkspace() {
    const food = selectedFood();
    const tool = selectedTool();
    const onDashboard = state.activeToolId === 'dashboard';
    const onInput = state.activeToolId === 'input';
    els.dashboard.hidden = !onDashboard;
    els.inputPanel.hidden = !onInput;
    els.toolFrameShell.hidden = onDashboard || onInput;
    els.activeFoodType.textContent = food ? `${food.foodTypeLabel || food.foodType || 'Food'} ${food.tier ? `- ${food.tier} tier` : ''}` : 'Ready';
    els.activeTitle.textContent = onDashboard ? 'Dashboard' : onInput ? 'Input' : `${tool?.label || 'Tool'} - ${food?.name || 'Food'}`;
    els.openTool.disabled = onDashboard || onInput || !tool;

    if (!onDashboard && !onInput && tool) {
      const frameKey = `${tool.id}:${food?.id || state.selectedFoodId}`;
      if (els.toolFrame.dataset.frameKey !== frameKey) {
        els.toolFrame.dataset.frameKey = frameKey;
        els.toolFrame.src = toolUrl(tool, food);
      }
    }
  }

  function renderAll() {
    renderSystemStatus();
    renderFoodSearch();
    renderToolNav();
    renderMetrics();
    renderLayoutState();
    renderInputPanel();
    renderWorkspace();
  }

  function persistSelectedFood() {
    api('/api/state', {
      method: 'PATCH',
      body: JSON.stringify({ selectedFoodId: state.selectedFoodId })
    }).catch(error => setRenderText('State save failed', [error.message]));
  }

  function clientStorageSnapshot(keys = BACKUP_STORAGE_KEYS) {
    const snapshot = {};
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value != null) snapshot[key] = value;
    }
    return snapshot;
  }

  function clearWrongLayoutCaches({ report = false } = {}) {
    const removed = [];
    for (const key of STALE_LAYOUT_KEYS) {
      if (localStorage.getItem(key) == null) continue;
      localStorage.removeItem(key);
      removed.push(key);
    }
    removeQuotaHeavyLayoutStorage(removed);
    if (isRevokedLayoutSeed(readJsonStorage(STORAGE.layoutWorking, null))) {
      localStorage.removeItem(STORAGE.layoutWorking);
      removed.push(`${STORAGE.layoutWorking}:revoked-seed`);
    }
    if (localStorage.getItem(STORAGE.dbv2Placement) != null) {
      localStorage.removeItem(STORAGE.dbv2Placement);
      removed.push(STORAGE.dbv2Placement);
    }
    if (report) {
      setRenderText('Stale layout caches cleared', removed.length ? removed : ['No stale layout caches were present.']);
    }
    return removed;
  }

  function downloadJson(name, payload) {
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadBackup() {
    const backup = await api('/api/backups/export');
    backup.browserLocalStorage = clientStorageSnapshot();
    backup.layoutStateSummary = currentLayoutSummary();
    downloadJson(`foodranked-studio-backup-${new Date().toISOString().slice(0, 10)}.json`, backup);
  }

  function inputDatabaseHasRecords(database) {
    return Boolean(Object.keys(database?.foods || {}).length || Object.keys(database?.assets?.files || {}).length);
  }

  function mergeInputDatabaseIntoBrowser(database) {
    if (!inputDatabaseHasRecords(database)) return;
    const local = readJsonStorage(STORAGE.productionDatabase, {});
    const merged = {
      ...(local && typeof local === 'object' ? local : {}),
      schemaVersion: database.schemaVersion || 'foodranked-production-database.v1',
      updatedAt: database.updatedAt || new Date().toISOString(),
      assets: {
        ...((local?.assets && typeof local.assets === 'object') ? local.assets : {}),
        files: {
          ...((local?.assets?.files && typeof local.assets.files === 'object') ? local.assets.files : {}),
          ...(database.assets?.files || {})
        }
      },
      foods: {
        ...((local?.foods && typeof local.foods === 'object') ? local.foods : {}),
        ...(database.foods || {})
      }
    };
    writeJsonStorage(STORAGE.productionDatabase, merged);
  }

  async function loadInputDatabase() {
    const data = await api('/api/input/database');
    state.inputDatabase = data.database || null;
    mergeInputDatabaseIntoBrowser(state.inputDatabase);
    return state.inputDatabase;
  }

  async function refreshStudioData({ keepSelection = true } = {}) {
    const previousFoodId = state.selectedFoodId;
    const [health, foodsResponse] = await Promise.all([
      api('/api/health'),
      api('/api/foods'),
      loadInputDatabase()
    ]);
    state.health = health;
    state.foods = foodsResponse.foods || [];
    if (!keepSelection || !state.foods.some(food => food.id === previousFoodId)) {
      state.selectedFoodId = state.foods[0]?.id || 'bacon';
    } else {
      state.selectedFoodId = previousFoodId;
    }
    state.foodQuery = selectedFood()?.name || '';
    renderAll();
  }

  function selectedInputEntry() {
    return state.inputDatabase?.foods?.[state.selectedFoodId] || null;
  }

  function setValue(input, value) {
    input.value = value == null ? '' : String(value);
  }

  function clearEntryForm() {
    [
      els.entryFoodId,
      els.entryName,
      els.entryDisplayName,
      els.entryFoodType,
      els.entryFoodTypeLabel,
      els.entryKcal,
      els.entryTier,
      els.entryOverallScore,
      els.entryNarration
    ].forEach(input => { input.value = ''; });
    els.entryFoodPatch.value = '{}';
  }

  function fillEntryForm(food = selectedFood()) {
    const inputEntry = selectedInputEntry();
    const entry = inputEntry || food || {};
    setValue(els.entryFoodId, entry.id || food?.id || '');
    setValue(els.entryName, entry.name || food?.name || '');
    setValue(els.entryDisplayName, entry.displayName || '');
    setValue(els.entryFoodType, entry.foodType || food?.foodType || 'misc');
    setValue(els.entryFoodTypeLabel, entry.foodTypeLabel || food?.foodTypeLabel || '');
    setValue(els.entryKcal, entry.kcal ?? entry.header?.kcal ?? food?.kcal ?? '');
    setValue(els.entryTier, entry.tier || food?.tier || '');
    setValue(els.entryOverallScore, entry.episode?.overallScore ?? food?.overallScore ?? '');
    setValue(els.entryNarration, entry.narrationText || entry.scriptText || entry.library?.scriptText || '');
    els.entryFoodPatch.value = JSON.stringify(entry.foodPatch || {}, null, 2);
    setValue(els.uploadFoodId, entry.id || food?.id || '');
  }

  function parseJsonTextarea(textarea, fallback = {}) {
    const raw = clean(textarea.value);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${textarea.previousElementSibling?.textContent || 'JSON'} must be an object.`);
    }
    return parsed;
  }

  function numberOrNull(value) {
    if (value === '' || value == null) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function entryPayloadFromForm() {
    const id = safeSlug(els.entryFoodId.value);
    if (!id) throw new Error('Food ID is required.');
    const kcal = numberOrNull(els.entryKcal.value);
    const overallScore = numberOrNull(els.entryOverallScore.value);
    const food = {
      id,
      name: clean(els.entryName.value) || id.replace(/-/g, ' '),
      displayName: clean(els.entryDisplayName.value),
      foodType: safeSlug(els.entryFoodType.value, 'misc') || 'misc',
      foodTypeLabel: clean(els.entryFoodTypeLabel.value),
      tier: clean(els.entryTier.value),
      kcal,
      header: {},
      episode: {},
      narrationText: clean(els.entryNarration.value),
      scriptText: clean(els.entryNarration.value),
      foodPatch: parseJsonTextarea(els.entryFoodPatch, {})
    };
    if (kcal != null) food.header.kcal = kcal;
    if (overallScore != null) food.episode.overallScore = overallScore;
    return food;
  }

  async function saveEntry() {
    try {
      const food = entryPayloadFromForm();
      els.saveEntry.disabled = true;
      const data = await api('/api/input/foods', {
        method: 'POST',
        body: JSON.stringify({ food })
      });
      state.inputDatabase = data.database || state.inputDatabase;
      mergeInputDatabaseIntoBrowser(state.inputDatabase);
      state.selectedFoodId = data.food?.id || food.id;
      await refreshStudioData({ keepSelection: true });
      fillEntryForm(selectedFood());
      setInputText('Food saved', [`${data.food?.name || food.name} is now in the app input database.`]);
    } catch (error) {
      setInputText('Food save failed', [error.message]);
    } finally {
      els.saveEntry.disabled = false;
    }
  }

  function fileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || '').split(',').pop() || '');
      reader.onerror = () => reject(reader.error || new Error('File read failed.'));
      reader.readAsDataURL(file);
    });
  }

  function setUploadKind(kind) {
    state.uploadKind = kind === 'narration' ? 'narration' : 'image';
    els.uploadModeLabel.textContent = state.uploadKind === 'image' ? 'PNG' : 'Narration';
    els.uploadFile.accept = state.uploadKind === 'image' ? '.png,image/png' : '.mp3,.wav,.m4a,audio/*';
    document.querySelectorAll('[data-upload-kind]').forEach(button => {
      button.classList.toggle('active', button.dataset.uploadKind === state.uploadKind);
    });
  }

  async function uploadAsset() {
    const file = els.uploadFile.files?.[0];
    if (!file) {
      setInputText('Upload failed', ['Choose a file first.']);
      return;
    }
    const foodId = safeSlug(els.uploadFoodId.value || state.selectedFoodId);
    try {
      els.uploadAsset.disabled = true;
      setInputText('Uploading', [file.name]);
      const dataBase64 = await fileAsBase64(file);
      const data = await api('/api/input/assets', {
        method: 'POST',
        body: JSON.stringify({
          kind: state.uploadKind,
          foodId,
          filename: file.name,
          mimeType: file.type,
          dataBase64,
          attachToFood: true
        })
      });
      state.inputDatabase = data.database || state.inputDatabase;
      mergeInputDatabaseIntoBrowser(state.inputDatabase);
      if (data.food?.id) state.selectedFoodId = data.food.id;
      await refreshStudioData({ keepSelection: true });
      fillEntryForm(selectedFood());
      els.uploadFile.value = '';
      setInputText('Upload saved', [
        `${data.asset?.label || file.name}`,
        data.asset?.path || '',
        data.food ? `Attached to ${data.food.name || data.food.id}.` : ''
      ]);
    } catch (error) {
      setInputText('Upload failed', [error.message]);
    } finally {
      els.uploadAsset.disabled = false;
    }
  }

  function readPlacementExport() {
    const payload = readJsonStorage(STORAGE.dbv2Placement, {});
    return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  }

  function placementEntryForFood(food = selectedFood()) {
    const foodId = food?.id || state.selectedFoodId;
    return readPlacementExport().layouts?.[foodId] || null;
  }

  function placementForFood(food = selectedFood(), { minExportedAt = 0 } = {}) {
    const entry = placementEntryForFood(food);
    if (!entry?.layout) return null;
    const exportedAt = Date.parse(entry.exportedAt || entry.layout?.meta?.exportedAt || '');
    if (minExportedAt && (!Number.isFinite(exportedAt) || exportedAt < minExportedAt)) return null;
    return readPlacementExport();
  }

  function clearPlacementForFood(foodId) {
    const payload = readPlacementExport();
    if (!payload.layouts || typeof payload.layouts !== 'object') {
      localStorage.removeItem(STORAGE.dbv2Placement);
      return;
    }
    delete payload.layouts[foodId];
    const remaining = Object.keys(payload.layouts);
    if (!remaining.length) {
      localStorage.removeItem(STORAGE.dbv2Placement);
      return;
    }
    payload.currentFoodId = remaining.includes(payload.currentFoodId) ? payload.currentFoodId : remaining[0];
    payload.updatedAt = new Date().toISOString();
    writeJsonStorage(STORAGE.dbv2Placement, payload);
  }

  async function waitForPlacementExport(food, minExportedAt, timeoutMs = PLACEMENT_EXPORT_TIMEOUT_MS) {
    const startedAt = performance.now();
    while (performance.now() - startedAt < timeoutMs) {
      const placement = placementForFood(food, { minExportedAt });
      if (placement) return placement;
      await delay(PLACEMENT_EXPORT_POLL_MS);
    }
    return null;
  }

  function createPlacementFrame(food) {
    const frame = document.createElement('iframe');
    frame.title = 'DBv2 fresh placement exporter';
    frame.src = `/docs/display-builder-v2/index.html?videoBuilderExportFood=${encodeURIComponent(food.id)}&app=studio-render-current&t=${Date.now()}`;
    frame.style.position = 'fixed';
    frame.style.left = '-10000px';
    frame.style.top = '0';
    frame.style.width = '1440px';
    frame.style.height = '1200px';
    frame.style.opacity = '0';
    frame.style.pointerEvents = 'none';
    frame.tabIndex = -1;
    document.body.appendChild(frame);
    return frame;
  }

  async function ensureFreshPlacementForFood(food) {
    await seedCanonicalLayoutState({ force: true });
    const summary = currentLayoutSummary(food);
    if (!summary.renderReady) {
      throw new Error('Canonical Layout Builder JSON did not seed the quota-safe universal layout. Restart Studio or restore the packaged universal layout JSON.');
    }

    clearPlacementForFood(food.id);
    const minExportedAt = Date.now() - 1000;
    setRenderText('Preparing fresh DBv2 placement', ['Cleared old DBv2 placement export.', 'Rendering DBv2 from the quota-safe universal layout...']);
    const frame = createPlacementFrame(food);
    try {
      const placement = await waitForPlacementExport(food, minExportedAt);
      const entry = placement?.layouts?.[food.id];
      if (!placement || !entry?.layout) throw new Error('DBv2 did not export a fresh placement for this food in time.');
      if (!isAcceptedDbv2PlacementSource(entry)) {
        throw new Error(`DBv2 exported from ${entry.sourceLayoutName || entry.sourceLayoutKey || 'an unknown layout'}, not the quota-safe universal layout.`);
      }
      return placement;
    } finally {
      frame.remove();
      renderLayoutState();
    }
  }

  function prepareDownloadLink(url, food) {
    const downloadUrl = String(url || '');
    els.downloadVideo.href = downloadUrl;
    els.downloadVideo.download = videoFileName(food);
    els.downloadVideo.hidden = !downloadUrl;
  }

  function triggerVideoDownload(url, food) {
    prepareDownloadLink(url, food);
    if (!url) return;
    window.setTimeout(() => els.downloadVideo.click(), 0);
  }

  function selectFood(foodId) {
    if (!foodId || !state.foods.some(food => food.id === foodId)) return;
    state.selectedFoodId = foodId;
    state.foodQuery = selectedFood()?.name || '';
    setValue(els.uploadFoodId, foodId);
    if (state.activeToolId === 'input') fillEntryForm(selectedFood());
    els.toolFrame.dataset.frameKey = '';
    persistSelectedFood();
    renderAll();
  }

  async function pollRenderJob(jobId) {
    const data = await api(`/api/vbv2-renderer/jobs/${jobId}`);
    const job = data.job;
    const lines = [
      `${job.status.toUpperCase()}: ${job.message || ''}`,
      job.frame ? `Frames: ${job.frame.current}/${job.frame.total} (${job.frame.percent}%)` : '',
      ...(job.logTail || []).slice(-10)
    ];
    setRenderText(job.status === 'complete' ? 'MP4 ready' : job.message || job.status, lines);
    if (job.status === 'complete') {
      prepareDownloadLink(job.downloadUrl, selectedFood());
      if (state.renderDownloadedJobId !== job.id) {
        state.renderDownloadedJobId = job.id;
        triggerVideoDownload(job.downloadUrl, selectedFood());
      }
      clearInterval(state.renderPoll);
      state.renderPoll = null;
    }
    if (job.status === 'failed') {
      clearInterval(state.renderPoll);
      state.renderPoll = null;
    }
  }

  async function renderVideo() {
    const food = selectedFood();
    if (!food) return;
    let layoutPlacement;
    const videoState = readJsonStorage(STORAGE.vbv2State, null);
    try {
      layoutPlacement = await ensureFreshPlacementForFood(food);
    } catch (error) {
      setRenderText('Placement export failed', [error.message]);
      return;
    }

    els.renderVideo.disabled = true;
    els.downloadVideo.hidden = true;
    state.renderDownloadedJobId = null;
    setRenderText('Starting render', ['Sending fresh DBv2 placement and current Layout Builder state to the renderer.']);
    try {
      const response = await api('/api/vbv2-renderer/render', {
        method: 'POST',
        body: JSON.stringify({
          foodId: food.id,
          layoutPlacement,
          layoutState: clientStorageSnapshot(LAYOUT_STATE_KEYS),
          videoState,
          force: true
        })
      });
      if (response.status === 'ready') {
        triggerVideoDownload(response.downloadUrl, food);
        setRenderText('MP4 ready', [response.outputPath || response.downloadUrl]);
        return;
      }
      const job = response.job;
      state.latestJobId = job?.id || null;
      if (state.latestJobId) {
        await pollRenderJob(state.latestJobId);
        clearInterval(state.renderPoll);
        state.renderPoll = setInterval(() => {
          pollRenderJob(state.latestJobId).catch(error => setRenderText('Render polling failed', [error.message]));
        }, 2000);
      }
    } catch (error) {
      setRenderText('Render failed to start', [error.message]);
    } finally {
      els.renderVideo.disabled = false;
    }
  }

  async function loadInitial() {
    await loadCanonicalLayoutState();
    await seedCanonicalLayoutState({ force: true });
    const [health, foodsResponse, stateResponse] = await Promise.all([
      api('/api/health'),
      api('/api/foods'),
      api('/api/state'),
      loadInputDatabase()
    ]);
    state.health = health;
    state.foods = foodsResponse.foods || [];
    const savedFoodId = stateResponse.state?.selectedFoodId;
    state.selectedFoodId = state.foods.some(food => food.id === savedFoodId) ? savedFoodId : state.foods[0]?.id || 'bacon';
    state.foodQuery = selectedFood()?.name || '';
    fillEntryForm(selectedFood());
    renderAll();
  }

  els.foodSearch.addEventListener('input', () => {
    state.foodQuery = els.foodSearch.value;
    renderFoodSearch();
  });

  els.foodSearch.addEventListener('focus', () => {
    els.foodSearch.select();
    renderFoodSearch();
  });

  els.foodSearch.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      state.foodQuery = selectedFood()?.name || '';
      renderFoodSearch();
      event.preventDefault();
      return;
    }
    if (event.key !== 'Enter') return;
    const firstResult = foodSearchResults()[0];
    if (!firstResult) return;
    selectFood(firstResult.id);
    els.foodSearch.blur();
    event.preventDefault();
  });

  els.foodResults.addEventListener('click', event => {
    const button = event.target.closest('button[data-food-id]');
    if (!button) return;
    selectFood(button.dataset.foodId);
  });

  els.toolNav.addEventListener('click', event => {
    const button = event.target.closest('button[data-tool-id]');
    if (!button) return;
    state.activeToolId = button.dataset.toolId;
    if (state.activeToolId === 'input') fillEntryForm(selectedFood());
    renderAll();
  });

  els.openTool.addEventListener('click', () => {
    const tool = selectedTool();
    if (tool) window.open(toolUrl(tool), '_blank', 'noopener');
  });

  els.clearWrongLayouts.addEventListener('click', () => {
    seedCanonicalLayoutState({ force: true, report: true })
      .then(renderLayoutState)
      .catch(error => setRenderText('Canonical layout restore failed', [error.message]));
  });

  els.downloadBackup.addEventListener('click', () => {
    downloadBackup().catch(error => setRenderText('Backup failed', [error.message]));
  });

  els.renderVideo.addEventListener('click', renderVideo);
  els.loadSelectedEntry.addEventListener('click', () => fillEntryForm(selectedFood()));
  els.clearEntry.addEventListener('click', clearEntryForm);
  els.saveEntry.addEventListener('click', saveEntry);
  els.uploadAsset.addEventListener('click', uploadAsset);
  els.refreshInputData.addEventListener('click', () => {
    refreshStudioData({ keepSelection: true })
      .then(() => {
        fillEntryForm(selectedFood());
        setInputText('Synced', ['Loaded the app input database and mirrored it to the browser database.']);
      })
      .catch(error => setInputText('Sync failed', [error.message]));
  });
  document.querySelectorAll('[data-upload-kind]').forEach(button => {
    button.addEventListener('click', () => setUploadKind(button.dataset.uploadKind));
  });
  els.inputRecords.addEventListener('click', event => {
    const button = event.target.closest('[data-input-food-id]');
    if (!button) return;
    event.preventDefault();
    selectFood(button.dataset.inputFoodId);
    fillEntryForm(selectedFood());
  });
  window.addEventListener('storage', renderLayoutState);
  window.setInterval(renderLayoutState, 2000);

  setUploadKind('image');
  loadInitial().catch(error => {
    setRenderText('Studio failed to load', [error.message]);
  });
})();
