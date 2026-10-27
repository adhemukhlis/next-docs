---
title: Metadata Files API Reference
nav_title: Metadata Files
description: API documentation for the metadata file conventions.
---

This section of the docs covers **Metadata file conventions**. File-based metadata can be defined by adding special metadata files to route segments.

Each file convention can be defined using a static file (e.g. `opengraph-image.jpg`), or a dynamic variant that uses code to generate the file (e.g. `opengraph-image.js`).

Once a file is defined, Next.js will automatically serve the file (with hashes in production for caching) and update the relevant head elements with the correct metadata, such as the asset's URL, file type, and image size.

> [!TIP]
> **Good to know**:
>
> - Special Route Handlers like [`sitemap.ts`](./sitemap.md), [`opengraph-image.tsx`](./opengraph-image.md), and [`icon.tsx`](./app-icons.md), and other [metadata files](./index.md) are cached by default.
> - If using along with [`proxy.ts`](../proxy.md), [configure the matcher](../proxy.md#matcher) to exclude the metadata files.

## INDEX

Documents in this section:

- [favicon, icon, and apple-icon](./app-icons.md)
- [manifest.json](./manifest.md)
- [opengraph-image and twitter-image](./opengraph-image.md)
- [robots.txt](./robots.md)
- [sitemap.xml](./sitemap.md)
