---
public: true
---

# 0005: Centre robots without shoulders

- **Status:** Accepted
- **Date:** 2026-10-29
- **PR:** https://github.com/mtblck/botling/pull/31

## Context

Heads start on rows 3 to 5 and end on rows 10 to 13, so a robot without
shoulders could leave one row above it and four below, and sat visibly high
in its tile (Matt, on `mighty-diode-56`). Robots with shoulders are busts:
the shoulders run to the bottom edge on purpose.

## Decision

After drawing, a robot without shoulders moves by whole rows so the empty
rows above and below it differ by at most one. Triangle cells flip with every
row, so on them it moves by an even number of rows only. The small robot gets
the same rule. Moving whole rows keeps every cell's shape, and the empty grid
behind the robot is the same in every row, so nothing else changes.

## Consequences

- About 20% of seeds move by a cell or two, mostly down. Released with
  0.2.0, before it was tagged; from 1.0 this would be a major (ADR 0001).
- `grid()` and `smallGrid()` return the centred grid, so pickers that draw
  from them match the SVG.
- A half-row offset would centre exactly, but would misalign the robot with
  the empty grid when it is shown, so we don't.
