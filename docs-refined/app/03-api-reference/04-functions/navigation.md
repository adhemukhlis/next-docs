---
title: navigation
nav_title: navigation
description: Defer runtime work until the user navigates with the navigation function.
---

Calling `await navigation()` keeps runtime work below it out of the [App Shell](../../04-glossary.md#app-shell) and per-link prefetches. The work runs when the user navigates, while the fallback of the nearest [`<Suspense>`](https://react.dev/reference/react/Suspense) boundary renders in the prefetched output.

Use `navigation()` for reusable content that is expensive to generate and should wait until navigation. Static prerenders still include the content in their output, so it can appear in a static prefetch.

## Usage

The function requires [Cache Components](../05-config/01-next-config-js/cacheComponents.md), and throws without it. It is meant for routes using [Partial Prefetching](../05-config/01-next-config-js/partialPrefetching.md), which you can enable globally or one route at a time by [adopting Partial Prefetching](../../02-guides/adopting-partial-prefetching.md).

```ts filename="next.config.ts" highlight={4,5}
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
}

export default nextConfig
```

With Partial Prefetching enabled, Next.js loads server-rendered output in stages, before and during a client navigation. These are the route's [navigation stages](../../04-glossary.md#navigation-stages):

1. A default `<Link>` loads the [App Shell](../../04-glossary.md#app-shell), which holds the part of the route that does not depend on the URL.
2. An optional [`<Link prefetch={true}>`](../02-components/link.md#prefetch) can also load content that depends on the link's URL.
3. When the user follows the link, the navigation renders the rest of the route.

During runtime rendering, awaiting `navigation()` keeps content out of the App Shell and per-link prefetches, so it renders during navigation. Static prerenders can still include the content.

Without Partial Prefetching, `navigation()` still defers the content for a default `<Link>`, but [`<Link prefetch={true}>`](../02-components/link.md#prefetch) fetches the whole route, deferred content included, the same as a navigation.

To keep content out of the App Shell while still including it in a per-link prefetch, use [`prefetch()`](./prefetch.md).

> **Good to know**: `navigation()` defers one subtree. To require a static App Shell and static per-link prefetches across the route, use [`ensureStatic = 'prefetch'`](../03-file-conventions/02-route-segment-config/ensureStatic.md#prefetch). See [Keeping pages static](../../02-guides/keeping-pages-static.md) for a worked example.

Everything above `navigation()` can render in the App Shell or a per-link prefetch, while everything below waits for navigation. Deferral is scoped to the component that awaits it and the tree below: sibling branches keep their existing behavior. Place it above the code to defer, and wrap the component in [`<Suspense>`](https://react.dev/reference/react/Suspense):

```tsx filename="app/post/[slug]/page.tsx" highlight={20} switcher
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, navigation } from 'next/cache'

export default function Page({ params }: PageProps<'/post/[slug]'>) {
	return (
		<>
			<Suspense fallback={<p>Loading post...</p>}>
				<PostBody params={params} /> {/* in a per-link prefetch */}
			</Suspense>
			<Suspense fallback={<p>Loading comments...</p>}>
				{/* the fallback is in the prefetch, the comments are not */}
				<Comments params={params} />
			</Suspense>
		</>
	)
}

async function Comments({ params }: { params: Promise<{ slug: string }> }) {
	await navigation() // runtime work below renders on navigation
	const { slug } = await params
	const sort = (await cookies()).get('comment-sort')?.value ?? 'newest'
	const items = await getComments(slug, sort)
	return <CommentList items={items} />
}

async function getComments(slug: string, sort: string) {
	'use cache'
	cacheLife('hours')
	return db.comments.list({ slug, sort })
}
```

```jsx filename="app/post/[slug]/page.js" highlight={20} switcher
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, navigation } from 'next/cache'

export default function Page({ params }) {
	return (
		<>
			<Suspense fallback={<p>Loading post...</p>}>
				<PostBody params={params} /> {/* in a per-link prefetch */}
			</Suspense>
			<Suspense fallback={<p>Loading comments...</p>}>
				{/* the fallback is in the prefetch, the comments are not */}
				<Comments params={params} />
			</Suspense>
		</>
	)
}

async function Comments({ params }) {
	await navigation() // runtime work below renders on navigation
	const { slug } = await params
	const sort = (await cookies()).get('comment-sort')?.value ?? 'newest'
	const items = await getComments(slug, sort)
	return <CommentList items={items} />
}

async function getComments(slug, sort) {
	'use cache'
	cacheLife('hours')
	return db.comments.list({ slug, sort })
}
```

Comments are fetched by slug, so prefetching them would take a per-link prefetch. Awaiting `navigation()` before that data access keeps them out of the prefetch, so they render when the user navigates.

The slug and the cookie are both read below `navigation()` and passed as arguments, so `getComments` caches per post and sort order rather than per visitor. The URL is resolved by the time the deferred content renders, so `params` is available below `navigation()`.

Put the directive on a function called below it, as `getComments` does here. Awaiting `navigation()` inside a cached scope, such as [`use cache`](../01-directives/use-cache.md) or [`use cache: private`](../01-directives/use-cache-private.md), is not allowed.

## How `navigation()` differs from `connection()`

The [`connection()`](./connection.md) function waits for a real request. It excludes the code that follows from prerendering and prefetching, making that work request-dependent.

Awaiting `navigation()` excludes the code that follows from route prefetches. It resolves when the user navigates without making that work request-dependent. A function called after `await navigation()` can therefore use [`"use cache"`](../01-directives/use-cache.md) and keep its cache lifetime without generating its result during prefetching.

Use `connection()` when the work must run for a real request. Use `navigation()` when the work is reusable but should wait until the user navigates.

## When to use it

Use `navigation()` when the content below it is expensive to produce and no prefetch should generate it.

Neither the runtime App Shell nor a runtime per-link prefetch runs that code, so its upstream requests are not issued until the user navigates.

Leaving content uncached also keeps it out of prefetches, but gives up its cache lifetime.

With `navigation()` the content can be cached with [`use cache`](../01-directives/use-cache.md), given a lifetime, and deferred to the navigation. Give it a [`stale`](./cacheLife.md#stale) time of five minutes or more and the client-side router reuses it after the first time a user navigates into the route. Below that, a [short lifetime keeps it out of the App Shell](./cacheLife.md#prerendering-behavior), so each navigation fetches it again.

### Keeping a route's prefetch static

When every read of [`cookies()`](./cookies.md), [`headers()`](./headers.md), `params`, and `searchParams` sits below `navigation()`, the prerender a prefetch would trigger cannot produce more than the static output the build already generated, so the prefetch is served from that output instead. Shaping a route this way is an optional optimization: a static response can be cached in a CDN, so a link into the route costs no server CPU at all.

```tsx filename="app/feed/page.tsx" highlight={17}
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { navigation } from 'next/cache'

export default function Page() {
	return (
		<>
			<FeedHeader /> {/* static, and so is the whole prefetch */}
			<Suspense fallback={<p>Loading stories...</p>}>
				<Stories />
			</Suspense>
		</>
	)
}

async function Stories() {
	await navigation()
	const topic = (await cookies()).get('topic')?.value ?? 'all'
	return <StoryList items={await getStories(topic)} />
}
```

## Good to know

- The function has no effect on the initial load of a page.
- Reading `cookies()` or `headers()` below `navigation()` does not make the route's prefetches render per request, so they can still be served from static output. Those accesses are ignored, because they would not have resolved in a prefetch either.
- A call outside a `<Suspense>` boundary surfaces an [Instant Insight](/docs/messages/instant-navigation-stage) in development. A fully prerendered route is unaffected, but the insight identifies that the call would defer content without a fallback if the route later requires runtime rendering.
- Calling it inside `use cache`, `use cache: private`, [`unstable_cache()`](./unstable_cache.md), [`after()`](./after.md), [`generateStaticParams`](./generate-static-params.md), or a Client Component throws.

## Reference

### Type

```ts
function navigation(): Promise<void>
```

### Parameters

- The function does not accept any parameters.

### Returns

A `Promise<void>`. It is not meant to be consumed.

## Version History

| Version   | Changes                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------- |
| `v16.4.0` | `navigation` introduced, replacing the `unstable_navigation` name used in earlier canary releases. |

## INDEX

Related documents:

- [Optimizing prefetching](../../02-guides/optimizing-prefetching.md)
- [Keeping pages static](../../02-guides/keeping-pages-static.md)
- [prefetch](./prefetch.md)
- [connection](./connection.md)
- [partialPrefetching](../05-config/01-next-config-js/partialPrefetching.md)
