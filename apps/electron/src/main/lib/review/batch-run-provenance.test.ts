import { describe, expect, test } from 'bun:test'
import type { BatchStateV2, ReviewRunV2 } from '@profer/shared'
import { validateBoundBatchRun } from './batch-run-provenance'

const batch = { id: 'first', name: 'first', templateId: 't', templateVersion: 1, caseIds: ['c'], policyVersionLock: [], createdAt: '' }
const entry: BatchStateV2['cases'][number] = { caseId: 'c', status: 'done', runId: 'run-a', runInputHash: 'hash-a' }
const run = { id: 'run-a', caseId: 'c', templateId: 't', templateVersion: 1,
  inputManifest: { hash: 'hash-a', templateVersion: 1 } } as ReviewRunV2

describe('P06 batch Run binding', () => {
  test('same template in two batches does not permit substituting a later Run', () => {
    expect(validateBoundBatchRun(batch, entry, run)).toEqual(run)
    expect(validateBoundBatchRun(batch, entry, { ...run, id: 'run-b', inputManifest: { ...run.inputManifest, hash: 'hash-b' } })).toBeUndefined()
    expect(validateBoundBatchRun(batch, { ...entry, runId: 'run-b' }, run)).toBeUndefined()
  })
  test('legacy unbound, wrong case, template and changed input all fail closed', () => {
    const invalid = [
      { ...entry, runId: undefined },
      { ...entry, runInputHash: undefined },
      { ...entry, caseId: 'another' },
    ]
    for (const broken of invalid) expect(validateBoundBatchRun(batch, broken, run)).toBeUndefined()
    for (const wrong of [
      { ...run, caseId: 'another' }, { ...run, templateId: 'other' },
      { ...run, templateVersion: 2 }, { ...run, inputManifest: { ...run.inputManifest, templateVersion: 2 } },
      { ...run, inputManifest: { ...run.inputManifest, hash: 'changed' } },
    ]) expect(validateBoundBatchRun(batch, entry, wrong)).toBeUndefined()
    expect(validateBoundBatchRun(batch, entry, undefined)).toBeUndefined()
  })
})
