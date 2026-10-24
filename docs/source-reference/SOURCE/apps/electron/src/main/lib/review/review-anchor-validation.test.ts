/**
 * M0/H07 锚点存在性核验（K07 回归的 M0 部分）
 */
import { describe, expect, test } from 'bun:test'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'
import { sanitizeFindingSources } from './ai-review-service'

const base = buildDemoCase()
const knownDoc = base.documents[0]!
const knownBlock = knownDoc.blocks[0]!
const knownSubjectDoc = base.documents.find((d) => d.role === 'application') ?? knownDoc

function makeFinding(overrides: Record<string, unknown>): Parameters<typeof sanitizeFindingSources>[0] {
  return {
    id: 'f1', itemId: base.items[0]!.id, kind: 'missing-evidence', severity: 'red',
    title: '测试发现', detail: 'd', suggestion: 'fix-declaration', suggestionText: 's',
    ruleAnchors: [], subjectAnchor: { documentId: knownSubjectDoc.id, precision: 'block', blockId: knownSubjectDoc.blocks[0]!.id },
    ...overrides,
  } as unknown as Parameters<typeof sanitizeFindingSources>[0]
}

describe('sanitizeFindingSources（M0/H07）', () => {
  test('Given 指向不存在文档的 subjectAnchor When 核验 Then 锚点删除（无猜测落点）', () => {
    const finding = makeFinding({ subjectAnchor: { documentId: 'doc-fake', precision: 'block', blockId: 'blk-fake' } })
    const result = sanitizeFindingSources(finding, base)
    expect(result.severity).toBe('yellow')
    expect(result.suggestion).toBe('manual-review')
    expect(result.detail).toContain('无法在案卷中核验')
  })

  test('Given 真实文档但不存在的 blockId When 核验 Then 降级文件级定位（不保留假块 ID）', () => {
    const finding = makeFinding({
      subjectAnchor: { documentId: knownSubjectDoc.id, precision: 'block', blockId: 'blk-not-real' },
      ruleAnchors: [{ documentId: knownDoc.id, precision: 'block', blockId: knownBlock.id }],
    })
    const result = sanitizeFindingSources(finding, base)
    expect(result.subjectAnchor?.precision).toBe('document')
    expect((result.subjectAnchor as { blockId?: string }).blockId).toBeUndefined()
    expect(result.severity).toBe('red') // 有合法出处，不降级
    expect(result.ruleAnchors[0]!.blockId).toBe(knownBlock.id) // 真块保留
  })

  test('Given 全部出处均不存在 When 核验 Then 降级待确认并保留原引用供排查', () => {
    const finding = makeFinding({
      subjectAnchor: { documentId: 'doc-x', precision: 'document' },
      ruleAnchors: [{ documentId: 'doc-y', precision: 'document' }],
    })
    const result = sanitizeFindingSources(finding, base)
    expect(result.severity).toBe('yellow')
    expect(result.suggestion).toBe('manual-review')
    expect(result.subjectAnchor?.documentId).toBe('doc-x') // 原引用保留
  })

  test('Given 全部出处真实有效 When 核验 Then 原样通过（不误伤）', () => {
    const finding = makeFinding({})
    const result = sanitizeFindingSources(finding, base)
    expect(result.severity).toBe('red')
    expect(result.subjectAnchor?.documentId).toBe(knownSubjectDoc.id)
    expect(result.detail).not.toContain('[系统]')
  })
})
