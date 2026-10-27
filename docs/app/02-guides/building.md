---
title: Building your application
description: Learn what happens when you run next build and how to read the build output.
nav_title: Building
related:
 title: Next Steps
 description: Learn more about deploying, caching, and configuring production builds.
 links:
  - ../01-getting-started/17-deploying.md
  - ../01-getting-started/08-caching.md
  - ./incremental-static-regeneration-cache-components.md
  - ./ci-build-caching.md
---

Running `next build` compiles your application for production, [prerenders](../04-glossary.md#prerendering) eligible routes, and prints a route table showing how each route is served.

## What `next build` does

When you run `next build`, the build moves through these phases:

1. **Setup.** Loads [environment variables](./environment-variables.md) (`.env` files), validates your [`next.config`](../03-api-reference/05-config/01-next-config-js/index.md), and generates a [build ID](../03-api-reference/05-config/01-next-config-js/generateBuildId.md).
2. **Route discovery.** Scans the `app/` and `pages/` directories for routes, and detects root-level convention files like [`proxy`](../03-api-reference/03-file-conventions/proxy.md) and [`instrumentation`](../03-api-reference/03-file-conventions/instrumentation.md). Generates TypeScript route definitions.
3. **Compilation.** Bundles client, server, and edge code with [Turbopack](../03-api-reference/08-turbopack.md) (or webpack). Transpiles TypeScript and JSX, tree-shakes unused code, and optimizes CSS and fonts.
4. **Static analysis.** Classifies each route for prerendering versus on-demand rendering. Collects [`generateStaticParams`](../03-api-reference/04-functions/generate-static-params.md) output. With Cache Components, checks for [prerender-blocking errors](/docs/messages/blocking-prerender-dynamic).
5. **Prerendering.** Prerenders static pages and PPR shells to HTML. Generates [RSC payloads](../01-getting-started/05-server-and-client-components.md#on-the-server) for client-side navigation.
6. **Output.** Writes the build to `.next/`. For [`output: 'standalone'`](./self-hosting.md), bundles only the files needed at runtime. For [`output: 'export'`](./static-exports.md), generates a full static site. Prints the route table.

The build checks TypeScript unless [`typescript.ignoreBuildErrors`](../03-api-reference/05-config/01-next-config-js/typescript.md) is enabled.

`next dev` stores the running development server's state and incremental compilation caches in `.next/dev`. Deleting or moving `.next` discards that state, so the development server has to recreate it. To run an isolated production build, configure a separate [`distDir`](../03-api-reference/05-config/01-next-config-js/distDir.md).

## Reading the build output

The build command depends on your package manager:

```bash package="pnpm"
pnpm build
```

```bash package="npm"
npm run build
```

```bash package="yarn"
yarn build
```

```bash package="bun"
bun run build
```

After a successful build, Next.js prints a route table with a symbol next to each route.

The symbols differ depending on whether Cache Components is enabled.

### Without Cache Components

Without Cache Components, App Router pages and Pages Router routes use these rendering classifications:

| Symbol | Name    | Behavior                                                                          |
| ------ | ------- | --------------------------------------------------------------------------------- |
| `○`    | Static  | Next.js prerenders the entire route as HTML.                                      |
| `●`    | SSG     | Next.js prerenders paths from `generateStaticParams` or `getStaticProps` as HTML. |
| `ƒ`    | Dynamic | Next.js renders the route on demand.                                              |

### With Cache Components

With [Cache Components](../03-api-reference/05-config/01-next-config-js/cacheComponents.md), [Partial Prerendering](../01-getting-started/08-caching.md#static-cached-and-streaming) is the only rendering model for App Router pages. For these pages, the symbols describe how much HTML the build produced:

| Symbol | Name              | Behavior                                                                            |
| ------ | ----------------- | ----------------------------------------------------------------------------------- |
| `○`    | Static            | Next.js prerenders the entire route as HTML.                                        |
| `◐`    | Partial Prerender | Next.js prerenders a static HTML shell and renders the remaining content on demand. |
| `ƒ`    | Dynamic           | Next.js renders the route on demand.                                                |

For a Cache Components page, `ƒ` means the build accepted an empty HTML prerender. Next.js renders the route on request. A dynamic route can also include a fallback for pathnames not returned by `generateStaticParams`.

### Other route entries

Request-dependent [Route Handlers](../03-api-reference/03-file-conventions/route.md) (API endpoints), Proxy (Middleware), and dynamic metadata routes such as `icon`, `opengraph-image`, and `twitter-image` use `ƒ`. These entries render on demand and do not use PPR.

### Prerender validation

With Cache Components, `next build` validates that each App Router page can produce a static shell. Request-time values such as `params`, `cookies()`, and `headers()` outside of `<Suspense>` produce a [runtime data error](/docs/messages/blocking-prerender-runtime). Uncached data produces an [uncached data error](/docs/messages/blocking-prerender-dynamic). Each error links to the fixes that apply to that data source.

### Debug prerender errors

Production builds minify server code and omit server source maps by default. Use [`--debug-prerender`](../03-api-reference/06-cli/next.md#debugging-prerender-errors) for more detailed stack traces and code frames:

```bash filename="Terminal"
next build --debug-prerender
```

The option disables server minification, enables server source maps, and prevents one failed route from stopping the rest of the build.

> **Warning**: Do not deploy builds produced with `--debug-prerender`. These builds include debugging options and are not optimized for production.

### Build specific routes

Use [`--debug-build-paths`](../03-api-reference/06-cli/next.md#building-specific-routes) to compile and prerender selected routes while debugging a large application. The option accepts comma-separated paths and glob patterns. Prefix a pattern with `!` to exclude it. You can also combine it with `--debug-prerender`.

Only matching routes appear in the route table. When you select an App Router route, Next.js also includes the built-in `/_not-found` route.

## Example

> **Good to know**: The following example uses [Cache Components](../03-api-reference/05-config/01-next-config-js/cacheComponents.md) with [Partial Prefetching](../03-api-reference/05-config/01-next-config-js/partialPrefetching.md), enabled with `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`. The route symbols and prerender errors differ when Cache Components is disabled. See [Enabling Cache Components](../01-getting-started/08-caching.md#enabling-cache-components) for setup.

### Find blocking work

In this example, a store application has a product page with a dynamic `[id]` segment:

```txt
app/
├── layout.tsx
├── page.tsx
└── products/
    └── [id]/
        └── page.tsx
```

The page reads the `id` param to fetch the product:

```tsx filename="app/products/[id]/page.tsx" switcher
export default async function Page(props: PageProps<'/products/[id]'>) {
	const { id } = await props.params
	const res = await fetch(`https://api.example.com/products/${id}`)
	const product = await res.json()
	return <div>{product.name}</div>
}
```

```jsx filename="app/products/[id]/page.js" switcher
export default async function Page({ params }) {
	const { id } = await params
	const res = await fetch(`https://api.example.com/products/${id}`)
	const product = await res.json()
	return <div>{product.name}</div>
}
```

Run `next build`. Next.js prerenders as much of each route as it can before printing the build output. In this case, the build fails:

```bash filename="Terminal"
Error: Route "/products/[id]": Next.js encountered uncached or runtime data during prerendering.

`fetch(...)`, `cookies()`, `headers()`, `params`, `searchParams`, or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered, blocking the page load and leading to a slower user experience.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] For uncached data (`fetch`, database calls): cache the access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route

Learn more: https://nextjs.org/docs/messages/blocking-prerender-dynamic
    at body (<anonymous>)
    at html (<anonymous>)
To get a more detailed stack trace and pinpoint the issue, try one of the following:
  - Start the app in development mode by running `next dev`, then open "/products/[id]" in your browser to investigate the error.
  - Rerun the production build with `next build --debug-prerender` to generate better stack traces.
Error occurred prerendering page "/products/[id]".
```

The error shows that request-time work is blocking prerendering, but the stack only points to `body` and `html`. It does not identify the source line. Combining the two debugging options produces a detailed stack trace for the product route:

```bash filename="Terminal"
next build --debug-prerender --debug-build-paths="app/products/[id]/page.tsx"
```

The stack now points to the first blocked access in the page, the `params` read:

```bash filename="Terminal"
Error: Route "/products/[id]": Next.js encountered uncached or runtime data during prerendering.
  ...
    at Page (app/products/[id]/page.tsx:2:30)
  1 | export default async function Page(props: PageProps<'/products/[id]'>) {
> 2 |   const { id } = await props.params
    |                              ^
  3 |   const res = await fetch(`https://api.example.com/products/${id}`)
  4 |   const product = await res.json()
```

The detailed stack identifies the [`params`](../03-api-reference/03-file-conventions/page.md#params-optional) read as the first blocked access.

During development, `next dev` shows all validation errors in the dev overlay and terminal with stack frames that resolve to your source. It reruns validation as you edit. See [Ensuring instant navigations](./instant-navigation.md) for the development workflow.

This guide uses production builds for the rest of the walkthrough so you can compare how each change affects the route table.

The error offers three options based on whether the request-time work can stream, be cached, or must block the route. The first approach streams fallback UI.

### A streaming product page

Choose the error's `[stream]` option when the route has useful UI to show while request-time data loads. Next.js prerenders that fallback, then replaces it with the product page after the params and product data resolve. In this route, a [`loading.js`](../03-api-reference/03-file-conventions/loading.md) file provides the fallback:

```tsx filename="app/products/[id]/loading.tsx" switcher
export default function Loading() {
	return <div>Loading...</div>
}
```

```jsx filename="app/products/[id]/loading.js" switcher
export default function Loading() {
	return <div>Loading...</div>
}
```

`loading.js` wraps the page in a `<Suspense>` boundary and uses the loading component as its fallback. Next.js prerenders this fallback as the product route's static shell. The page reads the params and fetches the product at request time, then replaces the fallback with the completed content.

For more granular streaming, add an explicit `<Suspense>` boundary around only the component that needs request-time data. More of the page can then stay in the static shell. See [Streaming](./streaming.md).

Build the application:

```bash filename="Terminal"
next build
```

The build passes:

```bash filename="Terminal"
Route (app)
┌ ○ /
├ ○ /_not-found
└ ◐ /products/[id]

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

The `◐` symbol shows that the route serves a static shell and streams the remaining content.

### Prerendered product pages

The route now has a segment-wide fallback from `loading.js`. To prerender pages for known products, keep `loading.js` and use [`generateStaticParams`](../03-api-reference/04-functions/generate-static-params.md) to provide their IDs:

```tsx filename="app/products/[id]/page.tsx" switcher
export async function generateStaticParams() {
	const res = await fetch('https://api.example.com/products')
	const products = await res.json()
	return products.slice(0, 12).map((product) => ({ id: product.id }))
}

export default async function Page(props: PageProps<'/products/[id]'>) {
	const { id } = await props.params
	const res = await fetch(`https://api.example.com/products/${id}`)
	const product = await res.json()
	return <div>{product.name}</div>
}
```

```jsx filename="app/products/[id]/page.js" switcher
export async function generateStaticParams() {
	const res = await fetch('https://api.example.com/products')
	const products = await res.json()
	return products.slice(0, 12).map((product) => ({ id: product.id }))
}

export default async function Page({ params }) {
	const { id } = await params
	const res = await fetch(`https://api.example.com/products/${id}`)
	const product = await res.json()
	return <div>{product.name}</div>
}
```

Rebuild the application:

```bash filename="Terminal"
next build
```

Next.js now attempts to prerender a page for each product ID:

```bash filename="Terminal"
Route (app)
┌ ○ /
├ ○ /_not-found
└   /products/[id]      # Route pattern group
  ├ ◐ /products/[id]    # Fallback row
  ├ ◐ /products/1       # Product content streams into the static shell
  ├ ◐ /products/2
  └ ◐ [+10 more paths]

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

The unmarked `/products/[id]` row groups the route outputs beneath it. When there are more prerendered paths than fit in the table, Next.js prints a short list ending with `[+N more paths]`. Each indented row stays `◐`. The `loading.js` fallback is prerendered, then the product loads at request time and streams into that shell.

> **Good to know**: `generateStaticParams` is optional. Use it when a set of pathnames is known at build time and worth prerendering. With Cache Components, it must return at least one param. An empty array causes a [build error](/docs/messages/empty-generate-static-params).

### Cached product data

Choose the error's `[cache]` option when the product lookup can be reused across requests instead of running for every visitor. Caching lets Next.js include the product data when it prerenders a known product, producing complete HTML for those paths. Add `use cache` to the lookup:

```tsx filename="app/products/[id]/page.tsx" switcher
export async function generateStaticParams() {
	const res = await fetch('https://api.example.com/products')
	const products = await res.json()
	return products.slice(0, 12).map((product) => ({ id: product.id }))
}

async function getProduct(id: string) {
	'use cache'
	const res = await fetch(`https://api.example.com/products/${id}`)
	return res.json()
}

export default async function Page(props: PageProps<'/products/[id]'>) {
	const { id } = await props.params
	const product = await getProduct(id)
	return <div>{product.name}</div>
}
```

```jsx filename="app/products/[id]/page.js" switcher
export async function generateStaticParams() {
	const res = await fetch('https://api.example.com/products')
	const products = await res.json()
	return products.slice(0, 12).map((product) => ({ id: product.id }))
}

async function getProduct(id) {
	'use cache'
	const res = await fetch(`https://api.example.com/products/${id}`)
	return res.json()
}

export default async function Page({ params }) {
	const { id } = await params
	const product = await getProduct(id)
	return <div>{product.name}</div>
}
```

Rebuilding the application shows the listed params as `○`. Their params are known and their data is cached, so Next.js prerenders each page in full. The fallback row remains `◐`:

```bash filename="Terminal"
Route (app)
┌ ○ /
├ ○ /_not-found
└   /products/[id]      # Route pattern group
  ├ ◐ /products/[id]    # Fallback row
  ├ ○ /products/1       # Full HTML prerender
  ├ ○ /products/2
  └ ○ [+10 more paths]

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

The `/products/[id]` fallback represents product IDs not returned by `generateStaticParams`. It stays `◐` because the build does not know every product ID. On the first visit to an unlisted product, [Partial Prefetching](../03-api-reference/05-config/01-next-config-js/partialPrefetching.md) serves the `loading.js` fallback immediately while Next.js renders the page for that ID and stores it in the [ISR cache](../04-glossary.md#incremental-static-regeneration-isr). Later visits receive the completed page instead of the fallback. See [ISR with Cache Components](./incremental-static-regeneration-cache-components.md) for the complete upgrade flow.

Routes that contain cached functions or components can also show `Revalidate` and `Expire` columns. A route reports the shortest `revalidate` and `expire` across all the caches it contains. Caches use the [`default` profile](../03-api-reference/04-functions/cacheLife.md#preset-cache-profiles) when there is no explicit [`cacheLife`](../03-api-reference/04-functions/cacheLife.md) call. A `/products` listing page that renders the same cached data produces this output:

```bash filename="Terminal"
Route (app)           Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ○ /products                15m      1y
└   /products/[id]
  ├ ◐ /products/[id]
  ├ ○ /products/1            15m      1y
  ├ ○ /products/2            15m      1y
  └ ○ [+10 more paths]
```

The default [`use cache` profile](../03-api-reference/04-functions/cacheLife.md#preset-cache-profiles) revalidates after 15 minutes. The route's default [`expireTime`](../03-api-reference/05-config/01-next-config-js/expireTime.md) is one year, so the table shows `15m` and `1y`. You can configure both values in `next.config.ts`.

### A blocking product page

Choose the error's `[block]` option when waiting for request-time work is the correct behavior for the route. The route may need the completed result before it responds, or you may want to defer a difficult refactor while [adopting Cache Components incrementally](./migrating-to-cache-components.md#adopting-incrementally).

Suppose this product route needs to remain blocking for now. Keep `generateStaticParams`, remove the `loading` file and the `use cache` directive, then set `instant = false`:

```tsx filename="app/products/[id]/page.tsx" switcher
import { notFound } from 'next/navigation'

export const instant = false

export async function generateStaticParams() {
	const res = await fetch('https://api.example.com/products')
	const products = await res.json()
	return products.slice(0, 12).map((product) => ({ id: product.id }))
}

export default async function Page(props: PageProps<'/products/[id]'>) {
	const { id } = await props.params
	const res = await fetch(`https://api.example.com/products/${id}`)
	if (!res.ok) {
		notFound()
	}
	const product = await res.json()
	return <div>{product.name}</div>
}
```

```jsx filename="app/products/[id]/page.js" switcher
import { notFound } from 'next/navigation'

export const instant = false

export async function generateStaticParams() {
	const res = await fetch('https://api.example.com/products')
	const products = await res.json()
	return products.slice(0, 12).map((product) => ({ id: product.id }))
}

export default async function Page({ params }) {
	const { id } = await params
	const res = await fetch(`https://api.example.com/products/${id}`)
	if (!res.ok) {
		notFound()
	}
	const product = await res.json()
	return <div>{product.name}</div>
}
```

With the `loading` boundary removed, no fallback can render while the page awaits `params` and the product lookup. Removing `use cache` means the lookup also runs for each request. The server waits for both before returning the product page or a `404`. During a client navigation, the destination has no fallback to show until this work completes.

[`instant = false`](../03-api-reference/03-file-conventions/02-route-segment-config/instant.md) disables instant-navigation validation for this route, including the check that its static shell is non-empty. It does not change the rendering model or prevent prerendering.

The build output now shows:

```bash filename="Terminal"
Route (app)
┌ ○ /
├ ○ /_not-found
└   /products/[id]      # Route pattern group
  ├ ƒ /products/[id]    # Empty fallback for unlisted IDs
  ├ ƒ /products/1       # Rendered on request with no HTML prerender
  ├ ƒ /products/2
  └ ƒ [+10 more paths]

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

The indented `/products/[id]` row is the fallback for IDs not returned by `generateStaticParams`. The other indented rows are the generated product paths. The product lookup blocks the generated paths before they produce HTML, while `params` blocks the fallback first. Every prerender is empty and uses `ƒ`. When a shared layout wraps `children` in `<Suspense>`, Next.js preserves its fallback as the static shell and uses `◐` instead.

Synchronous values such as [`Math.random()`](/docs/messages/blocking-prerender-random), [`new Date()`](/docs/messages/blocking-prerender-current-time), and [`crypto.randomUUID()`](/docs/messages/blocking-prerender-crypto) still produce prerender errors.
