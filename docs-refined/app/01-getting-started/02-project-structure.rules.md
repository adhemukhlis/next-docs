# Rules: app/01-getting-started/02-project-structure.md

Lock for `docs-refined/app/01-getting-started/02-project-structure.md`, on top of `global.rules.md`; where they conflict, this file wins. Read both before every edit to `app/01-getting-started/02-project-structure.md`, including when porting upstream changes.

## Purpose

Map of every folder and file convention in a Next.js App Router project, and the options for organizing project files around them. An agent reads it to know which names are special, which extensions they take, and where code can live without becoming routable. It is not a reference for any single convention: each one's behavior and API belong in its document under `../03-api-reference/03-file-conventions/` — link to it.

## Content (in this order)

1. Frontmatter: `title: Project structure and organization`, `nav_title: Project Structure`, and `description: Map the folder and file conventions of a Next.js App Router project (top-level folders and files, routing files, route patterns, metadata files) and the options for organizing project files around them.` — one technical sentence naming the sections in order. Imperative, no "Learn". Update it when sections are added or removed. No other keys.
2. Intro: "This document lists **all** the folder and file conventions in Next.js, then the options for organizing your project."
3. `## Folder and file conventions`, with these subsections, each a lead sentence plus a table:
   1. `### Top-level folders`, in this order: `src` (Optional application source folder), `app` (App Router (`src/app` when using `src`)), `public` (Static assets to be served).
   2. `### Top-level files`, under the **Next.js** row, in this order: `next.config.ts`, `package.json`, `pnpm-workspace.yaml`, `instrumentation.ts`, `proxy.ts`, `.env`, `.env.local`, `.env.production`, `.env.development`, `eslint.config.mjs`, `biome.json`, `.gitignore`, `next-env.d.ts`, `tsconfig.json`, `jsconfig.json`. `pnpm-workspace.yaml` ("pnpm settings, such as which dependencies may run build scripts (pnpm only)") and `biome.json` ("Configuration file for Biome") are added here, not in upstream, and have no link.
   3. `### Routing files`: lead sentence naming `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`; table rows `layout`, `page`, `loading`, `not-found`, `error`, `global-error`, `route`, `template`, `default`, each with its extensions and description. Every row lists `.jsx` `.tsx` except `route` (`.js` `.ts`).
   4. `### Nested routes`, `### Dynamic routes`, `### Route groups and private folders`, `### Parallel and intercepted routes`: path → URL pattern tables.
   5. `### Metadata file conventions` with `#### App icons`, `#### Open Graph and Twitter images`, `#### SEO`. The generated (code) rows of `icon`, `apple-icon`, `opengraph-image`, and `twitter-image` list `.jsx` `.tsx`; the generated `sitemap` and `robots` rows list `.js` `.ts`.
4. `## Organizing your project`: `### Component hierarchy`, `### Colocation`, `### Private folders`, `### Route groups`, `### \`src\` folder`.
5. `## Examples`: lead paragraph, a `[!TIP]` Good to know on placeholder folder names, then one `###` per strategy in upstream order: `### Store project files outside of \`app\``, `### Store project files in top-level folders inside of \`app\``, `### Split project files by feature or route`, `### Organize routes without affecting the URL path`, `### Opting specific segments into a layout`, `### Opting for loading skeletons on a specific route`, `### Creating multiple root layouts`. Text only.

## Sources

- `./01-installation.md` (`## Generated project`): every folder and file listed there (`src/app`, `next.config.ts`, `pnpm-workspace.yaml`, `biome.json`, `tsconfig.json`) appears in the top-level tables here, with the same names. When that list changes, update the tables to match.
- Each linked table row points to that convention's reference document; file names follow those references, extensions follow the global React files rule. When a reference adds or drops a convention, update the matching row.

## Keep

- Every table row of the conventions, with its file name, URL pattern, and notes, except what Remove lists.
- The component hierarchy order: `layout.tsx`, `template.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`, `page.tsx` or nested `layout.tsx`.
- The private folder details: `_folderName` opts the folder and its subfolders out of routing; `%5FfolderName` for URL segments that start with an underscore.
- The route group syntax `(folderName)` and the intercept patterns `(.)`, `(..)`, `(..)(..)`, `(...)`.
- Link anchors to reference documents as upstream has them (e.g. `#generate-icons-using-code-js-ts-tsx`), even where the extensions listed here differ.

## Remove

- The `pages` row in `### Top-level folders` and its `/docs/pages/...` link (Pages Router).
- "This page provides an overview…" — replaced by the intro in Content.
- The `next.config.js` label in `### Top-level files` → `next.config.ts` (matches Installation's generated project; the link stays).
- `.js` on files with JSX, in prose, lists, and extension columns (global React files rule): upstream's `.js` `.jsx` `.tsx` rows become `.jsx` `.tsx`, and upstream's generated icon and image rows (`.js` `.ts` `.tsx`) become `.jsx` `.tsx`.
- "page" / "pages" in prose: "Page" (routing files table description) → "Route UI"; "Parallel route fallback page" → "Parallel route fallback"; "marketing pages, admin pages" → "marketing routes, admin routes"; "dashboard → overview page instead of all your dashboard pages" → "dashboard → overview route instead of all your dashboard routes".
- Title Case headings: `### Routing Files` → `### Routing files`, `### Parallel and Intercepted Routes` → `### Parallel and intercepted routes` (anchors don't change).
- The self-link `./02-project-structure.md#routing-files` → `#routing-files`.
- "In the example above, both `(marketing)` and `(shop)` have their own root layout." in `### Creating multiple root layouts` — it describes a removed image.

## Upstream changes

Port `git diff -- docs/app/01-getting-started/02-project-structure.md` refined per these rules. Copy new or changed convention rows and URL patterns verbatim, with extensions adjusted per the global React files rule, except what Remove lists. `pnpm-workspace.yaml` and `biome.json` have no upstream counterpart: upstream changes never remove them. Never carry over Pages Router rows, links, or asides, or text that only describes an image.
