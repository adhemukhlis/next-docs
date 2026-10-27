---
title: Route Segment Config
description: Learn about how to configure options for Next.js route segments.
---

The Route Segment Config options allow you to configure the behavior of a [Page](../page.md), [Layout](../layout.md), or [Route Handler](../route.md) by directly exporting the following variables:

| Option                                    | Type                                                              | Default                    |
| ----------------------------------------- | ----------------------------------------------------------------- | -------------------------- |
| [`dynamicParams`](./dynamicParams.md)     | `boolean`                                                         | `true`                     |
| [`runtime`](./runtime.md)                 | `'nodejs' \| 'edge' (deprecated)`                                 | `'nodejs'`                 |
| [`preferredRegion`](./preferredRegion.md) | `'auto' \| 'global' \| 'home' \| string \| string[] (deprecated)` | `'auto'`                   |
| [`maxDuration`](./maxDuration.md)         | `number`                                                          | Set by deployment platform |

With [Cache Components](../../05-config/01-next-config-js/cacheComponents.md) enabled, pages and layouts also support the following option:

| Option                              | Type                                                               | Default  |
| ----------------------------------- | ------------------------------------------------------------------ | -------- |
| [`ensureStatic`](./ensureStatic.md) | `'auto'` \| `'shell'` \| `'prefetch'` \| `'navigation'` \| `false` | `'auto'` |

## Version History

| Version |  |
| --- | --- |
| `v16.0.0` | `dynamic`, `dynamicParams`, `revalidate`, and `fetchCache` removed when [Cache Components](../../05-config/01-next-config-js/cacheComponents.md) is enabled. See [Caching and Revalidating (Previous Model)](../../../02-guides/caching-without-cache-components.md#route-segment-config). |
| `v16.0.0` | `export const experimental_ppr = true` removed. A [codemod](../../../02-guides/upgrading/codemods.md#remove-experimental_ppr-route-segment-config-from-app-router-pages-and-layouts) is available. |
| `v15.0.0-RC` | `export const runtime = "experimental-edge"` deprecated. A [codemod](../../../02-guides/upgrading/codemods.md#transform-app-router-route-segment-config-runtime-value-from-experimental-edge-to-edge) is available. |

## INDEX

Documents in this section:

- [dynamicParams](./dynamicParams.md)
- [ensureStatic](./ensureStatic.md)
- [instant](./instant.md)
- [maxDuration](./maxDuration.md)
- [preferredRegion (deprecated)](./preferredRegion.md)
- [prefetch](./prefetch.md)
- [runtime](./runtime.md)
