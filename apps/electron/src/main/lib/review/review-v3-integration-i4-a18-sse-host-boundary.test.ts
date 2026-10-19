/**
 * Integrator-I I4 A18: exact A R18 native HTTP/SSE safety vs C R03 physical Host observer
 * contrasted with C R03 independently observed physical Host receipts.
 *
 * Only in-memory HTTPS transport + native Pi lifecycle shim. This never wires
 * Electron, a real Provider, C-owned Main ingress, Plan publication or C2 ACK.
 * A18 exact-source replay authorized by C; candidate awaits separate new C engineering signoff.
 */
import {describe, expect, test} from 'bun:test'
import type {AgentSession} from '@earendil-works/pi-coding-agent'
import type {StreamFn} from '@earendil-works/pi-agent-core'
import {
  REVIEW_C0_SCHEMA_VERSION, type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import {
  V3APiHttpSingleRequestEngine, type V3AHttpRequestTransport,
  type V3APiHttpSingleRequestFactory,
} from './review-v3-pi-http-provider-engine'
import {V3APhysicalSDKTurnPort} from './review-v3-sdk-physical-turn-port'
import {C2MainPhysicalHostReceiptRegistry} from './review-v3-main-host-receipt-registry'
import type {C2MainHostWitness, C2MainOwnerWitness} from './review-v3-main-trust-port'

type PiEvent =
  | {type:'turn_start'}
  | {type:'turn_end';message:{role:'assistant';stopReason:'stop'}}
  | {type:'agent_end';willRetry:boolean}
  | {type:'agent_settled'}
type PiShim = {
  agent: {state:{isStreaming:boolean};streamFunction:StreamFn}
  subscribe:(callback:(event:PiEvent)=>void)=>()=>void
  prompt:(text:string)=>Promise<void>
  dispose:()=>void
}

let serial=0
function fixture(options?:{
  missingTerminal?:boolean
  doublePhysicalFetch?:boolean
  abortAfterResponse?:boolean
  revokeDuringFetch?:boolean
  sseBody?:string
  api?:'openai-completions'|'openai-responses'
}){
  const caseId='i3-physical-witness-'+(++serial)
  const run:RunEvidenceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId,runId:'run-'+caseId,
    caseRevision:1,attemptId:'attempt-1',ownerGeneration:5,
    planFingerprint:'a'.repeat(64),templateVersion:'v1',
    inputManifestHash:'b'.repeat(64),sourceVersionIds:['doc-v1'],
    checkKeys:['check-1'],
  }
  const source:SourceIdentity={
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId,
    materialId:'doc-1',documentVersionId:'doc-v1',
    rawSha256:'c'.repeat(64),parseRevision:'parser-1',
    blockId:'paragraph-1',location:{kind:'paragraph',locator:'p1'},
  }
  const nativeResponseId='https-provider-'+caseId
  const actualHostId='physical-host-'+caseId
  const grant='main-grant-5'
  let ownerActive=true
  let physicalFetches=0
  let upstreamCalls=0
  let disposed=false
  let unsubscribed=false
  let listener:((event:PiEvent)=>void)|undefined
  const controller=new AbortController()
  const original:StreamFn=async (_model,_context,options)=>{
    expect(options?.maxRetries).toBe(0)
    expect(options?.transport).toBe('sse')
    const target='https://provider.example.test/v1/chat/completions'
    const response=await options!.fetch!(target,{method:'POST'})
    expect(response.ok).toBe(true)
    await response.text() // the exact response body that the SDK consumes
    if(options?.transport!=='sse')throw Error('Untrusted transport')
    if(fixtureOptions.doublePhysicalFetch){
      await options!.fetch!(target,{method:'POST'})
    }
    if(fixtureOptions.abortAfterResponse)controller.abort()
    listener?.({type:'turn_end',message:{role:'assistant',stopReason:'stop'}})
    return {} as Awaited<ReturnType<StreamFn>>
  }
  const agent={state:{isStreaming:false},streamFunction:original}
  const shim:PiShim={
    agent,
    subscribe(callback){listener=callback;return ()=>{unsubscribed=true;listener=undefined}},
    dispose(){disposed=true;listener=undefined},
    async prompt(text){
      expect(text).toBe('main-verified-test-prompt')
      listener?.({type:'turn_start'})
      await agent.streamFunction(
        {api:fixtureOptions.api??'openai-completions',provider:'openai',id:'main-fixture'} as never,
        {messages:[]} as never,
        {transport:'sse'} as never,
      )
      listener?.({type:'agent_end',willRetry:false})
      listener?.({type:'agent_settled'})
    },
  }
  const fixtureOptions=options??{}
  const actualTransport:V3AHttpRequestTransport=async(_resource,init)=>{
    upstreamCalls++
    expect(init?.redirect).toBe('error')
    if(fixtureOptions.revokeDuringFetch)ownerActive=false
    const sse=fixtureOptions.sseBody ?? (fixtureOptions.missingTerminal
      ? 'data: {"choices":[]}\n\n'
      : 'data: {"choices":[]}\n\ndata: [DONE]\n\n')
    return new Response(sse,{
      status:200,
      headers:{
        'content-type':'text/event-stream; charset=utf-8',
        'x-request-id':nativeResponseId,
      },
    })
  }
  const factory:V3APiHttpSingleRequestFactory={
    create:async () => ({
      session:shim as unknown as Pick<AgentSession,'agent'|'prompt'|'subscribe'|'dispose'>,
      prompt:'main-verified-test-prompt',
      trustedOrigin:'https://provider.example.test',
      transportFetch:async (...args)=>{
        physicalFetches++
        return actualTransport(...args)
      },
    }),
  }
  const port=new V3APhysicalSDKTurnPort(new V3APiHttpSingleRequestEngine(factory))
  const observer=new Map<string,C2MainHostWitness>()
  const currentOwner=():C2MainOwnerWitness|undefined=>ownerActive?{
    run,permissionGrantId:grant,active:true,
    ownerGeneration:run.ownerGeneration,inputManifestHash:run.inputManifestHash,
  }:undefined
  const registry=new C2MainPhysicalHostReceiptRegistry({
    getObservedPhysicalReceipt:id=>observer.get(id),
    getCurrentOwner:currentOwner,
  })
  const host:C2MainHostWitness={
    run,hostReceiptId:actualHostId,permissionGrantId:grant,
    verified:{permissionGrantId:grant,kind:'read',source,extent:'block'},
  }
  const input={run,dispatchId:'dispatch-'+caseId,mode:'direct' as const,signal:controller.signal}
  return{
    input,source,run,port,host,observer,registry,nativeResponseId,
    get physicalFetches(){return physicalFetches},
    get upstreamCalls(){return upstreamCalls},
    get disposed(){return disposed},
    get unsubscribed(){return unsubscribed},
    get streamRestored(){return agent.streamFunction===original},
    revoke:()=>{ownerActive=false},
  }
}

