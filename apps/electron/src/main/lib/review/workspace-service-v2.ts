/**
 * 三栏审核工作台与 V2 案卷聚合的内部映射。
 * 当前迁移期沿用同一 caseId；V1 表单输入只作为系统投影写入 V2，人工事实、处置与决定始终留在聚合中。
 */
import { createHash } from 'node:crypto'
import type { CaseAggregateV2, CommandReceipt, FieldValue, ReviewCase, ReviewCaseV2, RuleSpec } from '@profer/shared'
import { getCase } from './case-store'
import { createAggregate, readAggregate, submitCommand } from './case-store-v2'
import { documentToVersion, itemToSubject, mapDomainToTemplate, migrateCaseToV2 } from './migration'
import { getTemplate, saveDraft } from './template-store'
import { ensureBuiltinTemplateDrafts } from './builtin-templates'
import { buildEvidenceLinks } from './evidence-service'
import { compileWorkspaceRule } from './workspace-rule-compiler'

const SYSTEM_ACTOR = { actorId: 'review-workspace-sync', actorSource: 'system', role: 'system' } as const
const ensureFlights = new Map<string, Promise<CaseAggregateV2>>()

function text(value: string): FieldValue {
  return { kind: 'text', value }
}

function projectedCase(v1: ReviewCase, current: ReviewCaseV2): ReviewCaseV2 {
  const mapping = mapDomainToTemplate(v1.domainPackId)
  if (!mapping.templateId) throw new Error(mapping.note ?? `审核领域未映射到 V2 模板: ${v1.domainPackId ?? '(默认)'}`)
  const template = getTemplate(mapping.templateId, current.templateId === mapping.templateId ? current.templateVersion : undefined)
  if (!template) throw new Error(`V2 模板不存在或未初始化: ${mapping.templateId}`)

  const subjects = v1.items.map((item) => {
    const subject = itemToSubject(item)
    return { ...subject, sourceRefs: subject.sourceRefs.map((ref) => ({ ...ref, caseId: v1.id })) }
  })
  const reviewRules: RuleSpec[] = v1.rulePacks.flatMap((pack) => pack.outline.map((outline, index) => compileWorkspaceRule(pack, outline, index + 1)))
  return {
    ...current,
    templateId: template.templateId,
    templateVersion: template.version,
    title: v1.title,
    caseFields: {
      ...current.caseFields,
      applicant: text(v1.applicant),
      academicYear: text(v1.academicYear),
    },
    subjects,
    reviewRules,
    documents: v1.documents.map((document) => {
      const version = documentToVersion(document)
      if (mapping.templateId !== 'comprehensive-assessment-v2') return version
      if (document.role === 'application') return { ...version, materialSlotId: 'application-form' }
      if (document.role === 'evidence') return { ...version, materialSlotId: 'certificates' }
      return version
    }),
  }
}

function projectionFingerprint(caseV2: ReviewCaseV2): string {
  const { title, templateId, templateVersion, caseFields, subjects, documents, reviewRules } = caseV2
  return JSON.stringify({ title, templateId, templateVersion, caseFields, subjects, documents, reviewRules })
}

async function initializeAggregate(caseId: string): Promise<CaseAggregateV2> {
  // First-use path must work even if the separate V2 setup panel has never been opened.
  ensureBuiltinTemplateDrafts({ getTemplate, saveDraft })
  const legacy = getCase(caseId)
  if (!legacy) throw new Error(`辅助审核案卷不存在: ${caseId}`)
  const existing = readAggregate(caseId)
  if (existing) return existing

  const migration = migrateCaseToV2(legacy)
  if (!migration.caseV2) throw new Error(migration.note || `案卷无法映射到 V2: ${caseId}`)
  const projected = projectedCase(legacy, migration.caseV2)
  projected.revision = 0
  projected.stage = projected.documents.length > 0 ? 'submitted' : 'draft'
  const receipt: CommandReceipt = {
    requestId: `workspace-init-${caseId}`,
    type: 'EnsureReviewWorkspaceAggregate',
    payloadHash: createHash('sha256').update(`${caseId}|${projectionFingerprint(projected)}`).digest('hex'),
    revision: 0,
    at: new Date().toISOString(),
    summary: '辅助审核工作台已映射到单案业务聚合',
    actor: SYSTEM_ACTOR,
  }
  await createAggregate(caseId, projected, receipt)
  const aggregate = readAggregate(caseId)
  if (!aggregate) throw new Error(`V2 案卷聚合写入失败: ${caseId}`)
  return aggregate
}

/** 创建或读取工作台当前案卷的唯一 V2 聚合，并同步 V1 输入投影。 */
export async function ensureWorkspaceAggregateV2(caseId: string): Promise<CaseAggregateV2> {
  let flight = ensureFlights.get(caseId)
  if (!flight) {
    flight = initializeAggregate(caseId).finally(() => ensureFlights.delete(caseId))
    ensureFlights.set(caseId, flight)
  }
  await flight
  return syncWorkspaceProjectionV2(caseId)
}

/** 将工作台已有的申报字段、事项和文件版本投影到同 ID 的 V2 聚合，不触碰人工业务记录。 */
export async function syncWorkspaceProjectionV2(caseId: string): Promise<CaseAggregateV2> {
  let current = readAggregate(caseId) ?? await initializeAggregate(caseId)

  // 乐观并发冲突时重新读取并重试；不会用旧快照覆盖另一条人工操作。
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const legacy = getCase(caseId)
    if (!legacy) throw new Error(`辅助审核案卷不存在: ${caseId}`)
    const projection = projectedCase(legacy, current.caseV2)
    if (projectionFingerprint(projection) === projectionFingerprint(current.caseV2)) return current
    const digest = createHash('sha256').update(projectionFingerprint(projection)).digest('hex')
    const result = await submitCommand(caseId, {
      requestId: `workspace-sync-${digest.slice(0, 32)}`,
      actor: SYSTEM_ACTOR,
      expectedRevision: current.caseV2.revision,
      type: 'SyncReviewWorkspaceProjection',
      payload: { digest },
    }, () => ({
      summary: `同步申报输入与材料（${projection.subjects.length} 项 / ${projection.documents.length} 份）`,
      mutate: (draft) => {
        draft.caseV2 = { ...projection, revision: draft.caseV2.revision, updatedAt: draft.caseV2.updatedAt }
        // 来自 V1 识别的关联先作为 AI 候选；审核员可在工作台确认、拒绝或改绑。
        for (const item of legacy.items) {
          const versionIds = item.evidenceDocumentIds.map((documentId) => `${documentId}-v1`)
          for (const documentVersionId of versionIds) {
            if (!draft.caseV2.documents.some((document) => document.versionId === documentVersionId)) continue
            draft.evidenceLinks = buildEvidenceLinks(draft.evidenceLinks, {
              documentVersionId,
              subjectIds: [item.id],
              supportsFact: item.title,
              linkedBy: item.identifiedBy === 'manual' ? 'user' : 'ai',
            })
          }
        }
      },
    }))
    if (result.ok) return result.aggregate
    if (result.code !== 'VERSION_CONFLICT') throw new Error(`${result.code}: ${result.message}`)
    current = readAggregate(caseId) ?? current
  }
  throw new Error(`案卷聚合同步冲突，请刷新后重试: ${caseId}`)
}

/** 测试与查询使用的纯投影构造。 */
export function projectWorkspaceCaseV2(v1: ReviewCase, current: ReviewCaseV2): ReviewCaseV2 {
  return projectedCase(v1, current)
}
