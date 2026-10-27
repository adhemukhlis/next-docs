# Rules: index.md

Lock for `docs-refined/index.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `index.md`, including when porting upstream changes.

## Purpose

Entry point of the docs: state what this documentation is, then map every document to its relative path. Nothing else.

## Content (in this order)

1. Frontmatter: `title: Next.js Docs` and a one-sentence `description`. No other keys.
2. One short intro paragraph: Next.js documentation, App Router only, stable first-class APIs only.
3. A GFM `> [!CAUTION]` alert (marker alone on its line, content on the following `> ` lines): bold "**REFINED, not official.**" lead, then the risks as a list — no legacy (Pages Router and older patterns removed, point to the official docs), canary snapshot (may be unreleased or lag behind upstream), AI-edited (may contain mistakes, verify against official docs), removed information (links outside the App Router docs may be dead). Keep it to these points; update them if the scope of the refinement changes.
4. `## INDEX`: a one-line lead, then the document list.

## Document list

- Item: `- [<frontmatter title of the document>](<path>)`. Title only, no per-document descriptions.
- Path: `./` + the file path relative to `docs-refined/`, unchanged (per the Links rules in `global.rules.md`). Example: `./app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`.
- Nesting: one level per directory. A directory's `index.md` is the parent item of everything inside that directory.
- Order: path order (the `NN-` prefixes are the nav order), with a directory's `index.md` before its contents.
- Covers every document in `docs-refined/` except `*.rules.md` — no more, no less. When documents are added, removed, or retitled, update the list.
- Titles are copied as-is, even when they break a global rule (e.g. contain "page"). Fix the title in the source document, then update the list.

## Overrides of `global.rules.md`

- The caution alert names the Pages Router, to tell readers it was removed and where to go instead. Nowhere else in this file.

## Must not contain

- The upstream sections "What is Next.js?", "How to use the docs", "App Router and Pages Router", "React version handling", "Pre-requisite knowledge", "Accessibility", "Join our Community".
- Links to sections not in `docs-refined/`.

## Upstream changes

Upstream edits to `docs/index.md` don't carry over: this file isn't a refinement of the upstream text. After `bun run pull`, update the document list only when documents were added, removed, or retitled.
