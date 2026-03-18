# PHASE-2-ROADMAP

## Goal

Turn FoodRanked from a calibrated scoring concept into an operational ranking engine.

That means:
- foods can be added consistently
- categories can be scored in batches
- rankings can be inspected easily
- outputs can feed future UI, video, and automation work

## Why this phase matters

Phase 1 built the scoring spine:
- category philosophies
- rulesets
- anchor foods
- pressure-test foods

Phase 2 should make that usable.

## Recommended order

### 2A. Operational data + scoring foundation
Build the system so rankings can be generated and inspected reliably.

#### Deliverables
- finalized food JSON shape
- batch scoring output
- category leaderboard export
- summary views for top / bottom / tier splits
- stable file structure for future ingestion

#### Success criteria
- one command can score the full food library
- one command can export sorted category rankings
- rankings are easy to inspect without opening raw per-food files one by one

---

### 2B. Explanation layer
Once rankings are visible, make them explainable for content.

#### Deliverables
- short summary per food
- strongest section
- weakest section
- top pros
- top cons
- comparison-friendly output format

#### Success criteria
- every ranked food can be explained in plain English
- rankings can directly feed narration and subtitles

---

### 2C. Content / product integration
Use the ranking engine downstream.

#### Deliverables
- stat-card export format
- tier-list episode input format
- compare-two-foods input/output format
- future UI/API hooks

#### Success criteria
- the ranking engine becomes the source of truth for actual outputs, not just internal experiments

## Immediate next-step decision

The best next move is **2A**.

Specifically:
- keep the current scorer
- add category leaderboard export
- add review-friendly output files
- avoid another big philosophy pass for now

## Recommended working files
- `foods/*.sample.json` for food records
- `rulesets/*.json` for scoring rules
- `scripts/foodranked-scorer.js` for single-food scoring
- `scripts/foodranked-score-all.js` for batch scoring
- `scripts/foodranked-export-leaderboards.js` for category ranking outputs
- `outputs/leaderboards/*.json` for generated ranking files

## Near-term backlog

### High priority
- export category leaderboards
- create category manifests or indexes later if needed
- define explanation payload shape

### Medium priority
- compare-two-foods workflow
- boundary-food finder (foods near tier cutoffs)
- food completeness validator

### Later
- serving-reality handling for misc
- UI/API layer
- narration automation

## Definition of ready for Phase 3

FoodRanked is ready for the next major phase when:
- a larger food library exists
- all foods can be batch scored reliably
- each category can be inspected as a leaderboard
- each ranked food has a stable explanation payload
