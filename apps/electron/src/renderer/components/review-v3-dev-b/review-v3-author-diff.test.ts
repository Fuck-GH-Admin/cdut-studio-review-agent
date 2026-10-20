import { describe,expect,test } from 'bun:test'
import { diffB1AuthorDocuments,assertB1DraftRemovalAcknowledgments,assertB1CheckDeleteDialogCurrent } from './review-v3-author-diff'
import type { B1AuthorDocument } from '../../../main/lib/review/review-template-plan-adapter-v3-b1'
const fixture=():B1AuthorDocument=>({
 schemaVersion:'review-b1/1',status:'candidate-held',
 templateId:'candidate-51',templateVersion:'1',name:'业务',purpose:'显式人工审查',
 sources:[{sourceId:'user',kind:'user-declared',documentVersionId:'source-v1',locator:'author-input',recordedBy:'unverified'}],
 fields:[{key:'age',label:'年龄',sourceId:'user',required:true,type:'number'}],
 targets:[{targetKey:'t1',objectKey:'o1',subjectId:'s1',scenario:'default',fieldValues:{age:18}}],
 modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[
  {checkKey:'check-1',requirement:'核验',sourceIds:['user'],targetKeys:['t1'],responsibility:'人工负责人',condition:{kind:'field-equals',fieldKey:'age',equals:18}},
  {checkKey:'check-2',requirement:'核验附件',sourceIds:['user'],targetKeys:['t1'],responsibility:'人工负责人',condition:{kind:'always'}},
 ]}],
 stages:[{stageId:'human',role:'reviewer',mode:'manual'}],
 outputs:[{outputId:'summary',kind:'report'}],
})
describe('B1 R14 author draft differencing and delete confirmation',()=>{
 test('unchanged clone is not dirty and field reorder alone is not a Check deletion',()=>{
  expect(diffB1AuthorDocuments(fixture(),structuredClone(fixture())).changed).toBe(false)
 })
 test('field rename, source change, condition change and Check deletion are distinguished',()=>{
  const base=fixture(),next=structuredClone(base)
  next.fields[0]!.label='新年龄';next.sources[0]!.locator='new-locator'
  next.modules[0]!.checks[0]!.condition={kind:'field-equals',fieldKey:'age',equals:21}
  next.modules[0]!.checks.pop()
  const summary=diffB1AuthorDocuments(base,next)
  expect(summary.changes).toContainEqual({area:'source',kind:'modified',key:'user'})
  expect(summary.changes).toContainEqual({area:'field',kind:'modified',key:'age'})
  expect(summary.changedCheckKeys).toEqual(['check-1'])
  expect(summary.deletedCheckKeys).toEqual(['check-2'])
  expect(()=>assertB1DraftRemovalAcknowledgments(base,next,[])).toThrow('B1_AUTHOR_DELETE_CHECK_ACK_REQUIRED')
  expect(()=>assertB1DraftRemovalAcknowledgments(base,next,['check-2'])).not.toThrow()
  expect(base.modules[0]!.checks).toHaveLength(2)
 })
 test('renaming an existing Check cannot avoid removed identity acknowledgment',()=>{
  const prior=fixture(),changed=structuredClone(prior)
  changed.modules[0]!.checks[0]!.checkKey='check-new'
  const d=diffB1AuthorDocuments(prior,changed)
  expect(d.addedCheckKeys).toEqual(['check-new'])
  expect(d.deletedCheckKeys).toEqual(['check-1'])
  expect(()=>assertB1DraftRemovalAcknowledgments(prior,changed,['check-new'])).toThrow('B1_AUTHOR_DELETE_CHECK_ACK_REQUIRED')
 })
 test('new unsaved Check needs user confirmation for deletion UI, but not historical Upgrade ACK',()=>{
  const current=fixture()
  const result=diffB1AuthorDocuments(null,current)
  expect(result.deletedCheckKeys).toEqual([])
  expect(result.addedCheckKeys).toEqual(['check-1','check-2'])
  expect(()=>assertB1DraftRemovalAcknowledgments(null,current,[])).not.toThrow()
  expect(()=>assertB1CheckDeleteDialogCurrent(current,'check-1',8,8,false)).not.toThrow()
 })
 test('stale epoch, missing Check, and outstanding Main operation all reject confirmation',()=>{
  const draft=fixture()
  expect(()=>assertB1CheckDeleteDialogCurrent(draft,'check-2',8,9,false)).toThrow('DIALOG_STALE')
  expect(()=>assertB1CheckDeleteDialogCurrent(draft,'check-3',8,8,false)).toThrow('CHECK_NOT_FOUND')
  expect(()=>assertB1CheckDeleteDialogCurrent(draft,'check-2',8,8,true)).toThrow('DELETE_BUSY')
 })
})
