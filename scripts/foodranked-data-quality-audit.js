#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { prosConsTitleTextIssues } = require('./lib/pros-cons-title-fit');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const episodesDir = path.join(repoRoot, 'outputs', 'episodes');
const dataDir = path.join(repoRoot, 'docs', 'data');
const finalisationConfig = path.join(repoRoot, 'config', 'finalisation-sample-foods.v1.json');
const aminoAcidThresholdsPath = path.join(repoRoot, 'config', 'amino-acid-thresholds.v1.json');
const aminoAcidThresholds = fs.existsSync(aminoAcidThresholdsPath) ? readJson(aminoAcidThresholdsPath) : null;

const args = new Set(process.argv.slice(2));
const scopeArg = process.argv.find(arg => arg.startsWith('--scope='));
const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

const HEADER_KEYS = ['kcal', 'fat_g', 'carb_g', 'protein_g'];
const CONTEXT_SIDES = ['pros', 'cons'];
const AMINO_ACID_SCORE_KEYS = ['essential_amino_acids_score', 'nonessential_amino_acids_score'];
const CANONICAL_B_VITAMIN_SCORE_KEY = 'vitamin_b12_dv';
const PROTEIN_DISPLAY_POLICY_ID = 'protein-section-display.v1';
const PROTEIN_VISIBLE_ROWS = [
  'collagen_g',
  'essential_amino_acids_score',
  'nonessential_amino_acids_score',
  'bioavailability_percent'
];
const MACRO_DISPLAY_SECTION_KEYS = ['fats', 'carbs', 'proteins'];
const PROTEIN_HIDDEN_FALLBACK_METRIC_KEY = 'protein_g_fallback';
const EXPECTED_AMINO_ACID_GROUP_COUNTS = {
  essentialGroups: 9,
  nonessentialGroups: 11
};
const EXPECTED_TIER_SCORE_MAP = {
  D: 20,
  C: 40,
  B: 60,
  A: 80,
  S: 100
};
const LABEL_SCORES = {
  '3_red': 0,
  '2_red': 20,
  '1_red': 40,
  '1_green': 60,
  '2_green': 80,
  '3_green': 100
};
const EXPECTED_METRIC_POLARITIES = {
  saturated_fat_g: 'higher_worse',
  polyunsaturated_fat_g: 'higher_better',
  omega3_mg: 'higher_better',
  cholesterol_mg: 'higher_worse',
  fibre_g: 'higher_better',
  sugar_g: 'higher_worse',
  starch_g: 'higher_better',
  glycemic_index: 'higher_worse',
  collagen_g: 'higher_better',
  essential_amino_acids_score: 'higher_better',
  nonessential_amino_acids_score: 'higher_better',
  bioavailability_percent: 'higher_better'
};
const PLACEHOLDER_NOTE_RE = /placeholder|calibration benchmark|not a clinical nutrient database|tuning only/i;
const BAD_TEXT_PATTERNS = [
  { pattern: /\bnot a complete food on its own\b/i, message: 'generic complete-food con' },
  { pattern: /\bnot complete\b/i, message: 'generic complete-food con' },
  { pattern: /\bcomplete by themselves\b/i, message: 'generic complete-food con' },
  { pattern: /\bmake a full meal\b/i, message: 'generic full-meal con' },
  { pattern: /\bnot enough on its own\b/i, message: 'generic standalone con' },
  { pattern: /\brarely carries a meal by itself\b/i, message: 'generic standalone con' },
  { pattern: /\bstandalone nutrition\b/i, message: 'generic standalone nutrition con' },
  { pattern: /\bstand-alone\b/i, message: 'generic standalone con' },
  { pattern: /\bfoundation-food status\b/i, message: 'generic foundation-food con' },
  { pattern: /\btreated as a foundation food\b/i, message: 'generic foundation-food con' },
  { pattern: /\bdeserves foundation food\b/i, message: 'generic foundation-food con' },
  { pattern: /\bnitrous oxide\b/i, message: 'use nitric oxide for dietary nitrate context' },
  { pattern: /\bpoly unsaturated\b/i, message: 'standard term is polyunsaturated' },
  { pattern: /\bthresh holds\b/i, message: 'standard term is thresholds' },
  { pattern: /\bsubmracros?\b/i, message: 'standard term is submacros' },
  { pattern: /\bmore points then\b/i, message: 'use than for comparison' },
  { pattern: /\btheir to inform\b/i, message: 'use there to inform' }
];
const SECTION_RECAP_CONTEXT_TITLE_PATTERNS = [
  { pattern: /\bprotein contribution is tiny\b/i, message: 'plain protein-section recap in context item' },
  { pattern: /\bprotein is basically absent\b/i, message: 'plain protein-section recap in context item' },
  { pattern: /\bprotein support is weak\b/i, message: 'plain protein-section recap in context item' },
  { pattern: /\bmineral density is genuinely strong\b/i, message: 'plain mineral-section recap in context item' },
  { pattern: /\belite mineral density\b/i, message: 'plain mineral-section recap in context item' },
  { pattern: /\bunusually strong mineral density for a grain\b/i, message: 'plain mineral-section recap in context item' },
  { pattern: /\bvitamin c reputation is a real strength\b/i, message: 'plain vitamin-section recap in context item' }
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listJson(dir) {
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => path.join(dir, name));
}

