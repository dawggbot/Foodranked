(function () {
  const LAYOUT_STORAGE_KEY = 'foodranked-layout-builder-v4';
  const FOOD_LAYOUTS_STORAGE_KEY = 'foodranked-layout-builder-food-layouts-v1';
  const SAVED_LAYOUTS_KEY = 'foodranked-layout-builder-sprite-layouts-v1';
  const PLACEMENT_EXPORT_KEY = 'foodranked-display-builder-v2-placement-layouts-v1';
  const VIDEO_STATE_KEY = 'foodranked-video-builder-v2-state-v1';
  const REPO_LAYOUT_VERSION = '20260620-layout-restore-v1';
  const DEFAULT_TEST_LAYOUT_ID = 'studio-default-test-layout';
  const PLACEMENT_EXPORT_TIMEOUT_MS = 25000;
  const PLACEMENT_EXPORT_POLL_MS = 250;
  const STORAGE_KEYS = [
    'foodranked-production-database-v1',
    LAYOUT_STORAGE_KEY,
    FOOD_LAYOUTS_STORAGE_KEY,
    SAVED_LAYOUTS_KEY,
    'foodranked-display-builder-v2-state-v1',
    PLACEMENT_EXPORT_KEY,
    VIDEO_STATE_KEY
  ];

  const els = {
    foodSelect: document.getElementById('foodSelect'),
    toolNav: document.getElementById('toolNav'),
    systemStatus: document.getElementById('systemStatus'),
    activeFoodType: document.getElementById('activeFoodType'),
    activeTitle: document.getElementById('activeTitle'),
    openTool: document.getElementById('openTool'),
    restoreTestLayout: document.getElementById('restoreTestLayout'),
    downloadBackup: document.getElementById('downloadBackup'),
    dashboard: document.getElementById('dashboard'),
    toolFrameShell: document.getElementById('toolFrameShell'),
    toolFrame: document.getElementById('toolFrame'),
    metricFoods: document.getElementById('metricFoods'),
    metricFinalized: document.getElementById('metricFinalized'),
    metricVideos: document.getElementById('metricVideos'),
    metricAssets: document.getElementById('metricAssets'),
    renderState: document.getElementById('renderState'),
    openProof: document.getElementById('openProof'),
    renderVideo: document.getElementById('renderVideo'),
    downloadVideo: document.getElementById('downloadVideo'),
    renderLog: document.getElementById('renderLog')
  };

  const state = {
    health: null,
    foods: [],
    selectedFoodId: 'bacon',
    activeToolId: 'dashboard',
    latestJobId: null,
    renderDownloadedJobId: null,
    renderPoll: null
  };

  function clean(value) {
    return String(value || '').trim();
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
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
    if (tool.id === 'video') return `${tool.path}?food=${foodId}&proof=mp4&render=mp4&app=studio&t=${Date.now()}`;
    return `${tool.path}?app=studio&t=${Date.now()}`;
  }

  function setRenderText(message, lines = []) {
    els.renderState.textContent = message || 'Idle';
    els.renderLog.textContent = lines.filter(Boolean).join('\n');
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

  function renderFoodSelect() {
    els.foodSelect.innerHTML = state.foods.map(food => (
      `<option value="${food.id}">${food.name}</option>`
    )).join('');
    els.foodSelect.value = state.selectedFoodId;
  }

  function renderToolNav() {
    const tools = [{ id: 'dashboard', label: 'Dashboard' }, ...(state.health?.tools || [])];
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

  function renderWorkspace() {
    const food = selectedFood();
    const tool = selectedTool();
    const onDashboard = state.activeToolId === 'dashboard';
    els.dashboard.hidden = !onDashboard;
    els.toolFrameShell.hidden = onDashboard;
    els.activeFoodType.textContent = food ? `${food.foodTypeLabel || food.foodType || 'Food'} ${food.tier ? `- ${food.tier} tier` : ''}` : 'Ready';
    els.activeTitle.textContent = onDashboard ? 'Dashboard' : `${tool?.label || 'Tool'} - ${food?.name || 'Food'}`;
    els.openTool.disabled = onDashboard && !tool;
    if (!onDashboard && tool) els.toolFrame.src = toolUrl(tool);
  }

  function renderAll() {
    renderSystemStatus();
    renderFoodSelect();
    renderToolNav();
    renderMetrics();
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

  function readSavedLayouts() {
    const parsed = readJsonStorage(SAVED_LAYOUTS_KEY, []);
    const entries = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
    return entries.filter(entry => entry && entry.id && entry.sections && typeof entry.sections === 'object');
  }

  function defaultLayoutSeed() {
    const layout = window.FOODRANKED_DISPLAY_BUILDER_DEFAULT_LAYOUT;
    if (!layout?.sections) throw new Error('Bundled default layout is not available.');
    return {
      ...clone(layout),
      selectedFoodId: selectedFood()?.id || layout.selectedFoodId || state.selectedFoodId,
      meta: {
        ...(layout.meta || {}),
        repoLayoutVersion: REPO_LAYOUT_VERSION,
        studioSeed: 'default-layout'
      }
    };
  }

  function defaultTestLayoutEntry({ id = DEFAULT_TEST_LAYOUT_ID, createdAt = null } = {}) {
    const now = new Date().toISOString();
    const layout = defaultLayoutSeed();
    return {
      id,
      name: 'test',
      createdAt: createdAt || now,
      updatedAt: now,
      selectedSectionId: layout.selectedSectionId || 'intro',
      sections: clone(layout.sections)
    };
  }

  function seedTestLayout({ force = false, backupExisting = false } = {}) {
    const entries = readSavedLayouts();
    const existingIndex = entries.findIndex(entry => String(entry.name || '').trim().toLowerCase() === 'test');
    if (existingIndex >= 0 && !force) return false;

    const existing = existingIndex >= 0 ? entries[existingIndex] : null;
    const next = defaultTestLayoutEntry({
      id: existing?.id || DEFAULT_TEST_LAYOUT_ID,
      createdAt: existing?.createdAt || null
    });
    const kept = entries.filter(entry => entry.id !== next.id);
    const backup = existing && backupExisting
      ? {
        ...clone(existing),
        id: `${existing.id || 'test'}-backup-${Date.now().toString(36)}`,
        name: `test backup ${new Date().toISOString().replace(/[:.]/g, '-')}`,
        updatedAt: new Date().toISOString()
      }
      : null;
    writeJsonStorage(SAVED_LAYOUTS_KEY, [next, ...(backup ? [backup] : []), ...kept]);
    writeJsonStorage(LAYOUT_STORAGE_KEY, defaultLayoutSeed());
    localStorage.removeItem(PLACEMENT_EXPORT_KEY);
    return true;
  }

  function restoreTestLayout() {
    try {
      seedTestLayout({ force: true, backupExisting: true });
      setRenderText('test layout restored', [
        'The app-side saved layout named test was restored from the bundled layout.',
        'The previous app-side test layout was kept as a backup entry.'
      ]);
      if (state.activeToolId === 'layout' || state.activeToolId === 'display' || state.activeToolId === 'video') {
        renderWorkspace();
      }
    } catch (error) {
      setRenderText('Layout restore failed', [error.message]);
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

  function openProof() {
    state.activeToolId = 'video';
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
      api('/api/state')
    ]);
    state.health = health;
    state.foods = foodsResponse.foods || [];
    state.selectedFoodId = stateResponse.state?.selectedFoodId || state.foods[0]?.id || 'bacon';
    seedTestLayout({ force: false });
    renderAll();
  }

  els.foodSelect.addEventListener('change', () => {
    state.selectedFoodId = els.foodSelect.value;
    persistSelectedFood();
    renderAll();
  });

  els.toolNav.addEventListener('click', event => {
    const button = event.target.closest('button[data-tool-id]');
    if (!button) return;
    state.activeToolId = button.dataset.toolId;
    renderAll();
  });

  els.openTool.addEventListener('click', () => {
    const tool = selectedTool();
    if (tool) window.open(toolUrl(tool), '_blank', 'noopener');
  });

  els.downloadBackup.addEventListener('click', () => {
    downloadBackup().catch(error => setRenderText('Backup failed', [error.message]));
  });
  els.restoreTestLayout.addEventListener('click', restoreTestLayout);

  els.openProof.addEventListener('click', openProof);
  els.renderVideo.addEventListener('click', renderVideo);

  loadInitial().catch(error => {
    setRenderText('Studio failed to load', [error.message]);
  });
})();
