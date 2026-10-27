---
title: Installation
description: Check the system requirements, create a Next.js App Router app with `create-next-app`, run the development server, and review the generated project.
---

Create a new Next.js app and run it locally.

## System requirements

- Node.js 20.9 or later.

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
  --biome \
  --tailwind \
  --use-npm
cd my-app
npm run dev
```

> [!NOTE]
> Essential: `--app`, `--src-dir`, `--typescript`, `--import-alias`, `--turbopack`. The rest are optional.

> [!IMPORTANT]
> More detail: [`create-next-app`](../03-api-reference/06-cli/create-next-app.md#with-explicit-options) — every option and what each flag sets.

## Generated project

The Quick start commands produce a ready-to-run project:

Dependencies:

- `next`
- `react`
- `@biomejs/biome`
- `tailwindcss`
- `typescript`

Configuration:

- `next.config.ts` — Next.js
- `pnpm-workspace.yaml` — pnpm (pnpm only)
- `biome.json` — Biome
- `tsconfig.json` — TypeScript

Structure:

- `src/app`
