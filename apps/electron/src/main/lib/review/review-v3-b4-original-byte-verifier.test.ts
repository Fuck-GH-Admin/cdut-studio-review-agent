import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { verifyB4OriginalGitBytes } from './review-v3-b4-original-byte-verifier'

const fixture = new TextEncoder().encode('abc')
const pin = {
  templateId: 'synthetic-original',
  observedGitBlob: 'f2ba8f84ab5c1bce84a7b441cb1959cfc7093b7f',
  expectedGitBlob: 'f2ba8f84ab5c1bce84a7b441cb1959cfc7093b7f',
  declaredSourceSha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
}
const auditPath = fileURLToPath(new URL(
  '../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/B4-50-ORIGINAL-MD-BYTE-AUDIT-R03.csv',
  import.meta.url,
))
describe('B4 historical Git bytes identity, without policy publication', () => {
  test('valid real byte hash + Git object hash are required', () => {
    const out = verifyB4OriginalGitBytes(fixture, pin)
    expect(out.byteCount).toBe(3)
    expect(out.expectedGitBlobPinned).toBe(true)
    expect(out.publicationAllowed).toBe(false)
    expect(out.policyApproval).toBe('NOT_VERIFIED')
    expect(out.independentGold).toBe('NOT_AUTHORIZED_OR_NOT_RUN')
    const unpinned = verifyB4OriginalGitBytes(fixture, { ...pin, expectedGitBlob: null })
    expect(unpinned.expectedGitBlobPinned).toBe(false)
  })
  test('wrong body, copied SHA256 claim, bad pinned Git SHA and malformed evidence fail closed', () => {
    expect(() => verifyB4OriginalGitBytes(new TextEncoder().encode('abcd'), pin))
      .toThrow('B4_ORIGINAL_BYTES_CONTENT_MISMATCH')
    expect(() => verifyB4OriginalGitBytes(fixture, { ...pin, declaredSourceSha256: '0'.repeat(64) }))
      .toThrow('B4_ORIGINAL_BYTES_CONTENT_MISMATCH')
    expect(() => verifyB4OriginalGitBytes(fixture, { ...pin, expectedGitBlob: '0'.repeat(40) }))
      .toThrow('B4_ORIGINAL_BYTES_CONTENT_MISMATCH')
    expect(() => verifyB4OriginalGitBytes(fixture, { ...pin, observedGitBlob: 'not-a-blob' }))
      .toThrow('B4_ORIGINAL_BYTES_INVALID_INPUT')
    expect(() => verifyB4OriginalGitBytes(new Uint8Array(), pin))
      .toThrow('B4_ORIGINAL_BYTES_INVALID_INPUT')
  })
  test('R03 is 50 explicit outcomes: 12 rehashed matches, 38 still unavailable', () => {
    const lines = readFileSync(auditPath, 'utf8').trim().split('\n')
    const rows = lines.slice(1).map(line => line.split(','))
    expect(rows).toHaveLength(50)
    expect(new Set(rows.map(row => row[1])).size).toBe(50)
    expect(rows.filter(row => row[6] === 'SHA256_REHASHED_GIT_BYTES_MATCH')).toHaveLength(12)
    expect(rows.filter(row => row[6] === 'UNAVAILABLE_ORIGINAL_BYTES')).toHaveLength(38)
    for (const row of rows) {
      expect(row[7]).toBe('candidate-held')
      expect(row[8]).toBe('false')
      expect(row[9]).toBe('NOT_VERIFIED')
      expect(row[10]).toBe('NOT_AUTHORIZED_OR_NOT_RUN')
      if (row[6] === 'SHA256_REHASHED_GIT_BYTES_MATCH') {
        expect(row[3]).toMatch(/^[a-f0-9]{40}$/)
        expect(row[4]).toMatch(/^[a-f0-9]{64}$/)
        expect(row[5]).toBe(row[4])
      } else {
        expect(row[5]).toBe('')
      }
    }
  })
})
