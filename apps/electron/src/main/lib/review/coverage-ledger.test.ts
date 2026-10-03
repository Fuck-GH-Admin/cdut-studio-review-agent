/**
 * 覆盖账本单测（A08/K06：材料账本 + 检查账本 + 全部符合判定）
 */
import { describe, expect, test } from 'bun:test'
import type { CheckResult, DocumentVersion, RuleSpec } from '@profer/shared'
import { buildCheckLedger, buildDocumentLedger, combineCoverage } from './coverage-ledger'
import { NullOcrPort, describePreview } from './ocr-port'

const doc = (versionId: string, fileName: string, usage: DocumentVersion['usage'], unusedReason?: string): DocumentVersion =>
  ({ versionId, fileName, usage, unusedReason, documentId: versionId, contentHash: 'h', role: 'evidence', mimeType: 'text/plain', sizeBytes: 1, assetPath: '', parseRevision: 1, parseStatus: 'parsed', blocks: [] }) as DocumentVersion

const rule = (id: string, scope: 'subject' | 'group'): RuleSpec =>
  ({ id, policyVersionId: 'p', title: id, when: { field: 'x', op: 'exists' }, requirement: '', targetScope: scope, execution: 'deterministic', onFail: 'reject', onUnknown: 'needs-confirmation', sourceRefIds: [], priority: 1, confirmation: 'confirmed' }) as RuleSpec

const result = (ruleId: string, subjectIds: string[], status: CheckResult['status']): CheckResult =>
  ({ checkId: `chk-${ruleId}-${subjectIds.join()}`, ruleId, target: { scope: subjectIds.length > 1 ? 'group' : 'subject', subjectIds }, status, reason: '', sourceRefs: [], executedBy: 'deterministic', executedAt: new Date().toISOString() }) as CheckResult

describe('材料账本（M2）', () => {
  test('Given 已读/部分读/未读混合 When 投影 Then 全部入账且带原因（不消失）', () => {
    const ledger = buildDocumentLedger([
      doc('v1', '申报.md', 'read'),
      doc('v2', '扫描件.pdf', 'partially-read', '无文本层'),
      doc('v3', '损坏.doc', 'unread', '解析失败'),
    ])
    expect(ledger).toHaveLength(3)
    expect(ledger.find((entry) => entry.documentVersionId === 'v2')?.reason).toContain('无文本层')
  })
})

describe('检查账本（M2）', () => {
  test('Given 2 条 subject 规则×2 主体、仅 3 条结果 When 核对 Then 缺失记 not-executed', () => {
    const rules = [rule('r1', 'subject'), rule('r2', 'subject')]
    const results = [result('r1', ['s1'], 'compliant'), result('r1', ['s2'], 'non-compliant'), result('r2', ['s1'], 'compliant')]
    const ledger = buildCheckLedger(rules, ['s1', 's2'], results)
    expect(ledger).toHaveLength(4)
    expect(ledger.find((entry) => entry.ruleId === 'r2' && entry.targetKey === 's2')?.status).toBe('not-executed')
  })
})

describe('combineCoverage（全部符合判定，A08）', () => {
  test('Given 存在未读材料与未执行检查 When 组合 Then 阻止"全部符合"并列出 blockers', () => {
    const docs = [doc('v1', '申报.md', 'read'), doc('v2', '扫描件.pdf', 'unread', '无文本层')]
    const summary = combineCoverage(docs, [rule('r1', 'subject')], ['s1'], [])
    expect(summary.allClearVerdictAllowed).toBeFalse()
    expect(summary.blockers.some((line) => line.includes('未完整读取'))).toBeTrue()
    expect(summary.blockers.some((line) => line.includes('未执行'))).toBeTrue()
    expect(summary.pendingChecks).toBe(1)
  })

  test('Given 全部已读且检查全执行无待确认 When 组合 Then 允许全部符合', () => {
    const docs = [doc('v1', '申报.md', 'read')]
    const summary = combineCoverage(docs, [rule('r1', 'subject')], ['s1'], [result('r1', ['s1'], 'compliant')])
    expect(summary.allClearVerdictAllowed).toBeTrue()
    expect(summary.effectiveVerdicts).toBe(1)
    expect(summary.blockers).toEqual([])
  })
})

describe('OCR 端口与预览（M2）', () => {
  test('Given NullOcrPort When 识别 Then 如实拒绝并说明原因（不冒充已读）', async () => {
    const port = new NullOcrPort()
    expect(port.available).toBeFalse()
    await expect(port.recognize({ documentVersionId: 'v', pageAssetPath: '/tmp/x.png', language: 'chi_sim' })).rejects.toThrow('OCR 不可用')
  })

  test('Given 图片/非图片 When 描述预览 Then 图片直显、其余 needs-renderer（诚实标注）', () => {
    expect(describePreview('v1', 'a.png', 'image/png', 1).preview).toBe('image')
    expect(describePreview('v2', 'b.pdf', 'application/pdf', 1).preview).toBe('needs-renderer')
  })
})
