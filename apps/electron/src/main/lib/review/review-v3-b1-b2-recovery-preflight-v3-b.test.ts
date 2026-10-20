import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'
import { ReviewB2ArchiveVault } from './review-import-checkpoint-v3-b2'
import { ReviewB2InputLedger } from './review-import-ledger-v3-b2'
import { saveB1AuthorRevision, freezeB1Candidate, readB1AuthorRevision } from './review-template-author-store-v3-b1'
import type { B1AuthorDocument } from './review-template-plan-adapter-v3-b1'
import {
  readB23RecoveryPreflight, type B23MainRecoveryAuthority,
} from './review-v3-b1-b2-recovery-preflight-v3-b'
import type { B20MainReadScope,B20ReadAuthorExpectation } from './review-v3-b1-b2-main-read-bundle-v3-b'

const root=mkdtempSync(join(tmpdir(),'review-b23-recovery-'))
const oldConfig=process.env.PROFER_CONFIG_DIR
process.env.PROFER_CONFIG_DIR=root
afterAll(()=>{
  if(oldConfig===undefined)delete process.env.PROFER_CONFIG_DIR
  else process.env.PROFER_CONFIG_DIR=oldConfig
  rmSync(root,{recursive:true,force:true})
})
let seq=0
const crc=(bytes:Buffer):number=>{
  let v=0xffffffff
  for(const byte of bytes){
    v^=byte
    for(let j=0;j<8;j++)v=(v&1)?(0xedb88320^(v>>>1)):(v>>>1)
  }
  return (v^0xffffffff)>>>0
}
function zip(items:{name:string;text:string}[]):Buffer{
  const local:Buffer[]=[],center:Buffer[]=[]
  let offset=0
  for(const {name,text} of items){
    const filename=Buffer.from(name),value=Buffer.from(text),sum=crc(value)
    const header=Buffer.alloc(30),index=Buffer.alloc(46)
    header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4)
    header.writeUInt16LE(0x800,6);header.writeUInt32LE(sum,14)
    header.writeUInt32LE(value.length,18);header.writeUInt32LE(value.length,22)
    header.writeUInt16LE(filename.length,26)
    index.writeUInt32LE(0x02014b50,0);index.writeUInt16LE(0x0314,4)
    index.writeUInt16LE(20,6);index.writeUInt16LE(0x800,8)
    index.writeUInt32LE(sum,16);index.writeUInt32LE(value.length,20)
    index.writeUInt32LE(value.length,24);index.writeUInt16LE(filename.length,28)
    index.writeUInt32LE(0x81a40000,38);index.writeUInt32LE(offset,42)
    local.push(header,filename,value);center.push(index,filename)
    offset+=header.length+filename.length+value.length
  }
  const directory=Buffer.concat(center),end=Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(items.length,8)
  end.writeUInt16LE(items.length,10);end.writeUInt32LE(directory.length,12)
  end.writeUInt32LE(offset,16)
  return Buffer.concat([...local,directory,end])
}
function author(id:string):B1AuthorDocument {
  return {
    schemaVersion:'review-b1/1',status:'candidate-held',templateId:id,
    templateVersion:'1',name:'Synthetic custom R23',purpose:'Candidate recovery only',
    sources:[{sourceId:'self',kind:'user-declared',documentVersionId:'self-v1',
      locator:'author-declaration',recordedBy:'main-principal'}],
    fields:[],targets:[{targetKey:'target',objectKey:'object',subjectId:'student-a',
      scenario:'multi-zip technical',fieldValues:{}}],
    modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[{
      checkKey:'application',requirement:'Check physical application',responsibility:'human',
      sourceIds:['self'],targetKeys:['target'],condition:{kind:'always'},
    }]}],stages:[{stageId:'review',role:'human',mode:'manual'}],
    outputs:[{outputId:'record',kind:'report'}],
  }
}
const originalScope=(num:number):B20MainReadScope=>({
  ownerId:'real-main-owner-'+num,ownerGeneration:5,caseCandidateId:'candidate-'+num,
  principalId:'principal-main-'+num,sessionId:'active-window-'+num,
  senderId:num+10,frameId:2,authorityEpoch:8,
})
type Fixture=ReturnType<typeof fixture>
function fixture(){
  const n=++seq,ctx=originalScope(n)
  const archiveDirectory=join(root,'case-'+n,'archives')
  const ledgerDirectory=join(root,'case-'+n,'ledger')
  const oldStage=new ReviewB2StagingService()
  const oldVault=new ReviewB2ArchiveVault(oldStage,archiveDirectory)
  const oldLedger=new ReviewB2InputLedger(oldVault,oldStage,ledgerDirectory)
  const templateId='b23-author-'+n
  const saved=saveB1AuthorRevision(author(templateId),0,ctx.principalId)
  const frozen=freezeB1Candidate(templateId,1)
  const expected:B20ReadAuthorExpectation={
    templateId,revision:saved.revision,revisionDigest:saved.digest,
    frozenFingerprint:frozen.descriptor.canonicalPlan.fingerprint,
  }
  const archiveIds:string[]=[]
  const addArchive=(name:string,contents:{name:string;text:string}[])=>{
    const result=oldVault.saveAndStage(ctx,{
      physicalArchiveKey:'genuine-old-picker-'+name,requestId:'import-'+name,bytes:zip(contents),
    })
    archiveIds.push(result.checkpoint.archiveId)
    return oldLedger.getOrCreate(ctx,result.checkpoint.archiveId)
  }
  const confirm=(archiveId:string,index:number,status:'accepted'|'skipped'|'rejected',
    role:'application'|'supporting'='supporting')=>{
    const history=oldLedger.snapshot(ctx,archiveId)
    const entry=history.files.find(x=>x.index===index)!
    return oldLedger.decide(ctx,archiveId,history.revision,
      'receipt-'+n+'-'+archiveId.slice(0,6)+'-'+index,{
        entryIndex:index,status,
        ...(status==='accepted'?{role,subjectId:'student-a',rawSha256:entry.rawSha256!}
          :{reason:'Explicit input-only user rejection'}),
      },{principalId:ctx.principalId,authorize:()=>true})
  }
  const freshScope:B20MainReadScope={...ctx,ownerGeneration:6,authorityEpoch:9,sessionId:'reopened-window-'+n}
  const freshStage=new ReviewB2StagingService()
  const vault=new ReviewB2ArchiveVault(freshStage,archiveDirectory)
  const ledger=new ReviewB2InputLedger(vault,freshStage,ledgerDirectory)
  const authority:B23MainRecoveryAuthority={
    currentScope:()=>freshScope,
    currentArchiveIds:()=>[...archiveIds],
  }
  return {ctx,freshScope,oldStage,oldVault,oldLedger,archiveDirectory,ledgerDirectory,
    expected,templateId,archiveIds,addArchive,confirm,freshStage,vault,ledger,authority}
}
const read=(f:Fixture)=>readB23RecoveryPreflight(f.expected,{
  authority:f.authority,staging:f.freshStage,vault:f.vault,ledger:f.ledger,
})
describe('Dev-B R23 real B1 candidate plus multi-ZIP recovery preflight; no old receipts become current authority',()=>{
  test('R23-01 restart with two physical ZIPs, 3 files and real accepted/skipped/unknown receipts yields candidate-only preflight',()=>{
    const f=fixture()
    const a=f.addArchive('application',[{name:'form.txt',text:'form original'},
      {name:'unconfirmed.txt',text:'attachment'}])
    const b=f.addArchive('supporting',[{name:'proof.txt',text:'supporting original'},
      {name:'rejected.txt',text:'invalid attachment'}])
    f.confirm(a.archiveId,0,'accepted','application')
    f.confirm(b.archiveId,0,'accepted','supporting')
    f.confirm(b.archiveId,1,'rejected')
    // These are brand-new in-memory Main sessions reading actual old ZIP
    // archives and independent old /2 InputLedger on disk.
    const snap=read(f)
    expect(snap.state).toBe('recovery-and-human-confirmation-required')
    expect(snap.archives).toHaveLength(2)
    const entries=snap.archives.flatMap(x=>x.entries)
    expect(entries).toHaveLength(4)
    expect(entries.filter(x=>x.historicInputState==='historic-accepted-needs-new-source-confirmation'))
      .toHaveLength(2)
    expect(entries.filter(x=>x.historicInputState==='previously-rejected')).toHaveLength(1)
    expect(entries.filter(x=>x.historicInputState==='not-yet-confirmed')).toHaveLength(1)
    expect(entries.every(x=>x.sourceReuseAllowed===false&&x.currentSourceIdentityVerified===false)).toBe(true)
    expect(snap.archives.every(x=>x.requiresTrustedNativeRepick===true &&
      x.freshOwnerGenerationRequired===false &&
      x.requiresCurrentParserAndSourceReceipt===true)).toBe(true)
    expect(snap.businessWriteAllowed).toBe(false)
    expect(snap.publicationAllowed).toBe(false)
    expect(snap.schoolPolicyVerified).toBe(false)
    expect(snap.currentSourceIdentityVerified).toBe(false)
    expect('originalBytes' in snap.archives[0]!).toBe(false)
    expect('nativeArchiveKey' in snap.archives[0]!).toBe(false)
    expect(read(f)).toEqual(snap)
  })
  test('R23-02 same Owner generation after restart is not fresh; old accepted role is historical only',()=>{
    const f=fixture(),a=f.addArchive('same',[{name:'same.txt',text:'source'}])
    f.confirm(a.archiveId,0,'accepted','application')
    f.freshScope.ownerGeneration=5
    const current=read(f)
    expect(current.archives[0]!.freshOwnerGenerationRequired).toBe(true)
    expect(current.archives[0]!.entries[0]!.historicInputState)
      .toBe('historic-accepted-needs-new-source-confirmation')
    expect(current.archives[0]!.entries[0]!.historicalReceiptOwnerGeneration).toBe(5)
    expect(current.archives[0]!.entries[0]!.sourceReuseAllowed).toBe(false)
  })
  test('R23-03 no registered archives is explicit empty preflight, never equivalent to installed material',()=>{
    const f=fixture()
    const pre=read(f)
    expect(pre.state).toBe('no-registered-archives')
    expect(pre.archives).toEqual([])
    expect(pre.businessWriteAllowed).toBe(false)
  })
  test('R23-04 malformed, absent or forged C Main Principal/archive registry fails before any preflight',()=>{
    const f=fixture()
    for(const bad of [
      {} as B23MainRecoveryAuthority,
      {currentScope:()=>null,currentArchiveIds:()=>[]},
      {currentScope:()=>({...f.freshScope,principalId:''}),currentArchiveIds:()=>[]},
      {currentScope:()=>f.freshScope,currentArchiveIds:()=>null},
      {currentScope:()=>f.freshScope,currentArchiveIds:()=>['forge']},
    ]){
      expect(()=>readB23RecoveryPreflight(f.expected,{
        authority:bad,staging:f.freshStage,vault:f.vault,ledger:f.ledger,
      })).toThrow()
    }
    const a=f.addArchive('real',[{name:'source.txt',text:'bytes'}])
    f.authority.currentArchiveIds=()=>[a.archiveId,a.archiveId]
    expect(()=>read(f)).toThrow('B_R23_ARCHIVE_REGISTRY_INVALID')
    f.authority.currentArchiveIds=()=>Array.from({length:33},(_,i)=>i.toString(16).padStart(40,'0'))
    expect(()=>read(f)).toThrow('B_R23_ARCHIVE_REGISTRY_INVALID')
  })
  test('R23-05 different real Case/Owner cannot read prior ZIP or confirm input',()=>{
    const f=fixture()
    f.addArchive('scoped',[{name:'source.txt',text:'sensitive input'}])
    f.freshScope.ownerId='attacker-other-owner'
    expect(()=>read(f)).toThrow('B2_ARCHIVE_OWNER_SCOPE_MISMATCH')
    f.freshScope.ownerId=f.ctx.ownerId
    f.freshScope.caseCandidateId='foreign-case'
    expect(()=>read(f)).toThrow('B2_ARCHIVE_OWNER_SCOPE_MISMATCH')
  })
  test('R23-06 archive bytes corrupted on disk aborts entire 2-archive read, not partial success',()=>{
    const f=fixture()
    f.addArchive('one',[{name:'one.txt',text:'one'}])
    const two=f.addArchive('two',[{name:'two.txt',text:'two'}])
    f.confirm(two.archiveId,0,'accepted')
    const physical=join(f.archiveDirectory,two.archiveId,'archive.zip')
    const saved=readFileSync(physical)
    writeFileSync(physical,Buffer.from('tampered'))
    expect(()=>read(f)).toThrow('B2_ARCHIVE_CHECKPOINT_INTEGRITY')
    writeFileSync(physical,saved)
    expect(read(f).archives).toHaveLength(2)
  })
  test('R23-07 input ledger receipt tamper cannot turn pending or rejected into accepted',()=>{
    const f=fixture()
    const x=f.addArchive('tamper',[{name:'one.txt',text:'source'}])
    f.confirm(x.archiveId,0,'accepted')
    const path=join(f.ledgerDirectory,x.archiveId,'ledger.json')
    const before=readFileSync(path,'utf8')
    const parsed=JSON.parse(before)
    parsed.mutations[0].confirmedSubjectId='forged-student'
    writeFileSync(path,JSON.stringify(parsed))
    expect(()=>read(f)).toThrow('B2_LEDGER_CORRUPT')
    writeFileSync(path,before)
    expect(read(f).archives[0]!.entries[0]!.historicalSubjectId).toBe('student-a')
  })
  test('R23-08 authoritative B1 save after freeze invalidates old pin, not relabel new version as approved',()=>{
    const f=fixture()
    f.addArchive('preexisting',[{name:'one.txt',text:'source'}])
    const second=author(f.templateId)
    second.purpose='New author update while archived source remains unchanged'
    saveB1AuthorRevision(second,1,f.ctx.principalId)
    expect(()=>read(f)).toThrow('B_R23_AUTHOR_REVISION_CONFLICT')
    expect(readB1AuthorRevision(f.templateId)!.revision).toBe(2)
  })
  test('R23-09 forged frozen fingerprint and missing trust dependencies are denied',()=>{
    const f=fixture()
    expect(()=>readB23RecoveryPreflight({...f.expected,frozenFingerprint:'bad'},{
      authority:f.authority,staging:f.freshStage,vault:f.vault,ledger:f.ledger,
    })).toThrow('B_R23_AUTHOR_EXPECTATION_INVALID')
    expect(()=>readB23RecoveryPreflight(f.expected,{staging:f.freshStage,vault:f.vault,ledger:f.ledger}))
      .toThrow('B_R23_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED')
    expect(()=>readB23RecoveryPreflight(f.expected,{authority:f.authority,staging:f.freshStage}))
      .toThrow('B_R23_MAIN_TRUST_DEPENDENCY_NOT_INSTALLED')
  })
  test('R23-10 mid-preflight Main frame/epoch changes fail closed even with stable original bytes',()=>{
    const f=fixture()
    f.addArchive('main-changing',[{name:'source.txt',text:'source'}])
    let calls=0
    f.authority.currentScope=()=>++calls===1?f.freshScope:{...f.freshScope,authorityEpoch:10}
    expect(()=>read(f)).toThrow('B_R23_MAIN_SCOPE_CHANGED_DURING_PREFLIGHT')
  })
  test('R23-11 registered ZIP set changes between reads: discard whole preflight',()=>{
    const f=fixture()
    f.addArchive('file-one',[{name:'one.txt',text:'one'}])
    const original=f.authority.currentArchiveIds
    let calls=0
    f.authority.currentArchiveIds=(ctx,expectation)=>
      ++calls===1?original(ctx,expectation):[]
    expect(()=>read(f)).toThrow('B_R23_ARCHIVE_REGISTRY_CHANGED_DURING_PREFLIGHT')
  })
  test('R23-12 real concurrent ledger write after first read invalidates whole preflight snapshot',()=>{
    const f=fixture()
    const original=f.addArchive('ledger-race',[
      {name:'accepted.txt',text:'A'},
      {name:'pending.txt',text:'B'},
    ])
    f.confirm(original.archiveId,0,'accepted')
    const snapshot=f.ledger.snapshot.bind(f.ledger)
    let seen=0
    f.ledger.snapshot=(ctx,id)=>{
      const previous=snapshot(ctx,id)
      if(++seen===1){
        // Second independently authorized Main user records a REAL /2
        // receipt after the first snapshot but before the second.
        f.oldLedger.decide(f.ctx,id,previous.revision,
          'concurrent-confirm-'+seq,{entryIndex:1,status:'accepted',role:'supporting',
            subjectId:'student-a',rawSha256:previous.files[1]!.rawSha256!},
          {principalId:f.ctx.principalId,authorize:()=>true})
      }
      return previous
    }
    expect(()=>read(f)).toThrow('B_R23_SOURCE_CHANGED_DURING_PREFLIGHT')
    expect(f.oldLedger.snapshot(f.ctx,original.archiveId).revision).toBe(2)
  })
  test('R23-13 Owner revoked during physical recovery read cannot acquire historical input privileges',()=>{
    const f=fixture()
    f.addArchive('revoked',[{name:'one.txt',text:'one'}])
    const original=f.vault.inspect.bind(f.vault)
    f.vault.inspect=(ctx,id)=>{
      const snap=original(ctx,id)
      f.freshStage.revoke(f.freshScope)
      return snap
    }
    expect(()=>read(f)).toThrow('B2_OWNER_INVALID_OR_REVOKED')
  })
})
