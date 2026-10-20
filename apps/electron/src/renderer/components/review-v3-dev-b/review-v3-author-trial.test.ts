import { describe, expect, test } from 'bun:test'
import {
  compileReviewB1Plan, type B1AuthorDocument,
} from '../../../main/lib/review/review-template-plan-adapter-v3-b1'
import {
  parseB1TrialInput, prepareB1TechnicalTrial, exportB1AuthorCandidate,
} from './review-v3-author-trial'

function blankUnknownBusiness():B1AuthorDocument {
  return {
    schemaVersion:'review-b1/1',status:'candidate-held',
    templateId:'custom-auditor-51',templateVersion:'1.0',
    name:'Unknown new business (synthetic)',purpose:'Owner-declared only; not an official school policy',
    fields:[
      {key:'approvedCount',label:'Number',type:'number',required:true,sourceId:'user'},
      {key:'level',label:'Level',type:'enum',required:true,enumValues:['A','B'],sourceId:'user'},
      {key:'consent',label:'Consent',type:'boolean',required:true,sourceId:'user'},
      {key:'proof',label:'Real evidence',type:'evidence',required:false,sourceId:'user'},
    ],
    sources:[{sourceId:'user',kind:'user-declared',documentVersionId:'user-v1',
      locator:'author:explicit',recordedBy:'unknown-author-unverified'}],
    targets:[{targetKey:'target-a',objectKey:'obj-a',subjectId:'sub-a',
      scenario:'independent-new-business',fieldValues:{}}],
    modules:[{moduleId:'module-1',version:'1',dependsOn:[],checks:[
      {checkKey:'consent-check',requirement:'Check user consent only in technical preview',
        responsibility:'request owner',sourceIds:['user'],targetKeys:['target-a'],
        condition:{kind:'field-equals',fieldKey:'consent',equals:true}},
    ]}],
    stages:[{stageId:'manual',role:'reviewer',mode:'manual'}],
    outputs:[{outputId:'report',kind:'report'}],
  }
}
describe('B-FLOW-01: typed author trial values are not declared policy facts',()=>{
  test('blank custom workflow remains unknown; trial can show applicable and not-applicable without mutating frozen source',()=>{
    const source=blankUnknownBusiness()
    const copy=structuredClone(source)
    expect(compileReviewB1Plan(source).canonicalPlan.bindings[0]?.applicability).toBe('unknown')
    const yes=prepareB1TechnicalTrial(source,{'target-a':{approvedCount:2,level:'A',consent:true}})
    const no=prepareB1TechnicalTrial(source,{'target-a':{approvedCount:1,level:'B',consent:false}})
    expect(compileReviewB1Plan(yes).canonicalPlan.bindings[0]?.applicability).toBe('applicable')
    expect(compileReviewB1Plan(no).canonicalPlan.bindings[0]?.applicability).toBe('not-applicable')
    expect(source).toEqual(copy)
    expect(compileReviewB1Plan(source).canonicalPlan.bindings[0]?.applicability).toBe('unknown')
    expect(compileReviewB1Plan(yes).publicationAllowed).toBe(false)
  })
  test('unknown field, target, unverified evidence and invalid enum/type are rejected',()=>{
    const author=blankUnknownBusiness()
    expect(()=>prepareB1TechnicalTrial(author,{'forged-target':{consent:true}}))
      .toThrow('B1_TRIAL_UNKNOWN_TARGET')
    expect(()=>prepareB1TechnicalTrial(author,{'target-a':{hiddenField:'abc'}}))
      .toThrow('B1_TRIAL_UNKNOWN_FIELD')
    expect(()=>prepareB1TechnicalTrial(author,{'target-a':{proof:'fake evidence'}}))
      .toThrow('B1_TRIAL_EVIDENCE_REQUIRES_REAL_SOURCE')
    expect(()=>parseB1TrialInput(author.fields[1]!,'third')).toThrow('B1_TRIAL_ENUM_INVALID')
    expect(()=>parseB1TrialInput(author.fields[2]!,'yes')).toThrow('B1_TRIAL_BOOLEAN_INVALID')
    expect(()=>parseB1TrialInput(author.fields[0]!,'NaN')).toThrow('B1_TRIAL_NUMBER_INVALID')
    expect(()=>parseB1TrialInput({ ...author.fields[0]!, type:'date'},'2026-02-30'))
      .toThrow('B1_TRIAL_DATE_INVALID')
    const invalid=prepareB1TechnicalTrial(author,{'target-a':{approvedCount:'not-a-number'}})
    expect(()=>compileReviewB1Plan(invalid)).toThrow('B1_TARGET_INVALID')
  })
  test('export never includes sample values, formal status, student name or fake authorization',()=>{
    const original=blankUnknownBusiness()
    const trial=prepareB1TechnicalTrial(original,{'target-a':{approvedCount:42,consent:true}})
    expect(trial.targets[0]?.fieldValues.consent).toBe(true)
    const exportText=exportB1AuthorCandidate(original)
    const envelope=JSON.parse(exportText)
    expect(envelope.publicationAllowed).toBe(false)
    expect(envelope.trustTier).toBe('unverified-user-authoring')
    expect(envelope.candidate.targets[0].fieldValues).toEqual({})
    expect(envelope.candidate.status).toBe('candidate-held')
    expect(()=>exportB1AuthorCandidate({...original,status:'published' as 'candidate-held'}))
      .toThrow('B1_EXPORT_NOT_CANDIDATE')
  })
})