function walkFiles(dir, includeFile, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      walkFiles(file, includeFile, results);
    } else if (!includeFile || includeFile(file)) {
      results.push(file);
    }
  }
  return results;
}

function issue(list, file, message, extra = {}) {
  list.push({ file: path.relative(repoRoot, file), message, ...extra });
}

function sameArray(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function walkStrings(value, visit, pathParts = []) {
  if (typeof value === 'string') {
    visit(value, pathParts.join('.'));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, [...pathParts, String(index)]));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      walkStrings(child, visit, [...pathParts, key]);
    }
  }
}

function finalisationIds() {
  if (!fs.existsSync(finalisationConfig)) return new Set();
  const config = readJson(finalisationConfig);
  return new Set((config.foods || []).map(item => (typeof item === 'string' ? item : item.id || item.foodId)).filter(Boolean));
}

function expectedScoreForArrowLabel(label, polarity) {
  const value = String(label || '').trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(LABEL_SCORES, value)) return LABEL_SCORES[value];

  const up = (value.match(/↑/g) || []).length;
  const down = (value.match(/↓/g) || []).length;
  if (!up && !down) return null;

  const count = Math.max(up, down);
  const higherWorse = polarity === 'higher_worse';
  if (up) {
    if (higherWorse) return ({ 1: 40, 2: 20, 3: 0 })[count] ?? null;
    return ({ 1: 60, 2: 80, 3: 100 })[count] ?? null;
  }
  if (higherWorse) return ({ 1: 60, 2: 80, 3: 100 })[count] ?? null;
  return ({ 1: 40, 2: 20, 3: 0 })[count] ?? null;
}

