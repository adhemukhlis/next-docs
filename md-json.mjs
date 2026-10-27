// Konversi docs/**/*.md -> data/**/*.json (mdast)
// Pemakaian:
//   bun md-json.mjs [--keep-position] [--check]
//   --keep-position  simpan info posisi (baris/kolom) di setiap node
//   --check          verifikasi round-trip: JSON -> Markdown -> JSON harus identik

import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'

const rootDir = import.meta.dir
const docsDir = join(rootDir, 'docs')
const dataDir = join(rootDir, 'data')
const keepPosition = Bun.argv.includes('--keep-position')
const check = Bun.argv.includes('--check')

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
		fences: true,
		extensions: [gfmToMarkdown(), frontmatterToMarkdown(['yaml', 'toml'])],
	})
}

// Buang info "position" biar JSON-nya bersih, kecuali --keep-position
function treeToJson(tree, withPosition = keepPosition) {
	const replacer = withPosition ? undefined : (key, value) => (key === 'position' ? undefined : value)
	return JSON.stringify(tree, replacer, '\t')
}

// data/ selalu dibangun ulang dari docs/, biar file yang sudah dihapus tidak tertinggal
await rm(dataDir, { recursive: true, force: true })

const files = (await Array.fromAsync(new Bun.Glob('**/*.md').scan({ cwd: docsDir }))).sort()
const failed = []
for (const file of files) {
	const tree = mdToTree(await Bun.file(join(docsDir, file)).text())
	const json = treeToJson(tree)
	await Bun.write(join(dataDir, file.replace(/\.md$/, '.json')), json + '\n')

	if (check && treeToJson(mdToTree(treeToMd(JSON.parse(json))), false) !== treeToJson(tree, false)) {
		failed.push(file)
	}
}
console.log(`✓ ${files.length} file: docs/ -> data/`)

if (check) {
	if (failed.length) {
		console.error(`✗ Round-trip berbeda pada ${failed.length} file:\n${failed.map((f) => `  - ${f}`).join('\n')}`)
		process.exit(1)
	}
	console.log('✓ Round-trip JSON -> Markdown -> JSON identik')
}
