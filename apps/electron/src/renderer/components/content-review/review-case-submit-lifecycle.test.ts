import { describe, expect, test } from 'bun:test'
import { createReviewCaseSubmitLock, runReviewCaseSubmission } from './review-case-submit-lock'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((ok, fail) => { resolve = ok; reject = fail })
  return { promise, resolve, reject }
}

// This is the same submission driver called by CreateCaseDialog.handleSubmit.
// Mouse/keyboard tests model consecutive form onSubmit callbacks, NOT physical Electron input.
describe('D4-C10-01: one CreateCaseDialog lifecycle, including success-before-close', () => {
  test('pending: synchronous mouse double click admits only the first CREATE_CASE', async () => {
    const lock = createReviewCaseSubmitLock()
    lock.openSession()
    const response = deferred<{ title: string } | null>()
    let creates = 0, success = 0, settled = 0
    const submit = () => runReviewCaseSubmission(lock, () => {
      creates += 1
      return response.promise
    }, () => {}, () => { success += 1 }, () => { settled += 1 })
    const first = submit()
    const second = submit()
    expect(creates).toBe(1)
    expect(await second).toBe(false)
    response.resolve({ title: 'case-one' })
    expect(await first).toBe(true)
    expect(success).toBe(1)
    expect(settled).toBe(0)
    expect(lock.isLocked()).toBe(true)
  })

  test('resolved success stays blocked for another click before parent commits open=false (the missing 40ms window)', async () => {
    const lock = createReviewCaseSubmitLock()
    lock.openSession()
    let createCalls = 0, closedRequests = 0
    const submit = () => runReviewCaseSubmission(lock, async () => {
      createCalls += 1
      return { title: 'created' }
    }, () => {}, () => { closedRequests += 1 /* simulate pending React onOpenChange(false) */ }, () => {})
    expect(await submit()).toBe(true)
    expect(lock.isLocked()).toBe(true)
    expect(await submit()).toBe(false)
    expect(createCalls).toBe(1)
    expect(closedRequests).toBe(1)
    // Only a genuinely new open session can issue another create.
    lock.closeSession()
    expect(await submit()).toBe(false)
    lock.openSession()
    expect(await submit()).toBe(true)
    expect(createCalls).toBe(2)
  })

  test('failed or rejected create releases admission so correction and retry are possible', async () => {
    const lock = createReviewCaseSubmitLock()
    lock.openSession()
    let calls = 0, successes = 0, ready = 0
    const submit = () => runReviewCaseSubmission(lock, async () => {
      calls += 1
      return calls === 1 ? null : { id: 'valid-after-edit' }
    }, () => {}, () => { successes += 1 }, () => { ready += 1 })
    expect(await submit()).toBe(false)
    expect(lock.isLocked()).toBe(false)
    expect(ready).toBe(1)
    expect(await submit()).toBe(true)
    expect(successes).toBe(1)
    expect(calls).toBe(2)

    lock.openSession()
    let throwCalls = 0
    const throws = () => runReviewCaseSubmission(lock, async () => {
      throwCalls += 1
      if (throwCalls === 1) throw new Error('REAL_MAIN_REJECTION')
      return { id: 'retry' }
    }, () => {}, () => { successes += 1 }, () => { ready += 1 })
    await expect(throws()).rejects.toThrow('REAL_MAIN_REJECTION')
    expect(lock.isLocked()).toBe(false)
    expect(await throws()).toBe(true)
    expect(successes).toBe(2)
  })

  test('close while pending then reopen: late result cannot close or unlock the new dialog', async () => {
    const lock = createReviewCaseSubmitLock()
    lock.openSession()
    const old = deferred<{ id: string } | null>()
    const newer = deferred<{ id: string } | null>()
    const successes: string[] = []
    const oldSubmit = runReviewCaseSubmission(lock, () => old.promise, () => {}, v => { successes.push(v.id) }, () => {})
    lock.closeSession()
    lock.openSession()
    const newSubmit = runReviewCaseSubmission(lock, () => newer.promise, () => {}, v => { successes.push(v.id) }, () => {})
    old.resolve({ id: 'stale' })
    expect(await oldSubmit).toBe(false)
    expect(lock.isLocked()).toBe(true)
    expect(successes).toEqual([])
    newer.resolve({ id: 'fresh' })
    expect(await newSubmit).toBe(true)
    expect(successes).toEqual(['fresh'])
  })

  test('Enter+click submits two form callbacks but only one create', async () => {
    const lock = createReviewCaseSubmitLock()
    lock.openSession()
    const response = deferred<{ id: string } | null>()
    let creates = 0
    const submit = () => runReviewCaseSubmission(lock, () => {
      creates++
      return response.promise
    }, () => {}, () => {}, () => {})
    const enter = submit()
    const click = submit()
    expect(await click).toBe(false)
    response.resolve({ id: 'one' })
    expect(await enter).toBe(true)
    expect(creates).toBe(1)
  })

  test('published-template path without D4 intake obeys the same success latch', async () => {
    const lock = createReviewCaseSubmitLock()
    lock.openSession()
    let dispatched = 0
    const create = () => runReviewCaseSubmission(lock, async () => {
      dispatched++
      return { id: 'published-template' }
    }, () => {}, () => {}, () => {})
    expect(await create()).toBe(true)
    expect(await create()).toBe(false)
    expect(dispatched).toBe(1)
    lock.closeSession()
    lock.openSession()
    expect(await create()).toBe(true)
    expect(dispatched).toBe(2)
  })
})
