# Foodranked Nutrition Audit Log — 2026-04-02

## Scope
Meticulous audit of the nutrition/scoring/data side of the Foodranked workspace, with conservative changes only.

## Startup context checked
- Read `SOUL.md`
- Read `USER.md`
- Read `memory/2026-04-01.md`
- Read `skills/nutrition-scoring-engineer/SKILL.md`

## Inventory covered so far
### Core docs
- `references/FoodRanked-blueprint.md`
- `RULESET-SCHEMA.md`
- `RULESET-JSON-SHAPE.md`
- `VIDEO-FORMAT.md`
- `TEST-PACK.md`
- `TEST-PACK-OVERVIEW.md`

### Scoring/data implementation
- `scripts/foodranked-scorer.js`
- `rulesets/nuts.v1.json`
- `rulesets/grains.v1.json`
- `rulesets/meats.v1.json`
- `foods/almonds.sample.json`
- `foods/oats.sample.json`
- `foods/chicken-thigh.sample.json`

### Additional nutrition audit material discovered later
- `tmp-audit/MASTER-NUTRITION-AUDIT-CHECKLIST.md`
- `tmp-audit/GRAINS-AUDIT.md`
- `tmp-audit/OATS-AUDIT.md`
- `tmp-audit/TUBERS-AUDIT.md`
- `tmp-audit/VEGETABLES-AUDIT.md`
- `tmp-audit/TOMATO-AUDIT.md`
- `tmp-audit/WHITE-RICE-AUDIT.md`
- `tmp-audit/rulesets/grains.v1.json`
- `tmp-audit/rulesets/tubers.v1.json`
- `tmp-audit/rulesets/vegetables.v1.json`

## Constraints / auditability notes
- I was able to inspect the known nutrition/scoring docs and files directly.
- Full shell-based tree inventory was blocked by exec approval requirements in this subagent context, so this audit is exhaustive for the discovered nutrition backbone files but not a guaranteed whole-repo tree listing.
- Because of that, any delete recommendations must remain conservative and limited to clearly identified placeholders/clutter in the inspected scoring pack.

## Initial findings
1. **Rulesets are not tailored enough at the section-weight level.**
   - The blueprint strongly says food types should be recognized for what they are strong in.
   - But the three JSON rulesets all used the same generic section weights.
   - That makes categories look tailored at the metric level while still behaving generically at aggregation time.

2. **Fallback scoring is too loose for professional use.**
   - `scripts/foodranked-scorer.js` allows a generic `metricBandFallback()`.
   - For nutrition metrics with wildly different units/ranges, generic 1–5 fallback bands are not defensible.
   - This risks silently producing nonsense instead of surfacing incomplete rules.

3. **Context-item scoring can drift away from policy.**
   - The scorer currently trusts `scoreValue` stored inside each context item.
   - But rulesets already define `scoreMap` by impact class.
   - This opens the door to inconsistent values like `major` items scoring `3` in one file and `2` in another.

4. **Sample-food context coverage is uneven.**
   - Almonds and chicken thigh are acceptable but still test-pack-like.
   - Oats had several zero-score placeholder-ish context items and one `major` pro scoring outside the ruleset policy.

5. **Docs correctly say the pack is placeholder-oriented, but implementation was permissive enough to let placeholders look production-like.**
   - That is dangerous if later files get mistaken for canonical truth.

## Audit plan
1. Create this running log.
2. Tighten scorer validation so incomplete rules/data fail loudly instead of scoring vaguely.
3. Make section weights genuinely category-specific for current implemented rulesets.
4. Normalize context scoring to ruleset policy.
5. Improve sample context-item coverage to be more food-specific and non-redundant.
6. Update test-pack documentation to clearly distinguish test scaffolding from production nutrition truth.
7. Summarize remaining risks, especially around placeholder nutrient sourcing and unimplemented categories.

## Change log
### 2026-04-02 — pass 1 completed
- Tightened `scripts/foodranked-scorer.js` so scored `arrow_bands` metrics must have explicit bands.
- Removed the generic silent fallback behaviour that could create indefensible scores.
- Added stricter context-item validation so pros/cons must match `contextRules.scoreMap` by impact level.
- Tailored section weights for `nuts`, `grains`, and `meats` so category aggregation now matches the blueprint philosophy more honestly.
- Added explicit missing band ladders to the current grains/meats rulesets where the scorer would otherwise be forced to guess.
- Upgraded sample context items:
  - oats: replaced placeholder-ish/zero-value context items with beta-glucans, avenanthramides, processing/GI caveat, and topping-pattern caveat
  - almonds: made pros more food-specific and less generic
  - chicken thigh: added heme-style absorbability context instead of a generic flexibility point
- Updated `TEST-PACK.md` and `TEST-PACK-OVERVIEW.md` to make the placeholder status and strict-audit stance clearer.

