/**
 * Dev-A R20-01: read-only, Linux-local Owner crash recovery evidence.
 * This port NEVER removes a lock, revives a grant, authorizes an operator,
 * decides a Case, or reconciles Provider side effects. C retains those rights.
 *
 * A historical .write-lock is an empty exclusive file with NO authenticated
 * process identity. The supplied OS witness is therefore evidence for review,
 * NOT an authority to steal a lock. Unknown/recycled/live PIDs fail closed.
 */
import {createHash} from 'node:crypto'
import {existsSync,lstatSync,readFileSync} from 'node:fs'

const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
function refuse(why:string):never{
  throw new Error('A_R20_RECOVERY_REQUIRED: '+why)
}
export interface A20LinuxProcessIdentity {
  readonly pid:number
  readonly bootId:string
  readonly startTicks:string
}
export interface A20OwnerWitness extends A20LinuxProcessIdentity {
  readonly sessionId:string
  readonly processEpoch:string
  readonly caseId:string
}
/** /proc/[pid]/stat field 22, after the LAST ')' in a process name. */
export function observeA20LinuxProcess(pid:number):A20LinuxProcessIdentity|null{
  if(process.platform!=='linux')refuse('Linux OS identity unavailable')
  if(!Number.isSafeInteger(pid)||pid<=0)refuse('invalid owner PID')
  let boot:string
  try{boot=readFileSync('/proc/sys/kernel/random/boot_id','utf8').trim()}
  catch{return refuse('cannot verify kernel boot identity')}
  if(!/^[a-f0-9-]{36}$/.test(boot))refuse('invalid kernel boot identity')
  let raw:string
  try{raw=readFileSync('/proc/'+pid+'/stat','utf8')}
  catch(error){
    if(error && typeof error==='object' && 'code' in error &&
      (error as {code?:string}).code==='ENOENT')return null
    return refuse('cannot establish process identity or permission')
  }
  const end=raw.lastIndexOf(')')
  const fields=raw.slice(end+2).trim().split(/\s+/)
  if(end<1||fields.length<20||
    !/^[0-9]+$/.test(fields[19]??''))refuse('malformed kernel process identity')
  return {pid,bootId:boot,startTicks:fields[19]!}
}
function sealed(file:string,optional=false):{
  digest:string;payload:Record<string,unknown>
}|null {
  if(optional && !existsSync(file))return null
  let raw:string
  try{raw=readFileSync(file,'utf8')}
  catch{return refuse('required recovery journal missing or inaccessible')}
  let obj:{payload:Record<string,unknown>;sha256:string}
  try{obj=JSON.parse(raw) as typeof obj}
  catch{return refuse('recovery journal is not parseable')}
  if(!obj?.payload||typeof obj.payload!=='object'||
    Array.isArray(obj.payload)||
    obj.sha256!==sha(JSON.stringify(obj.payload))){
    refuse('recovery journal digest mismatch')
  }
  return {digest:sha(raw),payload:obj.payload}
}
export type A20RecoveryVerdict =
  'OPERATOR_REVIEW_REQUIRED'|'DENY_OWNER_LIVE'|
  'DENY_PID_REUSED'|'DENY_BOOT_CHANGED'
