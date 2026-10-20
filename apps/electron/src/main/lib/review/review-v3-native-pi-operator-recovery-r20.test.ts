/**
 * R20-03 A-only Gate O: real native Pi 0.86.1 + real OS SIGKILL
 * inside Turn Budget CAS, C-independent operator-review-only technical
 * evidence, then real cold native Pi SDK on DIFFERENT Case.
 * No production Owner lock takeover, Provider replay or C physical ACK.
 */
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync,mkdtempSync,readFileSync,rmSync,unlinkSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {describe,expect,it} from 'bun:test'
import {inspectA20OwnerRecovery,assertA20RecoveryEvidenceFresh,
  type A20OwnerWitness} from './review-v3-owner-recovery-evidence'
import {recordA20RecoveryIntent,readA20RecoveryIntent}
  from './review-v3-owner-reconciliation-intent'

const worker=fileURLToPath(new URL('./review-v3-native-pi-crosspid-r19.worker.ts',import.meta.url))
const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
const run=(mode:string,root:string)=>spawnSync(process.execPath,[worker,mode,root],{
  encoding:'utf8',timeout:30000,
})
function sealed(file:string){
  const value=JSON.parse(readFileSync(file,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  expect(value.sha256).toBe(sha(JSON.stringify(value.payload)))
  return value
}
interface CrashWitness{
  pid:number;postcommit:boolean;usedTurns:number;mode:string
  ownerEpoch:string;sessionId:string;dispatchId:string;fetches:number
  nativeEvents:string[];osIdentity:{pid:number;bootId:string;startTicks:string}
}
interface NewSDK {
  pid:number;mode:string;dispatchId:string;dispatchState:string;receiptId:string
  oldUsedTurns:number;usedTurns:number;fetches:number;resultKind:string
  nativeEvents:string[];proposalExists:boolean
}
const linux=process.platform==='linux'?it:it.skip
describe('Dev-A R20-03 real SDK crash and operator-reviewed independent continuation',()=>{
  for(const postcommit of [false,true]){
    linux('R20-03'+(postcommit?'B':'A')+
      ': real Pi CAS SIGKILL, old Case blocked, cold Pi new Case allowed',()=>{
      const dir=mkdtempSync(join(tmpdir(),'review-a-r20-03-'))
      try{
        const killed=run(postcommit?'budget-postcommit-sigkill':
          'budget-precommit-sigkill',dir)
        expect(killed.error).toBeUndefined()
        expect(killed.status).toBeNull()
        expect(killed.signal).toBe('SIGKILL')
        const crash=JSON.parse(readFileSync(join(dir,'budget-kill-witness.json'),
          'utf8')) as CrashWitness
        expect(crash).toMatchObject({
          postcommit,usedTurns:postcommit?1:0,fetches:1,
          sessionId:'r19-old-session',
        })
        expect(crash.osIdentity).toBeTruthy()
        expect(crash.osIdentity.pid).toBe(crash.pid)
        expect(crash.nativeEvents).toEqual([
          'turn_start','turn_end','agent_end','agent_settled',
        ])
        const paths={owner:join(dir,'owner.json'),
          dispatch:join(dir,'dispatch.json'),turns:join(dir,'budget.json')}
        const witness:A20OwnerWitness={
          ...crash.osIdentity,sessionId:crash.sessionId,
          processEpoch:crash.ownerEpoch,caseId:'r19-case',
        }
        const proof=inspectA20OwnerRecovery(paths,witness)
        expect(proof).toMatchObject({
          verdict:'OPERATOR_REVIEW_REQUIRED',usedTurns:postcommit?1:0,
          unresolvedDispatchId:crash.dispatchId,
        })
        const intentPath=join(dir,'r20-reviewed-intent.json')
        const intent=recordA20RecoveryIntent(paths,intentPath,
          'r20-operator-'+(postcommit?'post':'pre'),proof,e=>({
            operatorId:'a-test-only-reviewer',
            approvalId:'a-test-approval-'+(postcommit?'post':'pre'),
            reviewedEvidenceHash:e.evidenceHash,
            approvedEpoch:e.witness.processEpoch,
            approvalScope:'A_ONLY_TECHNICAL_REVIEW',
          }))
        expect(intent).toMatchObject({
          state:'REVIEWED_NOT_EXECUTED',noProviderReplay:true,noLockTakeover:true,
        })
        expect(readA20RecoveryIntent(intentPath)).toEqual(intent)
        const lock=paths.owner+'.write-lock'
        expect(existsSync(lock)).toBe(true)
        const frozenOwner=readFileSync(paths.owner,'utf8')
        const frozenDispatch=readFileSync(paths.dispatch,'utf8')
        const frozenTurns=postcommit?readFileSync(paths.turns,'utf8'):null
        const denied=run('r20-independent',dir)
        expect(denied.error).toBeUndefined()
        expect(denied.status).not.toBe(0)
        expect(denied.stderr).toContain(
          'Owner journal inter-process lock unavailable; recovery required')
        expect(existsSync(join(dir,'r20-independent-physical-fetch-entered.json')))
          .toBe(false)
        expect(readFileSync(paths.owner,'utf8')).toBe(frozenOwner)
        expect(readFileSync(paths.dispatch,'utf8')).toBe(frozenDispatch)
        if(frozenTurns!==null)expect(readFileSync(paths.turns,'utf8')).toBe(frozenTurns)
        else expect(existsSync(paths.turns)).toBe(false)
        // Explicit TEST-ONLY simulation of privileged operator unlock.
        // Verified SIGKILL/reaped above; no code in production removes locks.
        expect(assertA20RecoveryEvidenceFresh(paths,proof).evidenceHash)
          .toBe(intent.witnessEvidenceHash)
        unlinkSync(lock)
        const resumed=run('r20-independent',dir)
        expect(resumed.error).toBeUndefined()
        if(resumed.status!==0)throw Error('R20 independent Pi failure: '+
          JSON.stringify({status:resumed.status,signal:resumed.signal,
            stdout:resumed.stdout,stderr:resumed.stderr}))
        const line=resumed.stdout.split('\n')
          .find(x=>x.startsWith('R20_INDEPENDENT '))
        expect(line).toBeDefined()
        const actual=JSON.parse(line!.slice('R20_INDEPENDENT '.length)) as NewSDK
        expect(actual).toMatchObject({
          mode:'r20-independent',dispatchState:'settled',
          receiptId:'r20-independent-physical-001',fetches:1,usedTurns:1,
          oldUsedTurns:postcommit?1:0,resultKind:'recorded',proposalExists:false,
        })
        expect(actual.pid).not.toBe(crash.pid)
        expect(actual.nativeEvents).toEqual([
          'turn_start','turn_end','agent_end','agent_settled',
        ])
        const physicallyStarted=JSON.parse(readFileSync(join(dir,
          'r20-independent-physical-fetch-entered.json'),'utf8')) as {
          pid:number;dispatchId:string;fetchCalls:number
        }
        expect(physicallyStarted).toMatchObject({
          pid:actual.pid,dispatchId:actual.dispatchId,fetchCalls:1,
        })
        const chains=sealed(paths.dispatch).payload.runs as Record<string,{
          records:{id:string;caseId:string;state:string;receiptId?:string}[]
        }>
        const records=Object.values(chains).flatMap(x=>x.records)
        expect(records.find(x=>x.id===crash.dispatchId)).toMatchObject({
          caseId:'r19-case',state:'in-flight',
        })
        expect(records.filter(x=>x.caseId==='r20-independent-case'&&
          x.state==='settled'&&x.receiptId==='r20-independent-physical-001'))
          .toHaveLength(1)
        expect(existsSync(join(dir,'events.json'))).toBe(false)
        expect(readA20RecoveryIntent(intentPath)?.state)
          .toBe('REVIEWED_NOT_EXECUTED')
      }finally{rmSync(dir,{recursive:true,force:true})}
    },90000)
  }
})
