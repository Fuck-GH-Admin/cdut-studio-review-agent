/**
 * App Mode Atom - 应用模式状态
 *
 * Chat 模式已从 CDUTAI 用户路径移除。保留旧值读取兼容，避免升级后
 * localStorage 中的历史 `chat` 值把界面恢复到已删除的入口。
 */

import { atomWithStorage } from 'jotai/utils'

export type AppMode = 'chat' | 'agent' | 'scratch'

/** App 模式，自动持久化到 localStorage。Chat 入口已从 UI 中移除。 */
export const appModeAtom = atomWithStorage<AppMode>('profer-app-mode', 'agent')
