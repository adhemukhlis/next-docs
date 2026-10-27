---
title: cacheMaxMemorySize
description: Configure the size of the in-memory cache that Next.js keeps in each server instance.
---

`cacheMaxMemorySize` sets the size, in bytes, of the in-memory cache each Next.js server instance keeps. It defaults to 50 MB.

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	cacheMaxMemorySize: 50 * 1024 * 1024, // 50 MB, the default
}

export default nextConfig
```

```js filename="next.config.js" switcher
/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheMaxMemorySize: 50 * 1024 * 1024, // 50 MB, the default
}

module.exports = nextConfig
```

The option sizes two separate caches:

- The server cache that stores prerendered pages, route handler responses, and optimized images. Set this to `0` when adopting a [custom `cacheHandler`](./incrementalCacheHandlerPath.md), so reads go to your store rather than a per-instance copy.
- The built-in handler behind [`'use cache'`](../../01-directives/use-cache.md). If you register your own handler through [`cacheHandlers`](./cacheHandlers.md), that handler manages its own memory and this option no longer applies to it.

Setting `cacheMaxMemorySize: 0` disables both in-memory caches. It is also a way to mimic how `use cache` behaves in a serverless environment, where entries rarely survive between requests.

> **Good to know**: `next dev` keeps its own in-memory cache regardless of this option, so reloads stay fast. Production honors the configured value exactly.
