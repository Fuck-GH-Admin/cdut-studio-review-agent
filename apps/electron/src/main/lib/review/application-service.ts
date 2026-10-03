/**
 * 审核应用服务（N1c，docs/design/review-agent/07 §3.2 命令清单的 N1 子集）
 *
 * 首批命令（每条都校验发布依赖/字段作用域/确认锁）：
 * - CreateCaseFromTemplate：模板已发布 + 政策依赖齐全；生成案卷级字段（scope=case）
 * - UpdateFields：按字段 scope 写 caseFields 或 subject.fields（ Observation 联动由 N2 扩展）
 * - CorrectObservation：人工确认值不被 AI 覆盖；supersedes 链保留（复用 evidence-service）
 * - SetEvidenceLink：绑定目标/共享范围校验（复用 evidence-service）
 * AI 工具不能直接调用这些命令的人工动作；actor 来源按命令传入（本地模式 local）。
 */

import type { Actor, EvidenceLink, FieldValue, Observation, ReviewCaseV2, TemplateVersion } from '@profer/shared'
import { buildEvidenceLinks, recordObservation } from './evidence-service'
import { getTemplate } from './template-store'
import { validatePolicyRef } from './policy-store'
import { CommandValidationError, createAggregate, payloadHash, readAggregate, submitCommand, type CaseAggregateV2, type CommandResult } from './case-store-v2'

// ===== CreateCaseFromTemplate =====

export interface CreateCasePayload {
  title: string
  fieldValues: Record<string, unknown>
  subjects: Array<{ id: string; title: string; type: 'item' | 'clause' | 'project' | 'budget-line' | 'custom'; fieldValues?: Record<string, unknown> }>
}

function fieldValueOf(spec: TemplateVersion['fields'][number], raw: unknown): FieldValue {
  switch (spec.kind) {
    case 'number': return { kind: 'number', value: Number(raw) }
    case 'date': return { kind: 'date', value: String(raw) }
    case 'boolean': return { kind: 'boolean', value: Boolean(raw) }
    default: return { kind: 'text', value: String(raw ?? '') }
  }
}

/** 从模板创建案卷：模板已发布 + 政策依赖校验 + 字段作用域分流（07 §3.2） */
export async function createCaseFromTemplate(
  templateId: string,
  version: number,
  payload: CreateCasePayload,
  actor: Actor,
  caseId: string,
): Promise<CommandResult<ReviewCaseV2>> {
  const template = getTemplate(templateId, version)
  if (!template) throw new CommandValidationError('NOT_FOUND', `模板不存在: ${templateId}@${version}`)
  if (template.status !== 'published') throw new CommandValidationError('VALIDATION_FAILED', '只有已发布模板可创建真实案卷')
  for (const ref of template.policyRefs ?? []) {
    const check = validatePolicyRef(ref)
    if (!check.ok) throw new CommandValidationError('DEPENDENCY_UNRESOLVED', check.reason ?? '政策依赖不完整')
  }
  // 字段作用域：case 字段进 caseFields；subject 缺失值留给事项表单
  const caseFields: Record<string, FieldValue> = {}
  for (const spec of template.fields) {
    if ((spec.scope ?? 'subject') !== 'case') continue
    if (payload.fieldValues[spec.key] === undefined) {
      if (spec.required) throw new CommandValidationError('VALIDATION_FAILED', `缺少必填案卷字段: ${spec.label}（${spec.key}）`)
      continue
    }
    caseFields[spec.key] = fieldValueOf(spec, payload.fieldValues[spec.key])
  }
  const now = new Date().toISOString()
  const caseV2: ReviewCaseV2 = {
    id: caseId,
    templateId: template.templateId,
    templateVersion: template.version,
    title: payload.title,
    objectType: template.objectType,
    caseFields,
    subjects: payload.subjects.map((subject) => ({
      id: subject.id,
      type: subject.type,
      title: subject.title,
      fields: Object.fromEntries(
        template.fields
          .filter((spec) => (spec.scope ?? 'subject') === 'subject' && subject.fieldValues?.[spec.key] !== undefined)
          .map((spec) => [spec.key, fieldValueOf(spec, subject.fieldValues![spec.key])]),
      ),
      sourceRefs: [],
      correction: 'user-confirmed',
      status: 'identified',
    })),
    documents: [],
    stage: 'draft',
    revision: 0,
    createdAt: now,
    updatedAt: now,
  }
  await createAggregate(caseId, caseV2)
  const aggregate = readAggregate(caseId)!
  return { ok: true, receipt: { requestId: `create-${caseId}`, type: 'CreateCaseFromTemplate', payloadHash: payloadHash('CreateCaseFromTemplate', payload), revision: 0, at: now, summary: `案卷已创建（${template.name}）` }, aggregate, entity: aggregate.caseV2 }
}

