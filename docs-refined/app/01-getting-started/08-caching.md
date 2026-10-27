---
title: Caching
description: Learn how to cache data and UI in Next.js
---

> This page covers caching with [Cache Components](../03-api-reference/05-config/01-next-config-js/cacheComponents.md), enabled by setting [`cacheComponents: true`](../03-api-reference/05-config/01-next-config-js/cacheComponents.md) in your `next.config.ts` file. If you're not using Cache Components, see the [Caching and Revalidating (Previous Model)](../02-guides/caching-without-cache-components.md) guide.

Caching is a technique for storing the result of data fetching and other computations so that future requests for the same data can be served faster, without doing the work again.

## Enabling Cache Components

New App Router apps created with the recommended [`create-next-app`](../03-api-reference/06-cli/create-next-app.md) defaults already have Cache Components and Partial Prefetching enabled.

To enable it in an existing or manually created app, add the [`cacheComponents`](../03-api-reference/05-config/01-next-config-js/cacheComponents.md) and [`partialPrefetching`](../03-api-reference/05-config/01-next-config-js/partialPrefetching.md) options to your Next config file:

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
}

export default nextConfig
```

```js filename="next.config.js" switcher
/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
}

module.exports = nextConfig
```

Set `partialPrefetching` explicitly. Leaving it unset logs a warning, because the first release of Cache Components did not include Partial Prefetching. Set it to `false` only while [migrating an app that adopted Cache Components before Partial Prefetching](../02-guides/adopting-partial-prefetching.md). Both features will be enabled everywhere in the next major release, and the options will be removed.

> **Good to know:** When Cache Components is enabled, `GET` Route Handlers follow the same prerendering model as pages. See [Route Handlers with Cache Components](./15-route-handlers.md#with-cache-components) for details.

## Usage

The [`use cache`](../03-api-reference/01-directives/use-cache.md) directive caches the return value of async functions and components. You can apply it at two levels:

- **Data-level**: Cache a function that fetches or computes data (e.g., `getProducts()`, `getUser(id)`)
- **UI-level**: Cache an entire component or page (e.g., `async function BlogPosts()`)

A cache directive gives a result a lifetime, which Next.js uses for time-based revalidation and rendering optimizations. For on-demand revalidation after a mutation, see [Revalidating](./09-revalidating.md). See [Prerendering](#prerendering) for how cached results become part of the static shell and may be included in a [prefetch](#prefetching).

> **Good to know:** We recommend pairing every cache directive with a [`cacheLife`](../03-api-reference/04-functions/cacheLife.md). Without one, the implicit `default` profile applies.

Arguments and any values captured from parent scopes automatically become part of the [cache key](../03-api-reference/01-directives/use-cache.md#cache-keys), which means different inputs will produce separate cache entries. See [cache output](../03-api-reference/01-directives/use-cache.md#cache-output) for what an entry holds, and [serialization requirements and constraints](../03-api-reference/01-directives/use-cache.md#constraints) for details on what can be cached and how arguments work.

### Data-level caching

To cache an asynchronous function that fetches data, add the `use cache` directive at the top of the function body:

```tsx filename="app/lib/data.ts" highlight={1,4,5}
import { cacheLife } from 'next/cache'

export async function getUsers() {
	'use cache'
	cacheLife('hours')
	return db.query('SELECT * FROM users')
}
```

Data-level caching is useful when the same data is used across multiple components, or when you want to cache the data independently from the UI.

### UI-level caching

To cache an entire component, page, or layout, add the `use cache` directive at the top of the component or page body:

```tsx filename="app/page.tsx" highlight={1,4,5}
import { cacheLife } from 'next/cache'

