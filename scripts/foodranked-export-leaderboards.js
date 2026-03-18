#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const scoreAllPath = path.join(__dirname, 'foodranked-score-all.js');
const foodsDir = path.join(repoRoot, 'foods');
const outputsDir = path.join(repoRoot, 'outputs', 'leaderboards');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const scorerPath = path.join(__dirname, 'foodranked-scorer.js');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function listJson(dir) {
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .map(name => path.join(dir, name));
}

function inferRulesetPath(foodJson) {
  const food = readJson(foodJson);
  return {
    food,
    rulesetPath: path.join(rulesetsDir, `${food.foodType}.v1.json`)
  };
}

function runScore(foodPath, rulesetPath) {
  const res = spawnSync(process.execPath, [scorerPath, foodPath, rulesetPath], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  if (res.status !== 0) {
    return {
      ok: false,
      foodPath,
      rulesetPath,
      error: (res.stderr || res.stdout || '').trim()
    };
  }

  return {
    ok: true,
    foodPath,
    rulesetPath,
    result: JSON.parse(res.stdout)
  };
}

function sortRows(rows) {
  const tierRank = { S: 5, A: 4, B: 3, C: 2, D: 1 };
  return [...rows].sort((a, b) => {
    if ((tierRank[b.tier] || 0) !== (tierRank[a.tier] || 0)) return (tierRank[b.tier] || 0) - (tierRank[a.tier] || 0);
    if ((b.overallScore || 0) !== (a.overallScore || 0)) return (b.overallScore || 0) - (a.overallScore || 0);
    return String(a.food).localeCompare(String(b.food));
  });
}

function groupByType(rows) {
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.type]) grouped[row.type] = [];
    grouped[row.type].push(row);
  }
  for (const type of Object.keys(grouped)) grouped[type] = sortRows(grouped[type]);
  return grouped;
}

function buildOverview(grouped) {
  const overview = {};
  for (const [type, rows] of Object.entries(grouped)) {
    overview[type] = {
      count: rows.length,
      top: rows.slice(0, 3).map(r => ({ food: r.food, tier: r.tier, score: r.overallScore })),
      bottom: rows.slice(-3).map(r => ({ food: r.food, tier: r.tier, score: r.overallScore })),
      tiers: rows.reduce((acc, r) => {
        acc[r.tier] = (acc[r.tier] || 0) + 1;
        return acc;
      }, {})
    };
  }
  return overview;
}

function buildRichDetails() {
  const foodFiles = listJson(foodsDir).filter(f => f.endsWith('.sample.json'));
  const details = [];

  for (const foodPath of foodFiles) {
    const { food, rulesetPath } = inferRulesetPath(foodPath);
    if (!fs.existsSync(rulesetPath)) continue;
    const scored = runScore(foodPath, rulesetPath);
    if (!scored.ok) continue;
    details.push({
      food: scored.result.food.name,
      type: scored.result.food.foodType,
      tier: scored.result.tier,
      overallScore: scored.result.overallScore,
      explanation: scored.result.explanation,
      sectionScores: scored.result.sectionScores,
      baseScore: scored.result.baseScore,
      contextAdjustment: scored.result.contextAdjustment.appliedAdjustment
    });
  }

  return groupByType(details);
}

function main() {
  ensureDir(outputsDir);

  const res = spawnSync(process.execPath, [scoreAllPath], {
    cwd: repoRoot,
    encoding: 'utf8'
  });

  if (res.status !== 0) {
    console.error(res.stderr || res.stdout || 'Failed to score foods');
    process.exit(res.status || 1);
  }

  const scored = JSON.parse(res.stdout);
  const rows = scored.summary || [];
  const grouped = groupByType(rows);
  const overview = buildOverview(grouped);
  const richDetails = buildRichDetails();

  const allLeaderboard = {
    status: 'ok',
    generatedAt: new Date().toISOString(),
    categories: Object.keys(grouped).sort(),
    overview,
    leaderboards: grouped,
    explanations: richDetails
  };

  fs.writeFileSync(path.join(outputsDir, 'all-categories.json'), JSON.stringify(allLeaderboard, null, 2));

  for (const [type, leaderboard] of Object.entries(grouped)) {
    const payload = {
      status: 'ok',
      generatedAt: allLeaderboard.generatedAt,
      category: type,
      count: leaderboard.length,
      leaderboard,
      explanations: richDetails[type] || []
    };
    fs.writeFileSync(path.join(outputsDir, `${type}.json`), JSON.stringify(payload, null, 2));
  }

  const lines = [];
  for (const type of Object.keys(grouped).sort()) {
    lines.push(`# ${type}`);
    for (const row of grouped[type]) {
      lines.push(`- ${row.food} — ${row.tier} (${row.overallScore})`);
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(outputsDir, 'leaderboards.md'), lines.join('\n'));

  console.log(JSON.stringify({
    status: 'ok',
    outputsDir,
    files: fs.readdirSync(outputsDir).sort()
  }, null, 2));
}

main();
