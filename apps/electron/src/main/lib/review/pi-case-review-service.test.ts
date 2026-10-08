import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Actor, TemplateVersion } from '@profer/shared'
import { createCaseFromTemplate } from './application-service'
import { readAggregate } from './case-store-v2'
import { registerMaterial } from './material-service'
import { finishPiReviewRunV2, getPiReviewBindingForSession, preparePiReviewRunV2, submitPiReviewResultV2 } from './pi-case-review-service'
import { getRunV2, readArtifact } from './run-store-v2'
import { publishTemplate, saveDraft } from './template-store'

const CONFIG_DIR = mkdtempSync(join(tmpdir(), 'cdut-pi-review-submit-'))
const SOURCE_DIR = join(CONFIG_DIR, 'sources')
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
mkdirSync(SOURCE_DIR, { recursive: true })
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const actor: Actor = { actorId: 'pi-review-submit-test', actorSource: 'local', role: 'reviewer' }

function templateFor(templateId: string): TemplateVersion {
  return {
    templateId,
    version: 1,
    schemaVersion: 2,
    name: 'Pi 提交续交测试',
    objectType: 'person',
    displayName: { template: '{{title}}' },
    fields: [],
    sections: [{
      id: 'all', name: '整案检查', order: 0, required: false,
      criteria: Array.from({ length: 5 }, (_, index) => ({
        id: `check-${index + 1}`,
        title: `检查 ${index + 1}`,
        requirement: `核验材料是否支持第 ${index + 1} 项。`,
        execution: 'semantic' as const,
        targetScope: 'case' as const,
      })),
    }],
    materialSlots: [],
    policyVersionIds: [],
    policyRefs: [],
    stages: [{ id: 'review', name: '审核', kind: 'manual-review', executorRole: 'reviewer' }],
    outputs: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
  }
}

