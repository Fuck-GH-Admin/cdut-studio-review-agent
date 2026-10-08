/** 使用项目现有解析器，记录解析能力；不启动审核或修改用户案卷。 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { parseFileIntoSourceDocument } from '../../apps/electron/src/main/lib/review/document-service'

const manifest = JSON.parse(await readFile(process.argv[2]!, 'utf8')) as { samples: { id: string; path: string }[] }
const output = process.argv[3]!
await mkdir(output, { recursive: true })
const results = []
for (const sample of manifest.samples) {
  const target = join(output, sample.id)
  await mkdir(target, { recursive: true })
  const started = performance.now()
  const parsed = await parseFileIntoSourceDocument(sample.path, basename(sample.path), 'evidence', `${sample.id}/${basename(sample.path)}`, target)
  const elapsedMs = performance.now() - started
  await writeFile(join(target, 'document.json'), JSON.stringify(parsed, null, 2))
  await writeFile(join(target, 'content.txt'), parsed.blocks.map((block) => block.text).filter(Boolean).join('\n'))
  results.push({
    id: sample.id, elapsedMs, status: parsed.parseStatus, warning: parsed.parseError,
    blocks: parsed.blocks.length,
    tableCells: parsed.blocks.filter((block) => block.kind === 'table-cell').length,
    pictures: parsed.blocks.filter((block) => block.kind === 'image').length,
    savedPictures: parsed.blocks.filter((block) => block.imageAssetPath).length,
    textChars: parsed.blocks.reduce((sum, block) => sum + block.text.length, 0),
    pages: [...new Set(parsed.blocks.map((block) => block.page))],
  })
}
await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
