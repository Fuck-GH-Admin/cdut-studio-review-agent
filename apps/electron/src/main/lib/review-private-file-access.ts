/**
 * Main-owned path exclusion for review-case Agent sessions. This is a DENY-only
 * fence, layered underneath ordinary desktop/preview root authorization.
 * Raw paths and canonical paths are both examined to block symlink aliases.
 */
import { realpathSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { getConfigDir, getAgentWorkspacesDir } from './config-paths'
import { isReviewOwnedOrDeletedAgentSessionId } from './agent-session-manager'
import { isReviewPrivateConfigPath } from './remote-file-access'

export function isReviewPrivateDesktopPath(path: string): boolean {
  if (typeof path !== 'string' || !path) return false
  const candidate = resolve(path)
  const deny = (target: string) => isReviewPrivateConfigPath(
    target, getConfigDir(), isReviewOwnedOrDeletedAgentSessionId,
  )
  if (deny(candidate)) return true
  try { return deny(realpathSync(candidate)) }
  catch { return false }
}

/** Privileged file mutations cannot remove an entire workspace container. */
export function isUnsafeAgentWorkspaceMutationPath(path: string): boolean {
  if (isReviewPrivateDesktopPath(path)) return true
  const root = resolve(getAgentWorkspacesDir())
  const rel = relative(root, resolve(path))
  if (rel === '') return true
  if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) return false
  return rel.split(sep).length === 1
}

/** Directory reads must avoid exposing private child names, not only file bytes. */
export function filterOrdinaryDesktopFileEntries<T extends { path: string }>(entries: readonly T[]): T[] {
  return entries.filter((entry) => !isReviewPrivateDesktopPath(entry.path))
}
