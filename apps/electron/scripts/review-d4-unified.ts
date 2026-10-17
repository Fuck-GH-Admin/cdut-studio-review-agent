/**
 * D4 G01-G08 unified local candidate catalog and technical pre-review bridge.
 * Operates on existing D1/D3/D2/TemplateStore; never publishes university rules.
 *
 * bun apps/electron/scripts/review-d4-unified.ts list
 * bun apps/electron/scripts/review-d4-unified.ts verify
 * PROFER_CONFIG_DIR=<isolated-dir> bun apps/electron/scripts/review-d4-unified.ts install [templateId]
 * PROFER_CONFIG_DIR=<isolated-dir> bun apps/electron/scripts/review-d4-unified.ts installed
 * bun apps/electron/scripts/review-d4-unified.ts preview <templateId> <selection.json> <case.json>
 *
 * A visible draft shell is NOT an executable ruleset by itself. D2 pre-review
 * requires explicit workspace + scenario selection + case through the existing
 * review-d2-plan.ts create/attach workflow.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import type { D2ScenarioSelection, ReviewAuthoringWorkspaceV1, ReviewCaseV2 } from '@profer/shared'
import { validateReviewAuthoringV1 } from '../src/main/lib/review/review-authoring-v1'
import { exportD3Bundle, importD3Bundle } from '../src/main/lib/review/review-d3-module-library'
import { compileD2RuntimePlan, makeD2CandidateShell } from '../src/main/lib/review/review-d2-runtime'
import { getTemplate, isAuthoringCandidateDraft, listTemplates, saveAuthoringCandidateDraft } from '../src/main/lib/review/template-store'

export interface D4UnifiedEntry {
  domain: string
  sourcePR: number
  sourceHeadSha: string
  templateId: string
  templateVersion: number
  workspacePath: string
  workspaceGitBlobSha: string
  manifestPath: string
  sourceVersion: string
  sourceSha256: string | null
  previousDomainStatus: string
  integrationStatus: string
  publication: string
  clientLoadMode: string
}
export interface D4UnifiedCatalog {
  schemaVersion: number
  catalogId: string
  technicalBaseSha: string
  templateCount: number
  domainCounts: Record<string, number>
  publicationAllowed: false
  templates: D4UnifiedEntry[]
}
const REPO_ROOT = resolve(import.meta.dir, '../../..')
const INDEX = resolve(REPO_ROOT, 'docs/design/review-agent/acceptance/d4-unified-r01/catalog.json')
const EXPECTED: Record<string, number> = { G01: 5, G02: 3, G03: 10, G04: 8, G05: 6, G06: 9, G07: 7, G08: 2 }
const COMMON = 'a7a6a11d4840ad64cfc858c17b35f35180adf063'
const pathInRepo = (relative: string): string => {
  if (!relative.startsWith('docs/design/review-agent/acceptance/d4-g') ||
      !relative.match(/^docs\/design\/review-agent\/acceptance\/d4-g0[1-8]-build\/[a-zA-Z0-9/_-]+\.(json|md)$/)) {
    throw new Error('D4_CATALOG_UNSAFE_PATH: ' + relative)
  }
  return resolve(REPO_ROOT, relative)
}
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
function gitBlobSha(path: string): string {
  const bytes = readFileSync(path)
  return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
}
export function loadD4UnifiedCatalog(): D4UnifiedCatalog {
  const catalog = readJson<D4UnifiedCatalog>(INDEX)
  if (catalog.schemaVersion !== 1 || catalog.technicalBaseSha !== COMMON ||
      catalog.publicationAllowed !== false || catalog.templateCount !== 50 ||
      catalog.templates?.length !== 50) throw new Error('D4_CATALOG_INVALID_HEADER')
  const seen = new Set<string>()
  const counts: Record<string, number> = {}
  for (const entry of catalog.templates) {
    const key = entry.templateId + '@' + entry.templateVersion
    if (seen.has(key) || !/^g0[1-8]$/.test(entry.domain.toLowerCase()) ||
        !/^[0-9a-f]{40}$/.test(entry.workspaceGitBlobSha) ||
        !/^[0-9a-f]{40}$/.test(entry.sourceHeadSha) ||
        !/^[0-9a-f]{64}$/.test(entry.sourceSha256 ?? '') ||
        entry.publication !== 'candidate-held' || entry.integrationStatus !== 'NOT_RUN' ||
        !Number.isSafeInteger(entry.templateVersion) || entry.templateVersion < 1 ||
        !entry.workspacePath.includes('/d4-' + entry.domain.toLowerCase() + '-build/') ||
        !entry.manifestPath.includes('/d4-' + entry.domain.toLowerCase() + '-build/')) {
      throw new Error('D4_CATALOG_INVALID_ENTRY: ' + key)
    }
    seen.add(key)
    counts[entry.domain] = (counts[entry.domain] ?? 0) + 1
    pathInRepo(entry.workspacePath)
    pathInRepo(entry.manifestPath)
  }
  if (Object.keys(EXPECTED).some(domain =>
    counts[domain] !== EXPECTED[domain] || catalog.domainCounts[domain] !== EXPECTED[domain])) {
    throw new Error('D4_CATALOG_DOMAIN_COUNTS_MISMATCH')
  }
  return catalog
}
export function loadD4UnifiedWorkspace(entry: D4UnifiedEntry): ReviewAuthoringWorkspaceV1 {
  const path = pathInRepo(entry.workspacePath)
  if (gitBlobSha(path) !== entry.workspaceGitBlobSha) throw new Error('D4_WORKSPACE_BLOB_CHANGED: ' + entry.templateId)
  const w = readJson<ReviewAuthoringWorkspaceV1>(path)
  if (w.schemaVersion !== 1 || w.definitions.templates.length !== 1 ||
      w.definitions.templates[0]?.templateId !== entry.templateId ||
      w.definitions.templates[0]?.version !== entry.templateVersion) {
    throw new Error('D4_WORKSPACE_IDENTITY_MISMATCH: ' + entry.templateId)
  }
  const problems = validateReviewAuthoringV1(w)
  if (problems.length) throw new Error('D4_D1_INVALID ' + entry.templateId + ': ' + problems.join('; '))
  return w
}
export function verifyD4Unified(): {
  ok: boolean; catalogCount: number; authoringOk: number; transferOk: number;
  d2PlanOk: number; fixtureUnverified: string[]; errors: string[]
} {
  const entries = loadD4UnifiedCatalog().templates
  let authoringOk = 0, transferOk = 0, d2PlanOk = 0
  const fixtureUnverified: string[] = [], errors: string[] = []
  for (const entry of entries) {
    try {
      const w = loadD4UnifiedWorkspace(entry)
      authoringOk++
      const roundtrip = importD3Bundle(exportD3Bundle(w))
      if (!isDeepStrictEqual(w, roundtrip)) throw new Error('D4_D3_TRANSFER_DRIFT')
      transferOk++
      const shell = makeD2CandidateShell(w, entry.templateId, entry.templateVersion)
      if (shell.status !== 'draft' || !shell.sourceNote?.startsWith('D1_AUTHORING_CANDIDATE:') ||
          shell.sections?.length) throw new Error('D4_CANDIDATE_SHELL_INVALID')
      const sourceDir = entry.workspacePath.endsWith('/workspace/workspace.json')
        ? entry.workspacePath.slice(0, -'/workspace/workspace.json'.length)
        : entry.workspacePath.slice(0, -'/workspace.json'.length)
      const selections = ['selection.json', 'synthetic-selection.json', 'fixtures/selection.json']
      const cases = ['case.json', 'synthetic-case.json', 'fixtures/case.json']
      const selection = selections.map(n => sourceDir + '/' + n).find(n => existsSync(pathInRepo(n)))
      const casePath = cases.map(n => sourceDir + '/' + n).find(n => existsSync(pathInRepo(n)))
      if (!selection || !casePath) {
        fixtureUnverified.push(entry.templateId + ': no single default selection/case fixture')
      } else {
        const s = readJson<D2ScenarioSelection>(pathInRepo(selection))
        const c = readJson<ReviewCaseV2>(pathInRepo(casePath))
        const plan = compileD2RuntimePlan(w, s, c)
        if (plan.schemaVersion !== 3 || plan.publicationAllowed !== false ||
            plan.mapping.length < 1 || plan.subjects.length < 1 ||
            plan.mapping.some(m => !m.sourceIds.length || !m.objectKey)) {
          throw new Error('D4_D2_PLAN_INCOMPLETE')
        }
        d2PlanOk++
      }
    } catch (error) {
      errors.push(entry.templateId + ': ' + (error instanceof Error ? error.message : String(error)))
    }
  }
  return { ok: errors.length === 0 && authoringOk === 50 && transferOk === 50,
    catalogCount: entries.length, authoringOk, transferOk, d2PlanOk, fixtureUnverified, errors }
}
export function installD4Unified(templateId?: string): { installed: string[]; skipped: string[] } {
  if (!process.env.PROFER_CONFIG_DIR) throw new Error('D4_CONFIG_REQUIRED: explicit isolated PROFER_CONFIG_DIR required')
  const entries = loadD4UnifiedCatalog().templates.filter(e => !templateId || e.templateId === templateId)
  if (!entries.length) throw new Error('D4_TEMPLATE_NOT_IN_CATALOG: ' + templateId)
  // Validate every requested authoring source before the first write.
  const workspaces = entries.map(entry => ({ entry, workspace: loadD4UnifiedWorkspace(entry) }))
  const installed: string[] = [], skipped: string[] = []
  for (const { entry, workspace } of workspaces) {
    const old = getTemplate(entry.templateId, entry.templateVersion)
    if (old) {
      if (!isAuthoringCandidateDraft(entry.templateId, entry.templateVersion)) {
        throw new Error('D4_EXISTING_TEMPLATE_NOT_CANDIDATE: ' + entry.templateId)
      }
      skipped.push(entry.templateId)
      continue
    }
    const draft = makeD2CandidateShell(workspace, entry.templateId, entry.templateVersion)
    saveAuthoringCandidateDraft(draft)
    if (!isAuthoringCandidateDraft(entry.templateId, entry.templateVersion) ||
        !listTemplates().some(t => t.templateId === entry.templateId && t.version === entry.templateVersion)) {
      throw new Error('D4_TEMPLATE_NOT_DISCOVERABLE: ' + entry.templateId)
    }
    installed.push(entry.templateId)
  }
  return { installed, skipped }
}
export function inspectD4UnifiedInstalled() {
  if (!process.env.PROFER_CONFIG_DIR) throw new Error('D4_CONFIG_REQUIRED')
  const entries = loadD4UnifiedCatalog().templates
  const candidates = entries.filter(e => isAuthoringCandidateDraft(e.templateId, e.templateVersion))
  const visible = new Set(listTemplates().map(t => t.templateId + '@' + t.version))
  return { expected: entries.length, candidateHeld: candidates.length,
    visible: candidates.filter(e => visible.has(e.templateId + '@' + e.templateVersion)).length,
    missing: entries.filter(e => !visible.has(e.templateId + '@' + e.templateVersion)).map(e => e.templateId) }
}
async function main() {
  const [command, id, selection, casePath] = process.argv.slice(2)
  if (command === 'list') {
    console.log(JSON.stringify(loadD4UnifiedCatalog(), null, 2))
  } else if (command === 'verify') {
    const result = verifyD4Unified()
    console.log(JSON.stringify(result, null, 2))
    if (!result.ok) process.exitCode = 1
  } else if (command === 'install') {
    console.log(JSON.stringify(installD4Unified(id), null, 2))
  } else if (command === 'installed') {
    console.log(JSON.stringify(inspectD4UnifiedInstalled(), null, 2))
  } else if (command === 'preview') {
    if (!id || !selection || !casePath) throw new Error('preview <templateId> <selection.json> <case.json>')
    const entry = loadD4UnifiedCatalog().templates.find(e => e.templateId === id)
    if (!entry) throw new Error('D4_TEMPLATE_NOT_IN_CATALOG: ' + id)
    const plan = compileD2RuntimePlan(loadD4UnifiedWorkspace(entry),
      readJson<D2ScenarioSelection>(resolve(selection)), readJson<ReviewCaseV2>(resolve(casePath)))
    console.log(JSON.stringify({ templateId: id, fingerprint: plan.fingerprint, subjects: plan.subjects.length,
      checks: plan.mapping.length, publicationAllowed: plan.publicationAllowed }, null, 2))
  } else throw new Error('Usage: list | verify | install [templateId] | installed | preview <id> <selection> <case>')
}
if (import.meta.main) await main().catch(error => {
  console.error(String(error instanceof Error ? error.message : error))
  process.exitCode = 1
})
