import { assessDecisionReadiness, isDecisionRelevantObservation } from '@profer/shared'
import type { CaseAggregateV2, ReviewRunV2, SourceRef, TemplateVersion } from '@profer/shared'
import type { DecisionReadiness } from '@profer/shared'

export interface ReviewWorkspacePendingAction {
  key: string
  kind: 'check' | 'fact' | 'evidence' | 'material' | 'material-slot' | 'supplement' | 'adjudication'
  title: string
  detail: string
  checkId?: string
  subjectId?: string
  sourceDocumentVersionIds?: string[]
  materialSlotId?: string
  sourceRefs?: SourceRef[]
  presentationGroup?: 'verify' | 'resolve' | 'adjudicate'
}

export interface ReviewWorkspaceViewModel {
  caseId: string
  title: string
  status: 'draft' | 'ready' | 'reviewing' | 'needs-attention' | 'waiting-supplement' | 'ready-for-decision' | 'decided'
  pendingActions: ReviewWorkspacePendingAction[]
  resolvedActions: ReviewWorkspacePendingAction[]
  canDecide: boolean
  decisionReadiness: DecisionReadiness
}

const actionableCheckStatuses = new Set(['non-compliant', 'awaiting-supplement', 'awaiting-confirmation', 'not-executed', 'execution-failed'])
const activeSupplementStatuses = new Set(['open', 'responded', 'insufficient'])

function fieldLabel(fieldKey: string, template?: TemplateVersion | null): string {
  const configured = template?.fields.find((field) => field.key === fieldKey)?.label
  if (configured) return configured
  return ({ level: '获奖等级', declaredScore: '申报分值', score: '申报分值', activityDate: '活动日期', organizer: '主办单位', category: '事项类别', title: '事项名称' } as Record<string, string>)[fieldKey] ?? '补充信息'
}

