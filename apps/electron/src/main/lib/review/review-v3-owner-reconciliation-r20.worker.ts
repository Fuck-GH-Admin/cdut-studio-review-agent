/**
 * R20-02C independently spawned Bun PID competing for one technical
 * A-only reconciliation INTENT. It never clears Owner lock or runs Provider.
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {inspectA20OwnerRecovery,type A20OwnerWitness} from
  './review-v3-owner-recovery-evidence'
import {recordA20RecoveryIntent} from './review-v3-owner-reconciliation-intent'
const [root,id]=process.argv.slice(2)
if(!root||!id)throw Error('R20 worker needs fixture and requestId')
const witness=JSON.parse(readFileSync(join(root,'r20-witness.json'),'utf8')) as A20OwnerWitness
const paths={owner:join(root,'owner.json'),dispatch:join(root,'dispatch.json'),
  turns:join(root,'turns.json')}
const proof=inspectA20OwnerRecovery(paths,witness)
const result=recordA20RecoveryIntent(paths,join(root,'reviewed-intent.json'),
  id,proof,e=>({
    operatorId:'offline-only-r20-worker',approvalId:'r20-approval-'+id,
    reviewedEvidenceHash:e.evidenceHash,approvedEpoch:e.witness.processEpoch,
    approvalScope:'A_ONLY_TECHNICAL_REVIEW',
  }))
process.stdout.write('R20_INTENT_WIN '+JSON.stringify({
  pid:process.pid,requestId:result.requestId,
  state:result.state,noLockTakeover:result.noLockTakeover,
})+'\n')
