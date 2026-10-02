/**
 * CenterPanel — 中栏「申请与证明」
 *
 * 结构：
 * - 头部：栏目名 + 条目统计（N 条 / M 份证明）
 * - AI 识别条目区：识别按钮（busy 时 spinner）→ 条目卡列表
 *   每张条目卡：标题 / 类别 badge / 申报分数 / 日期 / 组织方 + 关联证据缩略名 + 该条 findings 的红/黄圆点
 *   + 卡下方直接渲染该条目的申报原文行（SourceBlockView dense）
 *   点击条目卡 → 写 reviewFocusAtom 定位其申报行（severity 取该条最高严重度）
 * - 证明区：每份证据一张卡（文件名 + recognizedFacts + parseStatus badge + 关联条目名）。
 *   按 T6 简化决定（决策日志 #16）：不渲染 SVG 原图，以识别事实与状态徽标为准。
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { Award, FileSearch, Layers } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { Spinner } from '@profer/ui/primitives/spinner'
import type {
  EvidenceDocument,
  EvidenceParseStatus,
  FindingSeverity,
  ReviewFinding,
  ReviewItem,
} from '@profer/shared'
import {
  currentEvidencesAtom,
  currentItemsAtom,
  documentsByRoleAtom,
  findBlockByAnchor,
  reviewBusyAtom,
  reviewRunAtom,
} from '@/atoms/review-atoms'
import { cn } from '@/lib/utils'
import type { ReviewActions } from './use-review-actions'
import { SourceBlockView } from './SourceBlockView'

/** 证明识别状态 → 徽标样式/文案 */
const EVIDENCE_STATUS: Record<EvidenceParseStatus, { label: string; className: string }> = {
  recognized: { label: '已识别', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  unclear: { label: '看不清', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  unrecognized: { label: '未识别', className: 'bg-muted text-muted-foreground' },
}

interface CenterPanelProps {
  actions: ReviewActions
}

export function CenterPanel({ actions }: CenterPanelProps): React.ReactElement {
  const items = useAtomValue(currentItemsAtom)
  const evidences = useAtomValue(currentEvidencesAtom)
  const documentsByRole = useAtomValue(documentsByRoleAtom)
  const run = useAtomValue(reviewRunAtom)
  const busy = useAtomValue(reviewBusyAtom)

  const applicationDocument = documentsByRole.application[0]

  /** 按条目聚合 findings（联动圆点 + 最高严重度用） */
  const findingsByItemId = React.useMemo(() => {
    const map = new Map<string, ReviewFinding[]>()
    if (!run) return map
    for (const finding of run.findings) {
      const list = map.get(finding.itemId)
      if (list) list.push(finding)
      else map.set(finding.itemId, [finding])
    }
    return map
  }, [run])

  /** 点击条目卡：写 focus 定位申报行（severity 取该条最高严重度；无发现时按黄=待确认处理） */
  const handleItemClick = (item: ReviewItem): void => {
    const itemFindings = findingsByItemId.get(item.id) ?? []
    const severity: FindingSeverity = itemFindings.some((f) => f.severity === 'red') ? 'red' : 'yellow'
    actions.focusFinding({
      id: `item-focus-${item.id}`,
      itemId: item.id,
      kind: 'info-incomplete',
      severity,
      title: item.title,
      detail: '',
      suggestion: 'manual-review',
      suggestionText: '',
      subjectAnchor: item.anchor,
      ruleAnchors: [],
      ruleItemIds: [],
      generatedBy: 'fixture',
    }, { select: false })
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      {/* 头部：栏目名 + 统计 */}
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-primary" />
          <h2 className="text-[13px] font-semibold text-foreground">申请与证明</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length} 条 / {evidences.length} 份证明
        </p>
      </header>

      {/* AI 识别条目 */}
      <section className="shrink-0 px-3 py-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            AI 识别条目
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy.items}
            onClick={() => void actions.extractItems()}
            className="h-7 gap-1.5 px-2 text-[13px]"
          >
            {busy.items ? <Spinner size="sm" /> : <FileSearch size={13} />}
            {busy.items ? '识别中…' : items.length > 0 ? '重新识别' : '识别条目'}
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
            尚未识别条目，点上方按钮从申报表提取。
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const itemFindings = findingsByItemId.get(item.id) ?? []
              const evidenceNames = item.evidenceDocumentIds
                .map((documentId) => documentsByRole.evidence.find((doc) => doc.id === documentId)?.fileName)
                .filter((name): name is string => Boolean(name))
              const itemBlock = findBlockByAnchor(documentsByRole.application, item.anchor)

              return (
                <div key={item.id} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                  {/* 条目卡主体（整卡可点击定位） */}
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="flex w-full flex-col gap-1.5 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-foreground/[0.03] focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    title="定位到申报原文行"
                  >
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                        {item.title}
                      </span>
                      {/* 该条 findings 的红/黄小圆点 */}
                      {itemFindings.map((finding) => (
                        <span
                          key={finding.id}
                          title={finding.title}
                          className={cn(
                            'size-2 shrink-0 rounded-full',
                            finding.severity === 'red' ? 'bg-red-500' : 'bg-amber-400',
                          )}
                        />
                      ))}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 font-medium text-blue-600 dark:text-blue-400">
                        {item.category}
                      </span>
                      <span className="tabular-nums">申报 {item.declaredScore} 分</span>
                      {item.activityDate && <span className="tabular-nums">{item.activityDate}</span>}
                      {item.organizer && <span className="truncate">{item.organizer}</span>}
                    </span>
                    {evidenceNames.length > 0 && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        关联证明：{evidenceNames.join('、')}
                      </span>
                    )}
                  </button>

                  {/* 该条目的申报原文行（联动高亮落点） */}
                  {itemBlock && (
                    <div className="mt-1.5 rounded-md bg-muted/40 p-1">
                      <SourceBlockView document={itemBlock.document} block={itemBlock.block} dense />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 证明区 */}
      <section className="shrink-0 px-3 pb-4">
        <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          证明材料
        </p>
        <div className="grid grid-cols-1 gap-2">
          {evidences.map((evidence) => (
            <EvidenceCard
              key={evidence.documentId}
              evidence={evidence}
              fileName={documentsByRole.evidence.find((doc) => doc.id === evidence.documentId)?.fileName ?? evidence.documentId}
              linkedItemTitles={evidence.linkedItemIds.map(
                (itemId) => items.find((item) => item.id === itemId)?.title ?? itemId,
              )}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

interface EvidenceCardProps {
  evidence: EvidenceDocument
  fileName: string
  linkedItemTitles: string[]
}

/** 证明卡：文件名 + 识别事实 + 状态徽标 + 关联条目（按 T6 简化：不渲染原图） */
function EvidenceCard({ evidence, fileName, linkedItemTitles }: EvidenceCardProps): React.ReactElement {
  const status = EVIDENCE_STATUS[evidence.parseStatus]

  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
      {/* 证书占位图标（无原图渲染：以识别事实为准） */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-500 shadow-sm">
        <Award size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground" title={fileName}>
            {fileName}
          </span>
          <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium', status.className)}>
            {status.label}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{evidence.recognizedFacts}</p>
        {linkedItemTitles.length > 0 && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            关联条目：{linkedItemTitles.join('、')}
          </p>
        )}
      </div>
    </div>
  )
}
