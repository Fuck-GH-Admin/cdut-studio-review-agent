import {describe,expect,test} from 'bun:test'
import { renameB1AuthorCheckKey } from './review-v3-author-edit'
import { diffB1AuthorDocuments, assertB1DraftRemovalAcknowledgments,
  assertB1CheckDeleteDialogCurrent } from './review-v3-author-diff'
import type { B1AuthorDocument } from '../../../main/lib/review/review-template-plan-adapter-v3-b1'

const fixture=():B1AuthorDocument=>({
 schemaVersion:'review-b1/1',status:'candidate-held',templateId:'example-51',templateVersion:'1',
 name:'candidate only',purpose:'Check identity review',
 sources:[{sourceId:'src',kind:'user-declared',documentVersionId:'author-v1',locator:'user-input',recordedBy:'unverified'}],
 fields:[],targets:[{targetKey:'t1',objectKey:'o1',subjectId:'s1',scenario:'draft',fieldValues:{}}],
 modules:[{moduleId:'a',version:'1',dependsOn:[],checks:[
 {checkKey:'check-old',requirement:'old verification',sourceIds:['src'],targetKeys:['t1'],condition:{kind:'always'},responsibility:'human'}]},
 {moduleId:'b',version:'1',dependsOn:['a'],checks:[
 {checkKey:'other-check',requirement:'secondary',sourceIds:['src'],targetKeys:['t1'],condition:{kind:'always'},responsibility:'human'}]}],
 stages:[{stageId:'manual',mode:'manual',role:'human'}],outputs:[{outputId:'report',kind:'report'}],
})
describe('B1 R15 historical Check key rename and explicit owner-only confirmation',()=>{
 test('renaming a Check preserves requirement and exact Check × source × target binding',()=>{
  const original=fixture()
  const next=renameB1AuthorCheckKey(original,'check-old','check-next')
  expect(original.modules[0]!.checks[0]!.checkKey).toBe('check-old')
  expect(next.modules[0]!.checks[0]).toEqual({...original.modules[0]!.checks[0]!,checkKey:'check-next'})
  expect(next.modules[1]!.checks[0]!.checkKey).toBe('other-check')
  expect(diffB1AuthorDocuments(original,next).deletedCheckKeys).toEqual(['check-old'])
  expect(diffB1AuthorDocuments(original,next).addedCheckKeys).toEqual(['check-next'])
  expect(()=>assertB1DraftRemovalAcknowledgments(original,next,[])).toThrow('B1_AUTHOR_DELETE_CHECK_ACK_REQUIRED')
  expect(()=>assertB1DraftRemovalAcknowledgments(original,next,['check-old'])).not.toThrow()
 })
 test('duplicate across modules and illegal key never mutate the original',()=>{
  const before=fixture()
  expect(()=>renameB1AuthorCheckKey(before,'check-old','other-check')).toThrow('B1_AUTHOR_EDIT_DUPLICATE_CHECK_ID')
  expect(()=>renameB1AuthorCheckKey(before,'check-old','中文')).toThrow('B1_AUTHOR_EDIT_ID_INVALID')
  expect(()=>renameB1AuthorCheckKey(before,'no-check','new-check')).toThrow('B1_AUTHOR_EDIT_CHECK_ID_NOT_UNIQUE_OR_MISSING')
  expect(before.modules[0]!.checks[0]!.checkKey).toBe('check-old')
 })
 test('duplicate old source in malformed draft refuses to guess which one to rename',()=>{
  const duplicate=fixture()
  duplicate.modules[1]!.checks[0]!.checkKey='check-old'
  expect(()=>renameB1AuthorCheckKey(duplicate,'check-old','new-check')).toThrow('B1_AUTHOR_EDIT_CHECK_ID_NOT_UNIQUE_OR_MISSING')
 })
 test('new unsaved Check can be renamed without historical removal ACK',()=>{
  const original=fixture(),next=renameB1AuthorCheckKey(original,'check-old','new-id')
  const d=diffB1AuthorDocuments(null,next)
  expect(d.deletedCheckKeys).toEqual([])
  expect(()=>assertB1DraftRemovalAcknowledgments(null,next,[])).not.toThrow()
 })
 test('UI confirmation stale when other edits or async Main operation occur',()=>{
  const current=fixture()
  expect(()=>assertB1CheckDeleteDialogCurrent(current,'check-old',10,11,false)).toThrow('DIALOG_STALE')
  expect(()=>assertB1CheckDeleteDialogCurrent(current,'check-old',10,10,true)).toThrow('DELETE_BUSY')
  expect(()=>assertB1CheckDeleteDialogCurrent(current,'no-check',10,10,false)).toThrow('CHECK_NOT_FOUND')
 })
 test('invalid published status is not accepted as an author candidate',()=>{
  const bad=fixture()
  ;(bad as {status:string}).status='published'
  expect(()=>renameB1AuthorCheckKey(bad,'check-old','new-id')).toThrow('B1_AUTHOR_EDIT_NOT_CANDIDATE')
 })
})
