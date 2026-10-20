/**
 * R19-03: real native Pi SDK in a still-alive old PID settles AFTER a new
 * process quarantines the Main Owner. A clean SSE / settled SDK result cannot
 * resurrect revoked authority or mint a durable turn / proposal.
 * Offline injected HTTPS Response only; NOT Provider/Electron Gate E.
 */
import {spawn,spawnSync,type ChildProcess} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {setTimeout as delay} from 'node:timers/promises'
import {describe,expect,it} from 'bun:test'

const worker=fileURLToPath(new URL('./review-v3-native-pi-crosspid-r19.worker.ts',import.meta.url))
const hash=(s:string)=>createHash('sha256').update(s).digest('hex')
function ledger(file:string):Record<string,unknown>{
  const raw=JSON.parse(readFileSync(file,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  expect(raw.sha256).toBe(hash(JSON.stringify(raw.payload)))
  return raw.payload
}
async function marker(file:string,child:ChildProcess){
  const limit=Date.now()+25000
  while(Date.now()<limit){
    if(existsSync(file)){
      const data=JSON.parse(readFileSync(file,'utf8')) as {
        pid:number;processEpoch:string;dispatchId:string;fetchCalls:number
      }
      if(data.pid!==child.pid || !data.dispatchId || data.fetchCalls!==1){
        throw Error('R19 live SDK fetch did not match actual worker PID')
      }
      return data
    }
    if(child.exitCode!==null || child.signalCode!==null){
      throw Error('R19 native SDK exited before live cross-PID revoke')
    }
    await delay(25)
  }
  throw Error('R19 native SDK never entered controlled fetch')
}
const linuxIt=process.platform==='linux'?it:it.skip

describe('Dev-A R19 native Pi settled result after new PID quarantines live old Owner',()=>{
  linuxIt('R19-03: normal native Pi SDK settled is late-denied after cold Owner quarantine',async()=>{
    const root=mkdtempSync(join(tmpdir(),'review-a-r19-late-'))
    let child:ChildProcess|undefined
    let closed:Promise<{code:number|null;signal:NodeJS.Signals|null}>|undefined
    try{
      child=spawn(process.execPath,[worker,'late',root],{
        stdio:['ignore','pipe','pipe'],
      })
      closed=new Promise((resolve,reject)=>{
        child!.once('error',reject)
        child!.once('close',(code,signal)=>resolve({code,signal}))
      })
      let output='',errors=''
      child.stdout?.on('data',(data:Buffer)=>{output+=data.toString()})
      child.stderr?.on('data',(data:Buffer)=>{errors+=data.toString()})
      const started=await marker(join(root,'physical-fetch-entered.json'),child)
      expect(child.exitCode).toBeNull()
      expect(child.signalCode).toBeNull()
      const before=Object.values(ledger(join(root,'dispatch.json')).runs as
        Record<string,{records:{id:string;state:string}[]}>).flatMap(c=>c.records)
      expect(before).toHaveLength(1)
      expect(before[0]).toMatchObject({
        id:started.dispatchId,state:'in-flight',
      })
      // A second *actual* Bun PID changes Owner disk while the real native
      // Pi fetch is still blocked, not a synthetic after-await race.
      const cold=spawnSync(process.execPath,[worker,'quarantine',root],{
        encoding:'utf8',timeout:20000,
      })
      if(cold.status!==0)throw Error('R19 new PID quarantine: '+cold.stderr)
      const receipt=cold.stdout.split('\n').find(x=>x.startsWith('R19_QUARANTINED '))
      expect(receipt).toBeDefined()
      const quarantine=JSON.parse(receipt!.slice('R19_QUARANTINED '.length)) as {
        pid:number;oldProcessEpoch:string;newProcessEpoch:string;quarantined:string[]
      }
      expect(quarantine.pid).not.toBe(started.pid)
      expect(quarantine.oldProcessEpoch).toBe(started.processEpoch)
      expect(quarantine.newProcessEpoch).not.toBe(started.processEpoch)
      expect(quarantine.quarantined).toContain('r19-old-session')
      expect(child.exitCode).toBeNull()
      // Main releases a real SDK response after the Owner is already
      // quarantined on disk. Native Pi consumes terminal SSE + clean EOF.
      writeFileSync(join(root,'release-native-sdk'),'after Owner quarantine')
      const exit=await closed
      if(exit.code!==0){
        throw Error('R19 still-alive Pi worker failed: '+errors+'\nstdout='+output)
      }
      expect(exit.signal).toBeNull()
      const line=output.split('\n').find(x=>x.startsWith('R19_LATE_DENIED '))
      expect(line).toBeDefined()
      const late=JSON.parse(line!.slice('R19_LATE_DENIED '.length)) as {
        pid:number;nativeEvents:string[];denial:string;dispatchState:string;
        usedTurns:number;proposalExists:boolean;fetchCalls:number
      }
      expect(late.pid).toBe(started.pid)
      expect(late.nativeEvents).toEqual([
        'turn_start','turn_end','agent_end','agent_settled',
      ])
      expect(late.denial).toContain('Owner journal changed outside this process')
      expect(late).toMatchObject({
        dispatchState:'late-denied',usedTurns:0,proposalExists:false,fetchCalls:1,
      })
      const after=Object.values(ledger(join(root,'dispatch.json')).runs as
        Record<string,{records:{id:string;state:string}[]}>).flatMap(c=>c.records)
      expect(after.at(-1)).toMatchObject({
        id:started.dispatchId,state:'late-denied',
      })
      expect(existsSync(join(root,'budget.json'))).toBe(false)
      expect(existsSync(join(root,'events.json'))).toBe(false)
      const owners=ledger(join(root,'owner.json')).owners as Record<string,{state:string}>
      expect(owners['r19-old-session']?.state).toBe('recovery-required')
    }finally{
      if(child && child.exitCode===null && child.signalCode===null){
        child.kill('SIGKILL')
        await closed?.catch(()=>{})
      }
      rmSync(root,{recursive:true,force:true})
    }
  },60000)
})
