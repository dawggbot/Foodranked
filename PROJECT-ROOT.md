# PROJECT-ROOT

This repository folder is the **source of truth** for the FoodRanked project.

## Canonical project path

```text
/home/idk/.openclaw/workspace/Foodranked
```

## Rule

For FoodRanked work going forward:
- create new docs here
- create new scripts here
- create new rulesets here
- create new foods/sample data here
- edit existing FoodRanked files here
- commit/push from here

Do **not** treat the broader OpenClaw workspace root as the canonical location for FoodRanked files anymore.

## Why

The wider workspace also contains:
- agent files
- memory files
- OpenClaw internal project notes
- unrelated assistant state

Keeping FoodRanked isolated here makes GitHub sync and project browsing much cleaner.

## Current repo layout

- `references/` — blueprint/source docs
- `foods/` — sample and future food entries
- `rulesets/` — category rulesets
- `scripts/` — scoring/prototype scripts
- `skills/` — custom FoodRanked OpenClaw skills
- root docs — project spec, format, schema, scoring docs

## Latest project direction

- wholefoods-only is no longer a hard scope rule
- FoodRanked can include more processed foods where that improves content variety and channel potential
- keep one food per episode and per-100g comparison as the core structure
