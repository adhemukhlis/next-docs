---
title: Installation
description: Create a Next.js App Router app with `create-next-app`, structure the `app` and `public` directories, run the development server, and set up TypeScript, linting, and module path aliases.
---

Create a new Next.js app and run it locally.

## Quick start

Create a Next.js app named `my-app` with explicit options, then start the development server on `http://localhost:3000`:

```bash package="pnpm"
pnpm create next-app my-app \
  --app \
  --src-dir \
  --typescript \
  --import-alias "@/*" \
  --turbopack \
  --cache-components \
  --react-compiler \
  --biome \
  --tailwind \
  --use-pnpm
cd my-app
pnpm dev
```

```bash package="npm"
npx create-next-app@latest my-app \
  --app \
  --src-dir \
  --typescript \
  --import-alias "@/*" \
  --turbopack \
  --cache-components \
  --react-compiler \
  --biome \
  --tailwind \
  --use-npm
cd my-app
npm run dev
```

- Essential: `--app`, `--src-dir`, `--typescript`, `--import-alias`, `--turbopack`. The rest are optional.
- More detail: [`create-next-app`](../03-api-reference/06-cli/create-next-app.md#with-explicit-options) — every option and what each flag sets.

## System requirements

- Node.js 20.9 or later.

## Create the `app` directory

Next.js uses file-system routing, which means the routes in your application are determined by how you structure your files.

Create an `app` folder. Then, inside `app`, create a `layout.tsx` file. This file is the [root layout](../03-api-reference/03-file-conventions/layout.md#root-layout). It's required and must contain the `<html>` and `<body>` tags.

```tsx filename="app/layout.tsx" switcher
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
```

```jsx filename="app/layout.js" switcher
export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
```

Create the home route in `app/page.tsx` with some initial content:

```tsx filename="app/page.tsx" switcher
export default function Page() {
	return <h1>Hello, Next.js!</h1>
}
```

```jsx filename="app/page.jsx" switcher
export default function Page() {
	return <h1>Hello, Next.js!</h1>
}
```

Both `layout.tsx` and `page.tsx` will be rendered when the user visits the root of your application (`/`).

<Image
  alt="App Folder Structure"
  srcLight="/docs/light/app-getting-started.png"
  srcDark="/docs/dark/app-getting-started.png"
  width="1600"
  height="363"
/>

> **Good to know**:
>
> - If you forget to create the root layout, Next.js will automatically create this file when running the development server with `next dev`.
> - You can optionally use a [`src` folder](../03-api-reference/03-file-conventions/src-folder.md) in the root of your project to separate your application's code from configuration files.

## Create the `public` folder (optional)

Create a [`public` folder](../03-api-reference/03-file-conventions/public-folder.md) at the root of your project to store static assets such as images, fonts, etc. Files inside `public` can then be referenced by your code starting from the base URL (`/`).

You can then reference these assets using the root path (`/`). For example, `public/profile.png` can be referenced as `/profile.png`:

```tsx filename="app/page.tsx" highlight={4} switcher
import Image from 'next/image'

export default function Page() {
	return (
		<Image
			src="/profile.png"
			alt="Profile"
			width={100}
			height={100}
		/>
	)
}
```

```jsx filename="app/page.jsx" highlight={4} switcher
import Image from 'next/image'

export default function Page() {
	return (
		<Image
			src="/profile.png"
			alt="Profile"
			width={100}
			height={100}
		/>
	)
}
```

## Run the development server

1. Run `npm run dev` to start the development server.
2. Visit `http://localhost:3000` to view your application.
3. Edit the `app/page.tsx` file and save it to see the updated result in your browser.

## Set up TypeScript

> Minimum TypeScript version: `v5.1.0`

Next.js comes with built-in TypeScript support. To add TypeScript to your project, rename a file to `.ts` / `.tsx` and run `next dev`. Next.js will automatically install the necessary dependencies and add a `tsconfig.json` file with the recommended config options.

## Set up linting

Next.js supports linting with either ESLint or Biome. Choose a linter and run it directly via `package.json` scripts.

- Use **ESLint** (comprehensive rules):

```json filename="package.json"
{
	"scripts": {
		"lint": "eslint",
		"lint:fix": "eslint --fix"
	}
}
```

- Or use **Biome** (fast linter + formatter):

```json filename="package.json"
{
	"scripts": {
		"lint": "biome check",
		"format": "biome format --write"
	}
}
```

If you use ESLint, create an [`eslint.config.mjs`](https://eslint.org/docs/latest/use/configure/configuration-files) config. See the [ESLint API reference](../03-api-reference/05-config/03-eslint.md#with-core-web-vitals) for a recommended setup.

> **Good to know**: `next build` doesn't run the linter. Run it through your `package.json` scripts.

See the [ESLint Plugin](../03-api-reference/05-config/03-eslint.md) reference for more information.

## Set up Absolute Imports and Module Path Aliases

Next.js has in-built support for the `"paths"` and `"baseUrl"` options of `tsconfig.json` and `jsconfig.json` files.

These options allow you to alias project directories to absolute paths, making it easier and cleaner to import modules. For example:

```jsx
// Before
import { Button } from '../../../components/button'

// After
import { Button } from '@/components/button'
```

To configure absolute imports, add the `baseUrl` configuration option to your `tsconfig.json` or `jsconfig.json` file. For example:

```json filename="tsconfig.json or jsconfig.json"
{
	"compilerOptions": {
		"baseUrl": "src/"
	}
}
```

In addition to configuring the `baseUrl` path, you can use the `"paths"` option to `"alias"` module paths.

For example, the following configuration maps `@/components/*` to `components/*`:

```json filename="tsconfig.json or jsconfig.json"
{
	"compilerOptions": {
		"baseUrl": "src/",
		"paths": {
			"@/styles/*": ["styles/*"],
			"@/components/*": ["components/*"]
		}
	}
}
```

Each of the `"paths"` are relative to the `baseUrl` location.
