# Rules: app/03-api-reference/06-cli/create-next-app.md

Lock for `docs-refined/app/03-api-reference/06-cli/create-next-app.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/03-api-reference/06-cli/create-next-app.md`, including when porting upstream changes.

## Purpose

Reference for the `create-next-app` CLI: how to invoke it, every option it accepts, its interactive prompts, and how to start from an example. It is not a setup walkthrough — creating and running a first app step by step belongs in Installation (`../../01-getting-started/01-installation.md`).

## Content (in this order)

1. Frontmatter: `title: create-next-app` and a one-sentence `description`. No other keys.
2. Intro: one or two sentences on what the CLI does (default template or an example from a public GitHub repository), then "Basic usage:" with the pnpm and npm commands.
3. `## Reference`: one line, then the options table (`Options` | `Description`).
4. `## Examples`, with these subsections:
   1. `### With the default template`: pnpm and npm commands, the default-settings prompt, the customize-settings prompts, what happens after.
   2. `### Linter Options`: one line each for ESLint, Biome, and None.
   3. `### With an official Next.js example`: the `--example` commands and the link to the examples directory.
   4. `### With any public GitHub example`: the `--example "<GitHub URL>"` commands.

## Keep

- Every row of the options table, verbatim: flag names, `or` aliases, defaults ("(default)", "(enabled by default)", `"@/\*"`), and descriptions. Upstream's row order.
- CLI prompt output (`txt filename="Terminal"` blocks) verbatim, including the `App Router` prompt line and the `experimental.agentFeedback` hint — it is real CLI output.
- Placeholder syntax in commands as-is: `[project-name] [options]`, `[example-name] [your-project-name]`, `"https://github.com/.../"`.
- Links to the examples directory in the vercel/next.js repository.

## Remove

- The yarn and bun command blocks (global package manager rule).
- "It is the easiest way to get started with Next.js." — marketing.
- In `### Linter Options`, the judgment words: "The traditional and most popular JavaScript linter", "fast, modern", "for optimal performance". State what each option sets up.
- "Once you've answered the prompts, a new project will be created with your chosen configuration." — it repeats the sentence after the prompts.
- Fix "The `create-next-app` CLI allow you" → "allows you".

## Overrides of `global.rules.md`

- The options table keeps `--use-yarn`, `--use-bun`, and `--webpack`. They are real CLI flags, and a reference must list every flag. The package manager and no-legacy rules apply to commands and prose, not to this table.

## Upstream changes

Port `git diff -- docs/app/03-api-reference/06-cli/create-next-app.md` refined per these rules. Copy new or changed options table rows and CLI prompt output verbatim. Keep only the pnpm and npm variants of new commands. Never carry over anything listed under Remove.
