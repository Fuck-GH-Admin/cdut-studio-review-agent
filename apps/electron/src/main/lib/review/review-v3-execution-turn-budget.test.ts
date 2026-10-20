import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION, type CanonicalPlan, type Principal,
  type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import {
  createFileOwnerPersistence, V3ReviewOwnerAdapter,
  type OwnerPersistence,
} from './review-pi-owner-adapter'
import { V3ATurnBudget } from './review-v3-execution-turn-budget'
import { V3AProposalProducer } from './review-v3-execution-proposal-producer'

class MemoryStore implements OwnerPersistence {
  value: string | null = null
  fail = false
  failAfterCommit = false
  read() { return this.value }
  write(data: string) {
    if (this.fail) throw Object.assign(new Error('ENOSPC'),{code:'ENOSPC'})
    this.value=data
    if(this.failAfterCommit) {
      this.failAfterCommit=false
      throw Object.assign(new Error('EIO after turn commit'),{code:'EIO'})
    }
  }
}
function prepare(persistence: OwnerPersistence = new MemoryStore(),
  ownerPersistence: OwnerPersistence = new MemoryStore()) {
  const hash='f'.repeat(64)
  const principal:Principal={
    source:'local',principalId:'main',sessionId:'window1',role:'reviewer',
    assurance:'local-device',scope:{caseIds:['case1'],actions:['start-review']},
  }
  const source:SourceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId:'case1',materialId:'mat1',
    documentVersionId:'dv1',rawSha256:hash,parseRevision:'p1',blockId:'b1',
    location:{kind:'paragraph',locator:'1'},
  }
  const run:RunEvidenceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,runId:'run1',caseId:'case1',
    caseRevision:1,planFingerprint:'fingerprint1',templateVersion:'v1',
    inputManifestHash:hash,sourceVersionIds:['dv1'],checkKeys:['check1'],
    attemptId:'attempt1',ownerGeneration:1,
  }
  const plan:CanonicalPlan={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,planId:'plan1',
    fingerprint:'fingerprint1',templateId:'template1',templateVersion:'v1',
    moduleDigests:[],bindings:[{
      checkKey:'check1',targetKey:'target1',objectKey:'obj1',subjectId:'subj1',
      applicability:'applicable',sourceVersionIds:['dv1'],conditionFingerprint:'c1',
    }],
  }
  const authority={authorizeExecution:()=>{},isCurrent:()=>true}
  const owners=new V3ReviewOwnerAdapter(ownerPersistence,authority)
  const lease=owners.grant({
    principal,run,plan,sources:[source],sessionId:'private1',senderKey:'frame1',
    expiresAt:Date.now()+90_000,
    permittedTools:['review_read_documents','review_submit_result'],
  })
  const call={
    sessionId:lease.sessionId,grantId:lease.grantId,senderKey:lease.senderKey,
    principal,tool:'review_submit_result' as const,
  }
  const budget=new V3ATurnBudget(persistence,owners)
  const host={
    read:async (s:SourceIdentity)=>({receiptId:'physical1',actualSource:s,extent:'block' as const}),
    check:async (_:CanonicalPlan['bindings'][number])=>({
      receiptId:'check-host1',actualCheck:{
        checkKey:'check1',targetKey:'target1',objectKey:'obj1',subjectId:'subj1',
        status:'accepted' as const,
      },
    }),
    terminal:async (status:'needs-resume'|'partial'|'failed'|'completed-technical'|'cancelled'|'timed-out')=>({
      receiptId:'terminal-'+status,actualStatus:status,
    }),
  }
  const events=new V3AProposalProducer(new MemoryStore(),owners,host,budget)
  return {owners,lease,call,principal,run,source,budget,events,host,store:persistence}
}
describe('V3 A3 durable Main turn budget and A2 technical resume gate', () => {
  it('A3-TURN-01: 23/24 is not exhausted; 24/24 only allows needs-resume technical proposal',async()=>{
    const h=prepare()
    for(let i=1;i<=23;i++){
      expect(h.budget.recordCompletedTurn(h.call,'turn-'+i)).toEqual({
        usedTurns:i,maxTurns:24,exhausted:false,
      })
    }
    await expect(h.events.terminal(h.call,'needs-resume')).rejects.toThrow()
    expect(h.budget.recordCompletedTurn(h.call,'turn-24')).toEqual({
      usedTurns:24,maxTurns:24,exhausted:true,
    })
    expect(()=>h.budget.recordCompletedTurn(h.call,'turn-25')).toThrow()
    await expect(h.events.read({...h.call,tool:'review_read_documents',source:h.source}))
      .rejects.toThrow()
    const t=await h.events.terminal(h.call,'needs-resume')
    expect(t.kind).toBe('terminal')
    expect(t.sequence).toBe(1)
    if(t.kind!=='terminal')throw new Error('terminal expected')
    expect(t.terminal.status).toBe('needs-resume')
    expect(h.events.replayCandidates()).toEqual([t])
    await expect(h.events.terminal(h.call,'needs-resume')).resolves.toEqual(t)
  })
  it('A3-TURN-02: Main pause/resume rotates grant but does not reset 24-turn Run budget',()=>{
    const h=prepare()
    for(let i=0;i<12;i++)h.budget.recordCompletedTurn(h.call,'turn-'+(i+1))
    h.owners.pause(h.call.sessionId)
    expect(()=>h.budget.recordCompletedTurn(h.call,'turn-13')).toThrow()
    const resumed=h.owners.resumePaused(h.call.sessionId,h.lease.grantId,
      h.lease.senderKey,h.principal)
    const call={...h.call,grantId:resumed.grantId}
    expect(()=>h.budget.recordCompletedTurn(h.call,'turn-13')).toThrow()
    expect(h.budget.snapshot(resumed)).toEqual({
      usedTurns:12,maxTurns:24,exhausted:false,
    })
    expect(h.budget.recordCompletedTurn(call,'turn-1').usedTurns).toBe(12)
    for(let i=13;i<=24;i++){
      expect(h.budget.recordCompletedTurn(call,'turn-'+i).usedTurns).toBe(i)
    }
    expect(h.budget.exhausted(resumed)).toBe(true)
  })
  it('A3-TURN-03: persistent budget survives process reopen, old grant remains denied',()=>{
    const dir=mkdtempSync(join(tmpdir(),'review-v3-turns-'))
    try{
      const file=join(dir,'turns.json')
      const ownersPath=join(dir,'owner.json')
      const h=prepare(createFileOwnerPersistence(file),
        createFileOwnerPersistence(ownersPath))
      for(let i=0;i<7;i++)h.budget.recordCompletedTurn(h.call,'turn-'+(i+1))
      const next=new V3ATurnBudget(createFileOwnerPersistence(file),h.owners)
      expect(next.snapshot(h.lease).usedTurns).toBe(7)
      expect(readFileSync(file,'utf8')).toContain('v3-dev-a-turns/1')
      h.budget.recordCompletedTurn(h.call,'turn-8')
      expect(()=>next.snapshot(h.lease)).toThrow()
      const reopened=new V3ATurnBudget(createFileOwnerPersistence(file),h.owners)
      expect(reopened.snapshot(h.lease).usedTurns).toBe(8)
      const ownerAgain=new V3ReviewOwnerAdapter(
        createFileOwnerPersistence(ownersPath),
        {authorizeExecution:()=>{},isCurrent:()=>true},
      )
      expect(ownerAgain.get(h.call.sessionId)?.state).toBe('recovery-required')
      const coldBudget=new V3ATurnBudget(createFileOwnerPersistence(file),ownerAgain)
      expect(coldBudget.snapshot(h.lease).usedTurns).toBe(8)
      expect(()=>coldBudget.recordCompletedTurn(h.call,'turn-9')).toThrow()
      expect(ownerAgain.quarantineInterrupted()).toEqual([h.call.sessionId])
      expect(coldBudget.snapshot(h.lease).usedTurns).toBe(8)
    }finally{rmSync(dir,{recursive:true,force:true})}
  })
  it('A3-TURN-04: ENOSPC does not consume a turn or claim Host budget exhaustion',()=>{
    const store=new MemoryStore()
    const h=prepare(store)
    store.fail=true
    expect(()=>h.budget.recordCompletedTurn(h.call,'first')).toThrow('ENOSPC')
    expect(h.budget.snapshot(h.lease).usedTurns).toBe(0)
    store.fail=false
    expect(h.budget.recordCompletedTurn(h.call,'first').usedTurns).toBe(1)
    expect(h.budget.exhausted(h.lease)).toBe(false)
  })
  it('A3-TURN-06: stable Main SDK receipt retries cannot inflate 24-turn budget',()=>{
    const h=prepare()
    expect(h.budget.recordCompletedTurn(h.call,'sdk-turn-1').usedTurns).toBe(1)
    expect(h.budget.recordCompletedTurn(h.call,'sdk-turn-1').usedTurns).toBe(1)
    for(let i=2;i<=24;i++)h.budget.recordCompletedTurn(h.call,'sdk-turn-'+i)
    expect(h.budget.recordCompletedTurn(h.call,'sdk-turn-1')).toEqual({
      usedTurns:24,maxTurns:24,exhausted:true,
    })
    expect(()=>h.budget.recordCompletedTurn(h.call,'sdk-turn-25')).toThrow()
    expect(()=>h.budget.recordCompletedTurn(h.call,'')).toThrow()
  })
  it('A3-TURN-07: postcommit EIO reopens exactly one charged SDK turn, not two',()=>{
    const store=new MemoryStore()
    const h=prepare(store)
    store.failAfterCommit=true
    expect(()=>h.budget.recordCompletedTurn(h.call,'durable-turn1'))
      .toThrow('EIO after turn commit')
    expect(()=>h.budget.snapshot(h.lease)).toThrow()
    const reloaded=new V3ATurnBudget(store,h.owners)
    expect(reloaded.snapshot(h.lease).usedTurns).toBe(1)
    expect(reloaded.recordCompletedTurn(h.call,'durable-turn1').usedTurns).toBe(1)
    expect(reloaded.recordCompletedTurn(h.call,'durable-turn2').usedTurns).toBe(2)
    expect(reloaded.snapshot(h.lease).usedTurns).toBe(2)
  })
  it('A3-TURN-05: forged grant, wrong tool and damaged budget fail closed',()=>{
    const h=prepare()
    expect(()=>h.budget.recordCompletedTurn({...h.call,grantId:'wrong'},'forged')).toThrow()
    expect(()=>h.budget.recordCompletedTurn({...h.call,tool:'review_read_documents'},'wrong-tool')).toThrow()
    h.budget.recordCompletedTurn(h.call,'valid')
    const store=h.store as MemoryStore
    store.value=(store.value??'')+'damage'
    expect(()=>h.budget.snapshot(h.lease)).toThrow()
    expect(()=>new V3ATurnBudget(store,h.owners)).toThrow()
  })
})
