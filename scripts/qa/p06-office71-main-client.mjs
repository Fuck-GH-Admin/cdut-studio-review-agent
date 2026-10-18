// 真实 Electron Main Office #71 回归；只使用隔离合成文件，不连接 provider。
import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import JSZip from 'jszip'
import { connect } from './review-live-cdp.mjs'

const raw = resolve(process.env.P06_OFFICE71_RAW_ROOT ?? '')
const materials = resolve(process.env.P06_OFFICE71_MATERIAL_ROOT ?? '')
const runId = process.env.P06_OFFICE71_RUN_ID ?? ''
if (!raw.split(/[\\/]/).at(-1)?.startsWith('p06-office71-local-r02-')
  || materials !== join(raw, 'materials') || !runId.startsWith('r02-')) {
  throw new Error('Office71 Main driver 需要本轮 R02 专用材料和运行标识')
}
const mode = process.argv[2] ?? 'initial'
const rawOffice = join(raw, 'office71')
const workspaces = join(raw, 'workspaces')
mkdirSync(rawOffice, { recursive: true })
mkdirSync(workspaces, { recursive: true })
const q = JSON.stringify
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const reportPath = join(rawOffice, `office71-${mode}.json`)
const report = { candidateSha: process.env.QA_APPLICATION_SHA, mode, startedAt: new Date().toISOString(), rows: [] }
const save = () => writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
const main = await connect(Number(process.env.QA_MAIN_PORT), () => true)
const env = await main.poll('!!globalThis.__p06Office71?.parse && !!globalThis.__p06Office71?.read')
report.main = await main.evaluate('__p06Office71.environment')
report.versions = await main.evaluate('__p06Office71.versions')
assert.equal(report.main.config, join(raw, 'profile', 'config'))
assert.equal(report.main.userData, join(raw, 'profile', 'user-data'))
report.startedPid = report.main.pid

const parse = (filePath, workspace) => main.evaluate(`__p06Office71.parse(${q(resolve(filePath))},${q(resolve(workspace))})`)
const read = (file, workspace) => main.evaluate(`__p06Office71.read(${q(file)},${q(resolve(workspace))})`)
const anchor = (value, workspace) => main.evaluate(`__p06Office71.anchor(${q(value)},${q(resolve(workspace))})`)
const materialize = (filePath, workspace, parsed, preferredFileId) =>
  main.evaluate(`__p06Office71.materialize(${q(resolve(filePath))},${q(resolve(workspace))},${q(parsed)},${q(preferredFileId)})`)
