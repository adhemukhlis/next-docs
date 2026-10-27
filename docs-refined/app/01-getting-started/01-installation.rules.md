# Rules: app/01-getting-started/01-installation.md

Lock for `docs-refined/app/01-getting-started/01-installation.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/01-getting-started/01-installation.md`, including when porting upstream changes.

## Purpose

First document a new reader follows: check the requirements, create a Next.js App Router app with one non-interactive command, run it locally, and know what the command generated. Nothing else. It is not a reference and not a project-structure or tooling guide: every `create-next-app` option belongs in the CLI reference, project structure in Project Structure, TypeScript, ESLint, and path alias config in their references.

## Content (in this order)

1. Frontmatter: `title: Installation` and a `description` that is one technical sentence naming the sections in order — "Check the system requirements, create a Next.js App Router app with `create-next-app`, run the development server, and review the generated project." Imperative, no "Learn how to". Update it when sections are added or removed. No other keys.
2. One-line intro: "Create a new Next.js app and run it locally."
3. `## System requirements`: a list with one item, the minimum Node.js version only (`- Node.js 20.9 or later.`). Keep it a list so more requirements can be added as items. Node.js is the only requirement: any operating system that runs that Node.js version works, so don't list operating systems.
4. `## Quick start`, in this order:
   1. One sentence: create `my-app` with explicit options, then start the development server on `http://localhost:3000`.
   2. The create-and-run commands, `bash package="pnpm"` then `bash package="npm"`: the multi-line `create next-app my-app` command, `cd my-app`, and the dev command (`pnpm dev` / `npm run dev`).
   3. `> [!NOTE]`: "Essential: `--app`, `--src-dir`, `--typescript`, `--import-alias`, `--turbopack`. The rest are optional."
   4. `> [!IMPORTANT]`: "More detail: [`create-next-app`](../03-api-reference/06-cli/create-next-app.md#with-explicit-options) — every option and what each flag sets."
5. `## Generated project` (added here, not in upstream): the lead sentence "The Quick start commands produce a ready-to-run project:", then three lead + list groups:
   1. "Dependencies:" — `next`, `react`, `@biomejs/biome`, `tailwindcss`, `typescript`.
   2. "Configuration:" — `next.config.ts` — Next.js; `pnpm-workspace.yaml` — pnpm (pnpm only); `biome.json` — Biome; `tsconfig.json` — TypeScript.
   3. "Structure:" — `src/app`.

No other sections.

## Sources

- `## Quick start` follows `../03-api-reference/06-cli/create-next-app.md` (`### With explicit options`): the same multi-line create commands with the same flags (pnpm with `--use-pnpm`, npm with `--use-npm`) and the same essential flags. When that reference changes, update Quick start to match. Link to it for more detail instead of repeating its options.
- `## Generated project` describes what the Quick start flags generate. When the flags change, update its lists to match, verified by scaffolding with those flags (`--skip-install --disable-git` in a scratch directory) — never from memory.

## Keep

- The pnpm and npm commands themselves, as `bash package="pnpm"` + `bash package="npm"` pairs (`create next-app`).
- Multi-line commands use ` \` line continuations only — no comments after a `\`.
- The minimum Node.js version exactly as upstream states it.
- The essential flags: `--app`, `--src-dir`, `--typescript`, `--import-alias`, `--turbopack`.

## Remove

- In `## System requirements`, the operating systems list, the "Before you begin, make sure…" lead-in, and the nodejs.org link.
- `--yes` anywhere in this document: installation always passes the options explicitly as flags.
- Every upstream section other than Quick start and System requirements — `## Supported browsers`, `## Create with the CLI`, `## Manual installation` (including `### Create the app directory`, `### Create the public folder`, and `### Run the development server`), `## Set up TypeScript` (including `### IDE Plugin`), `## Set up linting`, `## Set up Absolute Imports and Module Path Aliases`, `## Set up your editor`, `## Upgrade your Next.js app`. `create-next-app` already generates the app structure, TypeScript, linter, and import alias config; the rest is covered by its own reference or guide.

## Upstream changes

Port `git diff -- docs/app/01-getting-started/01-installation.md` refined per these rules: only changes to the minimum Node.js version or the create commands carry over. Copy version numbers verbatim (a new minimum Node.js version replaces the one in `## System requirements`; new operating system notes don't carry over). A new create flag or default is reflected only through the `create-next-app` reference (see Sources), then `## Generated project` is re-verified. Drop new yarn/bun variants (global rule). `## Generated project` has no upstream counterpart: upstream changes never remove it. Never carry over anything listed under Remove, or new sections.
