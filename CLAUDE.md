# next-docs

Refined Next.js documentation: consistent, lightweight, and free of legacy baggage. Only stable, first-class App Router usage — no Pages Router.

## Layout

- `docs/` — Markdown docs pulled from [vercel/next.js](https://github.com/vercel/next.js/tree/canary/docs) (`canary`), App Router only. Source of truth.
- `data/` — mdast JSON generated from `docs/` (mirrors its paths, `.md` → `.json`). Never edit by hand.
- `commit-hash.txt` — upstream commit the current `docs/` was pulled from.
- `script.mjs` — pulls latest upstream docs into `docs/` (sparse clone, drops `02-pages`/`03-architecture`/`04-community`, `.mdx` → `.md`, strips MDX-only syntax, formats).
- `md-json.mjs` — converts `docs/**/*.md` → `data/**/*.json` (mdast with GFM + frontmatter).

## Commands

- `bun run pull` — pull latest docs. Refuses if `docs/` has uncommitted changes; `bun script.mjs --force` overrides. **Wipes `docs/`** — never run it on uncommitted refinements.
- `bun run data` — regenerate `data/` from `docs/` (rebuilds the whole dir).
- `bun run data:check` — same, plus verifies JSON → Markdown → JSON round-trip.
- `bun run fmt` — format the repo with `bun fmt` (`bun script.mjs --fmt`). Options are inline flags in `script.mjs` (no config file): tabs, no semi, single quotes, print width 180, prose never wrapped. `node_modules/` and `data/` are ignored.

After editing anything in `docs/`, run `bun run fmt` then `bun run data`.

## Tooling

Bun only, plain JavaScript (ESM). No TypeScript, no `tsconfig.json`.

- `bun <file>`, `bun run <script>`, `bun install`, `bunx` — never node/npm/npx.
- `Bun.file` / `Bun.write` for file I/O, `Bun.Glob` for walking, `Bun.$` for shell, `Bun.argv`, `import.meta.dir`.
- `node:fs/promises` only for what Bun lacks (`rm`, `rename`, `readdir`).

Detailed rules live in `.claude/rules/`.
