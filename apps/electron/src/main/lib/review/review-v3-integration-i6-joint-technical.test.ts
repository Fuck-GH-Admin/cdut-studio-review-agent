/**
 * I6 isolated joint real-source negative regressions, against ONLY already
 * C-approved I5 code. NOT the C R09 durable fence, a live Main IPC handler,
 * a School publisher, or a C Case/ReviewRun business writer.
 */
import { describe, expect, test } from 'bun:test'
import { REVIEW_C0_SCHEMA_VERSION, type RunEvidenceIdentity } from '@profer/shared'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'
import { C2MainPhysicalHostReceiptRegistry } from './review-v3-main-host-receipt-registry'
import type { C2MainHostWitness, C2MainOwnerWitness } from './review-v3-main-trust-port'
import {
  CMainB20TrustedCandidateRead, type CMainB20ReadIdentity,
} from './review-v3-main-b20-trusted-candidate-read'
import type { B20MainReadScope } from './review-v3-b1-b2-main-read-bundle-v3-b'

let serial=0
function realB2() {
  const caseId='i6jointcase'+(++serial)
  const scope:B2MainContext={
    senderId:19,frameId:7,ownerId:'i6-owner-'+caseId,
    ownerGeneration:4,caseCandidateId:caseId,
  }
  const staging=new ReviewB2StagingService()
  const parser=new ReviewB2SourceVersionAdapter(staging)
  const stage=(key:string,body:string)=>staging.stage(scope,staging.grant(scope).token,{
    requestId:'i6-physical-'+(++serial),physicalSourceKey:key,
    fileName:'real.txt',role:'supporting',subjectId:'student-i6',
    bytes:Buffer.from(body),
  })
  return {scope,staging,parser,stage}
}
function hostReceipt(
  source:ReturnType<ReviewB2SourceVersionAdapter['sourceForBlock']>,
) {
  const run:RunEvidenceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,
    caseId:source.caseId,runId:'i6-run-'+source.caseId,
    caseRevision:1,attemptId:'i6-attempt',ownerGeneration:4,
    planFingerprint:'a'.repeat(64),templateVersion:'i6-candidate-only',
    inputManifestHash:'b'.repeat(64),
    sourceVersionIds:[source.documentVersionId],checkKeys:['check-i6'],
  }
  let active=true
  const observed=new Map<string,C2MainHostWitness>()
  const owner=(id:RunEvidenceIdentity):C2MainOwnerWitness|undefined=>active?{
    run,permissionGrantId:'c-fixture-grant',
    active:true,ownerGeneration:run.ownerGeneration,
    inputManifestHash:run.inputManifestHash,
  }:undefined
  const registry=new C2MainPhysicalHostReceiptRegistry({
    getCurrentOwner:owner,
    getObservedPhysicalReceipt:id=>observed.get(id),
  })
  const witness:C2MainHostWitness={
    run,hostReceiptId:'c-fixture-physical-'+source.documentVersionId,
    permissionGrantId:'c-fixture-grant',
    verified:{permissionGrantId:'c-fixture-grant',kind:'read',source,extent:'block'},
  }
  return {registry,run,observed,witness,revoke:()=>{active=false}}
}
describe('I6 approved-source B2 × C physical Host × C B20 isolation',()=>{
  test('I6-JOINT-01 physical original substitution invalidates old source blocks; C Host needs separate current Owner revoke',async()=>{
    const f=realB2()
    const first=f.stage('native-original-A','identical source bytes')
    const second=f.stage('native-original-B','identical source bytes')
    const original=await f.parser.parse(f.scope,first)
    await f.parser.parse(f.scope,second)
    expect(first.rawSha256).toBe(second.rawSha256)
    expect(first.documentVersionId).not.toBe(second.documentVersionId)
    const transition=f.parser.compareCandidateSourceVersions(f.scope,first.candidateId,second.candidateId)
    expect(transition.status).toBe('changed-source-version')
    expect(transition.invalidatedOldBlockIds).toEqual(original.blocks.map(x=>x.blockId))
    expect(transition.staleOldEvidenceMustNotBeReused).toBe(true)
    expect(transition.schoolPolicyVerified).toBe(false)
    const source=f.parser.sourceForBlock(f.scope,first.candidateId,original.parseRevision,original.blocks[0]!.blockId)
    const c=hostReceipt(source)
    c.observed.set(c.witness.hostReceiptId,structuredClone(c.witness))
    c.registry.rememberObservedReceipt(c.witness.hostReceiptId)
    expect(c.registry.getPhysicalHostReceipt(c.witness.hostReceiptId)).toBeDefined()
    // B invalidation by itself does not mutate C Case or C Host; real C Main
    // must independently fence the old Run. No fake auto-revoke in this test.
    c.revoke()
    expect(c.registry.getPhysicalHostReceipt(c.witness.hostReceiptId)).toBeUndefined()
  })
  test('I6-JOINT-02 SDK x-request-id and unsigned B technical candidate cannot mint Host Read',async()=>{
    const f=realB2()
    const file=f.stage('main-original','A physical text with source details')
    const parsed=await f.parser.parse(f.scope,file)
    const c=hostReceipt(f.parser.sourceForBlock(f.scope,file.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId))
    const forged='sdk-response-completed-'+file.candidateId
    expect(c.registry.getPhysicalHostReceipt(forged)).toBeUndefined()
    expect(()=>c.registry.rememberObservedReceipt(forged)).toThrow('independently observed')
    expect(c.registry.getPhysicalHostReceipt(c.witness.hostReceiptId)).toBeUndefined()
  })
  test('I6-JOINT-03 after Owner revoke, previously independent physical Read can never be used',async()=>{
    const f=realB2()
    const file=f.stage('main-original','Real source')
    const p=await f.parser.parse(f.scope,file)
    const c=hostReceipt(f.parser.sourceForBlock(f.scope,file.candidateId,p.parseRevision,p.blocks[0]!.blockId))
    c.observed.set(c.witness.hostReceiptId,structuredClone(c.witness))
    c.registry.rememberObservedReceipt(c.witness.hostReceiptId)
    c.revoke()
    expect(c.registry.getPhysicalHostReceipt(c.witness.hostReceiptId)).toBeUndefined()
    expect(()=>c.registry.rememberObservedReceipt(c.witness.hostReceiptId)).toThrow('Owner')
  })
  test('I6-JOINT-04 cross-original SourceIdentity cannot use an unrelated frozen Run manifest',async()=>{
    const f=realB2()
    const first=f.stage('first-original','Source one')
    const second=f.stage('second-original','Source two')
    await f.parser.parse(f.scope,first)
    const p2=await f.parser.parse(f.scope,second)
    const source2=f.parser.sourceForBlock(f.scope,second.candidateId,p2.parseRevision,p2.blocks[0]!.blockId)
    const c=hostReceipt(source2)
    const forged:C2MainHostWitness={...c.witness,
      run:{...c.run,sourceVersionIds:[first.documentVersionId]},
    }
    c.observed.set(forged.hostReceiptId,forged)
    expect(()=>c.registry.rememberObservedReceipt(forged.hostReceiptId))
      .toThrow('not in this Run original manifest')
  })
  test('I6-JOINT-05 B numeric sender/frame/epoch are NOT C string Main identity credentials',()=>{
    const b:B20MainReadScope={
      senderId:19,frameId:7,authorityEpoch:8,
      ownerId:'owner-1',ownerGeneration:4,caseCandidateId:'case-1',
      principalId:'fixture-principal',sessionId:'fixture-session',
    }
    const c:CMainB20ReadIdentity={
      windowId:'window-19',frameId:'process-17:route-7',
      authorityEpoch:'main-grant-v8',principalId:b.principalId,
      sessionId:b.sessionId,ownerId:b.ownerId,
      ownerGeneration:b.ownerGeneration,caseCandidateId:b.caseCandidateId,
    }
    expect(typeof b.senderId).toBe('number')
    expect(typeof b.frameId).toBe('number')
    expect(typeof b.authorityEpoch).toBe('number')
    expect(typeof c.frameId).toBe('string')
    expect(typeof c.authorityEpoch).toBe('string')
    expect(c.frameId).not.toBe(String(b.frameId))
    // No code in I may claim these fixtures are a real Main binding.
  })
  test('I6-JOINT-06 candidate display-only B20 gate cannot issue School/Run/Batch authority',async()=>{
    const identity:CMainB20ReadIdentity={
      principalId:'fixture-principal',sessionId:'fixture-session',
      ownerId:'owner-1',ownerGeneration:4,windowId:'fixture-window',
      frameId:'fixture-frame',authorityEpoch:'fixture-epoch',caseCandidateId:'candidate-i6',
    }
    const template='I6Candidate'
    const fingerprint='b'.repeat(64)
    const pinned={templateId:template,revision:1,revisionDigest:'a'.repeat(64),frozenFingerprint:fingerprint}
    const payload={
      schemaVersion:'review-v3-b20-main-read-bundle/1' as const,
      candidateOnly:true as const,publicationAllowed:false as const,
      businessWriteAllowed:false as const,schoolPolicyVerified:false as const,
      authorityInstalledByB:false as const,
      caseCandidateId:identity.caseCandidateId,
      ownerId:identity.ownerId,ownerGeneration:identity.ownerGeneration,
      templateId:template,authorRevision:1,
      authorRevisionDigest:pinned.revisionDigest,
      frozenFingerprint:fingerprint,authorStatus:'candidate-held' as const,
      frozenDescriptor:{canonicalPlan:{fingerprint}},
      candidateProvenance:{
        schemaVersion:'review-v3-b1-b2-candidate-source/1',
        candidateOnly:true,publicationAllowed:false,
        businessWriteAllowed:false,schoolPolicyVerified:false,
        caseCandidateId:identity.caseCandidateId,
        ownerId:identity.ownerId,ownerGeneration:identity.ownerGeneration,
        planFingerprint:fingerprint,
        bindings:[{checkKey:'check-i6',state:'unknown',sources:[]}],
        invalidatedPriorEvidence:[],snapshotHash:'c'.repeat(64),
      },
    }
    const gate=new CMainB20TrustedCandidateRead({
      currentIdentity:()=>structuredClone(identity),
      currentInstallationToken:()=> 'fixture-install-not-real-main',
      canRead:(_,id)=>id===template,
      getPinnedExpectation:()=>structuredClone(pinned),
      readCurrentBundle:()=>structuredClone(payload),
    })
    const preview=await gate.read(template)
    expect(preview).toMatchObject({
      candidateOnly:true,displayOnly:true,publicationAllowed:false,
      businessWriteAllowed:false,schoolPolicyVerified:false,state:'candidate-held',
    })
    expect(preview).not.toHaveProperty('runAck')
    expect(preview).not.toHaveProperty('batchDecision')
    expect(preview).not.toHaveProperty('schoolIssuer')
    expect(preview).not.toHaveProperty('physicalArchiveKey')
  })
})
