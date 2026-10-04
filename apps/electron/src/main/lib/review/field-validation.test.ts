/**
 * G03 单测：字段类型/作用域校验（模板 schema 驱动）
 */
import { describe, expect, test } from 'bun:test'
import type { TemplateVersion } from '@profer/shared'
import { validateFieldValuesV2 } from './application-service'

const template = {
  fields: [
    { key: 'name', label: '姓名', kind: 'text', required: true, visibility: 'public' },
    { key: 'score', label: '分数', kind: 'number', required: false, visibility: 'public' },
    { key: 'applyDate', label: '申请日期', kind: 'date', required: false, visibility: 'public' },
    { key: 'level', label: '等级', kind: 'enum', required: false, visibility: 'public', options: [{ value: 'national-1', label: '国一' }, { value: 'school-1', label: '校一' }] },
    { key: 'internalNote', label: '内部备注', kind: 'text', required: false, visibility: 'internal', scope: 'subject' },
  ],
} as unknown as TemplateVersion

describe('字段校验（G03）', () => {
  test('Given 未知 key When 校验 Then 拒绝', () => {
    const issues = validateFieldValuesV2(template, 'case', { ghost: 1 }, new Set(['ghost']))
    expect(issues[0]?.reason).toContain('不在模板中')
  })

  test('Given subject 字段写入 case 作用域 When 校验 Then 作用域拒绝', () => {
    const issues = validateFieldValuesV2(template, 'case', { internalNote: 'x' }, new Set(['internalNote']))
    expect(issues[0]?.reason).toContain('不在模板中')
    expect(validateFieldValuesV2(template, 'subject', { internalNote: 'x' }, new Set(['internalNote']))).toEqual([])
  })

  test('Given 非法数字/日期/枚举 When 校验 Then 类型拒绝', () => {
    const issues = validateFieldValuesV2(template, 'case', { score: 'abc', applyDate: '明天', level: 'gold' }, new Set(['score', 'applyDate', 'level']))
    expect(issues.map((issue) => issue.reason)).toEqual(expect.arrayContaining([expect.stringContaining('有限数'), expect.stringContaining('ISO'), expect.stringContaining('枚举')]))
  })

  test('Given 合法值 When 校验 Then 通过；合法数字保留数值类型', () => {
    expect(validateFieldValuesV2(template, 'case', { name: '张三', score: '8', applyDate: '2026-10-05', level: 'national-1' }, new Set(['name']))).toEqual([])
  })
})
