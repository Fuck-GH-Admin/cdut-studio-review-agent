import { describe, expect, test } from 'bun:test'
import type { ReviewCase, TemplateVersion } from '@profer/shared'
import { w1LatestReviewerForm, w1ReviewerFormTemplate } from './w1-reviewer-form'
const fixture = { d4ReviewerFormSnapshots: [
  { subjectId: 'subject-a', planFingerprint: 'old', fields: [
    { key: 'capacity', label: '旧名', kind: 'text', required: false },
  ] },
  { subjectId: 'subject-a', planFingerprint: 'plan-current', fields: [
    { key: 'capacity', label: '使用人数', kind: 'number', required: true, min: 0 },
  ] },
  { subjectId: 'subject-b', planFingerprint: 'plan-current', fields: [
    { key: 'capacity', label: '另一个对象', kind: 'enum', required: false,
      options: [{ value: 'yes', label: '是' }] },
  ] },
] } as ReviewCase
describe('W1 reviewer form projection never mutates immutable author template', () => {
  test('subject scoped last current snapshot provides types, labels and bounds', () => {
    const base = { fields: [], templateId: 'candidate', version: 1 } as unknown as TemplateVersion
    const template = w1ReviewerFormTemplate(base, fixture, 'subject-a', 'plan-current')!
    expect(template.fields[0]).toMatchObject({ key: 'capacity', label: '使用人数',
      kind: 'number', required: true, min: 0, scope: 'subject', visibility: 'internal' })
    expect(base.fields).toEqual([])
    expect(w1ReviewerFormTemplate(base, fixture, 'subject-b', 'plan-current')!.fields[0]!.kind).toBe('enum')
  })
  test('a changed D2 fingerprint may not reuse stale reviewer field types', () => {
    const original = { fields: [] } as unknown as TemplateVersion
    expect(w1LatestReviewerForm(fixture, 'subject-a', 'new-plan')).toBeUndefined()
    expect(w1ReviewerFormTemplate(original, fixture, 'subject-a', 'new-plan')).toBe(original)
  })
})
