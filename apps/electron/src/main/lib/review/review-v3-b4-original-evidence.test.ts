import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const domains=['G01','G02','G03','G04','G05','G06','G07','G08'] as const
const source=(domain:string, type:'ORIGINAL-MD-GIT'|'OBLIGATION-SOURCE')=>{
  const path=fileURLToPath(new URL(
    '../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/B4-'+type+'-'+domain+'.json',
    import.meta.url,
  ))
  return JSON.parse(readFileSync(path,'utf8'))
}
describe('B4 historical Markdown evidence does not constitute policy approval',()=>{
  test('50 source manifests distinguished from 9 pinned Git originals and 40 metadata claims',()=>{
    const statuses:Record<string,number>={}
    let total=0
    for(const domain of domains){
      const md=source(domain,'ORIGINAL-MD-GIT'),checks=source(domain,'OBLIGATION-SOURCE')
      const expected=new Set(checks.templates.map((t:{templateId:string})=>t.templateId))
      expect(md.publicationAllowed).toBe(false)
      expect(md.sourceGitSha).toBe('b68443b23293b4714e61a3b81383d3d3a56434fc')
      expect(md.records).toHaveLength(expected.size)
      for(const row of md.records){
        expect(expected.has(row.templateId)).toBe(true)
        expect(row.sourceSha256MetadataMatchesCatalog).toBe(true)
        expect(row.originalSha256Recomputed).toBe(false)
        expect(row.policy).toBe('NOT_VERIFIED')
        expect(row.gold).toBe('NOT_AUTHORIZED_OR_NOT_RUN')
        if(row.status==='GIT_BLOB_PINNED_MATCH'||
          row.status==='GIT_BLOB_PINNED_MATCH_HISTORIC_REF'){
          expect(row.observedOriginalGitBlob).toBe(row.expectedOriginalGitBlob)
          expect(row.observedOriginalGitBlob).toMatch(/^[a-f0-9]{40}$/)
        }
        statuses[row.status]=(statuses[row.status]??0)+1
        total++
      }
    }
    expect(total).toBe(50)
    expect(statuses).toEqual({
      GIT_BLOB_PINNED_MATCH:2,
      GIT_BLOB_PINNED_MATCH_HISTORIC_REF:7,
      ORIGINAL_GIT_BLOB_OBSERVED_NOT_INDEPENDENTLY_SHA256_CHECKED:1,
      SHA256_METADATA_MATCH_ORIGINAL_ABSENT:40,
    })
  })
  test('G07 historical source ref is explicit, never substituted by D4 published policy',()=>{
    const g07=source('G07','ORIGINAL-MD-GIT')
    for(const row of g07.records){
      expect(row.status).toBe('GIT_BLOB_PINNED_MATCH_HISTORIC_REF')
      expect(row.actualOriginalSourceRef).toMatch(/^[a-f0-9]{40}$/)
      expect(row.policy).toBe('NOT_VERIFIED')
    }
  })
})
