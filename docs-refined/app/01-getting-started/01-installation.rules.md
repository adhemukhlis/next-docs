# Rules: app/01-getting-started/01-installation.md

Lock for `docs-refined/app/01-getting-started/01-installation.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/01-getting-started/01-installation.md`, including when porting upstream changes.

## Purpose

First document a new reader follows: create a Next.js App Router app, run it locally, and set up the tooling around it (TypeScript, linting, path aliases). It is not a reference: full `create-next-app` options belong in the CLI reference, TypeScript config in the TypeScript reference, ESLint config in the ESLint reference — link to them.

## Content (in this order)

1. Frontmatter: `title: Installation` and a `description` that is one technical sentence naming what the document covers, in content order: creating an App Router app with `create-next-app`, structuring the `app` and `public` directories, running the development server, and setting up TypeScript, linting, and module path aliases. Imperative, no "Learn how to". Update it when sections are added or removed. No other keys.
2. One-line intro: create a new Next.js app and run it locally.
3. `## Quick start`: one sentence (create `my-app` with explicit options, start the development server on `http://localhost:3000`), the pnpm and npm create-and-run commands, then two bullets: the essential flags, and a "More detail" link to the `create-next-app` reference.
4. `## System requirements`: a list with one item, the minimum Node.js version only (`- Node.js 20.9 or later.`). Keep it a list so more requirements can be added as items. Node.js is the only requirement: any operating system that runs that Node.js version works, so don't list operating systems.
5. ``## Create the `app` directory``: root layout, home route, image, Good to know notes.
6. ``## Create the `public` folder (optional)``: what `public` holds and how its files are referenced.
7. `## Run the development server`: three numbered steps.
8. `## Set up TypeScript`: minimum TypeScript version and how to enable it. No subsections.
9. `## Set up linting`: ESLint or Biome scripts, ESLint config pointer.
10. `## Set up Absolute Imports and Module Path Aliases`: `baseUrl` and `paths` examples.

## Sources

- `## Quick start` follows `../03-api-reference/06-cli/create-next-app.md` (`### With explicit options`): the same multi-line create commands with the same flags (pnpm with `--use-pnpm`, npm with `--use-npm`), followed by `cd my-app` and the dev command, and the same essential flags. When that reference changes, update Quick start to match. Link to it for more detail instead of repeating its options.

## Keep

- The pnpm and npm commands themselves, as `bash package="pnpm"` + `bash package="npm"` pairs (`create next-app`).
- Version numbers exactly as upstream states them: minimum Node.js version, minimum TypeScript version.

## Remove

- In `## System requirements`, the operating systems list, the "Before you begin, make sure…" lead-in, and the nodejs.org link.
- The `### IDE Plugin` subsection (VS Code command palette steps, screenshot, the TypeScript reference link after it) — a UI walkthrough for humans (global audience rule).
- The `## Set up your editor` section (VS Code / Cursor custom editor labels, the agent prompt, the JetBrains note) — editor setup is outside what an agent needs to create and run the app.
- The `## Upgrade your Next.js app` section — upgrading belongs in Upgrading (`./18-upgrading.md`), not in installation.
- `--yes` anywhere in this document: installation always passes the options explicitly as flags.
- The `## Manual installation` section (installing `next` / `react` / `react-dom` by hand, the `package.json` scripts, the React canary note, the Turbopack note) — `## Quick start` creates the app with `create-next-app`. Its former subsections stay as `##` sections: ``## Create the `app` directory`` and ``## Create the `public` folder (optional)``.
- In `## Set up linting`, the `next lint` migration paragraph and its codemod command.
- "Starting with Next.js 16, `next build` no longer runs the linter automatically…": rewrite as current behavior — `next build` doesn't run the linter; run it through the `package.json` scripts.
- The mention of the legacy `.eslintrc.*` format: recommend `eslint.config.mjs` only.
- The `## Supported browsers` section — browser support isn't needed to create and run an app.
- The `## Create with the CLI` section (interactive command and prompt transcripts) — `## Quick start` already creates the app with explicit flags, and the `create-next-app` reference covers every option.
- The JavaScript switcher filenames `app/page.js` → `app/page.jsx` (per the `page` file convention rule).

## Upstream changes

Port `git diff -- docs/app/01-getting-started/01-installation.md` refined per these rules. Copy version numbers and pnpm/npm commands verbatim (a new minimum Node.js version replaces the one in `## System requirements`; new operating system notes don't carry over); drop new yarn/bun variants (global rule). Never carry over anything listed under Remove, or new Pages Router / Webpack / legacy-config notes.
