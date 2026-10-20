import { describe, expect, test } from 'bun:test'
import {
  compileReviewB1Plan, diffReviewB1Plans, requireReviewB1UpgradeAck,
  type B1AuthorDocument,
} from '../../../main/lib/review/review-template-plan-adapter-v3-b1'
import {
  b1AuthorHasUnsavedEdits, deleteB1AuthorIdentity, nextB1AuthorId, renameB1AuthorIdentity, renameB1TrialKey,
} from './review-v3-author-edit'
import {
  exportB1AuthorCandidate, prepareB1TechnicalTrial,
} from './review-v3-author-trial'

/** 51st business is entirely user-declared synthetic input, NOT a school rule. */
function author51():B1AuthorDocument {
  return {
    schemaVersion:'review-b1/1',status:'candidate-held',
    templateId:'custom-community-project-51',templateVersion:'1.0',
    name:'Community project proof review (user-declared 51)',
    purpose:'Collect declared project, consent, student and evidence for technical preview only',
    sources:[
      {sourceId:'declared',kind:'user-declared',documentVersionId:'author-v1',
        locator:'author:direct-entry',recordedBy:'unverified-local-author'},
      {sourceId:'evidence-hint',kind:'policy-candidate',documentVersionId:'unknown-source',
        locator:'unverified:do-not-publish',recordedBy:'unverified-local-author'},
    ],
    fields:[
      {key:'consent',label:'Consent',sourceId:'declared',required:true,type:'boolean'},
      {key:'award',label:'Award',sourceId:'declared',required:true,type:'enum',
        enumValues:['none','school','province']},
      {key:'proof',label:'Proof original',sourceId:'evidence-hint',required:true,type:'evidence'},
    ],
    targets:[
      {targetKey:'person-one',objectKey:'project-1',subjectId:'student-one',
        scenario:'synthetic-51',fieldValues:{}},
      {targetKey:'person-two',objectKey:'project-2',subjectId:'student-two',
        scenario:'synthetic-51',fieldValues:{}},
    ],
    modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[
      {checkKey:'consent-check',requirement:'Consent must be explicitly declared',
        responsibility:'request owner',sourceIds:['declared'],
        targetKeys:['person-one','person-two'],
        condition:{kind:'field-equals',fieldKey:'consent',equals:true}},
      {checkKey:'proof-check',requirement:'Real source proof must be checked manually',
        responsibility:'human reviewer',sourceIds:['evidence-hint'],
        targetKeys:['person-one','person-two'],condition:{kind:'always'}},
    ]}],
    stages:[{stageId:'human-review',role:'reviewer',mode:'manual'}],
    outputs:[{outputId:'record',kind:'report'}],
  }
}

