/**
 * ReviewContextBar — 审核工作台上方的唯一任务上下文条
 *
 * 拆掉「唯一入口 = 载入演示案卷」的入口墙，提供四件事：
 * 1. 案卷选择器：列出已存储案卷（标题 + 领域包 + 材料数 + 演示标记），点击切换
 * 2. 新建案卷：打开 CreateCaseDialog
 * 3. 审核类型切换 + 删除案卷（删除需二次确认，演示案卷不可删除）
 * 材料按角色在左/中栏各自导入，不在上下文条放全局入口。
 *
 * 数据来源：reviewCaseListAtom（列表）/ reviewCaseAtom（当前案卷）；
 * 所有写入都经 use-review-actions，本组件不直接调用 window.reviewAPI。
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { Check, ChevronDown, FolderOpen, Layers, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { ConfirmDialog } from '@profer/ui/primitives/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@profer/ui/primitives/dropdown-menu'
import { DEFAULT_DOMAIN_PACK_ID, BUILTIN_DOMAIN_PACKS, resolveDomainPack } from '@profer/shared'
import type { ReviewCaseSummary } from '@profer/shared'
import { reviewCaseAtom, reviewCaseListAtom, reviewExecutionAtom } from '@/atoms/review-atoms'
import { cn } from '@/lib/utils'
import { CreateCaseDialog } from './CreateCaseDialog'
import type { ReviewActions } from './use-review-actions'

/**
 * 取列表行的领域包名。
 *
 * listCases 摘要带 domainPackId（缺省的旧案卷由 resolveDomainPack 回落缺省包名）。
 */
function resolveSummaryPackName(summary: ReviewCaseSummary): string {
  return resolveDomainPack(summary.domainPackId).name
}

interface CaseManagerBarProps {
  actions: ReviewActions
}

export function ReviewContextBar({ actions }: CaseManagerBarProps): React.ReactElement {
  const currentCase = useAtomValue(reviewCaseAtom)
  const caseList = useAtomValue(reviewCaseListAtom)
  const execution = useAtomValue(reviewExecutionAtom)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [switchingPack, setSwitchingPack] = React.useState(false)

  const currentPack = resolveDomainPack(currentCase?.domainPackId ?? DEFAULT_DOMAIN_PACK_ID)

  const handleSelectCase = (caseId: string): void => {
    if (caseId === currentCase?.id) return
    void actions.selectCase(caseId)
  }

  const handlePackChange = async (packId: string): Promise<void> => {
    if (!currentCase || packId === currentPack.id) return
    setSwitchingPack(true)
    try {
      const ok = await actions.setDomainPack(packId)
      if (ok) {
        toast.success(`审核领域包已切换为「${resolveDomainPack(packId).name}」`, {
          description: '规则类别与问题类型已切换，建议重新生成 AI 规则大纲后再审核。',
        })
      }
    } finally {
      setSwitchingPack(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    const target = currentCase
    if (!target) return
    const ok = await actions.deleteCase(target.id)
    if (ok) {
      setDeleteOpen(false)
      toast.success(`已删除案卷：${target.title}`)
    }
  }

  const demoUndeletable = currentCase?.isDemo === true

  return (
    <section className="shrink-0 border-b border-border/60 bg-card/40 px-3 py-2">
      <div className="flex items-center gap-2 px-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="选择审核任务" className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-muted/50">
              <FolderOpen size={14} className="shrink-0 text-blue-500" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{currentCase ? `${currentCase.applicant} · ${currentCase.academicYear} · ${currentCase.title}` : '选择审核任务'}</span>
              <ChevronDown size={14} className="shrink-0 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[320px]">
            <DropdownMenuLabel>审核任务（{caseList.length}）</DropdownMenuLabel>
            {caseList.map((summary) => (
              <DropdownMenuItem key={summary.id} onSelect={() => handleSelectCase(summary.id)} className="flex items-start gap-2">
                <Check size={14} className={cn('mt-0.5 shrink-0', summary.id === currentCase?.id ? 'opacity-100' : 'opacity-0')} />
                <span className="min-w-0 flex-1"><span className="block truncate text-[13px]">{summary.title}</span><span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{resolveSummaryPackName(summary)} · {summary.documentCount} 份材料</span></span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setCreateOpen(true)}><Plus size={14} />新建审核任务</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="shrink-0 text-[11px] text-muted-foreground">{currentCase ? `${currentCase.documents.length} 份材料 · ${executionLabel(execution.status)}` : '还没有审核任务'}</span>
        {!currentCase && <Button type="button" size="sm" className="h-7 gap-1.5 px-2 text-[12px]" onClick={() => setCreateOpen(true)}><Plus size={13} />新建审核</Button>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label="更多审核操作" title="更多审核操作"><MoreHorizontal size={15} /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[260px]">
            <DropdownMenuItem onSelect={() => setCreateOpen(true)}><Plus size={14} />新建审核任务</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void actions.loadDemoCase()}><FolderOpen size={14} />载入示例数据</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>高级操作</DropdownMenuLabel>
            {BUILTIN_DOMAIN_PACKS.map((pack) => (
              <DropdownMenuItem key={pack.id} disabled={!currentCase || switchingPack} onSelect={() => void handlePackChange(pack.id)}><Layers size={14} />审核类型：{pack.name}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" disabled={!currentCase || demoUndeletable} onSelect={() => setDeleteOpen(true)}><Trash2 size={14} />删除审核任务</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* 新建案卷对话框 */}
      <CreateCaseDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={actions.createCase} />

      {/* 删除二次确认 */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="删除案卷"
        description={
          currentCase
            ? `确认删除「${currentCase.title}」？该案卷的材料、规则大纲与审核记录会一并移除，且无法恢复。`
            : '确认删除该案卷？'
        }
        confirmLabel="删除"
        onConfirm={handleDelete}
      />
    </section>
  )
}

/** 兼容旧回归入口；普通审核页面使用 ReviewContextBar。 */
export const CaseManagerBar = ReviewContextBar

function executionLabel(status: import('@/atoms/review-atoms').ReviewExecutionViewState['status']): string {
  const labels: Record<typeof status, string> = { idle: '待审核', preparing: '准备中', running: '审核中', 'awaiting-input': '待补充', completed: '已完成', partial: '部分完成', failed: '未完成', cancelled: '已取消' }
  return labels[status]
}
