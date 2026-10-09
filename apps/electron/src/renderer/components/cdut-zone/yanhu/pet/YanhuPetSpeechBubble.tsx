/**
 * 砚小龙 · 灵动说话气泡（YanhuPetSpeechBubble）
 *
 * 位于伴随输入条正上方的轻量精致卡片，带漫画式小尖角指向桌宠：
 *   - 闲置态：展示萌系问候（点击可换一句；打哈欠时切换为趣味闲聊）；
 *   - 执行态：动态流式展示「正在读屏 / 正在点击【目标】」等微胶囊动作；
 *   - 回复态：直接展示 AI 最新一轮的简明结论；
 *   - 右上角集成【展开历史】/【收起】快捷操作。
 */

import * as React from 'react'
import { ChevronDown, ChevronUp, Minus, Sparkles } from 'lucide-react'
import type { YanhuPetMessageUsage, YanhuPetToolInvocation } from '@profer/shared'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@profer/ui/primitives/tooltip'
import { MessageResponse } from '@/components/ai-elements/message'

/** 静息问候语 */
const IDLE_GREETINGS = [
  '你好呀！有什么想让我帮你查的吗？',
  '我是砚小龙 🐉 教务、办事大厅都能帮你跑腿～',
  '需要查课表、成绩还是空教室？直接告诉我就行！',
  '点旁边的输入框，吩咐我去操作校网吧～',
  '今天想去图书馆还是查考务？我都熟门熟路！',
]

/** 打哈欠趣味闲聊 */
const SLEEPY_LINES = [
  '呼……有点困了，需要我做点什么吗？',
  '（打了个哈欠）随时待命哦～',
  '等你很久啦，快派我干活吧！',
]

export interface YanhuPetSpeechBubbleProps {
  /** 气泡内容模式 */
  mode: 'idle' | 'executing' | 'response'
  /** 内容文本（问候 / 最新回复） */
  text: string
  /** 是否正在流式生成 */
  streaming: boolean
  /** 当前执行的工具调用（微胶囊动作流） */
  activeTools: YanhuPetToolInvocation[]
  /** 是否已展开完整历史 */
  historyExpanded: boolean
  /** 最新助手回复的用量统计（可选） */
  usage?: YanhuPetMessageUsage
  /** 是否处于闲置打哈欠状态 */
  sleepy?: boolean
  /** 尖角指向侧（与桌宠相对） */
  tailSide: 'left' | 'right'
  /** 尖角距气泡顶部偏移（px，由宿主精确计算以对准桌宠） */
  tailTop: number
  /** 切换完整历史展开态 */
  onToggleHistory: () => void
  /** 折叠气泡（仅显示桌宠立绘） */
  onHideCard: () => void
}

/** 工具调用微胶囊标签（气泡与历史列表共用） */
export function YanhuToolCapsule({ tool }: { tool: YanhuPetToolInvocation }): React.ReactElement {
  const [open, setOpen] = React.useState(false)
  const tone =
    tool.status === 'error'
      ? 'border-destructive/40 text-destructive'
      : tool.status === 'running'
        ? 'border-primary/40 text-primary'
        : 'border-border/60 text-muted-foreground'
  const detail = React.useMemo(() => {
    const lines: string[] = []
    if (tool.args && Object.keys(tool.args).length > 0) lines.push(`入参: ${JSON.stringify(tool.args)}`)
    if (tool.result != null) {
      lines.push(`出参: ${typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result)}`)
    }
    return lines.join('\n')
  }, [tool.args, tool.result])

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex max-w-full items-center gap-1 truncate rounded-full border bg-background/70 px-2 py-0.5 text-[11px] transition-colors cursor-pointer',
          tone,
          tool.status === 'running' && 'animate-pulse',
        )}
      >
        <span className="truncate">{tool.label}</span>
      </button>
      {open && detail ? (
        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border/50 bg-background/80 p-2 text-[10px] leading-relaxed text-muted-foreground">
          {detail}
        </pre>
      ) : null}
    </div>
  )
}

