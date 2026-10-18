import type { FieldValue } from '@profer/shared'

/** Preserve the author's V2 FieldValue kind during human correction.
 * Never silently turn a number/boolean into an untyped string.
 */
export function w1ParseHumanFieldValue(
  raw: string, kind: FieldValue['kind'],
  options: readonly string[] = [], previous?: FieldValue,
): FieldValue {
  const value = raw.trim()
  if (!value) throw new Error('W1_FACT_VALUE_REQUIRED')
  switch (kind) {
    case 'number': {
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) throw new Error('W1_FACT_NUMBER_INVALID')
      return { kind, value: parsed,
        ...(previous?.kind === 'number' && previous.unit ? { unit: previous.unit } : {}) }
    }
    case 'boolean':
      if (value !== 'true' && value !== 'false') throw new Error('W1_FACT_BOOLEAN_INVALID')
      return { kind, value: value === 'true' }
    case 'date': {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) ||
          new Date(value).toISOString().slice(0, 10) !== value) throw new Error('W1_FACT_DATE_INVALID')
      return { kind, value }
    }
    case 'enum':
      if (options.length && !options.includes(value)) throw new Error('W1_FACT_ENUM_INVALID')
      return { kind, value }
    case 'multi': {
      const values = value.split(/[，,、]/).map(x => x.trim()).filter(Boolean)
      if (!values.length) throw new Error('W1_FACT_VALUE_REQUIRED')
      return { kind, value: [...new Set(values)] }
    }
    case 'text': return { kind, value }
    default: throw new Error('W1_FACT_KIND_UNSUPPORTED')
  }
}
