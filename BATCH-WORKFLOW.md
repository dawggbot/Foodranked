# BATCH-WORKFLOW

## Purpose

Turn FoodRanked from a one-off episode generator into a repeatable batch pipeline.

## Main command

```bash
node scripts/foodranked-generate-episode-batch.js config/launch-batch.v1.json
```

If no config is passed, it defaults to:

```text
config/launch-batch.v1.json
```

## Config shape

```json
{
  "id": "launch-batch-v1",
  "description": "Short explanation of why this batch exists",
  "defaults": {
    "mode": "compact",
    "includeCta": false
  },
  "foods": ["salmon", "bacon", "oats"]
}
```

## Outputs

Per-food episode packages still land in:

```text
outputs/episodes/<food-id>-compact/
```

The batch runner also writes:

```text
outputs/batches/<batch-id>/batch-manifest.json
outputs/batches/<batch-id>/README.md
```

## What this unlocks

- generate a launch set in one command
- review winners/losers together
- keep specific batches reproducible
- test different food mixes without manual repetition

## Recommended use pattern

1. define a batch config
2. generate all compact episodes
3. review narration quality + verdict spread
4. pick the best 3-5 to actually build first
5. create the next batch based on what was missing
