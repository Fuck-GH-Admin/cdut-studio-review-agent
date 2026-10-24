/**
 * B3 保守路由：多份申请件同属本案一个路由组时允许倒计时，
 * 但跨主体、无申请件、多个建议仍然必须人工确认。
 */
import { describe, expect, test } from 'bun:test'
import type { B2MaterialCandidate } from './review-intake-adapter-v3-b2'
import { planB3ConservativeRouting, type B3RouteSuggestion } from './review-intake-routing-adapter-v3-b3'

const sha = 'a'.repeat(64)
const material = (id: string, patch: Partial<B2MaterialCandidate> = {}): B2MaterialCandidate => ({
  candidateId: id, caseCandidateId: 'case-1', materialId: 'm-' + id,
  documentVersionId: 'v-' + id, rawSha256: sha, byteLength: 10, fileName: id + '.pdf',
  physicalSourceKey: 'native-' + id, role: 'application', subjectId: 'case-scope-case-1',
  ownerId: 'local-reviewer', ownerGeneration: 1, requestId: 'r-' + id, status: 'accepted',
  ...patch,
})

const suggestion = (materials: B2MaterialCandidate[]): B3RouteSuggestion => ({
  templateId: 'g03-t01', templateVersion: '1',
  availability: 'authorized-for-technical-selection', confidence: 1,
  caseCandidateId: 'case-1',
  evidence: materials.map(item => ({
    materialCandidateId: item.candidateId, rawSha256: item.rawSha256, reason: '内容命中对象与动作',
  })),
})

const base = (materials: B2MaterialCandidate[]) => ({
  startedAtMs: 0, nowMs: 1_000, automaticSelectionEnabled: true, userInterrupted: false,
  materialCandidates: materials, suggestions: [suggestion(materials)],
})

describe('多文件拖入的 20 秒自动建议', () => {
  test('主表+附件都是申请件，同属本案路由组时进入倒计时', () => {
    const materials = [material('form'), material('attachment')]
    const route = planB3ConservativeRouting(base(materials))
    expect(route.status).toBe('countdown')
    expect(route.remainingMs).toBe(19_000)
  })

  test('倒计时结束后默认选中，而不是要求人工确认', () => {
    const materials = [material('form'), material('attachment')]
    const route = planB3ConservativeRouting({ ...base(materials), nowMs: 20_000 })
    expect(route.status).toBe('default-selected')
    expect(route.chosen).toEqual({ templateId: 'g03-t01', templateVersion: '1' })
  })

  test('多份材料指向不同主体仍然必须人工确认', () => {
    const materials = [material('form'), material('other', { subjectId: 'student-2' })]
    const route = planB3ConservativeRouting(base(materials))
    expect(route.status).toBe('needs-user-confirmation')
  })

  test('没有申请件时不能自动路由', () => {
    const materials = [material('evidence', { role: 'supporting' })]
    const route = planB3ConservativeRouting(base(materials))
    expect(route.status).toBe('needs-user-confirmation')
  })

  test('两个不同建议仍然必须人工选择', () => {
    const materials = [material('form')]
    const second: B3RouteSuggestion = { ...suggestion(materials), templateId: 'g06-t01' }
    const route = planB3ConservativeRouting({ ...base(materials), suggestions: [suggestion(materials), second] })
    expect(route.status).toBe('needs-user-confirmation')
  })
})
