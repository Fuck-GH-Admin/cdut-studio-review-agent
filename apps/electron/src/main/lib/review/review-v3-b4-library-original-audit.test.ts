import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const base='../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/'
type RecoveryRow={
  domain:string
  templateId:string
  libraryFilename:string|null
  observedLibrarySha256:string|null
  claimedD4SourceSha256:string
  status:string
  publicationAllowed:boolean
  policyApproval:string
  independentGold:string
}
type RecoveryEvidence={
  schemaVersion:string
  sourceFrozenD4SHA:string
  entries:RecoveryRow[]
  historicalGitMatched:number
  totalTechnicalRawMatches:number
  totalCandidates:number
  publicationAllowed:boolean
}
const evidence=JSON.parse(readFileSync(fileURLToPath(new URL(
  base+'B4-50-ORIGINAL-LIBRARY-RECOVERY-R11.json',import.meta.url,
)),'utf8')) as RecoveryEvidence
const historical=readFileSync(fileURLToPath(new URL(
  base+'B4-50-ORIGINAL-MD-BYTE-AUDIT-R03.csv',import.meta.url,
)),'utf8').trim().split('\n').slice(1).map(line=>{
  const fields=line.split(',')
  return {domain:fields[0]!,templateId:fields[1]!,frozenSha:fields[4]!,status:fields[6]!}
})
const sha256=/^[a-f0-9]{64}$/

describe('B4 R11 Library original bytes evidence remains candidate-only and source-pinned',()=>{
  test('38 previously missing source records are one-to-one linked to frozen D4 claims',()=>{
    expect(evidence.schemaVersion).toBe('review-v3-b4-personal-library-raw-recovery/1')
    expect(evidence.sourceFrozenD4SHA).toBe('b68443b23293b4714e61a3b81383d3d3a56434fc')
    const unavailable=historical.filter(x=>x.status==='UNAVAILABLE_ORIGINAL_BYTES')
    expect(unavailable).toHaveLength(38)
    expect(evidence.entries).toHaveLength(unavailable.length)
    const seen=new Set<string>()
    for(const item of evidence.entries){
      const id=item.domain+':'+item.templateId
      expect(seen.has(id)).toBe(false)
      seen.add(id)
      const original=unavailable.find(x=>x.domain===item.domain&&x.templateId===item.templateId)
      expect(original).toBeDefined()
      expect(item.claimedD4SourceSha256).toBe(original!.frozenSha)
      expect(sha256.test(item.claimedD4SourceSha256)).toBe(true)
      expect(item.publicationAllowed).toBe(false)
      expect(item.policyApproval).toBe('NOT_VERIFIED')
      expect(item.independentGold).toBe('NOT_AUTHORIZED_OR_NOT_RUN')
      if(item.status==='MATCHED_LIBRARY_RAW_BYTES'){
        if(item.observedLibrarySha256===null)throw new Error('B4_R11_MISSING_RAW_DIGEST')
        expect(sha256.test(item.observedLibrarySha256)).toBe(true)
        expect(item.observedLibrarySha256).toBe(item.claimedD4SourceSha256)
        expect(typeof item.libraryFilename).toBe('string')
      }else if(item.status==='HASH_MISMATCH_QUARANTINED'){
        if(item.observedLibrarySha256===null)throw new Error('B4_R11_MISSING_RAW_DIGEST')
        expect(sha256.test(item.observedLibrarySha256)).toBe(true)
        expect(item.observedLibrarySha256).not.toBe(item.claimedD4SourceSha256)
        expect(typeof item.libraryFilename).toBe('string')
      }else{
        expect(item.status).toBe('RAW_LIBRARY_FILE_NOT_FOUND')
        expect(item.observedLibrarySha256).toBeNull()
        expect(item.libraryFilename).toBeNull()
      }
    }
  })
  test('raw-match accounting is precise, never a policy/Gold success',()=>{
    const matches=evidence.entries.filter(x=>x.status==='MATCHED_LIBRARY_RAW_BYTES')
    const divergent=evidence.entries.filter(x=>x.status==='HASH_MISMATCH_QUARANTINED')
    const missing=evidence.entries.filter(x=>x.status==='RAW_LIBRARY_FILE_NOT_FOUND')
    expect(matches).toHaveLength(31)
    expect(divergent.map(x=>x.templateId).sort()).toEqual([
      'd4-g04-t06','g02-t03-review','g06-t01','g08-t03',
    ])
    expect(missing.map(x=>x.templateId).sort()).toEqual([
      'd4-g04-t03','g03-t12','g06-t06',
    ])
    expect(evidence.historicalGitMatched).toBe(12)
    expect(evidence.totalTechnicalRawMatches).toBe(43)
    expect(evidence.totalCandidates).toBe(50)
    expect(evidence.publicationAllowed).toBe(false)
    expect(matches.length+divergent.length+missing.length).toBe(38)
  })
})
