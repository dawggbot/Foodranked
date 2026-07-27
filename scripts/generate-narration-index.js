#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const foodsIndexPath = path.join(repoRoot, 'docs', 'data', 'foods-index.json');
const outputDir = path.join(repoRoot, 'audio', 'narration', 'episodes');
const outputIndexPath = path.join(outputDir, 'index.json');
const outputReadmePath = path.join(outputDir, 'README.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function repoPath(file) {
  return path.relative(repoRoot, file).replace(/\\/g, '/');
}

function fileExists(repoRelativePath) {
  return fs.existsSync(path.join(repoRoot, repoRelativePath));
}

function docsRepoPath(docsRelativePath) {
  if (!docsRelativePath) return null;
  return `docs/${String(docsRelativePath).replace(/^\/+/, '')}`;
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? walkFiles(file) : [file];
    })
    .sort((a, b) => repoPath(a).localeCompare(repoPath(b)));
}

function listRepoFiles(dir, filter = () => true) {
  return walkFiles(dir).map(repoPath).filter(filter);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function titleFromId(foodId) {
  return String(foodId || '')
    .split('-')
    .filter(Boolean)
    .map(part => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function markdownLink(fromDir, targetRepoPath, label = null) {
  if (!targetRepoPath) return '';
  const relative = path.relative(fromDir, path.join(repoRoot, targetRepoPath)).replace(/\\/g, '/');
  return `[${label || targetRepoPath}](${relative})`;
}

function formatDuration(seconds) {
  const value = Number(seconds);
  return Number.isFinite(value) && value > 0 ? `${value.toFixed(1)}s` : '';
}

function activeNarration(food) {
  const split = food?.episode?.splitAudio || null;
  if (split?.take) {
    return {
      mode: 'split-blocks',
      take: split.take,
      manifestPath: docsRepoPath(split.manifestPath),
      alignmentPath: split.alignmentPath || null,
      durationSeconds: split.durationSeconds || null,
      blockCount: Array.isArray(split.blocks)
        ? split.blocks.length
        : Array.isArray(split.timedBlocks)
        ? split.timedBlocks.length
        : null
    };
  }
  const single = food?.episode?.audio || null;
  if (single?.take) {
    return {
      mode: 'single-file',
      take: single.take,
      manifestPath: docsRepoPath(single.metadataPath),
      audioPath: docsRepoPath(single.path),
      durationSeconds: single.durationSeconds || null,
      blockCount: null
    };
  }
  return null;
}

function manifestSummary(file) {
  try {
    const manifest = readJson(path.join(repoRoot, file));
    const take = manifest.take || path.basename(file).replace(/-blocks\.json$|\.json$/g, '');
    return {
      take,
      mode: manifest.schemaVersion === 'foodranked-elevenlabs-audio-blocks.v1' ? 'split-blocks' : 'single-file',
      path: file,
      generatedAt: manifest.generatedAt || '',
      voiceLabel: manifest.voice?.label || '',
      blockCount: Array.isArray(manifest.blocks) ? manifest.blocks.length : null,
      pronunciationOverrides: Array.isArray(manifest.pronunciationOverrides)
        ? manifest.pronunciationOverrides
        : []
    };
  } catch {
    return {
      take: path.basename(file).replace(/-blocks\.json$|\.json$/g, ''),
      mode: file.endsWith('-blocks.json') ? 'split-blocks' : 'single-file',
      path: file,
      generatedAt: '',
      voiceLabel: '',
      blockCount: null,
      pronunciationOverrides: []
    };
  }
}

function mergedManifestSummaries(files) {
  const byTake = new Map();
  for (const file of files) {
    const summary = manifestSummary(file);
    const key = `${summary.mode}:${summary.take}`;
    const existing = byTake.get(key);
    const preferred = !existing || (file.startsWith('docs/') && !existing.path.startsWith('docs/'));
    const pronunciationOverrides = uniqueOverrides([
      ...(existing?.pronunciationOverrides || []),
      ...summary.pronunciationOverrides
    ]);
    byTake.set(key, {
      ...(preferred ? summary : existing),
      productionManifestPath: file.startsWith('production/') ? file : existing?.productionManifestPath || null,
      docsManifestPath: file.startsWith('docs/') ? file : existing?.docsManifestPath || null,
      pronunciationOverrides
    });
  }
  return [...byTake.values()].sort((a, b) => a.take.localeCompare(b.take) || a.mode.localeCompare(b.mode));
}

function uniqueOverrides(overrides) {
  const byKey = new Map();
  for (const override of overrides) {
    const key = [
      override.blockId || '',
      override.displayText || '',
      override.ttsText || '',
      override.reason || ''
    ].join('\u0000');
    if (!byKey.has(key)) byKey.set(key, override);
  }
  return [...byKey.values()];
}

function narrationFileFilter(file) {
  return /\.(mp3|json|txt|md)$/i.test(file);
}

function episodeEntry(foodId, food) {
  const productionDir = path.join(repoRoot, 'production', 'episodes', foodId, 'voice');
  const docsDir = path.join(repoRoot, 'docs', 'audio', 'episodes', foodId);
  const outputEpisodeDir = path.join(repoRoot, 'outputs', 'episodes', `${foodId}-compact`);
  const productionFiles = listRepoFiles(productionDir, narrationFileFilter);
  const docsFiles = listRepoFiles(docsDir, narrationFileFilter);
  const outputFiles = listRepoFiles(outputEpisodeDir, file => {
    const name = path.basename(file);
    return name === 'narration.txt'
      || name === 'subtitles.json'
      || name === 'episode-manifest.json'
      || name.includes('forced-alignment');
  });
  const manifestFiles = uniqueSorted([
    ...productionFiles.filter(file => /\/voice-v[^/]+\.json$/i.test(file)),
    ...docsFiles.filter(file => /\/voice-v[^/]+\.json$/i.test(file))
  ]);

  return {
    foodId,
    foodName: food?.name || titleFromId(foodId),
    active: activeNarration(food),
    sourceNarrationPath: outputFiles.find(file => file.endsWith('/narration.txt')) || null,
    finalNarrationPath: productionFiles.find(file => file.endsWith('/final-narration.txt')) || null,
    productionFiles,
    docsFiles,
    outputFiles,
    takes: mergedManifestSummaries(manifestFiles)
  };
}

function writeEpisodeMarkdown(entry) {
  const file = path.join(outputDir, `${entry.foodId}.md`);
  const fromDir = outputDir;
  const active = entry.active;
  const lines = [
    `# ${entry.foodName} Narration`,
    '',
    `Food id: \`${entry.foodId}\``,
    '',
    '## Active Take',
    '',
    active
      ? [
          `- Mode: \`${active.mode}\``,
          `- Take: \`${active.take}\``,
          active.durationSeconds ? `- Duration: \`${formatDuration(active.durationSeconds)}\`` : null,
          active.blockCount ? `- Blocks: \`${active.blockCount}\`` : null,
          active.manifestPath && fileExists(active.manifestPath) ? `- Manifest: ${markdownLink(fromDir, active.manifestPath)}` : null,
          active.audioPath && fileExists(active.audioPath) ? `- Audio: ${markdownLink(fromDir, active.audioPath)}` : null,
          active.alignmentPath && fileExists(active.alignmentPath) ? `- Alignment: ${markdownLink(fromDir, active.alignmentPath)}` : null
        ].filter(Boolean).join('\n')
      : '- No active audio take is listed in `docs/data/foods-index.json`.',
    '',
    '## Takes',
    '',
    entry.takes.length
      ? [
          '| Take | Mode | Voice | Blocks | Generated | Manifest |',
          '| --- | --- | --- | ---: | --- | --- |',
          ...entry.takes.map(take => [
            `\`${take.take}\``,
            `\`${take.mode}\``,
            take.voiceLabel || '',
            take.blockCount == null ? '' : String(take.blockCount),
            take.generatedAt || '',
            markdownLink(fromDir, take.path, path.basename(take.path))
          ].join(' | '))
        ].join('\n')
      : '_No generated take manifests found._',
    '',
    '## Pronunciation Overrides',
    '',
    entry.takes.flatMap(take => take.pronunciationOverrides.map(override => ({ take, override }))).length
      ? [
          '| Take | Block | Display Text | TTS Text | Reason |',
          '| --- | --- | --- | --- | --- |',
          ...entry.takes.flatMap(take => take.pronunciationOverrides.map(override => [
            `\`${take.take}\``,
            `\`${override.blockId || ''}\``,
            `\`${override.displayText || ''}\``,
            `\`${override.ttsText || ''}\``,
            override.reason || ''
          ].join(' | ')))
        ].join('\n')
      : '_No pronunciation overrides recorded._',
    '',
    '## Files',
    '',
    '### Production',
    '',
    entry.productionFiles.length
      ? entry.productionFiles.map(item => `- ${markdownLink(fromDir, item)}`).join('\n')
      : '- None.',
    '',
    '### Docs Mirror',
    '',
    entry.docsFiles.length
      ? entry.docsFiles.map(item => `- ${markdownLink(fromDir, item)}`).join('\n')
      : '- None.',
    '',
    '### Output And Alignment',
    '',
    entry.outputFiles.length
      ? entry.outputFiles.map(item => `- ${markdownLink(fromDir, item)}`).join('\n')
      : '- None.'
  ];
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
  return repoPath(file);
}

function writeReadme(entries) {
  const fromDir = outputDir;
  const rows = entries.map(entry => {
    const active = entry.active;
    return [
      markdownLink(fromDir, `audio/narration/episodes/${entry.foodId}.md`, entry.foodName),
      active ? `\`${active.take}\`` : '',
      active ? `\`${active.mode}\`` : '',
      active?.durationSeconds ? formatDuration(active.durationSeconds) : '',
      active?.blockCount == null ? '' : String(active.blockCount),
      String(entry.productionFiles.length),
      String(entry.docsFiles.length),
      String(entry.outputFiles.length)
    ].join(' | ');
  });

  fs.writeFileSync(outputReadmePath, `${[
    '# Episode Narration Index',
    '',
    'This folder is the GitHub-facing catalogue for generated narration files. The MP3s stay in their production and docs mirror locations so Video Builder v2 can keep using stable paths.',
    '',
    '| Food | Active Take | Mode | Duration | Blocks | Production Files | Docs Files | Output Files |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
    ...rows
  ].join('\n')}\n`);
}

function main() {
  const foods = fs.existsSync(foodsIndexPath) ? readJson(foodsIndexPath) : [];
  const foodsById = new Map(foods.map(food => [food.id, food]));
  const productionIds = fs.existsSync(path.join(repoRoot, 'production', 'episodes'))
    ? fs.readdirSync(path.join(repoRoot, 'production', 'episodes'), { withFileTypes: true })
        .filter(entry => entry.isDirectory() && fs.existsSync(path.join(repoRoot, 'production', 'episodes', entry.name, 'voice')))
        .map(entry => entry.name)
    : [];
  const docsIds = fs.existsSync(path.join(repoRoot, 'docs', 'audio', 'episodes'))
    ? fs.readdirSync(path.join(repoRoot, 'docs', 'audio', 'episodes'), { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
    : [];
  const ids = uniqueSorted([...productionIds, ...docsIds]);
  const entries = ids.map(id => episodeEntry(id, foodsById.get(id)));

  ensureDir(outputDir);
  const markdownFiles = entries.map(writeEpisodeMarkdown);
  writeReadme(entries);
  writeJson(outputIndexPath, {
    schemaVersion: 'foodranked-narration-index.v1',
    generatedAt: new Date().toISOString(),
    sourceFoodsIndex: repoPath(foodsIndexPath),
    readme: repoPath(outputReadmePath),
    episodeMarkdownFiles: markdownFiles,
    episodeCount: entries.length,
    entries
  });

  console.log(JSON.stringify({
    status: 'ok',
    episodeCount: entries.length,
    indexPath: repoPath(outputIndexPath),
    readmePath: repoPath(outputReadmePath)
  }, null, 2));
}

main();