export function buildReviewWorkspaceViewModel(
  aggregate: CaseAggregateV2,
  run: ReviewRunV2 | null,
  runStale: boolean,
  extractedObservations: Array<Record<string, unknown>> = [],
  template?: TemplateVersion | null,
): ReviewWorkspaceViewModel {
  const pendingActions: ReviewWorkspacePendingAction[] = []
  const resolvedActions: ReviewWorkspacePendingAction[] = []
  const inputHash = run?.inputManifest.hash

  if (run) {
    if (run.coverage.plannedChecks === 0) {
      pendingActions.push({ key: 'coverage:no-checks', kind: 'check', title: '没有生成有效的规则检查', detail: '请确认审核依据已映射到当前审核模板；当前运行不能支持最终决定。' })
    }
    for (const check of run.checks) {
      if (!actionableCheckStatuses.has(check.status)) continue
      const disposition = [...aggregate.dispositions].reverse().find((entry) =>
        entry.findingKey === check.checkId && entry.runId === run.id && entry.inputHash === inputHash)
      const matchingSupplement = aggregate.supplements.find((supplement) => supplement.originFindingKeys.includes(check.checkId))
      const supplementPending = disposition?.disposition === 'supplement-requested'
        && (!matchingSupplement || activeSupplementStatuses.has(matchingSupplement.status))
      const item: ReviewWorkspacePendingAction = {
        key: `check:${check.checkId}`,
        kind: supplementPending ? 'supplement' : 'check',
        title: check.reason || check.ruleId,
        detail: check.status === 'awaiting-supplement' ? '缺少必要证明材料，请补充后继续。'
          : check.status === 'awaiting-confirmation' ? '请核对材料识别结果与审核依据。'
            : check.status === 'execution-failed' || check.status === 'not-executed' ? '本项尚未完成核对，请重试审核。'
              : '请核对审核依据并记录处理结果。',
        checkId: check.checkId,
        subjectId: check.target.subjectIds[0],
        sourceDocumentVersionIds: check.sourceRefs.map((ref) => ref.documentVersionId),
        sourceRefs: check.sourceRefs,
      }
      if (disposition && !supplementPending) resolvedActions.push(item)
      else pendingActions.push(item)
    }

    for (const raw of extractedObservations) {
      if (raw.confirmed === true || raw.extractedBy === 'user') continue
      const confidence = typeof raw.confidence === 'number' ? raw.confidence : 0
      const refs = Array.isArray(raw.sourceRefs) ? raw.sourceRefs : []
      const subjectId = typeof raw.subjectId === 'string' ? raw.subjectId : ''
      const fieldKey = typeof raw.fieldKey === 'string' ? raw.fieldKey : '事实'
      if (!isDecisionRelevantObservation(run, fieldKey)) continue
      if (aggregate.observations.some((observation) => observation.subjectId === subjectId && observation.fieldKey === fieldKey && observation.extractedBy === 'user' && observation.confirmed)) continue
      const value = raw.value && typeof raw.value === 'object' && 'value' in raw.value
        ? String((raw.value as { value: unknown }).value)
        : String(raw.value ?? '未识别')
      pendingActions.push({
        key: `fact:${subjectId}:${fieldKey}`,
        kind: 'fact',
        title: `待核实：${fieldLabel(fieldKey, template)} ${value}`,
        detail: `识别置信度 ${Math.round(confidence * 100)}%`,
        subjectId,
        sourceDocumentVersionIds: refs.flatMap((ref) => ref && typeof ref === 'object' && 'documentVersionId' in ref ? [String((ref as { documentVersionId: unknown }).documentVersionId)] : []),
        sourceRefs: refs.filter((ref): ref is SourceRef => !!ref && typeof ref === 'object' && 'documentVersionId' in ref && 'location' in ref) as SourceRef[],
      })
    }
  }

  for (const link of aggregate.evidenceLinks) {
    const subject = aggregate.caseV2.subjects.find((item) => item.id === link.subjectId)
    const document = aggregate.caseV2.documents.find((item) => item.versionId === link.documentVersionId)
    const item = {
      key: `evidence:${link.id}`,
      kind: 'evidence' as const,
      title: `确认证明关联：${document?.fileName ?? link.documentVersionId}`,
      detail: `${subject?.title ?? link.subjectId} · ${link.supportsFact}`,
      subjectId: link.subjectId,
      sourceDocumentVersionIds: [link.documentVersionId],
      sourceRefs: link.blockRef ? [link.blockRef] : [{ caseId: aggregate.caseV2.id, documentVersionId: link.documentVersionId, parseRevision: 0, location: { kind: 'file' as const } }],
    }
    if (link.status === 'candidate') pendingActions.push(item)
    else if (link.status === 'confirmed') resolvedActions.push(item)
  }

  for (const document of aggregate.caseV2.documents.filter((item) => item.active !== false && (item.usage === 'registered' || item.usage === 'unread' || item.usage === 'partially-read'))) {
    pendingActions.push({
      key: `material:${document.versionId}`,
      kind: 'material',
      title: `材料尚未完整读取：${document.fileName}`,
      detail: document.parseError ?? document.unusedReason ?? '需要人工检查材料内容',
      sourceDocumentVersionIds: [document.versionId],
      sourceRefs: [{ caseId: aggregate.caseV2.id, documentVersionId: document.versionId, parseRevision: document.parseRevision, location: { kind: 'file' } }],
    })
  }
  for (const document of aggregate.caseV2.documents.filter((item) => item.unusedReason?.startsWith('[审核员忽略]'))) {
    resolvedActions.push({ key: `material:${document.versionId}`, kind: 'material', title: `已人工忽略：${document.fileName}`, detail: document.unusedReason ?? '审核员已记录忽略理由', sourceDocumentVersionIds: [document.versionId] })
  }

  for (const slot of template?.materialSlots ?? []) {
    if ((slot.requiredAt ?? 'submission') !== 'decision') continue
    const count = aggregate.caseV2.documents.filter((document) => document.active !== false && document.materialSlotId === slot.id).length
    if (count >= slot.minCount) continue
    pendingActions.push({
      key: `material-slot:${slot.id}`,
      kind: 'material-slot',
      title: `缺少证明材料：${slot.name}`,
      detail: `最终决定前需要至少 ${slot.minCount} 份，当前 ${count} 份。`,
      materialSlotId: slot.id,
    })
  }

  for (const supplement of aggregate.supplements) {
    if (!activeSupplementStatuses.has(supplement.status)) continue
    pendingActions.push({
      key: `supplement:${supplement.id}`,
      kind: 'supplement',
      title: `待处理补件：${supplement.reason}`,
      detail: `${supplement.status === 'responded' ? '已收到补充材料，等待核验' : supplement.status === 'insufficient' ? '补充材料仍未满足要求' : '等待补充材料'} · 缺少：${supplement.requiredElements.join('、')}`,
    })
  }

  const adjudications = aggregate.adjudications ?? []
  const supersededAdjudications = new Set(adjudications.flatMap((record) => record.supersedesAdjudicationId ? [record.supersedesAdjudicationId] : []))
  const adjudicatedSubjects = new Map(adjudications.filter((record) => !supersededAdjudications.has(record.id) && record.basedOnRunId === run?.id && record.inputHash === run?.inputManifest.hash).map((record) => [record.subjectId, record]))
  for (const subject of aggregate.caseV2.subjects) {
    const adjudication = adjudicatedSubjects.get(subject.id)
    const item: ReviewWorkspacePendingAction = adjudication
      ? { key: `adjudication:${subject.id}`, kind: 'adjudication', subjectId: subject.id, title: `已完成认定：${subject.title}`, detail: `${adjudication.outcome === 'accepted' ? '认可' : adjudication.outcome === 'modified' ? '调整认定' : '不予认定'} · ${adjudication.reason}` }
      : { key: `adjudication:${subject.id}`, kind: 'adjudication', subjectId: subject.id, title: `待最终认定：${subject.title}`, detail: '请在中栏事项卡确认、修改等级/分值，或作不予认定。' }
    if (adjudication) resolvedActions.push(item)
    else pendingActions.push(item)
  }

  const hasUsableRun = !!run && ['completed', 'partially-completed'].includes(run.status)
  const readiness = assessDecisionReadiness({ aggregate, run, runStale, template, observations: extractedObservations })
  const canDecide = hasUsableRun && readiness.ready && aggregate.caseV2.stage !== 'decided' && aggregate.caseV2.stage !== 'archived'
  const status: ReviewWorkspaceViewModel['status'] = aggregate.caseV2.stage === 'decided'
    ? 'decided'
    : aggregate.caseV2.stage === 'awaiting-supplement'
      ? 'waiting-supplement'
      : runStale
        ? 'ready'
        : !run
          ? aggregate.caseV2.documents.length > 0 ? 'ready' : 'draft'
          : pendingActions.length > 0 || !hasUsableRun
            ? 'needs-attention'
            : 'ready-for-decision'

  const priority = (item: ReviewWorkspacePendingAction): number => {
    const check = item.checkId ? run?.checks.find((candidate) => candidate.checkId === item.checkId) : undefined
    if (check && ['awaiting-confirmation', 'not-executed', 'execution-failed'].includes(check.status)) return 0
    if (item.kind === 'material' || item.kind === 'material-slot' || item.kind === 'supplement') return 1
    if (check?.status === 'non-compliant' || check?.status === 'awaiting-supplement') return 2
    if (item.kind === 'fact' || item.kind === 'evidence') return 3
    if (item.kind === 'adjudication') return 4
    return 5
  }
  for (const item of pendingActions) {
    item.presentationGroup = item.kind === 'adjudication' ? 'adjudicate'
      : item.kind === 'check' && item.checkId && run?.checks.some((check) => check.checkId === item.checkId && ['non-compliant', 'awaiting-supplement'].includes(check.status)) || item.kind === 'material-slot' || item.kind === 'supplement'
        ? 'resolve' : 'verify'
  }
  pendingActions.sort((left, right) => priority(left) - priority(right))
  return { caseId: aggregate.caseV2.id, title: aggregate.caseV2.title, status, pendingActions, resolvedActions, canDecide, decisionReadiness: readiness }
}
