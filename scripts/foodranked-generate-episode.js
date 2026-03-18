#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const outputsDir = path.join(repoRoot, 'outputs', 'episodes');
const scorerPath = path.join(__dirname, 'foodranked-scorer.js');
const scriptGeneratorPath = path.join(__dirname, 'foodranked-generate-script.js');
const visualTemplatePath = path.join(repoRoot, 'templates', 'visual-template.v1.json');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

function writeText(p, text) {
  fs.writeFileSync(p, text.endsWith('\n') ? text : text + '\n');
}

function safeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveFoodPath(input) {
  const asGiven = path.resolve(input);
  if (fs.existsSync(asGiven)) return asGiven;

  const withSampleSuffix = path.join(foodsDir, `${input}.sample.json`);
  if (fs.existsSync(withSampleSuffix)) return withSampleSuffix;

  const withJsonSuffix = path.join(foodsDir, `${input}.json`);
  if (fs.existsSync(withJsonSuffix)) return withJsonSuffix;

  throw new Error(`Could not resolve food input: ${input}`);
}

function inferRulesetPath(food) {
  return path.join(rulesetsDir, `${food.foodType}.v1.json`);
}

function runJsonScript(scriptPath, args) {
  const res = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  });

  if (res.status !== 0) {
    throw new Error((res.stderr || res.stdout || `Failed running ${path.basename(scriptPath)}`).trim());
  }

  return JSON.parse(res.stdout);
}

function sentenceParts(script) {
  return [
    script.hook,
    script.intro,
    ...script.sections.map(section => section.narration),
    script.closing.summary,
    script.closing.finalReveal,
    script.closing.useCaseNote,
    script.closing.cta
  ].filter(Boolean);
}

function buildNarrationText(script, score, options = {}) {
  const compact = options.mode === 'compact';
  if (!compact) return sentenceParts(script).join('\n\n');

  const closing = compactClosing(script, score);
  const parts = [
    script.hook,
    ...script.sections.map(section => compactSectionNarration(section, options)),
    closing.finalReveal,
    closing.useCaseNote,
    options.includeCta ? closing.cta : null
  ].filter(Boolean);

  return parts.join('\n\n');
}

function estimateDurationSeconds(text, wordsPerMinute = 165, floorSeconds = 1.4) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  if (!words) return floorSeconds;
  const raw = (words / wordsPerMinute) * 60;
  return Number(Math.max(raw, floorSeconds).toFixed(2));
}

function categoryAccent(template, foodType) {
  return template.paletteBindings?.[foodType] || 'Neutral Grey';
}

function sectionVisualBinding(section, template) {
  const sectionTemplate = template.sectionTemplates?.[section.key] || {};
  return {
    sectionKey: section.key,
    title: section.title,
    score: section.score,
    templateSlots: sectionTemplate.revealSlots || [],
    displayItems: section.displayItems,
    timingHint: section.timingHint
  };
}

function compactSectionNarration(section, options = {}) {
  const fuller = options.lengthProfile === 'fuller';

  if (['pros', 'cons'].includes(section.key)) {
    if (fuller) return section.narration;
    const items = Array.isArray(section.displayItems) ? section.displayItems.slice(0, 3) : [];
    if (!items.length) return section.narration;
    const prefix = section.key === 'pros' ? 'biggest pros' : 'biggest cons';
    return `${prefix}: ${items.map(item => item.title).join('. ')}.`;
  }

  if (fuller) return section.narration;

  const sentenceParts = String(section.narration || '')
    .split(/\.\s+/)
    .map(part => part.trim().replace(/\.$/, ''))
    .filter(Boolean);

  if (section.key === 'vitamins' || section.key === 'minerals') {
    return sentenceParts.slice(0, 1).join('. ') + (sentenceParts.length ? '.' : '');
  }

  return sentenceParts.slice(0, 2).join('. ') + (sentenceParts.length ? '.' : '');
}

function compactClosing(script, score) {
  return {
    summary: null,
    finalReveal: script.closing.finalReveal,
    useCaseNote: `Score: ${score.overallScore}.`,
    cta: null
  };
}

