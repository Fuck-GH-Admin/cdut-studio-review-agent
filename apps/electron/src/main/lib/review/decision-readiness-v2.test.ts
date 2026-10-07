import { describe, expect, test } from 'bun:test'
import { assessDecisionReadiness } from '@profer/shared'
import type { CaseAggregateV2, ReviewRunV2, TemplateVersion } from '@profer/shared'

const subject = { id: 's1', type: 'item' as const, title: '竞赛事项', fields: {}, sourceRefs: [], correction: 'user-confirmed' as const, status: 'identified' as const }
const aggregate = (overrides: Partial<CaseAggregateV2> = {}): CaseAggregateV2 => ({
  caseV2: { id: 'c1', templateId: 't', templateVersion: 1, title: '测试案卷', objectType: 'person', caseFields: {}, subjects: [subject], documents: [], stage: 'reviewing', revision: 1, createdAt: '', updatedAt: '' },
  observations: [], evidenceLinks: [], dispositions: [], tasks: [], decisions: [], supplements: [], appeals: [], receiptLog: [], ...overrides,
})
const run = (overrides: Partial<ReviewRunV2> = {}): ReviewRunV2 => ({
  id: 'r1', caseId: 'c1', templateId: 't', templateVersion: 1,
  inputManifest: { hash: 'h1', templateVersion: 1, policyVersions: [], documentVersions: [], observationIds: [], evidenceLinkIds: [], effectiveRuleIds: ['rule-a'], effectiveRuleDependencies: [] },
  status: 'completed', checkpoints: [], checks: [{ checkId: 'check-a', ruleId: 'rule-a', target: { scope: 'subject', subjectIds: ['s1'] }, status: 'compliant', reason: '符合', sourceRefs: [], executedBy: 'deterministic', executedAt: '' }], opinions: [],
  coverage: { documents: [], plannedChecks: 1, completedChecks: 1, effectiveVerdicts: 1, pendingChecks: 0 }, diagnostics: [], startedAt: '', completedAt: '', ...overrides,
})
const accepted = { id: 'a1', subjectId: 's1', outcome: 'accepted' as const, reason: '人工核验', basedOnRunId: 'r1', inputHash: 'h1', actor: { actorId: 'reviewer', actorSource: 'local' as const, role: 'reviewer' as const }, at: '' }

describe('UI/服务端统一的最终决定就绪判断', () => {
  test('缺少事项认定、未确认的规则相关事实和未读材料会共同阻断', () => {
    const result = assessDecisionReadiness({
      aggregate: aggregate({ caseV2: { ...aggregate().caseV2, documents: [{ documentId: 'd1', versionId: 'd1-v1', contentHash: '', role: 'evidence', fileName: '证书.pdf', mimeType: 'application/pdf', sizeBytes: 10, assetPath: '', parseRevision: 1, parseStatus: 'parsed', blocks: [], usage: 'unread' }] } }),
      run: run({ inputManifest: { ...run().inputManifest, effectiveRuleDependencies: [{ ruleId: 'rule-a', fieldKeys: ['level'] }] } }),
      runStale: false,
      observations: [{ subjectId: 's1', fieldKey: 'level', confirmed: false, extractedBy: 'ai' }],
    })
    expect(result.blockers.map((blocker) => blocker.kind)).toEqual(expect.arrayContaining(['missing-adjudication', 'unconfirmed-fact', 'unread-material']))
    expect(result.ready).toBeFalse()
  })

  test('非规则相关事实不阻断，当前认定和显式豁免可以完成决定就绪', () => {
    const result = assessDecisionReadiness({
      aggregate: aggregate({ adjudications: [accepted], dispositions: [{ findingKey: 'check-a', disposition: 'waived', actor: 'reviewer', reason: '保留人工豁免记录', at: '', runId: 'r1', inputHash: 'h1' }] }),
      run: run(), runStale: false, template: { materialSlots: [] } as unknown as TemplateVersion,
      observations: [{ subjectId: 's1', fieldKey: 'hobby', confirmed: false, extractedBy: 'ai' }],
    })
    expect(result).toEqual({ ready: true, blockers: [] })
  })

  test('没有有效规则时无论检查为空都不能作最终决定', () => {
    const result = assessDecisionReadiness({ aggregate: aggregate({ adjudications: [accepted] }), run: run({ checks: [], coverage: { documents: [], plannedChecks: 0, completedChecks: 0, effectiveVerdicts: 0, pendingChecks: 0 }, inputManifest: { ...run().inputManifest, effectiveRuleIds: [] } }), runStale: false, template: { materialSlots: [] } as unknown as TemplateVersion })
    expect(result.blockers.some((blocker) => blocker.kind === 'zero-effective-rules')).toBeTrue()
  })

  test('覆盖账本中缺少计划结果时不能只靠现有检查作决定', () => {
    const result = assessDecisionReadiness({
      aggregate: aggregate({ adjudications: [accepted] }),
      run: run({ coverage: { documents: [], plannedChecks: 2, completedChecks: 1, effectiveVerdicts: 1, pendingChecks: 0 } }),
      runStale: false,
    })
    expect(result.blockers).toContainEqual(expect.objectContaining({ kind: 'unresolved-check', id: 'coverage:missing-results' }))
    expect(result.ready).toBeFalse()
  })
})
