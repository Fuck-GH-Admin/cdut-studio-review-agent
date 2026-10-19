import { describe, expect, test } from 'bun:test'
import type { D4ClientTemplate } from '@profer/shared'
import { buildD4GenericObject, parseD4BulkObjectNames } from './d4-generic-object-builder'

const template = {
  templateId: 'g03-t01', version: 1, businessTypes: ['g03-resource-slot'],
  primary: ['p-public-classroom'], conditions: ['c-holiday','c-exam-period'],
  selectionSource: { sourceId: 'synthetic-authoring', sourceVersionId: 'v1' },
} as D4ClientTemplate

describe('W1 bulk human-created business objects', () => {
  test('separate confirmed names yield unique Subject identities and unknown conditions', () => {
    const names = parseD4BulkObjectNames('教学楼 A\n教学楼 B', [], 100)
    const targets = names.map((name, i) => buildD4GenericObject(template, name, String(i).padStart(16, '0')))
    expect(targets.map(t => t.title)).toEqual(names)
    expect(new Set(targets.map(t => t.subjectId)).size).toBe(2)
    expect(targets.every(t => t.scenario === '')).toBe(true)
    expect(targets.every(t => t.conditions!.every(c => c.applicability === 'unknown' && c.decidedBy === 'undetermined'))).toBe(true)
    expect(targets.every(t => t.scenarioSource?.sourceId === 'synthetic-authoring')).toBe(true)
  })
  test('duplicate normalized names and overflow refuse the whole batch', () => {
    expect(() => parseD4BulkObjectNames('教学楼Ａ\n教学楼A', [], 10)).toThrow('D4_OBJECT_BATCH_DUPLICATE_OR_INVALID')
    expect(() => parseD4BulkObjectNames('教学楼A', ['教学楼Ａ'], 10)).toThrow('D4_OBJECT_BATCH_DUPLICATE_OR_INVALID')
    expect(() => parseD4BulkObjectNames('A\nB', [], 1)).toThrow('D4_OBJECT_BATCH_LIMIT')
    expect(() => parseD4BulkObjectNames('', [], 100)).toThrow('D4_OBJECT_BATCH_LIMIT')
    expect(() => parseD4BulkObjectNames(Array.from({length: 21}, (_, i) => String(i)).join('\n'), [], 100)).toThrow('D4_OBJECT_BATCH_LIMIT')
  })
  test('invalid source contracts cannot generate reviewer-confirmed business objects', () => {
    expect(() => buildD4GenericObject({ ...template, selectionSource: undefined }, 'A', '1234567890abcdef')).toThrow('D4_OBJECT_INPUT_INVALID')
    expect(() => buildD4GenericObject(template, 'A', '../not-an-id')).toThrow('D4_OBJECT_INPUT_INVALID')
  })
})
