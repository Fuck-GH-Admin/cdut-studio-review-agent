/**
 * Dev-A A4-R19: a REAL Bun OS worker running Pi 0.86.1 createAgentSession().
 * Invoked only by the companion test; fake HTTPS SSE never reaches the network.
 * The "crash" side must be SIGKILLed by its parent after physical fetch entry.
 * The "recover" side is a new PID with the identical durable journals.
 * This is Gate O only, not an Electron/remote Provider/School Host witness.
 */
import {createHash} from 'node:crypto'
import {existsSync,openSync,writeSync,fsyncSync,closeSync,readFileSync} from 'node:fs'
import {join} from 'node:path'
import {setTimeout as delay} from 'node:timers/promises'
import {createAgentSession,ModelRuntime,SessionManager,SettingsManager} from '@earendil-works/pi-coding-agent'
import {REVIEW_C0_SCHEMA_VERSION,type CanonicalPlan,type Principal,
  type RunEvidenceIdentity,type SourceIdentity} from '@profer/shared'
import {createFileOwnerPersistence,V3ReviewOwnerAdapter,
  type OwnerPersistence} from './review-pi-owner-adapter'
import {V3ASDKDispatchFence} from './review-v3-sdk-dispatch-fence'
import {V3ATurnBudget} from './review-v3-execution-turn-budget'
import {V3AProposalProducer} from './review-v3-execution-proposal-producer'
import {V3ASDKTurnBridge} from './review-v3-main-sdk-turn-bridge'
import {V3APhysicalSDKTurnPort} from './review-v3-sdk-physical-turn-port'
import {V3APiHttpSingleRequestEngine,
  type V3APiHttpSingleRequestFactory,type V3AHttpRequestTransport,
} from './review-v3-pi-http-provider-engine'

const [mode,rootArg]=process.argv.slice(2)
if(!rootArg || !['crash','recover','late','quarantine','postcommit-eio','precommit-enospc','reopen-postcommit','reopen-precommit','complete','recover-complete','replay-receipt','recover-reused','settle-precommit-enospc','settle-postcommit-eio','recover-settle-precommit','recover-settle-postcommit','settle-precommit-sigkill','settle-postcommit-sigkill'].includes(mode??'')){
  throw new Error('R19 worker requires an explicit crash/recover mode and test root')
}
const root=rootArg
const paths={
  owner:join(root,'owner.json'),dispatch:join(root,'dispatch.json'),
  turns:join(root,'budget.json'),events:join(root,'events.json'),
  marker:join(root,'physical-fetch-entered.json'),
  release:join(root,'release-native-sdk'),
  settlementKill:join(root,'settlement-kill-witness.json'),
}
const authority={authorizeExecution:()=>{},isCurrent:()=>true}
const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
const sealed=(filename:string):{payload:Record<string,unknown>;sha256:string}=>{
  const object=JSON.parse(readFileSync(filename,'utf8')) as {
    payload:Record<string,unknown>;sha256:string
  }
  if(sha(JSON.stringify(object.payload))!==object.sha256){
    throw new Error('R19 observed a non-durable or unsealed ledger')
  }
  return object
}
const durableMarker=(data:unknown)=>{
  const file=openSync(mode==='replay-receipt'
    ?join(root,'replayed-physical-fetch-entered.json'):paths.marker,'wx',0o600)
  try{
    writeSync(file,JSON.stringify(data))
    fsyncSync(file)
  }finally{closeSync(file)}
}
const sseEvent=(type:string,content:Record<string,unknown>)=>
  'event: '+type+'\n'+'data: '+JSON.stringify({type,...content})+'\n\n'
