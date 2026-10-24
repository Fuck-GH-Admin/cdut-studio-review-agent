/**
 * cdut-ai-class.ts — 「AI速课堂」身份判定纯函数
 *
 * 统一渲染层对速课堂专属工作区（slug: cdut-ai-class，展示名: AI速课堂）的识别口径，
 * 与主进程 ensureAiClassWorkspace 的双条件（slug 或展示名）保持一致，兼容历史重名场景。
 */

import { CDUT_AI_CLASS_WORKSPACE_NAME, CDUT_AI_CLASS_WORKSPACE_SLUG, type AgentWorkspace } from '@profer/shared'

/** 判定工作区是否为「AI速课堂」专属工作区 */
export function isAiClassWorkspace(
  workspace: Pick<AgentWorkspace, 'slug' | 'name'> | null | undefined,
): boolean {
  if (!workspace) return false
  return workspace.slug === CDUT_AI_CLASS_WORKSPACE_SLUG || workspace.name === CDUT_AI_CLASS_WORKSPACE_NAME
}
