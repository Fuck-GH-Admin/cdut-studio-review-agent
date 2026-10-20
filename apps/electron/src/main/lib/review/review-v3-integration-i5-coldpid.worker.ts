/**
 * I5-only independent OS process: valid persistent B1 revision remains readable,
 * but no new PID is allowed to reissue an old B2 Owner/native picker grant.
 * Not an actual Electron Main authentication or school publisher.
 */
import { join } from 'node:path'
import { readB1AuthorRevision, readB1FrozenCandidate } from './review-template-author-store-v3-b1'
import { ReviewB2StagingService } from './review-intake-adapter-v3-b2'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'
import { ReviewB2ArchiveVault } from './review-import-checkpoint-v3-b2'
import { ReviewB2InputLedger } from './review-import-ledger-v3-b2'
import { readB20CurrentCandidateBundle, type B20MainReadScope } from './review-v3-b1-b2-main-read-bundle-v3-b'

const [templateId, revisionDigest, frozenFingerprint, caseCandidateId] = process.argv.slice(2)
if (!templateId || !revisionDigest || !frozenFingerprint || !caseCandidateId ||
    !process.env.PROFER_CONFIG_DIR) throw Error('I5_COLD_ARGUMENTS_REQUIRED')
const revision = readB1AuthorRevision(templateId)
const frozen = readB1FrozenCandidate(templateId, frozenFingerprint)
if (!revision || !frozen || revision.digest !== revisionDigest ||
    frozen.revision !== revision.revision ||
    frozen.descriptor.canonicalPlan.fingerprint !== frozenFingerprint) {
  throw Error('I5_COLD_PERSISTENT_AUTHOR_INVALID')
}
const scope:B20MainReadScope = {
  senderId:17,frameId:5,ownerId:'fixture-owner',ownerGeneration:4,
  caseCandidateId,principalId:'fixture-main-principal',
  sessionId:'fixture-session',authorityEpoch:8,
}
// These are new instances in a different PID: a valid persisted author and
// archive cannot install a current authenticated grant or physical picker.
const staging = new ReviewB2StagingService()
const parser = new ReviewB2SourceVersionAdapter(staging)
const vault = new ReviewB2ArchiveVault(staging,join(process.env.PROFER_CONFIG_DIR,'cold-pid-vault'))
const ledger = new ReviewB2InputLedger(vault,staging,join(process.env.PROFER_CONFIG_DIR,'cold-pid-ledger'))
let denied = false
try {
  readB20CurrentCandidateBundle(
    {templateId,revision:revision.revision,revisionDigest,frozenFingerprint},
    {authority:{
      currentScope:()=>scope,
      currentSelections:()=>[],
      nativeArchiveKey:()=>null,
    },sources:{staging,parser,vault,ledger}},
  )
} catch(error) {
  if (!(error instanceof Error) || error.message !== 'B2_OWNER_INVALID_OR_REVOKED')
    throw error
  denied = true
}
if (!denied)throw Error('I5_COLD_OLD_AUTH_REUSED')
console.log('I5_COLD_PROVENANCE '+JSON.stringify({
  pid:process.pid,persistedAuthor:true,oldOwnerDenied:true,
  published:false,independentMainIdentity:false,
}))
