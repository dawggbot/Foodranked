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
const spritesRoot = path.join(repoRoot, 'sprites');

const HEADER_CATEGORY_KEYS = {
  vegetables: 'vegetable',
  fruits: 'fruit',
  grains: 'grain',
  legumes: 'legume',
  tubers: 'tuber',
  nuts: 'nut',
  seeds: 'seed',
  meats: 'meat',
  dairy: 'dairy',
  'oils-and-fats': 'oil_fat',
  misc: 'misc'
};

const VISUAL_PROFILES = {
  balanced: {
    name: 'balanced',
    description: 'Default launch profile: readable, centered, and close to the locked storyboard.',
    macroLayout: 'stacked',
    subtitleLift: 'standard',
    hookStyle: 'hero-center',
    motionPreset: 'balanced',
    statsDensity: 'standard',
    micronutrientRows: 2,
    macroSlotsVisible: 3,
    emphasisOrder: ['hook', 'header', 'macro', 'micros', 'pros-cons', 'tier']
  },
  tight: {
    name: 'tight',
    description: 'Cleaner, faster layout for dense scripts and heavier subtitle moments.',
    macroLayout: 'compact-stack',
    subtitleLift: 'high',
    hookStyle: 'fast-lockup',
    motionPreset: 'restrained',
    statsDensity: 'tight',
    micronutrientRows: 2,
    macroSlotsVisible: 2,
    emphasisOrder: ['hook', 'header', 'macro', 'tier']
  },
  showcase: {
    name: 'showcase',
    description: 'More spacious visual profile for premium sprite-first edits.',
    macroLayout: 'hero-sprite',
    subtitleLift: 'standard',
    hookStyle: 'hero-center',
    motionPreset: 'expressive',
    statsDensity: 'roomy',
    micronutrientRows: 2,
    macroSlotsVisible: 3,
    emphasisOrder: ['hook', 'sprite', 'macro', 'micros', 'tier']
  }
};

function ensureDir(dirPath) { fs.mkdirSync(dirPath, { recursive: true }); }
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n'); }
function writeText(p, text) { fs.writeFileSync(p, text.endsWith('\n') ? text : text + '\n'); }
function exists(p) { return fs.existsSync(p); }
function relativeRepoPath(p) { return path.relative(repoRoot, p).replace(/\\/g, '/'); }

function safeSlug(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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

function inferRulesetPath(food) { return path.join(rulesetsDir, `${food.foodType}.v1.json`); }

function runJsonScript(scriptPath, args) {
  const res = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  });
  if (res.status !== 0) throw new Error((res.stderr || res.stdout || `Failed running ${path.basename(scriptPath)}`).trim());
  return JSON.parse(res.stdout);
}

function spokenBlocks(script, options = {}) {
  if (Array.isArray(script.narrationBlocks) && script.narrationBlocks.length) {
    return script.narrationBlocks.filter(block => options.includeCta || block.kind !== 'cta');
  }

  return [
    { kind: 'hook', text: script.hook },
    ...script.sections.map(section => ({ kind: 'section', sectionKey: section.key, text: section.narration })),
    { kind: 'closing_summary', text: script.closing.summary },
    ...(options.includeCta ? [{ kind: 'cta', text: script.closing.cta }] : []),
    { kind: 'final_reveal', text: script.closing.finalReveal }
  ].filter(block => block.text);
}

function sentenceParts(script, options = {}) {
  return [
    script.hook,
    ...script.sections.map(section => section.narration),
    script.closing.summary,
    options.includeCta ? script.closing.cta : null,
    script.closing.finalReveal
  ].filter(Boolean);
}

