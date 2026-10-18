import { describe, expect, test } from 'bun:test'
import type { CaseAggregateV2, ReviewBatch, ReviewRunV2 } from '@profer/shared'
import { assertBatchCaseTemplateLock, assertBatchRunTemplateLock } from './batch-template-lock'

const batch = { templateId: 'published-template', templateVersion: 3, caseIds: ['case-1'] } as ReviewBatch
const aggregate = (version = 3, templateId = 'published-template') => ({
  caseV2: { id: 'case-1', templateId, templateVersion: version },
} as CaseAggregateV2)

describe('P06 R02 batch transaction must run the frozen case template', () => {
  test('matching same-case template allows dispatch', () => {
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', aggregate())).not.toThrow()
    expect(() => assertBatchRunTemplateLock(batch, { templateId: batch.templateId, templateVersion: 3 } as ReviewRunV2)).not.toThrow()
  })
  test('cross-case, absent aggregate, changed template ID or version deny before provider', () => {
    expect(() => assertBatchCaseTemplateLock(batch, 'another-case', aggregate())).toThrow('不属于')
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', undefined)).toThrow('无法读取')
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', aggregate(2))).toThrow('版本')
    expect(() => assertBatchCaseTemplateLock(batch, 'case-1', aggregate(3, 'other'))).toThrow('版本')
  })
  test('provider Run with another template cannot be accepted as completed', () => {
    expect(() => assertBatchRunTemplateLock(batch, { templateId: 'comprehensive-assessment-v2', templateVersion: 3 } as ReviewRunV2)).toThrow('不一致')
    expect(() => assertBatchRunTemplateLock(batch, { templateId: 'published-template', templateVersion: 2 } as ReviewRunV2)).toThrow('不一致')
  })
})
