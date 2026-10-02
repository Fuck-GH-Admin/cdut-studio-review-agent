/**
 * LeftPanel — 左栏「审核依据」
 *
 * 结构：
 * - 顶部：案卷管理条（选择/新建/导入材料/切换领域包/删除案卷，CaseManagerBar）
 * - 头部：栏目名 + 规则文档名
 * - 规则文档全文（SourceBlockView 列表，只读；问题卡/大纲定位的蓝色高亮落点）
 * - AI 规则大纲区：生成按钮（busy 时 spinner）→ RuleOutlineList
 * - 底部：规则包元数据（发布单位 / 适用学年 / 版本）
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { BookOpen, FileText, Sparkles } from 'lucide-react'
import { Button } from '@profer/ui/primitives/button'
import { Spinner } from '@profer/ui/primitives/spinner'
import {
  currentRuleOutlineAtom,
  documentsByRoleAtom,
  reviewBusyAtom,
  reviewCaseAtom,
} from '@/atoms/review-atoms'
import type { ReviewActions } from './use-review-actions'
import { CaseManagerBar } from './CaseManagerBar'
import { RuleOutlineList } from './RuleOutlineList'
import { SourceBlockView } from './SourceBlockView'

interface LeftPanelProps {
  actions: ReviewActions
}

export function LeftPanel({ actions }: LeftPanelProps): React.ReactElement {
  const reviewCase = useAtomValue(reviewCaseAtom)
  const outline = useAtomValue(currentRuleOutlineAtom)
  const documentsByRole = useAtomValue(documentsByRoleAtom)
  const busy = useAtomValue(reviewBusyAtom)

  const ruleDocument = documentsByRole.rule[0]
  const rulePack = reviewCase?.rulePacks[0]

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin">
      {/* 案卷管理条（入口：切换/新建/导入材料/领域包/删除） */}
      <CaseManagerBar actions={actions} />

      {/* 头部 */}
      <header className="shrink-0 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-500" />
          <h2 className="text-[13px] font-semibold text-foreground">审核依据</h2>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText size={12} className="shrink-0" />
          <span className="truncate">{ruleDocument?.fileName ?? '尚未载入依据材料'}</span>
        </p>
      </header>

      {/* 规则文档全文（SourceBlockView 列表，只读；蓝色高亮定位落点） */}
      {ruleDocument && (
        <section className="shrink-0 px-3 py-3">
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            依据原文
          </p>
          <div className="space-y-0.5 rounded-lg border border-border/60 bg-card p-1 shadow-sm">
            {ruleDocument.blocks.map((block) => (
              <SourceBlockView key={block.id} document={ruleDocument} block={block} />
            ))}
          </div>
        </section>
      )}

      {/* AI 规则大纲 */}
      <section className="shrink-0 px-3 pb-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            AI 规则大纲
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy.outline || !rulePack}
            onClick={() => void actions.generateRuleOutline()}
            className="h-7 gap-1.5 px-2 text-[13px]"
          >
            {busy.outline ? <Spinner size="sm" /> : <Sparkles size={13} />}
            {busy.outline ? '生成中…' : outline.length > 0 ? '重新生成' : '生成大纲'}
          </Button>
        </div>
        <RuleOutlineList outline={outline} onLocate={(anchors) => actions.locateRuleAnchor(anchors)} />
      </section>

      {/* 底部：规则包元数据 */}
      {rulePack && (
        <footer className="mt-auto shrink-0 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          <p className="truncate">发布单位：{rulePack.publisher}</p>
          <p className="mt-0.5 truncate">适用学年：{rulePack.academicYear}</p>
          <p className="mt-0.5 truncate">版本：{rulePack.version}</p>
        </footer>
      )}
    </div>
  )
}
