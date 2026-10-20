import {describe, expect, it} from 'bun:test'
import {createHash} from 'node:crypto'
import {
  REVIEW_C0_SCHEMA_VERSION,
  type CanonicalPlan, type Principal, type RunEvidenceIdentity,
  type SourceIdentity,
} from '@profer/shared'
import {
  V3ReviewOwnerAdapter,type OwnerPersistence,
} from './review-pi-owner-adapter'
import {V3ATurnBudget} from './review-v3-execution-turn-budget'
import {V3ASDKDispatchFence} from './review-v3-sdk-dispatch-fence'
import {V3APhysicalSDKTurnPort} from './review-v3-sdk-physical-turn-port'
import {V3APiHttpSingleRequestEngine} from './review-v3-pi-http-provider-engine'
import type {AgentSession} from '@earendil-works/pi-coding-agent'
import type {StreamFn} from '@earendil-works/pi-agent-core'
import {
  V3AProposalProducer, type ATechnicalStatus,
} from './review-v3-execution-proposal-producer'
import {
  V3ASDKTurnBridge, type V3ATurnHostOutcome,
} from './review-v3-main-sdk-turn-bridge'


/** In this isolated test the mock Main runtime echoes dispatchId automatically.
 * Production Pi SDK messages cannot forge a physical completion receipt.
 */
type SyntheticTurnOutcome =
  | {kind:'completed-turn';receiptId:string;run:RunEvidenceIdentity;dispatchId?:string}
  | {kind:'interrupted';status:Extract<V3ATurnHostOutcome,{kind:'interrupted'}>['status'];
      run:RunEvidenceIdentity;dispatchId?:string}

