/**
 * Dev-A R19-06: REAL native Pi 0.86.1 successful SDK response has already
 * committed Turn=1. Dispatch settlement fails before or after filesystem CAS.
 * Independent OS PIDs must preserve exact physical ambiguity and receipt
 * uniqueness. Disk errors are injected in an actual disk-backed CAS wrapper;
 * this is NOT a hardware EIO/ENOSPC or live Provider/Electron Gate E.
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
function persisted(file:string){
  const raw=JSON.parse(readFileSync(file,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  expect(raw.sha256).toBe(digest(JSON.stringify(raw.payload)))
  return raw.payload
}
type SettlementProof={
  pid:number;mode?:string;processEpoch?:string;oldProcessEpoch?:string;
  injectedSettlementWrites?:number;nativeEvents?:string[];fetches?:number;
  usedTurns?:number;oldUsedTurns?:number;newUsedTurns?:number;
  dispatchState?:string;receiptId?:string|null;resultKind?:string;
  denial?:string;proposalExists?:boolean;postcommit?:boolean;
  unresolved?:boolean;claimBlocked?:boolean;newDispatchId?:string;
  duplicateReceiptBlocked?:boolean;settledRecords?:number;
  inFlightRecords?:number;quarantined?:string[];
}
function child(mode:string,root:string):SettlementProof{
  const x=spawnSync(process.execPath,[worker,mode,root],{
    encoding:'utf8',timeout:25000,
  })
  expect(x.error).toBeUndefined()
  if(x.status!==0)throw Error('R19-06 child '+mode+
    ' exit='+x.status+', signal='+x.signal+
    '\nSTDOUT='+x.stdout+'\nSTDERR='+x.stderr)
  expect(x.signal).toBeNull()
  const label=mode.startsWith('recover-')
    ?'R19_SETTLEMENT_RECOVERY ':'R19_SETTLEMENT_FAULT '
  const found=x.stdout.split('\n').find(x=>x.startsWith(label))
  expect(found).toBeDefined()
  const parsed=JSON.parse(found!.slice(label.length)) as SettlementProof
  expect(parsed.pid).not.toBe(process.pid)
  return parsed
}
const linuxIt=process.platform==='linux'?it:it.skip
const native=['turn_start','turn_end','agent_end','agent_settled']
describe('Dev-A R19-06 native Pi post-turn disk settle faults across actual PIDs',()=>{
  linuxIt('R19-06A: Turn=1, precommit ENOSPC, unresolved old claim denies new Run',()=>{
    const root=mkdtempSync(join(tmpdir(),'review-a-r19-06-pre-'))
    try{
      const first=child('settle-precommit-enospc',root)
      expect(first).toMatchObject({
        mode:'settle-precommit-enospc',injectedSettlementWrites:1,
        usedTurns:1,dispatchState:'in-flight',receiptId:null,
        fetches:1,proposalExists:false,resultKind:'',
      })
      expect(first.nativeEvents).toEqual(native)
      expect(first.denial).toContain('R19-06 ENOSPC before durable SDK settlement')
      const second=child('recover-settle-precommit',root)
      expect(second.pid).not.toBe(first.pid)
      expect(second.oldProcessEpoch).toBe(first.processEpoch)
      expect(second.processEpoch).not.toBe(first.processEpoch)
      expect(second.quarantined).toEqual(['r19-old-session'])
      expect(second).toMatchObject({
        postcommit:false,oldUsedTurns:1,newUsedTurns:0,
        unresolved:true,claimBlocked:true,newDispatchId:'',
        duplicateReceiptBlocked:false,settledRecords:0,inFlightRecords:1,
        proposalExists:false,
      })
      expect(existsSync(join(root,'events.json'))).toBe(false)
      const records=Object.values(persisted(join(root,'dispatch.json')).runs as
        Record<string,{records:{state:string;receiptId?:string}[]}>)
        .flatMap(x=>x.records)
      expect(records).toHaveLength(1)
      expect(records[0]?.state).toBe('in-flight')
      expect(records[0]?.receiptId).toBeUndefined()
      const turns=Object.values(persisted(join(root,'budget.json')).runs as
        Record<string,{usedTurns:number;receiptIds:string[]}>)
      expect(turns.map(x=>x.usedTurns)).toEqual([1])
      expect(turns[0]?.receiptIds).toEqual(['r19-provider-physical-001'])
    }finally{rmSync(root,{recursive:true,force:true})}
  },60000)
  linuxIt('R19-06B: Turn=1, postcommit EIO, settled persists and duplicate receipt denied',()=>{
    const root=mkdtempSync(join(tmpdir(),'review-a-r19-06-post-'))
    try{
      const first=child('settle-postcommit-eio',root)
      expect(first).toMatchObject({
        mode:'settle-postcommit-eio',injectedSettlementWrites:1,
        usedTurns:1,dispatchState:'settled',
        receiptId:'r19-provider-physical-001',fetches:1,
        proposalExists:false,resultKind:'',
      })
      expect(first.nativeEvents).toEqual(native)
      expect(first.denial).toContain('R19-06 EIO after durable SDK settlement')
      const second=child('recover-settle-postcommit',root)
      expect(second.pid).not.toBe(first.pid)
      expect(second.oldProcessEpoch).toBe(first.processEpoch)
      expect(second.processEpoch).not.toBe(first.processEpoch)
      expect(second.quarantined).toEqual(['r19-old-session'])
      expect(second).toMatchObject({
        postcommit:true,oldUsedTurns:1,newUsedTurns:0,
        unresolved:false,claimBlocked:false,
        duplicateReceiptBlocked:true,settledRecords:1,inFlightRecords:0,
        proposalExists:false,
      })
      expect(second.newDispatchId?.length).toBeGreaterThan(0)
      const records=Object.values(persisted(join(root,'dispatch.json')).runs as
        Record<string,{records:{state:string;receiptId?:string}[]}>)
        .flatMap(x=>x.records)
      expect(records).toHaveLength(2)
      expect(records.filter(x=>x.state==='settled' &&
        x.receiptId==='r19-provider-physical-001')).toHaveLength(1)
      expect(records.filter(x=>x.state==='in-flight')).toHaveLength(1)
      expect(existsSync(join(root,'events.json'))).toBe(false)
      const turns=Object.values(persisted(join(root,'budget.json')).runs as
        Record<string,{usedTurns:number;receiptIds:string[]}>)
      expect(turns.map(x=>x.usedTurns)).toEqual([1])
      expect(turns[0]?.receiptIds).toEqual(['r19-provider-physical-001'])
    }finally{rmSync(root,{recursive:true,force:true})}
  },60000)
})
