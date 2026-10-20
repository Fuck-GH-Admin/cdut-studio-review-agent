import {createHash} from 'node:crypto'
import {closeSync,existsSync,mkdtempSync,openSync,readFileSync,
  rmSync,writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe,expect,it} from 'bun:test'
import {inspectA20OwnerRecovery,observeA20LinuxProcess,
 type A20RecoveryEvidence} from './review-v3-owner-recovery-evidence'
import {readA20RecoveryIntent,recordA20RecoveryIntent,
 type A20OperatorAttestation} from './review-v3-owner-reconciliation-intent'
import {spawnSync} from 'node:child_process'
const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
const sealed=(p:unknown)=>JSON.stringify({payload:p,sha256:sha(JSON.stringify(p))})
function deadIdentity(){
  const js="const f=require('node:fs');const t=f.readFileSync('/proc/self/stat','utf8');"+
    "console.log(JSON.stringify({pid:process.pid,startTicks:"+
    "t.slice(t.lastIndexOf(')')+2).trim().split(/\\s+/)[19],"+
    "bootId:f.readFileSync('/proc/sys/kernel/random/boot_id','utf8').trim()}))"
  const out=spawnSync(process.execPath,['-e',js],{encoding:'utf8',timeout:15000})
  if(out.status!==0)throw Error(out.stderr)
  return JSON.parse(out.stdout) as NonNullable<ReturnType<typeof observeA20LinuxProcess>>
}
function setup(dir:string,live=false){
  const os=live?observeA20LinuxProcess(process.pid)!:deadIdentity()
  const witness={...os,sessionId:'r20-owner',processEpoch:'r20-old-epoch',caseId:'r20-case'}
  const paths={owner:join(dir,'owner.json'),dispatch:join(dir,'dispatch.json'),
    turns:join(dir,'turns.json')}
  writeFileSync(paths.owner,sealed({
    version:'v3-dev-a-owner/1',generationBySession:{'r20-owner':1},
    owners:{'r20-owner':{sessionId:'r20-owner',processEpoch:'r20-old-epoch',
      caseId:'r20-case',state:'active'}},tombstones:[],
  }))
  writeFileSync(paths.dispatch,sealed({
    version:'v3-dev-a-sdk-dispatch/1',
    runs:{old:{records:[{id:'r20-physical-intent',state:'in-flight',
      caseId:'r20-case',sessionId:'r20-owner'}]}},
  }))
  const fd=openSync(paths.owner+'.write-lock','wx',0o600);closeSync(fd)
  return {paths,witness,intent:join(dir,'reviewed-intent.json')}
}
function attest(e:A20RecoveryEvidence):A20OperatorAttestation{
  return {operatorId:'offline-test-reviewer',approvalId:'r20-fixture-review-001',
    reviewedEvidenceHash:e.evidenceHash,approvedEpoch:e.witness.processEpoch,
    approvalScope:'A_ONLY_TECHNICAL_REVIEW'}
}
const linux=process.platform==='linux'?it:it.skip
describe('Dev-A R20-02 technical-only durable reconciliation intent',()=>{
  linux('R20-02A: exact dead PID, reviewed sealed single CAS, idempotent replay',()=>{
    const dir=mkdtempSync(join(tmpdir(),'r20-02-'))
    try{
      const {paths,witness,intent}=setup(dir)
      const evidence=inspectA20OwnerRecovery(paths,witness)
      expect(evidence.verdict).toBe('OPERATOR_REVIEW_REQUIRED')
      const a=recordA20RecoveryIntent(paths,intent,'r20-request-01',evidence,attest)
      expect(a).toMatchObject({
        requestId:'r20-request-01',dispatchId:'r20-physical-intent',
        noLockTakeover:true,noProviderReplay:true,state:'REVIEWED_NOT_EXECUTED',
      })
      expect(readA20RecoveryIntent(intent)).toEqual(a)
      const bytes=readFileSync(intent,'utf8')
      expect(recordA20RecoveryIntent(paths,intent,'r20-request-01',evidence,attest))
        .toEqual(a)
      expect(readFileSync(intent,'utf8')).toBe(bytes)
      expect(existsSync(paths.owner+'.write-lock')).toBe(true)
    }finally{rmSync(dir,{recursive:true,force:true})}
  })
  linux('R20-02B: refuse live owner, forged review, stale evidence, collisions',()=>{
    const dir=mkdtempSync(join(tmpdir(),'r20-02-'))
    try{
      const x=setup(dir,true),proof=inspectA20OwnerRecovery(x.paths,x.witness)
      expect(()=>recordA20RecoveryIntent(x.paths,x.intent,'live',proof,attest))
        .toThrow('old PID is live')
      expect(existsSync(x.intent)).toBe(false)
    }finally{rmSync(dir,{recursive:true,force:true})}
    const next=mkdtempSync(join(tmpdir(),'r20-02-'))
    try{
      const x=setup(next),proof=inspectA20OwnerRecovery(x.paths,x.witness)
      expect(()=>recordA20RecoveryIntent(x.paths,x.intent,'bad',proof,
        e=>({...attest(e),reviewedEvidenceHash:'forged'})))
        .toThrow('did not bind exact evidence')
      expect(existsSync(x.intent)).toBe(false)
      const original=recordA20RecoveryIntent(x.paths,x.intent,'first',proof,attest)
      expect(()=>recordA20RecoveryIntent(x.paths,x.intent,'second',proof,attest))
        .toThrow('receipt collision')
      expect(readA20RecoveryIntent(x.intent)).toEqual(original)
      writeFileSync(x.paths.dispatch,sealed({
        version:'v3-dev-a-sdk-dispatch/1',runs:{old:{records:[{
          id:'changed-id',state:'in-flight',caseId:'r20-case',sessionId:'r20-owner',
        }]}}
      }))
      expect(()=>recordA20RecoveryIntent(x.paths,x.intent,'third',proof,attest))
        .toThrow('changed during recovery')
      expect(existsSync(x.paths.owner+'.write-lock')).toBe(true)
    }finally{rmSync(next,{recursive:true,force:true})}
  })
})
