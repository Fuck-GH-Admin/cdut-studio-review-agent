/**
 * 批次管理面板（N5b，06 §7.1；U09 入口）：创建批次（锁定已发布模板）→ 队列状态 → 定稿/重开
 */
import { useCallback, useState } from 'react'
import type { BatchStateV2, ReviewBatch } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'
import { useStore } from 'jotai'
import { reviewV2BusyAtom } from './V2CasePanel'

export function BatchPanel(): JSX.Element {
  const store = useStore()
  const [batchId, setBatchId] = useState('')
  const [state, setState] = useState<BatchStateV2 | null>(null)

  const run = useCallback(async (action: () => Promise<void>): Promise<void> => {
    store.set(reviewV2BusyAtom, true)
    try { await action() } catch (error) { toast.error(`批次操作失败：${error instanceof Error ? error.message : String(error)}`) } finally { store.set(reviewV2BusyAtom, false) }
  }, [store])

  const create = useCallback(() => run(async () => {
    const id = `batch-${Date.now().toString(36)}`
    const batch: ReviewBatch = { id, name: `批次 ${id}`, templateId: 'comprehensive-assessment-v2', templateVersion: 2, policyVersionLock: [{ policyVersionId: 'policy-comprehensive-assessment-demo', version: 1 }], caseIds: ['case-rt-1'], createdAt: new Date().toISOString() }
    const created = await window.reviewAPI.createBatchV2(batch)
    setBatchId(id)
    setState(created)
    toast.success(`批次已创建：${id}`)
  }), [run])

  const refresh = useCallback((id: string) => run(async () => { setState((await window.reviewAPI.getBatchV2(id)) ?? null) }), [run])

  return (
    <div className="mx-3 mb-3 rounded-xl border bg-card p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold">批次管理（锁定模板/政策版本）</p>
      {!state && <Button size="sm" onClick={() => void create()}>创建示例批次（综测 v2 × 1 案）</Button>}
      {state && (
        <div className="space-y-1.5 text-xs">
          <p className="font-medium">{state.batch.name} · 状态 {state.status} · 轮次 R{state.round}</p>
          <p className="text-muted-foreground">政策锁：{state.batch.policyVersionLock.map((lock) => `${lock.policyVersionId}@v${lock.version}`).join('、')}</p>
          <ul className="list-disc pl-4">
            {state.cases.map((entry) => (
              <li key={entry.caseId}>{entry.caseId} — {entry.status}{entry.error ? `（${entry.error}）` : ''}</li>
            ))}
          </ul>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => void refresh(batchId)}>刷新</Button>
            {state.status !== 'finalized' && (
              <Button size="sm" onClick={() => void run(async () => { setState(await window.reviewAPI.batchActionV2({ action: 'finalize', batchId, snapshot: { cases: state.cases } })); toast.success('批次已定稿（快照锁定）') })}>定稿</Button>
            )}
            {state.status === 'finalized' && (
              <Button size="sm" variant="outline" onClick={() => void run(async () => { setState(await window.reviewAPI.batchActionV2({ action: 'reopen', batchId, reason: '评分复核' })); toast.success('已重开新轮次（原定稿保留）') })}>重开新轮次</Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
