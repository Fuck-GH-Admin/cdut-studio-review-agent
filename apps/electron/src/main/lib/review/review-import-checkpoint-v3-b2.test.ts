import { afterAll, describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'
import { ReviewB2ArchiveVault } from './review-import-checkpoint-v3-b2'
const home=mkdtempSync(join(tmpdir(),'review-v3-zip-durable-'))
afterAll(()=>rmSync(home,{recursive:true,force:true}))
const crcTable=Array.from({length:256},(_,i)=>{
  let c=i
  for(let n=0;n<8;n++)c=c&1?0xedb88320^(c>>>1):c>>>1
  return c>>>0
})
function crc32(b:Buffer):number{
  let c=0xffffffff
  for(const n of b)c=crcTable[(c^n)&255]!^(c>>>8)
  return(c^0xffffffff)>>>0
}
function makeZip(text:string):Buffer{
  const name=Buffer.from('evidence.txt'),raw=Buffer.from(text),crc=crc32(raw)
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0)
  local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6)
  local.writeUInt32LE(crc,14);local.writeUInt32LE(raw.length,18)
  local.writeUInt32LE(raw.length,22);local.writeUInt16LE(name.length,26)
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0)
  central.writeUInt16LE(0x0314,4);central.writeUInt16LE(20,6)
  central.writeUInt16LE(0x800,8);central.writeUInt32LE(crc,16)
  central.writeUInt32LE(raw.length,20);central.writeUInt32LE(raw.length,24)
  central.writeUInt16LE(name.length,28);central.writeUInt32LE(0x81a40000,38)
  const offset=local.length+name.length+raw.length
  const tail=Buffer.alloc(22);tail.writeUInt32LE(0x06054b50,0)
  tail.writeUInt16LE(1,8);tail.writeUInt16LE(1,10)
  tail.writeUInt32LE(central.length+name.length,12);tail.writeUInt32LE(offset,16)
  return Buffer.concat([local,name,raw,central,name,tail])
}
const ctx:B2MainContext={
  senderId:7,frameId:1,ownerId:'owner-main',ownerGeneration:1,caseCandidateId:'case-test',
}
describe('B2 durable input checkpoint is not a CurrentCase writer',()=>{
  test('fsynced ZIP original survives new adapter instance, remains needs-restaging',()=>{
    const staging=new ReviewB2StagingService()
    const vault=new ReviewB2ArchiveVault(staging,home)
    const archive={physicalArchiveKey:'native-picker-file-1',requestId:'r1',bytes:makeZip('proof bytes')}
    const {checkpoint,preview}=vault.saveAndStage(ctx,archive)
    expect(checkpoint.checkpointState).toBe('bytes-durable-needs-confirmation')
    expect(preview.receipts[0]!.status).toBe('needs-user-confirmation')
    expect(vault.inspect(ctx,checkpoint.archiveId)).toEqual(checkpoint)
    const newlyAuthenticated={...ctx,ownerGeneration:2}
    const nextStaging=new ReviewB2StagingService()
    const reopened=new ReviewB2ArchiveVault(nextStaging,home)
    const restage=reopened.prepareRestage(newlyAuthenticated,checkpoint.archiveId)
    expect(restage.status).toBe('needs-main-revalidation')
    expect('physicalArchiveKey' in restage.restage).toBe(false)
    expect(Buffer.from(restage.restage.bytes).equals(archive.bytes)).toBe(true)
    expect(restage.checkpoint.archiveSha256).toBe(checkpoint.archiveSha256)
    expect(nextStaging.previewImportBatch(newlyAuthenticated,[]).status).toBe('staged')
    const replay=reopened.saveAndStage(newlyAuthenticated,archive)
    expect(replay.preview.candidates).toHaveLength(1)
    expect(replay.preview.candidates[0]!.ownerGeneration).toBe(2)
  })
  test('duplicate request different archive bytes fails and previous checkpoint unchanged',()=>{
    const vault=new ReviewB2ArchiveVault(new ReviewB2StagingService(),home)
    const input={physicalArchiveKey:'native-file-2',requestId:'collision-2',bytes:makeZip('original')}
    const first=vault.saveAndStage(ctx,input).checkpoint
    expect(()=>vault.saveAndStage(ctx,{...input,bytes:makeZip('modified')}))
      .toThrow('B2_ARCHIVE_REQUEST_ID_COLLISION')
    expect(vault.inspect(ctx,first.archiveId).archiveSha256).toBe(first.archiveSha256)
  })
  test('tampered bytes or JSON are detected, no silent reactivation',()=>{
    const vault=new ReviewB2ArchiveVault(new ReviewB2StagingService(),home)
    const input={physicalArchiveKey:'native-file-3',requestId:'tamper-3',bytes:makeZip('original')}
    const checkpoint=vault.saveAndStage(ctx,input).checkpoint
    const stored=join(home,checkpoint.archiveId,'archive.zip')
    writeFileSync(stored,Buffer.from('spoofed-bytes'))
    expect(()=>vault.prepareRestage(ctx,checkpoint.archiveId)).toThrow('B2_ARCHIVE_CHECKPOINT_INTEGRITY')
  })
  test('cross-owner and revoked owner cannot recover archive without trusted Main context',()=>{
    const staging=new ReviewB2StagingService()
    const vault=new ReviewB2ArchiveVault(staging,home)
    const checkpoint=vault.saveAndStage(ctx,{
      physicalArchiveKey:'native-file-4',requestId:'private-4',bytes:makeZip('private'),
    }).checkpoint
    expect(()=>vault.prepareRestage({...ctx,ownerId:'someone-else'},checkpoint.archiveId))
      .toThrow('B2_ARCHIVE_OWNER_SCOPE_MISMATCH')
    staging.revoke(ctx)
    expect(()=>vault.inspect(ctx,checkpoint.archiveId)).toThrow('B2_OWNER_INVALID_OR_REVOKED')
  })
  test('tampered symlink archive refuses access rather than reading external file',()=>{
    const staging=new ReviewB2StagingService()
    const vault=new ReviewB2ArchiveVault(staging,home)
    const checkpoint=vault.saveAndStage(ctx,{
      physicalArchiveKey:'native-file-link',requestId:'linked-5',bytes:makeZip('normal bytes'),
    }).checkpoint
    const stored=join(home,checkpoint.archiveId,'archive.zip')
    rmSync(stored)
    const outside=join(home,'out-of-scope.txt')
    writeFileSync(outside,makeZip('external bytes'))
    symlinkSync(outside,stored)
    expect(()=>vault.inspect(ctx,checkpoint.archiveId)).toThrow('B2_ARCHIVE_RECOVERY_REQUIRED')
  })

  test('forged child digest cannot be repaired by recomputing the unkeyed JSON checksum',()=>{
    const vault=new ReviewB2ArchiveVault(new ReviewB2StagingService(),home)
    const checkpoint=vault.saveAndStage(ctx,{
      physicalArchiveKey:'native-byte-proof',requestId:'byte-proof-7',bytes:makeZip('verified original'),
    }).checkpoint
    const path=join(home,checkpoint.archiveId,'checkpoint.json')
    const tampered=JSON.parse(readFileSync(path,'utf8'))
    tampered.fileReceipts[0].rawSha256='0'.repeat(64)
    const {manifestSha256:_before,...plain}=tampered
    tampered.manifestSha256=createHash('sha256').update(JSON.stringify(plain)).digest('hex')
    writeFileSync(path,JSON.stringify(tampered))
    expect(()=>vault.inspect(ctx,checkpoint.archiveId)).toThrow('B2_ARCHIVE_CHECKPOINT_INTEGRITY')
  })
  test('forged rejected status cannot suppress an originally accepted file',()=>{
    const vault=new ReviewB2ArchiveVault(new ReviewB2StagingService(),home)
    const checkpoint=vault.saveAndStage(ctx,{
      physicalArchiveKey:'native-reject-proof',requestId:'reject-proof-8',bytes:makeZip('unchanged original'),
    }).checkpoint
    const path=join(home,checkpoint.archiveId,'checkpoint.json')
    const tampered=JSON.parse(readFileSync(path,'utf8'))
    tampered.fileReceipts[0].status='rejected'
    tampered.fileReceipts[0].reason='SYMLINK'
    const {manifestSha256:_before,...plain}=tampered
    tampered.manifestSha256=createHash('sha256').update(JSON.stringify(plain)).digest('hex')
    writeFileSync(path,JSON.stringify(tampered))
    expect(()=>vault.inspect(ctx,checkpoint.archiveId)).toThrow('B2_ARCHIVE_CHECKPOINT_INTEGRITY')
  })
  test('stricter originally rejected entry cannot be promoted during restart',()=>{
    const vault=new ReviewB2ArchiveVault(new ReviewB2StagingService(),home)
    const checkpoint=vault.saveAndStage(ctx,{
      physicalArchiveKey:'native-strict-proof',requestId:'strict-proof-9',
      bytes:makeZip('original longer than three bytes'),
    },{maxEntryBytes:3}).checkpoint
    expect(checkpoint.fileReceipts[0]!.reason).toBe('BOMB_OR_SIZE_LIMIT')
    const reopened=new ReviewB2ArchiveVault(new ReviewB2StagingService(),home)
    expect(reopened.inspect(ctx,checkpoint.archiveId).fileReceipts[0]!.status).toBe('rejected')
    const intent=reopened.prepareRestage({...ctx,ownerGeneration:2},checkpoint.archiveId)
    expect('physicalArchiveKey' in intent.restage).toBe(false)
  })

})
