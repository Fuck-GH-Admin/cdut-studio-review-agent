/**
 * 审核运行服务（deterministic 编排层）
 *
 * 职责：
 * 1. `startReviewRun`：发起一次审核运行 —— 先落 "running" 初值（崩溃也留痕），
 *    再执行引擎（默认 mock 确定性引擎），成功落 "completed"、失败落 "failed"。
 *    失败路径绝不向上抛：引擎异常被吞成 failed run 的 error 字段（D6 降级叙事）。
 * 2. `getRun` / `latestRun`：按 runId / 最近一次读取运行记录。
 *
 * 不依赖 Electron（纯 Node + FS），可在 bun test 下直接跑。
 */

import type { ReviewCase, ReviewRun } from '@profer/shared'
import { assertSafeId, getCase, listRuns, saveRun } from './case-store'
import { runMockReview } from './mock-review-engine'
import { runAiReview } from './ai-review-service'

/** 引擎选择：'mock-engine' 确定性算法 / 'ai' 真实模型（网关不可用时内部降级回 mock） */
export type ReviewEngineChoice = 'mock-engine' | 'ai'

/** 空覆盖摘要（failed run 没有 findings，coverage 全空但字段必须存在） */
function emptyCoverage(): ReviewRun['coverage'] {
  return {
    reviewedItemIds: [],
    manualReviewItemIds: [],
    unrecognizedDocumentIds: [],
    ruleUncoveredItemIds: [],
  }
}

/** 生成 runId：run-{毫秒时间戳}-{6 位 36 进制随机}（字典序 == 时间序） */
function newRunId(): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `run-${Date.now()}-${rand}`
}

/** 输入指纹：案卷 updatedAt + 文档数 + 条目数（detect 后续重审输入是否变化） */
function inputVersionOf(reviewCase: ReviewCase): string {
  const docCount = reviewCase.documents?.length ?? 0
  const itemCount = reviewCase.items?.length ?? 0
  return `${reviewCase.updatedAt}-${docCount}d-${itemCount}i`
}

/**
 * 发起一次审核运行（同步等待，demo 规模下毫秒级完成）。
 *
 * 流程：
 * 1. 校验 caseId、读案卷（不存在 → 直接 throw，这是调用方 bug 不是引擎失败）
 * 2. 落 "running" 初值（先占位：即使进程被杀也有 running 痕迹，便于排查）
 * 3. 执行引擎：engine='ai' 走 ai-review-service（内部网关不可用时降级 mock），
 *    engine='mock-engine' 走 runMockReview
 * 4. 引擎异常 → 吞掉、落 "failed" run（error 字段记录中文原因），不向上抛
 * 5. 正常 → 落 "completed" run
 *
 * @param caseId 案卷 ID
 * @param engine 引擎选择，默认 'mock-engine'
 * @returns 完整的 ReviewRun（completed 或 failed）
 */
export async function startReviewRun(
  caseId: string,
  engine: ReviewEngineChoice = 'mock-engine',
): Promise<ReviewRun> {
  assertSafeId(caseId)
  const reviewCase = getCase(caseId)
  if (!reviewCase) {
    throw new Error(`案卷不存在: ${caseId}`)
  }

  const runId = newRunId()
  const inputVersion = inputVersionOf(reviewCase)

  // ---- 第 1 步：先落 running 初值（空 findings，占位防崩） ----
  const runningRun: ReviewRun = {
    id: runId,
    caseId,
    status: 'running',
    inputVersion,
    startedAt: new Date().toISOString(),
    findings: [],
    coverage: emptyCoverage(),
    engine: engine === 'ai' ? 'ai' : 'mock-engine',
  }
  saveRun(caseId, runningRun)

  // ---- 第 2 步：执行引擎，异常全部就地消化 ----
  let outcome: Omit<ReviewRun, 'id' | 'startedAt' | 'completedAt' | 'status' | 'inputVersion'>
  try {
    outcome =
      engine === 'ai'
        ? await runAiReview(reviewCase)
        : runMockReview(reviewCase)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const failedRun: ReviewRun = {
      ...runningRun,
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: message,
      findings: [],
      coverage: emptyCoverage(),
    }
    saveRun(caseId, failedRun)
    console.warn(`[审核专区] 审核运行失败（已落 failed 记录）: ${caseId}/${runId} — ${message}`)
    return failedRun
  }

  // ---- 第 3 步：正常完成 ----
  const completedRun: ReviewRun = {
    ...runningRun,
    ...outcome,
    status: 'completed',
    completedAt: new Date().toISOString(),
  }
  saveRun(caseId, completedRun)
  console.log(
    `[审核专区] 审核运行完成: ${caseId}/${runId}（引擎 ${completedRun.engine}，发现 ${completedRun.findings.length} 条）`,
  )
  return completedRun
}

/**
 * 按 runId 读取一次运行记录。
 *
 * @returns 找不到返回 undefined（调用方按 IPC 契约返回 null/错误）
 */
export function getRun(caseId: string, runId: string): ReviewRun | undefined {
  assertSafeId(caseId)
  assertSafeId(runId)
  return listRuns(caseId).find((run) => run.id === runId)
}

/**
 * 读取案卷最近一次运行（字典序最大者，即时间最新）。
 *
 * @returns 从未运行过返回 undefined
 */
export function latestRun(caseId: string): ReviewRun | undefined {
  assertSafeId(caseId)
  const runs = listRuns(caseId)
  return runs.length > 0 ? runs[runs.length - 1] : undefined
}
