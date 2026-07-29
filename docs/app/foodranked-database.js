(function () {
  const STORAGE_KEY = 'foodranked-production-database-v1';
  const SCHEMA_VERSION = 'foodranked-production-database.v1';

  const DEFAULT_UNIVERSAL_UI = Object.freeze({
    sprites: Object.freeze({
      introRanked: './sprites/ui/intro_&_outro/ranked.png',
      tierS: './sprites/ui/intro_&_outro/S_tier.png',
      tierA: './sprites/ui/intro_&_outro/A_tier.png',
      tierB: './sprites/ui/intro_&_outro/B_tier.png',
      tierC: './sprites/ui/intro_&_outro/C_tier.png',
      tierD: './sprites/ui/intro_&_outro/D_tier.png',
      tierSlop: './sprites/ui/intro_&_outro/slop.png?v=20260729-slop-sprite-upload-v1',
      outroLike: './sprites/ui/intro_&_outro/like.png',
      outroFollow: './sprites/ui/intro_&_outro/follow.png',
      outroShare: './sprites/ui/intro_&_outro/share.png'
    }),
    sfx: Object.freeze({
      stampImpact: 'audio/sfx/stamps/impact_stamp_hit.mp3',
      sTierStamp: 'audio/sfx/stamps/s_tier_stamp_level_up.mp3',
      dTierGameLose: 'audio/sfx/stamps/d_tier_game_fail.mp3',
      dTierDeath: 'audio/sfx/stamps/d_tier_death_collapse.mp3',
      sectionTransition: 'audio/sfx/transitions/section_transition_whoosh.mp3',
      micronBarConfirm: 'audio/sfx/sections/microns/micron_bar_confirm_tap.mp3',
      micron100Lead: 'audio/sfx/sections/microns/micron_100_firework_lead_pop.mp3',
      micron100Cluster: 'audio/sfx/sections/microns/micron_100_firework_cluster.mp3',
      majorProSparkle: 'audio/sfx/sections/pros/major_pro_sparkle_shine.mp3',
      majorConSiren: 'audio/sfx/sections/cons/major_con_siren_buzzer.mp3',
      highlightGlow: 'audio/sfx/ui/highlight_glow_loop.mp3',
      macroBarFill: 'audio/sfx/sections/macros/macro_bar_fill_highscore.mp3'
    })
  });

  const SECTION_KEYS = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals', 'pros', 'cons'];

  function clone(value) {
    if (value == null) return value;
    try {
      if (typeof structuredClone === 'function') return structuredClone(value);
    } catch {}
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(raw, fallback) {
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function cleanString(value) {
    return String(value ?? '').trim();
  }

  function cleanPath(value) {
    return cleanString(value);
  }

  function finiteNumber(value, fallback = null) {
    if (value === '' || value == null) return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function defaultDatabase() {
    return {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: '',
      universalUi: clone(DEFAULT_UNIVERSAL_UI),
      foods: {}
    };
  }

  function normalizeUniversalUi(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      sprites: {
        ...clone(DEFAULT_UNIVERSAL_UI.sprites),
        ...(source.sprites && typeof source.sprites === 'object' ? source.sprites : {})
      },
      sfx: {
        ...clone(DEFAULT_UNIVERSAL_UI.sfx),
        ...(source.sfx && typeof source.sfx === 'object' ? source.sfx : {})
      }
    };
  }

  function normalizeFoodEntry(id, value) {
    const entry = value && typeof value === 'object' ? clone(value) : {};
    entry.id = cleanString(entry.id || id);
    entry.header = entry.header && typeof entry.header === 'object' ? entry.header : {};
    entry.metrics = entry.metrics && typeof entry.metrics === 'object' ? entry.metrics : {};
    entry.assets = entry.assets && typeof entry.assets === 'object' ? entry.assets : {};
    entry.episode = entry.episode && typeof entry.episode === 'object' ? entry.episode : {};
    entry.status = entry.status && typeof entry.status === 'object' ? entry.status : {};
    entry.library = entry.library && typeof entry.library === 'object' ? entry.library : {};
    entry.foodPatch = entry.foodPatch && typeof entry.foodPatch === 'object' && !Array.isArray(entry.foodPatch) ? entry.foodPatch : {};
    entry.deleted = Boolean(entry.deleted);
    entry.finalizedDownloaded = Boolean(entry.finalizedDownloaded || entry.status.finalizedDownloaded);
    entry.status.finalizedDownloaded = entry.finalizedDownloaded;
    return entry;
  }

  function normalizeDatabase(value) {
    const db = value && typeof value === 'object' ? clone(value) : defaultDatabase();
    const normalized = {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: cleanString(db.updatedAt),
      universalUi: normalizeUniversalUi(db.universalUi),
      foods: {}
    };
    const foods = db.foods && typeof db.foods === 'object' ? db.foods : {};
    Object.entries(foods).forEach(([id, entry]) => {
      const normalizedEntry = normalizeFoodEntry(id, entry);
      if (normalizedEntry.id) normalized.foods[normalizedEntry.id] = normalizedEntry;
    });
    return normalized;
  }

  function read() {
    return normalizeDatabase(readJson(localStorage.getItem(STORAGE_KEY), defaultDatabase()));
  }

  function write(db) {
    const normalized = normalizeDatabase(db);
    normalized.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('foodranked-database-change', { detail: { storageKey: STORAGE_KEY } }));
    return normalized;
  }

  function pathOrFallback(value, fallback) {
    const path = cleanPath(value);
    return path || fallback || '';
  }

  function universalSpritePath(key, fallback = '') {
    const db = read();
    return pathOrFallback(db.universalUi.sprites?.[key], fallback || DEFAULT_UNIVERSAL_UI.sprites[key]);
  }

  function universalSfxPath(key, fallback = '') {
    const db = read();
    return pathOrFallback(db.universalUi.sfx?.[key], fallback || DEFAULT_UNIVERSAL_UI.sfx[key]);
  }

  function setPath(target, path, value) {
    let node = target;
    for (let index = 0; index < path.length - 1; index += 1) {
      const key = path[index];
      if (!node[key] || typeof node[key] !== 'object') node[key] = {};
      node = node[key];
    }
    node[path[path.length - 1]] = value;
  }

  function mergeObjects(base, patch) {
    return {
      ...(base && typeof base === 'object' ? base : {}),
      ...(patch && typeof patch === 'object' ? patch : {})
    };
  }

  function deepMerge(base, patch) {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return clone(base);
    const output = base && typeof base === 'object' && !Array.isArray(base) ? clone(base) : {};
    Object.entries(patch).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        output[key] = deepMerge(output[key], value);
      } else {
        output[key] = clone(value);
      }
    });
    return output;
  }

  function narrationBlocksFromText(text, food) {
    const blocks = cleanString(text)
      .split(/\r?\n\s*-\s*\r?\n/g)
      .map(block => cleanString(block))
      .filter(Boolean);
    if (!blocks.length) return [];
    return blocks.map((block, index) => {
      if (index === 0) return { kind: 'hook', text: block };
      if (index === 1) return { kind: 'ranked', text: block };
      const sectionIndex = index - 2;
      if (sectionIndex >= 0 && sectionIndex < SECTION_KEYS.length) {
        return { kind: 'section', sectionKey: SECTION_KEYS[sectionIndex], text: block };
      }
      if (index === blocks.length - 2) return { kind: 'closing_summary', text: block };
      if (index === blocks.length - 1) return { kind: 'final_reveal', text: block };
      return { kind: `block_${index + 1}`, text: block };
    }).map((block, index) => ({
      id: `${String(food?.id || 'food')}-database-block-${index + 1}`,
      index: index + 1,
      ...block
    }));
  }

  function scriptFromText(text, food, existingScript) {
    const clean = cleanString(text);
    if (!clean) return existingScript || null;
    const blocks = narrationBlocksFromText(clean, food);
    const sectionBlocks = blocks.filter(block => block.kind === 'section');
    return {
      ...(existingScript && typeof existingScript === 'object' ? existingScript : {}),
      source: 'foodranked-database',
      narrationText: clean,
      narrationBlocks: blocks,
      sections: sectionBlocks.map(block => ({
        key: block.sectionKey,
        title: block.sectionKey,
        narration: block.text,
        subtitleText: block.text
      }))
    };
  }

  function applyFoodEntry(baseFood, entry) {
    if (!entry || entry.deleted) return null;
    const base = deepMerge(baseFood || {}, entry.foodPatch || {});
    const merged = {
      ...base,
      databaseEntry: {
        id: entry.id,
        updatedAt: entry.updatedAt || '',
        finalizedDownloaded: Boolean(entry.finalizedDownloaded),
        notes: cleanString(entry.notes)
      }
    };

    ['id', 'name', 'displayName', 'shortName', 'foodType', 'foodTypeLabel', 'identity', 'expectedTier', 'tier'].forEach(key => {
      const value = cleanString(entry[key]);
      if (value) merged[key] = value;
    });

    merged.basis = mergeObjects(base.basis, entry.basis);
    merged.header = mergeObjects(base.header, entry.header);
    merged.metrics = mergeObjects(base.metrics, entry.metrics);
    merged.assets = mergeObjects(base.assets, entry.assets);
    merged.status = {
      ...(base.status && typeof base.status === 'object' ? base.status : {}),
      ...(entry.status && typeof entry.status === 'object' ? entry.status : {}),
      finalizedDownloaded: Boolean(entry.finalizedDownloaded)
    };
    merged.finalizedDownloaded = Boolean(entry.finalizedDownloaded);

    const customFoodImagePath = cleanPath(entry.customFoodImagePath || entry.foodSpritePath || entry.assets?.customFoodImage?.path);
    if (customFoodImagePath) {
      const width = finiteNumber(entry.customFoodImageWidth || entry.assets?.customFoodImage?.width, null);
      const height = finiteNumber(entry.customFoodImageHeight || entry.assets?.customFoodImage?.height, null);
      merged.assets.customFoodImage = {
        ...(merged.assets.customFoodImage || {}),
        path: customFoodImagePath
      };
      if (width != null) merged.assets.customFoodImage.width = width;
      if (height != null) merged.assets.customFoodImage.height = height;
    }

    const episode = mergeObjects(base.episode, entry.episode);
    const scriptText = cleanString(entry.scriptText || entry.narrationText || entry.library?.scriptText);
    const script = scriptFromText(scriptText, merged, episode.script);
    if (script) episode.script = script;

    const audioPath = cleanPath(entry.audioPath || entry.library?.audioPath);
    if (audioPath) {
      episode.audio = {
        ...(episode.audio || {}),
        path: audioPath,
        take: cleanString(entry.audioTake || entry.library?.audioTake) || episode.audio?.take || 'database'
      };
    }

    const splitManifestPath = cleanPath(entry.splitAudioManifestPath || entry.library?.splitAudioManifestPath);
    if (splitManifestPath) {
      episode.splitAudio = {
        ...(episode.splitAudio || {}),
        manifestPath: splitManifestPath,
        take: cleanString(entry.splitAudioTake || entry.library?.splitAudioTake) || episode.splitAudio?.take || 'database'
      };
    }

    const videoPath = cleanPath(entry.videoDownloadPath || entry.library?.videoDownloadPath);
    if (videoPath) {
      episode.videoDownload = {
        ...(episode.videoDownload || {}),
        mp4Path: videoPath
      };
    }

    merged.episode = episode;
    return merged;
  }

  function applyToFood(food, db = read()) {
    if (!food?.id) return food || null;
    const entry = db.foods?.[food.id];
    return entry ? applyFoodEntry(food, entry) : food;
  }

  function baseFoodFromEntry(entry) {
    return {
      id: entry.id,
      name: entry.name || entry.displayName || entry.id,
      displayName: entry.displayName || '',
      shortName: entry.shortName || '',
      foodType: entry.foodType || 'misc',
      foodTypeLabel: entry.foodTypeLabel || '',
      basis: entry.basis || { value: 100, unit: 'g' },
      kcal: finiteNumber(entry.header?.kcal ?? entry.kcal, null),
      header: entry.header || {},
      metrics: entry.metrics || {},
      path: '',
      sourceFile: '',
      customDatabaseFood: true
    };
  }

  function applyToFoods(baseFoods, db = read()) {
    const source = Array.isArray(baseFoods) ? baseFoods : [];
    const seen = new Set();
    const foods = [];
    source.forEach(food => {
      if (!food?.id) return;
      seen.add(food.id);
      const entry = db.foods?.[food.id];
      if (entry?.deleted) return;
      foods.push(entry ? applyFoodEntry(food, entry) : food);
    });
    Object.values(db.foods || {}).forEach(entry => {
      if (!entry?.id || seen.has(entry.id) || entry.deleted) return;
      foods.push(applyFoodEntry(baseFoodFromEntry(entry), entry));
    });
    return foods.filter(Boolean);
  }

  function foodEntryForId(id, db = read()) {
    return db.foods?.[id] ? normalizeFoodEntry(id, db.foods[id]) : null;
  }

  function upsertFoodEntry(id, patch) {
    const cleanId = cleanString(id || patch?.id);
    if (!cleanId) throw new Error('Food id is required.');
    const db = read();
    db.foods[cleanId] = normalizeFoodEntry(cleanId, {
      ...(db.foods[cleanId] || {}),
      ...(patch || {}),
      id: cleanId,
      deleted: false
    });
    db.foods[cleanId].updatedAt = new Date().toISOString();
    return write(db);
  }

  function deleteFoodEntry(id) {
    const cleanId = cleanString(id);
    if (!cleanId) return read();
    const db = read();
    db.foods[cleanId] = normalizeFoodEntry(cleanId, {
      ...(db.foods[cleanId] || {}),
      id: cleanId,
      deleted: true,
      updatedAt: new Date().toISOString()
    });
    return write(db);
  }

  function isFinalizedDownloaded(foodOrId, db = read()) {
    const id = typeof foodOrId === 'string' ? foodOrId : foodOrId?.id;
    if (!id) return false;
    return Boolean(db.foods?.[id]?.finalizedDownloaded || foodOrId?.finalizedDownloaded || foodOrId?.status?.finalizedDownloaded);
  }

  function stats(baseFoods, db = read()) {
    const foods = applyToFoods(baseFoods, db);
    const finalized = foods.filter(food => isFinalizedDownloaded(food, db)).length;
    return {
      total: foods.length,
      finalized,
      unfinished: Math.max(0, foods.length - finalized),
      deleted: Object.values(db.foods || {}).filter(entry => entry?.deleted).length,
      custom: foods.filter(food => food?.customDatabaseFood).length
    };
  }

  window.FOODRANKED_DATABASE = {
    STORAGE_KEY,
    SCHEMA_VERSION,
    DEFAULT_UNIVERSAL_UI,
    clone,
    defaultDatabase,
    normalizeDatabase,
    read,
    write,
    universalSpritePath,
    universalSfxPath,
    applyToFood,
    applyToFoods,
    foodEntryForId,
    upsertFoodEntry,
    deleteFoodEntry,
    isFinalizedDownloaded,
    stats,
    setPath
  };
})();
