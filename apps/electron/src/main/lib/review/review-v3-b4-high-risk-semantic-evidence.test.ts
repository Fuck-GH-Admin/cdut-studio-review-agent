import { describe,expect,test } from 'bun:test'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {validateB4HighRiskEvidence,type B4HighRiskSourceEvidence} from './review-v3-b4-high-risk-semantic-evidence'
import type { B4Archive } from './review-v3-b4-obligation-lineage'
const root=new URL('../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/',import.meta.url)
const load=(filename:string):unknown=>JSON.parse(readFileSync(fileURLToPath(new URL(filename,root)),'utf8'))
const archives=Object.fromEntries(['G03','G04','G06'].map(d=>[d,load('B4-OBLIGATION-SOURCE-'+d+'.json')])) as Record<string,B4Archive>
const ledger=()=>load('B4-R14-HIGH-RISK-32-SEMANTIC-EVIDENCE.json') as B4HighRiskSourceEvidence
describe('B4 R14 high-risk semantic obligations: raw clauses vs Check evidence',()=>{
 test('original clause excerpts and 32 exact technical source traces are fail-closed, zero semantic approvals',()=>{
   const x=validateB4HighRiskEvidence(ledger(),archives)
   expect(x.rules).toBe(32);expect(x.distinctTemplates).toBe(3)
   expect(x.checkEdges).toBeGreaterThanOrEqual(32)
   expect(x.semanticValidated).toBe(0)
   expect(x.publicationAllowed).toBe(false)
 })
 test('wrong actual Check scope or Check ID fails',()=>{
   const x=ledger();x.items[0]!.technical.observedScopes[0]!.scope={businessTypes:['fabricated']}
   expect(()=>validateB4HighRiskEvidence(x,archives)).toThrow('B4_SEMANTIC_AUDIT_SCOPE_MISMATCH')
   const y=ledger();y.items[1]!.technical.checkIds[0]='fake-check'
   expect(()=>validateB4HighRiskEvidence(y,archives)).toThrow('B4_SEMANTIC_AUDIT_CHECK_MISSING')
 })
 test('no tampering source hash or hiding missing instance dimensions',()=>{
   const x=ledger();x.items[0]!.rawSha256='0'.repeat(64)
   expect(()=>validateB4HighRiskEvidence(x,archives)).toThrow('B4_SEMANTIC_AUDIT_DUPLICATE_OR_UNPINNED')
   const y=ledger();y.items[0]!.technical.dimensionsNotEvidencedInArchivedCheckFields=[]
   expect(()=>validateB4HighRiskEvidence(y,archives)).toThrow('B4_SEMANTIC_AUDIT_DIMENSION_TRUTH')
 })
 test('policy/Gold authority claims or missing source never pass',()=>{
   const x=ledger();x.items[0]!.disposition.authorMayPublish=true as false
   expect(()=>validateB4HighRiskEvidence(x,archives)).toThrow('B4_SEMANTIC_AUDIT_PROOF_STATUS')
   const y=ledger();y.items[0]!.technical.sourceEvidence.pop()
   expect(()=>validateB4HighRiskEvidence(y,archives)).toThrow('B4_SEMANTIC_AUDIT_SOURCE_EVIDENCE')
 })
})
