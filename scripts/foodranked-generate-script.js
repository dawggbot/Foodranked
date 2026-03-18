#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const scorerPath = path.join(__dirname, 'foodranked-scorer.js');
const phraseBanksDir = path.join(repoRoot, 'references', 'phrase-banks');

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(p), 'utf8'));
}

const corePhrases = readJson(path.join(phraseBanksDir, 'narration-core.json'));
const categoryContext = readJson(path.join(phraseBanksDir, 'category-context.json'));

function scoreFood(foodPath, rulesetPath) {
  const res = spawnSync(process.execPath, [scorerPath, foodPath, rulesetPath], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  if (res.status !== 0) {
    throw new Error((res.stderr || res.stdout || 'Failed to score food').trim());
  }

  return JSON.parse(res.stdout);
}

function inferRulesetPath(food) {
  return path.join(repoRoot, 'rulesets', `${food.foodType}.v1.json`);
}

function hashString(input) {
  const str = String(input || '');
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return Math.abs(h);
}

function pick(list, fallback = '', seed = '') {
  if (!Array.isArray(list) || !list.length) return fallback;
  return list[hashString(seed) % list.length];
}

function titleForSection(key) {
  return {
    fats: 'Fats',
    carbs: 'Carbs',
    proteins: 'Proteins',
    vitamins: 'Vitamins',
    minerals: 'Minerals',
    pros: 'Pros',
    cons: 'Cons'
  }[key] || key;
}

function timingHintForSection(key) {
  return {
    fats: 'short-medium',
    carbs: 'short-medium',
    proteins: 'short-medium',
    vitamins: 'short-medium',
    minerals: 'short-medium',
    pros: 'medium',
    cons: 'medium'
  }[key] || 'short';
}

function formatMetricKey(metricKey) {
  return metricKey
    .replace(/_dv$/, '')
    .replace(/_mg$/, '')
    .replace(/_g$/, '')
    .replace(/_percent$/, '')
    .replace(/_/g, ' ')
    .replace(/\bgi\b/i, 'glycemic index')
    .replace(/\bea\b/i, 'essential amino acids')
    .replace(/\bdv\b/i, 'daily value');
}

function metricDisplayText(metric) {
  if (metric.scoringMode === 'dv_points') return `${formatMetricKey(metric.metricKey)} at ${metric.dvPercent}% DV`;
  if (metric.band) return `${formatMetricKey(metric.metricKey)} at ${metric.value}`;
  return formatMetricKey(metric.metricKey);
}

function topMetricsForSection(result, sectionKey, limit = 3) {
  return (result.metricBreakdown || [])
    .filter(item => item.sectionKey === sectionKey)
    .sort((a, b) => Math.abs(b.weightedScore) - Math.abs(a.weightedScore))
    .slice(0, limit)
    .map(metric => ({
      metricKey: metric.metricKey,
      text: metricDisplayText(metric),
      weightedScore: metric.weightedScore,
      scoringMode: metric.scoringMode,
      band: metric.band || null,
      dvPercent: metric.dvPercent ?? null,
      value: metric.value ?? null
    }));
}

function headerMacro(result, key) {
  const v = result.header?.[key];
  if (v === null || v === undefined) return null;
  return Number(v);
}

function macroLine(result, key) {
  const map = {
    fats: ['fat_g', 'fat'],
    carbs: ['carb_g', 'carbs'],
    proteins: ['protein_g', 'protein']
  };
  const [headerKey, label] = map[key] || [];
  const value = headerMacro(result, headerKey);
  if (value === null || value === undefined) return null;
  return `${label} is ${value}g`;
}

function joinShort(parts) {
  const valid = parts.filter(Boolean).map(part => String(part).trim()).filter(Boolean);
  return valid.join('. ') + (valid.length ? '.' : '');
}

function sectionContextLine(foodType, seed = '') {
  return pick(categoryContext[foodType], '', `${foodType}:${seed}`);
}

function strongestMetricLine(result, sectionKey) {
  const metrics = topMetricsForSection(result, sectionKey, 3);
  if (!metrics.length) return pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:lackluster`);

  const bestMetric = metrics[0];
  const strongestScore = bestMetric?.weightedScore ?? 0;
  const isPositive = strongestScore > 0;

  if (sectionKey === 'fats') {
    const omega3 = metrics.find(metric => metric.metricKey === 'omega3_mg' && (metric.value || 0) > 0 && metric.weightedScore > 0);
    const saturatedFat = metrics.find(metric => metric.metricKey === 'saturated_fat_g' && metric.weightedScore < 0);
    const cholesterol = metrics.find(metric => metric.metricKey === 'cholesterol_mg' && metric.weightedScore < 0);
    if (omega3) return 'omega 3 is doing serious work here';
    if (saturatedFat) return 'saturated fat is one of the main pressure points';
    if (cholesterol) return 'cholesterol is also part of the tradeoff';
  }

  if (sectionKey === 'carbs') {
    const fibre = metrics.find(metric => metric.metricKey === 'fibre_g' && (metric.value || 0) > 0 && metric.weightedScore > 0);
    const glycemicIndex = metrics.find(metric => metric.metricKey === 'glycemic_index' && metric.weightedScore < 0);
    const sugar = metrics.find(metric => metric.metricKey === 'sugar_g' && (metric.value || 0) > 0 && metric.weightedScore < 0);
    if (fibre) return 'the fibre support does a lot of the heavy lifting';
    if (glycemicIndex) return 'glycemic impact is a big part of the story';
    if (sugar) return 'the sugar load matters more than you would want';
  }

  if (sectionKey === 'proteins') {
    const bioavailability = metrics.find(metric => metric.metricKey === 'bioavailability_percent' && metric.weightedScore > 0);
    const essentialAmino = metrics.find(metric => metric.metricKey === 'essential_amino_acids_score' && metric.weightedScore > 0);
    if (bioavailability) return 'protein quality is clearly one of the selling points';
    if (essentialAmino) return 'the amino acid profile is carrying real weight';
  }

  const names = metrics.map(m => formatMetricKey(m.metricKey));
  if (!isPositive) return `${names[0]} is where the section starts to wobble`;
  if (names.length === 1) return `${names[0]} is the big one`;
  if (names.length === 2) return `${names[0]} and ${names[1]} stand out most`;
  return `${names[0]}, ${names[1]}, and ${names[2]} are doing most of the work`;
}

function buildHook(result) {
  return `${result.food.name} ranked.`;
}

function buildIntro() {
  return '';
}

function buildMacroSection(result, key) {
  const macro = macroLine(result, key);
  const strongest = strongestMetricLine(result, key);
  const foodType = result.food.foodType;

  const categoryLines = {
    meats: {
      fats: 'for meats, fat quality is one of the biggest separators once protein is already solid',
      carbs: 'for meats, carbs are barely the point, so the rest has to justify the food',
      proteins: 'for meats, strong protein is expected, so the side factors decide how high it climbs'
    },
    grains: {
      carbs: 'for grains, the real question is whether those carbs come with enough fibre and stability',
      proteins: 'protein helps, but grains still need the carb side to stay under control'
    },
    fruits: {
      carbs: 'for fruit, the tradeoff is sweetness versus fibre, satiety, and overall payoff'
    },
    vegetables: {
      carbs: 'for vegetables, low downside is useful, but there still needs to be enough nutritional return',
      proteins: 'protein is not the main pitch here, but extra support still matters'
    },
    legumes: {
      carbs: 'for legumes, the carb story matters less when fibre and protein are both backing it up',
      proteins: 'legumes need protein support to feel worth the carbs'
    },
    dairy: {
      fats: 'for dairy, the fat side can either add richness or drag the whole profile down',
      proteins: 'for dairy, useful protein can rescue a lot of weaker traits'
    },
    'oils-and-fats': {
      fats: 'for fats, quality matters far more than quantity here',
      carbs: 'carbs are almost irrelevant in this category',
      proteins: 'protein is barely part of the case in this category'
    },
    nuts: {
      fats: 'for nuts, fat quality is supposed to be the main advantage',
      proteins: 'protein is support here, not the whole argument'
    },
    seeds: {
      fats: 'for seeds, the fat profile is one of the biggest reasons they earn their place',
      proteins: 'protein is a bonus, but not enough by itself'
    },
    tubers: {
      carbs: 'for tubers, the carb side decides whether the food feels stable or flimsy',
      proteins: 'protein is usually limited here, so the other sections have to carry more'
    },
    misc: {
      carbs: 'the real story here is context rather than nutrition depth'
    }
  };

  const categoryLine = categoryLines[foodType]?.[key] || sectionContextLine(foodType, `${result.food.id}:${key}`);
  return joinShort([macro, strongest, categoryLine]);
}

function buildMicrosSection(result, sectionKey) {
  const top = topMetricsForSection(result, sectionKey, 3);
  if (!top.length) return `${pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:micro-lackluster`)}.`;

  if (result.food.foodType === 'misc') {
    return sectionKey === 'vitamins' ? 'No real vitamin story here.' : 'No real mineral story here.';
  }

  const names = top.map(m => metricDisplayText(m)).join(', ');
  const score = result.sectionScores?.[sectionKey] || 0;
  const context = sectionKey === 'vitamins'
    ? (score >= 50 ? 'that gives this food real vitamin support' : score >= 20 ? 'that helps, but vitamins still are not the main selling point' : 'that is not enough to move the verdict very far on its own')
    : (score >= 50 ? 'that gives this food real mineral support' : score >= 20 ? 'that is useful, but still not a huge mineral edge' : 'that stays fairly limited overall');

  return joinShort([`${names} stand out most`, context]);
}

function lowerFirst(s) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function trimSentence(s) {
  return String(s || '').trim().replace(/[.]+$/g, '');
}

function condenseExplanation(explanation) {
  let text = trimSentence(explanation || '');
  if (!text) return '';

  const replacements = [
    [/^Adds extra /i, 'adds '],
    [/^Adds /i, 'adds '],
    [/^Works well as /i, 'works well as '],
    [/^Works /i, 'works '],
    [/^The overall /i, 'the '],
    [/^The /i, 'the '],
    [/^This is one of the clearest viewer-recognisable wins in the fruit category$/i, 'that gives it a clear in-category edge'],
    [/^A major category advantage beyond the raw table alone$/i, 'that gives it a real category edge'],
    [/^Useful practical strength in meals$/i, 'that makes it practical in real meals'],
    [/^Strong viewer-facing health halo that matches the data reasonably well$/i, 'that fits its strong health reputation'],
    [/^Adds extra cardiovascular and satiety context beyond the base nutrient display$/i, 'that helps with fullness and overall payoff'],
    [/^Works well as a simple staple in many eating patterns$/i, 'that makes it easy to use regularly'],
    [/^The overall fibre profile can be practically useful beyond the raw grams display$/i, 'that can help with real-world digestion'],
    [/^Phytates may slightly reduce mineral uptake$/i, 'that can slightly reduce mineral absorption'],
    [/^Sugary toppings can shift the outcome a lot$/i, 'sweet add-ons can change the whole picture'],
    [/^Some people do not tolerate oats especially well$/i, 'some people just do not tolerate it that well'],
    [/^Price can limit practical use$/i, 'price can make it less practical'],
    [/^Wild vs farmed differences matter in practice$/i, 'sourcing changes the real-world quality'],
    [/^A practical downside compared with some shelf-stable foods$/i, 'it is less convenient than shelf-stable options']
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement);
      break;
    }
  }

  return lowerFirst(text);
}

