# Duplicate Doc Review

This note tracks duplicate or conflicting documentation discovered during cleanup.

## Main finding

There are duplicate top-level docs both at the workspace root and under `Foodranked/`:
- `RULESET-SCHEMA.md`
- `RULESET-JSON-SHAPE.md`
- `VIDEO-FORMAT.md`

These are not just copies.
Some contain materially different content.
That makes them a future-confusion risk.

## Recommended canonical copies

Treat the workspace-root copies as canonical for now:
- `/RULESET-SCHEMA.md`
- `/RULESET-JSON-SHAPE.md`
- `/VIDEO-FORMAT.md`

Reason:
- they include the newer nutrition-audit / production-file-shape references
- they better reflect the current production-lane thinking
- they are the versions most recently aligned with the current workspace decisions

## Detected differences

### RULESET-SCHEMA.md
- root copy includes stronger production identity / provenance concepts
- nested `Foodranked/` copy still reflects an older scoring/context split

### RULESET-JSON-SHAPE.md
- root copy includes references to the production food-file contract and provenance/identity requirements
- nested `Foodranked/` copy still reflects an older shape with different section/context treatment

### VIDEO-FORMAT.md
- root copy says current phase is wholefoods only
- nested `Foodranked/` copy says foods are not restricted to wholefoods only
- that is a direct policy conflict

## Cleanup recommendation

The specific conflicting duplicates under `Foodranked/` have now been archived to:
- `docs/archive/foodranked-duplicates/Foodranked.RULESET-SCHEMA.md`
- `docs/archive/foodranked-duplicates/Foodranked.RULESET-JSON-SHAPE.md`
- `docs/archive/foodranked-duplicates/Foodranked.VIDEO-FORMAT.md`

## Current cleanup stance

For future work, assume the root copies are the active source of truth unless James says otherwise.
