import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  REVIEW_C0_SCHEMA_VERSION,
  type CanonicalPlan, type Principal, type RunEvidenceIdentity, type SourceIdentity,
} from '@profer/shared'
import { V3ReviewOwnerAdapter, createFileOwnerPersistence, type OwnerPersistence } from './review-pi-owner-adapter'
import {
  V3AProposalProducer, createAV3ProposalId, type AVerifiedExecutionHost,
} from './review-v3-execution-proposal-producer'

const HASH = 'c'.repeat(64)
class Store implements OwnerPersistence {
  data: string | null = null
  fail = false
  failAfterCommit = false
  read() { return this.data }
  write(v: string) {
    if (this.fail) throw Object.assign(new Error('ENOSPC'), {code:'ENOSPC'})
    this.data = v
    if (this.failAfterCommit) {
      this.failAfterCommit = false
      throw Object.assign(new Error('EIO after proposal replacement'), {code:'EIO'})
    }
  }
}
function setup(caseId = 'case-a', sessionId = 'session-a', applicability: 'applicable' | 'unknown' = 'applicable', checkCount = 1) {
  const ownerStore = new Store()
  const proposalStore = new Store()
  const principal: Principal = {
    source:'local', principalId:'attested-main', role:'reviewer', sessionId:'trusted-window',
    assurance:'local-device', scope:{caseIds:[caseId], actions:['start-review']},
  }
  const source: SourceIdentity = {
    schemaVersion:REVIEW_C0_SCHEMA_VERSION, caseId,materialId:'m1',
    documentVersionId:'dv1',rawSha256:HASH,parseRevision:'rev-1',
    blockId:'block-1',location:{kind:'paragraph',locator:'0'},
  }
  const run: RunEvidenceIdentity = {
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,runId:'run-'+caseId,caseId,
    caseRevision:3,planFingerprint:'p1',templateVersion:'v1',inputManifestHash:HASH,
    sourceVersionIds:['dv1'],checkKeys:Array.from({length:checkCount},(_,i)=>'check-'+(i+1)),attemptId:'attempt-'+caseId,
    ownerGeneration:1,
  }
  const plan: CanonicalPlan = {
    schemaVersion:REVIEW_C0_SCHEMA_VERSION,planId:'plan-1',fingerprint:'p1',
    templateId:'t1',templateVersion:'v1',moduleDigests:[],
    bindings:Array.from({length:checkCount},(_,i)=>({
      checkKey:'check-'+(i+1),targetKey:'target-'+(i+1),objectKey:'object-1',
      subjectId:'student-1',sourceVersionIds:['dv1'],applicability,
      conditionFingerprint:'cfp',
    })),
  }
  let permitted = true
  const gate = {
    authorizeExecution: () => { if (!permitted) throw new Error('Main authorization revoked') },
    isCurrent: () => permitted,
  }
  const owners = new V3ReviewOwnerAdapter(ownerStore,gate)
  const lease = owners.grant({
    principal,run,plan,sources:[source],sessionId,senderKey:'main:frame11',
    permittedTools:['review_read_documents','review_submit_result'],
    expiresAt:Date.now()+60_000,
  })
  const call = {
    sessionId,grantId:lease.grantId,senderKey:lease.senderKey,principal,
    tool:'review_read_documents' as const,source,
  }
  let actualRead = {receiptId:'host-read-1',actualSource:source,extent:'block' as const}
  let actualCheck = {
    receiptId:'host-check-1',
    actualCheck:{checkKey:'check-1',targetKey:'target-1',
      objectKey:'object-1',subjectId:'student-1',status:'accepted' as const},
  }
  let actualTerminal = {
    receiptId:'host-terminal-1',actualStatus:'partial' as const,
  }
  const host: AVerifiedExecutionHost = {
    read:async () => actualRead,
    check:async binding => checkCount === 9 ? ({
      receiptId:'host-'+binding.checkKey,
      actualCheck:{
        checkKey:binding.checkKey,targetKey:binding.targetKey,
        objectKey:binding.objectKey,subjectId:binding.subjectId,
        status:'accepted' as const,
      },
    }) : actualCheck,
    terminal:async () => actualTerminal,
  }
  const producer = new V3AProposalProducer(proposalStore,owners,host)
  return {
    ownerStore,proposalStore,owners,producer,principal,source,run,plan,call,host,gate,
    grantId:lease.grantId,
    revoke:()=>owners.revoke(sessionId),
    denyMain:()=>{permitted=false},
    setRead:(x:Awaited<ReturnType<AVerifiedExecutionHost['read']>>) => {
      actualRead=x as typeof actualRead
    },
    setCheck:(x:Awaited<ReturnType<AVerifiedExecutionHost['check']>>) => {
      actualCheck=x as typeof actualCheck
    },
    setTerminal:(x:Awaited<ReturnType<AVerifiedExecutionHost['terminal']>>) => {
      actualTerminal=x as typeof actualTerminal
    },
  }
}
const tuple={checkKey:'check-1',targetKey:'target-1',objectKey:'object-1',subjectId:'student-1'}
const checkCall = (h: ReturnType<typeof setup>) => ({
  ...h.call,tool:'review_submit_result' as const,source:undefined,
})
describe('Dev-A versioned CR-A-001 A-1 proposal producer (Main Host only)', () => {
  it('A2-V3-01: read contains frozen full Run/source and canonical C eventId, block is not full document', async () => {
    const h=setup()
    const first=await h.producer.read(h.call)
    expect(first.kind).toBe('read')
    expect(first.sequence).toBe(1)
    expect(first.run).toEqual(h.run)
    expect(first.schemaVersion).toBe('review-v3-execution/1')
    if (first.kind!=='read') throw new Error('read expected')
    expect(first.read).toEqual({source:h.source,extent:'block'})
    const {eventId,...payload}=first
    expect(eventId).toBe(createAV3ProposalId(payload))
    expect(eventId).toMatch(/^[a-f0-9]{64}$/)
    expect(await h.producer.read(h.call)).toEqual(first)
    expect(h.producer.replayCandidates()).toEqual([first])
    const loaded=new V3AProposalProducer(h.proposalStore,h.owners,h.host)
    expect(loaded.replayCandidates()).toEqual([first])
  })
  it('A2-V3-02: full-document needs Host physical block-count evidence; source mismatch denies', async () => {
    const h=setup()
    h.setRead({receiptId:'unverified-full',actualSource:h.source,extent:'full-document'})
    await expect(h.producer.read(h.call)).rejects.toThrow()
    expect(h.producer.replayCandidates()).toEqual([])
    h.setRead({receiptId:'verified-full',actualSource:h.source,extent:'full-document',
      coveredPhysicalBlocks:7,totalPhysicalBlocks:7})
    const result=await h.producer.read(h.call)
    expect(result.kind).toBe('read')
    if (result.kind!=='read') throw new Error('read expected')
    expect(result.read.extent).toBe('full-document')
    h.setRead({receiptId:'forged',actualSource:{...h.source,blockId:'another'},
      extent:'block'})
    await expect(h.producer.read(h.call)).rejects.toThrow()
    expect(h.producer.replayCandidates()).toHaveLength(1)
  })
  it('A2-V3-03: exact Check×target with Host status, replay and changed-receipt collision denial', async () => {
    const h=setup()
    const call=checkCall(h)
    const check=await h.producer.check(call,tuple)
    expect(check.kind).toBe('check')
    expect(check.sequence).toBe(1)
    if (check.kind!=='check') throw new Error('check expected')
    expect(check.check).toEqual({...tuple,status:'accepted'})
    expect(await h.producer.check(call,tuple)).toEqual(check)
    h.setCheck({receiptId:'host-check-1',actualCheck:{...tuple,status:'rejected'}})
    await expect(h.producer.check(call,tuple)).rejects.toThrow()
    expect(h.producer.replayCandidates()).toHaveLength(1)
    await expect(h.producer.check(call,{...tuple,targetKey:'wrong'})).rejects.toThrow()
  })
  it('A2-V3-04: accepted Check for unknown applicability is forbidden', async () => {
    const h=setup('case-a','session-a','unknown')
    expect(h.owners.get(h.call.sessionId)?.planSnapshot?.bindings[0]?.applicability)
      .toBe('unknown')
    await expect(h.producer.check(checkCall(h),tuple)).rejects.toThrow()
    expect(h.producer.replayCandidates()).toEqual([])
    h.setCheck({receiptId:'host-unknown',actualCheck:{...tuple,status:'unknown'}})
    const unknown=await h.producer.check(checkCall(h),tuple)
    if (unknown.kind!=='check') throw new Error('check expected')
    expect(unknown.check.status).toBe('unknown')
    h.setTerminal({receiptId:'host-complete',actualStatus:'completed-technical'})
    await expect(h.producer.terminal(checkCall(h),'completed-technical')).rejects.toThrow()
  })

  it('A2-V3-05: revoke during awaited Host read/check creates no event', async () => {
    const h=setup()
    let release!: (x: Awaited<ReturnType<AVerifiedExecutionHost['read']>>) => void
    h.host.read=async()=>new Promise<Awaited<ReturnType<AVerifiedExecutionHost['read']>>>(resolve=>{release=resolve})
    const promise=h.producer.read(h.call)
    h.revoke()
    release({receiptId:'late-read',actualSource:h.source,extent:'block'})
    await expect(promise).rejects.toThrow()
    expect(h.producer.replayCandidates()).toEqual([])
    await expect(h.producer.check(checkCall(h),tuple)).rejects.toThrow()
  })
  it('A2-V3-06: technical terminal requires actual Host receipt; no business PASS', async () => {
    const h=setup()
    const call=checkCall(h)
    await expect(h.producer.terminal(call,'completed-technical')).rejects.toThrow()
    h.setTerminal({receiptId:'host-partial',actualStatus:'partial'})
    const t=await h.producer.terminal(call,'partial')
    expect(t.kind).toBe('terminal')
    expect(t.sequence).toBe(1)
    if (t.kind!=='terminal') throw new Error('terminal expected')
    expect(t.terminal.status).toBe('partial')
    await expect(h.producer.check(call,tuple)).rejects.toThrow()
    expect(h.producer.replayCandidates()).toEqual([t])
  })
  it('A3-V3-09: technical complete requires durable physical read and every applicable Check', async () => {
    const h=setup()
    const terminalCall=checkCall(h)
    h.setTerminal({receiptId:'host-complete',actualStatus:'completed-technical'})
    await expect(h.producer.terminal(terminalCall,'completed-technical')).rejects.toThrow()
    await h.producer.read(h.call)
    await expect(h.producer.terminal(terminalCall,'completed-technical')).rejects.toThrow()
    h.setCheck({receiptId:'accepted-required',actualCheck:{...tuple,status:'accepted'}})
    const check=await h.producer.check(terminalCall,tuple)
    expect(check.sequence).toBe(2)
    const completed=await h.producer.terminal(terminalCall,'completed-technical')
    expect(completed.kind).toBe('terminal')
    if (completed.kind!=='terminal') throw new Error('terminal expected')
    expect(completed.sequence).toBe(3)
    expect(completed.terminal.status).toBe('completed-technical')
    expect(h.producer.replayCandidates()).toHaveLength(3)
    // No Host access may occur after a persisted terminal, including replaying
    // a formerly valid read receipt.
    let physicalReads=0
    let physicalChecks=0
    h.host.read=async()=>{physicalReads++;throw Error('forbidden read after terminal')}
    h.host.check=async()=>{physicalChecks++;throw Error('forbidden check after terminal')}
    await expect(h.producer.read(h.call)).rejects.toThrow('Terminal proposal already sealed')
    await expect(h.producer.check(terminalCall,tuple)).rejects.toThrow('Terminal proposal already sealed')
    expect(physicalReads).toBe(0)
    expect(physicalChecks).toBe(0)
    expect(h.producer.replayCandidates()).toHaveLength(3)
  })

  it('A3-V3-13: 8/9 does not complete, 9/9 persisted exact Check tuples do', async () => {
    const h=setup('case-nine','session-nine','applicable',9)
    const call=checkCall(h)
    await h.producer.read(h.call)
    h.setTerminal({receiptId:'terminal-nine',actualStatus:'completed-technical'})
    for(let i=1;i<=8;i++) {
      const request={checkKey:'check-'+i,targetKey:'target-'+i,
        objectKey:'object-1',subjectId:'student-1'}
      const outcome=await h.producer.check(call,request)
      expect(outcome.kind).toBe('check')
      expect(outcome.sequence).toBe(i+1)
    }
    await expect(h.producer.terminal(call,'completed-technical')).rejects.toThrow()
    const ninth=await h.producer.check(call,{
      checkKey:'check-9',targetKey:'target-9',objectKey:'object-1',subjectId:'student-1',
    })
    expect(ninth.sequence).toBe(10)
    const terminal=await h.producer.terminal(call,'completed-technical')
    expect(terminal.sequence).toBe(11)
    expect(h.producer.replayCandidates()).toHaveLength(11)
    if(terminal.kind!=='terminal') throw new Error('terminal expected')
    expect(terminal.terminal.status).toBe('completed-technical')
  })

  it('A3-V3-10: rejected/unknown Host Check cannot be turned into completed', async () => {
    const h=setup()
    const call=checkCall(h)
    await h.producer.read(h.call)
    h.setCheck({receiptId:'host-rejected',actualCheck:{...tuple,status:'rejected'}})
    await h.producer.check(call,tuple)
    h.setTerminal({receiptId:'host-complete',actualStatus:'completed-technical'})
    await expect(h.producer.terminal(call,'completed-technical')).rejects.toThrow()
    h.setCheck({receiptId:'host-unknown',actualCheck:{...tuple,status:'unknown'}})
    await h.producer.check(call,tuple)
    await expect(h.producer.terminal(call,'completed-technical')).rejects.toThrow()
    expect(h.producer.replayCandidates().map(e=>e.kind)).toEqual(['read','check','check'])
  })

  it('A3-V3-14: conflicting accepted/rejected Host results cannot pass technical completion', async () => {
    const h=setup()
    await h.producer.read(h.call)
    await h.producer.check(checkCall(h),tuple)
    h.setCheck({receiptId:'changed-host-result',actualCheck:{...tuple,status:'rejected'}})
    const dispute=await h.producer.check(checkCall(h),tuple)
    expect(dispute.kind).toBe('check')
    h.setTerminal({receiptId:'host-claims-complete',actualStatus:'completed-technical'})
    await expect(h.producer.terminal(checkCall(h),'completed-technical')).rejects.toThrow()
    const chain=h.producer.replayCandidates()
    expect(chain.map(x=>x.kind)).toEqual(['read','check','check'])
  })

  it('A2-V3-11: disk-backed Host proposals replay without reviving cold Owner authority', async () => {
    const dir=mkdtempSync(join(tmpdir(),'review-v3-a-proposals-'))
    try {
      const h=setup()
      const file=join(dir,'v3-proposals.json')
      const persistence=createFileOwnerPersistence(file)
      const producer=new V3AProposalProducer(persistence,h.owners,h.host)
      const first=await producer.read(h.call)
      expect(readFileSync(file,'utf8')).toContain('v3-dev-a-v3-proposals/1')
      const coldOwner=new V3ReviewOwnerAdapter(h.ownerStore,h.gate)
      const coldProducer=new V3AProposalProducer(persistence,coldOwner,h.host)
      expect(coldProducer.replayCandidates()).toEqual([first])
      await expect(coldProducer.read(h.call)).rejects.toThrow()
      expect(coldProducer.replayCandidates()).toEqual([first])
      writeFileSync(file,readFileSync(file,'utf8')+'tamper')
      expect(()=>new V3AProposalProducer(persistence,coldOwner,h.host)).toThrow()
    } finally {
      rmSync(dir,{recursive:true,force:true})
    }
  })

  it('A-PAUSE-V3-01: grant rotation preserves sequence but does not inherit old technical coverage', async () => {
    const h=setup()
    const first=await h.producer.read(h.call)
    const originalCheck=await h.producer.check(checkCall(h),tuple)
    expect(first.sequence).toBe(1)
    expect(originalCheck.sequence).toBe(2)
    h.owners.pause(h.call.sessionId)
    const resumed=h.owners.resumePaused(h.call.sessionId,h.grantId,
      h.call.senderKey,h.principal)
    const readCall={...h.call,grantId:resumed.grantId}
    const submitCall={...checkCall(h),grantId:resumed.grantId}
    h.setTerminal({receiptId:'new-terminal',actualStatus:'completed-technical'})
    await expect(h.producer.terminal(submitCall,'completed-technical')).rejects.toThrow()
    // A Host receipt from the old grant cannot be re-issued under the new grant.
    await expect(h.producer.read(readCall)).rejects.toThrow()
    h.setRead({receiptId:'new-grant-read',actualSource:h.source,extent:'block'})
    const newRead=await h.producer.read(readCall)
    expect(newRead.sequence).toBe(3)
    h.setCheck({receiptId:'new-grant-check',actualCheck:{...tuple,status:'accepted'}})
    const newCheck=await h.producer.check(submitCall,tuple)
    expect(newCheck.sequence).toBe(4)
    const terminal=await h.producer.terminal(submitCall,'completed-technical')
    expect(terminal.sequence).toBe(5)
    const replay=new V3AProposalProducer(h.proposalStore,h.owners,h.host)
      .replayCandidates()
    expect(replay.map(x=>x.permissionGrantId)).toEqual([
      h.grantId,h.grantId,resumed.grantId,resumed.grantId,resumed.grantId,
    ])
    expect(replay.map(x=>x.sequence)).toEqual([1,2,3,4,5])
    expect(replay.at(-1)?.kind).toBe('terminal')
  })

  it('A-PAUSE-V3-02: awaited pre-pause Host read is refused after rotated grant', async () => {
    const h=setup()
    let resolveRead!: (receipt: Awaited<ReturnType<AVerifiedExecutionHost['read']>>) => void
    h.host.read=async()=>new Promise<Awaited<ReturnType<AVerifiedExecutionHost['read']>>>(
      resolve=>{resolveRead=resolve})
    const late=h.producer.read(h.call)
    h.owners.pause(h.call.sessionId)
    const resumed=h.owners.resumePaused(h.call.sessionId,h.grantId,
      h.call.senderKey,h.principal)
    resolveRead({receiptId:'pre-pause-late',actualSource:h.source,extent:'block'})
    await expect(late).rejects.toThrow()
    expect(h.producer.replayCandidates()).toHaveLength(0)
    const freshCall={...h.call,grantId:resumed.grantId}
    h.host.read=async source=>({receiptId:'after-resume',actualSource:source,extent:'block'})
    expect((await h.producer.read(freshCall)).sequence).toBe(1)
  })

  it('A2-V3-07: disk-full append cannot be returned as delivered or acknowledged', async () => {
    const h=setup()
    h.proposalStore.fail=true
    await expect(h.producer.read(h.call)).rejects.toThrow('ENOSPC')
    expect(h.producer.replayCandidates()).toEqual([])
    h.proposalStore.fail=false
    expect((await h.producer.read(h.call)).sequence).toBe(1)
  })
  it('A4-V3-12: uncertain post-commit proposal persists once; no invented ACK', async () => {
    const h=setup()
    h.proposalStore.failAfterCommit=true
    await expect(h.producer.read(h.call)).rejects.toThrow('EIO after proposal replacement')
    expect(()=>h.producer.replayCandidates()).toThrow()
    const fresh=new V3AProposalProducer(h.proposalStore,h.owners,h.host)
    const candidate=fresh.replayCandidates()
    expect(candidate).toHaveLength(1)
    expect(candidate[0]?.sequence).toBe(1)
    const repeat=await fresh.read(h.call)
    expect(candidate[0]).toBeDefined()
    expect(repeat).toEqual(candidate[0]!)
    expect(fresh.replayCandidates()).toHaveLength(1)
    // An A outbox record has no C-issued durable consumption ACK yet.
  })

  it('A2-V3-08: stale external append or corrupt on-disk journal fails closed', async () => {
    const h=setup()
    const stale=new V3AProposalProducer(h.proposalStore,h.owners,h.host)
    await h.producer.read(h.call)
    expect(()=>stale.replayCandidates()).toThrow()
    await expect(stale.read(h.call)).rejects.toThrow()
    h.proposalStore.data=(h.proposalStore.data??'')+'corrupt'
    expect(()=>new V3AProposalProducer(h.proposalStore,h.owners,h.host)).toThrow()
  })
})
