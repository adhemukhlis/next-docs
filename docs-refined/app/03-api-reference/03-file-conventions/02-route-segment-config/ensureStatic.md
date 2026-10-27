---
title: ensureStatic
description: Require selected route output to remain static instead of rendering per request with the ensureStatic route segment config.
---

The `ensureStatic` route segment config requires selected route output to be static instead of rendered per request. Export it from a [page](../page.md) or [layout](../layout.md) to enforce this requirement for the [App Shell](../../../04-glossary.md#app-shell), per-link prefetches, or the complete server-rendered route.

Use it so later changes cannot add request-time server rendering to a navigation stage that must stay static. See [Keeping pages static](../../../02-guides/keeping-pages-static.md) for a worked example of each level.

> **Good to know**:
>
> - The `ensureStatic` export only works when [`cacheComponents`](../../05-config/01-next-config-js/cacheComponents.md) is enabled. The build fails otherwise.
> - Exporting `ensureStatic` from a Client Component throws an error.

```tsx filename="app/blog/layout.tsx" highlight={1} switcher
export const ensureStatic = 'navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
```

```jsx filename="app/blog/layout.js" highlight={1} switcher
export const ensureStatic = 'navigation'

export default function Layout({ children }) {
	return <>{children}</>
}
```

## Reference

The export accepts `'auto'`, `'shell'`, `'prefetch'`, `'navigation'`, or `false`. The default is `'auto'`, which is equivalent to omitting the export.

`ensureStatic` controls which server-rendered output must be static. With Partial Prefetching, that output can be the App Shell, an optional per-link prefetch, or the complete route rendered during navigation. These outputs are called [navigation stages](../../../04-glossary.md#navigation-stages). Each stricter level also includes the earlier stages.

| Value              | Output that must be static       |
| ------------------ | -------------------------------- |
| `'auto'` (default) | No additional static requirement |
| `'shell'`          | App Shell                        |
| `'prefetch'`       | App Shell and per-link prefetch  |
| `'navigation'`     | Complete server-rendered route   |

`false` does not select a static level. It preserves normal rendering behavior and prevents another segment from applying `'shell'`, `'prefetch'`, or `'navigation'` to the route. See [`false`](#false).

### `'shell'`

Requires the [App Shell](../../../04-glossary.md#app-shell) loaded by a default `<Link>` to be static. Without [Partial Prefetching](../../05-config/01-next-config-js/partialPrefetching.md) there is no App Shell, so the value has no effect and Next.js logs a warning.

The shell can include static or cached content and `<Suspense>` fallbacks. Request-specific content behind `<Suspense>` can render during a later per-link prefetch with [`<Link prefetch={true}>`](../../02-components/link.md#prefetch), or during navigation.

For an individual subtree, [`await prefetch()`](../../04-functions/prefetch.md) provides similar behavior by deferring code below the call to a per-link prefetch or navigation. Setting `'shell'` enforces that stage boundary across the route without adding `await prefetch()` to each request-specific subtree. See [Defer work to a later stage](../../../02-guides/optimizing-prefetching.md#defer-work-to-a-later-stage) for the per-subtree controls.

> **Good to know**: `'shell'` does not require per-link prefetches to be static. If the route reads `cookies()`, `headers()`, or URL data before [`await navigation()`](../../04-functions/navigation.md), each visible [`<Link prefetch={true}>`](../../02-components/link.md#prefetch) can still trigger a server render. Use [`'prefetch'`](#prefetch) when per-link prefetches must also come from static output.

### `'prefetch'`

Requires both the App Shell and per-link prefetches to be static. Without [Partial Prefetching](../../05-config/01-next-config-js/partialPrefetching.md), the value adds no requirement and links keep their normal full-prefetch behavior. A full prefetch can include request-specific data and is not guaranteed to be static.

A per-link prefetch from [`<Link prefetch={true}>`](../../02-components/link.md#prefetch) can load static or cached [URL-specific content](../../../02-guides/optimizing-prefetching.md#resolve-url-data-at-prefetch-time) before the user follows the link. Request-specific content behind `<Suspense>` renders when the navigation completes the route.

The [static HTML shell](../../../04-glossary.md#static-shell) can also include this static or cached per-link content. Unlike a per-link prefetch, it cannot include request-specific data because the HTML shell is prerendered.

For an individual subtree, [`await navigation()`](../../04-functions/navigation.md) provides similar behavior by deferring code below the call until navigation. Setting `'prefetch'` enforces that stage boundary across the route without adding `await navigation()` to each request-specific subtree. See [Keep the prefetch static](../../../02-guides/optimizing-prefetching.md#keep-the-prefetch-static) for shaping one route this way.

### `'navigation'`

Requires the complete server-rendered route to be produced during prerendering, so initial loads and client navigations use static output. This value works with Cache Components alone and does not require Partial Prefetching.

To require static server output for the entire app, set `'navigation'` on the root layout. See [Combining levels across layouts and pages](#combining-levels-across-layouts-and-pages) for how levels apply across a route.

#### Validation

With `'shell'` and `'prefetch'`, request-specific work inside `<Suspense>` can move to a later navigation stage. These values do not add build validation. When [Instant Navigation validation](/docs/messages/instant-navigation-validation) is enabled, it can report request-specific work outside `<Suspense>` because it blocks the navigation.

`'navigation'` is the final server-rendering stage, so no later stage remains. Next.js validates its complete static-output requirement during both `next dev` and `next build`. In development, errors include source-mapped stack traces that update as you edit. Build output is more abbreviated, so you may need to run [`next build --debug-prerender`](../../../02-guides/building.md#debug-prerender-errors) for detailed stack traces and code frames. See [Ensuring instant navigations](../../../02-guides/instant-navigation.md) for the development workflow.

With `ensureStatic = 'navigation'`, the following server content fails validation, even when it is wrapped in `<Suspense>` or the segment sets [`instant = false`](./instant.md#disabling-instant):

- [Uncached data](/docs/messages/static-route-dynamic), including a `fetch` or database call without [`use cache`](../../01-directives/use-cache.md), and [`connection()`](../../04-functions/connection.md).
- [Runtime data](/docs/messages/static-route-runtime), such as `cookies()`, `headers()`, and server-side `searchParams`.
- A `use cache` scope whose [`expire`](../../04-functions/cacheLife.md#expire) is under five minutes, [`stale`](../../04-functions/cacheLife.md#stale) is under 30 seconds, or [`revalidate`](../../04-functions/cacheLife.md#revalidate) is `0`. A `stale` time between 30 seconds and five minutes is allowed.
- A promise for request-dependent server data passed to a Client Component, whether or not the component reads it.

These constraints also apply to [`generateMetadata`](../../04-functions/generate-metadata.md) and [`generateViewport`](../../04-functions/generate-viewport.md).

Data cached with `use cache` can be prerendered. [`prefetch()`](../../04-functions/prefetch.md) and [`navigation()`](../../04-functions/navigation.md) are also allowed because a static prerender continues through their stage boundaries.

#### Dynamic route parameters

With `'navigation'`, a dynamic route must export [`generateStaticParams()`](../../04-functions/generate-static-params.md) and return at least one complete parameter set. Each result must include every dynamic parameter in the route, even if the parameter is unused or only read in a Client Component.

Values returned by `generateStaticParams()` are available during prerendering. When a request uses a value that was not prerendered at build time, Next.js waits for the static result to be generated before serving it.

With `'shell'` or `'prefetch'`, a value that was not prerendered serves the route's fallback shell instead, with `<Suspense>` fallbacks in place of its content, while Next.js generates the page in the background. See [ISR with Cache Components](../../../02-guides/incremental-static-regeneration-cache-components.md#at-runtime).

The build fails when `generateStaticParams()` is missing or returns an incomplete parameter set. See the [`generateStaticParams` error guide](/docs/messages/generate-static-params#with-ensurestatic).

#### Client Components

Client Components can load request-specific content in the browser. Inside `<Suspense>`, `use(browser())` and [`use(io())`](../../04-functions/io.md) are allowed. The prerender includes the fallback for the deferred content. See [Rendering components only in the browser](../../../02-guides/single-page-applications.md#rendering-components-only-in-the-browser).

Client hooks such as [`useParams()`](../../04-functions/use-params.md) and [`useSearchParams()`](../../04-functions/use-search-params.md) are also allowed. Dynamic routes still require `generateStaticParams()`. Passing a request-dependent promise from a Server Component still requires server work and produces an error.

### `false`

With Partial Prefetching, `false` keeps the route's normal rendering behavior and fails the build if another segment sets `'shell'`, `'prefetch'`, or `'navigation'`. Use it to signal that a segment is not meant to be statically optimized.

## How `ensureStatic` differs from `instant`

`ensureStatic` requires selected server-rendered output to avoid request-time work. Use it when the App Shell, a per-link prefetch, or the complete route must be static.

[`instant`](./instant.md) validates whether a navigation can update the UI immediately. Cached or prerendered UI can satisfy this requirement while request-specific content streams later behind `<Suspense>`.

Setting `instant = false` disables Instant Navigation validation for the route. The `'shell'` and `'prefetch'` values still make the client request the corresponding static output, but neither value adds separate build validation. A static prefetch can still include a parent layout, metadata, and Client Component preload hints even when the page UI renders only after the user follows the link. The `'navigation'` value uses separate complete static-output validation, which `instant = false` does not relax.

## Combining levels across layouts and pages

A level set on the root layout applies to every route in the app. A level set on another layout applies to every route that renders it, including its nested layouts, pages, and [parallel routes](../parallel-routes.md). Within a route, the level covers every segment, including the layouts above the one that sets it.

Leaving the export unset or setting it to `'auto'` is compatible with any level and preserves another segment's setting. A descendant can set a stricter static level, but not a weaker one:

```tsx filename="app/blog/layout.tsx"
export const ensureStatic = 'prefetch'
```

```tsx filename="app/blog/[slug]/page.tsx"
export const ensureStatic = 'navigation' // allowed, stricter than 'prefetch'
```

A weaker level on a child segment fails the build:

```text filename="Terminal"
A child segment cannot override a parent segment with a less-constrained `ensureStatic`.
```

Mixing `false` with `'shell'`, `'prefetch'`, or `'navigation'` in a parent and child fails with:

```text filename="Terminal"
A child segment cannot override a parent segment with an incompatible `ensureStatic`.
```

Parallel routes rendered together must set the same value, leave the export unset, or use `'auto'`. Conflicting values fail with:

```text filename="Terminal"
Parallel slots cannot have incompatible `ensureStatic`.
```

## TypeScript

```tsx filename="app/blog/layout.tsx"
type EnsureStatic = 'auto' | 'shell' | 'prefetch' | 'navigation' | false

export const ensureStatic: EnsureStatic = 'navigation'
```

## Version History

| Version   | Changes                    |
| --------- | -------------------------- |
| `v16.4.0` | `ensureStatic` introduced. |

## INDEX

Related documents:

- [Keeping pages static](../../../02-guides/keeping-pages-static.md)
- [Optimizing prefetching](../../../02-guides/optimizing-prefetching.md)
- [prefetch](../../04-functions/prefetch.md)
- [navigation](../../04-functions/navigation.md)
