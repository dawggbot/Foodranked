#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/foodranked-score-all.js
node scripts/foodranked-nutrition-plausibility-audit.js --scope=production
node scripts/verify-narration-subtitles.js
node scripts/verify-pros-cons-title-fit.js
