import { atom } from 'jotai'
import type { CaseAggregateV2 } from '@profer/shared'
import {
  reviewWorkspaceAggregatesByCaseAtom,
  selectedCaseIdAtom,
} from '@/atoms/review-atoms'

/**
 * V2 聚合不是独立的“当前案卷”副本。
 * 所有页面都从 selectedCaseIdAtom 对应的聚合缓存读取；写入时只更新该案卷。
 * 这样切换案卷不会让旧页面残留的聚合覆盖当前案卷。
 */
export const reviewV2AggregateAtom = atom(
  (get) => {
    const caseId = get(selectedCaseIdAtom)
    return caseId ? get(reviewWorkspaceAggregatesByCaseAtom)[caseId] ?? null : null
  },
  (get, set, next: CaseAggregateV2 | null) => {
    const currentId = get(selectedCaseIdAtom)
    const caseId = next?.caseV2.id ?? currentId
    if (!caseId) return

    set(reviewWorkspaceAggregatesByCaseAtom, {
      ...get(reviewWorkspaceAggregatesByCaseAtom),
      [caseId]: next,
    })
    if (next && currentId !== next.caseV2.id) {
      set(selectedCaseIdAtom, next.caseV2.id)
    }
  },
)

export const reviewV2BusyAtom = atom(false)
export const reviewV2NoticeAtom = atom<string | null>(null)

/** 模板发布后通知模板管理和候选工具刷新已发布版本。 */
export const templatesRefreshAtom = atom(0)
