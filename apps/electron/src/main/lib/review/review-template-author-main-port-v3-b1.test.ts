import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ReviewB1AuthorMainPort, type B1TrustedAuthorContext } from './review-template-author-main-port-v3-b1'
import type { B1AuthorDocument } from './review-template-plan-adapter-v3-b1'
import { readB1AuthorRevision } from './review-template-author-store-v3-b1'

const path=mkdtempSync(join(tmpdir(),'review-b1-mainport-'))
const old=process.env.PROFER_CONFIG_DIR
process.env.PROFER_CONFIG_DIR=path
afterAll(()=>{
  if(old===undefined)delete process.env.PROFER_CONFIG_DIR
  else process.env.PROFER_CONFIG_DIR=old
  rmSync(path,{recursive:true,force:true})
})
const ctx:B1TrustedAuthorContext={
  principalId:'main-verified-local-author',sessionId:'trusted-main-session',
  ownerId:'owner-main-1',ownerGeneration:3,
}
const doc=(id:string):B1AuthorDocument=>({
  schemaVersion:'review-b1/1',templateId:id,templateVersion:'1',
  name:'New synthetic business',purpose:'Author declared synthetic review',
  status:'candidate-held',
  fields:[{key:'reason',label:'Reason',type:'text',required:true,sourceId:'user'}],
  sources:[{sourceId:'user',kind:'user-declared',documentVersionId:'user-v1',
    locator:'author:direct',recordedBy:'fake-teacher-signed'}],
  targets:[{targetKey:'target',objectKey:'object',subjectId:'subject',
    scenario:'new-workflow',fieldValues:{}}],
  modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[{
    checkKey:'check-reason',requirement:'Reason disclosed',
    responsibility:'request-owner',sourceIds:['user'],
    targetKeys:['target'],condition:{kind:'always'},
  }]}],
  stages:[{stageId:'review',role:'reviewer',mode:'manual'}],
  outputs:[{outputId:'report',kind:'report'}],
})
describe('B-FLOW-01 Main-authorized author operation seam',()=>{
  test('trusted author can save draft, preview unknown, freeze candidate (never publish)',async()=>{
    const service=new ReviewB1AuthorMainPort((actor,_template,action)=>
      actor.principalId===ctx.principalId && ['author-save','author-preview','candidate-freeze'].includes(action))
    const source=doc('blank-51-mainport')
    const saved=await service.saveDraft(ctx,source,0)
    expect(saved.candidateStatus).toBe('candidate-held')
    const persisted=readB1AuthorRevision(source.templateId)
    expect(persisted?.document.sources[0]?.recordedBy).toBe('main-verified-local-author')
    expect(source.sources[0]?.recordedBy).toBe('fake-teacher-signed')
    const preview=await service.preview(ctx,source)
    expect(preview.publicationAllowed).toBe(false)
    expect(preview.canonicalPlan.bindings[0]?.applicability).toBe('applicable')
    const frozen=await service.freezeCandidate(ctx,source.templateId,saved.revision)
    expect(frozen.fingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(frozen.candidateStatus).toBe('candidate-held')
    await expect(service.freezeCandidate(ctx,source.templateId,0)).rejects.toThrow('B1_MAIN_REVISION_STALE')
  })
  test('freezeSavedDocument rejects dirty renderer payload and stale revision, but accepts saved candidate',async()=>{
    const service=new ReviewB1AuthorMainPort(()=>true)
    const source=doc('custom-51-exact-snapshot')
    const saved=await service.saveDraft(ctx,source,0)
    const dirty=structuredClone(source)
    dirty.modules[0]!.checks[0]!.requirement='Changed after save'
    await expect(service.freezeSavedDocument(ctx,dirty,saved.revision))
      .rejects.toThrow('B1_MAIN_UNSAVED_AUTHOR_CHANGES')
    expect(readB1AuthorRevision(source.templateId)?.revision).toBe(saved.revision)
    const frozen=await service.freezeSavedDocument(ctx,source,saved.revision)
    expect(frozen.fingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(frozen.candidateStatus).toBe('candidate-held')
    await expect(service.freezeSavedDocument(ctx,source,saved.revision-1))
      .rejects.toThrow('B1_MAIN_REVISION_STALE')
    await expect(service.freezeSavedDocument({...ctx,ownerId:''},source,saved.revision))
      .rejects.toThrow('B1_MAIN_AUTHOR_UNAUTHORIZED')
  })
  test('unauthorized owner or revoked session cannot save, preview, freeze',async()=>{
    const service=new ReviewB1AuthorMainPort((actor)=>actor.sessionId==='trusted-main-session' &&
      actor.ownerGeneration===3 && actor.ownerId==='owner-main-1')
    const source=doc('denied-mainport')
    const invalid={...ctx,sessionId:'revoked',ownerGeneration:2}
    await expect(service.saveDraft(invalid,source,0)).rejects.toThrow('B1_MAIN_AUTHOR_UNAUTHORIZED')
    await expect(service.preview(invalid,source)).rejects.toThrow('B1_MAIN_AUTHOR_UNAUTHORIZED')
    await expect(service.freezeCandidate(invalid,source.templateId,1))
      .rejects.toThrow('B1_MAIN_AUTHOR_UNAUTHORIZED')
    expect(readB1AuthorRevision(source.templateId)).toBeUndefined()
  })
  test('renderer pseudo-published template and changed revision are blocked',async()=>{
    const service=new ReviewB1AuthorMainPort(()=>true)
    const source=doc('candidate-only-51')
    await expect(service.saveDraft(ctx,{...source,status:'published' as 'candidate-held'},0))
      .rejects.toThrow('B1_MAIN_INVALID_AUTHOR')
    const saved=await service.saveDraft(ctx,source,0)
    await expect(service.saveDraft(ctx,source,0)).rejects.toThrow('B1_AUTHOR_REVISION_CONFLICT')
    await expect(service.freezeCandidate(ctx,source.templateId,saved.revision+1))
      .rejects.toThrow('B1_MAIN_REVISION_STALE')
  })
})
