const state = {
  data: null,
  filtered: [],
  selectedFood: null,
  activeTab: 'overview'
};

const els = {
  searchInput: document.getElementById('searchInput'),
  typeFilter: document.getElementById('typeFilter'),
  tierFilter: document.getElementById('tierFilter'),
  foodCount: document.getElementById('foodCount'),
  foodList: document.getElementById('foodList'),
  foodName: document.getElementById('foodName'),
  foodMeta: document.getElementById('foodMeta'),
  tierBadge: document.getElementById('tierBadge'),
  scoreBadge: document.getElementById('scoreBadge'),
  foodSummary: document.getElementById('foodSummary'),
  detailContent: document.getElementById('detailContent'),
  previewFoodName: document.getElementById('previewFoodName'),
  previewBasis: document.getElementById('previewBasis'),
  previewKcal: document.getElementById('previewKcal'),
  previewScoreText: document.getElementById('previewScoreText'),
  previewSceneChip: document.getElementById('previewSceneChip'),
  previewSceneChipText: document.getElementById('previewSceneChipText'),
  displayCanvas: document.getElementById('displayCanvas'),
  heroSprite: document.getElementById('heroSprite'),
  macroSprite: document.getElementById('macroSprite'),
  macroTitle: document.getElementById('macroTitle'),
  macroFill: document.getElementById('macroFill'),
  macroValue: document.getElementById('macroValue'),
  submetricList: document.getElementById('submetricList'),
  progressRow: document.getElementById('progressRow'),
  sceneSelect: document.getElementById('sceneSelect')
};

const sceneLabels = {
  overview: 'Heats',
  fats: 'Heats',
  carbs: 'Carbs',
  proteins: 'Protein',
  vitamins: 'Vitamins',
  minerals: 'Minerals',
  pros: 'Pros',
  cons: 'Cons',
  final: 'Verdict'
};

const tierClassMap = { S:'tier-S', A:'tier-A', B:'tier-B', C:'tier-C', D:'tier-D' };
const macroSpriteMap = {
  fats:'./assets/macro-fats-shield.gif',
  carbs:'./assets/macro-carbs-lightning.gif',
  proteins:'./assets/macro-protein-arm.gif',
  vitamins:'./assets/vitamin-icon.gif',
  minerals:'./assets/mineral-icon.gif'
};
const arrowSpriteMap = {
  up_good: './assets/green-arrow.png',
  down_good: './assets/green-arrow.png',
  up_bad: './assets/red-arrow.png',
  down_bad: './assets/red-arrow.png'
};
const sectionIndicatorMap = {
  idle: './assets/meat-section-indicator.png',
  active: './assets/meat-highlighted-section-indicator.png'
};
const heroSpriteMap = {
  grains: './assets/grains.png',
  meats: './assets/meats.png',
  fruits: './assets/fruit.png',
  vegetables: './assets/veg.png',
  dairy: './assets/dairy.png',
  legumes: './assets/legumes.png',
  nuts: './assets/nuts.png',
  seeds: './assets/seeds.png',
  'oils-and-fats': './assets/oil and fat.png',
  misc: './assets/misc.png',
  tubers: './assets/tubers.png'
};
const metricLabelMap = {
  saturated_fat_g: 'SATFAT',
  omega3_mg: 'OMEGA-3',
  polyunsaturated_fat_g: 'PUFA',
  cholesterol_mg: 'CHOLESTEROL',
  starch_g: 'STARCH',
  fibre_g: 'FIBRE',
  sugar_g: 'SUGAR',
  glycemic_index: 'GI',
  collagen_g: 'COLLAGEN',
  essential_amino_acids_score: 'EAAS',
  nonessential_amino_acids_score: 'NEAAS',
  bioavailability_percent: 'BIOAVAIL'
};
const sceneOrder = ['overview','fats','carbs','proteins','vitamins','minerals','final'];
const macroRangeBlueprint = {
  nuts: { fats:{ min:30, max:75 }, carbs:{ min:5, max:30 }, proteins:{ min:10, max:30 } },
  seeds: { fats:{ min:25, max:70 }, carbs:{ min:5, max:35 }, proteins:{ min:10, max:30 } },
  grains: { fats:{ min:1, max:10 }, carbs:{ min:50, max:85 }, proteins:{ min:5, max:18 } },
  legumes: { fats:{ min:1, max:10 }, carbs:{ min:40, max:65 }, proteins:{ min:15, max:30 } },
  fruits: { fats:{ min:0, max:5 }, carbs:{ min:8, max:25 }, proteins:{ min:0, max:4 } },
  vegetables: { fats:{ min:0, max:3 }, carbs:{ min:3, max:15 }, proteins:{ min:1, max:6 } },
  tubers: { fats:{ min:0, max:2 }, carbs:{ min:15, max:35 }, proteins:{ min:1, max:5 } },
  meats: { fats:{ min:2, max:35 }, carbs:{ min:0, max:1 }, proteins:{ min:15, max:30 } },
  dairy: { fats:{ min:0, max:35 }, carbs:{ min:3, max:10 }, proteins:{ min:3, max:25 } },
  'oils-and-fats': { fats:{ min:80, max:100 }, carbs:{ min:0, max:1 }, proteins:{ min:0, max:1 } },
  misc: { fats:{ min:0, max:1 }, carbs:{ min:0, max:1 }, proteins:{ min:0, max:1 } }
};

