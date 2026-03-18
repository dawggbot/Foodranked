# NEXT-STEPS-AFTER-EPISODE-BACKBONE

## What now exists

FoodRanked now has a first-pass single-food episode package generator:

```bash
node scripts/foodranked-generate-episode.js oats
```

That produces:
- score snapshot
- script snapshot
- narration draft
- subtitle cue draft
- episode manifest with scene/timing plan

This is the first real bridge from:
- scoring system

to:
- production-ready episode packaging

## Reality check

This is a strong backbone, but it is **not publish-ready automation yet**.

Biggest current gap:
- the generated narration package is still too long and too literal for high-performing short-form output

Example:
- `outputs/episodes/oats/` currently estimates at **~74 seconds**
- that is useful as a working draft, but too long for a clean Shorts/Reels/TikTok default

## Recommended order from here

### Now

#### 1) Add a compact short-form mode
Goal:
- target roughly **35–55 seconds** by default

How:
- shorten hook + intro overlap
- compress vitamins/minerals wording
- trim pros/cons to strongest 2 each when needed
- replace verbose closing explanation with a punchier verdict line
- make CTA optional

Why this matters:
- the episode package becomes directly usable for actual editing instead of only as a draft scaffold

#### 2) Add a batch episode runner
Goal:
- generate episode folders for a chosen list of foods in one command

Suggested script:
- `scripts/foodranked-generate-episode-batch.js`

Why this matters:
- lets the repo act like a content queue generator, not just a one-off tool

### Next

#### 3) Add asset placeholders to the manifest
Each episode manifest should have slots for:
- hero image
- sprite sheet
- thumbnail candidate
- background palette
- audio cue pack

Why:
- easier handoff into visual assembly and editing

#### 4) Add voice-generation compatibility
Not necessarily full TTS automation yet.
Just shape the outputs so they can cleanly plug into it:
- one clean narration text file
- one subtitle-safe condensed text stream
- stable scene ids

### Later

#### 5) Add compare-two-foods package generation
Once single-food episodes are stable:
- comparison episodes become the next big content multiplier

#### 6) Add experiment tagging into episode manifests
Useful fields:
- hookVariant
- subtitleDensity
- pacingStyle
- coverConcept
- postingCluster

That would connect production output directly to the experiment-tracking layer.

## Suggested next single task

If continuing immediately, the best next move is:

**Add compact short-form mode to `foodranked-generate-episode.js`.**

That is the clearest upgrade from:
- technically working

to:
- actually useful for channel production.
