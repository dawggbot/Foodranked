#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/home/idk/.openclaw/workspace/Foodranked"
cd "$REPO_ROOT"

MESSAGE="${1:-Update dashboard content}"

node scripts/generate-dashboard-data.js

git add docs/index.html docs/app docs/data docs/studio scripts/generate-dashboard-data.js

if git diff --cached --quiet; then
  echo "No dashboard changes to commit."
  exit 0
fi

git commit -m "$MESSAGE"
git push origin main

echo
printf 'Done. If GitHub Pages is enabled for docs/, refresh the site in a minute or two.\n'