const fileHash = path => sha(readFileSync(path))
const rel = path => relative(raw, path).split('\\').join('/')
const contents = value => String(value?.cleanText ?? value?.materialized?.pages?.map(x => x.cleanText).join('\n') ?? '')
const registryPath = workspace => join(workspace, '.context', 'artifacts', 'registry.json')
const manifestPath = workspace => join(workspace, '.context', 'artifacts', 'manifest.json')
const indexPath = (workspace, artifactId) => join(workspace, '.context', 'artifacts', `${artifactId}.index.json`)
const scenarioPath = name => mode === 'initial-retry' ? `${name}-retry` : name
const scenarioWorkspace = name => join(workspaces, scenarioPath(name))
const scenarioMaterials = name => join(materials, scenarioPath(name))
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const record = async (id, expected, fn) => {
  const startedAt = new Date().toISOString()
  let status = 'PASS', actual
  try { actual = await fn() }
  catch (error) { status = 'FAIL'; actual = { error: String(error), stack: error?.stack } }
  if (actual?.statusOverride) status = actual.statusOverride
  report.rows.push({ id, status, expected, actual, startedAt, finishedAt: new Date().toISOString() })
  save()
  console.log(JSON.stringify({ id, status }))
}
const assertSource = (result, source, ext, marker) => {
  const item = result?.materialized
  assert.ok(item, `${ext} 真实解析必须物化 index`)
  assert.equal(item.sourcePath, resolve(source))
  assert.equal(item.revision, `sha256:v2:${fileHash(source)}`)
  assert.ok(contents(result).includes(marker), `${ext} 解析正文缺少 ${marker}`)
  assert.ok(item.fileId && item.artifactId)
  for (const suffix of ['.index.json', '.anchored.md']) assert.ok(existsSync(join(dirname(item.anchoredMarkdownPath), `${item.artifactId}${suffix}`)))
  assert.ok(existsSync(item.cleanMarkdownPath))
  return item
}
const metadata = (item, workspace) => ({
  fileId: item.fileId, artifactId: item.artifactId, sourcePath: rel(item.sourcePath), revision: item.revision,
  cleanMarkdownPath: rel(item.cleanMarkdownPath), anchoredMarkdownPath: rel(item.anchoredMarkdownPath),
  indexPath: rel(indexPath(workspace, item.artifactId)),
})
async function rewriteZip(source, target, from, to, { extra = false, compression } = {}) {
  const zip = await JSZip.loadAsync(readFileSync(source))
  let changed = 0
  for (const name of Object.keys(zip.files).filter(name => name.endsWith('.xml'))) {
    const before = await zip.file(name).async('string')
    const after = before.replaceAll(from, to)
    if (after !== before) changed++
    if (compression === 'STORE') {
      zip.file(name, after, { compression: 'STORE', date: new Date('2026-01-01T00:00:00.000Z') })
    } else if (after !== before) zip.file(name, after)
  }
  if (compression === 'STORE') for (const name of Object.keys(zip.files).filter(name => !zip.files[name].dir && !name.endsWith('.xml'))) {
    const bytes = await zip.file(name).async('nodebuffer')
    zip.file(name, bytes, { compression: 'STORE', date: new Date('2026-01-01T00:00:00.000Z') })
  }
  if (!changed) throw new Error(`没有在 ${basename(source)} 内找到可变更的合成标记`)
  if (extra) zip.file('customXml/p06-office71-revision.xml', `<revision>${randomBytes(192).toString('hex')}</revision>`)
  const bytes = await zip.generateAsync({ type: 'nodebuffer', compression: compression ?? 'DEFLATE' })
  writeFileSync(target, bytes)
  return { bytes: bytes.length, sha256: sha(bytes), changedXmlParts: changed }
}
async function canonicalStoreZip(source, target) {
  const zip = await JSZip.loadAsync(readFileSync(source))
  for (const name of Object.keys(zip.files).filter(name => !zip.files[name].dir)) {
    const file = zip.file(name)
    const data = await file.async(name.endsWith('.xml') ? 'string' : 'nodebuffer')
    zip.file(name, data, { compression: 'STORE', date: new Date('2026-01-01T00:00:00.000Z') })
  }
  const bytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' })
  writeFileSync(target, bytes)
  return { bytes: bytes.length, sha256: sha(bytes), changedXmlParts: 0 }
}
const input = (label, ext) => join(materials, label, `proof.${ext}`)