function capitalizeSentenceStarts(text) {
  const input = String(text || '').trim();
  if (!input) return '';
  return input
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`)
    .replace(/^([a-z])/, (_, char) => char.toUpperCase());
}

function buildNarrationText(script, options = {}) {
  const compact = options.mode === 'compact';
  if (!compact) return sentenceParts(script, options).map(capitalizeSentenceStarts).join('\n\n');

  const parts = spokenBlocks(script, options)
    .map(block => block.text)
    .filter(Boolean)
    .map(capitalizeSentenceStarts);

  return parts.join('\n\n-\n\n');
}

function estimateDurationSeconds(text, wordsPerMinute = 165, floorSeconds = 1.4) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  if (!words) return floorSeconds;
  const raw = (words / wordsPerMinute) * 60;
  return Number(Math.max(raw, floorSeconds).toFixed(2));
}

function categoryAccent(template, foodType) { return template.paletteBindings?.[foodType] || 'Neutral Grey'; }
function categorySpriteKey(foodType) { return HEADER_CATEGORY_KEYS[foodType] || 'misc'; }
function visualProfileFor(name) { return VISUAL_PROFILES[name] || VISUAL_PROFILES.balanced; }

function metricLabel(metricKey) {
  return String(metricKey || '')
    .replace(/_dv$/i, '')
    .replace(/_g$/i, '')
    .replace(/_mg$/i, '')
    .replace(/_/g, ' ')
    .trim();
}

function metricDisplayValue(item) {
  if (item?.dvPercent != null) return `${item.dvPercent}% DV`;
  if (item?.value == null) return null;
  const key = String(item.metricKey || '');
  if (key.endsWith('_mg')) return `${item.value}mg`;
  if (key.endsWith('_g')) return `${item.value}g`;
  if (/glycemic/i.test(key)) return `${item.value} GI`;
  return String(item.value);
}

function sectionNarrativeRole(sectionKey) {
  const roles = {
    fats: 'macro-foundation',
    carbs: 'macro-foundation',
    proteins: 'macro-foundation',
    vitamins: 'micronutrient-proof',
    minerals: 'micronutrient-proof',
    pros: 'real-world-upside',
    cons: 'real-world-downside',
    final: 'verdict-payoff'
  };
  return roles[sectionKey] || 'supporting';
}

function sceneSubtitlePlacement(sceneId, profileName) {
  if (sceneId === 'pros' || sceneId === 'cons') return profileName === 'tight' ? 'raised-lower-third' : 'high-lower-third';
  if (sceneId === 'final') return 'subtitle-floor';
  return profileName === 'tight' ? 'raised-lower-third' : 'lower-third';
}

function resolveSpriteAsset(relativePath, preferredExts) {
  const base = path.join(spritesRoot, relativePath);
  for (const ext of preferredExts) {
    const candidate = `${base}.${ext}`;
    if (exists(candidate)) return { path: relativeRepoPath(candidate), format: ext };
  }
  return null;
}

function buildSpriteBindings(foodType) {
  const key = categorySpriteKey(foodType);
  const binding = {
    strategy: 'png-primary-with-aseprite-reference',
    categoryKey: key,
    notes: [
      'Use exported 100% PNG and GIF files for edit/runtime placement.',
      'Use .aseprite sources only as fidelity references when adjusting layout or re-exporting.'
    ],
    header: {
      foodPlate: resolveSpriteAsset(`header/food_plate/${key}_food_plate`, ['png', 'gif']),
      foodPlateSource: resolveSpriteAsset(`header/food_plate/${key}_food_plate`, ['aseprite']),
      foodTypePlate: resolveSpriteAsset(`header/food_type_plate/${key}_type_plate`, ['png']),
      foodTypePlateSource: resolveSpriteAsset(`header/food_type_plate/${key}_type_plate`, ['aseprite']),
      calorieBubble: resolveSpriteAsset(`header/calorie_bubble/${key}_calorie_bubble`, ['png']),
      calorieBubbleSource: resolveSpriteAsset(`header/calorie_bubble/${key}_calorie_bubble`, ['aseprite']),
      scorePlate: resolveSpriteAsset('header/header_ui/score_plate', ['png']),
      scorePlateSource: resolveSpriteAsset('header/header_ui/score_plate', ['aseprite'])
    },
    macros: {
      arrows: {
        positive: resolveSpriteAsset('macros_section/arrow_indicators/green_arrow', ['png']),
        positiveSource: resolveSpriteAsset('macros_section/arrow_indicators/green_arrow', ['aseprite']),
        negative: resolveSpriteAsset('macros_section/arrow_indicators/red_arrow', ['png']),
        negativeSource: resolveSpriteAsset('macros_section/arrow_indicators/red_arrow', ['aseprite'])
      },
      fats: {
        icon: resolveSpriteAsset('macros_section/section_1_fats/fat_icon', ['gif', 'png']),
        iconSource: resolveSpriteAsset('macros_section/section_1_fats/fat_icon', ['aseprite']),
        bullet: resolveSpriteAsset('macros_section/section_1_fats/fat_submacro_bullet_point', ['png']),
        bulletSource: resolveSpriteAsset('macros_section/section_1_fats/fat_submacro_bullet_point', ['aseprite'])
      },
      carbs: {
        icon: resolveSpriteAsset('macros_section/section_2_carbs/carb_icon', ['gif', 'png']),
        iconSource: resolveSpriteAsset('macros_section/section_2_carbs/carb_icon', ['aseprite']),
        bullet: resolveSpriteAsset('macros_section/section_2_carbs/carb_submacro_bullet_point', ['png']),
        bulletSource: resolveSpriteAsset('macros_section/section_2_carbs/carb_submacro_bullet_point', ['aseprite'])
      },
      proteins: {
        icon: resolveSpriteAsset('macros_section/section_3_protein/protein_icon', ['gif', 'png']),
        iconSource: resolveSpriteAsset('macros_section/section_3_protein/protein_icon', ['aseprite']),
        bullet: resolveSpriteAsset('macros_section/section_3_protein/protein_submacro_bullet_point', ['png']),
        bulletSource: resolveSpriteAsset('macros_section/section_3_protein/protein_submacro_bullet_point', ['aseprite'])
      }
    },
    micros: {
      vitamins: {
        icon: resolveSpriteAsset('micros_section/vitamins/vitamin_icon', ['gif', 'png']),
        iconSource: resolveSpriteAsset('micros_section/vitamins/vitamin_icon', ['aseprite']),
        microIcon: resolveSpriteAsset('micros_section/vitamins/vitamin_micro_icon', ['png']),
        microIconSource: resolveSpriteAsset('micros_section/vitamins/vitamin_micro_icon', ['aseprite'])
      },
      minerals: {
        icon: resolveSpriteAsset('micros_section/minerals/mineral_icon', ['gif', 'png']),
        iconSource: resolveSpriteAsset('micros_section/minerals/mineral_icon', ['aseprite']),
        microIcon: resolveSpriteAsset('micros_section/minerals/mineral_micro_icon', ['png']),
        microIconSource: resolveSpriteAsset('micros_section/minerals/mineral_micro_icon', ['aseprite'])
      },
      bars: {
        line: resolveSpriteAsset('micros_section/bars/bar_line', ['png']),
        lineSource: resolveSpriteAsset('micros_section/bars/bar_line', ['aseprite']),
        full: resolveSpriteAsset('micros_section/bars/100%_bar', ['png']),
        fullSource: resolveSpriteAsset('micros_section/bars/100%_bar', ['aseprite'])
      }
    },
    prosCons: {
      pros: {
        bullet: resolveSpriteAsset('pros_and_cons/pros/pro_bullet_point', ['png']),
        bulletSource: resolveSpriteAsset('pros_and_cons/pros/pro_bullet_point', ['aseprite'])
      },
      cons: {
        bullet: resolveSpriteAsset('pros_and_cons/cons/con_bullet_point', ['png']),
        bulletSource: resolveSpriteAsset('pros_and_cons/cons/con_bullet_point', ['aseprite'])
      }
    },
    progress: {
      inactive: resolveSpriteAsset(`ui/section_indicator/${key}_section_indicator`, ['png']),
      inactiveSource: resolveSpriteAsset(`ui/section_indicator/${key}_section_indicator`, ['aseprite']),
      active: resolveSpriteAsset(`ui/section_indicator/${key}_highlighted_section_indicator`, ['png']),
      activeSource: resolveSpriteAsset(`ui/section_indicator/${key}_highlighted_section_indicator`, ['aseprite'])
    },
    separators: {
      section: resolveSpriteAsset(`ui/section_separator/${key}_section_separator`, ['png']),
      sectionSource: resolveSpriteAsset(`ui/section_separator/${key}_section_separator`, ['aseprite'])
    },
    references: {
      macroLayout: resolveSpriteAsset('references/macros_section', ['png']),
      macroLayoutSource: resolveSpriteAsset('references/macros_section', ['aseprite']),
      microLayout: resolveSpriteAsset('references/micros_section', ['png']),
      microLayoutSource: resolveSpriteAsset('references/micros_section', ['aseprite']),
      prosConsLayout: resolveSpriteAsset('references/pros_cons_section', ['png']),
      prosConsLayoutSource: resolveSpriteAsset('references/pros_cons_section', ['aseprite'])
    }
  };
  return binding;
}

function buildMacroSlots(displayItems, maxVisible, sectionKey) {
  const items = Array.isArray(displayItems) ? displayItems.slice(0, maxVisible) : [];
  return items.map((item, index) => ({
    slotId: `submetric_${index + 1}`,
    metricKey: item.metricKey,
    label: metricLabel(item.metricKey),
    displayValue: metricDisplayValue(item),
    scoringMode: item.scoringMode || null,
    band: item.band || null,
    weightedScore: item.weightedScore ?? null,
    spriteRole: sectionKey,
    text: item.text
  }));
}

function buildMicronutrientRows(displayItems, maxVisible) {
  const items = Array.isArray(displayItems) ? displayItems.slice(0, maxVisible) : [];
  return items.map((item, index) => ({
    slotId: `micronutrient_${index + 1}`,
    metricKey: item.metricKey,
    label: metricLabel(item.metricKey),
    displayValue: metricDisplayValue(item),
    dvPercent: item.dvPercent ?? null,
    spriteRole: 'micronutrient-row',
    text: item.text
  }));
}

function buildContextBullets(items, prefix) {
  return (Array.isArray(items) ? items : []).slice(0, 3).map((item, index) => ({
    slotId: `${prefix}_${index + 1}`,
    text: item.title,
    explanation: item.explanation,
    impactLevel: item.impactLevel || 'minor'
  }));
}

function sectionVisualBinding(section, template, spriteBindings, options) {
  const sectionTemplate = template.sectionTemplates?.[section.key] || {};
  const profile = visualProfileFor(options.visualProfile);
  const macroSlots = ['fats', 'carbs', 'proteins'].includes(section.key)
    ? buildMacroSlots(section.displayItems, profile.macroSlotsVisible, section.key)
    : [];
  const micronutrientRows = ['vitamins', 'minerals'].includes(section.key)
    ? buildMicronutrientRows(section.displayItems, profile.micronutrientRows)
    : [];

  return {
    sectionKey: section.key,
    title: section.title,
    score: section.score,
    templateSlots: sectionTemplate.revealSlots || [],
    displayItems: section.displayItems,
    timingHint: section.timingHint,
    narrativeRole: sectionNarrativeRole(section.key),
    macroLayout: profile.macroLayout,
    subtitlePlacement: sceneSubtitlePlacement(section.key, profile.name),
    preferredSpriteBindings: (() => {
      if (section.key === 'fats' || section.key === 'carbs' || section.key === 'proteins') return spriteBindings.macros[section.key];
      if (section.key === 'vitamins') return spriteBindings.micros.vitamins;
      if (section.key === 'minerals') return spriteBindings.micros.minerals;
      if (section.key === 'pros') return spriteBindings.prosCons.pros;
      if (section.key === 'cons') return spriteBindings.prosCons.cons;
      return null;
    })(),
    slotPlan: {
      macroHeadline: ['fats', 'carbs', 'proteins'].includes(section.key)
        ? {
            slotId: 'macro_headline',
            label: section.title,
            value: section.macroDisplayValue || null,
            emphasis: section.key === 'fats' && options.foodType === 'oils-and-fats' ? 'highest' : 'standard'
          }
        : null,
      macroSlots,
      micronutrientRows,
      commentaryNote: section.displayItems?.length > Math.max(profile.macroSlotsVisible, profile.micronutrientRows)
        ? 'Overflow metrics stay off-screen unless the edit intentionally promotes them.'
        : null
    }
  };
}

function compactSectionNarration(section) {
  return section.narration;
}

function buildScenePlan(script, score, template, options = {}) {
  const compact = options.mode === 'compact';
  const profile = visualProfileFor(options.visualProfile);
  const spriteBindings = buildSpriteBindings(script.food.foodType);
  const scenes = [];
  let cursor = 0;

  const hookText = compact ? script.hook : [script.hook, script.intro].filter(Boolean).join(' ');
  const hookDuration = estimateDurationSeconds(hookText, compact ? 188 : 180, compact ? 2.1 : 2.4);
  scenes.push({
    id: 'hook',
    kind: 'hook',
    narrativeRole: 'opening-promise',
    startSeconds: cursor,
    durationSeconds: hookDuration,
    endSeconds: Number((cursor + hookDuration).toFixed(2)),
    narrationText: hookText,
    subtitleText: hookText,
    subtitlePlacement: sceneSubtitlePlacement('hook', profile.name),
    visualBinding: {
      title: script.food.name,
      rankedWord: 'RANKED',
      foodType: script.food.foodType,
      kcal: score.header?.kcal ?? null,
      categoryAccent: categoryAccent(template, script.food.foodType),
      hookStyle: profile.hookStyle,
      headerSprites: spriteBindings.header,
      progressSprites: spriteBindings.progress
    },
    revealPlan: ['hero_food', 'hook_title', 'hook_ranked_word'],
    beatPlan: [
      { slotId: 'hero_food', beat: 'start', purpose: 'food-recognition' },
      { slotId: 'hook_title', beat: 'mid', purpose: 'ranking-promise' },
      { slotId: 'hook_ranked_word', beat: 'end', purpose: 'impact-lockup' }
    ]
  });
  cursor += hookDuration;

  for (const section of script.sections) {
    const narrationText = compact ? compactSectionNarration(section, options) : section.narration;
    const duration = estimateDurationSeconds(narrationText, compact ? 170 : 168, compact ? 2.1 : 2.1);
    const visualBinding = sectionVisualBinding(section, template, spriteBindings, { ...options, foodType: script.food.foodType });
    scenes.push({
      id: section.key,
      kind: 'section',
      narrativeRole: visualBinding.narrativeRole,
      startSeconds: Number(cursor.toFixed(2)),
      durationSeconds: duration,
      endSeconds: Number((cursor + duration).toFixed(2)),
      narrationText,
      subtitleText: narrationText,
      subtitlePlacement: visualBinding.subtitlePlacement,
      visualBinding,
      revealPlan: template.sectionTemplates?.[section.key]?.revealSlots || [],
      beatPlan: (template.sectionTemplates?.[section.key]?.revealSlots || []).map((slotId, index) => ({
        slotId,
        beat: index === 0 ? 'lead' : 'follow',
        purpose: sectionNarrativeRole(section.key)
      }))
    });
    cursor += duration;
  }

  const closingText = [script.closing.summary, options.includeCta ? script.closing.cta : null, script.closing.finalReveal]
    .filter(Boolean)
    .join(' ');
  const closingDuration = estimateDurationSeconds(closingText, compact ? 182 : 170, compact ? 2.2 : 2.6);
  scenes.push({
    id: 'final',
    kind: 'closing',
    narrativeRole: 'verdict-payoff',
    startSeconds: Number(cursor.toFixed(2)),
    durationSeconds: closingDuration,
    endSeconds: Number((cursor + closingDuration).toFixed(2)),
    narrationText: closingText,
    subtitleText: [script.closing.finalReveal, script.closing.useCaseNote].filter(Boolean).join(' '),
    subtitlePlacement: sceneSubtitlePlacement('final', profile.name),
    visualBinding: {
      tier: script.tier,
      tierColor: template.tierColors?.[script.tier] || null,
      scorePlate: spriteBindings.header.scorePlate,
      scorePlateSource: spriteBindings.header.scorePlateSource,
      categorySeparator: spriteBindings.separators.section,
      categorySeparatorSource: spriteBindings.separators.sectionSource
    },
    revealPlan: template.closingScene?.revealSlots || [],
    beatPlan: [
      { slotId: 'summary_text', beat: 'lead', purpose: 'verdict-setup' },
      { slotId: 'tier_stamp', beat: 'impact', purpose: 'verdict-hit' },
      { slotId: 'final_line', beat: 'resolve', purpose: 'use-case-tag' }
    ]
  });
  cursor += closingDuration;

  return {
    mode: compact ? 'compact' : 'standard',
    visualProfile: profile.name,
    totalEstimatedDurationSeconds: Number(cursor.toFixed(2)),
    scenes
  };
}

function buildSubtitleCues(scenePlan) {
  return scenePlan.scenes.map((scene, index) => ({
    id: `${String(index + 1).padStart(2, '0')}-${scene.id}`,
    startSeconds: scene.startSeconds,
    endSeconds: scene.endSeconds,
    placement: scene.subtitlePlacement || 'lower-third',
    text: scene.subtitleText || scene.narrationText
  }));
}

function buildManifest({ food, rulesetPath, foodPath, score, script, template, scenePlan, outputDir, options }) {
  const compact = options.mode === 'compact';
  const profile = visualProfileFor(options.visualProfile);
  const spriteBindings = buildSpriteBindings(food.foodType);

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
      identity: food.identity || null,
      scoreReadiness: food.scoreReadiness || null,
      sourceNotes: food.sourceNotes || [],
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
      overallScoreExact: score.overallScoreExact ?? score.overallScore,
      tier: score.tier,
      sectionScores: score.sectionScores,
      strongestSection: score.explanation?.strongestSection || null,
      weakestSection: score.explanation?.weakestSection || null,
      topPros: score.explanation?.topPros || [],
      topCons: score.explanation?.topCons || [],
      explanation: score.explanation
    },
    scriptSnapshot: {
      schemaVersion: script.schemaVersion || 'foodranked-script.v1',
      narrationFormat: script.narrationFormat || (compact ? 'elevenlabs-blocks-v1' : 'standard-paragraphs-v1'),
      hook: script.hook,
      closing: script.closing,
      sectionOrder: script.sectionOrder || script.sections.map(section => section.key),
      narrationBlockCount: Array.isArray(script.narrationBlocks) ? script.narrationBlocks.length : sentenceParts(script, options).length
    },
    visualBinding: {
      templateId: template.id,
      aspectRatio: template.format?.aspectRatio,
      categoryAccent: categoryAccent(template, food.foodType),
      tierColor: template.tierColors?.[score.tier] || null,
      visualProfile: profile,
      spriteBindings,
      storyboardContract: {
        lockedSceneStack: scenePlan.scenes.map(scene => ({
          id: scene.id,
          kind: scene.kind,
          narrativeRole: scene.narrativeRole,
          subtitlePlacement: scene.subtitlePlacement
        })),
        subtitleSafeBox: template.subtitleSystem?.safeBox || null,
        progressIndicator: template.progressIndicator || null
      }
    },
    reviewChecklist: [
      'Verify nutrient values are sourced well enough for publishable use.',
      'Review narration for category repetition and trim any awkward lines.',
      'Confirm subtitle density stays readable at phone speed.',
      'Use the PNG and GIF sprite exports directly, and only open .aseprite sources when fidelity adjustments are needed.',
      'Check that the final tier verdict feels editorially defensible.'
    ],
    nextHumanStep: 'Review the generated narration + manifest, then use the manifest as the handoff into visual assembly / editing.',
    scenePlan
  };
}

function parseArgs(argv) {
  let mode = 'standard';
  let includeCta = true;
  let lengthProfile = 'fuller';
  let visualProfile = 'balanced';
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--compact') mode = 'compact';
    else if (arg === '--standard') mode = 'standard';
    else if (arg === '--no-cta') includeCta = false;
    else if (arg === '--tight') {
      lengthProfile = 'tight';
      visualProfile = 'tight';
    } else if (arg === '--fuller') lengthProfile = 'fuller';
    else if (arg === '--showcase') visualProfile = 'showcase';
    else if (arg === '--balanced') visualProfile = 'balanced';
    else if (arg.startsWith('--visual-profile=')) visualProfile = arg.split('=')[1] || visualProfile;
    else if (arg === '--visual-profile') {
      visualProfile = argv[i + 1] || visualProfile;
      i += 1;
    } else positional.push(arg);
  }

  if (!VISUAL_PROFILES[visualProfile]) {
    throw new Error(`Unknown visual profile: ${visualProfile}. Expected one of ${Object.keys(VISUAL_PROFILES).join(', ')}`);
  }

  return { mode, includeCta, lengthProfile, visualProfile, positional };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const { positional, ...options } = parsed;
  const [foodInput, rulesetArg] = positional;
  if (!foodInput) {
    console.error('Usage: node scripts/foodranked-generate-episode.js <food-id|food.json> [ruleset.json] [--compact|--standard] [--no-cta] [--tight|--fuller] [--visual-profile balanced|tight|showcase]');
    process.exit(1);
  }

  const foodPath = resolveFoodPath(foodInput);
  const food = readJson(foodPath);
  const rulesetPath = rulesetArg ? path.resolve(rulesetArg) : inferRulesetPath(food);
  if (!fs.existsSync(rulesetPath)) throw new Error(`Ruleset not found: ${rulesetPath}`);

  const template = readJson(visualTemplatePath);
  const score = runJsonScript(scorerPath, [foodPath, rulesetPath]);
  const script = runJsonScript(scriptGeneratorPath, [foodPath, rulesetPath]);
  const scenePlan = buildScenePlan(script, score, template, options);
  const subtitles = buildSubtitleCues(scenePlan);
  const narrationText = buildNarrationText(script, options);

  const outputDir = path.join(outputsDir, safeSlug(`${food.id}${options.mode === 'compact' ? '-compact' : ''}`));
  ensureDir(outputDir);

  const manifest = buildManifest({ food, rulesetPath, foodPath, score, script, template, scenePlan, outputDir, options });

  writeJson(path.join(outputDir, 'score.json'), score);
  writeJson(path.join(outputDir, 'script.json'), script);
  writeJson(path.join(outputDir, 'subtitles.json'), subtitles);
  writeJson(path.join(outputDir, 'episode-manifest.json'), manifest);
  writeText(path.join(outputDir, 'narration.txt'), narrationText);

  console.log(JSON.stringify({
    status: 'ok',
    food: food.id,
    mode: options.mode,
    visualProfile: options.visualProfile,
    outputDir: path.relative(repoRoot, outputDir),
    files: ['score.json', 'script.json', 'subtitles.json', 'episode-manifest.json', 'narration.txt'],
    estimatedDurationSeconds: scenePlan.totalEstimatedDurationSeconds,
    tier: score.tier,
    overallScore: score.overallScore
  }, null, 2));
}

main();
