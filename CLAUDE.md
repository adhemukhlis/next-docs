# next-docs

Refined Next.js documentation: consistent, lightweight, and free of legacy baggage. Only stable, first-class App Router usage — no Pages Router. Audience: AI coding agents (human-readable, but no human-only guidance).

## Pipeline

```
upstream ──fetch.mjs──▶ docs/ ──AI refine──▶ docs-refined/ ──md-json.mjs──▶ docs-json/ ──md-json.mjs──▶ docs-context/
```

- `docs/` — upstream mirror from [vercel/next.js](https://github.com/vercel/next.js/tree/canary/docs) (`canary`). Kept original: only `fetch.mjs` writes here (sparse clone, `.mdx` → `.md`, MDX cleanup, `ignoreList`, format, GFM alerts, internal links → relative file paths). Its git diff is how upstream changes are detected. **Never edit by hand.**
- `docs-refined/` — AI-refined docs. Same directories and file names as `docs/`, always. The only place content is edited. `global.rules.md` holds content rules for every document; a `<name>.rules.md` next to a file is that file's lock/brief (overrides global). Read both before editing `<name>.md`.
- `docs-json/` — mdast JSON of `docs-refined/`, validated by the `rules` in `md-json.mjs`. Generated.
- `docs-context/` — final Markdown rebuilt from `docs-json/`, used as context. Generated.
- `commit-hash.txt` — upstream commit `docs/` was fetched from.

## Commands

- `bun run pull` — fetch upstream into `docs/` (wipes and recreates it), sync `docs-refined/` (copy new files, delete removed ones), then report added / modified / removed files to refine.
- `bun run sync` — only the `docs-refined/` sync + report (no fetch).
- `bun run build` — validate `docs-refined/` against rules, then regenerate `docs-json/` and `docs-context/`. Nothing is written if a rule fails.
- `bun run build:check` — same, plus verifies `docs-context/` parses back to identical mdast.
- `bun run fmt` — `bun fmt` with inline flags from `format()` in `fetch.mjs` (no config file): tabs, no semi, single quotes, print width 180, prose never wrapped. Ignores `node_modules/`, `docs-json/`, `docs-context/`.

## Workflow

1. `bun run pull`, commit nothing yet.
2. Handle only the reported files in `docs-refined/`. Refine a file only if it has a `<name>.rules.md`; otherwise keep it as the upstream copy (modified → port `git diff -- docs/<file>` as-is).
3. To drop a document/section entirely, add its path to `ignoreList` in `fetch.mjs` (relative to `docs/`), then `bun run sync`.
4. `bun run fmt`, `bun run build`, commit `docs/`, `docs-refined/`, `docs-json/`, `docs-context/` and `commit-hash.txt` together.

## Tooling

Bun only, plain JavaScript (ESM). No TypeScript, no `tsconfig.json`.

- `bun <file>`, `bun run <script>`, `bun install`, `bunx` — never node/npm/npx.
- `Bun.file` / `Bun.write` for file I/O, `Bun.Glob` for walking, `Bun.$` for shell, `Bun.argv`, `import.meta.dir`.
- `node:fs/promises` only for what Bun lacks (`rm`, `rename`, `readdir`, `mkdir`).

Detailed rules live in `.claude/rules/`. To refine documents, use the `refine` skill (`.claude/skills/refine/`).
