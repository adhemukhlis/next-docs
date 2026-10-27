---
title: Revalidating
description: Learn how to revalidate cached data using time-based and on-demand strategies.
---

> This page covers revalidation with [Cache Components](../03-api-reference/05-config/01-next-config-js/cacheComponents.md), enabled by setting [`cacheComponents: true`](../03-api-reference/05-config/01-next-config-js/cacheComponents.md) in your `next.config.ts` file. If you're not using Cache Components, see the [Caching and Revalidating (Previous Model)](../02-guides/caching-without-cache-components.md) guide.

Revalidation is the process of updating cached data. It lets you keep serving fast, cached responses while ensuring content stays fresh. There are two strategies:

- **Time-based revalidation**: Automatically refresh cached data after a set duration using [`cacheLife`](#cachelife).
- **On-demand revalidation**: Manually invalidate cached data after a mutation using [`revalidateTag`](#revalidatetag), [`updateTag`](#updatetag), or [`revalidatePath`](#revalidatepath).

## `cacheLife`

[`cacheLife`](../03-api-reference/04-functions/cacheLife.md) controls how long cached data remains valid. Use it inside a [`use cache`](../03-api-reference/01-directives/use-cache.md) scope to set the cache lifetime.

```tsx filename="app/lib/data.ts" highlight={1,4,5}
import { cacheLife } from 'next/cache'

export async function getProducts() {
	'use cache'
	cacheLife('hours')
	return db.query('SELECT * FROM products')
}
```

`cacheLife` accepts a profile name or a custom configuration object:

| Profile | `stale` | `revalidate` | `expire` |
| - | - | - | - |
| `default` | 5m | 15m | never |
| `seconds` | 30s | 1s | 60s |
| `minutes` | 5m | 1m | 1h |
| `hours` | 5m | 1h | 1d |
| `days` | 5m | 1d | 1w |
| `weeks` | 5m | 1w | 30d |
| `max` | 5m | 30d | 1y |

For fine-grained control, pass an object:

```tsx highlight={2-6}
'use cache'
cacheLife({
	stale: 3600, // 1 hour until considered stale
	revalidate: 7200, // 2 hours until revalidated
	expire: 86400, // 1 day until expired
})
```

> **Good to know:** A cache is considered "short-lived" when it uses the `seconds` profile, `revalidate: 0`, or `expire` under 5 minutes. Short-lived caches are automatically excluded from prerenders and become dynamic holes instead. See [Prerendering behavior](../03-api-reference/04-functions/cacheLife.md#prerendering-behavior) for details.

See the [`cacheLife` API reference](../03-api-reference/04-functions/cacheLife.md) for all profiles and custom configuration options.

## `cacheTag`

[`cacheTag`](../03-api-reference/04-functions/cacheTag.md) lets you tag cached data so it can be invalidated on-demand. Use it inside a [`use cache`](../03-api-reference/01-directives/use-cache.md) scope:

```tsx filename="app/lib/data.ts" switcher
import { cacheTag } from 'next/cache'

export async function getProducts() {
	'use cache'
	cacheTag('products')
	return db.query('SELECT * FROM products')
}
```

```jsx filename="app/lib/data.js" switcher
import { cacheTag } from 'next/cache'

export async function getProducts() {
	'use cache'
	cacheTag('products')
	return db.query('SELECT * FROM products')
}
```

Once tagged, invalidate the cache using [`revalidateTag`](#revalidatetag) or [`updateTag`](#updatetag).

See the [`cacheTag` API reference](../03-api-reference/04-functions/cacheTag.md) to learn more.

## `revalidateTag`

`revalidateTag` invalidates cache entries by tag using stale-while-revalidate semantics — stale content is served immediately while fresh content loads in the background. This is ideal for content where a slight delay in updates is acceptable, like blog posts or product catalogs.

```tsx filename="app/lib/actions.ts" highlight={1,5} switcher
import { revalidateTag } from 'next/cache'

export async function updateUser(id: string) {
	// Mutate data
	revalidateTag('user', 'max') // Recommended: stale-while-revalidate
}
```

```jsx filename="app/lib/actions.js" highlight={1,5} switcher
import { revalidateTag } from 'next/cache'

export async function updateUser(id) {
	// Mutate data
	revalidateTag('user', 'max') // Recommended: stale-while-revalidate
}
```

You can reuse the same tag in multiple functions to revalidate them all at once. Call `revalidateTag` in a [Server Action](./07-mutating-data.md) or [Route Handler](../03-api-reference/03-file-conventions/route.md).

> **Good to know:** The second argument sets how long stale content can be served while fresh content generates in the background. Once it expires, subsequent requests block until fresh content is ready. Using `'max'` gives the longest stale window.

See the [`revalidateTag` API reference](../03-api-reference/04-functions/revalidateTag.md) to learn more.

## `updateTag`

`updateTag` immediately expires cached data for read-your-own-writes scenarios — the user sees their change right away instead of stale content. Unlike `revalidateTag`, it can only be used in [Server Actions](../02-guides/server-actions.md).

```tsx filename="app/lib/actions.ts" highlight={1,12} switcher
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
	const post = await db.post.create({
		data: {
			title: formData.get('title'),
			content: formData.get('content'),
		},
	})

	updateTag('posts')
	redirect(`/posts/${post.id}`)
}
```

```jsx filename="app/lib/actions.js" highlight={1,12} switcher
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
	const post = await db.post.create({
		data: {
			title: formData.get('title'),
			content: formData.get('content'),
		},
	})

	updateTag('posts')
	redirect(`/posts/${post.id}`)
}
```

| | `updateTag` | `revalidateTag` |
| - | - | - |
| **Where** | Server Actions only | Server Actions and Route Handlers |
| **Behavior** | Immediately expires cache | Stale-while-revalidate |
| **Use case** | Read-your-own-writes (user sees their change) | Background refresh (slight delay OK) |

See the [`updateTag` API reference](../03-api-reference/04-functions/updateTag.md) to learn more.

## `revalidatePath`

`revalidatePath` invalidates all cached data for a specific route path. Use it when you want to revalidate a route without knowing which tags are associated with it.

```tsx filename="app/lib/actions.ts" highlight={1,5} switcher
import { revalidatePath } from 'next/cache'

export async function updateUser(id: string) {
	// Mutate data
	revalidatePath('/profile')
}
```

```jsx filename="app/lib/actions.js" highlight={1,5} switcher
import { revalidatePath } from 'next/cache'

export async function updateUser(id) {
	// Mutate data
	revalidatePath('/profile')
}
```

> **Good to know**: Prefer tag-based revalidation (`revalidateTag`/`updateTag`) over path-based when possible — it's more precise and avoids over-invalidating.

See the [`revalidatePath` API reference](../03-api-reference/04-functions/revalidatePath.md) to learn more.

## What should I cache?

Cache data that doesn't depend on [runtime data](./08-caching.md#working-with-runtime-apis) and that you're OK serving from cache for a period of time. Use `use cache` with `cacheLife` to describe that behavior.

When content doesn't need time-based revalidation, for example data from a CMS, use [`cacheTag`](#cachetag) and a long [`cacheLife`](#cachelife) like `max` to keep it in the static shell. Configure the content source to trigger a webhook, or other notification, that calls [`revalidateTag`](#revalidatetag) when the content changes. This reduces unnecessary time-based revalidation for content that hasn't changed.

> **Good to know:** In serverless environments, in-memory cache entries may not persist across revalidations. See [runtime caching considerations](../03-api-reference/01-directives/use-cache.md#runtime-caching-considerations) for details.

## INDEX

Related documents:

- [cacheLife](../03-api-reference/04-functions/cacheLife.md)
- [cacheTag](../03-api-reference/04-functions/cacheTag.md)
- [revalidateTag](../03-api-reference/04-functions/revalidateTag.md)
- [updateTag](../03-api-reference/04-functions/updateTag.md)
- [revalidatePath](../03-api-reference/04-functions/revalidatePath.md)