## Current judgment by area
### Rulesets
- `nuts.v1.json`: better aligned after section-weight fix, but still only a draft starter and still missing full peer pressure-testing.
- `grains.v1.json`: materially better; previously too generic in both weights and implicit fallback dependence.
- `meats.v1.json`: materially better; carbs are now truly zero-weight at the section level, which is much more honest for meats.

### Tier confidence
- Current tier thresholds remain generic global starter thresholds.
- I did **not** treat current sample tiers as production-safe.
- The main unresolved issue is not code correctness anymore; it is lack of broad peer-food calibration inside each category.

### Data confidence
- Sample foods are still explicitly placeholders.
- Context quality is improved, but canonical sourcing work is still required before calling any nutrition values “spot on”.

## Conservative keep / change / remove recommendations
### Keep
- `RULESET-SCHEMA.md`, `RULESET-JSON-SHAPE.md`, `VIDEO-FORMAT.md`: solid foundation docs.
- `scripts/foodranked-scorer.js`: worth keeping after the strictness upgrade.
- `rulesets/*.v1.json`: keep as audited draft rulesets, not final policy.
- `foods/*.sample.json`: keep only as sample/test fixtures.

### Change
- Any future production food file should drop `.sample` naming and carry explicit source provenance.
- Remaining unimplemented categories should not reuse generic section weights.
- Tier thresholds should eventually be recalibrated with broad in-category comparison sets.

### Remove
- `tmp-audit/` should be treated as staging material, not source-of-truth project structure.
- Recommend either:
  1. move the worthwhile audit notes into a proper permanent docs location such as `docs/nutrition-audit/`, then remove `tmp-audit/`; or
  2. if this material is superseded, delete `tmp-audit/` outright.
- Reason: it currently contains duplicate rulesets and scattered audit drafts that could easily diverge from the real `rulesets/` directory and confuse future edits.
- I did not delete it automatically because the notes themselves contain useful thinking and may still be wanted.

## Late-pass findings from `tmp-audit/`
1. `tmp-audit/` contains genuinely useful nutrition reasoning, especially around tubers, vegetables, oats, tomato, and white rice.
2. But it also contains **duplicate draft rulesets** whose policy differs materially from the active rulesets.
   - Example: `tmp-audit/rulesets/grains.v1.json` uses a radically different weighting model and a context policy where only majors score.
   - If left lying around, this is a classic future-confusion trap.
3. The tmp audit notes reinforce the same conclusion as the code pass:
   - identity lock matters a lot (raw vs cooked vs processed form)
   - food-specific compounds should drive pros/cons, not generic filler
   - white rice, tomato, yam, zucchini, and turnip all need more careful food-specific treatment before database confidence is high
4. These notes are valuable as audit working papers, but they should not stay in an ambiguous temporary folder long-term.

## 2026-04-02 — pass 2 expansion

### Expanded inventory findings
Additional directly inspected files in this pass:
- `foods/chicken-thigh.sample.json`
- `tmp-audit/MASTER-NUTRITION-AUDIT-CHECKLIST.md`
- `tmp-audit/GRAINS-AUDIT.md`
- `tmp-audit/OATS-AUDIT.md`
- `tmp-audit/TUBERS-AUDIT.md`
- `tmp-audit/VEGETABLES-AUDIT.md`
- `tmp-audit/TOMATO-AUDIT.md`
- `tmp-audit/WHITE-RICE-AUDIT.md`
- `tmp-audit/rulesets/tubers.v1.json`
- `tmp-audit/rulesets/vegetables.v1.json`

### Broader second-pass findings
1. **The temporary audit material is more valuable than it first looked.**
   - It contains usable category philosophy and food-specific rewrite guidance.
   - The problem is not that it is bad; the problem is that it is stranded in a temp folder where it can silently diverge.

2. **Two additional category rulesets were effectively hiding in staging.**
   - Tubers and vegetables already had strong draft ruleset work.
   - Keeping them only under `tmp-audit/rulesets/` made the main ruleset set look less complete than it actually is.

3. **The docs had visible text corruption / duplication artifacts.**
   - `RULESET-SCHEMA.md` had duplicated tail fragments in the open-questions section.
   - `RULESET-JSON-SHAPE.md` had a duplicated implementation-note tail.
   - This is small, but it undermines trust in a system that is supposed to feel audit-clean.

4. **Production safety is still blocked much more by provenance and identity control than by raw code shape.**
   - The scorer is now reasonably strict for the inspected v1 pack.
   - The bigger unresolved gap is still: exact food form, exact source row, and evidence-backed context-item phrasing.

5. **Several context-item patterns remain too editorial for hard nutrition claims.**
   - Chicken thigh includes a sourcing/ethics line that may be valid as editorial context but is not a nutrition-specific scoring strength.
   - Almonds and oats are better than before, but many context items still rely on general manual phrasing rather than provenance-linked evidence notes.

