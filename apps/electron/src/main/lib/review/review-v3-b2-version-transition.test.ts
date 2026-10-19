import {describe,expect,test} from 'bun:test'
import {ReviewB2StagingService,type B2MainContext,type B2MaterialCandidate} from './review-intake-adapter-v3-b2'
import {ReviewB2SourceVersionAdapter} from './review-source-version-adapter-v3-b2'
const ctx:B2MainContext={
 senderId:18,frameId:3,ownerId:'author-main',ownerGeneration:6,caseCandidateId:'case-r18',
}
const ingest=(store:ReviewB2StagingService,requestId:string,physicalSourceKey:string,bytes:string)=>
 store.stage(ctx,store.grant(ctx).token,{
   requestId,physicalSourceKey,fileName:'candidate.txt',role:'supporting',subjectId:'person-1',
   bytes:Buffer.from(bytes),
 })
describe('B2 R18 candidate provenance lifecycle conservatively invalidates old parser blocks',()=>{
 test('same live staged candidate returns stable identity without invalidation',async()=>{
  const staging=new ReviewB2StagingService(),parser=new ReviewB2SourceVersionAdapter(staging)
  const a=ingest(staging,'req-same','native-file-a','same byte body')
  const parsed=await parser.parse(ctx,a)
  const result=parser.compareCandidateSourceVersions(ctx,a.candidateId,a.candidateId)
  expect(result.status).toBe('same-active-version')
  expect(result.invalidatedOldBlockIds).toEqual([])
  expect(result.retainedOldBlockIds).toEqual(parsed.blocks.map(x=>x.blockId))
  expect(result.businessWriteAllowed).toBe(false)
  expect(result.schoolPolicyVerified).toBe(false)
 })
 test('new physical original invalidates EVERY old block even when file name is unchanged',async()=>{
  const staging=new ReviewB2StagingService(),parser=new ReviewB2SourceVersionAdapter(staging)
  const a=ingest(staging,'req-old','native-file-a','old first line\nold second line')
  const b=ingest(staging,'req-new','native-file-b','new first line\nnew second line')
  const old=await parser.parse(ctx,a),latest=await parser.parse(ctx,b)
  const result=parser.compareCandidateSourceVersions(ctx,a.candidateId,b.candidateId)
  expect(result.status).toBe('changed-source-version')
  expect(result.invalidatedOldBlockIds).toEqual(old.blocks.map(x=>x.blockId))
  expect(result.retainedOldBlockIds).toEqual([])
  expect(result.currentBlockIds).toEqual(latest.blocks.map(x=>x.blockId))
  expect(result.previousDocumentVersionId).toBe(a.documentVersionId)
  expect(result.currentDocumentVersionId).toBe(b.documentVersionId)
  expect(result.staleOldEvidenceMustNotBeReused).toBe(true)
 })
 test('identical bytes copied to a different native file remain distinct material versions',async()=>{
  const staging=new ReviewB2StagingService(),parser=new ReviewB2SourceVersionAdapter(staging)
  const a=ingest(staging,'req-copy-a','native-file-copy-a','same literal bytes')
  const b=ingest(staging,'req-copy-b','native-file-copy-b','same literal bytes')
  await parser.parse(ctx,a);await parser.parse(ctx,b)
  const result=parser.compareCandidateSourceVersions(ctx,a.candidateId,b.candidateId)
  expect(a.rawSha256).toBe(b.rawSha256)
  expect(a.documentVersionId).not.toBe(b.documentVersionId)
  expect(result.staleOldEvidenceMustNotBeReused).toBe(true)
  expect(result.invalidatedOldBlockIds.length).toBeGreaterThan(0)
 })
 test('unparsed new original, or absent previous registry after restart, never gets phantom equivalence',async()=>{
  const staging=new ReviewB2StagingService(),parser=new ReviewB2SourceVersionAdapter(staging)
  const a=ingest(staging,'req-a','native-file-old','known')
  const b=ingest(staging,'req-b','native-file-new','changed')
  await parser.parse(ctx,a)
  expect(()=>parser.compareCandidateSourceVersions(ctx,a.candidateId,b.candidateId))
    .toThrow('B2_SOURCE_TRANSITION_UNVERIFIED')
  expect(()=>new ReviewB2SourceVersionAdapter(staging)
    .compareCandidateSourceVersions(ctx,a.candidateId,a.candidateId))
    .toThrow('B2_SOURCE_TRANSITION_UNVERIFIED')
 })
 test('tampered currently staged bytes or changed descriptor refuse transition',async()=>{
  const staging=new ReviewB2StagingService(),parser=new ReviewB2SourceVersionAdapter(staging)
  const a=ingest(staging,'req-x','native-file-x','proven')
  await parser.parse(ctx,a)
  const internals=staging as unknown as {materials:Map<string,{material:B2MaterialCandidate;bytes:Buffer}>}
  const entry=internals.materials.get(a.candidateId)!
  entry.bytes[0]=0x5a
  expect(()=>parser.compareCandidateSourceVersions(ctx,a.candidateId,a.candidateId))
    .toThrow('B2_SOURCE_TRANSITION_ORIGINAL_CHANGED')
  entry.bytes=Buffer.from('proven')
  entry.material.documentVersionId='fake'
  expect(()=>parser.compareCandidateSourceVersions(ctx,a.candidateId,a.candidateId))
    .toThrow('B2_SOURCE_TRANSITION_IDENTITY_CHANGED')
 })
 test('revoked owner cannot query historical blocks, even same candidate',async()=>{
  const staging=new ReviewB2StagingService(),parser=new ReviewB2SourceVersionAdapter(staging)
  const a=ingest(staging,'req-auth','native-file-auth','revocable bytes')
  await parser.parse(ctx,a)
  staging.revoke(ctx)
  expect(()=>parser.compareCandidateSourceVersions(ctx,a.candidateId,a.candidateId))
    .toThrow('B2_OWNER_INVALID_OR_REVOKED')
 })
})
