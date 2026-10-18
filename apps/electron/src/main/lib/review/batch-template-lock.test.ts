import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2, ReviewBatch, ReviewRunV2 } from '@profer/shared'
import { assertBatchCaseTemplateLock, assertBatchRunTemplateLock, classifyBatchRunCompletion } from './batch-template-lock'

const batch = { templateId: 'published-template', templateVersion: 3, caseIds: ['case-1'] } as ReviewBatch
const aggregate = (version = 3, templateId = 'published-template') => ({
  caseV2: { id: 'case-1', templateId, templateVersion: version },
} as CaseAggregateV2)

describe('P06 R02 batch transaction must run the frozen case template', () => {
  test('matching same-case template allows dispatch', () => {
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', aggregate())).not.toThrow()
    const run = { caseId: 'case-1', templateId: batch.templateId, templateVersion: 3,
      inputManifest: { hash: 'frozen-input', templateVersion: 3 } } as ReviewRunV2
    expect(() => assertBatchRunTemplateLock(batch, 'case-1', run)).not.toThrow()
  })
  test('cross-case, absent aggregate, changed template ID or version deny before provider', () => {
    expect(() => assertBatchCaseTemplateLock(batch, 'another-case', aggregate())).toThrow('不属于')
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', undefined)).toThrow('无法读取')
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', aggregate(2))).toThrow('版本')
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', aggregate(3, 'other'))).toThrow('版本')
  })
  test('provider Run with another template cannot be accepted as completed', () => {
    const run = { caseId: 'case-1', templateId: 'published-template', templateVersion: 3,
      inputManifest: { hash: 'frozen-input', templateVersion: 3 } } as ReviewRunV2
    expect(() => assertBatchRunTemplateLock(batch, 'case-2', run)).toThrow('不属于')
    expect(() => assertBatchRunTemplateLock(batch, 'case-1', { ...run, templateId: 'comprehensive-assessment-v2' })).toThrow('冻结版本')
    expect(() => assertBatchRunTemplateLock(batch, 'case-1', { ...run, templateVersion: 2 })).toThrow('冻结版本')
    expect(() => assertBatchRunTemplateLock(batch, 'case-1', { ...run, inputManifest: { ...run.inputManifest, templateVersion: 2 } })).toThrow('冻结版本')
  })
  test('completed graph with failed semantic checks is still a failed batch item; pending human checks are not technical errors', () => {
    expect(classifyBatchRunCompletion({
      status: 'completed', checks: [{ status: 'execution-failed' }],
    } as ReviewRunV2)).toBe('technical-check-failed')
    expect(classifyBatchRunCompletion({
      status: 'completed', checks: [{ status: 'awaiting-confirmation' }],
    } as ReviewRunV2)).toBe('completed')
    expect(classifyBatchRunCompletion({ status: 'failed', checks: [] } as ReviewRunV2)).toBe('failed')
  })
})
