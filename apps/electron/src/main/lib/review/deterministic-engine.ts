/**
 * 确定计算引擎（M2，设计 03 §4 + 04 §3 样本 D04/D05/D07）
 *
 * 原则：
 * - 数值/日期/必填/上限/互斥按可复查规则核对；AI 只处理语义，不得覆盖计算值（H13/K13）
 * - unknown 三值传播：缺输入进 unknown，不当 false/0（D05：缺失等待，不当零）
 * - 计算可重放：同一输入 + 同一规则版本 → 完全一致的明细（A07）
 * - 组内先去重/择高，再聚合、封顶、按模板分配计入明细（D04）
 */

import type { CheckResult, ConditionAST, RuleSpec, TriState } from '@profer/shared'

/** 计算输入：一条主体字段/事实取值（缺失 = unknown） */
export interface CalcInput {
  subjectId: string
  fields: Record<string, { value: number | string | null; known: boolean }>
}

// ===== 条件树求值（三值传播） =====

export function evaluateCondition(
  ast: ConditionAST,
  resolve: (ref: { field?: string; fact?: string }) => { known: boolean; value: unknown },
): TriState {
  if ('all' in ast) {
    let sawUnknown = false
    for (const child of ast.all) {
      const result = evaluateCondition(child, resolve)
      if (result === 'false') return 'false'
      if (result === 'unknown') sawUnknown = true
    }
    return sawUnknown ? 'unknown' : 'true'
  }
  if ('any' in ast) {
    let sawUnknown = false
    for (const child of ast.any) {
      const result = evaluateCondition(child, resolve)
      if (result === 'true') return 'true'
      if (result === 'unknown') sawUnknown = true
    }
    return sawUnknown ? 'unknown' : 'false'
  }
  if ('not' in ast) {
    const inner = evaluateCondition(ast.not, resolve)
    return inner === 'unknown' ? 'unknown' : inner === 'true' ? 'false' : 'true'
  }
  // 叶子：field/fact 比较
  const ref = 'field' in ast ? { field: ast.field } : { fact: (ast as { fact: string }).fact }
  const resolved = resolve(ref)
  if (ast.op === 'exists') {
    return resolved.known && resolved.value !== null && resolved.value !== '' ? 'true' : resolved.known ? 'false' : 'unknown'
  }
  if (!resolved.known || resolved.value === null || resolved.value === '') return 'unknown'
  const left = resolved.value
  const right = ast.value
  let result: boolean
  switch (ast.op) {
    case 'eq': result = left === right; break
    case 'neq': result = left !== right; break
    case 'gt': case 'gte': case 'lt': case 'lte': {
      const ln = typeof left === 'number' ? left : Number(left)
      const rn = typeof right === 'number' ? right : Number(right)
      if (Number.isNaN(ln) || Number.isNaN(rn)) return 'unknown'
      result = ast.op === 'gt' ? ln > rn : ast.op === 'gte' ? ln >= rn : ast.op === 'lt' ? ln < rn : ln <= rn
      break
    }
    case 'in': result = Array.isArray(right) && (right as unknown[]).includes(left); break
  }
  return result ? 'true' : 'false'
}

// ===== 组级计分（D04：去重 → 择高 → 聚合 → 封顶 → 分配） =====

export interface GroupScoreOutcome {
  status: 'compliant' | 'non-compliant' | 'awaiting-confirmation'
  /** 组计入总额（封顶后） */
  total: string
  /** 分配明细：每事项计入值（被舍弃项为 '0.00'） */
  allocation: Array<{ subjectId: string; allocated: string; note: string }>
  /** 未知清单：无法定值的字段（进入待确认，不当零） */
  unknowns: Array<{ subjectId: string; field: string }>
  detailLines: string[]
}

/**
 * 通用组级计分：dedupeBy 去重 → valueFrom 取 confirmed 分值 → 择高 → 聚合 → cap 封顶 → 分配。
 * 任何 valueFrom 缺失/未知 → 整组 awaiting-confirmation（不编造每项最终值）。
 */
