/**
 * RuleOutlineList — AI 规则大纲列表（左栏）
 *
 * 按 category 分组、Collapsible 可展开；每条显示 title/summary 与来源徽标
 * （ai → "AI 提取"、fixture → "预置"、manual → "手工"）。
 * 点击条目 → actions.locateRuleAnchor(anchors) → reviewRuleLocateAtom → 左栏规则原文蓝色高亮定位。
 */

import * as React from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@profer/ui/primitives/collapsible'
import type { RuleOutlineCategory, RuleOutlineItem } from '@profer/shared'
import { cn } from '@/lib/utils'

/** 来源徽标文案 */
const GENERATED_BY_LABELS: Record<RuleOutlineItem['generatedBy'], string> = {
  ai: 'AI 提取',
  fixture: '预置',
  manual: '手工',
}

interface RuleOutlineListProps {
  outline: RuleOutlineItem[]
  /** 点击条目 → 定位规则原文（左栏蓝色高亮） */
  onLocate: (anchors: RuleOutlineItem['anchors']) => void
}

export function RuleOutlineList({ outline, onLocate }: RuleOutlineListProps): React.ReactElement {
  // 按 category 分组（保持 outline 原顺序）
  const groups = React.useMemo(() => {
    const map = new Map<RuleOutlineCategory, RuleOutlineItem[]>()
    for (const item of outline) {
      const list = map.get(item.category)
      if (list) list.push(item)
      else map.set(item.category, [item])
    }
    return Array.from(map.entries())
  }, [outline])

  if (outline.length === 0) {
    return <p className="px-1 py-3 text-xs text-muted-foreground">尚未生成规则大纲，点上方按钮从依据材料提取。</p>
  }

  return (
    <div className="space-y-3">
      {groups.map(([category, items]) => (
        <OutlineGroup key={category} category={category} items={items} onLocate={onLocate} />
      ))}
    </div>
  )
}

interface OutlineGroupProps {
  category: RuleOutlineCategory
  items: RuleOutlineItem[]
  onLocate: (anchors: RuleOutlineItem['anchors']) => void
}

function OutlineGroup({ category, items, onLocate }: OutlineGroupProps): React.ReactElement {
  // 默认展开（规则条目不多，demo 场景全展开更便于演示）
  const [open, setOpen] = React.useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-border/60 bg-card shadow-sm">
      <CollapsibleTrigger
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-foreground/[0.03] focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-expanded={open}
      >
        <ChevronDown size={14} className={cn('shrink-0 text-muted-foreground transition-transform', open ? 'rotate-0' : '-rotate-90')} />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{category}</span>
        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border/50">
        <div className="space-y-1 p-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onLocate(item.anchors)}
              title="定位到规则原文"
              className="flex w-full flex-col gap-1 rounded-md px-2 py-2 text-left transition-colors hover:bg-blue-500/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-1.5">
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{item.title}</span>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                    item.generatedBy === 'ai'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : item.generatedBy === 'fixture'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  )}
                >
                  {item.generatedBy === 'ai' && <Sparkles size={10} className="mr-0.5 inline" />}
                  {GENERATED_BY_LABELS[item.generatedBy]}
                </span>
              </span>
              <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">{item.summary}</span>
            </button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
