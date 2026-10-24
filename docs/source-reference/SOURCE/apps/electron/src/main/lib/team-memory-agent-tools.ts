import type { TeamMemoryDocument } from '@profer/shared'
import { createTeamMemory, listTeamMemories, readTeamMemory, updateTeamMemory } from './team-memory-service'

type ToolResult = { content: Array<{ type: 'text'; text: string }> }
function result(payload: unknown): ToolResult { return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] } }
function requireTeamWorkspace(workspaceId?: string): string {
  if (!workspaceId) throw new Error('当前会话不属于团队工作区，无法访问团队共享记忆。')
  return workspaceId
}

/** 团队 Agent 只使用此受限集合：可按需读写，不能归档/恢复/强制覆盖团队共同知识。 */
export function teamMemoryOperations(workspaceId?: string) {
  const id = requireTeamWorkspace(workspaceId)
  return {
    async list() { const response = await listTeamMemories(id); return response.ok ? response.data ?? [] : { error: response.error } },
    async read(memoryId: string) { const response = await readTeamMemory(id, memoryId); return response.ok ? response.data : { error: response.error } },
    async search(query: string) {
      const response = await listTeamMemories(id)
      if (!response.ok) return { error: response.error }
      const needle = query.trim().toLowerCase()
      const matches = (response.data ?? []).filter((doc) => `${doc.path}\n${doc.title}`.toLowerCase().includes(needle))
      return { matches }
    },
    async create(input: { path: string; title: string; content: string; changeSummary?: string }) {
      const response = await createTeamMemory(id, input); return response.ok ? response.data : { error: response.error }
    },
    async update(memoryId: string, expectedVersion: number, input: { path?: string; title?: string; content?: string; changeSummary?: string }) {
      const response = await updateTeamMemory(id, memoryId, { expectedVersion, ...input })
      return response.ok ? response.data : response.conflict ? { error: response.error, conflict: response.conflict } : { error: response.error }
    },
  }
}
