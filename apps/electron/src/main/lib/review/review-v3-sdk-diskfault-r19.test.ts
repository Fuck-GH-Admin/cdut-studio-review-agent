/**
 * Dev-A R19-04: durable real-filesystem CAS + injected postcommit EIO or
 * precommit ENOSPC, followed by an independent actual OS PID and new Main
 * Owner instance. No live Provider/OS-generated disk failure claim.
 * SDK callback is synthetic and is explicitly required to remain uncalled.
 */
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,mkdtempSync,readFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe,expect,it} from 'bun:test'

const worker=fileURLToPath(
  new URL('./review-v3-native-pi-crosspid-r19.worker.ts',import.meta.url),
)
const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
function journal(file:string){
  const object=JSON.parse(readFileSync(file,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  expect(object.sha256).toBe(sha(JSON.stringify(object.payload)))
  return object.payload
}
function subprocess(mode:string,root:string){
  const child=spawnSync(process.execPath,[worker,mode,root],{
    encoding:'utf8',timeout:20000,
  })
  expect(child.error).toBeUndefined()
  if(child.status!==0){
    throw Error('R19 fault PID '+mode+' failed: '+child.stderr+
      '\nstdout='+child.stdout)
  }
  expect(child.signal).toBeNull()
  const label=mode.startsWith('reopen')?'R19_FAULT_RECOVERY ':'R19_DISK_FAULT '
  const line=child.stdout.split('\n').find(l=>l.startsWith(label))
  expect(line).toBeDefined()
  const proof=JSON.parse(line!.slice(label.length)) as {
    pid:number;kind:'POSTCOMMIT_EIO'|'PRECOMMIT_ENOSPC'
    caught?:string;attempted?:number;enteredSDK?:number;committed?:boolean
    wasUnresolved?:boolean;blocked?:boolean;originalState?:string|null
    newDispatchId?:string;oldState?:string;quarantined?:string[]
    oldProcessEpoch?:string;newProcessEpoch?:string;usedTurns?:number
  }
  expect(proof.pid).not.toBe(process.pid)
  return proof
}
const linuxIt=process.platform==='linux'?it:it.skip

describe('Dev-A R19-04 real file CAS + injected disk fault + independent recovery PID',()=>{
  linuxIt('R19-04A: postcommit EIO unknown intent survives PID restart and blocks new Run',()=>{
    const root=mkdtempSync(join(tmpdir(),'review-a-r19-eio-'))
    try{
      const first=subprocess('postcommit-eio',root)
      expect(first).toMatchObject({
        kind:'POSTCOMMIT_EIO',attempted:1,enteredSDK:0,committed:true,
      })
      expect(first.caught).toContain('EIO after durable intent commit')
      const old=journal(join(root,'dispatch.json'))
      const records=Object.values(old.runs as Record<string,{
        records:{state:string;caseId:string}[]
      }>).flatMap(x=>x.records)
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({
        state:'in-flight',caseId:'r19-fault-case',
      })
      expect(existsSync(join(root,'budget.json'))).toBe(false)
      expect(existsSync(join(root,'events.json'))).toBe(false)
      const recovery=subprocess('reopen-postcommit',root)
      expect(recovery.pid).not.toBe(first.pid)
      expect(recovery).toMatchObject({
        kind:'POSTCOMMIT_EIO',oldState:'recovery-required',
        wasUnresolved:true,blocked:true,usedTurns:0,
        originalState:'in-flight',
      })
      expect(recovery.oldProcessEpoch).not.toBe(recovery.newProcessEpoch)
      expect(recovery.quarantined).toContain('fault-original')
      const persisted=journal(join(root,'dispatch.json'))
      const chains=Object.values(persisted.runs as Record<string,{
        records:{state:string}[]
      }>).flatMap(x=>x.records)
      expect(chains).toHaveLength(1)
      expect(chains[0]?.state).toBe('in-flight')
    }finally{rmSync(root,{recursive:true,force:true})}
  },45000)
  linuxIt('R19-04B: precommit ENOSPC with zero SDK entry permits only fresh authorized new-PID claim',()=>{
    const root=mkdtempSync(join(tmpdir(),'review-a-r19-enospc-'))
    try{
      const first=subprocess('precommit-enospc',root)
      expect(first).toMatchObject({
        kind:'PRECOMMIT_ENOSPC',attempted:1,enteredSDK:0,committed:false,
      })
      expect(first.caught).toContain('ENOSPC before durable intent')
      expect(existsSync(join(root,'dispatch.json'))).toBe(false)
      expect(existsSync(join(root,'budget.json'))).toBe(false)
      expect(existsSync(join(root,'events.json'))).toBe(false)
      const recovery=subprocess('reopen-precommit',root)
      expect(recovery.pid).not.toBe(first.pid)
      expect(recovery).toMatchObject({
        kind:'PRECOMMIT_ENOSPC',oldState:'recovery-required',
        wasUnresolved:false,blocked:false,usedTurns:0,
      })
      expect(recovery.newDispatchId?.length).toBeGreaterThan(0)
      expect(recovery.quarantined).toContain('fault-original')
      const persisted=journal(join(root,'dispatch.json'))
      const records=Object.values(persisted.runs as Record<string,{
        records:{state:string;caseId:string}[]
      }>).flatMap(x=>x.records)
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({
        caseId:'r19-fault-case',state:'in-flight',
      })
    }finally{rmSync(root,{recursive:true,force:true})}
  },45000)
})
