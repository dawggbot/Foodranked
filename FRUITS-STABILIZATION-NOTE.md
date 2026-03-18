# FRUITS-STABILIZATION-NOTE

Quick correction after leaderboard export exposed a fruit-category collision:

- **Problem:** widening the `C` tier to rescue grapes also pulled dates out of D.
- **Decision:** keep the softer threshold map, but make dates explicitly more negative through context authoring.
- **Reason:** dates are not just another sugary whole fruit; their dried, concentrated form is part of why they should remain a weaker fruit-category fit than grapes.

## Result we want
- Raspberries → S
- Banana → B
- Grapes → C
- Dates → D
