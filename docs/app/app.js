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
  previewKcalBox: document.getElementById('previewKcalBox'),
  previewSceneChip: document.getElementById('previewSceneChip'),
  foodTypeSprite: document.getElementById('foodTypeSprite'),
  hookLayout: document.getElementById('hookLayout'),
  macroLayout: document.getElementById('macroLayout'),
  microLayout: document.getElementById('microLayout'),
  bulletsLayout: document.getElementById('bulletsLayout'),
  verdictLayout: document.getElementById('verdictLayout'),
  macroBubble: document.getElementById('macroBubble'),
  macroBubbleImg: document.getElementById('macroBubbleImg'),
  macroHeadline: document.getElementById('macroHeadline'),
  macroSlots: document.getElementById('macroSlots'),
  previewTierStamp: document.getElementById('previewTierStamp'),
  previewScorePlate: document.getElementById('previewScorePlate'),
  subtitleText: document.getElementById('subtitleText'),
  subtitleBox: document.getElementById('subtitleBox'),
  progressRow: document.getElementById('progressRow'),
  sceneSelect: document.getElementById('sceneSelect'),
  bubbleScale: document.getElementById('bubbleScale'),
  bubbleOffsetX: document.getElementById('bubbleOffsetX'),
  headlineScale: document.getElementById('headlineScale'),
  stampScale: document.getElementById('stampScale'),
  subtitleLift: document.getElementById('subtitleLift'),
  presetName: document.getElementById('presetName'),
  presetSelect: document.getElementById('presetSelect'),
  savePresetBtn: document.getElementById('savePresetBtn'),
  resetPresetBtn: document.getElementById('resetPresetBtn'),
  deletePresetBtn: document.getElementById('deletePresetBtn'),
  foodThumb: document.getElementById('foodThumb'),
  phonePreview: document.getElementById('phonePreview'),
  hookTitle: document.getElementById('hookTitle')
};

const sceneOrder = ['hook','fats','carbs','proteins','vitamins','minerals','pros','cons','final'];
const sceneLabels = { hook:'Hook', fats:'Fats', carbs:'Carbs', proteins:'Proteins', vitamins:'Vitamins', minerals:'Minerals', pros:'Pros', cons:'Cons', final:'Verdict' };
const emojiMap = { grains:'🌾', meats:'🥩', fruits:'🍎', vegetables:'🥬', dairy:'🥛', legumes:'🫘', nuts:'🥜', seeds:'🌰', 'oils-and-fats':'🫒', misc:'🥤', tubers:'🥔' };
const accentMap = { grains:'#d4a64c', meats:'#b83c4f', fruits:'#d75a5a', vegetables:'#55a06b', dairy:'#e3dcc2', legumes:'#8d6849', nuts:'#93673f', seeds:'#b7925e', 'oils-and-fats':'#d39a33', misc:'#7f91b8', tubers:'#bd7f3a' };
const tierClassMap = { S:'tier-S', A:'tier-A', B:'tier-B', C:'tier-C', D:'tier-D' };
const macroSpriteMap = { fats:'./assets/macro-fats-shield.gif', carbs:'./assets/macro-carbs-lightning.gif', proteins:'./assets/macro-protein-arm.gif', vitamins:'./assets/vitamin-sprite.svg' };
const typeSpriteMap = {
  grains:'./assets/grains.png', meats:'./assets/meats.png', fruits:'./assets/fruit.png', vegetables:'./assets/veg.png', dairy:'./assets/dairy.png', legumes:'./assets/legumes.png', nuts:'./assets/nuts.png', seeds:'./assets/seeds.png', 'oils-and-fats':'./assets/oil and fat.png', misc:'./assets/misc.png', tubers:'./assets/tubers.png'
};
const arrowSpriteMap = {
  up_good: './assets/arrow-up-green.svg',
  down_good: './assets/arrow-down-green.svg',
  up_bad: './assets/arrow-up-red.svg',
  down_bad: './assets/arrow-down-red.svg'
};
const PRESET_KEY = 'foodranked-layout-presets-v1';
const DEFAULT_CONTROLS = { bubbleScale: 100, bubbleOffsetX: 0, headlineScale: 100, stampScale: 100, subtitleLift: 0 };

