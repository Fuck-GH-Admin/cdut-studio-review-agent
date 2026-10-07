/**
 * RightPanel — 右栏「审核结果」
 *
 * 结构：
 * - 头部：栏目名 + 引擎徽标（ai → "AI 审核"、mock-engine → "模拟引擎"）
 * - 「开始审核」大按钮（运行中 spinner + 禁用）
 * - 覆盖摘要卡：已审核 / 待人工复核 / 未识别文件 / 规则未覆盖 四个小格
 * - 问题卡列表（sortedFindingsAtom → FindingCard，点击 → focusFinding 联动）
 * - 未运行时的引导空态
 * - 「导出预审报告」按钮
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { Download, Gavel, Play, ShieldAlert } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { Spinner } from '@profer/ui/primitives/spinner'
import type { ReviewRun } from '@profer/shared'
import { reviewCaseAtom, reviewRunAtom, reviewRunningAtom, selectedFindingIdAtom, sortedFindingsAtom,
  reviewRunStaleAtom, reviewExecutionAtom,
} from '@/atoms/review-atoms'
import { cn } from '@/lib/utils'
import type { ReviewActions } from './use-review-actions'
import { FindingCard } from './FindingCard'

interface RightPanelProps {
  actions: ReviewActions
}

export function RightPanel({ actions }: RightPanelProps): React.ReactElement {
  const run = useAtomValue(reviewRunAtom)
  const runStale = useAtomValue(reviewRunStaleAtom)
  const running = useAtomValue(reviewRunningAtom)
  const execution = useAtomValue(reviewExecutionAtom)
  const findings = useAtomValue(sortedFindingsAtom)
  const selectedFindingId = useAtomValue(selectedFindingIdAtom)
  const reviewCase = useAtomValue(reviewCaseAtom)
  const canRun = !!reviewCase

  const [exporting, setExporting] = React.useState(false)
  const [exportNotice, setExportNotice] = React.useState<string | null>(null)

  // 提示定时器句柄：卸载时清理，避免切走视图后定时器仍存活（F15）
  const exportNoticeTimerRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    return () => {
      if (exportNoticeTimerRef.current !== null) window.clearTimeout(exportNoticeTimerRef.current)
    }
  }, [])

  const handleExport = async (): Promise<void> => {
    setExporting(true)
    try {
      const result = await actions.exportReport()
      if (result) {
        // 路径提示（简单行内提示，不引 toast 依赖）
        setExportNotice(`已导出：${result.markdownPath}`)
        if (exportNoticeTimerRef.current !== null) window.clearTimeout(exportNoticeTimerRef.current)
        exportNoticeTimerRef.current = window.setTimeout(() => setExportNotice(null), 6000)
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      {/* 头部：栏目名 + 引擎徽标 */}
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Gavel size={16} className="text-primary" />
          <h2 className="text-[13px] font-semibold text-foreground">审核结果</h2>
        </div>
      </header>

      {/* 开始审核 */}
      <section className="shrink-0 px-3 pt-3">
        <Button
          type="button"
          className="h-9 w-full gap-2 text-[13px]"
          disabled={running || !canRun}
          onClick={() => void actions.runFullReview()}
        >
          {running ? <Spinner size="sm" /> : <Play size={14} />}
          {running || execution.status === 'preparing' ? '审核中…' : run ? '重新审核' : '开始审核'}
        </Button>
        {!canRun && <p className="mt-2 text-xs leading-5 text-muted-foreground">请先新建或选择审核任务。</p>}
      </section>

      {execution.status !== 'idle' && (
        <section className={cn('mx-3 mt-3 rounded-lg px-3 py-2 text-xs', execution.status === 'failed' ? 'border border-destructive/40 bg-destructive/[0.06]' : execution.status === 'partial' || execution.status === 'awaiting-input' ? 'border border-amber-500/40 bg-amber-500/[0.06]' : 'bg-muted/40')}>
          <p className="font-medium">{execution.message ?? '审核处理中'}</p>
          {execution.documents && <p className="mt-1 text-muted-foreground">材料 {execution.documents.completed} / {execution.documents.total}</p>}
          {execution.error && <p className="mt-1 text-destructive">{execution.error}</p>}
        </section>
      )}

      {/* 输入过期提示（M0/H09）：材料/规则在审核后被改过，结果仅作历史参考 */}
      {run && runStale && (
        <section className="mx-3 rounded-lg border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            案卷在本次审核后已修改，以下结果已过期——请重审后再作为当前结论或导出报告。
          </p>
        </section>
      )}

      {/* 覆盖摘要（run.coverage → 四个小格） */}
      {run && <CoverageSummary run={run} />}

      {/* 未处理材料账本（M0/H01）：已登记但未纳入检查的文件，用户必须可见 */}
      {run && (run.coverage.unprocessedMaterials?.length ?? 0) > 0 && (
        <section className="mx-3 rounded-lg border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            未处理材料 {run.coverage.unprocessedMaterials!.length} 份（未纳入本次检查，"全部符合"结论不成立）
          </p>
          <ul className="mt-1 space-y-0.5">
            {run.coverage.unprocessedMaterials!.map((material) => (
              <li key={`${material.documentId}-${material.reason}`} className="text-[11px] leading-4 text-muted-foreground">
                「{material.fileName}」：{material.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 问题卡列表 / 空态 */}
      <section className="flex shrink-0 flex-col px-3 py-3">
        <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          问题卡
        </p>
        {!run ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
            <ShieldAlert size={28} className="text-muted-foreground/60" />
            <p className="text-[13px] font-medium text-foreground/80">尚未运行审核</p>
            <p className="max-w-[220px] text-xs leading-5 text-muted-foreground">
              点击上方「开始审核」，系统会自动准备材料、核对规则并生成可定位的问题卡。
            </p>
          </div>
        ) : run.status === 'failed' ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/[0.06] px-3 py-6 text-center">
            <p className="text-[13px] font-medium text-destructive">本次审核未能完成</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {run.error ?? '审核运行失败'}——不存在可用的审核结论，请重试或检查模型出口。
            </p>
          </div>
        ) : findings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">本次审核未发现问题。</p>
            {(run.coverage.unprocessedMaterials?.length ?? 0) > 0 && (
              <p className="mt-1 text-[11px] leading-4 text-amber-600 dark:text-amber-400">
                但存在未处理材料，覆盖不完整，"全部符合"结论暂不成立。
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {findings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                selected={finding.id === selectedFindingId}
                onClick={() => actions.focusFinding(finding)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 导出预审报告 */}
      <footer className="mt-auto shrink-0 border-t border-border/60 px-3 py-3">
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full gap-2 text-[13px]"
          disabled={exporting || running || !run || run.status !== 'completed' || runStale}
          onClick={() => void handleExport()}
        >
          {exporting ? <Spinner size="sm" /> : <Download size={14} />}
          {exporting ? '导出中…' : '导出预审报告'}
        </Button>
        {exportNotice && (
          <p className="mt-2 truncate rounded-md bg-green-500/10 px-2 py-1.5 text-[11px] text-green-600 dark:text-green-400" title={exportNotice}>
            {exportNotice}
          </p>
        )}
      </footer>
    </div>
  )
}

/** 覆盖摘要四格 */
function CoverageSummary({ run }: { run: ReviewRun }): React.ReactElement {
  const cells: Array<{ label: string; value: number; className: string }> = [
    { label: '已审核', value: run.coverage.reviewedItemIds.length, className: 'text-green-600 dark:text-green-400' },
    { label: '待人工复核', value: run.coverage.manualReviewItemIds.length, className: 'text-amber-600 dark:text-amber-400' },
    { label: '未识别文件', value: run.coverage.unrecognizedDocumentIds.length, className: 'text-muted-foreground' },
    { label: '规则未覆盖', value: run.coverage.ruleUncoveredItemIds.length, className: 'text-blue-600 dark:text-blue-400' },
  ]

  return (
    <section className="shrink-0 px-3 pt-3">
      <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        覆盖摘要
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {cells.map((cell) => (
          <div key={cell.label} className="flex flex-col items-center gap-0.5 rounded-lg bg-card p-2 shadow-sm">
            <span className={cn('text-sm font-semibold tabular-nums', cell.className)}>{cell.value}</span>
            <span className="text-center text-[10px] leading-3 text-muted-foreground">{cell.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
