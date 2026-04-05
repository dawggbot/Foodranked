# Nutrition Audit Notes

This folder is the permanent home for Foodranked nutrition audit working notes that are worth keeping.

## Purpose

Move valuable nutrition reasoning out of `tmp-audit/` so the repo has:
- a clear source of truth for ongoing audit notes
- less risk of policy forking in temporary folders
- a cleaner distinction between permanent docs and disposable staging material

## Current status

These notes are still **audit/supporting papers**, not the main future-entry rule source.

Primary source of truth for future food-entry rules:
- `FOODRANKED-ENTRY-RULEBOOK.md`

Use this folder to support:
- food identity locking
- provenance verification
- ruleset calibration
- food-specific pros/cons refinement
- tier sanity review
- cleanup decisions and historical reasoning when worth preserving

## Important rule

`rulesets/` is the source of truth for active ruleset JSON.
Do not treat duplicate JSON files in temp folders as active scoring policy.

## Suggested next cleanup

Once the migrated notes are accepted:
1. archive or remove temporary audit notes left behind in `tmp-audit/`
2. keep this folder for durable nutrition audit reasoning only
3. prefer linking back to `FOODRANKED-ENTRY-RULEBOOK.md` instead of duplicating settled entry-policy rules here