function nutritionSources(food) {
  const direct = food.nutritionDataSources || food.sourceEvidence?.nutritionDataSources || [];
  return Array.isArray(direct) ? direct : [];
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function hasSpecificAminoAcidProfile(food) {
  const aminoAcids = food.metrics?.amino_acids_mg;
  return Boolean(aminoAcids && typeof aminoAcids === 'object' && !Array.isArray(aminoAcids)
    && Object.values(aminoAcids).some(value => finiteNumber(value) !== null));
}

function aminoAcidMetricValue(food, metricKey) {
  return finiteNumber(food.metrics?.amino_acids_mg?.[metricKey]);
}

function aminoGroupScore(food, groups) {
  return (groups || []).filter(group => {
    const values = (group.metricKeys || []).map(metricKey => aminoAcidMetricValue(food, metricKey));
    if (values.every(value => value === null)) return false;
    const amountMg = values.reduce((sum, value) => sum + (value || 0), 0);
    return amountMg >= Number(group.thresholdMg);
  }).length;
}

function auditAminoAcidScoring(food, file, errors) {
  const hasProfile = hasSpecificAminoAcidProfile(food);
  if (food.metrics?.amino_acids_mg && !hasProfile) {
    issue(errors, file, 'metrics.amino_acids_mg must contain numeric mg values when present');
  }

  for (const key of AMINO_ACID_SCORE_KEYS) {
    if (typeof food.metrics?.[key] === 'number' && !hasProfile) {
      issue(errors, file, `${key} cannot be a numeric proxy without source-backed amino_acids_mg`);
    }
  }

  if (typeof food.metrics?.bioavailability_percent === 'number' && !hasProfile) {
    issue(errors, file, 'bioavailability_percent cannot be numeric without source-backed amino_acids_mg');
  }

  if (!hasProfile || !aminoAcidThresholds) return;
  const expectedEssential = aminoGroupScore(food, aminoAcidThresholds.essentialGroups);
  const expectedNonessential = aminoGroupScore(food, aminoAcidThresholds.nonessentialGroups);
  if (food.metrics.essential_amino_acids_score !== expectedEssential) {
    issue(errors, file, 'essential_amino_acids_score must match useful-amount amino acid threshold calculation', {
      expected: expectedEssential,
      actual: food.metrics.essential_amino_acids_score
    });
  }
  if (food.metrics.nonessential_amino_acids_score !== expectedNonessential) {
    issue(errors, file, 'nonessential_amino_acids_score must match useful-amount amino acid threshold calculation', {
      expected: expectedNonessential,
      actual: food.metrics.nonessential_amino_acids_score
    });
  }
}

function hasTwoDistinctNutritionSources(food) {
  const distinct = new Set();
  for (const source of nutritionSources(food)) {
    const key = [
      String(source.sourceName || source.name || '').trim().toLowerCase(),
      String(source.recordId || source.fdcId || source.url || '').trim().toLowerCase()
    ].filter(Boolean).join('|');
    if (key) distinct.add(key);
  }
  return distinct.size >= 2;
}

function needsStrictSourceEvidence(food, finalIds) {
  if (scope === 'finalisation') return finalIds.has(food.id);
  if (scope === 'production') {
    return /production-safe|near-production-safe/i.test(food.scoreReadiness?.status || '')
      || (food.sourceNotes || []).some(note => /production-lane cleanup pass/i.test(note));
  }
  if (scope === 'all-strict') return true;
  return finalIds.has(food.id) || /production-safe/i.test(food.scoreReadiness?.status || '');
}

function auditFoods(errors, warnings) {
  const finalIds = finalisationIds();
  const foodFiles = listJson(foodsDir).filter(file => file.endsWith('.sample.json'));
  const selected = foodFiles.filter(file => {
    const food = readJson(file);
    if (scope === 'finalisation') return finalIds.has(food.id);
    if (scope === 'production') return needsStrictSourceEvidence(food, finalIds);
    return true;
  });
  const seenIds = new Map();
  const seenNames = new Map();
  const repeatedTitles = new Map();

  for (const file of selected) {
    const food = readJson(file);
    if (!food.id) issue(errors, file, 'missing food id');
    if (!food.name) issue(errors, file, 'missing food name');

    if (food.id) {
      if (seenIds.has(food.id)) issue(errors, file, `duplicate food id with ${seenIds.get(food.id)}`);
      else seenIds.set(food.id, path.relative(repoRoot, file));
    }

    const normalizedName = String(food.name || '').trim().toLowerCase();
    if (normalizedName) {
      const previous = seenNames.get(normalizedName);
      if (previous) issue(errors, file, `duplicate food name with ${previous}`);
      else seenNames.set(normalizedName, path.relative(repoRoot, file));
    }

    if (food.basis?.value !== 100 || food.basis?.unit !== 'g') {
      issue(errors, file, 'basis must be exactly per 100g', { basis: food.basis || null });
    }

    for (const key of HEADER_KEYS) {
      if (typeof food.header?.[key] !== 'number') {
        issue(errors, file, `header.${key} must be a number`);
      }
    }

    for (const [key, value] of Object.entries(food.metrics || {})) {
      if (key === 'amino_acids_mg') {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          issue(errors, file, 'metrics.amino_acids_mg must be an object of mg values');
          continue;
        }
        for (const [aminoKey, aminoValue] of Object.entries(value)) {
          if (typeof aminoValue !== 'number') issue(errors, file, `metrics.amino_acids_mg.${aminoKey} must be a number`);
        }
        continue;
      }
      if (value !== null && typeof value !== 'number') {
        issue(errors, file, `metrics.${key} must be number or null`);
      }
    }
    auditAminoAcidScoring(food, file, errors);

    for (const side of CONTEXT_SIDES) {
      const items = food.contextItems?.[side] || [];
      if (items.length !== 3) issue(errors, file, `${side} must contain exactly 3 items`, { count: items.length });
      const localTitles = new Set();
      for (const item of items) {
        if (!item.title || !item.explanation || !item.impactLevel) {
          issue(errors, file, `${side} item missing title, explanation, or impactLevel`, { itemKey: item.itemKey || null });
        }
        for (const titleIssue of prosConsTitleTextIssues(item.title)) {
          issue(errors, file, `${side} item ${titleIssue.message}`, {
            itemKey: item.itemKey || null,
            title: item.title || null,
            length: titleIssue.length ?? null,
            max: titleIssue.max ?? null
          });
        }
        for (const recapIssue of SECTION_RECAP_CONTEXT_TITLE_PATTERNS) {
          if (recapIssue.pattern.test(item.title || '')) {
            issue(errors, file, `${side} item ${recapIssue.message}`, {
              itemKey: item.itemKey || null,
              title: item.title || null
            });
          }
        }
        const titleKey = String(item.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        if (titleKey) {
          if (localTitles.has(titleKey)) issue(errors, file, `duplicate ${side} title inside food`, { title: item.title });
          localTitles.add(titleKey);
          const globalKey = `${side}:${titleKey}`;
          const rows = repeatedTitles.get(globalKey) || [];
          rows.push(food.id || path.basename(file));
          repeatedTitles.set(globalKey, rows);
        }
      }
    }

    for (const [index, adjustment] of (food.scoreAdjustments || []).entries()) {
      if (!adjustment.itemKey || !adjustment.label || !adjustment.reason) {
        issue(errors, file, 'score adjustment missing itemKey, label, or reason', { index });
      }
      if (typeof adjustment.points !== 'number' || !Number.isFinite(adjustment.points) || adjustment.points === 0) {
        issue(errors, file, 'score adjustment points must be a non-zero number', {
          index,
          points: adjustment.points ?? null
        });
      }
      if (typeof adjustment.points === 'number' && Math.abs(adjustment.points) > 60) {
        issue(errors, file, 'score adjustment should stay within +/-60 points', {
          index,
          points: adjustment.points
        });
      }
    }

    const notes = food.sourceNotes || [];
    const strictSources = needsStrictSourceEvidence(food, finalIds);
    if (strictSources && !hasTwoDistinctNutritionSources(food)) {
      issue(errors, file, 'production/finalisation food needs at least two structured nutritionDataSources');
    }
    if (strictSources && notes.some(note => PLACEHOLDER_NOTE_RE.test(note))) {
      issue(errors, file, 'production/finalisation food still carries placeholder source notes');
    }
    if (!strictSources && notes.some(note => PLACEHOLDER_NOTE_RE.test(note))) {
      issue(warnings, file, 'calibration placeholder data, not production source-backed');
    }

    walkStrings(food, (text, pointer) => {
      for (const { pattern, message } of BAD_TEXT_PATTERNS) {
        if (pattern.test(text)) issue(errors, file, message, { pointer, text });
      }
    });
  }

  for (const [title, rows] of repeatedTitles.entries()) {
    if (rows.length >= 12) {
      warnings.push({
        file: 'foods/',
        message: 'highly repeated context item title; consider making future production copy more food-specific',
        title,
        count: rows.length,
        examples: rows.slice(0, 8)
      });
    }
  }

  return { foodFiles: selected.length };
}

function auditRulesets(errors) {
  const ruleFiles = listJson(rulesetsDir);
  const foods = listJson(foodsDir).map(readJson);
  const numericMetricValuesByType = {};
  for (const food of foods) {
    numericMetricValuesByType[food.foodType] ??= {};
    for (const [metricKey, value] of Object.entries(food.metrics || {})) {
      if (typeof value !== 'number') continue;
      numericMetricValuesByType[food.foodType][metricKey] ??= 0;
      numericMetricValuesByType[food.foodType][metricKey] += 1;
    }
  }

  for (const file of ruleFiles) {
    const ruleset = readJson(file);
    const weights = Object.values(ruleset.sectionWeights || {});
    const sum = weights.reduce((total, value) => total + Number(value || 0), 0);
    if (Math.abs(sum - 1) > 0.00001) issue(errors, file, 'section weights must sum to 1', { sum });

    for (const [tier, expectedScore] of Object.entries(EXPECTED_TIER_SCORE_MAP)) {
      if (ruleset.tierScoreMap?.[tier] !== expectedScore) {
        issue(errors, file, 'tierScoreMap must use locked D/C/B/A/S display scores', {
          tier,
          expected: expectedScore,
          actual: ruleset.tierScoreMap?.[tier] ?? null
        });
      }
    }

    for (const rule of ruleset.metricRules || []) {
      if (/^vitamin_b\d+_dv$/.test(rule.metricKey) && rule.metricKey !== CANONICAL_B_VITAMIN_SCORE_KEY && rule.scoringRole === 'scored') {
        issue(errors, file, 'only vitamin_b12_dv may be a score-bearing FoodRanked Vitamin B metric', {
          metricKey: rule.metricKey
        });
      }

      const expectedPolarity = EXPECTED_METRIC_POLARITIES[rule.metricKey];
      if (expectedPolarity && rule.polarity !== expectedPolarity) {
        issue(errors, file, 'shared submacro polarity must stay constant across food types', {
          metricKey: rule.metricKey,
          expected: expectedPolarity,
          actual: rule.polarity || null
        });
      }

      if (rule.scoringRole === 'scored' && rule.weight === 0 && rule.applicability !== 'not_applicable') {
        issue(errors, file, 'zero-weight scored metric must be not_applicable', { metricKey: rule.metricKey });
      }

      const bands = rule.bands || [];
      if (rule.scoringRole === 'scored' && rule.scoringMode === 'arrow_bands' && rule.applicability !== 'not_applicable' && bands.length !== 6) {
        issue(errors, file, 'scored arrow metric should use six bands', { metricKey: rule.metricKey, bandCount: bands.length });
      }

      if (rule.scoringRole === 'scored' && rule.scoringMode === 'arrow_bands' && rule.applicability === 'not_applicable') {
        const numericCount = numericMetricValuesByType[ruleset.foodType]?.[rule.metricKey] || 0;
        if (numericCount > 0) {
          issue(errors, file, 'numeric submacro metric cannot be not_applicable; use bands or make the food value N/A', {
            metricKey: rule.metricKey,
            numericCount
          });
        }
      }

      for (let index = 0; index < bands.length; index += 1) {
        const band = bands[index];
        const expected = expectedScoreForArrowLabel(band.label, rule.polarity);
        if (expected !== null && expected !== band.score) {
          issue(errors, file, 'arrow label score does not match polarity/colour rules', {
            metricKey: rule.metricKey,
            label: band.label,
            score: band.score,
            expected
          });
        }
        const previous = bands[index - 1];
        if (previous && typeof previous.max === 'number' && typeof band.min === 'number' && previous.max !== band.min) {
          issue(errors, file, 'band min/max should be continuous', {
            metricKey: rule.metricKey,
            previous: previous.label,
            current: band.label,
            previousMax: previous.max,
            currentMin: band.min
          });
        }
      }
    }

    if (ruleset.proteinFallback) {
      const bands = ruleset.proteinFallback.bands || [];
      if (bands.length !== 6) {
        issue(errors, file, 'protein fallback should use six arrow bands', { bandCount: bands.length });
      }
      for (const band of bands) {
        const expected = expectedScoreForArrowLabel(band.label, 'higher_better');
        if (expected !== null && expected !== band.score) {
          issue(errors, file, 'protein fallback arrow label score does not match higher-better rules', {
            label: band.label,
            score: band.score,
            expected
          });
        }
      }
    }

    const proteinDisplay = ruleset.proteinDisplay;
    if (!proteinDisplay) {
      issue(errors, file, 'ruleset must define proteinDisplay visible-row policy');
    } else {
      if (proteinDisplay.policyId !== PROTEIN_DISPLAY_POLICY_ID) {
        issue(errors, file, 'proteinDisplay policyId must be locked', {
          expected: PROTEIN_DISPLAY_POLICY_ID,
          actual: proteinDisplay.policyId || null
        });
      }
      if (proteinDisplay.rowCount !== PROTEIN_VISIBLE_ROWS.length) {
        issue(errors, file, 'proteinDisplay rowCount must match visible row contract', {
          expected: PROTEIN_VISIBLE_ROWS.length,
          actual: proteinDisplay.rowCount ?? null
        });
      }
      if (!sameArray(proteinDisplay.visibleRows, PROTEIN_VISIBLE_ROWS)) {
        issue(errors, file, 'proteinDisplay visibleRows must stay locked to collagen/EAA/NEAA/bioavailability', {
          expected: PROTEIN_VISIBLE_ROWS,
          actual: proteinDisplay.visibleRows || null
        });
      }
      if (proteinDisplay.hiddenFallbackMetricKey !== (ruleset.proteinFallback?.metricKey || PROTEIN_HIDDEN_FALLBACK_METRIC_KEY)) {
        issue(errors, file, 'proteinDisplay hiddenFallbackMetricKey must match proteinFallback.metricKey', {
          expected: ruleset.proteinFallback?.metricKey || PROTEIN_HIDDEN_FALLBACK_METRIC_KEY,
          actual: proteinDisplay.hiddenFallbackMetricKey || null
        });
      }
      if (proteinDisplay.showProteinFallbackAsVisibleRow !== false) {
        issue(errors, file, 'proteinDisplay must not show protein fallback as a visible row');
      }
      if (proteinDisplay.missingValueDisplay !== 'N/A') {
        issue(errors, file, 'proteinDisplay missingValueDisplay must be N/A', {
          actual: proteinDisplay.missingValueDisplay || null
        });
      }
    }

    for (const [index, anchor] of (ruleset.scoreCalibration?.anchors || []).entries()) {
      const previous = ruleset.scoreCalibration.anchors[index - 1];
      if (!previous) continue;
      if (anchor.raw < previous.raw || anchor.calibrated < previous.calibrated) {
        issue(errors, file, 'score calibration anchors must be monotonic');
      }
    }

    if (ruleset.scoreCalibration && ruleset.scoreCalibration.output !== 'calibratedOverallScore') {
      issue(errors, file, 'score calibration output must be calibratedOverallScore', {
        output: ruleset.scoreCalibration.output || null
      });
    }
  }
  return { ruleFiles: ruleFiles.length };
}

function auditAminoAcidThresholdConfig(errors) {
  if (!aminoAcidThresholds) {
    issue(errors, aminoAcidThresholdsPath, 'amino acid threshold config is missing');
    return { aminoAcidThresholdConfig: 0 };
  }

  for (const [groupKey, expectedCount] of Object.entries(EXPECTED_AMINO_ACID_GROUP_COUNTS)) {
    const groups = aminoAcidThresholds[groupKey] || [];
    if (groups.length !== expectedCount) {
      issue(errors, aminoAcidThresholdsPath, `${groupKey} must contain ${expectedCount} groups`, {
        actual: groups.length
      });
    }
  }

  const denominators = aminoAcidThresholds.displayDenominators || {};
  if (denominators.essential !== EXPECTED_AMINO_ACID_GROUP_COUNTS.essentialGroups) {
    issue(errors, aminoAcidThresholdsPath, 'essential display denominator must match essential group count', {
      expected: EXPECTED_AMINO_ACID_GROUP_COUNTS.essentialGroups,
      actual: denominators.essential ?? null
    });
  }
  if (denominators.nonessential !== EXPECTED_AMINO_ACID_GROUP_COUNTS.nonessentialGroups) {
    issue(errors, aminoAcidThresholdsPath, 'nonessential display denominator must match nonessential group count', {
      expected: EXPECTED_AMINO_ACID_GROUP_COUNTS.nonessentialGroups,
      actual: denominators.nonessential ?? null
    });
  }

  return { aminoAcidThresholdConfig: 1 };
}

function generatedEpisodeIdsForScope() {
  if (!fs.existsSync(episodesDir)) return new Set();
  const finalIds = finalisationIds();
  if (scope === 'finalisation') return finalIds;

  if (scope === 'production') {
    const ids = new Set();
    for (const file of listJson(foodsDir).filter(name => name.endsWith('.sample.json'))) {
      const food = readJson(file);
      if (needsStrictSourceEvidence(food, finalIds)) ids.add(food.id);
    }
    return ids;
  }

  return new Set(fs.readdirSync(episodesDir)
    .filter(name => name.endsWith('-compact') || name.endsWith('-standard'))
    .map(name => name.replace(/-(compact|standard)$/, '')));
}

function auditGeneratedText(errors) {
  const ids = generatedEpisodeIdsForScope();
  const textExtensions = new Set(['.json', '.txt', '.js', '.md']);
  const generatedFiles = [];

  for (const id of ids) {
    for (const suffix of ['compact', 'standard']) {
      const dir = path.join(episodesDir, `${id}-${suffix}`);
      walkFiles(dir, file => textExtensions.has(path.extname(file)), generatedFiles);
    }
  }

  if (scope !== 'finalisation') {
    for (const name of ['foods-index.json', 'foods-index.js']) {
      const file = path.join(dataDir, name);
      if (fs.existsSync(file)) generatedFiles.push(file);
    }
  }

  for (const file of generatedFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const { pattern, message } of BAD_TEXT_PATTERNS) {
      if (pattern.test(text)) issue(errors, file, `generated output contains ${message}`);
    }
  }

  return { generatedFiles: generatedFiles.length };
}

