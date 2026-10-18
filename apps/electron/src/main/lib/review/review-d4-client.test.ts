/** 客户端接入的定向回归：真实建案、材料解析、同步及逐对象证据；不冒充在线模型。 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { listD4ClientTemplates, createD4ClientCase } from './review-d4-client'
import { readAggregate } from './case-store-v2'
import { listCases } from './case-store'
import { importDocumentFromPath, removeDocumentsFromCase } from './case-import'
import { syncWorkspaceProjectionV2 } from './workspace-service-v2'
import { setEvidenceLink } from './application-service'
import { validateD2GuardSubmission } from './review-d2-execution-gates'
import { verifyD2InstalledPlan } from './review-d2-runtime'
import { listRunsV2 } from './run-store-v2'
import type { D4ClientTemplate } from '@profer/shared'

const profile = mkdtempSync(join(tmpdir(), 'd4-client-test-'))
process.env.PROFER_CONFIG_DIR = profile
afterAll(() => rmSync(profile, { recursive: true, force: true }))
const fixtures = resolve(import.meta.dir, '../../../../../../docs/design/review-agent/acceptance/d4-product-loop-r01/fixtures')
const actor = { actorId: 'synthetic-local-reviewer', actorSource: 'local', role: 'reviewer' } as const
const templates = listD4ClientTemplates()
const pick = (id: string): D4ClientTemplate => structuredClone(templates.find(t => t.templateId === id)!)
const create = (t: D4ClientTemplate) => createD4ClientCase({ title: '受控合成技术预审', applicant: '合成对象', academicYear: '2026-2027',
  d4: { selection: t.selection, useControlledStudentFixture: t.controlledStudentFixture, reviewerConfirmation: 'explicit-ui-confirmation' } })
async function link(caseId: string, documentVersionId: string, subjectId: string, supportsFact: string) {
  const aggregate = readAggregate(caseId)!
  const result = await setEvidenceLink(caseId, { requestId: `link-${aggregate.caseV2.revision}`, actor,
    expectedRevision: aggregate.caseV2.revision, payload: { documentVersionId, subjectIds: [subjectId], supportsFact, linkedBy: 'user' } })
  expect(result.ok).toBeTrue()
  return readAggregate(caseId)!
}

describe('D4 客户端最小接入', () => {
  test('真实 G08 建案可发现；上传/移除材料保留固定责任，A 证据不能解锁 B', async () => {
    const t = pick('g08-t02')
    const c = await create(t)
    const initial = readAggregate(c.id)!
    expect(initial.caseV2.subjects).toHaveLength(2)
    expect(listCases().some(item => item.id === c.id)).toBeTrue()
    const doc = await importDocumentFromPath({ caseId: c.id, sourcePath: join(fixtures, 'A-电子购买凭证.md'), role: 'evidence' })
    const synced = await syncWorkspaceProjectionV2(c.id)
    expect(doc.blocks.some(b => b.text?.includes('TEST-A-6281'))).toBeTrue()
    expect(synced.caseV2.subjects).toEqual(initial.caseV2.subjects)
    expect(synced.caseV2.reviewRules).toEqual(initial.caseV2.reviewRules)
    expect(verifyD2InstalledPlan(synced)).toEqual([])
    const a = synced.d2RuntimePlan!.mapping.find(m => m.subjectId === 'lost-a' && m.applicability === 'applicable')!
    const b = synced.d2RuntimePlan!.mapping.find(m => m.subjectId === 'lost-b' && m.applicability === 'applicable')!
    const version = `${doc.id}-v1`
    const linked = await link(c.id, version, 'lost-a', a.evidenceCoverage!.supportsFacts[0]!)
    expect(validateD2GuardSubmission(linked, a, 'compliant', [version])).toBeUndefined()
    expect(validateD2GuardSubmission(linked, b, 'compliant', [version])).toContain('EVIDENCE_SCOPE_MISSING')
    const unknown = linked.d2RuntimePlan!.mapping.find(m => m.subjectId === 'lost-b' && m.applicability === 'unknown')!
    expect(validateD2GuardSubmission(linked, unknown, 'not-applicable', [version])).toContain('APPLICABILITY_UNKNOWN')
    await removeDocumentsFromCase({ caseId: c.id, role: 'evidence', documentIds: [doc.id] })
    const removed = await syncWorkspaceProjectionV2(c.id)
    expect(verifyD2InstalledPlan(removed)).toEqual([])
    expect(validateD2GuardSubmission(removed, a, 'compliant', [version])).toContain('EVIDENCE_SCOPE_MISSING')
  })
  test('G03 两资源的互斥、叠加、未知进入 Plan；修改条件的新案不继承旧结果', async () => {
    const t = pick('g03-t01')
    const c1 = await create(t)
    const first = readAggregate(c1.id)!
    expect(first.d2RuntimePlan!.targets).toEqual(t.selection.targets)
    expect(first.d2RuntimePlan!.mapping.some(m => m.applicability === 'not-applicable')).toBeTrue()
    expect(first.d2RuntimePlan!.mapping.some(m => m.applicability === 'unknown')).toBeTrue()
    const condition = t.selection.targets[1]!.conditions!.find(c => c.applicability === 'unknown')!
    condition.applicability = 'not-applicable'; condition.decidedBy = 'reviewer'
    const c2 = await create(t)
    const second = readAggregate(c2.id)!
    expect(second.d2RuntimePlan!.fingerprint).not.toBe(first.d2RuntimePlan!.fingerprint)
    expect(second.caseV2.id).not.toBe(first.caseV2.id)
    expect(second.evidenceLinks).toEqual([])
    expect(listRunsV2(c2.id)).toEqual([])
    const bad = pick('g03-t01'); bad.selection.targets[0]!.scenario = 'unknown-primary'
    await expect(create(bad)).rejects.toThrow('D4_GENERIC_PRIMARY_SOURCE_INVALID')
  })
  test('G01-I 保留特殊 student-field 及合成 registry：同份证明两条独立关联', async () => {
    const c = await create(pick('g01-student-identity-correction'))
    const initial = readAggregate(c.id)!
    expect(initial.d2RuntimePlan!.schemaVersion).toBe(2)
    expect(initial.d2RuntimePlan!.targets.map(t => t.fieldKey)).toEqual(['full-name', 'credential-id'])
    const doc = await importDocumentFromPath({ caseId: c.id, sourcePath: join(fixtures, 'G01-双字段证明.md'), role: 'evidence' })
    const synced = await syncWorkspaceProjectionV2(c.id)
    expect(verifyD2InstalledPlan(synced)).toEqual([])
    const version = `${doc.id}-v1`
    await link(c.id, version, 'student-name', 'd2:student:full-name:legal-document')
    expect(readAggregate(c.id)!.evidenceLinks.some(l => l.subjectId === 'student-id')).toBeFalse()
    const linked = await link(c.id, version, 'student-id', 'd2:student:credential-id:legal-document')
    expect(linked.evidenceLinks).toHaveLength(2)
    expect(new Set(linked.evidenceLinks.map(l => l.subjectId)).size).toBe(2)
    expect(new Set(linked.evidenceLinks.map(l => l.documentVersionId))).toEqual(new Set([version]))
    expect(linked.d2RuntimePlan!.trustedStudentSnapshot!.sourceKind).toBe('controlled-synthetic')
  })
  test('P1-A/B: three real resource objects compile to separate D2 Subjects and preserve unknown', async () => {
    const t = pick('g03-t01')
    const prototype = t.selection.targets[0]!
    const makeObject = (index: number) => ({
      ...structuredClone(prototype),
      objectKey: `resource-${index}`,
      subjectId: `resource-subject-${index}`,
      title: `用户填写的教室时段 ${index}`,
      scenario: t.primary[index % t.primary.length]!,
      conditions: prototype.conditions!.map(c => ({
        ...c,
        applicability: index === 2 ? 'unknown' as const : index === 1 ? 'not-applicable' as const : 'applicable' as const,
        decidedBy: index === 2 ? 'undetermined' as const : 'reviewer' as const,
      })),
    })
    t.selection.targets = [makeObject(1), makeObject(2), makeObject(3)]
    const created = await create(t)
    const aggregate = readAggregate(created.id)!
    expect(aggregate.d2RuntimePlan!.targets).toHaveLength(3)
    expect(aggregate.caseV2.subjects).toHaveLength(3)
    expect(new Set(aggregate.caseV2.subjects.map(x => x.id)).size).toBe(3)
    expect(aggregate.d2RuntimePlan!.targets[2]!.conditions!.every(x => x.applicability === 'unknown' && x.decidedBy === 'undetermined')).toBeTrue()
    expect(verifyD2InstalledPlan(aggregate)).toEqual([])
    expect(aggregate.evidenceLinks).toEqual([])
    // Removing the middle object and adding a different one is a new case with a new fingerprint.
    t.selection.targets.splice(1, 1)
    t.selection.targets.push(makeObject(4))
    const changed = readAggregate((await create(t)).id)!
    expect(changed.d2RuntimePlan!.targets.map(x => x.objectKey)).toEqual(['resource-1', 'resource-3', 'resource-4'])
    expect(changed.d2RuntimePlan!.fingerprint).not.toBe(aggregate.d2RuntimePlan!.fingerprint)
    expect(changed.evidenceLinks).toEqual([])
  })

  test('P1-B: reject unconfirmed input, forged source, duplicated ID, missing axis, foreign type and mixed object', async () => {
    const t = pick('g03-t01')
    const valid = structuredClone(t.selection)
    await expect(createD4ClientCase({
      title: 'P1 未确认', applicant: '模拟', academicYear: '2026-2027',
      d4: { selection: valid },
    })).rejects.toThrow('D4_REVIEWER_CONFIRMATION_REQUIRED')
    const source = pick('g03-t01')
    source.selection.targets[0]!.conditions![0]!.sourceVersionId = 'forged-source-v99'
    await expect(create(source)).rejects.toThrow('D4_GENERIC_CONDITION_SOURCE_INVALID')
    const duplicate = pick('g03-t01')
    duplicate.selection.targets[1]!.subjectId = duplicate.selection.targets[0]!.subjectId
    await expect(create(duplicate)).rejects.toThrow('D4_GENERIC_OBJECT_INVALID')
    const missing = pick('g03-t01')
    missing.selection.targets[0]!.conditions!.pop()
    await expect(create(missing)).rejects.toThrow('D4_GENERIC_CONDITIONS_INCOMPLETE')
    const foreign = pick('g03-t01')
    foreign.selection.targets[0]!.businessType = 'g08-lost-item'
    await expect(create(foreign)).rejects.toThrow('D4_GENERIC_OBJECT_INVALID')
    const nonGeneric = pick('g01-student-identity-correction')
    nonGeneric.selection.targets[0]!.title = '试图覆盖冻结学籍字段'
    await expect(create(nonGeneric)).rejects.toThrow('D4_SPECIAL_SCOPE_HELD')
  })

})
