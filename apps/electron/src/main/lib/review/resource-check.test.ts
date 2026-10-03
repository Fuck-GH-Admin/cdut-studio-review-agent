/**
 * N7 单测（资源自检诚实标注 + 固定集脚手架）
 */
import { describe, expect, test } from 'bun:test'
import { resourceCheck, runGoldenSet, type GoldenCase } from './resource-check'

describe('资源自检（N7）', () => {
  test('Given 资源缺失 When 检查 Then OCR 标 deferred（业务有降级路径）且必需项可用', () => {
    const report = resourceCheck('/nonexistent-root')
    const ocr = report.items.find((item) => item.name === 'OCR wasm 引擎')!
    expect(ocr.status).toBe('deferred')
    expect(report.allRequiredAvailable).toBeTrue() // 必需项（解析）可用
  })
})

describe('固定集脚手架（04 §5）', () => {
  const cases: GoldenCase[] = [
    { caseId: 'g1', facts: { level: { known: true, value: 'national-1' } }, expected: { condition: { field: 'level', op: 'in', value: ['national-1', 'school-1'] }, expectedStatus: 'true' } },
    { caseId: 'g2', facts: { level: { known: true, value: 'school-2' } }, expected: { condition: { field: 'level', op: 'in', value: ['national-1', 'school-1'] }, expectedStatus: 'false' } },
    { caseId: 'g3', facts: {}, expected: { condition: { field: 'level', op: 'exists' }, expectedStatus: 'unknown' } },
  ]

  test('Given 三值固定集 When 运行 Then 3/3 通过且准确率为计算值', () => {
    const { results, accuracy } = runGoldenSet(cases)
    expect(results.every((result) => result.pass)).toBeTrue()
    expect(accuracy).toBe(1)
  })

  test('Given 错误期望 When 运行 Then 如实计入失败（不虚报）', () => {
    const bad: GoldenCase[] = [...cases, { caseId: 'g4', facts: { level: { known: true, value: 'school-2' } }, expected: { condition: { field: 'level', op: 'in', value: ['national-1'] }, expectedStatus: 'true' } }]
    const { accuracy } = runGoldenSet(bad)
    expect(accuracy).toBe(0.75)
  })
})