function fmtType(v){ return String(v||'').replace(/-/g,' '); }
function fmtBasis(food){ return `Per ${food?.basis?.value ?? 100}${food?.basis?.unit ?? 'g'}`; }
function escapeHtml(str){return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function titleizeMetric(key){ return String(key||'').replace(/_dv$/,'').replace(/_mg$/,'').replace(/_g$/,'').replace(/_percent$/,'').replace(/_/g,' ').replace(/\bgi\b/i,'glycemic index').replace(/\bomega3\b/i,'omega 3').replace(/\bvitamin b12\b/i,'vitamin B12').replace(/\bvitamin d\b/i,'vitamin D'); }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function alpha(hex,a){ const clean = String(hex||'#999').replace('#',''); const full = clean.length===3 ? clean.split('').map(x=>x+x).join('') : clean; const num = parseInt(full,16); const r=(num>>16)&255,g=(num>>8)&255,b=num&255; return `rgba(${r}, ${g}, ${b}, ${a})`; }

function getControls() {
  return {
    bubbleScale: Number(els.bubbleScale.value),
    bubbleOffsetX: Number(els.bubbleOffsetX.value),
    headlineScale: Number(els.headlineScale.value),
    stampScale: Number(els.stampScale.value),
    subtitleLift: Number(els.subtitleLift.value)
  };
}

function setControls(values = {}) {
  const merged = { ...DEFAULT_CONTROLS, ...values };
  els.bubbleScale.value = merged.bubbleScale;
  els.bubbleOffsetX.value = merged.bubbleOffsetX;
  els.headlineScale.value = merged.headlineScale;
  els.stampScale.value = merged.stampScale;
  els.subtitleLift.value = merged.subtitleLift;
}

function loadPresets() { try { return JSON.parse(localStorage.getItem(PRESET_KEY) || '{}'); } catch { return {}; } }
function savePresets(presets) { localStorage.setItem(PRESET_KEY, JSON.stringify(presets)); }

function refreshPresetSelect() {
  const presets = loadPresets();
  const current = els.presetSelect.value;
  els.presetSelect.innerHTML = '<option value="">Load saved preset</option>';
  Object.keys(presets).sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    els.presetSelect.appendChild(opt);
  });
  if (presets[current]) els.presetSelect.value = current;
}

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
  return { label, magnitude, direction, isGood };
}

function arrowSpritesMarkup(rule, value) {
  const meta = arrowMeta(rule, value);
  if (!meta.magnitude || meta.direction === 'flat') return '<span class="slot-arrow-text">·</span>';
  const key = `${meta.direction}_${meta.isGood ? 'good' : 'bad'}`;
  const src = arrowSpriteMap[key];
  return `<span class="arrow-sprite-row" aria-label="${escapeHtml(meta.label)}">${Array.from({ length: meta.magnitude }).map(() => `<img class="arrow-sprite ${meta.direction}" src="${src}" alt="" />`).join('')}</span>`;
}

function impactLabel(level) {
  return String(level || 'minor').toLowerCase() === 'major' ? 'Major' : 'Minor';
}

function macroHeaderValue(food, scene) {
  return scene === 'fats' ? food.header?.fat_g : scene === 'carbs' ? food.header?.carb_g : scene === 'proteins' ? food.header?.protein_g : null;
}

function macroSubmetrics(food, scene) {
  const rules = rulesForSection(food, scene).filter(rule => rule.metricKey !== ({ fats:'fat_g', carbs:'carb_g', proteins:'protein_g' }[scene])).slice(0, 4);
  return rules.map(rule => {
    const range = deriveBarRange(rule);
    const value = valueForMetric(food, rule.metricKey);
    return {
      title: titleizeMetric(rule.metricKey),
      value: formatMetricValue(rule.metricKey, value),
      arrow: arrowForRuleValue(rule, value),
      arrowMarkup: arrowSpritesMarkup(rule, value),
      polarity: rule.polarity,
      min: range.min,
      max: range.max
    };
  });
}

