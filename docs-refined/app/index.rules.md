# Rules: app/index.md

Lock for `docs-refined/app/index.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/index.md`, including when porting upstream changes.

## Purpose

Entry point of the App Router section: say in one paragraph what the App Router is, then map the sections directly under `app/`. The full document tree lives in `docs-refined/index.md` — don't repeat it here.

## Content (in this order)

1. Frontmatter: `title: App Router` and a one-sentence `description`. No other keys.
2. One short intro paragraph: the App Router is Next.js's file-system based router, built on React features such as Server Components, Suspense, and Server Functions (linked to react.dev).
3. `## INDEX`: a one-line lead, then the section list.

## Section list

- Item: `- [<frontmatter title of the document>](<path>)`. Title only, no per-item descriptions.
- Path: relative to this file, per the Links rules in `global.rules.md`: a directory links to its `index.md` (`./01-getting-started/index.md`), a single document to its file (`./04-glossary.md`).
- Covers only the direct children of `app/` — each subdirectory's `index.md` and each document directly in `app/` — no more, no less. Flat list, no nesting.
- Order: path order (the `NN-` prefixes are the nav order).
- Titles are copied as-is, even when they break a global rule. Fix the title in the source document, then update the list.

## Must not contain

- Comparisons with or mentions of other routers.
- Step-by-step or "next steps" lists into individual documents (e.g. the first Getting Started documents) — link the section instead.
- Links to sections not in `docs-refined/`.

## Upstream changes

Upstream edits to `docs/app/index.md` carry over only when they change what the App Router is (the intro paragraph). Changes to upstream's `related` "Next Steps" links don't apply. After `bun run pull`, update the section list only when a direct child of `app/` was added, removed, or retitled.
