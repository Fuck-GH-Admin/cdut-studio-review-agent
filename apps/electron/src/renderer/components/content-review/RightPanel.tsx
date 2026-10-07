/** 右栏「待我处理」：V2 运行结果的审核员待办、补件和最终决定。 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { Gavel, Play, ShieldAlert } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { Spinner } from '@profer/ui/primitives/spinner'
import type { CheckResult } from '@profer/shared'
import {
  reviewCaseAtom,
  reviewRunningAtom,
  reviewExecutionAtom,
  reviewWorkspaceAggregateAtom,
  reviewWorkspaceExtractedObservationsAtom,
  reviewWorkspaceRunAtom,
  reviewWorkspaceRunStaleAtom,
} from '@/atoms/review-atoms'
import { cn } from '@/lib/utils'
import type { ReviewActions } from './use-review-actions'
import { CaseTimelinePanel } from './CaseTimelinePanel'
import { useReviewWorkspaceActions } from './use-review-workspace-actions'
import { buildReviewWorkspaceViewModel } from './review-workspace-view-model'

interface RightPanelProps { actions: ReviewActions }

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', ready: '可开始审核', reviewing: '审核中', 'needs-attention': '待人工处理',
  'waiting-supplement': '等待补件', 'ready-for-decision': '可作最终决定', decided: '已决定',
}

export function RightPanel({ actions }: RightPanelProps): React.ReactElement {
  const legacyCase = useAtomValue(reviewCaseAtom)
  const running = useAtomValue(reviewRunningAtom)
  const execution = useAtomValue(reviewExecutionAtom)
  const aggregate = useAtomValue(reviewWorkspaceAggregateAtom)
  const run = useAtomValue(reviewWorkspaceRunAtom)
  const runStale = useAtomValue(reviewWorkspaceRunStaleAtom)
  const extractedObservations = useAtomValue(reviewWorkspaceExtractedObservationsAtom)
  const workspaceActions = useReviewWorkspaceActions()
  const view = aggregate ? buildReviewWorkspaceViewModel(aggregate, run, runStale, extractedObservations) : null
  const [busyKey, setBusyKey] = React.useState<string | null>(null)
  const [reason, setReason] = React.useState('')
  const [notice, setNotice] = React.useState<string | null>(null)
  const [historyNonce, setHistoryNonce] = React.useState(0)
  const canRun = !!legacyCase

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
    const explanation = window.prompt(disposition === 'false-positive' ? '请说明为什么这是 AI 误报' : '处理理由', defaultReason)
    if (explanation === null || !explanation.trim()) return
    void perform(`check:${check.checkId}`, () => workspaceActions.recordDisposition({ findingKey: check.checkId, disposition, reason: explanation.trim() }))
  }

  const handleSupplement = (check: CheckResult): void => {
    const required = window.prompt('需要补充哪些材料或信息？', check.reason)
    if (!required?.trim()) return
    const explanation = window.prompt('为什么需要补件？', check.reason)
    if (!explanation?.trim()) return
    void perform(`supplement:${check.checkId}`, () => workspaceActions.openSupplement({ findingKey: check.checkId, requiredElements: required.split(/[，,、]/).map((item) => item.trim()).filter(Boolean), reason: explanation.trim() }))
  }

  const handleDecision = (result: 'pass' | 'partial-pass' | 'return' | 'reject'): void => {
    if (!reason.trim()) { setNotice('请先填写最终决定理由'); return }
    if (result === 'return') {
      const required = window.prompt('退回补件要求（必填）')
      if (!required?.trim()) return
      const supplementReason = window.prompt('补件原因（必填）', reason)
      if (!supplementReason?.trim()) return
      void perform('decision', () => workspaceActions.decide({ result, reason: reason.trim(), requiredElements: required.split(/[，,、]/).map((item) => item.trim()).filter(Boolean), supplementReason: supplementReason.trim() }))
    } else {
      void perform('decision', () => workspaceActions.decide({ result, reason: reason.trim() }))
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2"><Gavel size={16} className="text-primary" /><h2 className="text-[13px] font-semibold text-foreground">待我处理</h2></div>
        <p className="mt-1 text-xs text-muted-foreground">
          {view ? `${STATUS_LABELS[view.status]} · 待处理 ${view.pendingActions.length}` : '先选择审核任务'}
        </p>
      </header>

      <section className="shrink-0 px-3 pt-3">
        <Button type="button" className="h-9 w-full gap-2 text-[13px]" disabled={running || !canRun} onClick={() => void actions.runFullReview()}>
          {running ? <Spinner size="sm" /> : <Play size={14} />}
          {running || execution.status === 'preparing' ? '审核中…' : run ? '重新审核' : '开始审核'}
        </Button>
        {!canRun && <p className="mt-2 text-xs text-muted-foreground">请先新建或选择审核任务。</p>}
      </section>

      {execution.status !== 'idle' && (
        <section className={cn('mx-3 mt-3 rounded-lg px-3 py-2 text-xs', execution.status === 'failed' ? 'border border-destructive/40 bg-destructive/[0.06]' : execution.status === 'partial' || execution.status === 'awaiting-input' ? 'border border-amber-500/40 bg-amber-500/[0.06]' : 'bg-muted/40')}>
          <p className="font-medium">{execution.message ?? '审核处理中'}</p>
          {execution.checks && <p className="mt-1 text-muted-foreground">规则检查 {execution.checks.completed} / {execution.checks.total}</p>}
          {execution.error && <p className="mt-1 text-destructive">{execution.error}</p>}
        </section>
      )}
      {notice && <p role="alert" className="mx-3 mt-3 rounded-lg border border-destructive/40 bg-destructive/[0.06] px-3 py-2 text-xs text-destructive">{notice}</p>}
      {runStale && run && <p className="mx-3 mt-3 rounded-lg border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-700 dark:text-amber-300">案卷材料、事实或证明关联在本次运行后发生变化；当前结果只作历史参考，请重新审核。</p>}

      {!run ? (
        <div className="mx-3 mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-8 text-center">
          <ShieldAlert size={26} className="text-muted-foreground/60" />
          <p className="text-sm font-medium">尚无 V2 审核结果</p>
          <p className="text-xs leading-5 text-muted-foreground">点击开始审核，系统会按当前案卷映射执行规则检查并保存运行记录。</p>
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
                {view.pendingActions.map((item) => {
                  const check = item.checkId ? run.checks.find((candidate) => candidate.checkId === item.checkId) : undefined
                  const sourceNames = (item.sourceDocumentVersionIds ?? []).map((id) => aggregate?.caseV2.documents.find((doc) => doc.versionId === id)?.fileName ?? id)
                  const activeSupplement = item.checkId ? aggregate?.supplements.find((supplement) => supplement.originFindingKeys.includes(item.checkId!)) : undefined
                  return (
                    <article key={item.key} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                      <p className="text-[13px] font-medium">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                      {sourceNames.length > 0 && <p className="mt-1 text-[11px] text-muted-foreground">来源：{[...new Set(sourceNames)].join('、')}</p>}
                      {check && <p className="mt-1 rounded bg-muted/50 px-2 py-1 text-[11px]">规则依据：{check.ruleId} · {check.reason}</p>}
                      {item.kind === 'check' && check && !runStale && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button disabled={busyKey !== null} onClick={() => handleDisposition(check, 'confirmed-issue')} className="rounded bg-primary px-2 py-1.5 text-[11px] text-primary-foreground disabled:opacity-50">确认问题</button>
                          <button disabled={busyKey !== null} onClick={() => handleDisposition(check, 'false-positive')} className="rounded border px-2 py-1.5 text-[11px] disabled:opacity-50">AI 误报</button>
                          <button disabled={busyKey !== null} onClick={() => handleSupplement(check)} className="rounded border px-2 py-1.5 text-[11px] disabled:opacity-50">要求补件</button>
                        </div>
                      )}
                      {(item.kind === 'fact' || item.kind === 'evidence') && <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">请在中栏对应申报事项或证明材料卡片中确认、修正或关联。</p>}
                      {item.kind === 'material' && item.sourceDocumentVersionIds?.[0] && <MaterialActions documentVersionId={item.sourceDocumentVersionIds[0]} busy={busyKey !== null} perform={perform} actions={workspaceActions} />}
                      {item.kind === 'supplement' && !item.checkId && <SupplementActions supplement={aggregate?.supplements.find((candidate) => item.key === `supplement:${candidate.id}`)} busy={busyKey !== null} perform={perform} actions={workspaceActions} />}
                      {activeSupplement && <SupplementActions supplement={activeSupplement} busy={busyKey !== null} perform={perform} actions={workspaceActions} />}
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {run.opinions.length > 0 && (
            <section className="shrink-0 px-3 pt-3">
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">AI 审核意见</p>
              <div className="space-y-1.5">
                {run.opinions.map((opinion, index) => {
                  const value = opinion as unknown as Record<string, unknown>
                  return <p key={String(value.id ?? index)} className="rounded-lg bg-muted/40 px-3 py-2 text-xs leading-5">{String(value.title ?? value.text ?? value.detail ?? '已完成审核分析')}</p>
                })}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">AI 意见仅供参考，最终决定由审核员作出。</p>
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
            {aggregate?.caseV2.stage === 'decided' ? (
              <p className="rounded-lg border border-green-500/30 bg-green-500/[0.06] px-3 py-2 text-xs text-green-700 dark:text-green-400">案卷已完成最终决定。决定人：{aggregate.decisions.at(-1)?.actor.actorId ?? '审核员'}</p>
            ) : (
              <>
                {!view?.canDecide && <p className="mb-2 text-xs leading-5 text-muted-foreground">处理所有待办并重新审核后，才可作通过、部分通过或驳回决定。仍需补件时可使用“退回补件”。</p>}
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mb-2 min-h-16 w-full resize-y rounded-lg border bg-background px-2.5 py-2 text-xs" placeholder="填写最终决定理由（必填）" aria-label="最终决定理由" />
                <div className="grid grid-cols-2 gap-1.5">
                  <button disabled={!view?.canDecide || busyKey !== null || !reason.trim()} onClick={() => handleDecision('pass')} className="rounded bg-primary px-2 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40">通过</button>
                  <button disabled={!view?.canDecide || busyKey !== null || !reason.trim()} onClick={() => handleDecision('partial-pass')} className="rounded border px-2 py-2 text-xs font-medium disabled:opacity-40">部分通过</button>
                  <button disabled={busyKey !== null || !run || runStale || !reason.trim()} onClick={() => handleDecision('return')} className="rounded border px-2 py-2 text-xs font-medium disabled:opacity-40">退回补件</button>
                  <button disabled={!view?.canDecide || busyKey !== null || !reason.trim()} onClick={() => handleDecision('reject')} className="rounded border border-destructive/30 px-2 py-2 text-xs font-medium text-destructive disabled:opacity-40">驳回</button>
                </div>
              </>
            )}
          </section>

          {aggregate && <details className="mx-3 mb-3 rounded-lg border border-border/60 bg-card px-3 py-2"><summary className="cursor-pointer text-xs font-medium">审核记录 · {aggregate.receiptLog.length}</summary><div className="mt-2 max-h-60 overflow-y-auto"><CaseTimelinePanel caseId={aggregate.caseV2.id} refreshNonce={historyNonce} /></div></details>}
        </>
      )}
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
  perform,
  actions,
}: {
  documentVersionId: string
  busy: boolean
  perform(key: string, action: () => Promise<void>): Promise<void>
  actions: ReturnType<typeof useReviewWorkspaceActions>
}): React.ReactElement {
  const acknowledge = (action: 'read' | 'ignore'): void => {
    const defaultReason = action === 'ignore' ? '' : '审核员已人工打开并检查原始材料'
    const reason = window.prompt(action === 'ignore' ? '说明忽略该材料的原因' : '说明人工检查结果', defaultReason)
    if (!reason?.trim()) return
    void perform(`material:${documentVersionId}`, () => actions.acknowledgeMaterial({ documentVersionId, action, reason: reason.trim() }))
  }
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <button disabled={busy} onClick={() => acknowledge('read')} className="rounded border px-2 py-1 text-[11px] disabled:opacity-50">人工检查并纳入</button>
      <button disabled={busy} onClick={() => acknowledge('ignore')} className="rounded border px-2 py-1 text-[11px] disabled:opacity-50">忽略材料（需理由）</button>
    </div>
  )
}

function decisionLabel(result: string): string {
  return ({ pass: '通过', 'partial-pass': '部分通过', return: '退回补件', reject: '驳回', withdraw: '撤回' } as Record<string, string>)[result] ?? result
}
