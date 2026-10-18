/**
 * C10-R03: Main-owned staged intake is a one-use, owner-bound capability.
 * Only test code mocks the OS picker. The actual claim/release/discard functions
 * and the real staging, source-file checks and routing logic execute unchanged.
 */
import { afterAll, describe, expect, mock, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = mkdtempSync(join(tmpdir(), 'd4-c10-r03-intake-'))
const source = join(root, '公共教学教室借用申请.md')
writeFileSync(source, '# 合成教室借用申请\n申请借用公共教学教室开展教学讨论。\n')
let pickerPath = source
mock.module('electron', () => ({
  dialog: {
    showOpenDialog: async () => ({ canceled: false, filePaths: [pickerPath] }),
  },
}))
const { stageD4Intake, claimD4Intake, releaseD4Intake, discardD4Intake } = await import('./review-d4-intake')
afterAll(() => rmSync(root, { recursive: true, force: true }))

async function stage(owner: number): Promise<string> {
  const preview = await stageD4Intake(owner)
  expect(preview).not.toBeNull()
  expect(preview!.route.status).not.toBe('multiple-tasks')
  return preview!.token
}

describe('D4-C10-R03 Main intake token replay and sender isolation', () => {
  test('unknown or forged token fails closed', () => {
    expect(() => claimD4Intake('forged-c10-r03', 501)).toThrow('D4_INTAKE_TOKEN_INVALID')
    expect(discardD4Intake('forged-c10-r03', 501)).toBe(false)
  })

  test('other sender cannot claim or discard; original owner can still claim', async () => {
    const token = await stage(501)
    expect(() => claimD4Intake(token, 502)).toThrow('D4_INTAKE_TOKEN_INVALID')
    expect(discardD4Intake(token, 502)).toBe(false)
    const claimed = claimD4Intake(token, 501)
    releaseD4Intake(claimed, true)
  })

  test('in-flight concurrent second claim is refused; consumed token never replays', async () => {
    const token = await stage(503)
    const first = claimD4Intake(token, 503)
    expect(() => claimD4Intake(token, 503)).toThrow('D4_INTAKE_TOKEN_INVALID')
    expect(() => claimD4Intake(token, 504)).toThrow('D4_INTAKE_TOKEN_INVALID')
    expect(discardD4Intake(token, 503)).toBe(false)
    releaseD4Intake(first, true)
    expect(() => claimD4Intake(token, 503)).toThrow('D4_INTAKE_TOKEN_INVALID')
    expect(discardD4Intake(token, 503)).toBe(false)
  })

  test("failed operation restores the same owner's ability, but never the wrong owner", async () => {
    const token = await stage(505)
    const first = claimD4Intake(token, 505)
    releaseD4Intake(first, false)
    expect(() => claimD4Intake(token, 506)).toThrow('D4_INTAKE_TOKEN_INVALID')
    const retry = claimD4Intake(token, 505)
    releaseD4Intake(retry, true)
    expect(() => claimD4Intake(token, 505)).toThrow('D4_INTAKE_TOKEN_INVALID')
  })

  test("cancel discards only its owner's unused token", async () => {
    const token = await stage(507)
    expect(discardD4Intake(token, 508)).toBe(false)
    expect(discardD4Intake(token, 507)).toBe(true)
    expect(() => claimD4Intake(token, 507)).toThrow('D4_INTAKE_TOKEN_INVALID')
  })
})
