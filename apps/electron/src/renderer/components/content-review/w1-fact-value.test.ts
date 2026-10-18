import { describe, expect, test } from 'bun:test'
import { w1ParseHumanFieldValue } from './w1-fact-value'

describe('W1 human fact correction preserves author-declared V2 data types', () => {
  test('number and unit are preserved without string fallback', () => {
    expect(w1ParseHumanFieldValue('120.5', 'number', [], { kind: 'number', value: 80, unit: '人' }))
      .toEqual({ kind: 'number', value: 120.5, unit: '人' })
    expect(() => w1ParseHumanFieldValue('NaN', 'number')).toThrow('W1_FACT_NUMBER_INVALID')
    expect(() => w1ParseHumanFieldValue('Infinity', 'number')).toThrow('W1_FACT_NUMBER_INVALID')
  })
  test('strict boolean, date and enum validation rejects fabricated interpretations', () => {
    expect(w1ParseHumanFieldValue('false', 'boolean')).toEqual({ kind: 'boolean', value: false })
    expect(() => w1ParseHumanFieldValue('maybe', 'boolean')).toThrow('W1_FACT_BOOLEAN_INVALID')
    expect(w1ParseHumanFieldValue('2026-10-19', 'date')).toEqual({ kind: 'date', value: '2026-10-19' })
    expect(() => w1ParseHumanFieldValue('2026-02-31', 'date')).toThrow('W1_FACT_DATE_INVALID')
    expect(w1ParseHumanFieldValue('approved', 'enum', ['approved', 'pending']))
      .toEqual({ kind: 'enum', value: 'approved' })
    expect(() => w1ParseHumanFieldValue('silently approved', 'enum', ['pending'])).toThrow('W1_FACT_ENUM_INVALID')
  })
  test('multi-value and free-text inputs are explicit, normalized and bounded by nonempty contract', () => {
    expect(w1ParseHumanFieldValue('校区 A、校区 B,校区 A', 'multi'))
      .toEqual({ kind: 'multi', value: ['校区 A', '校区 B'] })
    expect(w1ParseHumanFieldValue('  人工核验备注  ', 'text'))
      .toEqual({ kind: 'text', value: '人工核验备注' })
    expect(() => w1ParseHumanFieldValue('  ', 'text')).toThrow('W1_FACT_VALUE_REQUIRED')
    expect(() => w1ParseHumanFieldValue('any', 'object')).toThrow('W1_FACT_KIND_UNSUPPORTED')
  })
})
