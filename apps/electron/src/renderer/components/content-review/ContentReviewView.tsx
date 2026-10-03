/**
 * ContentReviewView — 内容审核专区（三栏审核工作台，主视图）
 *
 * 布局：顶栏（标题/徽标/案卷信息/操作按钮） + 三栏（审核依据 | 申请与证明 | AI 审核员） + 助手抽屉 + 底部错误条。
 * 三栏宽度 flex-[3] / flex-[4] / flex-[3]，栏间 1px 分隔，各自独立滚动（overflow-y-auto）。
 * 窄窗口（<1100px）时只挂载当前栏，由顶部三按钮切换；切栏时重放已有定位。
 *
 * 交互：
 * - 挂载时 actions.initialize()：刷新案卷列表 + 模型出口自检（顶栏徽标）。
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
  ClipboardCheck,
  Download,
  FileText,
  Gavel,
  Layers,
  MessageCircle,
  RotateCcw,
} from 'lucide-react'
import { detectIsWindows } from '@profer/ui'
import { Button } from '@profer/ui/primitives/button'
import { WindowControlsHost } from '@/components/WindowControlsTemplate'
import { resolveWindowControlsRightInset } from '@/lib/window-controls-layout'
import { isEditableTarget } from '@/lib/navigation-controller'
import {
  reviewActivePaneAtom,
  reviewAssistantOpenAtom,
  reviewCaseAtom,
  reviewErrorAtom,
  reviewGatewayStatusAtom,
  reviewRunAtom,
  reviewRunStaleAtom,
  reviewRunningAtom,
} from '@/atoms/review-atoms'
import { channelsAtom } from '@/atoms/conversation-atoms'
import type { ReviewModelGatewayStatus } from '@profer/shared'
import { cn } from '@/lib/utils'
import { AssistantDrawer } from './AssistantDrawer'
import { CenterPanel } from './CenterPanel'
import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { V2CasePanel } from './V2CasePanel'
import { TemplateWizardPanel } from './TemplateWizardPanel'
import { useReviewActions } from './use-review-actions'

/** 窄屏单栏切换的栏目标识 */
type Pane = 'left' | 'center' | 'right'

/** 窄屏阈值：小于该宽度降级为单栏（与设计文档"窄窗口可切标签"一致） */
const NARROW_BREAKPOINT_PX = 1100

