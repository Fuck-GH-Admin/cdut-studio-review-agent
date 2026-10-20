/**
 * A4 actual multi-PID late-Host negative. A separate Bun child awaits a
 * physical Host read, then a second Main process revokes the disk Owner.
 * After release the child cannot persist the late v3 proposal.
 * Synthetic Host and Main ports: Gate O only, NOT Electron/Provider Gate E.
 */
import { spawn } from 'node:child_process'
import {
  existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'bun:test'
import {
  createFileOwnerPersistence, V3ReviewOwnerAdapter,
} from './review-pi-owner-adapter'
const ownerUri = pathToFileURL(
  fileURLToPath(new URL('./review-pi-owner-adapter.ts', import.meta.url)),
).href
const proposalUri = pathToFileURL(
  fileURLToPath(new URL('./review-v3-execution-proposal-producer.ts', import.meta.url)),
).href

async function waitForFile(path: string): Promise<void> {
  for (let attempt = 0; attempt < 500; attempt++) {
    if (existsSync(path)) return
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  throw new Error('Child did not reach Host await boundary')
}

describe('A4 R03 real two-PID after-await Owner revoke', () => {
  it('A4-LATE-PID-01: revocation while child Host awaits prevents proposal', async () => {
    if (process.platform !== 'linux') return
    const dir = mkdtempSync(join(tmpdir(), 'review-v3-a-late-pid-'))
    const ownerFile = join(dir, 'owner.json')
    const eventFile = join(dir, 'event.json')
    const ready = join(dir, 'ready')
    const release = join(dir, 'release')
    const resultFile = join(dir, 'result.json')
    const code = [
      "import {existsSync,writeFileSync} from 'node:fs';",
      "import {createFileOwnerPersistence,V3ReviewOwnerAdapter} from " + JSON.stringify(ownerUri) + ";",
      "import {V3AProposalProducer} from " + JSON.stringify(proposalUri) + ";",
      "const ownerFile=" + JSON.stringify(ownerFile) + ";",
      "const eventFile=" + JSON.stringify(eventFile) + ";",
      "const ready=" + JSON.stringify(ready) + ";",
      "const release=" + JSON.stringify(release) + ";",
      "const resultFile=" + JSON.stringify(resultFile) + ";",
      "const HASH='e'.repeat(64);",
      "const principal={source:'local',principalId:'main-owner',role:'reviewer',sessionId:'trusted-window',assurance:'local-device',scope:{caseIds:['case-a'],actions:['start-review']}};",
      "const source={schemaVersion:'review-c0/1',caseId:'case-a',materialId:'mat1',documentVersionId:'dv1',rawSha256:HASH,parseRevision:'parse1',blockId:'block1',location:{kind:'paragraph',locator:'1'}};",
      "const run={schemaVersion:'review-c0/1',runId:'run1',caseId:'case-a',caseRevision:1,planFingerprint:'plan1',templateVersion:'v1',inputManifestHash:HASH,sourceVersionIds:['dv1'],checkKeys:['check1'],attemptId:'attempt1',ownerGeneration:1};",
      "const plan={schemaVersion:'review-c0/1',planId:'p1',fingerprint:'plan1',templateId:'t1',templateVersion:'v1',moduleDigests:[],bindings:[{checkKey:'check1',targetKey:'target1',objectKey:'object1',subjectId:'subject1',sourceVersionIds:['dv1'],applicability:'applicable',conditionFingerprint:'cfp'}]};",
      "const authority={authorizeExecution:()=>{},isCurrent:()=>true};",
      "const owners=new V3ReviewOwnerAdapter(createFileOwnerPersistence(ownerFile),authority);",
      "const lease=owners.grant({principal,run,plan,sources:[source],sessionId:'review1',senderKey:'main-frame1',expiresAt:Date.now()+120000,permittedTools:['review_read_documents','review_submit_result']});",
      "const call={sessionId:lease.sessionId,grantId:lease.grantId,senderKey:lease.senderKey,principal,tool:'review_read_documents',source};",
      "const host={read:async s=>{writeFileSync(ready,'awaiting');while(!existsSync(release))await Bun.sleep(20);return{receiptId:'real-late-host',actualSource:s,extent:'block'}},check:async()=>{throw Error('unused')},terminal:async()=>{throw Error('unused')}};",
      "const producer=new V3AProposalProducer(createFileOwnerPersistence(eventFile),owners,host);",
      "let blocked=false;let code='';",
      "try{await producer.read(call)}catch(e){blocked=true;code=String(e)}",
      "const pending=producer.replayCandidates().length;",
      "writeFileSync(resultFile,JSON.stringify({blocked,code,pending,process:process.pid}));",
    ].join('\n')
    const child = spawn(process.execPath, ['-e', code], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stderr = ''
    child.stderr?.on('data', (buffer: Buffer) => { stderr += buffer.toString() })
    const closed = new Promise<number | null>((resolve, reject) => {
      child.on('error', reject)
      child.on('close', code => resolve(code))
    })
    try {
      await waitForFile(ready)
      const parentOwner = new V3ReviewOwnerAdapter(
        createFileOwnerPersistence(ownerFile),
        {authorizeExecution: () => {}, isCurrent: () => true},
      )
      expect(parentOwner.get('review1')?.state).toBe('recovery-required')
      parentOwner.revoke('review1')
      expect(parentOwner.get('review1')?.state).toBe('revoked')
      writeFileSync(release, 'release after revocation')
      const exitCode = await closed
      expect(exitCode).toBe(0)
      const result = JSON.parse(readFileSync(resultFile, 'utf8')) as {
        blocked: boolean
        code: string
        pending: number
        process: number
      }
      expect(result.process).not.toBe(process.pid)
      expect(result.blocked).toBe(true)
      expect(result.code).toContain('RECOVERY_REQUIRED')
      expect(result.pending).toBe(0)
      expect(existsSync(eventFile)).toBe(false)
      expect(stderr).toBe('')
    } finally {
      if (child.exitCode === null) child.kill('SIGKILL')
      rmSync(dir, {recursive: true, force: true})
    }
  }, 30000)
})
