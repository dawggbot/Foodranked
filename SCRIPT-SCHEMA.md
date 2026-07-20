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
- macro section narration/subtitles should try to mention at least two displayed submacros with numeric values when two defensible values exist: the strongest available visible indicator and the weakest or lowest available visible indicator in that section; for arrow submacros, stronger green/red arrow bands outrank raw weighted score when choosing what sounds outstanding
- when only one defensible submacro is available for a macro section, mention the one that exists; the protein headline grams must not be repeated as the protein submacro, and missing/weakly sourced rows must not be padded into narration just to hit two items
- narration should add a brief benefit or drawback phrase for the selected outstanding submacros, so the script says what the standout is good or bad for rather than only reading the number
- every macro section should also include a brief food-type section-importance line, for example why fat quality matters for meats, why carb behaviour matters for grains or tubers, or why protein quality matters for meats and legumes
- the best outstanding phrase should stay practical and short, for example what fibre, polyunsaturated fat, omega-3, or amino-acid quality helps with
- the worst outstanding explanation should be short and food-type based, for example whether that weak point matters for meats, grains, vegetables, or another category
- vitamin and mineral narration/subtitles follow the same strongest-plus-weakest pattern for DV-backed values; if everything is weak, still name the highest available DV mark and the lowest available DV mark when two defensible values exist
- closing summaries should pull together the strongest strengths and weaknesses from all 7 scored sections, then say what the food is good for and why before the separate tier reveal
- closing "good for" use cases should come from scored evidence and context, not generic filler; likely labels include energy, endurance sports, muscles, strength sports, hormone health, bone health, digestion, immune support, heart health, fluid balance, low-calorie volume, low-calorie flavour swaps, practical meals, cooking use, and narrow use cases
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
- `calibratedOverallScore`
- `calibratedOverallScoreExact`
- `anomalyAdjustedScore`
- `anomalyAdjustedScoreExact`
- `rankingScore`
- `rankingScoreExact`
- `scoreAdjustmentTotal`
- `scoreAdjustments[]`
- `baseOverallScore`
- `baseOverallScoreExact`
- `sectionOrder[]`
- `narrationBlocks[]`
- `explanation`

`overallScore` is the public display score and is locked to the final tier: `D=20`, `C=40`, `B=60`, `A=80`, `S=100`. Use `rankingScore` / `rankingScoreExact` for sorting and audit comparisons.

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
- optional `displayPolicy` — currently emitted for the proteins section to lock the visible row contract
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
4. `closing_summary` → strengths/weaknesses overview plus what the food is good for and why
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
- macro, vitamin, and mineral spoken blocks should prefer the strongest available displayed item plus the weakest or lowest available displayed item, while keeping each section compact; if the lowest mark is still positive, describe it as the softer/lowest mark rather than pretending it is bad
- macro spoken blocks should include both standout context and food-type section importance, not just raw values
- closing summary should mention the main strengths, main weaknesses, and evidence-based best use cases; it should not replace the final tier reveal
- when the selected vitamin metric is `vitamin_b12_dv`, narration and subtitles must say `Vitamin B12`; never shorten it to generic `Vitamin B`
- do not narrate the overall score
- the last spoken block must always be the tier reveal, for example `D tier.`

## `closing`

The closing object contains:
- `summary` / `overview` - spoken closing summary used in `closing_summary`
- `useCases[]` - ranked evidence-derived use cases with `key`, `label`, `reason`, and `score`
- `strengthHighlights[]` - selected strengths from macro, micronutrient, pro, and con context
- `weaknessHighlights[]` - selected weaknesses from macro, micronutrient, pro, and con context
- `finalReveal` - the separate final tier block, for example `A tier.`
- `useCaseNote` - legacy compact use-case line retained for compatibility
- `cta` - optional CTA text, excluded from normal no-CTA narration blocks

The spoken `summary` should feel like a final verdict: it highlights the food's best strengths and worst weaknesses across the video, then says what it is good for and explains why. The final `X tier.` line stays separate.

## Protein display contract

The proteins section has a fixed v1 display contract. `sections[].displayItems` for `key: proteins` must use exactly these four visible row slots, in order:

1. `collagen_g`
2. `essential_amino_acids_score`
3. `nonessential_amino_acids_score`
4. `bioavailability_percent`

Rules:
- `protein_g` belongs in the macro bubble/header, not in the submacro rows.
- `protein_g_fallback` may appear in scorer `metricBreakdown` and may guide narration, but it must not appear in `sections[].displayItems`.
- Visible macro subrows may display `N/A` only when the main macro bubble for that section displays `N/A`.
- If the protein macro displays a value, missing or protein-gate-skipped visible rows use source-backed values first, then labelled display-only estimates when available, then the row default (`0g`, `0/9`, `0/11`, or `0%`) as the final fallback.
- Display estimates use `displaySource: protein_display_estimate`; final defaults use `displaySource: submacro_display_default`. Neither may be written back into food source metrics or treated as source-backed nutrition evidence.
- EAA/NEAA display estimates are useful-protein-gated and floor-based: red protein fallback bands emit `0/9` and `0/11`, and green-band estimates use `floor()` before resolving arrow bands.
- Protein narration may mention protein amount when fallback scoring is used, but the subtitle/body display still follows the four visible row slots above.

The generator emits a proteins-section `displayPolicy` object with:
- `policyId: protein-section-display.v1`
- `rowCount: 4`
- `visibleRows`
- `hiddenFallbackMetricKey`
- `missingValueDisplay`
- `showProteinFallbackAsVisibleRow: false`
- `rules.visibleSubmacroRowsDisplayNaOnlyWhenMainMacroNa: true`
- `rules.missingSubmacroRowsUseDisplayDefault: true`

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
- compact narration uses the `FOOD!` / `RANKED!` / section blocks / closing summary / final tier reveal flow
- the overview comes immediately before the final tier reveal
- the overview includes strengths, weaknesses, and what the food is good for with the reason why
- the final spoken block is always the tier reveal
- overall score is display-only and should not be narrated

## Success condition

The schema is correct when one generator pass can create:
- readable section narration
- an ElevenLabs-ready block script
- episode packaging that stays aligned with the latest scorer output
- website/script surfaces that stay matched to the same generated narration text
