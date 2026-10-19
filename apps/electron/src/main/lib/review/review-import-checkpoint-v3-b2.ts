/**
 * B2 durable ORIGINAL ZIP checkpoint, separate from CurrentCase, Run and Batch.
 * A persisted archive is NEVER a trusted installed MaterialVersion: after restart
 * a newly authenticated Main owner must re-stage with a new token/generation.
 *
 * Contract to Dev-C: caller must supply an authenticated B2MainContext and
 * trusted Native-picker physicalArchiveKey. This vault has no public IPC.
 */
import { createHash, randomBytes } from 'node:crypto'
import {
  closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync,
  renameSync, rmSync, statSync, writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { getConfigDir } from '../config-paths'
import { type B2MainContext, ReviewB2StagingService } from './review-intake-adapter-v3-b2'
import { stageReviewB2TrustedZip, type B2TrustedZipInput, type B2ZipImportPreview } from './review-zip-staging-v3-b2'
import { decodeReviewB2Zip, type B2ZipLimits, type B2ZipFileReceipt } from './review-zip-intake-v3-b2'

const sha256 = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex')
const code = (s: string): never => { throw new Error('B2_ARCHIVE_' + s) }
const idPattern = /^[A-Za-z0-9._:-]{1,128}$/
export interface B2ArchiveCheckpoint {
  schemaVersion: 'review-b2-archive/1'
  archiveId: string
  caseCandidateId: string
  ownerId: string
  /** Original generation for audit, NOT reusable as a token after restart. */
  stagedOwnerGeneration: number
  requestId: string
  physicalArchiveKeyDigest: string
  archiveSha256: string
  byteLength: number
  fileReceipts: B2ZipFileReceipt[]
  checkpointState: 'bytes-durable-needs-confirmation'
  manifestSha256: string
}
export interface B2RestageIntent {
  checkpoint: B2ArchiveCheckpoint
  /** New Main authentication MUST reissue tokens; no stale candidate IDs. */
  restage: B2TrustedZipInput
  status: 'needs-main-revalidation'
}
const sealedDigest = (record: Omit<B2ArchiveCheckpoint, 'manifestSha256'>): string =>
  sha256(JSON.stringify(record))
export class ReviewB2ArchiveVault {
  constructor(private readonly staging: ReviewB2StagingService,
    private readonly baseDirectory = join(getConfigDir(), 'review-v3-b2-intake-archives')) {}
  private id(ctx: B2MainContext, input: Pick<B2TrustedZipInput, 'requestId' | 'physicalArchiveKey'>): string {
    if (!idPattern.test(input.requestId) || !input.physicalArchiveKey?.trim() ||
        input.physicalArchiveKey.length > 256) code('IDENTITY_INVALID')
    return sha256(JSON.stringify([ctx.ownerId,ctx.caseCandidateId,input.requestId,input.physicalArchiveKey])).slice(0,40)
  }
  private directory(archiveId: string): string {
    if (!/^[a-f0-9]{40}$/.test(archiveId)) code('ID_INVALID')
    return join(this.baseDirectory,archiveId)
  }
  private ensureOwner(ctx:B2MainContext, checkpoint:B2ArchiveCheckpoint):void {
    this.staging.assertStillGranted(ctx)
    if (checkpoint.ownerId!==ctx.ownerId || checkpoint.caseCandidateId!==ctx.caseCandidateId) {
      code('OWNER_SCOPE_MISMATCH')
    }
  }
  private readVerified(ctx: B2MainContext, archiveId: string): {checkpoint:B2ArchiveCheckpoint; bytes:Buffer} {
    this.staging.assertStillGranted(ctx)
    const dir=this.directory(archiveId)
    let checkpoint:B2ArchiveCheckpoint, bytes:Buffer
    try {
      checkpoint=JSON.parse(readFileSync(join(dir,'checkpoint.json'),'utf8')) as B2ArchiveCheckpoint
      bytes=readFileSync(join(dir,'archive.zip'))
    } catch { code('RECOVERY_REQUIRED') }
    this.ensureOwner(ctx, checkpoint!)
    const {manifestSha256,...plain}=checkpoint!
    if (checkpoint!.schemaVersion!=='review-b2-archive/1' ||
        checkpoint!.archiveId!==archiveId ||
        checkpoint!.checkpointState!=='bytes-durable-needs-confirmation' ||
        checkpoint!.byteLength!==bytes!.length ||
        sha256(bytes!)!==checkpoint!.archiveSha256 ||
        sealedDigest(plain)!==manifestSha256) code('CHECKPOINT_INTEGRITY')
    return {checkpoint:structuredClone(checkpoint!),bytes:Buffer.from(bytes!)}
  }
  /**
   * Central ZIP verification is done BEFORE writing. Store original bytes + hash
   * in isolated directory. Manifest commit happens last after fsynced archive;
   * a partial disk commit is RECOVERY_REQUIRED (never silently accepted).
   */
  saveAndStage(ctx:B2MainContext, input:B2TrustedZipInput, limits?:B2ZipLimits):
    { checkpoint:B2ArchiveCheckpoint; preview:B2ZipImportPreview } {
    this.staging.assertStillGranted(ctx)
    const archiveId=this.id(ctx,input)
    const archiveHash=sha256(input.bytes)
    const dir=this.directory(archiveId)
    let checkpoint:B2ArchiveCheckpoint
    if (existsSync(join(dir,'checkpoint.json'))) {
      const old=this.readVerified(ctx,archiveId)
      if (old.checkpoint.archiveSha256!==archiveHash) code('REQUEST_ID_COLLISION')
      checkpoint=old.checkpoint
    } else {
      const decoded=decodeReviewB2Zip(input.bytes,limits)
      mkdirSync(dir,{recursive:true,mode:0o700})
      const lock=join(dir,'write.lock')
      let fd:number
      try { fd=openSync(lock,'wx',0o600) } catch { code('CHECKPOINT_LOCKED') }
      try {
        if (existsSync(join(dir,'archive.zip')) || existsSync(join(dir,'checkpoint.json'))) code('RECOVERY_REQUIRED')
        const plain:Omit<B2ArchiveCheckpoint,'manifestSha256'>={
          schemaVersion:'review-b2-archive/1',archiveId,
          caseCandidateId:ctx.caseCandidateId,ownerId:ctx.ownerId,
          stagedOwnerGeneration:ctx.ownerGeneration,
          requestId:input.requestId,physicalArchiveKeyDigest:sha256(input.physicalArchiveKey),
          archiveSha256:decoded.archiveSha256,byteLength:input.bytes.byteLength,
          fileReceipts:decoded.receipts,
          checkpointState:'bytes-durable-needs-confirmation',
        }
        checkpoint={...plain,manifestSha256:sealedDigest(plain)}
        const zipTmp=join(dir,'archive-'+randomBytes(8).toString('hex')+'.tmp')
        const manifestTmp=join(dir,'checkpoint-'+randomBytes(8).toString('hex')+'.tmp')
        try {
          writeFileSync(zipTmp,input.bytes,{flag:'wx',mode:0o600})
          const archiveFd=openSync(zipTmp,'r')
          try {fsyncSync(archiveFd)} finally {closeSync(archiveFd)}
          renameSync(zipTmp,join(dir,'archive.zip'))
          writeFileSync(manifestTmp,JSON.stringify(checkpoint,null,2)+'\n',{flag:'wx',mode:0o600})
          const metaFd=openSync(manifestTmp,'r')
          try {fsyncSync(metaFd)} finally {closeSync(metaFd)}
          renameSync(manifestTmp,join(dir,'checkpoint.json'))
        } finally {
          if (existsSync(zipTmp)) rmSync(zipTmp,{force:true})
          if (existsSync(manifestTmp)) rmSync(manifestTmp,{force:true})
        }
      } finally {
        closeSync(fd!)
        rmSync(lock,{force:true})
      }
    }
    this.staging.assertStillGranted(ctx)
    return {checkpoint:structuredClone(checkpoint!),preview:stageReviewB2TrustedZip(ctx,this.staging,input,limits)}
  }
  /** New live owner is required on recovery; returns only restaging bytes, never old grants. */
  prepareRestage(ctx:B2MainContext,archiveId:string):B2RestageIntent {
    const {checkpoint,bytes}=this.readVerified(ctx,archiveId)
    if (!Number.isSafeInteger(ctx.ownerGeneration) || ctx.ownerGeneration<checkpoint.stagedOwnerGeneration) {
      code('OWNER_GENERATION_STALE')
    }
    return {
      checkpoint,
      restage: {
        requestId:checkpoint.requestId,
        physicalArchiveKey:'recovered-'+checkpoint.physicalArchiveKeyDigest,
        bytes,
      },
      status:'needs-main-revalidation',
    }
  }
  /** Read-only integrity probe for UI checkpoint listing (never formal Material status). */
  inspect(ctx:B2MainContext,archiveId:string):B2ArchiveCheckpoint {
    return this.readVerified(ctx,archiveId).checkpoint
  }
}
