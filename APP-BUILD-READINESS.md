# FoodRanked App Build Readiness

## Objective

Build one FoodRanked Studio app that contains the current production workflow end to end:

- food database and finalisation state
- current Layout Builder layout editing
- DBv2 display layout proofing
- VBv2 video preview and render/export
- nutrition research and scoring
- script, narration, subtitle, and asset workflows
- social media publishing packs, scheduling, and analytics

The app should make GitHub useful for versioning and deployment, but not essential to the integrity of the project. FoodRanked state, assets, render jobs, and publishing status should live inside the app's own database and media store.

## Current Active Tools

Only these four browser tools are active workflow surfaces:

1. `docs/database/`
   - Shared food and universal UI database.
   - Current storage: browser `localStorage` key `foodranked-production-database-v1`.
   - Feeds DBv2 and VBv2 through `docs/app/foodranked-database.js`.

2. `docs/layout-builder/`
   - Current layout editor for the DBv2/VBv2 canvas.
   - Current storage: browser `localStorage` keys `foodranked-layout-builder-v4`, `foodranked-layout-builder-food-layouts-v1`, and `foodranked-layout-builder-sprite-layouts-v1`.
   - DBv2 prefers the saved layout named `test`.

3. `docs/display-builder-v2/`
   - Applies the selected food's sprites, text, nutrition values, and section content into the current DBv2 layout.
   - Exports rendered placement to `localStorage` key `foodranked-display-builder-v2-placement-layouts-v1`.

4. `docs/video-builder-v2/`
   - Reads DBv2 placement only.
   - Adds timing, narration, subtitles, SFX, VFX, highlights, preview, and render/export behavior.

The intended chain is:

```text
Database + Layout Builder -> DBv2 rendered placement -> VBv2 video preview/render
```

## Current Limits To Remove

- Browser `localStorage` is the real state layer, so different browsers/sessions can disagree.
- MP4 render jobs must be seeded with the current Layout Builder keys and a fresh DBv2 placement export.
- GitHub/repo files are still the practical asset and output carrier.
- MP4 rendering is a helper script instead of an app-managed job queue.
- Uploads, TTS, alignment, publishing packs, and analytics are script-driven, not app-driven.
- API keys and secrets do not have an app-owned vault/settings surface yet.
- There is no app-level validation gate for food data, placement, scripts, audio, video, and publishing status.

## Recommended App Shape

Build `FoodRanked Studio` as a local-first web app with a backend API.

Recommended first implementation:

- Node/TypeScript backend.
- SQLite for local-first development, with a clean path to Postgres later.
- Managed media folder or object-store abstraction for sprites, audio, proofs, renders, thumbnails, exports, and source uploads.
- Existing browser tools reused initially as modules/views, then refactored behind shared services.
- Playwright/FFmpeg render workers behind app render-job endpoints.

Initial local app entry point:

```bash
npm run studio
```

Default URL:

```text
http://127.0.0.1:4787/
```

Initial desktop app entry point:

```bash
npm run desktop
```

Windows packaging target:

```bash
npm run dist:win
```

For a complete Windows render bundle, build on Windows or run the manual GitHub
Actions workflow `Build FoodRanked Studio Windows`; that path installs the Windows
Playwright Chromium runtime before packaging.

## Core App Modules

- Dashboard: queue, next actions, broken states, finalised status, render status.
- Food Library: food entries, metrics, provenance, source notes, finalised/downloaded state.
- Nutrition Research: USDA/Open Food Facts lookup, outside research notes, estimates, missing-field warnings.
- Scoring: ruleset validation, section scores, tier explanations, score deltas.
- Layout Studio: current DBv2 layout behavior as the layout editor.
- Display Proof: DBv2 behavior as a proof panel.
- Video Studio: VBv2 behavior as preview, timeline, narration, subtitles, VFX, and render controls.
- Asset Library: sprites, food images, SFX, music, voice takes, video renders, usage refs.
- Episode Pipeline: idea -> data -> scored -> script -> audio -> aligned subtitles -> proof -> render -> upload pack -> scheduled -> published.
- Publishing: platform-specific titles, descriptions, hashtags, thumbnails, schedules, approvals, and upload status.
- Analytics: post performance import, retention notes, hook/title experiment tags.
- Settings: API keys, voice profiles, render profiles, platform accounts, backups.

## Backend API Surface

Start with these endpoints:

