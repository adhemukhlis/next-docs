---
title: Upgrading
description: Learn how to upgrade your Next.js application to the latest version or canary.
---

## Latest version

To update to the latest version of Next.js, you can use the `upgrade` command:

```bash package="pnpm"
pnpm next upgrade
```

```bash package="npm"
npx next upgrade
```

```bash package="yarn"
yarn next upgrade
```

```bash package="bun"
bunx next upgrade
```

Versions before Next.js 16.1.0 do not support the `upgrade` command and need to use a separate package instead:

```bash filename="Terminal"
npx @next/codemod@canary upgrade latest
```

To have a coding agent perform and verify the upgrade, run:

```bash filename="Terminal"
npx next@canary upgrade --agent=latest
```

See [Upgrade with a coding agent](../02-guides/upgrading/agent-upgrade.md) for other policies and upgrade reminders.

If you prefer to upgrade manually, install the latest Next.js and React versions:

```bash package="pnpm"
pnpm i next@latest react@latest react-dom@latest eslint-config-next@latest
```

```bash package="npm"
npm i next@latest react@latest react-dom@latest eslint-config-next@latest
```

```bash package="yarn"
yarn add next@latest react@latest react-dom@latest eslint-config-next@latest
```

```bash package="bun"
bun add next@latest react@latest react-dom@latest eslint-config-next@latest
```

## Canary version

To update to the latest canary, make sure you're on the latest version of Next.js and everything is working as expected. Then, run the following command:

```bash package="pnpm"
pnpm add next@canary
```

```bash package="npm"
npm i next@canary
```

```bash package="yarn"
yarn add next@canary
```

```bash package="bun"
bun add next@canary
```

### Features available in canary

The following features are currently available in canary:

**Authentication**:

- [`forbidden`](../03-api-reference/04-functions/forbidden.md)
- [`unauthorized`](../03-api-reference/04-functions/unauthorized.md)
- [`forbidden.js`](../03-api-reference/03-file-conventions/forbidden.md)
- [`unauthorized.js`](../03-api-reference/03-file-conventions/unauthorized.md)
- [`authInterrupts`](../03-api-reference/05-config/01-next-config-js/authInterrupts.md)

## INDEX

See the version guides for in-depth upgrade instructions.

- [How to upgrade to version 16](../02-guides/upgrading/version-16.md)
- [How to upgrade to version 15](../02-guides/upgrading/version-15.md)
- [How to upgrade to version 14](../02-guides/upgrading/version-14.md)
