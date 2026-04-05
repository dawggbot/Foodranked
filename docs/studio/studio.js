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

const state = { foods: [], results: [], foodsById: new Map(), resultsById: new Map(), route: location.hash || '#/' };

async function loadData() {
  const [foods, batch] = await Promise.all([
    fetch('../app/data/foods-index.json').then(r => r.json()),
    fetch('../../batch-results.json').then(r => r.json())
  ]);
  state.foods = foods;
  state.results = batch.summary || [];
  state.foodsById = new Map(foods.map(food => [food.id, food]));
  state.resultsById = new Map((batch.details || []).map(item => [item.result?.food?.id, item.result]));
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
          <div class="pixel-tag">INTERNAL STUDIO BUILD V1</div>
          <h1>FoodRanked Studio</h1>
          <p>Cozy pixel-nutrition control room. Built for tomorrow’s production pass, not public polish.</p>
        </div>
        <nav class="nav">
          ${navLink('#/', 'Dashboard', current === '/')}
          ${navLink('#/foods', 'Foods index', current.startsWith('/foods'))}
          ${navLink('#/rules', 'Scoring + rulesets', current === '/rules')}
          ${navLink('#/episodes', 'Episodes + scripts', current === '/episodes')}
          ${navLink('#/builder', 'Display builder', current === '/builder')}
        </nav>
        <div class="sidebar-card">
          <h3>Tonight’s state</h3>
          <ul>
            <li>${stats.totalFoods} foods surfaced from repo samples</li>
            <li>${stats.scoredFoods} foods with score outputs available</li>
            <li>${stats.featuredScripts} launch scripts ready to inspect</li>
            <li>Sprite slots are placeholders until tomorrow’s uploads land</li>
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
  return { totalFoods: foods.length, scoredFoods: results.length, featuredScripts, topReady };
}

function scoreSummary(result) {
  if (!result) return '<div class="empty">No score breakdown yet.</div>';
  return `<div class="score-bars">${Object.entries(result.sectionScores || {}).map(([key, val]) => `
    <div class="score-bar">
      <label><span>${cap(key)}</span><strong>${value(val, '')}</strong></label>
      <div class="meter"><span style="width:${Math.max(0, Math.min(100, Number(val) || 0))}%"></span></div>
    </div>`).join('')}</div>`;
}

function foodCard(food, result) {
  const featured = FEATURED_EPISODES[food.id];
  return `
    <a class="food-row" href="#/foods/${food.id}">
      <div class="sprite-slot">
        <img src="${spritePath(food.id)}" alt="${food.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'slot-label',innerHTML:'SPRITE SLOT<br>${food.id.toUpperCase()}'}))">
      </div>
      <div>
        <div class="title-row"><strong>${food.name}</strong><span class="pill ${tierClass(result?.tier || food.expectedTier || '—')}">Tier ${result?.tier || food.expectedTier || '—'}</span></div>
        <div class="copy">${cap(typeLabel(food.foodType))} · ${value(result?.header?.kcal || food.kcal, ' kcal')} · ${featured ? 'featured launch script ready' : 'sample food data loaded'}</div>
      </div>
      <div class="kicker">OPEN →</div>
    </a>`;
}

function dashboardView() {
  const stats = buildDashboardStats();
  const featuredFoods = Object.keys(FEATURED_EPISODES).map(id => state.foodsById.get(id)).filter(Boolean);
  const topScored = [...state.results].sort((a,b) => (b.overallScore || 0) - (a.overallScore || 0)).slice(0, 6);
  return appShell(`
    <section class="topbar">
      <div>
        <h2>Studio dashboard</h2>
        <p>Internal overview for food library, score visibility, script readiness, and placeholder art coverage.</p>
      </div>
      <input class="search" placeholder="Jump to a food by editing the URL hash for now…" disabled />
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
        <div class="title-row"><h3>Production status board</h3><span class="pill">Tonight view</span></div>
        <div class="section-list" style="margin-top:16px;">
          ${[
            ['Data foundation', `${stats.totalFoods} food records indexed and browseable.`],
            ['Score visibility', `${stats.scoredFoods} foods have surfaced batch results for studio review.`],
            ['Script review', `${stats.featuredScripts} polished launch scripts wired into episode view.`],
            ['Sprite handoff', 'All core screens have placeholder art slots ready for swap-in tomorrow.']
          ].map((row, i) => `<div class="section-step"><div class="num">${i+1}</div><div><strong>${row[0]}</strong><div class="copy">${row[1]}</div></div></div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <h3>What is still blocked?</h3>
        <div class="copy" style="margin-top:12px;">
          Final food hero sprites, category-specific icon polish, and any pixel-art header assets not yet exported. The layout already expects them; tomorrow should mostly be a replace-assets pass rather than structural rebuild.
        </div>
      </div>
    </section>
  `, '/');
}

function foodsView() {
  const query = (qs().get('q') || '').toLowerCase();
  const foods = state.foods.filter(food => !query || [food.name, food.id, food.foodType].some(part => String(part).toLowerCase().includes(query)));
  return appShell(`
    <section class="topbar">
      <div>
        <h2>Foods index</h2>
        <p>Repo-backed browse view for sample foods, tiers, and art placeholders.</p>
      </div>
      <input id="foodSearch" class="search" placeholder="Search foods, ids, or types" value="${escapeHtml(qs().get('q') || '')}" />
    </section>
    <section class="panel">
      <div class="food-list">${foods.map(food => foodCard(food, state.resultsById.get(food.id))).join('')}</div>
    </section>
  `, '/foods');
}

function foodDetailView(id) {
  const food = state.foodsById.get(id);
  if (!food) return notFoundView();
  const result = state.resultsById.get(id);
  const featured = FEATURED_EPISODES[id];
  const routeTab = qs().get('tab') || 'overview';
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
          <div style="margin-top:12px;" class="copy">Placeholder art box is already wired. Swap in final sprite/export tomorrow without changing page structure.</div>
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
            ].map(([k,v]) => `<div class="metric-card"><strong>${k}</strong><span>${v}</span></div>`).join('')}
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
      </div>
    </section>
  `, '/foods');
}

