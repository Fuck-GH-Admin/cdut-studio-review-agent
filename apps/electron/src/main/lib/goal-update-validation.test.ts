import { describe, expect, test } from 'bun:test'
import { validateGoalUpdatePatch } from './goal-update-validation'

describe('Goal IPC 更新验证', () => {
  test('允许有效文本契约和正整数预算', () => {
    expect(validateGoalUpdatePatch({ goal: ' 新目标 ', contract: { verification: ' 测试通过 ' }, limits: { maxIterations: 40, maxTokens: 10000 } })).toEqual({ goal: '新目标', contract: { verification: '测试通过' }, limits: { maxIterations: 40, maxTokens: 10000 } })
  })
  test.each([NaN, Infinity, -1, 0, 1.2, '30', null])('拒绝非法预算 %s', (value) => {
    expect(() => validateGoalUpdatePatch({ limits: { maxIterations: value } })).toThrow()
  })
  for (const value of [null, [], { goal: '' }, { goal: 3 }, { limits: [] }, { contract: { verification: {} } }, { limits: { bypass: true } }, { status: 'completed' }]) {
    test(`拒绝非法更新结构 ${JSON.stringify(value)}`, () => {
      expect(() => validateGoalUpdatePatch(value)).toThrow()
    })
  }
})
