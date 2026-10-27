# Rules: app/02-guides/client-side-data-fetching/index.md

Lock for `docs-refined/app/02-guides/client-side-data-fetching/index.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/02-guides/client-side-data-fetching/index.md`, including when porting upstream changes.

## Purpose

Entry point of the **Client-side data fetching** section, and an overview of it: the guide itself: when a client data-fetching library is needed, choosing a client fetching pattern, and how to pass initial data from Server Components. Library-specific setup belongs in the child documents.

## Content (in this order)

1. Frontmatter: `title: Client-side data fetching` and a one-sentence `description`. No other keys.
2. The overview content described above, refined per `global.rules.md`.
3. `## INDEX`, the last section: the lead "Documents in this section:", then the section list; then the lead "Related:" and links to related documents outside this section.

## Section list

- Item: `- [<frontmatter title of the document>](<path>)`. Title only, no per-item descriptions.
- Path: relative to this file, per the Links rules in `global.rules.md`: a subdirectory links to its `index.md`, a single document to its file.
- Covers only the direct children of `app/02-guides/client-side-data-fetching/` — each subdirectory's `index.md` and each document directly in it — no more, no less. Flat list, no nesting.
- Order: path order (the `NN-` prefixes are the nav order; unprefixed names alphabetically).
- Titles are copied as-is, even when they break a global rule. Fix the title in the source document, then update the list.

## Must not contain

- Details that belong in a child document — link to it instead.
- Links to sections not in `docs-refined/`.

## Upstream changes

Port upstream edits to `docs/app/02-guides/client-side-data-fetching/index.md` into the overview content per `global.rules.md`. After `bun run pull`, update the section list when a direct child of `app/02-guides/client-side-data-fetching/` was added, removed, or retitled.
