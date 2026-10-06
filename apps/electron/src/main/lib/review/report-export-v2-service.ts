/**
 * V2 报告导出服务（08 设计 §4：从 EXPORT_REPORT_V2 handler 抽出，IPC 与 Agent 工具薄委托）
 *
 * 公开反馈投影（字段可见性按模板默认 public）+ 真实检查结果摘要 → MD 落盘
 * 到案卷受控目录 reports/（不覆盖任意宿主路径）。
 */

export interface ExportReportResultV2 {
  file: string
  decision: { result: string; reason: string; at: string } | null
}

export function exportCaseReport(caseId: string): ExportReportResultV2 {
  const { getCaseV2Aggregate } = require('./application-service') as typeof import('./application-service')
  const { buildCaseFeedback } = require('./report-service-v2') as typeof import('./report-service-v2')
  const { listRunsV2 } = require('./run-store-v2') as typeof import('./run-store-v2')
  const aggregate = getCaseV2Aggregate(caseId)
  if (!aggregate) throw new Error(`案卷聚合不存在: ${caseId}`)
  const feedback = buildCaseFeedback(aggregate.caseV2, aggregate.decisions, aggregate.supplements, {})
  const completed = listRunsV2(caseId).filter((run) => run.status === 'completed')
  const lastRun = completed[0]
  const lines: string[] = [`# 审核报告：${aggregate.caseV2.title}`, '', `- 案卷：${caseId}`, `- 阶段：${aggregate.caseV2.stage}（revision ${aggregate.caseV2.revision}）`, '']
  if (feedback.decision) lines.push(`## 决定`, `- 结果：${feedback.decision.result}`, `- 理由：${feedback.decision.reason}`, `- 时间：${feedback.decision.at}`, '')
  if (lastRun) {
    lines.push(`## 检查结果（运行 ${lastRun.id}）`)
    for (const check of lastRun.checks) {
      const item = check as { ruleId: string; status: string; reason?: string }
      lines.push(`- ${item.ruleId}：${item.status}${item.reason ? `——${item.reason}` : ''}`)
    }
    lines.push('')
  }
  if (feedback.supplements.length > 0) {
    lines.push('## 补件')
    for (const supplement of feedback.supplements) lines.push(`- ${supplement.reason}（${supplement.status}，要素：${supplement.requiredElements.join('、') || '—'}）`)
    lines.push('')
  }
  lines.push('## 事项字段')
  for (const item of feedback.items) lines.push(`- ${item.title}：${JSON.stringify(item.publicFields)}`)
  const { writeFileSync, mkdirSync } = require('node:fs') as typeof import('node:fs')
  const { join } = require('node:path') as typeof import('node:path')
  const { getConfigDir } = require('../config-paths') as typeof import('../config-paths')
  const dir = join(getConfigDir(), 'review-cases', caseId, 'reports')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `report-${Date.now().toString(36)}.md`)
  writeFileSync(file, lines.join('\n'), 'utf-8')
  return { file, decision: feedback.decision }
}
