# FoodRanked Studio

FoodRanked Studio is the local-only app shell for combining the active FoodRanked tools into one workflow.

Start it from the repo root:

```bash
npm run studio
```

Default URL:

```text
http://127.0.0.1:4787/
```

Current first milestone:

- local Node backend with no package dependencies
- app-owned `studio-data/` state folder
- health/status API with redacted API-key presence
- embedded Database, Layout Builder, DBv2, and VBv2 views
- browser-local state backup download
- VBv2-compatible local MP4 render endpoints

Secrets stay in local env files, not committed files. Supported names:

- `ELEVENLABS_API_KEY`
- `USDA_API_KEY`
- `FOODDATA_CENTRAL_API_KEY`
- `FDC_API_KEY`

Run the desktop shell locally:

```bash
npm run desktop
```

Build a Windows zip from a Windows machine or the manual GitHub Actions workflow:

```bash
npm run dist:win
```

For the most complete Windows render bundle, use the manual GitHub Actions workflow
`Build FoodRanked Studio Windows` or build from Windows after installing Playwright's
Chromium runtime:

```bash
npm run desktop:install-browsers
npm run dist:win
```
