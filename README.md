# Foodranked

FoodRanked is a short-form nutrition content system for ranking foods into tiers using category-specific rulesets and presenting the results in a cozy pixel-art / RPG-style video format.

> Note: the active workspace-level source of truth now lives at the workspace root.
> Start with `../README.md`, `../LIVE-SYSTEM-MAP.md`, and `../FOODRANKED-ENTRY-RULEBOOK.md` for the cleaned current system view.

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

Generate a structured script payload for one food:

```bash
node scripts/foodranked-generate-script.js foods/oats.sample.json
```

Generate a scored episode package for one food:

```bash
node scripts/foodranked-generate-episode.js oats
```

Generate a shorter-form ElevenLabs-ready draft package:

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
- `SCRIPT-SCHEMA.md`
- `EPISODE-MANIFEST-SCHEMA.md`
- `BATCH-WORKFLOW.md`
- `FIRST-LAUNCH-SHORTLIST.md`
- `LAUNCH-TOP-5-VISUAL-PRODUCTION-PACK.md`
- `STORYBOARD-BACON-RICE-CAKES.md`
- `LAUNCH-TOP-5-ASSET-BRIEFS-AND-PROMPTS.md`
- `PRODUCTION-FOLDER-STRUCTURE.md`
- `templates/visual-template.v1.json`

## Notes

This nested repo area should be treated carefully during cleanup because it contains useful project material, but some top-level docs previously duplicated/conflicted with the workspace-root copies.

For the current cleaned source-of-truth view, prefer the workspace-root docs first.
