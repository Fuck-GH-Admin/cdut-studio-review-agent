import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {closeSync,mkdtempSync,openSync,readFileSync,rmSync,writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe,expect,it} from 'bun:test'
import {assertA20RecoveryEvidenceFresh,inspectA20OwnerRecovery,
  observeA20LinuxProcess,type A20OwnerWitness} from './review-v3-owner-recovery-evidence'

const hash=(s:string)=>createHash('sha256').update(s).digest('hex')
const sealed=(p:unknown)=>{const payload=p;return JSON.stringify({
  payload,sha256:hash(JSON.stringify(payload)),
})}
const paths=(dir:string)=>({
  owner:join(dir,'owner.json'),dispatch:join(dir,'dispatch.json'),
  turns:join(dir,'budget.json'),
})
function fixture(dir:string,witness:A20OwnerWitness){
  const p=paths(dir)
  writeFileSync(p.owner,sealed({
    version:'v3-dev-a-owner/1',generationBySession:{old:1},
    owners:{old:{sessionId:'old',processEpoch:witness.processEpoch,
      caseId:witness.caseId,state:'active'}},tombstones:[],
  }))
  writeFileSync(p.dispatch,sealed({
    version:'v3-dev-a-sdk-dispatch/1',
    runs:{one:{records:[{id:'physical-one',caseId:witness.caseId,
      sessionId:'old',state:'in-flight'}]}},
  }))
  const fd=openSync(p.owner+'.write-lock','wx',0o600);closeSync(fd)
  return p
}
function deadChild():ReturnType<typeof observeA20LinuxProcess>{
  const script="const fs=require('node:fs');const raw=fs.readFileSync('/proc/self/stat','utf8');"+
    "process.stdout.write(JSON.stringify({pid:process.pid,bootId:"+
    "fs.readFileSync('/proc/sys/kernel/random/boot_id','utf8').trim(),"+
    "startTicks:raw.slice(raw.lastIndexOf(')')+2).trim().split(/\\s+/)[19]}))"
  const r=spawnSync(process.execPath,['-e',script],{encoding:'utf8',timeout:15000})
  if(r.status!==0)throw Error('Linux child identity: '+r.stderr)
  return JSON.parse(r.stdout) as NonNullable<ReturnType<typeof observeA20LinuxProcess>>
}
const linux=process.platform==='linux'?it:it.skip
describe('Dev-A R20-01 read-only Linux Owner recovery evidence',()=>{
  linux('R20-01A: dead real OS PID is only a review candidate, lock unchanged',()=>{
    const root=mkdtempSync(join(tmpdir(),'a-r20-01-'))
    try{
      const dead=deadChild()
      if(!dead)throw Error('child did not produce identity')
      const witness={...dead,sessionId:'old',processEpoch:'epoch-old',caseId:'case-old'}
      const p=fixture(root,witness)
      const before=readFileSync(p.owner,'utf8')
      const evidence=inspectA20OwnerRecovery(p,witness)
      expect(evidence).toMatchObject({
        verdict:'OPERATOR_REVIEW_REQUIRED',usedTurns:0,
        unresolvedDispatchId:'physical-one',ownerState:'active',
      })
      expect(assertA20RecoveryEvidenceFresh(p,evidence)).toEqual(evidence)
      expect(readFileSync(p.owner,'utf8')).toBe(before)
      expect(readFileSync(p.owner+'.write-lock')).toHaveLength(0)
      expect(evidence.evidenceHash).toHaveLength(64)
    }finally{rmSync(root,{recursive:true,force:true})}
  })
  linux('R20-01B: live owner and same-PID recycled start ticks both deny',()=>{
    const root=mkdtempSync(join(tmpdir(),'a-r20-01-'))
    try{
      const live=observeA20LinuxProcess(process.pid)!
      const w={...live,sessionId:'old',processEpoch:'epoch-live',caseId:'case-old'}
      const p=fixture(root,w)
      expect(inspectA20OwnerRecovery(p,w).verdict).toBe('DENY_OWNER_LIVE')
      expect(inspectA20OwnerRecovery(p,{...w,startTicks:String(BigInt(w.startTicks)+1n)})
        .verdict).toBe('DENY_PID_REUSED')
      expect(inspectA20OwnerRecovery(p,{...w,bootId:'00000000-0000-0000-0000-000000000000'})
        .verdict).toBe('DENY_BOOT_CHANGED')
    }finally{rmSync(root,{recursive:true,force:true})}
  })
  linux('R20-01C: stale epoch, mutated ledger, lock substitution fail closed',()=>{
    const root=mkdtempSync(join(tmpdir(),'a-r20-01-'))
    try{
      const w={...deadChild()!,sessionId:'old',
        processEpoch:'epoch-old',caseId:'case-old'}
      const p=fixture(root,w)
      const prior=inspectA20OwnerRecovery(p,w)
      expect(()=>inspectA20OwnerRecovery(p,{...w,processEpoch:'epoch-forged'}))
        .toThrow('Owner epoch/session/case')
      writeFileSync(p.dispatch,sealed({
        version:'v3-dev-a-sdk-dispatch/1',runs:{one:{records:[{
          id:'physical-tampered',caseId:'case-old',sessionId:'old',state:'in-flight',
        }]}}
      }))
      expect(()=>assertA20RecoveryEvidenceFresh(p,prior)).toThrow('changed during recovery')
      writeFileSync(p.dispatch,'{"tampered":true}')
      expect(()=>inspectA20OwnerRecovery(p,w)).toThrow('digest mismatch')
    }finally{rmSync(root,{recursive:true,force:true})}
  })
})
