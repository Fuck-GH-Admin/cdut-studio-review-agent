import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readB1AuthorRevision, saveB1AuthorRevision, freezeB1Candidate } from '../../../main/lib/review/review-template-author-store-v3-b1'
import type { B1AuthorDocument } from '../../../main/lib/review/review-template-plan-adapter-v3-b1'
import { emptyB1AuthorDocument } from './ReviewV3AuthorWizard'
import { assertB1ResumeReadStillCurrent, isB1PristineReopenLookup } from './review-v3-author-resume'
import { prepareB1CandidateReadPreview, assertB1CandidateReadAdoption, type B1CandidateReadResponse } from './review-v3-author-revision-read'

const dir=mkdtempSync(join(tmpdir(),'review-b1-r22-reopen-'))
const prior=process.env.PROFER_CONFIG_DIR
process.env.PROFER_CONFIG_DIR=dir
afterAll(()=>{
  if(prior===undefined)delete process.env.PROFER_CONFIG_DIR
  else process.env.PROFER_CONFIG_DIR=prior
  rmSync(dir,{recursive:true,force:true})
})
let counter=0
function savedDocument():B1AuthorDocument {
  const doc=emptyB1AuthorDocument()
  doc.templateId='synthetic-r22-'+(++counter)
  doc.name='Saved research business'
  doc.purpose='User-authored candidate for real vault read checks'
  doc.fields=[{key:'proof',label:'Proof',type:'text',required:true,sourceId:'request'}]
  doc.targets=[{targetKey:'subject-1',objectKey:'room-1',subjectId:'student-1',
    scenario:'temporary technical workflow',fieldValues:{}}]
  doc.modules[0]!.checks=[{checkKey:'proof-check',requirement:'Show documented proof',
    sourceIds:['request'],targetKeys:['subject-1'],responsibility:'human author',
    condition:{kind:'always'}}]
  return doc
}
function vaultResponse(templateId:string):B1CandidateReadResponse {
  const record=readB1AuthorRevision(templateId)
  if(!record)throw Error('R22 fixture record missing')
  return {schemaVersion:'review-b1-author-read/1',templateId,revision:record.revision,
    digest:record.digest,document:record.document,candidateStatus:'candidate-held'}
}
function stageResponse(doc:B1AuthorDocument,revision=0,epoch=10,saved:B1AuthorDocument|null=null) {
  const draft=revision===0?emptyB1AuthorDocument():structuredClone(doc)
  draft.templateId=doc.templateId
  const local={templateId:doc.templateId,revision,epoch,draft,saved}
  const staged=prepareB1CandidateReadPreview(vaultResponse(doc.templateId),local)
  return {local,staged}
}
const adoption=(revision:number,epoch:number,dirty:boolean,backupEpoch:number|null=null)=>({
  templateId:'synthetic-ignored',revision,epoch,busy:false,
  hasUnsavedEdits:dirty,backupEpoch,
})
describe('Dev-B R22 real persisted B1 author reopen, optimistic revision conflict and Main-read TOCTOU protection',()=>{
  test('R22-01 from a fresh blank lookup: actual save chain, frozen candidate, explicit reread and candidate-only reopen',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const frozen=freezeB1Candidate(doc.templateId,1)
    expect(frozen.status).toBe('candidate-held')
    expect(frozen.descriptor.publicationAllowed).toBe(false)
    const {local,staged}=stageResponse(doc)
    expect(isB1PristineReopenLookup(local.draft,0,null,emptyB1AuthorDocument())).toBe(true)
    const latest=assertB1ResumeReadStillCurrent(staged,vaultResponse(doc.templateId),local)
    expect(latest.document).toEqual(doc)
    expect(latest.revision).toBe(1)
    expect(latest.digest).toBe(readB1AuthorRevision(doc.templateId)!.digest)
    expect(()=>assertB1CandidateReadAdoption(staged,{
      ...adoption(0,10,false),templateId:doc.templateId,
    })).not.toThrow()
    expect(readB1AuthorRevision(doc.templateId)!.revision).toBe(1)
  })
  test('R22-02 a second real save after diff but before confirm makes staged Main response stale',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const {local,staged}=stageResponse(doc)
    const edited=structuredClone(doc)
    edited.modules[0]!.checks[0]!.requirement='An independent concurrent edit'
    saveB1AuthorRevision(edited,1,'main-author')
    expect(()=>assertB1ResumeReadStillCurrent(staged,vaultResponse(doc.templateId),local))
      .toThrow('B1_RESUME_CHANGED_DURING_CONFIRMATION')
    expect(readB1AuthorRevision(doc.templateId)!.document.modules[0]!.checks[0]!.requirement)
      .toBe('An independent concurrent edit')
    expect(local.draft.modules[0]!.checks).toEqual([])
  })
  test('R22-03 same revision and digest but changed document in second transport read is also rejected',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const {local,staged}=stageResponse(doc)
    const spoof=vaultResponse(doc.templateId)
    spoof.document=structuredClone(spoof.document)
    spoof.document.name='Forged body under copied digest'
    expect(()=>assertB1ResumeReadStillCurrent(staged,spoof,local))
      .toThrow('B1_RESUME_CHANGED_DURING_CONFIRMATION')
  })
  test('R22-04 recheck rejects altered template, published status, malformed digest and reverted current revision',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const {local,staged}=stageResponse(doc)
    for(const spoof of [
      {...vaultResponse(doc.templateId),templateId:'foreign-template'},
      {...vaultResponse(doc.templateId),candidateStatus:'published'},
      {...vaultResponse(doc.templateId),digest:'corrupt'},
      {...vaultResponse(doc.templateId),revision:0},
    ]) expect(()=>assertB1ResumeReadStillCurrent(staged,spoof,local)).toThrow()
  })
  test('R22-05 local typing during pending Main read or changing CAS baseline invalidates queued reopen',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const {local,staged}=stageResponse(doc)
    expect(()=>assertB1ResumeReadStillCurrent(staged,vaultResponse(doc.templateId),{
      ...local,epoch:11,
    })).toThrow('B1_RESUME_STAGED_CONTEXT_CHANGED')
    expect(()=>assertB1ResumeReadStillCurrent(staged,vaultResponse(doc.templateId),{
      ...local,revision:1,
    })).toThrow('B1_RESUME_STAGED_CONTEXT_CHANGED')
    expect(()=>assertB1ResumeReadStillCurrent(staged,vaultResponse(doc.templateId),{
      ...local,templateId:'another-template',
    })).toThrow('B1_RESUME_STAGED_CONTEXT_CHANGED')
  })
  test('R22-06 only a genuinely blank new-session template-ID lookup may bypass meaningless backup',()=>{
    const doc=savedDocument()
    const blank=emptyB1AuthorDocument(),draft=emptyB1AuthorDocument()
    draft.templateId=doc.templateId
    expect(isB1PristineReopenLookup(draft,0,null,blank)).toBe(true)
    expect(isB1PristineReopenLookup({...draft,name:'Unsaved work'},0,null,blank)).toBe(false)
    expect(isB1PristineReopenLookup({...draft,purpose:'I have made edits'},0,null,blank)).toBe(false)
    expect(isB1PristineReopenLookup({...draft,sources:[...doc.sources,{sourceId:'extra',kind:'user-declared',documentVersionId:'new-user-v1',locator:'unsaved',recordedBy:'local-author-unverified'}]},0,null,blank)).toBe(false)
    expect(isB1PristineReopenLookup({...draft,templateId:''},0,null,blank)).toBe(false)
    expect(isB1PristineReopenLookup({...draft,templateId:'bad id'},0,null,blank)).toBe(false)
    expect(isB1PristineReopenLookup(draft,1,null,blank)).toBe(false)
    expect(isB1PristineReopenLookup(draft,0,draft,blank)).toBe(false)
  })
  test('R22-07 dirty conflicting local author never discards edits without explicit checked backup',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const dirty=structuredClone(doc)
    dirty.name='Important unsaved customizations'
    const {local,staged}=stageResponse(doc)
    local.draft=dirty
    expect(isB1PristineReopenLookup(local.draft,local.revision,local.saved,emptyB1AuthorDocument()))
      .toBe(false)
    expect(()=>assertB1CandidateReadAdoption(staged,{
      templateId:doc.templateId,revision:0,epoch:10,busy:false,backupEpoch:null,hasUnsavedEdits:true,
    })).toThrow('B1_AUTHOR_READ_BACKUP_REQUIRED')
    expect(()=>assertB1CandidateReadAdoption(staged,{
      templateId:doc.templateId,revision:0,epoch:10,busy:false,backupEpoch:10,hasUnsavedEdits:true,
    })).not.toThrow()
    expect(dirty.name).toBe('Important unsaved customizations')
  })
  test('R22-08 real append-only conflict refuses replay of old save; history and candidate unchanged',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const next=structuredClone(doc)
    next.purpose='Persisted other editor revision'
    saveB1AuthorRevision(next,1,'main-author')
    expect(()=>saveB1AuthorRevision(doc,1,'stale-author')).toThrow('B1_AUTHOR_REVISION_CONFLICT')
    expect(readB1AuthorRevision(doc.templateId)!.document.purpose).toBe(next.purpose)
    const frozen=freezeB1Candidate(doc.templateId,2)
    expect(frozen.revision).toBe(2)
    expect(()=>freezeB1Candidate(doc.templateId,1)).toThrow('B1_AUTHOR_REVISION_STALE')
    const {local,staged}=stageResponse(doc,1,10,doc)
    expect(staged.remote.revision).toBe(2)
    expect(assertB1ResumeReadStillCurrent(staged,vaultResponse(doc.templateId),local).revision).toBe(2)
  })
  test('R22-09 previously shown revision cannot be adopted as if it were newer',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const {local,staged}=stageResponse(doc)
    expect(()=>assertB1ResumeReadStillCurrent(staged,{
      ...vaultResponse(doc.templateId),revision:0,
    },local)).toThrow()
    const sameLocal={...local,revision:1,saved:doc,draft:doc}
    const current=prepareB1CandidateReadPreview(vaultResponse(doc.templateId),sameLocal)
    expect(()=>assertB1ResumeReadStillCurrent(current,vaultResponse(doc.templateId),sameLocal))
      .toThrow('B1_RESUME_NOT_NEWER')
  })
  test('R22-10 successful read response is deeply detached; transport mutations cannot change staged comparison',()=>{
    const doc=savedDocument()
    saveB1AuthorRevision(doc,0,'main-author')
    const response=vaultResponse(doc.templateId)
    const {local}=stageResponse(doc)
    const staged=prepareB1CandidateReadPreview(response,local)
    response.document.name='Mutation after preview'
    expect(assertB1ResumeReadStillCurrent(staged,vaultResponse(doc.templateId),local).document.name)
      .toBe('Saved research business')
    expect(staged.publicationAllowed).toBe(false)
    expect(staged.mayAutoSave).toBe(false)
  })
})
