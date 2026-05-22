# Food Image Upload Trigger

Upload production food sprites here to start the GitHub Actions draft-video pipeline.

## Naming

- Use PNG files only for now.
- Name each file with the FoodRanked food id: `<food-id>.png`.
- The food id must already exist as `foods/<food-id>.sample.json`.

Example:

```text
production/inbox/food-image-uploads/bacon.png
```

## What The Trigger Does

When a PNG is pushed to this folder, the workflow:

1. copies it to `sprites/header/food_images/<food-id>.png`;
2. mirrors it to `docs/app/sprites/header/food_images/<food-id>.png` for the browser tools;
3. regenerates the compact episode output;
4. generates ElevenLabs narration audio with `config/elevenlabs-voice-settings.v1.json`;
5. mirrors the audio to `docs/audio/episodes/<food-id>/` so the video builder can preview it;
6. refreshes `docs/data/foods-index.json` and `docs/data/foods-index.js`.

The workflow requires a GitHub Actions secret named `ELEVENLABS_API_KEY`.
