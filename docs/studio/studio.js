const FEATURED_EPISODES = {
  bacon: {
    status: 'script-polished',
    publishOrder: 1,
    script: `Bacon ranked.\n\nToday we’re ranking Bacon as a meat, per 100g, so let’s see where it actually lands.\n\nFat is 42g, and this is where things start going wrong fast.\n\nCarbs are basically irrelevant here.\n\nProtein is 37g, and yes, the protein quality is strong.\n\nB12 helps a bit, but the micronutrient case is nowhere near enough to save it.\n\nThe pros are obvious: it tastes great, it makes food more addictive, and people love it.\n\nBut the downsides are rough: the sodium is bad, the processing is bad, and the fat profile is bad for the category.\n\nOverall, Bacon lands in D tier.\n\nBacon gets a 39 overall.`
  },
  'rice-cakes': {
    status: 'script-polished', publishOrder: 2,
    script: `Rice Cakes ranked.\n\nToday we’re ranking Rice Cakes as a grain, per 100g, so let’s see where they actually land.\n\nFat is only 3g, so this was never going to be a fat story.\n\nCarbs are 81.5g, and this is where the problem shows up: high glycemic impact, not much payoff, and weak staying power.\n\nProtein is only 7g, so that’s not rescuing anything either.\n\nThe pros are mostly practical: they’re portable, easy to carry, and easy to throw toppings on.\n\nBut the downsides are exactly why people argue about them: weak grain payoff, harsh glycemic impact, and not very filling for the calories.\n\nOverall, Rice Cakes land in D tier.\n\nRice Cakes get a 21 overall.`
  },
  'extra-virgin-olive-oil': {
    status: 'script-polished', publishOrder: 3,
    script: `Extra Virgin Olive Oil ranked.\n\nToday we’re ranking Extra Virgin Olive Oil as a fat, per 100g, so let’s see where it actually lands.\n\nFat is 100g, obviously, so this whole verdict comes down to fat quality.\n\nAnd that’s exactly why olive oil scores so well here.\n\nThe vitamin support is stronger than most people expect, and the overall category fit is excellent.\n\nThe biggest pros are clear: strong fat profile, useful polyphenols, and a very clean ingredient identity.\n\nThe cons are still real: it’s extremely calorie-dense, quality varies a lot, and it’s not magic just because it has a health halo.\n\nOverall, Extra Virgin Olive Oil lands in S tier.\n\nIt gets a 78 overall.`
  },
  'cola-regular': {
    status: 'script-polished', publishOrder: 4,
    script: `Regular Cola ranked.\n\nToday we’re ranking Regular Cola as a misc item, per 100g, so let’s see where it actually lands.\n\nThis one is simple.\n\nThere is basically no meaningful nutrition story here.\n\nWhat matters is the context: it’s cheap, common, and easy to drink way too much of.\n\nAnd the big problem is obvious — liquid sugar is one of the worst forms this can come in.\n\nSo even if it’s convenient and everywhere, the downside is doing almost all the talking.\n\nOverall, Regular Cola lands in D tier.\n\nIt gets a 0 overall.`
  },
  salmon: {
    status: 'script-polished', publishOrder: 5,
    script: `Salmon ranked.\n\nToday we’re ranking Salmon as a meat, per 100g, so let’s see where it actually lands.\n\nFat is 13g, and in this case that is a very good thing, because the omega-3 support is doing serious work.\n\nCarbs are zero, which doesn’t matter much here.\n\nProtein is 20.4g, and the protein quality is excellent.\n\nThen the micros push it even higher: B12 is huge, vitamin D is huge, and the overall package is just strong.\n\nThe pros are exactly what people expect: salmon has a great omega-3 reputation, it’s satisfying, and it brings real nutrient density.\n\nThe downsides are mostly practical: it can be expensive, sourcing matters, and storage matters.\n\nOverall, Salmon lands in S tier.\n\nIt gets an 81 overall.`
  }
};

const SCORING_SECTIONS = [
  ['fats', 'Fats + fat submicros'],
  ['carbs', 'Carbs + carb submicros'],
  ['proteins', 'Proteins + protein submicros'],
  ['vitamins', 'Vitamins'],
  ['minerals', 'Minerals'],
  ['pros', 'Pros context layer'],
  ['cons', 'Cons context layer']
];

const state = {
  foods: [],
  results: [],
  foodsById: new Map(),
  resultsById: new Map(),
  route: location.hash || '#/'
};

async function safeJsonFetch(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch {
    return fallback;
  }
}

