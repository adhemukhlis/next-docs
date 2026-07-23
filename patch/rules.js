const rules = [
	{
		target: 'docs/index.md',
		replacements: [
			{
				search: /- \*\*Pages Router\*\*: (.*)/g,
				replace: '- ~~**Pages Router**: $1~~',
			},
			{
				search:
					/\n\nAt the top of the sidebar, you'll notice a dropdown menu that allows you to switch between the \[App Router\]\(\/docs\/app\) and the \[Pages Router\]\(\/docs\/pages\) docs\./g,
				replace: '',
			},
		],
	},
	{
		target: 'docs/app/01-getting-started/01-installation.md',
		replacements: [
			{
				search: /\n> - The `Pages Router` uses the React version from your `package.json`\./g,
				replace: '',
			},
		],
	},
	{
		target: 'docs/app/01-getting-started/02-project-structure.md',
		replacements: [
			{
				search: /\| \[`pages`\]\(\/docs\/pages\/building-your-application\/routing\)\s+\| Pages Router\s+\|\n/g,
				replace: '',
			},
		],
	},
	{
		target: 'docs/app/02-guides/backend-for-frontend.md',
		replacements: [
			{
				search: /- In Pages Router, \[API Routes\]\(\/docs\/pages\/building-your-application\/routing\/api-routes\)\n/g,
				replace: '',
			},
		],
	},
	{
		target: 'docs/app/02-guides/how-revalidation-works.md',
		replacements: [
			{
				search:
					/> \*\*Good to know:\*\* Pages Router on-demand ISR APIs \(for example `res\.revalidate\(\)` and the `x-prerender-revalidate` flow\) are still supported and use the server cache handler \(`cacheHandler`, singular\)\. The `cacheHandlers` option \(plural\) is for `'use cache'` directives\.\n\n/g,
				replace: '',
			},
		],
	},
	{
		target: 'docs/app/02-guides/incremental-static-regeneration.md',
		replacements: [
			{
				search: /\| `v12\.2\.0` \| Pages Router:.*\n\| `v12\.0\.0` \| Pages Router:.*\n\| `v9\.5\.0`  \| Pages Router:.*\n/g,
				replace: '',
			},
		],
	},
	{
		target: 'docs/app/02-guides/single-page-applications.md',
		replacements: [
			{
				search:
					/\n\nIf you are already using a SPA with the Pages Router, you can learn how to \[incrementally adopt the App Router\]\(\/docs\/app\/guides\/migrating\/app-router-migration\)\./g,
				replace: '',
			},
		],
	},
]

module.exports = rules
