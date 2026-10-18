import { describe, expect, test } from 'bun:test'
import { buildPiReviewPromptMetrics, comparePiReviewPromptMetrics, promptSegment } from './pi-review-prompt-metrics'
const args = {
  sourceSha: 'base123', templateId: 'g08-t02', templateVersion: 1,
  selection: { templateId: 'g08-t02', targets: ['A','B'] },
  subjects: 2, ruleIds: ['rule-b','rule-a'], checkIds: ['check-b','check-a'],
  ruleRequirements: [{ id: 'rule-a', requirement: 'A' }, { id: 'rule-b', requirement: 'B' }],
}
const baseline = '【事项】\nA,B\n\n【检查要求】\n- A\n- B\n\n【材料目录】\nNone'

describe('P2-B actual-run prompt metrics comparison safety contract', () => {
  test('correctly measures full message, UTF8, rule region and present constraints', () => {
    const metric = buildPiReviewPromptMetrics({ ...args, message: baseline })
    expect(metric.modelInvoked).toBeFalse()
    expect(metric.characters).toBe(baseline.length)
    expect(metric.utf8Bytes).toBe(Buffer.byteLength(baseline, 'utf8'))
    expect(metric.rulesRegionCharacters).toBe('- A\n- B'.length)
    expect(metric.checkIds).toEqual(['check-a','check-b'])
    expect(metric.kind).toBe('actual-preparePiReviewRunV2-userMessage')
    expect(promptSegment(baseline, '【无此章节】', '【材料目录】')).toBe('')
  })
  test('only identical frozen plan and synthetic selections earn paired reduction metrics', () => {
    const oldMetric = buildPiReviewPromptMetrics({ ...args, message: baseline })
    const newMetric = buildPiReviewPromptMetrics({ ...args, sourceSha: 'new456', message: baseline.slice(0,-4) })
    const compared = comparePiReviewPromptMetrics(oldMetric, newMetric)
    expect(compared.status).toBe('PAIRED')
    expect(compared.characterReductionPercent).toBeGreaterThan(0)
    expect(compared.modelInvoked).toBeFalse()
  })
  test('changing template, selection, rule IDs, Check IDs or exact requirement text refuses pair', () => {
    const oldMetric = buildPiReviewPromptMetrics({ ...args, message: baseline })
    const changed = [
      { ...args, message: baseline, templateId: 'g08-t03' },
      { ...args, message: baseline, selection: { other: true } },
      { ...args, message: baseline, ruleIds: ['rule-a'] },
      { ...args, message: baseline, checkIds: ['check-a'] },
      { ...args, message: baseline, ruleRequirements: [{ id: 'rule-a', requirement: 'changed' }] },
    ]
    for (const item of changed) {
      const comparison = comparePiReviewPromptMetrics(oldMetric, buildPiReviewPromptMetrics(item))
      expect(comparison.status).toBe('UNPAIRED')
      expect(comparison.characterReductionPercent).toBeUndefined()
      expect(comparison.reasons.length).toBeGreaterThan(0)
    }
  })
  test('scrubbed result reports only digests, counts, IDs and no original document excerpts', () => {
    const message = 'sensitive applicant text\n\n【检查要求】\nREDACTED\n\n【材料目录】\n'
    const metric = buildPiReviewPromptMetrics({ ...args, message })
    expect(JSON.stringify(metric)).not.toContain('sensitive applicant text')
    expect(metric.promptSha256).toMatch(/^[a-f0-9]{64}$/)
  })
})
