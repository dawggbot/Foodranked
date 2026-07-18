#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const {
  PROS_CONS_TITLE_MAX_CHARS,
  PROS_CONS_TITLE_TEXTBOX,
  prosConsTitleTextIssues
} = require('./lib/pros-cons-title-fit');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const docsFoodsDir = path.join(repoRoot, 'docs', 'data', 'foods');
const layoutBuilderPath = path.join(repoRoot, 'docs', 'layout-builder', 'index.html');
const SECTION_LABELS = {
  pros: '7. Pros',
  cons: '8. Cons'
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listFoodFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.sample.json'))
    .sort()
    .map(name => path.join(dir, name));
}

function collectRows(dir, sourceLabel) {
  return listFoodFiles(dir).flatMap(file => {
    const food = readJson(file);
    return ['pros', 'cons'].flatMap(side => (food.contextItems?.[side] || []).map((item, index) => ({
      source: sourceLabel,
      file: path.relative(repoRoot, file),
      foodId: food.id || path.basename(file),
      side,
      index: index + 1,
      title: String(item.title || '')
    })));
  });
}

function compactFailure(row, failure) {
  return [
    row.file,
    `${row.side}[${row.index}]`,
    failure.message,
    `"${row.title}"`
  ].join(' - ');
}

async function renderedFailures(rows) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const layoutBuilderUrl = pathToFileURL(layoutBuilderPath);
  layoutBuilderUrl.searchParams.set('v', 'pros-cons-title-fit');
  await page.goto(layoutBuilderUrl.href, { waitUntil: 'domcontentloaded' });
  const frameElement = await page.waitForSelector('#displayBuilderFrame', { timeout: 15000 });
  const frame = await frameElement.contentFrame();
  if (!frame) throw new Error('Layout builder iframe did not load');

  const failures = [];
  for (const side of ['pros', 'cons']) {
    await frame.locator('#sectionList button').filter({ hasText: SECTION_LABELS[side] }).click();
    await frame.waitForSelector(`.layer-node.text[data-layer-id="${side}_item_1"]`, { timeout: 15000 });
    const sideRows = rows.filter(row => row.side === side);
    const sideFailures = await frame.evaluate(({ rows, side }) => {
      const out = [];
      for (const row of rows) {
        const node = document.querySelector(`.layer-node.text[data-layer-id="${side}_item_${row.index}"]`)
          || document.querySelector(`.layer-node.text[data-layer-id="${side}_item_1"]`);
        if (!node) {
          out.push({
            row,
            message: 'textbox node missing'
          });
          continue;
        }
        node.textContent = row.title;
        const horizontalFits = node.scrollWidth <= node.clientWidth + 2;
        const verticalFits = node.scrollHeight <= node.clientHeight + 2;
        if (!horizontalFits || !verticalFits) {
          out.push({
            row,
            message: 'title does not fit the rendered pro/con textbox',
            details: {
              scrollWidth: node.scrollWidth,
              clientWidth: node.clientWidth,
              scrollHeight: node.scrollHeight,
              clientHeight: node.clientHeight
            }
          });
        }
      }
      return out;
    }, { rows: sideRows, side });
    failures.push(...sideFailures);
  }

  await browser.close();
  return failures;
}

async function main() {
  const rows = [
    ...collectRows(foodsDir, 'source'),
    ...collectRows(docsFoodsDir, 'docs')
  ];
  const textFailures = rows.flatMap(row => prosConsTitleTextIssues(row.title).map(failure => ({ row, failure })));
  const browserFailures = await renderedFailures(rows);

  if (textFailures.length || browserFailures.length) {
    console.error(JSON.stringify({
      status: 'fail',
      titleMaxChars: PROS_CONS_TITLE_MAX_CHARS,
      textbox: PROS_CONS_TITLE_TEXTBOX,
      textFailures: textFailures.map(({ row, failure }) => ({ ...row, ...failure })),
      renderedFailures: browserFailures
    }, null, 2));
    const lines = [
      ...textFailures.slice(0, 20).map(({ row, failure }) => compactFailure(row, failure)),
      ...browserFailures.slice(0, 20).map(({ row, message }) => compactFailure(row, { message }))
    ];
    if (lines.length) console.error(`\nFirst failures:\n${lines.join('\n')}`);
    process.exit(1);
  }

  console.log(JSON.stringify({
    status: 'ok',
    checkedTitles: rows.length,
    titleMaxChars: PROS_CONS_TITLE_MAX_CHARS,
    textbox: PROS_CONS_TITLE_TEXTBOX
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
