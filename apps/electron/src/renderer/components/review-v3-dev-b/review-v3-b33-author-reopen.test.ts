import {describe,expect,test} from 'bun:test'
import {prepareB33PristineReopenLookup} from './review-v3-b33-author-reopen'
import {emptyB1AuthorDocument} from './ReviewV3AuthorWizard'
import {isB1PristineReopenLookup,assertB1ResumeReadStillCurrent} from './review-v3-author-resume'
describe('B R33 recover 51st author through Main-only B1 revision chain',()=>{
 test('creates a strictly pristine revision-0 author ID shell without any adopted revision',()=>{
  const doc=prepareB33PristineReopenLookup('new_case_51')
  expect(doc.templateId).toBe('new_case_51')
  expect(doc.status).toBe('candidate-held')
  expect(isB1PristineReopenLookup(doc,0,null,emptyB1AuthorDocument())).toBe(true)
  expect(doc.modules.flatMap(x=>x.checks)).toHaveLength(0)
 })
 test('rejects traversal, duplicate separators and malformed author IDs',()=>{
  for(const id of ['','../case','bad/name','bad\\name','a'.repeat(81),' space','bad#id']){
   expect(()=>prepareB33PristineReopenLookup(id)).toThrow('B_R33_AUTHOR_REOPEN_TEMPLATE_ID_INVALID')
  }
 })
 test('unedited ID lookup cannot forge adoption from an unsaved or rewritten historic source',()=>{
  const doc=prepareB33PristineReopenLookup('saved-51')
  const remote={schemaVersion:'review-b1-author-read/1' as const,
    templateId:'saved-51',revision:2,digest:'a'.repeat(64),document:doc,
    candidateStatus:'candidate-held' as const}
  const staged={remote,currentRevision:0,originalEpoch:0,
    comparedWithCurrent:{} as never,publicationAllowed:false as const,mayAutoSave:false as const}
  const altered={...remote,digest:'b'.repeat(64)}
  expect(()=>assertB1ResumeReadStillCurrent(staged,altered,{
   templateId:'saved-51',revision:0,epoch:0,draft:doc,saved:null,
  })).toThrow('B1_RESUME_CHANGED_DURING_CONFIRMATION')
 })
})
