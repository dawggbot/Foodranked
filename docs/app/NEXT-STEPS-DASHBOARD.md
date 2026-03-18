# Next Steps After Dashboard Stabilization

Now that the dashboard is working and food data is visible again, the next best project step is to turn it into a safer layout sandbox instead of adding lots of new styling at once.

## Priority order

1. **Keep sprite-backed macro preview stable**
   - real macro GIFs should load consistently from `docs/app/assets/`
   - avoid breaking data loading while changing visuals

2. **Add safe live layout controls**
   - macro bubble X/Y
   - macro headline size
   - subtitle box Y offset
   - verdict stamp scale

3. **Expose scene-specific notes in the UI**
   - so you can tell what each preview scene is trying to communicate

4. **Later: more sprite-driven visual tuning**
   - only after more Aseprite assets exist

## Why this is the best next step

The project now has:
- food data
- rulesets
- episode packages
- visual production docs
- a working browser preview

The highest leverage move is making the preview easier to tune without breaking it.

That gives a stable base for all future visual iteration.
