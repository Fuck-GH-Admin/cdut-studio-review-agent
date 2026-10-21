/**
 * ContentReviewView — CDUT 专区「材料审核」子页面（三栏审核工作台主体）
 *
 * 作为 CdutZoneView 子页面内页挂载：统一顶栏（校徽 + 标题 + 关闭按钮）与窗口按钮宿主
 * 由外层 CdutZoneView（cdut-subview）统管，本组件不再声明自身的 WindowControlsHost 与拖拽层，
 * 避免同为 priority 20 争抢窗口按钮。
 *
 * 布局：工作台二级工具栏（模块导航 + 案卷摘要 + 出口徽标 + 操作按钮） +
 * 三栏（审核依据 | 申请与证明 | AI 审核员） + 助手抽屉 + 底部错误条。
 * 三栏宽度 flex-[3] / flex-[4] / flex-[3]，栏间 1px 分隔，各自独立滚动（overflow-y-auto）。
 * 窄窗口（<1100px）时只挂载当前栏，由顶部三按钮切换；切栏时重放已有定位。
 *
 * 交互：
 * - 工作台不再初始化旧版案卷控制器。
 *   不自动选中/载入案卷（首个案卷可能是用户自己的），入口在左栏「案卷管理」条；
 *   「载入演示案卷」按钮保留，由用户显式触发
 * - Ctrl+Shift+A（Mac: Cmd+Shift+A）：仅本视图挂载期间监听，toggle 审核助手抽屉
 * - 联动（D8）：问题卡点击 → reviewFocusAtom → SourceBlockView 滚动 + 闪高亮（见各栏组件）
 * - 根 div 保留 data-profer-navigation-region="content-review" + tabIndex={-1}（键盘导航焦点移交）
 */

import * as React from 'react'
import { toast } from 'sonner'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  Download,
  FileText,
  Gavel,
  Layers,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { ReviewFirstUseReadiness } from '@/components/onboarding/ReviewFirstUseReadiness'
import { humanizeReviewError } from './review-error-text'
import { isEditableTarget } from '@/lib/navigation-controller'
import {
  reviewAssistantOpenAtom,
  reviewErrorAtom,
  reviewGatewayStatusAtom,
  reviewWorkspaceSectionAtom,
  selectedCaseIdAtom,
  type ReviewWorkspaceSection,
} from '@/atoms/review-atoms'
import type { ReviewModelGatewayStatus } from '@profer/shared'
import { cn } from '@/lib/utils'
import { AssistantDrawer } from './AssistantDrawer'
import { reviewV2AggregateAtom, V2CasePanel } from './V2CasePanel'
import { ReviewV3T10WorkspaceOverview } from './ReviewV3T10WorkspaceOverview'
import { TemplateWizardPanel } from './TemplateWizardPanel'
import { ReviewV3LocalCandidateWorkbench } from './ReviewV3LocalCandidateWorkbench'
import { BatchPanel } from './BatchPanel'
import { ReviewV3T07Workbench } from './ReviewV3T07Workbench'
import { useReviewActions } from './use-review-actions'
import { ReviewV3QuickIntake } from './ReviewV3QuickIntake'

/** 窄屏单栏切换的栏目标识 */
type Pane = 'left' | 'center' | 'right'

/** 窄屏阈值：小于该宽度降级为单栏（与设计文档"窄窗口可切标签"一致） */

