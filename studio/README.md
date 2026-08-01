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
- embedded Database, DBv2, and VBv2 webpage views
- search-based food picker for jumping between entries
- Studio Input panel and local JSON APIs for food entries, PNG uploads, and narration audio uploads
- browser-local state backup download
- VBv2-compatible local MP4 render endpoints

Studio uses the current DBv2 placement export and VBv2 preview pages directly. It does
not seed legacy layout-builder state or expose the removed proof-only preview.

Local input APIs write into `studio-data/` and are mirrored by the Studio UI into
the browser-local database used by DBv2 and VBv2:

```bash
curl -X POST http://127.0.0.1:4787/api/input/foods \
  -H "Content-Type: application/json" \
  -d '{"food":{"id":"example-food","name":"Example Food","foodType":"misc","foodTypeLabel":"Misc","kcal":123}}'
```

```bash
curl -X POST http://127.0.0.1:4787/api/input/assets \
  -H "Content-Type: application/json" \
  -d '{"kind":"image","foodId":"example-food","filename":"example.png","dataBase64":"..."}'
```

Use `kind: "narration"` for `.mp3`, `.wav`, or `.m4a` narration files.

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
