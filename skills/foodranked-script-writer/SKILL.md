---
name: "foodranked-script-writer"
description: "Write FoodRanked scripts, sectioned ElevenLabs blocks, subtitles, pros/cons, conclusions, and script QA."
---

# FoodRanked Script Writer

Use this skill when writing, revising, reviewing, or regenerating FoodRanked episode scripts. Keep the work aligned with the scoring engine, generated outputs, subtitles, and ElevenLabs sectioned audio pipeline.

## Canonical Sources

Prefer generated script data over hand-written memory when files exist. Read only what the task needs:

- `SCRIPT-SCHEMA.md` for `script.json`, `narrationBlocks[]`, subtitles, pros/cons, and split audio contracts.
- `NARRATION-STYLE.md` for current voice, section rhythm, and reference style.
- `VIDEO-FORMAT.md` for the 9-section video shell, header rules, visual timing assumptions, and narration packaging.
- `production/NARRATION-OPS.md` for approved `final-narration.txt`, voice take, and narration production rules.
- `foods/<food>.sample.json`, `outputs/episodes/<food>-compact/script.json`, and `outputs/episodes/<food>-compact/narration.txt` for the current generated episode truth.
- `production/episodes/<slug>/voice/final-narration.txt` when preparing or checking production audio text.

Do not invent nutrition values. Use USDA FoodData Central first for whole foods and Open Food Facts for packaged/branded foods. If a metric is not defensibly sourceable for the exact food identity, display or narrate it as `N/A` only when the format requires a visible row; otherwise skip it.

## Locked Shape

FoodRanked videos use a 9-section video shell:

1. intro hook
2. fats
3. carbs
4. proteins
5. vitamins
6. minerals
7. pros
8. cons
9. final verdict / outro

The 7 scored body sections are fats, carbs, proteins, vitamins, minerals, pros, and cons. Keep this order.

For compact no-CTA narration, use the locked ElevenLabs block order:

1. `hook_food` - `FOOD!`
2. `hook_ranked` - `RANKED!`
3. `section:fats`
4. `section:carbs`
5. `section:proteins`
6. `section:vitamins`
7. `section:minerals`
8. `section:pros`
9. `section:cons`
10. `closing_summary`
11. `final_reveal` - `X tier.`

When preparing plain-text narration files, separate each block with a line containing only `-`. Do not flatten the script into one paragraph.

## Split ElevenLabs Audio

FoodRanked can generate ElevenLabs audio as separate section files. Treat the block list as the source of truth for those audio files.

- `scripts/foodranked-generate-voice.js <food-id> --take <take> --split-blocks` creates one MP3 per narration block.
- `scripts/foodranked-align-subtitles.js <food-id> --take <take> --refresh` stitches block word timings into one episode timeline.
- The spoken text in every block must be byte-for-byte equivalent to `narration.txt` or `final-narration.txt` after splitting on `-`.
- Block identities are deterministic: `01-hook_food`, `02-hook_ranked`, `03-fats`, ..., `10-closing_summary`, `11-final_reveal`.
- Website data may expose split narration as `episode.splitAudio`; the builder should prefer that timed split take when present.
- Changing text does not regenerate audio. Flag stale audio when script text changes but voice files are not regenerated.

## Voice

Write direct, brisk, informative shorts. The tone should be fair, lightly punchy, and useful, not preachy.

- Open with `SUBJECT ranked.` as two blocks: `SUBJECT!` then `RANKED!`.
- Do not reintroduce basics already visible in the header: food name, type, per-100g, kcal, and image.
- Do not narrate the overall score.
- Keep the final tier reveal as its own last block: `S tier.`, `A tier.`, `B tier.`, `C tier.`, or `D tier.`
- Prefer educational/informative explanations over ultra-short lines.
- Let sections sound natural aloud; avoid dense medical language unless the term is the actual metric.

## Spoken Text Versus Display Text

Maintain two versions when needed:

- Spoken/audio text expands units and abbreviations: `3g` becomes `3 grams`, `24mg` becomes `24 milligrams`, `DV` becomes `daily value`, and `8/9` becomes `8 out of 9`.
- Subtitle/display text keeps compact units: `g`, `mg`, `DV`, `8/9`.
- Generated subtitle cues must stay at 2 lines max.
- Do not split decimal values across subtitle cues or line breaks, for example keep `37.1g` intact.
- On-screen body text should remain subtitle-driven.

