import { describe, expect, test } from 'bun:test'
import type { D2RuntimePlan } from '@profer/shared'
import { w1AuthorResponsibilityCards } from './w1-author-responsibilities'
const plan = {
  rules: [
    { id: 'rule-a', title: '场地使用边界', requirement: '核查原件和权限，不能代替校方批准' },
    { id: 'rule-b', title: '仪器借用', requirement: '检查共享仪器许可记录' },
  ],
  mapping: [
    { ruleId: 'rule-a', subjectId: 'room-a', authority: 'unverified-policy',
      evidenceCoverage: { fieldKey: 'capacity', supportsFacts: ['permission-proof'] } },
    { ruleId: 'rule-b', subjectId: 'room-b', authority: 'request-scope',
      applicability: 'applicable', evidenceCoverage: { fieldKey: 'equipment', supportsFacts: [] } },
  ],
} as unknown as D2RuntimePlan
describe('W1 frozen author responsibility display', () => {
  test('names and explanations stay strictly in the mapped Subject', () => {
    const a = w1AuthorResponsibilityCards(plan, 'room-a')
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ title: '场地使用边界', authority: 'unverified-policy',
      applicability: 'unknown', factKeys: ['capacity', 'permission-proof'] })
    expect(a[0]!.requirement).toContain('不能代替校方批准')
    const b = w1AuthorResponsibilityCards(plan, 'room-b')
    expect(b).toHaveLength(1)
    expect(b[0]!.title).toBe('仪器借用')
    expect(b[0]!.applicability).toBe('applicable')
    expect(w1AuthorResponsibilityCards(plan, 'foreign-subject')).toEqual([])
  })
  test('missing rule metadata exposes the key, never invents labels or policies', () => {
    const synthetic = { ...plan, mapping: [{ ruleId: 'missing', subjectId: 'room-a',
      authority: 'unverified-policy' }] } as unknown as D2RuntimePlan
    expect(w1AuthorResponsibilityCards(synthetic, 'room-a')[0]!.title).toContain('missing')
  })
})
