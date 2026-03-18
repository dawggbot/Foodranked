# Foodranked workflow automation research

## Goal
Build the fastest reliable pipeline from **food idea -> scored data -> script -> visual package -> subtitles -> rendered short -> upload pack** while keeping one clear human review gate before publishing.

## Recommendation in one line
Use the current repo as the single source of truth, add a small **manifest/state layer** on top of it, automate every deterministic transformation, and keep **final editorial review + platform upload approval** manual until the pipeline is stable.

## Best practical architecture

### 1. Source of truth
Keep these as the canonical project assets:
- `foods/*.sample.json` (later `foods/*.json`) -> structured food records
- `rulesets/*.json` -> versioned scoring logic
- `references/phrase-banks/*.json` -> narration voice building blocks
- `templates/visual-template.v1.json` -> visual layout contract
- `outputs/leaderboards/*.json` -> scored category outputs

Add one new layer:
- `episodes/manifest/*.json` -> one file per video job

Example manifest fields:
- `episodeId`
- `foodId`
- `foodType`
- `rulesetVersion`
- `scoreSnapshotPath`
- `scriptPath`
- `subtitlePath`
- `visualPlanPath`
- `thumbnailPath`
- `renderPath`
- `platformVariants`
- `status` (`idea`, `data-ready`, `scored`, `script-ready`, `review`, `rendered`, `scheduled`, `published`)
- `reviewNotes`
- `experimentTags`

That gives the project a real queue without changing the existing data model.

## Target pipeline

### Stage 1 — intake and food record prep
**Input:** candidate food list / backlog

Automate:
- generate a stub food file from a type template
- validate required metrics for the chosen ruleset
- flag missing fields before scoring

Human review:
- sanity-check approximations / source notes
- decide whether the food is representative enough for the category

### Stage 2 — scoring and leaderboard refresh
Automate:
- run scorer for the target food
- refresh category leaderboard + all-categories output
- write a per-food score snapshot into `episodes/generated/`
- optionally generate a category delta summary (`rank moved`, `new top 3`, etc.)

Human review:
- only intervene if a placement looks editorially broken

### Stage 3 — script generation
Automate:
- generate the structured script JSON from current food + ruleset + phrase banks
- generate plain-text narration from that JSON
- generate subtitle draft from narration lines
- produce a short “why this tier” summary for title/description notes

Human review:
- punch up hook / final line if needed
- trim any awkward phrasing

### Stage 4 — visual planning
Automate:
- map the script JSON onto the locked visual template slots
- assign reveal timing per section
- populate stat bars, pros/cons cards, verdict card, and subtitle chunks
- pull the correct sprite / food art path from an asset registry

Human review:
- check readability on mobile
- confirm no section runs too long

### Stage 5 — audio and subtitles
Automate:
- generate TTS draft audio
- force-align subtitles to the final audio
- output `.srt`, word-timing JSON, and per-line subtitle chunks for the renderer

Human review:
- listen once for pronunciation / pacing issues

### Stage 6 — render
Automate:
- assemble scene data for Remotion (or similar code renderer)
- render 9:16 master
- export platform-safe variants if needed:
  - YouTube Shorts
  - TikTok
  - Instagram Reels
  - Facebook Reels

Human review:
- visual QA pass only

### Stage 7 — publishing pack
Automate:
- generate upload filenames
- generate title variants
- generate caption/description variants
- generate hashtag set
- attach experiment tags to the episode manifest
- prepare upload checklist per platform

Human review:
- choose final packaging
- manual upload until posting patterns are stable

## Best tools for this repo

### Core orchestrator
Use **Node scripts** first.
Why:
- the repo is already script-first
- JSON in / JSON out fits the current structure
- easiest to keep deterministic and versioned

### Renderer
Best fit: **Remotion**
Why:
- code-driven motion and repeatable templates
- easy JSON-driven scene rendering
- good for a reusable stat-sheet / reveal system
- better long-term than assembling clips manually

### TTS + subtitles
Recommended flow:
- TTS draft: ElevenLabs or equivalent
- alignment: WhisperX / stable forced alignment tool
- outputs:
  - `audio/final.wav`
  - `subtitles/final.srt`
  - `subtitles/words.json`

### Upload automation
Short term:
- keep upload manual but generate structured upload packs

Later:
- YouTube API first
- platform automation for TikTok/IG/Facebook only after the render and review steps are stable

## Lean MVP automation plan

### MVP 1 — high ROI, low risk
Build these first:
1. `scripts/foodranked-validate-food.js`
2. `scripts/foodranked-generate-episode.js`
   - score food
   - write score snapshot
   - generate script JSON
   - generate plain narration text
   - create episode manifest
3. `scripts/foodranked-build-upload-pack.js`
   - titles
   - captions
   - tags
   - filenames
4. `episodes/manifest/*.json`
5. `episodes/generated/<food-id>/...`

This immediately removes a lot of repetitive work without needing a full renderer.

### MVP 2 — rendering pipeline
Add:
- Remotion project
- script-to-scene mapper
- subtitle timing ingestion
- one-click local render command

### MVP 3 — analytics loop
Add:
- `analytics/episodes.csv` or JSONL
- import platform metrics manually at first
- track:
  - hook variant
  - title variant
  - category
  - score tier
  - retention / views / likes / shares

That gives a feedback loop for content decisions without overbuilding.

## Suggested folder additions

```text
Foodranked/
  episodes/
    manifest/
    generated/
      <food-id>/
        score.json
        script.json
        narration.txt
        subtitles.srt
        visual-plan.json
        upload-pack.json
  assets/
    sprites/
    food-images/
  subtitles/
  audio/
  renders/
  analytics/
```

## State machine recommendation
Use a simple state machine per episode:
- `idea`
- `data-ready`
- `scored`
- `script-ready`
- `visual-ready`
- `audio-ready`
- `review`
- `rendered`
- `scheduled`
- `published`
- `archived`

This is enough to batch work overnight without losing track of where anything is.

## Bottlenecks to remove first
1. **Manual dataset entry** -> solved with typed stubs + validation
2. **Score/check loop** -> solved with automated leaderboard refresh
3. **Script drafting** -> already partly solved; extend it into episode manifests
4. **Subtitle timing** -> biggest production-time sink after visuals
5. **Render assembly** -> strongest long-term leverage point

## Best next implementation sequence
1. Add episode manifests and generated episode folders
2. Add a food validator script
3. Add a single `generate-episode` command
4. Add upload-pack generation
5. Add Remotion renderer
6. Add TTS + subtitle alignment step
7. Add analytics ingestion
8. Only then consider auto-posting

## What not to automate yet
Do **not** fully automate these first:
- public posting
- editorial approval
- final hook choice
- final cover/title decision

Those are still taste-heavy and are the easiest place for bad automation to damage the channel.

## Concrete recommendation
If only one thing gets built next, it should be:

**`scripts/foodranked-generate-episode.js`**

It should:
1. take a `foodId`
2. score the food
3. generate script JSON
4. generate narration text
5. write an episode manifest
6. write all outputs into `episodes/generated/<food-id>/`

That becomes the backbone for every later automation step.
