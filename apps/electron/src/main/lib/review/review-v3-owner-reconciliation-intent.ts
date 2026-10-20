/**
 * Dev-A R20-02: durable A-only operator review INTENT, not lock recovery.
 *
 * A historic Owner .write-lock has no authenticated PID metadata. Even with
 * a kernel dead-PID observation we CANNOT grant a production lock takeover:
 * only a separate privileged Dev-C Main authority can approve and execute it.
 * This port records exactly one sealed, reviewed technical proposal. Neither
 * this API nor its receipt can restart Provider work or authorize a C Case.
 */
import {createHash} from 'node:crypto'
import {createFileOwnerPersistence} from './review-pi-owner-adapter'
import {assertA20RecoveryEvidenceFresh,
  type A20RecoveryEvidence,type A20RecoveryPaths} from './review-v3-owner-recovery-evidence'

const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
const reject=(why:string):never=>{throw new Error('A_R20_OPERATOR_REVIEW_REQUIRED: '+why)}
export interface A20OperatorAttestation {
  readonly operatorId:string
  readonly approvalId:string
  readonly reviewedEvidenceHash:string
  readonly approvedEpoch:string
  readonly approvalScope:'A_ONLY_TECHNICAL_REVIEW'
}
export interface A20RecoveryIntent {
  readonly version:'v3-dev-a-recovery-intent/1'
  readonly requestId:string
  readonly witnessEvidenceHash:string
  readonly ownerEpoch:string
  readonly dispatchId:string
  readonly operator:A20OperatorAttestation
  readonly noProviderReplay:true
  readonly noLockTakeover:true
  readonly state:'REVIEWED_NOT_EXECUTED'
}
interface Envelope {
  payload:A20RecoveryIntent
  sha256:string
}
export function readA20RecoveryIntent(filePath:string):Readonly<A20RecoveryIntent>|null{
  const raw=createFileOwnerPersistence(filePath).read()
  if(raw===null)return null
  let record:Envelope
  try{record=JSON.parse(raw) as Envelope}catch{return reject('corrupt intent journal')}
  if(record?.payload?.version!=='v3-dev-a-recovery-intent/1'||
    record.sha256!==sha(JSON.stringify(record.payload))||
    record.payload.noProviderReplay!==true||
    record.payload.noLockTakeover!==true||
    record.payload.state!=='REVIEWED_NOT_EXECUTED'){
    reject('intent journal is not sealed or only a technical review')
  }
  return structuredClone(record.payload)
}
/** This is an A-only technical review callback, NOT a C Main operator grant. */
export type A20IndependentReviewPort=(
  evidence:Readonly<A20RecoveryEvidence>,
)=>A20OperatorAttestation
export function recordA20RecoveryIntent(
  paths:A20RecoveryPaths,intentFile:string,requestId:string,
  evidence:A20RecoveryEvidence,review:A20IndependentReviewPort,
):Readonly<A20RecoveryIntent>{
  if(!requestId||requestId.length>128||!/^[a-zA-Z0-9_.-]+$/.test(requestId)){
    reject('invalid recovery review request identity')
  }
  if(typeof review!=='function')reject('independent technical review missing')
  const initial=assertA20RecoveryEvidenceFresh(paths,evidence)
  if(initial.verdict!=='OPERATOR_REVIEW_REQUIRED'){
    reject('old PID is live, recycled or otherwise not safely established')
  }
  const approved=review(structuredClone(initial))
  if(!approved||!approved.operatorId?.trim()||!approved.approvalId?.trim()||
    approved.reviewedEvidenceHash!==initial.evidenceHash||
    approved.approvedEpoch!==initial.witness.processEpoch||
    approved.approvalScope!=='A_ONLY_TECHNICAL_REVIEW'){
    reject('operator review did not bind exact evidence and epoch')
  }
  // Re-read after review; credentials and in-memory callbacks do not freeze
  // OS process state, dispatch, turns or the original lock inode.
  assertA20RecoveryEvidenceFresh(paths,initial)
  const candidate:A20RecoveryIntent={
    version:'v3-dev-a-recovery-intent/1',
    requestId,witnessEvidenceHash:initial.evidenceHash,
    ownerEpoch:initial.witness.processEpoch,
    dispatchId:initial.unresolvedDispatchId,
    operator:structuredClone(approved),
    noProviderReplay:true,noLockTakeover:true,
    state:'REVIEWED_NOT_EXECUTED',
  }
  const persistence=createFileOwnerPersistence(intentFile)
  const previous=persistence.read()
  if(previous!==null){
    const old=readA20RecoveryIntent(intentFile)
    if(JSON.stringify(old)===JSON.stringify(candidate))return candidate
    return reject('review receipt collision: cannot overwrite earlier intent')
  }
  const payload:Envelope={payload:candidate,
    sha256:sha(JSON.stringify(candidate))}
  // OS-exclusive file CAS; two independent PIDs may propose but only one
  // can durably win the first intent. Crash ambiguity requires reread.
  const compareAndWrite=persistence.compareAndWrite
  if(!compareAndWrite){
    throw new Error('A_R20_OPERATOR_REVIEW_REQUIRED: physical CAS unavailable')
  }
  compareAndWrite(null,JSON.stringify(payload))
  return candidate
}
