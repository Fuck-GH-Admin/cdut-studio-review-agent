import { describe, expect, test } from 'bun:test'
// @ts-ignore -- executable Node E06 QA helper has no TypeScript declarations
import { E06_LOCAL_LANES, summarizeE06Rows, assertE06IsolatedPreflight } from './review-live-e06-contract.mjs'

const lane = (id: string, status = 'PASS') => ({ id, status, assertions: [{ name: 'real witness', pass: true }] })
const validInput = {
  reportDir: '/tmp/p06-e06-reports', profileRoot: '/tmp/p06-e06-isolated-profile',
  applicationSha: 'a'.repeat(40), isolatedProfileConfirmed: '1',
  selection: { channelId: 'isolated-only', modelId: 'synthetic-model' },
}

describe('P06 E06 actual-live witness matrix contract', () => {
  test('four green local Pi lanes never grant full E06/LIVE-08 approval', () => {
    const result = summarizeE06Rows(E06_LOCAL_LANES.map((id: string) => lane(id)))
    expect(result.status).toBe('PARTIAL')
    expect(result.localLanesComplete).toBe(true)
    expect(result.completedLocalLanes).toBe(4)
  })
  test('a claimed green lane without actual assertions fails closed', () => {
    const result = summarizeE06Rows([{ id: E06_LOCAL_LANES[0], status: 'PASS', assertions: [] }])
    expect(result.status).toBe('FAIL')
    expect(result.invalid).toContain(E06_LOCAL_LANES[0])
  })
  test('duplicate row, failed witness, and forged green with negative assertion fail', () => {
    expect(summarizeE06Rows([lane(E06_LOCAL_LANES[0]), lane(E06_LOCAL_LANES[0])]).status).toBe('FAIL')
    expect(summarizeE06Rows([{ ...lane(E06_LOCAL_LANES[0]), status: 'FAIL' }]).status).toBe('FAIL')
    expect(summarizeE06Rows([{ ...lane(E06_LOCAL_LANES[0]), assertions: [{ name: 'no tool result', pass: false }] }]).status).toBe('FAIL')
  })
  test('missing required lanes stay partial; provider inventory cannot count as pass', () => {
    const result = summarizeE06Rows([{ id: 'E06-PROVIDER-INVENTORY', status: 'INFO', providers: [{ provider: 'synthetic', modelCount: 1 }] }])
    expect(result.status).toBe('PARTIAL')
    expect(result.localLanesComplete).toBe(false)
    expect(result.missing).toHaveLength(4)
  })
  test('rejects unsafe live execution before touching sessions', () => {
    expect(() => assertE06IsolatedPreflight({ ...validInput, isolatedProfileConfirmed: '0' })).toThrow('QA_E06_ISOLATED_PROFILE')
    expect(() => assertE06IsolatedPreflight({ ...validInput, applicationSha: 'short' })).toThrow('40 hex')
    expect(() => assertE06IsolatedPreflight({ ...validInput, reportDir: 'relative' })).toThrow('absolute')
    expect(() => assertE06IsolatedPreflight({ ...validInput, selection: { channelId: '', modelId: 'x' } })).toThrow('authorized Pi')
    expect(() => assertE06IsolatedPreflight({ ...validInput, reportDir: validInput.profileRoot })).toThrow('differ')
  })
  test('safe preflight returns only nonsecret attestation', () => {
    expect(assertE06IsolatedPreflight(validInput)).toEqual({
      fixedApplicationSha: validInput.applicationSha, isolatedProfile: true, approvedModelSelection: true,
    })
  })
})