export default async function Page() {
	'use cache'
	cacheLife('hours')

	const users = await db.query('SELECT * FROM users')

	return (
		<ul>
			{users.map((user) => (
				<li key={user.id}>{user.name}</li>
			))}
		</ul>
	)
}
```

> If you add "`use cache`" at the top of a file, all exported functions in the file will be cached.

### Streaming uncached data

For components that fetch data from an asynchronous source such as an API, a database, or any other async operation, and require fresh data on every request, do not use `"use cache"`.

Instead, wrap the component in [`<Suspense>`](https://react.dev/reference/react/Suspense) and provide a fallback UI. The fallback ships with the prerendered shell while the async work runs at request time.

```tsx filename="page.tsx"
import { Suspense } from 'react'

async function LatestPosts() {
	const data = await fetch('https://api.example.com/posts')
	const posts = await data.json()
	return (
		<ul>
			{posts.map((post) => (
				<li key={post.id}>{post.title}</li>
			))}
		</ul>
	)
}

export default function Page() {
	return (
		<>
			<h1>My Blog</h1>
			<Suspense fallback={<p>Loading posts...</p>}>
				<LatestPosts />
			</Suspense>
		</>
	)
}
```

For example, `<p>Loading posts...</p>` is included in the static shell, and the posts stream in at request time.

Without a `<Suspense>` boundary around the uncached read, the dev overlay surfaces the **blocking-route** insight with this fix:

<FixCardGrid>
  <FixCard
    group="stream"
    title="Wrap in or move into Suspense"
    href="/docs/messages/blocking-prerender-dynamic#wrap-in-or-move-into-suspense"
    snippets={[
      { text: '<Suspense fallback={…}>', highlight: true },
      { text: '  <DataChild />' },
      { text: '</Suspense>', highlight: true },
    ]}
  />
</FixCardGrid>

> **Good to know:** Each fix card links to a detailed walkthrough with patterns, code samples, and trade-offs. Click a card to dive in.

`<Suspense>` provides a fallback UI while async work completes, but it does not itself opt a component into dynamic rendering. If a component only performs synchronous work, it will complete during prerendering regardless of whether it is wrapped in `<Suspense>`.

## Working with runtime APIs

Runtime APIs require information that is only available when a user makes a request. These include:

- [`cookies`](../03-api-reference/04-functions/cookies.md) - User's cookie data
- [`headers`](../03-api-reference/04-functions/headers.md) - Request headers
- [`searchParams`](../03-api-reference/03-file-conventions/page.md#searchparams-optional) - URL query parameters
- [`params`](../03-api-reference/03-file-conventions/page.md#params-optional) - Dynamic route parameters. Use [`generateStaticParams`](../03-api-reference/04-functions/generate-static-params.md) to prerender specific values at build time, or [ISR with Cache Components](../02-guides/incremental-static-regeneration-cache-components.md) to serve an [App Shell](../04-glossary.md#app-shell) while unknown params resolve in the background.

Components that access runtime APIs should be wrapped in `<Suspense>`:

```tsx filename="page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'

async function UserGreeting() {
	const cookieStore = await cookies()
	const theme = cookieStore.get('theme')?.value || 'light'
	return <p>Your theme: {theme}</p>
}

export default function Page() {
	return (
		<>
			<h1>Dashboard</h1>
			<Suspense fallback={<p>Loading...</p>}>
				<UserGreeting />
			</Suspense>
		</>
	)
}
```

A runtime API access without `<Suspense>` surfaces the same **blocking-route** insight in the dev overlay, with the same fix:

<FixCardGrid>
  <FixCard
    group="stream"
    title="Wrap in or move into Suspense"
    href="/docs/messages/blocking-prerender-dynamic#wrap-in-or-move-into-suspense"
    snippets={[
      { text: '<Suspense fallback={…}>', highlight: true },
      { text: '  <DataChild />' },
      { text: '</Suspense>', highlight: true },
    ]}
  />
</FixCardGrid>

Runtime-dependent data can still be given a cache lifetime with [`"use cache: private"`](../03-api-reference/01-directives/use-cache-private.md), another variant that ships with Cache Components. It gives a lifetime to a function that reads cookies, headers, or `searchParams` directly, so it can be included in a [prefetch](#prefetching).

The following section shows an alternative to `use cache: private`: extracting a runtime value and passing it to a shared cached function.

### Passing runtime values to cached functions

You can extract values from runtime APIs and pass them as arguments to cached functions:

```tsx filename="app/profile/page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProfileContent />
		</Suspense>
	)
}