export function computeGroupScore(
  rule: RuleSpec,
  inputs: CalcInput[],
  precision = 2,
): GroupScoreOutcome {
  const calc = rule.calculation
  if (!calc) throw new Error(`规则 ${rule.id} 缺少 calculation 定义`)
  const fmt = (n: number): string => n.toFixed(precision)
  const unknowns: Array<{ subjectId: string; field: string }> = []
  const detailLines: string[] = [`规则 ${rule.id}（${rule.title}）组级计算：`]

  // 1) 取值：valueFrom 字段必须已知
  type Candidate = { subjectId: string; value: number; dedupeKey: string | null }
  const candidates: Candidate[] = []
  let droppedCandidates: Candidate[] = []
  for (const input of inputs) {
    const raw = input.fields[calc.valueFrom]
    if (!raw || !raw.known || raw.value === null || typeof raw.value !== 'number') {
      unknowns.push({ subjectId: input.subjectId, field: calc.valueFrom })
      continue
    }
    const dedupeKey = calc.deduplicateBy?.length
      ? calc.deduplicateBy.map((key) => String(input.fields[key]?.value ?? '')).join('|')
      : null
    candidates.push({ subjectId: input.subjectId, value: raw.value, dedupeKey })
  }
  if (unknowns.length > 0) {
    return {
      status: 'awaiting-confirmation',
      total: '',
      allocation: [],
      unknowns,
      detailLines: [...detailLines, ...unknowns.map((u) => `- 主体 ${u.subjectId} 的 ${u.field} 未知 → 待确认（不当零分）`)],
    }
  }

  // 2) 去重：同 dedupeKey 择高（D04：同一 event 只计最高）
  let pool = candidates
  if (calc.deduplicateBy && calc.deduplicateBy.length > 0) {
    const bestByKey = new Map<string, Candidate>()
    for (const candidate of candidates) {
      const key = candidate.dedupeKey ?? candidate.subjectId
      const current = bestByKey.get(key)
      if (!current || candidate.value > current.value) bestByKey.set(key, candidate)
    }
    const kept = new Set([...bestByKey.values()].map((candidate) => candidate.subjectId))
    const dropped = candidates.filter((c) => !kept.has(c.subjectId))
    for (const candidate of dropped) {
      detailLines.push(`- 主体 ${candidate.subjectId} 去重舍弃（同键择高，值 ${fmt(candidate.value)}）`)
    }
    // 被舍弃项进入分配账本（计 0.00），保证分母完整可核（A07）
    droppedCandidates = dropped
    pool = candidates.filter((candidate) => kept.has(candidate.subjectId))
  }

  // 3) 全局择高仅在未声明去重键时使用（有 deduplicateBy 时择高已在键内完成）
  if (!calc.deduplicateBy?.length && calc.select === 'highest-eligible-score') {
    pool = [pool.reduce((best, candidate) => (candidate.value > best.value ? candidate : best), pool[0]!)]
    detailLines.push(`- 组内择高：保留主体 ${pool[0]!.subjectId}（${fmt(pool[0]!.value)}）`)
  }

  // 4) 聚合
  const rawTotal = pool.reduce((sum, candidate) => sum + candidate.value, 0)
  detailLines.push(`- 聚合合计：${fmt(rawTotal)}`)

  // 5) 封顶 + 分配（score-desc-then-subject-id：高分优先计入，余量给后面的）
  const cap = calc.cap ? Number(calc.cap.value) : Number.POSITIVE_INFINITY
  let remaining = cap
  const ordered = [...pool].sort((a, b) => b.value - a.value || a.subjectId.localeCompare(b.subjectId))
  const allocation: GroupScoreOutcome['allocation'] = []
  for (const candidate of ordered) {
    const allocated = Math.min(candidate.value, Math.max(0, remaining))
    remaining -= allocated
    allocation.push({
      subjectId: candidate.subjectId,
      allocated: fmt(allocated),
      note: allocated < candidate.value ? `被组上限截断（原值 ${fmt(candidate.value)}）` : '全额计入',
    })
  }
  // 去重舍弃项计 0.00 入账（账本分母完整，A07）
  for (const candidate of droppedCandidates) {
    allocation.push({ subjectId: candidate.subjectId, allocated: fmt(0), note: `同键择高舍弃（原值 ${fmt(candidate.value)}）` })
  }
  if (calc.cap) detailLines.push(`- 组上限 ${fmt(cap)}：按分数降序分配，被舍弃/截断部分记 0`)
  const total = Math.min(rawTotal, cap)
  detailLines.push(`- 组计入总额：${fmt(total)}`)

  return { status: 'compliant', total: fmt(total), allocation, unknowns: [], detailLines }
}

/** 构造 CheckResult 的计算明细（与 V2 契约对齐） */
export function toCalculationResult(
  rule: RuleSpec,
  outcome: GroupScoreOutcome,
  target: CheckResult['target'],
): CheckResult {
  return {
    checkId: `chk-${rule.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ruleId: rule.id,
    target,
    status: outcome.status === 'awaiting-confirmation' ? 'awaiting-confirmation' : 'compliant',
    reason: outcome.status === 'awaiting-confirmation'
      ? `存在未知输入（${outcome.unknowns.map((u) => u.field).join('、')}），待确认后重放`
      : `组计入 ${outcome.total}`,
    sourceRefs: [],
    calculation: {
      inputs: [],
      result: outcome.total,
      detailLines: outcome.detailLines,
    },
    executedBy: 'deterministic',
    executedAt: new Date().toISOString(),
  }
}