if (mode === 'initial' || mode === 'initial-retry') {
  for (const ext of ['docx', 'xlsx', 'pptx']) {
    for (const order of ['forward', 'reverse']) await record(`O71-01-${ext}-${order}`, '两份合法真 ZIP 同名异路径独立映射，切片和锚点回到各自原件；basename 明确拒绝歧义', async () => {
      const workspace = scenarioWorkspace(`o71-01-${ext}-${order}`)
      mkdirSync(workspace, { recursive: true })
      const pairs = order === 'forward'
        ? [{ path: input('A', ext), label: 'A' }, { path: input('B', ext), label: 'B' }]
        : [{ path: input('B', ext), label: 'B' }, { path: input('A', ext), label: 'A' }]
      const results = []
      for (const item of pairs) {
        const parsed = await parse(item.path, workspace)
        const materialized = assertSource(parsed, item.path, ext, `P06_U1_SYNTHETIC_${item.label}`)
        results.push({ label: item.label, parsed, materialized })
      }
      const [a, b] = [results.find(x => x.label === 'A'), results.find(x => x.label === 'B')]
      assert.ok(a && b)
      assert.notEqual(a.materialized.fileId, b.materialized.fileId)
      assert.notEqual(a.materialized.artifactId, b.materialized.artifactId)
      assert.notEqual(a.materialized.cleanMarkdownPath, b.materialized.cleanMarkdownPath)
      assert.notEqual(a.materialized.anchoredMarkdownPath, b.materialized.anchoredMarkdownPath)
      assert.ok(!contents(a.parsed).includes('SYNTHETIC_B'))
      assert.ok(!contents(b.parsed).includes('SYNTHETIC_A'))
      const readA = await read(a.materialized.fileId, workspace)
      const readB = await read(b.materialized.fileId, workspace)
      const absA = await read(a.materialized.sourcePath, workspace)
      const absB = await read(b.materialized.sourcePath, workspace)
      assert.ok(readA.content.includes('SYNTHETIC_A') && !readA.content.includes('SYNTHETIC_B'))
      assert.ok(readB.content.includes('SYNTHETIC_B') && !readB.content.includes('SYNTHETIC_A'))
      assert.ok(absA.content.includes('SYNTHETIC_A') && absB.content.includes('SYNTHETIC_B'))
      const blockA = Object.keys(a.materialized.blocks)[0]
      const blockB = Object.keys(b.materialized.blocks)[0]
      const anchorA = await anchor(`#${a.materialized.fileId}:${blockA}`, workspace)
      const anchorB = await anchor(`#${b.materialized.fileId}:${blockB}`, workspace)
      assert.equal(anchorA?.filePath, resolve(input('A', ext)))
      assert.equal(anchorB?.filePath, resolve(input('B', ext)))
      let ambiguous = ''
      try { await read(`proof.${ext}`, workspace) } catch (error) { ambiguous = String(error) }
      assert.match(ambiguous, /多份同名文档/)
      const manifest = readJson(manifestPath(workspace))
      const registry = readJson(registryPath(workspace))
      assert.equal(Object.keys(manifest).length, 2)
      assert.equal(Object.keys(registry).length, 2)
      for (const item of [a.materialized, b.materialized]) assert.ok(existsSync(indexPath(workspace, item.artifactId)))
      return {
        order, inputs: pairs.map(x => ({ path: rel(x.path), sha256: fileHash(x.path), bytes: statSync(x.path).size })),
        A: metadata(a.materialized, workspace), B: metadata(b.materialized, workspace),
        registryIds: Object.keys(registry), manifestKeys: Object.keys(manifest),
        readBack: { byFileId: true, byAbsolutePath: true, ambiguousBasenameRejected: true, anchorsReturnSourcePath: true },
      }
    })

    await record(`O71-02-${ext}-identical-bytes`, '同字节异路径仍有独立 identity；重复导入保持各自映射', async () => {
      const workspace = scenarioWorkspace(`o71-02-${ext}`)
      mkdirSync(workspace, { recursive: true })
      const sourceA = input('A', ext), sourceSame = input('same', ext)
      assert.equal(fileHash(sourceA), fileHash(sourceSame))
      const same = assertSource(await parse(sourceSame, workspace), sourceSame, ext, 'P06_U1_SYNTHETIC_A')
      const a = assertSource(await parse(sourceA, workspace), sourceA, ext, 'P06_U1_SYNTHETIC_A')
      const sameAgain = assertSource(await parse(sourceSame, workspace), sourceSame, ext, 'P06_U1_SYNTHETIC_A')
      const aAgain = assertSource(await parse(sourceA, workspace), sourceA, ext, 'P06_U1_SYNTHETIC_A')
      assert.notEqual(a.fileId, same.fileId)
      assert.notEqual(a.artifactId, same.artifactId)
      assert.equal(sameAgain.fileId, same.fileId)
      assert.equal(aAgain.fileId, a.fileId)
      assert.equal(same.sourcePath, resolve(sourceSame))
      assert.equal(a.sourcePath, resolve(sourceA))
      return { sourceA: metadata(a, workspace), sourceSameBytes: metadata(same, workspace), repeatedIdentityStable: true,
        equalInputHash: fileHash(sourceA), byteLength: statSync(sourceA).size }
    })

    await record(`O71-03-${ext}-revision-size-time`, '同路径内容改版后 identity 稳定、revision/正文更新，B 与其 index 不变', async () => {
      const dir = scenarioMaterials(`revision-large-${ext}`)
      const workspace = scenarioWorkspace(`o71-03-large-${ext}`)
      mkdirSync(dir, { recursive: true }); mkdirSync(workspace, { recursive: true })
      const aPath = join(dir, `proof.${ext}`), bPath = join(dir, `peer-proof.${ext}`)
      copyFileSync(input('A', ext), aPath); copyFileSync(input('B', ext), bPath)
      const oldMtime = new Date('2026-01-01T00:00:00.000Z')
      utimesSync(aPath, oldMtime, oldMtime)
      const a0 = assertSource(await parse(aPath, workspace), aPath, ext, 'SYNTHETIC_A')
      const b0 = assertSource(await parse(bPath, workspace), bPath, ext, 'SYNTHETIC_B')
      const bIndexHash = fileHash(indexPath(workspace, b0.artifactId))
      const before = statSync(aPath)
      const rewrite = await rewriteZip(aPath, aPath, 'P06_U1_SYNTHETIC_A', 'P06_U1_SYNTHETIC_D', { extra: true })
      const newMtime = new Date(before.mtimeMs + 5000)
      utimesSync(aPath, newMtime, newMtime)
      const afterWrite = statSync(aPath)
      assert.notEqual(afterWrite.size, before.size, '改版样本必须改变文件大小')
      assert.notEqual(Math.trunc(afterWrite.mtimeMs), Math.trunc(before.mtimeMs), '改版样本必须改变 mtime')
      const a1 = assertSource(await parse(aPath, workspace), aPath, ext, 'SYNTHETIC_D')
      const b1 = assertSource(await parse(bPath, workspace), bPath, ext, 'SYNTHETIC_B')
      assert.equal(a1.fileId, a0.fileId)
      assert.equal(a1.artifactId, a0.artifactId)
      assert.notEqual(a1.revision, a0.revision)
      assert.equal(b1.fileId, b0.fileId)
      assert.equal(b1.revision, b0.revision)
      assert.equal(fileHash(indexPath(workspace, b0.artifactId)), bIndexHash)
      return { input: rel(aPath), before: { size: before.size, mtimeMs: before.mtimeMs, revision: a0.revision },
        after: { size: afterWrite.size, mtimeMs: afterWrite.mtimeMs, revision: a1.revision, sha256: rewrite.sha256 },
        A: metadata(a1, workspace), B: metadata(b1, workspace), peerIndexHashUnchanged: true }
    })

    await record(`O71-03-${ext}-same-size-same-mtime`, 'same size + same mtime 的真实 ZIP 内容变化必须更新 hash revision 与正文', async () => {
      const dir = scenarioMaterials(`revision-same-${ext}`)
      const workspace = scenarioWorkspace(`o71-03-same-${ext}`)
      mkdirSync(dir, { recursive: true }); mkdirSync(workspace, { recursive: true })
      const path = join(dir, `proof.${ext}`)
      const fixedTime = new Date('2026-02-03T04:05:06.000Z')
      const v1 = await rewriteZip(input('A', ext), path, 'P06_U1_SYNTHETIC_A', 'P06_U1_SYNTHETIC_A', { compression: 'STORE' }).catch(async () => {
        return canonicalStoreZip(input('A', ext), path)
      })
      utimesSync(path, fixedTime, fixedTime)
      const before = statSync(path)
      const first = assertSource(await parse(path, workspace), path, ext, 'SYNTHETIC_A')
      const v2 = await rewriteZip(path, path, 'P06_U1_SYNTHETIC_A', 'P06_U1_SYNTHETIC_C', { compression: 'STORE' })
      utimesSync(path, fixedTime, fixedTime)
      const after = statSync(path)
      if (before.size !== after.size || Math.trunc(before.mtimeMs) !== Math.trunc(after.mtimeMs)) {
        return { statusOverride: 'NOT-RUN', reason: 'ZIP rewrite 未保持 size/mtime', before: { size: before.size, mtimeMs: before.mtimeMs },
          after: { size: after.size, mtimeMs: after.mtimeMs }, v1, v2 }
      }
      const second = assertSource(await parse(path, workspace), path, ext, 'SYNTHETIC_C')
      assert.equal(second.fileId, first.fileId)
      assert.equal(second.artifactId, first.artifactId)
      assert.notEqual(second.revision, first.revision)
      assert.ok(!contents(await read(second.fileId, workspace)).includes('SYNTHETIC_A'))
      return { input: rel(path), before: { size: before.size, mtimeMs: before.mtimeMs, revision: first.revision },
        after: { size: after.size, mtimeMs: after.mtimeMs, revision: second.revision, sha256: v2.sha256 },
        identityStable: true, sourceTextUpdated: true }
    })
  }

  for (const order of ['forward', 'reverse']) await record(`O71-04-cross-format-${order}`, '同 stem 三格式在同工作区保持唯一 fileId/artifact/index，manifest/registry 一一对应', async () => {
    const workspace = scenarioWorkspace(`o71-04-cross-${order}`)
    mkdirSync(workspace, { recursive: true })
    const exts = order === 'forward' ? ['docx', 'xlsx', 'pptx'] : ['pptx', 'xlsx', 'docx']
    const parsed = []
    for (const ext of exts) parsed.push({ ext, value: await parse(input('A', ext), workspace) })
    const ids = parsed.map(x => assertSource(x.value, input('A', x.ext), x.ext, 'SYNTHETIC_A'))
    assert.equal(new Set(ids.map(x => x.fileId)).size, 3)
    assert.equal(new Set(ids.map(x => x.artifactId)).size, 3)
    const registry = readJson(registryPath(workspace)), manifest = readJson(manifestPath(workspace))
    const indexFiles = readdirSync(join(workspace, '.context', 'artifacts')).filter(x => x.endsWith('.index.json'))
    assert.equal(Object.keys(registry).length, 3)
    assert.equal(Object.keys(manifest).length, 3)
    assert.equal(indexFiles.length, 3)
    for (const item of ids) assert.ok(existsSync(indexPath(workspace, item.artifactId)))
    const value = { order, files: ids.map(item => metadata(item, workspace)), registryIds: Object.keys(registry),
      manifestKeys: Object.keys(manifest), indexFiles }
    if (order === 'forward') writeFileSync(join(rawOffice, `cross-format-restart-baseline-${mode}.json`), JSON.stringify({ pid: report.startedPid, workspace, files: value.files }, null, 2) + '\n')
    return value
  })

  await record('O71-06-legacy-note', '单文档 legacy stem 布局可用；同名手写笔记与旧索引在重复导入后保留', async () => {
    const workspace = scenarioWorkspace('o71-06-legacy')
    mkdirSync(workspace, { recursive: true })
    const notePath = join(workspace, 'proof.md')
    writeFileSync(notePath, 'P06_OFFICE71_USER_NOTE_KEEP\n')
    const sourceA = input('A', 'docx'), sourceB = input('B', 'docx')
    const first = assertSource(await parse(sourceA, workspace), sourceA, 'docx', 'SYNTHETIC_A')
    const noteAfterFirst = readFileSync(notePath, 'utf8')
    const same = assertSource(await parse(sourceA, workspace), sourceA, 'docx', 'SYNTHETIC_A')
    const second = assertSource(await parse(sourceB, workspace), sourceB, 'docx', 'SYNTHETIC_B')
    assert.equal(first.artifactId, 'proof')
    assert.equal(same.fileId, first.fileId)
    assert.equal(same.artifactId, first.artifactId)
    assert.notEqual(second.fileId, first.fileId)
    assert.notEqual(second.artifactId, first.artifactId)
    assert.equal(noteAfterFirst, 'P06_OFFICE71_USER_NOTE_KEEP\n')
    assert.equal(readFileSync(notePath, 'utf8'), noteAfterFirst)
    assert.ok(first.cleanMarkdownPath.endsWith('proof.parsed.md'))
    const value = { legacyA: metadata(first, workspace), secondSource: metadata(second, workspace),
      manualNoteHash: sha(Buffer.from(noteAfterFirst)), repeatedImportStable: true, manualNotePreserved: true }
    writeFileSync(join(rawOffice, `legacy-restart-baseline-${mode}.json`), JSON.stringify({ pid: report.startedPid, workspace, file: value.legacyA }, null, 2) + '\n')
    return value
  })

  await record('O71-07-preferred-and-stale-registry', 'preferred fN、伪造 registry 不得占用或混并另一源；普通 fN 不带审核 SourceRef 字段', async () => {
    const workspace = scenarioWorkspace('o71-07-preferred')
    const stage = scenarioWorkspace('o71-07-stage')
    mkdirSync(workspace, { recursive: true }); mkdirSync(stage, { recursive: true })
    const aPath = input('A', 'xlsx'), bPath = input('B', 'xlsx')
    const a = assertSource(await parse(aPath, workspace), aPath, 'xlsx', 'SYNTHETIC_A')
    const bParsed = await parse(bPath, stage)
    assertSource(bParsed, bPath, 'xlsx', 'SYNTHETIC_B')
    const b = await materialize(bPath, workspace, bParsed, a.fileId)
    assert.ok(b)
    assert.notEqual(b.fileId, a.fileId)
    assert.notEqual(b.artifactId, a.artifactId)
    assert.ok(readFileSync(a.cleanMarkdownPath, 'utf8').includes('SYNTHETIC_A'))
    assert.ok(readFileSync(b.cleanMarkdownPath, 'utf8').includes('SYNTHETIC_B'))
    assert.equal(b.sourcePath, resolve(bPath))
    const registry = readJson(registryPath(workspace))
    const original = registry[a.fileId]
    registry[`legacy-corrupt-${a.fileId}`] = { ...original, fileId: a.fileId, sourcePath: resolve(bPath) }
    writeFileSync(registryPath(workspace), JSON.stringify(registry, null, 2) + '\n')
    const corruptWorkspace = scenarioWorkspace('o71-07-corrupt-registry')
    mkdirSync(corruptWorkspace, { recursive: true })
    const ca = assertSource(await parse(aPath, corruptWorkspace), aPath, 'xlsx', 'SYNTHETIC_A')
    const corruptRegistry = readJson(registryPath(corruptWorkspace))
    corruptRegistry[`stale-${ca.fileId}`] = { ...corruptRegistry[ca.fileId], fileId: ca.fileId, sourcePath: resolve(bPath) }
    writeFileSync(registryPath(corruptWorkspace), JSON.stringify(corruptRegistry, null, 2) + '\n')
    const cb = assertSource(await parse(bPath, corruptWorkspace), bPath, 'xlsx', 'SYNTHETIC_B')
    assert.notEqual(cb.fileId, ca.fileId)
    assert.ok(readFileSync(ca.cleanMarkdownPath, 'utf8').includes('SYNTHETIC_A'))
    assert.ok(readFileSync(cb.cleanMarkdownPath, 'utf8').includes('SYNTHETIC_B'))
    assert.equal(Object.keys(readJson(manifestPath(corruptWorkspace))).length, 2)
    assert.equal(Object.keys(readJson(registryPath(corruptWorkspace))).filter(key => key.startsWith('f')).length, 2)
    assert.equal(Object.keys(readJson(registryPath(corruptWorkspace))).filter(key => key.startsWith('stale-')).length, 1)
    assert.equal(Object.hasOwn(a, 'documentVersionId'), false)
    assert.equal(Object.hasOwn(a, 'caseId'), false)
    return { preferred: { ownerA: metadata(a, workspace), importedB: metadata(b, workspace), rejectedHijack: true },
      corruptRegistry: { ownerA: metadata(ca, corruptWorkspace), importedB: metadata(cb, corruptWorkspace), distinctIds: true },
      ordinaryIndexContainsNoReviewSourceRefIdentity: true }
  })

  report.status = report.rows.every(row => row.status === 'PASS') ? 'PASS' : 'FAIL'
} else if (mode === 'restart') {
  const baselinePath = existsSync(join(rawOffice, 'cross-format-restart-baseline-initial-retry.json'))
    ? join(rawOffice, 'cross-format-restart-baseline-initial-retry.json')
    : join(rawOffice, 'cross-format-restart-baseline-initial.json')
  const baseline = readJson(baselinePath)
  assert.notEqual(baseline.pid, report.startedPid, '重启后 Main PID 必须变化')
  const workspace = baseline.workspace
  const files = []
  for (const ext of ['pptx', 'xlsx', 'docx']) {
    const parsed = await parse(input('A', ext), workspace)
    const item = assertSource(parsed, input('A', ext), ext, 'SYNTHETIC_A')
    const prior = baseline.files.find(row => row.sourcePath.endsWith(`/A/proof.${ext}`))
    assert.ok(prior)
    const now = metadata(item, workspace)
    assert.equal(now.fileId, prior.fileId)
    assert.equal(now.artifactId, prior.artifactId)
    assert.equal(now.revision, prior.revision)
    const sliced = await read(item.fileId, workspace)
    assert.ok(sliced.content.includes('SYNTHETIC_A'))
    files.push({ format: ext, afterRestart: now, slice: { fileId: sliced.fileId, returnedPages: sliced.returnedPages } })
  }
  const registry = readJson(registryPath(workspace)), manifest = readJson(manifestPath(workspace))
  const indexFiles = readdirSync(join(workspace, '.context', 'artifacts')).filter(x => x.endsWith('.index.json'))
  assert.equal(Object.keys(registry).length, 3)
  assert.equal(Object.keys(manifest).length, 3)
  assert.equal(indexFiles.length, 3)
  report.rows.push({ id: 'O71-04-process-restart', status: 'PASS', expected: '新 Main PID 复用同 profile 后身份、revision、正文和索引数量稳定',
    actual: { oldPid: baseline.pid, newPid: report.startedPid, files, registryIds: Object.keys(registry), manifestKeys: Object.keys(manifest), indexFiles } })
  const legacyBaselinePath = existsSync(join(rawOffice, 'legacy-restart-baseline-initial-retry.json'))
    ? join(rawOffice, 'legacy-restart-baseline-initial-retry.json')
    : join(rawOffice, 'legacy-restart-baseline-initial.json')
  const legacyBefore = readJson(legacyBaselinePath)
  const legacyWorkspace = legacyBefore.workspace
  const legacyPath = input('A', 'docx')
  const legacyAfter = assertSource(await parse(legacyPath, legacyWorkspace), legacyPath, 'docx', 'SYNTHETIC_A')
  assert.equal(legacyAfter.artifactId, 'proof')
  assert.equal(readFileSync(join(legacyWorkspace, 'proof.md'), 'utf8'), 'P06_OFFICE71_USER_NOTE_KEEP\n')
  report.rows.push({ id: 'O71-06-process-restart', status: 'PASS', expected: '重启后 legacy index 与同名手写笔记仍保留',
    actual: { legacyInitialRecordPresent: !!legacyBefore.file, legacyAfter: metadata(legacyAfter, legacyWorkspace), manualNotePreserved: true } })
  report.status = 'PASS'
} else throw new Error(`未知模式 ${mode}`)

report.finishedAt = new Date().toISOString()
save()
main.close()
console.log(JSON.stringify({ mode, status: report.status, rows: report.rows.length, mainPid: report.startedPid,
  failures: report.rows.filter(row => row.status !== 'PASS').map(row => row.id) }))
if (report.status !== 'PASS') process.exitCode = 1
