import { isReviewOwnedAgentSession, type AgentSessionMeta } from '@profer/shared'
import type { TabItem } from '@/atoms/tab-atoms'

/** Historical settings are untrusted. Only persisted, still-existing ordinary Agent sessions can restore. */
export function selectRestorableAgentTabs(
  snapshots: readonly unknown[],
  sessions: readonly AgentSessionMeta[],
  visibleWorkspaceIds: ReadonlySet<string>,
): TabItem[] {
  const byId = new Map(sessions.map((session) => [session.id, session]))
  return snapshots.filter((value): value is TabItem => {
    if (!value || typeof value !== 'object') return false
    const tab = value as Partial<TabItem>
    if (tab.type !== 'agent' || typeof tab.sessionId !== 'string'
      || typeof tab.id !== 'string' || tab.id !== tab.sessionId
      || typeof tab.title !== 'string') return false
    const session = byId.get(tab.sessionId)
    return !!session && !isReviewOwnedAgentSession(session)
      && (!session.workspaceId || visibleWorkspaceIds.has(session.workspaceId))
  })
}

/** Work tabs must not bootstrap a session from an ID or stale Browser/Preview payload. */
export function canOpenOrdinaryWorkTab(
  sessions: readonly AgentSessionMeta[],
  sessionId: string,
): boolean {
  const session = sessions.find((item) => item.id === sessionId)
  return !!session && !isReviewOwnedAgentSession(session)
}

/** The Main GET_SESSION_META endpoint hides internal owners and returns null for removed sessions. */
export async function resolveOrdinaryTabSession(
  sessionId: string,
  load: (id: string) => Promise<AgentSessionMeta | null>,
): Promise<AgentSessionMeta | null> {
  if (!sessionId.trim()) return null
  try {
    const session = await load(sessionId)
    return session?.id === sessionId && !isReviewOwnedAgentSession(session) ? session : null
  } catch {
    return null
  }
}
