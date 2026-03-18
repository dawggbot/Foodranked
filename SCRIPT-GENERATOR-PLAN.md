# SCRIPT-GENERATOR-PLAN

## Goal

Generate a reusable video-script payload from a scored food result.

The output should be structured enough to support:
- narration generation
- subtitle generation
- section-by-section reveal timing later
- final video automation

## Input
- scorer output JSON from `foodranked-scorer.js`

## Output
A script payload with:
- hook
- intro line
- sections[] matching the 7-section video format
- summary
- final reveal
- optional CTA slot

## Important rule

This is **not** the final renderer.
It is the narration-and-structure layer between explanation and video timing.

## Section model
Each script section should include:
- `key`
- `title`
- `narration`
- `displayItems`
- `subtitleText`
- `timingHint`

## Current first-pass target
Build a script generator that can:
- score one food
- generate a narration-ready structured script JSON
- work cleanly across both normal categories and `misc`