async function loadData() {
  const [foods, batch] = await Promise.all([
    safeJsonFetch('../data/foods-index.json', []),
    safeJsonFetch('../data/batch-results.json', { summary: [], details: [] })
  ]);
  state.foods = Array.isArray(foods) ? foods : [];
  state.results = Array.isArray(batch.summary) ? batch.summary : [];
  state.foodsById = new Map(state.foods.map(food => [food.id, food]));
  state.resultsById = new Map((Array.isArray(batch.details) ? batch.details : []).map(item => [item.result?.food?.id, item.result]));
}

function navigate(hash) { location.hash = hash; }
window.addEventListener('hashchange', () => { state.route = location.hash || '#/'; render(); });

function qs() {
  return new URLSearchParams(location.hash.split('?')[1] || '');
}

function routePath() {
  return (location.hash.split('?')[0] || '#/').replace(/^#/, '');
}

function tierClass(tier = '—') { return `tier-${tier}`; }
function typeLabel(type = 'unknown') { return String(type).replace(/-/g, ' '); }
function value(v, suffix = '') { return v == null ? '—' : `${v}${suffix}`; }
function cap(s) { return String(s || '').replace(/(^|\s)\S/g, m => m.toUpperCase()); }
function spritePath(id) { return `../app/sprites/header/food_images/${id}.png`; }

function appShell(content, current = '') {
  const stats = buildDashboardStats();
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="pixel-tag">INTERNAL STUDIO BUILD V2</div>
          <h1>FoodRanked Studio</h1>
          <p>Cozy pixel-nutrition control room for browsing foods, checking scores, reviewing scripts, and handing off into the display builder.</p>
        </div>
        <nav class="nav">
          ${navLink('#/', 'Dashboard', current === '/')}
          ${navLink('#/foods', 'Foods index', current.startsWith('/foods'))}
          ${navLink('#/rules', 'Scoring + rulesets', current === '/rules')}
          ${navLink('#/episodes', 'Episodes + scripts', current === '/episodes')}
          ${navLink('#/builder', 'Display builder', current === '/builder')}
        </nav>
        <div class="sidebar-card">
          <h3>Studio state</h3>
          <ul>
            <li>${stats.totalFoods} foods surfaced from repo samples</li>
            <li>${stats.scoredFoods} foods with score outputs available</li>
            <li>${stats.featuredScripts} launch scripts ready to inspect</li>
            <li>${stats.coverage}% of indexed foods currently have score cards</li>
          </ul>
        </div>
        <div class="sidebar-card">
          <h3>Quick links</h3>
          <p><a href="../app/index.html">Open existing display builder</a></p>
          <p><a href="../visual-template-v1.html">Open visual template</a></p>
        </div>
      </aside>
      <main class="main">${content}</main>
    </div>`;
}

function navLink(href, label, active) {
  return `<a href="${href}" class="${active ? 'active' : ''}">${label}</a>`;
}

function buildDashboardStats() {
  const foods = state.foods;
  const results = state.results;
  const featuredScripts = Object.keys(FEATURED_EPISODES).length;
  const topReady = results.filter(r => ['A', 'S'].includes(r.tier)).length;
  const coverage = foods.length ? Math.round((results.length / foods.length) * 100) : 0;
  return { totalFoods: foods.length, scoredFoods: results.length, featuredScripts, topReady, coverage };
}

function getFoodResult(foodId) {
  return state.resultsById.get(foodId) || null;
}

function buildFoodsWithResults() {
  return state.foods.map(food => ({ food, result: getFoodResult(food.id), featured: FEATURED_EPISODES[food.id] || null }));
}

function findFoodIdByName(name) {
  const match = state.foods.find(food => food.name === name);
  return match?.id || '';
}

function formatSectionLabel(key) {
  const match = SCORING_SECTIONS.find(([id]) => id === key);
  return match ? match[1] : cap(key);
}

function formatScore(valueIn) {
  if (valueIn == null || Number.isNaN(Number(valueIn))) return '—';
  const n = Number(valueIn);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function scoreSummary(result) {
  if (!result) return '<div class="empty">No score breakdown yet.</div>';
  return `<div class="score-bars">${Object.entries(result.sectionScores || {}).map(([key, val]) => `
    <div class="score-bar">
      <label><span>${formatSectionLabel(key)}</span><strong>${formatScore(val)}</strong></label>
      <div class="meter"><span style="width:${Math.max(0, Math.min(100, Number(val) || 0))}%"></span></div>
    </div>`).join('')}</div>`;
}

function metricCard(label, val) {
  return `<div class="metric-card"><strong>${label}</strong><span>${val}</span></div>`;
}

function topSection(result) {
  if (!result?.sectionScores) return null;
  const entries = Object.entries(result.sectionScores).filter(([, val]) => val != null && !Number.isNaN(Number(val)));
  if (!entries.length) return null;
  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  return { key: entries[0][0], value: entries[0][1] };
}

function bottomSection(result) {
  if (!result?.sectionScores) return null;
  const entries = Object.entries(result.sectionScores).filter(([, val]) => val != null && !Number.isNaN(Number(val)));
  if (!entries.length) return null;
  entries.sort((a, b) => Number(a[1]) - Number(b[1]));
  return { key: entries[0][0], value: entries[0][1] };
}

function groupedCounts(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function foodCard(food, result) {
  const featured = FEATURED_EPISODES[food.id];
  const top = topSection(result);
  const badges = [
    `<span class="pill ${tierClass(result?.tier || food.expectedTier || '—')}">Tier ${result?.tier || food.expectedTier || '—'}</span>`,
    `<span class="pill subtle-pill">${cap(typeLabel(food.foodType))}</span>`,
    featured ? '<span class="pill subtle-pill">Featured</span>' : '',
    result ? '<span class="pill subtle-pill">Scored</span>' : '<span class="pill subtle-pill">Unscored</span>'
  ].filter(Boolean).join('');

  return `
    <a class="food-row" href="#/foods/${food.id}">
      <div class="sprite-slot">
        <img src="${spritePath(food.id)}" alt="${food.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'slot-label',innerHTML:'SPRITE SLOT<br>${food.id.toUpperCase()}'}))">
      </div>
      <div>
        <div class="title-row title-row-start"><strong>${food.name}</strong></div>
        <div class="badge-row">${badges}</div>
        <div class="copy">${value(result?.header?.kcal || food.kcal, ' kcal')} · ${featured ? 'featured launch script ready' : result ? 'scored batch result available' : 'sample food data loaded'}${top ? ` · strongest: ${formatSectionLabel(top.key)} ${formatScore(top.value)}` : ''}</div>
      </div>
      <div class="kicker">OPEN →</div>
    </a>`;
}

function dashboardView() {
  const stats = buildDashboardStats();
  const featuredFoods = Object.keys(FEATURED_EPISODES).map(id => state.foodsById.get(id)).filter(Boolean);
  const topScored = [...state.results].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0)).slice(0, 6);
  const typeCounts = groupedCounts(state.foods, item => typeLabel(item.foodType));
  const recentScored = buildFoodsWithResults().filter(item => item.result).slice(0, 8);
  return appShell(`
    <section class="topbar">
      <div>
        <h2>Studio dashboard</h2>
        <p>Internal overview for food library, score visibility, script readiness, and production handoff into the builder.</p>
      </div>
      <a class="pill" href="#/foods">Browse all foods</a>
    </section>

    <section class="grid cols-4">
      <div class="panel stat-card"><div class="kicker">FOOD LIBRARY</div><div class="big">${stats.totalFoods}</div><p class="muted">Sample foods indexed from <code>foods/*.sample.json</code>.</p></div>
      <div class="panel stat-card"><div class="kicker">SCORED NOW</div><div class="big">${stats.scoredFoods}</div><p class="muted">Current batch results available for quick review.</p></div>
      <div class="panel stat-card"><div class="kicker">TOP READY</div><div class="big">${stats.topReady}</div><p class="muted">Foods currently landing in A/S from the present score output.</p></div>
      <div class="panel stat-card"><div class="kicker">SCRIPT PACK</div><div class="big">${stats.featuredScripts}</div><p class="muted">Launch scripts pulled into the episode area tonight.</p></div>
    </section>

    <section class="grid cols-main">
      <div class="panel">
        <div class="title-row"><h3>Launch episode queue</h3><a class="pill" href="#/episodes">Open full episode view</a></div>
        <div class="feature-list" style="margin-top:14px;">
          ${featuredFoods.map(food => {
            const result = state.resultsById.get(food.id);
            const episode = FEATURED_EPISODES[food.id];
            return `<a class="feature-item" href="#/episodes?food=${food.id}">
              <div class="title-row"><strong>#${episode.publishOrder} ${food.name}</strong><span class="pill ${tierClass(result?.tier || '—')}">${result?.tier || '—'} tier</span></div>
              <div class="copy">${episode.status.replace('-', ' ')} · ${typeLabel(food.foodType)} · ${value(result?.overallScore, ' overall')}</div>
            </a>`;
          }).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>Current strongest scores</h3>
        <div class="mini-list" style="margin-top:14px;">
          ${topScored.map(item => `<a class="feature-item" href="#/foods/${findFoodIdByName(item.food)}"><div class="title-row"><strong>${item.food}</strong><span class="pill ${tierClass(item.tier)}">${item.tier}</span></div><div class="copy">${typeLabel(item.type)} · ${item.overallScore} overall</div></a>`).join('')}
        </div>
      </div>
    </section>

    <section class="grid cols-main">
      <div class="panel">
        <div class="title-row"><h3>Production status board</h3><span class="pill">Coverage ${stats.coverage}%</span></div>
        <div class="section-list" style="margin-top:16px;">
          ${[
            ['Data foundation', `${stats.totalFoods} food records indexed and browseable.`],
            ['Score visibility', `${stats.scoredFoods} foods have surfaced batch results for studio review.`],
            ['Script review', `${stats.featuredScripts} polished launch scripts wired into episode view.`],
            ['Builder handoff', 'The studio now acts as the browse/control layer above the existing display builder.']
          ].map((row, i) => `<div class="section-step"><div class="num">${i+1}</div><div><strong>${row[0]}</strong><div class="copy">${row[1]}</div></div></div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>Food types currently indexed</h3>
        <div class="chip-grid" style="margin-top:14px;">
          ${typeCounts.map(([type, count]) => `<span class="chip"><strong>${cap(type)}</strong><em>${count}</em></span>`).join('')}
        </div>
      </div>
    </section>

    <section class="grid cols-main">
      <div class="panel">
        <h3>Scored foods available right now</h3>
        <div class="mini-list" style="margin-top:14px;">
          ${recentScored.map(({ food, result }) => {
            const top = topSection(result);
            return `<a class="feature-item" href="#/foods/${food.id}?tab=scores"><div class="title-row"><strong>${food.name}</strong><span class="pill ${tierClass(result?.tier || '—')}">${result?.tier || '—'}</span></div><div class="copy">${value(result?.overallScore, ' overall')} · strongest section: ${top ? `${formatSectionLabel(top.key)} (${formatScore(top.value)})` : '—'}</div></a>`;
          }).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>What is still blocked?</h3>
        <div class="copy" style="margin-top:12px;">
          Final food hero sprites, category-specific icon polish, and any pixel-art header assets not yet exported. The layout already expects them; this phase is now mostly about making the site more useful while the art catches up.
        </div>
      </div>
    </section>
  `, '/');
}

function foodsView() {
  const qRaw = qs().get('q') || '';
  const query = qRaw.toLowerCase();
  const typeFilter = qs().get('type') || 'all';
  const scoreFilter = qs().get('score') || 'all';
  const sort = qs().get('sort') || 'name';

  let foods = buildFoodsWithResults().filter(({ food, result }) => {
    const matchesQuery = !query || [food.name, food.id, food.foodType].some(part => String(part).toLowerCase().includes(query));
    const matchesType = typeFilter === 'all' || food.foodType === typeFilter;
    const matchesScore = scoreFilter === 'all'
      || (scoreFilter === 'scored' && !!result)
      || (scoreFilter === 'unscored' && !result)
      || (scoreFilter === 'featured' && !!FEATURED_EPISODES[food.id]);
    return matchesQuery && matchesType && matchesScore;
  });

  foods.sort((a, b) => {
    if (sort === 'score-desc') return (Number(b.result?.overallScore) || -1) - (Number(a.result?.overallScore) || -1) || a.food.name.localeCompare(b.food.name);
    if (sort === 'score-asc') return (Number(a.result?.overallScore) || 999) - (Number(b.result?.overallScore) || 999) || a.food.name.localeCompare(b.food.name);
    if (sort === 'tier') return String(a.result?.tier || 'Z').localeCompare(String(b.result?.tier || 'Z')) || ((Number(b.result?.overallScore) || -1) - (Number(a.result?.overallScore) || -1));
    if (sort === 'type') return String(a.food.foodType).localeCompare(String(b.food.foodType)) || a.food.name.localeCompare(b.food.name);
    return a.food.name.localeCompare(b.food.name);
  });

  const availableTypes = [...new Set(state.foods.map(food => food.foodType))].sort();
  const scoredCount = foods.filter(item => item.result).length;
  const featuredCount = foods.filter(item => FEATURED_EPISODES[item.food.id]).length;

  return appShell(`
    <section class="topbar">
      <div>
        <h2>Foods index</h2>
        <p>Repo-backed browse view for sample foods, tiers, score availability, and art placeholders.</p>
      </div>
      <div class="toolbar-actions">
        <a class="pill" href="#/foods?score=scored">Scored only</a>
        <a class="pill" href="#/foods?score=featured">Featured only</a>
      </div>
    </section>
    <section class="panel">
      <div class="filters">
        <input id="foodSearch" class="search" placeholder="Search foods, ids, or types" value="${escapeHtml(qRaw)}" />
        <select id="typeFilter" class="search filter-select">
          <option value="all">All food types</option>
          ${availableTypes.map(type => `<option value="${type}" ${type === typeFilter ? 'selected' : ''}>${cap(typeLabel(type))}</option>`).join('')}
        </select>
        <select id="scoreFilter" class="search filter-select">
          ${[
            ['all', 'All states'],
            ['scored', 'Scored only'],
            ['unscored', 'Unscored only'],
            ['featured', 'Featured only']
          ].map(([val, label]) => `<option value="${val}" ${val === scoreFilter ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
        <select id="sortFilter" class="search filter-select">
          ${[
            ['name', 'Sort: name'],
            ['score-desc', 'Sort: highest score'],
            ['score-asc', 'Sort: lowest score'],
            ['tier', 'Sort: tier'],
            ['type', 'Sort: type']
          ].map(([val, label]) => `<option value="${val}" ${val === sort ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </div>
      <div class="list-meta">Showing <strong>${foods.length}</strong> of <strong>${state.foods.length}</strong> foods · <strong>${scoredCount}</strong> scored · <strong>${featuredCount}</strong> featured.</div>
      <div class="food-list">${foods.map(({ food, result }) => foodCard(food, result)).join('')}</div>
    </section>
  `, '/foods');
}

function foodDetailView(id) {
  const food = state.foodsById.get(id);
  if (!food) return notFoundView();
  const result = state.resultsById.get(id);
  const featured = FEATURED_EPISODES[id];
  const routeTab = qs().get('tab') || 'overview';
  const top = topSection(result);
  const bottom = bottomSection(result);

  return appShell(`
    <section class="topbar">
      <div>
        <h2>${food.name}</h2>
        <p>${cap(typeLabel(food.foodType))} · per ${food.basis?.value || 100}${food.basis?.unit || 'g'} · repo sample</p>
      </div>
      <a class="pill" href="#/foods">← Back to foods</a>
    </section>

    <section class="detail-layout">
      <div class="grid">
        <div class="panel">
          <div class="hero-slot">
            <img src="${spritePath(food.id)}" alt="${food.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'slot-label',innerHTML:'HERO / SPRITE SLOT<br>DROP FINAL ART TOMORROW'}))">
          </div>
          <div style="margin-top:12px;" class="copy">This slot is already wired for the final hero sprite. Once the asset exists, the page upgrades automatically without structural changes.</div>
        </div>
        <div class="panel">
          <h3>Header stats</h3>
          <div class="metric-grid" style="margin-top:14px;">
            ${[
              ['Calories', value(result?.header?.kcal, ' kcal')],
              ['Fat', value(result?.header?.fat_g, ' g')],
              ['Carbs', value(result?.header?.carb_g, ' g')],
              ['Protein', value(result?.header?.protein_g, ' g')],
              ['Tier', result?.tier || food.expectedTier || '—'],
              ['Overall', value(result?.overallScore, '')]
            ].map(([k,v]) => metricCard(k, v)).join('')}
          </div>
          <div class="metric-grid" style="margin-top:10px;">
            ${metricCard('Scored batch', result ? 'available' : 'not yet')}
            ${metricCard('Featured episode', featured ? 'yes' : 'no')}
            ${metricCard('Source file', `<code>${food.path}</code>`)}
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="panel">
          <div class="tabs">
            ${tabLink(id,'overview',routeTab)}
            ${tabLink(id,'scores',routeTab)}
            ${tabLink(id,'context',routeTab)}
            ${tabLink(id,'episode',routeTab)}
          </div>
          <div style="margin-top:16px;">${foodDetailTab(food, result, featured, routeTab)}</div>
        </div>
        <div class="panel">
          <h3>Quick read</h3>
          <div class="mini-list" style="margin-top:12px;">
            <div class="feature-item"><div class="title-row"><strong>Strongest section</strong><span class="pill">${top ? formatScore(top.value) : '—'}</span></div><div class="copy">${top ? formatSectionLabel(top.key) : 'No scored section yet.'}</div></div>
            <div class="feature-item"><div class="title-row"><strong>Weakest section</strong><span class="pill">${bottom ? formatScore(bottom.value) : '—'}</span></div><div class="copy">${bottom ? formatSectionLabel(bottom.key) : 'No scored section yet.'}</div></div>
            <div class="feature-item"><div class="title-row"><strong>Builder handoff</strong><a class="pill" href="#/builder">Open</a></div><div class="copy">Use the studio for browse/explainability, then jump into the exact-layer builder for composition work.</div></div>
          </div>
        </div>
      </div>
    </section>
  `, '/foods');
}

function tabLink(id, tab, current) {
  return `<a href="#/foods/${id}?tab=${tab}" class="${current === tab ? 'active' : ''}">${cap(tab)}</a>`;
}

function foodDetailTab(food, result, featured, tab) {
  if (tab === 'scores') {
    if (!result) return '<div class="empty">No scored batch output exists for this food yet.</div>';
    const top = topSection(result);
    const bottom = bottomSection(result);
    return `
      <div class="grid cols-3">
        <div class="panel"><h4>Overall</h4><div class="copy" style="margin-top:8px;">${formatScore(result.overallScore)} overall · ${result.tier} tier.</div></div>
        <div class="panel"><h4>Strongest section</h4><div class="copy" style="margin-top:8px;">${top ? `${formatSectionLabel(top.key)} at ${formatScore(top.value)}` : '—'}</div></div>
        <div class="panel"><h4>Weakest section</h4><div class="copy" style="margin-top:8px;">${bottom ? `${formatSectionLabel(bottom.key)} at ${formatScore(bottom.value)}` : '—'}</div></div>
      </div>
      <div class="panel" style="margin-top:16px;">
        <h4>Section breakdown</h4>
        <div style="margin-top:12px;">${scoreSummary(result)}</div>
      </div>`;
  }

  if (tab === 'context') {
    const pros = result?.contextItems?.pros || [];
    const cons = result?.contextItems?.cons || [];
    return `
      <div class="grid cols-3">
        <div class="panel"><h4>Summary</h4><div class="copy" style="margin-top:8px;">${result?.summary || 'No summary yet.'}</div></div>
        <div class="panel"><h4>Pros</h4><div class="copy" style="margin-top:8px;">${pros.map(item => `• ${item.title}`).join('<br>') || '<span class="empty">No pros loaded.</span>'}</div></div>
        <div class="panel"><h4>Cons</h4><div class="copy" style="margin-top:8px;">${cons.map(item => `• ${item.title}`).join('<br>') || '<span class="empty">No cons loaded.</span>'}</div></div>
      </div>`;
  }

  if (tab === 'episode') {
    return featured
      ? `<div class="script-box">${escapeHtml(featured.script)}</div>`
      : `<div class="empty">No polished episode script embedded for this food yet.</div>`;
  }

  return `
    <div class="grid cols-3">
      <div class="panel"><h4>Current score read</h4><div class="copy" style="margin-top:8px;">${result ? `${formatScore(result.overallScore)} overall · ${result.tier} tier.` : 'Awaiting scored batch output.'}</div></div>
      <div class="panel"><h4>Source file</h4><div class="copy" style="margin-top:8px;"><code>${food.path}</code></div></div>
      <div class="panel"><h4>Episode status</h4><div class="copy" style="margin-top:8px;">${featured ? featured.status.replace('-', ' ') : 'not in launch top 5 yet'}</div></div>
    </div>
    <div class="grid cols-3" style="margin-top:16px;">
      <div class="panel"><h4>Food id</h4><div class="copy" style="margin-top:8px;"><code>${food.id}</code></div></div>
      <div class="panel"><h4>Food type</h4><div class="copy" style="margin-top:8px;">${cap(typeLabel(food.foodType))}</div></div>
      <div class="panel"><h4>Basis</h4><div class="copy" style="margin-top:8px;">per ${food.basis?.value || 100}${food.basis?.unit || 'g'}</div></div>
    </div>
    <div class="panel" style="margin-top:16px;">
      <h4>Studio note</h4>
      <div class="copy" style="margin-top:8px;">This screen is tuned for explainability first: permanent header facts, score breakdown access, context review, and a direct path to script view. Public polish can come later.</div>
    </div>`;
}

function rulesView() {
  const tierSummary = [['S','90–100'],['A','78–89'],['B','64–77'],['C','45–63'],['D','0–44']];
  const sectionWeights = [
    ['Fats', '22%'],
    ['Carbs', '22%'],
    ['Proteins', '22%'],
    ['Vitamins', '17%'],
    ['Minerals', '17%']
  ];
  const foodTypeWeightingNotes = [
    ['Meats', 'Protein quality and micronutrients usually do more of the heavy lifting, while carb relevance often drops or disappears.'],
    ['Grains', 'Carb quality becomes a major driver, especially fibre, glycemic behaviour, and whether the grain still gives real nutrient return.'],
    ['Vegetables', 'Vitamin and mineral contribution matter more, because macro totals are usually low and the value case is micronutrient density.'],
    ['Fruits', 'Sugar context, fibre, and useful micronutrients matter more than raw macro quantity alone.'],
    ['Oils and fats', 'Fat quality dominates. The score should mostly reflect what kind of fat the food is actually delivering, not just the fact that it is calorie-dense.'],
    ['Legumes / dairy / seeds / nuts', 'The same top-level section weights stay broadly consistent, but internal metric weighting shifts by category so the right signals matter more.']
  ];

  return appShell(`
    <section class="topbar">
      <div>
        <h2>Scoring + ruleset explainer</h2>
        <p>Internal explainability page grounded in the current scoring docs and visible score outputs.</p>
      </div>
    </section>
    <section class="grid cols-main">
      <div class="panel">
        <h3>Locked video structure</h3>
        <div class="section-list" style="margin-top:14px;">
          ${SCORING_SECTIONS.map(([id, label], i) => `<div class="section-step"><div class="num">${i+1}</div><div><strong>${label}</strong><div class="copy">Section key: <code>${id}</code></div></div></div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>Tier mapping</h3>
        <div class="mini-list" style="margin-top:14px;">
          ${tierSummary.map(([tier, range]) => `<div class="feature-item"><div class="title-row"><strong>${tier} tier</strong><span class="pill ${tierClass(tier)}">${range}</span></div></div>`).join('')}
        </div>
      </div>
    </section>
    <section class="grid cols-main">
      <div class="panel">
        <h3>How scores work in this build</h3>
        <div class="rules-box" style="margin-top:12px;">Display-only metrics: total fat, total carbs, total protein, kcal.\n\nScore-bearing sections: fats, carbs, proteins, vitamins, minerals.\n\nPros and cons stay visible in every result, but act as context outputs the user can review before script-writing.\n\nVitamin/mineral scoring uses DV bands. Submacros use arrow ladders. Outputs stay explainable enough to reference on-video or inside the studio tool.</div>
      </div>
      <div class="panel">
        <h3>Default section weighting</h3>
        <div class="mini-list" style="margin-top:14px;">
          ${sectionWeights.map(([label, value]) => `<div class="feature-item"><div class="title-row"><strong>${label}</strong><span class="pill">${value}</span></div></div>`).join('')}
        </div>
      </div>
    </section>
    <section class="grid cols-main">
      <div class="panel">
        <h3>Food type weighting notes</h3>
        <div class="feature-list" style="margin-top:14px;">
          ${foodTypeWeightingNotes.map(([type, note]) => `<div class="feature-item"><div class="title-row"><strong>${type}</strong></div><div class="copy">${note}</div></div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>Why this page matters</h3>
        <div class="copy" style="margin-top:12px;">The internal app needs a place where James can sanity-check what the system is rewarding before turning results into scripts. This page is the “why does this score exist?” buffer between raw JSON and creative output.</div>
        <div class="copy" style="margin-top:12px;">The important rule is that food types should usually differ more through metric applicability and internal metric weighting than by inventing a totally different top-level formula every time.</div>
      </div>
    </section>
  `, '/rules');
}

function episodesView() {
  const selected = qs().get('food') || 'bacon';
  const food = state.foodsById.get(selected);
  const episode = FEATURED_EPISODES[selected];
  const result = state.resultsById.get(selected);
  const available = Object.keys(FEATURED_EPISODES)
    .map(id => ({ food: state.foodsById.get(id), episode: FEATURED_EPISODES[id], result: state.resultsById.get(id) }))
    .filter(x => x.food)
    .sort((a, b) => a.episode.publishOrder - b.episode.publishOrder);

  return appShell(`
    <section class="topbar">
      <div>
        <h2>Episode + script view</h2>
        <p>Launch-script review area with art slot, score context, and production-ready copy in one place.</p>
      </div>
    </section>
    <section class="grid cols-main">
      <div class="panel">
        <div class="title-row"><h3>Episode queue</h3><span class="pill">${available.length} featured</span></div>
        <div class="feature-list" style="margin-top:14px;">${available.map(({food, episode, result}) => `<a class="episode-card" href="#/episodes?food=${food.id}"><div class="title-row"><strong>#${episode.publishOrder} ${food.name}</strong><span class="pill ${tierClass(result?.tier || '—')}">${result?.tier || '—'}</span></div><div class="copy">${episode.status.replace('-', ' ')} · ${value(result?.overallScore, ' overall')}</div></a>`).join('')}</div>
      </div>
      <div class="panel">
        ${food && episode ? `
          <div class="title-row"><h3>${food.name}</h3><span class="pill">${episode.status.replace('-', ' ')}</span></div>
          <div class="hero-slot" style="margin-top:14px; min-height:180px;"><img src="${spritePath(food.id)}" alt="${food.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'slot-label',innerHTML:'EPISODE HERO SLOT<br>FINAL PIXEL ART TOMORROW'}))"></div>
          <div class="metric-grid" style="margin-top:14px;">
            <div class="metric-card"><strong>Publish order</strong><span>#${episode.publishOrder}</span></div>
            <div class="metric-card"><strong>Current tier</strong><span>${result?.tier || '—'}</span></div>
            <div class="metric-card"><strong>Current score</strong><span>${value(result?.overallScore, '')}</span></div>
          </div>
          <h4 style="margin-top:16px;">Narration draft</h4>
          <div class="script-box" style="margin-top:10px;">${escapeHtml(episode.script)}</div>
        ` : '<div class="empty">Select an episode from the queue.</div>'}
      </div>
    </section>
  `, '/episodes');
}

function builderView() {
  return appShell(`
    <section class="topbar">
      <div>
        <h2>Display builder handoff</h2>
        <p>The existing builder is still the right place for exact layer nudging. The studio app now acts as the browse/control layer above it.</p>
      </div>
    </section>
    <section class="grid cols-main">
      <div class="panel">
        <h3>What lives there</h3>
        <div class="copy" style="margin-top:12px;">Drag-and-drop layer editing, section-by-section display composition, background sprite field, and JSON export already existed in <code>docs/app/index.html</code>. The studio wraps that with food browsing, score visibility, and script review.</div>
        <p style="margin-top:14px;"><a class="pill" href="../app/index.html">Open display builder</a></p>
      </div>
      <div class="panel">
        <h3>Asset swap checklist</h3>
        <div class="copy" style="margin-top:12px;">1. Drop final food sprites into the existing sprite paths.\n2. Replace placeholder hero slots with real exports.\n3. Re-check the 5 featured episodes inside builder + studio.\n4. Only then do the cosmetic polish pass.</div>
      </div>
    </section>
  `, '/builder');
}

function notFoundView() {
  return appShell(`<section class="panel"><h2>Not found</h2><p class="copy">That route does not exist in the studio build yet.</p></section>`);
}

function render() {
  const path = routePath();
  let html = '';
  if (path === '/' || path === '') html = dashboardView();
  else if (path === '/foods') html = foodsView();
  else if (path.startsWith('/foods/')) html = foodDetailView(path.split('/')[2]);
  else if (path === '/rules') html = rulesView();
  else if (path === '/episodes') html = episodesView();
  else if (path === '/builder') html = builderView();
  else html = notFoundView();
  document.getElementById('app').innerHTML = html;

  const search = document.getElementById('foodSearch');
  const typeFilter = document.getElementById('typeFilter');
  const scoreFilter = document.getElementById('scoreFilter');
  const sortFilter = document.getElementById('sortFilter');

  const syncFoodFilters = () => {
    const q = document.getElementById('foodSearch')?.value.trim() || '';
    const type = document.getElementById('typeFilter')?.value || 'all';
    const score = document.getElementById('scoreFilter')?.value || 'all';
    const sort = document.getElementById('sortFilter')?.value || 'name';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type !== 'all') params.set('type', type);
    if (score !== 'all') params.set('score', score);
    if (sort !== 'name') params.set('sort', sort);
    navigate(`#/foods${params.toString() ? `?${params.toString()}` : ''}`);
  };

  if (search) search.addEventListener('input', syncFoodFilters);
  if (typeFilter) typeFilter.addEventListener('change', syncFoodFilters);
  if (scoreFilter) scoreFilter.addEventListener('change', syncFoodFilters);
  if (sortFilter) sortFilter.addEventListener('change', syncFoodFilters);
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

loadData().then(render).catch(() => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="app-shell"><main class="main"><section class="panel"><h2>Studio failed to load</h2><p class="copy">The published site could not load one or more data files. The shell is working, but the data bundle is missing or stale.</p></section></main></div>`;
  }
});
