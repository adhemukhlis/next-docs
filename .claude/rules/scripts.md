---
paths:
 - '*.js'
 - '*.mjs'
 - 'package.json'
---

# Script rules

- Bun runtime, plain JavaScript ESM (`"type": "module"`). No TypeScript, no `tsconfig.json`, no Node-only tooling.
- Use Bun APIs first: `Bun.file().text()`, `Bun.write`, `new Bun.Glob().scan()`, `Bun.$` (shell), `Bun.argv`, `import.meta.dir`. Fall back to `node:fs/promises` only for `rm`/`rename`/`readdir`.
- Formatting is `bun fmt` with inline flags in `format()` in `fetch.mjs` — the single source of formatting options. No formatter config files (`.prettierrc`, etc.).
- Match the existing style: tabs, no semicolons, single quotes, short step-by-step comments, emoji-prefixed progress logs in `fetch.mjs`.
- `fetch.mjs` deletes and recreates `docs/`. Test changes to it in a scratch copy, never against the real `docs/` with uncommitted work.
