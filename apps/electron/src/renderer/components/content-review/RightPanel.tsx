/** 右栏「待我处理」：V2 运行结果的审核员待办、补件和最终决定。 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { Gavel, Play, ShieldAlert } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { Spinner } from '@profer/ui/primitives/spinner'
import type { CaseAggregateV2, CheckResult, SourceRef } from '@profer/shared'
import { useSetAtom } from 'jotai'
import {
  reviewCaseAtom,
  reviewRunningAtom,
  reviewExecutionAtom,
  reviewWorkspaceAggregateAtom,
  reviewWorkspaceExtractedObservationsAtom,
  reviewWorkspaceRunAtom,
  reviewWorkspaceRunStaleAtom,
  reviewWorkspaceTemplateAtom,
  reviewAdjudicationEditorSubjectAtom,
  reviewActivePaneAtom,
  reviewSourceFocusAtom,
} from '@/atoms/review-atoms'
import { cn } from '@/lib/utils'
import type { ReviewActions } from './use-review-actions'
import { CaseTimelinePanel } from './CaseTimelinePanel'
import { useReviewWorkspaceActions } from './use-review-workspace-actions'
import { buildReviewWorkspaceViewModel } from './review-workspace-view-model'
import { ReviewActionDialog, type ReviewActionDialogField } from './ReviewActionDialog'

interface RightPanelProps { actions: ReviewActions }

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', ready: '可开始审核', reviewing: '审核中', 'needs-attention': '待人工处理',
  'waiting-supplement': '等待补件', 'ready-for-decision': '可作最终决定', decided: '已决定',
}
let sourceFocusNonce = 0

export function RightPanel({ actions }: RightPanelProps): React.ReactElement {
  const legacyCase = useAtomValue(reviewCaseAtom)
  const running = useAtomValue(reviewRunningAtom)
  const execution = useAtomValue(reviewExecutionAtom)
  const aggregate = useAtomValue(reviewWorkspaceAggregateAtom)
  const run = useAtomValue(reviewWorkspaceRunAtom)
  const runStale = useAtomValue(reviewWorkspaceRunStaleAtom)
  const extractedObservations = useAtomValue(reviewWorkspaceExtractedObservationsAtom)
  const template = useAtomValue(reviewWorkspaceTemplateAtom)
  const setAdjudicationEditorSubject = useSetAtom(reviewAdjudicationEditorSubjectAtom)
  const setActivePane = useSetAtom(reviewActivePaneAtom)
  const setSourceFocus = useSetAtom(reviewSourceFocusAtom)
  const workspaceActions = useReviewWorkspaceActions()
  const view = aggregate ? buildReviewWorkspaceViewModel(aggregate, run, runStale, extractedObservations, template) : null
  const [busyKey, setBusyKey] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [historyNonce, setHistoryNonce] = React.useState(0)
  const [dialog, setDialog] = React.useState<{ title: string; description?: string; fields: ReviewActionDialogField[]; submit(values: Record<string, string>): Promise<void> } | null>(null)
  const canRun = !!legacyCase
  const nextAction = view?.pendingActions.find((item) => item.kind === 'material')
    ?? view?.pendingActions.find((item) => item.kind === 'fact')
    ?? view?.pendingActions.find((item) => item.kind === 'evidence' || item.kind === 'material-slot')
    ?? view?.pendingActions.find((item) => item.kind === 'check' || item.kind === 'supplement')
    ?? view?.pendingActions.find((item) => item.kind === 'adjudication')

  const perform = async (key: string, action: () => Promise<void>): Promise<void> => {
    setBusyKey(key)
    setNotice(null)
    try {
      await action()
      await workspaceActions.refresh()
      setHistoryNonce((value) => value + 1)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error))
    } finally {
      setBusyKey(null)
    }
  }

  const handleDisposition = (check: CheckResult, disposition: 'confirmed-issue' | 'false-positive' | 'waived'): void => {
    const defaultReason = disposition === 'false-positive' ? '' : disposition === 'confirmed-issue' ? '审核员核实后确认该问题属实' : '审核员决定暂不处理该问题'
    setDialog({
      title: disposition === 'false-positive' ? '标记识别有误' : disposition === 'confirmed-issue' ? '确认审核问题' : '暂不处理此问题',
      fields: [{ key: 'reason', label: '处理说明', defaultValue: defaultReason, placeholder: '说明核实结论及理由', multiline: true }],
      submit: async ({ reason }) => perform(`check:${check.checkId}`, () => workspaceActions.recordDisposition({ findingKey: check.checkId, disposition, reason: reason!.trim() })),
    })
  }

  const handleSupplement = (check: CheckResult): void => {
    setDialog({
      title: '要求补件',
      fields: [
        { key: 'required', label: '需要补充', defaultValue: check.reason, placeholder: '例如：完整获奖证书', multiline: true },
        { key: 'reason', label: '补件原因', defaultValue: check.reason, placeholder: '说明当前材料还无法确认的内容', multiline: true },
      ],
      submit: async ({ required, reason }) => perform(`supplement:${check.checkId}`, () => workspaceActions.openSupplement({ findingKey: check.checkId, requiredElements: required!.split(/[，,、\n]/).map((item) => item.trim()).filter(Boolean), reason: reason!.trim() })),
    })
  }

  const handleDecision = (result: 'pass' | 'partial-pass' | 'return' | 'reject'): void => {
    const summary = aggregate && run ? decisionSummary(aggregate, run.id, run.inputManifest.hash) : ''
    setDialog({
      title: '最终决定',
      description: summary ? `审核汇总：${summary}\n决定结果：${decisionLabel(result)}` : `决定结果：${decisionLabel(result)}`,
      fields: [
        ...(result === 'return' ? [
          { key: 'required', label: '退回补件要求', placeholder: '列出需要补充的材料或信息', multiline: true },
          { key: 'supplementReason', label: '补件原因', placeholder: '说明退回补件的原因', multiline: true },
        ] : []),
        { key: 'reason', label: '决定理由', placeholder: '填写最终决定理由', multiline: true },
      ],
      submit: async ({ reason, required, supplementReason }) => perform('decision', () => workspaceActions.decide({
        result,
        reason: reason!.trim(),
        ...(result === 'return' ? { requiredElements: required!.split(/[，,、\n]/).map((item) => item.trim()).filter(Boolean), supplementReason: supplementReason!.trim() } : {}),
      })),
    })
  }

  const goToAction = (item: NonNullable<typeof nextAction>): void => {
    if (item.kind === 'fact' || item.kind === 'evidence' || item.kind === 'adjudication') {
      setActivePane('center')
      if (item.kind === 'adjudication' && item.subjectId) setAdjudicationEditorSubject(item.subjectId)
      requestAnimationFrame(() => {
        const target = item.kind === 'evidence' ? document.getElementById('review-evidence-section')
          : item.subjectId ? document.getElementById(`review-subject-${encodeURIComponent(item.subjectId)}`) : null
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    setActivePane('right')
    requestAnimationFrame(() => document.querySelector(`[data-review-pending-key="${CSS.escape(item.key)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2"><Gavel size={16} className="text-primary" /><h2 className="text-[13px] font-semibold text-foreground">待我处理</h2></div>
        <p className="mt-1 text-xs text-muted-foreground">
          {view ? `${STATUS_LABELS[view.status]} · 待处理 ${view.pendingActions.length}` : '先选择审核任务'}
        </p>
      </header>

      {(!run || runStale || run.status === 'failed' || running) ? <section className="shrink-0 px-3 pt-3">
        <Button type="button" className="h-9 w-full gap-2 text-[13px]" disabled={running || !canRun} onClick={() => void actions.runFullReview()}>
          {running || execution.status === 'preparing' ? <Spinner size="sm" /> : <Play size={14} />}
          {running || execution.status === 'preparing' ? '审核中…' : run?.status === 'failed' ? '重试审核' : runStale ? '更新审核结果' : '开始审核'}
        </Button>
        {!canRun && <p className="mt-2 text-xs text-muted-foreground">请先新建或选择审核任务。</p>}
      </section> : <details className="mx-3 mt-3 rounded-lg border border-border/60 bg-card px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium">··· 高级操作</summary>
        <Button type="button" variant="outline" size="sm" className="mt-2 w-full" disabled={running} onClick={() => void actions.runFullReview()}>重新审核</Button>
      </details>}
      {run && !runStale && nextAction && <button type="button" onClick={() => goToAction(nextAction)} className="mx-3 mt-3 rounded-lg border border-primary/30 bg-primary/[0.04] px-3 py-2 text-left text-xs hover:bg-primary/[0.08]">
        <span className="block text-[10px] font-semibold text-primary">下一步</span>
        <span className="mt-0.5 block font-medium">{nextAction.title}</span>
        <span className="mt-0.5 block text-[10px] text-muted-foreground">去处理 →</span>
      </button>}

      {execution.status !== 'idle' && (
        <section className={cn('mx-3 mt-3 rounded-lg px-3 py-2 text-xs', execution.status === 'failed' ? 'border border-destructive/40 bg-destructive/[0.06]' : execution.status === 'partial' || execution.status === 'awaiting-input' ? 'border border-amber-500/40 bg-amber-500/[0.06]' : 'bg-muted/40')}>
          <p className="font-medium">{execution.message ?? '审核处理中'}</p>
          {execution.checks && <p className="mt-1 text-muted-foreground">规则检查 {execution.checks.completed} / {execution.checks.total}</p>}
          {execution.error && <p className="mt-1 text-destructive">{execution.error}</p>}
        </section>
      )}
      {notice && <p role="alert" className="mx-3 mt-3 rounded-lg border border-destructive/40 bg-destructive/[0.06] px-3 py-2 text-xs text-destructive">{notice}</p>}
      {runStale && run && <p className="mx-3 mt-3 rounded-lg border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-700 dark:text-amber-300">材料或核验内容在本次审核后发生变化；当前结果只作历史参考，请更新审核结果。</p>}
      {!run ? (
        <div className="mx-3 mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-8 text-center">
          <ShieldAlert size={26} className="text-muted-foreground/60" />
          <p className="text-sm font-medium">尚未开始审核</p>
          <p className="text-xs leading-5 text-muted-foreground">开始审核后，系统会按当前材料和审核依据进行核对并保存结果。</p>
        </div>
      ) : run.status === 'failed' ? (
        <p className="mx-3 mt-3 rounded-lg border border-destructive/40 bg-destructive/[0.06] px-3 py-4 text-xs text-destructive">审核运行失败：{run.error ?? '未知错误'}</p>
      ) : (
        <>
          <section className="shrink-0 px-3 pt-3">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">待办 {view?.pendingActions.length ?? 0}</p>
            {!view || view.pendingActions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 px-3 py-5 text-center text-xs text-muted-foreground">没有未完成待办。</div>
            ) : (
              <div className="space-y-2">
                {view.pendingActions.map((item, itemIndex) => {
                  const check = item.checkId ? run.checks.find((candidate) => candidate.checkId === item.checkId) : undefined
                  const sourceNames = (item.sourceDocumentVersionIds ?? []).flatMap((id) => {
                    const fileName = aggregate?.caseV2.documents.find((doc) => doc.versionId === id)?.fileName
                    return fileName ? [fileName] : []
                  })
                  const activeSupplement = aggregate?.supplements.find((supplement) => supplement.originFindingKeys.includes(item.checkId ?? item.key))
                  const relatedSubject = aggregate?.caseV2.subjects.find((subject) => subject.id === item.subjectId)
                  const sourceRefs = [...(item.sourceRefs ?? []), ...(relatedSubject?.sourceRefs ?? [])]
                  const distinctSources = sourceRefs.filter((ref, index) => sourceRefs.findIndex((candidate) => candidate.documentVersionId === ref.documentVersionId && JSON.stringify(candidate.location) === JSON.stringify(ref.location)) === index)
                  const focusSource = (ref: SourceRef): void => {
                    const document = aggregate?.caseV2.documents.find((candidate) => candidate.versionId === ref.documentVersionId)
                    const purpose = document?.role === 'rule' ? 'rule' : document?.role === 'application' ? 'application' : 'evidence'
                    sourceFocusNonce += 1
                    setActivePane(purpose === 'rule' ? 'left' : 'center')
                    setSourceFocus({ ref, purpose, nonce: sourceFocusNonce, originPendingActionKey: item.key })
                  }
                  const group = item.presentationGroup ?? 'verify'
                  const previousGroup = view.pendingActions[itemIndex - 1]?.presentationGroup
                  return (
                    <React.Fragment key={item.key}>
                    {group !== previousGroup && <p className="pt-2 text-[11px] font-semibold text-muted-foreground">{group === 'verify' ? '需要核实' : group === 'resolve' ? '需要处理' : '待最终认定'} · {view.pendingActions.filter((candidate) => candidate.presentationGroup === group).length}</p>}
                    <article data-review-pending-key={item.key} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                      <p className="text-[13px] font-medium">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                      {sourceNames.length > 0 && <p className="mt-1 text-[11px] text-muted-foreground">来源：{[...new Set(sourceNames)].join('、')}</p>}
                      {check && <p className="mt-1 rounded bg-muted/50 px-2 py-1 text-[11px]">审核依据：{aggregate?.caseV2.reviewRules?.find((rule) => rule.id === check.ruleId)?.title ?? '当前审核规则'} · {check.reason}</p>}
                      {distinctSources.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">
                        {(['rule', 'application', 'evidence'] as const).map((purpose) => {
                          const ref = distinctSources.find((candidate) => {
                            const role = aggregate?.caseV2.documents.find((document) => document.versionId === candidate.documentVersionId)?.role
                            return purpose === 'rule' ? role === 'rule' : purpose === 'application' ? role === 'application' : role === 'evidence' || role === 'attachment'
                          })
                          if (!ref) return null
                          return <button key={purpose} type="button" onClick={() => focusSource(ref)} className="rounded border px-2 py-1 text-[11px]">查看{purpose === 'rule' ? '规则' : purpose === 'application' ? '申报' : '证明'}</button>
                        })}
                      </div>}
                      {item.kind === 'check' && check && !runStale && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button disabled={busyKey !== null} onClick={() => handleDisposition(check, 'confirmed-issue')} className="rounded bg-primary px-2 py-1.5 text-[11px] text-primary-foreground disabled:opacity-50">确认问题</button>
                          <button disabled={busyKey !== null} onClick={() => handleDisposition(check, 'false-positive')} className="rounded border px-2 py-1.5 text-[11px] disabled:opacity-50">AI 误报</button>
                          {check.target.subjectIds[0] && <button disabled={busyKey !== null} onClick={() => setAdjudicationEditorSubject(check.target.subjectIds[0]!)} className="rounded border px-2 py-1.5 text-[11px] disabled:opacity-50">修改认定</button>}
                          <button disabled={busyKey !== null} onClick={() => handleSupplement(check)} className="rounded border px-2 py-1.5 text-[11px] disabled:opacity-50">要求补件</button>
                        </div>
                      )}
                      {item.kind === 'adjudication' && item.subjectId && (run && !runStale
                        ? <button type="button" onClick={() => setAdjudicationEditorSubject(item.subjectId!)} className="mt-2 rounded border px-2 py-1.5 text-[11px]">前往认定</button>
                        : <p className="mt-2 text-[11px] text-muted-foreground">完成当前审核运行后才能记录事项认定。</p>)}
                      {item.kind === 'material-slot' && run && !runStale && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button disabled={busyKey !== null} onClick={() => setDialog({ title: '要求补件', fields: [
                            { key: 'required', label: '需要补充', defaultValue: item.title.replace(/^缺少证明材料：/, ''), multiline: true },
                            { key: 'reason', label: '补件原因', placeholder: '说明缺少这份材料的原因', multiline: true },
                          ], submit: async ({ required, reason }) => perform(`supplement:${item.key}`, () => workspaceActions.openSupplement({ findingKey: item.key, requiredElements: required!.split(/[，,、\n]/).map((value) => value.trim()).filter(Boolean), reason: reason!.trim() })) })} className="rounded border px-2 py-1.5 text-[11px] disabled:opacity-50">要求补件</button>
                        </div>
                      )}
                      {(item.kind === 'fact' || item.kind === 'evidence') && <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">请在中栏对应申报事项或证明材料卡片中确认、修正或关联。</p>}
                      {item.kind === 'material' && item.sourceDocumentVersionIds?.[0] && <MaterialActions documentVersionId={item.sourceDocumentVersionIds[0]} busy={busyKey !== null} onAcknowledge={(action) => setDialog({ title: action === 'read' ? '确认材料已核对' : '忽略这份材料', fields: [{ key: 'reason', label: action === 'read' ? '核对说明' : '忽略原因', defaultValue: action === 'read' ? '已人工打开并检查材料内容' : '', placeholder: '请简要说明', multiline: true }], submit: async ({ reason }) => perform(`material:${item.sourceDocumentVersionIds![0]}`, () => workspaceActions.acknowledgeMaterial({ documentVersionId: item.sourceDocumentVersionIds![0]!, action, reason: reason!.trim() })) })} />}
                      {item.kind === 'supplement' && !item.checkId && <SupplementActions supplement={aggregate?.supplements.find((candidate) => item.key === `supplement:${candidate.id}`)} busy={busyKey !== null} perform={perform} actions={workspaceActions} />}
                      {activeSupplement && <SupplementActions supplement={activeSupplement} busy={busyKey !== null} perform={perform} actions={workspaceActions} />}
                    </article>
                    </React.Fragment>
                  )
                })}
              </div>
            )}
          </section>

          {run.opinions.length > 0 && (
            <section className="shrink-0 px-3 pt-3">
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">审核建议</p>
              <div className="space-y-1.5">
                {run.opinions.map((opinion, index) => {
                  const value = opinion as unknown as Record<string, unknown>
                  return <p key={String(value.id ?? index)} className="rounded-lg bg-muted/40 px-3 py-2 text-xs leading-5">{String(value.title ?? value.text ?? value.detail ?? '已完成审核分析')}</p>
                })}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">由 AI 根据当前材料和审核依据生成，仅供审核参考。</p>
            </section>
          )}

          {view && view.resolvedActions.length > 0 && (
            <details className="mx-3 mt-3 rounded-lg border border-border/60 bg-card px-3 py-2">
              <summary className="cursor-pointer text-xs font-medium">已处理 {view.resolvedActions.length}</summary>
              <div className="mt-2 space-y-1.5">
                {view.resolvedActions.map((item) => <p key={item.key} className="rounded bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">{item.title} · {item.detail}</p>)}
              </div>
            </details>
          )}

          <section className="shrink-0 px-3 py-3">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">最终决定</p>
            {aggregate?.decisions.at(-1) && <p className="mb-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">当前：{decisionLabel(aggregate.decisions.at(-1)!.result)} · {aggregate.decisions.at(-1)!.reason}</p>}
            {aggregate && run && <p className="mb-2 rounded-lg border bg-muted/30 px-3 py-2 text-[11px] leading-5">审核汇总：{decisionSummary(aggregate, run.id, run.inputManifest.hash)}</p>}
            {aggregate?.caseV2.stage === 'decided' ? (
              <p className="rounded-lg border border-green-500/30 bg-green-500/[0.06] px-3 py-2 text-xs text-green-700 dark:text-green-400">案卷已完成最终决定。决定人：{aggregate.decisions.at(-1)?.actor.actorId ?? '审核员'}</p>
            ) : (
              <>
                {!view?.decisionReadiness.ready && <div className="mb-2 rounded-lg border bg-card px-3 py-2">
                  <p className="text-xs font-semibold">最终决定前 · 还需完成 {view?.decisionReadiness.blockers.length ?? 0} 项</p>
                  <div className="mt-1.5 space-y-1">
                    {view?.decisionReadiness.blockers.map((blocker, index) => <button key={`${blocker.kind}:${blocker.id ?? index}`} type="button" onClick={() => {
                      if (blocker.kind === 'missing-adjudication' && blocker.id) {
                        setActivePane('center')
                        setAdjudicationEditorSubject(blocker.id)
                        requestAnimationFrame(() => document.getElementById(`review-subject-${encodeURIComponent(blocker.id!)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
                      } else if (blocker.kind === 'unconfirmed-fact' && blocker.id) {
                        const subjectId = blocker.id.split('::')[0]
                        setActivePane('center')
                        if (subjectId) requestAnimationFrame(() => document.getElementById(`review-subject-${encodeURIComponent(subjectId)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
                      } else if (blocker.kind === 'missing-material-slot' || blocker.kind === 'unread-material' || blocker.kind === 'candidate-evidence') {
                        setActivePane('center')
                        requestAnimationFrame(() => document.getElementById('review-evidence-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
                      } else if (blocker.id) {
                        setActivePane('right')
                        requestAnimationFrame(() => document.querySelector(`[data-review-pending-key="${CSS.escape(`check:${blocker.id}`)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
                      }
                    }} className="block w-full rounded px-1 py-1 text-left text-[11px] leading-4 text-muted-foreground hover:bg-muted hover:text-foreground">○ {readinessBlockerLabel(blocker, aggregate, template)}</button>)}
                  </div>
                </div>}
                <div className="grid grid-cols-2 gap-1.5">
                  <button disabled={!view?.canDecide || busyKey !== null} onClick={() => handleDecision('pass')} className="rounded bg-primary px-2 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40">通过</button>
                  <button disabled={!view?.canDecide || busyKey !== null} onClick={() => handleDecision('partial-pass')} className="rounded border px-2 py-2 text-xs font-medium disabled:opacity-40">部分通过</button>
                  <button disabled={busyKey !== null || !run || runStale} onClick={() => handleDecision('return')} className="rounded border px-2 py-2 text-xs font-medium disabled:opacity-40">退回补件</button>
                  <button disabled={!view?.canDecide || busyKey !== null} onClick={() => handleDecision('reject')} className="rounded border border-destructive/30 px-2 py-2 text-xs font-medium text-destructive disabled:opacity-40">驳回</button>
                </div>
              </>
            )}
          </section>

          {aggregate && <details className="mx-3 mb-3 rounded-lg border border-border/60 bg-card px-3 py-2"><summary className="cursor-pointer text-xs font-medium">审核记录 · {aggregate.receiptLog.length}</summary><div className="mt-2 max-h-60 overflow-y-auto"><CaseTimelinePanel caseId={aggregate.caseV2.id} refreshNonce={historyNonce} /></div></details>}
        </>
      )}
      {dialog && <ReviewActionDialog title={dialog.title} description={dialog.description} fields={dialog.fields} onClose={() => setDialog(null)} onSubmit={dialog.submit} />}
    </div>
  )
}

function SupplementActions({
  supplement,
  busy,
  perform,
  actions,
}: {
  supplement?: import('@profer/shared').SupplementRequest
  busy: boolean
  perform(key: string, action: () => Promise<void>): Promise<void>
  actions: ReturnType<typeof useReviewWorkspaceActions>
}): React.ReactElement | null {
  if (!supplement) return null
  return (
    <div className="mt-2 rounded-lg bg-amber-500/[0.06] p-2">
      <p className="text-[11px]">补件要求：{supplement.requiredElements.join('、')}</p>
      {supplement.status === 'open' || supplement.status === 'insufficient' ? (
        <p className="mt-1 text-[10px] text-muted-foreground">请先从左侧导入补充证明材料，然后登记补件回复。</p>
      ) : null}
      <div className="mt-1.5 flex gap-1.5">
        {(supplement.status === 'open' || supplement.status === 'insufficient') && <button disabled={busy} onClick={() => void perform(`reply:${supplement.id}`, () => actions.respondSupplement(supplement.id))} className="rounded border px-2 py-1 text-[11px] disabled:opacity-50">登记已补交</button>}
        {supplement.status === 'responded' && <button disabled={busy} onClick={() => void perform(`resolve:${supplement.id}`, () => actions.resolveSupplement(supplement.id))} className="rounded border px-2 py-1 text-[11px] disabled:opacity-50">核验满足要求</button>}
      </div>
    </div>
  )
}

function MaterialActions({
  documentVersionId,
  busy,
  onAcknowledge,
}: {
  documentVersionId: string
  busy: boolean
  onAcknowledge(action: 'read' | 'ignore'): void
}): React.ReactElement {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <button disabled={busy} onClick={() => onAcknowledge('read')} className="rounded border px-2 py-1 text-[11px] disabled:opacity-50">确认材料已核对</button>
      <button disabled={busy} onClick={() => onAcknowledge('ignore')} className="rounded border px-2 py-1 text-[11px] disabled:opacity-50">忽略材料</button>
    </div>
  )
}

function readinessBlockerLabel(blocker: NonNullable<ReturnType<typeof buildReviewWorkspaceViewModel>>['decisionReadiness']['blockers'][number], aggregate: CaseAggregateV2 | null, template: import('@profer/shared').TemplateVersion | null): string {
  if (blocker.kind === 'unconfirmed-fact' && blocker.id) {
    const [subjectId, fieldKey] = blocker.id.split('::')
    const subject = aggregate?.caseV2.subjects.find((item) => item.id === subjectId)
    const label = template?.fields.find((field) => field.key === fieldKey)?.label ?? ({ level: '获奖等级', declaredScore: '申报分值', score: '申报分值', activityDate: '活动日期', organizer: '主办单位', category: '事项类别' } as Record<string, string>)[fieldKey ?? ''] ?? '材料识别结果'
    return `${subject?.title ?? '申报事项'} · ${label}待核实`
  }
  return blocker.message
}

function decisionLabel(result: string): string {
  return ({ pass: '通过', 'partial-pass': '部分通过', return: '退回补件', reject: '驳回', withdraw: '撤回' } as Record<string, string>)[result] ?? result
}

function decisionSummary(aggregate: CaseAggregateV2, runId: string, inputHash: string): string {
  const subjects = aggregate.caseV2.subjects
  const scoreOf = (fields: Record<string, import('@profer/shared').FieldValue> | undefined): number => {
    const value = fields?.declaredScore ?? fields?.score
    return value?.kind === 'number' && Number.isFinite(value.value) ? value.value : 0
  }
  const currentRecords = aggregate.adjudications ?? []
  const superseded = new Set(currentRecords.flatMap((record) => record.supersedesAdjudicationId ? [record.supersedesAdjudicationId] : []))
  const current = currentRecords.filter((record) => !superseded.has(record.id) && record.basedOnRunId === runId && record.inputHash === inputHash)
  const bySubject = new Map(current.map((record) => [record.subjectId, record]))
  const accepted = current.filter((record) => record.outcome === 'accepted').length
  const modified = current.filter((record) => record.outcome === 'modified').length
  const rejected = current.filter((record) => record.outcome === 'rejected').length
  const finalScore = subjects.reduce((sum, subject) => {
    const adjudication = bySubject.get(subject.id)
    if (!adjudication) return sum
    const manualScore = aggregate.observations.filter((observation) => observation.subjectId === subject.id && observation.fieldKey === 'declaredScore' && observation.extractedBy === 'user' && observation.confirmed).sort((left, right) => left.createdAt.localeCompare(right.createdAt)).at(-1)?.value
    const fields = { ...subject.fields, ...(manualScore ? { declaredScore: manualScore } : {}), ...adjudication.finalFields }
    return sum + (adjudication.outcome === 'rejected' ? 0 : scoreOf(fields))
  }, 0)
  return `申报 ${subjects.length} 项 · 原申报总分 ${subjects.reduce((sum, subject) => sum + scoreOf(subject.fields), 0)} · 认可 ${accepted} · 修改 ${modified} · 不予 ${rejected} · 最终总分 ${finalScore} · 待认定 ${Math.max(0, subjects.length - current.length)}`
}
