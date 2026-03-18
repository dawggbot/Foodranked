#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/home/idk/.openclaw/workspace/Foodranked"
cd "$REPO_ROOT"

MESSAGE="${1:-Update FoodRanked source + dashboard}"

node scripts/generate-dashboard-data.js

git add foods rulesets scripts docs templates production assets config outputs/episodes outputs/batches README.md *.md 2>/dev/null || true

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$MESSAGE"
git push origin main

echo
printf 'Done. Source changes and dashboard snapshot were pushed to origin/main. Refresh GitHub Pages in a minute or two.\n'
