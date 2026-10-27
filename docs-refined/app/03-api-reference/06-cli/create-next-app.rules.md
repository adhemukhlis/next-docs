# Rules: app/03-api-reference/06-cli/create-next-app.md

Lock for `docs-refined/app/03-api-reference/06-cli/create-next-app.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/03-api-reference/06-cli/create-next-app.md`, including when porting upstream changes.

## Purpose

Reference for the `create-next-app` CLI: how to invoke it, every option it accepts, and non-interactive usage with flags. It is not a setup walkthrough — creating and running a first app step by step belongs in Installation (`../../01-getting-started/01-installation.md`).

## Content (in this order)

1. Frontmatter: `title: create-next-app` and a one-sentence `description`. No other keys.
2. Intro: one technical sentence on what the CLI does — scaffolds an app from the default template into a new directory, generates the project files, applies the selected options, installs the dependencies. No links. Then "Basic usage:" with the pnpm and npm commands.
3. `## Reference`: one line, then the options table (`Options` | `Description`).
4. `## Examples`, with these subsections:
   1. `### With the default template`: `my-app --yes` commands (pnpm, npm), one line on what `--yes` does.
   2. `### With explicit options`: one multi-line command per package manager (pnpm with `--use-pnpm`, npm with `--use-npm`) passing `--app`, `--src-dir`, `--typescript`, `--import-alias "@/*"`, `--turbopack`, `--cache-components`, `--react-compiler`, `--biome`, `--tailwind`; then bullets: essential flags, optional flags, linter flags (`--eslint`, `--biome`, `--no-linter`); then one line on the folder it creates and `--skip-install`.

## Keep

- Every row of the options table, verbatim: flag names, `or` aliases, defaults ("(default)", "(enabled by default)", `"@/\*"`), and descriptions. Upstream's row order.
- The essential flags: `--app`, `--src-dir`, `--typescript`, `--import-alias`, `--turbopack`.
- Multi-line commands use ` \` line continuations only — no comments after a `\`, it breaks the command.
- Placeholder syntax in commands as-is: `[project-name] [options]`.

## Remove

- The yarn and bun command blocks (global package manager rule).
- "It is the easiest way to get started with Next.js." — marketing.
- Everything about examples as a source: the "or an [example](…) from a public GitHub repository" intro clause, `### With an official Next.js example`, `### With any public GitHub example`, and links to the examples directory. External examples aren't guaranteed to match these docs, and pulling them in is over-context.
- The interactive prompt transcripts (`txt filename="Terminal"` blocks) and the "you'll see the following prompts" / "If you choose to `customize settings`" text — replaced by `### With explicit options` (global audience rule).
- The separate `### Linter Options` section — the linter flags are a bullet under `### With explicit options`, without judgment words ("traditional and most popular", "fast, modern", "optimal performance").
- "Once you've answered the prompts, a new project will be created with your chosen configuration." — it repeats the sentence after the prompts.
- Fix "The `create-next-app` CLI allow you" → "allows you".

## Overrides of `global.rules.md`

- The options table keeps `--use-yarn`, `--use-bun`, `--webpack`, `-e` / `--example`, and `--example-path`. They are real CLI flags, and a reference must list every flag. The package manager and no-legacy rules apply to commands and prose, not to this table.

## Upstream changes

Port `git diff -- docs/app/03-api-reference/06-cli/create-next-app.md` refined per these rules. Copy new or changed options table rows verbatim; when upstream adds a prompt, add its flag to `### With explicit options` only if it is essential. Never carry over prompt transcripts or example-related content (sections, links, commands). Keep only the pnpm and npm variants of new commands. Never carry over anything listed under Remove.
