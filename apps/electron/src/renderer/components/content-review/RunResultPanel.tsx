/**
 * 审核结果面板：展示最近一次真实运行的检查明细、结论和覆盖情况
 */
import { useCallback, useEffect, useState } from 'react'
import type { ReviewRunV2 } from '@profer/shared'
import { Button } from '@profer/ui/primitives/button'
import { toast } from 'sonner'

const STATUS_LABEL: Record<string, string> = {
  compliant: '符合', 'non-compliant': '不符合', 'needs-confirmation': '待确认', 'not-applicable': '不适用', 'not-executed': '未执行', 'execution-failed': '执行失败', 'awaiting-confirmation': '待确认', 'awaiting-supplement': '待补件',
}

export function RunResultPanel({ caseId, refreshNonce }: { caseId: string; refreshNonce: number }): JSX.Element {
  const [runs, setRuns] = useState<ReviewRunV2[]>([])
  const [expandedRun, setExpandedRun] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const load = useCallback(async (): Promise<void> => {
    try {
      const list = await window.reviewAPI.listRunsV2(caseId)
      setRuns(list ?? [])
      if (list && list.length > 0) setExpandedRun(list[0]!.id)
    } catch (error) {
      console.error('[审核] 运行列表加载失败', error)
    }
  }, [caseId])

  useEffect(() => { void load() }, [load, refreshNonce])

  /** 触发真实审核运行（RUN_REVIEW_V2 四层：真实渠道 + 真实执行器） */
  /** 导出报告：真实调用 EXPORT_REPORT_V2（公开反馈投影 + 检查结果落盘 MD） */
  const exportReport = useCallback(async (): Promise<void> => {
    try {
      const result = await window.reviewAPI.exportReportV2(caseId)
      toast.success(`报告已导出：${result.file}`)
    } catch (error) {
      toast.error(`导出失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }, [caseId])

  const startRun = useCallback(async (): Promise<void> => {
    setRunning(true)
    try {
      const run = await window.reviewAPI.runReviewV2(caseId)
      toast.success(`审核运行完成：${run.id}（检查 ${(run.checks ?? []).length} 项）`)
      await load()
    } catch (error) {
      toast.error(`审核运行失败：${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setRunning(false)
    }
  }, [caseId, load])

  return (
    <div className="space-y-1.5 rounded-lg border-t pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">审核结果（{runs.length} 次）</p>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" disabled={running} onClick={() => void startRun()}>{running ? '审核中…' : '开始审核'}</Button>
          <Button size="sm" variant="ghost" disabled={runs.length === 0} onClick={() => void exportReport()}>导出报告</Button>
          <Button size="sm" variant="ghost" onClick={() => void load()}>刷新</Button>
        </div>
      </div>
      {runs.length === 0 && <p className="text-xs text-muted-foreground">尚未开始审核。点击“开始自动审核”后，系统会读取当前材料和审核依据。</p>}
      {runs.slice(0, 3).map((run) => (
        <div key={run.id} className="rounded-md border p-2 text-xs">
          <button type="button" className="flex w-full items-center justify-between" onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}>
            <span className="font-medium">{run.id.slice(-12)} · {run.status}{run.completedAt ? ` · ${new Date(run.completedAt).toLocaleTimeString()}` : ''}</span>
            <span className="text-muted-foreground">检查 {run.checks.length} · 覆盖 {run.coverage.completedChecks}/{run.coverage.plannedChecks}</span>
          </button>
          {expandedRun === run.id && (
            <div className="mt-1.5 space-y-1">
              {run.checks.length === 0 && <p className="text-muted-foreground">本次运行未产生检查结果（核对规则来源与模型返回）</p>}
              {run.checks.map((check, index) => {
                const item = check as { ruleId: string; status: string; reason: string }
                return (
                  <div key={index} className="flex items-start justify-between gap-2 rounded bg-muted/40 px-1.5 py-1">
                    <span className="truncate">{item.ruleId}：{item.reason}</span>
                    <span className={item.status === 'compliant' ? 'text-emerald-600' : item.status === 'non-compliant' ? 'text-red-600' : 'text-amber-600'}>{STATUS_LABEL[item.status] ?? item.status}</span>
                  </div>
                )
              })}
              {run.opinions.length > 0 && <p className="rounded bg-muted/40 px-1.5 py-1">结论：{(run.opinions[0] as unknown as { text?: string }).text ?? '—'}</p>}
              {run.diagnostics.length > 0 && (
                <details className="text-muted-foreground">
                  <summary>诊断（{run.diagnostics.length}）</summary>
                  <ul className="list-disc pl-4">{run.diagnostics.map((line, index) => <li key={index}>{line}</li>)}</ul>
                </details>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
