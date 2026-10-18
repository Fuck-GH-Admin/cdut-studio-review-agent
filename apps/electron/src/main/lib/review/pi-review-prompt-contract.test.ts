import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { CaseAggregateV2, RuleSpec } from '@profer/shared'
import { compactD2MappingForPi, piObservationFieldContract, piRuleCatalogForPrompt, piRuleForPrompt, PI_SUBMIT_SCHEMA_CONTRACT } from './pi-review-prompt-contract'

const planPath = resolve(import.meta.dir, '../../../../../../docs/design/review-agent/acceptance/d4-product-loop-r01/evidence/g08-plan.json')
const plan = JSON.parse(readFileSync(planPath, 'utf8')) as NonNullable<CaseAggregateV2['d2RuntimePlan']>

describe('P2-A Pi prompt contract does not omit, merge, or invent audit responsibilities', () => {
  test('all G08 107 immutable D2 rule/check targets remain individually listed in compact model map', () => {
    expect(plan.mapping).toHaveLength(107)
    const text = compactD2MappingForPi(plan.mapping)
    const rows = text.split('\n').slice(2)
    expect(rows).toHaveLength(plan.mapping.length)
    for (const [index, entry] of plan.mapping.entries()) {
      const cells = rows[index]!.split(' | ')
      expect(cells[0]).toBe(entry.ruleId)
      expect(cells[1]).toBe(entry.checkId)
      expect(cells[2]).toBe(entry.subjectId ?? '整案')
      expect(cells[3]).toBe(entry.objectKey ?? '整案')
      expect(cells[4]).toBe(entry.authority)
      expect(cells[5]).toBe(entry.applicability ?? '整案')
      expect(cells[6]).toBe((entry.evidenceCoverage?.supportsFacts ?? []).join(',') || '无')
    }
    expect(new Set(rows.map(row => row.split(' | ')[1])).size).toBe(rows.length)
    const prior = plan.mapping.map(item => item.ruleId + ' / ' + item.checkId + ' → ' +
      (item.subjectId ?? '整案') + ' / ' + (item.objectKey ?? '整案') + ' / ' +
      item.authority + ' / 适用性=' + (item.applicability ?? '整案') + ' / 证明事实=' +
      JSON.stringify(item.evidenceCoverage?.supportsFacts ?? [])).join('；')
    // Compressed without dropping check IDs, applicability, authorities or supported facts.
    // Full ruleId/checkId/objectKey/subjectId/source-fact values are retained; do not claim 50% savings by dropping them.
    expect(text.length).toBeLessThan(prior.length * 0.95)
  })

  test('schema forbids any invented Observation when frozen template has no declared FieldSpec', () => {
    const text = piObservationFieldContract({ fields: [] }, 'g08-case')
    expect(text).toContain('observations 必须省略或为 []')
    expect(text).toContain('不要')
    expect(PI_SUBMIT_SCHEMA_CONTRACT).toContain('未确认')
    expect(PI_SUBMIT_SCHEMA_CONTRACT).toContain('EvidenceLink')
    expect(PI_SUBMIT_SCHEMA_CONTRACT).toContain('unknown')
    expect(PI_SUBMIT_SCHEMA_CONTRACT).toContain('finish=false')
  })

  test('render all 107 rule requirements, and expose all unconfirmed policy restrictions', () => {
    expect(plan.rules).toHaveLength(107)
    const lines = plan.rules.map(rule => piRuleForPrompt(rule))
    expect(lines).toHaveLength(107)
    for (let index = 0; index < plan.rules.length; index++) {
      const rule = plan.rules[index]!
      expect(lines[index]).toContain(rule.id)
      expect(lines[index]).toContain(rule.title)
      expect(lines[index]).toContain(rule.requirement)
      if (rule.confirmation !== 'confirmed') {
        expect(lines[index]).toContain('未确认→只可 awaiting-confirmation')
      }
    }
    expect(plan.rules.filter(rule => rule.confirmation !== 'confirmed').length).toBeGreaterThan(0)
  })

  test('G08 107 fixed RuleSpecs are losslessly indexed to 70 complete requirement strings', () => {
    const catalog = piRuleCatalogForPrompt(plan.rules, () => undefined)
    expect(catalog.mode).toBe('dictionary')
    expect(catalog.pointers).toHaveLength(107)
    expect(catalog.requirements).toHaveLength(70)
    expect(new Set(catalog.pointers.map(pointer => pointer.ruleId)).size).toBe(107)
    const requirementLookup = new Map(catalog.requirements.map(entry => [entry.id, entry.requirement]))
    for (const [index, rule] of plan.rules.entries()) {
      const pointer = catalog.pointers[index]!
      expect(pointer.ruleId).toBe(rule.id)
      expect(requirementLookup.get(pointer.requirementId)).toBe(rule.requirement)
      expect(catalog.text).toContain(rule.id)
      expect(catalog.text).toContain(rule.title)
      if (rule.confirmation !== 'confirmed') expect(catalog.text).toContain('未确认→只可 awaiting-confirmation')
    }
    for (const requirement of catalog.requirements) {
      expect(catalog.text).toContain(`[${requirement.id}]\\n${requirement.requirement}`.replace('\\n', '\n'))
    }
    const expanded = plan.rules.map(rule => piRuleForPrompt(rule)).join('\n')
    expect(catalog.text.length).toBeLessThan(expanded.length * 0.8)
  })

  test('small distinct RuleSpecs stay expanded, without dictionary indirection', () => {
    const catalog = piRuleCatalogForPrompt(plan.rules.slice(0, 1), () => undefined)
    expect(catalog.mode).toBe('expanded')
    expect(catalog.text).toContain(plan.rules[0]!.requirement)
  })

  test('even if model text claims acceptance, deterministic gates are not bypassed by prompt text', () => {
    const unconfirmed = plan.rules.find(rule => rule.confirmation !== 'confirmed') as RuleSpec
    const line = piRuleForPrompt(unconfirmed)
    expect(line).toContain('awaiting-confirmation')
    expect(line).not.toContain('已确认')
    expect(PI_SUBMIT_SCHEMA_CONTRACT).toContain('不能等同 not-applicable')
  })
})
