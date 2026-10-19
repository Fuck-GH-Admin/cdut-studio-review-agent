/**
 * R10 tests the ACTUAL Pi AgentSession/Agent.streamFunction interface shape
 * with an in-memory HTTP transport. No external Provider, no real Gate E.
 */
import {describe,expect,it} from 'bun:test'
import type {AgentSession} from '@earendil-works/pi-coding-agent'
import {Agent, type StreamFn} from '@earendil-works/pi-agent-core'
import {
  V3APiHttpSingleRequestEngine,
  type V3APiHttpSingleRequestFactory,
  type V3AHttpRequestTransport,
} from './review-v3-pi-http-provider-engine'
import {V3APhysicalSDKTurnPort} from './review-v3-sdk-physical-turn-port'
import type {V3APhysicalTurnInput} from './review-v3-sdk-physical-turn-port'
import {REVIEW_C0_SCHEMA_VERSION,type RunEvidenceIdentity} from '@profer/shared'

const run:RunEvidenceIdentity={
  schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId:'caseA',runId:'run1',
  caseRevision:1,planFingerprint:'plan1',templateVersion:'v1',
  inputManifestHash:'f'.repeat(64),sourceVersionIds:['dv1'],
  checkKeys:['check1'],attemptId:'attempt1',ownerGeneration:1,
}
const input:V3APhysicalTurnInput={
  run,mode:'direct',dispatchId:'main-durable-dispatch-1',
}
const model={api:'openai-completions',provider:'openai',id:'test'}
type NativeTurnEvent=
  | {type:'turn_start'}
  | {type:'turn_end';message:{role:'assistant';stopReason:'stop'|'error'|'toolUse'}}
  | {type:'agent_end';willRetry:boolean}
  | {type:'agent_settled'}
type SessionShim={
  agent:{state:{isStreaming:boolean};streamFunction:StreamFn}
  subscribe:(listener:(e:NativeTurnEvent)=>void)=>()=>void
  prompt:(prompt:string)=>Promise<void>
  dispose:()=>void
}

function makeHarness(options?:{
  nativeReceipt?:string|null
  httpStatus?:number
  origin?:string
  actualFetchOrigin?:string
  sends?:number
  modelApi?:string
  requestedTransport?:'sse'|'websocket'
  opaqueUpstreamFetch?:boolean
  redirectProbe?:boolean
  stopReason?:'stop'|'error'|'toolUse'
  noTurn?:boolean
  failAfterFetch?:boolean
  startAborted?:boolean
  abortDuringFetch?:boolean
  abortAfterSessionCreate?:boolean
  missingTurnStart?:boolean
  noAgentEnd?:boolean
  noAgentSettled?:boolean
  willRetry?:boolean
  earlyAgentEnd?:boolean
  duplicateTurnEnd?:boolean
  sseChunks?:string[]
  sseType?:string
}){
  let physicalCalls=0
  let streamCalls=0
  let restored=false
  let unsubscriberCalled=false
  let disposed=false
  const aborter=new AbortController()
  if(options?.startAborted)aborter.abort()
  let listener:((e:NativeTurnEvent)=>void)|undefined
  const original:StreamFn=async (_model,_context,streamOptions)=>{
    streamCalls++
    expect(streamOptions?.transport).toBe('sse')
    expect(streamOptions?.maxRetries).toBe(0)
    for(let i=0;i<(options?.sends??1);i++){
      const response=await streamOptions!.fetch!(
        (options?.actualFetchOrigin??'https://approved.example')+'/v1/chat/completions',
        {method:'POST'},
      )
      // The shim must consume the same response body the actual Pi OpenAI
      // streaming client consumes. Synthetic lifecycle events alone are not
      // sufficient evidence of SSE completion.
      await response.text()
    }
    if(options?.failAfterFetch)throw Error('provider streaming connection lost')
    if(!options?.noTurn){
      const turnEnd:NativeTurnEvent={
        type:'turn_end',message:{role:'assistant',stopReason:options?.stopReason??'stop'},
      }
      listener?.(turnEnd)
      if(options?.duplicateTurnEnd)listener?.(turnEnd)
    }
    return {} as Awaited<ReturnType<StreamFn>>
  }
  const session:SessionShim={
    agent:{state:{isStreaming:false},streamFunction:original},
    subscribe(cb){listener=cb;return ()=>{unsubscriberCalled=true;listener=undefined}},
    dispose(){disposed=true;listener=undefined},
    async prompt(prompt){
      expect(prompt).toBe('main-only frozen prompt')
      if(!options?.missingTurnStart)listener?.({type:'turn_start'})
      if(options?.earlyAgentEnd)listener?.({type:'agent_end',willRetry:false})
      await session.agent.streamFunction(
        {...model,api:options?.modelApi??model.api} as never,
        {messages:[]} as never,
        {transport:options?.requestedTransport??'sse',
          ...(options?.opaqueUpstreamFetch ? {fetch:globalThis.fetch}:{}),
        },
      )
      if(!options?.noAgentEnd)listener?.({
        type:'agent_end',willRetry:options?.willRetry??false,
      })
      if(!options?.noAgentSettled)listener?.({type:'agent_settled'})
    },
  }
  const factory:V3APiHttpSingleRequestFactory={create:async ()=>{
    if(options?.abortAfterSessionCreate)aborter.abort()
    const inner:Pick<AgentSession,'agent'|'prompt'|'subscribe'|'dispose'>=
      session as unknown as Pick<AgentSession,'agent'|'prompt'|'subscribe'|'dispose'>
    return {
      session:inner,prompt:'main-only frozen prompt',
      trustedOrigin:options?.origin??'https://approved.example',
      transportFetch:async (_url:Parameters<V3AHttpRequestTransport>[0],
        init?:Parameters<V3AHttpRequestTransport>[1])=>{
        physicalCalls++
        if(options?.redirectProbe){
          expect(init?.redirect).toBe('error')
          throw new TypeError('redirect blocked by HTTPS origin policy')
        }
        if(options?.abortDuringFetch){
          expect(init?.signal).toBeDefined()
          aborter.abort()
          expect(init?.signal?.aborted).toBe(true)
          throw new DOMException('Main aborted during HTTP transport','AbortError')
        }
        const headers=new Headers()
        if(options?.nativeReceipt!==null){
          headers.set('x-request-id',options?.nativeReceipt??'provider-request-1')
        }
        headers.set('content-type',options?.sseType??'text/event-stream')
        const chunks=options?.sseChunks??[
          'data: {"id":"one"}\\n\\n'.replaceAll('\\n','\n'),
          'data: [DONE]\\n\\n'.replaceAll('\\n','\n'),
        ]
        return new Response(new ReadableStream<Uint8Array>({
          start(controller){
            const encoder=new TextEncoder()
            for(const chunk of chunks)controller.enqueue(encoder.encode(chunk))
            controller.close()
          },
        }),{status:options?.httpStatus??200,headers})
      },
    }
  }}
  const engine=new V3APiHttpSingleRequestEngine(factory)
  const host=new V3APhysicalSDKTurnPort(engine)
  return {host,aborter,session,original,counts:()=>({
    physicalCalls,streamCalls,restored,unsubscriberCalled,disposed,
  }),
    markRestored:()=>{restored=session.agent.streamFunction===original},
  }
}

