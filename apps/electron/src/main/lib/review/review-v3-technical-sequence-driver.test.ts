/** Dev-A R21 Main-only sequence unit contracts.
 * Existing physical bridge tests independently verify SDK/CAS boundaries.
 * These tests cover ONLY the new multi-turn orchestrator (not Gate E).
 */
import {describe,expect,it} from 'bun:test'
import type {V3ReviewOwnerAdapter,V3OwnerLease} from './review-pi-owner-adapter'
import type {V3ATurnBudget} from './review-v3-execution-turn-budget'
import type {V3ASDKTurnBridge,V3ATurnDriveResult,V3ASDKMode}
  from './review-v3-main-sdk-turn-bridge'
import {V3ATechnicalSequenceDriver,
  type V3ATechnicalSequence} from './review-v3-technical-sequence-driver'

function fixture(){
  const modes:V3ASDKMode[]=[]
  let used=0,authorized=true
  let advance:((mode:V3ASDKMode)=>Promise<V3ATurnDriveResult>)|null=null
  const owners={
    assertAuthorized:()=>{
      if(!authorized)throw new Error('Owner revoked across SDK await')
      return {sessionId:'seq-session',runId:'seq-run',
        processEpoch:'old-test'} as V3OwnerLease
    },
  } as unknown as V3ReviewOwnerAdapter
  const turns={
    snapshot:()=>({usedTurns:used,maxTurns:24,exhausted:used===24}),
  } as unknown as V3ATurnBudget
  const sdk={
    next:async (_call:unknown,mode:V3ASDKMode):Promise<V3ATurnDriveResult>=>{
      modes.push(mode)
      if(advance)return advance(mode)
      used++
      return {kind:'recorded',
        turn:{usedTurns:used,maxTurns:24,exhausted:used===24}}
    },
  } as V3ASDKTurnBridge
  const driver=new V3ATechnicalSequenceDriver(owners,turns,sdk)
  const call={sessionId:'seq-session',grantId:'g1',senderKey:'s1',
    principal:{},tool:'review_submit_result' as const}
  const plan=(modes:V3ASDKMode[],expectedUsedTurns=0):V3ATechnicalSequence=>({
    version:'v3-dev-a-technical-sequence/1',expectedUsedTurns,modes,
  })
  return {driver,call,plan,modes,getUsed:()=>used,
    setAuthorized:(v:boolean)=>{authorized=v},
    onNext:(fn:(mode:V3ASDKMode)=>Promise<V3ATurnDriveResult>)=>{advance=fn},
    charge:()=>{used++}}
}
describe('Dev-A R21 Main-only multi-turn execution, no C business writer',()=>{
  it('R21-01: one plan sequentially advances four modes with durable counters',async()=>{
    const x=fixture()
    const r=await x.driver.execute(x.call,x.plan(['direct','hidden','graph','batch']))
    expect(r).toEqual({kind:'steps-completed',executed:4,
      budget:{usedTurns:4,maxTurns:24,exhausted:false}})
    expect(x.modes).toEqual(['direct','hidden','graph','batch'])
    expect(x.getUsed()).toBe(4)
    await expect(x.driver.execute(x.call,x.plan(['batch'],0)))
      .rejects.toThrow('starting counter is stale')
    expect(x.modes).toHaveLength(4)
  })
  it('R21-02: SDK unknown side effect and revoked Owner do not retry',async()=>{
    const x=fixture()
    x.onNext(async()=>{
      throw new Error('Provider uncertain: leave durable dispatch in-flight')
    })
    await expect(x.driver.execute(x.call,x.plan(['batch','batch','batch'])))
      .rejects.toThrow('Provider uncertain')
    expect(x.modes).toEqual(['batch'])
    expect(x.getUsed()).toBe(0)
    const y=fixture()
    y.onNext(async()=>{
      y.charge()
      y.setAuthorized(false)
      return {kind:'recorded',
        turn:{usedTurns:1,maxTurns:24,exhausted:false}}
    })
    await expect(y.driver.execute(y.call,y.plan(['hidden','hidden'])))
      .rejects.toThrow('Owner revoked')
    expect(y.modes).toHaveLength(1)
  })
  it('R21-03: preabort and terminal stop without a speculative next SDK',async()=>{
    const x=fixture()
    const controller=new AbortController()
    controller.abort()
    await expect(x.driver.execute(x.call,x.plan(['graph']),controller.signal))
      .rejects.toThrow('cancelled')
    expect(x.modes).toHaveLength(0)
    const y=fixture()
    y.onNext(async()=>{
      y.charge()
      return {kind:'terminal-proposal',status:'needs-resume',
        event:{kind:'terminal'} as Extract<V3ATurnDriveResult,
          {kind:'terminal-proposal'}>['event']}
    })
    const final=await y.driver.execute(y.call,y.plan(['batch','batch']))
    expect(final.kind).toBe('terminal-proposal')
    expect(final.executed).toBe(0)
    expect(y.modes).toHaveLength(1)
  })
})
