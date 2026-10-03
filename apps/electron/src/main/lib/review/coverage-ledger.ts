/**
 * 覆盖账本（M2，设计 03 §6 材料账本 + 检查账本；A08/K06）
 *
 * - 材料账本：每份文档版本都有 read/partially-read/unread 状态与原因；"未识别"不从分母消失
 * - 检查账本：每个计划检查（规则×目标）都有 CheckResult；缺失记 not-executed
 * - "全部符合"结论仅当：无未读材料 且 计划检查全部执行 且 无 awaiting
 */

import type { CheckResult, DocumentVersion, RuleSpec } from '@profer/shared'

export interface DocumentLedgerEntry {
  documentVersionId: string
  fileName: string
  status: DocumentVersion['usage']
  reason?: string
}

/** 材料账本：从文档版本直接投影（usage 字段由解析/审核流程维护） */
export function buildDocumentLedger(documents: DocumentVersion[]): DocumentLedgerEntry[] {
  return documents.map((doc) => ({
    documentVersionId: doc.versionId,
    fileName: doc.fileName,
    status: doc.usage,
    reason: doc.unusedReason,
  }))
}

export interface CheckLedgerEntry {
  ruleId: string
  targetKey: string
  status: CheckResult['status'] | 'not-executed'
  reason?: string
}

/**
 * 检查账本：以「计划检查」为分母核对执行结果。
 * 计划 = 规则 × 其目标分组键的笛卡尔（group 规则按 groupKey 展开为组，subject 规则按主体展开）。
 */
export function buildCheckLedger(
  plannedRules: RuleSpec[],
  subjectIds: string[],
  results: CheckResult[],
): CheckLedgerEntry[] {
  const resultIndex = new Map(results.map((result) => [result.checkId, result]))
  const byRuleTarget = new Map<string, CheckResult>()
  for (const result of results) {
    const key = `${result.ruleId}::${result.target.scope}::${[...result.target.subjectIds].sort().join(',')}`
    byRuleTarget.set(key, result)
  }
  const ledger: CheckLedgerEntry[] = []
  for (const rule of plannedRules) {
    if (rule.targetScope === 'subject') {
      for (const subjectId of subjectIds) {
        const key = `${rule.id}::subject::${subjectId}`
        const hit = byRuleTarget.get(key)
        ledger.push(
          hit
            ? { ruleId: rule.id, targetKey: subjectId, status: hit.status }
            : { ruleId: rule.id, targetKey: subjectId, status: 'not-executed', reason: '计划检查未产生结果记录' },
        )
      }
    } else {
      const key = `${rule.id}::${rule.targetScope}::${subjectIds.sort().join(',')}`
      const hit = byRuleTarget.get(key)
      ledger.push(
        hit
          ? { ruleId: rule.id, targetKey: rule.targetScope, status: hit.status }
          : { ruleId: rule.id, targetKey: rule.targetScope, status: 'not-executed', reason: '计划检查未产生结果记录' },
      )
    }
  }
  void resultIndex
  return ledger
}

export interface CoverageSummary {
  documents: Array<{ documentVersionId: string; status: DocumentVersion['usage']; reason?: string }>
  plannedChecks: number
  completedChecks: number
  effectiveVerdicts: number
  pendingChecks: number
  /** "全部符合"是否成立（未读材料/未执行/待确认任一存在即不成立） */
  allClearVerdictAllowed: boolean
  blockers: string[]
}

/** 组合双账本 → ReviewRunV2.coverage + 全部符合判定（A08） */
export function combineCoverage(
  documents: DocumentVersion[],
  plannedRules: RuleSpec[],
  subjectIds: string[],
  results: CheckResult[],
): CoverageSummary {
  const documentLedger = buildDocumentLedger(documents)
  const checkLedger = buildCheckLedger(plannedRules, subjectIds, results)
  const unread = documentLedger.filter((entry) => entry.status === 'unread' || entry.status === 'partially-read')
  const notExecuted = checkLedger.filter((entry) => entry.status === 'not-executed' || entry.status === 'execution-failed')
  const awaiting = checkLedger.filter((entry) => entry.status === 'awaiting-confirmation' || entry.status === 'awaiting-supplement')
  const blockers: string[] = []
  for (const entry of unread) blockers.push(`材料「${entry.fileName}」未完整读取${entry.reason ? `（${entry.reason}）` : ''}`)
  if (notExecuted.length > 0) blockers.push(`${notExecuted.length} 项计划检查未执行`)
  if (awaiting.length > 0) blockers.push(`${awaiting.length} 项检查待确认/待补件`)
  return {
    documents: documentLedger,
    plannedChecks: checkLedger.length,
    completedChecks: checkLedger.filter((entry) => entry.status !== 'not-executed').length,
    effectiveVerdicts: checkLedger.filter((entry) => entry.status === 'compliant' || entry.status === 'non-compliant').length,
    pendingChecks: awaiting.length + notExecuted.length,
    allClearVerdictAllowed: blockers.length === 0,
    blockers,
  }
}
