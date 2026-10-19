import {describe, expect, it} from 'bun:test'
import {REVIEW_C0_SCHEMA_VERSION, type RunEvidenceIdentity} from '@profer/shared'
import {
  V3APhysicalSDKTurnPort, type V3ANativeProviderWitness,
  type V3ANativeSingleRequestEngine, type V3APhysicalTurnInput,
} from './review-v3-sdk-physical-turn-port'

const run:RunEvidenceIdentity={
  schemaVersion:REVIEW_C0_SCHEMA_VERSION,caseId:'caseA',runId:'run1',
  caseRevision:1,planFingerprint:'plan1',templateVersion:'v1',
  inputManifestHash:'f'.repeat(64),sourceVersionIds:['dv1'],
  checkKeys:['check1'],attemptId:'attempt1',ownerGeneration:1,
}
const input=(signal?:AbortSignal):V3APhysicalTurnInput=>({
  run,mode:'hidden',dispatchId:'persisted-dispatch-1',signal,
})
const engine=(fn:V3ANativeSingleRequestEngine['invoke'])=>new V3APhysicalSDKTurnPort({invoke:fn})

describe('A4-R07 direct native physical SDK turn witness (synthetic hook; NO Gate E)',()=>{
  it('R07-01: exact one native started+completed request returns Main technical callback',async()=>{
    let observed=0
    const host=engine(async (_input,witness)=>{
      observed++
      witness.requestStarted('native-req-1')
      witness.requestFinished({
        nativeRequestId:'native-req-1',nativeReceiptId:'native-receipt-1',
        status:'completed',
      })
    })
    expect(await host.nextTurn(input())).toEqual({
      kind:'completed-turn',run,dispatchId:'persisted-dispatch-1',
      receiptId:'native-receipt-1',
    })
    expect(observed).toBe(1)
  })
  it('R07-02: a query success or assistant stream without direct native witness is NOT a receipt',async()=>{
    const host=engine(async()=>{ /* a SDKMessage result.success cannot attest one Provider call */ })
    await expect(host.nextTurn(input())).rejects.toThrow('provenance unavailable')
  })
  it('R07-03: SDK native retry or image fallback second physical call is latched unsafe',async()=>{
    const host=engine(async (_input,witness)=>{
      witness.requestStarted('native-req-1')
      witness.requestFinished({
        nativeRequestId:'native-req-1',nativeReceiptId:'native-receipt-1',
        status:'completed',
      })
      try{witness.requestStarted('native-req-2')}catch{ /* malicious/buggy SDK swallowed it */ }
    })
    await expect(host.nextTurn(input())).rejects.toThrow('provenance unavailable')
  })
  it('R07-04: forged native receipt equal to persisted Main dispatch is rejected',async()=>{
    const host=engine(async (_input,witness)=>{
      witness.requestStarted('native-req-1')
      try{
        witness.requestFinished({
          nativeRequestId:'native-req-1',nativeReceiptId:'persisted-dispatch-1',
          status:'completed',
        })
      }catch{ /* swallow */ }
    })
    await expect(host.nextTurn(input())).rejects.toThrow('provenance unavailable')
  })
  it('R07-05: wrong native request ID fails even if callback caught by engine',async()=>{
    const host=engine(async (_input,witness)=>{
      witness.requestStarted('native-req-1')
      try{
        witness.requestFinished({
          nativeRequestId:'foreign-provider-request',
          nativeReceiptId:'native-receipt-1',status:'completed',
        })
      }catch{}
    })
    await expect(host.nextTurn(input())).rejects.toThrow('provenance unavailable')
  })
  it('R07-06: Provider exception after request started never manufactures a technical receipt',async()=>{
    const host=engine(async (_input,witness)=>{
      witness.requestStarted('native-req-1')
      throw Error('Provider socket destroyed after possible dispatch')
    })
    await expect(host.nextTurn(input())).rejects.toThrow('Provider socket destroyed')
  })
  it('R07-07: Main already-aborted request does not enter physical SDK engine',async()=>{
    const controller=new AbortController()
    controller.abort()
    let calls=0
    const host=engine(async()=>{calls++})
    await expect(host.nextTurn(input(controller.signal))).rejects.toThrow(
      'Main cancelled before native SDK call')
    expect(calls).toBe(0)
  })
  it('R07-08: cancellation after verified callback still denies turn completion',async()=>{
    const controller=new AbortController()
    const host=engine(async (_input,witness)=>{
      witness.requestStarted('native-req-1')
      witness.requestFinished({
        nativeRequestId:'native-req-1',nativeReceiptId:'native-receipt-1',
        status:'completed',
      })
      controller.abort()
    })
    await expect(host.nextTurn(input(controller.signal))).rejects.toThrow(
      'Main aborted after native SDK Provider dispatch')
  })
  it('R07-09: native cancelled/failed receipt is interrupted, not completed turn',async()=>{
    const host=engine(async (_input,witness)=>{
      witness.requestStarted('native-req-1')
      witness.requestFinished({
        nativeRequestId:'native-req-1',nativeReceiptId:'native-cancel-1',
        status:'cancelled',
      })
    })
    expect(await host.nextTurn(input())).toEqual({
      kind:'interrupted',status:'cancelled',dispatchId:'persisted-dispatch-1',run,
    })
  })
  it('R07-10: late native hook after engine completion cannot upgrade absent receipt',async()=>{
    let leaked:V3ANativeProviderWitness|undefined
    const host=engine(async (_input,witness)=>{
      witness.requestStarted('native-req-1')
      leaked=witness
    })
    await expect(host.nextTurn(input())).rejects.toThrow('provenance unavailable')
    expect(()=>leaked!.requestFinished({
      nativeRequestId:'native-req-1',nativeReceiptId:'late-native-receipt',
      status:'completed',
    })).toThrow('Missing, duplicated or mismatched native Provider completion')
  })
  it('R07-14: invalid Run or mode is rejected before entering native Provider',async()=>{
    let calls=0
    const host=engine(async()=>{calls++})
    await expect(host.nextTurn({...input(),run:{...run,caseId:''}}))
      .rejects.toThrow()
    await expect(host.nextTurn({...input(),mode:'untrusted' as V3APhysicalTurnInput['mode']}))
      .rejects.toThrow('Unsupported SDK Host execution mode')
    expect(calls).toBe(0)
  })
  it('R07-11: Main dispatch identity missing is not delegated to SDK',async()=>{
    let calls=0
    const host=engine(async()=>{calls++})
    await expect(host.nextTurn({...input(),dispatchId:''}))
      .rejects.toThrow('Main persistent dispatch identity required')
    expect(calls).toBe(0)
  })
})
