import { afterAll, describe, expect, test } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { CaseAggregateV2, DocumentVersion, ReviewCaseV2, RuleSpec } from '@profer/shared'
import { buildDeterministicRuleChecks, collectV2VisionImages } from './v2-executor-factory'

const VISION_ROOT = join(tmpdir(), `cdut-review-v2-vision-${Date.now()}`)
afterAll(() => rmSync(VISION_ROOT, { recursive: true, force: true }))

function makeAggregate(): CaseAggregateV2 {
  const caseV2: ReviewCaseV2 = {
    id: 'case-rule-scope',
    templateId: 'template-test',
    templateVersion: 1,
    title: '字段隔离测试',
    objectType: 'person',
    caseFields: {},
    subjects: [
      { id: 'subject-a', type: 'item', title: '事项 A', fields: { level: { kind: 'text', value: '国家级' }, declaredScore: { kind: 'number', value: 4 } }, sourceRefs: [], correction: 'ai-extracted', status: 'identified' },
      { id: 'subject-b', type: 'item', title: '事项 B', fields: { level: { kind: 'text', value: '省级' }, declaredScore: { kind: 'number', value: 4 } }, sourceRefs: [], correction: 'ai-extracted', status: 'identified' },
    ],
    documents: [],
    stage: 'submitted',
    revision: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return { caseV2, observations: [], evidenceLinks: [], dispositions: [], tasks: [], decisions: [], supplements: [], appeals: [], receiptLog: [] }
}

function rule(overrides: Partial<RuleSpec>): RuleSpec {
  return {
    id: 'rule',
    policyVersionId: 'policy@1',
    title: '规则',
    when: { field: 'level', op: 'eq', value: '国家级' },
    requirement: '等级符合要求',
    targetScope: 'subject',
    execution: 'deterministic',
    onFail: 'reject',
    onUnknown: 'needs-confirmation',
    sourceRefIds: [],
    priority: 1,
    confirmation: 'confirmed',
    ...overrides,
  }
}

describe('V2 规则执行正确性门禁', () => {
  test('模型视觉输入只读取案卷内激活材料的图像页', () => {
    const imagePath = join(VISION_ROOT, 'source-docs', 'page-001.png')
    mkdirSync(join(VISION_ROOT, 'source-docs'), { recursive: true })
    writeFileSync(imagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jTy8AAAAASUVORK5CYII=', 'base64'))
    const aggregate = makeAggregate()
    const document: DocumentVersion = {
      documentId: 'visual-proof', versionId: 'visual-proof-v1', contentHash: 'hash', role: 'evidence',
      fileName: '扫描证书.pdf', mimeType: 'application/pdf', sizeBytes: 10, assetPath: 'source-docs/scan.pdf',
      parseRevision: 1, parseStatus: 'partial', usage: 'unread', active: true,
      blocks: [{ blockId: 'page-1-image', text: '', kind: 'image', imageAssetPath: 'source-docs/page-001.png' }],
    }
    aggregate.caseV2.documents = [document, { ...document, documentId: 'removed', versionId: 'removed-v1', active: false }]
    const images = collectV2VisionImages(aggregate, VISION_ROOT)
    expect(images).toHaveLength(1)
    expect(images[0]).toStartWith('data:image/png;base64,')
  })

  test('按 subject 隔离同名字段，并标记正确目标', () => {
    const checks = buildDeterministicRuleChecks(makeAggregate(), [rule({ id: 'level-national' })])
    expect(checks).toHaveLength(2)
    expect(checks.find((check) => check.target.subjectIds[0] === 'subject-a')?.status).toBe('compliant')
    expect(checks.find((check) => check.target.subjectIds[0] === 'subject-b')?.status).toBe('non-compliant')
  })

  test('完整处理嵌套 all/any/not 条件', () => {
    const checks = buildDeterministicRuleChecks(makeAggregate(), [rule({
      id: 'nested',
      when: { all: [{ field: 'level', op: 'exists' }, { not: { any: [{ field: 'level', op: 'eq', value: '校级' }, { field: 'level', op: 'eq', value: '班级' }] } }] },
    })])
    expect(checks.every((check) => check.status === 'compliant')).toBe(true)
  })

  test('semantic 规则交给模型，manual 规则进入待确认', () => {
    const checks = buildDeterministicRuleChecks(makeAggregate(), [
      rule({ id: 'semantic-rule', execution: 'semantic' }),
      rule({ id: 'manual-rule', execution: 'manual' }),
    ])
    expect(checks.map((check) => check.ruleId)).toEqual(['manual-rule', 'manual-rule'])
    expect(checks.every((check) => check.status === 'awaiting-confirmation' && check.executedBy === 'manual')).toBe(true)
  })

  test('人工确认事实优先于原申报字段，用于重跑后的规则计算', () => {
    const checks = buildDeterministicRuleChecks(makeAggregate(), [rule({ id: 'reviewed-level', when: { field: 'level', op: 'eq', value: '省级' } })], [
      { subjectId: 'subject-a', fieldKey: 'level', value: { kind: 'text', value: '省级' }, extractedBy: 'user', confirmed: true },
    ])
    expect(checks.find((check) => check.target.subjectIds[0] === 'subject-a')?.status).toBe('compliant')
    expect(checks.find((check) => check.target.subjectIds[0] === 'subject-b')?.status).toBe('compliant')
  })

  test('等级映射也使用人工更正值，并在检查结果中保留事实、证明与出处链', () => {
    const aggregate = makeAggregate()
    aggregate.caseV2.documents.push({
      documentId: 'certificate', versionId: 'certificate-v1', contentHash: 'hash', role: 'evidence', fileName: '获奖证书.pdf', mimeType: 'application/pdf', sizeBytes: 10,
      assetPath: 'certificate.pdf', parseRevision: 1, parseStatus: 'parsed', blocks: [], usage: 'read', active: true,
    })
    aggregate.evidenceLinks.push({ id: 'link-certificate', documentVersionId: 'certificate-v1', subjectId: 'subject-a', supportsFact: '等级', status: 'confirmed', linkedBy: 'user' })
    const checks = buildDeterministicRuleChecks(aggregate, [rule({
      id: 'level-mapping',
      workspaceConstraint: { kind: 'level-mapping', levels: { '国家级一等奖': 8, '省级二等奖': 4 } },
    })], [{
      id: 'observation-corrected-level', subjectId: 'subject-a', fieldKey: 'level', value: { kind: 'text', value: '省级二等奖' },
      extractedBy: 'user', confirmed: true,
      sourceRefs: [{ caseId: aggregate.caseV2.id, documentVersionId: 'certificate-v1', parseRevision: 1, location: { kind: 'file' } }],
    }])
    const check = checks.find((candidate) => candidate.target.subjectIds[0] === 'subject-a')!
    expect(check.status).toBe('compliant')
    expect(check.basis?.observationIds).toContain('observation-corrected-level')
    expect(check.basis?.evidenceLinkIds).toContain('link-certificate')
    expect(check.sourceRefs.some((ref) => ref.documentVersionId === 'certificate-v1')).toBeTrue()
  })
})
