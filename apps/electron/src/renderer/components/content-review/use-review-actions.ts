/**
 * use-review-actions — 内容审核专区三栏共用的 IPC 动作手（hook）
 *
 * M0/H05：编排逻辑全部移入 review-actions-controller.ts（可注入假 IPC 单测），
 * 本 hook 只负责把 Jotai Store 与 window.reviewAPI 接进控制器。
 * 并发语义见控制器文件头注释（选择代次 / 按案写入 / 操作代次 / 同案互斥）。
 */

import * as React from 'react'
import { useStore } from 'jotai'
import { createReviewActionsController } from './review-actions-controller'

/** 动作集合类型（消费方此前从本文件导入，保持导出名不变） */
export type ReviewActions = ReturnType<typeof createReviewActionsController>
export type { CreateCaseInput } from './review-actions-controller'
export { REVIEW_DOCUMENT_ROLE_LABELS } from './review-actions-controller'

export function useReviewActions() {
  const store = useStore()
  return React.useMemo(() => createReviewActionsController(store, window.reviewAPI), [store])
}
