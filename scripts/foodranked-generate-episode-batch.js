#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const outputsRoot = path.join(repoRoot, 'outputs', 'batches');
const episodeScript = path.join(__dirname, 'foodranked-generate-episode.js');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function safeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function runEpisode(foodId, options) {
  const args = [episodeScript, foodId];
  if (options.mode === 'compact') args.push('--compact');
  else args.push('--standard');
  if (options.includeCta === false) args.push('--no-cta');

  const res = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  });

  if (res.status !== 0) {
    return {
      ok: false,
      foodId,
      error: (res.stderr || res.stdout || 'Batch generation failed').trim()
    };
  }

  return {
    ok: true,
    foodId,
    result: JSON.parse(res.stdout)
  };
}

function summaryRow(item) {
  if (!item.ok) {
    return `- ${item.foodId}: FAILED — ${item.error}`;
  }
  const r = item.result;
  return `- ${r.food}: ${r.tier} (${r.overallScore}) — ${r.estimatedDurationSeconds}s — ${r.outputDir}`;
}

function main() {
  const [, , configArg] = process.argv;
  const configPath = path.resolve(configArg || path.join(repoRoot, 'config', 'launch-batch.v1.json'));
  if (!fs.existsSync(configPath)) {
    console.error(`Missing config: ${configPath}`);
    process.exit(1);
  }

  const config = readJson(configPath);
  const defaults = config.defaults || {};
  const foods = Array.isArray(config.foods) ? config.foods : [];
  if (!foods.length) {
    console.error('No foods listed in batch config.');
    process.exit(1);
  }

  const results = foods.map(foodId => runEpisode(foodId, defaults));
  const batchId = safeSlug(config.id || `batch-${Date.now()}`);
  const outputDir = path.join(outputsRoot, batchId);
  ensureDir(outputDir);

  const manifest = {
    id: batchId,
    sourceConfig: path.relative(repoRoot, configPath),
    generatedAt: new Date().toISOString(),
    defaults,
    foods,
    results
  };

  fs.writeFileSync(path.join(outputDir, 'batch-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const summary = [
    `# ${config.id || batchId}`,
    '',
    config.description || '',
    '',
    `Defaults: mode=${defaults.mode || 'standard'}, includeCta=${defaults.includeCta !== false}`,
    '',
    '## Results',
    ...results.map(summaryRow)
  ].join('\n');
  fs.writeFileSync(path.join(outputDir, 'README.md'), summary + '\n');

  console.log(JSON.stringify({
    status: 'ok',
    batchId,
    outputDir: path.relative(repoRoot, outputDir),
    succeeded: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
    foods: results.map(r => r.foodId)
  }, null, 2));
}

main();