const responseItem={
  id:'msg_r19',type:'message',role:'assistant',status:'completed',
  content:[{type:'output_text',text:'native offline',annotations:[]}],
}
const responseEnvelope={
  id:'resp_r19',object:'response',created_at:1730000000,
  status:'completed',model:'gpt-4o-mini',output:[responseItem],
  usage:{input_tokens:1,output_tokens:2,total_tokens:3,
    input_tokens_details:{cached_tokens:0},
    output_tokens_details:{reasoning_tokens:0}},
}
const firstSse=sseEvent('response.created',{
  response:{...responseEnvelope,status:'in_progress',output:[]},
})
const remainingSse=[
  sseEvent('response.output_item.added',{output_index:0,item:{
    id:'msg_r19',type:'message',role:'assistant',status:'in_progress',content:[],
  }}),
  sseEvent('response.output_text.delta',{
    output_index:0,content_index:0,item_id:'msg_r19',delta:'native offline',
  }),
  sseEvent('response.output_item.done',{output_index:0,item:responseItem}),
  sseEvent('response.completed',{response:responseEnvelope}),
].join('')
function scope(caseId:string){
  const run:RunEvidenceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId,
    runId:caseId+'-run',caseRevision:1,planFingerprint:caseId+'-plan',
    templateVersion:'v1',inputManifestHash:'a'.repeat(64),
    sourceVersionIds:[caseId+'-dv'],checkKeys:['check1'],
    attemptId:caseId+'-attempt',ownerGeneration:1,
  }
  const plan:CanonicalPlan={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,planId:caseId+'-p',
    fingerprint:run.planFingerprint,templateId:'t1',templateVersion:'v1',
    moduleDigests:[],
    bindings:[{checkKey:'check1',targetKey:'target1',objectKey:'object1',
      subjectId:'subject1',sourceVersionIds:[caseId+'-dv'],
      applicability:'applicable',conditionFingerprint:'cfp'}],
  }
  const source:SourceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId,materialId:'mat1',
    documentVersionId:caseId+'-dv',rawSha256:'a'.repeat(64),
    parseRevision:'parse1',blockId:'block1',
    location:{kind:'paragraph',locator:'1'},
  }
  const principal:Principal={
    source:'local',principalId:'main-owner',role:'reviewer',
    sessionId:'trusted-frame',assurance:'local-device',
    scope:{caseIds:[caseId],actions:['start-review']},
  }
  return {run,plan,source,principal}
}
const callOf=(lease:ReturnType<V3ReviewOwnerAdapter['grant']>,principal:Principal)=>({
  sessionId:lease.sessionId,grantId:lease.grantId,
  senderKey:lease.senderKey,principal,tool:'review_submit_result' as const,
})
const ownerStore=()=>createFileOwnerPersistence(paths.owner)
const dispatcher=(owner:V3ReviewOwnerAdapter)=>
  new V3ASDKDispatchFence(createFileOwnerPersistence(paths.dispatch),owner)

