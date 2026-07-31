(function () {
  const DB = window.FOODRANKED_DATABASE;
  const BASE_FOODS = Array.isArray(window.FOODS_INDEX) ? window.FOODS_INDEX : [];
  const FOOD_TYPES = Object.keys(window.FOODRANKED_DISPLAY_SCHEMA?.foodTypeTitleLabels || {
    vegetables: 'VEG',
    fruits: 'FRUIT',
    grains: 'GRAIN',
    legumes: 'LEG',
    tubers: 'TUBER',
    nuts: 'NUT',
    seeds: 'SEED',
    meats: 'MEAT',
    dairy: 'DAIRY',
    'oils-and-fats': 'FATS',
    misc: 'MISC'
  });

  const els = {
    databaseStats: document.getElementById('databaseStats'),
    foodSearch: document.getElementById('foodSearch'),
    addFood: document.getElementById('addFood'),
    exportDatabase: document.getElementById('exportDatabase'),
    importDatabase: document.getElementById('importDatabase'),
    foodList: document.getElementById('foodList'),
    assetStats: document.getElementById('assetStats'),
    assetSearch: document.getElementById('assetSearch'),
    assetList: document.getElementById('assetList'),
    assetRefs: document.getElementById('assetRefs'),
    finalizedSummary: document.getElementById('finalizedSummary'),
    finalizedList: document.getElementById('finalizedList'),
    universalSprites: document.getElementById('universalSprites'),
    universalSfx: document.getElementById('universalSfx'),
    saveUniversal: document.getElementById('saveUniversal'),
    selectedFoodTitle: document.getElementById('selectedFoodTitle'),
    selectedFoodMeta: document.getElementById('selectedFoodMeta'),
    openDbv2: document.getElementById('openDbv2'),
    openVbv2: document.getElementById('openVbv2'),
    foodId: document.getElementById('foodId'),
    foodName: document.getElementById('foodName'),
    displayName: document.getElementById('displayName'),
    shortName: document.getElementById('shortName'),
    foodType: document.getElementById('foodType'),
    foodTypeLabel: document.getElementById('foodTypeLabel'),
    basisValue: document.getElementById('basisValue'),
    basisUnit: document.getElementById('basisUnit'),
    kcal: document.getElementById('kcal'),
    fatG: document.getElementById('fatG'),
    carbG: document.getElementById('carbG'),
    proteinG: document.getElementById('proteinG'),
    nameMaxFontSize: document.getElementById('nameMaxFontSize'),
    nameMinFontSize: document.getElementById('nameMinFontSize'),
    nameWidthRatio: document.getElementById('nameWidthRatio'),
    finalizedDownloaded: document.getElementById('finalizedDownloaded'),
    foodSpritePath: document.getElementById('foodSpritePath'),
    foodSpriteWidth: document.getElementById('foodSpriteWidth'),
    foodSpriteHeight: document.getElementById('foodSpriteHeight'),
    audioPath: document.getElementById('audioPath'),
    audioTake: document.getElementById('audioTake'),
    splitAudioManifestPath: document.getElementById('splitAudioManifestPath'),
    videoDownloadPath: document.getElementById('videoDownloadPath'),
    metricsJson: document.getElementById('metricsJson'),
    foodPatchJson: document.getElementById('foodPatchJson'),
    scriptText: document.getElementById('scriptText'),
    notes: document.getElementById('notes'),
    saveFood: document.getElementById('saveFood'),
    deleteFood: document.getElementById('deleteFood'),
    restoreFood: document.getElementById('restoreFood'),
    resetDatabase: document.getElementById('resetDatabase'),
    databaseStatus: document.getElementById('databaseStatus')
  };

  const state = {
    db: DB.read(),
    foods: [],
    selectedFoodId: '',
    filter: '',
    assetFilter: ''
  };

  const AUTO_ASSET_SELECTION_MODE = 'auto-stable-v1';
  const FINALISATION_SAMPLE_FOOD_IDS = new Set([
    'kale',
    'raspberries',
    'oats',
    'black-beans',
    'sweet-potato',
    'almonds',
    'chia-seeds',
    'bacon',
    'greek-yogurt',
    'extra-virgin-olive-oil',
    'cola-regular'
  ]);
  const SFX_ROLE_OPTIONS = Object.freeze({
    stampImpact: Object.freeze([
      'audio/sfx/stamps/impact_stamp_hit.mp3',
      'audio/sfx/stamps/traditional_stamp_hit.mp3'
    ]),
    sectionTransition: Object.freeze([
      'audio/sfx/transitions/section_transition_whoosh.mp3',
      'audio/sfx/transitions/freesound_community_retro_spell_sfx_85574.mp3'
    ])
  });
  const MUSIC_ROLE_OPTIONS = Object.freeze({
    backgroundMusic: Object.freeze([
      'audio/music/freesound_community_8bit_sample_69080_loop_240s.mp3',
      'audio/music/hauntsync_retro_chiptune_adventure_318059_loop_240s.mp3',
      'audio/music/lucadialessandro_arcade_melody_295434_loop_240s.mp3',
      'audio/music/retro_bgm_chan_low_level_enemy_534609_loop_240s.mp3',
      'audio/music/retro_bgm_chan_vs_robbot_vs_534622_loop_240s.mp3'
    ])
  });

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function asNumber(value, fallback = null) {
    if (value === '' || value == null) return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clean(value) {
    return String(value ?? '').trim();
  }

  function prettyFoodType(value) {
    return clean(value).replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) || 'Misc';
  }

  function baseFoodById(id) {
    return BASE_FOODS.find(food => food.id === id) || null;
  }

  function effectiveFoodById(id) {
    return state.foods.find(food => food.id === id) || null;
  }

  function isConfigFinalisedFood(foodOrId) {
    const id = typeof foodOrId === 'string' ? foodOrId : foodOrId?.id;
    return FINALISATION_SAMPLE_FOOD_IDS.has(clean(id));
  }

  function isFinalizedFood(food) {
    return isConfigFinalisedFood(food) || DB.isFinalizedDownloaded(food, state.db);
  }

  function scriptTextFromBlocks(blocks) {
    if (!Array.isArray(blocks) || !blocks.length) return '';
    return blocks
      .map(block => clean(block?.text))
      .filter(Boolean)
      .join('\n-\n');
  }

  function sourceScriptTextForFood(food) {
    const episode = food?.episode || {};
    const script = episode.script || {};
    return clean(
      episode.narrationText ||
      script.narrationText ||
      food?.narrationText ||
      scriptTextFromBlocks(script.narrationBlocks)
    );
  }

  function assetRefOrPath(path) {
    const cleanPath = clean(path);
    if (!cleanPath) return '';
    return typeof DB.assetRefForPath === 'function'
      ? DB.assetRefForPath(cleanPath, state.db) || cleanPath
      : cleanPath;
  }

  function stableHash(value) {
    let hash = 2166136261;
    for (const char of String(value || '')) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619) >>> 0;
    }

    hash ^= hash >>> 16;
    hash = Math.imul(hash, 2246822507) >>> 0;
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 3266489909) >>> 0;
    hash ^= hash >>> 16;
    return hash >>> 0;
  }

  function stableChoice(options, seed) {
    const choices = Array.isArray(options) ? options.filter(Boolean) : [];
    if (!choices.length) return null;
    return choices[stableHash(seed) % choices.length];
  }

  function autoSeed(role, id) {
    return `foodranked:${AUTO_ASSET_SELECTION_MODE}:${role}:${id}`;
  }

  function autoProfilePath(role, options, id) {
    return assetRefOrPath(stableChoice(options, autoSeed(role, id)));
  }

  function refreshFoods({ keepSelection = true } = {}) {
    state.db = DB.read();
    state.foods = DB.applyToFoods(BASE_FOODS, state.db);
    if (!keepSelection || !state.foods.some(food => food.id === state.selectedFoodId)) {
      state.selectedFoodId = state.foods[0]?.id || '';
    }
  }

  function status(message, tone = 'ok') {
    els.databaseStatus.textContent = message;
    els.databaseStatus.classList.toggle('ok', tone === 'ok');
    els.databaseStatus.classList.toggle('warn', tone === 'warn');
  }

  function setInput(input, value) {
    if (!input) return;
    input.value = value == null ? '' : String(value);
  }

  function numberInputValue(input) {
    return asNumber(input?.value, null);
  }

  function parseJsonField(input, fallback = {}) {
    const raw = clean(input.value);
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (error) {
      throw new Error(`${input.previousElementSibling?.textContent || 'JSON'} is not valid JSON.`);
    }
    throw new Error(`${input.previousElementSibling?.textContent || 'JSON'} must be an object.`);
  }

  function foodEntryForForm(food) {
    const existing = DB.foodEntryForId(food.id, state.db) || {};
    const episode = food.episode || {};
    const customImage = food.assets?.customFoodImage || {};
    const sourceScriptText = sourceScriptTextForFood(food);
    return {
      id: food.id,
      name: food.name || '',
      displayName: food.displayName || food.header?.displayName || '',
      shortName: food.shortName || '',
      foodType: food.foodType || 'misc',
      foodTypeLabel: food.foodTypeLabel || prettyFoodType(food.foodType),
      basis: food.basis || { value: 100, unit: 'g' },
      header: food.header || {},
      metrics: food.metrics || {},
      foodPatch: {},
      headerNameMaxFontSize: food.headerNameMaxFontSize || food.header?.nameMaxFontSize || '',
      headerNameMinFontSize: food.headerNameMinFontSize || food.header?.nameMinFontSize || '',
      headerNameFontWidthRatio: food.headerNameFontWidthRatio || food.header?.nameFontWidthRatio || '',
      finalizedDownloaded: DB.isFinalizedDownloaded(food, state.db),
      customFoodImagePath: assetRefOrPath(customImage.path),
      customFoodImageWidth: customImage.width || customImage.naturalWidth || '',
      customFoodImageHeight: customImage.height || customImage.naturalHeight || '',
      audioPath: assetRefOrPath(episode.audio?.path),
      audioTake: episode.audio?.take || '',
      splitAudioManifestPath: assetRefOrPath(episode.splitAudio?.manifestPath),
      videoDownloadPath: assetRefOrPath(episode.videoDownload?.mp4Path || episode.video?.mp4Path),
      scriptText: sourceScriptText,
      notes: '',
      ...existing,
      scriptText: clean(existing.scriptText || existing.narrationText || existing.library?.scriptText) || sourceScriptText
    };
  }

  function renderStats() {
    const stats = DB.stats(BASE_FOODS, state.db);
    const finalized = state.foods.filter(isFinalizedFood).length;
    const items = [
      ['Total', stats.total],
      ['Done', finalized],
      ['Not done', Math.max(0, stats.total - finalized)],
      ['Custom', stats.custom]
    ];
    els.databaseStats.innerHTML = items.map(([label, value]) => (
      `<div class="stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`
    )).join('');
  }

  function renderFoodTypes() {
    els.foodType.innerHTML = FOOD_TYPES.map(type => (
      `<option value="${escapeHtml(type)}">${escapeHtml(prettyFoodType(type))}</option>`
    )).join('');
  }

  function renderUniversalFields(root, group, values) {
    const defaults = DB.DEFAULT_UNIVERSAL_UI[group] || {};
    root.innerHTML = Object.keys(defaults).map(key => (
      `<label class="field">
        <span>${escapeHtml(key)}</span>
        <input data-universal-group="${escapeHtml(group)}" data-universal-key="${escapeHtml(key)}" type="text" list="assetRefs" value="${escapeHtml(values?.[key] || defaults[key] || '')}" />
      </label>`
    )).join('');
  }

  function renderUniversal() {
    renderUniversalFields(els.universalSprites, 'sprites', state.db.universalUi?.sprites);
    renderUniversalFields(els.universalSfx, 'sfx', state.db.universalUi?.sfx);
  }

  function renderFoodList() {
    const query = state.filter.toLowerCase();
    const visible = state.foods
      .filter(food => !query || [food.id, food.name, food.displayName, food.foodType, food.foodTypeLabel]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query)))
      .slice(0, 160);
    els.foodList.innerHTML = visible.map(food => {
      const finalized = isFinalizedFood(food);
      const base = baseFoodById(food.id);
      return `<button class="food-button${food.id === state.selectedFoodId ? ' active' : ''}" type="button" data-food-id="${escapeHtml(food.id)}">
        <strong>${escapeHtml(food.name || food.id)}${finalized ? ' <span class="badge">done</span>' : ''}</strong>
        <span>${escapeHtml(food.foodTypeLabel || prettyFoodType(food.foodType))} · ${escapeHtml(String(food.header?.kcal ?? food.kcal ?? 'N/A'))} kcal${base ? '' : ' · custom'}</span>
      </button>`;
    }).join('') || '<div class="muted small">No foods</div>';
  }

  function assetRefForEntry(asset) {
    return typeof DB.assetRef === 'function' ? DB.assetRef(asset?.id) : `frdb://asset/${asset?.id || ''}`;
  }

  function autoFoodSpecificPatch(id) {
    return {
      sfxProfile: {
        version: 1,
        selectionMode: AUTO_ASSET_SELECTION_MODE,
        stampImpact: { path: autoProfilePath('stampImpact', SFX_ROLE_OPTIONS.stampImpact, id) },
        sectionTransition: { path: autoProfilePath('sectionTransition', SFX_ROLE_OPTIONS.sectionTransition, id) }
      },
      musicProfile: {
        version: 1,
        selectionMode: AUTO_ASSET_SELECTION_MODE,
        backgroundMusic: { path: autoProfilePath('backgroundMusic', MUSIC_ROLE_OPTIONS.backgroundMusic, id) }
      },
      voiceProfile: {
        version: 1,
        selectionMode: AUTO_ASSET_SELECTION_MODE,
        narration: {
          mode: 'random_suitable',
          seed: autoSeed('narration', id)
        }
      }
    };
  }

  function renderAssetDatalist() {
    const assets = typeof DB.assetEntries === 'function' ? DB.assetEntries(state.db) : [];
    els.assetRefs.innerHTML = assets.map(asset => (
      `<option value="${escapeHtml(assetRefForEntry(asset))}" label="${escapeHtml(asset.label || asset.path || asset.id)}"></option>`
    )).join('');
  }

  function renderAssetLibrary() {
    const assets = typeof DB.assetEntries === 'function' ? DB.assetEntries(state.db) : [];
    const totalBytes = assets.reduce((sum, asset) => sum + (Number(asset.sizeBytes) || 0), 0);
    const byKind = assets.reduce((memo, asset) => {
      const kind = asset.kind || 'asset';
      memo[kind] = (memo[kind] || 0) + 1;
      return memo;
    }, {});
    els.assetStats.textContent = `${assets.length} bundled assets · ${(totalBytes / 1024 / 1024).toFixed(1)} MB referenced · ${Object.entries(byKind).map(([kind, count]) => `${kind}: ${count}`).join(', ')}`;

    const query = state.assetFilter.toLowerCase();
    const visible = assets
      .filter(asset => !query || [asset.id, asset.label, asset.kind, asset.path, asset.mimeType]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query)))
      .slice(0, 120);
    els.assetList.innerHTML = visible.map(asset => (
      `<button class="asset-button" type="button" data-asset-ref="${escapeHtml(assetRefForEntry(asset))}">
        <strong>${escapeHtml(asset.label || asset.id)}</strong>
        <span>${escapeHtml(asset.kind || 'asset')} · ${escapeHtml(asset.path || '')}</span>
      </button>`
    )).join('') || '<div class="muted small">No assets</div>';
    renderAssetDatalist();
  }

  function renderFinalizedList() {
    const foods = [...state.foods].sort((a, b) => {
      const doneDelta = Number(isFinalizedFood(b)) - Number(isFinalizedFood(a));
      return doneDelta || String(a.name || a.id).localeCompare(String(b.name || b.id));
    });
    const finalizedCount = foods.filter(isFinalizedFood).length;
    els.finalizedSummary.textContent = `${finalizedCount}/${foods.length}`;
    els.finalizedList.innerHTML = foods.map(food => {
      const finalized = isFinalizedFood(food);
      const locked = isConfigFinalisedFood(food);
      return `<div class="finalized-row${food.id === state.selectedFoodId ? ' active' : ''}">
        <input
          type="checkbox"
          data-finalized-food-id="${escapeHtml(food.id)}"
          ${finalized ? 'checked' : ''}
          ${locked ? 'disabled' : ''}
          aria-label="${escapeHtml(`Finalised ${food.name || food.id}`)}"
        />
        <button type="button" data-food-id="${escapeHtml(food.id)}">
          <strong>${escapeHtml(food.name || food.id)}</strong>
          <span>${escapeHtml(food.foodTypeLabel || prettyFoodType(food.foodType))}${locked ? ' · sample' : ''}</span>
        </button>
      </div>`;
    }).join('') || '<div class="muted small">No foods</div>';
  }

  function loadFoodForm() {
    const food = effectiveFoodById(state.selectedFoodId);
    if (!food) return;
    const entry = foodEntryForForm(food);
    const base = baseFoodById(food.id);

    els.selectedFoodTitle.textContent = entry.name || entry.id || 'Food Library';
    els.selectedFoodMeta.textContent = `${base ? 'Generated food' : 'Database food'} · ${entry.id}`;
    els.openDbv2.href = `../display-builder-v2/?videoBuilderExportFood=${encodeURIComponent(entry.id)}`;
    els.openVbv2.href = '../video-builder-v2/';

    setInput(els.foodId, entry.id);
    els.foodId.readOnly = true;
    setInput(els.foodName, entry.name);
    setInput(els.displayName, entry.displayName || entry.header?.displayName || '');
    setInput(els.shortName, entry.shortName);
    setInput(els.foodType, entry.foodType || 'misc');
    setInput(els.foodTypeLabel, entry.foodTypeLabel || '');
    setInput(els.basisValue, entry.basis?.value ?? 100);
    setInput(els.basisUnit, entry.basis?.unit || 'g');
    setInput(els.kcal, entry.header?.kcal ?? food.kcal ?? '');
    setInput(els.fatG, entry.header?.fat_g ?? '');
    setInput(els.carbG, entry.header?.carb_g ?? entry.header?.carbs_g ?? '');
    setInput(els.proteinG, entry.header?.protein_g ?? '');
    setInput(els.nameMaxFontSize, entry.headerNameMaxFontSize || entry.header?.nameMaxFontSize || '');
    setInput(els.nameMinFontSize, entry.headerNameMinFontSize || entry.header?.nameMinFontSize || '');
    setInput(els.nameWidthRatio, entry.headerNameFontWidthRatio || entry.header?.nameFontWidthRatio || '');
    els.finalizedDownloaded.checked = isFinalizedFood(food);
    els.finalizedDownloaded.disabled = isConfigFinalisedFood(food);
    setInput(els.foodSpritePath, entry.customFoodImagePath || entry.foodSpritePath || entry.assets?.customFoodImage?.path || '');
    setInput(els.foodSpriteWidth, entry.customFoodImageWidth || entry.assets?.customFoodImage?.width || '');
    setInput(els.foodSpriteHeight, entry.customFoodImageHeight || entry.assets?.customFoodImage?.height || '');
    setInput(els.audioPath, entry.audioPath || entry.library?.audioPath || '');
    setInput(els.audioTake, entry.audioTake || entry.library?.audioTake || '');
    setInput(els.splitAudioManifestPath, entry.splitAudioManifestPath || entry.library?.splitAudioManifestPath || '');
    setInput(els.videoDownloadPath, entry.videoDownloadPath || entry.library?.videoDownloadPath || '');
    els.metricsJson.value = JSON.stringify(entry.metrics || {}, null, 2);
    els.foodPatchJson.value = JSON.stringify(entry.foodPatch || {}, null, 2);
    els.scriptText.value = entry.scriptText || entry.narrationText || entry.library?.scriptText || '';
    els.notes.value = entry.notes || '';
    els.restoreFood.hidden = !DB.foodEntryForId(food.id, state.db)?.deleted;
  }

  function renderAll() {
    renderStats();
    renderUniversal();
    renderFoodList();
    renderAssetLibrary();
    renderFinalizedList();
    loadFoodForm();
  }

  function selectedFormEntry() {
    const id = clean(els.foodId.value);
    if (!id) throw new Error('Food ID is required.');
    const header = {
      kcal: numberInputValue(els.kcal),
      fat_g: numberInputValue(els.fatG),
      carb_g: numberInputValue(els.carbG),
      protein_g: numberInputValue(els.proteinG)
    };
    Object.keys(header).forEach(key => {
      if (header[key] == null) delete header[key];
    });
    const maxFont = numberInputValue(els.nameMaxFontSize);
    const minFont = numberInputValue(els.nameMinFontSize);
    const widthRatio = numberInputValue(els.nameWidthRatio);
    if (clean(els.displayName.value)) header.displayName = clean(els.displayName.value);
    if (maxFont != null) header.nameMaxFontSize = maxFont;
    if (minFont != null) header.nameMinFontSize = minFont;
    if (widthRatio != null) header.nameFontWidthRatio = widthRatio;

    const metrics = parseJsonField(els.metricsJson, {});
    const foodPatch = parseJsonField(els.foodPatchJson, {});
    return {
      id,
      name: clean(els.foodName.value) || id,
      displayName: clean(els.displayName.value),
      shortName: clean(els.shortName.value),
      foodType: clean(els.foodType.value) || 'misc',
      foodTypeLabel: clean(els.foodTypeLabel.value),
      basis: {
        value: numberInputValue(els.basisValue) ?? 100,
        unit: clean(els.basisUnit.value) || 'g'
      },
      header,
      metrics,
      foodPatch,
      headerNameMaxFontSize: maxFont,
      headerNameMinFontSize: minFont,
      headerNameFontWidthRatio: widthRatio,
      finalizedDownloaded: Boolean(els.finalizedDownloaded.checked),
      customFoodImagePath: clean(els.foodSpritePath.value),
      customFoodImageWidth: numberInputValue(els.foodSpriteWidth),
      customFoodImageHeight: numberInputValue(els.foodSpriteHeight),
      audioPath: clean(els.audioPath.value),
      audioTake: clean(els.audioTake.value),
      splitAudioManifestPath: clean(els.splitAudioManifestPath.value),
      videoDownloadPath: clean(els.videoDownloadPath.value),
      scriptText: els.scriptText.value.trim(),
      notes: els.notes.value.trim()
    };
  }

  function saveSelectedFood() {
    try {
      const entry = selectedFormEntry();
      state.db = DB.upsertFoodEntry(entry.id, entry);
      refreshFoods();
      state.selectedFoodId = entry.id;
      renderAll();
      status('Food saved.');
    } catch (error) {
      status(error.message || 'Food save failed.', 'warn');
    }
  }

  function setFoodFinalizedDownloaded(foodId, checked) {
    const food = effectiveFoodById(foodId) || baseFoodById(foodId);
    if (!food || isConfigFinalisedFood(food)) return;
    const entry = foodEntryForForm(food);
    entry.finalizedDownloaded = Boolean(checked);
    state.db = DB.upsertFoodEntry(foodId, entry);
    refreshFoods();
    state.selectedFoodId = foodId;
    renderAll();
    status(`${food.name || food.id} ${checked ? 'marked finalised.' : 'marked not finalised.'}`);
  }

  function saveUniversal() {
    const db = DB.read();
    document.querySelectorAll('[data-universal-group][data-universal-key]').forEach(input => {
      const group = input.dataset.universalGroup;
      const key = input.dataset.universalKey;
      if (!db.universalUi[group]) db.universalUi[group] = {};
      db.universalUi[group][key] = clean(input.value);
    });
    state.db = DB.write(db);
    refreshFoods();
    renderAll();
    status('Universal UI saved.');
  }

  function addFood() {
    const id = clean(window.prompt('Food ID'));
    if (!id) return;
    const name = clean(window.prompt('Food name', id.replace(/-/g, ' '))) || id;
    const entry = {
      id,
      name,
      foodType: 'misc',
      foodTypeLabel: 'Misc',
      basis: { value: 100, unit: 'g' },
      header: { kcal: 0, fat_g: 0, carb_g: 0, protein_g: 0 },
      metrics: {},
      foodPatch: autoFoodSpecificPatch(id),
      finalizedDownloaded: false,
      notes: 'Starter SFX, music, and voice assets were auto-assigned. Upload the food sprite, script, and audio before final production.'
    };
    state.db = DB.upsertFoodEntry(id, entry);
    refreshFoods();
    state.selectedFoodId = id;
    renderAll();
    status('Food added with randomized starter assets.');
  }

  function deleteSelectedFood() {
    const food = effectiveFoodById(state.selectedFoodId);
    if (!food) return;
    if (!window.confirm(`Delete ${food.name || food.id} from the database view?`)) return;
    state.db = DB.deleteFoodEntry(food.id);
    refreshFoods({ keepSelection: false });
    renderAll();
    status('Food deleted.');
  }

  function restoreSelectedFood() {
    const id = clean(els.foodId.value);
    if (!id) return;
    const entry = DB.foodEntryForId(id, state.db);
    if (!entry) return;
    entry.deleted = false;
    state.db = DB.upsertFoodEntry(id, entry);
    refreshFoods();
    state.selectedFoodId = id;
    renderAll();
    status('Food restored.');
  }

  function exportDatabase() {
    const blob = new Blob([JSON.stringify(DB.read(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'foodranked-database-v1.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function importDatabase(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state.db = DB.write(DB.normalizeDatabase(JSON.parse(String(reader.result || '{}'))));
        refreshFoods({ keepSelection: false });
        renderAll();
        status('Database imported.');
      } catch (error) {
        status(error.message || 'Import failed.', 'warn');
      }
    };
    reader.readAsText(file);
  }

  function resetDatabase() {
    if (!window.confirm('Reset the local FoodRanked database?')) return;
    state.db = DB.write(DB.defaultDatabase());
    refreshFoods({ keepSelection: false });
    renderAll();
    status('Database reset.');
  }

  function onFoodButtonClick(event) {
    const button = event.target.closest('[data-food-id]');
    if (!button) return;
    state.selectedFoodId = button.dataset.foodId;
    renderAll();
  }

  function bindEvents() {
    els.foodSearch.addEventListener('input', () => {
      state.filter = els.foodSearch.value || '';
      renderFoodList();
    });
    els.foodList.addEventListener('click', onFoodButtonClick);
    els.finalizedList.addEventListener('click', onFoodButtonClick);
    els.finalizedList.addEventListener('change', event => {
      const checkbox = event.target.closest('[data-finalized-food-id]');
      if (!checkbox) return;
      setFoodFinalizedDownloaded(checkbox.dataset.finalizedFoodId, checkbox.checked);
    });
    els.assetSearch.addEventListener('input', () => {
      state.assetFilter = els.assetSearch.value || '';
      renderAssetLibrary();
    });
    els.assetList.addEventListener('click', event => {
      const button = event.target.closest('[data-asset-ref]');
      if (!button) return;
      navigator.clipboard?.writeText(button.dataset.assetRef);
      status(`Copied ${button.dataset.assetRef}`);
    });
    els.addFood.addEventListener('click', addFood);
    els.saveFood.addEventListener('click', saveSelectedFood);
    els.deleteFood.addEventListener('click', deleteSelectedFood);
    els.restoreFood.addEventListener('click', restoreSelectedFood);
    els.saveUniversal.addEventListener('click', saveUniversal);
    els.exportDatabase.addEventListener('click', exportDatabase);
    els.importDatabase.addEventListener('change', () => importDatabase(els.importDatabase.files?.[0]));
    els.resetDatabase.addEventListener('click', resetDatabase);
    window.addEventListener('storage', event => {
      if (event.key !== DB.STORAGE_KEY) return;
      refreshFoods();
      renderAll();
    });
  }

  function init() {
    renderFoodTypes();
    refreshFoods({ keepSelection: false });
    bindEvents();
    renderAll();
    status('Database ready.');
  }

  init();
})();
