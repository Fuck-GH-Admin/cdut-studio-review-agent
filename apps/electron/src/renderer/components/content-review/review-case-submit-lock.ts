/** Guard duplicate UI submit events synchronously, before a React state update can render.
 * This only locks the local form; Main still independently validates its one-use intake token. */
export function createReviewCaseSubmitLock(): {
  acquire: () => boolean
  release: () => void
  isLocked: () => boolean
} {
  let locked = false
  return {
    acquire() {
      if (locked) return false
      locked = true
      return true
    },
    release() { locked = false },
    isLocked() { return locked },
  }
}
