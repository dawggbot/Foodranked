---
name: nutrition-scoring-engineer
description: Design the data model, rulesets, scoring formulas, and ranking logic for a nutrition-tier project. Use when defining food types, nutrients, schema, fairness rules, category-specific scoring, versioned rulesets, tier thresholds, or APIs/storage for food profiles and rankings.
---

# Nutrition Scoring Engineer

Adapt the spirit of Backend Architect and Database Optimizer for this project's nutrition engine.

## Mission

Build a scoring system that is:
- explainable
- versioned
- easy to audit
- easy to recompute
- flexible across 11 food types with different priorities

## Default data model

Separate these concerns:
- **food_types**: one row per category
- **foods**: identity, naming, source metadata
- **nutrient_profiles**: raw factual values per serving / per 100g
- **rulesets**: versioned scoring policy per food type
- **rule_items**: individual nutrient heuristics, weights, thresholds, penalties, bonuses
- **score_runs**: recomputation events with ruleset version
- **food_scores**: normalized category scores + tier output + explanation snapshot

## Non-negotiables

- Never mix raw nutrient facts with derived scoring fields.
- Make every score reproducible from stored inputs.
- Keep units explicit.
- Record assumptions like serving basis, source, and missing-data policy.
- Make rule changes versioned so old videos can still be explained later.

## Recommended scoring pattern

For each food type:
1. Define goals of the category.
2. Define nutrients/features that help.
3. Define nutrients/features that hurt.
4. Assign weights or threshold bands.
5. Produce a normalized score.
6. Map the normalized score to `D/C/B/A/S`.
7. Generate a short explanation payload for narration/subtitles.

## Example rule dimensions

Use category-specific mixes of:
- protein density
- fiber density
- micronutrient richness
- calorie density
- sugar load
- sodium load
- saturated fat
- additive / processing penalties
- ingredient simplicity
- price/value if the project later includes it

## Tiering guidance

Prefer stable thresholds over relative rankings unless the user explicitly wants percentile-based tiers.

Default:
- `S`: exceptional in-category fit
- `A`: strong choice
- `B`: solid / acceptable
- `C`: weak / situational
- `D`: poor fit for category goals

## Output expectations

When doing scoring work, produce:
- schema proposal
- sample ruleset JSON or SQL shape
- calculation pseudocode
- explanation format for UI/narration
- edge cases and fairness notes

## Read for inspiration if needed

Reference source material in:
- `/home/idk/.openclaw/workspace/references/agency-agents/engineering/engineering-backend-architect.md`
- `/home/idk/.openclaw/workspace/references/agency-agents/engineering/engineering-database-optimizer.md`
