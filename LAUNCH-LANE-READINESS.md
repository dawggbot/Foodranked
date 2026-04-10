# LAUNCH-LANE-READINESS

This file tracks when it is sensible to move from scoring/data cleanup into script production for the first launch batch.

## Recommendation

Do **not** wait for the entire food database to become production-safe before writing scripts.

Move onto scripts when the first launch batch is at least **metadata-hardened / near-production-safe**, meaning:

- each launch food has a locked identity statement
- the basis/form being ranked is explicit
- source notes explain what the current record is and is not
- obvious calibration-only ambiguity has been surfaced in `scoreReadiness`
- the score still validates cleanly under the current ruleset

That threshold is enough to let scripting start while broader database hardening continues in parallel.

## First launch batch

- Bacon
- Rice Cakes
- Regular Cola
- Extra Virgin Olive Oil
- Salmon

## Current readiness after this pass

### Production-safe
- Regular Cola

### Near-production-safe
- Bacon
- Rice Cakes
- Extra Virgin Olive Oil
- Salmon

## Practical rule for scripting

You can start scripts for the launch batch once:

- all five foods are at least `near-production-safe`, and
- any remaining blockers are clearly documented and not severe enough to make the final narration misleading.

That is a much better tradeoff than waiting for the whole database, because it keeps the content pipeline moving while preserving honesty about what is still provisional.