```text
GET/POST /api/foods
GET/PATCH /api/foods/:foodId
POST /api/foods/:foodId/score
POST /api/foods/:foodId/research

GET/POST /api/assets
POST /api/assets/upload
GET /api/assets/:assetId

GET/POST /api/layouts
PATCH /api/layouts/:layoutId
POST /api/layouts/:layoutId/export-placement

GET/POST /api/episodes
GET/PATCH /api/episodes/:episodeId
POST /api/episodes/:episodeId/script
POST /api/episodes/:episodeId/voice
POST /api/episodes/:episodeId/align-subtitles

POST /api/render-jobs
GET /api/render-jobs/:jobId
GET /api/render-jobs/:jobId/artifacts

POST /api/publishing-packs
GET/PATCH /api/publishing-packs/:packId
POST /api/social-posts
GET/PATCH /api/social-posts/:postId

GET/PATCH /api/settings
POST /api/backups/export
POST /api/backups/import
```

## Data Models To Promote From Browser State

- `FoodEntry`
- `NutritionSource`
- `MetricProvenance`
- `Ruleset`
- `ScoreSnapshot`
- `LayoutTemplate`
- `PlacementExport`
- `Asset`
- `Episode`
- `ScriptDraft`
- `AudioTake`
- `SubtitleAlignment`
- `RenderJob`
- `RenderArtifact`
- `PublishingPack`
- `SocialPost`
- `AnalyticsSnapshot`
- `AuditLog`

## Skills Needed

Use these current FoodRanked skills during the app build:

- `nutrition-content-studio`: app workflow and cross-layer coordination.
- `nutrition-workflow-automator`: episode pipeline, render jobs, proofing, upload packs, and status queues.
- `nutrition-scoring-engineer`: scoring, source-backed data, validation, estimates, and provenance.
- `nutrition-pixel-ui-director`: canvas/layout safety so the app does not move good sprites/text by accident.
- `nutrition-content-strategist`: publishing packs, title/hook experiments, and analytics feedback loops.

Before broad nutrition refresh work, finish/apply the pending nutrition workflow ideas for:

- `nutrition-geek`
- `foodranked-script-writer`
- scoring workflow updates
- workflow automation updates

Do not use those pending skill changes to rewrite the approved 11 samples unless James explicitly asks.

## Plugins And External Services

No plugin is essential for the first app build because the repo and local filesystem are accessible here.

Useful optional plugins:

- GitHub: useful for issue/PR/release management, but should not be required for app integrity.
- Figma: useful only if James wants a proper design file or visual spec before UI build.
- Google Drive or Notion: useful only if backlog notes, research notes, or media assets live there and need importing.

External app integrations to plan for later:

- USDA FoodData Central API for nutrition lookup.
- Open Food Facts for packaged foods.
- ElevenLabs or equivalent TTS provider.
- YouTube Data API for Shorts upload/scheduling.
- Meta Graph API for Instagram/Facebook publishing where account permissions allow it.
- TikTok developer APIs where available for the account/use case.

Keep all external tokens in app settings/secrets, never in committed files.

## Essential Features Not To Miss

- State migrations and schema versioning.
- Full import/export backup.
- Asset deduping, file checksums, and broken-reference repair.
- Source/provenance visibility for nutrition fields.
- Validation gates before finalising, rendering, and publishing.
- Review/approval states for data, script, audio, visual proof, render, and upload pack.
- Render-job queue with progress, logs, retries, and artifact links.
- Exact proof/render parity: the same placement payload must feed web proof and MP4.
- Platform-specific safe zones, captions, durations, and export presets.
- Secrets management for API keys and platform accounts.
- Audit log for who/what changed food data, layouts, assets, scripts, and publishing status.
- Analytics import and experiment tracking.
- Local backup/restore so the project survives without GitHub.

## Build Sequence

1. Freeze the current contracts.
   - Preserve the four active tools and their current visual behavior.
   - Document the browser storage keys and output payloads.

2. Create the app backend.
   - Add database schema, media store, API routes, migrations, and backup/export.
   - Import current food data, assets, layout state, DBv2 placement, and VBv2 episode state.

3. Wrap the existing tools inside one shell.
   - Use shared navigation, selected food, selected episode, and app API state.
   - Keep visual canvas behavior unchanged during the first merge.

4. Replace `localStorage` handoffs with API-backed state.
   - DBv2 writes current layouts and placement exports to the app.
   - VBv2 reads placement exports from the app and writes render jobs to the app.

5. Move render/export into app-managed jobs.
   - Browser proof remains fast.
   - MP4 render uses the same stored proof payload.
   - Render artifacts are saved into the app media store.

6. Add nutrition/script/audio workflow screens.
   - Research -> score -> script -> TTS -> subtitle alignment.
   - Keep sample-lock protections.

7. Add publishing and analytics.
   - Start with upload packs and manual publishing.
   - Add platform APIs only after proof/render/state are stable.

## Definition Of App-Ready

The repo is ready to start the app build when:

- active tools pass syntax checks
- stale builders remain out of the workflow
- app state model is agreed
- render proof and MP4 use the same stored placement payload
- finalised foods remain protected
- the first app milestone is backend + one-shell navigation, not social upload automation
