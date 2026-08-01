(function () {
  const PRODUCTION_DATABASE_KEY = 'foodranked-production-database-v1';
  const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
  const VIDEO_STATE_KEY = 'foodranked-video-builder-v2-state-v1';
  const PLACEMENT_EXPORT_TIMEOUT_MS = 25000;
  const PLACEMENT_EXPORT_POLL_MS = 250;
  const STORAGE_KEYS = [
    PRODUCTION_DATABASE_KEY,
    'foodranked-display-builder-v2-state-v1',
    PLACEMENT_EXPORT_KEY,
    VIDEO_STATE_KEY
  ];

  const els = {
    foodSearch: document.getElementById('foodSearch'),
    foodResults: document.getElementById('foodResults'),
    toolNav: document.getElementById('toolNav'),
    systemStatus: document.getElementById('systemStatus'),
    activeFoodType: document.getElementById('activeFoodType'),
    activeTitle: document.getElementById('activeTitle'),
    openTool: document.getElementById('openTool'),
    downloadBackup: document.getElementById('downloadBackup'),
    dashboard: document.getElementById('dashboard'),
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
    renderPoll: null
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

  function safeFileStem(value) {
    return String(value || 'foodranked-video')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'foodranked-video';
  }

  function videoFileName(food) {
    return `${safeFileStem(food?.id || food?.name)}-vbv2.mp4`;
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

  function toolUrl(tool) {
    const food = selectedFood();
    const foodId = encodeURIComponent(food?.id || state.selectedFoodId || 'bacon');
    if (!tool) return '';
    if (tool.id === 'display') return `${tool.path}?videoBuilderExportFood=${foodId}&app=studio&t=${Date.now()}`;
    if (tool.id === 'video') return `${tool.path}?food=${foodId}&app=studio&t=${Date.now()}`;
    return `${tool.path}?app=studio&t=${Date.now()}`;
  }

  function setRenderText(message, lines = []) {
    els.renderState.textContent = message || 'Idle';
    els.renderLog.textContent = lines.filter(Boolean).join('\n');
  }

  function setInputText(message, lines = []) {
    els.inputSyncState.textContent = message || 'Synced';
    els.inputLog.textContent = lines.filter(Boolean).join('\n');
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
      ['Mode', 'Local', 'ok']
    ];
    els.systemStatus.innerHTML = rows.map(([label, value, tone]) => (
      `<dt>${label}</dt><dd class="${tone}">${value}</dd>`
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

  function renderToolNav() {
    const tools = [{ id: 'dashboard', label: 'Dashboard' }, { id: 'input', label: 'Input' }, ...(state.health?.tools || [])];
    els.toolNav.innerHTML = tools.map(tool => (
      `<button type="button" data-tool-id="${tool.id}" aria-current="${tool.id === state.activeToolId ? 'page' : 'false'}">${tool.label}</button>`
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
    if (!onDashboard && !onInput && tool) els.toolFrame.src = toolUrl(tool);
  }

  function renderAll() {
    renderSystemStatus();
    renderFoodSearch();
    renderToolNav();
    renderMetrics();
    renderInputPanel();
    renderWorkspace();
  }

  function persistSelectedFood() {
    api('/api/state', {
      method: 'PATCH',
      body: JSON.stringify({ selectedFoodId: state.selectedFoodId })
    }).catch(error => setRenderText('State save failed', [error.message]));
  }

  function clientStorageSnapshot() {
    const snapshot = {};
    for (const key of STORAGE_KEYS) {
      const value = localStorage.getItem(key);
      if (value != null) snapshot[key] = value;
    }
    return snapshot;
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
    downloadJson(`foodranked-studio-backup-${new Date().toISOString().slice(0, 10)}.json`, backup);
  }

  function inputDatabaseHasRecords(database) {
    return Boolean(Object.keys(database?.foods || {}).length || Object.keys(database?.assets?.files || {}).length);
  }

  function mergeInputDatabaseIntoBrowser(database) {
    if (!inputDatabaseHasRecords(database)) return;
    const local = readJsonStorage(PRODUCTION_DATABASE_KEY, {});
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
    writeJsonStorage(PRODUCTION_DATABASE_KEY, merged);
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
    const id = safeFileStem(els.entryFoodId.value);
    if (!id) throw new Error('Food ID is required.');
    const kcal = numberOrNull(els.entryKcal.value);
    const overallScore = numberOrNull(els.entryOverallScore.value);
    const food = {
      id,
      name: clean(els.entryName.value) || id.replace(/-/g, ' '),
      displayName: clean(els.entryDisplayName.value),
      foodType: safeFileStem(els.entryFoodType.value) || 'misc',
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
    const foodId = safeFileStem(els.uploadFoodId.value || state.selectedFoodId);
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

  function placementForFood(food) {
    const payload = readJsonStorage(PLACEMENT_EXPORT_KEY, null);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
    const foodId = food?.id || state.selectedFoodId;
    return payload.layouts?.[foodId]?.layout ? payload : null;
  }

  async function waitForPlacementExport(food, timeoutMs = PLACEMENT_EXPORT_TIMEOUT_MS) {
    const startedAt = performance.now();
    while (performance.now() - startedAt < timeoutMs) {
      const placement = placementForFood(food);
      if (placement) return placement;
      await delay(PLACEMENT_EXPORT_POLL_MS);
    }
    return null;
  }

  function createPlacementFrame(food) {
    const frame = document.createElement('iframe');
    frame.title = 'DBv2 placement exporter';
    frame.src = `/docs/display-builder-v2/index.html?videoBuilderExportFood=${encodeURIComponent(food.id)}&app=studio-render&t=${Date.now()}`;
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

  async function ensurePlacementForFood(food) {
    const current = placementForFood(food);
    if (current) return current;

    setRenderText('Preparing DBv2 placement', ['Rendering the selected food layout offscreen...']);
    const frame = createPlacementFrame(food);
    try {
      const placement = await waitForPlacementExport(food);
      if (placement) return placement;
      throw new Error('DBv2 did not export a placement for this food in time.');
    } finally {
      frame.remove();
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
    const videoState = readJsonStorage(VIDEO_STATE_KEY, null);
    try {
      layoutPlacement = await ensurePlacementForFood(food);
    } catch (error) {
      setRenderText('Placement export failed', [error.message]);
      return;
    }

    els.renderVideo.disabled = true;
    els.downloadVideo.hidden = true;
    state.renderDownloadedJobId = null;
    setRenderText('Starting render', []);
    try {
      const response = await api('/api/vbv2-renderer/render', {
        method: 'POST',
        body: JSON.stringify({
          foodId: food.id,
          layoutPlacement,
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

  setUploadKind('image');
  loadInitial().catch(error => {
    setRenderText('Studio failed to load', [error.message]);
  });
})();
