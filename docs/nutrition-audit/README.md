# Nutrition Audit Notes

This folder is the permanent home for Foodranked nutrition audit working notes that are worth keeping.

## Purpose

Move valuable nutrition reasoning out of `tmp-audit/` so the repo has:
- a clear source of truth for ongoing audit notes
- less risk of policy forking in temporary folders
- a cleaner distinction between permanent docs and disposable staging material

## Current status

These notes are still **audit working papers**, not final production truth.
Use them to guide:
- food identity locking
- provenance verification
- ruleset calibration
- food-specific pros/cons refinement
- tier sanity review

## Important rule

`rulesets/` is the source of truth for active ruleset JSON.
Do not treat duplicate JSON files in temp folders as active scoring policy.

## Suggested next cleanup

Once the migrated notes are accepted:
1. archive or remove duplicate JSONs under `tmp-audit/rulesets/`
2. archive or remove any temporary audit notes left behind in `tmp-audit/`
3. keep this folder for durable nutrition audit reasoning only
