---
name: refine
description: Refine documents in docs-refined/ according to their rules files. Use for "/refine" (syncs with docs/ and asks which upstream changes to refine), "/refine <file>", or "refine this doc". Refines only documents that have a <name>.rules.md.
argument-hint: '[docs-refined/<path>.md ...]  (none: sync + checklist of upstream changes)'
---

# Refine

Refine one or more documents in `docs-refined/` so they follow their rules, then rebuild and verify.

## Targets

- Paths given as arguments: those documents (`docs-refined/...md`; a bare `app/...md` means the same path under `docs-refined/`). No sync, no interview.
- No arguments: run `bun run sync`, then interview:
  1. Read its report. Removed files are already gone from `docs-refined/` — just mention them. If nothing was added or modified, say there are no upstream changes and stop.
  2. Ask with `AskUserQuestion` as a checklist (`multiSelect: true`): one option per added or modified file, label = the path under `docs-refined/`, description = `added` or `modified upstream` plus what will happen — `refine` if it has a `.rules.md`, `port as-is (no rules file)` otherwise. A question holds at most 4 options and a call at most 4 questions, so split the files into groups of 4 (one question per group, grouped by directory where possible) and use as many calls as needed.
  3. Only checked files are targets. Unchecked files are skipped entirely — not refined, not ported — and stay as they are; list them in the final report as skipped.

## For each target `docs-refined/<name>.md`

1. **Gate.** If `docs-refined/<name>.rules.md` doesn't exist, don't refine it. Say so, and stop for that file. If upstream changed it, port `git diff -- docs/<name>.md` into it as-is (no refining), per `global.rules.md`. Never create a rules file on your own; offer to draft one.
2. **Read**, in this order:
   - `docs-refined/global.rules.md`
   - `docs-refined/<name>.rules.md` (wins over global where they conflict)
   - `docs-refined/<name>.md` (current refined version)
   - `docs/<name>.md` (upstream original) and `git diff -- docs/<name>.md` (what upstream changed since the last commit)
3. **Edit** `docs-refined/<name>.md` only:
   - Added upstream (no prior refinement): refine the whole document.
   - Modified upstream: carry over only what the diff changed, refined per the rules, keeping existing refinements.
   - Explicit request with no upstream change: refine the whole document against its rules.
   - Never invent APIs or behavior; check `docs/` or upstream when unsure. Never touch `docs/`, `docs-json/`, `docs-context/`, other documents, or rules files.
4. **Check the document against its rules** before moving on: required content order, `## INDEX` (last section, titles copied from targets' frontmatter, relative paths), no "page"/"pages" in prose, `page.tsx` / `page.jsx` for the file convention, no Pages Router or legacy APIs, no dead links to removed sections, frontmatter keys only `title` / `description` / `nav_title` / `version`.

## After all targets

1. `bun run fmt`
2. `bun run build:check` — fix every violation it reports in the refined documents, then rerun until it passes.
3. If a document was retitled, added, or removed, update the `## INDEX` lists that reference it (`docs-refined/index.md` and the section `index.md` files), following their rules files.
4. Report per document: refined / ported as-is / skipped (no rules file) / skipped (unchecked), plus anything left for the user to decide. Don't commit unless asked.
