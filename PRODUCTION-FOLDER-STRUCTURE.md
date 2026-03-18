# PRODUCTION-FOLDER-STRUCTURE

FoodRanked now has a dedicated production-side folder structure so generated outputs, working files, and final exports stay separated.

## Top-level layout

- `outputs/episodes/` — machine-generated episode packages
- `outputs/batches/` — machine-generated batch results
- `assets/` — reusable visual assets
- `production/episodes/` — human production workspaces per episode
- `production/templates/` — reusable production templates/checklists
- `production/queues/` — queue and status docs
- `exports/` — final platform-targeted renders

## Why this matters

Without this split, the repo turns into a mix of:
- generated JSON
- prompts
- storyboards
- assets
- editor files
- final videos

That gets messy fast.

This structure keeps the pipeline readable:
1. generate episode package
2. create / gather assets
3. build in production workspace
4. export to platform folders

## First seeded episodes

Created production workspaces for:
- `bacon`
- `rice-cakes`
- `cola-regular`
- `extra-virgin-olive-oil`
- `salmon`

Each has folders for:
- `briefs/`
- `storyboards/`
- `subtitles/`
- `voice/`
- `edits/`
- `exports/`

## Recommended next use

- put generated hero images in `assets/heroes/`
- put icon outputs in `assets/icons/...`
- copy episode-specific notes into `production/episodes/<food-id>/briefs/`
- place voice outputs in `production/episodes/<food-id>/voice/`
- place NLE/project files in `production/episodes/<food-id>/edits/`
- place final masters in both `production/episodes/<food-id>/exports/` and platform-specific `exports/` folders