export interface A20RecoveryEvidence {
  readonly version:'v3-dev-a-owner-recovery-evidence/1'
  readonly witness:A20OwnerWitness
  readonly verdict:A20RecoveryVerdict
  readonly ownerSha256:string
  readonly dispatchSha256:string
  readonly turnSha256:string|null
  readonly lockDev:string
  readonly lockIno:string
  readonly lockSize:number
  readonly unresolvedDispatchId:string
  readonly usedTurns:number
  readonly ownerState:'active'|'paused'|'recovery-required'
  readonly evidenceHash:string
}
export interface A20RecoveryPaths {
  readonly owner:string
  readonly dispatch:string
  readonly turns:string
}
/** Does not remove or change any file, including the legacy empty .write-lock. */
export function inspectA20OwnerRecovery(
  paths:A20RecoveryPaths,witness:A20OwnerWitness,
):A20RecoveryEvidence {
  if(!witness?.sessionId||!witness.processEpoch||!witness.caseId||
    !/^[a-f0-9-]{36}$/.test(witness.bootId)||
    !/^[0-9]+$/.test(witness.startTicks)||
    !Number.isSafeInteger(witness.pid)||witness.pid<=0){
    refuse('incomplete external OS/Owner witness')
  }
  const lock=paths.owner+'.write-lock'
  let stat:ReturnType<typeof lstatSync>
  try{stat=lstatSync(lock)}catch{return refuse('no recoverable Owner write lock')}
  if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1){
    refuse('Owner lock is not a single regular inode')
  }
  const owner=sealed(paths.owner)
  const dispatch=sealed(paths.dispatch)
  const turns=sealed(paths.turns,true)
  if(!owner||!dispatch)refuse('missing mandatory Owner or Dispatch journal')
  if(owner.payload.version!=='v3-dev-a-owner/1'||
     dispatch.payload.version!=='v3-dev-a-sdk-dispatch/1'){
    refuse('unexpected technical journal version')
  }
  const leases=owner.payload.owners as Record<string,{
    state:string;caseId:string;processEpoch:string
  }> | undefined
  const prior=leases?.[witness.sessionId]
  if(!prior||prior.caseId!==witness.caseId||
    prior.processEpoch!==witness.processEpoch||
    !['active','paused','recovery-required'].includes(prior.state)){
    refuse('Owner epoch/session/case not anchored to sealed disk')
  }
  const runs=dispatch.payload.runs as Record<string,{
    records:{id:string;caseId?:string;sessionId?:string;state:string}[]
  }> | undefined
  if(!runs||typeof runs!=='object'||Array.isArray(runs))refuse('Dispatch chains missing')
  const unresolved=Object.values(runs).flatMap(v=>v.records??[])
    .filter(v=>v.caseId===witness.caseId&&
      v.sessionId===witness.sessionId&&
      (v.state==='in-flight'||v.state==='late-denied'))
  if(unresolved.length!==1||!unresolved[0]?.id){
    refuse('expected exactly one unresolved physical dispatch')
  }
  let usedTurns=0
  if(turns){
    if(turns.payload.version!=='v3-dev-a-turns/1')refuse('wrong Turn journal')
    const turnRuns=turns.payload.runs as Record<string,{
      usedTurns:number
    }> | undefined
    if(!turnRuns||typeof turnRuns!=='object'||Array.isArray(turnRuns)){
      refuse('invalid Turn journal')
    }
    for(const v of Object.values(turnRuns)){
      if(!Number.isSafeInteger(v.usedTurns)||v.usedTurns<0)refuse('invalid turns')
      usedTurns+=v.usedTurns
    }
  }
  const live=observeA20LinuxProcess(witness.pid)
  const verdict:A20RecoveryVerdict=
    live?.bootId!==undefined&&live.bootId!==witness.bootId
      ?'DENY_BOOT_CHANGED'
      :live&&live.startTicks!==witness.startTicks
        ?'DENY_PID_REUSED'
        :live?'DENY_OWNER_LIVE':'OPERATOR_REVIEW_REQUIRED'
  const proof={
    version:'v3-dev-a-owner-recovery-evidence/1' as const,
    witness:{...witness},verdict,
    ownerSha256:owner.digest,dispatchSha256:dispatch.digest,
    turnSha256:turns?.digest??null,
    lockDev:String(stat.dev),lockIno:String(stat.ino),lockSize:stat.size,
    unresolvedDispatchId:unresolved[0].id,usedTurns,
    ownerState:prior.state as 'active'|'paused'|'recovery-required',
  }
  return {...proof,evidenceHash:sha(JSON.stringify(proof))}
}
/** Fresh re-read; a prior snapshot or stale operator message is not reusable. */
export function assertA20RecoveryEvidenceFresh(
  paths:A20RecoveryPaths,prior:A20RecoveryEvidence,
):A20RecoveryEvidence{
  const now=inspectA20OwnerRecovery(paths,prior.witness)
  if(now.evidenceHash!==prior.evidenceHash){
    refuse('Owner/dispatch/Turn/lock or OS identity changed during recovery')
  }
  return now
}
