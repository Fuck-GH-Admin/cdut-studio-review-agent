/**
 * 报告数据访问层
 *
 * report-service 需要的最小读取接口；从 case-store 派生，
 * 避免报告模块直接依赖存储实现的全部 API 面。
 */

import type { ReviewCase, ReviewRun } from '@profer/shared'
import { getCase, listRuns } from './case-store'

/** 读取案卷（透传） */
export function getCaseSafe(caseId: string): ReviewCase | undefined {
  return getCase(caseId)
}

/** 取最近一次完成（或运行中/失败）的运行记录；无任何记录返回 undefined */
export function latestRunSafe(caseId: string): ReviewRun | undefined {
  const runs = listRuns(caseId)
  return runs.length > 0 ? runs[runs.length - 1] : undefined
}

export { getCase }