/** 格式化耗时（与主视图 DurationBadge 显示口径保持一致） */
function formatPetDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toFixed(0)}s`
}

/** 构建用量明细 Tooltip 文本（与主视图用量口径一致） */
function buildPetUsageTooltip(usage: YanhuPetMessageUsage): string {
  const lines: string[] = []
  if (usage.durationMs) lines.push(`耗时: ${formatPetDuration(usage.durationMs)}`)
  const input = usage.inputTokens ?? 0
  if (input > 0) lines.push(`输入: ${input.toLocaleString()}`)
  if (usage.outputTokens) lines.push(`输出: ${usage.outputTokens.toLocaleString()}`)
  if (usage.cacheCreationTokens) lines.push(`缓存写入: ${usage.cacheCreationTokens.toLocaleString()}`)
  if (usage.cacheReadTokens) lines.push(`缓存读取: ${usage.cacheReadTokens.toLocaleString()}`)
  return lines.join('\n')
}

/** 助手回复左下角用量徽章：`{耗时} · {tokens} tokens`，悬停展开明细 */
export function YanhuUsageBadge({ usage }: { usage: YanhuPetMessageUsage }): React.ReactElement | null {
  const durationMs = usage.durationMs
  const totalTokens = usage.totalTokens
  if (!durationMs && !totalTokens) return null
  const summary = [
    durationMs ? formatPetDuration(durationMs) : null,
    totalTokens ? `${totalTokens.toLocaleString()} tokens` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block cursor-default text-[10px] font-light tabular-nums text-muted-foreground/70">
          {summary}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="whitespace-pre-line text-left">{buildPetUsageTooltip(usage)}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function YanhuPetSpeechBubble({
  mode,
  text,
  streaming,
  activeTools,
  historyExpanded,
  usage,
  sleepy = false,
  tailSide,
  tailTop,
  onToggleHistory,
  onHideCard,
}: YanhuPetSpeechBubbleProps): React.ReactElement {
  const [greetingIndex, setGreetingIndex] = React.useState(() => Math.floor(Math.random() * IDLE_GREETINGS.length))

  const greetingPool = sleepy ? SLEEPY_LINES : IDLE_GREETINGS
  const greeting = greetingPool[greetingIndex % greetingPool.length]

  const statusLabel = streaming
    ? '正在执行…'
    : mode === 'idle'
      ? '待命中'
      : '最新回复'

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl">
      {/* 尖角 */}
      <span
        aria-hidden
        className={cn(
          'absolute h-3 w-3 rotate-45 rounded-[2px] border-border/80 bg-card',
          tailSide === 'left' ? 'border-b border-l' : 'border-t border-r',
        )}
        style={
          tailSide === 'left'
            ? { left: -7, top: Math.max(10, tailTop) }
            : { right: -7, top: Math.max(10, tailTop) }
        }
      />

      {/* 顶栏 */}
      <div className="flex shrink-0 items-center justify-between px-3 py-2 select-none">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', streaming ? 'animate-pulse bg-primary' : 'bg-emerald-500')} />
          <span className="text-[11px] font-semibold text-foreground">砚小龙</span>
          <span className="text-[10px] text-muted-foreground">{statusLabel}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleHistory}
            title={historyExpanded ? '收起历史' : '展开完整历史'}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground cursor-pointer"
          >
            {historyExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            {historyExpanded ? '收起' : '历史'}
          </button>
          <button
            type="button"
            onClick={onHideCard}
            title="折叠气泡（仅显示桌宠）"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2.5 select-text">
        {mode === 'idle' ? (
          <button
            type="button"
            onClick={() => setGreetingIndex((i) => i + 1)}
            className="flex h-full w-full items-center gap-1.5 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:text-foreground cursor-pointer select-none"
            title="点我换一句"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span>{greeting}</span>
          </button>
        ) : null}

        {mode === 'executing' ? (
          <div className="space-y-1.5">
            <div className="text-xs leading-relaxed text-foreground">{text || '正在读屏，分析页面结构…'}</div>
            {activeTools.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {activeTools.map((tool) => (
                  <YanhuToolCapsule key={tool.id} tool={tool} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {mode === 'response' ? (
          <div className="text-xs leading-relaxed text-foreground">
            <MessageResponse className="prose-p:my-0.5 prose-headings:my-1.5">{text}</MessageResponse>
            {usage ? (
              <div className="mt-1 flex justify-start">
                <YanhuUsageBadge usage={usage} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