export function ContentReviewView(): React.ReactElement {
  const gatewayStatus = useAtomValue(reviewGatewayStatusAtom)
  const errorMessage = useAtomValue(reviewErrorAtom)
  const section = useAtomValue(reviewWorkspaceSectionAtom)
  const setSection = useSetAtom(reviewWorkspaceSectionAtom)
  const selectedCaseId = useAtomValue(selectedCaseIdAtom)
  const setSelectedCaseId = useSetAtom(selectedCaseIdAtom)
  const setV2Aggregate = useSetAtom(reviewV2AggregateAtom)
  const businessAggregate = useAtomValue(reviewV2AggregateAtom)
  const assistantOpen = useSetAtom(reviewAssistantOpenAtom)

  const actions = useReviewActions()

  const [quickCaseId, setQuickCaseId] = React.useState<string | null>(null)
  const quickStart = React.useCallback((caseId: string): void => {
    setQuickCaseId(caseId)
    setSelectedCaseId(caseId)
    setV2Aggregate(null)
    setSection('workbench')
  }, [setSection, setSelectedCaseId, setV2Aggregate])

  // 与独立的 V2 办理模块共用同一份真实案卷；只读取现有 Main 聚合。
  const openBusinessCase = React.useCallback(async (): Promise<void> => {
    const caseId = businessAggregate?.caseV2.id ?? selectedCaseId
    if (!caseId) {
      setSection('workbench')
      return
    }
    setSection('workbench')
    if (businessAggregate?.caseV2.id === caseId) {
      window.setTimeout(() => document.getElementById('case-human-workflow')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
      return
    }
    try {
      const aggregate = await window.reviewAPI.openAggregateV2(caseId)
      if (!aggregate || aggregate.caseV2.id !== caseId) throw new Error('无法加载当前案卷')
      setV2Aggregate(aggregate)
      setSelectedCaseId(caseId)
      window.setTimeout(() => document.getElementById('case-human-workflow')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    } catch (cause) {
      toast.error(humanizeReviewError(cause))
    }
  }, [businessAggregate?.caseV2.id, selectedCaseId, setSection, setSelectedCaseId, setV2Aggregate])


  // 旧业务面板里的开案、补件、决定仍使用原有事务；
  // 只在该面板激活时把最新聚合反映到同一案卷的审核工作台，不复制造库逻辑。

  // 设置面板覆盖工作台而不卸载它；渠道变化时也需刷新出口徽标。

  // 监听窗口宽度，窄屏切换为单栏。

  // Ctrl+Shift+A / Cmd+Shift+A：仅本视图挂载期间生效，切换助手抽屉
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!event.shiftKey) return
      const isMac = navigator.platform.startsWith('Mac')
      const mod = isMac ? event.metaKey : event.ctrlKey
      if (!mod) return
      if (event.key.toLowerCase() !== 'a') return
      // 输入/文本域内不拦截（避免吞掉 Ctrl+A 全选）
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      assistantOpen((previous) => !previous)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [assistantOpen])

  // 50 套 D4 候选 → 可执行模板：让拖入材料匹配到的模板可以真正用于业务审核
  const [demoPublishing, setDemoPublishing] = React.useState(false)
  const publishDemoTemplates = React.useCallback(async (): Promise<void> => {
    setDemoPublishing(true)
    try {
      const result = await window.reviewAPI.publishD4DemoTemplates()
      toast.success(`模板已发布 ${result.published.length} 套` +
        (result.renamed.length ? `，改名 ${result.renamed.length} 套` : '') +
        (result.skipped.length ? `，跳过 ${result.skipped.length} 套` : '') +
        (result.failed.length ? `，失败 ${result.failed.length} 套` : ''))
      if (result.failed.length) {
        toast.error(`发布会话失败：${result.failed[0]!.templateId}：${result.failed[0]!.reason}`)
      }
    } catch (error) {
      toast.error(`发布模板失败：${humanizeReviewError(error)}`)
    } finally {
      setDemoPublishing(false)
    }
  }, [])

  // 审核模型就绪提示：只在首次进入材料审核时出现，关闭后不再打扰
  const [reviewReadinessVisible, setReviewReadinessVisible] = React.useState<boolean>(() => {
    try { return window.localStorage.getItem('cdut.review.readinessAcknowledged') !== '1' } catch { return true }
  })
  const dismissReviewReadiness = React.useCallback((): void => {
    setReviewReadinessVisible(false)
    try { window.localStorage.setItem('cdut.review.readinessAcknowledged', '1') } catch { /* 忽略存储不可用 */ }
  }, [])

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-content-area outline-none"
      data-profer-navigation-region="content-review"
      tabIndex={-1}
    >
      {/* 首次进入材料审核时才提示配置审核模型：右侧浮层，不挤压主界面、不形成上下分栏 */}
      {reviewReadinessVisible && (
        <section aria-label="审核模型就绪检查"
          className="absolute inset-0 z-20 flex flex-col bg-background">
          <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-6 py-8">
            <header className="mb-4">
              <h2 className="text-xl font-semibold">让材料审核做好准备</h2>
              <p className="mt-1 text-sm text-muted-foreground">已有模型配置会自动读取；也可以先跳过，进入主界面后再到设置里配置。</p>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <ReviewFirstUseReadiness />
            </div>
            <footer className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button type="button" variant="ghost" size="sm" className="h-8 text-xs"
                onClick={() => dismissReviewReadiness()}>跳过，稍后设置</Button>
              <Button type="button" size="sm" className="h-8 text-xs" onClick={() => dismissReviewReadiness()}>
                完成，开始审核
              </Button>
            </footer>
          </div>
        </section>
      )}

      {/* 工作台专属二级工具栏：模块导航与操作动作合流，居于 CDUT 专区统一顶栏下方，
          享有完整容器宽度，物理上不会与右上角 Windows 窗口按钮重叠 */}
      <header className="relative z-10 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 bg-card/60 px-4 py-2 titlebar-no-drag">
        {/* 左侧：二级导航 + 当前案卷摘要 */}
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <nav aria-label="审核工作页" className="flex shrink-0 flex-wrap items-center gap-1">
            {([
              ['workbench', '单案审核'],
              ['templates', '模板管理'],
              ['batches', '批量审核'],
            ] as Array<[ReviewWorkspaceSection, string]>).map(([id, label]) => (
              <Button
                key={id}
                size="sm"
                variant={section === id ? 'secondary' : 'ghost'}
                className="h-7 px-2.5 text-xs font-medium"
                aria-pressed={section === id}
                onClick={() => setSection(id)}
              >
                {label}
              </Button>
            ))}
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2.5 text-xs font-medium"
              onClick={() => void openBusinessCase()} title="在当前案卷查看需要核对的检查与人工待办">
              待办
            </Button>
          </nav>

          {businessAggregate && (
            <div className="max-w-[300px] truncate rounded-md bg-foreground/[0.04] px-2 py-1 text-xs text-muted-foreground" title={businessAggregate.caseV2.title}>
              <span className="font-medium text-foreground">{businessAggregate.caseV2.title}</span>
              <span className="ml-2">{businessAggregate.caseV2.stage === 'draft' ? '待审核' : businessAggregate.caseV2.stage === 'archived' ? '已归档' : '办理中'}</span>
            </div>
          )}
          <GatewayBadge status={gatewayStatus} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            disabled={!businessAggregate}
            onClick={() => void openBusinessCase()}
          >
            <Download size={12} />
            <span>查看本案办理与报告</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7"
            aria-label="打开审核助手（Ctrl+Shift+A）"
            title={`审核助手（${navigator.platform.startsWith('Mac') ? '⌘⇧A' : 'Ctrl+Shift+A'}）`}
            onClick={() => assistantOpen((previous) => !previous)}
          >
            <MessageCircle size={14} />
          </Button>
        </div>
      </header>

      {section === 'workbench' && (<ReviewV3T10WorkspaceOverview
        onOpenReview={() => void openBusinessCase()}
        onOpenMaterials={() => document.getElementById('case-material-intake')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        onOpenTasks={() => void openBusinessCase()}
        onOpenTemplates={() => setSection('templates')}
        onOpenBusiness={() => void openBusinessCase()}
      />)}

      {section === 'templates' && (
        <nav aria-label="模板工作区" className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card/40 px-4 py-1.5 titlebar-no-drag">
          <Button type="button" data-testid="review-section-templates" size="sm" variant={section === 'templates' ? 'secondary' : 'ghost'} className="h-7 text-xs" onClick={() => setSection('templates')}>模板库与业务配置</Button>
                    <Button type="button" data-testid="review-publish-demo-templates" size="sm" variant="outline" className="h-7 text-xs"
            disabled={demoPublishing}
            onClick={() => void publishDemoTemplates()}>
            {demoPublishing ? '发布中…' : '发布 50 套模板'}
          </Button>
          
        </nav>
      )}

      {/* 单案审核：导入、方案、执行与办理共用同一份 V3 案卷上下文。 */}
      {section === 'workbench' && (
        <main className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 py-3 titlebar-no-drag">
          {!selectedCaseId && !quickCaseId ? (
            <>
              <ReviewV3QuickIntake onCreated={quickStart} />
              <details className="rounded-xl border border-border/60 px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium">选择已发布模板或打开历史案卷</summary>
                <div className="pt-3"><V2CasePanel /></div>
              </details>
            </>
          ) : (
            <>
              <ReviewV3LocalCandidateWorkbench initialCaseId={selectedCaseId ?? quickCaseId ?? undefined} />
              {businessAggregate && (
                <div id="case-human-workflow" className="scroll-mt-3">
                  <V2CasePanel embedded />
                </div>
              )}
            </>
          )}
        </main>
      )}
      {section === 'templates' && (
        <section aria-label="审核模板管理" className="relative min-h-0 flex-1 overflow-auto py-3 titlebar-no-drag">
          <TemplateWizardPanel />
        </section>
      )}
      {section === 'batches' && (
        <section aria-label="批量审核" className="relative min-h-0 flex-1 overflow-auto py-3 titlebar-no-drag">
          <BatchPanel
            active={section === 'batches'}
            onOpenProject={async (caseId) => {
              try {
                const aggregate = await window.reviewAPI.openAggregateV2(caseId)
                if (!aggregate || aggregate.caseV2.id !== caseId) return false
                setV2Aggregate(aggregate)
                setSelectedCaseId(caseId)
                setQuickCaseId(caseId)
                setSection('workbench')
                return true
              } catch (cause) {
                toast.error(humanizeReviewError(cause))
                return false
              }
            }}
          />
          <details className="mx-3 mt-3 rounded-lg border border-border/60 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium">评委评分与高级批次工具</summary>
            <div className="pt-3"><ReviewV3T07Workbench /></div>
          </details>
        </section>
      )}
      <AssistantDrawer actions={actions} />

      {/* ===== 底部错误条 ===== */}
      {errorMessage && (
        <div
          role="alert"
          className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 bg-red-500/10 px-4 py-2 text-xs text-red-700 dark:text-red-400"
        >
          <span className="min-w-0 flex-1 truncate" title={errorMessage}>
            {errorMessage}
          </span>
        </div>
      )}
    </div>
  )
}

