# Dashboard Troubleshoot Notes

## What was fixed in this pass

- Reworked the preview app so the display is driven more directly by each food type's ruleset.
- Header food-type sprites were enlarged and kept pixelated instead of being scaled in a blurry way.
- Macro scenes now support 4 submetric cards with fill bars and ruleset-based arrow labels.
- Vitamin and mineral scenes now render the full ruleset bar sets instead of just two hardcoded items.
- Micronutrient bars always keep the full bar shell visible, even when the value is 0.
- Vitamin/mineral displays now show DV% only in the preview layer, not mg/mcg amounts.
- Removed section-title dependence from the phone preview so the template structure can be judged without that extra chip.
- Pros and cons now render with separate cards/layout treatment instead of sharing the same broken output path.
- Food-type palette accents now also drive the kcal plate and some supporting small elements.
- Dashboard data generation now includes a ruleset summary per food so the static app can render ruleset-aware previews without a server.

## Current practical notes

- The dashboard is still a static browser app. Regenerate `docs/app/data/*` after changing episode outputs or rulesets:

```bash
node scripts/generate-dashboard-data.js
```

- Open directly in a browser:

```text
docs/app/index.html
```

## Known follow-up territory

- The preview still uses the repo's current metric model, so if a food has sparse category metrics the 4-card macro layout may show fewer cards.
- Some foods still need more editorial tuning in the narration layer even after the generator update; the generator is improved, but not yet a final human polish pass for every single outlier.
