/** The local P06 electron driver must remain parseable and explicit about its gates.
 * This does NOT execute the Electron/Pi/provider real-world test.
 */
import { describe, expect, test } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
describe('P06-S02 local Electron driver contract (static only)', () => {
  test('Node parses the standalone CDP replay script without loading credentials', () => {
    const path = resolve(import.meta.dir, '../../../../../../scripts/qa/review-background-p06.mjs')
    expect(() => execFileSync('node', ['--check', path], { stdio: 'pipe', timeout: 10000 })).not.toThrow()
    const source = readFileSync(path, 'utf8')
    expect(source).toContain('P06-S02-E01')
    expect(source).toContain('P06-S02-E02')
    expect(source).toContain('runTwice')
    expect(source).toContain('p06-summary.json')
  })
})
