import { afterAll, describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'
import {
  materializeToWorkspace, executeReadDocumentArtifact, resolveDocumentAnchor,
  type ParseDocumentResult,
} from './document-parse-tools'

// 这组测试覆盖 Office 物化后的真实源身份和索引，不冒充 DOCX/XLSX/PPTX 的 ZIP 解析。
const root = mkdtempSync(join(tmpdir(), 'p06-office71-identity-'))
afterAll(() => rmSync(root, { recursive: true, force: true }))
const sandbox = (name: string) => {
  const base = join(root, name)
  mkdirSync(join(base, 'source', 'A'), { recursive: true })
  mkdirSync(join(base, 'source', 'B'), { recursive: true })
  mkdirSync(join(base, 'workspace'), { recursive: true })
  return base
}
const parsed = (path: string, text: string): Omit<ParseDocumentResult, 'materialized'> => {
  const revision = 'sha256:v2:' + createHash('sha256').update(text).digest('hex')
  const anchor = '<!-- anchor: p1-b0 [0.1,0.2,0.5,0.6] loc="第1页" -->'
  return {
    file: { name: basename(path), size: text.length, modifiedAt: '2026-10-18', revision },
    format: extname(path).slice(1), text: anchor + '\n' + text, cleanText: text,
    truncated: false, pageCount: 1,
    pages: [{ pageNumber: 1, columnCount: 1, blockCount: 1, charCount: text.length,
      firstBlockId: 'p1-b0', lastBlockId: 'p1-b0', isFigureHeavy: false,
      headings: [], anchoredText: anchor + '\n' + text, cleanText: text }],
  }
}
const put = (path: string, text: string) => {
  writeFileSync(path, text)
  return parsed(path, text)
}

describe('Office #71：不同真实源的身份、锚点与缓存路径', () => {
  for (const ext of ['docx', 'xlsx', 'pptx']) {
    test('Given 两份不同路径同名'+ext+' When 顺序导入 Then fN/index/clean 不串用', async () => {
      const base = sandbox('different-' + ext)
      const workspace = join(base, 'workspace')
      const a = join(base, 'source', 'A', 'proof.' + ext)
      const b = join(base, 'source', 'B', 'proof.' + ext)
      const aIndex = materializeToWorkspace(a, workspace, put(a, 'A-only budget=100'))!
      const bIndex = materializeToWorkspace(b, workspace, put(b, 'B-only budget=120'))!
      expect(aIndex.fileId).not.toBe(bIndex.fileId)
      expect(aIndex.artifactId).not.toBe(bIndex.artifactId)
      expect(aIndex.cleanMarkdownPath).not.toBe(bIndex.cleanMarkdownPath)
      expect(aIndex.anchoredMarkdownPath).not.toBe(bIndex.anchoredMarkdownPath)
      expect(aIndex.sourcePath).toBe(a)
      expect(bIndex.sourcePath).toBe(b)
      expect(readFileSync(aIndex.cleanMarkdownPath, 'utf8')).toContain('A-only')
      expect(readFileSync(bIndex.cleanMarkdownPath, 'utf8')).toContain('B-only')
      expect(existsSync(join(workspace, '.context', 'artifacts', aIndex.artifactId+'.index.json'))).toBe(true)
      expect(existsSync(join(workspace, '.context', 'artifacts', bIndex.artifactId+'.index.json'))).toBe(true)

      const loadedA = await executeReadDocumentArtifact({ file: aIndex.fileId }, { agentCwd: workspace, allowedRoots: [] })
      const loadedB = await executeReadDocumentArtifact({ file: bIndex.fileId }, { agentCwd: workspace, allowedRoots: [] })
      expect(loadedA.content).toContain('A-only')
      expect(loadedB.content).toContain('B-only')
      expect(loadedA.content).not.toContain('B-only')
      expect(loadedB.content).not.toContain('A-only')
      expect(resolveDocumentAnchor('#'+aIndex.fileId+':p1-b0', {candidateDirs:[workspace]})?.filePath).toBe(a)
      expect(resolveDocumentAnchor('#'+bIndex.fileId+':p1-b0', {candidateDirs:[workspace]})?.filePath).toBe(b)
      expect(await executeReadDocumentArtifact({ file: b }, { agentCwd: workspace, allowedRoots: [] }))
        .toMatchObject({fileId:bIndex.fileId})
      await expect(executeReadDocumentArtifact({ file: 'proof.'+ext }, { agentCwd: workspace, allowedRoots: [] }))
        .rejects.toThrow('多份同名文档')
    })
    test('Given 同字节异路径'+ext+' When 反向导入并重复 Then 保留双身份且缓存不回源错', () => {
      const base = sandbox('same-' + ext)
      const workspace = join(base, 'workspace')
      const a = join(base, 'source','A', 'same.'+ext)
      const b = join(base, 'source','B', 'same.'+ext)
      const b0 = materializeToWorkspace(b, workspace, put(b, 'equal-content'))!
      const a0 = materializeToWorkspace(a, workspace, put(a, 'equal-content'))!
      const a1 = materializeToWorkspace(a, workspace, parsed(a, 'equal-content'))!
      const b1 = materializeToWorkspace(b, workspace, parsed(b, 'equal-content'))!
      expect(a0.fileId).not.toBe(b0.fileId)
      expect(a0.artifactId).not.toBe(b0.artifactId)
      expect(a1.fileId).toBe(a0.fileId)
      expect(b1.fileId).toBe(b0.fileId)
      expect(a1.sourcePath).toBe(a)
      expect(b1.sourcePath).toBe(b)
    })
  }

  test('同一物理路径改版保留 fileId，更新 revision 与自己的内容、不覆盖其他同名源', async () => {
    const base = sandbox('revision')
    const workspace = join(base,'workspace')
    const a = join(base,'source','A','proof.docx')
    const b = join(base,'source','B','proof.docx')
    const first = materializeToWorkspace(a,workspace,put(a,'version-1-A'))!
    const peer = materializeToWorkspace(b,workspace,put(b,'version-1-B'))!
    const newer = materializeToWorkspace(a,workspace,put(a,'version-2-A'))!
    expect(newer.fileId).toBe(first.fileId)
    expect(newer.artifactId).toBe(first.artifactId)
    expect(newer.revision).not.toBe(first.revision)
    expect(readFileSync(newer.cleanMarkdownPath, 'utf8')).toContain('version-2-A')
    expect(readFileSync(peer.cleanMarkdownPath, 'utf8')).toContain('version-1-B')
    const manifest = JSON.parse(readFileSync(join(workspace,'.context','artifacts','manifest.json'),'utf8'))
    const registry = JSON.parse(readFileSync(join(workspace,'.context','artifacts','registry.json'),'utf8'))
    expect(Object.keys(manifest)).toHaveLength(2)
    expect(Object.keys(registry)).toHaveLength(2)
    expect(registry[peer.fileId].sourcePath).toBe(b)
    expect(registry[newer.fileId].sourcePath).toBe(a)
  })

  test('显式 preferredFileId 不得劫持其他源的已有 fileId', () => {
    const base = sandbox('preferred')
    const workspace = join(base,'workspace')
    const a = join(base,'source','A','same.xlsx')
    const b = join(base,'source','B','same.xlsx')
    const original = materializeToWorkspace(a,workspace,put(a,'ORIGINAL'))!
    const other = materializeToWorkspace(b,workspace,put(b,'OTHER'),original.fileId)!
    expect(other.fileId).not.toBe(original.fileId)
    expect(readFileSync(original.cleanMarkdownPath,'utf8')).toBe('ORIGINAL')
    expect(readFileSync(other.cleanMarkdownPath,'utf8')).toBe('OTHER')
  })

  test('DOCX、XLSX、PPTX 跨格式同 stem 不覆盖旧物化索引', () => {
    const base=sandbox('cross-format')
    const workspace=join(base,'workspace')
    const ids = ['docx','xlsx','pptx'].map(ext => {
      const src=join(base,'source','A','proof.'+ext)
      return materializeToWorkspace(src,workspace,put(src,'format-'+ext))!
    })
    expect(new Set(ids.map(x=>x.fileId)).size).toBe(3)
    expect(new Set(ids.map(x=>x.artifactId)).size).toBe(3)
    for(const item of ids) {
      expect(readFileSync(item.cleanMarkdownPath,'utf8')).toContain('format-'+item.format)
    }
  })

  test('已有 manifest 的 legacy 单文件路径保持不变；缺 manifest 旧 index 不被新源覆盖', () => {
    const base=sandbox('legacy')
    const workspace=join(base,'workspace')
    const a=join(base,'source','A','legacy.pptx')
    const b=join(base,'source','B','legacy.pptx')
    const old=materializeToWorkspace(a,workspace,put(a,'old'))!
    expect(old.artifactId).toBe('legacy')
    const stable=materializeToWorkspace(a,workspace,parsed(a,'old'))!
    expect(stable.fileId).toBe(old.fileId)
    expect(stable.artifactId).toBe('legacy')
    const next=materializeToWorkspace(b,workspace,put(b,'new'))!
    expect(next.artifactId).not.toBe('legacy')
    expect(readFileSync(old.cleanMarkdownPath,'utf8')).toBe('old')
  })
})
