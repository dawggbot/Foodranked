# FoodRanked Workspace

This workspace is the active working home for the FoodRanked project.

FoodRanked is a short-form nutrition content system for ranking foods into tiers using category-specific rulesets and presenting the results in a cozy pixel-art / RPG-style video format.

## What is currently live

### Canonical docs
Use these first:
- `FOODRANKED-ENTRY-RULEBOOK.md` — future food-entry rules and database policy
- `RULESET-SCHEMA.md` — active scoring/ruleset schema direction
- `RULESET-JSON-SHAPE.md` — active practical ruleset JSON direction
- `VIDEO-FORMAT.md` — active video/output format direction
- `LIVE-SYSTEM-MAP.md` — quick guide to what is live vs supporting vs archived

### Active production food-entry lane
- `foods/production/`

Current active production drafts:
- `tomato-red-raw-draft.json`
- `oats-rolled-dry-draft.json`
- `white-rice-long-grain-enriched-raw-draft.json`
- `yam-true-yam-raw-draft.json`
- `chicken-thigh-raw-draft.json`

### Supporting nutrition docs
- `docs/nutrition-audit/`

### Archived material
- `docs/archive/foodranked-duplicates/`
- `docs/archive/tmp-audit-archive-2026-04-04/`

## Repo/workspace layout

- `foods/` — sample foods and production-lane food entries
- `rulesets/` — category rulesets
- `scripts/` — scoring and generation scripts
- `docs/` — active docs, audit/support docs, and archived docs
- `references/` — blueprint/source reference docs
- `skills/` — custom OpenClaw project skills
- `production/` — production operations assets and episode-specific materials

## Current project direction

- wholefoods use raw / uncooked canonical entries
- meats also use raw canonical entries
- oats means uncooked rolled oats
- white rice means uncooked white rice
- yam means true yam
- future entries should follow `FOODRANKED-ENTRY-RULEBOOK.md`

## Recommended reading order

If you are working on future food entries:
1. `FOODRANKED-ENTRY-RULEBOOK.md`
2. `LIVE-SYSTEM-MAP.md`
3. `foods/production/README.md`
4. relevant production food file(s)
5. supporting docs under `docs/nutrition-audit/`

If you are working on scoring logic:
1. `RULESET-SCHEMA.md`
2. `RULESET-JSON-SHAPE.md`
3. active rulesets / scorer implementation

If you are working on output/video structure:
1. `VIDEO-FORMAT.md`
2. relevant production episode or UI docs

## Notes

This workspace has gone through a cleanup pass.
The goal now is to keep the live system obvious and avoid drifting back into duplicate docs, temporary audit sprawl, or conflicting rule branches.
