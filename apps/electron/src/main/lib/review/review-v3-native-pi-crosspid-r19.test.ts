/**
 * Dev-A R19-01/02: real Pi SDK 0.86.1 in a real Linux Bun child PID,
 * durable Main SDK claim, SIGKILL during SDK SSE consumption, then a new
 * independent PID reopens disk and verifies fail-closed Owner/Case isolation.
 * Fake HTTPS transport (no network or real credentials); Gate O, not Gate E.
 */
import {spawn,spawnSync,type ChildProcess} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,mkdtempSync,readFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {setTimeout as delay} from 'node:timers/promises'
import {describe,expect,it} from 'bun:test'

const worker=fileURLToPath(new URL('./review-v3-native-pi-crosspid-r19.worker.ts',import.meta.url))
const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
const sealed=(file:string)=>{
  const raw=readFileSync(file,'utf8')
  const data=JSON.parse(raw) as {payload:Record<string,unknown>;sha256:string}
  expect(sha(JSON.stringify(data.payload))).toBe(data.sha256)
  return {raw,payload:data.payload}
}
async function markerAfterRealFetch(file:string,child:ChildProcess){
  const deadline=Date.now()+25000
  while(Date.now()<deadline){
    if(existsSync(file)){
      const raw=readFileSync(file,'utf8')
      const data=JSON.parse(raw) as {
        pid:number;run:{caseId:string;runId:string;attemptId:string;
          ownerGeneration:number};sessionId:string;grantId:string;
        processEpoch:string;dispatchId:string;fetchCalls:number;url:string;
        dispatchSha256:string;ownerSha256:string;observation:string
      }
      if(!data.dispatchId || !data.pid)throw Error('R19 marker missing identities')
      return data
    }
    if(child.exitCode!==null || child.signalCode!==null){
      throw Error('R19 native Pi child exited before real SDK fetch entry')
    }
    await delay(25)
  }
  throw Error('R19 timed out before native SDK fetch + SSE pull handshake')
}
async function exited(child:ChildProcess):Promise<{code:number|null;signal:NodeJS.Signals|null}>{
  if(child.exitCode!==null || child.signalCode!==null){
    return {code:child.exitCode,signal:child.signalCode as NodeJS.Signals|null}
  }
  return new Promise((resolve,reject)=>{
    child.once('error',reject)
    child.once('close',(code,signal)=>resolve({code,signal}))
  })
}
const linuxIt=process.platform==='linux'?it:it.skip

describe('Dev-A A4-R19 real Pi 0.86.1 SDK x SIGKILL x new PID (offline Gate O)',()=>{
  linuxIt('R19-01/02: durable Pi fetch, OS SIGKILL, cold recovery, same Case block vs other Case',async()=>{
    const root=mkdtempSync(join(tmpdir(),'review-a-r19-native-crosspid-'))
    let child:ChildProcess|undefined
    try{
      child=spawn(process.execPath,[worker,'crash',root],{
        stdio:['ignore','pipe','pipe'],
      })
      let childStderr=''
      child.stderr?.on('data',(chunk:Buffer)=>{
        childStderr+=(chunk.toString()).slice(0,2000)
      })
      const marker=await markerAfterRealFetch(join(root,'physical-fetch-entered.json'),child)
      expect(marker.pid).toBe(child.pid)
      expect(marker.pid).not.toBe(process.pid)
      expect(marker.observation).toBe('real Pi SDK transportFetch and SSE body pull')
      expect(marker.url).toBe('https://provider.r19.invalid/v1/responses')
      expect(marker.fetchCalls).toBe(1)
      const owner=sealed(join(root,'owner.json'))
      const dispatch=sealed(join(root,'dispatch.json'))
      expect(sha(owner.raw)).toBe(marker.ownerSha256)
      expect(sha(dispatch.raw)).toBe(marker.dispatchSha256)
      const owners=owner.payload.owners as Record<string,{
        grantId:string;state:string;processEpoch:string;
        runEvidence:{runId:string;caseId:string;attemptId:string}
      }>
      const grant=owners[marker.sessionId]!
      expect(grant.grantId).toBe(marker.grantId)
      expect(grant.state).toBe('active')
      expect(grant.processEpoch).toBe(marker.processEpoch)
      expect(grant.runEvidence.caseId).toBe(marker.run.caseId)
      expect(grant.runEvidence.runId).toBe(marker.run.runId)
      const chains=Object.values(dispatch.payload.runs as Record<string,{
        runHash:string;records:{id:string;state:string;grantId:string;caseId:string}[]
      }>)
      expect(chains).toHaveLength(1)
      expect(chains[0]?.records).toHaveLength(1)
      expect(chains[0]?.records[0]).toMatchObject({
        id:marker.dispatchId,state:'in-flight',grantId:marker.grantId,
        caseId:marker.run.caseId,
      })
      // Exactly the actual child that crossed the native fetch boundary dies.
      expect(child.kill('SIGKILL')).toBe(true)
      const death=await exited(child)
      expect(death).toEqual({code:null,signal:'SIGKILL'})
      expect(existsSync(join(root,'events.json'))).toBe(false)
      expect(existsSync(join(root,'budget.json'))).toBe(false)
      const cold=spawnSync(process.execPath,[worker,'recover',root],{
        encoding:'utf8',timeout:20000,
      })
      expect(cold.error).toBeUndefined()
      if(cold.status!==0){
        throw Error('R19 fresh PID recovery failed: '+cold.stderr+
          '\nold-worker-stderr='+childStderr)
      }
      expect(cold.signal).toBeNull()
      const message=cold.stdout.split('\n').find(x=>x.startsWith('R19_RECOVERED '))
      expect(message).toBeDefined()
      const recovered=JSON.parse(message!.slice('R19_RECOVERED '.length)) as {
        pid:number;oldProcessEpoch:string;newProcessEpoch:string;
        quarantined:string[];oldState:string;unresolved:boolean;
        usedTurns:number;proposalExists:boolean;oldDenied:boolean;
        sameCaseBlocked:boolean;differentCaseClaim:string;
      }
      expect(recovered.pid).not.toBe(marker.pid)
      expect(recovered.pid).not.toBe(process.pid)
      expect(recovered.oldProcessEpoch).toBe(marker.processEpoch)
      expect(recovered.newProcessEpoch).not.toBe(marker.processEpoch)
      expect(recovered.quarantined).toContain(marker.sessionId)
      expect(recovered).toMatchObject({
        oldState:'recovery-required',unresolved:true,usedTurns:0,
        proposalExists:false,oldDenied:true,sameCaseBlocked:true,
      })
      expect(recovered.differentCaseClaim.length).toBeGreaterThan(0)
      const afterOwner=sealed(join(root,'owner.json'))
      const after=afterOwner.payload.owners as Record<string,{state:string}>
      expect(after[marker.sessionId]?.state).toBe('recovery-required')
      const afterDispatch=sealed(join(root,'dispatch.json'))
      const afterChains=Object.values(afterDispatch.payload.runs as Record<string,{
        records:{id:string;state:string}[]
      }>)
      expect(afterChains.some(c=>c.records.some(d=>
        d.id===marker.dispatchId && d.state==='in-flight'))).toBe(true)
    }finally{
      if(child && child.exitCode===null && child.signalCode===null){
        child.kill('SIGKILL')
        await exited(child).catch(()=>{})
      }
      rmSync(root,{recursive:true,force:true})
    }
  },60000)
})
