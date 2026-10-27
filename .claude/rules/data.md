---
paths:
 - 'data/**'
---

# data/ is generated

`data/**/*.json` is mdast generated from `docs/**/*.md` by `md-json.mjs`. Never edit it by hand — edit the source `.md` in `docs/` and run `bun run data`. Use `bun run data:check` to verify the JSON round-trips back to the same tree.
