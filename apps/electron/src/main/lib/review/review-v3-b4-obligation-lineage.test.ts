import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  validateB4TechnicalArchive, sumB4Technical,
  type B4Archive,
} from './review-v3-b4-obligation-lineage'

const domains=['G01','G02','G03','G04','G05','G06','G07','G08'] as const
const load=(domain:string):B4Archive=>{
  const path=fileURLToPath(new URL(
    '../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/B4-OBLIGATION-SOURCE-'+domain+'.json',
    import.meta.url,
  ))
  return JSON.parse(readFileSync(path,'utf8')) as B4Archive
}
describe('B4 50 candidate templates: every technical Check mapped back to pinned D4 source',()=>{
  test('8 full domains, exactly 50 candidate templates, 3,875 traceable workspace obligations',()=>{
    const outputs=domains.map(domain=>validateB4TechnicalArchive(load(domain)))
    const summary=sumB4Technical(outputs)
    expect(summary.domains).toBe(8)
    expect(summary.templates).toBe(50)
    expect(summary.checks).toBe(3875)
    expect(summary.unscoped).toBe(34)
    expect(summary.candidateOnly).toBe(true)
    expect(summary.policyPublicationAllowed).toBe(false)
    expect(outputs.every(row=>row.policyValidated===0&&row.goldValidated===0)).toBe(true)
    // Unknown is recorded, never coerced to not-applicable/approved.
    expect(summary.unknown).toBeGreaterThanOrEqual(3190)
    expect(outputs.map(x=>x.workspaceChecks)).toEqual([536,171,613,972,391,610,466,116])
    expect(outputs.map(x=>x.templateCount)).toEqual([5,3,10,8,6,9,7,2])
  })
  test('tampered frozen workspace blob is rejected even if check rows remain intact',()=>{
    const edited=structuredClone(load('G02'))
    edited.templates[0]!.workspaceGitBlobSha='0'.repeat(40)
    expect(()=>validateB4TechnicalArchive(edited)).toThrow('B4_LINEAGE_TEMPLATE_LINEAGE')
  })
  test('deleting any Check, duplicating Check, or removing source locator must be visible',()=>{
    const origin=load('G08')
    const removed=structuredClone(origin)
    removed.templates[0]!.obligations.pop()
    expect(()=>validateB4TechnicalArchive(removed)).toThrow('B4_LINEAGE_TEMPLATE_LINEAGE')
    const duplicate=structuredClone(origin)
    duplicate.templates[0]!.obligations[1]=structuredClone(duplicate.templates[0]!.obligations[0]!)
    expect(()=>validateB4TechnicalArchive(duplicate)).toThrow('B4_LINEAGE_CHECK_LINEAGE')
    const missing=structuredClone(origin)
    missing.templates[0]!.obligations[0]!.sources[0]!.locator=null
    expect(()=>validateB4TechnicalArchive(missing)).toThrow('B4_LINEAGE_SOURCE_LINEAGE')
  })
  test('cannot elevate candidate to published or substitute fake independent Gold',()=>{
    const issued=structuredClone(load('G01'))
    issued.templates[0]!.publication='published' as 'candidate-held'
    expect(()=>validateB4TechnicalArchive(issued)).toThrow('B4_LINEAGE_TEMPLATE_LINEAGE')
    const gold=structuredClone(load('G03'))
    gold.templates[0]!.obligations[0]!.goldStatus='PASS' as 'NOT_AUTHORIZED_OR_NOT_RUN'
    expect(()=>validateB4TechnicalArchive(gold)).toThrow('B4_LINEAGE_CHECK_LINEAGE')
    const policy=structuredClone(load('G07'))
    policy.policyApproval='VERIFIED' as 'NOT_VERIFIED'
    expect(()=>validateB4TechnicalArchive(policy)).toThrow('B4_LINEAGE_ARCHIVE_HEADER')
  })
  test('duplicate domain or unauthorized aggregate cannot count as publication',()=>{
    const g01=validateB4TechnicalArchive(load('G01'))
    expect(()=>sumB4Technical([g01,g01])).toThrow('B4_LINEAGE_AGGREGATE')
  })
})