function microItems(food, scene) {
  return rulesForSection(food, scene).map(rule => {
    const range = deriveBarRange(rule);
    const value = valueForMetric(food, rule.metricKey) ?? 0;
    const normalized = clamp(((value - range.min) / Math.max(range.max - range.min, 1)) * 100, 0, 100);
    return {
      label: titleizeMetric(rule.metricKey),
      valueLabel: formatMetricValue(rule.metricKey, value),
      fill: normalized,
      raw: value
    };
  });
}

function sceneSubtitle(food, scene) {
  if (scene === 'hook') return `${food.name} ranked.`;
  if (scene === 'fats') return `Fat is ${food.header?.fat_g ?? '—'}g.`;
  if (scene === 'carbs') return `Carbs is ${food.header?.carb_g ?? '—'}g.`;
  if (scene === 'proteins') return `Protein is ${food.header?.protein_g ?? '—'}g.`;
  if (scene === 'vitamins') return 'Vitamin section uses the vitamin sprite and full-height DV bars.';
  if (scene === 'minerals') return 'Minerals stay on full-height DV bars.';
  if (scene === 'pros') return 'Pros reveal as bullet points with major or minor impact tags.';
  if (scene === 'cons') return 'Cons reveal as bullet points with major or minor impact tags.';
  return `${food.name} is ${food.episode?.tier || '—'} tier.`;
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
      return `<div class="detail-card"><h4>${sceneLabels[section]}</h4><div class="stat-grid">${items.map(item => `<div class="stat-pill"><div class="k">${item.title}</div><div class="v macro-detail-value">${item.value}<span>${item.arrowMarkup}</span></div></div>`).join('')}</div></div>`;
    }).join('');
    els.detailContent.innerHTML = cards || '<div class="detail-card"><p>No macro rules available.</p></div>';
    return;
  }

  if (tab === 'micros') {
    const vitamins = microItems(food, 'vitamins');
    const minerals = microItems(food, 'minerals');
    els.detailContent.innerHTML = `
      <div class="detail-card"><h4>Vitamins</h4><div class="stat-grid">${vitamins.map(item => `<div class="stat-pill"><div class="k">${item.label}</div><div class="v">${item.valueLabel}</div></div>`).join('')}</div></div>
      <div class="detail-card"><h4>Minerals</h4><div class="stat-grid">${minerals.map(item => `<div class="stat-pill"><div class="k">${item.label}</div><div class="v">${item.valueLabel}</div></div>`).join('')}</div></div>`;
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
    <div class="detail-card"><h4>Pros</h4><div class="context-list">${pros.map(item => `<div class="context-item"><strong>${item.title}</strong><div class="impact-chip ${impactLabel(item.impactLevel).toLowerCase()}">${impactLabel(item.impactLevel)}</div><div>${item.explanation || ''}</div></div>`).join('') || '<p>No pros listed.</p>'}</div></div>
    <div class="detail-card"><h4>Cons</h4><div class="context-list">${cons.map(item => `<div class="context-item"><strong>${item.title}</strong><div class="impact-chip ${impactLabel(item.impactLevel).toLowerCase()}">${impactLabel(item.impactLevel)}</div><div>${item.explanation || ''}</div></div>`).join('') || '<p>No cons listed.</p>'}</div></div>`;
}

function setVisible(layout) {
  [els.hookLayout, els.macroLayout, els.microLayout, els.bulletsLayout, els.verdictLayout].forEach(el => el.classList.add('hidden'));
  layout.classList.remove('hidden');
}

function applyFoodTypeTheme(food) {
  const accent = accentMap[food.foodType] || '#6b7280';
  const bg = `${accent}33`;
  const stage = els.phonePreview.querySelector('.stage-card');
  els.phonePreview.querySelector('.phone-bg').style.background = `radial-gradient(circle at top, ${bg} 0, #141824 58%, #0f1117 100%)`;
  els.previewSceneChip.style.background = accent;
  els.previewSceneChip.style.color = food.foodType === 'dairy' ? '#111' : '#f6f3ea';
  els.foodTypeSprite.src = typeSpriteMap[food.foodType] || '';
  els.foodTypeSprite.alt = `${fmtType(food.foodType)} sprite`;
  els.foodThumb.style.background = `linear-gradient(135deg, ${accent}, #1f2937)`;
  els.previewKcalBox.style.borderColor = accent;
  els.previewKcalBox.style.boxShadow = `inset 0 0 0 2px ${alpha(accent, .18)}`;
  els.previewKcalBox.style.background = `linear-gradient(180deg, ${alpha(accent,.24)}, ${alpha('#111827', .92)})`;
  els.previewKcal.style.color = accent;
  els.previewBasis.style.background = alpha(accent, .18);
  els.previewBasis.style.border = `1px solid ${alpha(accent, .38)}`;
  stage.style.borderColor = alpha(accent, .6);
  stage.style.boxShadow = `inset 0 0 0 2px ${alpha(accent, .12)}`;
  stage.style.background = `linear-gradient(180deg, ${alpha(accent, .13)}, rgba(14,17,26,.94))`;
}

function renderMacroScene(food, scene, controls) {
  setVisible(els.macroLayout);
  const headlineValue = macroHeaderValue(food, scene);
  els.macroBubble.className = `macro-bubble ${scene}`;
  els.macroBubble.style.transform = `translateX(${controls.bubbleOffsetX}px) scale(${controls.bubbleScale / 100})`;
  els.macroBubbleImg.src = macroSpriteMap[scene] || '';
  els.macroBubbleImg.alt = `${scene} sprite`;
  els.macroHeadline.textContent = `${headlineValue ?? '—'}g ${scene.toUpperCase()}`;
  els.macroHeadline.style.transform = `scale(${controls.headlineScale / 100})`;
  els.macroHeadline.style.transformOrigin = 'left center';
  const items = macroSubmetrics(food, scene);
  els.macroSlots.innerHTML = items.map(item => `
    <div class="slot-card">
      <div class="slot-main">
        <span class="slot-title">${item.title}</span>
        <span class="slot-value">${item.value}</span>
      </div>
      <div class="slot-arrow-wrap">${item.arrowMarkup}</div>
    </div>`).join('');
  els.subtitleText.textContent = sceneSubtitle(food, scene);
}

function renderMicroScene(food, scene, controls) {
  setVisible(els.microLayout);
  const items = microItems(food, scene);
  const headerSprite = scene === 'vitamins' ? macroSpriteMap.vitamins : (typeSpriteMap[food.foodType] || '');
  const headerLabel = scene === 'vitamins' ? 'Vitamin sprite' : `${fmtType(food.foodType)} sprite`;
  els.microLayout.innerHTML = `
    <div class="micro-header-row">
      <div class="macro-bubble vitamins" style="transform: translateX(${controls.bubbleOffsetX}px) scale(${controls.bubbleScale / 100});">
        <img src="${headerSprite}" alt="${headerLabel}" />
      </div>
      <div class="macro-headline micro-headline" style="transform: scale(${controls.headlineScale / 100}); transform-origin: left center;">${scene.toUpperCase()}</div>
    </div>
    <div class="micro-columns wide ${items.length > 4 ? 'many' : ''}">
      ${items.map(item => `
        <div class="micro-col">
          <div class="micro-bar-vertical"><div class="micro-fill-vertical" style="height:${item.fill}%"></div></div>
          <div class="micro-col-label">${item.label}</div>
          <div class="micro-col-value">${item.valueLabel}</div>
        </div>`).join('')}
    </div>`;
  els.subtitleText.textContent = sceneSubtitle(food, scene);
}

function renderBulletsScene(food, scene) {
  setVisible(els.bulletsLayout);
  const items = food.contextItems?.[scene] || [];
  els.bulletsLayout.innerHTML = items.map(item => `
    <div class="bullet-card ${scene === 'cons' ? 'cons' : 'pros'}">
      <div class="bullet-glyph">•</div>
      <div class="bullet-text-block">
        <div class="bullet-meta-row"><span class="impact-chip ${impactLabel(item.impactLevel).toLowerCase()}">${impactLabel(item.impactLevel)} ${scene === 'pros' ? 'pro' : 'con'}</span></div>
        <div class="bullet-text">${item.title}</div>
        <div class="bullet-subtext">${item.explanation || ''}</div>
      </div>
    </div>`).join('');
  els.subtitleText.textContent = sceneSubtitle(food, scene);
}

function renderPreview() {
  const food = state.selectedFood;
  if (!food) return;

  const scene = els.sceneSelect.value;
  const controls = getControls();
  els.previewFoodName.textContent = food.name;
  els.previewBasis.textContent = fmtBasis(food);
  els.previewKcal.textContent = food.header?.kcal ?? '—';
  els.previewSceneChip.textContent = sceneLabels[scene].toUpperCase();
  els.previewSceneChip.classList.toggle('hidden', scene === 'hook');
  els.foodThumb.textContent = emojiMap[food.foodType] || '🍽️';
  els.hookTitle.textContent = food.name.toUpperCase();
  els.subtitleBox.style.transform = `translateY(-${controls.subtitleLift}px)`;
  applyFoodTypeTheme(food);

  const activeIndex = sceneOrder.indexOf(scene === 'final' ? 'final' : scene);
  els.progressRow.innerHTML = sceneOrder.slice(0,7).map((_, index) => `<div class="progress-dot ${index === Math.min(activeIndex,6) ? 'active' : ''}"></div>`).join('');

  if (scene === 'hook') {
    setVisible(els.hookLayout);
    els.subtitleText.textContent = sceneSubtitle(food, scene);
    return;
  }
  if (['fats','carbs','proteins'].includes(scene)) return renderMacroScene(food, scene, controls);
  if (['vitamins','minerals'].includes(scene)) return renderMicroScene(food, scene, controls);
  if (['pros','cons'].includes(scene)) return renderBulletsScene(food, scene);

  setVisible(els.verdictLayout);
  const tier = food.episode?.tier || '—';
  els.previewTierStamp.textContent = tier;
  els.previewTierStamp.style.transform = `scale(${controls.stampScale / 100})`;
  els.previewScorePlate.textContent = food.episode?.overallScore ?? '—';
  els.subtitleText.textContent = sceneSubtitle(food, scene);
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.activeTab = tab.dataset.tab;
    renderDetails();
  }));
}