function proteinSectionFromScript(script) {
  return (script?.sections || []).find(section => section.key === 'proteins');
}

function macroSectionMainDisplaysNa(section) {
  return section?.macroDisplayValue === 'N/A' || section?.macroDisplayValue === null || section?.macroDisplayValue === undefined;
}

function auditMacroSubmacroDisplaySections(script, file, errors, extra = {}) {
  const sections = script?.sections || [];
  let checked = 0;

  for (const sectionKey of MACRO_DISPLAY_SECTION_KEYS) {
    const section = sections.find(item => item.key === sectionKey);
    if (!section) continue;
    checked += 1;

    const mainDisplaysNa = macroSectionMainDisplaysNa(section);
    for (const item of section.displayItems || []) {
      if (mainDisplaysNa) continue;
      if (item.displayValue === 'N/A') {
        issue(errors, file, 'visible submacro row must not show N/A when the main macro displays a value', {
          ...extra,
          sectionKey,
          macroDisplayValue: section.macroDisplayValue ?? null,
          metricKey: item.metricKey || null,
          displaySource: item.displaySource || null,
          notApplicableReason: item.notApplicableReason || null
        });
      }
      if (item.displayValue !== 'N/A' && !item.band) {
        issue(errors, file, 'visible numeric submacro row must resolve an arrow band', {
          ...extra,
          sectionKey,
          metricKey: item.metricKey || null,
          displayValue: item.displayValue ?? null,
          displaySource: item.displaySource || null
        });
      }
    }
  }

  return checked;
}

