import { afterAll, describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'
import { ReviewB2ArchiveVault } from './review-import-checkpoint-v3-b2'
import {
  ReviewB2InputLedger, type B2InputAuthority, type B2InputDecision,
} from './review-import-ledger-v3-b2'

const work=mkdtempSync(join(tmpdir(),'review-b2-file-ledger-'))
afterAll(()=>rmSync(work,{recursive:true,force:true}))
const ctx:B2MainContext={ownerId:'own-a',ownerGeneration:1,senderId:13,frameId:9,caseCandidateId:'case-a'}
const trusted:B2InputAuthority={principalId:'user-a',authorize:(context,principal,decision)=>
  context.ownerId==='own-a' && principal==='user-a' && decision.entryIndex>=0}
const table=Array.from({length:256},(_,i)=>{
  let c=i
  for(let n=0;n<8;n++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1)
  return c>>>0
})
const crc=(b:Buffer):number=>{
  let c=0xffffffff
  for(const value of b)c=table[(c^value)&255]!^(c>>>8)
  return (c^0xffffffff)>>>0
}
function zip(files: Array<{name:string;content:string}>):Buffer{
  const parts:Buffer[]=[],center:Buffer[]=[]
  let position=0
  for(const file of files){
    const name=Buffer.from(file.name,'utf8'),bytes=Buffer.from(file.content,'utf8')
    const l=Buffer.alloc(30),c=Buffer.alloc(46),sum=crc(bytes)
    l.writeUInt32LE(0x04034b50,0);l.writeUInt16LE(20,4);l.writeUInt16LE(0x800,6)
    l.writeUInt32LE(sum,14);l.writeUInt32LE(bytes.length,18)
    l.writeUInt32LE(bytes.length,22);l.writeUInt16LE(name.length,26)
    c.writeUInt32LE(0x02014b50,0);c.writeUInt16LE(0x0314,4)
    c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt32LE(sum,16)
    c.writeUInt32LE(bytes.length,20);c.writeUInt32LE(bytes.length,24)
    c.writeUInt16LE(name.length,28);c.writeUInt32LE(0x81a40000,38)
    c.writeUInt32LE(position,42)
    parts.push(l,name,bytes);center.push(c,name)
    position+=l.length+name.length+bytes.length
  }
  const cent=Buffer.concat(center),tail=Buffer.alloc(22)
  tail.writeUInt32LE(0x06054b50,0)
  tail.writeUInt16LE(files.length,8);tail.writeUInt16LE(files.length,10)
  tail.writeUInt32LE(cent.length,12);tail.writeUInt32LE(position,16)
  return Buffer.concat([...parts,cent,tail])
}
function fixture(label:string){
  const staging=new ReviewB2StagingService()
  const archiveVault=new ReviewB2ArchiveVault(staging,join(work,label,'archive'))
  const ledgerDir=join(work,label,'ledger')
  const ledger=new ReviewB2InputLedger(archiveVault,staging,ledgerDir)
  const source=archiveVault.saveAndStage(ctx,{
    physicalArchiveKey:'native-file-'+label,requestId:'request-'+label,
    bytes:zip([
      {name:'apply.txt',content:'raw application original'},
      {name:'../escape.txt',content:'malicious traversal'},
      {name:'evidence.txt',content:'raw evidence original'},
    ]),
  })
  return {staging,archiveVault,ledger,ledgerDir,archiveId:source.checkpoint.archiveId}
}
const confirm=(entryIndex:number,rawSha256:string):B2InputDecision=>({
  entryIndex,status:'accepted',role:'supporting',subjectId:'subject-1',rawSha256,
})
describe('B-IN-01/02: durable source-only ImportBatch input status ledger',()=>{
  test('archive rejected child stays immutable and accepted child begins needs confirmation',()=>{
    const f=fixture('initial')
    const result=f.ledger.getOrCreate(ctx,f.archiveId)
    expect(result.kind).toBe('import')
    expect(result.revision).toBe(0)
    expect(result.files.map(x=>x.status)).toEqual([
      'needs-user-confirmation','rejected','needs-user-confirmation',
    ])
    expect(result.files[1]!.rawSha256).toBeNull()
    expect(result.files.every(x=>x.candidateVersionKey===null)).toBe(true)
    const reopened=new ReviewB2InputLedger(f.archiveVault,f.staging,f.ledgerDir)
    expect(reopened.getOrCreate(ctx,f.archiveId)).toEqual(result)
    expect(()=>f.ledger.decide(ctx,f.archiveId,0,'bad-id',confirm(1,'a'.repeat(64)),trusted))
      .toThrow('B2_LEDGER_ENTRY_NOT_CONFIRMABLE')
    expect(f.ledger.snapshot(ctx,f.archiveId).revision).toBe(0)
  })
  test('source hash and Principal-checked CAS, exact replay, same-key/different-body reject',()=>{
    const f=fixture('cas')
    const initial=f.ledger.getOrCreate(ctx,f.archiveId)
    const raw=initial.files[0]!.rawSha256!
    expect(()=>f.ledger.decide(ctx,f.archiveId,0,'intent-1',confirm(0,'0'.repeat(64)),trusted))
      .toThrow('B2_LEDGER_SOURCE_MISMATCH')
    expect(()=>f.ledger.decide(ctx,f.archiveId,0,'intent-1',confirm(0,raw),{
      ...trusted,authorize:()=>false,
    })).toThrow('B2_LEDGER_AUTH_UNAVAILABLE')
    const first=f.ledger.decide(ctx,f.archiveId,0,'intent-1',confirm(0,raw),trusted)
    expect(first.ledger.revision).toBe(1)
    expect(first.ledger.files[0]!.candidateVersionKey).toMatch(/^candidate-version-/)
    expect(first.ledger.files[0]!.reason).toContain('not applied')
    expect(first.ledger.files[2]!.status).toBe('needs-user-confirmation')
    const reopened=new ReviewB2InputLedger(f.archiveVault,f.staging,f.ledgerDir)
    const replay=reopened.decide(ctx,f.archiveId,0,'intent-1',confirm(0,raw),trusted)
    expect(replay.receipt).toEqual(first.receipt)
    expect(replay.ledger).toEqual(first.ledger)
    expect(()=>reopened.decide(ctx,f.archiveId,1,'intent-1',{
      ...confirm(0,raw),subjectId:'subject-other',
    },trusted)).toThrow('B2_LEDGER_REQUEST_COLLISION')
    expect(()=>reopened.decide(ctx,f.archiveId,0,'intent-2',{
      entryIndex:2,status:'skipped',reason:'file not used',
    },trusted)).toThrow('B2_LEDGER_REVISION_CONFLICT')
    const second=reopened.decide(ctx,f.archiveId,1,'intent-2',{
      entryIndex:2,status:'skipped',reason:'file not used',
    },trusted)
    expect(second.ledger.revision).toBe(2)
    expect(second.receipt.previousHash).toBe(first.receipt.receiptHash)
    expect(second.ledger.files[2]!.status).toBe('skipped')
    expect(second.ledger.mutations).toHaveLength(2)
    expect(()=>reopened.decide(ctx,f.archiveId,2,'intent-3',{
      ...confirm(0,raw),
    },trusted)).toThrow('B2_LEDGER_ENTRY_NOT_CONFIRMABLE')
  })
  test('receipt replay detects impossible final file status even if an editor recomputes ledger hash',()=>{
    const f=fixture('receipt-replay')
    const first=f.ledger.getOrCreate(ctx,f.archiveId)
    f.ledger.decide(ctx,f.archiveId,0,'accept-replay',confirm(0,first.files[0]!.rawSha256!),trusted)
    const file=join(f.ledgerDir,f.archiveId,'ledger.json')
    const original=readFileSync(file,'utf8')
    const mutate=(apply:(x:any)=>void)=>{
      const body=JSON.parse(original)
      apply(body)
      const {ledgerHash:_,...plain}=body
      body.ledgerHash=createHash('sha256').update(JSON.stringify(plain)).digest('hex')
      writeFileSync(file,JSON.stringify(body))
      expect(()=>f.ledger.snapshot(ctx,f.archiveId)).toThrow('B2_LEDGER_CORRUPT')
      writeFileSync(file,original)
    }
    mutate(x=>{x.files[0].status='needs-user-confirmation'})
    mutate(x=>{x.files[2].status='accepted'})
    mutate(x=>{x.files[0].reason='invented school confirmation'})
    mutate(x=>{x.files[1].reason='silently changed ZIP rejected reason'})
    expect(f.ledger.snapshot(ctx,f.archiveId).revision).toBe(1)
  })
  test('duplicated terminal mutation of one file cannot be accepted as a separate import decision',()=>{
    const f=fixture('double-terminal')
    const first=f.ledger.getOrCreate(ctx,f.archiveId)
    f.ledger.decide(ctx,f.archiveId,0,'accept-once',confirm(0,first.files[0]!.rawSha256!),trusted)
    const file=join(f.ledgerDir,f.archiveId,'ledger.json')
    const body=JSON.parse(readFileSync(file,'utf8'))
    const firstMutation=body.mutations[0]
    const unsigned={
      requestId:'accept-twice',payloadHash:firstMutation.payloadHash,
      revision:2,previousHash:firstMutation.receiptHash,decidedBy:firstMutation.decidedBy,
      ownerGeneration:1,entryIndex:0,status:'accepted',
    }
    const receiptHash=createHash('sha256').update(JSON.stringify(unsigned)).digest('hex')
    body.mutations.push({...unsigned,receiptHash})
    body.revision=2
    const {ledgerHash:_,...plain}=body
    body.ledgerHash=createHash('sha256').update(JSON.stringify(plain)).digest('hex')
    writeFileSync(file,JSON.stringify(body))
    expect(()=>f.ledger.snapshot(ctx,f.archiveId)).toThrow('B2_LEDGER_CORRUPT')
  })
  test('no cross-case, owner generation revoke and filesystem tamper allowed',()=>{
    const f=fixture('trust')
    const start=f.ledger.getOrCreate(ctx,f.archiveId)
    expect(()=>f.ledger.snapshot({...ctx,ownerId:'somebody-else'},f.archiveId))
      .toThrow('B2_ARCHIVE_OWNER_SCOPE_MISMATCH')
    f.staging.revoke(ctx)
    expect(()=>f.ledger.decide(ctx,f.archiveId,0,'denied',confirm(0,start.files[0]!.rawSha256!),trusted))
      .toThrow('B2_OWNER_INVALID_OR_REVOKED')
    const newCtx={...ctx,ownerGeneration:2}
    const reopened=new ReviewB2StagingService()
    const vault=new ReviewB2ArchiveVault(reopened,join(work,'trust','archive'))
    const ledger=new ReviewB2InputLedger(vault,reopened,f.ledgerDir)
    expect(ledger.snapshot(newCtx,f.archiveId).revision).toBe(0)
    const changed=ledger.decide(newCtx,f.archiveId,0,'post-reauth',confirm(0,start.files[0]!.rawSha256!),trusted)
    expect(changed.receipt.ownerGeneration).toBe(2)
    const file=join(f.ledgerDir,f.archiveId,'ledger.json')
    const parsed=JSON.parse(readFileSync(file,'utf8'))
    parsed.files[0].subjectId='forged-subject'
    writeFileSync(file,JSON.stringify(parsed))
    expect(()=>ledger.snapshot(newCtx,f.archiveId)).toThrow('B2_LEDGER_CORRUPT')
  })
})
