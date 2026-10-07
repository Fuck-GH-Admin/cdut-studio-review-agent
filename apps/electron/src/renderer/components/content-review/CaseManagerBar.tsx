/**
 * ReviewContextBar — 审核工作台上方的唯一任务上下文条
 *
 * 拆掉「唯一入口 = 载入演示案卷」的入口墙，提供四件事：
 * 1. 案卷选择器：列出已存储案卷（标题 + 领域包 + 材料数 + 演示标记），点击切换
 * 2. 新建案卷：打开 CreateCaseDialog
 * 3. 导入材料：按角色（依据/待审/证明）走系统选择框导入到当前案卷
 * 4. 审核类型切换 + 删除案卷（删除需二次确认，演示案卷不可删除）
 *
 * 数据来源：reviewCaseListAtom（列表）/ reviewCaseAtom（当前案卷）；
 * 所有写入都经 use-review-actions，本组件不直接调用 window.reviewAPI。
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { Check, ChevronDown, FilePlus2, FolderOpen, Layers, MoreHorizontal, Plus, Trash2, Upload } from 'lucide-react'
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
import type { ReviewCaseSummary, SourceDocument } from '@profer/shared'
import { reviewCaseAtom, reviewCaseListAtom, reviewExecutionAtom } from '@/atoms/review-atoms'
import { cn } from '@/lib/utils'
import { CreateCaseDialog } from './CreateCaseDialog'
import { REVIEW_DOCUMENT_ROLE_LABELS } from './use-review-actions'
import type { ReviewActions } from './use-review-actions'

/** 导入材料三个角色的区分说明（用户需要看懂该导哪一份） */
const IMPORT_ROLE_HINTS: Record<SourceDocument['role'], string> = {
  rule: '评分细则、管理办法等判定标准，作为 AI 审核的比对基准（显示在左栏「审核依据」）',
  application: '学生申报表、合同正文等待审核的材料，审核条目从中识别（显示在中栏）',
  evidence: '获奖证书、票据、附件等佐证材料，用于核对申报内容是否属实（显示在中栏证据卡）',
}

/** 导入角色顺序（与三栏展示顺序一致） */
const IMPORT_ROLES: SourceDocument['role'][] = ['rule', 'application', 'evidence']

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
  const [importing, setImporting] = React.useState(false)
  const [switchingPack, setSwitchingPack] = React.useState(false)

  const currentPack = resolveDomainPack(currentCase?.domainPackId ?? DEFAULT_DOMAIN_PACK_ID)

  const handleSelectCase = (caseId: string): void => {
    if (caseId === currentCase?.id) return
    void actions.selectCase(caseId)
  }

  const handleImport = async (role: SourceDocument['role']): Promise<void> => {
    if (importing) return
    if (!currentCase) {
      setCreateOpen(true)
      toast.info('先新建审核任务，材料才能归入对应案卷')
      return
    }
    setImporting(true)
    try {
      const document = await actions.importDocument(role)
      if (document) {
        toast.success(`已导入${REVIEW_DOCUMENT_ROLE_LABELS[role]}：${document.fileName}`)
      } else {
        toast.info('没有导入材料；取消选择不会修改案卷，若导入失败请查看页面底部提示')
      }
    } catch (error) {
      toast.error(`导入材料失败：${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setImporting(false)
    }
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

      <div className="space-y-2 rounded-lg bg-card p-2.5 shadow-sm">
        {/* 导入材料（三个角色） */}
        <div className="flex w-full gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 min-w-0 flex-1 gap-1.5 px-2 text-[13px]"
            disabled={importing}
            title={currentCase ? '点击直接选择申报材料；使用右侧箭头选择审核依据或证明材料' : '先新建审核任务，再添加材料'}
            onClick={() => void handleImport('application')}
          >
            <Upload size={13} />
            {importing ? '导入中…' : '添加材料'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon-sm" className="h-7 w-7 shrink-0" disabled={!currentCase || importing} aria-label="选择材料类型" title="选择材料类型">
                <ChevronDown size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px]">
            <DropdownMenuLabel>选择材料角色</DropdownMenuLabel>
            {IMPORT_ROLES.map((role) => (
              <DropdownMenuItem
                key={role}
                onSelect={() => void handleImport(role)}
                className="flex items-start gap-2"
              >
                <FilePlus2 size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-foreground">
                    导入{REVIEW_DOCUMENT_ROLE_LABELS[role]}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                    {IMPORT_ROLE_HINTS[role]}
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
