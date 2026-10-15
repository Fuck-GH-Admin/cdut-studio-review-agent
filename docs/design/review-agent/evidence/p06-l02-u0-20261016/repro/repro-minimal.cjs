// Independent minimal Node reproduction of SOURCE-COMMON Office index collision.
// Source: document-parse-tools.ts @ main 8989941b, lines 309-342 and 355-470.
// The first function is transcribed from production; materialize() reproduces
// only the naming/id/cache/index write subset, not Office parsing or rendering.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const os = require('node:os')
function allocateSessionFileId(artifactsDir, stem, resolvedSourcePath, manifest) {
  const existing = manifest[stem]
  if (existing?.fileId && /^f\d+$/i.test(existing.fileId)) return existing.fileId.toLowerCase()
  for (const entry of Object.values(manifest)) {
    if (entry.sourcePath === resolvedSourcePath && entry.fileId && /^f\d+$/i.test(entry.fileId)) return entry.fileId.toLowerCase()
  }
  let maxNum = 0
  for (const entry of Object.values(manifest)) {
    const m = /^f(\d+)$/i.exec(entry.fileId ?? '')
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10))
  }
  const registryPath = path.join(artifactsDir, 'registry.json')
  if (fs.existsSync(registryPath)) {
    try {
      const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
      for (const item of Object.values(reg)) {
        if (item.sourcePath === resolvedSourcePath && item.fileId) return item.fileId
        const m = /^f(\d+)$/i.exec(item.fileId ?? '')
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10))
      }
    } catch { }
  }
  return `f${maxNum + 1}`
}
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cdut-l02-office-'))
try {
  const artifactsDir = path.join(root, '.context', 'artifacts')
  fs.mkdirSync(artifactsDir, { recursive: true })
  const manifest = {}
  const materialize = (relativePath, revision, text) => {
    const sourcePath = path.join(root, relativePath)
    const stem = path.basename(sourcePath, path.extname(sourcePath))
    const fileId = allocateSessionFileId(artifactsDir, stem, sourcePath, manifest)
    const indexPath = path.join(artifactsDir, stem + '.index.json')
    const existing = manifest[stem]
    if (existing && existing.revision === revision && fs.existsSync(indexPath)) {
      const cached = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
      if (cached.fileId && cached.blocks) return cached
    }
    const index = { fileId, sourcePath, revision, blocks: { 'p1-b0': text } }
    fs.writeFileSync(indexPath, JSON.stringify(index))
    manifest[stem] = { fileId, sourcePath, revision }
    return index
  }
  const a = materialize('a/proof.docx', 'hash:A', 'A-text')
  const b = materialize('b/proof.docx', 'hash:B', 'B-text')
  assert.equal(a.fileId, 'f1'); assert.equal(b.fileId, 'f1')
  assert.equal(JSON.parse(fs.readFileSync(path.join(artifactsDir,'proof.index.json'),'utf8')).sourcePath,b.sourcePath)
  const c = materialize('c/proof.docx', 'hash:B', 'B-text')
  assert.equal(c.sourcePath,b.sourcePath) // cache returned B source despite requesting C
  console.log(JSON.stringify({ status:'COLLISION_REPRODUCED', firstId:a.fileId, secondId:b.fileId,
    indexOverwritten:true, cachedWrongSource:true, note:'Source-derived minimal harness; NOT a full Office/Electron test' }))
} finally { fs.rmSync(root, { recursive:true, force:true }) }
