import { describe, expect, test } from 'bun:test'
import { searchStudyRouted } from './study-retrieval-router'

/** 空会话标识（合法字符集，且从未导入任何学习资料）。 */
const EMPTY_SESSION = 'study-router-empty-session'

describe('速课堂双引擎路由', () => {
  test('默认走 classic 引擎且空会话返回空结果', () => {
    const result = searchStudyRouted(EMPTY_SESSION, '中值定理')
    expect(result.success).toBe(true)
    expect(result.items).toEqual([])
  })

  test('显式 classic 引擎行为一致', () => {
    const result = searchStudyRouted(EMPTY_SESSION, '拉格朗日中值定理', 'classic')
    expect(result.success).toBe(true)
    expect(result.items).toEqual([])
  })

  test('graphrag 引擎空会话同样安全返回空结果', () => {
    const result = searchStudyRouted(EMPTY_SESSION, '课程的思想主线', 'graphrag')
    expect(result.success).toBe(true)
    expect(result.items).toEqual([])
  })

  test('空白查询返回 EMPTY_QUERY 错误', () => {
    const result = searchStudyRouted(EMPTY_SESSION, '   ')
    expect(result.success).toBe(false)
    expect(result.items).toEqual([])
    expect(result.error).toBe('EMPTY_QUERY')
  })
})