function buildScenePlan(script, score, template, options = {}) {
  const compact = options.mode === 'compact';
  const scenes = [];
  let cursor = 0;

  const introText = compact ? script.intro : null;
  const hookText = compact
    ? script.hook
    : [script.hook, script.intro].filter(Boolean).join(' ');
  const hookDuration = estimateDurationSeconds(hookText, compact ? (options.lengthProfile === 'fuller' ? 182 : 195) : 180, compact ? (options.lengthProfile === 'fuller' ? 2.4 : 2.1) : 2.4);
  scenes.push({
    id: 'hook',
    kind: 'hook',
    startSeconds: cursor,
    durationSeconds: hookDuration,
    endSeconds: Number((cursor + hookDuration).toFixed(2)),
    narrationText: hookText,
    subtitleText: hookText,
    visualBinding: {
      title: script.food.name,
      rankedWord: 'RANKED',
      foodType: script.food.foodType,
      kcal: score.header?.kcal ?? null,
      categoryAccent: categoryAccent(template, script.food.foodType)
    },
    revealPlan: ['hero_food', 'hook_title', 'hook_ranked_word']
  });
  cursor += hookDuration;

  for (const section of script.sections) {
    const narrationText = compact ? compactSectionNarration(section, options) : section.narration;
    const subtitleText = narrationText;
    const visualBinding = sectionVisualBinding(section, template);
    if (compact && ['pros', 'cons'].includes(section.key)) {
      visualBinding.displayItems = (visualBinding.displayItems || []).slice(0, 3);
      visualBinding.templateSlots = (visualBinding.templateSlots || []).slice(0, 3);
    }
    const duration = estimateDurationSeconds(
      narrationText,
      compact ? (options.lengthProfile === 'fuller' ? 160 : 182) : 168,
      compact ? (options.lengthProfile === 'fuller' ? 2.1 : 1.7) : 2.1
    );
    scenes.push({
      id: section.key,
      kind: 'section',
      startSeconds: Number(cursor.toFixed(2)),
      durationSeconds: duration,
      endSeconds: Number((cursor + duration).toFixed(2)),
      narrationText,
      subtitleText,
      visualBinding,
      revealPlan: compact && ['pros', 'cons'].includes(section.key)
        ? (template.sectionTemplates?.[section.key]?.revealSlots || []).slice(0, 3)
        : (template.sectionTemplates?.[section.key]?.revealSlots || [])
    });
    cursor += duration;
  }

  const closing = compact ? compactClosing(script, score) : script.closing;
  const closingText = [closing.summary, closing.finalReveal, closing.useCaseNote, options.includeCta ? closing.cta : null]
    .filter(Boolean)
    .join(' ');
  const closingDuration = estimateDurationSeconds(closingText, compact ? (options.lengthProfile === 'fuller' ? 178 : 190) : 170, compact ? (options.lengthProfile === 'fuller' ? 2.2 : 2.0) : 2.6);
  scenes.push({
    id: 'final',
    kind: 'closing',
    startSeconds: Number(cursor.toFixed(2)),
    durationSeconds: closingDuration,
    endSeconds: Number((cursor + closingDuration).toFixed(2)),
    narrationText: closingText,
    subtitleText: [closing.finalReveal, closing.useCaseNote].filter(Boolean).join(' '),
    visualBinding: {
      tier: script.tier,
      tierColor: template.tierColors?.[script.tier] || null
    },
    revealPlan: template.closingScene?.revealSlots || []
  });
  cursor += closingDuration;

  return {
    mode: compact ? 'compact' : 'standard',
    totalEstimatedDurationSeconds: Number(cursor.toFixed(2)),
    scenes
  };
}

function buildSubtitleCues(scenePlan) {
  return scenePlan.scenes.map((scene, index) => ({
    id: `${String(index + 1).padStart(2, '0')}-${scene.id}`,
    startSeconds: scene.startSeconds,
    endSeconds: scene.endSeconds,
    text: scene.subtitleText || scene.narrationText
  }));
}

