---
name: "nutrition-scoring-engineer"
description: "Guard source-backed nutrition fields, labelled estimates, N/A decisions, and exact metric identities."
---

# Proposed Update: Nutrition Field Completion Guardrails

Add this section to the FoodRanked `nutrition-scoring-engineer` skill.

## Nutrition Field Completion Guardrails

When food entries are filled or refreshed:

- Keep canonical source nutrition separate from derived display/scoring outputs.
- Source metrics in `foods/*.sample.json` must be source-backed, DV-derived from a source-backed amount, or explicitly labelled as a defensible estimate in `metricProvenance`.
- Use `null` for any metric that is not defensibly sourceable for the exact food identity. Do not fill zeros unless zero is chemically/identity-backed or directly source-backed.
- Do not write presentation-only protein defaults or display estimates back into source metrics as facts.
- Derive EAA/NEAA only from source-backed amino-acid rows and the FoodRanked amino-acid thresholds; do not use old aggregate proxies.
- Derive collagen only from source-backed hydroxyproline or a clearly documented, narrow meat-category method. If the basis is not defensible, keep `collagen_g` null and let display policy handle presentation.
- For vitamins and minerals, store DV percentages for the canonical FoodRanked metrics and let scoring use `floor(DV% / 10)`, capped at `10`.
- Keep the v1 B-vitamin identity exact: `vitamin_b12_dv` means Vitamin B12, not generic Vitamin B or B-complex.
- Pros/cons quality affects scoring and must not be section recap. Context items should have a separate angle such as processing burden, named compounds, anti-nutrients, absorbability, tolerance, sourcing, storage, preparation, meal role, or culinary role.

## Review Before Scoring

Before accepting a refreshed food entry:

1. Check each filled metric has provenance.
2. Check each `null`/`N/A` has a reason when it affects display or scoring.
3. Check estimates are labelled and not treated as source-backed facts.
4. Run the scorer and data-quality audit.
5. Confirm no locked finalisation sample was changed unless James explicitly included it.