## Header Text Rules

When script or episode work touches display headers, preserve current title rules:

- Food names with number words use numerals: `Zero-Sugar` -> `0-Sugar`, `Two` -> `2`.
- Use familiar shorthand when clearer and widely understood: `Barbecue` -> `BBQ`, `Apple Cider Vinegar` -> `ACV`, `Extra Virgin Olive Oil` -> `XTRA VIRGIN OLIVE OIL`.
- Prefer full or very lightly abbreviated food names and dynamic font-size shrinking before heavier abbreviation.
- Shrunken food names anchor bottom-left so they still sit on the food-name line sprite.
- Food type titles keep constant size and abbreviate to fit the textbox.

## Macro Sections

For fats, carbs, and proteins:

- Always mention the headline macro amount when available.
- Try to mention 2 defensible displayed submacro marks when 2 exist: the strongest visible indicator and the weakest or lowest visible indicator.
- For arrow submacros, stronger green/red arrow bands outrank raw weighted score when choosing what sounds outstanding.
- Skip missing, `N/A`, or weakly sourced values. Do not pad a section just to hit 2 callouts.
- Explain what selected standout marks are good or bad for.
- Add a short line explaining why the section matters for the food type.
- If the weaker mark is still decent, phrase it as the softer support or lowest support mark instead of pretending it is bad.

Useful section-importance angles:

- Fats: fat quality matters most for meats, oils/fats, nuts, and seeds; saturated fat can be a tradeoff; omega-3 or polyunsaturated fat can improve the fat profile.
- Carbs: carb behavior matters most for grains, fruits, legumes, and tubers; fibre, starch, sugar, glycemic index, and glycemic load explain whether the food is useful fuel or a rougher carb source.
- Proteins: protein quality matters most for meats, dairy, legumes, and protein-forward foods; amount alone is not enough when amino-acid quality or bioavailability is weak.

Protein-specific rules:

- The visible protein row contract is collagen, essential amino acids, nonessential amino acids, and bioavailability.
- `protein_g` belongs in the headline macro, not as a visible submacro row.
- Essential amino acids are usually the strongest protein-quality callout when selected.
- Outside meats, do not use collagen as the weakest protein callout when bioavailability, EAAs, NEAAs, or another protein-quality mark is available.
- For grains such as oats, prefer essential amino acids as the high mark and bioavailability as the lower protein caveat when those are the defensible marks.

Calibrated examples:

- Oats/carbs: glycemic index can be the strongest display band, but do not invent an exact GI. Say `glycemic index is in the strongest display band`; starch can be the softer or weakest carb mark.
- Oats/minerals: magnesium is the strong point and calcium, not potassium, is the low point.
- Bacon/fats: polyunsaturated fat can be the positive standout; saturated fat can be the pressure point.
- Bacon/protein: collagen can be a weak callout because bacon is meat.

## Vitamins And Minerals

For vitamins and minerals:

- Use DV-backed values and say `daily value` in speech.
- Try to mention strongest plus weakest/lowest defensible marks when two exist.
- Skip `N/A` and weakly sourced rows.
- If every vitamin mark is low, group the section as all-round low while still saying which vitamins matter for the food type.
- Use exact nutrient names: `Vitamin B12`, never generic `Vitamin B` when the metric is `vitamin_b12_dv`.
- Keep weak-point context category-based, for example weak for meats, grains, vegetables, dairy, legumes, tubers, nuts, seeds, or oils/fats.

Food-type context examples:

- Grains: vitamins are more of a bonus after carb quality and minerals.
- Meats: vitamin B12 and vitamin D are the main checks.
- Dairy: vitamin D and vitamin B12 matter.
- Fruits: vitamin C and vitamin A matter.
- Vegetables: vitamin A, vitamin C, and vitamin K matter.
- Legumes: fibre, protein, and minerals often matter more than vitamins.
- Nuts/seeds/oils: vitamin E is usually the main vitamin check.

## Pros And Cons

Keep exactly 3 pros and 3 cons in final outputs whenever possible.

Pros and cons should be bonus context, not a recap of displayed macro, submacro, vitamin, or mineral points.

Good angles include:

- antioxidants, polyphenols, fermentation, or named compounds
- absorbability, anti-nutrients, or bioavailability context
- sourcing, authenticity, contamination risk, or processing burden
- tolerance, digestion, satiety, portion behavior, or convenience
- texture, preparation, storage, meal role, culinary role, or realistic use

