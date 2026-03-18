# Production

This folder is the working production layer for turning generated episode packages into real videos.

## Structure

- `episodes/<food-id>/briefs/` — episode-specific written briefs and notes
- `episodes/<food-id>/storyboards/` — storyboard docs or images
- `episodes/<food-id>/subtitles/` — subtitle working files / overrides
- `episodes/<food-id>/voice/` — narration scripts, TTS exports, timing notes
- `episodes/<food-id>/edits/` — editor project files or assembly notes
- `episodes/<food-id>/exports/` — final rendered outputs for that episode
- `templates/` — reusable production-side templates
- `queues/` — work queues, review queues, publishing queues

## Rule

- `outputs/episodes/` = generated system output
- `production/episodes/` = human production workspace
- `exports/` = platform-ready deliverables

That separation keeps machine output, working files, and final exports clean.
