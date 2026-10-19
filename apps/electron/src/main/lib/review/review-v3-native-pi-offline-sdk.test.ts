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
const chunk=(delta:Record<string,unknown>,finishReason:string|null)=>({
  id:'chatcmpl-offline-r16',object:'chat.completion.chunk',
  created:1730000000,model:'gpt-4o-mini',
  choices:[{index:0,delta,finish_reason:finishReason}],
})
const validSse=[
  'data: '+JSON.stringify(chunk({role:'assistant',content:'native offline'},null))+'\n\n',
  'data: '+JSON.stringify(chunk({},'stop'))+'\n\n',
  'data: [DONE]\n\n',
].join('')

async function nativeHarness(responseBody:string){
  const dir=mkdtempSync(join(tmpdir(),'review-v3-native-pi-r16-'))
  dirs.push(dir)
  // No provider catalog network, shared credentials, or profile mutations.
  const modelRuntime=await ModelRuntime.create({
    modelsPath:null,allowModelNetwork:false,refreshOnCreate:false,
  })
  await modelRuntime.setRuntimeApiKey('openai','offline-r16-fake-credential')
  const nativeModel=modelRuntime.getModel('openai','gpt-4o-mini')
  if(!nativeModel){
    throw new Error('Pinned Pi 0.86.1 OpenAI model registry entry is absent')
  }
  const model={
    ...nativeModel,api:'openai-completions' as const,
    // OpenAI's SDK appends /chat/completions to the model's baseURL.
    // Main transport pins the HTTPS origin independently of this /v1 path.
    baseUrl:'https://provider.r16.invalid/v1',
  }
  let fetchCalls=0
  let session:AgentSession|undefined
  const events:NativeEvent[]=[]
  const allNativeEvents:string[]=[]
  const transportFetch:V3AHttpRequestTransport=async (resource,init)=>{
    fetchCalls++
    const url=resource instanceof Request?resource.url:String(resource)
    expect(url).toBe('https://provider.r16.invalid/v1/chat/completions')
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
    events,allNativeEvents,fetchCalls:()=>fetchCalls,session:()=>session,
  }
}

describe('Dev-A R16 real Pi 0.86.1 AgentSession offline — no external Provider / Gate E',()=>{
  it('R16-01: actual createAgentSession + OpenAI SSE + SDK native events settle one physical turn',async()=>{
    const h=await nativeHarness(validSse)
    let result:Awaited<ReturnType<typeof h.host.nextTurn>>
    try{
      result=await h.host.nextTurn(request)
    }catch(error){
      throw new Error('R16 native SDK diagnosis '+JSON.stringify({
        fetchCalls:h.fetchCalls(),events:h.events,
        eventTrace:h.allNativeEvents,
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
      'data: '+JSON.stringify(chunk({role:'assistant',content:'unfinished'},null))+'\n\n',
    )
    await expect(h.host.nextTurn({...request,dispatchId:'native-main-intent-0002'}))
      .rejects.toThrow()
    expect(h.fetchCalls()).toBe(1)
    // No synthetic native event is issued by this test; all events originate
    // from Pi 0.86.1 itself. Whether its internal state settles or reports an
    // error, the Main Host must never receive a completed-turn.
  })
})
