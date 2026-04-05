# Live System Map

This file is the quick guide to what is currently live, canonical, archived, or supporting in the FoodRanked workspace.

## Primary canonical docs

Use these first:
- `FOODRANKED-ENTRY-RULEBOOK.md` → future food-entry rules
- `RULESET-SCHEMA.md` → active scoring/ruleset schema direction
- `RULESET-JSON-SHAPE.md` → active practical ruleset JSON direction
- `VIDEO-FORMAT.md` → active video/output format direction

## Active production lane

Primary active food-entry lane:
- `foods/production/`

Current active production drafts:
- `foods/production/tomato-red-raw-draft.json`
- `foods/production/oats-rolled-dry-draft.json`
- `foods/production/white-rice-long-grain-enriched-raw-draft.json`
- `foods/production/yam-true-yam-raw-draft.json`
- `foods/production/chicken-thigh-raw-draft.json`

## Supporting nutrition docs

Use as support, not as the first rule source:
- `docs/nutrition-audit/README.md`
- `docs/nutrition-audit/display-metric-sourcing-policy.md`
- `docs/nutrition-audit/production-food-file-shape.md`
- `docs/nutrition-audit/category-audit-summary.md`
- `docs/nutrition-audit/CLEANUP-PHASE-ROADMAP.md`
- `PRODUCTION-SAFETY-BLOCKERS.md`

## Historical / archived material

Archived duplicate docs:
- `docs/archive/foodranked-duplicates/`

Archived temporary audit workspace:
- `docs/archive/tmp-audit-archive-2026-04-04/`

Archived cooked-reference production file:
- `foods/production/_archived-cooked-reference.chicken-thigh-meat-only-roasted.json`

Historical pass notes still kept in active docs folder but should be read as historical/supporting, not primary truth:
- `docs/nutrition-audit/full-food-nutrition-pass-plan.md`
- `docs/nutrition-audit/display-metric-sourcing-pass-1.md`

## Practical reading order for future work

If working on future food entries:
1. `FOODRANKED-ENTRY-RULEBOOK.md`
2. `foods/production/README.md`
3. relevant active production food file(s)
4. `docs/nutrition-audit/display-metric-sourcing-policy.md`
5. `docs/nutrition-audit/production-food-file-shape.md`

If working on scoring logic:
1. `RULESET-SCHEMA.md`
2. `RULESET-JSON-SHAPE.md`
3. active rulesets / scorer implementation

If working on output/video structure:
1. `VIDEO-FORMAT.md`
2. relevant production episode or UI docs

## Cleanup intent

This file exists so future-you does not have to guess:
- which docs are current
- which docs are historical
- which folders are active
- which files are archived on purpose