function tabLink(id, tab, current) {
  return `<a href="#/foods/${id}?tab=${tab}" class="${current === tab ? 'active' : ''}">${cap(tab)}</a>`;
}

function foodDetailTab(food, result, featured, tab) {
  if (tab === 'scores') return scoreSummary(result);
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
      <div class="panel"><h4>Current score read</h4><div class="copy" style="margin-top:8px;">${result ? `${result.overallScore} overall · ${result.tier} tier.` : 'Awaiting scored batch output.'}</div></div>
      <div class="panel"><h4>Source file</h4><div class="copy" style="margin-top:8px;"><code>${food.path}</code></div></div>
      <div class="panel"><h4>Episode status</h4><div class="copy" style="margin-top:8px;">${featured ? featured.status.replace('-', ' ') : 'not in launch top 5 yet'}</div></div>
    </div>
    <div class="panel" style="margin-top:16px;">
      <h4>Studio note</h4>
      <div class="copy" style="margin-top:8px;">This screen is tuned for explainability first: permanent header facts, score breakdown access, and direct path to script view. Public-facing fluff can come later.</div>
    </div>`;
}

function rulesView() {
  return appShell(`
    <section class="topbar">
      <div>
        <h2>Scoring + ruleset explainer</h2>
        <p>Internal explainability page grounded in the current scoring docs.</p>
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
          ${[['S','90–100'],['A','78–89'],['B','64–77'],['C','45–63'],['D','0–44']].map(([tier, range]) => `<div class="feature-item"><div class="title-row"><strong>${tier} tier</strong><span class="pill ${tierClass(tier)}">${range}</span></div></div>`).join('')}
        </div>
      </div>
    </section>
    <section class="grid cols-main">
      <div class="panel">
        <h3>How scores work in this build</h3>
        <div class="rules-box" style="margin-top:12px;">Display-only metrics: total fat, total carbs, total protein, kcal.\n\nScore-bearing sections: fats, carbs, proteins, vitamins, minerals.\n\nPros and cons stay visible in every result, but act as capped context modifiers rather than hidden full sections.\n\nVitamin/mineral scoring uses DV bands. Submacros use arrow ladders. Outputs stay explainable enough to reference on-video or inside the studio tool.</div>
      </div>
      <div class="panel">
        <h3>Why this page matters</h3>
        <div class="copy" style="margin-top:12px;">The internal app needs a place where James can sanity-check what the system is rewarding before turning results into scripts. This page is the “why does this score exist?” buffer between raw JSON and creative output.</div>
      </div>
    </section>
  `, '/rules');
}

function episodesView() {
  const selected = qs().get('food') || 'bacon';
  const food = state.foodsById.get(selected);
  const episode = FEATURED_EPISODES[selected];
  const result = state.resultsById.get(selected);
  const available = Object.keys(FEATURED_EPISODES).map(id => ({ food: state.foodsById.get(id), episode: FEATURED_EPISODES[id], result: state.resultsById.get(id) })).filter(x => x.food);
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
        <p>The existing builder is still the right place for exact layer nudging. This studio app links into it instead of replacing it.</p>
      </div>
    </section>
    <section class="grid cols-main">
      <div class="panel">
        <h3>What lives there</h3>
        <div class="copy" style="margin-top:12px;">Drag-and-drop layer editing, section-by-section display composition, background sprite field, and JSON export already existed in <code>docs/app/index.html</code>. Tonight’s work wraps that with studio navigation, browse flows, and score/script visibility.</div>
        <p style="margin-top:14px;"><a class="pill" href="../app/index.html">Open display builder</a></p>
      </div>
      <div class="panel">
        <h3>Tomorrow’s asset swap checklist</h3>
        <div class="copy" style="margin-top:12px;">1. Drop final food sprites into the existing sprite paths.\n2. Replace placeholder hero slots with real exports.\n3. Re-check 5 featured episodes inside builder + studio.\n4. Only then consider polish passes.</div>
      </div>
    </section>
  `, '/builder');
}

function notFoundView() {
  return appShell(`<section class="panel"><h2>Not found</h2><p class="copy">That route does not exist in the studio build yet.</p></section>`);
}

function findFoodIdByName(name) {
  const match = state.foods.find(food => food.name === name);
  return match?.id || '';
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
  if (search) {
    search.addEventListener('input', e => {
      const q = e.target.value.trim();
      navigate(`#/${'foods'}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    });
  }
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

loadData().then(render);
