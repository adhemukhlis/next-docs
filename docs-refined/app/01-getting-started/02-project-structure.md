---
title: Project structure and organization
nav_title: Project Structure
description: Map the folder and file conventions of a Next.js App Router project (top-level folders and files, routing files, route patterns, metadata files) and the options for organizing project files around them.
---

This document lists **all** the folder and file conventions in Next.js, then the options for organizing your project.

## Folder and file conventions

### Top-level folders

Top-level folders are used to organize your application's code and static assets.

|                                                                      |                                         |
| -------------------------------------------------------------------- | --------------------------------------- |
| [`src`](../03-api-reference/03-file-conventions/src-folder.md)       | Optional application source folder      |
| [`app`](../index.md)                                                 | App Router (`src/app` when using `src`) |
| [`public`](../03-api-reference/03-file-conventions/public-folder.md) | Static assets to be served              |

### Top-level files

Top-level files are used to configure your application, manage dependencies, run proxy, integrate monitoring tools, and define environment variables.

|                                                                               |                                                                                    |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Next.js**                                                                   |                                                                                    |
| [`next.config.ts`](../03-api-reference/05-config/01-next-config-js/index.md)  | Configuration file for Next.js                                                     |
| [`package.json`](./01-installation.md)                                        | Project dependencies and scripts                                                   |
| `pnpm-workspace.yaml`                                                         | pnpm settings, such as which dependencies may run build scripts (pnpm only)        |
| [`instrumentation.ts`](../02-guides/instrumentation.md)                       | OpenTelemetry and Instrumentation file                                             |
| [`proxy.ts`](../03-api-reference/03-file-conventions/proxy.md)                | Next.js request proxy                                                              |
| [`.env`](../02-guides/environment-variables.md)                               | Environment variables (should not be tracked by version control)                   |
| [`.env.local`](../02-guides/environment-variables.md)                         | Local environment variables (should not be tracked by version control)             |
| [`.env.production`](../02-guides/environment-variables.md)                    | Production environment variables (should not be tracked by version control)        |
| [`.env.development`](../02-guides/environment-variables.md)                   | Development environment variables (should not be tracked by version control)       |
| [`eslint.config.mjs`](../03-api-reference/05-config/03-eslint.md)             | Configuration file for ESLint                                                      |
| `biome.json`                                                                  | Configuration file for Biome                                                       |
| `.gitignore`                                                                  | Git files and folders to ignore                                                    |
| [`next-env.d.ts`](../03-api-reference/05-config/02-typescript.md#next-envdts) | TypeScript declaration file for Next.js (should not be tracked by version control) |
| `tsconfig.json`                                                               | Configuration file for TypeScript                                                  |
| `jsconfig.json`                                                               | Configuration file for JavaScript                                                  |

### Routing files

Add `page.tsx` to expose a route, `layout.tsx` for shared UI such as header, nav, or footer, `loading.tsx` for skeletons, `error.tsx` for error boundaries, and `route.ts` for APIs.

|                                                                                 |               |                         |
| ------------------------------------------------------------------------------- | ------------- | ----------------------- |
| [`layout`](../03-api-reference/03-file-conventions/layout.md)                   | `.jsx` `.tsx` | Layout                  |
| [`page`](../03-api-reference/03-file-conventions/page.md)                       | `.jsx` `.tsx` | Route UI                |
| [`loading`](../03-api-reference/03-file-conventions/loading.md)                 | `.jsx` `.tsx` | Loading UI              |
| [`not-found`](../03-api-reference/03-file-conventions/not-found.md)             | `.jsx` `.tsx` | Not found UI            |
| [`error`](../03-api-reference/03-file-conventions/error.md)                     | `.jsx` `.tsx` | Error UI                |
| [`global-error`](../03-api-reference/03-file-conventions/error.md#global-error) | `.jsx` `.tsx` | Global error UI         |
| [`route`](../03-api-reference/03-file-conventions/route.md)                     | `.js` `.ts`   | API endpoint            |
| [`template`](../03-api-reference/03-file-conventions/template.md)               | `.jsx` `.tsx` | Re-rendered layout      |
| [`default`](../03-api-reference/03-file-conventions/default.md)                 | `.jsx` `.tsx` | Parallel route fallback |

### Nested routes

Folders define URL segments. Nesting folders nests segments. Layouts at any level wrap their child segments. A route becomes public when a `page.tsx` or `route.ts` file exists.

| Path                        | URL pattern     | Notes                         |
| --------------------------- | --------------- | ----------------------------- |
| `app/layout.tsx`            | —               | Root layout wraps all routes  |
| `app/blog/layout.tsx`       | —               | Wraps `/blog` and descendants |
| `app/page.tsx`              | `/`             | Public route                  |
| `app/blog/page.tsx`         | `/blog`         | Public route                  |
| `app/blog/authors/page.tsx` | `/blog/authors` | Public route                  |

### Dynamic routes

Parameterize segments with square brackets. Use `[segment]` for a single param, `[...segment]` for catch‑all, and `[[...segment]]` for optional catch‑all. Access values via the [`params`](../03-api-reference/03-file-conventions/page.md#params-optional) prop.

| Path                            | URL pattern                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `app/blog/[slug]/page.tsx`      | `/blog/my-first-post`                                                |
| `app/shop/[...slug]/page.tsx`   | `/shop/clothing`, `/shop/clothing/shirts`                            |
| `app/docs/[[...slug]]/page.tsx` | `/docs`, `/docs/layouts-and-pages`, `/docs/api-reference/use-router` |

### Route groups and private folders

Organize code without changing URLs with route groups [`(group)`](../03-api-reference/03-file-conventions/route-groups.md#convention), and colocate non-routable files with private folders [`_folder`](#private-folders).

| Path                            | URL pattern | Notes                                     |
| ------------------------------- | ----------- | ----------------------------------------- |
| `app/(marketing)/page.tsx`      | `/`         | Group omitted from URL                    |
| `app/(shop)/cart/page.tsx`      | `/cart`     | Share layouts within `(shop)`             |
| `app/blog/_components/Post.tsx` | —           | Not routable; safe place for UI utilities |
| `app/blog/_lib/data.ts`         | —           | Not routable; safe place for utils        |

### Parallel and intercepted routes

These features fit specific UI patterns, such as slot-based layouts or modal routing.

Use `@slot` for named slots rendered by a parent layout. Use intercept patterns to render another route inside the current layout without changing the URL, for example, to show a details view as a modal over a list.

| Pattern (docs)                                                                                | Meaning              | Typical use case                         |
| --------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------- |
| [`@folder`](../03-api-reference/03-file-conventions/parallel-routes.md#slots)                 | Named slot           | Sidebar + main content                   |
| [`(.)folder`](../03-api-reference/03-file-conventions/intercepting-routes.md#convention)      | Intercept same level | Preview sibling route in a modal         |
| [`(..)folder`](../03-api-reference/03-file-conventions/intercepting-routes.md#convention)     | Intercept parent     | Open a child of the parent as an overlay |
| [`(..)(..)folder`](../03-api-reference/03-file-conventions/intercepting-routes.md#convention) | Intercept two levels | Deeply nested overlay                    |
| [`(...)folder`](../03-api-reference/03-file-conventions/intercepting-routes.md#convention)    | Intercept from root  | Show arbitrary route in current view     |

### Metadata file conventions

#### App icons

|  |  |  |
| --- | --- | --- |
| [`favicon`](../03-api-reference/03-file-conventions/01-metadata/app-icons.md#favicon) | `.ico` | Favicon file |
| [`icon`](../03-api-reference/03-file-conventions/01-metadata/app-icons.md#icon) | `.ico` `.jpg` `.jpeg` `.png` `.svg` | App Icon file |
| [`icon`](../03-api-reference/03-file-conventions/01-metadata/app-icons.md#generate-icons-using-code-js-ts-tsx) | `.jsx` `.tsx` | Generated App Icon |
| [`apple-icon`](../03-api-reference/03-file-conventions/01-metadata/app-icons.md#apple-icon) | `.jpg` `.jpeg` `.png` | Apple App Icon file |
| [`apple-icon`](../03-api-reference/03-file-conventions/01-metadata/app-icons.md#generate-icons-using-code-js-ts-tsx) | `.jsx` `.tsx` | Generated Apple App Icon |

#### Open Graph and Twitter images

|  |  |  |
| --- | --- | --- |
| [`opengraph-image`](../03-api-reference/03-file-conventions/01-metadata/opengraph-image.md#opengraph-image) | `.jpg` `.jpeg` `.png` `.gif` | Open Graph image file |
| [`opengraph-image`](../03-api-reference/03-file-conventions/01-metadata/opengraph-image.md#generate-images-using-code-js-ts-tsx) | `.jsx` `.tsx` | Generated Open Graph image |
| [`twitter-image`](../03-api-reference/03-file-conventions/01-metadata/opengraph-image.md#twitter-image) | `.jpg` `.jpeg` `.png` `.gif` | Twitter image file |
| [`twitter-image`](../03-api-reference/03-file-conventions/01-metadata/opengraph-image.md#generate-images-using-code-js-ts-tsx) | `.jsx` `.tsx` | Generated Twitter image |

#### SEO

|                                                                                                                   |             |                       |
| ----------------------------------------------------------------------------------------------------------------- | ----------- | --------------------- |
| [`sitemap`](../03-api-reference/03-file-conventions/01-metadata/sitemap.md#sitemap-files-xml)                     | `.xml`      | Sitemap file          |
| [`sitemap`](../03-api-reference/03-file-conventions/01-metadata/sitemap.md#generating-a-sitemap-using-code-js-ts) | `.js` `.ts` | Generated Sitemap     |
| [`robots`](../03-api-reference/03-file-conventions/01-metadata/robots.md#static-robotstxt)                        | `.txt`      | Robots file           |
| [`robots`](../03-api-reference/03-file-conventions/01-metadata/robots.md#generate-a-robots-file)                  | `.js` `.ts` | Generated Robots file |

## Organizing your project

Next.js is **unopinionated** about how you organize and colocate your project files. But it does provide several features to help you organize your project.

### Component hierarchy

The components defined in special files are rendered in a specific hierarchy:

- `layout.tsx`
- `template.tsx`
- `error.tsx` (React error boundary)
- `loading.tsx` (React suspense boundary)
- `not-found.tsx` (React error boundary for "not found" UI)
- `page.tsx` or nested `layout.tsx`

The components are rendered recursively in nested routes, meaning the components of a route segment will be nested **inside** the components of its parent segment.

### Colocation

In the `app` directory, nested folders define route structure. Each folder represents a route segment that is mapped to a corresponding segment in a URL path.

However, even though route structure is defined through folders, a route is **not publicly accessible** until a `page.tsx` or `route.ts` file is added to a route segment.

And, even when a route is made publicly accessible, only the **content returned** by `page.tsx` or `route.ts` is sent to the client.

This means that **project files** can be **safely colocated** inside route segments in the `app` directory without accidentally being routable.

> [!TIP]
> **Good to know**: While you **can** colocate your project files in `app` you don't **have** to. If you prefer, you can [keep them outside the `app` directory](#store-project-files-outside-of-app).

### Private folders

Private folders can be created by prefixing a folder with an underscore: `_folderName`

This indicates the folder is a private implementation detail and should not be considered by the routing system, thereby **opting the folder and all its subfolders** out of routing.

Since files in the `app` directory can be [safely colocated by default](#colocation), private folders are not required for colocation. However, they can be useful for:

- Separating UI logic from routing logic.
- Consistently organizing internal files across a project and the Next.js ecosystem.
- Sorting and grouping files in code editors.
- Avoiding potential naming conflicts with future Next.js file conventions.

> [!TIP]
> **Good to know**:
>
> - While not a framework convention, you might also consider marking files outside private folders as "private" using the same underscore pattern.
> - You can create URL segments that start with an underscore by prefixing the folder name with `%5F` (the URL-encoded form of an underscore): `%5FfolderName`.
> - If you don't use private folders, it would be helpful to know Next.js [special file conventions](#routing-files) to prevent unexpected naming conflicts.

### Route groups

Route groups can be created by wrapping a folder in parenthesis: `(folderName)`

This indicates the folder is for organizational purposes and should **not be included** in the route's URL path.

Route groups are useful for:

- Organizing routes by site section, intent, or team. e.g. marketing routes, admin routes, etc.
- Enabling nested layouts in the same route segment level:
  - [Creating multiple nested layouts in the same segment, including multiple root layouts](#creating-multiple-root-layouts)
  - [Adding a layout to a subset of routes in a common segment](#opting-specific-segments-into-a-layout)

### `src` folder

Next.js supports storing application code (including `app`) inside an optional [`src` folder](../03-api-reference/03-file-conventions/src-folder.md). This separates application code from project configuration files which mostly live in the root of a project.

## Examples

The following section lists a very high-level overview of common strategies. The simplest takeaway is to choose a strategy that works for you and your team and be consistent across the project.

> [!TIP]
> **Good to know**: In our examples below, we're using `components` and `lib` folders as generalized placeholders, their naming has no special framework significance and your projects might use other folders like `ui`, `utils`, `hooks`, `styles`, etc.

### Store project files outside of `app`

This strategy stores all application code in shared folders in the **root of your project** and keeps the `app` directory purely for routing purposes.

### Store project files in top-level folders inside of `app`

This strategy stores all application code in shared folders in the **root of the `app` directory**.

### Split project files by feature or route

This strategy stores globally shared application code in the root `app` directory and **splits** more specific application code into the route segments that use them.

### Organize routes without affecting the URL path

To organize routes without affecting the URL, create a group to keep related routes together. The folders in parenthesis will be omitted from the URL (e.g. `(marketing)` or `(shop)`).

Even though routes inside `(marketing)` and `(shop)` share the same URL hierarchy, you can create a different layout for each group by adding a `layout.tsx` file inside their folders. These layouts nest within the existing app layout.

### Opting specific segments into a layout

To opt specific routes into a layout, create a new route group (e.g. `(shop)`) and move the routes that share the same layout into the group (e.g. `account` and `cart`). The routes outside of the group will not share the layout (e.g. `checkout`).

### Opting for loading skeletons on a specific route

To apply a [loading skeleton](../03-api-reference/03-file-conventions/loading.md) via a `loading.tsx` file to a specific route, create a new route group (e.g., `/(overview)`) and then move your `loading.tsx` inside that route group.

Now, the `loading.tsx` file will only apply to your dashboard → overview route instead of all your dashboard routes without affecting the URL path structure.

### Creating multiple root layouts

To create multiple [root layouts](../03-api-reference/03-file-conventions/layout.md#root-layout), remove the top-level `layout.tsx` file, and add a `layout.tsx` file inside each route group. This is useful for partitioning an application into sections that have a completely different UI or experience. The `<html>` and `<body>` tags need to be added to each root layout.
