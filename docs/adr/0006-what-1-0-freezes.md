---
public: true
---

# 0006: What 1.0 freezes

- **Status:** Accepted
- **Date:** 2026-10-29
- **PR:** https://github.com/mtblck/botling/pull/40

## Context

ADR 0001 makes the picture the API, and before 1.0 art changes were allowed
and batched. 1.0 ends that, so each kind of change needs a clear rule for
the first 1.x release: is it a patch, a minor or a 2.0? ADR 0001 named art,
palette colours, trait draw order and list order or length. It left open
the motion, the 40px switch, the exported grids, and how new art could ever
ship without a major.

## Decision

From 1.0, a major version is needed for anything that changes what an
existing seed draws with the same options:

- The still robot at every size: traits, parts, palettes, cell shapes and
  geometry, the full and small grids, centring.
- The `detail: 'auto'` and `showGrid: 'auto'` thresholds (40px), since
  moving them redraws every avatar near that size.
- Which parts move with `animate: true`, and the still frame it rests on.
- The output of `traits`, `resolveTraits`, `grid` and `smallGrid`, the
  `Role` numbers, and the order and contents of every exported list.
- How a seed becomes a robot: NFC normalisation, then FNV-1a and mulberry32.

A minor may change, with the snapshots updated and the reason given:

- The SVG markup, when the picture stays the same (ADR 0001, ADR 0002).
- Motion timing and easing, as long as the same parts move.
- New holiday palettes, new opt-in options and new exports. Seeds never
  pick these, so no existing robot changes.

New parts or palettes a seed can pick wait for 2.0, or ship in 1.x behind an
opt-in option.

## Consequences

A golden corpus of seeds (`test/corpus.test.ts`) checks the picture rules
on every PR, and its markup digests and the snapshots check the SVG. Callers can store a seed, a shape and a palette
index and rely on them through 1.x, but shouldn't compare or cache by the
SVG string across versions. Art that would reach existing seeds piles up
for 2.0. If that pile gets large, or people ask to keep old robots, we
revisit a `version` option (ADR 0001).
