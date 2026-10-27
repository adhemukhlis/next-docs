---
title: prefetch
nav_title: prefetch
description: Defer runtime work until a per-link prefetch or navigation with the prefetch function.
---

Calling `await prefetch()` keeps runtime work below it out of the route's [App Shell](../../04-glossary.md#app-shell). The work can run during a per-link prefetch or navigation, while the fallback of the nearest [`<Suspense>`](https://react.dev/reference/react/Suspense) boundary renders in the shell.

Use `prefetch()` for content that the App Shell would otherwise render but that is expensive to generate. Static prerenders still include the content in their output.

## Usage

The function requires [Cache Components](../05-config/01-next-config-js/cacheComponents.md) and throws an error if not enabled. Without [Partial Prefetching](../05-config/01-next-config-js/partialPrefetching.md) a route has no App Shell, so the function has no effect. Enable Partial Prefetching globally, or one route at a time, by [adopting Partial Prefetching](../../02-guides/adopting-partial-prefetching.md).

```ts filename="next.config.ts" highlight={4,5}
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
}

export default nextConfig
```

With Partial Prefetching enabled, Next.js loads server-rendered output in stages, before and during a client navigation. These are the route's [navigation stages](../../04-glossary.md#navigation-stages):

1. A default `<Link>` loads the App Shell, which holds the part of the route that does not depend on the URL.
2. An optional [`<Link prefetch={true}>`](../02-components/link.md#prefetch), or [`router.prefetch(href, { kind: 'full' })`](./use-router.md), can also load content that depends on the link's URL.
3. When the user follows the link, the navigation renders the rest of the route.

During runtime rendering, awaiting `prefetch()` keeps content out of the App Shell, so it renders during a per-link prefetch or navigation. Static prerenders can still include the content.

Calling `router.prefetch(href)` without `kind: 'full'` requests only the App Shell under Partial Prefetching. It does not render content below `await prefetch()`.

To keep content out of per-link prefetches as well, so it renders only on the navigation, use [`navigation()`](./navigation.md).

> **Good to know**: `prefetch()` defers one subtree. To require a static App Shell across the route, use [`ensureStatic = 'shell'`](../03-file-conventions/02-route-segment-config/ensureStatic.md#shell). See [Keeping pages static](../../02-guides/keeping-pages-static.md) for a worked example.

Everything above `prefetch()` renders in the App Shell, and everything below renders on a per-link prefetch or on the navigation. Deferral is scoped to the component that awaits it and the tree below: sibling branches render in the shell as usual. Place it above the work to defer, and wrap the component in [`<Suspense>`](https://react.dev/reference/react/Suspense):

```tsx filename="app/dashboard/page.tsx" highlight={25} switcher
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, prefetch } from 'next/cache'

export default function Page() {
	return (
		<>
			<Suspense fallback={<p>Loading greeting...</p>}>
				<Greeting /> {/* in the App Shell */}
			</Suspense>
			<Suspense fallback={<p>Loading recommendations...</p>}>
				{/* the fallback is in the App Shell, the recommendations are not */}
				<Recommendations />
			</Suspense>
		</>
	)
}

async function Greeting() {
	const session = (await cookies()).get('session')?.value
	return <p>{session ? 'Welcome back' : 'Welcome'}</p>
}

async function Recommendations() {
	await prefetch() // runtime work below renders on a per-link prefetch or navigation
	const items = await getRecommendations()
	return <List items={items} />
}

async function getRecommendations() {
	'use cache: private'
	cacheLife('hours')
	const session = (await cookies()).get('session')?.value
	return db.recommendations.rank({ session })
}
```

```jsx filename="app/dashboard/page.js" highlight={25} switcher
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife, prefetch } from 'next/cache'

export default function Page() {
	return (
		<>
			<Suspense fallback={<p>Loading greeting...</p>}>
				<Greeting /> {/* in the App Shell */}
			</Suspense>
			<Suspense fallback={<p>Loading recommendations...</p>}>
				{/* the fallback is in the App Shell, the recommendations are not */}
				<Recommendations />
			</Suspense>
		</>
	)
}

async function Greeting() {
	const session = (await cookies()).get('session')?.value
	return <p>{session ? 'Welcome back' : 'Welcome'}</p>
}

async function Recommendations() {
	await prefetch() // runtime work below renders on a per-link prefetch or navigation
	const items = await getRecommendations()
	return <List items={items} />
}

async function getRecommendations() {
	'use cache: private'
	cacheLife('hours')
	const session = (await cookies()).get('session')?.value
	return db.recommendations.rank({ session })
}
```

The greeting reads the session and stays in the App Shell. The recommendations read it too, inside `getRecommendations`, so that read is deferred along with the ranking. Remove `prefetch()` and they become part of the App Shell that every link into the route loads.

Put the directive on a function called below it, as `getRecommendations` does here. Awaiting `prefetch()` inside a cached scope, such as [`use cache`](../01-directives/use-cache.md) or [`use cache: private`](../01-directives/use-cache-private.md), is not allowed.

## How `prefetch()` differs from `connection()`

The [`connection()`](./connection.md) function waits for a real request. It excludes the code that follows from prerendering and prefetching, making that work request-dependent.

Awaiting `prefetch()` excludes the code that follows from the App Shell. It can resolve during a per-link prefetch without making that work request-dependent. A function called after `await prefetch()` can therefore use [`"use cache"`](../01-directives/use-cache.md) and keep its cache lifetime without generating its result for every link into the route.

Use `connection()` when the work must run for a real request. Use `prefetch()` when the work is reusable but should only run for a selected per-link prefetch or a navigation.

## When to use it

Use `prefetch()` when the content below it is expensive to produce and should not be generated in the App Shell that every `<Link>` into the route loads.

Producing the App Shell does not run that code, so its upstream requests are not issued until a per-link prefetch or the navigation.

Leaving content uncached also keeps it out of the shell, but gives up its cache lifetime and cannot make it available during a per-link prefetch. With `prefetch()`, the content can be cached with [`use cache`](../01-directives/use-cache.md) or [`use cache: private`](../01-directives/use-cache-private.md), given a lifetime, and deferred to a per-link prefetch or navigation.

Uncached reads, values with a short [`stale`](./cacheLife.md#stale) time, and anything behind `params` or `searchParams` are already left out of the shell on their own.

### Keeping the App Shell static

When every read of [`cookies()`](./cookies.md) and [`headers()`](./headers.md) sits below `prefetch()`, the prerender a shell prefetch would trigger cannot produce more than the static output the build already generated, so the shell is served from that output instead. Shaping a route this way is an optional optimization: a static response can be cached in a CDN, so a default `<Link>` into the route costs no server CPU at all. A route that resolves `params` or `searchParams` gets that prerender instead, and so does the example above: its greeting reads the session in the shell, so the shell renders once per visitor and only the recommendations are deferred.

## Good to know

- The function has no effect on the initial load of a page.
- Unlike [`connection()`](./connection.md), it does not mark the subtree as request-dependent. Content below `await prefetch()` stays fully cacheable and can be wrapped in [`use cache`](../01-directives/use-cache.md).
- A call outside a `<Suspense>` boundary surfaces an [Instant Insight](/docs/messages/instant-navigation-stage) in development. A fully prerendered route is unaffected, but the insight identifies that the call would defer content without a fallback if the route later requires runtime rendering.
- Calling it inside `use cache`, `use cache: private`, [`unstable_cache()`](./unstable_cache.md), [`after()`](./after.md), [`generateStaticParams`](./generate-static-params.md), or a Client Component throws.
- In a `page` or `layout` that sets the [`prefetch` route segment config](../03-file-conventions/02-route-segment-config/prefetch.md), import the function under another name, for example `import { prefetch as prefetchStage } from 'next/cache'`, since both are named `prefetch`.

## Reference

### Type

```ts
function prefetch(): Promise<void>
```

### Parameters

- The function does not accept any parameters.

### Returns

A `Promise<void>`. It is not meant to be consumed.

## Version History

| Version   | Changes                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------- |
| `v16.4.0` | `prefetch` introduced, replacing the `unstable_prefetch` name used in earlier canary releases. |

## INDEX

- [Optimizing prefetching](../../02-guides/optimizing-prefetching.md)
- [Keeping pages static](../../02-guides/keeping-pages-static.md)
- [navigation](./navigation.md)
- [connection](./connection.md)
- [partialPrefetching](../05-config/01-next-config-js/partialPrefetching.md)
