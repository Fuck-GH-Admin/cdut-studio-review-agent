/**
 * 外部端口单测（M5，C01/C02：幂等/冲突/离线包往返；同一合同两实现）
 */
import { describe, expect, test } from 'bun:test'
import { LocalPackageAdapter, MockSchoolAdapter, type PushPayload } from './external-ports'

const payload = (overrides: Partial<PushPayload> = {}): PushPayload => ({
  caseId: 'c1', actionId: 'act-1', actionKind: 'decision', baseExternalRevision: 0, body: { result: 'pass' }, ...overrides,
})

describe('MockSchoolAdapter（C 类模拟）', () => {
  test('Given 首推 When push Then accepted 且外部版本+1', async () => {
    const mock = new MockSchoolAdapter()
    const receipt = await mock.push(payload())
    expect(receipt.status).toBe('accepted')
    expect(receipt.externalReceipt?.externalId).toBe('ext-c1-1')
  })

  test('Given 同 actionId 重放 When push Then 返回同一回执（幂等）', async () => {
    const mock = new MockSchoolAdapter()
    const first = await mock.push(payload())
    const second = await mock.push(payload())
    expect(second.id).toBe(first.id)
  })

  test('Given 外部版本已推进 When 旧版本推送 Then conflict（C02）', async () => {
    const mock = new MockSchoolAdapter()
    mock.seedRevision('c1', 5)
    const receipt = await mock.push(payload({ baseExternalRevision: 3 }))
    expect(receipt.status).toBe('conflict')
    expect(receipt.externalReceipt?.message).toContain('外部版本已推进')
  })
})

describe('LocalPackageAdapter（C01 离线）', () => {
  test('Given 正常推送 When push Then accepted 且带包哈希', async () => {
    const adapter = new LocalPackageAdapter(() => 0)
    const receipt = await adapter.push(payload())
    expect(receipt.status).toBe('accepted')
    expect(receipt.payloadHash).not.toBe('')
  })

  test('Given 外部版本与推送方不一致 When push Then conflict', async () => {
    const adapter = new LocalPackageAdapter(() => 7)
    const receipt = await adapter.push(payload({ baseExternalRevision: 7 }))
    // externalRevision(fn) = 7 写入包，导入校验 expected=7 → 一致 accepted；制造冲突需 fn 与包内不符
    expect(receipt.status).toBe('accepted')
    const conflicting = new LocalPackageAdapter(() => 7)
    const r2 = await conflicting.push(payload({ caseId: 'c2', actionId: 'act-2', baseExternalRevision: 9 }))
    expect(r2.status).toBe('conflict')
  })
})

test('Given 两种实现 When 同一载荷 Then 同一 SchoolPort 合同（可互换，C 类验收面）', async () => {
  const ports = [new MockSchoolAdapter(), new LocalPackageAdapter(() => 0)] as const
  for (const port of ports) {
    const receipt = await port.push(payload({ caseId: 'cx', actionId: `act-${port.kind}` }))
    expect(['accepted', 'conflict', 'rejected']).toContain(receipt.status)
    expect(port.kind).toBeDefined()
  }
})