// Component (not cached) reads runtime data
async function ProfileContent() {
	const session = (await cookies()).get('session')?.value
	return <CachedContent sessionId={session} />
}

// Cached component receives extracted value as a prop
async function CachedContent({ sessionId }: { sessionId: string }) {
	'use cache'
	// sessionId becomes part of the cache key
	const data = await fetchUserData(sessionId)
	return <div>{data}</div>
}
```

At request time, `<CachedContent />` executes if no matching cache entry is found, and stores the result for future requests with the same `sessionId`.

> **Good to know:** Because `<CachedContent />` is gated behind request data, it isn't added to the prerendered static shell. At runtime it's cached [in-memory](../03-api-reference/01-directives/use-cache.md#runtime-caching-considerations) by default, which doesn't persist across serverless requests, so it may re-evaluate on each request. Reach for [`'use cache: remote'`](../03-api-reference/01-directives/use-cache-remote.md) for durable, shared caching.

With this pattern, [prefetching](#prefetching) can prerender `<CachedContent />` with the user's actual session during a client transition and have the result ready before the click. This works even when server-side entries rarely survive between requests, because the lifetime you assign is what lets the result join the prefetch, where the client treats it as fresh for its [`cacheLife`](../03-api-reference/04-functions/cacheLife.md) `stale` window.

## Static, cached, and streaming

Here's a complete example showing static content, cached dynamic content, and streaming dynamic content working together on a single page:

```tsx filename="app/blog/page.tsx"
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'

export default function BlogPage() {
	return (
		<>
			{/* Static content - prerendered automatically */}
			<header>
				<h1>Our Blog</h1>
				<nav>
					<Link href="/">Home</Link> | <Link href="/about">About</Link>
				</nav>
			</header>

			{/* Cached dynamic content - included in the static shell */}
			<BlogPosts />

			{/* Runtime dynamic content - streams at request time */}
			<Suspense fallback={<p>Loading your preferences...</p>}>
				<UserPreferences />
			</Suspense>
		</>
	)
}

type Post = { id: string; title: string; author: string; date: string }

// Everyone sees the same blog posts (revalidated every hour)
async function BlogPosts() {
	'use cache'
	cacheLife('hours')
	cacheTag('posts')

	const res = await fetch('https://api.vercel.app/blog')
	const posts: Post[] = await res.json()

	return (
		<section>
			<h2>Latest Posts</h2>
			<ul>
				{posts.map((post) => (
					<li key={post.id}>
						<h3>{post.title}</h3>
						<p>
							By {post.author} on {post.date}
						</p>
					</li>
				))}
			</ul>
		</section>
	)
}

// UI that depends on a value stored in cookies
async function UserPreferences() {
	const theme = (await cookies()).get('theme')?.value || 'light'
	const favoriteCategory = (await cookies()).get('category')?.value

	return (
		<aside>
			<p>Your theme: {theme}</p>
			{favoriteCategory && <p>Favorite category: {favoriteCategory}</p>}
		</aside>
	)
}
```

During prerendering, the header (static) and blog posts (cached with `use cache`) become part of the static shell, along with the fallback UI for user preferences. The UI preferences stored in cookies stream in at request time.

Reading `cookies()` here doesn't opt-in the whole route into dynamic rendering, the way the previous rendering model did. The Suspense boundary provides fallback UI where the runtime access streams, while static and cached content still ship in the initial HTML.

Just as `<Suspense>` contains async access, an **error boundary** contains failures: wrap them around a subtree that might error during rendering. Use [`catchError`](../03-api-reference/04-functions/catchError.md) for component-level boundaries, or the [`error.js`](../03-api-reference/03-file-conventions/error.md) file convention for route-level boundaries.

As you build, consider that inside [`generateMetadata`](../03-api-reference/04-functions/generate-metadata.md#with-cache-components) and [`generateViewport`](../03-api-reference/04-functions/generate-viewport.md#with-cache-components), uncached fetches or runtime data access surface the same insights and errors as in your page, guiding you to the rendering you intend. For incremental static regeneration with both known and unknown param values, see [ISR with Cache Components](../02-guides/incremental-static-regeneration-cache-components.md).

## Random values and timestamps

Operations like `Math.random()`, `Date.now()`, or `crypto.randomUUID()` produce different values each time they execute. Cache Components requires you to explicitly handle these.

> **Good to know:** `performance.now()` is meant for telemetry, so Next.js doesn't treat it as a value to guard. Use it for timing and pass the result to your logger or metrics rather than rendering it.

**To generate unique values per request**, defer to request time by calling [`connection()`](../03-api-reference/04-functions/connection.md) before these operations, and wrap the component in `<Suspense>`:

```tsx filename="page.tsx" highlight={1,4-6}
import { connection } from 'next/server'
import { Suspense } from 'react'

