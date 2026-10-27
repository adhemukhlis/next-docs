# next-docs

Refined [Next.js](https://github.com/vercel/next.js/tree/canary/docs) documentation (`canary`): App Router only, stable first-class APIs, no legacy Pages Router content.

| Directory       | Content                                                              | Produced by          |
| --------------- | -------------------------------------------------------------------- | -------------------- |
| `docs/`         | Upstream docs, kept original (used to detect official changes)       | `fetch.mjs`          |
| `docs-refined/` | AI-refined docs, same structure and file names as `docs/`            | AI, synced by script |
| `docs-json/`    | mdast JSON of `docs-refined/`, validated against structure rules     | `md-json.mjs`        |
| `docs-context/` | Final Markdown rebuilt from `docs-json/`, ready to use as AI context | `md-json.mjs`        |

## Getting Started

```bash
bun install
bun run pull    # fetch upstream into docs/, sync docs-refined/, report files to refine
bun run build   # docs-refined/ -> docs-json/ -> docs-context/
```
