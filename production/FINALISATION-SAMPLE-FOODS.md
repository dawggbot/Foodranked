# Finalisation Sample Foods

This is the current finalisation-stage sample set: one representative compact episode from every locked FoodRanked food type.

## Batch

- config: `config/finalisation-sample-foods.v1.json`
- batch output: `outputs/batches/finalisation-sample-foods-v1/`
- mode: compact
- CTA: off

## Samples

| Food type | Sample | Tier | Score | Episode package | Production narration |
| --- | --- | ---: | ---: | --- | --- |
| vegetables | Kale | S | 82.5 | `outputs/episodes/kale-compact/` | `production/episodes/kale/voice/final-narration.txt` |
| fruits | Raspberries | S | 81 | `outputs/episodes/raspberries-compact/` | `production/episodes/raspberries/voice/final-narration.txt` |
| grains | Oats | S | 81.8 | `outputs/episodes/oats-compact/` | `production/episodes/oats/voice/final-narration.txt` |
| legumes | Black Beans | A | 61 | `outputs/episodes/black-beans-compact/` | `production/episodes/black-beans/voice/final-narration.txt` |
| tubers | Sweet Potato | S | 83.1 | `outputs/episodes/sweet-potato-compact/` | `production/episodes/sweet-potato/voice/final-narration.txt` |
| nuts | Almonds | S | 82.8 | `outputs/episodes/almonds-compact/` | `production/episodes/almonds/voice/final-narration.txt` |
| seeds | Chia Seeds | S | 81.4 | `outputs/episodes/chia-seeds-compact/` | `production/episodes/chia-seeds/voice/final-narration.txt` |
| meats | Bacon | D | 11.8 | `outputs/episodes/bacon-compact/` | `production/episodes/bacon/voice/final-narration.txt` |
| dairy | Greek Yogurt | A | 76.7 | `outputs/episodes/greek-yogurt-compact/` | `production/episodes/greek-yogurt/voice/final-narration.txt` |
| oils-and-fats | Extra Virgin Olive Oil | S | 80.3 | `outputs/episodes/extra-virgin-olive-oil-compact/` | `production/episodes/extra-virgin-olive-oil/voice/final-narration.txt` |
| misc | Regular Cola | D | 17.1 | `outputs/episodes/cola-regular-compact/` | `production/episodes/regular-cola/voice/final-narration.txt` |

## Review Order

1. Kale
2. Raspberries
3. Oats
4. Black Beans
5. Sweet Potato
6. Almonds
7. Chia Seeds
8. Bacon
9. Greek Yogurt
10. Extra Virgin Olive Oil
11. Regular Cola

## Notes

- Bacon, Extra Virgin Olive Oil, and Regular Cola keep their existing launch narration files.
- The new narration files are review-ready drafts copied from compact episode output and normalized to the production voice block format.
- Regular Cola keeps the existing `production/episodes/regular-cola/` folder name even though the food id is `cola-regular`, matching the current launch narration queue.
