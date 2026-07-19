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
- audio-only narration expands measurement abbreviations, so `3g`, `24g`, `15mg`, and similar values are spoken as full unit words
- audio-only narration expands compact score ratios, so `8/9` is spoken as `8 out of 9`
- subtitle and display text keep abbreviated units such as `g`, `mg`, and `DV`; subtitle copy must not use full unit words like `grams`
- macro section narration/subtitles should target two outstanding displayed submacros with numeric values: one of the best defensible visible indicators and one of the worst defensible visible indicators; for arrow submacros, stronger green/red arrow bands outrank raw weighted score when choosing what sounds outstanding
- when only one defensible submacro is available for a macro section, mention the one that exists; the protein headline grams must not be repeated as the protein submacro
- narration may add a very brief benefit/context phrase for the best outstanding submacro, for example what fibre, polyunsaturated fat, omega-3, or amino-acid quality helps with; keep this selective and short
- the worst outstanding explanation should be short and food-type based, for example whether that weak point matters for meats, grains, vegetables, or another category
- vitamin and mineral narration/subtitles follow the same best-outstanding plus worst-outstanding pattern for DV-backed values; skip `N/A` or weakly sourced values rather than padding the line
- food identity and score-readiness context travel with the script payload
- pros/cons should stay explanation-led, not raw-score-led
- dead legacy fields like context-item `scoreValue` should not be treated as script truth
- this file plus `scripts/foodranked-generate-script.js` are the source of truth for narration behavior, not stale website copies or one-off production rewrites

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

Each of the 7 scored content sections includes:

- `key`
- `title`
- `narration` — audio-ready spoken text with full unit words
- `displayItems`
- `subtitleText` — on-screen subtitle copy with abbreviated units
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
3. 7 scored content section blocks
4. `closing_summary` → very short strengths/weaknesses overview
5. optional `cta`
6. `final_reveal`

For compact no-CTA FoodRanked shorts, this usually produces 11 blocks:

1. `hook_food`
2. `hook_ranked`
3. `section` with `sectionKey: fats`
4. `section` with `sectionKey: carbs`
5. `section` with `sectionKey: proteins`
6. `section` with `sectionKey: vitamins`
7. `section` with `sectionKey: minerals`
8. `section` with `sectionKey: pros`
9. `section` with `sectionKey: cons`
10. `closing_summary`
11. `final_reveal`

Narration rules:
- pros and cons should read like the narrator is directly reading the on-screen items in order
- simple opener variation is allowed for pros/cons sections, for example `Pros first:`, `The upsides first:`, `Cons next:`, or `The drawbacks next:`
- protein sections should not narrate amino-acid quality unless the scorer selected it as a meaningful protein-quality item; if not, narrate protein amount or the category role instead
- measurement units in spoken blocks use full words, for example `37.1 grams of fat` and `saturated fat is 12.6 grams`, while the matching subtitle/display text uses `37.1g` and `12.6g`
- macro, vitamin, and mineral spoken blocks should prefer the strongest available displayed item plus the weakest available displayed item, while keeping each section compact
- when the selected vitamin metric is `vitamin_b12_dv`, narration and subtitles must say `Vitamin B12`; never shorten it to generic `Vitamin B`
- do not narrate the overall score
- the last spoken block must always be the tier reveal, for example `D tier.`

The plain-text compact narration file is created by joining these spoken blocks with a separator line containing only:

```text
-
```

Blank lines around the separator are tolerated by the parser, but generated `narration.txt` and `final-narration.txt` should mirror the compact one-line separator form.

## Split audio mapping

`scripts/foodranked-generate-voice.js --split-blocks` treats `narrationBlocks[]` as the source of truth for one-MP3-per-block narration.

The generated block ids are deterministic:

```text
<two-digit-index>-<section-or-kind>
```

Examples:
- `01-hook_food`
- `02-hook_ranked`
- `03-fats`
- `10-closing_summary`
- `11-final_reveal`

For section blocks, the id suffix comes from `sectionKey`; otherwise it comes from `kind`. The spoken text must be byte-for-byte equivalent to the matching block text in `narration.txt`, after splitting that file on the locked separator:

```text
-
```

Again, blank lines around the separator are tolerated for older hand-edited files.

This lets voice generation, forced alignment, subtitle timing, and dashboard preview refer to the same block identity without inventing a second narration order.

## Compact narration example

```text
Bacon!
-
Ranked!
-
37.1 grams of fat. Saturated fat is 12.6 grams, a major pressure point. For meats, fat quality matters a lot once the protein is already there.
```

## Pros/cons display items

For pros/cons, keep:
- `title`
- `explanation`
- `impactLevel`
- `resolvedScoreValue`

Do not treat deleted food-file `scoreValue` fields as active script inputs.

Pros/cons are bonus-context items. They must add a new food-specific angle or a useful extension of a previous section, not simply restate what the viewer already learned from fats, carbs, proteins, vitamins, or minerals.

Allowed angles include:
- absorbability or anti-nutrients
- antioxidants, polyphenols, fermentation, or named compounds
- preparation, storage, convenience, texture, tolerance, sourcing, processing burden, portion behavior, meal role, or culinary role

Avoid plain section recaps such as `protein contribution is tiny`, `protein is basically absent`, `protein support is weak`, `mineral density is genuinely strong`, `elite mineral density`, or `vitamin C reputation is a real strength`. A section-linked title is only acceptable when it adds context beyond the visible score, such as `ALA omega-3 is the headline fat` for chia.

The `title` is the on-screen textbox line. It must be bite-sized enough for the pros/cons layout:
- maximum `64` characters
- trimmed and single-spaced
- no hard line breaks
- verified against the layout-builder 3-line pro/con textbox fit check

Use `explanation` for the longer spoken/context detail.

## Lock-in status

Current locked behavior:
- 7 scored content section order stays fixed and matched to the score structure
- compact narration uses the `FOOD!` / `RANKED!` / section blocks / short overview / final tier reveal flow
- the overview comes immediately before the final tier reveal
- the final spoken block is always the tier reveal
- overall score is display-only and should not be narrated

## Success condition

The schema is correct when one generator pass can create:
- readable section narration
- an ElevenLabs-ready block script
- episode packaging that stays aligned with the latest scorer output
- website/script surfaces that stay matched to the same generated narration text
