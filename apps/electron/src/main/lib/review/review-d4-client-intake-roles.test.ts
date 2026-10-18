/**
 * W1 true Main case-creation regression.
 * Only the OS picker is mocked: staging, one-use token, D2 compilation, case
 * persistence and both imported document roles use real production services.
 */
import { afterAll, describe, expect, mock, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { D4ClientSelection } from '@profer/shared'

const root = mkdtempSync(join(tmpdir(), 'd4-w1-intake-roles-'))
process.env.PROFER_CONFIG_DIR = join(root, 'profile')
mkdirSync(process.env.PROFER_CONFIG_DIR, { recursive: true })
const applicationPath = join(root, '公共教学教室借用申请.md')
const evidencePath = join(root, '教室安排证明.md')
writeFileSync(applicationPath, '# 教室借用申请\n申请使用公共教学教室开展小组研讨。\n')
writeFileSync(evidencePath, '# 合成证明材料\n教室安排说明：仅供技术验证，不是校方核验。\n')
let pickedPaths = [applicationPath, evidencePath]
mock.module('electron', () => ({
  dialog: { showOpenDialog: async () => ({ canceled: false, filePaths: pickedPaths }) },
}))
const { stageD4Intake, claimD4Intake } = await import('./review-d4-intake')
const { listD4ClientTemplates, createD4ClientCase } = await import('./review-d4-client')
const { getCase } = await import('./case-store')
const { readAggregate } = await import('./case-store-v2')
afterAll(() => rmSync(root, { recursive: true, force: true }))

const template = listD4ClientTemplates().find(t => t.templateId === 'g03-t01')!
function selection(): D4ClientSelection {
  const source = template.selectionSource!
  return {
    reviewerConfirmation: 'explicit-ui-confirmation',
    selection: {
      templateId: template.templateId,
      version: template.version,
      targets: [{
        kind: 'generic-object',
        objectKey: 'w1-teaching-room',
        subjectId: 'w1-room-subject',
        title: '合成公共教学教室',
        businessType: template.businessTypes![0]!,
        scenario: template.primary[0]!,
        scenarioSource: { ...source, decidedBy: 'reviewer' },
        conditions: template.conditions.map(id => ({
          id, applicability: 'unknown', decidedBy: 'undetermined',
          sourceId: source.sourceId, sourceVersionId: source.sourceVersionId,
        })),
      }],
    },
  }
}
const create = (d4: D4ClientSelection, owner = 711) => createD4ClientCase({
  title: 'W1 合成教室材料分类', applicant: '合成申请人', academicYear: '2026-2027', d4,
}, owner)

describe('W1 real D4 Main native intake per-file classification', () => {
  test('role tampering is rejected before case creation, but its token can be corrected and retried', async () => {
    const token = (await stageD4Intake(711))!.token
    await expect(create({ ...selection(), intakeToken: token, intakeRoles: ['application', 'rule' as 'evidence'] }))
      .rejects.toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    await expect(create({ ...selection(), intakeToken: token, intakeRoles: ['application'] }))
      .rejects.toThrow('D4_INTAKE_ROLE_PLAN_INVALID')
    await expect(create({ ...selection(), intakeToken: token, intakeRoles: ['application', 'evidence'] }, 712))
      .rejects.toThrow('D4_INTAKE_TOKEN_INVALID')

    const created = await create({ ...selection(), intakeToken: token, intakeRoles: ['application', 'evidence'] })
    const stored = getCase(created.id)!
    expect(stored.documents).toHaveLength(2)
    expect(stored.documents.map(doc => doc.role)).toEqual(['application', 'evidence'])
    expect(stored.documents.map(doc => doc.fileName)).toEqual([
      '公共教学教室借用申请.md', '教室安排证明.md',
    ])
    const aggregate = readAggregate(created.id)!
    expect(aggregate.caseV2.subjects).toHaveLength(1)
    expect(aggregate.d2RuntimePlan!.targets).toHaveLength(1)
    expect(aggregate.d2RuntimePlan!.publicationAllowed).toBe(false)
    expect(aggregate.evidenceLinks).toEqual([]) // role != reviewer-confirmed Subject binding
    await expect(create({ ...selection(), intakeToken: token, intakeRoles: ['application', 'evidence'] }))
      .rejects.toThrow('D4_INTAKE_TOKEN_INVALID')
    expect(() => claimD4Intake(token, 711)).toThrow('D4_INTAKE_TOKEN_INVALID')
  })

  test('older clients omitting the role plan still put all OS-picked material into applications', async () => {
    pickedPaths = [applicationPath]
    const token = (await stageD4Intake(711))!.token
    const created = await create({ ...selection(), intakeToken: token })
    expect(getCase(created.id)!.documents.map(doc => doc.role)).toEqual(['application'])
  })
})
