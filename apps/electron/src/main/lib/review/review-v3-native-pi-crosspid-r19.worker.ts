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
import {createAgentSession,ModelRuntime,SessionManager,SettingsManager} from '@earendil-works/pi-coding-agent'
import {REVIEW_C0_SCHEMA_VERSION,type CanonicalPlan,type Principal,
  type RunEvidenceIdentity,type SourceIdentity} from '@profer/shared'
import {createFileOwnerPersistence,V3ReviewOwnerAdapter} from './review-pi-owner-adapter'
import {V3ASDKDispatchFence} from './review-v3-sdk-dispatch-fence'
import {V3ATurnBudget} from './review-v3-execution-turn-budget'
import {V3AProposalProducer} from './review-v3-execution-proposal-producer'
import {V3ASDKTurnBridge} from './review-v3-main-sdk-turn-bridge'
import {V3APhysicalSDKTurnPort} from './review-v3-sdk-physical-turn-port'
import {V3APiHttpSingleRequestEngine,
  type V3APiHttpSingleRequestFactory,type V3AHttpRequestTransport,
} from './review-v3-pi-http-provider-engine'

const [mode,root]=process.argv.slice(2)
if(!root || !['crash','recover'].includes(mode??'')){
  throw new Error('R19 worker requires an explicit crash/recover mode and test root')
}
const paths={
  owner:join(root,'owner.json'),dispatch:join(root,'dispatch.json'),
  turns:join(root,'budget.json'),events:join(root,'events.json'),
  marker:join(root,'physical-fetch-entered.json'),
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
  const file=openSync(paths.marker,'wx',0o600)
  try{
    writeSync(file,JSON.stringify(data))
    fsyncSync(file)
  }finally{closeSync(file)}
}
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

async function crash():Promise<void>{
  const {run,plan,source,principal}=scope('r19-case')
  const owner=new V3ReviewOwnerAdapter(ownerStore(),authority)
  const lease=owner.grant({
    principal,run,plan,sources:[source],sessionId:'r19-old-session',
    senderKey:'r19-old-frame',expiresAt:Date.now()+120000,
    permittedTools:['review_submit_result'],
  })
  const turns=new V3ATurnBudget(createFileOwnerPersistence(paths.turns),owner)
  const dispatch=dispatcher(owner)
  const host={
    read:async()=>{throw Error('R19 physical document read not invoked')},
    check:async()=>{throw Error('R19 physical Check not invoked')},
    terminal:async()=>{throw Error('R19 physical terminal not invoked')},
  }
  const proposals=new V3AProposalProducer(
    createFileOwnerPersistence(paths.events),owner,host,turns,
  )
  let fetches=0
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
          pull(controller){
            if(entered)return new Promise<void>(()=>{})
            entered=true
            controller.enqueue(new TextEncoder().encode(
              'event: response.created\n'+
              'data: {"type":"response.created","response":{"id":"r19-incomplete","status":"in_progress"}}\n\n',
            ))
            durableMarker({
              pid:process.pid,run,sessionId:lease.sessionId,
              grantId:lease.grantId,processEpoch:owner.processEpoch,
              dispatchId:input.dispatchId,fetchCalls:fetches,url,
              dispatchSha256:sha(dispatchBytes),ownerSha256:sha(ownerBytes),
              observation:'real Pi SDK transportFetch and SSE body pull',
            })
            // Deliberately no terminal or HTTP EOF: Main must SIGKILL.
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
  await bridge.next(callOf(lease,principal),'direct')
  throw Error('R19 crash worker unexpectedly settled without SIGKILL')
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
if(mode==='crash')await crash()
else recover()
