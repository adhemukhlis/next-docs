// Pull the latest Next.js docs (canary) into docs/, App Router only.
// Usage: bun script.mjs [--force | --fmt]
//   --force  overwrite docs/ even if it has uncommitted changes
//   --fmt    only run formatting (Step 9), no pull

import { $ } from 'bun'
import { rm, rename, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const rootDir = import.meta.dir
const nextJsDir = join(rootDir, 'next.js')
const docsDir = join(rootDir, 'docs')
const commitHashFile = join(rootDir, 'commit-hash.txt')
const ignoreList = ['02-pages', '03-architecture', '04-community']
const force = Bun.argv.includes('--force')

$.cwd(rootDir)

if (Bun.argv.includes('--fmt')) {
	await format()
	process.exit(0)
}

// Step 0: Refuse to wipe uncommitted refinements in docs/, then clean up previous runs
const dirty = (await $`git status --porcelain -- docs`.quiet().nothrow().text()).trim()
if (dirty && !force) {
	console.error('❌ docs/ has uncommitted changes. Commit/stash them first, or rerun with --force.')
	process.exit(1)
}
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

// Step 5: Remove ignored top-level sections
console.log('🗑️  Step 5: Removing ignored contents from docs/...')
for (const item of await readdir(docsDir)) {
	if (ignoreList.includes(item)) {
		await rm(join(docsDir, item), { recursive: true, force: true })
		console.log(`  ➖ Removed: ${item}`)
	}
}

// Step 6: Strip "[number]-" prefix from top-level subdirectories
console.log('🏷️  Step 6: Renaming subdirectories in docs/...')
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

// Step 7 & 8: *.mdx -> *.md and clean MDX artifacts
console.log('🔄 Step 7 & 8: Converting *.mdx to *.md and cleaning MDX legacy blocks...')
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

// Step 9: Format with bun fmt
console.log('\n🎨 Step 9: Running formatting...')
await format()

console.log('\n🎉 All steps completed successfully!')

// Formatting options live here, inline — the repo has no formatter config file
async function format() {
	await $`bun fmt --no-script --no-config --log-level silent --ignore-pattern node_modules --ignore-pattern data --use-tabs --tab-width 1 --bracket-same-line --single-quote --trailing-comma all --arrow-parens always --no-semi --prose-wrap never --print-width 180 --single-attribute-per-line --object-wrap preserve --end-of-line lf .`
}

async function isDir(path) {
	try {
		return (await Bun.file(path).stat()).isDirectory()
	} catch {
		return false
	}
}
