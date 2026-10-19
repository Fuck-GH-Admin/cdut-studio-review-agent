import {describe, expect, it} from 'bun:test'
import {
  REVIEW_C0_SCHEMA_VERSION,
  type CanonicalPlan, type Principal, type RunEvidenceIdentity,
  type SourceIdentity,
} from '@profer/shared'
import {
  V3ReviewOwnerAdapter,type OwnerPersistence,
} from './review-pi-owner-adapter'
import {V3ATurnBudget} from './review-v3-execution-turn-budget'
import {
  V3AProposalProducer, type ATechnicalStatus,
} from './review-v3-execution-proposal-producer'
import {
  V3ASDKTurnBridge, type V3ATurnHostOutcome,
} from './review-v3-main-sdk-turn-bridge'

class Store implements OwnerPersistence {
  raw:string|null=null
  fail=false
  read(){return this.raw}
  write(data:string){
    if(this.fail)throw Object.assign(new Error('ENOSPC'),{code:'ENOSPC'})
    this.raw=data
  }
}
function fixture(){
  const hash='f'.repeat(64)
  const principal:Principal={
    source:'local',principalId:'main-owner',role:'reviewer',
    sessionId:'window1',assurance:'local-device',
    scope:{caseIds:['caseA'],actions:['start-review']},
  }
  const source:SourceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId:'caseA',materialId:'mat1',
    documentVersionId:'dv1',rawSha256:hash,parseRevision:'parser1',
    blockId:'b1',location:{kind:'paragraph',locator:'p1'},
  }
  const run:RunEvidenceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,runId:'run1',caseId:'caseA',
    caseRevision:1,planFingerprint:'fingerprint1',templateVersion:'v1',
    inputManifestHash:hash,sourceVersionIds:['dv1'],checkKeys:['check1'],
    attemptId:'attempt1',ownerGeneration:1,
  }
  const plan:CanonicalPlan={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,planId:'plan1',
    fingerprint:'fingerprint1',templateId:'t1',templateVersion:'v1',
    moduleDigests:[],bindings:[{
      checkKey:'check1',targetKey:'target1',objectKey:'object1',subjectId:'subject1',
      applicability:'applicable',sourceVersionIds:['dv1'],conditionFingerprint:'cfp1',
    }],
  }
  let authorized=true
  const ownerStore=new Store(),turnStore=new Store(),eventStore=new Store()
  const owners=new V3ReviewOwnerAdapter(ownerStore,{
    authorizeExecution:()=>{if(!authorized)throw new Error('Main denied')},
    isCurrent:()=>authorized,
  })
  const grant=owners.grant({
    principal,run,plan,sources:[source],sessionId:'private1',senderKey:'main-frame1',
    expiresAt:Date.now()+120_000,
    permittedTools:['review_submit_result','review_read_documents'],
  })
  const call={
    sessionId:grant.sessionId,grantId:grant.grantId,senderKey:grant.senderKey,
    principal,tool:'review_submit_result' as const,
  }
  let nextId=0
  let modeCount=0
  let nextOutcome:(run:RunEvidenceIdentity)=>Promise<V3ATurnHostOutcome>=
    async sourceRun=>({
      kind:'completed-turn',receiptId:'sdk-turn-'+(++nextId),run:sourceRun,
    })
  const sdk={
    nextTurn:async ({run,mode}:{
      run:RunEvidenceIdentity,mode:'direct'|'hidden'|'graph'|'batch',
    })=>{modeCount++;return nextOutcome(run)},
  }
  const turns=new V3ATurnBudget(turnStore,owners)
  const host={
    read:async (s:SourceIdentity)=>({
      receiptId:'read-1',actualSource:s,extent:'block' as const,
    }),
    check:async (b:CanonicalPlan['bindings'][number])=>({
      receiptId:'check-1',actualCheck:{
        checkKey:b.checkKey,targetKey:b.targetKey,objectKey:b.objectKey,
        subjectId:b.subjectId,status:'accepted' as const,
      },
    }),
    terminal:async(status:ATechnicalStatus)=>({
      receiptId:'terminal-'+status,actualStatus:status,
    }),
  }
  const producer=new V3AProposalProducer(eventStore,owners,host,turns)
  const bridge=new V3ASDKTurnBridge(owners,turns,producer,sdk)
  return {
    owners,turns,producer,bridge,call,run,grant,principal,sdk,
    eventStore,turnStore,
    setAllowed:(v:boolean)=>{authorized=v},
    setNext:(fn:(run:RunEvidenceIdentity)=>Promise<V3ATurnHostOutcome>)=>{nextOutcome=fn},
    calls:()=>modeCount,
  }
}
describe('Dev-A trusted Main SDK one-turn bridge, no C Run/ACK',()=>{
  it('A3-SDK-01: Main SDK completed turn records durable receipt, not a C event',async()=>{
    const h=fixture()
    const a=await h.bridge.next(h.call,'direct')
    expect(a.kind).toBe('recorded')
    if(a.kind!=='recorded')throw Error('turn not recorded')
    expect(a.turn).toEqual({usedTurns:1,maxTurns:24,exhausted:false})
    expect(h.producer.replayCandidates()).toEqual([])
    expect(h.calls()).toBe(1)
  })
  it('A3-SDK-02: 24/24 produces Host needs-resume; replay does not re-enter SDK',async()=>{
    const h=fixture()
    for(let i=0;i<23;i++){
      const result=await h.bridge.next(h.call,'hidden')
      expect(result.kind).toBe('recorded')
    }
    const final=await h.bridge.next(h.call,'hidden')
    expect(final.kind).toBe('terminal-proposal')
    if(final.kind!=='terminal-proposal')throw Error('terminal expected')
    expect(final.status).toBe('needs-resume')
    expect(final.event.kind).toBe('terminal')
    expect(final.event.sequence).toBe(1)
    const repeat=await h.bridge.next(h.call,'hidden')
    expect(repeat).toEqual(final)
    expect(h.calls()).toBe(24)
    expect(h.producer.replayCandidates()).toHaveLength(1)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(24)
  })
  it('A3-SDK-03: SDK Host timeout creates only a technical terminal, charges no turn',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'interrupted',status:'timed-out',run}))
    const result=await h.bridge.next(h.call,'graph')
    expect(result.kind).toBe('terminal-proposal')
    if(result.kind!=='terminal-proposal')throw Error('terminal expected')
    expect(result.status).toBe('timed-out')
    if(result.event.kind!=='terminal')throw Error('terminal event expected')
    expect(result.event.terminal.status).toBe('timed-out')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toHaveLength(1)
  })
  it('A3-SDK-10: sealed timeout attempt refuses another Provider SDK turn',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'interrupted',status:'timed-out',run}))
    const first=await h.bridge.next(h.call,'direct')
    expect(first.kind).toBe('terminal-proposal')
    expect(h.calls()).toBe(1)
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow(
      'Attempt already sealed',
    )
    expect(h.calls()).toBe(1)
    expect(h.producer.replayCandidates()).toHaveLength(1)
  })
  it('A3-SDK-04: Provider SDK exception is not a Host status/turn/Run success',async()=>{
    const h=fixture()
    h.setNext(async()=>{throw Object.assign(new Error('Provider crash'),{code:'ECONNRESET'})})
    await expect(h.bridge.next(h.call,'batch')).rejects.toThrow('Provider crash')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A3-SDK-05: Host result for wrong Run/attempt cannot charge turn',async()=>{
    const h=fixture()
    h.setNext(async run=>({
      kind:'completed-turn',receiptId:'sdk-forged',run:{...run,attemptId:'wrong'},
    }))
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
    h.setNext(async run=>({
      kind:'completed-turn',receiptId:'',run,
    }))
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow()
  })
  it('A3-SDK-16: semantically identical frozen Run with reordered keys is accepted',async()=>{
    const h=fixture()
    h.setNext(async run=>({
      kind:'completed-turn',
      receiptId:'sdk-reordered-run',
      run:Object.fromEntries(Object.entries(run).reverse()) as unknown as RunEvidenceIdentity,
    }))
    const outcome=await h.bridge.next(h.call,'direct')
    expect(outcome.kind).toBe('recorded')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
  })
  it('A3-SDK-06: revoke during awaited SDK result forbids turn charging and terminal',async()=>{
    const h=fixture()
    let resolve!:(out:V3ATurnHostOutcome)=>void
    h.setNext(run=>new Promise<V3ATurnHostOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'direct')
    h.owners.revoke(h.call.sessionId)
    resolve({kind:'completed-turn',receiptId:'late-sdk',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A3-SDK-07: Main revocation inferred from authority after await also blocks',async()=>{
    const h=fixture()
    let resolve!:(out:V3ATurnHostOutcome)=>void
    h.setNext(run=>new Promise<V3ATurnHostOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'direct')
    h.setAllowed(false)
    resolve({kind:'completed-turn',receiptId:'late-provider',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
  })
  it('A3-SDK-11: pause/resume while SDK awaits fences old grant and does not charge',async()=>{
    const h=fixture()
    let resolve!:(out:V3ATurnHostOutcome)=>void
    h.setNext(()=>new Promise<V3ATurnHostOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'hidden')
    h.owners.pause(h.call.sessionId)
    const grant=h.owners.resumePaused(h.call.sessionId,h.grant.grantId,
      h.grant.senderKey,h.principal)
    resolve({kind:'completed-turn',receiptId:'old-grant-late',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(grant).usedTurns).toBe(0)
    h.setNext(async run=>({kind:'completed-turn',receiptId:'new-grant-current',run}))
    expect((await h.bridge.next({...h.call,grantId:grant.grantId},'hidden')).kind)
      .toBe('recorded')
    expect(h.turns.snapshot(grant).usedTurns).toBe(1)
  })
  it('A3-SDK-12: ENOSPC turn journal failure cannot acknowledge SDK progress',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'completed-turn',receiptId:'stable-main-sdk-turn',run}))
    h.turnStore.fail=true
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('ENOSPC')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
    h.turnStore.fail=false
    expect((await h.bridge.next(h.call,'direct')).kind).toBe('recorded')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
  })
  it('A3-SDK-15: two bridge instances cannot execute same Owner SDK concurrently',async()=>{
    const h=fixture()
    let resolve!:(out:V3ATurnHostOutcome)=>void
    h.setNext(()=>new Promise<V3ATurnHostOutcome>(res=>{resolve=res}))
    const first=h.bridge.next(h.call,'direct')
    const second=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,h.sdk)
    await expect(second.next(h.call,'hidden')).rejects.toThrow('Concurrent SDK turn')
    resolve({kind:'completed-turn',receiptId:'unique-host-turn',run:h.run})
    expect((await first).kind).toBe('recorded')
    expect(h.calls()).toBe(1)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
  })
  it('A3-SDK-13: already aborted Main signal cannot invoke SDK Provider',async()=>{
    const h=fixture()
    const controller=new AbortController()
    controller.abort()
    await expect(h.bridge.next(h.call,'direct',controller.signal)).rejects.toThrow()
    expect(h.calls()).toBe(0)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A3-SDK-14: cancelled Main signal during SDK await drops valid-looking late turn',async()=>{
    const h=fixture()
    const controller=new AbortController()
    let resolve!:(out:V3ATurnHostOutcome)=>void
    h.setNext(()=>new Promise<V3ATurnHostOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'batch',controller.signal)
    controller.abort()
    resolve({kind:'completed-turn',receiptId:'late-after-signal',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A3-SDK-08: exhausted-turn terminal failure can replay without running SDK again',async()=>{
    const h=fixture()
    for(let i=0;i<23;i++)await h.bridge.next(h.call,'direct')
    h.eventStore.fail=true
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('ENOSPC')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(24)
    expect(h.producer.replayCandidates()).toEqual([])
    h.eventStore.fail=false
    const restored=await h.bridge.closeExhausted(h.call)
    expect(restored.kind).toBe('terminal')
    expect(restored.sequence).toBe(1)
    expect(h.calls()).toBe(24)
    expect(await h.bridge.next(h.call,'direct')).toEqual({
      kind:'terminal-proposal',status:'needs-resume',event:restored,
    })
    expect(h.calls()).toBe(24)
  })
  it('A3-SDK-09: duplicate SDK receipt does not double charge across host replay',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'completed-turn',receiptId:'same-sdk-turn',run}))
    await h.bridge.next(h.call,'direct')
    await h.bridge.next(h.call,'direct')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
    expect(h.calls()).toBe(2)
  })
})
