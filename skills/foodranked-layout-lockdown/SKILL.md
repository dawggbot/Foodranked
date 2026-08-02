---
name: "foodranked-layout-lockdown"
description: "Lock and preserve finalized FoodRanked Layout Builder layouts."
---

# FoodRanked Layout Builder Lockdown Workflow

Use this when James says the Layout Builder is complete, locked, finalized, or asks to preserve it.

## Rules

- Treat Layout Builder layout state as user-owned canvas state.
- Do not food-sync Layout Builder. Food-driven binding belongs in DBv2/VBv2/render surfaces, not in Layout Builder.
- Before any automatic migration, import, sync, cleanup, or reset that could affect Layout Builder canvas layers, create multiple non-overwriting backups.
- Never overwrite, import over, seed over, delete, or auto-migrate locked saved layouts unless James explicitly asks and fresh backups have been made first.
- Preserve locked layout copies named `test 1`, `test 2`, `test 3`, `test 4`, and `test 5`.
- Remove confusing restore/import paths that can overwrite the completed layout.

## Procedure

1. Read current repo status and relevant Layout Builder files before editing.
2. Preserve existing user dirty files; stage only scoped Layout Builder changes.
3. If locking in code, add a protected layout ID/name allowlist and prevent delete/replace for protected names.
4. If creating browser-local copies, seed from the current Layout Builder local layout/preset only when the browser already has it; otherwise add migration code that copies current local layout to locked presets on next load.
5. Remove or disable old restore-from-VBv2/test-layout recovery flows that can overwrite the current completed layout.
6. Search the repo for old layout sources, stale seed files, test-restore code, layout import code, and default fallback layouts. Remove or disconnect only the stale paths that can feed Layout Builder incorrectly.
7. Verify with syntax checks, repo checks, and Playwright against Layout Builder: protected copies exist, cannot be deleted/replaced, food changes do not mutate Layout Builder layers, and no restore-from-VBv2 UI remains.
8. Commit and push scoped changes. Report the cache-busted Layout Builder URL and the commit hash.
