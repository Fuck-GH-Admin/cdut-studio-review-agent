/** D4 eight-domain unified integration: shared tree, existing store and scoped D2 runner. */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { D2ScenarioSelection, ReviewCaseV2 } from '@profer/shared'
import {
  installD4Unified, inspectD4UnifiedInstalled, loadD4UnifiedCatalog,
  loadD4UnifiedWorkspace, verifyD4Unified,
} from '../../../../scripts/review-d4-unified'
import { compileD2RuntimePlan } from './review-d2-runtime'

const root = resolve(import.meta.dir, '../../../../../..')
const home = mkdtempSync(join(tmpdir(), 'd4-unified-'))
process.env.PROFER_CONFIG_DIR = home
afterAll(() => rmSync(home, { recursive: true, force: true }))
const json = <T>(p: string): T => JSON.parse(readFileSync(join(root, p), 'utf8')) as T

describe('D4 unified G01-G08 fixed candidates', () => {
  test('all fifty identities and exact source head provenance remain independent', () => {
    const catalog = loadD4UnifiedCatalog()
    expect(catalog.templateCount).toBe(50)
    expect(catalog.domainCounts).toEqual({ G01: 5, G02: 3, G03: 10, G04: 8, G05: 6, G06: 9, G07: 7, G08: 2 })
    expect(new Set(catalog.templates.map(e => e.templateId + '@' + e.templateVersion)).size).toBe(50)
    expect(new Set(catalog.templates.map(e => e.workspaceGitBlobSha)).size).toBe(50)
    expect(catalog.templates.every(e => e.publication === 'candidate-held' && e.sourceSha256?.length === 64)).toBeTrue()
  })
  test('all fifty D1 and D3 transfers; existing D2 plans where single fixture is supplied', () => {
    const result = verifyD4Unified()
    console.log('D4_UNIFIED_VERIFY', JSON.stringify(result))
    expect(result.errors).toEqual([])
    expect(result.authoringOk).toBe(50)
    expect(result.transferOk).toBe(50)
    expect(result.d2PlanOk).toBeGreaterThanOrEqual(45)
    expect(result.ok).toBeTrue()
  })
  test('candidate shells install into existing TemplateStore, visible and unpublishable', () => {
    const first = installD4Unified()
    expect(first.installed).toHaveLength(50)
    const second = installD4Unified()
    expect(second.installed).toHaveLength(0)
    expect(second.skipped).toHaveLength(50)
    expect(inspectD4UnifiedInstalled()).toEqual({ expected: 50, candidateHeld: 50, visible: 50, missing: [] })
  })
  test('cross-domain G02 and G08 plans do not collapse ID or object-scope, reject stale source', () => {
    const entries = loadD4UnifiedCatalog().templates
    const pick = (id: string, selection: string, cas: string) => {
      const entry = entries.find(e => e.templateId === id)!
      const w = loadD4UnifiedWorkspace(entry)
      const base = entry.workspacePath.slice(0, -'/workspace.json'.length)
      const s = json<D2ScenarioSelection>(base + '/' + selection)
      const c = json<ReviewCaseV2>(base + '/' + cas)
      return { w, s, c, plan: compileD2RuntimePlan(w, s, c) }
    }
    const g02 = pick('g02-t01-review', 'selection.json', 'case.json')
    const g08 = pick('g08-t02', 'synthetic-selection.json', 'synthetic-case.json')
    expect(g02.plan.publicationAllowed).toBeFalse()
    expect(g08.plan.publicationAllowed).toBeFalse()
    expect(g02.plan.subjects.length).toBe(2)
    expect(g08.plan.subjects.length).toBe(2)
    expect(g02.plan.mapping.some(m => m.applicability === 'unknown')).toBeTrue()
    expect(g08.plan.mapping.some(m => m.applicability === 'unknown')).toBeTrue()
    const g02Ids = new Set(g02.plan.mapping.map(m => m.ruleId))
    expect(g08.plan.mapping.some(m => g02Ids.has(m.ruleId))).toBeFalse()
    for (const plan of [g02.plan, g08.plan]) {
      expect(plan.mapping.every(m => !!m.subjectId && !!m.objectKey && m.sourceIds.length > 0)).toBeTrue()
      expect(new Set(plan.mapping.map(m => m.ruleId)).size).toBe(plan.mapping.length)
    }
    const stale = structuredClone(g08.s)
    stale.targets[0]!.conditions![0]!.sourceVersionId = 'invalid-stale-d4'
    expect(() => compileD2RuntimePlan(g08.w, stale, g08.c)).toThrow('D2_GENERIC_CONDITION_SOURCE_INVALID')
  })
})
