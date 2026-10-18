#!/usr/bin/env bun
/**
 * P2-B actual offline runner, never calls Pi Provider. Usage:
 *   bun run scripts/review-d4-p2-prompt-metrics.ts --out /tmp/g08-old.json
 *   bun run scripts/review-d4-p2-prompt-metrics.ts --compare /tmp/g08-old.json /tmp/g08-new.json
 * Run each --out in a detached worktree at a fixed SOURCE_SHA.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { buildPiReviewPromptMetrics, comparePiReviewPromptMetrics, type PiReviewPromptMetricsV1 } from '../src/main/lib/review/pi-review-prompt-metrics'

const args = process.argv.slice(2)
const compareAt = args.indexOf('--compare')
if (compareAt >= 0) {
  if (args.length !== 3 || compareAt !== 0) throw new Error('Usage: --compare OLD.json NEW.json')
  const oldMetric = JSON.parse(readFileSync(args[1]!, 'utf8')) as PiReviewPromptMetricsV1
  const newMetric = JSON.parse(readFileSync(args[2]!, 'utf8')) as PiReviewPromptMetricsV1
  const result = comparePiReviewPromptMetrics(oldMetric, newMetric)
  console.log(JSON.stringify(result, null, 2))
  if (result.status !== 'PAIRED') process.exitCode = 2
} else {
  const outAt = args.indexOf('--out')
  if (outAt >= 0 && (outAt + 1 >= args.length || args.length !== 2)) throw new Error('Usage: [--out PATH]')
  if (outAt < 0 && args.length) throw new Error('Usage: [--out PATH]')
  const isolated = mkdtempSync(join(tmpdir(), 'cdut-d4-p2b-offline-'))
  // Set before any Main module import; no user profile, API key, or Provider connection.
  const previous = process.env.PROFER_CONFIG_DIR
  process.env.PROFER_CONFIG_DIR = isolated
  try {
    const [{ listD4ClientTemplates, createD4ClientCase }, { preparePiReviewRunV2 }, { getCaseV2Aggregate }] = await Promise.all([
      import('../src/main/lib/review/review-d4-client'),
      import('../src/main/lib/review/pi-case-review-service'),
      import('../src/main/lib/review/application-service'),
    ])
    const candidate = listD4ClientTemplates().find(x => x.templateId === 'g08-t02')
    if (!candidate) throw new Error('G08_T02_CANDIDATE_MISSING')
    const selection = structuredClone(candidate.selection)
    if (selection.targets.length !== 2) throw new Error('G08_SYNTHETIC_SELECTION_NOT_TWO_OBJECTS')
    const created = await createD4ClientCase({
      title: 'P2B-OFFLINE-SYNTHETIC-G08', applicant: '合成申请人', academicYear: '2026-2027',
      d4: { selection, reviewerConfirmation: 'explicit-ui-confirmation' },
    })
    const aggregate = getCaseV2Aggregate(created.id)
    if (!aggregate?.d2RuntimePlan) throw new Error('FIXED_D2_PLAN_MISSING')
    const prepared = preparePiReviewRunV2({
      caseId: created.id, sessionId: 'p2b-offline-session', turnId: 'p2b-offline-turn',
    })
    if (!prepared.userMessage || !prepared.runId) throw new Error('EMPTY_PI_PREPARE_OUTPUT')
    const plan = aggregate.d2RuntimePlan
    const sourceSha = process.env.D4_SOURCE_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const result = buildPiReviewPromptMetrics({
      message: prepared.userMessage, sourceSha, templateId: candidate.templateId,
      templateVersion: candidate.version, selection, subjects: aggregate.caseV2.subjects.length,
      ruleIds: plan.rules.map(x => x.id), checkIds: plan.mapping.map(x => x.checkId),
      ruleRequirements: plan.rules.map(x => ({ id: x.id, requirement: x.requirement })),
    })
    if (result.checkIds.length !== 107 || result.subjects !== 2) throw new Error('G08_FIXED_CHECK_COVERAGE_MISMATCH')
    const data = JSON.stringify(result, null, 2) + '\n'
    if (outAt >= 0) writeFileSync(args[outAt + 1]!, data, { flag: 'wx', mode: 0o600 })
    console.log(data.trim())
  } finally {
    if (previous === undefined) delete process.env.PROFER_CONFIG_DIR
    else process.env.PROFER_CONFIG_DIR = previous
    rmSync(isolated, { recursive: true, force: true })
  }
}