function mergeContextItem(item) {
  const title = trimSentence(item.title || '');
  const explanation = condenseExplanation(item.explanation || '');
  if (!title) return explanation;
  if (!explanation) return title;
  return `${title} because ${explanation}`;
}

function buildProsConsSection(result, side) {
  const items = side === 'pros' ? (result.contextItems?.pros || []) : (result.contextItems?.cons || []);
  const openers = side === 'pros'
    ? ['pros first', 'on the plus side', 'the upsides first']
    : ['now the downsides', 'the drawbacks next', 'on the weaker side'];
  const intro = pick(openers, side === 'pros' ? 'pros first' : 'now the downsides', `${result.food.id}:${side}:intro`);
  const lines = [intro, ...items.map(mergeContextItem).filter(Boolean)];
  return lines.join('. ') + '.';
}

function bestUsesLine(result) {
  const type = result.food.foodType;
  const tier = result.tier;
  const strongByType = {
    meats: 'Best when you want efficient protein and can accept the category tradeoffs that come with it',
    grains: 'Best when you want a staple carb that actually brings something useful with it',
    fruits: 'Best when you want sweetness that still earns its place nutritionally',
    vegetables: 'Best when you want low downside and easy micronutrient support',
    legumes: 'Best when you want fibre, protein, and actual meal utility together',
    dairy: 'Best when the protein payoff or fermentation angle outweighs the fat and sodium tradeoffs',
    nuts: 'Best in small amounts where the fats and minerals matter more than sheer calories',
    seeds: 'Best as a support food that boosts meals instead of carrying them alone',
    tubers: 'Best when you want practical carbs and the rest of the profile is still reasonably clean',
    'oils-and-fats': 'Best in controlled amounts where fat quality is the main reason to use it',
    misc: 'Best treated as a context item rather than a nutritional cornerstone'
  };
  const weakByType = {
    meats: 'Best only if convenience, budget, or taste matters more than getting the cleanest meat option',
    grains: 'Best only as a light snack base or texture food, not as a strong staple by itself',
    fruits: 'Best only when the convenience or taste matters more than the nutrition return',
    vegetables: 'Best only when you need a low-commitment add-on rather than a nutrient-dense anchor',
    legumes: 'Best only when convenience outweighs the weaker fibre or protein payoff',
    dairy: 'Best only when the taste or format matters more than getting the strongest dairy profile',
    nuts: 'Best only in small amounts when the calories stay under control',
    seeds: 'Best only as a supporting add-on rather than something to lean on heavily',
    tubers: 'Best only when you want easy carbs and can accept the missing upside',
    'oils-and-fats': 'Best only in small amounts when the cooking job matters more than the nutrition case',
    misc: 'Best treated as an occasional context item, not a nutritional base'
  };
  if (tier === 'D' || tier === 'C') return weakByType[type] || 'Best only in narrow use cases where its limitations matter less';
  return strongByType[type] || 'Best when its strengths actually match the job you want it to do';
}

