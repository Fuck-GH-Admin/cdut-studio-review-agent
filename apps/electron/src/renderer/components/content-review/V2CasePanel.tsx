/**
 * V2 案卷原子与面板（N1d，05 §5.1 第 3 条：V2 命令可操作入口）
 *
 * Jotai 状态：当前 V2 聚合（按 caseId 缓存）+ 动作回调；组件只做展示与触发命令，
 * 不散落 IPC 调用（仓库四层约定）。U01 部分走通：seed 样例 → 创建案卷 → 改字段 → 重启保留。
 */

import { atom, useAtomValue, useStore, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import type { Actor, CaseAggregateV2, ReviewCommandResult } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'

/** 当前 V2 聚合（单案；N3 扩展为按案映射） */
export const reviewV2AggregateAtom = atom<CaseAggregateV2 | null>(null)
export const reviewV2BusyAtom = atom(false)
export const reviewV2NoticeAtom = atom<string | null>(null)

const localActor: Actor = { actorId: 'local-user', actorSource: 'local', role: 'reviewer' }

/** V2 命令面板：演示样例种子 → 创建案卷 → 更新字段（07 §3.2 首批命令的 UI 面） */
export function V2CasePanel(): JSX.Element {
  const store = useStore()
  const aggregate = useAtomValue(reviewV2AggregateAtom)
  const setNotice = useSetAtom(reviewV2NoticeAtom)

interface CaseListEntry { caseId: string; title: string; stage: string; revision: number; templateId: string; templateVersion: number; updatedAt: string }

  const [caseList, setCaseList] = useState<CaseListEntry[]>([])

  const refreshList = useCallback(async (): Promise<void> => {
    try {
      setCaseList(await window.reviewAPI.listCasesV2())
    } catch (error) {
      console.error('[V2] 案卷列表加载失败', error)
    }
  }, [])
  useEffect(() => { void refreshList() }, [refreshList])

  const run = useCallback(async (action: () => Promise<void>): Promise<void> => {
    store.set(reviewV2BusyAtom, true)
    try {
      await action()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setNotice(message)
      toast.error(`操作失败：${message}`)
    } finally {
      store.set(reviewV2BusyAtom, false)
    }
  }, [store, setNotice, toast])

  const applyResult = useCallback((result: ReviewCommandResult | undefined): void => {
    if (!result) return
    if (result.ok) {
      store.set(reviewV2AggregateAtom, result.aggregate)
      toast.success(`已保存：${result.receipt.summary}`)
    } else {
      // 冲突/校验错误如实呈现（不静默重试，07 §3.1）
      setNotice(`${result.code}: ${result.message}`)
      toast.error(`${result.code}：${result.message}`)
    }
  }, [store, setNotice, toast])

  const openCase = useCallback((caseId: string) => run(async () => {
    const loaded = await window.reviewAPI.openAggregateV2(caseId)
    if (!loaded) { toast.error(`案卷不存在: ${caseId}`); return }
    store.set(reviewV2AggregateAtom, loaded)
    toast.success(`已打开案卷：${loaded.caseV2.title}`)
  }), [run, store])

  const seedAndCreate = useCallback(() => run(async () => {
    await window.reviewAPI.seedFixtureV2()
    const caseId = `v2-demo-${Date.now().toString(36)}`
    const result = await window.reviewAPI.createCaseV2({
      caseId,
      templateId: 'comprehensive-assessment-v2',
      version: 2,
      payload: {
        title: 'V2 演示案卷（综测样例）',
        fieldValues: { studentName: '张三', studentId: '20260101', academicYear: '2025-2026', applicant: '张三' },
        subjects: [{ id: 's1', title: '省级竞赛一等奖', type: 'item', fieldValues: { category: 'competition', level: 'national-1', declaredScore: 8, eventId: 'E1' } }],
      },
      actor: localActor,
    })
    const aggregate = await window.reviewAPI.getAggregateV2(caseId)
    store.set(reviewV2AggregateAtom, aggregate ?? null)
    await refreshList()
    if (result) toast.success(`V2 案卷已创建：${caseId}`)
  }), [run, store, toast, refreshList])

  const current = aggregate
  const updateTitle = useCallback(() => {
    if (!current) return
    return run(async () => {
      const result = await window.reviewAPI.updateFieldsV2({
        caseId: current.caseV2.id,
        command: {
          requestId: `upd-${Date.now().toString(36)}`,
          target: { kind: 'case', id: current.caseV2.id },
          expectedRevision: current.caseV2.revision,
          actor: localActor,
          type: 'UpdateFields',
          payload: { caseFieldValues: { studentName: `张三-${Math.floor(Math.random() * 90) + 10}` } },
        },
      })
      applyResult(result)
    })
  }, [current, run, applyResult])

  return (
    <div className="mx-3 mb-3 rounded-xl border bg-card p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold">V2 案卷（通用审核）</p>
      {caseList.length > 0 && (
        <div className="mb-2 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">已保存案卷（重启可恢复）</p>
          {caseList.map((entry: CaseListEntry) => (
            <div key={entry.caseId} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
              <span className="truncate text-xs">{entry.title} · {entry.stage} · r{entry.revision}</span>
              <Button size="sm" variant="outline" onClick={() => void openCase(entry.caseId)}>打开</Button>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {!current && (
          <Button size="sm" disabled={store.get(reviewV2BusyAtom)} onClick={seedAndCreate}>
            载入综测样例并创建 V2 案卷
          </Button>
        )}
        {current && (
          <div className="space-y-1.5 text-xs">
            <BusinessFlowSection aggregate={current} onResult={applyResult} />
            <p className="font-medium">{current.caseV2.title}</p>
            <p className="text-muted-foreground">
              阶段 {current.caseV2.stage} · revision {current.caseV2.revision} · 回执 {current.receiptLog.length} 条
            </p>
            <div className="flex items-center gap-1.5">
              <input id="v2-student-name" className="h-7 w-32 rounded-md border bg-background px-2 text-xs" placeholder="学生姓名" defaultValue={String((current.caseV2.caseFields.studentName as { value?: string })?.value ?? '')} />
              <Button size="sm" variant="outline" onClick={() => {
                const input = document.getElementById('v2-student-name') as HTMLInputElement | null
                if (!input?.value) return
                void run(async () => {
                  const result = await window.reviewAPI.updateFieldsV2({
                    caseId: current.caseV2.id,
                    command: {
                      requestId: `upd-${Date.now().toString(36)}`,
                      target: { kind: 'case', id: current.caseV2.id },
                      expectedRevision: current.caseV2.revision,
                      actor: localActor,
                      type: 'UpdateFields',
                      payload: { caseFieldValues: { studentName: input.value } },
                    },
                  })
                  applyResult(result)
                })
              }}>保存姓名</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** 业务流程操作区（N3b，06 §5.2 动作表；U03-U05 入口） */
function BusinessFlowSection({ aggregate, onResult }: { aggregate: CaseAggregateV2; onResult: (result: ReviewCommandResult | undefined) => void }): JSX.Element {
  const openTasks = aggregate.tasks.filter((task) => task.status === 'open')
  const projection = resolveFinalDecisionProjectionPublic(aggregate.decisions)
  const templateId = aggregate.caseV2.templateId
  const version = aggregate.caseV2.templateVersion
  const caseId = aggregate.caseV2.id

  const act = async (action: string, extra: Record<string, unknown>): Promise<void> => {
    const task = openTasks[0]
    if (!task) {
      return
    }
    const result = await window.reviewAPI.recordStageDecisionV2({
      caseId,
      templateId,
      version,
      command: { requestId: `dec-${Date.now().toString(36)}`, target: { kind: 'case', id: caseId }, expectedRevision: aggregate.caseV2.revision, actor: localActor, type: 'RecordStageDecision', payload: { action, taskId: task.id, reason: String((extra as { reason?: string }).reason ?? '面板操作'), ...extra } },
    })
    onResult(result)
  }

  return (
    <div className="rounded-lg border-t pt-2">
      <p className="mb-1 font-medium">业务流程（{templateId}@{version}）</p>
      <p className="text-muted-foreground">
        开放任务：{openTasks.length > 0 ? openTasks.map((task) => `${task.stageId}(R${task.round})`).join('、') : '无'}
        {' · '}最终决定：{projection.decision ? `${projection.decision.result}${projection.isFinal ? '（终审）' : '（阶段）'}` : '未形成'}
      </p>
      {openTasks.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Button size="sm" variant="outline" onClick={() => void act('stage-pass', { reason: `${openTasks[0]?.stageId ?? ''} 通过` })}>阶段通过</Button>
          <Button size="sm" variant="outline" onClick={() => void act('return-for-supplement', { reason: '缺证明', supplementRequiredElements: ['等级', '日期'], supplementReason: '请补交含等级与日期的证明' })}>退回补件</Button>
          <Button size="sm" variant="outline" onClick={() => void act('final-reject', { reason: '不符合规定' })}>最终驳回</Button>
          <Button size="sm" variant="outline" onClick={() => void act('withdraw', { reason: '提交者撤回' })}>撤回</Button>
        </div>
      )}
      {aggregate.supplements.filter((request) => request.status === 'open' || request.status === 'responded').length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground">补件：</span>
          {aggregate.supplements.filter((request) => request.status === 'open' || request.status === 'responded').map((request) => (
            <span key={request.id} className="inline-flex items-center gap-1">
              <code className="rounded bg-muted px-1">{request.id.slice(0, 10)}</code>
              <Button size="sm" variant="outline" onClick={() => {
                void window.reviewAPI.resolveSupplementV2({
                  caseId,
                  command: { requestId: `sup-${Date.now().toString(36)}`, target: { kind: 'case', id: caseId }, expectedRevision: aggregate.caseV2.revision, actor: localActor, type: 'ResolveSupplement', payload: { supplementId: request.id, outcome: 'satisfied', reason: '要素齐全' } },
                }).then(onResult)
              }}>判定满足</Button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** 投影纯函数的前端引用（服务层同源逻辑：finality 优先 + 更正排除） */
function resolveFinalDecisionProjectionPublic(decisions: Array<{ id: string; result: string; finality?: string; amendsDecisionId?: string; at: string }>): { decision: { id: string; result: string } | null; isFinal: boolean } {
  const superseded = decisions.filter((decision) => decision.amendsDecisionId).map((decision) => decision.amendsDecisionId!)
  const effective = decisions.filter((decision) => !superseded.includes(decision.id))
  const final = [...effective].filter((decision) => decision.finality === 'final').sort((a, b) => a.at.localeCompare(b.at)).at(-1)
  if (final) return { decision: final, isFinal: true }
  return { decision: [...effective].sort((a, b) => a.at.localeCompare(b.at)).at(-1) ?? null, isFinal: false }
}
