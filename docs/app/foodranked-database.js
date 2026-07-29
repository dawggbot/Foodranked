(function () {
  const STORAGE_KEY = 'foodranked-production-database-v1';
  const SCHEMA_VERSION = 'foodranked-production-database.v1';
  const ASSET_REF_PREFIX = 'frdb://asset/';
  let defaultAssetsCache = null;

  const DEFAULT_UNIVERSAL_UI = Object.freeze({
    sprites: Object.freeze({
      introRanked: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.ranked`,
      tierS: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.s.tier`,
      tierA: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.a.tier`,
      tierB: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.b.tier`,
      tierC: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.c.tier`,
      tierD: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.d.tier`,
      tierSlop: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.slop`,
      outroLike: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.like`,
      outroFollow: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.follow`,
      outroShare: `${ASSET_REF_PREFIX}app.sprites.ui.intro.outro.share`
    }),
    sfx: Object.freeze({
      stampImpact: `${ASSET_REF_PREFIX}audio.sfx.stamps.impact.stamp.hit`,
      sTierStamp: `${ASSET_REF_PREFIX}audio.sfx.stamps.s.tier.stamp.level.up`,
      dTierGameLose: `${ASSET_REF_PREFIX}audio.sfx.stamps.d.tier.game.fail`,
      dTierDeath: `${ASSET_REF_PREFIX}audio.sfx.stamps.d.tier.death.collapse`,
      sectionTransition: `${ASSET_REF_PREFIX}audio.sfx.transitions.section.transition.whoosh`,
      micronBarConfirm: `${ASSET_REF_PREFIX}audio.sfx.sections.microns.micron.bar.confirm.tap`,
      micron100Lead: `${ASSET_REF_PREFIX}audio.sfx.sections.microns.micron.100.firework.lead.pop`,
      micron100Cluster: `${ASSET_REF_PREFIX}audio.sfx.sections.microns.micron.100.firework.cluster`,
      majorProSparkle: `${ASSET_REF_PREFIX}audio.sfx.sections.pros.major.pro.sparkle.shine`,
      majorConSiren: `${ASSET_REF_PREFIX}audio.sfx.sections.cons.major.con.siren.buzzer`,
      highlightGlow: `${ASSET_REF_PREFIX}audio.sfx.ui.highlight.glow.loop`,
      macroBarFill: `${ASSET_REF_PREFIX}audio.sfx.sections.macros.macro.bar.fill.highscore`
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

  function assetRef(id) {
    const cleanId = cleanString(id);
    return cleanId ? `${ASSET_REF_PREFIX}${cleanId}` : '';
  }

  function normalizeAssetEntry(id, value) {
    const source = value && typeof value === 'object' ? clone(value) : {};
    const path = cleanPath(source.path || source.url || '');
    const cleanId = cleanString(source.id || id);
    return {
      id: cleanId,
      label: cleanString(source.label) || cleanId,
      kind: cleanString(source.kind) || 'asset',
      path,
      mimeType: cleanString(source.mimeType),
      sizeBytes: finiteNumber(source.sizeBytes, null),
      source: cleanString(source.source) || 'app-bundle'
    };
  }

  function defaultAssets() {
    if (defaultAssetsCache) return clone(defaultAssetsCache);
    const files = {};
    const source = Array.isArray(window.FOODRANKED_APP_ASSETS) ? window.FOODRANKED_APP_ASSETS : [];
    source.forEach(entry => {
      const normalized = normalizeAssetEntry(entry?.id, entry);
      if (normalized.id && normalized.path) files[normalized.id] = normalized;
    });
    defaultAssetsCache = { files };
    return clone(defaultAssetsCache);
  }

  function normalizedAssetLookupPath(value) {
    const clean = cleanPath(value).split('#')[0].split('?')[0];
    if (!clean) return '';
    if (clean.startsWith('./sprites/')) return `app/${clean.slice(2)}`;
    if (clean.startsWith('sprites/')) return `app/${clean}`;
    if (clean.startsWith('../app/')) return clean.slice(3);
    if (clean.startsWith('./app/')) return clean.slice(2);
    if (clean.startsWith('../audio/')) return clean.slice(3);
    if (clean.startsWith('./audio/')) return clean.slice(2);
    if (clean.startsWith('../video/')) return clean.slice(3);
    if (clean.startsWith('./video/')) return clean.slice(2);
    if (clean.startsWith('../data/')) return clean.slice(3);
    if (clean.startsWith('./data/')) return clean.slice(2);
    return clean;
  }

  function assetRefForPath(path, db = null) {
    const lookup = normalizedAssetLookupPath(path);
    if (!lookup) return '';
    const files = db?.assets?.files || defaultAssets().files;
    const match = Object.values(files).find(asset => normalizedAssetLookupPath(asset.path) === lookup);
    return match?.id ? assetRef(match.id) : '';
  }

  function defaultDatabase() {
    return {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: '',
      universalUi: clone(DEFAULT_UNIVERSAL_UI),
      assets: defaultAssets(),
      foods: {}
    };
  }

  function normalizeUniversalUi(value) {
    const source = value && typeof value === 'object' ? value : {};
    const coerceGroup = group => Object.fromEntries(Object.entries(group).map(([key, path]) => [
      key,
      cleanPath(path).startsWith(ASSET_REF_PREFIX) ? path : assetRefForPath(path) || path
    ]));
    return {
      sprites: coerceGroup({
        ...clone(DEFAULT_UNIVERSAL_UI.sprites),
        ...(source.sprites && typeof source.sprites === 'object' ? source.sprites : {})
      }),
      sfx: coerceGroup({
        ...clone(DEFAULT_UNIVERSAL_UI.sfx),
        ...(source.sfx && typeof source.sfx === 'object' ? source.sfx : {})
      })
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

  function normalizeAssets(value) {
    const normalized = defaultAssets();
    const source = value && typeof value === 'object' ? value : {};
    const files = source.files && typeof source.files === 'object' ? source.files : {};
    Object.entries(files).forEach(([id, entry]) => {
      const normalizedEntry = normalizeAssetEntry(id, entry);
      if (normalizedEntry.id && normalizedEntry.path) normalized.files[normalizedEntry.id] = normalizedEntry;
    });
    return normalized;
  }

  function normalizeDatabase(value) {
    const db = value && typeof value === 'object' ? clone(value) : defaultDatabase();
    const normalized = {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: cleanString(db.updatedAt),
      universalUi: normalizeUniversalUi(db.universalUi),
      assets: normalizeAssets(db.assets),
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDatabase();
    return normalizeDatabase(readJson(raw, defaultDatabase()));
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

  function assetIdFromRef(ref) {
    const clean = cleanString(ref);
    return clean.startsWith(ASSET_REF_PREFIX) ? clean.slice(ASSET_REF_PREFIX.length) : '';
  }

  function assetEntryForRef(ref, db = read()) {
    const id = assetIdFromRef(ref);
    return id ? db.assets?.files?.[id] || null : null;
  }

  function assetPath(refOrPath, fallback = '', db = read()) {
    const value = cleanPath(refOrPath);
    if (!value) return fallback || '';
    if (!value.startsWith(ASSET_REF_PREFIX)) return value;
    return cleanPath(assetEntryForRef(value, db)?.path) || fallback || '';
  }

  function universalSpritePath(key, fallback = '') {
    const db = read();
    const value = pathOrFallback(db.universalUi.sprites?.[key], DEFAULT_UNIVERSAL_UI.sprites[key]);
    return assetPath(value, fallback, db);
  }

  function universalSfxPath(key, fallback = '') {
    const db = read();
    const value = pathOrFallback(db.universalUi.sfx?.[key], DEFAULT_UNIVERSAL_UI.sfx[key]);
    return assetPath(value, fallback, db);
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

  function applyFoodEntry(baseFood, entry, db = read()) {
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
        path: assetPath(customFoodImagePath, customFoodImagePath, db)
      };
      if (width != null) merged.assets.customFoodImage.width = width;
      if (height != null) merged.assets.customFoodImage.height = height;
    }

    const episode = mergeObjects(base.episode, entry.episode);
    const scriptText = cleanString(entry.scriptText || entry.narrationText || entry.library?.scriptText);
    const script = scriptFromText(scriptText, merged, episode.script);
    if (script) episode.script = script;

    const audioPath = assetPath(entry.audioPath || entry.library?.audioPath, '', db);
    if (audioPath) {
      episode.audio = {
        ...(episode.audio || {}),
        path: audioPath,
        take: cleanString(entry.audioTake || entry.library?.audioTake) || episode.audio?.take || 'database'
      };
    }

    const splitManifestPath = assetPath(entry.splitAudioManifestPath || entry.library?.splitAudioManifestPath, '', db);
    if (splitManifestPath) {
      episode.splitAudio = {
        ...(episode.splitAudio || {}),
        manifestPath: splitManifestPath,
        take: cleanString(entry.splitAudioTake || entry.library?.splitAudioTake) || episode.splitAudio?.take || 'database'
      };
    }

    const videoPath = assetPath(entry.videoDownloadPath || entry.library?.videoDownloadPath, '', db);
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
    return entry ? applyFoodEntry(food, entry, db) : food;
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
      foods.push(entry ? applyFoodEntry(food, entry, db) : food);
    });
    Object.values(db.foods || {}).forEach(entry => {
      if (!entry?.id || seen.has(entry.id) || entry.deleted) return;
      foods.push(applyFoodEntry(baseFoodFromEntry(entry), entry, db));
    });
    return foods.filter(Boolean);
  }

  function assetEntries(db = read()) {
    return Object.values(db.assets?.files || {}).sort((a, b) => (
      String(a.kind || '').localeCompare(String(b.kind || '')) ||
      String(a.path || '').localeCompare(String(b.path || ''))
    ));
  }

  function upsertAssetEntry(id, patch) {
    const cleanId = cleanString(id || patch?.id);
    if (!cleanId) throw new Error('Asset id is required.');
    const db = read();
    if (!db.assets) db.assets = { files: {} };
    if (!db.assets.files) db.assets.files = {};
    db.assets.files[cleanId] = normalizeAssetEntry(cleanId, {
      ...(db.assets.files[cleanId] || {}),
      ...(patch || {}),
      id: cleanId
    });
    return write(db);
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
    ASSET_REF_PREFIX,
    DEFAULT_UNIVERSAL_UI,
    clone,
    assetRef,
    assetRefForPath,
    assetPath,
    assetEntries,
    assetEntryForRef,
    upsertAssetEntry,
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
