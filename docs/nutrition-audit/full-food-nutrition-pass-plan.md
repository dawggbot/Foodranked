# Full Food Nutrition Pass Plan

> Historical pass-planning note. Some decision branches in this file reflect earlier audit state and are preserved for history, not as the current source of truth.
> For the live future-entry rules, use `FOODRANKED-ENTRY-RULEBOOK.md`.

Date: 2026-04-03
Scope owner: foodranked-full-nutrition-pass subagent

## Summary

This document should now be read as a historical planning artifact rather than the live rule source.

I reviewed the required policy/docs, the pasted FoodRanked reference, relevant memory about FoodRanked preferences, the five current production drafts, and the matching representative sample files.

Core read-through conclusions:
- the current production lane is correctly aiming for identity-locked per-100g files with explicit provenance
- tomato is the cleanest near-finish draft
- oats and white rice are numerically finishable for standard USDA-backed nutrients, but both still have identity drift that should be resolved before calling them production-safe
- chicken thigh is still blocked by identity mismatch between the file name/claims and what the attached USDA row clearly supports
- yam is blocked first by canonical identity, and the current draft also had a JSON validity problem that should be fixed before further work

## 1) Recommended exact file scope for pass 1

### Primary pass-1 production files
1. `foods/production/tomato-red-raw-draft.json`
2. `foods/production/oats-rolled-dry-draft.json`
3. `foods/production/white-rice-long-grain-enriched-raw-draft.json`
4. `foods/production/chicken-thigh-raw-draft.json`
5. `foods/production/yam-true-yam-raw-draft.json`

### Representative sample files to keep in view during the pass
1. `foods/tomato.sample.json`
2. `foods/oats.sample.json`
3. `foods/white-rice.sample.json`
4. `foods/chicken-thigh.sample.json`
5. `foods/yam.sample.json`

### Pass-1 recommendation
Treat pass 1 as two lanes:
- **finish / tighten lane:** tomato, oats, white rice
- **identity-blocked lane:** chicken thigh, yam

That is the safest split because tomato/oats/white rice can be meaningfully hardened now, while chicken thigh and yam still need a clearer identity decision before broader data fill should continue.

## 2) Identity corrections needed before data fill

### Tomato
- Identity is mostly good: raw red ripe tomato.
- No major naming correction needed before data fill.
- Remaining work is evidence attachment and a few metric/provenance cleanups, not identity rescue.

### Oats
- Historical note: this section reflects the earlier identity-decision stage.
- Current canonical project direction is rolled oats.
- Remaining work is source-fit/citation hardening, not deciding what oats means.

### White rice
- Current file is now internally aligned to an **enriched long-grain raw/dry** identity.
- Sample lineage and older path history still reflect earlier unenriched drift.
- Before production-safe fill, decide whether the canonical project target is:
  - enriched long-grain white rice, raw/dry, or
  - some other white-rice form.
- If enriched long-grain is the keeper, keep the current identity and clean remaining stale notes.

### Chicken thigh
- Wholefood policy is now explicit: this should be a **raw chicken thigh** entry, not a cooked variation.
- Any cooked roasted/meat-only row should be treated only as research context, not the canonical wholefood baseline.
- Before more filling, attach a trustworthy raw chicken-thigh source row and reconcile the file to that exact identity.
- If the project later ranks a cooked chicken-thigh variant, it should be a separate intentional prepared-state entry.

### Yam
- Historical note: this section reflects the earlier identity-decision stage.
- Current canonical project direction is true yam.
- Remaining work is citation hardening and explicit labeling discipline, not deciding whether yam means sweet potato.

## 3) Metrics that can be USDA-backed now vs metrics likely to stay N/A

## USDA-backable now for the current exact identities
These are the safest metrics to fill from locked USDA rows when the file identity is genuinely settled:
- `kcal`
- `fat_g`
- `carb_g`
- `protein_g`
- `saturated_fat_g`
- `cholesterol_mg`
- `polyunsaturated_fat_g`
- `fibre_g`
- `sugar_g`
- most vitamin/mineral DV conversions already present in schema
- in some cases `omega3_mg` if explicitly derived from attached fatty-acid rows and documented conservatively

## USDA-backable now but still identity-sensitive
These should only be treated as settled after the exact food identity is locked:
- oats full nutrient panel
- white rice full nutrient panel
- chicken thigh full nutrient panel
- yam full nutrient panel

## Likely to remain `N/A` for now unless method policy changes or better sources are attached
- `collagen_g` for most current files, especially where exact cut/state sourcing is not explicit enough
- `bioavailability_percent`
- `essential_amino_acids_score`
- `nonessential_amino_acids_score`

