import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2, ReviewRunV2 } from '@profer/shared'
import { buildReviewWorkspaceViewModel } from './review-workspace-view-model'

const baseCase: CaseAggregateV2['caseV2'] = {
  id: 'workspace-case', templateId: 't', templateVersion: 1, title: '单案测试', objectType: 'person',
  caseFields: {}, subjects: [{ id: 's1', type: 'item', title: '竞赛事项', fields: {}, sourceRefs: [], correction: 'user-confirmed', status: 'identified' }],
  documents: [], stage: 'reviewing', revision: 1, createdAt: '', updatedAt: '',
}
const check = {
  checkId: 'check-1', ruleId: 'rule-1', target: { scope: 'subject' as const, subjectIds: ['s1'] },
  status: 'non-compliant' as const, reason: '申报等级与依据不符', sourceRefs: [], executedBy: 'deterministic' as const, executedAt: '',
}

function aggregate(overrides: Partial<CaseAggregateV2> = {}): CaseAggregateV2 {
  return { caseV2: baseCase, observations: [], evidenceLinks: [], dispositions: [], tasks: [], decisions: [], supplements: [], appeals: [], receiptLog: [], ...overrides }
}
function run(overrides: Partial<ReviewRunV2> = {}): ReviewRunV2 {
  return {
    id: 'run-1', caseId: 'workspace-case', templateId: 't', templateVersion: 1,
    inputManifest: { hash: 'hash-1', templateVersion: 1, policyVersions: [], documentVersions: [], observationIds: [], evidenceLinkIds: [] },
    status: 'completed', checkpoints: [], checks: [check], opinions: [],
    coverage: { documents: [], plannedChecks: 1, completedChecks: 1, effectiveVerdicts: 1, pendingChecks: 0 }, diagnostics: [], startedAt: '', completedAt: '',
    ...overrides,
  }
}

describe('单案审核工作台 ViewModel', () => {
  test('未处置的问题必须进入待办且不能最终决定', () => {
    const view = buildReviewWorkspaceViewModel(aggregate(), run(), false)
    expect(view.pendingActions.map((item) => item.key)).toContain('check:check-1')
    expect(view.canDecide).toBeFalse()
    expect(view.status).toBe('needs-attention')
  })

  test('当前运行下已记录处置的问题进入已处理；旧输入处置不生效', () => {
    const current = { findingKey: 'check-1', disposition: 'false-positive', actor: 'reviewer', reason: '人工复核不是问题', at: '', runId: 'run-1', inputHash: 'hash-1' }
    const old = { ...current, inputHash: 'old-hash' }
    const active = buildReviewWorkspaceViewModel(aggregate({ dispositions: [current] }), run(), false)
    const stale = buildReviewWorkspaceViewModel(aggregate({ dispositions: [old] }), run(), false)
    expect(active.pendingActions).toHaveLength(0)
    expect(active.resolvedActions).toHaveLength(1)
    expect(active.canDecide).toBeTrue()
    expect(stale.pendingActions).toHaveLength(1)
    expect(stale.canDecide).toBeFalse()
  })

  test('事实、候选证明、未读材料和补件统一显示为待处理', () => {
    const input = aggregate({
      caseV2: { ...baseCase, documents: [{ documentId: 'd', versionId: 'd-v1', contentHash: '', role: 'evidence', fileName: '证书.pdf', mimeType: 'application/pdf', sizeBytes: 1, assetPath: '', parseRevision: 1, parseStatus: 'failed', parseError: '文件不可读', blocks: [], usage: 'unread', unusedReason: '文件不可读' }] },
      evidenceLinks: [{ id: 'e1', documentVersionId: 'd-v1', subjectId: 's1', supportsFact: '等级证明', status: 'candidate', linkedBy: 'ai' }],
      supplements: [{ id: 'sup1', caseId: 'workspace-case', originFindingKeys: [], requiredElements: ['日期'], reason: '材料缺日期', responsibleRole: 'student', status: 'open', responses: [], createdAt: '' }],
    })
    const view = buildReviewWorkspaceViewModel(input, run({ checks: [] }), false, [{ subjectId: 's1', fieldKey: 'level', value: '省级', confidence: 0.4, confirmed: false }])
    expect(view.pendingActions.map((item) => item.kind)).toEqual(expect.arrayContaining(['fact', 'evidence', 'material', 'supplement']))
    expect(view.canDecide).toBeFalse()
  })
})
