/**
 * Dev-A R19-08: real Pi 0.86.1 SDK success/clean SSE EOF, then true
 * Linux SIGKILL *inside the Turn Budget CAS* before/after durable write.
 * Independent cold PID must preserve unknown dispatch and refuse replay.
 * Orphan Owner lock removal below is TEST-ONLY operator simulation after
 * the spawned worker was reaped with a proven SIGKILL.
 */
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,mkdtempSync,readFileSync,rmSync,unlinkSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe,expect,it} from 'bun:test'

const worker=fileURLToPath(
  new URL('./review-v3-native-pi-crosspid-r19.worker.ts',import.meta.url),
)
const hash=(s:string)=>createHash('sha256').update(s).digest('hex')
function readSealed(file:string){
  const obj=JSON.parse(readFileSync(file,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  expect(obj.sha256).toBe(hash(JSON.stringify(obj.payload)))
  return obj
}
interface Witness {
  pid:number;mode:string;postcommit:boolean;ownerEpoch:string
  sessionId:string;runId:string;dispatchId:string
  nativeEvents:string[];fetches:number;injectedBudgetWrites:number
  usedTurns:number;budgetBeforeExists:boolean;budgetAfterExists:boolean
  budgetProposedSha256:string;budgetAfterSha256:string|null
  dispatchSha256:string;ownerSha256:string;providerReceiptId:string
}
interface Reopen {
  pid:number;postcommit:boolean;processEpoch:string;oldProcessEpoch:string
  quarantined:string[];oldUsedTurns:number;newUsedTurns:number
  unresolved:boolean;claimBlocked:boolean;oldReceiptDenied:boolean
  otherDispatchId:string;oldDispatchState:string;proposalExists:boolean
}
interface PhysicalMarker {
  pid:number;runId?:string;processEpoch:string;dispatchId:string
  fetchCalls:number;observation:string
}
function invoke(mode:string,root:string){
  return spawnSync(process.execPath,[worker,mode,root],{
    encoding:'utf8',timeout:30000,
  })
}
function cold(result:ReturnType<typeof invoke>):Reopen{
  expect(result.error).toBeUndefined()
  if(result.status!==0)throw Error('R19-08 cold PID failed: '+
    JSON.stringify({status:result.status,signal:result.signal,
      stdout:result.stdout,stderr:result.stderr}))
  const line=result.stdout.split('\n')
    .find(x=>x.startsWith('R19_BUDGET_RECOVERY '))
  expect(line).toBeDefined()
  return JSON.parse(line!.slice('R19_BUDGET_RECOVERY '.length)) as Reopen
}
const linuxIt=process.platform==='linux'?it:it.skip
describe('Dev-A R19-08 true SIGKILL inside native completed Turn Budget CAS',()=>{
  for(const postcommit of [false,true]){
    const mode=postcommit?'budget-postcommit-sigkill':'budget-precommit-sigkill'
    const recover=postcommit?'recover-budget-postcommit':'recover-budget-precommit'
    linuxIt('R19-08'+(postcommit?'B':'A')+
      ': real SDK success, CAS SIGKILL and independent fail-closed cold PID',()=>{
      const root=mkdtempSync(join(tmpdir(),'review-v3-r19-08-'))
      try{
        const killed=invoke(mode,root)
        expect(killed.error).toBeUndefined()
        if(killed.signal!=='SIGKILL' || killed.status!==null){
          throw Error('R19-08 native Turn CAS kill point was not reached: '+
            JSON.stringify({status:killed.status,signal:killed.signal,
              stdout:killed.stdout,stderr:killed.stderr}))
        }
        const proof=JSON.parse(readFileSync(
          join(root,'budget-kill-witness.json'),'utf8')) as Witness
        const transport=JSON.parse(readFileSync(
          join(root,'physical-fetch-entered.json'),'utf8')) as PhysicalMarker
        expect(proof.pid).not.toBe(process.pid)
        expect(proof).toMatchObject({
          mode,postcommit,sessionId:'r19-old-session',
          runId:'r19-case-run',usedTurns:postcommit?1:0,
          budgetBeforeExists:false,budgetAfterExists:postcommit,
          fetches:1,injectedBudgetWrites:1,
          providerReceiptId:'r19-provider-physical-001',
        })
        expect(proof.nativeEvents).toEqual([
          'turn_start','turn_end','agent_end','agent_settled',
        ])
        expect(transport).toMatchObject({
          pid:proof.pid,processEpoch:proof.ownerEpoch,
          dispatchId:proof.dispatchId,fetchCalls:1,
          observation:'real Pi SDK transportFetch and SSE body pull',
        })
        expect(proof.dispatchId.length).toBeGreaterThan(0)
        expect(existsSync(join(root,'events.json'))).toBe(false)
        const ownerFile=join(root,'owner.json')
        const dispatchFile=join(root,'dispatch.json')
        const budgetFile=join(root,'budget.json')
        expect(readSealed(ownerFile).sha256).toBe(proof.ownerSha256)
        const durableDispatch=readSealed(dispatchFile)
        expect(durableDispatch.sha256).toBe(proof.dispatchSha256)
        const oldRecords=Object.values(durableDispatch.payload.runs as Record<
          string,{records:{id:string;state:string;receiptId?:string}[]}
        >).flatMap(x=>x.records)
        expect(oldRecords).toHaveLength(1)
        expect(oldRecords[0]).toMatchObject({
          id:proof.dispatchId,state:'in-flight',
        })
        expect(oldRecords[0]?.receiptId).toBeUndefined()
        expect(existsSync(budgetFile)).toBe(postcommit)
        if(postcommit){
          const budget=readSealed(budgetFile)
          expect(budget.sha256).toBe(proof.budgetProposedSha256)
          expect(budget.sha256).toBe(proof.budgetAfterSha256)
          const turns=Object.values(budget.payload.runs as Record<
            string,{usedTurns:number;receiptIds:string[]}
          >)
          expect(turns).toHaveLength(1)
          expect(turns[0]).toMatchObject({
            usedTurns:1,receiptIds:['r19-provider-physical-001'],
          })
        }else{
          expect(proof.budgetAfterSha256).toBeNull()
        }
        // The SIGKILL interrupted the Owner event fence; a cold PID
        // must NOT silently claim the lock, even if its old PID exited.
        const lock=ownerFile+'.write-lock'
        expect(existsSync(lock)).toBe(true)
        const frozenOwner=readFileSync(ownerFile,'utf8')
        const frozenDispatch=readFileSync(dispatchFile,'utf8')
        const frozenBudget=existsSync(budgetFile)?
          readFileSync(budgetFile,'utf8'):null
        const denied=invoke(recover,root)
        expect(denied.error).toBeUndefined()
        expect(denied.status).not.toBe(0)
        expect(denied.stderr).toContain(
          'Owner journal inter-process lock unavailable; recovery required',
        )
        expect(readFileSync(ownerFile,'utf8')).toBe(frozenOwner)
        expect(readFileSync(dispatchFile,'utf8')).toBe(frozenDispatch)
        expect(existsSync(budgetFile)).toBe(postcommit)
        if(frozenBudget!==null){
          expect(readFileSync(budgetFile,'utf8')).toBe(frozenBudget)
        }
        // Only the test fixture may model an independently verified
        // operator action AFTER spawnSync reaped SIGKILL, never runtime.
        unlinkSync(lock)
        const reopened=cold(invoke(recover,root))
        expect(reopened.pid).not.toBe(proof.pid)
        expect(reopened.oldProcessEpoch).toBe(proof.ownerEpoch)
        expect(reopened.processEpoch).not.toBe(proof.ownerEpoch)
        expect(reopened).toMatchObject({
          postcommit,quarantined:['r19-old-session'],
          oldUsedTurns:postcommit?1:0,newUsedTurns:0,
          unresolved:true,claimBlocked:true,oldReceiptDenied:true,
          oldDispatchState:'in-flight',proposalExists:false,
        })
        expect(reopened.otherDispatchId.length).toBeGreaterThan(0)
        const lastDispatch=readSealed(dispatchFile)
        const all=Object.values(lastDispatch.payload.runs as Record<
          string,{records:{id:string;state:string;receiptId?:string}[]}
        >).flatMap(x=>x.records)
        expect(all).toHaveLength(2)
        expect(all.find(x=>x.id===proof.dispatchId)?.state).toBe('in-flight')
        expect(all.every(x=>x.state==='in-flight' &&
          x.receiptId===undefined)).toBe(true)
        expect(existsSync(budgetFile)).toBe(postcommit)
        expect(existsSync(join(root,'replayed-physical-fetch-entered.json')))
          .toBe(false)
        expect(existsSync(join(root,'events.json'))).toBe(false)
      }finally{rmSync(root,{recursive:true,force:true})}
    },90000)
  }
})
