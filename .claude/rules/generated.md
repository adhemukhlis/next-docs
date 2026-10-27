---
paths:
 - 'docs-json/**'
 - 'docs-context/**'
---

# docs-json/ and docs-context/ are generated

`md-json.mjs` builds them from `docs-refined/`:

- `docs-json/**/*.json` — mdast of each refined file. Rules in `md-json.mjs` (`rules` array) validate every tree; any violation fails the build and nothing is written.
- `docs-context/**/*.md` — final Markdown serialized back from `docs-json/`, used as context.

Never edit either by hand. Fix the source in `docs-refined/` (or a rule in `md-json.mjs`) and run `bun run build`. `bun run build:check` also verifies `docs-context/` parses back to the same mdast.