async function crashOrLate():Promise<void>{
  const fixture=scope('r19-case')
  const {plan,source,principal}=fixture
  const owner=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const replay=mode==='replay-receipt'
  const run=replay?{
    ...fixture.run,runId:'r19-reused-run',attemptId:'r19-reused-attempt',
  }:fixture.run
  const lease=owner.grant({
    principal,run,plan,sources:[source],
    sessionId:replay?'r19-reused-session':'r19-old-session',
    senderKey:replay?'r19-reused-frame':'r19-old-frame',
    expiresAt:Date.now()+120000,
    permittedTools:['review_submit_result'],
  })
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owner)
  const settlementFault=mode==='settle-precommit-enospc'||
    mode==='settle-postcommit-eio'
  const settlementKill=mode==='settle-precommit-sigkill'||
    mode==='settle-postcommit-sigkill'
  let injectedSettlementWrites=0
  const backing=createFileOwnerPersistence(paths.dispatch)
  const settlementStore:OwnerPersistence={
    read:()=>backing.read(),
    write:()=>{throw Error('R19-06 expected actual CAS persistence')},
    compareAndWrite:(expected,bytes)=>{
      const envelope=JSON.parse(bytes) as {payload:{runs:Record<string,{
        records:{state:string;receiptId?:string}[]}>}}
      const records=Object.values(envelope.payload.runs)
        .flatMap(x=>x.records)
      if(records.some(x=>x.state==='settled')){
        injectedSettlementWrites++
        if(settlementKill){
          if(injectedSettlementWrites!==1 || records.length!==1 ||
            records[0]?.state!=='settled' ||
            records[0]?.receiptId!=='r19-provider-physical-001'){
            throw Error('R19-07 attempted SIGKILL on non-settlement CAS')
          }
          const before=sealed(paths.dispatch)
          const beforeRecords=Object.values(before.payload.runs as Record<
            string,{records:{state:string;receiptId?:string;id:string}[]}
          >).flatMap(x=>x.records)
          const committedTurn=sealed(paths.turns)
          const counted=Object.values(committedTurn.payload.runs as Record<
            string,{usedTurns:number;receiptIds:string[]}
          >)
          if(beforeRecords.length!==1 ||
            beforeRecords[0]?.state!=='in-flight' ||
            counted.length!==1 || counted[0]?.usedTurns!==1 ||
            counted[0]?.receiptIds[0]!=='r19-provider-physical-001' ||
            nativeEvents.join(',')!=='turn_start,turn_end,agent_end,agent_settled' ||
            fetches!==1 || existsSync(paths.events)){
            throw Error('R19-07 kill point NOT after genuine native turn commit')
          }
          const postcommit=mode==='settle-postcommit-sigkill'
          if(postcommit)backing.compareAndWrite!(expected,bytes)
          const after=sealed(paths.dispatch)
          const afterRecords=Object.values(after.payload.runs as Record<
            string,{records:{state:string;receiptId?:string;id:string}[]}
          >).flatMap(x=>x.records)
          if(afterRecords.length!==1 ||
            afterRecords[0]?.state!==(postcommit?'settled':'in-flight') ||
            afterRecords[0]?.id!==beforeRecords[0]?.id){
            throw Error('R19-07 CAS disk outcome disagrees with kill mode')
          }
          const fd=openSync(paths.settlementKill,'wx',0o600)
          try{
            writeSync(fd,JSON.stringify({
              pid:process.pid,mode,postcommit,
              ownerEpoch:owner.processEpoch,sessionId:lease.sessionId,
              runId:run.runId,dispatchId:beforeRecords[0]?.id,
              nativeEvents,fetches,injectedSettlementWrites,
              turnUsed:counted[0]?.usedTurns,
              turnReceipts:counted[0]?.receiptIds,
              dispatchBefore:'in-flight',
              dispatchAfter:afterRecords[0]?.state,
              dispatchAfterReceipt:afterRecords[0]?.receiptId??null,
              turnSha256:committedTurn.sha256,
              dispatchBeforeSha256:before.sha256,
              dispatchAfterSha256:after.sha256,
            }))
            fsyncSync(fd)
          }finally{closeSync(fd)}
          // Actual SIGKILL here; this worker cannot report a resolved SDK
          // turn or commit business evidence after settlement starts.
          process.kill(process.pid,'SIGKILL')
          throw Error('R19-07 SIGKILL unexpectedly returned')
        }
        if(mode==='settle-precommit-enospc'){
          throw Object.assign(
            new Error('R19-06 ENOSPC before durable SDK settlement'),
            {code:'ENOSPC'},
          )
        }
        if(mode==='settle-postcommit-eio'){
          backing.compareAndWrite!(expected,bytes)
          throw Object.assign(
            new Error('R19-06 EIO after durable SDK settlement'),
            {code:'EIO'},
          )
        }
      }
      backing.compareAndWrite!(expected,bytes)
    },
  }
  const dispatch=(settlementFault || settlementKill)
    ?new V3ASDKDispatchFence(settlementStore,owner)
    :dispatcher(owner)
  const host={
    read:async()=>{throw Error('R19 physical document read not invoked')},
    check:async()=>{throw Error('R19 physical Check not invoked')},
    terminal:async()=>{throw Error('R19 physical terminal not invoked')},
  }
  const proposals=new V3AProposalProducer(
    createFileOwnerPersistence(paths.events),owner,host,turns,
  )
  let fetches=0
  const nativeEvents:string[]=[]
  const factory:V3APiHttpSingleRequestFactory={
    async create(input){
      const runtime=await ModelRuntime.create({
        authPath:join(root,'offline-auth.json'),modelsPath:null,
        allowModelNetwork:false,refreshOnCreate:false,
      })
      await runtime.setRuntimeApiKey('openai','offline-r19-disposable-credential')
      const base=runtime.getModel('openai','gpt-4o-mini')
      if(!base)throw Error('Pi 0.86.1 native model unavailable')
      const model={...base,api:'openai-responses' as const,
        baseUrl:'https://provider.r19.invalid/v1'}
      const {session}=await createAgentSession({
        cwd:root,agentDir:root,model,modelRuntime:runtime,
        sessionManager:SessionManager.inMemory(root),
        settingsManager:SettingsManager.inMemory(),noTools:'all',
      })
      session.subscribe(event=>{
        if(['turn_start','turn_end','agent_end','agent_settled'].includes(event.type)){
          nativeEvents.push(event.type)
        }
      })
      const transportFetch:V3AHttpRequestTransport=async(resource,init)=>{
        fetches++
        const url=resource instanceof Request?resource.url:String(resource)
        if(fetches!==1 || url!=='https://provider.r19.invalid/v1/responses' ||
            init?.redirect!=='error') {
          throw Error('R19 must enter one pinned SDK transport fetch only')
        }
        const dispatchBytes=readFileSync(paths.dispatch,'utf8')
        const disk=sealed(paths.dispatch).payload
        const runs=disk.runs as Record<string,{
          records:{id:string;state:string}[]
        }>
        const record=Object.values(runs).flatMap(c=>c.records).at(-1)
        const ownerBytes=readFileSync(paths.owner,'utf8')
        const ownerLedger=sealed(paths.owner).payload
        const owners=ownerLedger.owners as Record<string,{
          grantId:string;processEpoch:string;state:string
        }>
        if(record?.id!==input.dispatchId || record.state!=='in-flight' ||
            owners[lease.sessionId]?.grantId!==lease.grantId ||
            owners[lease.sessionId]?.processEpoch!==owner.processEpoch ||
            owners[lease.sessionId]?.state!=='active') {
          throw Error('R19 SDK transport lacked a durably claimed Main intent')
        }
        // highWaterMark:0 prevents a speculative pull before downstream
        // consumption starts. The actual Pi SDK SSE stream triggers pull.
        let entered=false
        const body=new ReadableStream<Uint8Array>({
          async pull(controller){
            if(entered)return new Promise<void>(()=>{})
            entered=true
            controller.enqueue(new TextEncoder().encode(firstSse))
            durableMarker({
              pid:process.pid,run,sessionId:lease.sessionId,
              grantId:lease.grantId,processEpoch:owner.processEpoch,
              dispatchId:input.dispatchId,fetchCalls:fetches,url,
              dispatchSha256:sha(dispatchBytes),ownerSha256:sha(ownerBytes),
              observation:'real Pi SDK transportFetch and SSE body pull',
            })
            if(mode==='late'){
              const deadline=Date.now()+15000
              while(!existsSync(paths.release)){
                if(Date.now()>deadline)throw Error('R19 native release timeout')
                await delay(25)
              }
              controller.enqueue(new TextEncoder().encode(remainingSse))
              controller.close()
              return
            }
            if(mode==='complete' || mode==='replay-receipt' || settlementFault || settlementKill){
              controller.enqueue(new TextEncoder().encode(remainingSse))
              controller.close()
              return
            }
            // R19-01: no terminal/EOF, parent must SIGKILL.
            return new Promise<void>(()=>{})
          },
        },{highWaterMark:0})
        return new Response(body,{
          status:200,headers:{
            'x-request-id':'r19-provider-physical-001',
            'content-type':'text/event-stream',
          },
        })
      }
      return {session,prompt:'Native Pi R19 crash recovery offline execution',
        trustedOrigin:'https://provider.r19.invalid',transportFetch}
    },
  }
  const port=new V3APhysicalSDKTurnPort(new V3APiHttpSingleRequestEngine(factory))
  const bridge=new V3ASDKTurnBridge(owner,turns,proposals,port,dispatch)
  if(mode==='late'){
    let denial=''
    try{await bridge.next(callOf(lease,principal),'direct')}
    catch(error){denial=String(error)}
    if(!denial.includes('Owner journal changed outside this process')){
      throw Error('R19 old PID incorrectly accepted native SDK: '+denial)
    }
    const records=Object.values(sealed(paths.dispatch).payload.runs as
      Record<string,{records:{state:string}[]}>).flatMap(x=>x.records)
    if(records.at(-1)?.state!=='late-denied' ||
        turns.snapshot(lease).usedTurns!==0 || existsSync(paths.events)){
      throw Error('R19 late native callback changed technical evidence')
    }
    process.stdout.write('R19_LATE_DENIED '+JSON.stringify({
      pid:process.pid,nativeEvents,denial,dispatchState:records.at(-1)?.state,
      usedTurns:turns.snapshot(lease).usedTurns,
      proposalExists:existsSync(paths.events),fetchCalls:fetches,
    })+'\n')
    return
  }
  if(mode==='complete' || mode==='replay-receipt' || settlementFault || settlementKill){
    let resultKind='',denial=''
    try{
      const result=await bridge.next(callOf(lease,principal),'direct')
      resultKind=result.kind
    }catch(error){denial=String(error)}
    const chains=sealed(paths.dispatch).payload.runs as Record<string,{
      records:{id:string;state:string;receiptId?:string;caseId?:string;grantId:string}[]
    }>
    const all=Object.values(chains).flatMap(c=>c.records)
    const own=all.find(x=>x.id && x.grantId===lease.grantId)
    const snap=turns.snapshot(lease)
    const previous=replay?owner.get('r19-old-session'):null
    const oldUsed=previous?turns.snapshot(previous).usedTurns:null
    if(nativeEvents.join(',')!=='turn_start,turn_end,agent_end,agent_settled' ||
      fetches!==1 || existsSync(paths.events)){
      throw Error('R19-05 Pi actual native settled/one-fetch evidence missing')
    }
    if(settlementFault){
      const expected=mode==='settle-postcommit-eio'
        ?'R19-06 EIO after durable SDK settlement'
        :'R19-06 ENOSPC before durable SDK settlement'
      const expectedState=mode==='settle-postcommit-eio'?'settled':'in-flight'
      if(!denial.includes(expected) || resultKind ||
        own?.state!==expectedState ||
        (expectedState==='settled' && own.receiptId!=='r19-provider-physical-001') ||
        (expectedState==='in-flight' && own.receiptId!==undefined) ||
        snap.usedTurns!==1 || injectedSettlementWrites!==1){
        throw Error('R19-06 real native turn/SDK settlement fault not fail-closed: '+
          JSON.stringify({denial,resultKind,own,snap,injectedSettlementWrites}))
      }
    }else if(replay){
      if(!denial.includes('One SDK receipt cannot attest two different Provider dispatches') ||
        resultKind || own?.state!=='in-flight' || snap.usedTurns!==0 ||
        previous?.state!=='recovery-required' || oldUsed!==1){
        throw Error('R19-05 duplicate real native receipt was accepted: '+
          JSON.stringify({denial,resultKind,own,snap,oldUsed,previous}))
      }
    }else{
      if(denial || resultKind!=='recorded' || snap.usedTurns!==1 ||
        own?.state!=='settled' || own.receiptId!=='r19-provider-physical-001'){
        throw Error('R19-05 normal native completion not durable: '+
          JSON.stringify({denial,resultKind,own,snap}))
      }
    }
    process.stdout.write((settlementFault?'R19_SETTLEMENT_FAULT ':'R19_NORMAL ')+JSON.stringify({
      mode,pid:process.pid,processEpoch:owner.processEpoch,
      runId:run.runId,attemptId:run.attemptId,
      grantId:lease.grantId,dispatchId:own?.id,
      dispatchState:own?.state,receiptId:own?.receiptId??null,
      nativeEvents,fetches,usedTurns:snap.usedTurns,
      injectedSettlementWrites,
      oldUsedTurns:oldUsed,denial,resultKind,proposalExists:existsSync(paths.events),
      ownerLedgerSha256:sealed(paths.owner).sha256,
      dispatchLedgerSha256:sealed(paths.dispatch).sha256,
      turnLedgerSha256:sealed(paths.turns).sha256,
    })+'\n')
    return
  }
  await bridge.next(callOf(lease,principal),'direct')
  throw Error('R19 crash worker unexpectedly settled without SIGKILL')
}
function quarantineWhileOldAlive():void{
  const owner=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const previous=owner.get('r19-old-session')
  if(!previous || previous.state!=='recovery-required'){
    throw Error('R19 new PID must see old Owner recovery-required')
  }
  const quarantined=owner.quarantineInterrupted()
  if(!quarantined.includes(previous.sessionId) ||
    owner.get(previous.sessionId)?.state!=='recovery-required'){
    throw Error('R19 cross-PID quarantine not durable')
  }
  process.stdout.write('R19_QUARANTINED '+JSON.stringify({
    pid:process.pid,oldProcessEpoch:previous.processEpoch,
    newProcessEpoch:owner.processEpoch,quarantined,
  })+'\n')
}
function recover():void{
  const owner=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const before=owner.get('r19-old-session')
  if(!before || before.state!=='recovery-required') {
    throw Error('R19 cold Owner not marked recovery-required')
  }
  const quarantined=owner.quarantineInterrupted()
  const previous=owner.get('r19-old-session')
  if(!previous || previous.state!=='recovery-required' ||
    !quarantined.includes(previous.sessionId) ||
    before.processEpoch===owner.processEpoch){
    throw Error('R19 interrupted process epoch not quarantined on disk')
  }
  const dispatch=dispatcher(owner)
  const original=previous.runEvidence!
  if(!dispatch.unresolved(original))throw Error('R19 lost physical dispatch intent')
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owner)
  const usedTurns=turns.snapshot(previous).usedTurns
  if(usedTurns!==0 || existsSync(paths.events)) {
    throw Error('R19 crash incorrectly generated a turn or proposal')
  }
  const callOld=callOf(previous,scope('r19-case').principal)
  let oldDenied=false
  try{owner.assertAuthorized(callOld.sessionId,callOld.grantId,
    callOld.senderKey,callOld.principal,callOld.tool)}
  catch{oldDenied=true}
  if(!oldDenied)throw Error('R19 cold Owner became reauthorized')
  const {principal}=scope('r19-case')
  const newer=owner.grant({
    principal,run:{...original,runId:'r19-new-run',attemptId:'r19-new-attempt'},
    plan:previous.planSnapshot!,sources:previous.sourceIdentities,
    sessionId:'r19-new-session',senderKey:'r19-new-frame',
    expiresAt:Date.now()+120000,permittedTools:['review_submit_result'],
  })
  let sameCaseBlocked=false
  try{dispatch.claim(callOf(newer,principal))}
  catch(error){
    if(String(error).includes('Unresolved SDK Provider dispatch on prior Run/Case')){
      sameCaseBlocked=true
    }else{throw error}
  }
  if(!sameCaseBlocked)throw Error('R19 same Case sidestepped old physical claim')
  // Negative-control scope: a separate legitimate Main-scoped Case is not
  // globally deadlocked by the old Case's unresolved physical attempt.
  const other=scope('r19-other-case')
  const separate=owner.grant({
    principal:other.principal,run:other.run,plan:other.plan,
    sources:[other.source],sessionId:'r19-other-session',
    senderKey:'r19-other-frame',expiresAt:Date.now()+120000,
    permittedTools:['review_submit_result'],
  })
  const otherClaim=dispatch.claim(callOf(separate,other.principal))
  if(otherClaim.run.caseId!=='r19-other-case' ||
     !dispatch.unresolved(other.run) || !dispatch.unresolved(original)){
    throw Error('R19 other Case isolation or original intent failed')
  }
  const disk=sealed(paths.dispatch)
  const ownerDisk=sealed(paths.owner)
  process.stdout.write('R19_RECOVERED '+JSON.stringify({
    pid:process.pid,oldProcessEpoch:before.processEpoch,
    newProcessEpoch:owner.processEpoch,
    quarantined,oldState:previous.state,unresolved:true,
    usedTurns,proposalExists:existsSync(paths.events),
    oldDenied,sameCaseBlocked,
    differentCaseClaim:otherClaim.dispatchId,
    ownerLedgerSha256:ownerDisk.sha256,
    dispatchLedgerSha256:disk.sha256,
  })+'\n')
}

