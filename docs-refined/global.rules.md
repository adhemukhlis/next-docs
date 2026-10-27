# Global rules

Rules for every document in `docs-refined/`. A `<name>.rules.md` next to a document overrides these where they conflict. Read this file before refining any document.

## No rules file, no refining

Refine `<name>.md` only when `<name>.rules.md` exists next to it. Without one, the document stays as the upstream copy:

- Don't rewrite its content, even where it breaks the rules below.
- Upstream changes are ported as-is from `git diff -- docs/<name>.md`, without refining them.
- Only mechanical, script-driven changes apply (`bun run fmt`, link conversion) plus whatever `bun run build` requires to pass.

To refine such a document, its `<name>.rules.md` has to be written first.

## Audience: AI agents

These docs are written for AI coding agents that use them as context. They stay readable for humans, but carry no guidance meant only for humans.

- Prefer a non-interactive command with explicit flags or a config file over interactive steps. Don't reproduce interactive prompt transcripts ("you'll see the following prompts…").
- No click-through UI walkthroughs or "you'll see" narration. Give the command, file, or config that produces the result.
- Keep what an agent needs to act: exact commands, flags, file names, code, and constraints (versions, defaults).

## Scope: App Router only, no legacy

- Document the App Router only. Don't mention, compare with, or link to the Pages Router — not even to say it exists or how to migrate from it.
- Remove legacy APIs and patterns: `pages/` directory, `getServerSideProps`, `getStaticProps`, `getStaticPaths`, `getInitialProps`, `next/router`, `_app`, `_document`, API Routes, and "if you're using the Pages Router..." asides.
- When a document shows both a current and an older way, keep the current one; drop the older one unless it is the only stable option.
- Don't explain history: no "previously", "in older versions", "the original router", or "still supported".
- Stable, first-class APIs first. Don't present experimental or canary-only flags as the default path; if a feature needs `experimental.*`, say so near the top.

## Terminology: no "page" / "pages"

"Page" is ambiguous with the Pages Router, so don't use it in prose.

| Instead of                               | Write                                       |
| ---------------------------------------- | ------------------------------------------- |
| this page, the next page, see this page  | this document, the next document, see …     |
| a page, the page (a URL a user visits)   | a route, the route                          |
| page component, page file                | `page.tsx` / `page.jsx` (see below)         |
| page load, page navigation, page refresh | initial load, navigation, full reload       |
| static page, dynamic page                | static route, dynamic route                 |
| multi-page / single-page app             | multi-route app / single-route app (or SPA) |

Exempt, keep as-is:

- Code: anything inside inline code or code fences, file paths, and API names like `pageExtensions` — except the file convention below.
- URLs and link targets.
- Proper names of external things (e.g. a third-party product or spec name).

## The `page` file convention

A route's UI file is a React component, so always name it with its JSX extension: `page.tsx` or `page.jsx`.

- Never bare `page`, and never `page.js` / `page.ts` — `.js` hides that the file contains JSX, and a `.ts` file can't contain JSX at all.
- Match the language of the surrounding example: `page.tsx` next to TypeScript, `page.jsx` next to JavaScript. In prose with no example, use `page.tsx`.
- Applies to prose, inline code, and code fence filenames: a `jsx` block uses `filename="app/.../page.jsx"`, a `tsx` block `filename="app/.../page.tsx"` (TS/JS switcher pairs must match each other).

## Links

- Internal links are file paths relative to the linking document, with the real file names (`NN-` prefixes and `.md` included): `[Forms](../02-guides/forms.md#server-actions)`, not `[Forms](./app/02-guides/forms.md)`. This also applies to reference definitions.
- Never `/docs/app/...` URLs, and never a bare `/app/...` — `app/` reads as the project's routing folder.
- Keep `#anchors`. Images (`/docs/light/...`, `/docs/dark/...`) and external URLs are not internal links.
- Links to content outside `docs-refined/` (`/docs/pages/...`, `/docs/architecture/...`, `/docs/messages/...`) are dead: remove them or rewrite the sentence when refining.
- `bun run fmt` converts `/docs/app/...` links automatically; `bun run build` fails on `/docs/app/...` links and on paths that don't resolve.

## No links in metadata: use an explicit INDEX

Frontmatter is metadata only: `title`, `description`, and `nav_title` / `version` when needed. Never put links in it — no `related` block, no `related.links`. Links there have no titles, aren't parsed as links in `docs-json/`, and only render on nextjs.org.

Related documents go in the body instead, as an explicit `## INDEX` section at the end of the document:

```md
## INDEX

Related documents:

- [Installation](./01-getting-started/01-installation.md)
- [Project structure and organization](./01-getting-started/02-project-structure.md)
```

- Heading is exactly `## INDEX`, last section of the document.
- The section holds one or two groups, each a fixed lead line followed by a list. No other text — no custom intro sentences.
  - `Documents in this section:` — the documents this one contains: the full tree in `docs-refined/index.md`, the direct children in a section's `index.md`. Only in those index documents, always first.
  - `Related documents:` — documents related to this one (what used to be `related`).
- List items: `- [<frontmatter title of the target>](<relative path>)`. Titles only, no per-item descriptions.
- Related documents keep the order of the old `related.links`. Drop links to documents that don't exist in `docs-refined/`.
- `bun run build` enforces this: it rejects any frontmatter key other than `title`, `description`, `nav_title`, `version`, a `## INDEX` that isn't the last section, and anything in it other than the two leads, each followed by a list.

## Package manager: npm and pnpm only

Show commands for `npm` (`npm`, `npx`) and `pnpm` only. The AI agent consuming these docs adapts them to the project's package manager when it is something else, so more variants are noise.

- Delete the `yarn` and `bun` variants: `bash package="yarn"` / `package="bun"` blocks, and the same commands in prose or tables.
- Keep the `bash package="pnpm"` and `bash package="npm"` blocks, in that order (upstream's order), as a pair. When upstream only has an npm command, don't invent the pnpm one.
- Don't mention other package managers ("or use yarn…", "with bun…") unless the document is about one specifically.

## Writing

- Short and direct. Cut repetition, marketing tone, and filler.
- Never invent APIs, options, or behavior. If unsure, check `docs/` or upstream source.
