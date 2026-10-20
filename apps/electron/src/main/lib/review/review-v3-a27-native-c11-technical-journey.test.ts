/**
 * A27 real native Pi session -> A25 -> A22 -> A23 technical Host smoke.
 * Offline HTTPS SSE is injected solely into the test transport. No fake Pi
 * lifecycle events, no school publisher or C physical Host/Run ACK.
 */
import {describe,expect,it} from 'bun:test'
import {mkdtempSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {REVIEW_C0_SCHEMA_VERSION,type CanonicalPlan,type Principal,
  type RunEvidenceIdentity,type SourceIdentity} from '@profer/shared'
import type {PiAgentQueryOptions} from '../adapters/pi-agent-adapter'
import {V3ReviewOwnerAdapter,type OwnerPersistence} from './review-pi-owner-adapter'
import {A25C11LocalExecutionPorts} from './review-v3-a25-c11-local-execution-ports'
import {A26NativeReviewPiSessionFactory} from './review-v3-a26-native-pi-session-factory'
import type {A23ObservedTechnicalHostEvent}
  from './review-v3-a23-physical-host-observer'
import {verifyA22TechnicalEvidenceHash}
  from './review-v3-a-host-technical-handoff'

class Memory implements OwnerPersistence {
  private value:string|null=null
  read(){return this.value}
  write(next:string){this.value=next}
  compareAndWrite(expected:string|null,next:string){
    if(this.value!==expected)throw Error('A27_CAS_STALE')
    this.value=next
  }
}
const hash='e'.repeat(64)
const principal:Principal={source:'local',principalId:'a27-main',
  role:'reviewer',sessionId:'a27-window',assurance:'local-device',
  scope:{caseIds:['case-a27'],actions:['start-review']}}
const run:RunEvidenceIdentity={
  schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId:'case-a27',runId:'run-a27',
  caseRevision:1,planFingerprint:'frozen-a27',templateVersion:'v1',
  inputManifestHash:hash,sourceVersionIds:['version-a27'],
  checkKeys:['check-a27'],attemptId:'attempt-a27',ownerGeneration:1,
}
const source:SourceIdentity={
  schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId:'case-a27',
  materialId:'original-a27',documentVersionId:'version-a27',rawSha256:hash,
  parseRevision:'parser',blockId:'block1',
  location:{kind:'paragraph',locator:'p1'},
}
const binding={
  checkKey:'check-a27',targetKey:'target',objectKey:'object',
  subjectId:'subject',applicability:'applicable' as const,
  sourceVersionIds:['version-a27'],conditionFingerprint:'cond',
}
const plan:CanonicalPlan={
  schemaVersion:REVIEW_C0_SCHEMA_VERSION,planId:'p-a27',
  fingerprint:'frozen-a27',templateId:'local-candidate',
  templateVersion:'v1',moduleDigests:[],bindings:[binding],
}
const responseItem={
  id:'msg_a27',type:'message',role:'assistant',status:'completed',
  content:[{type:'output_text',text:'needs manual review',annotations:[]}],
}
const envelope={
  id:'resp_a27',object:'response',created_at:1730000000,
  status:'completed',model:'gpt-4o-mini',output:[responseItem],
  usage:{input_tokens:1,output_tokens:2,total_tokens:3,
    input_tokens_details:{cached_tokens:0},
    output_tokens_details:{reasoning_tokens:0}},
}
const sse=(type:string,body:Record<string,unknown>)=>
  'event: '+type+'\n'+'data: '+JSON.stringify({type,...body})+'\n\n'
const validResponse=[
  sse('response.created',{response:{...envelope,status:'in_progress',output:[]}}),
  sse('response.output_item.added',{output_index:0,item:{
    id:'msg_a27',type:'message',role:'assistant',status:'in_progress',content:[],
  }}),
  sse('response.output_text.delta',{output_index:0,content_index:0,
    item_id:'msg_a27',delta:'needs manual review'}),
  sse('response.output_item.done',{output_index:0,item:responseItem}),
  sse('response.completed',{response:envelope}),
].join('')
function createFixture(responseBody:string){
  const dir=mkdtempSync(join(tmpdir(),'review-v3-a27-native-'))
  let live=true,fetches=0,physical=0
  const owners=new V3ReviewOwnerAdapter(new Memory(),{
    authorizeExecution:()=>{},isCurrent:()=>live,
  })
  const grant=owners.grant({
    principal,run,plan,sources:[source],
    sessionId:'a27-hidden-owner',senderKey:'a27-main-sender',
    expiresAt:Date.now()+120000,
    permittedTools:['review_submit_result','review_read_documents'],
  })
  const call={sessionId:grant.sessionId,grantId:grant.grantId,
    senderKey:grant.senderKey,principal,tool:'review_submit_result' as const}
  const ports=new A25C11LocalExecutionPorts(()=>live?run:undefined)
  const observations=new Map<string,A23ObservedTechnicalHostEvent>()
  const baseModel:PiAgentQueryOptions={
    sessionId:call.sessionId,model:'gpt-4o-mini',
    provider:'openai-responses',apiKey:'offline-only-disposable',
    baseUrl:'https://provider.a27.invalid/v1',
    piAgentDir:dir,piSessionDir:join(dir,'history'),cwd:dir,
    systemPrompt:'Inspect frozen material, report only local technical candidates.',
    permissionMode:'default',toolProfile:'review',
  } as unknown as PiAgentQueryOptions
  const piFactory=new A26NativeReviewPiSessionFactory({
    select:async request=>{
      expect(request.run).toEqual(run)
      expect(request.mode).toBe('hidden')
      return {options:baseModel,prompt:'Assess the current frozen local case.',
        tools:[]}
    },
  })
  const piSessions={
    create:async (input:Parameters<typeof piFactory.create>[0])=>({
      ...await piFactory.create(input),
      transportFetch:async (resource:RequestInfo|URL)=>{
        fetches++
        const url=resource instanceof Request?resource.url:String(resource)
        expect(url).toBe('https://provider.a27.invalid/v1/responses')
        return new Response(responseBody,{headers:{
          'x-request-id':'provider-a27-request-001',
          'content-type':'text/event-stream',
        }})
      },
    }),
  }
  ports.bindCase({
    call,owners,piSessions,
    stores:{turns:new Memory(),dispatch:new Memory(),
      proposals:new Memory(),background:new Memory()},
    physicalExecutor:{execute:async operation=>{
      physical++
      const result=operation.requested.kind==='check'
        ?{...operation.requested,check:{
          ...operation.requested.check,status:'accepted' as const}}
        :operation.requested
      const technicalReceiptId='physical-a27-'+physical
      observations.set(operation.operationId,{
        operationId:operation.operationId,run:operation.run,
        permissionGrantId:operation.permissionGrantId,
        ownerProcessEpoch:operation.ownerProcessEpoch,
        dispatchId:operation.dispatchId,technicalReceiptId,observed:result,
      })
      return {technicalReceiptId,result}
    }},
    physicalObserver:{observe:id=>observations.get(id)},
  })
  return {ports,call,
    reads:()=>physical,fetches:()=>fetches,dispose:()=>rmSync(dir,{recursive:true,force:true}),
    revoke:()=>{live=false},
  }
}
describe('A27 actual Pi SDK through A25 / A22 technical Main ports',()=>{
  it('A27-01 runs one native Responses SDK request and returns technical-only Host evidence',async()=>{
    const f=createFixture(validResponse)
    try{
      const read=await f.ports.read(f.call,source)
      const check=await f.ports.check(f.call,binding)
      expect([read.kind,check.kind]).toEqual(['read','check'])
      const task=await f.ports.background.run({
        requestId:'a27-hidden',call:f.call,
        sequence:{version:'v3-dev-a-technical-sequence/1',
          expectedUsedTurns:0,modes:['hidden']},
      })
      expect(task).toMatchObject({state:'completed-technical',
        committedUsedTurns:1,completedSteps:1})
      await f.ports.terminal(f.call,'partial')
      const evidence=f.ports.snapshot(f.call)
      expect(evidence.technicalEvents.map(x=>x.kind)).toEqual([
        'read','check','terminal'])
      expect(evidence.sdkDispatches).toMatchObject([{
        state:'settled',technicalReceiptId:'provider-a27-request-001',
      }])
      expect(evidence.turnBudget.usedTurns).toBe(1)
      expect(evidence.canSealCReviewRun).toBe(false)
      expect(verifyA22TechnicalEvidenceHash(evidence)).toBe(true)
      expect(f.fetches()).toBe(1)
      expect(f.reads()).toBe(3)
    }finally{f.dispose()}
  })
  it('A27-02 incomplete native Provider SSE becomes recovery, not approval or redispatch',async()=>{
    const f=createFixture(sse('response.created',{
      response:{...envelope,status:'in_progress',output:[]},
    }))
    try{
      const task=await f.ports.background.run({
        requestId:'a27-incomplete',call:f.call,
        sequence:{version:'v3-dev-a-technical-sequence/1',
          expectedUsedTurns:0,modes:['hidden']},
      })
      expect(task.state).toBe('recovery-required')
      expect(f.fetches()).toBe(1)
      await expect(f.ports.background.run({
        requestId:'a27-new-request',call:f.call,
        sequence:{version:'v3-dev-a-technical-sequence/1',
          expectedUsedTurns:0,modes:['hidden']},
      })).rejects.toThrow('unresolved background technical dispatch')
      expect(f.fetches()).toBe(1)
    }finally{f.dispose()}
  })
})
