# Rules: app/01-getting-started/01-installation.md

Lock for `docs-refined/app/01-getting-started/01-installation.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/01-getting-started/01-installation.md`, including when porting upstream changes.

## Purpose

First document a new reader follows: create a Next.js App Router app, run it locally, and set up the tooling around it (TypeScript, editor, linting, path aliases, upgrades). It is not a reference: full `create-next-app` options belong in the CLI reference, TypeScript config in the TypeScript reference, ESLint config in the ESLint reference — link to them.

## Content (in this order)

1. Frontmatter: `title: Installation` and a `description` that is one technical sentence naming what the document covers, in content order: creating an App Router app (`create-next-app` or manual installation), running the development server, and setting up TypeScript, editor labels, linting, module path aliases, and upgrades. Imperative, no "Learn how to". Update it when sections are added or removed. No other keys.
2. One-line intro: create a new Next.js app and run it locally.
3. `## Quick start`: one sentence (create `my-app` with explicit options, start the development server on `http://localhost:3000`), the pnpm and npm create-and-run commands, then two bullets: the essential flags, and a "More detail" link to the `create-next-app` reference.
4. `## System requirements`: a list with one item, the minimum Node.js version only (`- Node.js 20.9 or later.`). Keep it a list so more requirements can be added as items. Node.js is the only requirement: any operating system that runs that Node.js version works, so don't list operating systems.
5. `## Supported browsers`: the browser list.
6. `## Create with the CLI`: `create-next-app` commands, the default-settings prompt, the customize-settings prompts, what happens after.
7. `## Manual installation`: install packages, add `package.json` scripts and what each does, then `### Create the app directory` (root layout, home route, image) and `### Create the public folder (optional)`.
8. `## Run the development server`: three numbered steps.
9. `## Set up TypeScript`: minimum TypeScript version, how to enable it, then `### IDE Plugin`.
10. `## Set up your editor`: VS Code / Cursor custom editor labels, the agent prompt, the JetBrains note.
11. `## Set up linting`: ESLint or Biome scripts, ESLint config pointer.
12. `## Set up Absolute Imports and Module Path Aliases`: `baseUrl` and `paths` examples.
13. `## Upgrade your Next.js app`: `next upgrade` commands, bundled docs, agent upgrade, link to the Upgrading document.

## Sources

- `## Quick start` follows `../03-api-reference/06-cli/create-next-app.md` (`### With explicit options`): the same multi-line create commands with the same flags (pnpm with `--use-pnpm`, npm with `--use-npm`), followed by `cd my-app` and the dev command, and the same essential flags. When that reference changes, update Quick start to match. Link to it for more detail instead of repeating its options.

## Keep

- The pnpm and npm commands themselves, as `bash package="pnpm"` + `bash package="npm"` pairs (`create next-app`, installing `next` / `react` / `react-dom`, `next upgrade`).
- Version numbers exactly as upstream states them: minimum Node.js version, minimum TypeScript version, browser versions.
- CLI prompt output (`txt filename="Terminal"` blocks) verbatim from upstream, including the `App Router` prompt line — it is real CLI output, not a router comparison.
- The four `package.json` scripts (`dev`, `build`, `start`, `lint`) with their one-line explanations.
- The `.vscode/settings.json` example and the `prompt` block verbatim.

## Remove

- In `## System requirements`, the operating systems list, the "Before you begin, make sure…" lead-in, and the nodejs.org link.
- `--yes` anywhere in this document: installation always passes the options explicitly as flags.
- In `## Manual installation`, the "Good to know" bullet about the `Pages Router` React version. Keep the App Router bullet, rewritten without comparing routers.
- "Turbopack is now the default bundler. To use Webpack…": say Turbopack is the default bundler and link the Turbopack reference; drop the Webpack fallback.
- In `## Set up linting`, the `next lint` migration paragraph and its codemod command.
- "Starting with Next.js 16, `next build` no longer runs the linter automatically…": rewrite as current behavior — `next build` doesn't run the linter; run it through the `package.json` scripts.
- The mention of the legacy `.eslintrc.*` format: recommend `eslint.config.mjs` only.
- In `## Supported browsers`, the "Learn more about browser support" sentence — its link points to a removed section.
- The JavaScript switcher filenames `app/page.js` → `app/page.jsx` (per the `page` file convention rule).

## Upstream changes

Port `git diff -- docs/app/01-getting-started/01-installation.md` refined per these rules. Copy version numbers, pnpm/npm commands, and CLI prompt output verbatim (a new minimum Node.js version replaces the one in `## System requirements`; new operating system notes don't carry over); drop new yarn/bun variants (global rule). Never carry over anything listed under Remove, or new Pages Router / Webpack / legacy-config notes.