For narration:

- Read all 3 pro items and all 3 con items directly and fully.
- Use a simple opener such as `Pros first:`, `The upsides first:`, `Cons next:`, or `The drawbacks next:`.
- Pros/cons titles should be bite-sized, max 64 characters, trimmed, single-spaced, and fit the 3-line textbox.
- Put longer context in the explanation, not the on-screen title.

## Closing Summary

The closing summary is the final verdict before the tier reveal.

It should:

- Pull together the strongest strengths and biggest weaknesses from all 7 scored sections.
- Mention what the food is good for and explain why.
- Use up to 3 evidence-led use cases when the food has that many real roles.
- Avoid generic praise; every use case should connect to an actual section or pro/con strength.
- Keep weaknesses honest without burying the tier reveal.
- Leave `X tier.` as the separate final block.

Use-case labels can include:

- energy
- endurance sports
- muscles
- strength sports
- hormone health
- bone health
- digestion
- immune support
- heart health
- fluid balance
- low-calorie volume
- low-calorie flavour swaps
- practical meals
- cooking use
- blood and oxygen support
- narrow use cases

Examples of evidence links:

- carbs, starch, or glycemic behavior -> energy or endurance sports
- protein amount, EAAs, or bioavailability -> muscles or strength sports
- fibre or beta-glucan -> digestion or heart health
- vitamin/mineral support -> immune support, bone health, fluid balance, or blood and oxygen support
- low calories, water, volume, or strong flavour for few calories -> low-calorie volume or flavour swaps
- oils/fats -> cooking use, hormone health, or narrow use cases depending on fat quality and portion risk

## Manual Writing Workflow

When asked for a sample script:

1. Identify the exact food, food type, basis, tier, and current source-backed metrics.
2. Use the locked block order and section separators.
3. Write each macro section with headline amount, strongest mark, weakest/lowest mark, and food-type importance when defensible.
4. Write vitamins/minerals with strongest plus weakest DV marks, or grouped all-low context when that is more truthful.
5. Write 3 pros and 3 cons as direct on-screen-item narration with extra context.
6. Write the closing summary with strengths, weaknesses, use cases, and reasons.
7. End with the separate final tier block.

When editing generated scripts:

1. Start with `git status --short --branch` and do not touch unrelated dirty files.
2. Prefer changing generator rules over one-off output edits when the rule should apply across foods.
3. Regenerate affected episodes after generator changes.
4. Keep `outputs/episodes/*`, `production/episodes/*/voice/final-narration.txt`, and `docs/data/foods-index.*` aligned when those surfaces are part of the task.
5. Remember that changed text may leave existing ElevenLabs audio stale until audio is regenerated.

Useful commands:

```bash
node scripts/foodranked-generate-script.js foods/<food>.sample.json
node scripts/foodranked-generate-episode.js <food-id> --compact --no-cta
node scripts/foodranked-generate-voice.js <food-id> --take voice-v7 --split-blocks
node scripts/foodranked-align-subtitles.js <food-id> --take voice-v7 --refresh
node scripts/generate-dashboard-data.js
node scripts/verify-narration-subtitles.js
node scripts/verify-pros-cons-title-fit.js
scripts/run-foodranked-test-pack.sh
```

Use the smallest meaningful verification for the change. For broad generator or script-rule changes, run the test pack.

## Quality Checklist

Before finalizing a script, check:

- It is per 100g and uses the locked food identity.
- The narration has the correct block order and `-` separators.
- The opening is `FOOD!`, `RANKED!`.
- There is one spoken block per scored content section.
- Overall score is not spoken.
- Final reveal is the last block and says only `X tier.`
- Spoken units are expanded and subtitle/display units are compact.
- Macro sections mention strongest and weakest/lowest defensible marks when possible.
- Macro sections explain good/bad-for context and food-type importance.
- Non-meat protein sections do not use collagen as the weak callout when better protein-quality marks exist.
- Vitamins/minerals use strongest plus weakest/lowest DV marks or truthful all-low grouping.
- `Vitamin B12` is never shortened to `Vitamin B`.
- Pros and cons are exactly 3 each and do not merely repeat visible score rows.
- Closing summary names strengths, weaknesses, good-for use cases, and reasons.
- Subtitles stay at 2 lines max and do not split decimals.
- If narration text changed, audio and alignment status are called out.
