# Dashboard Publish Helper

Use this when you want dashboard-visible changes to go live on GitHub Pages more easily.

## Command

```bash
cd /home/idk/.openclaw/workspace/Foodranked
./scripts/publish-dashboard-update.sh "Your commit message here"
```

Example:

```bash
./scripts/publish-dashboard-update.sh "Update oats ruleset and dashboard preview"
```

## What it does

1. regenerates dashboard data via `node scripts/generate-dashboard-data.js`
2. stages dashboard-related files
3. creates a commit with your message
4. pushes to `origin main`

## Staged paths

- `docs/index.html`
- `docs/app/`
- `scripts/generate-dashboard-data.js`

## Important note

If you change foods/rulesets and want those changes reflected in the dashboard, make sure the repo state already contains those edits before running the helper.

The helper regenerates the dashboard snapshot, but it only stages the dashboard-related files by default.

So:
- if you want the underlying food/ruleset changes committed too, stage/commit them separately
- if you only care about updating the Pages dashboard snapshot, this helper is enough for the dashboard files themselves
