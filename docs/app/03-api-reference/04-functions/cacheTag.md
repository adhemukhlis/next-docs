---
title: cacheTag
description: Learn how to use the cacheTag function to manage cache invalidation in your Next.js application.
related:
 title: Related
 description: View related API references.
 links:
  - ../05-config/01-next-config-js/cacheComponents.md
  - ../01-directives/use-cache.md
  - ./revalidateTag.md
  - ./updateTag.md
  - ./cacheLife.md
---

The `cacheTag` function allows you to tag cached data for on-demand invalidation. By associating tags with cache entries, you can selectively purge or revalidate specific cache entries without affecting other cached data.

## Usage

To use `cacheTag`, enable the [`cacheComponents` flag](../05-config/01-next-config-js/cacheComponents.md) in your `next.config.js` file:

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	cacheComponents: true,
}

export default nextConfig
```

```js filename="next.config.js" switcher
const nextConfig = {
	cacheComponents: true,
}

module.exports = nextConfig
```

The `cacheTag` function takes one or more string values.

```tsx filename="app/data.ts" switcher
import { cacheTag } from 'next/cache'

export async function getData() {
	'use cache'
	cacheTag('my-data')
	const res = await fetch('https://api.example.com/data')
	const data = await res.json()
	return data
}
```

```jsx filename="app/data.js" switcher
import { cacheTag } from 'next/cache'

export async function getData() {
	'use cache'
	cacheTag('my-data')
	const res = await fetch('https://api.example.com/data')
	const data = await res.json()
	return data
}
```

You can then purge the cache on-demand from a [Server Function](../../01-getting-started/07-mutating-data.md) or [Route Handler](../03-file-conventions/route.md):

- Use [`updateTag`](./updateTag.md) for read-your-own-writes scenarios, such as forms and other user-triggered mutations, where a user makes a change and the next read should fetch fresh data immediately. `updateTag` is only available inside Server Functions.
- Use [`revalidateTag`](./revalidateTag.md) when it is acceptable to serve stale data while revalidation happens in the background, or when revalidating from a [Route Handler](../03-file-conventions/route.md) or other context.

For example, this Server Function adds a post and then purges every cache entry tagged `'my-data'` so the next read reflects the change:

```tsx filename="app/action.ts" switcher
'use server'

import { updateTag } from 'next/cache'

export default async function submit() {
	await addPost()
	updateTag('my-data')
}
```

```jsx filename="app/action.js" switcher
'use server'

import { updateTag } from 'next/cache'

export default async function submit() {
	await addPost()
	updateTag('my-data')
}
```

## Good to know

- **Idempotent Tags**: Applying the same tag multiple times has no additional effect.
- **Multiple Tags**: You can assign multiple tags to a single cache entry by passing multiple string values to `cacheTag`.

```tsx
cacheTag('tag-one', 'tag-two')
```

- **Limits**: A single `cacheTag()` call accepts up to 128 tags, each with a maximum length of 256 characters. Tags longer than 256 characters are skipped, and any tags past the 128th in one call are dropped. Both cases log a console warning.

## Examples

### Tagging components or functions

Tag your cached data by calling `cacheTag` within a cached function or component:

```tsx filename="app/components/bookings.tsx" switcher
import { cacheTag } from 'next/cache'

interface BookingsProps {
	type: string
}

export async function Bookings({ type = 'haircut' }: BookingsProps) {
	'use cache'
	cacheTag('bookings-data')

	async function getBookingsData() {
		const response = await fetch(`https://api.example.com/bookings?type=${encodeURIComponent(type)}`)
		const data = await response.json()
		return data
	}

	return //...
}
```

```jsx filename="app/components/bookings.js" switcher
import { cacheTag } from 'next/cache'

export async function Bookings({ type = 'haircut' }) {
	'use cache'
	cacheTag('bookings-data')

	async function getBookingsData() {
		const response = await fetch(`https://api.example.com/bookings?type=${encodeURIComponent(type)}`)
		const data = await response.json()
		return data
	}

	return //...
}
```

### Creating tags from external data

You can use the data returned from an async function to tag the cache entry.

```tsx filename="app/components/bookings.tsx" switcher
import { cacheTag } from 'next/cache'

interface BookingsProps {
	type: string
}

export async function Bookings({ type = 'haircut' }: BookingsProps) {
	async function getBookingsData() {
		'use cache'
		const response = await fetch(`https://api.example.com/bookings?type=${encodeURIComponent(type)}`)
		const data = await response.json()
		cacheTag('bookings-data', data.id)
		return data
	}
	return //...
}
```

```jsx filename="app/components/bookings.js" switcher
import { cacheTag } from 'next/cache'

export async function Bookings({ type = 'haircut' }) {
	async function getBookingsData() {
		'use cache'
		const response = await fetch(`https://api.example.com/bookings?type=${encodeURIComponent(type)}`)
		const data = await response.json()
		cacheTag('bookings-data', data.id)
		return data
	}
	return //...
}
```

### Invalidating tagged cache

Using [`revalidateTag`](./revalidateTag.md), you can invalidate the cache for a specific tag when needed:

```tsx filename="app/actions.ts" switcher
'use server'

import { revalidateTag } from 'next/cache'

export async function updateBookings() {
	await updateBookingData()
	revalidateTag('bookings-data', 'max')
}
```

```jsx filename="app/actions.js" switcher
'use server'

import { revalidateTag } from 'next/cache'

export async function updateBookings() {
	await updateBookingData()
	revalidateTag('bookings-data', 'max')
}
```

## Version History

| Version   | Changes                                                |
| --------- | ------------------------------------------------------ |
| `v16.0.0` | `cacheTag` stabilized. `unstable_cacheTag` deprecated. |

See the [Next.js 16 upgrade guide](../../02-guides/upgrading/version-16.md#cachelife-and-cachetag) to update imports from `unstable_cacheTag` to `cacheTag`.
