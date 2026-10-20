import {describe,test,expect} from 'bun:test'
import {renderToStaticMarkup} from 'react-dom/server'
import {ReviewV3CandidateIntakeSurface} from './ReviewV3CandidateIntakeSurface'
import {assertB32RemediationReceipt} from './ReviewV3ProductWorkspace'
import {
 buildB32ProductView,pageB32Checks,pageB32Issues,assertB32StillCurrent,
 type B32ProductRead,
} from './review-v3-product-workflow'
const route={status:'unmatched' as const,remainingMs:0,reason:'no evidenced template'}
const disconnected=():B32ProductRead=>({
 schemaVersion:'review-v3-b32-product-read/1',readVersion:'uninstalled',
 caseCandidateId:'case-1',mainConnection:'NOT_INSTALLED',
 route,inventory:null,candidate:null,readiness:null,recovery:null,historical:null,
 candidateOnly:true,publicationAllowed:false,businessWriteAllowed:false,schoolPolicyVerified:false,
})
const physical=():B32ProductRead=>({
 ...disconnected(),readVersion:'trusted-evidence-epoch-1',mainConnection:'C_MAIN_READ_CONNECTED',
 inventory:{
  schemaVersion:'review-v3-b30-complete-source-inventory/1',
  candidateOnly:true,publicationAllowed:false,schoolPolicyVerified:false,
  authoritativeMainIdentityIssuedByB:false,
  caseCandidateId:'case-1',ownerId:'owner-1',ownerGeneration:1,
  scopeIdentitySha256:'c'.repeat(64),
  allStagedCount:3,applicationCount:1,unassignedCount:0,archivedZipEntryCount:2,
  sources:['direct','zip-one','zip-two'].map((x,i)=>({
   candidateId:x,materialId:'material-'+i,documentVersionId:'v-'+i,
   rawSha256:'a'.repeat(64),byteLength:10,fileName:'item'+i+'.pdf',
   role:i?'supporting' as const:'application' as const,
   subjectId:'student-A',archiveDerived:i>0,rawBytesRechecked:true as const,
  })),
 },
})
const callbacks={onSaveDraft:async()=>({revision:1}),
 onPreview:async()=>{throw Error('not called')},
 onFreezeCandidate:async()=>({fingerprint:'a'.repeat(64)})}
