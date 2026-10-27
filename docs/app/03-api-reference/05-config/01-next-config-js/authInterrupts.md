---
title: authInterrupts
description: Learn how to enable the experimental `authInterrupts` configuration option to use `forbidden` and `unauthorized`.
version: canary
related:
 links:
  - ../../04-functions/forbidden.md
  - ../../04-functions/unauthorized.md
  - ../../03-file-conventions/forbidden.md
  - ../../03-file-conventions/unauthorized.md
---

The `authInterrupts` configuration option allows you to use [`forbidden`](../../04-functions/forbidden.md) and [`unauthorized`](../../04-functions/unauthorized.md) APIs in your application. While these functions are experimental, you must enable the `authInterrupts` option in your `next.config.js` file to use them:

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	experimental: {
		authInterrupts: true,
	},
}

export default nextConfig
```

```js filename="next.config.js" switcher
module.exports = {
	experimental: {
		authInterrupts: true,
	},
}
```
