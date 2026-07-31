---
name: "foodranked-script-writer"
description: "Require FoodRanked scripts to follow completed nutritional profiles and Nutrition Geek audit signals."
---

# Proposed Update: Nutrition Profile First Script Writing

Add this section to the FoodRanked `foodranked-script-writer` skill near Canonical Sources or Manual Writing Workflow.

## Nutrition Profile First

- Before writing or regenerating a script, treat the completed `foods/<food>.sample.json` nutrition profile and generated scorer output as the source of truth.
- If the `nutrition-geek` workflow has produced an audit or profile update, read that result before choosing section callouts, pros/cons, or closing use cases.
- Do not write generic category narration when the profile has source-backed standout facts, expected-vs-unusual signals, or named food compounds that better explain the food.
- In each macro, vitamin, and mineral section, prefer callouts that match the food's actual profile: food-type-important nutrients first, then the strongest/weakest defensible marks, then unusual highs/lows for that food type.
- After each selected submacro or micronutrient mention, include one short useful-context beat: what it helps or hurts, and whether the amount is expected, unusually strong, unusually weak, or just a small background detail for that food type.
- Keep `Vitamin B12` exact when using `vitamin_b12_dv`; never shorten it to generic `Vitamin B` in narration, subtitles, or display copy.
- Pros and cons must be chosen after section callouts are known. Reject pros/cons that recap already-visible macro, submacro, vitamin, or mineral facts unless they add a separate angle such as absorbability, named compound context, processing burden, preparation, tolerance, sourcing, storage, or meal role.
- Closing summaries should connect use cases to profile evidence, not vibes: carbs/starch/GI to energy, protein/EAA/bioavailability to muscles/strength sports, fibre or fermentation to digestion, minerals/vitamins to bone/immune/fluid/blood support, and food-role context to practical meals or cooking use.

## Food Entry Dependency Check

Before finalising a script, check:

1. The source nutrition profile has no unexplained placeholder values for sections being narrated.
2. `metricProvenance` explains any `N/A`, estimate, or source-backed value that affects narration.
3. The selected section callouts are not merely the first visible rows; they are the most relevant, outstanding, or unusual defensible facts.
4. Exactly 3 pros and exactly 3 cons remain, and none simply repeats the section narration.
5. Any existing split audio is marked stale or regenerated when script text changes.