// ===== UpdateFields =====

export interface UpdateFieldsPayload {
  caseFieldValues?: Record<string, unknown>
  subjectFieldValues?: Array<{ subjectId: string; values: Record<string, unknown> }>
}

export function updateFields(caseId: string, command: { requestId: string; actor: Actor; expectedRevision: number; payload: UpdateFieldsPayload }): Promise<CommandResult<undefined>> {
  return submitCommand<UpdateFieldsPayload, undefined>(caseId, { ...command, type: 'UpdateFields' }, (aggregate, payload) => {
    if (aggregate.caseV2.stage === 'archived') throw new CommandValidationError('INVALID_TRANSITION', '已归档案卷不可修改')
    return {
      summary: `更新 ${Object.keys(payload.caseFieldValues ?? {}).length} 个案卷字段 / ${payload.subjectFieldValues?.length ?? 0} 个事项`,
      mutate: (draft) => {
        for (const [key, value] of Object.entries(payload.caseFieldValues ?? {})) {
          draft.caseV2.caseFields[key] = { kind: 'text', value: String(value) }
        }
        for (const subjectUpdate of payload.subjectFieldValues ?? []) {
          const subject = draft.caseV2.subjects.find((candidate) => candidate.id === subjectUpdate.subjectId)
          if (!subject) throw new CommandValidationError('NOT_FOUND', `事项不存在: ${subjectUpdate.subjectId}`)
          for (const [key, value] of Object.entries(subjectUpdate.values)) {
            subject.fields[key] = { kind: 'text', value: String(value) }
            subject.correction = 'user-confirmed'
          }
        }
      },
    }
  })
}

// ===== CorrectObservation =====

export interface CorrectObservationPayload {
  subjectId: string
  fieldKey: string
  value: FieldValue
  sourceRefs: Observation['sourceRefs']
  reason: string
}

/** 人工更正：confirmed=true，原值进 supersedes 链（A05/U02） */
export function correctObservation(
  caseId: string,
  command: { requestId: string; actor: Actor; expectedRevision: number; payload: CorrectObservationPayload },
): Promise<CommandResult<Observation>> {
  return submitCommand<CorrectObservationPayload, Observation>(caseId, { ...command, type: 'CorrectObservation' }, (aggregate, payload) => {
    if (!payload.reason.trim()) throw new CommandValidationError('VALIDATION_FAILED', '更正必须附理由（保留更正历史）')
    let created: Observation | undefined
    return {
      summary: `更正事实 ${payload.subjectId}.${payload.fieldKey}`,
      mutate: (draft) => {
        draft.observations = recordObservation(draft.observations, {
          subjectId: payload.subjectId,
          fieldKey: payload.fieldKey,
          value: payload.value,
          sourceRefs: payload.sourceRefs,
          extractedBy: 'user',
          confirmed: true,
        })
        created = draft.observations[draft.observations.length - 1]!
      },
      entity: created,
    }
  })
}

// ===== SetEvidenceLink =====

export interface SetEvidenceLinkPayload {
  documentVersionId: string
  subjectIds: string[]
  supportsFact: string
  linkedBy: 'ai' | 'user'
}

export function setEvidenceLink(caseId: string, command: { requestId: string; actor: Actor; expectedRevision: number; payload: SetEvidenceLinkPayload }): Promise<CommandResult<EvidenceLink[]>> {
  return submitCommand<SetEvidenceLinkPayload, EvidenceLink[]>(caseId, { ...command, type: 'SetEvidenceLink' }, (aggregate, payload) => {
    if (!payload.supportsFact.trim()) throw new CommandValidationError('VALIDATION_FAILED', '绑定必须说明支持的事实')
    let links: EvidenceLink[] = []
    return {
      summary: `绑定证据 ${payload.documentVersionId} → ${payload.subjectIds.length} 个事项`,
      mutate: (draft) => {
        links = buildEvidenceLinks(draft.evidenceLinks, payload)
        draft.evidenceLinks = links
      },
      entity: links,
    }
  })
}

// ===== 查询 =====

export function getCaseV2Aggregate(caseId: string): CaseAggregateV2 | undefined {
  return readAggregate(caseId)
}

