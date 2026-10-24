import {describe,expect,test} from 'bun:test'
import type {TemplateDeepMatchResponse} from '@profer/shared'
import {trustedC11ModelAutoCandidates} from './review-v3-main-local-product-intake'
import {planB3ConservativeRouting} from './review-intake-routing-adapter-v3-b3'
import type {B2MaterialCandidate} from './review-intake-adapter-v3-b2'

const catalog=[
  {templateId:'published',templateVersion:'1',name:'已发布业务',availability:'authorized-for-technical-selection' as const},
  {templateId:'held',templateVersion:'1',name:'待确认业务',availability:'candidate-held' as const},
]
function result(matches:TemplateDeepMatchResponse['matches'],scope:TemplateDeepMatchResponse['scope']='matched'):TemplateDeepMatchResponse {
  return {provider:'generic-model',scope,matches,reason:'仅为模板候选'}
}

describe('C11 Main-verified model suggestions',()=>{
  test('only current authorized high-confidence IDs can enter the Main countdown',()=>{
    const candidates=trustedC11ModelAutoCandidates(result([
      {templateId:'published',templateVersion:'1',confidence:0.96,reason:'业务材料对应'},
      {templateId:'held',templateVersion:'1',confidence:1,reason:'不得提权'},
      {templateId:'outside',templateVersion:'1',confidence:1,reason:'目录外'},
    ]),catalog)
    expect(candidates.map(item=>item.templateId)).toEqual(['published'])
    expect(candidates[0]?.evidence).toContain('业务材料对应')
  })
  test('low-confidence and uncertain responses do not trigger auto-binding',()=>{
    const weak={templateId:'published',templateVersion:'1',confidence:0.85,reason:'仍不明确'}
    expect(trustedC11ModelAutoCandidates(result([weak]),catalog)).toEqual([])
    expect(trustedC11ModelAutoCandidates(result([{...weak,confidence:1}],'uncertain'),catalog)).toEqual([])
  })
  test('verified model candidate uses the existing B3 clock and source evidence',()=>{
    const matched=trustedC11ModelAutoCandidates(result([
      {templateId:'published',templateVersion:'1',confidence:0.99,reason:'事项及办理动作吻合'},
    ]),catalog)
    const materials=[{
      candidateId:'m1',caseCandidateId:'c1',ownerId:'owner',ownerGeneration:1,
      status:'accepted',role:'application',subjectId:'s1',rawSha256:'a'.repeat(64),
    }] as B2MaterialCandidate[]
    const suggestion=matched.map((item,index)=>({
      templateId:item.templateId,templateVersion:item.templateVersion,
      availability:'authorized-for-technical-selection' as const,
      confidence:item.confidence,rank:-index,caseCandidateId:'c1',
      evidence:materials.map(material=>({materialCandidateId:material.candidateId,
        rawSha256:material.rawSha256,reason:item.evidence})),
    }))
    const input={startedAtMs:1000,automaticSelectionEnabled:true,userInterrupted:false,
      materialCandidates:materials,suggestions:suggestion}
    expect(planB3ConservativeRouting({...input,nowMs:2000}).status).toBe('countdown')
    const selected=planB3ConservativeRouting({...input,nowMs:21_000})
    expect(selected.status).toBe('default-selected')
    expect(selected.chosen).toEqual({templateId:'published',templateVersion:'1'})
    expect(planB3ConservativeRouting({...input,nowMs:21_000,userInterrupted:true}).chosen).toBeUndefined()
  })
})