## Usually external / extra-source metrics
- `glycemic_index` often needs a non-USDA source and must match form/preparation closely
- `starch_g` may be sourceable in some rows/datasets, but if not defensibly available for the exact identity it should stay `N/A`

## Food-by-food quick call
- **Tomato:** standard nutrients are mostly USDA-settable now; GI still needs outside support if kept numeric; amino-acid scores/bioavailability should stay `N/A`.
- **Oats:** standard nutrients are settable once the identity choice is resolved; GI should stay unresolved until the oats form is decided.
- **White rice:** standard nutrients are settable for the current enriched raw identity; GI still needs a form-specific external source and a project decision on whether enriched long-grain is the canonical target.
- **Chicken thigh:** standard nutrients should now be sourced against a raw canonical row, not the older cooked-roasted-meat-only research row.
- **Yam:** standard nutrients can be USDA-backed for the attached row and the project now treats true yam as the canonical baseline, but citation hardening is still needed.

## 4) Prioritized edit order

### Priority 1 — safe structural cleanup
1. Fix invalid JSON / malformed provenance in `foods/production/yam-true-yam-raw-draft.json`.
2. Remove stale or contradictory provenance notes in production drafts where the file content has already moved on.
3. Preserve explicit `N/A` handling for unsupported displayed metrics.

### Priority 2 — identity-first cleanup
1. Oats: improve source-fit and citation quality for the canonical rolled-oats entry.
2. Chicken thigh: lock a raw canonical row and remove cooked wholefood drift.
3. Yam: keep the chosen true-yam identity explicit and finish citation hardening.

### Priority 3 — numeric reconciliation
1. Tomato final nutrient/provenance tidy.
2. Oats nutrient reconciliation against the chosen exact row.
3. White rice nutrient/provenance tidy after canonical identity confirmation.
4. Chicken thigh only after identity fix.
5. Yam only after identity fix.

### Priority 4 — context-item evidence cleanup
- Keep pros/cons non-redundant with on-screen nutrition.
- Prefer food-specific compounds/real-world qualifiers where distinctive:
  - tomato → lycopene
  - oats → beta-glucans, avenanthramides, phytate caveat
  - white rice → refinement / digestibility context rather than repeated low fibre text everywhere
  - chicken thigh → protein quality / B12-zinc usefulness / preparation dependence
  - yam → only modest, conditional context until identity is settled

## 5) Blockers for GitHub cleanup / branch consolidation relevant to this pass

1. **Dirty working tree already present.** There are many modified and untracked files unrelated to this one report, so broad cleanup or branch surgery would be risky without review.
2. **White-rice file rename history is mid-transition.** Git status shows the old unenriched draft deleted and the enriched/raw draft added. That should be normalized deliberately in one cleanup step so Git history stays understandable.
3. **Only `master` exists locally right now.** There is no separate feature branch visible for isolating the nutrition hardening pass.
4. **Production drafts still contain identity-language drift.** Until oats/chicken/yam naming is stabilized, branch consolidation could freeze confusing filenames and make later review harder.
5. **Some docs are newly untracked.** The audit/policy docs supporting this pass appear not fully consolidated yet, so pushing before a quick repo hygiene check may create noisy review diffs.

## Conservative first-batch update plan

Safe first-batch edits are:
- fix the malformed yam production draft so it parses cleanly
- remove stale contradictory notes in production drafts that would mislead the next auditor
- avoid broad metric rewrites until each file's identity is confirmed

## First-batch updates completed

Completed conservatively:
- fixed malformed JSON in `foods/production/yam-true-yam-raw-draft.json` by removing the stray duplicate GI provenance fragment and normalizing the GI note to an explicit unsupported / N/A state
- corrected a small provenance-note typo in yam (`17%%` → `17%`)
- removed stale contradiction text in `foods/production/oats-rolled-dry-draft.json` so the notes now match the current generic-raw-oats numeric panel instead of referring to old mismatched values
- removed stale filename-language drift in `foods/production/white-rice-long-grain-enriched-raw-draft.json`
- raw wholefood chicken-thigh handling is now the intended direction; any older cooked roasted draft should be treated as superseded reference material rather than the active canonical lane

What I deliberately did **not** do in this batch:
- no broad nutrient rewrites
- no destructive renames
- no speculative GI/amino-acid/bioavailability fills
- no attempt to force chicken thigh or yam into production-safe status before the identity calls are made
