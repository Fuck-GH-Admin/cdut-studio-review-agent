/**
 * Dev-A R16: exercise the ACTUAL Pi 0.86.1 createAgentSession() / Agent
 * loop / OpenAI SDK SSE parser, not a hand-emitted AgentSession event shim.
 *
 * All Provider transport is intercepted by the one allowed Main-owned fetch.
 * Model catalog refresh is disabled, credentials are a disposable test token,
 * tools/extensions are excluded, and nothing calls external Provider networks.
 * This is an offline native SDK Gate O test, emphatically NOT Electron Gate E.
 */
import {afterEach,describe,expect,it} from 'bun:test'
import {mkdtempSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {
  createAgentSession,ModelRuntime,SessionManager,SettingsManager,
  type AgentSession,
} from '@earendil-works/pi-coding-agent'
import {
  V3APiHttpSingleRequestEngine,type V3APiHttpSingleRequestFactory,
  type V3AHttpRequestTransport,
} from './review-v3-pi-http-provider-engine'
import {V3APhysicalSDKTurnPort,type V3APhysicalTurnInput} from './review-v3-sdk-physical-turn-port'
import {REVIEW_C0_SCHEMA_VERSION,type RunEvidenceIdentity} from '@profer/shared'

const dirs:string[]=[]
afterEach(()=>{
  while(dirs.length){
    const dir=dirs.pop()!
    rmSync(dir,{recursive:true,force:true})
  }
})
const run:RunEvidenceIdentity={
  schemaVersion:REVIEW_C0_SCHEMA_VERSION,
  caseId:'native-sdk-case',runId:'native-sdk-run',caseRevision:1,
  planFingerprint:'native-sdk-plan',templateVersion:'v1',
  inputManifestHash:'e'.repeat(64),sourceVersionIds:['source-v1'],
  checkKeys:['native-check'],attemptId:'native-attempt',ownerGeneration:1,
}
const request:V3APhysicalTurnInput={
  run,mode:'direct',dispatchId:'native-main-intent-0001',
}
type NativeEvent='turn_start'|'turn_end'|'agent_end'|'agent_settled'
const expectedNativeEvents:NativeEvent[]=[
  'turn_start','turn_end','agent_end','agent_settled',
]
const responseItem={
  id:'msg_r16',type:'message',role:'assistant',status:'completed',
  content:[{type:'output_text',text:'native offline',annotations:[]}],
}
const responseEnvelope={
  id:'resp_r16',object:'response',created_at:1730000000,
  status:'completed',model:'gpt-4o-mini',
  output:[responseItem],
  usage:{input_tokens:1,output_tokens:2,total_tokens:3,
    input_tokens_details:{cached_tokens:0},
    output_tokens_details:{reasoning_tokens:0}},
}
const sseEvent=(type:string,content:Record<string,unknown>)=>
  'event: '+type+'\n'+'data: '+JSON.stringify({type,...content})+'\n\n'
const validSse=[
  sseEvent('response.created',{response:{...responseEnvelope,status:'in_progress',output:[]}}),
  sseEvent('response.output_item.added',{output_index:0,item:{
    id:'msg_r16',type:'message',role:'assistant',status:'in_progress',content:[],
  }}),
  sseEvent('response.output_text.delta',{
    output_index:0,content_index:0,item_id:'msg_r16',delta:'native offline',
  }),
  sseEvent('response.output_item.done',{output_index:0,item:responseItem}),
  sseEvent('response.completed',{response:responseEnvelope}),
].join('')

async function nativeHarness(responseBody:string){
  const dir=mkdtempSync(join(tmpdir(),'review-v3-native-pi-r16-'))
  dirs.push(dir)
  // No provider catalog network, shared credentials, or profile mutations.
  const modelRuntime=await ModelRuntime.create({
    authPath:join(dir,'offline-auth.json'),modelsPath:null,
    allowModelNetwork:false,refreshOnCreate:false,
  })
  await modelRuntime.setRuntimeApiKey('openai','offline-r16-fake-credential')
  const nativeModel=modelRuntime.getModel('openai','gpt-4o-mini')
  if(!nativeModel){
    throw new Error('Pinned Pi 0.86.1 OpenAI model registry entry is absent')
  }
  const model={
    ...nativeModel,api:'openai-responses' as const,
    // Pi 0.86.1 ModelRuntime uses OpenAI Responses for this built-in model.
    // Keep API, /v1 path and the independently pinned Main origin aligned.
    baseUrl:'https://provider.r16.invalid/v1',
  }
  let fetchCalls=0
  let session:AgentSession|undefined
  const events:NativeEvent[]=[]
  const allNativeEvents:string[]=[]
  const nativeFailures:string[]=[]
  const requests:string[]=[]
  const transportFetch:V3AHttpRequestTransport=async (resource,init)=>{
    fetchCalls++
    const url=resource instanceof Request?resource.url:String(resource)
    requests.push(url)
    expect(url).toBe('https://provider.r16.invalid/v1/responses')
    expect(init?.redirect).toBe('error')
    return new Response(responseBody,{
      status:200,
      headers:{
        'x-request-id':'r16-native-provider-http-001',
        'content-type':'text/event-stream',
      },
    })
  }
  const factory:V3APiHttpSingleRequestFactory={
    async create(){
      const result=await createAgentSession({
        cwd:dir,agentDir:dir,
        model,modelRuntime,
        sessionManager:SessionManager.inMemory(dir),
        settingsManager:SettingsManager.inMemory(),
        noTools:'all',
      })
      session=result.session
      session.subscribe(event=>{
        if((event.type==='message_end'||event.type==='turn_end') &&
          event.message?.role==='assistant' && event.message.stopReason==='error'){
          nativeFailures.push(event.type+':'+(event.message.errorMessage??'no native error detail'))
        }
        if(allNativeEvents.length<80){
          const eventMessage='message' in event && event.message &&
            typeof event.message==='object' &&
            'stopReason' in event.message
            ? String(event.message.stopReason):''
          allNativeEvents.push(event.type+(eventMessage?':'+eventMessage:''))
        }
        if(expectedNativeEvents.includes(event.type as NativeEvent)){
          events.push(event.type as NativeEvent)
        }
      })
      return {
        session,prompt:'native Pi SDK offline lifecycle verification',
        trustedOrigin:'https://provider.r16.invalid',
        transportFetch,
      }
    },
  }
  return {
    host:new V3APhysicalSDKTurnPort(new V3APiHttpSingleRequestEngine(factory)),
    events,allNativeEvents,nativeFailures,requests,fetchCalls:()=>fetchCalls,session:()=>session,
  }
}

describe('Dev-A R16 real Pi 0.86.1 AgentSession offline — no external Provider / Gate E',()=>{
  it('R16-01: actual createAgentSession + Responses SSE + SDK native events settle one physical turn',async()=>{
    const h=await nativeHarness(validSse)
    let result:Awaited<ReturnType<typeof h.host.nextTurn>>
    try{
      result=await h.host.nextTurn(request)
    }catch(error){
      throw new Error('R16 native SDK diagnosis '+JSON.stringify({
        fetchCalls:h.fetchCalls(),events:h.events,
        eventTrace:h.allNativeEvents,
        firstNativeErrors:h.nativeFailures,requestUrls:h.requests,
        model:h.session()?.agent.state.model,
        assistantErrors:h.session()?.agent.state.messages.filter(x=>
          x.role==='assistant').map(x=>({
          stopReason:x.stopReason,errorMessage:x.errorMessage,
        })),
        lastMessage:h.session()?.agent.state.messages.slice(-1).map(x=>
          x.role==='assistant'?{role:x.role,stopReason:x.stopReason,
            errorMessage:x.errorMessage}: {role:x.role}),
      }),{cause:error})
    }
    expect(result).toEqual({
      kind:'completed-turn',run,dispatchId:request.dispatchId,
      receiptId:'r16-native-provider-http-001',
    })
    expect(h.fetchCalls()).toBe(1)
    expect(h.events.filter(x=>expectedNativeEvents.includes(x))).toEqual(expectedNativeEvents)
    expect(h.session()?.agent.state.isStreaming).toBe(false)
  })
  it('R16-02: actual Pi parser does not upgrade a 200 HTTP SSE truncation into a receipt',async()=>{
    const h=await nativeHarness(
      sseEvent('response.created',{response:{...responseEnvelope,status:'in_progress',output:[]}}),
    )
    await expect(h.host.nextTurn({...request,dispatchId:'native-main-intent-0002'}))
      .rejects.toThrow()
    expect(h.fetchCalls()).toBe(1)
    // No synthetic native event is issued by this test; all events originate
    // from Pi 0.86.1 itself. Whether its internal state settles or reports an
    // error, the Main Host must never receive a completed-turn.
  })
})