function auditProteinDisplaySection(script, file, errors, extra = {}) {
  const section = proteinSectionFromScript(script);
  if (!section) return 0;

  const policy = section.displayPolicy;
  if (!policy) {
    issue(errors, file, 'generated proteins section must include displayPolicy', extra);
  } else {
    if (policy.policyId !== PROTEIN_DISPLAY_POLICY_ID) {
      issue(errors, file, 'generated protein displayPolicy has wrong policyId', {
        ...extra,
        expected: PROTEIN_DISPLAY_POLICY_ID,
        actual: policy.policyId || null
      });
    }
    if (policy.rowCount !== PROTEIN_VISIBLE_ROWS.length) {
      issue(errors, file, 'generated protein displayPolicy has wrong rowCount', {
        ...extra,
        expected: PROTEIN_VISIBLE_ROWS.length,
        actual: policy.rowCount ?? null
      });
    }
    if (!sameArray(policy.visibleRows, PROTEIN_VISIBLE_ROWS)) {
      issue(errors, file, 'generated protein displayPolicy visibleRows drifted', {
        ...extra,
        expected: PROTEIN_VISIBLE_ROWS,
        actual: policy.visibleRows || null
      });
    }
    if (policy.hiddenFallbackMetricKey !== PROTEIN_HIDDEN_FALLBACK_METRIC_KEY) {
      issue(errors, file, 'generated protein displayPolicy hidden fallback drifted', {
        ...extra,
        expected: PROTEIN_HIDDEN_FALLBACK_METRIC_KEY,
        actual: policy.hiddenFallbackMetricKey || null
      });
    }
    if (policy.showProteinFallbackAsVisibleRow !== false) {
      issue(errors, file, 'generated protein displayPolicy must keep fallback hidden', extra);
    }
  }

  const items = section.displayItems || [];
  const metricKeys = items.map(item => item.metricKey);
  if (!sameArray(metricKeys, PROTEIN_VISIBLE_ROWS)) {
    issue(errors, file, 'generated proteins displayItems must stay collagen/EAA/NEAA/bioavailability', {
      ...extra,
      expected: PROTEIN_VISIBLE_ROWS,
      actual: metricKeys
    });
  }
  if (metricKeys.includes(PROTEIN_HIDDEN_FALLBACK_METRIC_KEY)) {
    issue(errors, file, 'protein_g_fallback must not appear in generated displayItems', extra);
  }

  for (const item of items) {
    if (item.metricKey === PROTEIN_HIDDEN_FALLBACK_METRIC_KEY) {
      issue(errors, file, 'hidden protein fallback leaked into visible protein rows', extra);
      continue;
    }
    if (item.displayValue === 'N/A' && !macroSectionMainDisplaysNa(section)) {
      issue(errors, file, 'protein display row may show N/A only when the protein macro displays N/A', {
        ...extra,
        metricKey: item.metricKey,
        displaySource: item.displaySource || null,
        displayValue: item.displayValue ?? null,
        macroDisplayValue: section.macroDisplayValue ?? null
      });
    }
  }

  return 1;
}