function initPresets() {
  refreshPresetSelect();
  els.savePresetBtn.addEventListener('click', () => {
    const name = els.presetName.value.trim();
    if (!name) return;
    const presets = loadPresets();
    presets[name] = getControls();
    savePresets(presets);
    refreshPresetSelect();
    els.presetSelect.value = name;
  });
  els.resetPresetBtn.addEventListener('click', () => { setControls(DEFAULT_CONTROLS); renderPreview(); });
  els.presetSelect.addEventListener('change', () => {
    const name = els.presetSelect.value;
    if (!name) return;
    const presets = loadPresets();
    if (presets[name]) { setControls(presets[name]); renderPreview(); }
  });
  els.deletePresetBtn.addEventListener('click', () => {
    const name = els.presetSelect.value;
    if (!name) return;
    const presets = loadPresets();
    delete presets[name];
    savePresets(presets);
    refreshPresetSelect();
  });
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
  initPresets();
  [els.searchInput, els.typeFilter, els.tierFilter].forEach(el => el.addEventListener('input', updateFoodList));
  [els.sceneSelect, els.bubbleScale, els.bubbleOffsetX, els.headlineScale, els.stampScale, els.subtitleLift].forEach(el => el.addEventListener('input', renderPreview));

  setControls(DEFAULT_CONTROLS);
  state.selectedFood = state.data.foods[0];
  updateFoodList();
  renderSummary();
  renderDetails();
  renderPreview();
}

init();
