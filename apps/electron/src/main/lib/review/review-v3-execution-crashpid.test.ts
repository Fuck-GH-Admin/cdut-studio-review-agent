/**
 * A4 real OS-PID crash with a durable Host V3 proposal. Linux-only SIGKILL
 * tests, not Electron/Provider Gate E nor Dev-C's formal ACK/Run consumer.
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'bun:test'
import {
  createFileOwnerPersistence, V3ReviewOwnerAdapter,
} from './review-pi-owner-adapter'
import { V3AProposalProducer } from './review-v3-execution-proposal-producer'
import type { V3ReviewToolCall } from './review-execution-event-adapter'

const ownerUri = pathToFileURL(
  fileURLToPath(new URL('./review-pi-owner-adapter.ts', import.meta.url)),
).href
const proposalUri = pathToFileURL(
  fileURLToPath(new URL('./review-v3-execution-proposal-producer.ts', import.meta.url)),
).href
const authority = {
  authorizeExecution: () => {},
  isCurrent: () => true,
}
type ChildRecord = {
  pid: number
  sessionId: string
  grantId: string
  call: V3ReviewToolCall
}

function childDiesAfterHostRead(root: string, pause: boolean): {
  ownerFile: string
  eventsFile: string
  record: ChildRecord
} {
  const ownerFile = join(root, 'owner.json')
  const eventsFile = join(root, 'v3-events.json')
  const marker = join(root, 'marker.json')
  const code = [
    "import {writeFileSync} from 'node:fs';",
    "import {createFileOwnerPersistence,V3ReviewOwnerAdapter} from " + JSON.stringify(ownerUri) + ";",
    "import {V3AProposalProducer} from " + JSON.stringify(proposalUri) + ";",
    "const ownerFile=" + JSON.stringify(ownerFile) + ";",
    "const eventsFile=" + JSON.stringify(eventsFile) + ";",
    "const marker=" + JSON.stringify(marker) + ";",
    "const pause=" + JSON.stringify(pause) + ";",
    "const HASH='d'.repeat(64);",
    "const principal={source:'local',principalId:'main-owner',role:'reviewer',sessionId:'trusted-window',assurance:'local-device',scope:{caseIds:['case-a'],actions:['start-review']}};",
    "const source={schemaVersion:'review-c0/1',caseId:'case-a',materialId:'mat1',documentVersionId:'dv1',rawSha256:HASH,parseRevision:'parse1',blockId:'block1',location:{kind:'paragraph',locator:'1'}};",
    "const run={schemaVersion:'review-c0/1',runId:'run1',caseId:'case-a',caseRevision:1,planFingerprint:'plan1',templateVersion:'v1',inputManifestHash:HASH,sourceVersionIds:['dv1'],checkKeys:['check1'],attemptId:'attempt1',ownerGeneration:1};",
    "const plan={schemaVersion:'review-c0/1',planId:'p1',fingerprint:'plan1',templateId:'t1',templateVersion:'v1',moduleDigests:[],bindings:[{checkKey:'check1',targetKey:'target1',objectKey:'object1',subjectId:'subject1',sourceVersionIds:['dv1'],applicability:'applicable',conditionFingerprint:'cfp'}]};",
    "const authority={authorizeExecution:()=>{},isCurrent:()=>true};",
    "const owners=new V3ReviewOwnerAdapter(createFileOwnerPersistence(ownerFile),authority);",
    "const lease=owners.grant({principal,run,plan,sources:[source],sessionId:'review1',senderKey:'main-frame1',expiresAt:Date.now()+120000,permittedTools:['review_read_documents','review_submit_result']});",
    "const call={sessionId:lease.sessionId,grantId:lease.grantId,senderKey:lease.senderKey,principal,tool:'review_read_documents',source};",
    "const host={read:async s=>({receiptId:'host-real-1',actualSource:s,extent:'block'}),check:async()=>{throw Error('unused')},terminal:async()=>{throw Error('unused')}};",
    "const producer=new V3AProposalProducer(createFileOwnerPersistence(eventsFile),owners,host);",
    "const event=await producer.read(call);",
    "if(event.sequence!==1||event.kind!=='read')process.exit(13);",
    "if(pause)owners.pause(lease.sessionId);",
    "writeFileSync(marker,JSON.stringify({pid:process.pid,sessionId:lease.sessionId,grantId:lease.grantId,call}));",
    "process.kill(process.pid,'SIGKILL');",
    "process.exit(14);",
  ].join('\n')
  const processResult = spawnSync(process.execPath, ['-e', code], {
    encoding: 'utf8', timeout: 30000,
  })
  expect(processResult.error).toBeUndefined()
  expect(processResult.signal).toBe('SIGKILL')
  expect(processResult.status).toBeNull()
  const record = JSON.parse(readFileSync(marker, 'utf8')) as ChildRecord
  expect(record.pid).not.toBe(process.pid)
  return {ownerFile, eventsFile, record}
}

describe('A4 R03 crashed Main owner and V3 Host event in separate PID', () => {
  for (const state of ['active', 'paused'] as const) {
    it('A4-CRASH-' + state + ': cold-process replay never resurrects a grant', async () => {
      if (process.platform !== 'linux') return
      const root = mkdtempSync(join(tmpdir(), 'v3-a-crash-pid-'))
      try {
        const {ownerFile, eventsFile, record} =
          childDiesAfterHostRead(root, state === 'paused')
        const owners = new V3ReviewOwnerAdapter(
          createFileOwnerPersistence(ownerFile), authority,
        )
        expect(owners.get(record.sessionId)?.state).toBe('recovery-required')
        const host = {
          read: async (s: NonNullable<V3ReviewToolCall['source']>) => ({
            receiptId:'host-new',actualSource:s,extent:'block' as const,
          }),
          check: async () => {throw Error('unused')},
          terminal: async () => {throw Error('unused')},
        }
        const producer = new V3AProposalProducer(
          createFileOwnerPersistence(eventsFile), owners, host,
        )
        const replay = producer.replayCandidates()
        expect(replay).toHaveLength(1)
        expect(replay[0]?.kind).toBe('read')
        expect(replay[0]?.sequence).toBe(1)
        expect(replay[0]?.permissionGrantId).toBe(record.grantId)
        await expect(producer.read(record.call)).rejects.toThrow()
        expect(owners.quarantineInterrupted()).toEqual([record.sessionId])
        expect(owners.get(record.sessionId)?.state).toBe('recovery-required')
        expect(() => owners.assertOrdinarySession(record.sessionId)).toThrow()
        expect(producer.replayCandidates()).toEqual(replay)
      } finally {
        rmSync(root, {recursive:true, force:true})
      }
    })
  }
})