function auditGeneratedProteinDisplay(errors) {
  let checked = 0;
  const ids = generatedEpisodeIdsForScope();

  for (const id of ids) {
    for (const suffix of ['compact', 'standard']) {
      const file = path.join(episodesDir, `${id}-${suffix}`, 'script.json');
      if (!fs.existsSync(file)) continue;
      const script = readJson(file);
      checked += auditMacroSubmacroDisplaySections(script, file, errors, { foodId: id, mode: suffix });
      checked += auditProteinDisplaySection(script, file, errors, { foodId: id, mode: suffix });
    }
  }

  if (scope !== 'finalisation') {
    const file = path.join(dataDir, 'foods-index.json');
    if (fs.existsSync(file)) {
      for (const food of readJson(file)) {
        checked += auditMacroSubmacroDisplaySections(food.episode?.script, file, errors, { foodId: food.id, surface: 'foods-index' });
        checked += auditProteinDisplaySection(food.episode?.script, file, errors, { foodId: food.id, surface: 'foods-index' });
      }
    }
  }

  return { macroDisplayScripts: checked };
}

function main() {
  const errors = [];
  const warnings = [];
  const foodStats = auditFoods(errors, warnings);
  const aminoAcidThresholdStats = auditAminoAcidThresholdConfig(errors);
  const ruleStats = auditRulesets(errors);
  const generatedStats = auditGeneratedText(errors);
  const proteinDisplayStats = auditGeneratedProteinDisplay(errors);
  const result = {
    status: errors.length ? 'fail' : 'ok',
    scope,
    checkedAt: new Date().toISOString(),
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      ...foodStats,
      ...aminoAcidThresholdStats,
      ...ruleStats,
      ...generatedStats,
      ...proteinDisplayStats
    },
    errors,
    warnings: args.has('--show-warnings') ? warnings : warnings.slice(0, 80)
  };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exit(1);
}

main();