### Additional changes made in pass 2
- Promoted draft tuber ruleset into the main ruleset pack as `rulesets/tubers.v1.json`.
- Promoted draft vegetable ruleset into the main ruleset pack as `rulesets/vegetables.v1.json`.
- Adapted those promoted rulesets to the current main scorer conventions:
  - explicit `pros` / `cons` section weights
  - standard `contextRules.scoreMap` aligned with the active strict scorer
  - retained draft status
- Cleaned corruption/duplication in:
  - `RULESET-SCHEMA.md`
  - `RULESET-JSON-SHAPE.md`
- Strengthened provenance expectations in the docs.
- Added `PRODUCTION-SAFETY-BLOCKERS.md` to explicitly separate safe scaffolding language from unsafe production claims.

### Keep / bin / change decisions from discovered files and directories
#### Keep
- `rulesets/nuts.v1.json`
- `rulesets/grains.v1.json`
- `rulesets/meats.v1.json`
- `rulesets/tubers.v1.json`
- `rulesets/vegetables.v1.json`
- `scripts/foodranked-scorer.js`
- `RULESET-SCHEMA.md`
- `RULESET-JSON-SHAPE.md`
- `TEST-PACK.md`
- `TEST-PACK-OVERVIEW.md`
- `FOODRANKED-NUTRITION-AUDIT-2026-04-02.md`
- `PRODUCTION-SAFETY-BLOCKERS.md`

#### Keep, but clearly as sample/test fixtures only
- `foods/almonds.sample.json`
- `foods/oats.sample.json`
- `foods/chicken-thigh.sample.json`

#### Keep as working papers, but relocate or formalize soon
- `tmp-audit/MASTER-NUTRITION-AUDIT-CHECKLIST.md`
- `tmp-audit/GRAINS-AUDIT.md`
- `tmp-audit/OATS-AUDIT.md`
- `tmp-audit/TUBERS-AUDIT.md`
- `tmp-audit/VEGETABLES-AUDIT.md`
- `tmp-audit/TOMATO-AUDIT.md`
- `tmp-audit/WHITE-RICE-AUDIT.md`
- Initial permanent migration created under:
  - `docs/nutrition-audit/README.md`
  - `docs/nutrition-audit/category-audit-summary.md`

#### Bin or archive after migration
- `tmp-audit/rulesets/`
  - Reason: duplicate ruleset policy in a temp directory is a future-maintenance trap.
  - Best outcome: keep the notes, but remove or archive duplicate draft JSONs once the main `rulesets/` directory is the obvious source of truth.

### What still blocks production-safe nutrition claims
See also `PRODUCTION-SAFETY-BLOCKERS.md`, but the short version is:
1. sample foods still use approximate placeholder values
2. production provenance fields are not attached to live food files
3. multiple foods still lack identity lock on exact form/variant/preparation basis
4. tier thresholds are not yet peer-calibrated at category scale
5. context items are not yet sufficiently evidence-linked for strong claims
6. this pass could not run shell inventory or scorer regression commands because `exec` required approval in this subagent context

### File change summary for this pass
#### Changed
- `FOODRANKED-NUTRITION-AUDIT-2026-04-02.md`
- `RULESET-SCHEMA.md`
- `RULESET-JSON-SHAPE.md`

#### Added
- `rulesets/tubers.v1.json`
- `rulesets/vegetables.v1.json`
- `PRODUCTION-SAFETY-BLOCKERS.md`

#### Removed
- none

### 2026-04-02 — pass 3 documentation cleanup
- Created a permanent docs home for nutrition audit reasoning under `docs/nutrition-audit/`.
- Migrated the highest-value temporary audit reasoning into a durable category summary.
- This reduces the risk that `tmp-audit/` becomes a shadow policy area while preserving useful nutrition judgment notes.
- Remaining cleanup target: duplicate ruleset JSONs under `tmp-audit/rulesets/` should be archived or removed once the main `rulesets/` directory is accepted as canonical.

### Git / commit / push status
- The approved shell inventory command later completed successfully and revealed that the workspace git state is currently dominated by untracked content rather than a clean tracked repo delta.
- Observed `git status --short` output included many top-level untracked paths such as:
  - `SCHEMA.md`
  - `TEST-PACK-OVERVIEW.md`
  - `TEST-PACK.md`
  - `VIDEO-FORMAT.md`
  - `foods/`
  - `references/`
  - `rulesets/`
  - `scripts/`
  - `skills/`
  - `tmp-audit/`
  - several `memory/*.md` files
- That means a coherent nutrition-only commit is **not** safely pushable from this pass without first deciding repo intent:
  - whether this workspace is meant to be committed as a whole
  - whether untracked files should be selectively added
  - whether memory/personal notes must stay out of git
- I still did not run `git add`, `git commit`, or `git push` here.
- Exact blocker now stated more precisely: the repo appears to be mostly untracked from git's perspective, so creating a safe focused commit would require an intentional staging decision rather than an automatic commit.
