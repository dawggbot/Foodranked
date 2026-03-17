# GRAINS-CALIBRATION

This file tracks the current grains-only calibration target.

## Target anchors
- **Oats** → high `A` or strong `B`
- **Brown Rice** → `B`
- **Rice Cakes** → `D`

## Current tuning approach

Use the smallest practical changes first:
- stop rewarding starch too much
- make glycemic index matter more
- stop giving a positive fibre bump too early

## Why

The current grains ruleset was flattering weak refined/puffed grains too much while still being too harsh on decent staple grains.
The distortion mainly came from:
- starch being too positive
- GI not biting hard enough
- fibre turning positive too early

## Current grains tuning decisions
- `starch_g` kept weak at weight `1`
- `glycemic_index` increased to weight `4`
- GI bands tightened so poor GI foods fall harder
- fibre first positive band moved from `4g` to `5g`

## Goal
Get a clear spread where:
- oats feel clearly strong
- brown rice feels respectable but not elite
- rice cakes read as a weak grain-category fit
