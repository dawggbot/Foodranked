(function () {
  const STORAGE_KEYS = [
    'foodranked-production-database-v1',
    'foodranked-layout-builder-v4',
    'foodranked-layout-builder-food-layouts-v1',
    'foodranked-layout-builder-sprite-layouts-v1',
    'foodranked-display-builder-v2-state-v1',
    'foodranked-display-builder-v2-placement-layouts-v1',
    'foodranked-video-builder-v2-state-v1'
  ];

  const els = {
    foodSelect: document.getElementById('foodSelect'),
    toolNav: document.getElementById('toolNav'),
    systemStatus: document.getElementById('systemStatus'),
    activeFoodType: document.getElementById('activeFoodType'),
    activeTitle: document.getElementById('activeTitle'),
    openTool: document.getElementById('openTool'),
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
    renderPoll: null
  };

  function clean(value) {
    return String(value || '').trim();
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
      els.downloadVideo.href = job.downloadUrl;
      els.downloadVideo.hidden = false;
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
    const placementRaw = localStorage.getItem('foodranked-display-builder-v2-placement-layouts-v1');
    const videoStateRaw = localStorage.getItem('foodranked-video-builder-v2-state-v1');
    if (!placementRaw) {
      setRenderText('DBv2 placement missing', ['Open DBv2 or VBv2 for this food first so the proof placement exists.']);
      return;
    }
    let layoutPlacement;
    let videoState = null;
    try {
      layoutPlacement = JSON.parse(placementRaw);
      videoState = videoStateRaw ? JSON.parse(videoStateRaw) : null;
    } catch (error) {
      setRenderText('Placement JSON is invalid', [error.message]);
      return;
    }

    els.renderVideo.disabled = true;
    els.downloadVideo.hidden = true;
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
        els.downloadVideo.href = response.downloadUrl;
        els.downloadVideo.hidden = false;
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

  els.openProof.addEventListener('click', openProof);
  els.renderVideo.addEventListener('click', renderVideo);

  loadInitial().catch(error => {
    setRenderText('Studio failed to load', [error.message]);
  });
})();
