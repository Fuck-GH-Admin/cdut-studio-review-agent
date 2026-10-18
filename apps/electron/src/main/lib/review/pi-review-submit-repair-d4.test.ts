/** Actual G08 D2 Plan stays authoritative; repair guidance cannot unlock school approval. */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createD4ClientCase, listD4ClientTemplates } from './review-d4-client'
import { getCaseV2Aggregate } from './application-service'
import { preparePiReviewRunV2, submitPiReviewResultV2 } from './pi-case-review-service'
import { getRunV2 } from './run-store-v2'

const profile = mkdtempSync(join(tmpdir(), 'd4-p2c-repair-test-'))
process.env.PROFER_CONFIG_DIR = profile
afterAll(() => rmSync(profile, { recursive: true, force: true }))

describe('P2-C G08 immutable Plan negative feedback', () => {
  test('unconfirmed D2 RuleSpec remains blocked despite explanatory repair suggestions', async () => {
    const t = listD4ClientTemplates().find(x => x.templateId === 'g08-t02')!
    const reviewCase = await createD4ClientCase({
      title: 'P2C-SYNTHETIC-G08', applicant: '合成申请人', academicYear: '2026-2027',
      d4: { selection: t.selection, reviewerConfirmation: 'explicit-ui-confirmation' },
    })
    const aggregate = getCaseV2Aggregate(reviewCase.id)!
    const rule = aggregate.d2RuntimePlan!.rules.find(x => x.confirmation !== 'confirmed')!
    expect(rule).toBeDefined()
    const mapping = aggregate.d2RuntimePlan!.mapping.find(x => x.ruleId === rule.id)!
    const prepared = preparePiReviewRunV2({ caseId: reviewCase.id, sessionId: 'p2c-g08-session', turnId: 'p2c-g08-turn' })
    const binding = { assignmentId: prepared.assignmentId, sessionId: 'p2c-g08-session', caseId: reviewCase.id, runId: prepared.runId }
    const rejected = submitPiReviewResultV2({
      binding, triggeredBy: 'user',
      result: {
        summary: '合成待核事项',
        checks: [{ ruleId: rule.id, subjectIds: mapping.subjectId ? [mapping.subjectId] : [],
          status: 'compliant', reason: '尚无正式校规确认', sourceRefs: [] }],
        finish: true,
      },
    })
    expect(rejected.status).toBe('running')
    expect(rejected.rejected).toEqual([expect.objectContaining({ kind: 'check', reason: expect.stringContaining('规则尚未确认') })])
    expect(rejected.repairGuide?.hints[0]?.code).toBe('RULE_UNCONFIRMED')
    expect(rejected.repairGuide?.hints[0]?.nextAction).toContain('awaiting-confirmation')
    expect(rejected.missingChecks.length).toBeGreaterThan(0)
    expect(getRunV2(reviewCase.id, prepared.runId)!.checks.some(x => x.ruleId === rule.id && x.status === 'compliant')).toBeFalse()
    expect(aggregate.d2RuntimePlan!.publicationAllowed).toBeFalse()
  })
})
