/**
 * Dev-A R19-05: actual Pi 0.86.1 createAgentSession() normal completion,
 * durable counted turn and settled dispatch, independent actual recovery PID,
 * then a new real Pi SDK physical call with the SAME x-request-id, rejected
 * across different Main Run/Attempt/Owner. Fourth PID reopens the evidence.
 * Gate O only: intercepted .invalid HTTPS SSE, not a live Provider/Gate E.
 */
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,mkdtempSync,readFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe,expect,it} from 'bun:test'

const worker=fileURLToPath(new URL('./review-v3-native-pi-crosspid-r19.worker.ts',import.meta.url))
const digest=(s:string)=>createHash('sha256').update(s).digest('hex')
function disk(file:string):Record<string,unknown>{
  const json=JSON.parse(readFileSync(file,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  expect(json.sha256).toBe(digest(JSON.stringify(json.payload)))
  return json.payload
}
function pid(mode:string,root:string){
  const spawned=spawnSync(process.execPath,[worker,mode,root],{
    encoding:'utf8',timeout:25000,
  })
  expect(spawned.error).toBeUndefined()
  if(spawned.status!==0)throw Error('R19-05 '+mode+
    ' failed exit='+spawned.status+' signal='+spawned.signal+
    '\nstderr='+spawned.stderr+'\nstdout='+spawned.stdout)
  expect(spawned.signal).toBeNull()
  const prefix=mode==='complete'||mode==='replay-receipt'?'R19_NORMAL ':
    mode==='recover-complete'?'R19_COLD_COMPLETE ':'R19_COLD_DUPLICATE '
  const entry=spawned.stdout.split('\n').find(x=>x.startsWith(prefix))
  expect(entry).toBeDefined()
  const obj=JSON.parse(entry!.slice(prefix.length)) as {
    pid:number;mode?:string;processEpoch?:string;oldProcessEpoch?:string;
    runId?:string;attemptId?:string;dispatchId?:string;
    grantId?:string;receiptId?:string|null;oldReceiptId?:string;
    dispatchState?:string;oldDispatchState?:string;oldState?:string;
    nativeEvents?:string[];fetches?:number;resultKind?:string;denial?:string;
    usedTurns?:number;oldUsedTurns?:number;oldCapabilityDenied?:boolean;
    quarantined?:string[];unresolvedDuplicate?:boolean;
    rejectedRunUsedTurns?:number;settledReceipts?:number;pendingRecords?:number;
    proposalExists?:boolean;
  }
  expect(obj.pid).not.toBe(process.pid)
  return obj
}
const linuxIt=process.platform==='linux'?it:it.skip
const nativePhases=['turn_start','turn_end','agent_end','agent_settled']

describe('Dev-A R19-05 actual native Pi normal durable completion and cold receipt collision',()=>{
  linuxIt('R19-05A/B/C: physical native success -> new PID -> duplicate native x-request-id denied -> cold replay',()=>{
    const root=mkdtempSync(join(tmpdir(),'review-v3-a-r19-05-'))
    try{
      const complete=pid('complete',root)
      expect(complete).toMatchObject({
        mode:'complete',resultKind:'recorded',dispatchState:'settled',
        usedTurns:1,fetches:1,receiptId:'r19-provider-physical-001',
        proposalExists:false,denial:'',
      })
      expect(complete.nativeEvents).toEqual(nativePhases)
      const physical=JSON.parse(readFileSync(join(root,'physical-fetch-entered.json'),'utf8')) as {
        pid:number;processEpoch:string;dispatchId:string;
        grantId:string;url:string;fetchCalls:number;observation:string
      }
      expect(physical).toMatchObject({
        pid:complete.pid,dispatchId:complete.dispatchId,
        grantId:complete.grantId,processEpoch:complete.processEpoch,
        url:'https://provider.r19.invalid/v1/responses',
        fetchCalls:1,observation:'real Pi SDK transportFetch and SSE body pull',
      })
      const firstRecords=Object.values(disk(join(root,'dispatch.json')).runs as
        Record<string,{records:{id:string;state:string;receiptId?:string}[]}>)
        .flatMap(c=>c.records)
      expect(firstRecords).toHaveLength(1)
      expect(firstRecords[0]).toMatchObject({
        id:complete.dispatchId,state:'settled',
        receiptId:'r19-provider-physical-001',
      })
      expect(existsSync(join(root,'events.json'))).toBe(false)
      const cold=pid('recover-complete',root)
      expect(cold.pid).not.toBe(complete.pid)
      expect(cold).toMatchObject({
        oldState:'recovery-required',oldUsedTurns:1,oldCapabilityDenied:true,
        oldDispatchState:'settled',oldReceiptId:'r19-provider-physical-001',
        proposalExists:false,
      })
      expect(cold.oldProcessEpoch).toBe(complete.processEpoch)
      expect(cold.processEpoch).not.toBe(complete.processEpoch)
      expect(cold.quarantined).toEqual(['r19-old-session'])
      // This is another real new Pi SDK session and another physical fetch,
      // not replay of an in-memory receipt or a forged SDK message.
      const duplicate=pid('replay-receipt',root)
      expect(duplicate.pid).not.toBe(complete.pid)
      expect(duplicate.pid).not.toBe(cold.pid)
      expect(duplicate).toMatchObject({
        mode:'replay-receipt',dispatchState:'in-flight',
        usedTurns:0,oldUsedTurns:1,fetches:1,receiptId:null,
        proposalExists:false,resultKind:'',
      })
      expect(duplicate.nativeEvents).toEqual(nativePhases)
      expect(duplicate.denial).toContain(
        'One SDK receipt cannot attest two different Provider dispatches',
      )
      expect(duplicate.dispatchId).not.toBe(complete.dispatchId)
      const secondPhysical=JSON.parse(readFileSync(
        join(root,'replayed-physical-fetch-entered.json'),'utf8')) as {
          pid:number;dispatchId:string;fetchCalls:number;processEpoch:string;
        }
      expect(secondPhysical).toMatchObject({
        pid:duplicate.pid,dispatchId:duplicate.dispatchId,fetchCalls:1,
      })
      expect(secondPhysical.processEpoch).not.toBe(complete.processEpoch)
      const coldAgain=pid('recover-reused',root)
      expect(coldAgain.pid).not.toBe(complete.pid)
      expect(coldAgain.pid).not.toBe(cold.pid)
      expect(coldAgain.pid).not.toBe(duplicate.pid)
      expect(coldAgain).toMatchObject({
        oldUsedTurns:1,rejectedRunUsedTurns:0,unresolvedDuplicate:true,
        settledReceipts:1,pendingRecords:1,proposalExists:false,
      })
      expect(coldAgain.quarantined).toEqual(['r19-reused-session'])
      const records=Object.values(disk(join(root,'dispatch.json')).runs as
        Record<string,{records:{state:string;receiptId?:string}[]}>)
        .flatMap(c=>c.records)
      expect(records).toHaveLength(2)
      expect(records.filter(x=>x.state==='settled' &&
        x.receiptId==='r19-provider-physical-001')).toHaveLength(1)
      expect(records.filter(x=>x.state==='in-flight')).toHaveLength(1)
      const turnRuns=disk(join(root,'budget.json')).runs as
        Record<string,{usedTurns:number;receiptIds:string[]}>
      expect(Object.values(turnRuns).map(x=>x.usedTurns)).toEqual([1])
      expect(Object.values(turnRuns)[0]?.receiptIds).toEqual([
        'r19-provider-physical-001',
      ])
    }finally{rmSync(root,{recursive:true,force:true})}
  },90000)
})