function buildManifest({ food, rulesetPath, foodPath, score, script, template, scenePlan, outputDir, options }) {
  const compact = options.mode === 'compact';
  const closing = compact ? compactClosing(script, score) : script.closing;

  return {
    id: `${food.id}-episode-v1`,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    mode: compact ? 'compact' : 'standard',
    food: {
      id: food.id,
      name: food.name,
      foodType: food.foodType,
      basis: food.basis || null,
      sourceFile: path.relative(repoRoot, foodPath)
    },
    sourceOfTruth: {
      scoreScript: path.relative(repoRoot, scorerPath),
      scriptGenerator: path.relative(repoRoot, scriptGeneratorPath),
      rulesetFile: path.relative(repoRoot, rulesetPath),
      visualTemplateFile: path.relative(repoRoot, visualTemplatePath)
    },
    outputs: {
      directory: path.relative(repoRoot, outputDir),
      scoreJson: 'score.json',
      scriptJson: 'script.json',
      manifestJson: 'episode-manifest.json',
      narrationTxt: 'narration.txt',
      subtitlesJson: 'subtitles.json'
    },
    scoreSnapshot: {
      overallScore: score.overallScore,
      tier: score.tier,
      baseScore: score.baseScore,
      contextAdjustment: score.contextAdjustment?.appliedAdjustment ?? 0,
      sectionScores: score.sectionScores,
      explanation: score.explanation
    },
    scriptSnapshot: {
      hook: script.hook,
      intro: compact ? null : script.intro,
      closing,
      sectionOrder: script.sections.map(section => section.key)
    },
    visualBinding: {
      templateId: template.id,
      aspectRatio: template.format?.aspectRatio,
      categoryAccent: categoryAccent(template, food.foodType),
      tierColor: template.tierColors?.[score.tier] || null
    },
    reviewChecklist: [
      'Verify nutrient values are sourced well enough for publishable use.',
      'Review narration for natural flow and trim any robotic lines.',
      'Confirm subtitle density stays readable at phone speed.',
      'Replace placeholder hero/sprite art with final asset selection.',
      'Check that the final tier verdict feels editorially defensible.'
    ],
    nextHumanStep: 'Review the generated narration + manifest, then use the manifest as the handoff into visual assembly / editing.',
    scenePlan
  };
}

function main() {
  const args = process.argv.slice(2);
  let mode = 'standard';
  let includeCta = true;
  let lengthProfile = 'fuller';
  const positional = [];

  for (const arg of args) {
    if (arg === '--compact') mode = 'compact';
    else if (arg === '--standard') mode = 'standard';
    else if (arg === '--no-cta') includeCta = false;
    else if (arg === '--tight') lengthProfile = 'tight';
    else if (arg === '--fuller') lengthProfile = 'fuller';
    else positional.push(arg);
  }

  const [foodInput, rulesetArg] = positional;
  if (!foodInput) {
    console.error('Usage: node scripts/foodranked-generate-episode.js <food-id|food.json> [ruleset.json] [--compact|--standard] [--no-cta] [--tight|--fuller]');
    process.exit(1);
  }

  const options = { mode, includeCta, lengthProfile };

  const foodPath = resolveFoodPath(foodInput);
  const food = readJson(foodPath);
  const rulesetPath = rulesetArg ? path.resolve(rulesetArg) : inferRulesetPath(food);

  if (!fs.existsSync(rulesetPath)) {
    throw new Error(`Ruleset not found: ${rulesetPath}`);
  }

  const template = readJson(visualTemplatePath);
  const score = runJsonScript(scorerPath, [foodPath, rulesetPath]);
  const script = runJsonScript(scriptGeneratorPath, [foodPath, rulesetPath]);
  const scenePlan = buildScenePlan(script, score, template, options);
  const subtitles = buildSubtitleCues(scenePlan);
  const narrationText = buildNarrationText(script, score, options);

  const outputDir = path.join(outputsDir, safeSlug(`${food.id}${mode === 'compact' ? '-compact' : ''}`));
  ensureDir(outputDir);

  const manifest = buildManifest({
    food,
    rulesetPath,
    foodPath,
    score,
    script,
    template,
    scenePlan,
    outputDir,
    options
  });

  writeJson(path.join(outputDir, 'score.json'), score);
  writeJson(path.join(outputDir, 'script.json'), script);
  writeJson(path.join(outputDir, 'subtitles.json'), subtitles);
  writeJson(path.join(outputDir, 'episode-manifest.json'), manifest);
  writeText(path.join(outputDir, 'narration.txt'), narrationText);

  console.log(JSON.stringify({
    status: 'ok',
    food: food.id,
    mode,
    outputDir: path.relative(repoRoot, outputDir),
    files: ['score.json', 'script.json', 'subtitles.json', 'episode-manifest.json', 'narration.txt'],
    estimatedDurationSeconds: scenePlan.totalEstimatedDurationSeconds,
    tier: score.tier,
    overallScore: score.overallScore
  }, null, 2));
}

main();

