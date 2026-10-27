---
paths:
 - 'docs-refined/**'
---

# Docs refinement rules

`docs-refined/` is the AI-refined version of `docs/`. Goal: consistent, lightweight docs that teach only stable, first-class App Router usage.

## Workflow

- Structure mirrors `docs/` exactly: same directories, same file names. Never create, rename, move, or delete files here.
- To drop a file or directory, add its path to `ignoreList` in `fetch.mjs` (relative to `docs/`, e.g. `app/02-guides/foo.md`) and run `bun run sync` — it is removed from both `docs/` and `docs-refined/`.
- Refine incrementally. After `bun run pull`, only the files it reports need work:
  - Added: raw upstream copy, refine the whole file.
  - Modified: apply only what changed upstream — read `git diff -- docs/<file>` and carry those changes into `docs-refined/<file>`, keeping existing refinements.
- Don't touch files that upstream didn't change unless asked.

## Content

- App Router only. Remove Pages Router mentions, `pages/` examples, `getServerSideProps`/`getStaticProps`/`getInitialProps`, `next/router`, `_app`/`_document`, and "if you're using the Pages Router..." asides.
- Prefer the current recommended API over legacy alternatives. When a page documents both a new and an old way, keep the new one; drop the old unless it is the only stable option.
- Don't document experimental / canary-only flags as the default path. If a feature needs `experimental.*`, say so explicitly near the top.
- Keep prose short and direct. Cut repetition, marketing tone, and history ("previously...", "in older versions...").
- Never invent APIs, options, or behavior. If unsure, check `docs/` or upstream source rather than guessing.

## Structure & syntax

- YAML frontmatter is required with `title` and `description` (enforced by `md-json.mjs`); keep `nav_title`, `related`, `version` valid. `related.links` paths must point to existing docs.
- Internal links use `/docs/app/...` paths (no numeric prefixes, no `.md`).
- Code fences keep their meta: language plus `filename="..."` and `switcher` (TS/JS pairs come as `tsx`+`jsx` or `ts`+`js` blocks side by side — edit both).
- Plain Markdown only: no MDX comments `{/* */}`, no `<PagesOnly>`/`<AppOnly>`, no imports/exports. JSX inside code fences is fine.

## After editing

Run `bun run fmt` then `bun run build` (validates rules, regenerates `docs-json/` and `docs-context/`). Commit them together.
