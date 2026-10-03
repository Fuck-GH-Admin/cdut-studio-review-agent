/**
 * V2 案卷原子与面板（N1d，05 §5.1 第 3 条：V2 命令可操作入口）
 *
 * Jotai 状态：当前 V2 聚合（按 caseId 缓存）+ 动作回调；组件只做展示与触发命令，
 * 不散落 IPC 调用（仓库四层约定）。U01 部分走通：seed 样例 → 创建案卷 → 改字段 → 重启保留。
 */

import { atom, useAtomValue, useStore, useSetAtom } from 'jotai'
import { useCallback } from 'react'
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
    if (result) toast.success(`V2 案卷已创建：${caseId}`)
  }), [run, store, toast])

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
      <div className="space-y-2">
        {!current && (
          <Button size="sm" disabled={store.get(reviewV2BusyAtom)} onClick={seedAndCreate}>
            载入综测样例并创建 V2 案卷
          </Button>
        )}
        {current && (
          <div className="space-y-1.5 text-xs">
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
