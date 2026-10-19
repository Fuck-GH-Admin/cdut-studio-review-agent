import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const evidenceRoot=new URL('../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/',import.meta.url)
const load=(filename:string):unknown=>JSON.parse(readFileSync(
  fileURLToPath(new URL(filename,evidenceRoot)),'utf8'))
type Original={templateId:string;status:string;claimedD4SourceSha256:string}
type R11={totalTechnicalRawMatches:number;entries:Original[]}
type Recovered={templateId:string;domain:string;filename:string;sizeBytes:number;
  rawSha256:string;d4FrozenSha256:string;r11Status:string;status:string;
  archiveTechnicalChecks:number;semanticAudit:string}
type R12={sourceFrozenD4SHA:string;previousMatched:number;newlyVerifiedOriginals:number;
  totalMatched:number;totalCandidates:number;remainingHashMismatch:number;remainingRawNotFound:number;
  publicationAllowed:boolean;policyApproval:string;independentGold:string;entries:Recovered[]}

describe('B4 R12 raw-original supplementary evidence, no automatic policy publication',()=>{
  test('the three R11 missing identities are recovered without rewriting the old audit',()=>{
    const prev=load('B4-50-ORIGINAL-LIBRARY-RECOVERY-R11.json') as R11
    const now=load('B4-3-ORIGINAL-RAW-RECOVERY-R12.json') as R12
    expect(prev.totalTechnicalRawMatches).toBe(43)
    expect(now.sourceFrozenD4SHA).toBe('b68443b23293b4714e61a3b81383d3d3a56434fc')
    expect(now.entries).toHaveLength(3)
    expect(new Set(now.entries.map(x=>x.templateId)).size).toBe(3)
    expect(now.entries.reduce((n,x)=>n+x.archiveTechnicalChecks,0)).toBe(251)
    for(const item of now.entries){
      const old=prev.entries.find(x=>x.templateId===item.templateId)
      expect(old?.status).toBe('RAW_LIBRARY_FILE_NOT_FOUND')
      expect(old?.claimedD4SourceSha256).toBe(item.d4FrozenSha256)
      expect(item.rawSha256).toBe(item.d4FrozenSha256)
      expect(item.sizeBytes).toBeGreaterThan(0)
      expect(item.status).toBe('MATCHED_LIBRARY_RAW_BYTES')
      expect(item.semanticAudit).toStartWith('REQUIRES_')
    }
    expect(now.previousMatched+now.newlyVerifiedOriginals).toBe(now.totalMatched)
    expect(now.totalMatched).toBe(46)
    expect(now.totalMatched+now.remainingHashMismatch+now.remainingRawNotFound).toBe(now.totalCandidates)
  })
  test('matched raw bytes cannot be treated as policy, Gold or release approval',()=>{
    const proof=load('B4-3-ORIGINAL-RAW-RECOVERY-R12.json') as R12
    expect(proof.publicationAllowed).toBe(false)
    expect(proof.policyApproval).toBe('NOT_VERIFIED')
    expect(proof.independentGold).toBe('NOT_AUTHORIZED_OR_NOT_RUN')
    expect(proof.remainingHashMismatch).toBe(4)
  })
})
