# Repo Polish Notes

This note captures the current repo-polish state after the main cleanup pass.

## Key improvements made

- added a workspace-root `README.md` so the active project finally has a clear entry point
- added `LIVE-SYSTEM-MAP.md` to show what is live vs supporting vs archived
- established `FOODRANKED-ENTRY-RULEBOOK.md` as the single-source future-entry rule doc
- archived conflicting duplicate docs from `Foodranked/`
- archived the old `tmp-audit/` workspace
- clarified which nutrition docs are historical/supporting rather than primary truth

## Remaining repo-polish watchouts

### 1. Git working tree is still broad
There are many modified/untracked files beyond the nutrition cleanup itself.
That means commit staging should be done deliberately, not with a blind `git add .`.

### 2. `Foodranked/` is a real nested repo area
That means cleanup there should stay surgical.
Do not assume every duplicate is safe to delete without checking whether it is still used inside that nested project.

### 3. Historical docs still exist by design
Some old pass docs remain because they preserve reasoning.
They should stay clearly labeled as historical/supporting, not silently active.

## Practical next step before commit/push

If preparing a commit later:
1. review `git status`
2. stage only the intended cleanup/doc/database files
3. keep unrelated memory/persona/workspace-management files out unless intentionally included
4. write a commit message that reflects cleanup + source-of-truth consolidation
