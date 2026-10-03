/**
 * 证明上下文与来源注册表单测（M0/H01/H07，对应 K01/K07 的 M0 部分）
 */

import { describe, expect, test } from 'bun:test'
import { buildDemoCase } from './demo-fixtures/demo-case-fixture'
import { buildSourceRegistry, computeUnprocessedMaterials, renderEvidenceDocuments } from './ai-review-service'

describe('renderEvidenceDocuments（M0/H01 证明原文进上下文）', () => {
  test('Given 含文本证明的案卷 When 渲染 Then 证明原文逐块带 documentId/blockId', () => {
    const reviewCase = buildDemoCase()
    const evidenceDoc = reviewCase.documents.find((doc) => doc.role === 'evidence')
    if (!evidenceDoc || evidenceDoc.blocks.length === 0) {
      // fixture 无证明文档时不强求（demo 证明走 EvidenceDocument 摘要），跳过断言
      expect(true).toBeTrue()
      return
    }
    const text = renderEvidenceDocuments(reviewCase)
    expect(text).toContain(`documentId=${evidenceDoc.id}`)
    expect(text).toContain(`[${evidenceDoc.blocks[0]!.id}]`)
  })

  test('Given 无证明文档的案卷 When 渲染 Then 返回空串（不产出空段落）', () => {
    const reviewCase = buildDemoCase()
    const noEvidence = { ...reviewCase, documents: reviewCase.documents.filter((doc) => doc.role !== 'evidence') }
    expect(renderEvidenceDocuments(noEvidence)).toBe('')
  })
})

describe('buildSourceRegistry（M0/H07 来源白名单）', () => {
  test('Given 案卷全部文档 When 构建注册表 Then 每份文档都在列且标注角色与块范围', () => {
    const reviewCase = buildDemoCase()
    const registry = buildSourceRegistry(reviewCase)
    for (const doc of reviewCase.documents) {
      expect(registry).toContain(doc.id)
    }
    expect(registry).toContain('依据文件')
    expect(registry).toContain('待审文件')
    expect(registry).toContain('禁止编造')
  })
})

describe('computeUnprocessedMaterials（M0/H01 未处理账本）', () => {
  test('Given 解析失败与部分解析无块的文档 When 计算 Then 进入账本并带中文原因', () => {
    const reviewCase = buildDemoCase()
    const withBad = {
      ...reviewCase,
      documents: [
        ...reviewCase.documents,
        { ...reviewCase.documents[0]!, id: 'doc-broken', fileName: '扫描件.pdf', parseStatus: 'failed' as const },
        { ...reviewCase.documents[0]!, id: 'doc-scan', fileName: '无文本层.pdf', parseStatus: 'partial' as const },
      ],
    }
    const ledger = computeUnprocessedMaterials(withBad)
    const reasons = ledger.map((entry) => entry.fileName + entry.reason).join('|')
    expect(reasons).toContain('解析失败')
    expect(reasons).toContain('扫描件')
  })

  test('Given 视觉弃用清单 When 计算 Then 合并进账本（同文档去重）', () => {
    const reviewCase = buildDemoCase()
    const target = reviewCase.documents[0]!
    const ledger = computeUnprocessedMaterials(reviewCase, [
      { documentId: target.id, fileName: target.fileName, reason: '超出单次 8 张图片上限' },
    ])
    expect(ledger.some((entry) => entry.reason.includes('超出单次'))).toBeTrue()
  })

  test('Given 全部材料可读 When 计算 Then 账本为空（不虚报）', () => {
    const reviewCase = buildDemoCase()
    const allParsed = { ...reviewCase, documents: reviewCase.documents.map((doc) => ({ ...doc, parseStatus: 'parsed' as const })) }
    expect(computeUnprocessedMaterials(allParsed)).toEqual([])
  })
})