async function UniqueContent() {
	await connection()
	const uuid = crypto.randomUUID()
	return <p>Request ID: {uuid}</p>
}

export default function Page() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<UniqueContent />
		</Suspense>
	)
}
```

Alternatively, you can **cache the result** so all users see the same value until revalidation:

```tsx filename="page.tsx"
export default async function Page() {
	'use cache'
	const buildId = crypto.randomUUID()
	return <p>Build ID: {buildId}</p>
}
```

You don't need to memorize which operations behave this way. The dev overlay surfaces a **blocking-prerender-random**, **blocking-prerender-current-time**, or **blocking-prerender-crypto** insight (depending on the call) with these fixes:

<FixCardGrid>
  <FixCard
    group="dynamic"
    title="Generate on every request"
    href="/docs/messages/blocking-prerender-random#generate-on-every-request"
    snippets={[
      { text: 'await connection()', highlight: true },
      { text: 'const id = Math.random()' },
      { text: 'return <Item id={id} />' },
    ]}
  />
  <FixCard
    group="cache"
    title="Cache the value"
    href="/docs/messages/blocking-prerender-random#cache-the-random-value"
    snippets={[
      { text: 'function RandomId() {' },
      { text: '  "use cache"', highlight: true },
      { text: '  return String(Math.random())' },
    ]}
  />
</FixCardGrid>

## Predictable values

Unlike random values and timestamps, which can vary between renders, module imports, synchronous I/O, and pure computations produce the same result every time they run. Components using only these operations are prerendered automatically, and their output becomes part of the static HTML at build time.

```tsx filename="page.tsx"
import fs from 'node:fs'

export default async function Page() {
	const constants = await import('./constants.json')
	const content = fs.readFileSync('./config.json', 'utf-8')
	const items = JSON.parse(content).items ?? []

	return (
		<div>
			<h1>{constants.appName}</h1>
			<ul>
				{items.map((item) => (
					<li key={item.id}>{item.value}</li>
				))}
			</ul>
		</div>
	)
}
```

> **Good to know:** This includes queries to embedded databases with synchronous APIs, such as `better-sqlite3` or Node.js's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html). If you need per-request data from a synchronous source, call [`connection()`](../03-api-reference/04-functions/connection.md) before the query.

Some asynchronous APIs read local resources that don't depend on the incoming request, such as fonts or configuration files. When those resources are expected to be the same for every request, read them once at module scope instead of during rendering

If the data should instead be computed during rendering and reused across requests, wrap the read in [`use cache`](../03-api-reference/01-directives/use-cache.md). If the data depends on the incoming request or is expected to change over time, read it during request-time rendering.

```tsx filename="page.tsx"
import { readFile } from 'node:fs/promises'

const content = await readFile('./config.json', 'utf-8')
const items = JSON.parse(content).items ?? []

