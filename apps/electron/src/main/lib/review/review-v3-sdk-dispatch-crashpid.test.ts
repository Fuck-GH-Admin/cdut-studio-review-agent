/**
 * A4-R08 true Linux OS PID SIGKILL after a synthetic SDK callback begins.
 * The physical process and filesystem are real, Provider is synthetic:
 * validates durable intent/cold recovery (Gate O), NOT SDK/Provider Gate E.
 */
import {spawnSync} from 'node:child_process'
import {existsSync,mkdtempSync,readFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {describe,expect,it} from 'bun:test'
import type {Principal} from '@profer/shared'
import {
  createFileOwnerPersistence,V3ReviewOwnerAdapter,
} from './review-pi-owner-adapter'
import {V3ASDKDispatchFence} from './review-v3-sdk-dispatch-fence'
import {V3ATurnBudget} from './review-v3-execution-turn-budget'

const moduleUri=(name:string):string=>pathToFileURL(
  fileURLToPath(new URL(name,import.meta.url)),
).href
const ownerUri=moduleUri('./review-pi-owner-adapter.ts')
const fenceUri=moduleUri('./review-v3-sdk-dispatch-fence.ts')
const budgetUri=moduleUri('./review-v3-execution-turn-budget.ts')
const proposalUri=moduleUri('./review-v3-execution-proposal-producer.ts')
const bridgeUri=moduleUri('./review-v3-main-sdk-turn-bridge.ts')

const authority={authorizeExecution:()=>{},isCurrent:()=>true}

describe('A4-R08 durable pre-Provider SDK intent, actual SIGKILL process',()=>{
  it('A4-R08-PID-01: cold start retains in-flight SDK work and quarantines old Owner',()=>{
    if(process.platform!=='linux')return
    const root=mkdtempSync(join(tmpdir(),'review-v3-sdk-pid-'))
    const ownerFile=join(root,'owner.json')
    const dispatchFile=join(root,'dispatch.json')
    const budgetFile=join(root,'budget.json')
    const eventsFile=join(root,'events.json')
    const marker=join(root,'sdk-entered.json')
    const code=[
      "import {writeFileSync} from 'node:fs';",
      "import {createFileOwnerPersistence,V3ReviewOwnerAdapter} from "+JSON.stringify(ownerUri)+";",
      "import {V3ASDKDispatchFence} from "+JSON.stringify(fenceUri)+";",
      "import {V3ATurnBudget} from "+JSON.stringify(budgetUri)+";",
      "import {V3AProposalProducer} from "+JSON.stringify(proposalUri)+";",
      "import {V3ASDKTurnBridge} from "+JSON.stringify(bridgeUri)+";",
      "const ownerFile="+JSON.stringify(ownerFile)+";",
      "const dispatchFile="+JSON.stringify(dispatchFile)+";",
      "const budgetFile="+JSON.stringify(budgetFile)+";",
      "const eventsFile="+JSON.stringify(eventsFile)+";",
      "const marker="+JSON.stringify(marker)+";",
      "const HASH='a'.repeat(64);",
      "const principal={source:'local',principalId:'main-owner',role:'reviewer',sessionId:'trusted-frame',assurance:'local-device',scope:{caseIds:['case-a'],actions:['start-review']}};",
      "const source={schemaVersion:'review-c0/1',caseId:'case-a',materialId:'mat1',documentVersionId:'dv1',rawSha256:HASH,parseRevision:'parse1',blockId:'block1',location:{kind:'paragraph',locator:'1'}};",
      "const run={schemaVersion:'review-c0/1',runId:'run1',caseId:'case-a',caseRevision:1,planFingerprint:'plan1',templateVersion:'v1',inputManifestHash:HASH,sourceVersionIds:['dv1'],checkKeys:['check1'],attemptId:'attempt1',ownerGeneration:1};",
      "const plan={schemaVersion:'review-c0/1',planId:'p1',fingerprint:'plan1',templateId:'t1',templateVersion:'v1',moduleDigests:[],bindings:[{checkKey:'check1',targetKey:'target1',objectKey:'object1',subjectId:'subject1',sourceVersionIds:['dv1'],applicability:'applicable',conditionFingerprint:'cfp'}]};",
      "const owners=new V3ReviewOwnerAdapter(createFileOwnerPersistence(ownerFile),{authorizeExecution:()=>{},isCurrent:()=>true});",
      "const lease=owners.grant({principal,run,plan,sources:[source],sessionId:'review1',senderKey:'main-frame1',expiresAt:Date.now()+120000,permittedTools:['review_read_documents','review_submit_result']});",
      "const call={sessionId:lease.sessionId,grantId:lease.grantId,senderKey:lease.senderKey,principal,tool:'review_submit_result'};",
      "const turns=new V3ATurnBudget(createFileOwnerPersistence(budgetFile),owners);",
      "const dispatch=new V3ASDKDispatchFence(createFileOwnerPersistence(dispatchFile),owners);",
      "const host={read:async()=>{throw Error('unused')},check:async()=>{throw Error('unused')},terminal:async()=>{throw Error('unused')}};",
      "const proposals=new V3AProposalProducer(createFileOwnerPersistence(eventsFile),owners,host,turns);",
      "const sdk={nextTurn:async({run,dispatchId})=>{",
      "  writeFileSync(marker,JSON.stringify({pid:process.pid,run,dispatchId,sessionId:lease.sessionId}));",
      "  process.kill(process.pid,'SIGKILL');",
      "  return {kind:'completed-turn',run,dispatchId,receiptId:'NEVER'};",
      "}};",
      "const bridge=new V3ASDKTurnBridge(owners,turns,proposals,sdk,dispatch);",
      "await bridge.next(call,'direct');",
      "process.exit(14);",
    ].join('\n')
    try{
      const child=spawnSync(process.execPath,['-e',code],{
        encoding:'utf8',timeout:30000,
      })
      expect(child.error).toBeUndefined()
      expect(child.signal).toBe('SIGKILL')
      expect(child.status).toBeNull()
      const record=JSON.parse(readFileSync(marker,'utf8')) as {
        pid:number
        run:import('@profer/shared').RunEvidenceIdentity
        dispatchId:string
        sessionId:string
      }
      expect(record.pid).not.toBe(process.pid)
      expect(record.dispatchId.length).toBeGreaterThan(0)
      const owners=new V3ReviewOwnerAdapter(
        createFileOwnerPersistence(ownerFile),authority,
      )
      expect(owners.get(record.sessionId)?.state).toBe('recovery-required')
      const dispatch=new V3ASDKDispatchFence(
        createFileOwnerPersistence(dispatchFile),owners,
      )
      expect(dispatch.unresolved(record.run)).toBe(true)
      const turns=new V3ATurnBudget(
        createFileOwnerPersistence(budgetFile),owners,
      )
      const lease=owners.get(record.sessionId)
      expect(lease).toBeDefined()
      expect(turns.snapshot(lease!).usedTurns).toBe(0)
      expect(existsSync(eventsFile)).toBe(false)
      expect(owners.quarantineInterrupted()).toEqual([record.sessionId])
      expect(dispatch.unresolved(record.run)).toBe(true)
      // R09-PID-02: a new Main Owner session and new attempt for the SAME
      // Case cannot use a fresh Run ID to bypass the dead worker's intent.
      const principal:Principal={
        source:'local',principalId:'main-owner',role:'reviewer',
        sessionId:'trusted-frame',assurance:'local-device',
        scope:{caseIds:['case-a'],actions:['start-review']},
      }
      const newRun={...record.run,runId:'run2-after-crash',attemptId:'attempt2'}
      const fresh=owners.grant({
        principal,run:newRun,plan:lease!.planSnapshot!,
        sources:[...lease!.sourceIdentities],
        sessionId:'new-review-session',senderKey:'new-trusted-frame',
        expiresAt:Date.now()+120000,permittedTools:['review_submit_result'],
      })
      expect(()=>dispatch.claim({
        sessionId:fresh.sessionId,grantId:fresh.grantId,
        senderKey:fresh.senderKey,principal,tool:'review_submit_result',
      })).toThrow('Unresolved SDK Provider dispatch on prior Run/Case')
      expect(dispatch.unresolved(newRun)).toBe(false)
      expect(dispatch.unresolved(record.run)).toBe(true)
    }finally{
      rmSync(root,{recursive:true,force:true})
    }
  },30000)
})
