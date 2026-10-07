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
import { BookOpen, FileText } from 'lucide-react'
import {
  documentsByRoleAtom,
  reviewCaseAtom,
} from '@/atoms/review-atoms'
import type { ReviewActions } from './use-review-actions'
import { RuleOutlineList } from './RuleOutlineList'
import { SourceBlockView } from './SourceBlockView'

interface LeftPanelProps {
  actions: ReviewActions
}

export function LeftPanel({ actions }: LeftPanelProps): React.ReactElement {
  const reviewCase = useAtomValue(reviewCaseAtom)
  const documentsByRole = useAtomValue(documentsByRoleAtom)

  const ruleDocuments = documentsByRole.rule
  const rulePacks = reviewCase?.rulePacks ?? []

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      {/* 头部 */}
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-500" />
          <h2 className="text-[13px] font-semibold text-foreground">审核依据</h2>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText size={12} className="shrink-0" />
          <span className="truncate">{ruleDocuments.length ? `${ruleDocuments.length} 份依据材料` : '尚未载入依据材料'}</span>
        </p>
      </header>

      {/* 规则文档全文（SourceBlockView 列表，只读；蓝色高亮定位落点） */}
      {ruleDocuments.map((ruleDocument) => (
        <section key={ruleDocument.id} className="shrink-0 px-3 py-3">
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            依据原文 · {ruleDocument.fileName}
          </p>
          <div className="space-y-0.5 rounded-lg border border-border/60 bg-card p-1 shadow-sm">
            {ruleDocument.blocks.map((block) => (
              <SourceBlockView key={block.id} document={ruleDocument} block={block} />
            ))}
          </div>
          {ruleDocument.parseError && <p className="mt-2 text-xs text-amber-600">{ruleDocument.parseError}</p>}
        </section>
      ))}

      {/* 规则摘要（开始审核时自动准备） */}
      <section className="shrink-0 px-3 pb-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            规则摘要
          </p>
        </div>
        {rulePacks.length === 0 && <RuleOutlineList outline={[]} onLocate={actions.locateRuleAnchor} />}
        {rulePacks.map((pack) => (
          <div key={pack.id} className="mb-3">
            <p className="mb-2 text-xs font-medium">{pack.name} · {pack.version}</p>
            <RuleOutlineList outline={pack.outline} onLocate={actions.locateRuleAnchor} />
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