describe('B1 51st author no-code editing integrity',()=>{
  test('renaming IDs cascades across Check, field provenance, target facts and trial',()=>{
    const starting=author51()
    const version=compileReviewB1Plan(starting)
    expect(version.canonicalPlan.bindings).toHaveLength(4)
    expect(version.canonicalPlan.bindings.filter(x=>x.applicability==='unknown')).toHaveLength(2)
    const source=renameB1AuthorIdentity(starting,'source','declared','self-declaration')
    expect(source.fields.filter(x=>x.sourceId==='self-declaration')).toHaveLength(2)
    expect(source.modules[0]!.checks[0]!.sourceIds).toEqual(['self-declaration'])
    const field=renameB1AuthorIdentity(source,'field','consent','signed-consent')
    expect(field.modules[0]!.checks[0]!.condition).toEqual({
      kind:'field-equals',fieldKey:'signed-consent',equals:true,
    })
    const target=renameB1AuthorIdentity(field,'target','person-one','changed-person')
    expect(target.modules[0]!.checks.every(x=>x.targetKeys.includes('changed-person'))).toBe(true)
    const trial=renameB1TrialKey({'person-one':{consent:true}},'field','consent','signed-consent')
    const moved=renameB1TrialKey(trial,'target','person-one','changed-person')
    const simulated=prepareB1TechnicalTrial(target,moved)
    expect(compileReviewB1Plan(simulated).canonicalPlan.bindings
      .find(x=>x.checkKey==='consent-check'&&x.targetKey==='changed-person')?.applicability)
      .toBe('applicable')
    expect(starting).toEqual(author51())
    expect(source.status).toBe('candidate-held')
    expect(compileReviewB1Plan(target).publicationAllowed).toBe(false)
    expect(JSON.parse(exportB1AuthorCandidate(target)).publicationAllowed).toBe(false)
  })
  test('referenced objects, source and conditional fields require explicit unlink',()=>{
    const draft=author51()
    expect(()=>deleteB1AuthorIdentity(draft,'source','declared')).toThrow('B1_AUTHOR_EDIT_REFERENCE_IN_USE')
    expect(()=>deleteB1AuthorIdentity(draft,'field','consent')).toThrow('B1_AUTHOR_EDIT_REFERENCE_IN_USE')
    expect(()=>deleteB1AuthorIdentity(draft,'target','person-one')).toThrow('B1_AUTHOR_EDIT_REFERENCE_IN_USE')
    expect(()=>renameB1AuthorIdentity(draft,'field','consent','award')).toThrow('B1_AUTHOR_EDIT_DUPLICATE_ID')
    expect(()=>renameB1AuthorIdentity(draft,'source','declared','bad space')).toThrow('B1_AUTHOR_EDIT_ID_INVALID')
    expect(draft).toEqual(author51())
  })
  test('unreferenced removal keeps compiler valid and updates fields in all targets',()=>{
    const draft=author51()
    draft.fields.push({key:'extra',label:'optional',type:'text',required:false,sourceId:'declared'})
    draft.targets[0]!.fieldValues.extra='scratch'
    const removed=deleteB1AuthorIdentity(draft,'field','extra')
    expect(removed.fields.some(f=>f.key==='extra')).toBe(false)
    expect('extra' in removed.targets[0]!.fieldValues).toBe(false)
    expect(compileReviewB1Plan(removed).canonicalPlan.bindings).toHaveLength(4)
    expect('extra' in draft.targets[0]!.fieldValues).toBe(true)
  })
  test('generated IDs never collide after removing a middle item or keeping old names',()=>{
    expect(nextB1AuthorId(['field-1','field-3'],'field')).toBe('field-2')
    expect(nextB1AuthorId(['check-1','check-2','check-4'],'check')).toBe('check-3')
    expect(nextB1AuthorId(['target-1','target-2','target-3'],'target')).toBe('target-4')
    expect(()=>nextB1AuthorId(['a'],'bad key')).toThrow('B1_AUTHOR_EDIT_ID_INVALID')
  })
  test('freezing requires exactly the persisted author snapshot; synthetic trial is independent',()=>{
    const first=author51()
    expect(b1AuthorHasUnsavedEdits(first,null)).toBe(true)
    const saved=structuredClone(first)
    expect(b1AuthorHasUnsavedEdits(first,saved)).toBe(false)
    const edited=renameB1AuthorIdentity(first,'field','consent','clear-consent')
    expect(b1AuthorHasUnsavedEdits(edited,saved)).toBe(true)
    expect(b1AuthorHasUnsavedEdits(first,saved)).toBe(false)
    const trial=prepareB1TechnicalTrial(first,{'person-one':{consent:true}})
    expect(compileReviewB1Plan(trial).canonicalPlan.bindings[0]?.applicability).toBe('applicable')
    expect(b1AuthorHasUnsavedEdits(first,saved)).toBe(false)
  })
  test('deleting a check changes only candidate Plan; dropped bindings require acknowledgement',()=>{
    const draft=author51()
    const before=compileReviewB1Plan(draft)
    const updated=structuredClone(draft)
    updated.modules[0]!.checks=updated.modules[0]!.checks.filter(c=>c.checkKey!=='proof-check')
    const after=compileReviewB1Plan(updated)
    expect(diffReviewB1Plans(before,after).requiresAck.sort()).toEqual([
      'proof-check::person-one','proof-check::person-two',
    ])
    expect(()=>requireReviewB1UpgradeAck(before,after,[]))
      .toThrow('B1_DELETED_CHECK_ACK_REQUIRED')
    expect(after.publicationAllowed).toBe(false)
  })
})
