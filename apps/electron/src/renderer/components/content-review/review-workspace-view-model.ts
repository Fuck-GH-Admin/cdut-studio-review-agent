import type { CaseAggregateV2, ReviewRunV2 } from '@profer/shared'

export interface ReviewWorkspacePendingAction {
  key: string
  kind: 'check' | 'fact' | 'evidence' | 'material' | 'supplement'
  title: string
  detail: string
  checkId?: string
  subjectId?: string
  sourceDocumentVersionIds?: string[]
}

export interface ReviewWorkspaceViewModel {
  caseId: string
  title: string
  status: 'draft' | 'ready' | 'reviewing' | 'needs-attention' | 'waiting-supplement' | 'ready-for-decision' | 'decided'
  pendingActions: ReviewWorkspacePendingAction[]
  resolvedActions: ReviewWorkspacePendingAction[]
  canDecide: boolean
}

const actionableCheckStatuses = new Set(['non-compliant', 'awaiting-supplement', 'awaiting-confirmation', 'not-executed', 'execution-failed'])
const activeSupplementStatuses = new Set(['open', 'responded', 'insufficient'])

export function buildReviewWorkspaceViewModel(
  aggregate: CaseAggregateV2,
  run: ReviewRunV2 | null,
  runStale: boolean,
  extractedObservations: Array<Record<string, unknown>> = [],
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
        detail: `${check.ruleId} · ${check.status}`,
        checkId: check.checkId,
        subjectId: check.target.subjectIds[0],
        sourceDocumentVersionIds: check.sourceRefs.map((ref) => ref.documentVersionId),
      }
      if (disposition && !supplementPending) resolvedActions.push(item)
      else pendingActions.push(item)
    }

    for (const raw of extractedObservations) {
      if (raw.confirmed === true || raw.extractedBy === 'user') continue
      const confidence = typeof raw.confidence === 'number' ? raw.confidence : 0
      const refs = Array.isArray(raw.sourceRefs) ? raw.sourceRefs : []
      if (confidence >= 0.8 && refs.length > 0) continue
      const subjectId = typeof raw.subjectId === 'string' ? raw.subjectId : ''
      const fieldKey = typeof raw.fieldKey === 'string' ? raw.fieldKey : '事实'
      const value = raw.value && typeof raw.value === 'object' && 'value' in raw.value
        ? String((raw.value as { value: unknown }).value)
        : String(raw.value ?? '未识别')
      pendingActions.push({
        key: `fact:${subjectId}:${fieldKey}`,
        kind: 'fact',
        title: `待确认事实：${fieldKey} ${value}`,
        detail: `识别置信度 ${Math.round(confidence * 100)}%`,
        subjectId,
        sourceDocumentVersionIds: refs.flatMap((ref) => ref && typeof ref === 'object' && 'documentVersionId' in ref ? [String((ref as { documentVersionId: unknown }).documentVersionId)] : []),
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
    })
  }
  for (const document of aggregate.caseV2.documents.filter((item) => item.unusedReason?.startsWith('[审核员忽略]'))) {
    resolvedActions.push({ key: `material:${document.versionId}`, kind: 'material', title: `已人工忽略：${document.fileName}`, detail: document.unusedReason ?? '审核员已记录忽略理由', sourceDocumentVersionIds: [document.versionId] })
  }

  for (const supplement of aggregate.supplements) {
    if (!activeSupplementStatuses.has(supplement.status)) continue
    pendingActions.push({
      key: `supplement:${supplement.id}`,
      kind: 'supplement',
      title: `待处理补件：${supplement.reason}`,
      detail: `${supplement.status} · 缺少：${supplement.requiredElements.join('、')}`,
    })
  }

  const hasUsableRun = !!run && ['completed', 'partially-completed'].includes(run.status)
  const canDecide = hasUsableRun && !runStale && pendingActions.length === 0 && aggregate.caseV2.stage !== 'decided' && aggregate.caseV2.stage !== 'archived'
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

  return { caseId: aggregate.caseV2.id, title: aggregate.caseV2.title, status, pendingActions, resolvedActions, canDecide }
}
