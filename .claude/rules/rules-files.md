---
paths:
 - 'docs-refined/**/*.rules.md'
---

# Writing a `<name>.rules.md`

A rules file is the lock/brief for one document, `<name>.md` next to it. It says what that document must be, on top of `docs-refined/global.rules.md`. It never repeats global rules — only what is specific to this document, or an explicit override.

Write or change one only when asked. Base it on the current `docs-refined/<name>.md` and upstream `docs/<name>.md`; never invent facts.

## Standard structure

Use these sections, in this order. Skip a section only when it would be empty (except Purpose, Content, and Upstream changes, which are required).

```md
# Rules: <path relative to docs-refined/>

Lock for `docs-refined/<path>`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `<path>`, including when porting upstream changes.

## Purpose

What the document is for and who reads it, in 1–3 sentences. What it is not (what belongs in another document — name it).

## Content (in this order)

Numbered list: frontmatter, then each `##` section (with required `###` subsections) and what it holds. Ends with `## INDEX` when the document has one.

## Sources

Other documents in `docs-refined/` this one must stay consistent with, and which parts follow them (e.g. "Quick start follows the `create-next-app` reference"). Link to the source for more detail instead of repeating it.

## Keep

Facts that must survive refining exactly: versions, commands, CLI output, option names, defaults, code examples that must stay.

## Remove

Legacy or off-scope content specific to this document, and how to handle each (delete, rewrite as current behavior, or replace with a link).

## Overrides of `global.rules.md`

Only where this document must break a global rule, and why.

## Upstream changes

How to port `git diff -- docs/<path>`: what carries over (refined), what is copied verbatim, what never carries over.
```

For an `index.md`, replace Keep/Remove with a `## Section list` (or `## Document list`) that defines exactly what its `## INDEX` covers, plus `## Must not contain` if needed — see the existing `index.rules.md` files.

## Style

- Imperative, specific, checkable: "Delete the `Pages Router` bullet", not "avoid legacy".
- Quote headings and verbatim text exactly as they appear in the document.
- English, like the documents.