export function ContentReviewView(): React.ReactElement {
  const reviewCase = useAtomValue(reviewCaseAtom)
  const gatewayStatus = useAtomValue(reviewGatewayStatusAtom)
  const errorMessage = useAtomValue(reviewErrorAtom)
  const run = useAtomValue(reviewRunAtom)
  const runStale = useAtomValue(reviewRunStaleAtom)
  const running = useAtomValue(reviewRunningAtom)
  const channels = useAtomValue(channelsAtom)
  const activePane = useAtomValue(reviewActivePaneAtom)
  const setActivePane = useSetAtom(reviewActivePaneAtom)
  const assistantOpen = useSetAtom(reviewAssistantOpenAtom)

  const actions = useReviewActions()

  const [narrow, setNarrow] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth < NARROW_BREAKPOINT_PX,
  )
  const isWindows = React.useMemo(() => detectIsWindows(), [])
  const [exporting, setExporting] = React.useState(false)

  const handleExport = async (): Promise<void> => {
    setExporting(true)
    try {
      const result = await actions.exportReport()
      if (result) toast.success('预审报告已导出', { description: result.markdownPath })
    } finally {
      setExporting(false)
    }
  }

  // 设置面板覆盖工作台而不卸载它；渠道变化时也需刷新出口徽标。
  React.useEffect(() => { void actions.initialize() }, [actions, channels])

  // 监听窗口宽度，窄屏切换为单栏。
  React.useEffect(() => {
    const handleResize = (): void => setNarrow(window.innerWidth < NARROW_BREAKPOINT_PX)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-content-area outline-none"
      data-profer-navigation-region="content-review"
      tabIndex={-1}
    >
      {/* 标题栏拖拽区（本页全屏取代 TabBar；Windows 窗口按钮前结束，避免高 DPI 点击误判） */}
      <div
        className="absolute inset-x-0 top-0 z-0 h-14 titlebar-drag-region"
        style={{ right: resolveWindowControlsRightInset(isWindows) }}
        aria-hidden="true"
      />
      {/* 窗口按钮宿主：priority 20 高于 MainArea 兜底(5)，全屏视图接管最小化/最大化/关闭 */}
      <WindowControlsHost id="content-review" priority={20} className="absolute right-2 top-[3px] z-20" />

      {/* ===== 顶栏 ===== */}
      {/* Windows 下右侧为窗口按钮（最小化/最大化/关闭）预留 safe width，顶栏右端按钮簇不得伸入其下，
          否则被 z-20 的 WindowControlsHost 盖住无法点击（见 window-controls-layout.ts 的共用宽度约定） */}
      <header
        className="relative z-10 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/60 bg-card/80 px-4 py-2.5 titlebar-no-drag backdrop-blur-sm"
        style={isWindows ? { paddingRight: resolveWindowControlsRightInset(isWindows) + 12 } : undefined}
      >
        <div className="flex items-center gap-2">
          <ClipboardCheck size={16} className="text-primary" />
          <span className="text-[13px] font-semibold">材料审核智能体</span>
          {/* 演示徽标 */}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">演示版</span>
          {/* 出口状态徽标 */}
          <GatewayBadge status={gatewayStatus} />
        </div>

        {/* 案卷信息 */}
        {reviewCase && (
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <FileText size={12} className="shrink-0" />
            <span className="truncate" title={reviewCase.title}>
              {reviewCase.applicant} · {reviewCase.academicYear}
            </span>
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-3 text-[13px]"
            onClick={() => void actions.loadDemoCase()}
          >
            <RotateCcw size={13} />
            载入演示案卷
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-3 text-[13px]"
            disabled={exporting || running || !run || run.status !== 'completed' || runStale}
            onClick={() => void handleExport()}
          >
            <Download size={13} />
            导出报告
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="打开审核助手（Ctrl+Shift+A）"
            title={`审核助手（${navigator.platform.startsWith('Mac') ? '⌘⇧A' : 'Ctrl+Shift+A'}）`}
            onClick={() => assistantOpen((previous) => !previous)}
          >
            <MessageCircle size={15} />
          </Button>
        </div>
      </header>

      {/* ===== 窄屏：顶部三按钮切换栏 ===== */}
      {narrow && (
        <nav
          role="tablist"
          aria-label="工作台栏目"
          className="flex shrink-0 items-center gap-1 border-b border-border/60 bg-card/60 px-3 py-1.5 titlebar-no-drag"
        >
          <PaneTab label="审核依据" icon={<FileText size={13} />} active={activePane === 'left'} onClick={() => setActivePane('left')} />
          <PaneTab label="申请与证明" icon={<Layers size={13} />} active={activePane === 'center'} onClick={() => setActivePane('center')} />
          <PaneTab label="AI 审核员" icon={<Gavel size={13} />} active={activePane === 'right'} onClick={() => setActivePane('right')} />
        </nav>
      )}

      {/* ===== 三栏主体 ===== */}
      <main className="relative flex min-h-0 flex-1 titlebar-no-drag">
        <PaneWrapper
          pane="left"
          className="flex-[3]"
          narrow={narrow}
          active={activePane}
          showSeparator={!narrow}
        >
          <LeftPanel actions={actions} />
        </PaneWrapper>
        <PaneWrapper
          pane="center"
          className="flex-[4]"
          narrow={narrow}
          active={activePane}
          showSeparator={!narrow}
        >
          <CenterPanel actions={actions} />
        </PaneWrapper>
        <PaneWrapper pane="right" className="flex-[3]" narrow={narrow} active={activePane} showSeparator={false}>
          <RightPanel actions={actions} />
        </PaneWrapper>
      </main>

      {/* ===== 助手抽屉（fixed 到本视图根） ===== */}
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
      <V2CasePanel />
      <TemplateWizardPanel />
    </div>
  )
}
