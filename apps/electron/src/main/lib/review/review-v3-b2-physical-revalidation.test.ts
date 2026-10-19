import {describe,expect,test} from 'bun:test'
import {ReviewB2StagingService,type B2MainContext,type B2MaterialCandidate} from './review-intake-adapter-v3-b2'
import {ReviewB2SourceVersionAdapter} from './review-source-version-adapter-v3-b2'
const ctx:B2MainContext={senderId:47,frameId:12,ownerId:'verified-b2-user',ownerGeneration:2,caseCandidateId:'case-b2-r17'}
const ingest=(staging:ReviewB2StagingService,text:string,id:string)=>
  staging.stage(ctx,staging.grant(ctx).token,{fileName:'notes.txt',
  requestId:id,physicalSourceKey:'trusted-picker-'+id,bytes:Buffer.from(text),
  role:'supporting',subjectId:'subject-a'})
const injected=(staging:ReviewB2StagingService,candidateId:string)=>{
  const internal=staging as unknown as {materials:Map<string,{material:B2MaterialCandidate;bytes:Buffer}>}
  const state=internal.materials.get(candidateId)
  if(!state)throw Error('test staged material missing')
  return state
}
describe('B2 R17 original material revalidated before SourceIdentity evidence mint',()=>{
 test('unchanged live original can mint exact candidate block; returned snapshots are independent',async()=>{
  const staging=new ReviewB2StagingService(),service=new ReviewB2SourceVersionAdapter(staging)
  const record=ingest(staging,'Original actual bytes','req-good')
  const parsed=await service.parse(ctx,record)
  const first=service.sourceForBlock(ctx,record.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId)
  expect(first.rawSha256).toBe(record.rawSha256)
  const proof=service.candidateReadExtent(ctx,record.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId,'single-parser-block')
  expect(proof.source.rawSha256).toBe(record.rawSha256)
  expect(proof.authorizationGranted).toBe(false)
  expect(proof.fullDocumentProven).toBe(false)
  first.rawSha256='f'.repeat(64)
  expect(service.sourceForBlock(ctx,record.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId).rawSha256).toBe(record.rawSha256)
 })
 test('fault injected cached bytes tampering is rejected even when parser block ID matches',async()=>{
  const staging=new ReviewB2StagingService(),service=new ReviewB2SourceVersionAdapter(staging)
  const record=ingest(staging,'Original actual bytes','req-byte-tamper')
  const parsed=await service.parse(ctx,record)
  injected(staging,record.candidateId).bytes[0]=0x7e
  expect(()=>service.sourceForBlock(ctx,record.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId))
    .toThrow('B2_SOURCE_PHYSICAL_BYTES_MISMATCH')
  expect(()=>service.candidateReadExtent(ctx,record.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId,'single-parser-block'))
    .toThrow('B2_SOURCE_PHYSICAL_BYTES_MISMATCH')
 })
 test('fault injected stage version swap cannot replay prior parser registry',async()=>{
  const staging=new ReviewB2StagingService(),service=new ReviewB2SourceVersionAdapter(staging)
  const record=ingest(staging,'Original actual bytes','req-version-tamper')
  const parsed=await service.parse(ctx,record)
  injected(staging,record.candidateId).material.documentVersionId='docv-swapped-v1'
  expect(()=>service.sourceForBlock(ctx,record.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId))
    .toThrow('B2_SOURCE_PHYSICAL_REVISION_MISMATCH')
 })
 test('owner revoked after successful parse cannot make cached source evidence',async()=>{
  const staging=new ReviewB2StagingService(),service=new ReviewB2SourceVersionAdapter(staging)
  const record=ingest(staging,'Valid','req-revoked')
  const parsed=await service.parse(ctx,record)
  staging.revoke(ctx)
  expect(()=>service.sourceForBlock(ctx,record.candidateId,parsed.parseRevision,parsed.blocks[0]!.blockId))
    .toThrow('B2_OWNER_INVALID_OR_REVOKED')
 })
})
