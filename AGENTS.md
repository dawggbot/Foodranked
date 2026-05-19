# AGENTS.md - FoodRanked

This workspace is the FoodRanked repo. Treat `/home/idk/.openclaw/workspace/Foodranked` as the canonical project root on this machine, not the wider OpenClaw workspace.

## Project Shape

FoodRanked is a repeatable nutrition short-form content system: ranking foods, explainable per-100g nutrition scoring, cozy pixel-art presentation, narration, production workflows, and website/builder tooling. The goal is a defensible content engine where scoring data, script outputs, website data, and production assets stay aligned.

Work in sympathy with the existing repo. Read the relevant source-of-truth docs before changing behavior, especially:

- `FOODRANKED-SPEC.md`
- `FOOD-TYPES.md`
- `RULESET-SCHEMA.md`
- `RULESET-JSON-SHAPE.md`
- `VIDEO-FORMAT.md`
- `FOODRANKED-SCORING-SYSTEM.md`
- `METRICS-CATALOG.md`
- `SCRIPT-SCHEMA.md`
- `TEST-PACK.md`
- `TEST-PACK-OVERVIEW.md`
- `references/FoodRanked-blueprint.md`

## Locked Rules

- Score all foods per 100g.
- Keep the 7-section structure: fats, carbs, proteins, vitamins, minerals, pros, cons.
- Only submacros use arrow-indicator scoring.
- Vitamins and minerals score from DV% as `floor(DV% / 10)`, capped at 10.
- Use exactly 3 pros and exactly 3 cons in final outputs.
- Whole foods usually use raw values; meats usually use raw forms; prepared foods are ranked as they come.
- Locked identities: oats are uncooked rolled oats; white rice is uncooked white rice; yam and sweet potato are separate uncooked entries; do not add extra oats/rice variants.
- If a metric is not defensibly sourceable for the exact food identity, display `N/A` rather than inventing a value.
- Pros and cons must not merely repeat macro, submacro, vitamin, or mineral points already shown on screen. Prefer antioxidants, polyphenols, fermentation, anti-nutrients, absorbability, sourcing, tolerance, digestion, processing burden, satiety, convenience, and meal role.

## Video And Narration

- Opener is always `SUBJECT ranked.`
- The header already carries food name, food type, per-100g, kcal, and image; narration should not reintroduce those basics.
- On-screen body text should be subtitles only.
- On-screen units are abbreviated: `g`, `mg`, etc.
- Prefer informative shorts over ultra-short ones.
- Keep all 3 pros and all 3 cons.
- ElevenLabs narration around 1.15x speed is acceptable.
- Narration-ready files use the locked ElevenLabs block format: `FOOD!`, `-`, `RANKED!`, `-`, one spoken block per section, short strengths/weaknesses overview, and final `X TIER!`.
- Pros/cons should sound like direct on-screen-item narration.
- Overall score is display-only and must not be spoken.
- The final spoken block must always be `X tier.`
- Write `DV` for speech as `daily value`.

## Data Sources

Use USDA FoodData Central as the primary source for whole foods, raw meats, grains, vegetables, fruits, and baseline ingredient data. Use Open Food Facts as an approved secondary source for packaged, processed, or branded foods, or when it is clearly the better identity match.

Never commit API keys, tokens, service-account JSON, generated auth files, or local `.env` files. If a local key exists, use it without printing it.

## Repo Discipline

- Check `git status` before editing.
- Keep changes scoped to the requested behavior.
- Do not revert user changes or unrelated generated work.
- Keep `rulesets/`, `foods/`, generated episode outputs, and website data aligned when touching scoring/script surfaces.
- Website source-of-truth should follow generated episode outputs, especially `docs/data/foods-index.json` and `docs/data/foods-index.js`.
- If site data, scripts, and generated outputs disagree, treat it as a cleanup target.
- Run the smallest meaningful verification before reporting success.
- Meaningful FoodRanked project changes should be committed and pushed when appropriate, because James mainly checks GitHub.

## Skill Routing

Use the local FoodRanked skills when they fit:

- `nutrition-content-studio`: overall system design and cross-layer coordination.
- `nutrition-scoring-engineer`: schemas, rulesets, scoring math, DV logic, tier calibration, data defensibility.
- `nutrition-pixel-ui-director`: cozy pixel stat-sheet visuals, reveal pacing, sprites, subtitles, production layout.
- `nutrition-workflow-automator`: batch pipelines, episode generation, narration/subtitle prep, review queues, exports.
- `nutrition-content-strategist`: hooks, episode packaging, platform variants, retention and growth loops.

