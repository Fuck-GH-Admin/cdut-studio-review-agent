import { describe, expect, test } from 'bun:test'
import type { BatchStateV2, CaseAggregateV2 } from '@profer/shared'
import { getSupplementRequeueChoices } from './supplement-requeue-ui'

const caseId = 'case-a'
const caseRecord = (options: {
  stage?: string; version?: number; supplementStatus?: string; role?: string;
  taskStatus?: string; actorId?: string; extraOpen?: boolean
} = {}) => ({
  caseV2: { id: caseId, templateId: 'template', templateVersion: options.version ?? 2,
    revision: 7, stage: options.stage ?? 'reviewing' },
  supplements: [
    { id: 'sup-1', status: options.supplementStatus ?? 'satisfied', originStageId: 'review', reason: '补充材料' },
    ...(options.extraOpen ? [{ id: 'sup-2', status: 'open', originStageId: 'review', reason: '尚未提交' }] : []),
  ],
  tasks: [{ id: 'task-1', stageId: 'review', status: options.taskStatus ?? 'open',
    assigneeRole: options.role ?? 'reviewer', assigneeActorId: options.actorId }],
} as unknown as CaseAggregateV2)
const batchRecord = (id: string, options: {
  status?: BatchStateV2['status']; entry?: BatchStateV2['cases'][number]['status']; version?: number; member?: boolean
} = {}) => ({
  batch: { id, name: '批次' + id, templateId: 'template', templateVersion: options.version ?? 2,
    caseIds: options.member === false ? ['another-case'] : [caseId] },
  status: options.status ?? 'queued',
  cases: [{ caseId: options.member === false ? 'another-case' : caseId, status: options.entry ?? 'done' }],
} as unknown as BatchStateV2)

describe('L02-01 R02 supplemental target selection UI safety contract', () => {
  const both = [batchRecord('historical'), batchRecord('current')]
  test('two eligible batches are both presented without auto-selection', () => {
    const c = getSupplementRequeueChoices(caseId, caseRecord(), both)
    expect(c.readyReason).toBeNull()
    expect(c.revision).toBe(7)
    expect(c.supplements).toEqual([{ id: 'sup-1', originStageId: 'review', label: '补充材料' }])
    expect(c.targets.map((t) => t.batchId)).toEqual(['historical', 'current'])
    expect(c.targets.every((t) => t.disabledReason === null)).toBe(true)
  })
  test('bound local reviewer can hold the task, other claimed actor is refused', () => {
    expect(getSupplementRequeueChoices(caseId, caseRecord({ actorId: 'local-reviewer' }), both).readyReason).toBeNull()
    expect(getSupplementRequeueChoices(caseId, caseRecord({ actorId: 'local-user' }), both).supplements).toHaveLength(0)
  })
  test('unresolved supplement and absent matched task fail closed', () => {
    expect(getSupplementRequeueChoices(caseId, caseRecord({ extraOpen: true }), both).readyReason).toContain('未完成')
    expect(getSupplementRequeueChoices(caseId, caseRecord({ taskStatus: 'completed' }), both).supplements).toHaveLength(0)
    expect(getSupplementRequeueChoices(caseId, caseRecord({ role: 'student' }), both).readyReason).toContain('开放任务')
    expect(getSupplementRequeueChoices(caseId, caseRecord({ actorId: 'other-reviewer' }), both).supplements).toHaveLength(0)
  })
  test('wrong case stage, missing aggregate and single membership cannot proceed', () => {
    expect(getSupplementRequeueChoices(caseId, caseRecord({ stage: 'awaiting-supplement' }), both).readyReason).not.toBeNull()
    expect(getSupplementRequeueChoices(caseId, undefined, both).revision).toBeNull()
    expect(getSupplementRequeueChoices(caseId, caseRecord(), both.slice(0, 1)).readyReason).not.toBeNull()
  })
  test('historical, running, finalized and mismatched versions are explicit disabled targets', () => {
    const c = getSupplementRequeueChoices(caseId, caseRecord(), [
      batchRecord('a', { status: 'finalized' }), batchRecord('b', { status: 'running' }),
      batchRecord('c', { version: 1 }), batchRecord('d', { entry: 'queued' }),
      batchRecord('e', { entry: 'running' }), batchRecord('f', { entry: 'failed' }),
    ])
    expect(c.targets.slice(0, 5).every((t) => !!t.disabledReason)).toBe(true)
    expect(c.targets[5]?.disabledReason).toBeNull()
  })
  test('non-member batch never becomes a target', () => {
    const c = getSupplementRequeueChoices(caseId, caseRecord(), [
      batchRecord('a'), batchRecord('b'), batchRecord('not-a-member', { member: false }),
    ])
    expect(c.targets).toHaveLength(2)
  })
})
