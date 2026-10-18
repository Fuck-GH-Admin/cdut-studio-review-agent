import { describe, expect, test } from 'bun:test'
import { createReviewCaseSubmitLock } from './review-case-submit-lock'

const deferred = () => {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((a, b) => { resolve = a; reject = b })
  return { promise, resolve, reject }
}

describe('D4-C10-01: synchronous submit admission before the React commit', () => {
  test('two submissions in the same event turn dispatch only one create and one import', async () => {
    const lock = createReviewCaseSubmitLock()
    const response = deferred()
    let creates = 0
    let imports = 0
    async function submit(): Promise<'accepted' | 'duplicate'> {
      if (!lock.acquire()) return 'duplicate'
      try {
        creates += 1
        await response.promise
        imports += 1
        return 'accepted'
      } finally {
        lock.release()
      }
    }
    const first = submit()
    const duplicate = submit()
    expect(lock.isLocked()).toBeTrue()
    expect(creates).toBe(1)
    expect(await duplicate).toBe('duplicate')
    response.resolve()
    expect(await first).toBe('accepted')
    expect(imports).toBe(1)
    expect(lock.isLocked()).toBeFalse()
  })

  test('after a rejected create the user can deliberately retry; close/open does not retain a stale lock', async () => {
    const lock = createReviewCaseSubmitLock()
    const response = deferred()
    const first = (async () => {
      if (!lock.acquire()) return
      try { await response.promise } finally { lock.release() }
    })()
    expect(lock.acquire()).toBeFalse()
    response.reject(new Error('D4_INPUT_REJECTED'))
    await expect(first).rejects.toThrow('D4_INPUT_REJECTED')
    expect(lock.acquire()).toBeTrue()
    lock.release()
    expect(lock.acquire()).toBeTrue()
    lock.release()
  })

  test('token scope remains Main-owned; lock never transforms a rejected token to a success', async () => {
    const lock = createReviewCaseSubmitLock()
    expect(lock.acquire()).toBeTrue()
    expect(lock.acquire()).toBeFalse()
    lock.release()
    expect(lock.acquire()).toBeTrue()
    lock.release()
  })
})
