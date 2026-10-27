---
title: adapterPath
description: Configure a custom adapter for Next.js to hook into the build process.
---

Next.js provides a built-in adapters API. It allows deployment platforms or build systems to integrate with the Next.js build process.

For a full reference implementation, see the [`nextjs/adapter-vercel`](https://github.com/nextjs/adapter-vercel) adapter.

## Configuration

To use an adapter, specify the path to your adapter module in `adapterPath`:

```js filename="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
	adapterPath: require.resolve('./my-adapter.js'),
}

module.exports = nextConfig
```

Alternatively `NEXT_ADAPTER_PATH` can be set to enable zero-config usage in deployment platforms.

## Adapters

For full adapter implementation details, use the dedicated Adapters section:

- [Configuration](../../07-adapters/01-configuration.md)
- [Creating an Adapter](../../07-adapters/02-creating-an-adapter.md)
- [API Reference](../../07-adapters/03-api-reference.md)
- [Testing Adapters](../../07-adapters/04-testing-adapters.md)
- [Routing with `@next/routing`](../../07-adapters/05-routing-with-next-routing.md)
- [Implementing PPR in an Adapter](../../07-adapters/06-implementing-ppr-in-an-adapter.md)
- [Runtime Integration](../../07-adapters/07-runtime-integration.md)
- [Invoking Entrypoints](../../07-adapters/08-invoking-entrypoints.md)
- [Output Types](../../07-adapters/09-output-types.md)
- [Routing Information](../../07-adapters/10-routing-information.md)
- [Use Cases](../../07-adapters/11-use-cases.md)

## Creating an Adapter

See [Creating an Adapter](../../07-adapters/02-creating-an-adapter.md).

## API Reference

See [API Reference](../../07-adapters/03-api-reference.md).

## Testing Adapters

See [Testing Adapters](../../07-adapters/04-testing-adapters.md).

## Routing with `@next/routing`

See [Routing with `@next/routing`](../../07-adapters/05-routing-with-next-routing.md).

## Implementing PPR in an Adapter

See [Implementing PPR in an Adapter](../../07-adapters/06-implementing-ppr-in-an-adapter.md).

## Runtime Integration

See [Runtime Integration](../../07-adapters/07-runtime-integration.md).

## Invoking Entrypoints

See [Invoking Entrypoints](../../07-adapters/08-invoking-entrypoints.md).

## Output Types

See [Output Types](../../07-adapters/09-output-types.md).

## Routing Information

See [Routing Information](../../07-adapters/10-routing-information.md).

## Use Cases

See [Use Cases](../../07-adapters/11-use-cases.md).

## Version History

| Version   | Changes                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `v16.2.0` | `adapterPath` stabilized and moved from `experimental.adapterPath` to the top-level `adapterPath` option. |
