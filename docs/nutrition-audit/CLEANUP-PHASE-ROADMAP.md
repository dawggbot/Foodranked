# Cleanup Phase Roadmap

This file defines the cleanup phase that follows the now-finalized nutrition database baseline.

## Cleanup goal

Turn the current nutrition/database work from:
- working but sprawling
- partially duplicated
- audit-heavy

into:
- clean
- easier to navigate
- harder to misuse
- closer to a professional long-term repo shape

## Phase assumptions

These are now treated as settled enough to clean around:
- wholefoods use raw / uncooked canonical entries
- meats also use raw canonical entries
- oats means uncooked rolled oats
- white rice means uncooked white rice
- yam means true yam
- the active production lane lives under `foods/production/`
- the single-source future-entry policy lives in `FOODRANKED-ENTRY-RULEBOOK.md`

## Cleanup priorities

### 1. Quarantine superseded references
Keep old work only when it still helps future auditing.
Examples:
- archived cooked chicken-thigh reference
- old audit notes that describe decisions that have since been locked

Rule:
- keep if useful as historical reference
- archive if likely to confuse active work
- delete if redundant and valueless

### 2. Remove shadow policy
The repo should not require future-you to compare five docs just to know one rule.

Primary source of truth should become:
- `FOODRANKED-ENTRY-RULEBOOK.md`

Supporting docs may remain, but they should:
- summarize
- reference the rulebook
- avoid restating old unresolved branches as if they are still live

### 3. Tighten production-lane clarity
Inside `foods/production/`:
- active drafts should be obvious
- archived references should be obvious
- template files should be obvious
- README should reflect the current real lane, not old history

### 4. Reduce audit sprawl
The `docs/nutrition-audit/` folder should keep only durable reasoning worth preserving.
It should not behave like a second temporary workspace.

Good keep candidates:
- category summary
- sourcing policy
- production file shape
- cleanup roadmap

Likely archive/delete candidates later:
- temporary pass logs once their durable decisions are captured elsewhere
- older notes that mainly describe already-resolved decision branches

### 5. Prepare for repo-wide polish
Once nutrition docs are cleaned:
- normalize naming
- review duplicate root vs nested docs
- identify stale generated/supporting files
- simplify the mental model of the repo

## Immediate cleanup checklist

- [ ] keep `FOODRANKED-ENTRY-RULEBOOK.md` as the single-source future-entry rule doc
- [ ] update supporting docs to reference the rulebook instead of competing with it
- [ ] keep only one active raw chicken-thigh production draft
- [ ] clearly mark archived cooked references as non-canonical
- [x] identify which audit pass logs are durable and which should later be archived
- [x] archive the old `tmp-audit/` workspace to reduce active clutter while preserving history
- [ ] remove stale wording that still talks like identity decisions are unresolved when they are now locked

## Definition of cleanup success

Cleanup phase is succeeding when:
- future-you can find the current rulebook instantly
- the active production lane is obvious
- archived references are clearly non-active
- docs do not keep reopening already-made decisions
- the repo feels calmer and more professional
