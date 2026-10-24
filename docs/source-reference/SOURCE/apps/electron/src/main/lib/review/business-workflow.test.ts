/**
 * 业务闭环状态机单测（M4，A09/A10：决定追加式/补件回复≠满足/申诉关联决定/并发冲突）
 */
import { describe, expect, test } from 'bun:test'
import type { ReviewCaseV2 } from '@profer/shared'
import {
  openSupplementRequest,
  recordDecision,
  resolveAppeal,
  resolveSupplement,
  respondSupplement,
  submitAppeal,
  type WorkflowState,
} from './business-workflow'

const actor = { actorId: 'teacher-1', actorSource: 'local' as const, role: 'teacher' as const }

function freshState(): WorkflowState {
  const caseV2: ReviewCaseV2 = {
    id: 'c1', templateId: 't', templateVersion: 1, title: '测试', objectType: 'person',
    caseFields: {}, subjects: [], documents: [], stage: 'reviewing',
    revision: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  return { caseV2, decisions: [], supplements: [], appeals: [] }
}

describe('recordDecision（A09）', () => {
  test('Given 通过决定 When 记录 Then 追加不覆盖且案卷→decided、revision+1', () => {
    const state = freshState()
    const outcome = recordDecision(state, { requestId: 'q1', actor, expectedRevision: 1 }, { scope: { kind: 'case', ids: [] }, stageId: 'final-review', result: 'pass', reason: '材料齐全且核对通过', basedOnRunId: 'r1' })
    expect(outcome.ok).toBeTrue()
    if (outcome.ok) {
      expect(outcome.state.decisions).toHaveLength(1)
      expect(outcome.state.caseV2.stage).toBe('decided')
      expect(outcome.state.caseV2.revision).toBe(2)
      expect(outcome.entity.basedOnRevision).toBe(1) // 基于决定前版本
    }
  })

  test('Given 二次更正 When 再记录 Then 两条决定并存（追加式）', () => {
    let state = freshState()
    const first = recordDecision(state, { requestId: 'q1', actor, expectedRevision: 1 }, { scope: { kind: 'case', ids: [] }, stageId: 'final-review', result: 'pass', reason: '初判通过', basedOnRunId: 'r1' })
    state = first.ok ? first.state : state
    const second = recordDecision(state, { requestId: 'q2', actor, expectedRevision: 2 }, { scope: { kind: 'case', ids: [] }, stageId: 'final-review', result: 'reject', reason: '复核发现等级不符', basedOnRunId: 'r2' })
    expect(second.ok).toBeTrue()
    if (second.ok) expect(second.state.decisions).toHaveLength(2)
  })

  test('Given 空理由或缺失 basedOnRunId When 记录 Then 拒绝（AI 建议不是决定）', () => {
    expect(recordDecision(freshState(), { requestId: 'q', actor, expectedRevision: 1 }, { scope: { kind: 'case', ids: [] }, stageId: 's', result: 'pass', reason: ' ', basedOnRunId: 'r1' }).ok).toBeFalse()
    expect(recordDecision(freshState(), { requestId: 'q', actor, expectedRevision: 1 }, { scope: { kind: 'case', ids: [] }, stageId: 's', result: 'pass', reason: 'x', basedOnRunId: '' }).ok).toBeFalse()
  })

  test('Given 过期 revision When 记录 Then VERSION_CONFLICT 携带当前版', () => {
    const outcome = recordDecision(freshState(), { requestId: 'q', actor, expectedRevision: 99 }, { scope: { kind: 'case', ids: [] }, stageId: 's', result: 'pass', reason: 'x', basedOnRunId: 'r1' })
    expect(outcome.ok).toBeFalse()
    if (!outcome.ok) {
      expect(outcome.code).toBe('VERSION_CONFLICT')
      expect(outcome.currentRevision).toBe(1)
    }
  })
})

describe('补件（A09）', () => {
  test('Given 退回决定 When 开补件 Then 案卷→awaiting-supplement', () => {
    let state = freshState()
    const decision = recordDecision(state, { requestId: 'q', actor, expectedRevision: 1 }, { scope: { kind: 'case', ids: [] }, stageId: 's', result: 'return', reason: '缺证明', basedOnRunId: 'r1' })
    state = decision.ok ? decision.state : state
    const request = openSupplementRequest(state, { requestId: 'q2', actor, expectedRevision: 2 }, { originFindingKeys: ['f1'], requiredElements: ['等级', '日期'], reason: '需补等级证明', responsibleRole: 'student' })
    expect(request.ok).toBeTrue()
    if (request.ok) {
      expect(request.state.caseV2.stage).toBe('awaiting-supplement')
      expect(request.entity.status).toBe('open')
    }
  })

  test('Given 回复材料 When respond Then 仅 responded（回复≠满足）', () => {
    let state = freshState()
    const opened = openSupplementRequest(state, { requestId: 'q', actor, expectedRevision: 1 }, { originFindingKeys: [], requiredElements: ['等级'], reason: 'x', responsibleRole: 'student' })
    state = opened.ok ? opened.state : state
    const responded = respondSupplement(state, opened.ok ? opened.entity.id : '', { documentVersionIds: ['d1-v1'], note: '已补交', actor: 'student-1' })
    expect(responded.ok).toBeTrue()
    if (responded.ok) expect(responded.entity.status).toBe('responded')
    // 满足判定后案卷回 reviewing
    const resolved = resolveSupplement(responded.ok ? responded.state : state, responded.ok ? responded.entity.id : '', 'satisfied', '要素齐全')
    expect(resolved.ok).toBeTrue()
    if (resolved.ok) expect(resolved.state.caseV2.stage).toBe('reviewing')
  })

  test('Given 已关闭补件 When 再回复 Then 拒绝；取消无理由 Then 拒绝', () => {
    let state = freshState()
    const opened = openSupplementRequest(state, { requestId: 'q', actor, expectedRevision: 1 }, { originFindingKeys: [], requiredElements: ['a'], reason: 'x', responsibleRole: 'student' })
    state = opened.ok ? opened.state : state
    const id = opened.ok ? opened.entity.id : ''
    const resolved = resolveSupplement(state, id, 'cancelled', '')
    expect(resolved.ok).toBeFalse()
    const cancelled = resolveSupplement(state, id, 'cancelled', '重复申请，撤销')
    expect(cancelled.ok).toBeTrue()
    const again = respondSupplement(cancelled.ok ? cancelled.state : state, id, { documentVersionIds: ['d'], note: '', actor: 's' })
    expect(again.ok).toBeFalse()
  })
})

describe('申诉（A10）', () => {
  test('Given 既有决定 When 申诉 Then submitted；成立后案卷回 awaiting-review', () => {
    let state = freshState()
    const decision = recordDecision(state, { requestId: 'q', actor, expectedRevision: 1 }, { scope: { kind: 'case', ids: [] }, stageId: 's', result: 'reject', reason: '驳回', basedOnRunId: 'r1' })
    state = decision.ok ? decision.state : state
    const appeal = submitAppeal(state, { requestId: 'q2', actor, expectedRevision: 2 }, { againstDecisionId: decision.ok ? decision.entity.id : '', statement: '证明有效，请复核', newEvidenceDocumentVersionIds: ['d2-v1'] })
    expect(appeal.ok).toBeTrue()
    const resolved = resolveAppeal(appeal.ok ? appeal.state : state, appeal.ok ? appeal.entity.id : '', 'upheld', 'dec-review')
    expect(resolved.ok).toBeTrue()
    if (resolved.ok) {
      expect(resolved.entity.status).toBe('upheld')
      expect(resolved.state.caseV2.stage).toBe('awaiting-review')
      // 原决定不改写
      expect(resolved.state.decisions[0]!.result).toBe('reject')
    }
  })

  test('Given 无关联决定 When 申诉 Then 拒绝（A10）', () => {
    const outcome = submitAppeal(freshState(), { requestId: 'q', actor, expectedRevision: 1 }, { againstDecisionId: 'ghost', statement: 'x', newEvidenceDocumentVersionIds: [] })
    expect(outcome.ok).toBeFalse()
  })
})
