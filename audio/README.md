# Audio Assets

This is the source folder for reusable FoodRanked audio assets, similar to `sprites/` for reusable visual assets.

## Folders

- `sfx/` - reusable special effects sounds for video moments
- `music/` - reusable music beds, loops, and stingers
- `narration/` - notes and reusable narration references

## Generated Narration Homes

Generated episode narration already has two homes:

- production source: `production/episodes/<food-id>/voice/`
- browser-preview mirror: `docs/audio/episodes/<food-id>/`

Do not manually move generated ElevenLabs takes into this top-level folder. Use this folder for reusable authored audio assets and notes; generated per-episode voiceover should stay with the episode.

## Browser Preview

Files that the GitHub Pages video builder must load should be mirrored under `docs/audio/`.

For example:

- source SFX: `audio/sfx/stamps/heavy-stamp-01.wav`
- docs mirror: `docs/audio/sfx/stamps/heavy-stamp-01.wav`

Keep filenames lowercase with hyphens, and prefer short descriptive names.
