import * as React from 'react'
import { useAtomValue } from 'jotai'
import { ArrowRight, Clock3, FolderOpen, Plus } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { reviewCaseAtom, reviewCaseListAtom } from '@/atoms/review-atoms'
import type { ReviewCaseSummary } from '@profer/shared'
import type { ReviewActions } from './use-review-actions'
import { ReviewV3QuickIntake } from './ReviewV3QuickIntake'
import { ReviewTemplateCaseCreator } from './ReviewTemplateCaseCreator'

interface V2CaseSummary {
  caseId: string
  title: string
  stage: string
  revision: number
  templateId: string
  templateVersion: number
  updatedAt: string
}
interface CaseHomeRow {
  id: string
  title: string
  applicant?: string
  academicYear?: string
  documentCount: number
  lastRunStatus?: string
  stage?: string
  updatedAt?: string
}

const STAGE_LABELS: Record<string, string> = {
  draft: '草稿',
  ready: '待审核',
  submitted: '待审核',
  reviewing: '审核中',
  'awaiting-supplement': '等待补件',
  'ready-for-decision': '待作决定',
  decided: '已完成决定',
  archived: '已归档',
}
const RUN_LABELS: Record<string, string> = {
  completed: '最近审核已完成',
  'partially-completed': '最近审核部分完成',
  running: '审核进行中',
  queued: '等待执行',
  failed: '最近审核未完成',
  'execution-failed': '最近审核执行失败',
}

function toRow(summary: ReviewCaseSummary, v2?: V2CaseSummary): CaseHomeRow {
  return {
    id: summary.id,
    title: summary.title,
    applicant: summary.applicant,
    academicYear: summary.academicYear,
    documentCount: summary.documentCount,
    lastRunStatus: summary.lastRunStatus,
    stage: v2?.stage,
    updatedAt: v2?.updatedAt ?? summary.updatedAt,
  }
}

/** 审核首页：保留快速导入，同时提供可见的案卷入口，不依赖“当前是否已经选中案卷”决定显示什么。 */
export function ReviewCaseHome({ actions, onOpenCase }: {
  actions: ReviewActions
  onOpenCase: (caseId: string) => Promise<void>
}): JSX.Element {
  const summaries = useAtomValue(reviewCaseListAtom)
  const currentCase = useAtomValue(reviewCaseAtom)
  const [v2Cases, setV2Cases] = React.useState<V2CaseSummary[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState('')

  const refresh = React.useCallback(async (): Promise<void> => {
    setLoading(true)
    setLoadError('')
    try {
      const [, v2] = await Promise.all([
        actions.refreshCaseList(),
        window.reviewAPI.listCasesV2(),
      ])
      setV2Cases(v2)
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }, [actions])

  React.useEffect(() => { void refresh() }, [refresh])

  const rows = React.useMemo(() => {
    const byId = new Map(v2Cases.map((item) => [item.caseId, item]))
    const merged: CaseHomeRow[] = summaries.map((summary) => toRow(summary, byId.get(summary.id)))
    const seen = new Set(merged.map((row) => row.id))
    for (const item of v2Cases) {
      if (seen.has(item.caseId)) continue
      merged.push({
        id: item.caseId,
        title: item.title,
        documentCount: 0,
        stage: item.stage,
        updatedAt: item.updatedAt,
      })
    }
    return merged.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
  }, [summaries, v2Cases])

  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 overflow-y-auto px-4 py-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">CDUT Studio · 审核</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">审核首页</h1>
        <p className="mt-1 text-sm text-muted-foreground">开始一项新审核，或继续处理已有案卷。打开新案卷不会覆盖其他案卷的历史记录。</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
        <Clock3 size={14} className="mr-1.5" />{loading ? '刷新中…' : '刷新案卷列表'}
      </Button>
    </header>

    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
      <section className="min-w-0 rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={17} className="text-primary" />
          <div>
            <h2 className="font-semibold">从材料开始</h2>
            <p className="text-xs text-muted-foreground">导入后会自动打开刚创建的案卷，继续匹配审核方案与处理结果。</p>
          </div>
        </div>
        <ReviewV3QuickIntake onCreated={onOpenCase} />
      </section>

      <section className="min-w-0 rounded-2xl bg-card p-4 shadow-sm">
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen size={17} className="text-primary" />
            <div>
              <h2 className="font-semibold">已有案卷</h2>
              <p className="text-xs text-muted-foreground">共 {rows.length} 份 · 选择后从上次状态继续</p>
            </div>
          </div>
        </header>
        {loadError && <p role="alert" className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{loadError}</p>}
        {rows.length === 0 && !loading
          ? <div className="rounded-xl bg-muted/40 px-4 py-8 text-center">
              <p className="font-medium">还没有案卷</p>
              <p className="mt-1 text-sm text-muted-foreground">导入材料即可开始；也可以在下方按已发布模板创建。</p>
            </div>
          : <div className="space-y-2">
              {rows.map((row) => {
                const current = currentCase?.id === row.id
                const stage = row.stage ? STAGE_LABELS[row.stage] ?? row.stage : undefined
                const run = row.lastRunStatus ? RUN_LABELS[row.lastRunStatus] ?? row.lastRunStatus : undefined
                return <article key={row.id} className={`rounded-xl p-3 transition-colors ${current ? 'bg-primary/[0.07] ring-1 ring-primary/25' : 'bg-muted/30 hover:bg-muted/55'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold" title={row.title}>{row.title}</h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{[row.applicant, row.academicYear].filter(Boolean).join(' · ') || '尚未填写申请主体'}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {stage && <span className="rounded-full bg-background px-2 py-0.5 text-[11px]">{stage}</span>}
                        <span className="rounded-full bg-background px-2 py-0.5 text-[11px]">{row.documentCount} 份材料</span>
                        {run && <span className="rounded-full bg-background px-2 py-0.5 text-[11px]">{run}</span>}
                      </div>
                    </div>
                    <Button type="button" size="sm" variant={current ? 'secondary' : 'default'} onClick={() => void onOpenCase(row.id)}>
                      {current ? '继续处理' : '打开案卷'} <ArrowRight size={13} className="ml-1" />
                    </Button>
                  </div>
                </article>
              })}
            </div>}
      </section>
    </div>

    <details className="rounded-2xl bg-card p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-medium">已有明确审核模板？按模板新建案卷</summary>
      <div className="mt-4"><ReviewTemplateCaseCreator onCreated={onOpenCase} /></div>
    </details>
  </div>
}
