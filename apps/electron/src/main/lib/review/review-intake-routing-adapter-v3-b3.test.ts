import { describe, expect, test } from 'bun:test'
import { planB3ConservativeRouting, type B3RoutingInput } from './review-intake-routing-adapter-v3-b3'

const sha = 'a'.repeat(64)
const setup = (): B3RoutingInput => ({
  startedAtMs: 1000, nowMs: 1500, automaticSelectionEnabled: true, userInterrupted: false,
  materialCandidates: [
    {candidateId:'candidate-a', caseCandidateId:'case-a',materialId:'mat-a',
      documentVersionId:'doc-a',rawSha256:sha,byteLength:42,fileName:'request.pdf',
      physicalSourceKey:'native-file-1',ownerId:'owner-a',ownerGeneration:1,
      role:'application',subjectId:'subject-a',requestId:'req-a',status:'accepted'},
  ],
  suggestions: [{templateId:'generic-lab-use',templateVersion:'1',availability:'authorized-for-technical-selection',
    confidence:0.99,caseCandidateId:'case-a',
    evidence:[{materialCandidateId:'candidate-a',rawSha256:sha,reason:'Source field matched'}]}],
})
describe('B-IN-03/B3 conservative technical-only routing',()=>{
  test('strict countdown: no automatic route before 20 seconds or implicit Case command',()=>{
    const input=setup()
    const first=planB3ConservativeRouting(input)
    expect(first.status).toBe('countdown')
    expect(first.chosen).toBeUndefined()
    const after=planB3ConservativeRouting({...input,nowMs:21000})
    expect(after.status).toBe('default-selected')
    expect(after.chosen?.templateId).toBe('generic-lab-use')
    expect(after.reason).toContain('not a Case')
  })
  test('multiple task types, unassigned role, missing Subject, unverified evidence never auto-select',()=>{
    const input=setup()
    input.nowMs=22000
    input.suggestions.push({...input.suggestions[0]!,templateId:'another'})
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.suggestions=[input.suggestions[0]!]
    input.materialCandidates[0]!.role='unassigned'
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.materialCandidates[0]!.role='application'
    input.materialCandidates[0]!.subjectId=null
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.materialCandidates[0]!.subjectId='subject-a'
    input.suggestions[0]!.evidence[0]!.rawSha256='forged-hash'
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
  })
  test('held policy and low confidence cannot pretend authorization',()=>{
    const input=setup()
    input.nowMs=22000
    input.suggestions[0]!.availability='candidate-held'
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.suggestions[0]!.availability='authorized-for-technical-selection'
    input.suggestions[0]!.confidence=0.5
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
  })
  test('user interruption/explicit manual correction outranks timer',()=>{
    const input=setup()
    input.nowMs=22000
    input.userInterrupted=true
    expect(planB3ConservativeRouting(input).status).toBe('needs-user-confirmation')
    input.userChoseTemplateId='manual-custom'
    input.userChoseTemplateVersion='2'
    const result=planB3ConservativeRouting(input)
    expect(result.status).toBe('manually-selected')
    expect(result.chosen).toEqual({templateId:'manual-custom',templateVersion:'2'})
  })
})
