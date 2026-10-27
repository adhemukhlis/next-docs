---
title: create-next-app
description: Create Next.js apps using one command with the create-next-app CLI.
---

`create-next-app` scaffolds a Next.js application from the default template into a new directory: it generates the project files, applies the selected options (router, language, source layout, import alias, bundler, styling, linter), and installs the dependencies.

Basic usage:

```bash package="pnpm"
pnpm create next-app [project-name] [options]
```

```bash package="npm"
npx create-next-app@latest [project-name] [options]
```

## Reference

The following options are available:

| Options                                 | Description                                                           |
| --------------------------------------- | --------------------------------------------------------------------- |
| `-h` or `--help`                        | Show all available options                                            |
| `-v` or `--version`                     | Output the version number                                             |
| `--no-*`                                | Negate default options. E.g. `--no-ts`                                |
| `--ts` or `--typescript`                | Initialize as a TypeScript project (default)                          |
| `--js` or `--javascript`                | Initialize as a JavaScript project                                    |
| `--tailwind`                            | Initialize with Tailwind CSS config (default)                         |
| `--react-compiler`                      | Initialize with React Compiler enabled                                |
| `--cache-components`                    | Initialize with Cache Components enabled (default for App Router)     |
| `--eslint`                              | Initialize with ESLint config                                         |
| `--biome`                               | Initialize with Biome config                                          |
| `--no-linter`                           | Skip linter configuration                                             |
| `--app`                                 | Initialize as an App Router project                                   |
| `--api`                                 | Initialize a project with only route handlers                         |
| `--src-dir`                             | Initialize inside a `src/` directory                                  |
| `--turbopack`                           | Force enable Turbopack in generated package.json (enabled by default) |
| `--webpack`                             | Force enable Webpack in generated package.json                        |
| `--import-alias <alias-to-configure>`   | Specify import alias to use (default "@/\*")                          |
| `--empty`                               | Initialize an empty project                                           |
| `--use-npm`                             | Explicitly tell the CLI to bootstrap the application using npm        |
| `--use-pnpm`                            | Explicitly tell the CLI to bootstrap the application using pnpm       |
| `--use-yarn`                            | Explicitly tell the CLI to bootstrap the application using Yarn       |
| `--use-bun`                             | Explicitly tell the CLI to bootstrap the application using Bun        |
| `-e` or `--example [name] [github-url]` | An example to bootstrap the app with                                  |
| `--example-path <path-to-example>`      | Specify the path to the example separately                            |
| `--reset-preferences`                   | Explicitly tell the CLI to reset any stored preferences               |
| `--skip-install`                        | Explicitly tell the CLI to skip installing packages                   |
| `--disable-git`                         | Explicitly tell the CLI to disable git initialization                 |
| `--agents-md`                           | Include `AGENTS.md` to guide coding agents (default)                  |
| `--agent-feedback`                      | Prepare anonymized Next.js feedback for your review                   |
| `--no-agent-feedback`                   | Do not prepare anonymized Next.js feedback for your review            |
| `--yes`                                 | Use previous preferences or defaults for all options                  |

## Examples

### With the default template

`--yes` uses previous preferences or the defaults for every option, without prompts:

```bash package="pnpm"
pnpm create next-app my-app --yes
```

```bash package="npm"
npx create-next-app@latest my-app --yes
```

### With explicit options

Pass the options as flags instead of answering prompts:

```bash package="pnpm"
pnpm create next-app my-app \
  --app \
  --src-dir \
  --typescript \
  --import-alias "@/*" \
  --turbopack \
  --cache-components \
  --react-compiler \
  --biome \
  --tailwind \
  --use-pnpm
```

```bash package="npm"
npx create-next-app@latest my-app \
  --app \
  --src-dir \
  --typescript \
  --import-alias "@/*" \
  --turbopack \
  --cache-components \
  --react-compiler \
  --biome \
  --tailwind \
  --use-npm
```

- Essential: `--app`, `--src-dir`, `--typescript`, `--import-alias`, `--turbopack` — they fix the router, source layout, language, import paths, and bundler.
- Optional: `--cache-components`, `--react-compiler`, a linter flag, `--tailwind`, and the `--use-*` flag matching the package manager.
- Linter: `--eslint` (with the rules from `@next/eslint-plugin-next`), `--biome` (linter and formatter with Next.js and React domain support), or `--no-linter`.

`create-next-app` creates a `my-app` folder and installs the dependencies (`--skip-install` skips installing).
