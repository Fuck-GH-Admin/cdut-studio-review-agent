import {describe,expect,test} from 'bun:test'
import {createHash} from 'node:crypto'
import {ReviewB2StagingService,type B2MainContext} from './review-intake-adapter-v3-b2'
import {ReviewB2SourceVersionAdapter} from './review-source-version-adapter-v3-b2'
const ctx:B2MainContext={
  senderId:22,frameId:5,ownerId:'host-authenticated',
  ownerGeneration:7,caseCandidateId:'candidate-case',
}
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==','base64')
const stage=(store:ReviewB2StagingService,name:string,data:Uint8Array,requestId:string)=>
  store.stage(ctx,store.grant(ctx).token,{requestId,fileName:name,
    physicalSourceKey:'main-picker:'+requestId,bytes:data,role:'supporting',subjectId:'person-1'})
describe('B2 R16 registered physical SourceIdentity narrow read extent',()=>{
 test('TXT parser source yields ONLY an exact single block; never document-wide completion',async()=>{
  const store=new ReviewB2StagingService(),svc=new ReviewB2SourceVersionAdapter(store)
  const staged=stage(store,'note.txt',Buffer.from('Hello source\nSecond line'), 't1')
  const parsed=await svc.parse(ctx,staged)
  const block=parsed.blocks[0]!
  const evidence=svc.candidateReadExtent(ctx,staged.candidateId,parsed.parseRevision,
    block.blockId,'single-parser-block')
  expect(evidence.readScope).toBe('single-parser-block')
  expect(evidence.blockPrecision).toBe('paragraph')
  expect(evidence.textSha256).toBe(createHash('sha256').update(block.text).digest('hex'))
  expect(evidence.source.rawSha256).toBe(staged.rawSha256)
  expect(evidence.fullDocumentProven).toBe(false)
  expect(evidence.authorizationGranted).toBe(false)
  expect(evidence.candidateOnly).toBe(true)
  expect(()=>svc.candidateReadExtent(ctx,staged.candidateId,parsed.parseRevision,
    'forged-block','single-parser-block')).toThrow('B2_SOURCE_BLOCK_UNVERIFIED')
  expect(()=>svc.candidateReadExtent(ctx,staged.candidateId,'old-parser-revision',
    block.blockId,'single-parser-block')).toThrow('B2_SOURCE_STALE')
 })
 test('image must not be called exact read, but can identify file metadata',async()=>{
  const store=new ReviewB2StagingService(),svc=new ReviewB2SourceVersionAdapter(store)
  const staged=stage(store,'image.png',PNG,'img')
  const parsed=await svc.parse(ctx,staged)
  expect(parsed.status).toBe('partial')
  const id=parsed.blocks[0]!.blockId
  expect(()=>svc.candidateReadExtent(ctx,staged.candidateId,parsed.parseRevision,
    id,'single-parser-block')).toThrow('B2_SOURCE_READ_EXTENT_NOT_PROVEN')
  const evidence=svc.candidateReadExtent(ctx,staged.candidateId,parsed.parseRevision,
    id,'file-metadata')
  expect(evidence.blockPrecision).toBe('file')
  expect(evidence.textSha256).toBeNull()
  expect(evidence.fullDocumentProven).toBe(false)
 })
 test('revoke before evidence request refuses old registry even when parse succeeded',async()=>{
  const store=new ReviewB2StagingService(),svc=new ReviewB2SourceVersionAdapter(store)
  const staged=stage(store,'request.txt',Buffer.from('Content'),'t2')
  const parsed=await svc.parse(ctx,staged)
  store.revoke(ctx)
  expect(()=>svc.candidateReadExtent(ctx,staged.candidateId,parsed.parseRevision,
    parsed.blocks[0]!.blockId,'single-parser-block')).toThrow('B2_OWNER_INVALID_OR_REVOKED')
 })
})