class Store implements OwnerPersistence {
  raw:string|null=null
  fail=false
  failAfterCommit=false
  read(){return this.raw}
  write(data:string){
    if(this.fail)throw Object.assign(new Error('ENOSPC'),{code:'ENOSPC'})
    this.raw=data
    if(this.failAfterCommit){
      this.failAfterCommit=false
      throw Object.assign(new Error('EIO after SDK dispatch commit'),{code:'EIO'})
    }
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
  const ownerStore=new Store(),turnStore=new Store(),eventStore=new Store(),dispatchStore=new Store()
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
  let nextOutcome:(run:RunEvidenceIdentity)=>Promise<SyntheticTurnOutcome>=
    async sourceRun=>({
      kind:'completed-turn',receiptId:'sdk-turn-'+(++nextId),run:sourceRun,
    })
  const sdk={
    nextTurn:async ({run,mode,dispatchId}:{
      run:RunEvidenceIdentity,dispatchId:string,
      mode:'direct'|'hidden'|'graph'|'batch',
    })=>{
      modeCount++
      const outcome=await nextOutcome(run)
      return {...outcome,dispatchId:outcome.dispatchId??dispatchId}
    },
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
  const dispatch=new V3ASDKDispatchFence(dispatchStore,owners)
  const bridge=new V3ASDKTurnBridge(owners,turns,producer,sdk,dispatch)
  return {
    owners,turns,producer,bridge,call,run,grant,principal,sdk,dispatch,
    eventStore,turnStore,dispatchStore,ownerStore,
    setAllowed:(v:boolean)=>{authorized=v},
    setNext:(fn:(run:RunEvidenceIdentity)=>Promise<SyntheticTurnOutcome>)=>{nextOutcome=fn},
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
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(h.bridge.next(h.call,'batch')).rejects.toThrow('Unresolved SDK Provider dispatch')
    expect(h.calls()).toBe(1)
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
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('Unresolved SDK Provider dispatch')
    const clean=fixture()
    clean.setNext(async run=>({kind:'completed-turn',receiptId:'',run}))
    await expect(clean.bridge.next(clean.call,'direct')).rejects.toThrow()
    expect(clean.dispatch.unresolved(clean.run)).toBe(true)
  })
  it('A4-DISPATCH-01: dispatch disk ENOSPC prevents even the first SDK call',async()=>{
    const h=fixture()
    h.dispatchStore.fail=true
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('ENOSPC')
    expect(h.calls()).toBe(0)
    expect(h.dispatch.unresolved(h.run)).toBe(false)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A4-DISPATCH-04: uncertain postcommit intent denies SDK after cold ledger reopen',async()=>{
    const h=fixture()
    h.dispatchStore.failAfterCommit=true
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('EIO after SDK dispatch commit')
    expect(h.calls()).toBe(0)
    expect(()=>h.dispatch.unresolved(h.run)).toThrow()
    const recovered=new V3ASDKDispatchFence(h.dispatchStore,h.owners)
    expect(recovered.unresolved(h.run)).toBe(true)
    const fresh=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,h.sdk,recovered)
    await expect(fresh.next(h.call,'direct')).rejects.toThrow('Unresolved SDK Provider dispatch')
    expect(h.calls()).toBe(0)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
  })
  it('A4-DISPATCH-05: tampered persisted SDK intent journal fails cold recovery',async()=>{
    const h=fixture()
    h.setNext(async()=>{throw Error('Provider did not confirm')})
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow()
    h.dispatchStore.raw=(h.dispatchStore.raw??'')+'damaged'
    expect(()=>new V3ASDKDispatchFence(h.dispatchStore,h.owners)).toThrow()
    expect(()=>h.dispatch.unresolved(h.run)).toThrow()
  })
  it('A4-DISPATCH-02: await-time grant rotation quarantines returned old SDK intent',async()=>{
    const h=fixture()
    let release!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(res=>{release=res}))
    const pending=h.bridge.next(h.call,'hidden')
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    h.owners.pause(h.call.sessionId)
    const lease=h.owners.resumePaused(h.call.sessionId,h.grant.grantId,
      h.grant.senderKey,h.principal)
    release({kind:'completed-turn',receiptId:'late-old-grant',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    h.setNext(async run=>({kind:'completed-turn',receiptId:'fresh-after-resume',run}))
    await expect(h.bridge.next({...h.call,grantId:lease.grantId},'hidden'))
      .rejects.toThrow('explicit recovery')
    expect(h.calls()).toBe(1)
    expect(h.turns.snapshot(lease).usedTurns).toBe(0)
  })
  it('A4-DISPATCH-07: late-denied persisted across ledger reopen cannot redispatch',async()=>{
    const h=fixture()
    const controller=new AbortController()
    let resolve!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'direct',controller.signal)
    controller.abort()
    resolve({kind:'completed-turn',receiptId:'sdk-after-cancel',run:h.run})
    await expect(pending).rejects.toThrow()
    // The Main cancellation has finished, but the real SDK promise owns the
    // session guard until its own settlement handler completes.
    await new Promise<void>(resolve=>setImmediate(resolve))
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    const reopened=new V3ASDKDispatchFence(h.dispatchStore,h.owners)
    expect(reopened.unresolved(h.run)).toBe(true)
    const freshBridge=new V3ASDKTurnBridge(
      h.owners,h.turns,h.producer,h.sdk,reopened,
    )
    await expect(freshBridge.next(h.call,'direct')).rejects.toThrow('Unresolved SDK Provider dispatch')
    expect(h.calls()).toBe(1)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
  })
  it('A4-R06-03: historical late-denied then settled never upgrades to clean Run',()=>{
    const h=fixture()
    const key=JSON.stringify([h.run.runId,h.run.attemptId,h.run.ownerGeneration])
    const runHash=createHash('sha256').update(JSON.stringify(h.run)).digest('hex')
    const payload={
      version:'v3-dev-a-sdk-dispatch/1',
      runs:{[key]:{runHash,records:[
        {id:'old-denied',grantId:h.grant.grantId,state:'late-denied'},
        {id:'legacy-redrive',grantId:h.grant.grantId,
          state:'settled',receiptId:'sdk-after-denial'},
      ]}},
    }
    const seal=createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    h.dispatchStore.raw=JSON.stringify({payload,sha256:seal})
    expect(()=>new V3ASDKDispatchFence(h.dispatchStore,h.owners))
      .toThrow('SDK dispatch ledger invalid/duplicated')
    expect(h.calls()).toBe(0)
  })
  it('A4-R06-04: persisted distinct dispatches with duplicate SDK receipt fail closed',()=>{
    const h=fixture()
    const key=JSON.stringify([h.run.runId,h.run.attemptId,h.run.ownerGeneration])
    const runHash=createHash('sha256').update(JSON.stringify(h.run)).digest('hex')
    const payload={
      version:'v3-dev-a-sdk-dispatch/1',
      runs:{[key]:{runHash,records:[
        {id:'completed-one',grantId:h.grant.grantId,
          state:'settled',receiptId:'duplicate-native-sdk-turn'},
        {id:'completed-two',grantId:h.grant.grantId,
          state:'settled',receiptId:'duplicate-native-sdk-turn'},
      ]}},
    }
    const sha256=createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    h.dispatchStore.raw=JSON.stringify({payload,sha256})
    expect(()=>new V3ASDKDispatchFence(h.dispatchStore,h.owners))
      .toThrow('SDK dispatch ledger reuses one receipt across physical calls')
    expect(h.calls()).toBe(0)
  })
  it('A4-DISPATCH-06: SDK duplicate across distinct dispatches is not a retry',async()=>{
    const h=fixture()
    let calls=0
    h.setNext(async run=>({kind:'completed-turn',receiptId:'sdk-stale-1',run}))
    await h.bridge.next(h.call,'graph')
    calls++
    await expect(h.bridge.next(h.call,'graph')).rejects.toThrow('REQUEST_ID_COLLISION')
    calls++
    expect(calls).toBe(2)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    expect(h.producer.replayCandidates()).toHaveLength(0)
  })
  it('A4-DISPATCH-03: invalid Host Run leaves durable unresolved intent',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'completed-turn',receiptId:'wrong-case',
      run:{...run,caseId:'other-case'}}))
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow()
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('Unresolved SDK Provider dispatch')
    expect(h.calls()).toBe(1)
  })
  it('A4-R10-16: pinned Pi HTTP request-id + turn_end traverses durable A4 SDK bridge',async()=>{
    const h=fixture()
    let transportCalls=0
    let listener:((event:{type:string;message?:unknown;willRetry?:boolean})=>void)|undefined
    const original:StreamFn=async (_model,_context,options)=>{
      const response=await options!.fetch!('https://trusted.provider.example/v1/chat/completions',{
        method:'POST',
      })
      // Consume the very SSE response body accepted by the HTTP witness.
      // Native turn_end alone cannot certify a truncated/empty transport.
      await response.text()
      listener?.({
        type:'turn_end',message:{role:'assistant',stopReason:'stop'},
      })
      return {} as Awaited<ReturnType<StreamFn>>
    }
    let disposed=false
    const session={
      agent:{state:{isStreaming:false},streamFunction:original},
      dispose(){disposed=true},
      subscribe(cb:(event:{type:string;message?:unknown;willRetry?:boolean})=>void){
        listener=cb
        return ()=>{listener=undefined}
      },
      async prompt(){
        listener?.({type:'turn_start'})
        await session.agent.streamFunction(
          {api:'openai-completions',provider:'openai',id:'pinned'} as never,
          {messages:[]} as never,
          {transport:'sse'},
        )
        listener?.({type:'agent_end',willRetry:false})
        listener?.({type:'agent_settled'})
      },
    }
    const port=new V3APhysicalSDKTurnPort(new V3APiHttpSingleRequestEngine({
      create:async()=>({
        session:session as unknown as Pick<AgentSession,'agent'|'prompt'|'subscribe'|'dispose'>,
        prompt:'frozen-trusted-main-review-request',
        trustedOrigin:'https://trusted.provider.example',
        transportFetch:async()=>{
          transportCalls++
          return new Response('data: {"id":"r10-16"}\n\ndata: [DONE]\n\n',{
            status:200,headers:{
              'x-request-id':'native-http-request-r10-16',
              'content-type':'text/event-stream',
            },
          })
        },
      }),
    }))
    const bridge=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,port,h.dispatch)
    const result=await bridge.next(h.call,'hidden')
    expect(result.kind).toBe('recorded')
    expect(transportCalls).toBe(1)
    expect(disposed).toBe(true)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
    expect(h.dispatch.unresolved(h.run)).toBe(false)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A4-R09-01: a fresh Run and fresh Owner session on same Case cannot bypass unresolved SDK call',()=>{
    const h=fixture()
    const first=h.dispatch.claim(h.call)
    expect(first.dispatchId).toBeTruthy()
    const laterRun={...h.run,runId:'different-run',attemptId:'new-attempt'}
    const grant=h.owners.grant({
      principal:h.principal,run:laterRun,plan:h.grant.planSnapshot!,
      sources:[...h.grant.sourceIdentities],sessionId:'private-fresh',
      senderKey:'main-frame-new',expiresAt:Date.now()+120_000,
      permittedTools:['review_submit_result'],
    })
    const secondCall={
      ...h.call,sessionId:grant.sessionId,grantId:grant.grantId,
      senderKey:grant.senderKey,
    }
    expect(()=>h.dispatch.claim(secondCall)).toThrow(
      'Unresolved SDK Provider dispatch on prior Run/Case',
    )
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    expect(h.dispatch.unresolved(laterRun)).toBe(false)
    expect(h.calls()).toBe(0)
  })
  it('A4-R09-02: independent Case may claim while previous Case unresolved',()=>{
    const h=fixture()
    h.dispatch.claim(h.call)
    const principal:Principal={
      ...h.principal,
      scope:{...h.principal.scope,caseIds:['caseA','caseB']},
    }
    const laterRun={...h.run,runId:'run-other-case',caseId:'caseB',attemptId:'attempt-B'}
    const grant=h.owners.grant({
      principal,run:laterRun,plan:h.grant.planSnapshot!,
      sources:h.grant.sourceIdentities.map(s=>({...s,caseId:'caseB'})),
      sessionId:'private-caseB',senderKey:'frame-caseB',
      expiresAt:Date.now()+120_000,
      permittedTools:['review_submit_result'],
    })
    const claim=h.dispatch.claim({
      ...h.call,sessionId:grant.sessionId,grantId:grant.grantId,
      senderKey:grant.senderKey,principal,
    })
    expect(claim.run).toEqual(laterRun)
    expect(h.dispatch.unresolved(laterRun)).toBe(true)
    expect(h.dispatch.unresolved(h.run)).toBe(true)
  })
  it('A4-R09-03: cold reopen retains cross-Run Case fence',()=>{
    const h=fixture()
    h.dispatch.claim(h.call)
    const opened=new V3ASDKDispatchFence(h.dispatchStore,h.owners)
    const laterRun={...h.run,runId:'fresh-cold-run',attemptId:'fresh-cold-attempt'}
    const grant=h.owners.grant({
      principal:h.principal,run:laterRun,plan:h.grant.planSnapshot!,
      sources:[...h.grant.sourceIdentities],sessionId:'fresh-cold-session',
      senderKey:'fresh-main-frame',expiresAt:Date.now()+120_000,
      permittedTools:['review_submit_result'],
    })
    expect(()=>opened.claim({
      ...h.call,sessionId:grant.sessionId,grantId:grant.grantId,
      senderKey:grant.senderKey,
    })).toThrow('Unresolved SDK Provider dispatch on prior Run/Case')
    expect(opened.unresolved(h.run)).toBe(true)
  })
  it('A4-R09-04: legacy unresolved intent without Case attribution quarantines every new Run',()=>{
    const h=fixture()
    h.dispatch.claim(h.call)
    const envelope=JSON.parse(h.dispatchStore.raw!) as {
      payload:{version:string;runs:Record<string,{
        runHash:string
        records:Array<{id:string;grantId:string;caseId?:string;
          sessionId?:string;state:string}>}>}
      sha256:string
    }
    const only=Object.values(envelope.payload.runs)[0]
    expect(only).toBeDefined()
    delete only!.records[0]!.caseId
    delete only!.records[0]!.sessionId
    envelope.sha256=createHash('sha256')
      .update(JSON.stringify(envelope.payload)).digest('hex')
    h.dispatchStore.raw=JSON.stringify(envelope)
    const reopened=new V3ASDKDispatchFence(h.dispatchStore,h.owners)
    const principal:Principal={
      ...h.principal,scope:{...h.principal.scope,caseIds:['caseA','caseB']},
    }
    const runB={...h.run,runId:'runB',caseId:'caseB',attemptId:'attemptB'}
    const lease=h.owners.grant({
      principal,run:runB,plan:h.grant.planSnapshot!,
      sources:h.grant.sourceIdentities.map(s=>({...s,caseId:'caseB'})),
      sessionId:'legacy-fresh-case',senderKey:'new-frame',
      expiresAt:Date.now()+120_000,permittedTools:['review_submit_result'],
    })
    expect(()=>reopened.claim({
      ...h.call,sessionId:lease.sessionId,grantId:lease.grantId,
      senderKey:lease.senderKey,principal,
    })).toThrow('Unresolved SDK Provider dispatch on prior Run/Case')
  })
  it('A4-R09-05: half-present Case/session attribution is a corrupt SDK journal',()=>{
    const h=fixture()
    h.dispatch.claim(h.call)
    const envelope=JSON.parse(h.dispatchStore.raw!) as {
      payload:{runs:Record<string,{records:Array<{caseId?:string;sessionId?:string}>}>}
      sha256:string
    }
    const chain=Object.values(envelope.payload.runs)[0]!
    delete chain.records[0]!.sessionId
    envelope.sha256=createHash('sha256')
      .update(JSON.stringify(envelope.payload)).digest('hex')
    h.dispatchStore.raw=JSON.stringify(envelope)
    expect(()=>new V3ASDKDispatchFence(h.dispatchStore,h.owners))
      .toThrow('SDK dispatch ledger invalid/duplicated')
  })
  it('A4-R09-06: native receipt reused by a different Run after a settled call fails closed',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'completed-turn',receiptId:'shared-native-receipt',run}))
    expect((await h.bridge.next(h.call,'direct')).kind).toBe('recorded')
    const nextRun={...h.run,runId:'sequential-run',attemptId:'second-attempt'}
    const grant=h.owners.grant({
      principal:h.principal,run:nextRun,plan:h.grant.planSnapshot!,
      sources:[...h.grant.sourceIdentities],sessionId:'sequential-session',
      senderKey:'second-window',expiresAt:Date.now()+120_000,
      permittedTools:['review_submit_result'],
    })
    const another=new V3ASDKTurnBridge(
      h.owners,h.turns,h.producer,h.sdk,h.dispatch,
    )
    await expect(another.next({
      ...h.call,sessionId:grant.sessionId,grantId:grant.grantId,
      senderKey:grant.senderKey,
    },'direct')).rejects.toThrow('REQUEST_ID_COLLISION')
    expect(h.dispatch.unresolved(nextRun)).toBe(true)
    expect(h.turns.snapshot(grant).usedTurns).toBe(0)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
    expect(h.calls()).toBe(2)
  })
  it('A4-R09-07: cold journal rejects duplicate receipt across two different Run chains',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'completed-turn',receiptId:'reused-across-runs',run}))
    expect((await h.bridge.next(h.call,'direct')).kind).toBe('recorded')
    const laterRun={...h.run,runId:'historical-run-B',attemptId:'historical-attempt-B'}
    const key=JSON.stringify([laterRun.runId,laterRun.attemptId,laterRun.ownerGeneration])
    const envelope=JSON.parse(h.dispatchStore.raw!) as {
      payload:{runs:Record<string,unknown>}
      sha256:string
    }
    envelope.payload.runs[key]={
      runHash:createHash('sha256').update(JSON.stringify(laterRun)).digest('hex'),
      records:[{
        id:'historical-physical-other',
        grantId:'historical-grant-B',
        caseId:laterRun.caseId,
        sessionId:'historical-session-B',
        state:'settled',
        receiptId:'reused-across-runs',
      }],
    }
    envelope.sha256=createHash('sha256')
      .update(JSON.stringify(envelope.payload)).digest('hex')
    h.dispatchStore.raw=JSON.stringify(envelope)
    expect(()=>new V3ASDKDispatchFence(h.dispatchStore,h.owners))
      .toThrow('SDK dispatch ledger reuses one receipt across physical calls')
    expect(h.calls()).toBe(1)
  })
  it('A4-R08-01: abort returns promptly but holds Owner SDK lock until hung Provider settles',async()=>{
    const h=fixture()
    const controller=new AbortController()
    let release!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(resolve=>{release=resolve}))
    const pending=h.bridge.next(h.call,'hidden',controller.signal)
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    expect(h.calls()).toBe(1)
    controller.abort()
    // This must settle BEFORE release() is invoked, even if Provider ignores AbortSignal.
    await expect(pending).rejects.toThrow(
      'Main cancelled while SDK Provider result is unresolved',
    )
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
    const other=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,h.sdk,h.dispatch)
    await expect(other.next(h.call,'hidden')).rejects.toThrow('Concurrent SDK turn')
    expect(h.calls()).toBe(1)
    release({kind:'completed-turn',receiptId:'aborted-provider-late',run:h.run})
    await new Promise<void>(resolve=>setImmediate(resolve))
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(other.next(h.call,'hidden')).rejects.toThrow(
      'Unresolved SDK Provider dispatch',
    )
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.calls()).toBe(1)
  })
  it('A4-R08-02: Provider late rejection after abort has no unhandled receipt or retry',async()=>{
    const h=fixture()
    const controller=new AbortController()
    let rejectLate!:(reason:Error)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>((_,reject)=>{rejectLate=reject}))
    const pending=h.bridge.next(h.call,'graph',controller.signal)
    controller.abort()
    await expect(pending).rejects.toThrow(
      'Main cancelled while SDK Provider result is unresolved',
    )
    const other=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,h.sdk,h.dispatch)
    await expect(other.next(h.call,'graph')).rejects.toThrow('Concurrent SDK turn')
    rejectLate(new Error('native socket failed after Main cancelled'))
    await new Promise<void>(resolve=>setImmediate(resolve))
    await expect(other.next(h.call,'graph')).rejects.toThrow(
      'Unresolved SDK Provider dispatch',
    )
    expect(h.producer.replayCandidates()).toEqual([])
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.calls()).toBe(1)
  })
  it('A4-R07-12: physical witness port + durable Main bridge charges one native SDK receipt',async()=>{
    const h=fixture()
    let physicalRequests=0
    const port=new V3APhysicalSDKTurnPort({invoke:async (_request,witness)=>{
      physicalRequests++
      witness.requestStarted('native-phys-1')
      witness.requestFinished({
        nativeRequestId:'native-phys-1',nativeReceiptId:'provider-receipt-1',
        status:'completed',
      })
    }})
    const bridge=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,port,h.dispatch)
    expect((await bridge.next(h.call,'direct')).kind).toBe('recorded')
    expect(physicalRequests).toBe(1)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
    expect(h.dispatch.unresolved(h.run)).toBe(false)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A4-R07-13: physical SDK internal retry poisons Main dispatch even if native error swallowed',async()=>{
    const h=fixture()
    let observed=0
    const port=new V3APhysicalSDKTurnPort({invoke:async (_request,witness)=>{
      observed++
      witness.requestStarted('native-phys-1')
      witness.requestFinished({
        nativeRequestId:'native-phys-1',nativeReceiptId:'provider-receipt-1',
        status:'completed',
      })
      // Native retry or image fallback tried to start another SDK request.
      observed++
      try{witness.requestStarted('native-phys-2')}catch{}
    }})
    const bridge=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,port,h.dispatch)
    await expect(bridge.next(h.call,'graph')).rejects.toThrow('provenance unavailable')
    expect(observed).toBe(2)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(bridge.next(h.call,'graph')).rejects.toThrow(
      'Unresolved SDK Provider dispatch',
    )
    expect(observed).toBe(2)
  })
  it('A4-R06-01: callback from another physical dispatch cannot charge SDK turn',async()=>{
    const h=fixture()
    h.setNext(async run=>({
      kind:'completed-turn',receiptId:'cross-dispatch-receipt',run,
      dispatchId:'wrong-physical-dispatch',
    }))
    await expect(h.bridge.next(h.call,'hidden')).rejects.toThrow(
      'SDK callback does not match persisted Main dispatch identity',
    )
    expect(h.calls()).toBe(1)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(h.bridge.next(h.call,'hidden')).rejects.toThrow(
      'Unresolved SDK Provider dispatch',
    )
    expect(h.calls()).toBe(1)
  })
  it('A4-R06-02: interrupted callback with mismatched dispatch cannot seal run',async()=>{
    const h=fixture()
    h.setNext(async run=>({
      kind:'interrupted',status:'timed-out',run,dispatchId:'foreign-dispatch',
    }))
    await expect(h.bridge.next(h.call,'graph')).rejects.toThrow(
      'SDK callback does not match persisted Main dispatch identity',
    )
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    expect(h.producer.replayCandidates()).toEqual([])
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
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
    let resolve!:(out:SyntheticTurnOutcome)=>void
    h.setNext(run=>new Promise<SyntheticTurnOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'direct')
    h.owners.revoke(h.call.sessionId)
    resolve({kind:'completed-turn',receiptId:'late-sdk',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
  })
  it('A3-SDK-07: Main revocation inferred from authority after await also blocks',async()=>{
    const h=fixture()
    let resolve!:(out:SyntheticTurnOutcome)=>void
    h.setNext(run=>new Promise<SyntheticTurnOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'direct')
    h.setAllowed(false)
    resolve({kind:'completed-turn',receiptId:'late-provider',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
  })
  it('A3-SDK-11: pause/resume while SDK awaits fences old grant and does not charge',async()=>{
    const h=fixture()
    let resolve!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'hidden')
    h.owners.pause(h.call.sessionId)
    const grant=h.owners.resumePaused(h.call.sessionId,h.grant.grantId,
      h.grant.senderKey,h.principal)
    resolve({kind:'completed-turn',receiptId:'old-grant-late',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(grant).usedTurns).toBe(0)
    h.setNext(async run=>({kind:'completed-turn',receiptId:'new-grant-current',run}))
    await expect(h.bridge.next({...h.call,grantId:grant.grantId},'hidden'))
      .rejects.toThrow('explicit recovery')
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    expect(h.calls()).toBe(1)
    expect(h.turns.snapshot(grant).usedTurns).toBe(0)
  })
  it('A3-SDK-12: ENOSPC turn journal failure cannot acknowledge SDK progress',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'completed-turn',receiptId:'stable-main-sdk-turn',run}))
    h.turnStore.fail=true
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('ENOSPC')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
    h.turnStore.fail=false
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('Unresolved SDK Provider dispatch')
    expect(h.calls()).toBe(1)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
  })
  it('A3-SDK-15: two bridge instances cannot execute same Owner SDK concurrently',async()=>{
    const h=fixture()
    let resolve!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(res=>{resolve=res}))
    const first=h.bridge.next(h.call,'direct')
    const second=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,h.sdk,h.dispatch)
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
    let resolve!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(res=>{resolve=res}))
    const pending=h.bridge.next(h.call,'batch',controller.signal)
    controller.abort()
    resolve({kind:'completed-turn',receiptId:'late-after-signal',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await new Promise<void>(resolve=>setImmediate(resolve))
    await expect(h.bridge.next(h.call,'batch')).rejects.toThrow('Unresolved SDK Provider dispatch')
    expect(h.calls()).toBe(1)
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
  it('A3-SDK-09: second physical Provider dispatch reusing a turn receipt fails closed',async()=>{
    const h=fixture()
    h.setNext(async run=>({kind:'completed-turn',receiptId:'same-sdk-turn',run}))
    expect((await h.bridge.next(h.call,'direct')).kind).toBe('recorded')
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('REQUEST_ID_COLLISION')
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(1)
    expect(h.calls()).toBe(2)
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    await expect(h.bridge.next(h.call,'direct')).rejects.toThrow('Unresolved SDK Provider dispatch')
    expect(h.calls()).toBe(2)
  })
  it('R18-03: cold Owner restart while SDK promise is live quarantines the old lease, rejects late result',async()=>{
    const h=fixture()
    let resolve!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(done=>{resolve=done}))
    const pending=h.bridge.next(h.call,'direct')
    expect(h.calls()).toBe(1)
    expect(h.dispatch.unresolved(h.run)).toBe(true)

    // A second Main process opens its own owner adapter on the same durable
    // journals. Cold active grants are never made current just by reopening.
    const coldOwner=new V3ReviewOwnerAdapter(h.ownerStore,{
      authorizeExecution:()=>{},isCurrent:()=>true,
    })
    expect(coldOwner.get(h.call.sessionId)?.state).toBe('recovery-required')
    expect(coldOwner.quarantineInterrupted()).toEqual([h.call.sessionId])
    const coldDispatch=new V3ASDKDispatchFence(h.dispatchStore,coldOwner)
    expect(coldDispatch.unresolved(h.run)).toBe(true)

    // The old Pi SDK response can arrive after the new process took over.
    resolve({kind:'completed-turn',receiptId:'old-native-late-after-cold',run:h.run})
    await expect(pending).rejects.toThrow()
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
    // Old PID can only change its A dispatch journal to late-denied;
    // new PID's previously read snapshot must reject stale access.
    expect(()=>coldDispatch.unresolved(h.run)).toThrow(
      'SDK dispatch ledger changed; re-open')
    const recoveredDispatch=new V3ASDKDispatchFence(h.dispatchStore,coldOwner)
    expect(recoveredDispatch.unresolved(h.run)).toBe(true)

    const newRun={...h.run,runId:'cold-new-run',attemptId:'cold-new-attempt'}
    const granted=coldOwner.grant({
      principal:h.principal,run:newRun,plan:h.grant.planSnapshot!,
      sources:[...h.grant.sourceIdentities],
      sessionId:'cold-new-session',senderKey:'cold-new-frame',
      expiresAt:Date.now()+120_000,
      permittedTools:['review_submit_result'],
    })
    expect(()=>recoveredDispatch.claim({
      ...h.call,sessionId:granted.sessionId,grantId:granted.grantId,
      senderKey:granted.senderKey,
    })).toThrow('Unresolved SDK Provider dispatch on prior Run/Case')
    expect(h.calls()).toBe(1)
  })
  it('R18-04: cancellation and cold restart cannot release a hung Provider claim for another Owner',async()=>{
    const h=fixture()
    const cancel=new AbortController()
    let settle!:(out:SyntheticTurnOutcome)=>void
    h.setNext(()=>new Promise<SyntheticTurnOutcome>(done=>{settle=done}))
    const pending=h.bridge.next(h.call,'hidden',cancel.signal)
    expect(h.dispatch.unresolved(h.run)).toBe(true)
    cancel.abort()
    await expect(pending).rejects.toThrow('Main cancelled while SDK Provider result is unresolved')

    const second=new V3ASDKTurnBridge(h.owners,h.turns,h.producer,h.sdk,h.dispatch)
    await expect(second.next(h.call,'hidden')).rejects.toThrow('Concurrent SDK turn')
    const coldOwner=new V3ReviewOwnerAdapter(h.ownerStore,{
      authorizeExecution:()=>{},isCurrent:()=>true,
    })
    expect(coldOwner.quarantineInterrupted()).toEqual([h.call.sessionId])
    const coldDispatch=new V3ASDKDispatchFence(h.dispatchStore,coldOwner)
    expect(coldDispatch.unresolved(h.run)).toBe(true)

    // Even a late well-formed SDK success cannot retroactively settle a
    // cancelled, cold-quarantined physical dispatch.
    settle({kind:'completed-turn',receiptId:'revoked-late-terminal',run:h.run})
    await new Promise<void>(done=>setImmediate(done))
    expect(coldDispatch.unresolved(h.run)).toBe(true)
    expect(h.turns.snapshot(h.grant).usedTurns).toBe(0)
    expect(h.producer.replayCandidates()).toEqual([])
    expect(h.calls()).toBe(1)
  })

})
