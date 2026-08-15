---
name: "foodranked-entry-finalizer"
description: "Finalize complete FoodRanked profiles using exact data, checked Google AI results, then analogues."
---

# FoodRanked Entry Finalizer

Use this workflow when a food needs to be truly ready for FoodRanked Studio, not merely visible on the webpage builders.

## Definition Of Done

Treat a food entry as finalized only when it is complete, pushed, app-syncable, and included in a Windows Studio release when app behavior depends on bundled code/assets.

A finalized entry has:

- `foods/<food-id>.sample.json` and `docs/data/foods/<food-id>.sample.json` aligned.
- A complete per-100g production profile with every required visible submetric filled through exact database data, checked exact-food Google/AI Overview research, then last-resort analogue hierarchy. Provenance records the source tier; narration remains confident.
- Scoring output, generated script, subtitles, episode manifest, and dashboard/index data aligned.
- Exactly 3 pros and exactly 3 cons that do not simply repeat scored macro, vitamin, mineral, or submacro callouts.
- Split narration audio manifest plus every referenced MP3 present in production/docs/app-sync paths when narration is expected in the app.
- Food image sprite available in source and bundled app paths with normalized app-id filename, dimensions, allowlists/size metadata, `foods-index`, and `app-assets` updated.
- A top-level Agent Sync job that can update the installed app locally with food data, sprite, audio manifest/assets, DBv2 export, and optional VBv2 render.
- DBv2 webpage, VBv2 webpage, and the installed/bundled app path verified for food image placement, header stack, subtitles, active split audio, playback, and section content.

## Batch Setup

For multiple foods, work in small batches by food type or source class. Start with an audit table covering food id, canonical identity, raw/prepared/branded form, likely source, sprite availability, narration/audio status, missing or weak fields, and expected verification commands.

Keep finalization samples and previously approved entries unchanged unless James explicitly asks to refresh them.

## Data And Script Workflow

1. Confirm the exact food identity and display name. Preserve locked FoodRanked identities and per-100g scoring.
2. Build or refresh `foods/<food-id>.sample.json` from USDA FoodData Central for whole foods/raw ingredients, or Open Food Facts for packaged/branded foods when it is the better identity match.
3. Complete every required visible submetric. Use exact USDA/OFF data first, then search Google for the exact food, preparation, metric, and per-100g basis. Use the AI Overview after checking its linked source or corroborating the value. Use another food or food-class analogue only as the last resort. Record the query, linked or corroborating source, matched identity, and derivation in metric provenance; do not finalize an entry that still depends on `N/A` or unreviewed display defaults.
4. Run scorer/proof checks for the changed foods.
5. Generate or refresh script, narration text, subtitles, score, episode manifest, `docs/data/foods-index.json`, and `docs/data/foods-index.js`.
6. Manually review the seven body sections. Macro/micron narration should mention strongest and weakest completed marks confidently without narrating provenance uncertainty. Pros/cons should add food-context value rather than recap visible nutrition facts.

## Split Narration Workflow

1. Generate split narration blocks when the app should play narration.
2. Keep visible narration canonical. Use TTS-only overrides only for confirmed pronunciation problems.
3. Force-align the take and regenerate dashboard/app data.
4. Verify the manifest references existing MP3s and has paths usable by docs, production, and Agent Sync.
5. Probe VBv2 with the food selected and confirm an active split-audio manifest loads. Missing audio in the app usually means the app data/job/release path is stale even if the webpage works.

## Sprite And App Asset Workflow

1. Normalize uploaded food image names to the food id, for example `white potato.png` to `white-potato.png` and `hazelnut.png`/`hazelnuts.png` to the chosen food id.
2. Copy the sprite into `sprites/header/food_images/` and `docs/app/sprites/header/food_images/` without changing existing canvas coordinates.
3. Update generated/bundled asset indexes such as `docs/data/app-assets.js`, `docs/data/foods-index.json`, and `docs/data/foods-index.js` using the repo scripts where possible.
4. Update any DBv2/VBv2/bundled app allowlists and size tables needed by the selected food image path.
5. Verify DBv2 resolves the sprite and VBv2 draws it on the header food plate with the correct stack: food plate behind calorie bubble, selected food image above food plate, and calorie bubble/text not covered.

## Agent Sync Workflow

For each finalized food, add or update a top Agent Sync job that can run on James's installed app. Include actions for food data, sprite upload/attach, split audio files, split audio manifest, DBv2 export/placement refresh, and VBv2 render if requested.

Use approved app actions only. Do not use Agent Sync as arbitrary remote command execution.

## Web Vs App Rule

Do not stop at webpage proof when James is checking the Windows app. The hosted DBv2/VBv2 pages can be perfect while the installed app remains stale.

When web is correct but app is wrong:

- Check whether the latest Windows release tag includes the commit with the web/runtime fix.
- If the fix is newer than the latest app release, run the smallest meaningful checks, push or tag a new `studio-windows-v...` release, wait for GitHub Actions to complete, and provide the new app zip.
- Ask James to install the new app and rerun the relevant Agent Sync job so local app data refreshes.

## Verification Checklist

Run the smallest meaningful checks for the blast radius:

- `git status --short --branch` before edits.
- `npm run studio:check` for Studio/app code changes.
- Scorer/generator/proof commands for changed foods.
- Asset manifest regeneration and sanity checks for sprite/audio file presence.
- Browser or Playwright proof for DBv2 and VBv2 with cache-busting food URLs.
- Git tag/release verification when a Windows app download is needed.

After the release is built, confirm the release asset exists and its tag includes the required commit before telling James to redownload.
