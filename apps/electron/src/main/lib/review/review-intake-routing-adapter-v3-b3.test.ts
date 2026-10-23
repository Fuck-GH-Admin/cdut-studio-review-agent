import { describe, expect, test } from 'bun:test'
import { planB3ConservativeRouting, type B3RouteSuggestion } from './review-intake-routing-adapter-v3-b3'
import type { B2MaterialCandidate } from './review-intake-adapter-v3-b2'

const materials = [
  { candidateId:'application-1', caseCandidateId:'case-1', ownerId:'owner-1', ownerGeneration:1,
    status:'accepted', role:'application', subjectId:'subject-1', rawSha256:'a'.repeat(64) },
  { candidateId:'support-1', caseCandidateId:'case-1', ownerId:'owner-1', ownerGeneration:1,
    status:'accepted', role:'supporting', subjectId:'subject-1', rawSha256:'b'.repeat(64) },
] as unknown as B2MaterialCandidate[]
function suggestion(templateId:string,confidence:number):B3RouteSuggestion {
  return { templateId, templateVersion:'1', availability:'authorized-for-technical-selection',
    confidence, caseCandidateId:'case-1',
    evidence:materials.map(material=>({materialCandidateId:material.candidateId,
      rawSha256:material.rawSha256,reason:'原件中的业务对象与办理动作匹配'})) }
}
const base = {
  startedAtMs:1000, automaticSelectionEnabled:true, userInterrupted:false,
  materialCandidates:materials, suggestions:[suggestion('template-a',0.99),suggestion('template-b',0.96)],
}

describe('B3 multi-candidate conservative routing',()=>{
  test('multiple valid candidates are ranked and enter the same 20-second countdown',()=>{
    const route=planB3ConservativeRouting({...base,nowMs:1000})
    expect(route.status).toBe('countdown')
    expect(route.remainingMs).toBe(20_000)
    expect(route.candidates?.map(item=>item.templateId)).toEqual(['template-a','template-b'])
    expect(route.chosen).toBeUndefined()
  })
  test('the first ranked candidate becomes the default only after 20 seconds',()=>{
    const route=planB3ConservativeRouting({...base,nowMs:21_000})
    expect(route.status).toBe('default-selected')
    expect(route.chosen).toEqual({templateId:'template-a',templateVersion:'1'})
  })
  test('an unauthorized or incomplete candidate cannot become the default',()=>{
    const bad={...suggestion('template-b',0.99),availability:'candidate-held' as const}
    const route=planB3ConservativeRouting({...base,nowMs:21_000,suggestions:[bad]})
    expect(route.status).toBe('needs-user-confirmation')
    expect(route.chosen).toBeUndefined()
  })
  test('no evidenced candidates remains unmatched rather than picking a catalog default',()=>{
    const route=planB3ConservativeRouting({...base,nowMs:21_000,suggestions:[]})
    expect(route.status).toBe('unmatched')
    expect(route.chosen).toBeUndefined()
  })
})
