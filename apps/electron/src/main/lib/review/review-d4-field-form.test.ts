import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { D4ClientSelection, D4ReviewerFieldSpec } from '@profer/shared'
const root = mkdtempSync(join(tmpdir(), 'w1-d4-form-'))
process.env.PROFER_CONFIG_DIR = root
const { createD4ClientCase, listD4ClientTemplates } = await import('./review-d4-client')
const { readAggregate } = await import('./case-store-v2')
const { getCase } = await import('./case-store')
const { saveD4ReviewerForm, assertD4ReviewerFieldValue } = await import('./review-d4-field-form')
const { correctObservation } = await import('./application-service')
afterAll(() => rmSync(root, { recursive: true, force: true }))
const template = listD4ClientTemplates().find(item => item.templateId === 'g03-t01')!
const selection: D4ClientSelection = { reviewerConfirmation: 'explicit-ui-confirmation',
  selection: { templateId: template.templateId, version: template.version,
    targets: [{ kind: 'generic-object', objectKey: 'classroom-forms',
      subjectId: 'classroom-subject', title: '教室借用表单测试',
      businessType: template.businessTypes![0]!, scenario: template.primary[0]!,
      scenarioSource: { ...template.selectionSource!, decidedBy: 'reviewer' },
      conditions: template.conditions.map(id => ({ id, applicability: 'unknown',
        decidedBy: 'undetermined', sourceId: template.selectionSource!.sourceId,
        sourceVersionId: template.selectionSource!.sourceVersionId })),
    }],
  },
}
describe('W1 reviewer typed form metadata is scoped to frozen D2 plan', () => {
  test('persists immutable explicit form snapshots and enforces typed corrections at Main', async () => {
    const created = await createD4ClientCase({ title: '表单合成案', applicant: '测试',
      academicYear: '2026-2027', d4: selection }, 501)
    const plan = readAggregate(created.id)!.d2RuntimePlan!
    const field = plan.mapping.find(binding => binding.subjectId === 'classroom-subject' &&
      binding.evidenceCoverage?.fieldKey)!.evidenceCoverage!.fieldKey
    const spec: D4ReviewerFieldSpec = { key: field, label: '审核员确认的使用人数',
      kind: 'number', required: false, min: 0, max: 500 }
    const rev = (getCase(created.id)!.revision ?? 0)
    const saved = await saveD4ReviewerForm({ caseId: created.id, subjectId: 'classroom-subject',
      planFingerprint: plan.fingerprint, expectedRevision: rev, fields: [spec] })
    expect(saved.fields[0]).toEqual(spec)
    const latest = getCase(created.id)!
    expect(latest.d4ReviewerFormSnapshots).toHaveLength(1)
    await expect(saveD4ReviewerForm({ caseId: created.id, subjectId: 'classroom-subject',
      planFingerprint: plan.fingerprint, expectedRevision: rev, fields: [spec] })).rejects.toThrow()
    expect(() => assertD4ReviewerFieldValue(created.id, 'classroom-subject', field,
      { kind: 'text', value: '500' })).toThrow('D4_FORM_FIELD_KIND_MISMATCH')
    expect(() => assertD4ReviewerFieldValue(created.id, 'classroom-subject', field,
      { kind: 'number', value: 501 })).toThrow('D4_FORM_FIELD_RANGE_INVALID')
    expect(() => assertD4ReviewerFieldValue(created.id, 'classroom-subject', field,
      { kind: 'number', value: 0 })).not.toThrow()
    const aggregate = readAggregate(created.id)!
    const invalidCorrection = await correctObservation(created.id, {
      requestId: 'reject-invalid-w1-form-' + created.id, actor: { actorId: 'reviewer',
        actorSource: 'local', role: 'reviewer' }, expectedRevision: aggregate.caseV2.revision,
      payload: { subjectId: 'classroom-subject', fieldKey: field,
        value: { kind: 'text', value: 'bypass' }, sourceRefs: [], reason: 'negative test' },
    })
    expect(invalidCorrection.ok).toBeFalse()
    expect(invalidCorrection.message).toContain('D4_FORM_FIELD_KIND_MISMATCH')
    expect(readAggregate(created.id)!.observations.some(o => o.fieldKey === field &&
      o.value.kind === 'text' && o.confirmed)).toBeFalse()
    const updatedSpec = { ...spec, required: true, label: '审核员修订的字段标题' }
    await saveD4ReviewerForm({ caseId: created.id, subjectId: 'classroom-subject',
      planFingerprint: plan.fingerprint, expectedRevision: latest.revision!, fields: [updatedSpec] })
    expect(getCase(created.id)!.d4ReviewerFormSnapshots).toHaveLength(2)
  })
  test('rejects unauthorized D2 field, invalid enum, stale plan and foreign subject', async () => {
    const created = await createD4ClientCase({ title: '越界字段', applicant: '测试',
      academicYear: '2026-2027', d4: selection }, 501)
    const plan = readAggregate(created.id)!.d2RuntimePlan!
    const data = { caseId: created.id, subjectId: 'classroom-subject',
      planFingerprint: plan.fingerprint, expectedRevision: (getCase(created.id)!.revision ?? 0) }
    await expect(saveD4ReviewerForm({ ...data, fields: [{
      key: 'foreign-certificate-score', label: '伪造来源', kind: 'text', required: true,
    }] })).rejects.toThrow('D4_FORM_FIELD_OUTSIDE_FROZEN_SCOPE_OR_INVALID')
    await expect(saveD4ReviewerForm({ ...data, subjectId: 'foreign',
      fields: [] })).rejects.toThrow('D4_FORM_STALE_OR_FOREIGN_SUBJECT')
    await expect(saveD4ReviewerForm({ ...data, planFingerprint: 'tampered',
      fields: [] })).rejects.toThrow('D4_FORM_STALE_OR_FOREIGN_SUBJECT')
    const fact = plan.mapping.find(m => m.evidenceCoverage?.supportsFacts.length)?.evidenceCoverage?.supportsFacts[0]!
    await expect(saveD4ReviewerForm({ ...data, fields: [{
      key: fact, label: '列表', kind: 'enum', required: false, options: [
        { value: 'yes', label: '是' }, { value: 'yes', label: '重复' },
      ],
    }] })).rejects.toThrow('D4_FORM_ENUM_OPTIONS_DUPLICATE')
  })
})
