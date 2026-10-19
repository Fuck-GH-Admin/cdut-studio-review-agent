/**
 * A4-R19-07: real Pi 0.86.1 SDK turn -> real durable Turn=1 -> true
 * OS SIGKILL inside dispatch settlement CAS, before vs after durable rename.
 *
 * Actual OS kill may leave the Owner .write-lock. Production must FAIL CLOSED;
 * this offline test explicitly verifies that block, and ONLY AFTER the killed
 * child has been waited on, test fixture removes the orphaned lock to model
 * independent operator reconciliation. Do NOT copy that unlink into runtime.
 * The HTTPS/SSE Provider is offline controlled .invalid, never live Gate E.
 */
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {
  existsSync,mkdtempSync,readFileSync,rmSync,unlinkSync,
} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe,expect,it} from 'bun:test'

const worker=fileURLToPath(
  new URL('./review-v3-native-pi-crosspid-r19.worker.ts',import.meta.url),
)
const digest=(s:string)=>createHash('sha256').update(s).digest('hex')
function ledger(file:string):Record<string,unknown>{
  const obj=JSON.parse(readFileSync(file,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  expect(obj.sha256).toBe(digest(JSON.stringify(obj.payload)))
  return obj.payload
}
type Witness={
  pid:number;mode:string;postcommit:boolean;ownerEpoch:string
  sessionId:string;runId:string;dispatchId:string;nativeEvents:string[]
  fetches:number;injectedSettlementWrites:number;turnUsed:number
  turnReceipts:string[];dispatchBefore:string;dispatchAfter:string
  dispatchAfterReceipt:string|null;turnSha256:string
  dispatchBeforeSha256:string;dispatchAfterSha256:string
}
type Reopen={
  pid:number;postcommit:boolean;processEpoch:string;oldProcessEpoch:string
  quarantined:string[];oldUsedTurns:number;newUsedTurns:number
  unresolved:boolean;claimBlocked:boolean;newDispatchId:string
  duplicateReceiptBlocked:boolean;settledRecords:number
  inFlightRecords:number;proposalExists:boolean
}
function invoke(mode:string,root:string){
  return spawnSync(process.execPath,[worker,mode,root],{
    encoding:'utf8',timeout:30000,
  })
}
function reopened(result:ReturnType<typeof invoke>):Reopen{
  expect(result.error).toBeUndefined()
  if(result.status!==0)throw Error('R19-07 cold recovery: '+
    JSON.stringify({signal:result.signal,status:result.status,
      stdout:result.stdout,stderr:result.stderr}))
  const line=result.stdout.split('\n')
    .find(x=>x.startsWith('R19_SETTLEMENT_RECOVERY '))
  expect(line).toBeDefined()
  const proof=JSON.parse(
    line!.slice('R19_SETTLEMENT_RECOVERY '.length),
  ) as Reopen
  expect(proof.pid).not.toBe(process.pid)
  return proof
}
const linuxIt=process.platform==='linux'?it:it.skip
describe('Dev-A R19-07 true SIGKILL native Pi turn at SDK settlement boundary',()=>{
  for(const postcommit of [false,true]){
    const mode=postcommit?'settle-postcommit-sigkill':'settle-precommit-sigkill'
    const recover=postcommit?'recover-settle-postcommit':'recover-settle-precommit'
    linuxIt('R19-07'+(postcommit?'B':'A')+
      ': real native SDK, turn committed, SIGKILL, orphan-lock denial and explicit cold recovery',()=>{
      const root=mkdtempSync(join(tmpdir(),'review-v3-r19-07-'))
      try{
        const killed=invoke(mode,root)
        expect(killed.error).toBeUndefined()
        if(killed.signal!=='SIGKILL' || killed.status!==null){
          throw Error('R19-07 kill point was not reached: '+JSON.stringify({
            status:killed.status,signal:killed.signal,stderr:killed.stderr,
            stdout:killed.stdout,
          }))
        }
        const witnessPath=join(root,'settlement-kill-witness.json')
        expect(existsSync(witnessPath)).toBe(true)
        const proof=JSON.parse(readFileSync(witnessPath,'utf8')) as Witness
        expect(proof.pid).not.toBe(process.pid)
        expect(proof).toMatchObject({
          mode,postcommit,sessionId:'r19-old-session',
          runId:'r19-case-run',turnUsed:1,
          turnReceipts:['r19-provider-physical-001'],
          dispatchBefore:'in-flight',
          dispatchAfter:postcommit?'settled':'in-flight',
          dispatchAfterReceipt:postcommit?'r19-provider-physical-001':null,
          injectedSettlementWrites:1,fetches:1,
        })
        expect(proof.nativeEvents).toEqual([
          'turn_start','turn_end','agent_end','agent_settled',
        ])
        expect(proof.dispatchId.length).toBeGreaterThan(0)
        expect(existsSync(join(root,'physical-fetch-entered.json'))).toBe(true)
        expect(existsSync(join(root,'events.json'))).toBe(false)
        const turns=Object.values(ledger(join(root,'budget.json')).runs as
          Record<string,{usedTurns:number;receiptIds:string[]}>)
        expect(turns).toHaveLength(1)
        expect(turns[0]).toMatchObject({
          usedTurns:1,receiptIds:['r19-provider-physical-001'],
        })
        const records=Object.values(ledger(join(root,'dispatch.json')).runs as
          Record<string,{records:{id:string;state:string;receiptId?:string}[]}>)
          .flatMap(c=>c.records)
        expect(records).toHaveLength(1)
        expect(records[0]).toMatchObject({
          id:proof.dispatchId,state:postcommit?'settled':'in-flight',
        })
        if(postcommit){
          expect(records[0]?.receiptId).toBe('r19-provider-physical-001')
        }else expect(records[0]?.receiptId).toBeUndefined()
        expect(proof.turnSha256).toBe(
          (JSON.parse(readFileSync(join(root,'budget.json'),'utf8')) as {
            sha256:string
          }).sha256,
        )
        expect(proof.dispatchAfterSha256).toBe(
          (JSON.parse(readFileSync(join(root,'dispatch.json'),'utf8')) as {
            sha256:string
          }).sha256,
        )
        // SIGKILL happened WITHIN Owner.withAuthorizedEvent's actual file
        // lock. Production cannot declare it abandoned just by age or PID.
        const ownerLock=join(root,'owner.json.write-lock')
        expect(existsSync(ownerLock)).toBe(true)
        const frozenOwner=readFileSync(join(root,'owner.json'),'utf8')
        const frozenDispatch=readFileSync(join(root,'dispatch.json'),'utf8')
        const failedCold=invoke(recover,root)
        expect(failedCold.error).toBeUndefined()
        expect(failedCold.status).not.toBe(0)
        expect(failedCold.stderr).toContain(
          'Owner journal inter-process lock unavailable; recovery required',
        )
        expect(readFileSync(join(root,'owner.json'),'utf8')).toBe(frozenOwner)
        expect(readFileSync(join(root,'dispatch.json'),'utf8')).toBe(frozenDispatch)
        // TEST-ONLY, after spawnSync SIGKILL wait + failed cold process exit;
        // production has NO permission to auto-unlink possibly live locks.
        unlinkSync(ownerLock)
        const cold=reopened(invoke(recover,root))
        expect(cold.pid).not.toBe(proof.pid)
        expect(cold.oldProcessEpoch).toBe(proof.ownerEpoch)
        expect(cold.processEpoch).not.toBe(proof.ownerEpoch)
        expect(cold.quarantined).toEqual(['r19-old-session'])
        expect(cold).toMatchObject({
          postcommit,oldUsedTurns:1,newUsedTurns:0,
          unresolved:!postcommit,claimBlocked:!postcommit,
          duplicateReceiptBlocked:postcommit,
          settledRecords:postcommit?1:0,
          inFlightRecords:postcommit?0:1,
          proposalExists:false,
        })
        if(postcommit)expect(cold.newDispatchId.length).toBeGreaterThan(0)
        else expect(cold.newDispatchId).toBe('')
        const final=Object.values(ledger(join(root,'dispatch.json')).runs as
          Record<string,{records:{state:string;receiptId?:string}[]}>)
          .flatMap(c=>c.records)
        expect(final).toHaveLength(postcommit?2:1)
        expect(final.filter(x=>x.state==='settled' &&
          x.receiptId==='r19-provider-physical-001')).toHaveLength(postcommit?1:0)
        expect(final.filter(x=>x.state==='in-flight')).toHaveLength(1)
      }finally{rmSync(root,{recursive:true,force:true})}
    },90000)
  }
})
