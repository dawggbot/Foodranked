---
name: nutrition-workflow-automator
description: Build FoodRanked production workflows for narration, subtitles, episode outputs, website data, exports, and publishing ops.
---

# Nutrition Workflow Automator

Adapt the spirit of Rapid Prototyper to ship a lean content machine quickly.

## Mission

Reduce manual toil while keeping quality control human-readable.

## Pipeline model

Use a staged pipeline:
1. intake food idea
2. collect / verify nutrition data
3. assign food type
4. apply current ruleset
5. generate explanation payload
6. populate visual template
7. generate narration + subtitles draft
8. export platform variants
9. review / approve
10. publish + track performance

## FoodRanked source-of-truth rules

- Generated episode outputs, website data, ElevenLabs scripts, and repo docs should not drift.
- Current script schema is `foodranked-script.v2`; narration format is `elevenlabs-blocks-v1`.
- Use the locked narration block flow: `FOOD!`, `-`, `RANKED!`, `-`, one spoken block per section, short overview, final `X tier.`
- Keep overall score display-only and not spoken.
- Treat `docs/data/foods-index.json` and `docs/data/foods-index.js` as published website truth when touching site data.
- Bacon is the reference/template episode when production examples are needed.

## Approved Script Voice

Future FoodRanked scripts should follow the approved Kale direction:

- Keep sourced nutrition facts precise, even if the wording is somewhat technical.
- Keep food-specific pros and cons precise when they are already accurate, clear, and useful.
- Use casual everyday speech for extra connective narration, category context, section wrap-ups, and conclusion use-case reasons.
- Every macro and micronutrient section should end with a quick food-type summary explaining why the scores mentioned in that section matter to that food category.
- Avoid awkward connective phrasing such as `main pitch`, `low risk is good`, `reason to exist`, `nutrition load`, `lives or dies`, `less automatic`, and `not universal`.
- Prefer direct alternatives such as `not the main thing`, `not a big deal`, `easy to work with`, `harder to enjoy raw`, `not for everyone`, `some people just do not like the taste`, and `helps fill out a meal without many calories`.

## Automation rules

- Automate repetitive transformations, not taste.
- Keep a manual review checkpoint before publishing.
- Prefer one source of truth for food data and scores.
- Batch similar work: data entry, sprite prep, narration drafting, export, upload prep.
- Keep filenames and metadata deterministic.
- Keep manual review before anything gets published externally.
- Never commit API keys, service-account files, tokens, or generated auth state.

## Good system outputs

Design tables/files/queues for:
- content backlog
- foods pending verification
- scores pending review
- episode production status
- export status per platform
- experiment tags for hooks/covers/titles

## MVP bias

For early builds, prefer:
- one working pipeline over many partial ones
- templates over custom scenes
- manual upload with structured prep before full API automation

## Deliverables

When helping on ops/automation, produce:
- pipeline diagram
- job queue / state machine
- naming conventions
- automation checklist
- minimal scripts or task sequence
- bottleneck analysis

## Read for inspiration if needed

Reference source material in:
- `/home/idk/.openclaw/workspace/references/agency-agents/engineering/engineering-rapid-prototyper.md`
- `/home/idk/.openclaw/workspace/references/agency-agents/engineering/engineering-ai-engineer.md`
