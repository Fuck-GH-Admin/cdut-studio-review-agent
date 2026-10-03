/**
 * 预审报告导出（IPC EXPORT_REPORT 实现）
 *
 * 产出：{getConfigDir}/review-reports/{caseId}-{时间戳}.json 与同名 .md。
 * JSON 是机器可读的完整 ReviewReportData；Markdown 是人可读的交接文档。
 *
 * 设计对齐：docs/design/2026-10-01-cdut-studio-content-review-demo.md §6
 * "案卷结果可导出为预审/复核报告，列出依据版本、事项、问题、引用位置、补件清单和人工处理记录"。
 */

import { mkdirSync, writeFileSync, renameSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ExportReportResult, FindingKind, ReviewReportData, ReviewRun } from '@profer/shared'
import { getConfigDir } from '../config-paths'
import { getCase, latestRunSafe } from './report-data'
import { assertSafeId, computeCaseInputHash 
} from './case-store'

/** Markdown 表格单元格转义：竖线与换行会破坏表格结构 */
function escapeMdCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/[\r\n]+/g, '<br>')
}

/** 原子写：.tmp + rename，中断不产生半截文件 */
function writeFileAtomic(filePath: string, data: string): void {
  const tmpPath = `${filePath}.tmp`
  writeFileSync(tmpPath, data, 'utf-8')
  renameSync(tmpPath, filePath)
}

/** 问题类型中文标签 */
const KIND_LABELS: Record<FindingKind, string> = {
  'level-conflict': '等级冲突',
  'missing-evidence': '缺证明',
  'score-over-limit': '超上限',
  'mutual-exclusion': '互斥计分',
  'date-out-of-range': '日期越界',
  'unclear-evidence': '证明看不清',
  'info-incomplete': '信息不全',
  'rule-unmatched': '规则未覆盖',
}

/** 严重度中文标签 */
const SEVERITY_LABELS: Record<string, string> = {
  red: '明确冲突',
  yellow: '待补件/复核',
}

/** 建议处理中文标签 */
const SUGGESTION_LABELS: Record<string, string> = {
  'fix-declaration': '修改申报',
  'supplement-evidence': '补充证明',
  'manual-review': '转人工复核',
  'modify-score': '调整分值',
}

