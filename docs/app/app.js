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
  previewFoodType: document.getElementById('previewFoodType'),
  previewBasis: document.getElementById('previewBasis'),
  previewKcal: document.getElementById('previewKcal'),
  previewSceneChip: document.getElementById('previewSceneChip'),
  hookLayout: document.getElementById('hookLayout'),
  macroLayout: document.getElementById('macroLayout'),
  microLayout: document.getElementById('microLayout'),
  bulletsLayout: document.getElementById('bulletsLayout'),
  verdictLayout: document.getElementById('verdictLayout'),
  macroBubble: document.getElementById('macroBubble'),
  macroHeadline: document.getElementById('macroHeadline'),
  macroSlots: document.getElementById('macroSlots'),
  micro1Label: document.getElementById('micro1Label'),
  micro1Fill: document.getElementById('micro1Fill'),
  micro1Value: document.getElementById('micro1Value'),
  micro2Label: document.getElementById('micro2Label'),
  micro2Fill: document.getElementById('micro2Fill'),
  micro2Value: document.getElementById('micro2Value'),
  previewTierStamp: document.getElementById('previewTierStamp'),
  previewScorePlate: document.getElementById('previewScorePlate'),
  subtitleText: document.getElementById('subtitleText'),
  subtitleBox: document.getElementById('subtitleBox'),
  progressRow: document.getElementById('progressRow'),
  sceneSelect: document.getElementById('sceneSelect'),
  bubbleScale: document.getElementById('bubbleScale'),
  subtitleLift: document.getElementById('subtitleLift'),
  foodThumb: document.getElementById('foodThumb'),
  phonePreview: document.getElementById('phonePreview'),
  hookTitle: document.getElementById('hookTitle')
};

const sceneOrder = ['hook','fats','carbs','proteins','vitamins','minerals','pros','cons','final'];
const sceneLabels = { hook:'Hook', fats:'Fats', carbs:'Carbs', proteins:'Proteins', vitamins:'Vitamins', minerals:'Minerals', pros:'Pros', cons:'Cons', final:'Verdict' };
const emojiMap = { grains:'🌾', meats:'🥩', fruits:'🍎', vegetables:'🥬', dairy:'🥛', legumes:'🫘', nuts:'🥜', seeds:'🌰', 'oils-and-fats':'🫒', misc:'🥤', tubers:'🥔' };
const accentMap = { grains:'#d4a64c', meats:'#b83c4f', fruits:'#ef4444', vegetables:'#22c55e', dairy:'#f3e8c8', legumes:'#8b5e3c', nuts:'#8b5a2b', seeds:'#c7a46a', 'oils-and-fats':'#f59e0b', misc:'#6b7280', tubers:'#d97706' };
const tierClassMap = { S:'tier-S', A:'tier-A', B:'tier-B', C:'tier-C', D:'tier-D' };

function fmtType(v){ return String(v||'').replace(/-/g,' '); }
function fmtBasis(food){ return `Per ${food?.basis?.value ?? 100}${food?.basis?.unit ?? 'g'}`; }
function fmtScore(food){ return food.episode?.overallScore ?? '—'; }
function sceneMetricItems(food, scene) {
  const m = food.metrics || {};
  if (scene === 'fats') return [
    ['Saturated fat', m.saturated_fat_g != null ? `${m.saturated_fat_g}g` : '—'],
    ['Omega 3', m.omega3_mg != null ? `${m.omega3_mg}mg` : '—'],
    ['Polyunsaturated fat', m.polyunsaturated_fat_g != null ? `${m.polyunsaturated_fat_g}g` : '—']
  ].filter(([,v]) => v !== '—');
  if (scene === 'carbs') return [
    ['Fibre', m.fibre_g != null ? `${m.fibre_g}g` : '—'],
    ['Sugar', m.sugar_g != null ? `${m.sugar_g}g` : '—'],
    ['Glycemic index', m.glycemic_index != null ? `${m.glycemic_index}` : '—']
  ].filter(([,v]) => v !== '—');
  if (scene === 'proteins') return [
    ['Bioavailability', m.bioavailability_percent != null ? `${m.bioavailability_percent}%` : '—'],
    ['Essential amino acids', m.essential_amino_acids_score != null ? `${m.essential_amino_acids_score}` : '—'],
    ['Nonessential amino acids', m.nonessential_amino_acids_score != null ? `${m.nonessential_amino_acids_score}` : '—']
  ].filter(([,v]) => v !== '—');
  return [];
}

function microItems(food, scene) {
  const m = food.metrics || {};
  if (scene === 'vitamins') return [
    ['Vitamin B12', `${m.vitamin_b12_dv ?? 0}% DV`, m.vitamin_b12_dv ?? 0],
    ['Vitamin D', `${m.vitamin_d_dv ?? 0}% DV`, m.vitamin_d_dv ?? 0]
  ];
  return [
    ['Magnesium', `${m.magnesium_dv ?? 0}% DV`, m.magnesium_dv ?? 0],
    ['Iron', `${m.iron_dv ?? 0}% DV`, m.iron_dv ?? 0]
  ];
}

