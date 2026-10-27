---
paths:
 - 'docs-refined/**'
---

# Docs refinement rules

`docs-refined/` is the AI-refined version of `docs/`. Goal: consistent, lightweight docs that teach only stable, first-class App Router usage.

## Workflow

- Structure mirrors `docs/` exactly: same directories, same file names. The only extra files allowed are `*.rules.md` briefs (see below). Never create, rename, move, or delete files here.
- Rules files: `global.rules.md` applies to every document; `<name>.rules.md` next to `<name>.md` is a lock/brief for that one file and overrides the global rules where they conflict. Read both before any edit to `<name>.md`. Rules files are skipped by `fetch.mjs` sync and by `md-json.mjs`. Create or change them only when asked.
- To drop a file or directory, add its path to `ignoreList` in `fetch.mjs` (relative to `docs/`, e.g. `app/02-guides/foo.md`) and run `bun run sync` — it is removed from both `docs/` and `docs-refined/`.
- No rules file, no refining: refine `<name>.md` only if `<name>.rules.md` exists. Otherwise keep it as the upstream copy and port upstream changes as-is (details in `docs-refined/global.rules.md`).
- Refine incrementally. After `bun run pull`, only the files it reports need work:
  - Added: raw upstream copy; refine the whole file only if it has a `.rules.md`.
  - Modified: read `git diff -- docs/<file>` and carry those changes into `docs-refined/<file>` — refined per its rules if it has a `.rules.md`, as-is otherwise.
- Don't touch files that upstream didn't change unless asked.

## Content

Content rules live in `docs-refined/global.rules.md` (App Router only, no legacy, no "page"/"pages" terminology, writing style). Read it before refining any document. Precedence: `<name>.rules.md` > `global.rules.md` > this file.

## Structure & syntax

- YAML frontmatter is required with `title` and `description` (enforced by `md-json.mjs`); only `nav_title` / `version` besides those. No links in frontmatter (no `related` block): related documents go in an explicit `## INDEX` section at the end of the body — see `docs-refined/global.rules.md`.
- Internal links are file paths relative to the linking document, real names included (`../02-guides/forms.md#anchor`), never `/docs/app/...` or `/app/...` URLs. `bun run fmt` converts them; `bun run build` rejects unconverted or broken ones. Details in `docs-refined/global.rules.md`.
- Code fences keep their meta: language plus `filename="..."` and `switcher` (TS/JS pairs come as `tsx`+`jsx` or `ts`+`js` blocks side by side — edit both).
- Callouts use GFM alerts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, or `> [!CAUTION]` alone on the first line, content on the following `> ` lines. `bun run fmt` restores this if the formatter joins them.
- Plain Markdown only: no MDX comments `{/* */}`, no `<PagesOnly>`/`<AppOnly>`, no imports/exports. JSX inside code fences is fine.

## After editing

Run `bun run fmt` then `bun run build` (validates rules, regenerates `docs-json/` and `docs-context/`). Commit them together.
