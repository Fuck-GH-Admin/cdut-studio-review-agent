/**
 * Conversation Atoms - 渠道/模型/对话元数据与流式指示状态
 *
 * Chat 模式移除后，这里保留仍被 Agent 链路与全局 UI 使用的状态：
 * 渠道列表、全局默认模型、会话元数据、per-conversation 设置、
 * 以及驱动 tab/侧栏指示器的流式状态。
 */

import { atom, getDefaultStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Channel, ChatToolActivity, ConversationMeta } from '@profer/shared'

// ===== 渠道 =====

/** 全局渠道列表缓存（启动时加载一次，设置变更时刷新） */
export const channelsAtom = atom<Channel[]>([])

/** 渠道列表是否已完成首次加载 */
export const channelsLoadedAtom = atom(false)

/** 模型选择器打开请求（ErrorMessage 的 select_model 恢复操作等全局触发入口）。
 * 用对象而非纯计数：请求携带自增 seq，消费方记录已消费的 seq，
 * 避免组件未挂载时计数变化被吞掉（切回视图后请求静默丢失）。 */
export const modelSelectorRequestAtom = atom<{ seq: number }>({ seq: 0 })

/** 发起一次模型选择器打开请求 */
export function requestModelSelectorOpen(): void {
  const current = getDefaultStore().get(modelSelectorRequestAtom)
  getDefaultStore().set(modelSelectorRequestAtom, { seq: current.seq + 1 })
}

/** 选中的模型信息 */
export interface SelectedModel {
  channelId: string
  modelId: string
}

/** 上下文长度选项列表（单一数据源） */
export const CONTEXT_LENGTH_OPTIONS = [0, 5, 10, 15, 20, 'infinite'] as const

/** 上下文长度选项值（派生自 CONTEXT_LENGTH_OPTIONS，避免类型与数据不同步） */
export type ContextLengthValue = typeof CONTEXT_LENGTH_OPTIONS[number]

// ===== 对话元数据 =====

/** 对话列表 */
export const conversationsAtom = atom<ConversationMeta[]>([])

/** 当前对话 ID */
export const currentConversationIdAtom = atom<string | null>(null)

/** 选中的模型（持久化到 localStorage） */
export const selectedModelAtom = atomWithStorage<SelectedModel | null>(
  'profer-selected-model',
  null,
)

/** 上下文长度（持久化到 localStorage，默认不限制） */
export const contextLengthAtom = atomWithStorage<ContextLengthValue>(
  'profer-context-length',
  'infinite',
)

/** 思考模式（持久化到 localStorage） */
export const thinkingEnabledAtom = atomWithStorage<boolean>(
  'profer-thinking-enabled',
  false,
)

/** 思考块默认展开偏好（持久化到 localStorage） */
export const thinkingExpandedAtom = atomWithStorage<boolean>(
  'profer-thinking-expanded',
  false,
)

// ===== 流式状态（驱动 tab/侧栏指示器） =====

/** 单个对话的流式状态 */
export interface ConversationStreamState {
  /** 当前流式运行的唯一代次。 */
  runId?: string
  streaming: boolean
  content: string
  reasoning: string
  model?: string
  /** 记忆工具活动列表（流式期间累积） */
  toolActivities: ChatToolActivity[]
}

/** 各对话流式状态 Map */
export const streamingStatesAtom = atom<Map<string, ConversationStreamState>>(new Map())

/**
 * 当前正在流式输出的对话 ID 集合（派生只读原子）
 * 用于侧边栏绿色呼吸点指示器
 */
export const streamingConversationIdsAtom = atom<Set<string>>((get) => {
  const states = get(streamingStatesAtom)
  const ids = new Set<string>()
  for (const [id, state] of states) {
    if (state.streaming) ids.add(id)
  }
  return ids
})

// ===== Per-conversation 设置（Map 结构，缺省回落全局默认） =====

/** 每个对话的模型选择 */
export const conversationModelsAtom = atom<Map<string, SelectedModel | null>>(new Map())

/** 每个对话的上下文长度 */
export const conversationContextLengthAtom = atom<Map<string, ContextLengthValue>>(new Map())

/** 每个对话的思考模式 */
export const conversationThinkingEnabledAtom = atom<Map<string, boolean>>(new Map())

/** 每个对话的并排模式 */
export const conversationParallelModeAtom = atom<Map<string, boolean>>(new Map())

/** 对话输入框草稿 Map — 以 conversationId 为 key */
export const conversationDraftsAtom = atom<Map<string, string>>(new Map())