export default function Page() {
	return (
		<ul>
			{items.map((item) => (
				<li key={item.id}>{item.value}</li>
			))}
		</ul>
	)
}
```

In this example, the configuration file is expected to be the same for every request, so it is read once at module scope. Calling `await readFile()` inside the component would be treated as uncached data that must be either accessed within `use cache` or behind a `<Suspense>` boundary. Since this file does not depend on the request and is not expected to change, module scope is the simplest option.

## Prerendering

At build time, Next.js renders your route's component tree. How each component is handled depends on the APIs it uses:

- [`use cache`](#usage): the result is cached and included in the static shell, as long as its lifetime [isn't too short](../03-api-reference/04-functions/cacheLife.md#prerendering-behavior)
- [`<Suspense>`](#streaming-uncached-data): fallback UI is included in the static shell while the content streams at request time
- [Predictable values](#predictable-values): module imports, `fs.readFileSync`, and pure computations complete during prerender and are included in the static shell automatically
- [Random values and timestamps](#random-values-and-timestamps): use `connection()` + `<Suspense>` to get a unique value per request, or `use cache` to share one across users

This generates a static shell consisting of HTML for initial page loads and a serialized [RSC Payload](./05-server-and-client-components.md#on-the-server) for client-side navigation, ensuring the browser receives fully rendered content instantly whether users navigate directly to the URL or transition from another page. This rendering approach is called **Partial Prerendering (PPR)**, the default behavior with Cache Components.

<Image
  alt="Partially re-rendered Product Page showing static nav and product information, and dynamic cart and recommended products"
  srcLight="/learn/light/thinking-in-ppr.png"
  srcDark="/learn/dark/thinking-in-ppr.png"
  width="1600"
  height="632"
/>

Every produced static shell can be served directly from a CDN, without going through to the upstream server. This makes direct navigations [instant](#instant-navigation).

What ends up in a route's static shell depends on what's known at build time. When a route's [dynamic params](../03-api-reference/04-functions/generate-static-params.md) are known, the shell contains that concrete content, and any remaining uncached or runtime data still streams behind its `<Suspense>` fallback. When the params aren't known, the reusable, URL-independent version is the [**App Shell**](../04-glossary.md#app-shell): the same static shell with the param-specific parts left behind their fallbacks. [Incremental Static Regeneration](#incremental-static-regeneration) fills in the concrete versions after the first visit.

Next.js requires you to explicitly handle components that can't complete during prerendering. It surfaces a validation insight in the dev overlay and dev server console that names the route and points at fixes (cache the access, move it into a `<Suspense>` boundary, or opt the route out). This validation keeps every route producing a static shell, so direct navigations stay instant.

<Image
  alt="Diagram showing partially rendered page on the client, with loading UI for chunks that are being streamed."
  srcLight="/docs/light/server-rendering-with-streaming.png"
  srcDark="/docs/dark/server-rendering-with-streaming.png"
  width="1600"
  height="785"
/>

> **🎥 Watch:** Why Partial Prerendering and how it works → [YouTube (10 minutes)](https://www.youtube.com/watch?v=MTcPrTIBkpA).

### Maximizing the static shell

The deeper your async work sits in the tree, the more of the page can be prerendered. This is the structural pattern Cache Components rewards: a general practice worth applying everywhere, and the foundation for the instant navigation and prefetching that follow. It applies to all [runtime APIs](#working-with-runtime-apis) and async operations like data fetches.

Consider a layout that destructures `params` at the top level:

```tsx filename="app/shop/[slug]/layout.tsx"
export default async function Layout({ children, params }: LayoutProps<'/shop/[slug]'>) {
	const { slug } = await params

	return (
		<div>
			<Sidebar />
			<h1>{slug}</h1>
			{children}
		</div>
	)
}
```

If this param is dynamic (not provided by [`generateStaticParams`](../03-api-reference/04-functions/generate-static-params.md)), it is runtime data and the layout cannot be prerendered.

However, it is often possible to read the parameter value further down the tree. Instead of awaiting at the layout level, pass the params promise down and await there:

```tsx filename="app/shop/[slug]/layout.tsx" highlight={3-4,11-16}
import { Suspense } from 'react'

