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
const commitHashFile = path.join(rootDir, 'commit-hash.txt')
if (fs.existsSync(commitHashFile)) {
	fs.rmSync(commitHashFile, { force: true })
}

// Step 1: Run git clone with sparse-checkout
console.log('Step 1: Running git clone with sparse-checkout...')
const gitCommand =
	"git clone --depth 1 --filter=blob:none --no-checkout https://github.com/vercel/next.js && cd next.js && git sparse-checkout set --no-cone 'docs/*' && git checkout"
execSync(gitCommand, { stdio: 'inherit', cwd: rootDir, shell: true })

// Step 2: Generate commit-hash.txt containing commit hash of canary branch
console.log('\nStep 2: Generating commit-hash.txt...')
const commitHash = execSync('git rev-parse HEAD', { cwd: nextJsDir, encoding: 'utf8' }).trim()
fs.writeFileSync(commitHashFile, commitHash + '\n', 'utf8')
console.log(`- Commit hash saved: ${commitHash}`)

// Step 3: Move docs/ to current directory
console.log('\nStep 3: Moving docs/ to root directory...')
const sourceDocs = path.join(nextJsDir, 'docs')
if (fs.existsSync(sourceDocs)) {
	fs.renameSync(sourceDocs, docsDir)
} else {
	console.error('Error: docs/ directory not found in next.js repository')
	process.exit(1)
}

// Step 4: Remove downloaded next.js repository
console.log('Step 4: Removing next.js repository directory...')
fs.rmSync(nextJsDir, { recursive: true, force: true })

// Step 5: Remove contents in docs/ based on ignore string array
console.log('Step 5: Removing ignored contents from docs/...')
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

// Step 6: Rename subdirectories in docs/ by removing "[number]-" prefix
console.log('Step 6: Renaming subdirectories in docs/...')
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

	// 8a. Remove multiline comment code {/* ... */} (and content), except inside codeblocks (triple backticks/tildes)
	content = content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)|(\{\/\*[\s\S]*?\*\/\})/g, (match, codeBlock) => (codeBlock ? codeBlock : ''))

	// 8b. Remove <PagesOnly> ... </PagesOnly> (and content)
	content = content.replace(/<PagesOnly\b[^>]*>[\s\S]*?<\/PagesOnly>/g, '')

	// 8c. Remove <AppOnly> and </AppOnly> tags only (keep inner content)
	content = content.replace(/<AppOnly\b[^>]*>/g, '')
	content = content.replace(/<\/AppOnly>/g, '')

	fs.writeFileSync(filePath, content, 'utf8')
}

// Step 7 & 8: Convert *.mdx files to *.md recursively and clean MDX artifacts
console.log('Step 7 & 8: Converting *.mdx to *.md and cleaning MDX legacy blocks...')
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

// Step 9: Run prettier formatting
console.log('\nStep 9: Running Prettier formatting...')
const prettierCommand = 'prettier --config .prettierrc --log-level silent --write "**/*.{js,jsx,mjs,cjs,ts,tsx,css,scss,less,json,yml,yaml,md}"'
execSync(prettierCommand, { stdio: 'inherit', cwd: rootDir, shell: true })

console.log('\nAll steps completed successfully!')
