#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const scoreAllPath = path.join(__dirname, 'foodranked-score-all.js');
const outputsDir = path.join(repoRoot, 'outputs', 'leaderboards');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
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

  const allLeaderboard = {
    status: 'ok',
    generatedAt: new Date().toISOString(),
    categories: Object.keys(grouped).sort(),
    overview,
    leaderboards: grouped
  };

  fs.writeFileSync(path.join(outputsDir, 'all-categories.json'), JSON.stringify(allLeaderboard, null, 2));

  for (const [type, leaderboard] of Object.entries(grouped)) {
    const payload = {
      status: 'ok',
      generatedAt: allLeaderboard.generatedAt,
      category: type,
      count: leaderboard.length,
      leaderboard
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
