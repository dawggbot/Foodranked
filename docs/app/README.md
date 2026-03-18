# FoodRanked Dashboard

Open:
- `docs/app/index.html`

Because the dashboard data is also emitted as `data/foods-index.js`, it should open directly in a browser without needing a local dev server.

If the data looks stale, regenerate it from the repo root:

```bash
node scripts/generate-dashboard-data.js
```

Main purpose of v1:
- browse foods
- filter by type/tier
- inspect score data
- preview display layout scenes
- test subtitle lift and macro bubble size quickly
