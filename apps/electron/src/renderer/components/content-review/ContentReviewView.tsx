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
 * - 挂载时 actions.initialize()：刷新案卷列表 + 模型出口自检（工具栏徽标）。
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
  Home,
  FolderOpen,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { ReviewFirstUseReadiness } from '@/components/onboarding/ReviewFirstUseReadiness'
import { humanizeReviewError } from './review-error-text'
import { isEditableTarget } from '@/lib/navigation-controller'
import {
  reviewActivePaneAtom,
  reviewAssistantOpenAtom,
  reviewCaseAtom,
  selectedCaseIdAtom,
  reviewErrorAtom,
  reviewGatewayStatusAtom,
  reviewRunAtom,
  reviewRunStaleAtom,
  reviewRunningAtom,
  reviewWorkspaceSectionAtom,
} from '@/atoms/review-atoms'
import { channelsAtom } from '@/atoms/conversation-atoms'
import type { ReviewModelGatewayStatus } from '@profer/shared'
import { cn } from '@/lib/utils'
import { AssistantDrawer } from './AssistantDrawer'
import { CenterPanel } from './CenterPanel'
import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { reviewV2AggregateAtom, V2CasePanel, type ReviewCaseStep } from './V2CasePanel'
import { ReviewV3T10WorkspaceOverview } from './ReviewV3T10WorkspaceOverview'
import { TemplateWizardPanel } from './TemplateWizardPanel'
import { ReviewV3LocalCandidateWorkbench } from './ReviewV3LocalCandidateWorkbench'
import { BatchPanel } from './BatchPanel'
import { ReviewV3T07Workbench } from './ReviewV3T07Workbench'
import { useReviewActions } from './use-review-actions'
import { ReviewCaseHome } from './ReviewCaseHome'

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
  const section = useAtomValue(reviewWorkspaceSectionAtom)
  const setSection = useSetAtom(reviewWorkspaceSectionAtom)
  const setV2Aggregate = useSetAtom(reviewV2AggregateAtom)
  const businessAggregate = useAtomValue(reviewV2AggregateAtom)
  const channels = useAtomValue(channelsAtom)
  const activePane = useAtomValue(reviewActivePaneAtom)
  const setActivePane = useSetAtom(reviewActivePaneAtom)
  const assistantOpen = useSetAtom(reviewAssistantOpenAtom)

  const actions = useReviewActions()

  const [narrow, setNarrow] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth < NARROW_BREAKPOINT_PX,
  )
  const [exporting, setExporting] = React.useState(false)
  const [quickCaseId, setQuickCaseId] = React.useState<string | null>(null)
  const [caseStep, setCaseStep] = React.useState<ReviewCaseStep>('materials')
  const [caseLoading, setCaseLoading] = React.useState(false)
  const caseOpenGeneration = React.useRef(0)
  const setCurrentCase = useSetAtom(reviewCaseAtom)
  const setSelectedCaseId = useSetAtom(selectedCaseIdAtom)

  /**
   * 案卷唯一进入路径：先从 Main 读取真实聚合，再选择 V1 投影（若存在）。
   * V2-only 原生案卷仍可办理，不能为了三栏兼容而假设它有 V1 投影。
   */
  const openCase = React.useCallback(async (caseId: string): Promise<boolean> => {
    const generation = ++caseOpenGeneration.current
    setCaseLoading(true)
    try {
      // 先确认是否存在旧三栏兼容案卷；旧版存储迁移依赖 selectCase。
      const legacy = await window.reviewAPI.getCase(caseId)
      if (generation !== caseOpenGeneration.current) return false
      if (legacy) {
        const selected = await actions.selectCase(caseId)
        if (!selected) throw new Error('案卷切换未成功')
        if (generation !== caseOpenGeneration.current) return false
      }
      const aggregate = await window.reviewAPI.openAggregateV2(caseId)
      if (generation !== caseOpenGeneration.current) return false
      if (!aggregate || aggregate.caseV2.id !== caseId) {
        if (!legacy) throw new Error('案卷业务记录不存在')
        // 少量未迁移 V1 案卷仍然可以使用旧审核工作台，不能从首页变成打不开的孤案。
        setV2Aggregate(null)
        setSection('workbench')
        return true
      }
      if (!legacy) {
        // V2-only 原生案卷没有旧投影，但依旧以 V2 真实案卷为工作上下文。
        setCurrentCase(null)
        setSelectedCaseId(caseId)
        try { await actions.refreshBackgroundReview(caseId) }
        catch (cause) { console.error('[材料审核] 原生案卷工作区投影暂不可用', cause) }
      }
      if (generation !== caseOpenGeneration.current) return false
      setV2Aggregate(aggregate)
      setQuickCaseId(caseId)
      setCaseStep('materials')
      setSection('case-v2')
      return true
    } catch (cause) {
      if (generation === caseOpenGeneration.current) toast.error('打开审核案卷失败：' + (cause instanceof Error ? cause.message : String(cause)))
      return false
    } finally {
      if (generation === caseOpenGeneration.current) setCaseLoading(false)
    }
  }, [actions, setCurrentCase, setSelectedCaseId, setSection, setV2Aggregate])

  const goHome = React.useCallback((): void => {
    // 返首页同时撤销尚未完成的页面开案导航；不取消 Main 中的任务。
    caseOpenGeneration.current += 1
    setCaseLoading(false)
    setSection('home')
  }, [setSection])

  const openBusinessCase = React.useCallback(async (step: ReviewCaseStep = caseStep): Promise<void> => {
    setCaseStep(step)
    if (businessAggregate) {
      // 从其他工作区返回本案时重读 Main，不拿导航前的旧聚合继续办理。
      if (await openCase(businessAggregate.caseV2.id)) setCaseStep(step)
      return
    }
    if (reviewCase) {
      if (await openCase(reviewCase.id)) setCaseStep(step)
      return
    }
    setSection('home')
  }, [businessAggregate, caseStep, openCase, reviewCase, setSection])

  const openPane = React.useCallback((pane: Pane): void => {
    setActivePane(pane)
    if (reviewCase && businessAggregate?.caseV2.id === reviewCase.id) setSection('workbench')
    else { setCaseStep(pane === 'right' ? 'decision' : 'materials'); setSection('case-v2') }
  }, [businessAggregate?.caseV2.id, reviewCase, setActivePane, setSection])

  const handleExport = async (): Promise<void> => {
    setExporting(true)
    try {
      const result = await actions.exportReport()
      if (result) toast.success('预审报告已导出', { description: result.markdownPath })
    } finally {
      setExporting(false)
    }
  }

  // 旧业务面板里的开案、补件、决定仍使用原有事务；
  // 只在该面板激活时把最新聚合反映到同一案卷的审核工作台，不复制造库逻辑。
  React.useEffect(() => {
    if (section !== 'case-v2' || !businessAggregate || reviewCase?.id === businessAggregate.caseV2.id) return
    // V2-only 案卷可能没有旧三栏投影，这时保持业务案卷而非错误地选中另一份案卷。
    void window.reviewAPI.getCase(businessAggregate.caseV2.id).then((legacy) => {
      if (legacy) void actions.selectCase(businessAggregate.caseV2.id)
    }).catch((error) => console.error('[材料审核] 读取三栏兼容投影失败', error))
  }, [section, businessAggregate?.caseV2.id, reviewCase?.id, actions])

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
            <Button size="sm" variant={section === 'home' ? 'secondary' : 'ghost'}
              className="h-8 gap-1.5 px-3 text-xs" aria-pressed={section === 'home'} onClick={goHome}>
              <Home size={14} />首页
            </Button>
            <Button size="sm" variant={section === 'case-v2' || section === 'workbench' ? 'secondary' : 'ghost'}
              className="h-8 gap-1.5 px-3 text-xs" disabled={caseLoading}
              onClick={() => void openBusinessCase()}>
              <FolderOpen size={14} />当前案卷
            </Button>
            <Button size="sm" variant={section === 'batches' ? 'secondary' : 'ghost'}
              className="h-8 px-3 text-xs" onClick={() => setSection('batches')}>批量审核</Button>
            <Button size="sm" variant={section === 'templates' ? 'secondary' : 'ghost'}
              className="h-8 px-3 text-xs" onClick={() => setSection('templates')}>模板管理</Button>
          </nav>

          {(section === 'case-v2' || section === 'workbench' || section === 'local-candidates') && reviewCase && reviewCase.id === businessAggregate?.caseV2.id && (
            <div className="flex min-w-0 items-center gap-1.5 rounded-md bg-foreground/[0.04] px-2 py-1 text-xs text-muted-foreground">
              <FileText size={12} className="shrink-0 text-foreground/60" />
              <span className="max-w-[260px] truncate" title={reviewCase.title}>
                {reviewCase.title}{reviewCase.applicant ? ` · ${reviewCase.applicant}` : ''}
              </span>
            </div>
          )}
          {(section === 'case-v2' || section === 'local-candidates') && businessAggregate && reviewCase?.id !== businessAggregate.caseV2.id && (
            <div className="max-w-[300px] truncate rounded-md bg-foreground/[0.04] px-2 py-1 text-xs text-muted-foreground" title={businessAggregate.caseV2.title}>
              {businessAggregate.caseV2.title}
            </div>
          )}
        </div>

        {/* 右侧：出口状态徽标 + 业务操作按钮 */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {section !== 'home' && <Button type="button" size="sm" variant="outline"
            className="h-7 gap-1 px-2 text-xs" onClick={goHome}>
            <ArrowLeft size={13} />返回首页 / 换案
          </Button>}
          <GatewayBadge status={gatewayStatus} />
          {(section === 'case-v2' || section === 'workbench') && <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            disabled={caseLoading || exporting || running || (!businessAggregate && (!run || run.status !== 'completed' || runStale))}
            onClick={() => businessAggregate ? void openBusinessCase('report') : void handleExport()}
          >
            <Download size={12} />
            <span>{businessAggregate ? '查看与导出报告' : '导出报告'}</span>
          </Button>}
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

      {section === 'workbench' && <ReviewV3T10WorkspaceOverview
        onOpenReview={() => openPane('left')}
        onOpenMaterials={() => openPane('center')}
        onOpenTasks={() => openPane('right')}
        onOpenTemplates={() => setSection('templates')}
        onOpenBusiness={() => void openBusinessCase('decision')}
      />}

      {section === 'local-candidates' && (
        <nav aria-label="模板工作区" className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card/40 px-4 py-1.5 titlebar-no-drag">
          <Button type="button" data-testid="review-section-templates" size="sm" variant={section === 'templates' ? 'secondary' : 'ghost'} className="h-7 text-xs" onClick={() => setSection('templates')}>模板库与业务配置</Button>
          <Button type="button" data-testid="review-section-local-candidates" size="sm" variant={section === 'local-candidates' ? 'secondary' : 'ghost'} className="h-7 text-xs" onClick={() => setSection('local-candidates')}>审核方案与试跑</Button>
          <Button type="button" data-testid="review-publish-demo-templates" size="sm" variant="outline" className="h-7 text-xs"
            disabled={demoPublishing}
            onClick={() => void publishDemoTemplates()}>
            {demoPublishing ? '发布中…' : '发布 50 套模板'}
          </Button>
          
        </nav>
      )}

      {/* 首页永远可返回；即使后台已恢复旧案，也允许立即导入新材料。 */}
      <main className={cn('min-h-0 flex-1 overflow-y-auto titlebar-no-drag', section !== 'home' && 'hidden')}>
        <ReviewCaseHome active={section === 'home'} onOpenCase={openCase} />
      </main>

      {(section === 'case-v2' || section === 'workbench') && businessAggregate && (
        <nav aria-label="本案操作" className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border/60 bg-card/30 px-4 py-2 titlebar-no-drag">
          <Button size="sm" variant={section === 'case-v2' && caseStep === 'materials' ? 'secondary' : 'ghost'}
            onClick={() => { setCaseStep('materials'); setSection('case-v2') }}>材料与模板</Button>
          <Button size="sm" variant={section === 'case-v2' && caseStep === 'review' ? 'secondary' : 'ghost'}
            onClick={() => { setCaseStep('review'); setSection('case-v2') }}>执行与结果</Button>
          <Button size="sm" variant={section === 'workbench' ? 'secondary' : 'ghost'}
            disabled={!reviewCase || reviewCase.id !== businessAggregate.caseV2.id} onClick={() => setSection('workbench')}>原件交叉核验</Button>
          <Button size="sm" variant={section === 'case-v2' && caseStep === 'decision' ? 'secondary' : 'ghost'}
            onClick={() => { setCaseStep('decision'); setSection('case-v2') }}>待办与办理</Button>
          <Button size="sm" variant={section === 'case-v2' && caseStep === 'report' ? 'secondary' : 'ghost'}
            onClick={() => { setCaseStep('report'); setSection('case-v2') }}>报告与记录</Button>
          <Button size="sm" variant={section === 'case-v2' && caseStep === 'advanced' ? 'secondary' : 'ghost'}
            onClick={() => { setCaseStep('advanced'); setSection('case-v2') }}>更多操作</Button>
        </nav>
      )}
      {narrow && section === 'workbench' && (
        <nav role="tablist" aria-label="核验栏目"
          className="flex shrink-0 items-center gap-1 border-b border-border/60 bg-card/60 px-3 py-1.5 titlebar-no-drag">
          <PaneTab label="审核依据" icon={<FileText size={13} />} active={activePane === 'left'} onClick={() => setActivePane('left')} />
          <PaneTab label="申请与证明" icon={<Layers size={13} />} active={activePane === 'center'} onClick={() => setActivePane('center')} />
          <PaneTab label="AI 审核员" icon={<Gavel size={13} />} active={activePane === 'right'} onClick={() => setActivePane('right')} />
        </nav>
      )}
      <main className={cn('relative flex min-h-0 flex-1 titlebar-no-drag', section !== 'workbench' && 'hidden')}>
        {reviewCase && businessAggregate?.caseV2.id === reviewCase.id ? <>
          <PaneWrapper pane="left" className="flex-[3]" narrow={narrow} active={activePane} showSeparator={!narrow}>
            <LeftPanel actions={actions} />
          </PaneWrapper>
          <PaneWrapper pane="center" className="flex-[4]" narrow={narrow} active={activePane} showSeparator={!narrow}>
            <CenterPanel actions={actions} />
          </PaneWrapper>
          <PaneWrapper pane="right" className="flex-[3]" narrow={narrow} active={activePane} showSeparator={false}>
            <RightPanel actions={actions} />
          </PaneWrapper>
        </> : <div className="m-auto space-y-2 p-8 text-center">
          <p className="text-sm text-muted-foreground">这份原生案卷没有旧版三栏兼容视图，请使用本案办理区查看原件与审核结果。</p>
          <Button onClick={() => setSection('case-v2')}>返回本案办理</Button>
        </div>}
      </main>

      <section aria-label="案卷审核办理" className={cn('relative min-h-0 flex-1 overflow-auto py-3 titlebar-no-drag', section !== 'case-v2' && 'hidden')}>
        <V2CasePanel step={caseStep} onStepChange={setCaseStep} onCaseOpened={(caseId) => { void openCase(caseId) }} />
      </section>
      <section aria-label="审核模板管理" className={cn('relative min-h-0 flex-1 overflow-auto py-3 titlebar-no-drag', section !== 'templates' && 'hidden')}>
        <TemplateWizardPanel />
      </section>
      <section aria-label="候选方案高级工作台" className={cn('relative min-h-0 flex-1 overflow-auto py-3 titlebar-no-drag', section !== 'local-candidates' && 'hidden')}>
        <ReviewV3LocalCandidateWorkbench initialCaseId={quickCaseId ?? undefined} />
      </section>
      <section aria-label="审核批次管理" className={cn('relative min-h-0 flex-1 overflow-auto py-3 titlebar-no-drag', section !== 'batches' && 'hidden')}>
        <BatchPanel active={section === 'batches'} onOpenProject={openCase} />
        <div className="mt-4 border-t border-border/60 pt-3"><ReviewV3T07Workbench /></div>
      </section>

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
    </div>
  )
}
