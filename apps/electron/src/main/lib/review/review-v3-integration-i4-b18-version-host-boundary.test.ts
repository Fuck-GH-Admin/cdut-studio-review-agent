/**
 * Integrator-I I4 B18 joint scope: physical source version transitions remain
 * technical candidate evidence; Dev-C independent Host observer + current
 * trusted Owner (not B parser or provider response) is the only C Read gate.
 * Offline real imported B R18 parser + C R03 trusted registry, NO Electron /
 * external Provider / publisher / durable Case-Plan-Run writer.
 */
import {describe,expect,test} from 'bun:test'
import {REVIEW_C0_SCHEMA_VERSION,type RunEvidenceIdentity} from '@profer/shared'
import {ReviewB2StagingService,type B2MainContext} from './review-intake-adapter-v3-b2'
import {ReviewB2SourceVersionAdapter} from './review-source-version-adapter-v3-b2'
import {C2MainPhysicalHostReceiptRegistry} from './review-v3-main-host-receipt-registry'
import type {C2MainHostWitness,C2MainOwnerWitness} from './review-v3-main-trust-port'

let serial=0
function fixture(){
  const caseId='i4-b18-case-'+(++serial)
  const ctx:B2MainContext={
    senderId:18,frameId:4,ownerId:'owner-'+caseId,ownerGeneration:4,caseCandidateId:caseId,
  }
  const staging=new ReviewB2StagingService()
  const adapter=new ReviewB2SourceVersionAdapter(staging)
  const stage=(requestId:string,key:string,text:string)=>staging.stage(
    ctx,staging.grant(ctx).token,{
      requestId,physicalSourceKey:key,fileName:'evidence.txt',role:'supporting',
      subjectId:'person-1',bytes:Buffer.from(text),
    },
  )
  return {ctx,staging,adapter,stage}
}
function cHostForParsed(source:ReturnType<ReviewB2SourceVersionAdapter['sourceForBlock']>){
  const run:RunEvidenceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,
    caseId:source.caseId,runId:'run-'+source.caseId,
    caseRevision:1,attemptId:'attempt-1',ownerGeneration:4,
    planFingerprint:'a'.repeat(64),templateVersion:'v1',
    inputManifestHash:'b'.repeat(64),
    sourceVersionIds:[source.documentVersionId],checkKeys:['check-1'],
  }
  const receiptId='physical-main-'+source.caseId
  const providerId='provider-sse-'+source.caseId
  const grant='c-independent-owner-grant'
  let active=true
  const observed=new Map<string,C2MainHostWitness>()
  const owner=():C2MainOwnerWitness|undefined=>active?{
    run,permissionGrantId:grant,active:true,
    ownerGeneration:run.ownerGeneration,inputManifestHash:run.inputManifestHash,
  }:undefined
  const registry=new C2MainPhysicalHostReceiptRegistry({
    getObservedPhysicalReceipt:id=>observed.get(id),
    getCurrentOwner:owner,
  })
  const receipt:C2MainHostWitness={
    run,hostReceiptId:receiptId,permissionGrantId:grant,
    verified:{permissionGrantId:grant,kind:'read',source,extent:'block'},
  }
  return {registry,observed,receipt,receiptId,providerId,revoke:()=>{active=false}}
}
describe('I4 B18 candidate version transition versus C independent physical Host',()=>{
  test('I4-B18-01: replaced original invalidates all B old blocks, but only independent C observer creates Read',async()=>{
    const f=fixture()
    const a=f.stage('old-1','native-disk-A','old text line\nold detail line')
    const old=await f.adapter.parse(f.ctx,a)
    expect(old.blocks.length).toBeGreaterThan(0)
    const source=f.adapter.sourceForBlock(f.ctx,a.candidateId,old.parseRevision,old.blocks[0]!.blockId)
    const c=cHostForParsed(source)
    expect(c.registry.getPhysicalHostReceipt(c.providerId)).toBeUndefined()
    expect(()=>c.registry.rememberObservedReceipt(c.providerId)).toThrow('independently observed')
    expect(c.registry.getPhysicalHostReceipt(c.receiptId)).toBeUndefined()
    c.observed.set(c.receiptId,structuredClone(c.receipt))
    c.registry.rememberObservedReceipt(c.receiptId)
    expect(c.registry.getPhysicalHostReceipt(c.receiptId)?.verified.source).toEqual(source)
    const b=f.stage('new-1','native-disk-B','new text line\nnew detail line')
    await f.adapter.parse(f.ctx,b)
    const transition=f.adapter.compareCandidateSourceVersions(f.ctx,a.candidateId,b.candidateId)
    expect(transition.status).toBe('changed-source-version')
    expect(transition.invalidatedOldBlockIds).toEqual(old.blocks.map(x=>x.blockId))
    expect(transition.retainedOldBlockIds).toEqual([])
    expect(transition.staleOldEvidenceMustNotBeReused).toBe(true)
    expect(transition.candidateOnly).toBe(true)
    expect(transition.businessWriteAllowed).toBe(false)
    expect(transition.schoolPolicyVerified).toBe(false)
    // A B-only transition is not the C Main owner/publisher transaction.
    // The privileged Main must separately revoke the old Run before its
    // once-physical Read can be considered unusable.
    c.revoke()
    expect(c.registry.getPhysicalHostReceipt(c.receiptId)).toBeUndefined()
    expect(c.registry.getPhysicalHostReceipt(c.providerId)).toBeUndefined()
  })
  test('I4-B18-02: matching content but different physical file cannot resurrect old C Read',async()=>{
    const f=fixture()
    const a=f.stage('copy-old','physical-file-old','identical byte sequence')
    const b=f.stage('copy-new','physical-file-new','identical byte sequence')
    const p=await f.adapter.parse(f.ctx,a)
    await f.adapter.parse(f.ctx,b)
    expect(a.rawSha256).toBe(b.rawSha256)
    expect(a.documentVersionId).not.toBe(b.documentVersionId)
    const result=f.adapter.compareCandidateSourceVersions(f.ctx,a.candidateId,b.candidateId)
    expect(result.staleOldEvidenceMustNotBeReused).toBe(true)
    expect(result.invalidatedOldBlockIds).toEqual(p.blocks.map(x=>x.blockId))
    const c=cHostForParsed(f.adapter.sourceForBlock(f.ctx,a.candidateId,p.parseRevision,p.blocks[0]!.blockId))
    expect(()=>c.registry.rememberObservedReceipt(c.receiptId)).toThrow('independently observed')
    expect(c.registry.getPhysicalHostReceipt(c.receiptId)).toBeUndefined()
  })
  test('I4-B18-03: revoking B candidate and independent C Owner fails both boundaries closed',async()=>{
    const f=fixture()
    const a=f.stage('revoke-old','physical-A','actual original')
    const p=await f.adapter.parse(f.ctx,a)
    const c=cHostForParsed(f.adapter.sourceForBlock(f.ctx,a.candidateId,p.parseRevision,p.blocks[0]!.blockId))
    c.observed.set(c.receiptId,structuredClone(c.receipt))
    c.registry.rememberObservedReceipt(c.receiptId)
    f.staging.revoke(f.ctx)
    c.revoke()
    expect(()=>f.adapter.compareCandidateSourceVersions(f.ctx,a.candidateId,a.candidateId))
      .toThrow('B2_OWNER_INVALID_OR_REVOKED')
    expect(c.registry.getPhysicalHostReceipt(c.receiptId)).toBeUndefined()
    expect(()=>c.registry.rememberObservedReceipt(c.receiptId)).toThrow('Owner')
  })
  test('I4-B18-04: unchanged B original stays candidate-only and no C Read without physical Host',async()=>{
    const f=fixture()
    const a=f.stage('same-src','physical-A','still one source')
    const p=await f.adapter.parse(f.ctx,a)
    const result=f.adapter.compareCandidateSourceVersions(f.ctx,a.candidateId,a.candidateId)
    expect(result.status).toBe('same-active-version')
    expect(result.retainedOldBlockIds).toEqual(p.blocks.map(x=>x.blockId))
    expect(result.candidateOnly).toBe(true)
    expect(result.businessWriteAllowed).toBe(false)
    expect(result.schoolPolicyVerified).toBe(false)
    const c=cHostForParsed(f.adapter.sourceForBlock(f.ctx,a.candidateId,p.parseRevision,p.blocks[0]!.blockId))
    expect(c.registry.getPhysicalHostReceipt(c.receiptId)).toBeUndefined()
    expect(c.registry.getPhysicalHostReceipt(c.providerId)).toBeUndefined()
  })
})
