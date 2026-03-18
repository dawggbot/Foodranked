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
const exaggerationRules = readJson(path.join(phraseBanksDir, 'exaggeration-rules.json'));

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
    vitamins: 'short',
    minerals: 'short',
    pros: 'short',
    cons: 'short'
  }[key] || 'short';
}

function singularFoodType(foodType) {
  const map = {
    fruits: 'fruit',
    vegetables: 'vegetable',
    grains: 'grain',
    legumes: 'legume',
    tubers: 'tuber',
    nuts: 'nut',
    seeds: 'seed',
    meats: 'meat',
    dairy: 'dairy food',
    misc: 'misc item',
    'oils-and-fats': 'fat'
  };
  return map[foodType] || foodType;
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

function topMetricsForSection(result, sectionKey, limit = 2) {
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
  const valid = parts.filter(Boolean);
  return valid.join('. ') + (valid.length ? '.' : '');
}

function sectionContextLine(foodType, seed = '') {
  return pick(categoryContext[foodType], '', `${foodType}:${seed}`);
}

function strongestMetricLine(result, sectionKey) {
  const metrics = topMetricsForSection(result, sectionKey, 2);
  if (!metrics.length) return pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:lackluster`);

  if (sectionKey === 'fats') {
    const omega3 = metrics.find(metric => metric.metricKey === 'omega3_mg');
    const saturatedFat = metrics.find(metric => metric.metricKey === 'saturated_fat_g');
    const cholesterol = metrics.find(metric => metric.metricKey === 'cholesterol_mg');
    if (omega3 && (omega3.value || 0) > 0) return 'omega 3 is doing serious work here';
    if (saturatedFat && (saturatedFat.value || 0) > 0) return 'saturated fat is a real drawback here';
    if (cholesterol && (cholesterol.value || 0) > 0) return 'cholesterol is part of the problem here';
  }

  if (sectionKey === 'carbs') {
    const fibre = metrics.find(metric => metric.metricKey === 'fibre_g');
    const glycemicIndex = metrics.find(metric => metric.metricKey === 'glycemic_index');
    const sugar = metrics.find(metric => metric.metricKey === 'sugar_g');
    if (fibre && (fibre.value || 0) > 0) return 'the fibre support is doing a lot here';
    if (glycemicIndex) return 'glycemic impact is doing a lot of the talking here';
    if (sugar && (sugar.value || 0) > 0) return 'the sugar load matters more than you would want';
  }

  if (sectionKey === 'proteins') {
    const bioavailability = metrics.find(metric => metric.metricKey === 'bioavailability_percent');
    const essentialAmino = metrics.find(metric => metric.metricKey === 'essential_amino_acids_score');
    if (bioavailability && (bioavailability.value || 0) > 0) return 'the protein quality is strong';
    if (essentialAmino && (essentialAmino.value || 0) > 0) return 'the amino acid case is pretty solid';
  }

  const names = metrics.map(m => formatMetricKey(m.metricKey));
  if (names.length === 1) return `${names[0]} is the big one`;
  return `${names[0]} and ${names[1]} stand out most`;
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

  if (foodType === 'oils-and-fats' && key === 'fats') {
    return joinShort([
      macro,
      'for fats, quality matters more than quantity',
      strongest,
      'that is what separates top-tier oils from weaker fats'
    ]);
  }

  if (foodType === 'meats' && key === 'fats') {
    return joinShort([
      macro,
      strongest,
      'for meats, fat quality is one of the main tie-breakers after protein'
    ]);
  }

  if (foodType === 'meats' && key === 'carbs') {
    return joinShort([
      macro,
      'carbs do not matter much here',
      'meats usually live or die on protein quality and what comes with the fat'
    ]);
  }

  if (foodType === 'meats' && key === 'proteins') {
    return joinShort([
      macro,
      strongest,
      'for meats, strong protein is expected, so the rest decides how high it climbs'
    ]);
  }

  if (foodType === 'grains' && key === 'carbs') {
    return joinShort([
      macro,
      strongest,
      'for grains, the big question is whether those carbs come with enough fibre and stability'
    ]);
  }

  if (foodType === 'grains' && key === 'proteins') {
    return joinShort([
      macro,
      strongest,
      'protein helps, but grains still need the carb side to behave'
    ]);
  }

  if (foodType === 'fruits' && key === 'carbs') {
    return joinShort([
      macro,
      strongest,
      'for fruit, the balance is sweetness versus fibre and overall payoff'
    ]);
  }

  if (foodType === 'vegetables' && key === 'carbs') {
    return joinShort([
      macro,
      strongest,
      'for vegetables, low downside is nice, but there still needs to be enough nutritional payoff'
    ]);
  }

  if (foodType === 'vegetables' && key === 'proteins') {
    return joinShort([
      macro,
      strongest,
      'protein is not the main selling point, but extra support here still helps'
    ]);
  }

  const context = sectionContextLine(foodType, `${result.food.id}:${key}`);
  return joinShort([macro, strongest, context]);
}

function buildMicrosSection(result, sectionKey) {
  const top = topMetricsForSection(result, sectionKey, 2);
  if (!top.length) return `${pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:micro-lackluster`)}.`;
  const lead = top.map(m => metricDisplayText(m)).join(', ');

  if (result.food.foodType === 'misc') {
    return sectionKey === 'vitamins'
      ? 'No real vitamin story here.'
      : 'No real mineral story here.';
  }

  const score = result.sectionScores?.[sectionKey] || 0;
  let context = '';

  if (sectionKey === 'vitamins') {
    if (score >= 50) context = 'that gives the food real vitamin support, not just a tiny bonus';
    else if (score >= 20) context = 'that helps, but the vitamin support is still not a main strength';
    else context = 'that is not enough to move the food very far on its own';
  }

  if (sectionKey === 'minerals') {
    if (score >= 50) context = 'that gives the food real mineral support';
    else if (score >= 20) context = 'that is useful, but still not a huge mineral advantage';
    else context = 'the mineral support is still pretty limited overall';
  }

  return joinShort([
    `${lead} stand out most`,
    context
  ]);
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
  const intro = side === 'pros' ? 'biggest pros' : 'biggest cons';
  const lines = [intro];

  for (const item of items) {
    lines.push(mergeContextItem(item));
  }

  return lines.join('. ') + '.';
}

function sectionNarration(result, sectionKey) {
  if (result.food.foodType === 'misc' && sectionKey === 'fats') {
    return 'Simple one.';
  }

  if (result.food.foodType === 'misc' && sectionKey === 'carbs') {
    const macro = macroLine(result, sectionKey);
    return joinShort([
      macro,
      'but the real story is the context, not the nutrition profile'
    ]);
  }

  if (result.food.foodType === 'misc' && sectionKey === 'proteins') {
    return 'No real nutrition story here.';
  }

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
      impactLevel: item.impactLevel
    }));
  }
  if (sectionKey === 'cons') {
    return (result.contextItems?.cons || []).map(item => ({
      type: 'con',
      title: item.title,
      explanation: item.explanation,
      impactLevel: item.impactLevel
    }));
  }
  return topMetricsForSection(result, sectionKey, 2);
}

function buildClosing(result) {
  const subject = result.food.name;
  const tier = result.tier;

  if (result.food.foodType === 'misc') {
    return {
      summary: `${subject} is ${tier} tier.`,
      finalReveal: `${subject} is ${tier} tier.`,
      useCaseNote: `Score: ${result.overallScore}.`,
      cta: 'Would you rank it the same, or nah?'
    };
  }

  return {
    summary: `${subject} is ${tier} tier.`,
    finalReveal: pick(corePhrases.finalReveal, '{subject} is {tier} tier.', `${result.food.id}:finalReveal`)
      .replaceAll('{subject}', subject)
      .replaceAll('{tier}', tier),
    useCaseNote: `Score: ${result.overallScore}.`,
    cta: 'Would you rank it the same, or nah?'
  };
}

function buildSections(result) {
  const order = ['fats', 'carbs', 'proteins', 'vitamins', 'minerals', 'pros', 'cons'];
  return order.map(key => {
    const narration = sectionNarration(result, key);
    return {
      key,
      title: titleForSection(key),
      narration,
      displayItems: displayItemsForSection(result, key),
      subtitleText: narration,
      timingHint: timingHintForSection(key),
      score: result.sectionScores?.[key] ?? null
    };
  });
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
