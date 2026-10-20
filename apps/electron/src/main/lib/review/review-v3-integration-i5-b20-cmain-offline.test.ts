/**
 * I5 ONLY — B R23 actual persisted original/author chain × C B20 immutable offline
 * Main read contract. NO production Main principal/picker installation here.
 * Numeric B20 scope and string C identity are deliberately independent.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ReviewB2StagingService } from './review-intake-adapter-v3-b2'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'
import { ReviewB2ArchiveVault } from './review-import-checkpoint-v3-b2'
import { ReviewB2InputLedger } from './review-import-ledger-v3-b2'
import {
  readB20CurrentCandidateBundle,
  type B20MainReadScope,
  type B20ReadAuthorExpectation,
  type B20CurrentMainReadAuthority,
  type B20ReadOnlySources,
} from './review-v3-b1-b2-main-read-bundle-v3-b'
import type { B19SourceSelection } from './review-v3-b1-b2-candidate-source-bridge'
import {
  freezeB1Candidate, saveB1AuthorRevision,
} from './review-template-author-store-v3-b1'
import type { B1AuthorDocument } from './review-template-plan-adapter-v3-b1'
import {
  CMainB20TrustedCandidateRead,
  type CMainB20ReadIdentity,
} from './review-v3-main-b20-trusted-candidate-read'

const before = process.env.PROFER_CONFIG_DIR
const root = mkdtempSync(join(tmpdir(), 'review-i5-real-b20-cmain-'))
process.env.PROFER_CONFIG_DIR = root
afterAll(() => {
  if (before === undefined) delete process.env.PROFER_CONFIG_DIR
  else process.env.PROFER_CONFIG_DIR = before
  rmSync(root, {recursive:true, force:true})
})
let sequence = 0
const crc = (bytes: Buffer) => {
  let c = 0xffffffff
  for (const n of bytes) {
    c ^= n
    for (let i=0;i<8;i++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  }
  return (c ^ 0xffffffff) >>> 0
}
function physicalZip(files: readonly {name:string,text:string}[]):Buffer {
  let offset = 0
  const local:Buffer[] = [], central:Buffer[] = []
  for (const f of files) {
    const name=Buffer.from(f.name),bytes=Buffer.from(f.text),checksum=crc(bytes)
    const header=Buffer.alloc(30),directory=Buffer.alloc(46)
    header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4)
    header.writeUInt16LE(0x800,6);header.writeUInt32LE(checksum,14)
    header.writeUInt32LE(bytes.length,18);header.writeUInt32LE(bytes.length,22)
    header.writeUInt16LE(name.length,26)
    directory.writeUInt32LE(0x02014b50,0);directory.writeUInt16LE(0x0314,4)
    directory.writeUInt16LE(20,6);directory.writeUInt16LE(0x800,8)
    directory.writeUInt32LE(checksum,16);directory.writeUInt32LE(bytes.length,20)
    directory.writeUInt32LE(bytes.length,24);directory.writeUInt16LE(name.length,28)
    directory.writeUInt32LE(0x81a40000,38);directory.writeUInt32LE(offset,42)
    local.push(header,name,bytes);central.push(directory,name)
    offset += header.length+name.length+bytes.length
  }
  const catalog=Buffer.concat(central),end=Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50,0)
  end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10)
  end.writeUInt32LE(catalog.length,12);end.writeUInt32LE(offset,16)
  return Buffer.concat([...local,catalog,end])
}
function author(templateId:string,versions:readonly string[]):B1AuthorDocument {
  return {
    schemaVersion:'review-b1/1',templateId,templateVersion:'1',
    name:'I5 physical candidate',purpose:'Technical candidate only',
    status:'candidate-held',fields:[],
    sources:[
      {sourceId:'source-a',kind:'user-declared',documentVersionId:versions[0]!,
        locator:'physical:A',recordedBy:'fixture-main-principal'},
      {sourceId:'source-b',kind:'user-declared',documentVersionId:versions[1]!,
        locator:'physical:B',recordedBy:'fixture-main-principal'},
    ],
    targets:[{targetKey:'target',objectKey:'laboratory',subjectId:'student-physical',
      scenario:'offline technical',fieldValues:{}}],
    modules:[{moduleId:'I5',version:'1',dependsOn:[],checks:[
      {checkKey:'check-a',requirement:'A current original',responsibility:'Human',
        sourceIds:['source-a'],targetKeys:['target'],condition:{kind:'always'}},
      {checkKey:'check-b',requirement:'B current original',responsibility:'Human',
        sourceIds:['source-b'],targetKeys:['target'],condition:{kind:'always'}},
      {checkKey:'check-both',requirement:'Both independent sources',responsibility:'Human',
        sourceIds:['source-a','source-b'],targetKeys:['target'],condition:{kind:'always'}},
    ]}],
    stages:[{stageId:'manual',role:'human',mode:'manual'}],
    outputs:[{outputId:'preview',kind:'preview'}],
  }
}
const originalFiles = [
  {name:'one.txt',text:'Physical source A'},
  {name:'two.txt',text:'Physical source B'},
] as const
type TestFixture = Awaited<ReturnType<typeof fixture>>
async function fixture() {
  const id=++sequence,templateId='i5candidate'+id,caseId='i5case'+id
  const bScope:B20MainReadScope={
    senderId:17,frameId:5,ownerId:'fixture-owner',ownerGeneration:4,
    caseCandidateId:caseId,principalId:'fixture-main-principal',
    sessionId:'fixture-session',authorityEpoch:8,
  }
  let cIdentity:CMainB20ReadIdentity|undefined={
    principalId:'fixture-main-principal',sessionId:'fixture-session',
    ownerId:bScope.ownerId,ownerGeneration:bScope.ownerGeneration,
    windowId:'fixture-window',frameId:'fixture-real-main-frame',
    authorityEpoch:'fixture-main-grant-8',caseCandidateId:caseId,
  }
  const staging=new ReviewB2StagingService()
  const parser=new ReviewB2SourceVersionAdapter(staging)
  const vault=new ReviewB2ArchiveVault(staging,join(root,'archive-'+id))
  const ledger=new ReviewB2InputLedger(vault,staging,join(root,'ledger-'+id))
  const physicalKey='offline-native-picker-'+id,archiveBytes=physicalZip(originalFiles)
  const saved=vault.saveAndStage(bScope,{
    physicalArchiveKey:physicalKey,requestId:'archive-'+id,bytes:archiveBytes,
  })
  const archiveId=saved.checkpoint.archiveId
  const initial=ledger.getOrCreate(bScope,archiveId)
  for (const file of initial.files) {
    if (file.status!=='needs-user-confirmation') continue
    const snapshot=ledger.snapshot(bScope,archiveId)
    ledger.decide(bScope,archiveId,snapshot.revision,'consent-'+id+'-'+file.index,{
      entryIndex:file.index,status:'accepted',role:'supporting',
      subjectId:'student-physical',rawSha256:file.rawSha256!,
    },{principalId:bScope.principalId,authorize:()=>true})
  }
  const candidates=saved.preview.candidates
  const parsed=await Promise.all(candidates.map(c=>parser.parse(bScope,c)))
  const document=author(templateId,candidates.map(c=>c.documentVersionId))
  const revision=saveB1AuthorRevision(document,0,bScope.principalId)
  const frozen=freezeB1Candidate(templateId,1)
  const expected:B20ReadAuthorExpectation={
    templateId,revision:revision.revision,revisionDigest:revision.digest,
    frozenFingerprint:frozen.descriptor.canonicalPlan.fingerprint,
  }
  const selection=(index:number,sourceId:string,checkKey:string):B19SourceSelection=>({
    checkKey,targetKey:'target',sourceId,candidateId:candidates[index]!.candidateId,
    parseRevision:parsed[index]!.parseRevision,
    blockId:parsed[index]!.blocks[0]!.blockId,
    requiredRole:'supporting',archiveId,entryIndex:index,
  })
  let selections:B19SourceSelection[]=[
    selection(0,'source-a','check-a'),selection(1,'source-b','check-b'),
    selection(0,'source-a','check-both'),selection(1,'source-b','check-both'),
  ]
  let installed='fixture-install-1',allowed=true,readerCalls=0
  let onRead: (count:number)=>void=()=>{}
  let selectedArchiveKey: string|null=physicalKey
  const authority:B20CurrentMainReadAuthority={
    currentScope:()=>structuredClone(bScope),
    currentSelections:()=>structuredClone(selections),
    nativeArchiveKey:(_,id)=>id===archiveId?selectedArchiveKey:null,
  }
  const sources:B20ReadOnlySources={staging,parser,vault,ledger}
  const gate=new CMainB20TrustedCandidateRead({
    currentIdentity:()=>cIdentity&&structuredClone(cIdentity),
    currentInstallationToken:()=>installed,
    canRead:(scope,t)=>allowed&&scope.principalId==='fixture-main-principal'&&
      scope.caseCandidateId===caseId&&scope.windowId==='fixture-window'&&
      t===templateId,
    getPinnedExpectation:(_,t)=>t===templateId?structuredClone(expected):undefined,
    readCurrentBundle:async (pinned)=>{
      const value=readB20CurrentCandidateBundle(pinned,{authority,sources})
      onRead(++readerCalls)
      return value
    },
  })
  return {
    id,gate,templateId,expected,document,revision,frozen,archiveId,archiveBytes,
    saved,candidates,parsed,staging,parser,vault,ledger,bScope,sources,authority,
    reads:()=>readerCalls,
    onRead:(fn:(n:number)=>void)=>{onRead=fn},
    rotateC:()=>{cIdentity=cIdentity&&{...cIdentity,authorityEpoch:'fixture-main-grant-9'}},
    changeFrame:()=>{cIdentity=cIdentity&&{...cIdentity,frameId:'fixture-other-frame'}},
    revokeC:()=>{allowed=false},
    uninstall:()=>{installed='fixture-install-2'},
    revokeB:()=>{staging.revoke(bScope)},
    withoutKey:()=>{selectedArchiveKey=null},
    replaceSelections:(fn:(x:B19SourceSelection[])=>B19SourceSelection[])=>{
      selections=fn(structuredClone(selections))
    },
  }
}

describe('I5 A19 accepted parent × B R23 physical B20 × immutable C B20 offline-only',()=>{
  test('I5-01 actual ZIP CRC, B1 frozen, /2 physical receipts and 3 Check×target candidates yield C display-only preview',async()=>{
    const f=await fixture()
    const preview=await f.gate.read(f.templateId)
    expect(f.reads()).toBe(2)
    expect(preview).toMatchObject({
      schemaVersion:'review-v3-cmain-b20-candidate-preview/1',
      candidateOnly:true,displayOnly:true,publicationAllowed:false,
      businessWriteAllowed:false,schoolPolicyVerified:false,
      templateId:f.templateId,authorRevision:1,
      frozenFingerprint:f.expected.frozenFingerprint,
    })
    const provenance=preview.candidateProvenance as ReturnType<typeof readB20CurrentCandidateBundle>['candidateProvenance']
    expect(provenance.bindings).toHaveLength(3)
    expect(provenance.bindings.every(b=>b.state==='linked-candidate')).toBe(true)
    expect(provenance.bindings.find(b=>b.checkKey==='check-both')?.sources).toHaveLength(2)
    expect(preview).not.toHaveProperty('principalId')
    expect(preview).not.toHaveProperty('physicalArchiveKey')
    expect(preview).not.toHaveProperty('schoolIssuer')
    expect(preview).not.toHaveProperty('frozenDescriptor')
    expect(f.saved.checkpoint.archiveId).toBe(f.archiveId)
  })

  test('I5-02 B1 persisted new revision invalidates C pinned old frozen; unsaved editor claim is never authoritative',async()=>{
    const f=await fixture()
    const unsaved=structuredClone(f.document)
    unsaved.modules[0]!.checks[0]!.requirement='unsaved impersonated requirement'
    expect((await f.gate.read(f.templateId)).publicationAllowed).toBe(false)
    const next=saveB1AuthorRevision(unsaved,1,f.bScope.principalId)
    expect(next.parentDigest).toBe(f.revision.digest)
    await expect(f.gate.read(f.templateId)).rejects.toThrow('B_R20_AUTHOR_REVISION_CONFLICT')
  })

  test('I5-03 Main grant epoch change after actual B disk/parser read rejects even before second read',async()=>{
    const f=await fixture()
    f.onRead(n=>{if(n===1)f.rotateC()})
    await expect(f.gate.read(f.templateId))
      .rejects.toThrow('C_MAIN_B20_MAIN_CONTEXT_REVOKED_AFTER_B20_READ')
    expect(f.reads()).toBe(1)
  })

  test('I5-04 physical frame change or revoked ACL after actual B read denies replay',async()=>{
    const frame=await fixture()
    frame.onRead(n=>{if(n===1)frame.changeFrame()})
    await expect(frame.gate.read(frame.templateId))
      .rejects.toThrow('C_MAIN_B20_MAIN_CONTEXT_REVOKED_AFTER_B20_READ')
    const auth=await fixture()
    auth.onRead(n=>{if(n===1)auth.revokeC()})
    await expect(auth.gate.read(auth.templateId)).rejects.toThrow('C_MAIN_B20_MAIN_ACL_REVOKED')
  })

  test('I5-05 C Main missing installation and B native picker provenance never fall back to Renderer claims',async()=>{
    const f=await fixture()
    f.uninstall()
    // A new installation token is allowed only for subsequently fresh reads,
    // not for a previously in-flight operation. B still independently checks
    // current native archive key.
    f.withoutKey()
    await expect(f.gate.read(f.templateId))
      .rejects.toThrow('B_R20_NATIVE_PICKER_PROVENANCE_NOT_INSTALLED')
    const gone=await fixture()
    gone.onRead(n=>{if(n===1)gone.uninstall()})
    await expect(gone.gate.read(gone.templateId))
      .rejects.toThrow('C_MAIN_B20_MAIN_CONTEXT_REVOKED_AFTER_B20_READ')
  })

  test('I5-06 different physical original with same ZIP filename and raw content cannot inherit linked C evidence',async()=>{
    const f=await fixture()
    const second=f.vault.saveAndStage(f.bScope,{
      physicalArchiveKey:'other-native-handle',
      requestId:'other-source-'+f.templateId,
      bytes:f.archiveBytes,
    })
    expect(second.preview.candidates[0]!.rawSha256).toBe(f.candidates[0]!.rawSha256)
    expect(second.preview.candidates[0]!.documentVersionId)
      .not.toBe(f.candidates[0]!.documentVersionId)
    const parsed=await f.parser.parse(f.bScope,second.preview.candidates[0]!)
    f.replaceSelections(s=>{
      s[0]={...s[0]!,candidateId:second.preview.candidates[0]!.candidateId,
        parseRevision:parsed.parseRevision,blockId:parsed.blocks[0]!.blockId}
      return s
    })
    const preview=await f.gate.read(f.templateId)
    const evidence=preview.candidateProvenance as ReturnType<typeof readB20CurrentCandidateBundle>['candidateProvenance']
    expect(evidence.bindings.find(b=>b.checkKey==='check-a')?.state).toBe('stale')
    expect(evidence.bindings.find(b=>b.checkKey==='check-b')?.state).toBe('linked-candidate')
    expect(preview.schoolPolicyVerified).toBe(false)
  })

  test('I5-07 current B source verification catches old parser block and revoked Owner',async()=>{
    const f=await fixture()
    f.replaceSelections(s=>{s[0]={...s[0]!,parseRevision:'stale-parser-id'};return s})
    const preview=await f.gate.read(f.templateId)
    const evidence=preview.candidateProvenance as ReturnType<typeof readB20CurrentCandidateBundle>['candidateProvenance']
    expect(evidence.bindings.find(b=>b.checkKey==='check-a')?.state).toBe('stale')
    f.revokeB()
    await expect(f.gate.read(f.templateId)).rejects.toThrow('B2_OWNER_INVALID_OR_REVOKED')
  })

  test('I5-08 actual confirmed physical ledger tamper cannot mint a C-linked evidence receipt',async()=>{
    const f=await fixture()
    const path=join(root,'ledger-'+f.id,f.archiveId,'ledger.json')
    const bytes=readFileSync(path,'utf8'),tampered=JSON.parse(bytes)
    tampered.mutations[0].confirmedRole='application'
    writeFileSync(path,JSON.stringify(tampered))
    await expect(f.gate.read(f.templateId)).rejects.toThrow('B2_LEDGER_CORRUPT')
  })

  test('I5-09 old C preview cannot authorize source after archive/Owner revoke; no school or Run ACK',async()=>{
    const f=await fixture()
    const cached=await f.gate.read(f.templateId)
    f.revokeB()
    await expect(f.gate.read(f.templateId)).rejects.toThrow('B2_OWNER_INVALID_OR_REVOKED')
    expect(cached.publicationAllowed).toBe(false)
    expect(cached.businessWriteAllowed).toBe(false)
    expect(cached.schoolPolicyVerified).toBe(false)
    expect(cached).not.toHaveProperty('caseReceipt')
    expect(cached).not.toHaveProperty('runAck')
  })
  test('I5-10 real independent PID can read durable author but cannot resurrect an uninstalled B2 Owner/picker',async()=>{
    const f=await fixture()
    const worker=fileURLToPath(new URL('./review-v3-integration-i5-coldpid.worker.ts',import.meta.url))
    const cold=spawnSync(process.execPath,[
      worker,f.templateId,f.expected.revisionDigest,
      f.expected.frozenFingerprint,f.bScope.caseCandidateId,
    ],{encoding:'utf8',timeout:20000,env:{...process.env,PROFER_CONFIG_DIR:root}})
    expect(cold.error).toBeUndefined()
    if(cold.status!==0)throw Error('I5 cold PID B20 fence failed: '+cold.stderr)
    const line=cold.stdout.split('\n').find(s=>s.startsWith('I5_COLD_PROVENANCE '))
    expect(line).toBeDefined()
    const record=JSON.parse(line!.slice('I5_COLD_PROVENANCE '.length)) as {
      pid:number;persistedAuthor:boolean;oldOwnerDenied:boolean;
      published:boolean;independentMainIdentity:boolean;
    }
    expect(record.pid).not.toBe(process.pid)
    expect(record).toMatchObject({
      persistedAuthor:true,oldOwnerDenied:true,
      published:false,independentMainIdentity:false,
    })
    expect((await f.gate.read(f.templateId)).candidateOnly).toBe(true)
  })

})