/** 模型出口状态徽标；无模型只表示未配置，演示模拟由运行徽标单独说明。 */
function GatewayBadge({ status }: { status: ReviewModelGatewayStatus | null }): React.ReactElement | null {
  if (!status) return null
  if (status.available) {
    const label = status.protocol === 'local-private' ? '本地私有出口' : 'OpenAI 兼容出口'
    return (
      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
        {label}
      </span>
    )
  }
  return (
    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
      未配置审核模型
    </span>
  )
}

/** 窄屏单栏切换按钮 */
function PaneTab({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}): React.ReactElement {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] transition-colors',
        active ? 'bg-surface-raised font-medium text-foreground shadow-sm ring-1 ring-surface-border/35' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

/** 三栏容器：宽屏时 flex 比例 + 1px 分隔线；窄屏时按当前栏显隐 */
function PaneWrapper({
  pane,
  className,
  narrow,
  active,
  showSeparator,
  children,
}: {
  pane: Pane
  className: string
  narrow: boolean
  active: Pane
  showSeparator: boolean
  children: React.ReactNode
}): React.ReactElement {
  const visible = !narrow || active === pane
  // 隐藏栏中的定位计时器会先结束；重新挂载后按保留的焦点滚动并高亮。
  if (!visible) return <></>
  return (
    <div
      className={cn(
        'min-w-0 flex-col overflow-hidden',
        showSeparator && 'border-r border-border/60',
        // 宽屏三栏比例；窄屏单栏占满
        narrow ? 'flex w-full flex-1' : `flex ${className}`,
      )}
    >
      {children}
    </div>
  )
}
