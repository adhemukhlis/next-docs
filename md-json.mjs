// docs-refined/**/*.md -> docs-json/**/*.json (mdast) -> docs-context/**/*.md
// Pemakaian:
//   bun md-json.mjs [--keep-position] [--check]
//   --keep-position  simpan info posisi (baris/kolom) di setiap node
//   --check          verifikasi round-trip: docs-context/ di-parse ulang harus identik dengan docs-json/

import { rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { toString } from 'mdast-util-to-string'
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

// Rules: setiap rule menerima (tree, file, files) dan mengembalikan daftar pelanggaran (string)
// file = path relatif ke docs-refined/, files = Set semua dokumen
const rules = [
	function frontmatterRequired(tree) {
		const fm = tree.children[0]
		if (fm?.type !== 'yaml') return ['frontmatter YAML harus ada di awal file']
		return ['title', 'description'].filter((key) => !new RegExp(`^${key}:`, 'm').test(fm.value)).map((key) => `frontmatter wajib punya "${key}"`)
	},
	// Frontmatter hanya metadata: tanpa link, tanpa blok `related` (pakai `## INDEX` di body)
	function frontmatterMetadataOnly(tree) {
		const fm = tree.children[0]
		if (fm?.type !== 'yaml') return []
		const allowed = ['title', 'description', 'nav_title', 'version']
		const keys = Object.keys(Bun.YAML.parse(fm.value) ?? {})
		return keys
			.filter((key) => !allowed.includes(key))
			.map((key) =>
				key === 'related'
					? 'frontmatter tidak boleh punya "related", pindahkan ke section `## INDEX` di akhir dokumen'
					: `key frontmatter "${key}" tidak diizinkan (hanya ${allowed.join(', ')})`,
			)
	},
	// `## INDEX`, kalau ada, harus section terakhir
	function indexIsLastSection(tree) {
		const headings = tree.children.filter((node) => node.type === 'heading' && node.depth === 2).map((node) => toString(node))
		const at = headings.indexOf('INDEX')
		return at !== -1 && at !== headings.length - 1 ? ['section `## INDEX` harus jadi section terakhir'] : []
	},
	// Isi `## INDEX`: hanya pasangan lead tetap + list
	// "Documents in this section:" hanya di index.md dan selalu pertama; "Related documents:" untuk dokumen terkait
	function indexLeads(tree, file) {
		const start = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 2 && toString(node) === 'INDEX')
		if (start === -1) return []
		const nodes = tree.children.slice(start + 1)
		const messages = []
		for (let i = 0; i < nodes.length; i += 2) {
			const lead = nodes[i].type === 'paragraph' ? toString(nodes[i]) : null
			const isContents = lead === 'Documents in this section:'
			if (!isContents && lead !== 'Related documents:')
				messages.push(`isi \`## INDEX\` harus diawali lead "Documents in this section:" atau "Related documents:", bukan ${lead ? `"${lead}"` : nodes[i].type}`)
			else if (isContents && (i !== 0 || !file.endsWith('index.md'))) messages.push('"Documents in this section:" hanya untuk index.md, sebagai grup pertama')
			if (nodes[i + 1]?.type !== 'list') messages.push(`lead "${lead}" harus diikuti list`)
		}
		return messages
	},
	// Link internal = path file relatif yang beneran ada, bukan URL /docs/app/...
	function internalLinksRelative(tree, file, files) {
		const messages = []
		for (const url of collectUrls(tree)) {
			if (url.startsWith('/docs/app')) messages.push(`link "${url}" harus path file relatif (mis. ../02-guides/forms.md)`)
			else if (url.startsWith('./') || url.startsWith('../')) {
				const target = join(dirname(file), url.replace(/#.*$/, ''))
				if (!files.has(target)) messages.push(`link "${url}" tidak mengarah ke dokumen yang ada`)
			}
		}
		return messages
	},
]

function collectUrls(node, urls = []) {
	if (node.type === 'link' || node.type === 'definition') urls.push(node.url)
	for (const child of node.children ?? []) collectUrls(child, urls)
	return urls
}

// Markdown string -> mdast
function mdToTree(markdown) {
	return fromMarkdown(markdown, {
		extensions: [gfm(), frontmatter(['yaml', 'toml'])],
		mdastExtensions: [gfmFromMarkdown(), frontmatterFromMarkdown(['yaml', 'toml'])],
	})
}

// mdast -> Markdown string
// toMarkdown meng-escape "[" jadi "\[", yang merusak GFM alert (> [!NOTE], > [!CAUTION], ...)
function treeToMd(tree) {
	return toMarkdownRaw(tree).replace(/^((?:> ?)+)\\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gm, '$1[!$2]')
}

function toMarkdownRaw(tree) {
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
// *.rules.md (global.rules.md & <name>.rules.md) adalah brief refinement, bukan konten — di-skip
const files = (await Array.fromAsync(new Bun.Glob('**/*.md').scan({ cwd: refinedDir }))).filter((file) => !file.endsWith('.rules.md')).sort()
const trees = new Map()
const violations = []
const fileSet = new Set(files)
for (const file of files) {
	const tree = mdToTree(await Bun.file(join(refinedDir, file)).text())
	for (const rule of rules) {
		for (const message of rule(tree, file, fileSet)) violations.push(`  - ${file}: ${message} (${rule.name})`)
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
