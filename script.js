const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const rootDir = __dirname
const nextJsDir = path.join(rootDir, 'next.js')
const docsDir = path.join(rootDir, 'docs')
const ignoreList = ['02-pages', '03-architecture', '04-community']

// Step 0: Cleanup previous runs if necessary
if (fs.existsSync(nextJsDir)) {
	console.log('Cleaning up existing next.js directory...')
	fs.rmSync(nextJsDir, { recursive: true, force: true })
}
if (fs.existsSync(docsDir)) {
	console.log('Cleaning up existing docs directory...')
	fs.rmSync(docsDir, { recursive: true, force: true })
}

// Step 1: Run git clone with sparse-checkout
console.log('Step 1: Running git clone with sparse-checkout...')
const gitCommand =
	"git clone --depth 1 --filter=blob:none --no-checkout https://github.com/vercel/next.js && cd next.js && git sparse-checkout set --no-cone 'docs/*' && git checkout"
execSync(gitCommand, { stdio: 'inherit', cwd: rootDir, shell: true })

// Step 2: Move docs/ to current directory
console.log('\nStep 2: Moving docs/ to root directory...')
const sourceDocs = path.join(nextJsDir, 'docs')
if (fs.existsSync(sourceDocs)) {
	fs.renameSync(sourceDocs, docsDir)
} else {
	console.error('Error: docs/ directory not found in next.js repository')
	process.exit(1)
}

// Step 3: Remove downloaded next.js repository
console.log('Step 3: Removing next.js repository directory...')
fs.rmSync(nextJsDir, { recursive: true, force: true })

// Step 4: Remove contents in docs/ based on ignore string array
console.log('Step 4: Removing ignored contents from docs/...')
if (fs.existsSync(docsDir)) {
	const items = fs.readdirSync(docsDir)
	for (const item of items) {
		if (ignoreList.includes(item)) {
			const itemPath = path.join(docsDir, item)
			fs.rmSync(itemPath, { recursive: true, force: true })
			console.log(`- Removed: ${item}`)
		}
	}
}

// Step 5: Rename subdirectories in docs/ by removing "[number]-" prefix
console.log('Step 5: Renaming subdirectories in docs/...')
if (fs.existsSync(docsDir)) {
	const items = fs.readdirSync(docsDir)
	for (const item of items) {
		const itemPath = path.join(docsDir, item)
		if (fs.statSync(itemPath).isDirectory()) {
			const newName = item.replace(/^\d+-(.+)$/, '$1')
			if (newName !== item) {
				const newPath = path.join(docsDir, newName)
				fs.renameSync(itemPath, newPath)
				console.log(`- Renamed directory: ${item} -> ${newName}`)
			}
		}
	}
}

// Helper function to clean MDX legacy blocks/tags
function cleanMdxContent(filePath) {
	let content = fs.readFileSync(filePath, 'utf8')

	// 7a. Remove multiline comment code {/* ... */} (and content)
	content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

	// 7b. Remove <PagesOnly> ... </PagesOnly> (and content)
	content = content.replace(/<PagesOnly\b[^>]*>[\s\S]*?<\/PagesOnly>/g, '')

	// 7c. Remove <AppOnly> and </AppOnly> tags only (keep inner content)
	content = content.replace(/<AppOnly\b[^>]*>/g, '')
	content = content.replace(/<\/AppOnly>/g, '')

	fs.writeFileSync(filePath, content, 'utf8')
}

// Step 6 & 7: Convert *.mdx files to *.md recursively and clean MDX artifacts
console.log('Step 6 & 7: Converting *.mdx to *.md and cleaning MDX legacy blocks...')
function processDirectory(dir) {
	if (!fs.existsSync(dir)) return 0
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	let count = 0
	for (const entry of entries) {
		let fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			count += processDirectory(fullPath)
		} else if (entry.isFile()) {
			const isMdx = entry.name.endsWith('.mdx')
			const isMd = entry.name.endsWith('.md')

			if (isMdx) {
				const newName = entry.name.slice(0, -4) + '.md'
				const newPath = path.join(dir, newName)
				fs.renameSync(fullPath, newPath)
				fullPath = newPath
				count++
			}

			if (isMdx || isMd) {
				cleanMdxContent(fullPath)
			}
		}
	}
	return count
}

const convertedCount = processDirectory(docsDir)
console.log(`- Processed and converted ${convertedCount} .mdx file(s) to .md with cleaned content.`)

console.log('\nAll steps completed successfully!')
