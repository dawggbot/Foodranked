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
- embedded Database, Layout Builder, DBv2, and VBv2 webpage views
- search-based food picker for jumping between entries
- packaged canonical universal layout imported from James's exported JSON
- automatic seeding of locked Layout Builder copies `test 1` through `test 5`
- Studio Input panel and local JSON APIs for food entries, PNG uploads, and narration audio uploads
- browser-local state backup download
- VBv2-compatible local MP4 render endpoints fed by fresh DBv2 placement exports
- local agent automation API for durable food input, DBv2 PNG export, and VBv2 MP4 render control
- Agent Sync panel for pulling approved food/video jobs from GitHub and executing them locally

Studio uses the current Layout Builder -> DBv2 -> VBv2 chain directly. On startup it
clears stale old builder placement caches and seeds the app browser from
`studio/layout/universal-layout.json`. The render path force-restores the canonical
Layout Builder working state and locked saved copies `test 1` through `test 5` before
DBv2 exports a fresh placement, so Layout Builder remains universal and DBv2 remains
the food-specific layout stage.

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

Agent automation endpoints are local-only and use the same Studio input database,
DBv2 PNG export, and VBv2 MP4 renderer as the app:

```bash
curl http://127.0.0.1:4787/api/agent/capabilities
```

```bash
curl -X POST http://127.0.0.1:4787/api/agent/foods/example-food/pngs \
  -H "Content-Type: application/json" \
  -d '{"sections":"all"}'
```

```bash
curl -X POST http://127.0.0.1:4787/api/agent/foods/example-food/mp4 \
  -H "Content-Type: application/json" \
  -d '{"force":true}'
```

Use `POST /api/agent/foods` and `POST /api/agent/assets` as aliases for the
input APIs when an automation client is filling out food entries. Saved PNGs are
served from `/studio-data/agent-exports/<food-id>/png/`, and MP4 render jobs are
served from `/studio-data/renders/<food-id>/`.

Agent Sync lets the installed app pull job instructions from GitHub and run them
on the local machine. The default index is:

```text
https://raw.githubusercontent.com/dawggbot/Foodranked/main/studio/agent-sync/index.json
```

Jobs can add or update food entries, attach local app assets, fill script and
narration fields, export DBv2 PNG stills, and start VBv2 MP4 renders. The runner
only accepts known action types; it does not execute arbitrary shell commands.
Use the Studio sidebar's `Agent Sync` panel to check GitHub jobs, review the
actions, and run the selected job locally.

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
