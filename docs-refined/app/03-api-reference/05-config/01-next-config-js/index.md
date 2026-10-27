---
title: next.config.js
description: Learn how to configure your application with next.config.js.
---

Next.js can be configured through a `next.config.js` file in the root of your project directory (for example, by `package.json`) with a default export.

```js filename="next.config.js"
// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {/* config options here */}

module.exports = nextConfig
```

## ECMAScript Modules

`next.config.js` is a regular Node.js module, not a JSON file. It gets used by the Next.js server and build phases, and it's not included in the browser build.

If you need [ECMAScript modules](https://nodejs.org/api/esm.html), you can use `next.config.mjs`:

```js filename="next.config.mjs"
// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {/* config options here */}

export default nextConfig
```

> **Good to know**: `next.config` with the `.cjs` or `.cts` extensions are currently **not** supported.

## Configuration as a Function

You can also use a function:

```js filename="next.config.mjs"
// @ts-check

export default (phase, { defaultConfig }) => {
	/**
	 * @type {import('next').NextConfig}
	 */
	const nextConfig = {/* config options here */}
	return nextConfig
}
```

### Async Configuration

Since Next.js 12.1.0, you can use an async function:

```js filename="next.config.js"
// @ts-check

module.exports = async (phase, { defaultConfig }) => {
	/**
	 * @type {import('next').NextConfig}
	 */
	const nextConfig = {/* config options here */}
	return nextConfig
}
```

### Phase

`phase` is the current context in which the configuration is loaded. You can see the [available phases](https://github.com/vercel/next.js/blob/5e6b008b561caf2710ab7be63320a3d549474a5b/packages/next/shared/lib/constants.ts#L19-L23). Phases can be imported from `next/constants`:

```js filename="next.config.js"
// @ts-check

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
	if (phase === PHASE_DEVELOPMENT_SERVER) {
		return {/* development only config options here */}
	}

	return {/* config options for all phases except development here */}
}
```

## TypeScript

If you are using TypeScript in your project, you can use `next.config.ts` to use TypeScript in your configuration:

```ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {/* config options here */}

export default nextConfig
```

The commented lines are the place where you can put the configs allowed by `next.config.js`, which are [defined in this file](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/config-shared.ts).

However, none of the configs are required, and it's not necessary to understand what each config does. Instead, search for the features you need to enable or modify in this section and they will show you what to do.

> Avoid using new JavaScript features not available in your target Node.js version. `next.config.js` will not be parsed by Webpack or Babel.

This page documents all the available configuration options:

## Unit Testing (experimental)

Starting in Next.js 15.1, the `next/experimental/testing/server` package contains utilities to help unit test `next.config.js` files.

The `unstable_getResponseFromNextConfig` function runs the [`headers`](./headers.md), [`redirects`](./redirects.md), and [`rewrites`](./rewrites.md) functions from `next.config.js` with the provided request information and returns `NextResponse` with the results of the routing.

> The response from `unstable_getResponseFromNextConfig` only considers `next.config.js` fields and does not consider proxy or filesystem routes, so the result in production may be different than the unit test.

```js
import { getRedirectUrl, unstable_getResponseFromNextConfig } from 'next/experimental/testing/server'

const response = await unstable_getResponseFromNextConfig({
	url: 'https://nextjs.org/test',
	nextConfig: {
		async redirects() {
			return [{ source: '/test', destination: '/test2', permanent: false }]
		},
	},
})
expect(response.status).toEqual(307)
expect(getRedirectUrl(response)).toEqual('https://nextjs.org/test2')
```

## INDEX

Documents in this section:

- [adapterPath](./adapterPath.md)
- [agentFeedback](./agentFeedback.md)
- [agentRules](./agentRules.md)
- [agentUpgrade](./agentUpgrade.md)
- [allowedDevOrigins](./allowedDevOrigins.md)
- [appDir](./appDir.md)
- [assetPrefix](./assetPrefix.md)
- [authInterrupts](./authInterrupts.md)
- [basePath](./basePath.md)
- [cacheComponents](./cacheComponents.md)
- [cacheHandlers](./cacheHandlers.md)
- [cacheLife](./cacheLife.md)
- [cacheMaxMemorySize](./cacheMaxMemorySize.md)
- [compress](./compress.md)
- [crossOrigin](./crossOrigin.md)
- [cssChunking](./cssChunking.md)
- [deploymentId](./deploymentId.md)
- [devIndicators](./devIndicators.md)
- [distDir](./distDir.md)
- [enablePrerenderSourceMaps](./enablePrerenderSourceMaps.md)
- [env](./env.md)
- [expireTime](./expireTime.md)
- [exportPathMap](./exportPathMap.md)
- [exposeTestingApiInProductionBuild](./exposeTestingApiInProductionBuild.md)
- [generateBuildId](./generateBuildId.md)
- [generateEtags](./generateEtags.md)
- [headers](./headers.md)
- [htmlLimitedBots](./htmlLimitedBots.md)
- [httpAgentOptions](./httpAgentOptions.md)
- [images](./images.md)
- [Custom Next.js Cache Handler](./incrementalCacheHandlerPath.md)
- [inlineCss](./inlineCss.md)
- [instrumentationClientInject](./instrumentationClientInject.md)
- [logging](./logging.md)
- [mdxRs](./mdxRs.md)
- [onDemandEntries](./onDemandEntries.md)
- [optimizePackageImports](./optimizePackageImports.md)
- [output](./output.md)
- [outputHashSalt](./outputHashSalt.md)
- [pageExtensions](./pageExtensions.md)
- [partialPrefetching](./partialPrefetching.md)
- [poweredByHeader](./poweredByHeader.md)
- [prefetchInlining](./prefetchInlining.md)
- [productionBrowserSourceMaps](./productionBrowserSourceMaps.md)
- [proxyClientMaxBodySize](./proxyClientMaxBodySize.md)
- [reactCompiler](./reactCompiler.md)
- [reactMaxHeadersLength](./reactMaxHeadersLength.md)
- [reactStrictMode](./reactStrictMode.md)
- [redirects](./redirects.md)
- [rewrites](./rewrites.md)
- [sassOptions](./sassOptions.md)
- [serverActions](./serverActions.md)
- [serverComponentsHmrCache](./serverComponentsHmrCache.md)
- [serverExternalPackages](./serverExternalPackages.md)
- [skipProxyUrlNormalize](./skipProxyUrlNormalize.md)
- [skipTrailingSlashRedirect](./skipTrailingSlashRedirect.md)
- [staleTimes](./staleTimes.md)
- [staticGeneration*](./staticGeneration.md)
- [supportsImmutableAssets](./supportsImmutableAssets.md)
- [taint](./taint.md)
- [trailingSlash](./trailingSlash.md)
- [transpilePackages](./transpilePackages.md)
- [turbopack](./turbopack.md)
- [turbopackChunking](./turbopackChunking.md)
- [Turbopack FileSystem Caching](./turbopackFileSystemCache.md)
- [turbopackGc](./turbopackGc.md)
- [turbopack.ignoreIssue](./turbopackIgnoreIssue.md)
- [turbopackLazyDynamicImports](./turbopackLazyDynamicImports.md)
- [turbopackLazyDynamicImportsSSR](./turbopackLazyDynamicImportsSSR.md)
- [turbopackLocalPostcssConfig](./turbopackLocalPostcssConfig.md)
- [Turbopack Memory Eviction](./turbopackMemoryEviction.md)
- [turbopackPluginRuntimeStrategy](./turbopackPluginRuntimeStrategy.md)
- [turbopackRustReactCompiler](./turbopackRustReactCompiler.md)
- [typedRoutes](./typedRoutes.md)
- [typescript](./typescript.md)
- [urlImports](./urlImports.md)
- [useLightningcss](./useLightningcss.md)
- [useOffline](./useOffline.md)
- [useTypeScriptCli](./useTypeScriptCli.md)
- [webVitalsAttribution](./webVitalsAttribution.md)
- [Custom Webpack Config](./webpack.md)
