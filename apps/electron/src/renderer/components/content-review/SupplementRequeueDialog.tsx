/** Manual one-batch requeue after an already satisfied supplement; never a school signature. */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BatchStateV2, CaseAggregateV2 } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@profer/ui/primitives/dialog'
import { reviewBusinessError } from './batch-ui-feedback'
import { getSupplementRequeueChoices } from './supplement-requeue-ui'

export function SupplementRequeueDialog({ caseId, title, onClose, onApplied }: {
  caseId: string
  title: string
  onClose: () => void
  onApplied: () => Promise<void>
}): JSX.Element {
  const [aggregate, setAggregate] = useState<CaseAggregateV2 | null>(null)
  const [batches, setBatches] = useState<BatchStateV2[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [targetBatchId, setTargetBatchId] = useState('')
  const [supplementId, setSupplementId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [current, states] = await Promise.all([
      window.reviewAPI.openAggregateV2(caseId), window.reviewAPI.listBatchesV2(),
    ])
    setAggregate(current ?? null)
    setBatches(states)
  }, [caseId])

  useEffect(() => {
    let mounted = true
    void Promise.all([window.reviewAPI.openAggregateV2(caseId), window.reviewAPI.listBatchesV2()])
      .then(([current, states]) => { if (mounted) { setAggregate(current ?? null); setBatches(states) } })
      .catch((cause) => { if (mounted) setError(reviewBusinessError(cause)) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [caseId])

  const snapshot = useMemo(
    () => getSupplementRequeueChoices(caseId, aggregate, batches),
    [caseId, aggregate, batches],
  )
  const target = snapshot.targets.find((choice) => choice.batchId === targetBatchId)
  const canConfirm = !busy && !loading && !result && !snapshot.readyReason
    && !!supplementId && snapshot.supplements.some((item) => item.id === supplementId)
    && !!target && !target.disabledReason && confirmed && snapshot.revision !== null

  const apply = async (): Promise<void> => {
    if (!canConfirm || !target || snapshot.revision === null) return
    setBusy(true)
    setError(null)
    try {
      // Re-read from Main immediately before submission, not a cached dialog render.
      const [current, latestBatches] = await Promise.all([
        window.reviewAPI.openAggregateV2(caseId), window.reviewAPI.listBatchesV2(),
      ])
      const fresh = getSupplementRequeueChoices(caseId, current, latestBatches)
      const stillEligible = fresh.revision === snapshot.revision && !fresh.readyReason
        && fresh.supplements.some((item) => item.id === supplementId)
        && fresh.targets.some((item) => item.batchId === targetBatchId && !item.disabledReason)
      if (!stillEligible) {
        setAggregate(current ?? null)
        setBatches(latestBatches)
        setConfirmed(false)
        throw new Error('案卷、补件或批次状态已经变化，请重新核对后确认')
      }
      // The Main process binds the local reviewer and validates revision,
      // origin task, template lock, queued/running/finalized and replay cursor.
      const saved = await window.reviewAPI.batchActionV2({
        action: 'requeue-supplement', caseId, batchId: targetBatchId,
        supplementId, expectedRevision: snapshot.revision, confirmed: true,
        // Main ignores this identity claim and rebinds the fixed local reviewer.
        actor: { actorId: 'local-reviewer', actorSource: 'local', role: 'reviewer' },
      })
      const entry = saved.cases.find((item) => item.caseId === caseId)
      if (entry?.status !== 'queued') throw new Error('主进程没有返回有效的待执行队列状态')
      setResult('已将本案加入“' + saved.batch.name + '”的待执行队列。其他批次未被选择，不代表校方已批准本案。')
      await onApplied()
    } catch (cause) {
      setError(reviewBusinessError(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>选择补件回流目标批次</DialogTitle>
          <DialogDescription>案卷：{title}。仅在补件已满足、重审任务仍开放时，将本案重新入队至一个明确选定的批次。</DialogDescription>
        </DialogHeader>
        {result ? (
          <p role="status" className="rounded-md bg-muted px-3 py-3 text-sm">{result}</p>
        ) : (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">当前案卷修订：{snapshot.revision ?? '—'}。历史批次和正在运行或已定稿的批次不会自动改动；此操作也不会代替人工正式审批。</p>
            {loading && <p role="status">正在从 Main 读取案卷、补件和批次…</p>}
            {!loading && snapshot.readyReason && (
              <p role="alert" className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">{snapshot.readyReason}</p>
            )}
            <label className="block space-y-1.5">
              <span className="font-medium">已核实满足的补件（必须选择）</span>
              <select aria-label="已满足的补件" className="h-9 w-full rounded-md border border-input bg-background px-3"
                value={supplementId} disabled={busy || !!snapshot.readyReason || loading}
                onChange={(event) => { setSupplementId(event.target.value); setConfirmed(false) }}>
                <option value="">请选择来源补件…</option>
                {snapshot.supplements.map((item) => (
                  <option key={item.id} value={item.id}>{item.label} · 来源阶段 {item.originStageId}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="font-medium">回流到一个批次（必须选择）</span>
              <select aria-label="补件目标批次" className="h-9 w-full rounded-md border border-input bg-background px-3"
                value={targetBatchId} disabled={busy || !!snapshot.readyReason || loading}
                onChange={(event) => { setTargetBatchId(event.target.value); setConfirmed(false) }}>
                <option value="">请选择一个真实目标批次…</option>
                {snapshot.targets.map((item) => (
                  <option key={item.batchId} value={item.batchId} disabled={!!item.disabledReason}>
                    {item.name} · {item.entryStatus} · {item.disabledReason ?? '可选择'}
                  </option>
                ))}
              </select>
            </label>
            {target && (
              <p className="text-xs text-muted-foreground">将修改：{target.name} 中本案的队列状态；其他历史或并行批次不受本次选择影响。</p>
            )}
            <label className="flex items-start gap-2 rounded-md border border-border p-3 text-xs">
              <input type="checkbox" checked={confirmed} disabled={busy || !supplementId || !targetBatchId || !!snapshot.readyReason || !!target?.disabledReason}
                onChange={(event) => setConfirmed(event.target.checked)} />
              <span>我已核对补件、开放任务与目标批次，明确确认只将本案重新加入选中批次，不推定其他批次或校方正式决定。</span>
            </label>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          {result ? (
            <Button type="button" onClick={onClose}>完成</Button>
          ) : (
            <>
              <Button type="button" variant="outline" disabled={busy} onClick={() => {
                setTargetBatchId(''); setSupplementId(''); setConfirmed(false); setError(null); setLoading(true)
                void load().catch((cause) => setError(reviewBusinessError(cause))).finally(() => setLoading(false))
              }}>刷新状态</Button>
              <Button type="button" variant="outline" disabled={busy} onClick={onClose}>取消</Button>
              <Button type="button" disabled={!canConfirm} onClick={() => void apply()}>
                {busy ? '正在校验并提交…' : '确认将本案回流至该批次'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