function buildClosing(result) {
  const subject = result.food.name;
  const tier = result.tier;
  const pros = (result.contextItems?.pros || []).map(item => trimSentence(item.title)).filter(Boolean);
  const cons = (result.contextItems?.cons || []).map(item => trimSentence(item.title)).filter(Boolean);
  const strongestPros = pros.slice(0, 2).join(' and ');
  const strongestCons = cons.slice(0, 2).join(' and ');

  const summary = [
    strongestPros ? `${subject} stands out for ${strongestPros}` : `${subject} has some clear strengths`,
    strongestCons ? `but it also gets held back by ${strongestCons}` : 'and the downsides stay fairly contained',
    bestUsesLine(result)
  ].join('. ') + '.';

  return {
    summary,
    finalReveal: `${subject} is ${tier} tier.`,
    useCaseNote: bestUsesLine(result) + '.',
    cta: 'Would you rank it the same, or nah?'
  };
}

function sectionNarration(result, sectionKey) {
  if (result.food.foodType === 'misc' && sectionKey === 'fats') return 'Simple one.';
  if (result.food.foodType === 'misc' && sectionKey === 'carbs') return joinShort([macroLine(result, sectionKey), 'but the real story is the context, not the nutrition profile']);
  if (result.food.foodType === 'misc' && sectionKey === 'proteins') return 'No real nutrition story here.';

  if (['fats', 'carbs', 'proteins'].includes(sectionKey)) return buildMacroSection(result, sectionKey);
  if (sectionKey === 'vitamins') return buildMicrosSection(result, 'vitamins');
  if (sectionKey === 'minerals') return buildMicrosSection(result, 'minerals');
  if (sectionKey === 'pros') return buildProsConsSection(result, 'pros');
  if (sectionKey === 'cons') return buildProsConsSection(result, 'cons');
  return '';
}

