---
public: true
---

# 0001: The picture is the API

- **Status:** Accepted
- **Date:** 2026-10-29
- **PR:** [#1](https://github.com/mtblck/botling/pull/1)

## Context

Apps store only a seed (usually a user id) and recompute the robot on every
render. If a release changed what a seed draws, every user's avatar would
change at once, with no way to keep the old one. Seeds pick traits by index
over each list's length, so even appending a palette or a part changes most
existing robots.

## Decision

We treat the robot each seed draws as the public API. Within a major version a
seed with the same options draws the same picture. Any change to art, palette
colours, trait draw order, or the order or length of a parts list is a major
version. Snapshot tests pin known seeds in every shape and at small and full
detail. Before 1.0, art changes are allowed and batched.

## Consequences

New parts and palettes wait for a major version, so they get batched. Changes
to SVG markup that keep the picture (grouping by colour, shorter numbers) are
allowed in a minor release, with the snapshots updated and the reason given.
If people need old robots after a major, they pin the old version; we would
revisit with a `version` option only if that becomes a real request.
