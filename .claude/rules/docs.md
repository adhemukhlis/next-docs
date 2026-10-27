---
paths:
 - 'docs/**/*.md'
---

# Docs refinement rules

Goal: consistent, lightweight docs that teach only stable, first-class App Router usage.

## Content

- App Router only. Remove Pages Router mentions, `pages/` examples, `getServerSideProps`/`getStaticProps`/`getInitialProps`, `next/router`, `_app`/`_document`, and "if you're using the Pages Router..." asides.
- Prefer the current recommended API over legacy alternatives. When a page documents both a new and an old way, keep the new one; drop the old unless it is the only stable option.
- Don't document experimental / canary-only flags as the default path. If a feature needs `experimental.*`, say so explicitly near the top.
- Keep prose short and direct. Cut repetition, marketing tone, and history ("previously...", "in older versions...").
- Never invent APIs, options, or behavior. If unsure, check upstream source/docs rather than guessing.

## Structure & syntax

- Keep the YAML frontmatter (`title`, `description`, `nav_title`, `related`, `version`) valid; `related.links` paths must point to existing docs.
- Internal links use `/docs/app/...` paths (no numeric prefixes, no `.md`).
- Code fences keep their meta: language plus `filename="..."` and `switcher` (TS/JS pairs come as `tsx`+`jsx` or `ts`+`js` blocks side by side — edit both).
- Plain Markdown only: no MDX comments `{/* */}`, no `<PagesOnly>`/`<AppOnly>`, no imports/exports. JSX inside code fences is fine.
- Don't renumber `NN-` file/dir prefixes; they define nav order.

## After editing

Run `bun run fmt` then `bun run data` so `data/` stays in sync. Commit `docs/` and `data/` together.
