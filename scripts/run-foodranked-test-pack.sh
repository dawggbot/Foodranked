#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/foodranked-score-all.js
node scripts/verify-narration-subtitles.js
