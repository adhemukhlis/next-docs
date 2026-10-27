# next-docs

Refined [Next.js](https://github.com/vercel/next.js/tree/canary/docs) documentation (`canary`): App Router only, stable first-class APIs, no legacy Pages Router content.

- `docs/` — Markdown docs
- `data/` — the same docs as mdast JSON (generated)

## Getting Started

```bash
bun install
bun run pull   # pull latest upstream docs into docs/
bun run data   # convert docs/ -> data/ (mdast JSON)
```
