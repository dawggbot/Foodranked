---
name: "nutrition-content-studio"
description: "White Potato approved script voice pattern"
---

# Proposed Update: White Potato Script Voice Pattern

Use this guidance when writing, generating, or reviewing FoodRanked narration scripts.

## Approved Exemplar

Treat `outputs/episodes/white-potato-compact/narration.txt` as the current best house-style example unless James later approves a stronger one.

Key qualities to preserve:

- Keep exact nutrition values and scoring facts precise.
- Use plain everyday connective language instead of abstract filler.
- End macro and micro sections with a short food-type reason that explains why the section matters.
- Keep pros and cons matched to the stored `contextItems` for that food.
- Pros and cons must be bonus context, practical caveats, meal-role notes, tolerance/prep/storage/processing points, or food-specific angles, not repeats of visible macro, submacro, vitamin, or mineral rows.
- Each pro/con should read as a short title followed by one short explanation sentence.
- Closing summary should quickly name strengths, weaknesses, and practical use cases.
- Final spoken block remains exactly `X tier.`

## White Potato Pattern

```text
White Potato!
-
Ranked!
-
0.1 grams of fat. Saturated fat is 0 grams, supporting a cleaner fat profile. For tubers, fat is mostly a preparation check, not the main job.
-
17.5 grams of carbs. Sugar is 0.8 grams, helping keep the sugar load under control. Fibre is 2.2 grams, with only modest fullness and digestion support, so that's a real downside for tubers. For tubers, carb quality decides a lot.
-
2 grams of protein. Protein barely matters here. For tubers, protein is usually limited, so the other sections have to carry more.
-
Vitamin C is 22% daily value, useful for collagen formation and antioxidant support. Vitamin A is only 0% daily value, not bringing much vision or immune support. For tubers, vitamins can lift a staple carb.
-
Potassium is 9% daily value, the best number here but still too low to carry this section. Iron is only 4% daily value, not bringing much oxygen-transport support. For tubers, minerals matter most when potassium shows up strongly.
-
Positives first: very practical staple food. Cheap, common, and easy to build meals around. Can be fairly filling. Especially when eaten in less processed forms. Flexible meal base. Baked, boiled, or mashed, it pairs easily with stronger foods.
-
Cons next: needs cooking before it works. It is not a grab-and-go food. Prep method changes it fast. Fries, butter, and heavy toppings can drag it down. Plain flavour often needs help. The simple potato does not always stay simple.
-
Best bits are carb quality and practical staple food. Weak spots are low iron and low vitamin A. Best for practical meals and energy because it's easy to build meals around and the carb section gives it a clear fuel role.
-
C tier.
```

## Review Checklist

Before calling a script final:

1. Confirm the script uses the locked block shape: food name, ranked, 7 body sections, conclusion, final tier.
2. Confirm every macro/micro section names useful data and ends with category-specific meaning.
3. Search for awkward filler like `barely matters unless`, `reason to exist`, `main pitch`, `nutrition load`, `low risk is good`, and rewrite it into direct food-specific wording.
4. Confirm pros and cons match `food.contextItems` titles/explanations and do not repeat section facts.
5. Confirm the conclusion does not speak the overall display score and ends with a practical use-case line.
6. Confirm final narration text ends with `X tier.` only.
