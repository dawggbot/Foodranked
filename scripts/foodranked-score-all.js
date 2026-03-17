#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const foodsDir = path.join(repoRoot, 'foods');
const rulesetsDir = path.join(repoRoot, 'rulesets');
const scorerPath = path.join(__dirname, 'foodranked-scorer.js');

function listJson(dir) {
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .map(name => path.join(dir, name));
}

function inferRulesetPath(foodJson) {
  const food = JSON.parse(fs.readFileSync(foodJson, 'utf8'));
  const rulesetName = `${food.foodType}.v1.json`;
  return {
    food,
    rulesetPath: path.join(rulesetsDir, rulesetName)
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

function main() {
  const foodFiles = listJson(foodsDir).filter(f => f.endsWith('.sample.json'));
  const rows = [];
  const full = [];

  for (const foodPath of foodFiles) {
    const { food, rulesetPath } = inferRulesetPath(foodPath);
    if (!fs.existsSync(rulesetPath)) {
      full.push({ ok: false, food: food.name, error: `Missing ruleset: ${rulesetPath}` });
      continue;
    }

    const scored = runScore(foodPath, rulesetPath);
    full.push(scored);

    if (scored.ok) {
      rows.push({
        food: scored.result.food.name,
        type: scored.result.food.foodType,
        tier: scored.result.tier,
        overallScore: scored.result.overallScore,
        fats: scored.result.sectionScores.fats,
        carbs: scored.result.sectionScores.carbs,
        proteins: scored.result.sectionScores.proteins,
        vitamins: scored.result.sectionScores.vitamins,
        minerals: scored.result.sectionScores.minerals,
        baseScore: scored.result.baseScore,
        contextAdjustment: scored.result.contextAdjustment.appliedAdjustment
      });
    }
  }

  console.log(JSON.stringify({
    status: 'ok',
    summary: rows,
    details: full
  }, null, 2));
}

main();
