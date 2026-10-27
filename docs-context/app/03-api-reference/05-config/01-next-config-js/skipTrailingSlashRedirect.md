---
title: skipTrailingSlashRedirect
description: Disable the automatic trailing slash redirects so you can handle trailing slashes yourself in Proxy.
---

Enabling `skipTrailingSlashRedirect` turns off the automatic redirects that add or remove a trailing slash. You handle any redirecting you still want in [Proxy](../../03-file-conventions/proxy.md).

**Most projects don't need this option.** It is one of the [advanced Proxy flags](../../03-file-conventions/proxy.md#advanced-proxy-flags), meant for specific routing cases and debugging.

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	skipTrailingSlashRedirect: true,
}

export default nextConfig
```

```js filename="next.config.js" switcher
/** @type {import('next').NextConfig} */
const nextConfig = {
	skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
```

## Reference

By default, Next.js redirects every request so the trailing slash matches your [`trailingSlash`](./trailingSlash.md) setting.

| `trailingSlash` | Request | Default response |
| - | - | - |
| `false` | `/about` | `200` |
| `false` | `/about/` | `308` redirect to `/about` |
| `true` | `/about` | `308` redirect to `/about/` |
| `true` | `/about/` | `200` |

Enabling `skipTrailingSlashRedirect` affects both server responses and client-side navigation:

- Both `/about` and `/about/` return `200`. Neither redirects to the other.
- Next.js stops changing trailing slashes during client-side navigation. [`<Link>`](../../02-components/link.md) and router URLs keep the path exactly as written.

Your own `redirects` and `rewrites` from `next.config.js` still apply.

### Paths that contain a dot

If the last path segment contains a dot, Next.js treats the path as a file and removes the trailing slash, regardless of the `trailingSlash` setting. A dot in an earlier segment has no effect, except under `.well-known/`, which is exempt from the default redirects when `trailingSlash` is `true`.

| Request | `trailingSlash: true` | `trailingSlash: false` | `skipTrailingSlashRedirect: true` |
| - | - | - | - |
| `/about` | `308` redirect to `/about/` | `200` | `200` |
| `/about/` | `200` | `308` redirect to `/about` | `200` |
| `/gcc.git/` | `308` redirect to `/gcc.git` | `308` redirect to `/gcc.git` | `200` |
| `/version/1.2.3/` | `308` redirect to `/version/1.2.3` | `308` redirect to `/version/1.2.3` | `200` |
| `/version/1.2.3/my-page/` | `200` | `308` redirect to `/version/1.2.3/my-page` | `200` |
| `/.well-known/x/` | `200` | `308` redirect to `/.well-known/x` | `200` |

With `skipTrailingSlashRedirect` enabled, none of these redirects are generated and every path is served at whichever form was requested.

## Good to know

- Keep setting [`trailingSlash`](./trailingSlash.md) as you did before. It still controls the URLs Next.js generates and the output filenames for [`output: 'export'`](../../../02-guides/static-exports.md).
- With `output: 'export'`, this preserves the `href` instead of resolving `/me` to `/me/`. See [Static Exports](../../../02-guides/static-exports.md).
- Serving one page at both `/about` and `/about/` gives search engines two URLs for it. Set a [canonical URL](../../04-functions/generate-metadata.md#alternates) in your metadata, or redirect in [Proxy](../../03-file-conventions/proxy.md).

## Examples

### Handling trailing slashes in Proxy

With `skipTrailingSlashRedirect` enabled, Next.js no longer adds trailing slashes, but Proxy can still add them selectively. This example adds a trailing slash to your own routes while leaving a set of legacy prefixes untouched, which makes an incremental migration easier.

```ts filename="proxy.ts" switcher
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const legacyPrefixes = ['/docs', '/blog']

export default function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (legacyPrefixes.some((prefix) => pathname.startsWith(prefix))) {
		return NextResponse.next()
	}

	// Apply trailing slash handling, skipping files and `.well-known` paths
	if (!pathname.endsWith('/') && !pathname.match(/((?!\.well-known(?:\/.*)?)(?:[^/]+\/)*[^/]+\.\w+)/)) {
		return NextResponse.redirect(new URL(`${pathname}/`, request.nextUrl))
	}
}
```

```js filename="proxy.js" switcher
import { NextResponse } from 'next/server'

const legacyPrefixes = ['/docs', '/blog']

export default function proxy(request) {
	const { pathname } = request.nextUrl

	if (legacyPrefixes.some((prefix) => pathname.startsWith(prefix))) {
		return NextResponse.next()
	}

	// Apply trailing slash handling, skipping files and `.well-known` paths
	if (!pathname.endsWith('/') && !pathname.match(/((?!\.well-known(?:\/.*)?)(?:[^/]+\/)*[^/]+\.\w+)/)) {
		return NextResponse.redirect(new URL(`${pathname}/`, request.nextUrl))
	}
}
```

## Version History

| Version | Changes |
| - | - |
| `v13.1.0` | `skipTrailingSlashRedirect` added. |
