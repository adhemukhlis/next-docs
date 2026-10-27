---
title: Client-side data fetching
description: Fetch data in Client Components with a data-fetching library, optionally provide initial data from a Server Component, and coordinate server and client caches.
---

Many apps can provide responsive interactions without a client data-fetching library. If a Client Component only needs to read server data once, [pass it a Promise and unwrap it with React's `use()`](../../01-getting-started/06-fetching-data.md#streaming-data-with-the-use-api).

This avoids adding a library for data that never revalidates on the client. See [Building interactive apps](../interactive-apps.md) for patterns using Server Functions, transitions, optimistic UI, and pending feedback.

Use a client data-fetching library such as [SWR](https://swr.vercel.app), [TanStack Query](https://tanstack.com/query), or [Apollo Client](https://www.apollographql.com/docs/react) when Client Components need a shared browser cache. These libraries can add focus revalidation, interval polling, request deduplication, or optimistic updates across components.

## Choose a client fetching pattern

First decide whether the initial view needs data from the server or can wait for a browser request after hydration. Client data-fetching libraries support three common patterns:

| Pattern                 | SWR                            | TanStack Query        | When data becomes available            |
| ----------------------- | ------------------------------ | --------------------- | -------------------------------------- |
| Inline loading states   | `useSWR`                       | `useQuery`            | Browser request after hydration        |
| Suspense loading states | `useSWR` with `suspense: true` | `useSuspenseQuery`    | Browser request after hydration        |
| Provided by the server  | `<SWRConfig fallback>`         | `<HydrationBoundary>` | Initial render or streamed from server |

Use inline loading states when each component should render its own loading UI. Use [Suspense](../../01-getting-started/06-fetching-data.md#streaming) to define loading UI at a boundary and coordinate which parts of the interface reveal together or progressively. For client-only fetching, choose the pattern that matches the loading experience you want. Suspense coordinates rendering, while the data library and component structure determine when requests start.

For browser-driven interactions such as autocomplete, you can use either client-only pattern. The initial result waits for hydration and a browser request, which is often the right tradeoff for data that is not needed until an interaction.

Provide initial data from a [Server Component](../../01-getting-started/05-server-and-client-components.md) when the server knows what the initial render needs. The value can be included in the initial render or streamed through Suspense. The library receives it in the React Server Component payload and can continue managing it in the browser.

## Cache server data with Cache Components (optional)

Providing initial data and caching it on the server are independent choices. Add Cache Components when the server read or rendered view should be reused. When both are enabled, three cache layers can hold related data:

| Layer | What it stores | Freshness control |
| --- | --- | --- |
| Next.js server cache | Cached data and Server Component output | [`cacheLife`](../../03-api-reference/04-functions/cacheLife.md) `revalidate` and `expire` |
| Next.js client cache | React Server Component payloads for visited and prefetched routes | [`cacheLife`](../../03-api-reference/04-functions/cacheLife.md) `stale` |
| Client data-fetching library | Browser data stored under an SWR key or TanStack query key | The library's revalidation options and mutations |

Next.js [prefetching](../prefetching.md) can place a route's React Server Component payload in the client cache before navigation.

The cache layers keep independent freshness policies and do not need matching durations. Cache identities and mutation invalidation must stay coordinated across layers.

## Coordinate mutations

Server Components, data-fetching libraries, and mutations manage different parts of the data flow:

- **Server Components** provide the initial data, scoped to the segment that owns it.
- **The data-fetching library** stores the browser value under a shared cache identity.
- **Mutations** can update the browser cache immediately and invalidate cached server data so the next render can read a fresh value.

An optimistic update should restore the previous browser value if the write fails. If the server read is not cached, there is no server tag to invalidate.

After a mutation, invalidate any cached server read that provided the initial data:

| Method | Use when | Next server read |
| --- | --- | --- |
| [`updateTag(tag)`](../../03-api-reference/04-functions/updateTag.md) | A Server Action must make its update visible immediately | Waits for fresh data |
| [`revalidateTag(tag, 'max')`](../../03-api-reference/04-functions/revalidateTag.md) | The update is passive or stale data is acceptable | Serves stale data while revalidating |
| [`revalidateTag(tag, { expire: 0 })`](../../03-api-reference/04-functions/revalidateTag.md) | A webhook or external system requires immediate expiration | Waits for fresh data |

## Apply these patterns with SWR or TanStack Query

- [Client-side data fetching with SWR](./swr.md)
- [Client-side data fetching with TanStack Query](./tanstack-query.md)

See both patterns in the live [`next-spa-patterns` demo](https://next-spa-patterns.labs.vercel.dev) and its [source code](https://github.com/nextjs/next-spa-patterns).

## INDEX

Documents in this section:

- [How to fetch client-side data with SWR](./swr.md)
- [How to fetch client-side data with TanStack Query](./tanstack-query.md)

Related:

- [Fetching Data](../../01-getting-started/06-fetching-data.md)
- [How to build single-page applications with Next.js](../single-page-applications.md)
- [Building interactive apps](../interactive-apps.md)
- [Caching](../../01-getting-started/08-caching.md)
