/**
 * Active View Atom - 主内容区视图状态
 *
 * 控制 MainArea 显示的内容：
 * - conversations: 对话视图（Chat/Agent 模式内容）
 * - planning: 规划中心视图
 * - agent-skills: Agent 技能（Skills/MCP）全屏管理视图
 * - content-review: 材料审核智能体（三栏审核工作台）
 * - cdut-zone: CDUT 专区
 */

import { atomWithStorage } from 'jotai/utils'

export type ActiveView = 'conversations' | 'planning' | 'agent-skills' | 'content-review' | 'cdut-zone'

/** 当前活跃视图（持久化到 localStorage，刷新后保持当前页面） */
export const activeViewAtom = atomWithStorage<ActiveView>('profer-active-view', 'conversations')
