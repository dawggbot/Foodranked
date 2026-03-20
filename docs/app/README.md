# FoodRanked Dashboard

Open:
- `docs/app/index.html`

Because the dashboard data is also emitted as `data/foods-index.js`, it opens directly in a browser without a local dev server.

If the data looks stale, regenerate it from the repo root:

```bash
node scripts/generate-dashboard-data.js
```

Main purpose of the current dashboard pass:
- browse foods
- filter by type/tier
- inspect score + script data
- preview the current vertical display template
- test structure-first layout decisions before polishing aesthetics
- verify larger food-type sprites, ruleset-driven macro bars, full micro bar graphs, and separate pros/cons sections
- verify vitamin and mineral sprites render without bubble/box chrome
- verify submacros use bullet rows plus arrow sprites, with repeated arrows for stronger bands
- verify pros/cons stay as bullet points with major/minor labels

The preview app now expects dashboard data to include a compact ruleset summary for each food so the static display can render per-category arrow labels and DV bar ranges.
