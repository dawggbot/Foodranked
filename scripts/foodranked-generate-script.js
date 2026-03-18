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
  return `${label} is ${value} grams per 100 grams`;
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

  for (const metric of metrics) {
    const ex = exaggerationRules[metric.metricKey];
    if (ex) return pick(ex, '', `${result.food.id}:${sectionKey}:${metric.metricKey}`);
  }

  const names = metrics.map(m => formatMetricKey(m.metricKey));
  if (names.length === 1) return `${names[0]} is the big one`;
  return `${names[0]} and ${names[1]} stand out most`;
}

function buildHook(result) {
  return pick(corePhrases.openers, '{subject} ranked.', `${result.food.id}:hook`).replaceAll('{subject}', result.food.name);
}

function buildIntro(result) {
  const extra = result.food.id === 'butter'
    ? ' I know butter is technically a dairy, but I am classing it as oils and fats.'
    : '';
  return `Today we are ranking ${result.food.name} as a ${singularFoodType(result.food.foodType)}, per 100 grams, so you can see where it really lands.${extra}`;
}

function buildMacroSection(result, key) {
  const macro = macroLine(result, key);
  const strongest = strongestMetricLine(result, key);
  const context = sectionContextLine(result.food.foodType, `${result.food.id}:${key}`);
  return joinShort([macro, strongest, context]);
}

function buildMicrosSection(result, sectionKey) {
  const top = topMetricsForSection(result, sectionKey, 2);
  if (!top.length) return `${pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:micro-lackluster`)}.`;
  const lead = top.map(m => metricDisplayText(m)).join(', ');
  const tail = (result.sectionScores?.[sectionKey] || 0) <= 15 ? pick(corePhrases.lackluster, 'everything else is lackluster', `${result.food.id}:${sectionKey}:tail`) : '';
  return joinShort([
    `${lead} stand out most`,
    tail
  ]);
}

function buildProsConsSection(result, side) {
  const items = side === 'pros' ? (result.contextItems?.pros || []) : (result.contextItems?.cons || []);
  const intro = side === 'pros' ? 'biggest pros here' : 'biggest cons here';
  const lines = [intro];
  for (const item of items) lines.push(item.title);
  return lines.join('. ') + '.';
}

function sectionNarration(result, sectionKey) {
  if (result.food.foodType === 'misc' && ['fats', 'carbs', 'proteins'].includes(sectionKey)) {
    const macro = macroLine(result, sectionKey);
    return joinShort([
      macro,
      pick(corePhrases.contextEyecatcher, 'this section is mostly just an eyecatcher here', `${result.food.id}:${sectionKey}:eyecatcher`),
      'the real score comes later from context'
    ]);
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
  return {
    summary: `So overall, ${result.explanation?.summary || result.summary}`,
    finalReveal: pick(corePhrases.finalReveal, '{subject} is {tier} tier.', `${result.food.id}:finalReveal`)
      .replaceAll('{subject}', result.food.name)
      .replaceAll('{tier}', result.tier),
    useCaseNote: result.explanation?.whyThisTier || '',
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
