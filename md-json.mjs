// docs-refined/**/*.md -> docs-json/**/*.json (mdast) -> docs-context/**/*.md
// Pemakaian:
//   bun md-json.mjs [--keep-position] [--check]
//   --keep-position  simpan info posisi (baris/kolom) di setiap node
//   --check          verifikasi round-trip: docs-context/ di-parse ulang harus identik dengan docs-json/

import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'

const rootDir = import.meta.dir
const refinedDir = join(rootDir, 'docs-refined')
const jsonDir = join(rootDir, 'docs-json')
const contextDir = join(rootDir, 'docs-context')
const keepPosition = Bun.argv.includes('--keep-position')
const check = Bun.argv.includes('--check')

// Rules: setiap rule menerima tree (mdast) dan mengembalikan daftar pelanggaran (string)
const rules = [
	function frontmatterRequired(tree) {
		const fm = tree.children[0]
		if (fm?.type !== 'yaml') return ['frontmatter YAML harus ada di awal file']
		return ['title', 'description'].filter((key) => !new RegExp(`^${key}:`, 'm').test(fm.value)).map((key) => `frontmatter wajib punya "${key}"`)
	},
]

// Markdown string -> mdast
function mdToTree(markdown) {
	return fromMarkdown(markdown, {
		extensions: [gfm(), frontmatter(['yaml', 'toml'])],
		mdastExtensions: [gfmFromMarkdown(), frontmatterFromMarkdown(['yaml', 'toml'])],
	})
}

// mdast -> Markdown string
function treeToMd(tree) {
	return toMarkdown(tree, {
		bullet: '-',
		emphasis: '_',
		rule: '-',
		listItemIndent: 'one',
		fences: true,
		extensions: [gfmToMarkdown({ tablePipeAlign: false }), frontmatterToMarkdown(['yaml', 'toml'])],
	})
}

// Buang info "position" biar JSON-nya bersih, kecuali --keep-position
function treeToJson(tree, withPosition = keepPosition) {
	const replacer = withPosition ? undefined : (key, value) => (key === 'position' ? undefined : value)
	return JSON.stringify(tree, replacer, '\t')
}

// 1. Parse + validasi semua file dulu; kalau ada pelanggaran, tidak ada yang ditulis
const files = (await Array.fromAsync(new Bun.Glob('**/*.md').scan({ cwd: refinedDir }))).sort()
const trees = new Map()
const violations = []
for (const file of files) {
	const tree = mdToTree(await Bun.file(join(refinedDir, file)).text())
	for (const rule of rules) {
		for (const message of rule(tree)) violations.push(`  - ${file}: ${message} (${rule.name})`)
	}
	trees.set(file, tree)
}
if (violations.length) {
	console.error(`✗ ${violations.length} pelanggaran rule di docs-refined/:\n${violations.join('\n')}`)
	process.exit(1)
}

// 2. docs-json/ dan docs-context/ selalu dibangun ulang, biar file yang sudah dihapus tidak tertinggal
await rm(jsonDir, { recursive: true, force: true })
await rm(contextDir, { recursive: true, force: true })

const failed = []
for (const [file, tree] of trees) {
	const json = treeToJson(tree)
	await Bun.write(join(jsonDir, file.replace(/\.md$/, '.json')), json + '\n')

	// docs-context dibangun dari JSON (bukan dari tree di memori), biar beneran lewat docs-json
	const markdown = treeToMd(JSON.parse(json))
	await Bun.write(join(contextDir, file), markdown)

	if (check && treeToJson(mdToTree(markdown), false) !== treeToJson(tree, false)) failed.push(file)
}
console.log(`✓ ${files.length} file: docs-refined/ -> docs-json/ -> docs-context/`)

if (check) {
	if (failed.length) {
		console.error(`✗ Round-trip berbeda pada ${failed.length} file:\n${failed.map((f) => `  - ${f}`).join('\n')}`)
		process.exit(1)
	}
	console.log('✓ Round-trip docs-context/ -> mdast identik dengan docs-json/')
}
