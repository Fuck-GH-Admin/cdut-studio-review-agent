/** 批量审核：按批次查看项目进度；审核队列策略后续单独收敛。 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BatchStateV2, ReviewBatch, ReviewCaseSummary, TemplateVersion } from '@profer/shared'
import { AlertTriangle, CheckCircle2, Clock3, FileWarning, FolderOpen, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@profer/ui/primitives/dialog'
import { Input } from '@profer/ui/primitives/input'
import { Label } from '@profer/ui/primitives/label'
import { toast } from 'sonner'
import { useStore } from 'jotai'
import { reviewV2BusyAtom } from './V2CasePanel'

type CaseIndexItem = Awaited<ReturnType<typeof window.reviewAPI.listCasesV2>>[number]
type ReviewRunV2 = Awaited<ReturnType<typeof window.reviewAPI.listRunsV2>>[number]

interface BatchProjectRow {
  caseId: string
  title: string
  applicant: string
  updatedAt: string
  entryStatus: BatchStateV2['cases'][number]['status']
  stage?: CaseIndexItem['stage']
  run?: ReviewRunV2
}

interface BatchPanelProps {
  active: boolean
  onOpenProject: (caseId: string) => Promise<boolean>
}

const BATCH_STATUS_LABEL: Record<BatchStateV2['status'], string> = {
  draft: '草稿', queued: '待处理', running: '进行中', finalized: '已定稿', reopened: '已重开',
}

function formatTime(value: string | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function caseStatus(row: BatchProjectRow, batch: BatchStateV2): { label: string; tone: string } {
  if (row.stage === 'awaiting-supplement') return { label: '等待补件', tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' }
  if (row.stage === 'awaiting-review' || row.stage === 'awaiting-final') return { label: '需要人工处理', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' }
  if (row.entryStatus === 'running' || row.stage === 'reviewing') return { label: '审核中', tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' }
  if (row.entryStatus === 'failed') return { label: '执行失败', tone: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300' }
  if (row.entryStatus === 'paused') return { label: '已暂停', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' }
  if (row.entryStatus === 'done') return { label: batch.status === 'finalized' ? '已定稿' : '审核完成', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' }
  if (batch.status === 'draft') return { label: '待开始', tone: 'bg-muted text-muted-foreground' }
  return { label: '排队中', tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' }
}

function getRowStats(row: BatchProjectRow, batch: BatchStateV2): { inProgress: boolean; human: boolean; complete: boolean; supplement: boolean } {
  const status = caseStatus(row, batch).label
  return {
    inProgress: status === '审核中' || status === '排队中',
    human: status === '需要人工处理' || status === '执行失败' || status === '已暂停',
    complete: status === '审核完成' || status === '已定稿',
    supplement: status === '等待补件',
  }
}

export function BatchPanel({ active, onOpenProject }: BatchPanelProps): JSX.Element {
  const store = useStore()
  const [batches, setBatches] = useState<BatchStateV2[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [cases, setCases] = useState<CaseIndexItem[]>([])
  const [legacyCases, setLegacyCases] = useState<ReviewCaseSummary[]>([])
  const [templates, setTemplates] = useState<TemplateVersion[]>([])
  const [runs, setRuns] = useState<Record<string, ReviewRunV2 | undefined>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [templateKey, setTemplateKey] = useState('')
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([])

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const [batchList, caseList, legacyList, templateList] = await Promise.all([
        window.reviewAPI.listBatchesV2(),
        window.reviewAPI.listCasesV2(),
        window.reviewAPI.listCases(),
        window.reviewAPI.listTemplatesV2(),
      ])
      setBatches(batchList)
      setCases(caseList)
      setLegacyCases(legacyList)
      setTemplates(templateList.filter((template) => template.status === 'published'))
      setSelectedBatchId((current) => batchList.some((batch) => batch.batch.id === current) ? current : batchList[0]?.batch.id ?? '')

      const caseIds = [...new Set(batchList.flatMap((batch) => batch.cases.map((entry) => entry.caseId)))]
      const runEntries = await Promise.all(caseIds.map(async (caseId) => {
        try {
          const history = await window.reviewAPI.listRunsV2(caseId)
          const latest = [...history].sort((a, b) => (b.completedAt ?? b.startedAt).localeCompare(a.completedAt ?? a.startedAt))[0]
          return [caseId, latest] as const
        } catch {
          return [caseId, undefined] as const
        }
      }))
      setRuns(Object.fromEntries(runEntries))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (active) void refresh() }, [active, refresh])

  const selectedBatch = batches.find((batch) => batch.batch.id === selectedBatchId) ?? null
  const legacyById = useMemo(() => new Map(legacyCases.map((item) => [item.id, item])), [legacyCases])
  const caseById = useMemo(() => new Map(cases.map((item) => [item.caseId, item])), [cases])
  const rows = useMemo<BatchProjectRow[]>(() => {
    if (!selectedBatch) return []
    return selectedBatch.cases.map((entry) => {
      const indexItem = caseById.get(entry.caseId)
      const legacy = legacyById.get(entry.caseId)
      return {
        caseId: entry.caseId,
        title: indexItem?.title ?? legacy?.title ?? entry.caseId,
        applicant: legacy?.applicant || '未填写',
        updatedAt: indexItem?.updatedAt ?? legacy?.updatedAt ?? selectedBatch.batch.createdAt,
        entryStatus: entry.status,
        stage: indexItem?.stage,
        run: runs[entry.caseId],
      }
    })
  }, [caseById, legacyById, runs, selectedBatch])

  const selectedTemplate = templates.find((template) => `${template.templateId}@${template.version}` === templateKey)
  const availableCases = selectedTemplate
    ? cases.filter((item) => item.templateId === selectedTemplate.templateId && item.templateVersion === selectedTemplate.version)
    : []

  const openCreate = (): void => {
    const template = templates[0]
    setBatchName('')
    setTemplateKey(template ? `${template.templateId}@${template.version}` : '')
    setSelectedCaseIds([])
    setCreateOpen(true)
  }

  const toggleCase = (caseId: string): void => {
    setSelectedCaseIds((current) => current.includes(caseId) ? current.filter((id) => id !== caseId) : [...current, caseId])
  }

  const openProject = async (caseId: string): Promise<void> => {
    try {
      if (!await onOpenProject(caseId)) toast.error('无法打开这个审核项目，请刷新后重试。')
    } catch (cause) {
      toast.error(`打开项目失败：${cause instanceof Error ? cause.message : String(cause)}`)
    }
  }

  const createBatch = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (!selectedTemplate || !batchName.trim() || selectedCaseIds.length === 0 || creating) return
    setCreating(true)
    store.set(reviewV2BusyAtom, true)
    try {
      const batch: ReviewBatch = {
        id: `batch-${Date.now().toString(36)}`,
        name: batchName.trim(),
        templateId: selectedTemplate.templateId,
        templateVersion: selectedTemplate.version,
        policyVersionLock: (selectedTemplate.policyRefs?.map((policy) => ({ policyVersionId: policy.policyId, version: policy.version }))
          ?? selectedTemplate.policyVersionIds.map((policyVersionId) => ({ policyVersionId, version: 1 }))),
        caseIds: selectedCaseIds,
        createdAt: new Date().toISOString(),
      }
      const created = await window.reviewAPI.createBatchV2(batch)
      setBatches((current) => [created, ...current])
      setSelectedBatchId(created.batch.id)
      setCreateOpen(false)
      toast.success(`批次已创建：${created.batch.name}`)
    } catch (cause) {
      toast.error(`批次创建失败：${cause instanceof Error ? cause.message : String(cause)}`)
    } finally {
      store.set(reviewV2BusyAtom, false)
      setCreating(false)
    }
  }

  const counts = rows.reduce((total, row) => {
    const value = getRowStats(row, selectedBatch!)
    return {
      inProgress: total.inProgress + Number(value.inProgress),
      human: total.human + Number(value.human),
      complete: total.complete + Number(value.complete),
      supplement: total.supplement + Number(value.supplement),
    }
  }, { inProgress: 0, human: 0, complete: 0, supplement: 0 })

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 px-5 py-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">批量审核</h2>
          <p className="mt-1 text-sm text-muted-foreground">按批次跟进多个审核项目的进度和待处理情况。</p>
        </div>
        <Button type="button" size="sm" className="h-9 rounded-lg px-4" onClick={openCreate}>
          <Plus size={15} />新建批次
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="进行中" value={counts.inProgress} hint={selectedBatch ? '当前批次' : '当前批次'} icon={<Clock3 size={15} />} tone="text-blue-600 dark:text-blue-400" />
        <SummaryCard label="待人工处理" value={counts.human} hint={`涉及 ${counts.human} 个项目`} icon={<AlertTriangle size={15} />} tone="text-amber-600 dark:text-amber-400" />
        <SummaryCard label="已完成" value={counts.complete} hint="本轮累计" icon={<CheckCircle2 size={15} />} tone="text-emerald-600 dark:text-emerald-400" />
        <SummaryCard label="等待补件" value={counts.supplement} hint="需要联系申请人" icon={<FileWarning size={15} />} tone="text-orange-600 dark:text-orange-400" />
      </div>

      {error && <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">批次加载失败：{error}</div>}

      <section className="space-y-3">
        <div className="flex min-h-8 flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">审核批次</h3>
          {selectedBatch ? (
            <>
              {batches.length > 1 ? (
                <select
                  aria-label="当前审核批次"
                  value={selectedBatch.batch.id}
                  onChange={(event) => setSelectedBatchId(event.target.value)}
                  className="h-7 max-w-full rounded-md border border-input bg-background px-2 text-xs text-muted-foreground"
                >
                  {batches.map((batch) => <option key={batch.batch.id} value={batch.batch.id}>{batch.batch.name}</option>)}
                </select>
              ) : <span className="text-xs text-muted-foreground">{selectedBatch.batch.name}</span>}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{BATCH_STATUS_LABEL[selectedBatch.status]}</span>
              <span className="text-xs text-muted-foreground">{templates.find((item) => item.templateId === selectedBatch.batch.templateId && item.version === selectedBatch.batch.templateVersion)?.name ?? selectedBatch.batch.templateId} · v{selectedBatch.batch.templateVersion}</span>
            </>
          ) : <span className="text-xs text-muted-foreground">{loading ? '正在加载…' : '还没有审核批次'}</span>}
          <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 px-2 text-xs text-muted-foreground" disabled={loading} onClick={() => void refresh()}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />刷新
          </Button>
        </div>

        {selectedBatch ? (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                <thead className="bg-muted/45 text-[11px] font-medium text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">项目</th>
                    <th className="px-3 py-3">申报人</th>
                    <th className="px-3 py-3">审核进度</th>
                    <th className="px-3 py-3">待处理</th>
                    <th className="px-3 py-3">状态</th>
                    <th className="px-3 py-3 text-right">最近更新</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {rows.map((row) => {
                    const status = caseStatus(row, selectedBatch)
                    const coverage = row.run?.coverage
                    return (
                      <tr key={row.caseId} className="transition-colors hover:bg-muted/25">
                        <td className="max-w-[360px] px-3 py-3">
                          <button type="button" className="block max-w-full truncate text-left text-foreground/90 hover:text-primary hover:underline" title={row.title} onClick={() => void openProject(row.caseId)}>{row.title}</button>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{row.applicant}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{coverage && coverage.plannedChecks > 0 ? `${coverage.completedChecks} / ${coverage.plannedChecks}` : '—'}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{coverage ? coverage.pendingChecks : '—'}</td>
                        <td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${status.tone}`}>{status.label}</span></td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatTime(row.updatedAt)}</td>
                      </tr>
                    )
                  })}
                  {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">这个批次还没有纳入审核项目。</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-12 text-center">
            <FolderOpen size={23} className="mx-auto text-muted-foreground/70" />
            <p className="mt-3 text-sm font-medium">还没有审核批次</p>
            <p className="mt-1 text-xs text-muted-foreground">创建批次后，可以在这里查看各项目的审核进度。</p>
            {!loading && templates.length === 0 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">请先发布审核模板，再创建批次。</p>}
          </div>
        )}
      </section>

      <CreateBatchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        creating={creating}
        batchName={batchName}
        onBatchNameChange={setBatchName}
        templates={templates}
        templateKey={templateKey}
        onTemplateKeyChange={(value) => { setTemplateKey(value); setSelectedCaseIds([]) }}
        availableCases={availableCases}
        legacyById={legacyById}
        selectedCaseIds={selectedCaseIds}
        onToggleCase={toggleCase}
        onCreate={createBatch}
      />
    </div>
  )
}

function SummaryCard({ label, value, hint, icon, tone }: { label: string; value: number; hint: string; icon: JSX.Element; tone: string }): JSX.Element {
  return (
    <div className="min-h-[84px] rounded-xl border border-border/80 bg-card px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={tone}>{icon}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold leading-none tabular-nums">{value}</div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">{hint}</p>
    </div>
  )
}

function CreateBatchDialog({
  open, onOpenChange, creating, batchName, onBatchNameChange, templates, templateKey, onTemplateKeyChange,
  availableCases, legacyById, selectedCaseIds, onToggleCase, onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  creating: boolean
  batchName: string
  onBatchNameChange: (name: string) => void
  templates: TemplateVersion[]
  templateKey: string
  onTemplateKeyChange: (value: string) => void
  availableCases: CaseIndexItem[]
  legacyById: Map<string, ReviewCaseSummary>
  selectedCaseIds: string[]
  onToggleCase: (caseId: string) => void
  onCreate: (event: React.FormEvent<HTMLFormElement>) => void
}): JSX.Element {
  const selectedTemplate = templates.find((template) => `${template.templateId}@${template.version}` === templateKey)
  const canCreate = !!selectedTemplate && batchName.trim().length > 0 && selectedCaseIds.length > 0 && !creating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>新建审核批次</DialogTitle>
          <DialogDescription>为一组使用同一模板版本的审核项目建立批次。项目可继续在辅助审核中单独处理。</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void onCreate(event)}>
          <div className="space-y-1.5">
            <Label htmlFor="review-batch-name">批次名称</Label>
            <Input id="review-batch-name" value={batchName} onChange={(event) => onBatchNameChange(event.target.value)} placeholder="如：2026 秋季综合测评" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="review-batch-template">审核模板</Label>
            <select id="review-batch-template" value={templateKey} onChange={(event) => onTemplateKeyChange(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">选择已发布模板…</option>
              {templates.map((template) => <option key={`${template.templateId}@${template.version}`} value={`${template.templateId}@${template.version}`}>{template.name} · v{template.version}</option>)}
            </select>
            {selectedTemplate && <p className="text-xs text-muted-foreground">批次固定模板 v{selectedTemplate.version}；纳入 {(selectedTemplate.policyRefs?.length ?? selectedTemplate.policyVersionIds.length)} 个审核依据版本。</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>纳入项目</Label>
              <span className="text-xs text-muted-foreground">已选 {selectedCaseIds.length} 个</span>
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border/80 p-1.5">
              {availableCases.map((item) => {
                const legacy = legacyById.get(item.caseId)
                return (
                  <label key={item.caseId} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 hover:bg-muted/50">
                    <input type="checkbox" className="mt-0.5 accent-primary" checked={selectedCaseIds.includes(item.caseId)} onChange={() => onToggleCase(item.caseId)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{item.title}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{legacy?.applicant || '未填写申报人'} · 更新于 {formatTime(item.updatedAt)}</span>
                    </span>
                  </label>
                )
              })}
              {selectedTemplate && availableCases.length === 0 && <p className="px-3 py-8 text-center text-xs text-muted-foreground">没有使用此模板版本的项目。</p>}
              {!selectedTemplate && <p className="px-3 py-8 text-center text-xs text-muted-foreground">先选择模板，再选择要纳入的项目。</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" disabled={!canCreate}>{creating ? '正在创建…' : '创建批次'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