function displayItemsForSection(result, sectionKey) {
  if (sectionKey === 'pros') {
    return (result.contextItems?.pros || []).map(item => ({
      type: 'pro',
      title: item.title,
      explanation: item.explanation,
      impactLevel: item.impactLevel,
      scoreValue: item.scoreValue ?? null
    }));
  }
  if (sectionKey === 'cons') {
    return (result.contextItems?.cons || []).map(item => ({
      type: 'con',
      title: item.title,
      explanation: item.explanation,
      impactLevel: item.impactLevel,
      scoreValue: item.scoreValue ?? null
    }));
  }
  return topMetricsForSection(result, sectionKey, 4);
}

function buildSections(result) {
  const order = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals', 'pros', 'cons'];
  return order.map(key => ({
    key,
    title: titleForSection(key),
    narration: sectionNarration(result, key),
    displayItems: displayItemsForSection(result, key),
    subtitleText: sectionNarration(result, key),
    timingHint: timingHintForSection(key),
    score: result.sectionScores?.[key] ?? null
  }));
}

function main() {
  const [, , foodPathArg, rulesetPathArg] = process.argv;
  if (!foodPathArg) {
    console.error('Usage: node scripts/foodranked-generate-script.js <food.json> [ruleset.json]');
    process.exit(1);
  }

  const foodPath = path.resolve(foodPathArg);
  const food = readJson(foodPath);
  const rulesetPath = rulesetPathArg ? path.resolve(rulesetPathArg) : inferRulesetPath(food);
  const result = scoreFood(foodPath, rulesetPath);

  const script = {
    status: 'ok',
    food: result.food,
    ruleset: result.ruleset,
    header: result.header,
    hook: buildHook(result),
    intro: buildIntro(result),
    sections: buildSections(result),
    closing: buildClosing(result),
    tier: result.tier,
    overallScore: result.overallScore,
    explanation: result.explanation
  };

  console.log(JSON.stringify(script, null, 2));
}

main();