function fmtType(v){ return String(v||'').replace(/-/g,' '); }
function fmtBasis(food){ return `Per ${food?.basis?.value ?? 100}${food?.basis?.unit ?? 'g'}`; }
function compactBasis(food){ return `${food?.basis?.value ?? 100}${food?.basis?.unit ?? 'g'}`; }
function escapeHtml(str){return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function titleizeMetric(key){ return metricLabelMap[key] || String(key||'').replace(/_dv$/,'').replace(/_mg$/,'').replace(/_g$/,'').replace(/_percent$/,'').replace(/_/g,' ').toUpperCase(); }

function rulesForSection(food, section) {
  return food.ruleset?.metricRulesBySection?.[section] || [];
}

function deriveBarRange(rule) {
  const bands = Array.isArray(rule?.bands) ? rule.bands : [];
  const mins = bands.map(b => typeof b.min === 'number' ? b.min : null).filter(v => v != null);
  const maxs = bands.map(b => typeof b.max === 'number' ? b.max : null).filter(v => v != null);
  const fallbackMax = rule?.scoringMode === 'dv_points' ? 100 : 10;
  return { min: mins.length ? Math.min(...mins, 0) : 0, max: maxs.length ? Math.max(...maxs, fallbackMax) : fallbackMax };
}

function valueForMetric(food, metricKey) { return food.metrics?.[metricKey] ?? null; }

function formatMetricValue(metricKey, value, hideUnits = false) {
  if (value == null) return '—';
  if (/_dv$/.test(metricKey)) return `${value}% DV`;
  if (hideUnits) return `${value}`;
  if (/_mg$/.test(metricKey)) return `${value}mg`;
  if (/_g$/.test(metricKey)) return `${value}g`;
  if (/_percent$/.test(metricKey)) return `${value}%`;
  return `${value}`;
}

function arrowForRuleValue(rule, value) {
  if (value == null) return '·';
  const bands = Array.isArray(rule?.bands) ? rule.bands : [];
  const match = bands.find(b => (b.min == null || value >= b.min) && (b.max == null || value < b.max));
  return match?.label || '·';
}

function arrowMeta(rule, value) {
  const label = arrowForRuleValue(rule, value);
  const magnitude = (label.match(/[↑↓]/g) || []).length;
  const direction = label.includes('↓') ? 'down' : label.includes('↑') ? 'up' : 'flat';
  const isGood = rule?.polarity === 'lower_is_better' ? direction === 'down' : rule?.polarity === 'higher_is_better' ? direction === 'up' : true;
  return { magnitude, direction, isGood };
}

function arrowMarkup(rule, value) {
  const meta = arrowMeta(rule, value);
  if (!meta.magnitude || meta.direction === 'flat') return '<span>·</span>';
  const key = `${meta.direction}_${meta.isGood ? 'good' : 'bad'}`;
  return Array.from({ length: meta.magnitude }).map(() => `<img src="${arrowSpriteMap[key]}" alt="" />`).join('');
}

function macroHeaderMetricKey(scene) {
  return ({ fats:'fat_g', carbs:'carb_g', proteins:'protein_g' })[scene] || null;
}

function macroHeaderValue(food, scene) {
  return scene === 'fats' ? food.header?.fat_g : scene === 'carbs' ? food.header?.carb_g : scene === 'proteins' ? food.header?.protein_g : null;
}

function derivedMacroRange(food, scene) {
  const blueprint = macroRangeBlueprint[food.foodType]?.[scene];
  if (blueprint) return { ...blueprint };
  const metricKey = macroHeaderMetricKey(scene);
  const peers = (state.data?.foods || []).filter(item => item.foodType === food.foodType);
  const values = peers.map(item => Number(item.header?.[metricKey])).filter(value => Number.isFinite(value));
  if (!values.length) return { min: 0, max: 100 };
  const max = Math.max(...values);
  return { min: 0, max: max > 0 ? max : 100 };
}

function normalizedPercent(value, range) {
  if (!Number.isFinite(value)) return 0;
  return clamp(((value - range.min) / Math.max(range.max - range.min, 1)) * 100, 0, 100);
}

function formatMacroAmount(value) {
  if (!Number.isFinite(Number(value))) return '—';
  const num = Number(value);
  return `${Number.isInteger(num) ? num : Number(num.toFixed(1))}g`;
}

function rowIconForScene(scene, item = {}) {
  if (scene === 'fats') return './assets/fat-submacro-row.png';
  if (scene === 'carbs') return './assets/carb-submacro-bullet-point.png';
  if (scene === 'proteins') return './assets/protein-submacro-bullet-point.png';
  if (scene === 'vitamins') return './assets/vitamin-icon-raw.gif';
  if (scene === 'minerals') return './assets/mineral-icon-raw.gif';
  if (scene === 'pros') return item.impactLevel === 'major' ? './assets/major-pro-raw.png' : './assets/minor-pro-raw.png';
  if (scene === 'cons') return item.impactLevel === 'major' ? './assets/major-con-raw.png' : './assets/minor-con-raw.png';
  return './assets/carb-submacro-bullet-point.png';
}

function macroSubmetrics(food, scene) {
  const rules = rulesForSection(food, scene).filter(rule => rule.metricKey !== macroHeaderMetricKey(scene)).slice(0, 3);
  return rules.map(rule => {
    const value = valueForMetric(food, rule.metricKey);
    return {
      title: titleizeMetric(rule.metricKey),
      value: formatMetricValue(rule.metricKey, value),
      arrowMarkup: arrowMarkup(rule, value),
      icon: rowIconForScene(scene),
      useRowSprite: scene === 'fats'
    };
  });
}

function microSubmetrics(food, scene) {
  return rulesForSection(food, scene).slice(0, 3).map(rule => ({
    title: titleizeMetric(rule.metricKey),
    value: formatMetricValue(rule.metricKey, valueForMetric(food, rule.metricKey)),
    arrowMarkup: '<span>·</span>',
    icon: rowIconForScene(scene),
    useRowSprite: false
  }));
}

function contextSubmetrics(food, scene) {
  return (food.contextItems?.[scene] || []).slice(0, 3).map(item => ({
    title: String(item.title || '').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim().slice(0, 14),
    value: item.impactLevel === 'major' ? 'HIGH' : 'LOW',
    arrowMarkup: item.impactLevel === 'major' ? `<img src="./assets/red-arrow.png" alt="" /><img src="./assets/red-arrow.png" alt="" />` : `<img src="./assets/green-arrow.png" alt="" />`,
    icon: rowIconForScene(scene, item),
    useRowSprite: false
  }));
}

function displayRows(food, scene) {
  if (['fats','carbs','proteins'].includes(scene)) return macroSubmetrics(food, scene);
  if (['vitamins','minerals'].includes(scene)) return microSubmetrics(food, scene);
  if (['pros','cons'].includes(scene)) return contextSubmetrics(food, scene);
  return macroSubmetrics(food, 'fats');
}

function selectedScene() {
  return els.sceneSelect.value || 'overview';
}

function updateFoodList() {
  const query = els.searchInput.value.trim().toLowerCase();
  const type = els.typeFilter.value;
  const tier = els.tierFilter.value;
  state.filtered = state.data.foods.filter(food => {
    const tierValue = food.episode?.tier || 'unscored';
    return (!query || food.name.toLowerCase().includes(query) || food.id.includes(query)) && (type === 'all' || food.foodType === type) && (tier === 'all' || tierValue === tier);
  });

  els.foodCount.textContent = state.filtered.length;
  els.foodList.innerHTML = '';

  state.filtered.forEach(food => {
    const item = document.createElement('button');
    item.className = `food-item ${state.selectedFood?.id === food.id ? 'active' : ''}`;
    item.innerHTML = `<div class="food-item-name">${food.name}</div><div class="food-item-meta">${fmtType(food.foodType)} • ${food.episode?.tier || 'unscored'} • ${food.episode?.overallScore ?? '—'}</div>`;
    item.addEventListener('click', () => selectFood(food.id));
    els.foodList.appendChild(item);
  });
}

function selectFood(id) {
  state.selectedFood = state.data.foods.find(food => food.id === id) || state.data.foods[0];
  updateFoodList();
  renderSummary();
  renderDetails();
  renderPreview();
}

function renderSummary() {
  const food = state.selectedFood;
  if (!food) return;
  els.foodName.textContent = food.name;
  els.foodMeta.textContent = `${fmtType(food.foodType)} • ${fmtBasis(food)} • ${food.header?.kcal ?? '—'} kcal${food.episode ? ` • ${food.episode.durationSeconds}s estimated` : ''}`;
  const tier = food.episode?.tier;
  els.tierBadge.textContent = tier || '—';
  els.tierBadge.className = `tier-badge ${tier ? tierClassMap[tier] : 'tier-none'}`;
  els.scoreBadge.textContent = food.episode ? `Score ${food.episode.overallScore}` : 'No score';
  els.foodSummary.textContent = food.episode?.summary || 'No generated episode package yet for this food.';
}

function renderDetails() {
  const food = state.selectedFood;
  if (!food) return;
  const tab = state.activeTab;

  if (tab === 'overview') {
    const hasScript = !!food.episode?.script;
    els.detailContent.innerHTML = `
      <div class="detail-card"><h4>Episode</h4><p>${food.episode ? `Tier ${food.episode.tier}, score ${food.episode.overallScore}, approx ${food.episode.durationSeconds}s, ${food.episode.sceneCount} scenes.` : 'No episode package generated yet.'}</p></div>
      <div class="detail-card"><h4>Why this tier</h4><p>${food.episode?.whyThisTier || 'Generate an episode package to see the tier explanation.'}</p></div>
      <div class="detail-card"><h4>Ruleset snapshot</h4><p>${food.ruleset ? `Weights — fats ${food.ruleset.sectionWeights?.fats ?? 0}, carbs ${food.ruleset.sectionWeights?.carbs ?? 0}, proteins ${food.ruleset.sectionWeights?.proteins ?? 0}, vitamins ${food.ruleset.sectionWeights?.vitamins ?? 0}, minerals ${food.ruleset.sectionWeights?.minerals ?? 0}.` : 'No ruleset loaded.'}</p></div>
      <div class="detail-card"><h4>Header snapshot</h4><div class="stat-grid">
        <div class="stat-pill"><div class="k">kcal</div><div class="v">${food.header?.kcal ?? '—'}</div></div>
        <div class="stat-pill"><div class="k">fat</div><div class="v">${food.header?.fat_g ?? '—'}g</div></div>
        <div class="stat-pill"><div class="k">carbs</div><div class="v">${food.header?.carb_g ?? '—'}g</div></div>
        <div class="stat-pill"><div class="k">protein</div><div class="v">${food.header?.protein_g ?? '—'}g</div></div>
      </div></div>
      <div class="detail-card"><h4>Script availability</h4><div class="script-status ${hasScript ? 'ok' : 'missing'}">${hasScript ? 'Generated script available' : 'No generated script yet'}</div></div>`;
    return;
  }

  if (tab === 'macros') {
    const cards = ['fats','carbs','proteins'].map(section => {
      const items = macroSubmetrics(food, section);
      return `<div class="detail-card"><h4>${section.toUpperCase()}</h4><div class="stat-grid">${items.map(item => `<div class="stat-pill"><div class="k">${item.title}</div><div class="v macro-detail-value">${item.value}<span>${item.arrowMarkup}</span></div></div>`).join('')}</div></div>`;
    }).join('');
    els.detailContent.innerHTML = cards || '<div class="detail-card"><p>No macro rules available.</p></div>';
    return;
  }

  if (tab === 'micros') {
    const vitamins = microSubmetrics(food, 'vitamins');
    const minerals = microSubmetrics(food, 'minerals');
    els.detailContent.innerHTML = `
      <div class="detail-card"><h4>Vitamins</h4><div class="stat-grid">${vitamins.map(item => `<div class="stat-pill"><div class="k">${item.title}</div><div class="v">${item.value}</div></div>`).join('')}</div></div>
      <div class="detail-card"><h4>Minerals</h4><div class="stat-grid">${minerals.map(item => `<div class="stat-pill"><div class="k">${item.title}</div><div class="v">${item.value}</div></div>`).join('')}</div></div>`;
    return;
  }

  if (tab === 'script') {
    const hasScript = !!food.episode?.script;
    const narration = food.episode?.narrationText?.trim() || '';
    const scriptObj = food.episode?.script;
    const readableScript = scriptObj ? [scriptObj.hook, scriptObj.intro, ...(scriptObj.sections || []).map(section => section.narration), scriptObj.closing?.summary, scriptObj.closing?.finalReveal, scriptObj.closing?.useCaseNote, scriptObj.closing?.cta].filter(Boolean).join('\n\n') : '';
    els.detailContent.innerHTML = `
      <div class="detail-card"><h4>Script status</h4><div class="script-status ${hasScript ? 'ok' : 'missing'}">${hasScript ? 'Generated script available' : 'No generated script yet'}</div></div>
      <div class="detail-card"><h4>Narration draft</h4>${hasScript ? `<div class="script-block">${escapeHtml(narration || readableScript)}</div>` : '<p>Generate an episode package for this food to see the script here.</p>'}</div>
      <div class="detail-card"><h4>Structured script snapshot</h4>${hasScript ? `<div class="script-block">${escapeHtml(JSON.stringify(scriptObj, null, 2))}</div>` : '<p>No script.json available yet.</p>'}</div>`;
    return;
  }

  const pros = food.contextItems?.pros || [];
  const cons = food.contextItems?.cons || [];
  els.detailContent.innerHTML = `
    <div class="detail-card"><h4>Pros</h4><div class="context-list">${pros.map(item => `<div class="context-item"><strong>${item.title}</strong><div>${item.explanation || ''}</div></div>`).join('') || '<p>No pros listed.</p>'}</div></div>
    <div class="detail-card"><h4>Cons</h4><div class="context-list">${cons.map(item => `<div class="context-item"><strong>${item.title}</strong><div>${item.explanation || ''}</div></div>`).join('') || '<p>No cons listed.</p>'}</div></div>`;
}

function heroSpriteForFood(food) {
  return food.id === 'bacon' ? '../../assets/bacon.png' : (heroSpriteMap[food.foodType] || './assets/misc.png');
}

function macroSceneForDisplay(scene) {
  if (['fats','carbs','proteins'].includes(scene)) return scene;
  if (scene === 'carbs') return 'carbs';
  if (scene === 'proteins') return 'proteins';
  return 'fats';
}

function renderPreview() {
  const food = state.selectedFood;
  if (!food) return;

  const scene = selectedScene();
  const macroScene = macroSceneForDisplay(scene);
  const macroValue = macroHeaderValue(food, macroScene);
  const macroRange = derivedMacroRange(food, macroScene);
  const rows = displayRows(food, scene);
  const activeIndex = sceneOrder.indexOf(scene) === -1 ? 0 : sceneOrder.indexOf(scene);

  els.displayCanvas.dataset.scene = scene;
  els.previewFoodName.textContent = food.name.toUpperCase();
  els.previewBasis.textContent = compactBasis(food);
  els.previewKcal.textContent = food.header?.kcal ?? '—';
  els.previewScoreText.textContent = food.episode?.overallScore ?? '??';
  els.previewSceneChipText.textContent = sceneLabels[scene] || 'HEATS';
  els.heroSprite.src = heroSpriteForFood(food);
  els.heroSprite.alt = `${food.name} sprite`;
  els.macroSprite.src = macroSpriteMap[scene] || macroSpriteMap[macroScene];
  els.macroTitle.textContent = (sceneLabels[scene] || 'FATS').toUpperCase();
  els.macroValue.textContent = ['vitamins','minerals'].includes(scene) ? 'DV' : ['pros','cons','final'].includes(scene) ? `${food.episode?.tier || '—'} TIER` : formatMacroAmount(macroValue);
  els.macroFill.style.width = `${scene === 'final' ? 82 : scene === 'pros' ? 64 : scene === 'cons' ? 44 : normalizedPercent(Number(macroValue), macroRange)}%`;

  els.submetricList.innerHTML = rows.map(row => `
    <div class="submetric-row">
      ${row.useRowSprite ? '' : `<img class="submetric-icon" src="${row.icon}" alt="" />`}
      <div class="submetric-pill ${row.useRowSprite ? 'has-sprite' : ''}">
        ${row.useRowSprite ? `<img class="submetric-row-sprite" src="${row.icon}" alt="" />` : ''}
        <div class="submetric-label">${escapeHtml(row.title)}</div>
        <div class="submetric-sep"></div>
        <div class="submetric-value">${escapeHtml(row.value)}</div>
      </div>
      <div class="submetric-arrows">${row.arrowMarkup}</div>
    </div>`).join('');

  els.progressRow.innerHTML = sceneOrder.map((item, index) => `<img class="progress-node ${index === activeIndex ? 'active' : ''}" src="${index === activeIndex ? sectionIndicatorMap.active : sectionIndicatorMap.idle}" alt="" />`).join('');
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.activeTab = tab.dataset.tab;
    renderDetails();
  }));
}

function init() {
  state.data = window.FOODRANKED_DATA;
  if (!state.data) {
    document.body.innerHTML = '<div style="padding:24px;color:white;background:#111">Dashboard data missing. Run <code>node scripts/generate-dashboard-data.js</code> in the Foodranked repo.</div>';
    return;
  }

  const types = [...new Set(state.data.foods.map(food => food.foodType))].sort();
  types.forEach(type => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = fmtType(type);
    els.typeFilter.appendChild(opt);
  });

  initTabs();
  [els.searchInput, els.typeFilter, els.tierFilter].forEach(el => el.addEventListener('input', updateFoodList));
  els.sceneSelect.addEventListener('input', renderPreview);

  state.selectedFood = state.data.foods.find(food => food.id === 'bacon') || state.data.foods[0];
  updateFoodList();
  renderSummary();
  renderDetails();
  renderPreview();
}

init();