describe('B R30–R32 renderer reads real complete input and blocks untrusted authority',()=>{
 test('disconnected Main honestly disables normal user work without simulated sources',()=>{
  const v=buildB32ProductView(disconnected())
  expect(v.mainConnected).toBe(false)
  expect(v.materials).toHaveLength(0)
  expect(v.readyForSchoolApproval).toBe(false)
  const html=renderToStaticMarkup(<ReviewV3CandidateIntakeSurface
   caseCandidateId="case-1" sessionKey="owner-generation-one"
   route={route} manualCatalog={[]} onRequestRefresh={()=>{}}
   onInterrupt={()=>{}} onManualChoice={()=>{}}
   author={callbacks} product={{}}/>)
  expect(html).toContain('审核输入与候选工作台')
  expect(html).toContain('真实 C Main/B20/B30 读接口尚未安装')
  expect(html).toContain('本界面不会把测试数据')
  expect(html).toContain('新建不绑定原件的本地作者草稿')
  expect(html).toContain('不依赖 Main 或校方授权')
 })
 test('remediation requires a real C Main persisted receipt, never equates void with saved',()=>{
  expect(assertB32RemediationReceipt(undefined,'G01:issue','sha-1')).toBe(false)
  const ack={schemaVersion:'review-v3-b32-remediation-receipt/1' as const,
   issueId:'G01:issue',currentSnapshot:'sha-1',receiptId:'local-observation-42',
   persisted:true as const,candidateOnly:true as const,publicationAllowed:false as const}
  expect(assertB32RemediationReceipt(ack,'G01:issue','sha-1')).toBe(true)
  expect(()=>assertB32RemediationReceipt(ack,'G01:issue','sha-2')).toThrow('B_PRODUCT_REMEDIATION_ACK_INVALID')
  expect(()=>assertB32RemediationReceipt({...ack,receiptId:''},'G01:issue','sha-1')).toThrow('B_PRODUCT_REMEDIATION_ACK_INVALID')
 })
 test('three material inventory includes second ZIP and enables human-only unmatched authorship',()=>{
  const v=buildB32ProductView(physical())
  expect(v.totalStaged).toBe(3)
  expect(v.zipEntries).toBe(2)
  expect(v.availableForHumanAuthor).toBe(true)
  expect(v.materials.map(x=>x.sourceType)).toEqual(['DIRECT_MATERIAL','ZIP_ENTRY','ZIP_ENTRY'])
  expect(v.readyForSchoolApproval).toBe(false)
 })
 test('missing second ZIP, duplicate candidate and inconsistent count are rejected',()=>{
  const d=physical()
  d.inventory!.sources.pop()
  expect(()=>buildB32ProductView(d)).toThrow('B_PRODUCT_CURRENT_MATERIAL_UNIVERSE_INVALID')
  const e=physical()
  e.inventory!.sources[1]!.candidateId=e.inventory!.sources[0]!.candidateId
  expect(()=>buildB32ProductView(e)).toThrow('B_PRODUCT_CURRENT_MATERIAL_UNIVERSE_INVALID')
 })
 test('read-current refuses old bytes, owner generation or epoch before repair/author action',()=>{
  const a=physical(),b=physical()
  expect(()=>assertB32StillCurrent(a,b)).not.toThrow()
  b.inventory!.sources[1]!.rawSha256='b'.repeat(64)
  expect(()=>assertB32StillCurrent(a,b)).toThrow('B_PRODUCT_REOPENED_CURRENT_SOURCE_CHANGED')
  const c=physical()
  c.inventory!.scopeIdentitySha256='d'.repeat(64)
  expect(()=>assertB32StillCurrent(a,c)).toThrow('B_PRODUCT_REOPENED_CURRENT_SOURCE_CHANGED')
 })
 test('a linked Check cannot cite a hidden or missing physical B2 candidate',()=>{
  const d=physical()
  const h='f'.repeat(64)
  d.candidate={
   schemaVersion:'review-v3-b20-main-read-bundle/1',candidateOnly:true,
   publicationAllowed:false,businessWriteAllowed:false,schoolPolicyVerified:false,
   authorityInstalledByB:false,caseCandidateId:'case-1',ownerId:'owner-1',
   ownerGeneration:1,templateId:'temporary',authorRevision:1,
   authorRevisionDigest:h,authorStatus:'candidate-held',
   frozenFingerprint:h,frozenAuthorDigest:h,
   frozenDescriptor:{publicationAllowed:false,canonicalPlan:{fingerprint:h}} as any,
   candidateProvenance:{
    schemaVersion:'review-v3-b1-b2-candidate-source/1',candidateOnly:true,
    publicationAllowed:false,businessWriteAllowed:false,schoolPolicyVerified:false,
    caseCandidateId:'case-1',ownerId:'owner-1',ownerGeneration:1,
    planFingerprint:h,authorDigest:h,invalidatedPriorEvidence:[],snapshotHash:h,
    bindings:[{bindingIdentity:'x',checkKey:'check',targetKey:'t',objectKey:'o',
     subjectId:'s',applicability:'unknown',state:'linked-candidate',
     sources:[{sourceId:'source',candidateId:'missing-another-zip',
      state:'linked-candidate',reason:'linked',declaredDocumentVersionId:'v-1',
      documentVersionId:'v-1',materialId:'m',rawSha256:h,parseRevision:'p',
      blockId:'b',readExtent:{source:{blockId:'b'}} as any,
      archiveId:null,entryIndex:null,ledgerHash:null,receiptHash:h,
      proposalHash:null,role:'application',subjectId:'s'}]}],
   },
  }
  d.readiness={
   schemaVersion:'review-v3-b27-candidate-readiness/1',candidateOnly:true,
   publicationAllowed:false,businessWriteAllowed:false,schoolPolicyVerified:false,
   currentMainAuthorityRecheckedByC:false,caseCandidateId:'case-1',
   ownerId:'owner-1',templateId:'temporary',authorFingerprint:h,
   routeStatus:'unmatched',technicalRoutingReady:false,
   technicalSourcesLinked:false,pendingPhysicalReconfirmation:true,
   readyForFormalDecision:false,actions:[],snapshotSha256:h,
  }
  expect(()=>buildB32ProductView(d)).toThrow('B_PRODUCT_CHECK_LINK_TO_MISSING_MATERIAL')
 })
 test('both large Check/source lists are bounded pages, not 4163 simultaneous cards',()=>{
  const rows=Array.from({length:120},(_,i)=>({key:'k'+i,checkKey:'c',
   targetKey:'t',objectKey:'o',subjectId:'s',
   applicability:'unknown' as const,sources:[],unresolved:true}))
  expect(pageB32Checks(rows,50,25).items).toHaveLength(25)
  expect(pageB32Checks(rows,100,25).nextOffset).toBeNull()
  expect(()=>pageB32Issues(null,0,1000)).toThrow('B_PRODUCT_ISSUE_PAGE_INVALID')
 })
})
