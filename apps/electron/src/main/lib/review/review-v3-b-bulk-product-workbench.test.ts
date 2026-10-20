import { describe,test,expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { auditB4R25OriginalClauseBindings } from './review-v3-b4-r25-raw-clause-condition'
import { buildB26HistoricalEvidenceWorkbench,pageB26EvidenceIssues } from './review-v3-b4-bulk-evidence-workbench'
import { buildB27CandidateReadiness } from './review-v3-b-candidate-readiness-workbench'
import { prepareB28RemediationPacket,reconcileB28CandidateObservations,
  describeB28CandidateHandoff } from './review-v3-b-bulk-remediation-cycle'
import type { B4Archive } from './review-v3-b4-obligation-lineage'
import type { B20CurrentCandidateRead } from './review-v3-b1-b2-main-read-bundle-v3-b'
import type { B3RouteState } from './review-intake-routing-adapter-v3-b3'
const root=new URL('../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/',import.meta.url)
const load=(file:string):any=>JSON.parse(readFileSync(fileURLToPath(new URL(file,root)),'utf8'))
const archives=()=>Object.fromEntries(
 ['G01','G02','G03','G04','G05','G06','G07','G08'].map(d=>
 [d,load('B4-OBLIGATION-SOURCE-'+d+'.json')])) as Record<string,B4Archive>
const audit=()=>auditB4R25OriginalClauseBindings(load('B4-R25-INDEPENDENT-RAW-CLAUSE-PINS.json'),
  load('B4-R13-107-RAW-RULE-CHECK-ANCHOR-LEDGER.json'),
  load('B4-R14-HIGH-RISK-32-SEMANTIC-EVIDENCE.json'),archives())
const h='a'.repeat(64)
describe('B R26–R28 complete historical workbench, batch and B1/B2/B3 handoff',()=>{
 test('full real frozen worklist covers 50 originals / 4163 UNKNOWN / 34 scopes / 32 semantic Gold; pagination never clears gap',()=>{
  const work=buildB26HistoricalEvidenceWorkbench(archives(),{highRisk:audit()})
  expect(work.counts).toEqual({domains:8,templates:50,checks:3875,originalsSupplied:0,
    originalsMatching:0,originalsConflicting:0,unscoped:34,unknownSourceRefs:4163,
    highRisk:32,unresolved:4279})
  expect(work.issues.filter(x=>x.kind==='HIGH_RISK_CLAUSE_REQUIRES_INDEPENDENT_GOLD')).toHaveLength(32)
  const first=pageB26EvidenceIssues(work,{kind:'UNVERIFIED_SOURCE_APPLICABILITY',limit:200})
  expect(first.total).toBe(4163)
  expect(first.items).toHaveLength(200)
  expect(first.nextOffset).toBe(200)
  expect(first.items.every(x=>!x.canAutoClear&&!x.publicationAllowed)).toBe(true)
 })
 test('specific SourceRef human observation and G01 scope annotate but do not erase 4197 unresolved gaps',()=>{
  const frozen=archives()
  const check=frozen.G03!.templates[0]!.obligations.find(c=>
    c.sources.some(x=>x.sourceApplicability==='unknown'))!
  const s=check.sources.find(x=>x.sourceApplicability==='unknown')!
  const scope=frozen.G01!.templates.flatMap(x=>x.obligations).find(x=>
    !x.genericScope&&!x.caseScopeJustification)!
  const old=buildB26HistoricalEvidenceWorkbench(frozen,{highRisk:audit()})
  const next=buildB26HistoricalEvidenceWorkbench(frozen,{highRisk:audit(),
    sourceObservations:[{checkId:check.checkId,sourceId:s.sourceId,
      documentVersionId:s.documentVersionId!,locator:s.locator!,
      observedSha256:h,observationId:'B26-physical-observation-1'}],
    scopeObservations:[{checkId:scope.checkId,objectKey:'venue-one',
      subjectId:'user-one',scopeDescription:'specific human proposed scope',
      observationId:'B26-scope-observation-1'}]})
  const changed=reconcileB28CandidateObservations(old,next,old.snapshotSha256)
  expect(changed.changed).toHaveLength(2)
  expect(changed.policyGapsCleared).toBe(0)
  expect(changed.stillUnresolved).toBe(4279)
  expect(next.issues.filter(x=>x.kind==='UNVERIFIED_SOURCE_APPLICABILITY')).toHaveLength(4163)
  expect(next.issues.filter(x=>x.kind==='UNSCOPED_OBJECT_AND_CASE')).toHaveLength(34)
  expect(changed.changed.every(x=>x.to==='candidate-observed-unverified')).toBe(true)
 })
 test('real raw original other version quarantined; missing G08 frozen source cannot become current school template',()=>{
  const work=buildB26HistoricalEvidenceWorkbench(archives(),{
    rawOriginals:[{templateId:'g08-t03',bytes:new TextEncoder().encode('different raw version'),
      provenance:'synthetic-test-not-a-school-policy'}]})
  expect(work.counts.originalsConflicting).toBe(1)
  expect(work.templates.find(x=>x.templateId==='g08-t03')?.original).toBe('RAW_VERSION_CONFLICT')
  expect(work.issues.find(x=>x.templateId==='g08-t03'&&
    x.kind==='ORIGINAL_VERSION_CONFLICT')?.state).toBe('quarantined')
 })
 test('forged scope, foreign source and stale worklist packet fail closed',()=>{
  const work=buildB26HistoricalEvidenceWorkbench(archives(),{highRisk:audit()})
  expect(()=>buildB26HistoricalEvidenceWorkbench(archives(),{sourceObservations:[{
    checkId:'forged',sourceId:'forged',documentVersionId:'fake',locator:'fake',
    observationId:'a',observedSha256:h,
  }]})).toThrow('B_R26_SOURCE_PROVENANCE_MISMATCH')
  expect(()=>buildB26HistoricalEvidenceWorkbench(archives(),{scopeObservations:[{
    checkId:'forged',objectKey:'x',subjectId:'y',scopeDescription:'a',observationId:'z',
  }]})).toThrow('B_R26_SCOPE_NOT_IN_FROZEN_GAP')
  expect(()=>prepareB28RemediationPacket(work,[work.issues[0]!.id],h))
    .toThrow('B_R28_INVALID_SELECTION_OR_STALE_SNAPSHOT')
 })
 test('bulk packet is deterministic, bounded and insists on human original/policy work',()=>{
  const work=buildB26HistoricalEvidenceWorkbench(archives(),{highRisk:audit()})
  const ids=work.issues.slice(0,4).map(x=>x.id)
  const packet=prepareB28RemediationPacket(work,ids,work.snapshotSha256)
  expect(packet.actions).toHaveLength(4)
  expect(packet.actions.every(x=>x.proposedStatus==='NEEDS_HUMAN_EVIDENCE'&&
    x.schoolAuthorization===false&&!x.businessWriteAllowed)).toBe(true)
  expect(packet.canApplyToCurrentCase).toBe(false)
  expect(prepareB28RemediationPacket(work,[...ids].reverse(),work.snapshotSha256)
    .packetSha256).toBe(packet.packetSha256)
  expect(()=>prepareB28RemediationPacket(work,[ids[0]!,ids[0]!],work.snapshotSha256))
    .toThrow('B_R28_INVALID_SELECTION_OR_STALE_SNAPSHOT')
 })
 test('B27 reuses actual binding semantics and conservatively returns source + routing + Gold work, never a Case',()=>{
  const fingerprint=h
  const candidate={
    schemaVersion:'review-v3-b20-main-read-bundle/1',candidateOnly:true,
    publicationAllowed:false,businessWriteAllowed:false,
    schoolPolicyVerified:false,authorityInstalledByB:false,authorStatus:'candidate-held',
    ownerId:'owner',ownerGeneration:1,caseCandidateId:'case',
    templateId:'new-b1-user-template',frozenFingerprint:fingerprint,
    frozenDescriptor:{publicationAllowed:false,canonicalPlan:{fingerprint},
      bindingDetails:[{checkKey:'check-one',targetKey:'target-one',objectKey:'object',
        subjectId:'subject',sourceIds:['source-one'],applicability:'unknown'}]},
    candidateProvenance:{schemaVersion:'review-v3-b1-b2-candidate-source/1',
      candidateOnly:true,publicationAllowed:false,businessWriteAllowed:false,
      ownerId:'owner',ownerGeneration:1,caseCandidateId:'case',
      planFingerprint:fingerprint,snapshotHash:h,bindings:[{
        checkKey:'check-one',targetKey:'target-one',objectKey:'object',
        subjectId:'subject',applicability:'unknown',
        sources:[{sourceId:'source-one',state:'unknown',documentVersionId:null,
          rawSha256:null,parseRevision:null,blockId:null,readExtent:null,
          receiptHash:null,subjectId:null}],
      }]},
  } as unknown as B20CurrentCandidateRead
  const route={status:'unmatched',remainingMs:0,reason:'no match'} as B3RouteState
  const result=buildB27CandidateReadiness(candidate,route)
  expect(result.technicalSourcesLinked).toBe(false)
  expect(result.readyForFormalDecision).toBe(false)
  expect(result.actions.map(x=>x.action)).toContain('SELECT_OR_AUTHOR_TEMPLATE')
  expect(result.actions.map(x=>x.action)).toContain('REVALIDATE_SOURCE_OR_REPICK')
  expect(result.actions.map(x=>x.action)).toContain('REQUEST_SCHOOL_POLICY_OR_GOLD')
  const handoff=describeB28CandidateHandoff(result)
  expect(handoff.routeRequiresHuman).toBe(true)
  expect(handoff.autoCreateCase).toBe(false)
  expect(handoff.autoRunPi).toBe(false)
 })
});
