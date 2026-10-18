/** Renderer-local admission for one CreateCaseDialog open/close lifecycle.
 * Main's single-use D4 intake token remains the authority: this only prevents the
 * UI from accidentally replaying it after a successful create while closing.
 */
export type ReviewCaseSubmitPhase = 'idle' | 'submitting' | 'succeeded-awaiting-close' | 'closed'

export interface ReviewCaseSubmitLock {
  acquire: () => boolean
  /** Only the active successful attempt can latch the lock until the next open. */
  succeed: (generation: number) => boolean
  /** Release only a failed current attempt; never undo a successful latch. */
  release: (generation?: number) => boolean
  openSession: () => void
  closeSession: () => void
  generation: () => number
  isLocked: () => boolean
  phase: () => ReviewCaseSubmitPhase
}

export function createReviewCaseSubmitLock(): ReviewCaseSubmitLock {
  let phase: ReviewCaseSubmitPhase = 'idle'
  let generation = 0
  return {
    acquire() {
      if (phase !== 'idle') return false
      phase = 'submitting'
      return true
    },
    succeed(expected) {
      if (expected !== generation || phase !== 'submitting') return false
      phase = 'succeeded-awaiting-close'
      return true
    },
    release(expected) {
      if (expected !== undefined && expected !== generation) return false
      if (phase !== 'submitting') return false
      phase = 'idle'
      return true
    },
    openSession() {
      generation += 1
      phase = 'idle'
    },
    closeSession() {
      generation += 1
      phase = 'closed'
    },
    generation: () => generation,
    isLocked: () => phase !== 'idle',
    phase: () => phase,
  }
}

/** Called from CreateCaseDialog's actual form submit handler for both Enter and click.
 * The synchronous acquire runs BEFORE the first await/React commit. A successful
 * create is latched before Toast/parent close; a null/rejected create unlocks.
 * Session generations discard late replies from a previously closed dialog.
 */
export async function runReviewCaseSubmission<T>(
  lock: ReviewCaseSubmitLock,
  create: () => Promise<T | null>,
  onStart: () => void,
  onSuccess: (created: T) => void,
  onRetryReady: () => void,
): Promise<boolean> {
  if (!lock.acquire()) return false
  const generation = lock.generation()
  try {
    onStart()
    const created = await create()
    if (created === null || !lock.succeed(generation)) return false
    onSuccess(created)
    return true
  } finally {
    if (lock.release(generation)) onRetryReady()
  }
}