describe('I4 A18 exact native HTTP SSE vs independent C physical Host boundary',()=>{
  test('I4-A18-01: a fully flushed Responses terminal is A-only; C Read requires independent observer',async()=>{
    const f=fixture({api:'openai-responses',sseBody:'event: response.completed\ndata: {"type":"response.completed"}\n\n'})
    const result=await f.port.nextTurn(f.input)
    expect(result.kind).toBe('completed-turn')
    if(result.kind!=='completed-turn')throw Error('A native terminal not completed')
    expect(result.receiptId).toBe(f.nativeResponseId)
    expect(f.physicalFetches).toBe(1)
    expect(f.registry.getPhysicalHostReceipt(f.nativeResponseId)).toBeUndefined()
    expect(()=>f.registry.rememberObservedReceipt(f.nativeResponseId)).toThrow('independently observed')
    f.observer.set(f.host.hostReceiptId,structuredClone(f.host))
    f.registry.rememberObservedReceipt(f.host.hostReceiptId)
    const physical=f.registry.getPhysicalHostReceipt(f.host.hostReceiptId)
    expect(physical?.verified.kind).toBe('read')
    expect(physical?.verified.source?.documentVersionId).toBe(f.source.documentVersionId)
    expect(f.registry.getPhysicalHostReceipt(f.nativeResponseId)).toBeUndefined()
  })
  test('I4-A18-02: event header without Responses terminal payload never authorizes C Host',async()=>{
    const f=fixture({api:'openai-responses',sseBody:'event: response.completed\n\n'})
    await expect(f.port.nextTurn(f.input)).rejects.toThrow()
    expect(f.physicalFetches).toBe(1)
    expect(f.registry.getPhysicalHostReceipt(f.nativeResponseId)).toBeUndefined()
  })
  test('I4-A18-03: terminal without blank-frame delimiter never authorizes C Host',async()=>{
    const f=fixture({sseBody:'data: [DONE]\n'})
    await expect(f.port.nextTurn(f.input)).rejects.toThrow()
    expect(f.physicalFetches).toBe(1)
    expect(f.registry.getPhysicalHostReceipt(f.nativeResponseId)).toBeUndefined()
  })
  test('I4-A18-04: duplicate SSE terminal never authorizes C Host receipt',async()=>{
    const f=fixture({sseBody:'data: [DONE]\n\ndata: [DONE]\n\n'})
    await expect(f.port.nextTurn(f.input)).rejects.toThrow()
    expect(f.physicalFetches).toBe(1)
    expect(f.registry.getPhysicalHostReceipt(f.nativeResponseId)).toBeUndefined()
  })
  test('I4-A18-05: an independent C Host Read cannot survive Owner revocation even if A HTTP terminal succeeds',async()=>{
    const f=fixture({revokeDuringFetch:true,sseBody:'data: [DONE]\n\n'})
    f.observer.set(f.host.hostReceiptId,structuredClone(f.host))
    const result=await f.port.nextTurn(f.input)
    expect(result.kind).toBe('completed-turn')
    expect(()=>f.registry.rememberObservedReceipt(f.host.hostReceiptId)).toThrow('Owner')
    expect(f.registry.getPhysicalHostReceipt(f.host.hostReceiptId)).toBeUndefined()
    expect(f.registry.getPhysicalHostReceipt(f.nativeResponseId)).toBeUndefined()
  })
})
