# SCRIPT-SCHEMA

## Purpose

`script.json` is the structured narration payload produced by:

```bash
node scripts/foodranked-generate-script.js foods/<food>.sample.json
```

It is the bridge between:
- scored food data
- narration text
- subtitle text
- episode packaging
- batch script generation

## Current version

- `schemaVersion`: `foodranked-script.v2`
- `narrationFormat`: `elevenlabs-blocks-v1`

## Design rules

- narration must stay aligned with the scored result
- the ElevenLabs-ready block layout is first-class, not an afterthought
- food identity and score-readiness context travel with the script payload
- pros/cons should stay explanation-led, not raw-score-led
- dead legacy fields like context-item `scoreValue` should not be treated as script truth

## Top-level shape

- `status`
- `schemaVersion`
- `narrationFormat`
- `food`
- `ruleset`
- `header`
- `hook`
- `sections[]`
- `closing`
- `tier`
- `overallScore`
- `overallScoreExact`
- `sectionOrder[]`
- `narrationBlocks[]`
- `explanation`

## `food`

Carries both ranking identity and production-readiness context:

- `id`
- `name`
- `foodType`
- `basis`
- `identity`
- `scoreReadiness`
- `sourceNotes`

## `sections[]`

Each of the 7 video sections includes:

- `key`
- `title`
- `narration`
- `displayItems`
- `subtitleText`
- `timingHint`
- `score`

Order is locked to:
1. fats
2. carbs
3. proteins
4. vitamins
5. minerals
6. pros
7. cons

## `narrationBlocks[]`

This is the canonical ElevenLabs-ready spoken order.

Each block includes:
- `kind`
- optional `sectionKey`
- `text`

Typical compact order:
1. `hook_food` → `Bacon!`
2. `hook_ranked` → `Ranked!`
3. 7 section blocks
4. `closing_summary`
5. optional `cta`
6. `final_reveal`

The plain-text compact narration file is created by joining these spoken blocks with:

```text

-

```

## Compact narration example

```text
Bacon!

-

Ranked!

-

37.1g of fat. Saturated fat is a major pressure point. For meats, fat quality matters a lot once the protein is already there.
```

## Pros/cons display items

For pros/cons, keep:
- `title`
- `explanation`
- `impactLevel`
- `resolvedScoreValue`

Do not treat deleted food-file `scoreValue` fields as active script inputs.

## Success condition

The schema is correct when one generator pass can create:
- readable section narration
- an ElevenLabs-ready block script
- episode packaging that stays aligned with the latest scorer output