// Not async: this layout never awaits params
export default function Layout({ children, params }: LayoutProps<'/shop/[slug]'>) {
	return (
		<div>
			<Sidebar />
			<Suspense fallback={<h1>Loading...</h1>}>
				{/* await happens inside the boundary, so the shell still renders */}
				{params.then(({ slug }) => (
					<SlugHeading slug={slug} />
				))}
			</Suspense>
			{children}
		</div>
	)
}

function SlugHeading({ slug }: { slug: string }) {
	return <h1>{slug}</h1>
}
```

Now `<Sidebar />`, `{children}`, and the Suspense fallback are all part of the static shell. Only `SlugHeading` streams in at request time. You can also pass the entire `params` promise and await it in the child component.

The same principle applies to `cookies()`, `headers()`, `searchParams`, and data fetches. See [Reusing data with `React.cache`](./06-fetching-data.md#reusing-data-with-reactcache) for a related pattern.

For a complete workflow, see [Optimizing the static shell](../02-guides/optimizing-the-static-shell.md).

### Instant navigation

Cache Components shipped in 16.0.0 with verification that direct visits to a route produce a static shell. Client navigations are different: a `<Suspense>` boundary that covers a direct visit may not be part of the render during a transition. Getting that structure right is easier when the framework steps in. Cache Components now validates these navigations too, giving you insights and errors that guide you to make navigations to your route instant. For example, wrap data in `<Suspense>`, cache it with `use cache`, or move where the access happens.

Read the [Instant navigation guide](../02-guides/instant-navigation.md) for examples and inspection tools.

### Prefetching

With [Partial Prefetching](../03-api-reference/05-config/01-next-config-js/partialPrefetching.md) enabled, the router prefetches each route's [App Shell](../04-glossary.md#app-shell) by default. The App Shell includes static content and session data derived from `cookies()` and `headers()`. To also prefetch cached content that depends on a link's **URL data**, such as `searchParams` or dynamic `params`, set `prefetch={true}` on that link.

With [`<Link prefetch={true}>`](../03-api-reference/02-components/link.md#prefetch) pointing at a [Partial Prefetching](../03-api-reference/05-config/01-next-config-js/partialPrefetching.md) route, Next.js renders that route's component tree again at prefetch time, this time with the destination URL resolved. The same rules apply, but more of the tree resolves now that its `searchParams` and `params` are in scope:

- [`use cache`](#usage) called with values extracted from runtime APIs (passed as arguments) joins the per-link prefetch
- [`use cache: private`](../03-api-reference/01-directives/use-cache-private.md) executes on the server, reads runtime data directly, and caches the result in the browser as part of the per-link prefetch
- [`<Suspense>`](#streaming-uncached-data) fallbacks stay in the prefetched UI while uncached content streams at request time

This per-link prefetch includes cached content that resolves after the destination URL is known. It costs a server invocation per prefetchable link.

For example, take a search page that reads `searchParams` from the URL:

```tsx filename="app/search/page.tsx"
import { Suspense } from 'react'

export default function SearchPage(props: PageProps<'/search'>) {
	return (
		<Suspense fallback={<p>Loading results...</p>}>
			<Results searchParams={props.searchParams} />
		</Suspense>
	)
}

async function Results({ searchParams }: Pick<PageProps<'/search'>, 'searchParams'>) {
	const { q } = await searchParams
	const results = await search(q)
	return (
		<ul>
			{results.map((result) => (
				<li key={result.id}>{result.title}</li>
			))}
		</ul>
	)
}

