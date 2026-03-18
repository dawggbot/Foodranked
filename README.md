# Foodranked

FoodRanked is a short-form nutrition content system for ranking foods into tiers using category-specific rulesets and presenting the results in a cozy pixel-art / RPG-style video format.

## Included

- Project spec and format docs
- Metrics catalog and scoring-system docs
- Machine-readable ruleset schema and sample rulesets
- Sample food JSON inputs
- Prototype scorer script
- Episode package generator for single-food outputs
- Custom OpenClaw skills tailored to the project
- Blueprint reference docs

## Repo layout

- `references/` — blueprint/source reference docs
- `foods/` — sample and future food entries
- `rulesets/` — category rulesets
- `scripts/` — scoring/prototype scripts
- `skills/` — custom OpenClaw project skills

## Quick commands

Generate a scored episode package for one food:

```bash
node scripts/foodranked-generate-episode.js oats
```

Generate a shorter-form draft package:

```bash
node scripts/foodranked-generate-episode.js oats --compact --no-cta
```

That writes reviewable packages to paths like:

```text
outputs/episodes/oats/
outputs/episodes/oats-compact/
```

Generate a whole launch batch:

```bash
node scripts/foodranked-generate-episode-batch.js config/launch-batch.v1.json
```

See also:
- `EPISODE-MANIFEST-SCHEMA.md`
- `BATCH-WORKFLOW.md`
- `FIRST-LAUNCH-SHORTLIST.md`
- `LAUNCH-TOP-5-VISUAL-PRODUCTION-PACK.md`
- `STORYBOARD-BACON-RICE-CAKES.md`
- `LAUNCH-TOP-5-ASSET-BRIEFS-AND-PROMPTS.md`
- `PRODUCTION-FOLDER-STRUCTURE.md`
- `templates/visual-template.v1.json`

## Notes

This repo is the clean project mirror, separate from the broader OpenClaw workspace.