/**
 * R19-04 fault injection uses REAL disk CAS/fsync and independent OS PIDs.
 * EIO/ENOSPC is injected deliberately at the boundary, not an OS-produced
 * disk failure. The SDK callback is synthetic and MUST remain uninvoked.
 * This checks fail-closed journal commit ambiguity, not real Provider entry.
 */
async function faultDispatch(postcommit:boolean):Promise<void>{
  const caseId='r19-fault-case'
  const {run,plan,source,principal}=scope(caseId)
  const owners=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const lease=owners.grant({
    principal,run,plan,sources:[source],sessionId:'fault-original',
    senderKey:'fault-original-frame',expiresAt:Date.now()+120000,
    permittedTools:['review_submit_result'],
  })
  const backing=createFileOwnerPersistence(paths.dispatch)
  let attempted=0,committed=false,enteredSDK=0
  const faultStore:OwnerPersistence={
    read:()=>backing.read(),
    write:()=>{throw Error('R19 unexpected non-CAS dispatch write')},
    compareAndWrite:(expected,bytes)=>{
      attempted++
      if(!postcommit){
        throw Object.assign(new Error('ENOSPC before durable intent'),{code:'ENOSPC'})
      }
      backing.compareAndWrite!(expected,bytes)
      committed=true
      throw Object.assign(new Error('EIO after durable intent commit'),{code:'EIO'})
    },
  }
  const dispatch=new V3ASDKDispatchFence(faultStore,owners)
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owners)
  const host={
    read:async()=>{throw Error('unused')},
    check:async()=>{throw Error('unused')},
    terminal:async()=>{throw Error('unused')},
  }
  const proposals=new V3AProposalProducer(
    createFileOwnerPersistence(paths.events),owners,host,turns,
  )
  const sdk={nextTurn:async()=>{
    enteredSDK++
    throw Error('R19 fault must fail before entering SDK')
  }}
  const bridge=new V3ASDKTurnBridge(owners,turns,proposals,sdk,dispatch)
  let caught=''
  try{await bridge.next(callOf(lease,principal),'direct')}
  catch(error){caught=String(error)}
  if(attempted!==1 || enteredSDK!==0 ||
    !caught.includes(postcommit?'EIO after durable intent commit':'ENOSPC before durable intent')){
    throw Error('R19 fault boundary failed: '+JSON.stringify({
      attempted,enteredSDK,committed,caught,
    }))
  }
  if(committed!==postcommit || existsSync(paths.dispatch)!==postcommit ||
    existsSync(paths.turns) || existsSync(paths.events)){
    throw Error('R19 unexpected journal side effect on injected write failure')
  }
  const ownerBytes=sealed(paths.owner)
  const dispatchBytes=postcommit?sealed(paths.dispatch):null
  const records=postcommit?
    Object.values(dispatchBytes!.payload.runs as
      Record<string,{records:{state:string;caseId:string}[]}>)
      .flatMap(chain=>chain.records):[]
  if(postcommit && (records.length!==1 ||
    records[0]?.state!=='in-flight' || records[0]?.caseId!==caseId)){
    throw Error('R19 postcommit durable dispatch is not unresolved')
  }
  process.stdout.write('R19_DISK_FAULT '+JSON.stringify({
    pid:process.pid,kind:postcommit?'POSTCOMMIT_EIO':'PRECOMMIT_ENOSPC',
    caught,attempted,enteredSDK,committed,
    ownerLedgerSha256:ownerBytes.sha256,
    dispatchLedgerSha256:dispatchBytes?.sha256??null,
    run,sessionId:lease.sessionId,
  })+'\n')
}
/** No previous PID token, global Actor, SDK callback or in-memory store survives. */
function reopenFault(postcommit:boolean):void{
  const owners=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const previous=owners.get('fault-original')
  if(!previous || previous.state!=='recovery-required' ||
    previous.processEpoch===owners.processEpoch){
    throw Error('R19 recovery did not isolate a previous process epoch')
  }
  const quarantined=owners.quarantineInterrupted()
  if(!quarantined.includes(previous.sessionId) ||
    owners.get(previous.sessionId)?.state!=='recovery-required'){
    throw Error('R19 cross-PID quarantine did not persist')
  }
  const dispatch=new V3ASDKDispatchFence(
    createFileOwnerPersistence(paths.dispatch),owners,
  )
  const priorRun=previous.runEvidence!
  const wasUnresolved=dispatch.unresolved(priorRun)
  if(wasUnresolved!==postcommit)throw Error('R19 dispatch unknown outcome mismatch')
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owners)
  if(turns.snapshot(previous).usedTurns!==0 || existsSync(paths.events)){
    throw Error('R19 crash falsely counted a turn / proposal')
  }
  const {principal}=scope('r19-fault-case')
  const newRun={...priorRun,runId:'fault-new-run',attemptId:'fault-new-attempt'}
  const fresh=owners.grant({
    principal,run:newRun,plan:previous.planSnapshot!,
    sources:previous.sourceIdentities,sessionId:'fault-new-session',
    senderKey:'fault-new-frame',expiresAt:Date.now()+120000,
    permittedTools:['review_submit_result'],
  })
  let blocked=false
  let newDispatchId=''
  try{
    const result=dispatch.claim(callOf(fresh,principal))
    newDispatchId=result.dispatchId
  }catch(error){
    if(String(error).includes('Unresolved SDK Provider dispatch on prior Run/Case')){
      blocked=true
    }else throw error
  }
  if(blocked!==postcommit || (!postcommit && !newDispatchId)){
    throw Error('R19 pre/postcommit recovery fence scope incorrect')
  }
  // A true UNKNOWN old provider side effect must prevent even a new
  // Main-granted Run. A KNOWN precommit failure (zero physical SDK entries)
  // can be explicitly reauthorized by a new PID; never silently retry.
  const oldRecords=postcommit?Object.values(sealed(paths.dispatch).payload.runs as
    Record<string,{records:{state:string}[]}>).flatMap(x=>x.records):[]
  if(postcommit && oldRecords.at(-1)?.state!=='in-flight'){
    throw Error('R19 postcommit intent was cleared by recovery')
  }
  process.stdout.write('R19_FAULT_RECOVERY '+JSON.stringify({
    pid:process.pid,kind:postcommit?'POSTCOMMIT_EIO':'PRECOMMIT_ENOSPC',
    quarantined,oldState:previous.state,
    oldProcessEpoch:previous.processEpoch,newProcessEpoch:owners.processEpoch,
    wasUnresolved,blocked,newDispatchId,usedTurns:turns.snapshot(previous).usedTurns,
    originalState:oldRecords.at(-1)?.state??null,
  })+'\n')
}