async function setupReviewCase(suffix: string) {
  const templateId = `pi-review-submit-${suffix}`
  saveDraft(templateFor(templateId))
  publishTemplate(templateId, 1)
  const caseId = `pi-submit-${suffix}`
  const created = await createCaseFromTemplate(templateId, 1, { title: '图像出处校验', fieldValues: {}, subjects: [] }, actor, caseId)
  if (!created.ok) throw new Error(created.message)

  const imagePath = join(SOURCE_DIR, `${suffix}-image.png`)
  const textPath = join(SOURCE_DIR, `${suffix}-text.txt`)
  writeFileSync(imagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=', 'base64'))
  writeFileSync(textPath, '可核验原文：五项检查均有材料支持。')

  let aggregate = readAggregate(caseId)!
  const imageResult = await registerMaterial(caseId, {
    requestId: `image-${suffix}`, actor, expectedRevision: aggregate.caseV2.revision,
    payload: { sourcePath: imagePath, role: 'evidence' },
  })
  if (!imageResult.ok) throw new Error(imageResult.message)
  aggregate = readAggregate(caseId)!
  const textResult = await registerMaterial(caseId, {
    requestId: `text-${suffix}`, actor, expectedRevision: aggregate.caseV2.revision,
    payload: { sourcePath: textPath, role: 'evidence' },
  })
  if (!textResult.ok) throw new Error(textResult.message)

  const prepared = preparePiReviewRunV2({ caseId, sessionId: `session-${suffix}`, turnId: `turn-${suffix}` })
  const current = readAggregate(caseId)!
  const image = current.caseV2.documents.find((document) => document.fileName === `${suffix}-image.png`)!
  const text = current.caseV2.documents.find((document) => document.fileName === `${suffix}-text.txt`)!
  const imageBlock = image.blocks.find((block) => block.kind === 'image')!
  const textBlock = text.blocks.find((block) => block.kind !== 'image')!
  return {
    caseId,
    sessionId: `session-${suffix}`,
    prepared,
    imageRef: { documentVersionId: image.versionId, blockId: imageBlock.blockId, quote: '图像中显示申请人身份' },
    textRef: { documentVersionId: text.versionId, blockId: textBlock.blockId, quote: '可核验原文' },
  }
}

function checksWithTextRef(textRef: { documentVersionId: string; blockId: string; quote: string }) {
  return Array.from({ length: 5 }, (_, index) => ({
    ruleId: `section-all-check-${index + 1}`,
    subjectIds: [],
    status: 'compliant' as const,
    reason: `根据原文核验第 ${index + 1} 项。`,
    sourceRefs: [textRef],
  }))
}

describe('Pi 审核结果提交与续审', () => {
  test('finish=true 遇到图像出处拒绝和缺项时保持运行开放，修正后可在同一运行提交', async () => {
    const context = await setupReviewCase('same-turn')
    const binding = {
      assignmentId: context.prepared.assignmentId,
      sessionId: context.sessionId,
      caseId: context.caseId,
      runId: context.prepared.runId,
    }
    const rejected = submitPiReviewResultV2({
      binding,
      triggeredBy: 'user',
      result: {
        summary: '第一轮提交含未核验的图像出处。',
        checks: [{
          ruleId: 'section-all-check-1', subjectIds: [], status: 'compliant', reason: '图像文字支持结论。',
          sourceRefs: [context.imageRef],
        }],
        finish: true,
      },
    })

    expect(rejected.status).toBe('running')
    expect(rejected.rejected).toEqual([expect.objectContaining({ kind: 'check', reason: expect.stringContaining('图像出处尚未通过') })])
    expect(rejected.missingChecks).toHaveLength(5)
    const stillOpen = getRunV2(context.caseId, context.prepared.runId)!
    expect(stillOpen.status).toBe('running')
    expect(stillOpen.completedAt).toBeUndefined()
    expect(stillOpen.checks.some((check) => check.status === 'execution-failed')).toBeFalse()
    expect(readArtifact<{ attempts: Array<{ rejected: Array<{ reason: string }> }> }>(context.caseId, context.prepared.runId, 'node-pi-submit-attempts')?.attempts[0]?.rejected[0]?.reason).toContain('图像出处尚未通过')

    const corrected = submitPiReviewResultV2({
      binding,
      triggeredBy: 'user',
      result: { summary: '已改用已核验的正文出处，五项检查均已补交。', checks: checksWithTextRef(context.textRef), finish: true },
    })
    expect(corrected).toMatchObject({ accepted: 5, rejected: [], missingChecks: [], status: 'completed' })
    expect(getRunV2(context.caseId, context.prepared.runId)?.checks).toHaveLength(5)
  })

  test('流结束后的部分完成运行可由“更新审核结果”续交，复用原 runId 与有效检查', async () => {
    const context = await setupReviewCase('next-turn')
    const binding = {
      assignmentId: context.prepared.assignmentId,
      sessionId: context.sessionId,
      caseId: context.caseId,
      runId: context.prepared.runId,
    }
    submitPiReviewResultV2({
      binding,
      triggeredBy: 'user',
      result: {
        summary: '有一条图像出处尚未验证。',
        checks: [{
          ruleId: 'section-all-check-1', subjectIds: [], status: 'compliant', reason: '图像文字支持结论。',
          sourceRefs: [context.imageRef],
        }],
        finish: true,
      },
    })
    finishPiReviewRunV2(binding, { status: 'completed' })
    expect(getRunV2(context.caseId, context.prepared.runId)?.status).toBe('partially-completed')

    const continued = preparePiReviewRunV2({
      caseId: context.caseId,
      sessionId: context.sessionId,
      turnId: 'turn-next',
      resumeRunId: context.prepared.runId,
    })
    expect(continued.runId).toBe(context.prepared.runId)
    expect(continued.continuedRun).toBeTrue()
    expect(continued.userMessage).toContain('【续审同一运行】')
    expect(continued.userMessage).toContain('图像出处尚未通过')
    expect(getPiReviewBindingForSession(context.sessionId)).toMatchObject({ assignmentId: continued.assignmentId, runId: context.prepared.runId })
    expect(getRunV2(context.caseId, context.prepared.runId)?.status).toBe('running')

    const completed = submitPiReviewResultV2({
      binding: { assignmentId: continued.assignmentId, sessionId: context.sessionId, caseId: context.caseId, runId: continued.runId },
      triggeredBy: 'user',
      result: { summary: '续审已补齐全部检查。', checks: checksWithTextRef(context.textRef), finish: true },
    })
    expect(completed).toMatchObject({ rejected: [], missingChecks: [], status: 'completed' })
    expect(getRunV2(context.caseId, context.prepared.runId)?.checks).toHaveLength(5)
  })
})