async function search(query: string | string[] | undefined) {
	'use cache'
	return db.search(query)
}
```

On a direct visit, `<Results>` streams in behind the fallback.

When a [`<Link>`](../03-api-reference/02-components/link.md) to `/search?q=shoes` is prefetched, the framework resolves `searchParams` from the link's URL, so the cached `search` result is included in the runtime prerender before the click. The browser then reuses it until its [`stale`](../03-api-reference/04-functions/cacheLife.md#stale) time passes or the `searchParams` change.

See [Adopting Partial Prefetching](../02-guides/adopting-partial-prefetching.md) to understand how `<Link>` prefetching behaves and how to adopt it.

See the [Optimizing prefetching guide](../02-guides/optimizing-prefetching.md) for full patterns and the [`prefetch` reference](../03-api-reference/03-file-conventions/02-route-segment-config/prefetch.md) for all modes.

## Where cached content is stored

A cached function's output is serialized into an **RSC payload**, at build time or at runtime. This payload is what everything else works from. Next.js renders it into HTML, keeps it in a server or remote store, or sends it to the browser, and [`cacheLife`](../03-api-reference/04-functions/cacheLife.md) sets how long each copy stays fresh:

- **Prerendered HTML.** The payload is rendered to HTML and stored on disk when self-hosting, or in your platform's durable storage behind a CDN. That HTML is the [static shell](#prerendering) at build time and the concrete page after an [ISR](#incremental-static-regeneration) upgrade, with [`revalidate`](../03-api-reference/04-functions/cacheLife.md#revalidate) and [`expire`](../03-api-reference/04-functions/cacheLife.md#expire) controlling when it's rebuilt.
- **Shared store.** By default the result stays in a per-instance, in-memory store that is ephemeral on serverless. [`use cache: remote`](../03-api-reference/01-directives/use-cache-remote.md) moves it to a durable [cache handler](../03-api-reference/05-config/01-next-config-js/cacheHandlers.md) shared across instances, a network roundtrip that pays off only at a **high hit rate**.
- **Browser.** The payload is included in the RSC sent for a client navigation or [prefetch](#prefetching), where the browser keeps it fresh for its [`stale`](../03-api-reference/04-functions/cacheLife.md#stale) window. [`use cache: private`](../03-api-reference/01-directives/use-cache-private.md) results live only here.

> **Good to know:** An [App Shell](../04-glossary.md#app-shell) that reads `cookies()` or `headers()` is session-specific, cached per session on the client rather than in the shared server cache.

All of these stores are scoped to a single deployment. A new deploy starts fresh, new prerenders are built, and `use cache` entries don't carry over, even durable [`remote`](../03-api-reference/01-directives/use-cache-remote.md) ones, because the [cache key](../03-api-reference/01-directives/use-cache.md#cache-keys) includes the build id. See [Runtime caching considerations](../03-api-reference/01-directives/use-cache.md#runtime-caching-considerations) for per-environment behavior and [Self-hosting](../02-guides/self-hosting.md#caching-and-isr) for configuring the server cache.

## Incremental Static Regeneration

In a route with dynamic param segments, [`generateStaticParams`](../03-api-reference/04-functions/generate-static-params.md) prerenders the URLs you list at build time. Any other URL is served the [App Shell](../04-glossary.md#app-shell) instantly, then upgraded in the background with its now-known params and cached for the next visitor.

See [ISR with Cache Components](../02-guides/incremental-static-regeneration-cache-components.md) for the full walkthrough.

## Bots and crawlers

With [Partial Prerendering](#prerendering), metadata can be dynamic while the rest of the page is prerendered into a static shell. The shell is served immediately and the metadata streams in after. Some bots and crawlers cannot handle this, and need to see the metadata included in the `<head>` tag of the document. Next.js detects them by their user agent, skips the static shell, and renders the page dynamically at request time.

Data sources available during the build-time prerender have to be available at request time too. Otherwise the render may throw, and these bots receive a 500 error. See [Bots and crawlers](../02-guides/streaming.md#bots-and-crawlers) in the Streaming guide for which user agents this covers and how to change the list.

## INDEX

Learn more about revalidation and the APIs mentioned on this page.

- [Revalidating](./09-revalidating.md)
- [use cache](../03-api-reference/01-directives/use-cache.md)
- [cacheComponents](../03-api-reference/05-config/01-next-config-js/cacheComponents.md)
- [Ensuring instant navigations](../02-guides/instant-navigation.md)
