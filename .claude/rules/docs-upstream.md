---
paths:
 - 'docs/**'
---

# docs/ is the upstream mirror

`docs/` holds the original Next.js docs as produced by `fetch.mjs` (sparse clone + MDX cleanup + ignore list + formatting, GFM alert fix, internal links rewritten to relative file paths). Never edit it by hand — it must stay original so upstream changes show up in `git diff -- docs`.

- Read it to see what upstream says, or `git diff -- docs/<file>` to see what upstream changed since the last commit.
- To change how it is produced (ignore a file/dir, cleanup rules), edit `fetch.mjs` and rerun `bun run pull`.
- All refinement happens in `docs-refined/`.