function updateFoodList() {
  const query = els.searchInput.value.trim().toLowerCase();
  const type = els.typeFilter.value;
  const tier = els.tierFilter.value;
  state.filtered = state.data.foods.filter(food => {
    const tierValue = food.episode?.tier || 'unscored';
    return (!query || food.name.toLowerCase().includes(query) || food.id.includes(query)) &&
      (type === 'all' || food.foodType === type) &&
      (tier === 'all' || tierValue === tier);
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
  els.foodMeta.textContent = `${fmtType(food.foodType)} • ${fmtBasis(food)} • ${food.header?.kcal ?? '—'} kcal${food.episode ? ` • ${food.episode.durationSeconds?.toFixed?.(1) ?? food.episode.durationSeconds}s estimated` : ''}`;
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
    els.detailContent.innerHTML = `
      <div class="detail-card"><h4>Episode</h4><p>${food.episode ? `Tier ${food.episode.tier}, score ${food.episode.overallScore}, approx ${food.episode.durationSeconds}s, ${food.episode.sceneCount} scenes.` : 'No episode package generated yet.'}</p></div>
      <div class="detail-card"><h4>Why this tier</h4><p>${food.episode?.whyThisTier || 'Generate an episode package to see the tier explanation.'}</p></div>
      <div class="detail-card"><h4>Header snapshot</h4><div class="stat-grid">
        <div class="stat-pill"><div class="k">kcal</div><div class="v">${food.header?.kcal ?? '—'}</div></div>
        <div class="stat-pill"><div class="k">fat</div><div class="v">${food.header?.fat_g ?? '—'}g</div></div>
        <div class="stat-pill"><div class="k">carbs</div><div class="v">${food.header?.carb_g ?? '—'}g</div></div>
        <div class="stat-pill"><div class="k">protein</div><div class="v">${food.header?.protein_g ?? '—'}g</div></div>
      </div></div>`;
    return;
  }
  if (tab === 'macros') {
    const macroCards = [
      ['Fat', `${food.header?.fat_g ?? '—'}g`], ['Carbs', `${food.header?.carb_g ?? '—'}g`], ['Protein', `${food.header?.protein_g ?? '—'}g`],
      ['Sat fat', `${food.metrics?.saturated_fat_g ?? '—'}g`], ['Fibre', `${food.metrics?.fibre_g ?? '—'}g`], ['Sugar', `${food.metrics?.sugar_g ?? '—'}g`], ['GI', `${food.metrics?.glycemic_index ?? '—'}`], ['Omega 3', `${food.metrics?.omega3_mg ?? '—'}mg`]
    ];
    els.detailContent.innerHTML = `<div class="detail-card"><h4>Macro layer</h4><div class="stat-grid">${macroCards.map(([k,v]) => `<div class="stat-pill"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div></div>`;
    return;
  }
  if (tab === 'micros') {
    const microCards = [
      ['Vit B12', `${food.metrics?.vitamin_b12_dv ?? 0}% DV`], ['Vit D', `${food.metrics?.vitamin_d_dv ?? 0}% DV`], ['Vit E', `${food.metrics?.vitamin_e_dv ?? 0}% DV`], ['Vit K', `${food.metrics?.vitamin_k_dv ?? 0}% DV`], ['Iron', `${food.metrics?.iron_dv ?? 0}% DV`], ['Magnesium', `${food.metrics?.magnesium_dv ?? 0}% DV`], ['Zinc', `${food.metrics?.zinc_dv ?? 0}% DV`], ['Potassium', `${food.metrics?.potassium_dv ?? 0}% DV`]
    ];
    els.detailContent.innerHTML = `<div class="detail-card"><h4>Micronutrient layer</h4><div class="stat-grid">${microCards.map(([k,v]) => `<div class="stat-pill"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div></div>`;
    return;
  }
  const pros = food.contextItems?.pros || [];
  const cons = food.contextItems?.cons || [];
  els.detailContent.innerHTML = `
    <div class="detail-card"><h4>Pros</h4><div class="context-list">${pros.map(item => `<div class="context-item"><strong>${item.title}</strong><div>${item.explanation || ''}</div></div>`).join('') || '<p>No pros listed.</p>'}</div></div>
    <div class="detail-card"><h4>Cons</h4><div class="context-list">${cons.map(item => `<div class="context-item"><strong>${item.title}</strong><div>${item.explanation || ''}</div></div>`).join('') || '<p>No cons listed.</p>'}</div></div>`;
}

function setVisible(layout) {
  [els.hookLayout, els.macroLayout, els.microLayout, els.bulletsLayout, els.verdictLayout].forEach(el => el.classList.add('hidden'));
  layout.classList.remove('hidden');
}

function renderPreview() {
  const food = state.selectedFood;
  if (!food) return;
  const scene = els.sceneSelect.value;
  const accent = accentMap[food.foodType] || '#6b7280';
  const bubbleScale = Number(els.bubbleScale.value) / 100;
  const subtitleLift = Number(els.subtitleLift.value);

  els.previewFoodName.textContent = food.name;
  els.previewFoodType.textContent = fmtType(food.foodType);
  els.previewBasis.textContent = fmtBasis(food);
  els.previewKcal.textContent = food.header?.kcal ?? '—';
  els.previewSceneChip.textContent = sceneLabels[scene].toUpperCase();
  els.previewSceneChip.style.background = accent;
  els.foodThumb.textContent = emojiMap[food.foodType] || '🍽️';
  els.hookTitle.textContent = food.name.toUpperCase();
  els.subtitleBox.style.transform = `translateY(-${subtitleLift}px)`;
  els.phonePreview.querySelector('.phone-bg').style.background = `radial-gradient(circle at top, ${accent}33 0, #141824 58%, #0f1117 100%)`;

  const activeIndex = sceneOrder.indexOf(scene === 'final' ? 'final' : scene);
  els.progressRow.innerHTML = sceneOrder.slice(0,7).map((_, index) => `<div class="progress-dot ${index === Math.min(activeIndex,6) ? 'active' : ''}"></div>`).join('');

  if (scene === 'hook') {
    setVisible(els.hookLayout);
    els.subtitleText.textContent = `${food.name} ranked.`;
    return;
  }

  if (['fats','carbs','proteins'].includes(scene)) {
    setVisible(els.macroLayout);
    const bubbleClass = scene === 'fats' ? 'fat' : scene === 'carbs' ? 'carbs' : 'proteins';
    const headlineValue = scene === 'fats' ? food.header?.fat_g : scene === 'carbs' ? food.header?.carb_g : food.header?.protein_g;
    els.macroBubble.className = `macro-bubble ${bubbleClass}`;
    els.macroBubble.style.transform = `scale(${bubbleScale})`;
    els.macroBubble.textContent = scene === 'fats' ? '🛡' : scene === 'carbs' ? '⚡' : '💪';
    els.macroHeadline.textContent = `${headlineValue ?? '—'}g ${scene.toUpperCase()}`;
    const items = sceneMetricItems(food, scene);
    els.macroSlots.innerHTML = items.map(([title, value]) => `<div class="slot-card"><div class="slot-title">${title}</div><div class="slot-sub">${value}</div></div>`).join('');
    els.subtitleText.textContent = scene === 'fats' ? `Fat is ${food.header?.fat_g ?? '—'}g.` : scene === 'carbs' ? `Carbs is ${food.header?.carb_g ?? '—'}g.` : `Protein is ${food.header?.protein_g ?? '—'}g.`;
    return;
  }

  if (['vitamins','minerals'].includes(scene)) {
    setVisible(els.microLayout);
    const items = microItems(food, scene);
    els.micro1Label.textContent = items[0][0];
    els.micro1Value.textContent = items[0][1];
    els.micro1Fill.style.width = `${Math.min(items[0][2], 100)}%`;
    els.micro2Label.textContent = items[1][0];
    els.micro2Value.textContent = items[1][1];
    els.micro2Fill.style.width = `${Math.min(items[1][2], 100)}%`;
    els.subtitleText.textContent = `${items[0][0]} and ${items[1][0]} stand out most.`;
    return;
  }

  if (['pros','cons'].includes(scene)) {
    setVisible(els.bulletsLayout);
    const items = food.contextItems?.[scene] || [];
    els.bulletsLayout.innerHTML = items.slice(0,3).map(item => `<div class="bullet-card ${scene === 'cons' ? 'cons' : ''}"><div class="bullet-icon">${scene === 'pros' ? '＋' : '－'}</div><div class="bullet-text">${item.title}</div></div>`).join('');
    els.subtitleText.textContent = `${scene === 'pros' ? 'Biggest pros.' : 'Biggest cons.'}`;
    return;
  }

  setVisible(els.verdictLayout);
  const tier = food.episode?.tier || '—';
  els.previewTierStamp.textContent = tier;
  els.previewTierStamp.className = 'tier-stamp';
  els.previewTierStamp.style.background = accentMap[food.foodType] || '#7c3aed';
  els.previewScorePlate.textContent = food.episode?.overallScore ?? '—';
  els.subtitleText.textContent = `${food.name} is ${tier} tier. Score: ${food.episode?.overallScore ?? '—'}.`;
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.activeTab = tab.dataset.tab;
    renderDetails();
  }));
}

async function init() {
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
  [els.sceneSelect, els.bubbleScale, els.subtitleLift].forEach(el => el.addEventListener('input', renderPreview));

  state.selectedFood = state.data.foods[0];
  updateFoodList();
  renderSummary();
  renderDetails();
  renderPreview();
}

init();
