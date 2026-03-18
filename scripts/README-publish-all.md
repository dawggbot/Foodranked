# Publish All Dashboard-Relevant Changes

Use this when you want to push both:
- underlying FoodRanked source changes
- refreshed dashboard snapshot files

## Command

```bash
cd /home/idk/.openclaw/workspace/Foodranked
./scripts/publish-all-dashboard-relevant-changes.sh "Your commit message here"
```

Example:

```bash
./scripts/publish-all-dashboard-relevant-changes.sh "Tune rice cakes layout and update dashboard"
```

## What it does

1. regenerates dashboard data
2. stages common FoodRanked source paths
3. commits with your message
4. pushes to `origin main`

## Intended use

Use this after changing things like:
- foods
- rulesets
- scripts
- docs/app dashboard files
- production docs/templates
- visual template files

## Caution

This stages a broad set of project files.
If you have unrelated messy WIP in the repo, check `git status` first.