/** 报告输出目录：{configDir}/review-reports/ */
function getReportsDir(): string {
  const dir = join(getConfigDir(), 'review-reports')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * 导出案卷预审报告（JSON + Markdown）。
 *
 * @throws 案卷不存在 / 从未运行审核时抛出中文错误（不生成空报告）
 */
export async function exportReport(caseId: string): Promise<ExportReportResult> {
  assertSafeId(caseId)
  const reviewCase = getCase(caseId)
  if (!reviewCase) throw new Error(`案卷不存在: ${caseId}`)

  const run: ReviewRun | undefined = latestRunSafe(caseId)
  if (!run) throw new Error('该案卷尚未执行审核，无法导出报告（请先在右栏运行审核）')

  // M0/H06/H10 同版守门：报告禁止"当前案卷元数据 × 旧运行"混版。
  // 输入指纹不一致（材料/规则/领域在审核后被改过）→ 拒绝导出当前报告，提示重审。
  if (run.inputHash !== undefined && run.inputHash !== computeCaseInputHash(reviewCase)) {
    throw new Error('案卷在本次审核后已修改，最近一次结果已过期：请重审后再导出报告')
  }
  if (run.inputHash === undefined) {
    throw new Error('该运行记录缺少输入快照（旧格式），无法证明与当前案卷同版：请重审后再导出报告')
  }

  const data: ReviewReportData = {
    caseId: reviewCase.id,
    caseTitle: reviewCase.title,
    generatedAt: new Date().toISOString(),
    academicYear: reviewCase.academicYear,
    applicant: reviewCase.applicant,
    rulePacks: reviewCase.rulePacks.map((pack) => ({
      name: pack.name,
      publisher: pack.publisher,
      academicYear: pack.academicYear,
      version: pack.version,
    })),
    runs: [run],
    manualNotes: [],
  }

  // 毫秒 + 随机后缀：同一毫秒并发导出也不互相覆盖
  const stamp = `${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}-${Math.random().toString(36).slice(2, 6)}`
  const jsonPath = join(getReportsDir(), `${caseId}-${stamp}.json`)
  const markdownPath = join(getReportsDir(), `${caseId}-${stamp}.md`)

  writeFileAtomic(jsonPath, JSON.stringify(data, null, 2))
  writeFileAtomic(markdownPath, renderMarkdown(data, reviewCase.isDemo))

  console.log(`[审核专区] 已导出预审报告: ${jsonPath}`)
  return { jsonPath, markdownPath }
}

/** 渲染 Markdown 报告（人工可读的交接格式） */
function renderMarkdown(data: ReviewReportData, isDemo: boolean): string {
  const run = data.runs[0]
  const lines: string[] = []

  lines.push(`# 内容审核预审报告`)
  lines.push('')
  if (isDemo) lines.push(`> ⚠️ 本报告基于**演示用虚构案卷**生成，不得作为任何真实审核依据。`)
  lines.push('')
  lines.push(`| 项目 | 内容 |`)
  lines.push(`| --- | --- |`)
  lines.push(`| 案卷 | ${data.caseTitle}（${data.caseId}） |`)
  lines.push(`| 审核类型 | 综合测评 |`)
  lines.push(`| 申请人 | ${data.applicant} |`)
  lines.push(`| 适用学年 | ${data.academicYear} |`)
  lines.push(`| 生成时间 | ${data.generatedAt} |`)
  lines.push(`| 审核引擎 | ${run?.engine === 'ai' ? 'AI 审核' : '确定性模拟引擎'} |`)
  lines.push('')

  lines.push(`## 审核依据`)
  lines.push('')
  if (data.rulePacks.length === 0) {
    lines.push('（无规则包）')
  } else {
    for (const pack of data.rulePacks) {
      lines.push(`- ${pack.name}（${pack.publisher}，${pack.academicYear} 学年，版本 ${pack.version}）`)
    }
  }
  lines.push('')

  lines.push(`## 审核发现（${run?.findings.length ?? 0} 条）`)
  lines.push('')
  if (!run || run.findings.length === 0) {
    lines.push('本次运行未产生审核发现。')
  } else {
    lines.push(`| 严重度 | 类型 | 事项 | 说明 | 建议 | 建议分数 |`)
    lines.push(`| --- | --- | --- | --- | --- | --- |`)
    for (const finding of run.findings) {
      const score = finding.suggestedScore !== undefined ? `${finding.suggestedScore} 分` : '待确认'
      lines.push(
        `| ${SEVERITY_LABELS[finding.severity] ?? finding.severity}` +
          ` | ${KIND_LABELS[finding.kind] ?? finding.kind}` +
          ` | ${escapeMdCell(finding.itemId)}` +
          ` | ${escapeMdCell(finding.title)}` +
          ` | ${SUGGESTION_LABELS[finding.suggestion] ?? finding.suggestion}` +
          ` | ${score} |`,
      )
    }
  }
  lines.push('')

  lines.push(`## 覆盖摘要`)
  lines.push('')
  if (run) {
    lines.push(`- 已审核事项：${run.coverage.reviewedItemIds.length} 条`)
    lines.push(`- 待人工复核：${run.coverage.manualReviewItemIds.length} 条`)
    lines.push(`- 未识别文件：${run.coverage.unrecognizedDocumentIds.length} 份`)
    lines.push(`- 规则未覆盖：${run.coverage.ruleUncoveredItemIds.length} 条`)
  }
  lines.push('')

  lines.push(`## 人工处理记录`)
  lines.push('')
  lines.push(data.manualNotes.length === 0 ? '（无）' : data.manualNotes.map((n) => `- ${n}`).join('\n'))
  lines.push('')

  return lines.join('\n')
}
