# CONTEXT-ITEMS-SCHEMA

This file defines how FoodRanked should represent scored **pros** and **cons** items.

## Purpose

Pros and cons are not summaries of information already displayed in the nutrient sections.
They capture **additional score-bearing context** such as:
- antioxidants
- polyphenols
- sodium concerns
- pesticide concerns
- anti-nutrients
- unusually absorbable nutrient forms
- other meaningful use-case signals not covered in the standard nutrient metrics

## Core rule

A context item should only exist if it adds information that is **not already shown** in:
- fats
- carbs
- proteins
- vitamins
- minerals

The summary section is responsible for synthesizing the whole picture.
Pros/cons are responsible for **new evidence**.

## Item types

Use 4 allowed impact types:
- `major_pro`
- `minor_pro`
- `minor_con`
- `major_con`

## Default score mapping

Recommended v1 mapping:
- `major_pro = +2`
- `minor_pro = +1`
- `minor_con = -1`
- `major_con = -2`

This is intentionally simple and easy to audit.

## Suggested entity shape

### context_item_definitions
Canonical reusable context-item types.

Suggested fields:
- id
- item_key
- title
- default_polarity (`pro`, `con`)
- default_impact (`major`, `minor`)
- category_tags
- description
- evidence_guidance
- notes nullable

### food_context_items
Context items attached to a scored food.

Suggested fields:
- id
- food_id
- ruleset_id
- item_key
- section_key (`pros`, `cons`)
- impact_level (`major`, `minor`)
- score_value
- title_override nullable
- explanation
- evidence_type (`manual`, `rule_based`, `hybrid`)
- source_note nullable
- confidence (`low`, `medium`, `high`)
- status (`draft`, `approved`)

## JSON example

```json
{
  "foodId": "spinach",
  "rulesetId": "vegetables-v1",
  "pros": [
    {
      "itemKey": "antioxidant_rich",
      "impactLevel": "major",
      "scoreValue": 2,
      "title": "rich in antioxidants",
      "explanation": "Provides strong antioxidant support beyond the core nutrient table.",
      "evidenceType": "manual",
      "confidence": "medium"
    }
  ],
  "cons": [
    {
      "itemKey": "high_oxalates",
      "impactLevel": "minor",
      "scoreValue": -1,
      "title": "contains notable anti-nutrients",
      "explanation": "Oxalates may reduce mineral usefulness in some contexts.",
      "evidenceType": "manual",
      "confidence": "medium"
    }
  ]
}
```

## Selection rules

### Pros
- maximum 3 per food
- prefer strongest, most relevant, least redundant items
- avoid repeating information already shown in nutrient sections

### Cons
- maximum 3 per food
- prefer strongest, most relevant, least redundant items
- avoid generic filler negatives

## Normalization model

To keep pros/cons sections comparable across foods:

```text
pros_raw = sum(pro score values)
pros_max = 3 items × 2 = 6
pros_normalized = ((pros_raw + pros_max) / (2 × pros_max)) × 100

cons_raw = sum(con score values)
cons_max = 3 items × 2 = 6
cons_normalized = ((cons_raw + cons_max) / (2 × cons_max)) × 100
```

Alternative interpretation for implementation:
- treat `pros` as positive-only section
- treat `cons` as negative-only section and normalize accordingly

Pick one approach in code and keep it stable.

## Recommended v1 implementation rule

For simplicity, use:
- up to 3 pros
- up to 3 cons
- explicit stored `score_value`
- human-reviewed wording

Do not fully automate context-item generation in the first build.
Manual or hybrid assignment is safer.

## Good example items
- rich in antioxidants
- contains useful polyphenols
- heme iron is highly absorbable
- highly satiating for the calories
- can be high in sodium
- notable pesticide exposure risk
- contains meaningful anti-nutrients
- common digestive tolerance issues

## Bad example items
- high fibre
- low sugar
- high omega 3
- strong calcium

Those belong in the main nutrient sections already.

## Open questions
- Should context items eventually be rule-triggered from source metadata?
- Should context items have category-specific allowlists?
- Should some context items require citations before approval?