describe('A4-R10 pinned Pi 0.86.1 HTTP transport witness seam - in-memory Provider, not Gate E',()=>{
  it('R10-01: one HTTPS request ID plus successful Pi turn yields trusted transport receipt',async()=>{
    const h=makeHarness()
    expect(await h.host.nextTurn(input)).toEqual({
      kind:'completed-turn',run,dispatchId:input.dispatchId,
      receiptId:'provider-request-1',
    })
    h.markRestored()
    expect(h.counts()).toEqual({
      physicalCalls:1,streamCalls:1,restored:true,unsubscriberCalled:true,disposed:true,
    })
  })
  it('R12-01: Pi SDK session is disposed after a trusted physical HTTP turn',async()=>{
    const h=makeHarness()
    expect((await h.host.nextTurn(input)).kind).toBe('completed-turn')
    expect(h.counts().disposed).toBe(true)
    expect(h.counts().unsubscriberCalled).toBe(true)
    h.markRestored()
    expect(h.counts().restored).toBe(true)
  })
  it('R12-02: Pi SDK session is disposed on Provider failure with no fabricated receipt',async()=>{
    const h=makeHarness({failAfterFetch:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provider streaming connection lost')
    expect(h.counts().disposed).toBe(true)
    h.markRestored()
    expect(h.counts().restored).toBe(true)
  })
  it('R12-03: Pi SDK session is disposed on Main cancellation inside Provider HTTP fetch',async()=>{
    const h=makeHarness({abortDuringFetch:true})
    await expect(h.host.nextTurn({...input,signal:h.aborter.signal}))
      .rejects.toThrow('Main aborted during HTTP transport')
    expect(h.counts().disposed).toBe(true)
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R12-04: an invalid Main HTTPS origin disposes its new SDK session before prompt',async()=>{
    const h=makeHarness({origin:'http://invalid.example'})
    await expect(h.host.nextTurn(input)).rejects.toThrow('Only exact trusted HTTPS')
    expect(h.counts().disposed).toBe(true)
    expect(h.counts().streamCalls).toBe(0)
  })
  it('R12-05: Main cancellation during session creation disposes SDK before prompt',async()=>{
    const h=makeHarness({abortAfterSessionCreate:true})
    await expect(h.host.nextTurn({...input,signal:h.aborter.signal}))
      .rejects.toThrow('Main aborted after Pi session creation')
    expect(h.counts().disposed).toBe(true)
    expect(h.counts().streamCalls).toBe(0)
  })
  it('R14-01: HTTP 200 + native agent_settled without SSE terminal is not a receipt',async()=>{
    const h=makeHarness({sseChunks:['data: {"id":"partial"}\n\n']})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
    expect(h.counts().physicalCalls).toBe(1)
    expect(h.counts().disposed).toBe(true)
  })
  it('R14-02: HTTP 200 with non-SSE content type fails before a trusted receipt',async()=>{
    const h=makeHarness({sseType:'application/json'})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R14-03: real SSE marker split across physical chunks is accepted',async()=>{
    const h=makeHarness({sseChunks:['data: {"id":"one"}\n\n','data: [DO','NE]\r\n\r\n']})
    expect((await h.host.nextTurn(input)).kind).toBe('completed-turn')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R14-04: Responses API response.completed is an explicit SSE terminal',async()=>{
    const h=makeHarness({
      modelApi:'openai-responses',
      sseChunks:['event: response.completed\n','data: {"type":"response.completed"}\n\n'],
    })
    expect((await h.host.nextTurn(input)).kind).toBe('completed-turn')
  })
  it('R14-05: SSE text containing marker inside JSON is not a terminal frame',async()=>{
    const h=makeHarness({sseChunks:['data: {"text":"data: [DONE]"}\n\n']})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R15-01: Responses event header without a completed data frame fails closed',async()=>{
    const h=makeHarness({
      modelApi:'openai-responses',
      sseChunks:['event: response.completed\n\n'],
    })
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R15-02: Responses event with mismatched JSON type cannot attest completion',async()=>{
    const h=makeHarness({
      modelApi:'openai-responses',
      sseChunks:['event: response.completed\ndata: {"type":"response.failed"}\n\n'],
    })
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R15-03: unflushed response.completed data frame is not an SSE terminal',async()=>{
    const h=makeHarness({
      modelApi:'openai-responses',
      sseChunks:['event: response.completed\ndata: {"type":"response.completed"}\n'],
    })
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R15-04: completion marker without an SSE blank-frame delimiter is not trusted',async()=>{
    const h=makeHarness({sseChunks:['data: [DONE]\n']})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R15-05: two terminal frames cannot certify one physical request',async()=>{
    const h=makeHarness({sseChunks:['data: [DONE]\n\ndata: [DONE]\n\n']})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R15-06: multiline faux terminal is never equivalent to one SSE DONE event',async()=>{
    const h=makeHarness({sseChunks:['data: [DONE]\ndata: extra\n\n']})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R15-07: Responses frame split across multiple HTTP chunks completes once',async()=>{
    const h=makeHarness({modelApi:'openai-responses',sseChunks:[
      'event: response.', 'completed\r\ndata: {"type":',
      '"response.completed","response":{}}\r\n\r\n',
    ]})
    expect((await h.host.nextTurn(input)).kind).toBe('completed-turn')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R15-08: a completed Responses frame followed by a failed frame is corrupt',async()=>{
    const h=makeHarness({modelApi:'openai-responses',sseChunks:[
      'event: response.completed\ndata: {"type":"response.completed"}\n\n',
      'event: response.failed\ndata: {"type":"response.failed"}\n\n',
    ]})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R13-01: Pi turn_end without agent_settled cannot certify Provider completion',async()=>{
    const h=makeHarness({noAgentSettled:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
    expect(h.counts().physicalCalls).toBe(1)
    expect(h.counts().disposed).toBe(true)
  })
  it('R13-02: Pi agent_end willRetry forbids a trusted receipt before actual retry',async()=>{
    const h=makeHarness({willRetry:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R13-03: Pi missing turn_start invalidates otherwise plausible response',async()=>{
    const h=makeHarness({missingTurnStart:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    expect(h.counts().physicalCalls).toBe(0)
  })
  it('R13-04: Pi agent_end before physical fetch invalidates the turn',async()=>{
    const h=makeHarness({earlyAgentEnd:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    expect(h.counts().physicalCalls).toBe(0)
  })
  it('R13-05: duplicate turn_end after one request cannot certify another outcome',async()=>{
    const h=makeHarness({duplicateTurnEnd:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R13-06: native agent_settled without agent_end cannot issue completion',async()=>{
    const h=makeHarness({noAgentEnd:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R10-02: two HTTP fetch attempts fail closed despite a successful Pi turn',async()=>{
    const h=makeHarness({sends:2})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    h.markRestored()
    expect(h.counts().physicalCalls).toBe(1)
    expect(h.counts().restored).toBe(true)
  })
  it('R10-03: HTTP response without an upstream x-request-id cannot attest SDK turn',async()=>{
    const h=makeHarness({nativeReceipt:null})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
  })
  it('R10-04: Pi assistant turn_end without any successful transport is not completion',async()=>{
    const h=makeHarness({httpStatus:503})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R10-05: Pi result stopReason error cannot issue completed-turn receipt',async()=>{
    const h=makeHarness({stopReason:'error'})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R10-06: unsupported Anthropic provider API cannot use HTTP OpenAI witness',async()=>{
    const h=makeHarness({modelApi:'anthropic-messages'})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    expect(h.counts().physicalCalls).toBe(0)
  })
  it('R10-07: a different HTTPS origin than Main-pinned provider cannot be contacted',async()=>{
    const h=makeHarness({actualFetchOrigin:'https://foreign.example'})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    expect(h.counts().physicalCalls).toBe(0)
  })
  it('R10-08: non-HTTPS trusted origin is rejected before SDK prompt',async()=>{
    const h=makeHarness({origin:'http://approved.example'})
    await expect(h.host.nextTurn(input)).rejects.toThrow('Only exact trusted HTTPS')
    expect(h.counts().streamCalls).toBe(0)
  })
  it('R10-09: stream disconnect after HTTP headers is not trusted completion',async()=>{
    const h=makeHarness({failAfterFetch:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provider streaming connection lost')
    h.markRestored()
    expect(h.counts().restored).toBe(true)
  })
  it('R10-10: missing Pi native turn_end after HTTP response cannot count turn',async()=>{
    const h=makeHarness({noTurn:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('provenance unavailable')
  })
  it('R10-11: Main abort before session creation cannot invoke SDK',async()=>{
    const h=makeHarness({startAborted:true})
    await expect(h.host.nextTurn({...input,signal:h.aborter.signal})).rejects.toThrow(
      'Main cancelled before native SDK call',
    )
    expect(h.counts().streamCalls).toBe(0)
  })
  it('R10-SDK-01: installed pi-agent-core exposes writable Agent streamFunction surface',()=>{
    const streamFunction:StreamFn=()=>({} as ReturnType<StreamFn>)
    const agent=new Agent({streamFn:streamFunction})
    expect(agent.streamFunction).toBe(streamFunction)
    const replacement:StreamFn=()=>({} as ReturnType<StreamFn>)
    agent.streamFunction=replacement
    expect(agent.streamFunction).toBe(replacement)
  })
  it('R10-18: HTTP redirect following is disabled before native Provider fetch',async()=>{
    const h=makeHarness({redirectProbe:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('redirect blocked')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R10-17: Main AbortSignal propagates to the real Pi HTTP transport fetch',async()=>{
    const h=makeHarness({abortDuringFetch:true})
    await expect(h.host.nextTurn({...input,signal:h.aborter.signal}))
      .rejects.toThrow('Main aborted during HTTP transport')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R10-16: an opaque Pi-provided fetch wrapper is rejected instead of hiding retries',async()=>{
    const h=makeHarness({opaqueUpstreamFetch:true})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    expect(h.counts().physicalCalls).toBe(0)
  })
  it('R10-13: same Pi session cannot service another SDK physical dispatch',async()=>{
    const h=makeHarness()
    expect((await h.host.nextTurn(input)).kind).toBe('completed-turn')
    await expect(h.host.nextTurn({
      ...input,dispatchId:'another-durable-main-claim',
    })).rejects.toThrow('session reused')
    expect(h.counts().physicalCalls).toBe(1)
  })
  it('R10-14: existing WebSocket transport config must not silently become trusted HTTP',async()=>{
    const h=makeHarness({requestedTransport:'websocket'})
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
    expect(h.counts().physicalCalls).toBe(0)
  })
  it('R10-15: x-request-id equal to Main dispatch intent is not independent evidence',async()=>{
    const h=makeHarness({nativeReceipt:input.dispatchId})
    await expect(h.host.nextTurn(input)).rejects.toThrow(
      'Missing, duplicated or mismatched native Provider completion',
    )
  })
  it('R10-12: multiple SDK turn_end messages fail closed',async()=>{
    const h=makeHarness()
    const original=h.session.prompt
    h.session.prompt=async prompt=>{
      await original(prompt)
      // Can't access the private listener: issue a second call through the
      // wrapped streamFunction, which is a second physical model turn.
      await h.session.agent.streamFunction(
        {...model} as never,{messages:[]} as never,{} as never,
      )
    }
    await expect(h.host.nextTurn(input)).rejects.toThrow('request count/provenance')
  })
})
