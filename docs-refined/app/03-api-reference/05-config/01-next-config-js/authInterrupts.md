---
title: authInterrupts
description: Learn how to enable the experimental `authInterrupts` configuration option to use `forbidden` and `unauthorized`.
version: canary
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

## INDEX

Related documents:

- [forbidden](../../04-functions/forbidden.md)
- [unauthorized](../../04-functions/unauthorized.md)
- [forbidden.js](../../03-file-conventions/forbidden.md)
- [unauthorized.js](../../03-file-conventions/unauthorized.md)