/** New actual PID must not silently make the completed old Owner active. */
function recoverCompleted():void{
  const owners=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const old=owners.get('r19-old-session')
  if(!old || old.state!=='recovery-required' ||
    old.processEpoch===owners.processEpoch){
    throw Error('R19-05 previous process Owner unexpectedly trusted')
  }
  const q=owners.quarantineInterrupted()
  if(q.length!==1 || q[0]!==old.sessionId ||
    owners.get(old.sessionId)?.state!=='recovery-required'){
    throw Error('R19-05 Owner could not cold quarantine')
  }
  let oldCapabilityDenied=false
  const principal=scope('r19-case').principal
  try{
    owners.assertAuthorized(old.sessionId,old.grantId,
      old.senderKey,principal,'review_submit_result')
  }catch{oldCapabilityDenied=true}
  if(!oldCapabilityDenied)throw Error('R19-05 cold Owner was resurrected')
  const dispatch=dispatcher(owners)
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owners)
  const oldTurn=turns.snapshot(old)
  if(oldTurn.usedTurns!==1 || dispatch.unresolved(old.runEvidence!) ||
    existsSync(paths.events)){
    throw Error('R19-05 cold persisted technical outcome mismatch')
  }
  const runs=sealed(paths.dispatch).payload.runs as
    Record<string,{records:{state:string;receiptId?:string;id:string}[]}>
  const records=Object.values(runs).flatMap(c=>c.records)
  if(records.length!==1 || records[0]?.state!=='settled' ||
    records[0]?.receiptId!=='r19-provider-physical-001'){
    throw Error('R19-05 settled durable dispatch receipt mismatch')
  }
  process.stdout.write('R19_COLD_COMPLETE '+JSON.stringify({
    pid:process.pid,processEpoch:owners.processEpoch,
    oldProcessEpoch:old.processEpoch,oldState:old.state,
    oldCapabilityDenied,quarantined:q,oldUsedTurns:oldTurn.usedTurns,
    oldDispatchState:records[0]?.state,
    oldReceiptId:records[0]?.receiptId,
    proposalExists:existsSync(paths.events),
    ownerLedgerSha256:sealed(paths.owner).sha256,
    dispatchLedgerSha256:sealed(paths.dispatch).sha256,
    turnLedgerSha256:sealed(paths.turns).sha256,
  })+'\n')
}
/** Fourth physical PID: failed duplicate must remain unresolved on cold read. */
function recoverDuplicated():void{
  const owners=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const old=owners.get('r19-old-session')
  const replay=owners.get('r19-reused-session')
  if(!old || !replay || old.state!=='recovery-required' ||
     replay.state!=='recovery-required'){
    throw Error('R19-05 cold duplicate Owner scope not fail-closed')
  }
  const q=owners.quarantineInterrupted()
  if(q.length!==1 || q[0]!==replay.sessionId){
    throw Error('R19-05 last duplicate Owner was not quarantined')
  }
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owners)
  const dispatch=dispatcher(owners)
  if(turns.snapshot(old).usedTurns!==1 || turns.snapshot(replay).usedTurns!==0 ||
    dispatch.unresolved(old.runEvidence!) || !dispatch.unresolved(replay.runEvidence!) ||
    existsSync(paths.events)){
    throw Error('R19-05 duplicate cold recover state mismatch')
  }
  const records=Object.values(sealed(paths.dispatch).payload.runs as
    Record<string,{records:{state:string;receiptId?:string}[]}>)
    .flatMap(c=>c.records)
  if(records.length!==2 ||
    records.filter(x=>x.state==='settled' && x.receiptId==='r19-provider-physical-001').length!==1 ||
    records.filter(x=>x.state==='in-flight').length!==1){
    throw Error('R19-05 duplicate receipt persisted as trusted second claim')
  }
  process.stdout.write('R19_COLD_DUPLICATE '+JSON.stringify({
    pid:process.pid,quarantined:q,oldUsedTurns:turns.snapshot(old).usedTurns,
    rejectedRunUsedTurns:turns.snapshot(replay).usedTurns,
    unresolvedDuplicate:dispatch.unresolved(replay.runEvidence!),
    settledReceipts:records.filter(x=>x.state==='settled').length,
    pendingRecords:records.filter(x=>x.state==='in-flight').length,
    proposalExists:existsSync(paths.events),
  })+'\n')
}

