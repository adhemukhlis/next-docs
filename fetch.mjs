// Fetch the latest Next.js docs (canary) into docs/ (upstream mirror, App Router only),
// then sync docs-refined/ to the same file structure and report what needs refining.
// Usage: bun fetch.mjs [--sync | --fmt]
//   --sync  only sync docs-refined/ with docs/ (no fetch)
//   --fmt   only run formatting (no fetch)

import { $ } from 'bun'
import { rm, rename, readdir, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const rootDir = import.meta.dir
const nextJsDir = join(rootDir, 'next.js')
const docsDir = join(rootDir, 'docs')
const refinedDir = join(rootDir, 'docs-refined')
const commitHashFile = join(rootDir, 'commit-hash.txt')

// Removed from docs/ (and therefore docs-refined/). Paths are relative to docs/ after
// Step 5–7: top-level dirs without "[number]-" prefix, files as .md
// e.g. 'pages', 'app/02-guides/some-guide.md', 'app/03-api-reference/07-adapters'
const ignoreList = ['pages', 'architecture', 'community']

$.cwd(rootDir)

if (Bun.argv.includes('--fmt')) {
	await format()
	process.exit(0)
}
if (Bun.argv.includes('--sync')) {
	await syncRefined()
	process.exit(0)
}

// Step 0: Clean up previous run
console.log('🧹 Cleaning up previous run...')
await rm(nextJsDir, { recursive: true, force: true })
await rm(docsDir, { recursive: true, force: true })
await rm(commitHashFile, { force: true })

// Step 1: Sparse clone, docs/ only
console.log('🚚 Step 1: Running git clone with sparse-checkout...')
await $`git clone --depth 1 --filter=blob:none --no-checkout https://github.com/vercel/next.js`
await $`git sparse-checkout set --no-cone 'docs/*'`.cwd(nextJsDir)
await $`git checkout`.cwd(nextJsDir)

// Step 2: Save canary commit hash
console.log('\n📌 Step 2: Generating commit-hash.txt...')
const commitHash = (await $`git rev-parse HEAD`.cwd(nextJsDir).text()).trim()
await Bun.write(commitHashFile, commitHash + '\n')
console.log(`  🔖 Commit hash saved: ${commitHash}`)

// Step 3: Move docs/ to root
console.log('\n📂 Step 3: Moving docs/ to root directory...')
const sourceDocs = join(nextJsDir, 'docs')
if (!(await isDir(sourceDocs))) {
	console.error('❌ Error: docs/ directory not found in next.js repository')
	process.exit(1)
}
await rename(sourceDocs, docsDir)

// Step 4: Remove downloaded next.js repository
console.log('🗑️  Step 4: Removing next.js repository directory...')
await rm(nextJsDir, { recursive: true, force: true })

// Step 5: Strip "[number]-" prefix from top-level subdirectories
console.log('🏷️  Step 5: Renaming subdirectories in docs/...')
for (const entry of await readdir(docsDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue
	const newName = entry.name.replace(/^\d+-(.+)$/, '$1')
	if (newName !== entry.name) {
		await rename(join(docsDir, entry.name), join(docsDir, newName))
		console.log(`  ✏️  Renamed directory: ${entry.name} -> ${newName}`)
	}
}

// Remove MDX-only constructs that plain Markdown can't render
function cleanMdxContent(content) {
	// {/* ... */} comments, except inside fenced code blocks
	content = content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)|(\{\/\*[\s\S]*?\*\/\})/g, (match, codeBlock) => (codeBlock ? codeBlock : ''))
	// <PagesOnly> ... </PagesOnly> (with content)
	content = content.replace(/<PagesOnly\b[^>]*>[\s\S]*?<\/PagesOnly>/g, '')
	// <AppOnly> / </AppOnly> tags only (keep content)
	content = content.replace(/<AppOnly\b[^>]*>/g, '')
	content = content.replace(/<\/AppOnly>/g, '')
	return content
}

// Step 6 & 7: *.mdx -> *.md and clean MDX artifacts
console.log('🔄 Step 6 & 7: Converting *.mdx to *.md and cleaning MDX legacy blocks...')
const files = await Array.fromAsync(new Bun.Glob('**/*.{md,mdx}').scan({ cwd: docsDir, absolute: true }))
let convertedCount = 0
for (const file of files) {
	const content = cleanMdxContent(await Bun.file(file).text())
	if (file.endsWith('.mdx')) {
		await Bun.write(file.slice(0, -4) + '.md', content)
		await rm(file)
		convertedCount++
	} else {
		await Bun.write(file, content)
	}
}
console.log(`  ✨ Processed ${files.length} file(s), converted ${convertedCount} .mdx file(s) to .md.`)

// Step 8: Remove ignored dirs/files
console.log('🗑️  Step 8: Removing ignored contents from docs/...')
for (const item of ignoreList) {
	const itemPath = join(docsDir, item)
	if ((await isDir(itemPath)) || (await Bun.file(itemPath).exists())) {
		await rm(itemPath, { recursive: true, force: true })
		console.log(`  ➖ Removed: ${item}`)
	} else {
		console.warn(`  ⚠️  Not found upstream (renamed or removed?): ${item}`)
	}
}

// Step 9: Format with bun fmt
console.log('\n🎨 Step 9: Running formatting...')
await format()

// Step 10: Mirror docs/ structure into docs-refined/
await syncRefined()

console.log('\n🎉 All steps completed successfully!')

// Formatting options live here, inline — the repo has no formatter config file
async function format() {
	await $`bun fmt --no-script --no-config --log-level silent --ignore-pattern node_modules --ignore-pattern docs-json --ignore-pattern docs-context --use-tabs --tab-width 1 --bracket-same-line --single-quote --trailing-comma all --arrow-parens always --no-semi --prose-wrap never --print-width 180 --single-attribute-per-line --object-wrap preserve --end-of-line lf .`
}

// docs-refined/ must have exactly the same files as docs/:
// new upstream files are copied in raw, files gone upstream are removed.
// Upstream edits to existing files are only reported — re-refine them from `git diff -- docs/<file>`.
async function syncRefined() {
	console.log('\n🔁 Step 10: Syncing docs-refined/ with docs/...')
	await mkdir(refinedDir, { recursive: true })
	const upstream = await listMd(docsDir)
	const refined = await listMd(refinedDir)
	const added = [...upstream].filter((file) => !refined.has(file)).sort()
	const removed = [...refined].filter((file) => !upstream.has(file)).sort()
	for (const file of added) await Bun.write(join(refinedDir, file), Bun.file(join(docsDir, file)))
	for (const file of removed) await rm(join(refinedDir, file))
	await $`find ${refinedDir} -type d -empty -delete`

	const status = await $`git status --porcelain -uall -- docs`.text()
	const modified = status
		.split('\n')
		.filter((line) => line.slice(0, 2).includes('M'))
		.map((line) => line.slice(3).replace(/^docs\//, ''))
		.filter((file) => refined.has(file))
		.sort()

	const report = [
		['➕ Added (copied raw, needs refining)', added],
		['✏️  Modified upstream (re-refine from `git diff -- docs/<file>`)', modified],
		['➖ Removed upstream (deleted from docs-refined/)', removed],
	]
	for (const [label, list] of report) {
		console.log(`  ${label}: ${list.length}`)
		for (const file of list) console.log(`    - ${file}`)
	}
}

async function listMd(dir) {
	return new Set(await Array.fromAsync(new Bun.Glob('**/*.md').scan({ cwd: dir })))
}

async function isDir(path) {
	try {
		return (await Bun.file(path).stat()).isDirectory()
	} catch {
		return false
	}
}
