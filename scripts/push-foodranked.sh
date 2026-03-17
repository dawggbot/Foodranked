#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

if [[ $# -eq 0 ]]; then
  MSG="Update FoodRanked project"
else
  MSG="$*"
fi

git add .
if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git commit -m "$MSG"
GIT_SSH_COMMAND='ssh -i ~/.ssh/openclaw-foodranked-github_ed25519 -o IdentitiesOnly=yes' git push

echo "Pushed to GitHub." 
