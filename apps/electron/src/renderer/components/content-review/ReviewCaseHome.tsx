/** 审核首页：新材料导入与历史案卷入口。首页不依赖“当前已选案卷”是否存在。 */
import * as React from 'react'
import { ArrowRight, FolderOpen, RefreshCw, Search } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { ReviewV3QuickIntake } from './ReviewV3QuickIntake'

type HomeCase = {
  id: string
  title: string
  stage: string
  updatedAt: string
  materialCount?: number
}

const stageNames: Record<string, string> = {
  draft: '草稿', submitted: '已提交', reviewing: '审核中',
  'awaiting-supplement': '等待补件', 'awaiting-review': '待复审',
  decided: '已形成决定', archived: '已归档',
}

export function ReviewCaseHome({
  active, onOpenCase,
}: {
  active: boolean
  onOpenCase: (caseId: string) => Promise<boolean>
}): React.ReactElement {
  const [cases, setCases] = React.useState<HomeCase[]>([])
  const [search, setSearch] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [openingId, setOpeningId] = React.useState<string | null>(null)
  const [error, setError] = React.useState('')

  const refresh = React.useCallback(async (): Promise<void> => {
    setBusy(true)
    setError('')
    try {
      // Main 的 V2 案卷列表包括没有 V1 三栏投影的原生案卷。
      const [native, legacy] = await Promise.all([
        window.reviewAPI.listCasesV2(),
        window.reviewAPI.listCases(),
      ])
      const merged = new Map<string, HomeCase>()
      for (const item of legacy) merged.set(item.id, {
        id: item.id, title: item.title, stage: 'draft',
        updatedAt: '', materialCount: item.documentCount,
      })
      for (const item of native) merged.set(item.caseId, {
        ...merged.get(item.caseId),
        id: item.caseId, title: item.title, stage: item.stage,
        updatedAt: item.updatedAt,
      })
      setCases([...merged.values()]
        .filter(item => item.stage !== 'archived')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    } catch (cause) {
      setError('读取历史案卷失败：' + (cause instanceof Error ? cause.message : String(cause)))
    } finally {
      setBusy(false)
    }
  }, [])

  React.useEffect(() => {
    if (active) void refresh()
  }, [active, refresh])

  const open = async (id: string): Promise<void> => {
    if (openingId) return
    setOpeningId(id)
    setError('')
    try {
      if (!await onOpenCase(id)) setError('无法打开案卷。请检查本机记录是否仍存在。')
    } catch (cause) {
      setError('打开案卷失败：' + (cause instanceof Error ? cause.message : String(cause)))
    } finally {
      setOpeningId(null)
    }
  }
  const visible = cases.filter(item => (
    (item.title + ' ' + item.id).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  ))

  return <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-6 pb-10">
    <header className="space-y-2">
      <h1 className="text-xl font-semibold">材料审核</h1>
      <p className="text-sm text-muted-foreground">导入一份新申请，或者继续上次的案卷。离开案卷不会结束 Main 中的后台审核。</p>
    </header>
    <ReviewV3QuickIntake onCreated={(caseId) => { void open(caseId) }} />
    <section aria-label="已有审核案卷" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">继续审核</h2>
          <p className="text-xs text-muted-foreground">从原案卷恢复材料、检查记录和办理历史。</p>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void refresh()}>
          <RefreshCw size={14} className="mr-1" />刷新列表
        </Button>
      </div>
      <label className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
        <Search size={15} className="shrink-0 text-muted-foreground" />
        <input className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          aria-label="搜索历史案卷" placeholder="按名称或案卷编号搜索"
          value={search} onChange={event => setSearch(event.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {busy && cases.length === 0 && <p className="text-sm text-muted-foreground">正在读取历史案卷…</p>}
      {!busy && visible.length === 0 && <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {search ? '没有匹配的案卷' : '还没有历史案卷，可直接从上方导入材料'}
      </p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {visible.map(item => <button type="button" key={item.id} disabled={openingId !== null}
          onClick={() => void open(item.id)}
          className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/40 disabled:opacity-60">
          <FolderOpen size={20} className="shrink-0 text-primary" />
          <span className="min-w-0 flex-1 space-y-1">
            <span className="block truncate text-sm font-semibold">{item.title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {stageNames[item.stage] ?? item.stage}
              {typeof item.materialCount === 'number' ? ' · ' + item.materialCount + ' 份材料' : ''}
              {item.updatedAt ? ' · ' + new Date(item.updatedAt).toLocaleString() : ''}
            </span>
          </span>
          <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
        </button>)}
      </div>
    </section>
  </div>
}