/**
 * R19-06: actual native SDK turn durably counted BEFORE SDK settlement fault.
 * New OS PID must not count same turn twice. Fault code injected at disk CAS.
 */
function recoverSettlement(postcommit:boolean):void{
  const owner=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const previous=owner.get('r19-old-session')
  if(!previous || previous.state!=='recovery-required' ||
    previous.processEpoch===owner.processEpoch){
    throw Error('R19-06 cold previous Owner not quarantined')
  }
  const quarantined=owner.quarantineInterrupted()
  if(quarantined.length!==1 || quarantined[0]!==previous.sessionId ||
    owner.get(previous.sessionId)?.state!=='recovery-required'){
    throw Error('R19-06 old Owner was not durably quarantined')
  }
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owner)
  const dispatch=dispatcher(owner)
  const oldTurn=turns.snapshot(previous)
  const unresolved=dispatch.unresolved(previous.runEvidence!)
  if(oldTurn.usedTurns!==1 || unresolved===postcommit ||
    existsSync(paths.events)){
    throw Error('R19-06 cold recovered turn/dispatch state mismatch')
  }
  const records=Object.values(sealed(paths.dispatch).payload.runs as
    Record<string,{records:{state:string;receiptId?:string;id:string}[]}>)
    .flatMap(x=>x.records)
  if(records.length!==1 ||
    records[0]?.state!==(postcommit?'settled':'in-flight') ||
    records[0]?.receiptId!==(postcommit?'r19-provider-physical-001':undefined)){
    throw Error('R19-06 settlement boundary journal invalid')
  }
  const principal=scope('r19-case').principal
  const newRun={...previous.runEvidence!,runId:'r19-r06-new-run',
    attemptId:'r19-r06-new-attempt'}
  const fresh=owner.grant({
    principal,run:newRun,plan:previous.planSnapshot!,
    sources:previous.sourceIdentities,sessionId:'r19-r06-new-session',
    senderKey:'r19-r06-new-frame',expiresAt:Date.now()+120000,
    permittedTools:['review_submit_result'],
  })
  let claimBlocked=false
  let newDispatchId=''
  try{
    newDispatchId=dispatch.claim(callOf(fresh,principal)).dispatchId
  }catch(error){
    if(String(error).includes('Unresolved SDK Provider dispatch on prior Run/Case')){
      claimBlocked=true
    }else throw error
  }
  if(claimBlocked!==!postcommit || (postcommit && !newDispatchId)){
    throw Error('R19-06 recovery failed to respect committed settlement')
  }
  let duplicateReceiptBlocked=false
  if(postcommit){
    try{
      dispatch.assertUniqueReceipt(newRun,newDispatchId,
        'r19-provider-physical-001')
    }catch(error){
      if(String(error).includes('One SDK receipt cannot attest two different Provider dispatches')){
        duplicateReceiptBlocked=true
      }else throw error
    }
    if(!duplicateReceiptBlocked)throw Error('R19-06 settled ID reused')
  }
  if(turns.snapshot(previous).usedTurns!==1 ||
     turns.snapshot(fresh).usedTurns!==0){
    throw Error('R19-06 turn charged twice across PID restart')
  }
  process.stdout.write('R19_SETTLEMENT_RECOVERY '+JSON.stringify({
    pid:process.pid,postcommit,processEpoch:owner.processEpoch,
    oldProcessEpoch:previous.processEpoch,quarantined,
    oldUsedTurns:turns.snapshot(previous).usedTurns,
    newUsedTurns:turns.snapshot(fresh).usedTurns,
    unresolved,claimBlocked,newDispatchId,duplicateReceiptBlocked,
    settledRecords:records.filter(x=>x.state==='settled').length,
    inFlightRecords:records.filter(x=>x.state==='in-flight').length,
    proposalExists:existsSync(paths.events),
  })+'\n')
}
if(mode==='crash' || mode==='late' || mode==='complete' || mode==='replay-receipt' || mode==='settle-precommit-enospc' || mode==='settle-postcommit-eio' || mode==='settle-precommit-sigkill' || mode==='settle-postcommit-sigkill')await crashOrLate()
else if(mode==='recover-settle-precommit')recoverSettlement(false)
else if(mode==='recover-settle-postcommit')recoverSettlement(true)
else if(mode==='recover-complete')recoverCompleted()
else if(mode==='recover-reused')recoverDuplicated()
else if(mode==='quarantine')quarantineWhileOldAlive()
else if(mode==='postcommit-eio')await faultDispatch(true)
else if(mode==='precommit-enospc')await faultDispatch(false)
else if(mode==='reopen-postcommit')reopenFault(true)
else if(mode==='reopen-precommit')reopenFault(false)
else recover()
