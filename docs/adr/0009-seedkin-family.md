---
public: true
---

# 0009: Botling becomes the first style of Seedkin

- **Status:** Accepted
- **Date:** 2026-10-30
- **PR:** <link once opened>

## Context

Botling drew robots, and the art system (a seed picks traits, the traits paint
roles on a 15x15 grid, a renderer draws each cell) works for other subjects
too. Prototypes of animals, people and monsters in `lab/` held up, so Matt
chose to grow Botling into a family called Seedkin, with Botling as its
first style and Snoots, Noggins and Beasties to follow. Nobody depends on the
`botling` package yet, so this is the cheapest moment to rename. We weighed
three shapes: a `kind` option on `botling()` (every app would download every
style, and one function would carry several frozen pictures), one npm package
per style (a release, a tag and a copy of the renderer each), and one package
with an entry point per style.

## Decision

We publish one package, `seedkin`, with a shared core and one entry point per
style. `src/core/` holds what every style shares (seeds and randomness, the
canvas, cells, paths, frames and the common types) and `src/styles/<name>/`
holds a style's traits, parts, palettes, grids and renderer. `seedkin/botling`
exports everything the `botling` package did, and draws every seed exactly as
`botling` 1.2.0 does: the golden corpus and snapshots move over unchanged.
The `botling` package stays on npm at 1.x and is not unpublished.

Each style keeps its own "picture is the API" promise (ADR 0001, ADR 0006). A
new style ships as Preview, where its picture may change in a minor, until
Matt freezes it; from then on it has its own corpus and the same rules as
Botling. Seeds are salted per style, so one seed's robot and animal don't
share patterns.

## Consequences

An app imports only the styles it uses, and the package stays free of runtime
dependencies. Adding a style is a minor release. Botling's rules in ADR 0006
apply to `seedkin/botling` unchanged, with the root `seedkin` export holding
only shared pieces (`randomSeed`, `FRAMES`, `Role`, the grid sizes and types).
Shared core code now has more than one caller, so a change there must keep
every frozen style's corpus green. Error messages and SVG ids keep their
`botling` prefix, since they name the style.
