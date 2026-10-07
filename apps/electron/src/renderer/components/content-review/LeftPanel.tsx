/**
 * LeftPanel — 左栏「审核依据」
 *
 * 结构：
 * - 顶部：当前审核依据和规则内容
 * - 头部：栏目名 + 规则文档名
 * - 规则文档全文（SourceBlockView 列表，只读；问题卡/大纲定位的蓝色高亮落点）
 * - AI 规则大纲区：生成按钮（busy 时 spinner）→ RuleOutlineList
 * - 底部：规则包元数据（发布单位 / 适用学年 / 版本）
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { BookOpen, FileText, ShieldCheck } from 'lucide-react'
import {
  documentsByRoleAtom,
  reviewCaseAtom,
  reviewRuleLocateAtom,
} from '@/atoms/review-atoms'
import type { ReviewActions } from './use-review-actions'
import { RuleOutlineList } from './RuleOutlineList'
import { SourceBlockView } from './SourceBlockView'
import { MoveReviewDocumentButtons, RemoveReviewDocumentButton, ReviewMaterialLaneActions } from './ReviewMaterialControls'

interface LeftPanelProps {
  actions: ReviewActions
}

export function LeftPanel({ actions }: LeftPanelProps): React.ReactElement {
  const reviewCase = useAtomValue(reviewCaseAtom)
  const documentsByRole = useAtomValue(documentsByRoleAtom)
  const ruleLocate = useAtomValue(reviewRuleLocateAtom)
  const documentDetails = React.useRef(new Map<string, HTMLDetailsElement>())

  const ruleDocuments = documentsByRole.rule
  const rulePacks = reviewCase?.rulePacks ?? []

  React.useEffect(() => {
    if (!ruleLocate) return
    const target = ruleLocate.anchors.find((anchor) => documentDetails.current.has(anchor.documentId))
    if (target) documentDetails.current.get(target.documentId)!.open = true
  }, [ruleLocate?.nonce])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      {/* 头部 */}
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <BookOpen size={16} className="shrink-0 text-blue-500" />
            <h2 className="truncate text-[13px] font-semibold text-foreground">审核依据</h2>
          </div>
          <ReviewMaterialLaneActions role="rule" documentIds={ruleDocuments.map((document) => document.id)} actions={actions} />
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText size={12} className="shrink-0" />
          <span className="truncate">{ruleDocuments.length ? `${ruleDocuments.length} 份依据材料` : '尚未载入依据材料'}</span>
        </p>
      </header>

      {/* 规则文档全文（SourceBlockView 列表，只读；蓝色高亮定位落点） */}
      {ruleDocuments.map((ruleDocument) => (
        <section key={ruleDocument.id} className="shrink-0 px-3 py-3">
          <div className="flex items-center gap-1 pb-2">
            <p className="min-w-0 flex-1 truncate px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground" title={ruleDocument.fileName}>
              依据原文 · {ruleDocument.fileName}
            </p>
            <MoveReviewDocumentButtons role="rule" documentIds={ruleDocuments.map((document) => document.id)} documentId={ruleDocument.id} actions={actions} />
            <RemoveReviewDocumentButton document={ruleDocument} actions={actions} />
          </div>
          <details ref={(element) => {
            if (element) documentDetails.current.set(ruleDocument.id, element)
            else documentDetails.current.delete(ruleDocument.id)
          }} className="rounded-lg border border-border/60 bg-card p-1 shadow-sm">
            <summary className="cursor-pointer rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/50">查看原文（{ruleDocument.blocks.length} 段）</summary>
            <div className="mt-1 max-h-[48vh] space-y-0.5 overflow-y-auto scrollbar-thin">
              {ruleDocument.blocks.map((block) => (
                <SourceBlockView key={block.id} document={ruleDocument} block={block} />
              ))}
            </div>
          </details>
          {ruleDocument.parseError && <p className="mt-2 text-xs text-amber-600">{ruleDocument.parseError}</p>}
        </section>
      ))}
      {ruleDocuments.length === 0 && (
        <p className="mx-3 mt-3 rounded-lg border border-dashed border-border/60 px-3 py-5 text-center text-xs text-muted-foreground">
          在这里添加评分细则、管理办法等审核依据。
        </p>
      )}

      {/* 规则摘要先由审核员对照原文确认，再用于 V2 语义检查。 */}
      <section className="shrink-0 px-3 pb-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            规则摘要
          </p>
        </div>
        {rulePacks.length === 0 && <RuleOutlineList outline={[]} onLocate={actions.locateRuleAnchor} />}
        {rulePacks.map((pack) => (
          <div key={pack.id} className="mb-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium">{pack.name} · {pack.version}</p>
              <span className={pack.confirmed ? 'shrink-0 text-[10px] text-green-600 dark:text-green-400' : 'shrink-0 text-[10px] text-amber-600 dark:text-amber-400'}>{pack.confirmed ? '已确认' : '待对照原文确认'}</span>
            </div>
            <RuleOutlineList outline={pack.outline} onLocate={actions.locateRuleAnchor} />
            {pack.outline.length > 0 && !pack.confirmed && (
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2.5">
                <p className="text-[11px] leading-4 text-muted-foreground">对照上方原文检查 AI 提取的规则摘要。确认后，这些规则将用于本次审核。</p>
                <button type="button" onClick={() => void actions.confirmRulePack(pack.id)} className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90">
                  <ShieldCheck size={13} />确认审核依据
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* 底部：规则包元数据 */}
      {rulePacks.length > 0 && (
        <footer className="mt-auto shrink-0 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          <p>适用学年：{reviewCase?.academicYear}</p>
          <p className="mt-0.5">共 {rulePacks.length} 份审核依据；开始审核时会自动准备规则摘要。</p>
        </footer>
      )}
    </div>
  )
}
