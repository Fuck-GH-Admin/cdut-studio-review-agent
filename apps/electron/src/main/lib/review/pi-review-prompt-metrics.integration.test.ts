/** Real D2 G08 → actual Pi run preparation → model-free prompt measurement. */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { listD4ClientTemplates, createD4ClientCase } from './review-d4-client'
import { getCaseV2Aggregate } from './application-service'
import { preparePiReviewRunV2 } from './pi-case-review-service'
import { buildPiReviewPromptMetrics } from './pi-review-prompt-metrics'

const profile = mkdtempSync(join(tmpdir(), 'd4-p2b-metrics-test-'))
process.env.PROFER_CONFIG_DIR = profile
afterAll(() => rmSync(profile, { recursive: true, force: true }))

describe('P2-B actual Pi prepare, no Provider', () => {
  test('G08 two frozen synthetic objects give 107 matching D2 Check IDs in a real userMessage', async () => {
    const t = listD4ClientTemplates().find(item => item.templateId === 'g08-t02')!
    expect(t).toBeDefined()
    expect(t.selection.targets).toHaveLength(2)
    const c = await createD4ClientCase({
      title: 'P2B-SYNTHETIC-MEASURE', applicant: '仅测试', academicYear: '2026-2027',
      d4: { selection: t.selection, reviewerConfirmation: 'explicit-ui-confirmation' },
    })
    const agg = getCaseV2Aggregate(c.id)!
    expect(agg.d2RuntimePlan).toBeDefined()
    const prepared = preparePiReviewRunV2({ caseId: c.id, sessionId: 'p2b-session', turnId: 'p2b-turn' })
    const plan = agg.d2RuntimePlan!
    const metrics = buildPiReviewPromptMetrics({
      message: prepared.userMessage, sourceSha: 'ci-fixture', templateId: t.templateId,
      templateVersion: t.version, selection: t.selection, subjects: agg.caseV2.subjects.length,
      ruleIds: plan.rules.map(rule => rule.id), checkIds: plan.mapping.map(row => row.checkId),
      ruleRequirements: plan.rules.map(rule => ({ id: rule.id, requirement: rule.requirement })),
    })
    expect(metrics.subjects).toBe(2)
    expect(metrics.checkIds).toHaveLength(107)
    expect(metrics.dictionaryMode).toBeTrue()
    expect(metrics.fieldContractPresent).toBeTrue()
    expect(metrics.unconfirmedRuleConstraintPresent).toBeTrue()
    expect(metrics.sourceScopeConstraintPresent).toBeTrue()
    expect(metrics.characters).toBeGreaterThan(30000)
    expect(metrics.modelInvoked).toBeFalse()
    expect(prepared.runId).toBeTruthy()
    for (const row of plan.mapping) {
      expect(prepared.userMessage).toContain(row.checkId)
      expect(prepared.userMessage).toContain(row.ruleId)
    }
  })
})
