import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  auditB4R25OriginalClauseBindings,
  evaluateB4R25ClauseBoundConditions,
  type B4R25RawClauseEvidence, type B4R25RuleProof,
  type B4R25ObservedCondition,
} from './review-v3-b4-r25-raw-clause-condition'
import { B4_REQUIRED_DIMENSIONS, type B4HighRiskDomain } from './review-v3-b4-conflict-and-instance-guard'
import type { B4RuleAnchorLedger } from './review-v3-b4-rule-source-diff'
import type { B4HighRiskSourceEvidence } from './review-v3-b4-high-risk-semantic-evidence'
import type { B4Archive } from './review-v3-b4-obligation-lineage'

const root = new URL('../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/', import.meta.url)
const load = (name: string): unknown =>
  JSON.parse(readFileSync(fileURLToPath(new URL(name, root)), 'utf8'))
const raw = () => load('B4-R25-INDEPENDENT-RAW-CLAUSE-PINS.json') as B4R25RawClauseEvidence
const r13 = () => load('B4-R13-107-RAW-RULE-CHECK-ANCHOR-LEDGER.json') as B4RuleAnchorLedger
const r14 = () => load('B4-R14-HIGH-RISK-32-SEMANTIC-EVIDENCE.json') as B4HighRiskSourceEvidence
const archive = Object.fromEntries(['G03','G04','G06'].map(d =>
  [d, load('B4-OBLIGATION-SOURCE-' + d + '.json')])) as Record<string, B4Archive>
type Selection = { domain: B4HighRiskDomain; templateId: string; ruleId: string }
const selected = (proof: B4R25RuleProof): Selection => ({
  domain: proof.domain, templateId: proof.templateId, ruleId: proof.ruleId,
})
const receipt = (proof: B4R25RuleProof) => ({
  templateId: proof.templateId, ruleId: proof.ruleId,
  rawExcerptSha256: proof.rawExcerptSha256,
  triggerLineSha256: proof.triggerLineSha256,
  bindingSha256: proof.bindingSha256,
})
const instances = (proof: B4R25RuleProof): B4R25ObservedCondition[] => {
  const makeDimensions = (id: string) => Object.fromEntries(
    B4_REQUIRED_DIMENSIONS[proof.domain].map(k => [k, k + '-fixture-' + id]))
  const a = makeDimensions('A'), b = makeDimensions('B')
  return [
    {
      instance: { key: 'A', dimensions: a, observedCondition: 'true',
        evidence: { forInstanceKey: 'A', dimensions: a, rawSourceSha256: proof.rawSourceSha256 }},
      clauseReceipt: receipt(proof),
    },
    {
      instance: { key: 'B', dimensions: b, observedCondition: 'false',
        evidence: { forInstanceKey: 'B', dimensions: b, rawSourceSha256: proof.rawSourceSha256 }},
      clauseReceipt: receipt(proof),
    },
  ]
}
describe('B4 R25 independent original Markdown body to R13/R14 Check evidence', () => {
  test('all 32 genuine original RAW clause excerpts bound to frozen 107 rule index; R34 reports context spill', () => {
    const audit = auditB4R25OriginalClauseBindings(raw(), r13(), r14(), archive)
    expect(audit.rules).toBe(32)
    expect(audit.independentlyRawBound).toBe(32)
    expect(audit.contextContamination).toBe(1)
    expect(audit.proofs).toHaveLength(32)
    expect(audit.proofs.filter(x => x.r14Context === 'NON_RULE_CONTEXT_APPENDED'))
      .toEqual([expect.objectContaining({domain:'G06',templateId:'g06-t06',ruleId:'R-34'})])
    expect(audit.proofs.every(x => x.sourceApplicability === 'UNKNOWN_NOT_APPROVED' &&
      !x.technicalPredicateImplemented && !x.semanticValidated && !x.publicationAllowed)).toBe(true)
    expect(audit.publicationAllowed).toBe(false)
    expect(audit.schoolPolicyVerified).toBe(false)
  })
  test('G02 and G04 pinned original versions recovered; G08 still absent and quarantined', () => {
    const evidence = raw()
    expect(evidence.observedLaterVersions.G02.nowRecoveredD4Sha256)
      .toBe('e3d1d01555d49564931ac38892567ea23eab5ecd898afc3b67a8e4a26abe7380')
    expect(evidence.observedLaterVersions.G04.nowRecoveredD4Sha256)
      .toBe('d9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2')
    expect(evidence.observedLaterVersions.G08.nowRecoveredD4Sha256).toBeNull()
    expect(evidence.schoolPolicyVerified).toBe(false)
    expect(evidence.publicationAllowed).toBe(false)
  })
  test('wrong raw body hash or invented R14 text is not accepted as original', () => {
    const p = raw()
    p.clauses[0]!.rawExcerptSha256 = '0'.repeat(64)
    expect(() => auditB4R25OriginalClauseBindings(p,r13(),r14(),archive))
      .toThrow('B4_R25_RAW_CLAUSE_VERBATIM_MISMATCH')
    const q = r14()
    q.items[0]!.original.excerpt += '\nInvented authorization'
    expect(() => auditB4R25OriginalClauseBindings(raw(),r13(),q,archive))
      .toThrow('B4_R25_RAW_CLAUSE_VERBATIM_MISMATCH')
  })
  test('hidden G06 R-34 extra subsection must remain explicitly marked as non-rule context', () => {
    const pin = raw()
    const spill = pin.clauses.find(x => x.domain === 'G06' && x.ruleId === 'R-34')!
    expect(spill.rawRuleBodyNonBlankLines).toBe(4)
    expect(spill.r14AdditionalNonRuleContextLines).toBe(2)
    spill.r14AdditionalNonRuleContextLines = 0
    expect(() => auditB4R25OriginalClauseBindings(pin,r13(),r14(),archive))
      .toThrow('B4_R25_RAW_CLAUSE_VERBATIM_MISMATCH')
  })
  test('cannot reassign same Check to another original R13 rule or merge duplicate clause IDs', () => {
    const p = raw()
    p.clauses[1]!.ruleId = p.clauses[0]!.ruleId
    expect(() => auditB4R25OriginalClauseBindings(p,r13(),r14(),archive))
      .toThrow('B4_R25_DUPLICATE_RAW_CLAUSE')
    const q = r13()
    q.templates[0]!.ruleAnchors[13]!.mappedCheckIds = ['invented-check']
    expect(() => auditB4R25OriginalClauseBindings(raw(),q,r14(),archive))
      .toThrow()
  })
  test('caller cannot turn G08 observed older version into a frozen current policy', () => {
    const p = raw()
    p.observedLaterVersions.G08.nowRecoveredD4Sha256 = p.observedLaterVersions.G08.observedOldRawSha256
    expect(() => auditB4R25OriginalClauseBindings(p,r13(),r14(),archive))
      .toThrow('B4_R25_CONFLICT_VERSION_DRIFT')
    const next = raw()
    next.publicationAllowed = true as false
    expect(() => auditB4R25OriginalClauseBindings(next,r13(),r14(),archive))
      .toThrow('B4_R25_RAW_PROVENANCE_HEADER')
  })
})
describe('B4 R25 physical source + immutable original clause and instance evidence', () => {
  const seeded = auditB4R25OriginalClauseBindings(raw(),r13(),r14(),archive).proofs
  for (const proof of seeded) {
    test(proof.domain + '/' + proof.ruleId + ': original rule receipt binds both true and false technical candidates only', () => {
      const result = evaluateB4R25ClauseBoundConditions(raw(),r13(),r14(),archive,
        selected(proof), instances(proof))
      expect(result.findings.map(x => x.candidatePredicate)).toEqual(['applicable','not-applicable'])
      expect(result.findings.every(x => x.reason === 'TECHNICAL_CANDIDATE_ONLY' &&
        x.cannotAuthorizeSchool && !x.semanticValidated && !x.publicationAllowed)).toBe(true)
      expect(result.schoolPolicyVerified).toBe(false)
      expect(result.publicationAllowed).toBe(false)
    })
  }
  test('same G03 frozen file and same exact object cannot let R-14 approval claim pass as R-17', () => {
    const a = seeded.find(x => x.domain === 'G03' && x.ruleId === 'R-14')!
    const b = seeded.find(x => x.domain === 'G03' && x.ruleId === 'R-17')!
    expect(a.rawSourceSha256).toBe(b.rawSourceSha256)
    expect(a.bindingSha256).not.toBe(b.bindingSha256)
    const result = evaluateB4R25ClauseBoundConditions(raw(),r13(),r14(),archive,
      selected(b), instances(b).map(x => ({...x,clauseReceipt:receipt(a)})))
    expect(result.findings.map(x => x.candidatePredicate)).toEqual(['unknown','unknown'])
    expect(result.findings.every(x => x.reason === 'WRONG_OR_STALE_CLAUSE_RECEIPT')).toBe(true)
  })
  test('one missing per-rule receipt is unknown, never false / not applicable', () => {
    const p = seeded[0]!
    const input = instances(p)
    input[0]!.clauseReceipt = undefined
    const result = evaluateB4R25ClauseBoundConditions(raw(),r13(),r14(),archive,
      selected(p),input)
    expect(result.findings[0]).toEqual(expect.objectContaining({
      candidatePredicate:'unknown',reason:'CLAUSE_RECEIPT_MISSING',
    }))
    expect(result.findings[1]!.candidatePredicate).toBe('not-applicable')
  })
  test('altered condition, other raw clause SHA and altered check binding all independently deny replay', () => {
    const p = seeded[0]!
    const input = instances(p)
    input[0]!.clauseReceipt!.triggerLineSha256 = '0'.repeat(64)
    input[1]!.clauseReceipt!.rawExcerptSha256 = '0'.repeat(64)
    const result = evaluateB4R25ClauseBoundConditions(raw(),r13(),r14(),archive,
      selected(p),input)
    expect(result.findings.every(x => x.candidatePredicate === 'unknown')).toBe(true)
    const second = instances(p)
    second[0]!.clauseReceipt!.bindingSha256 = '0'.repeat(64)
    expect(evaluateB4R25ClauseBoundConditions(raw(),r13(),r14(),archive,
      selected(p),second).findings[0]!.candidatePredicate).toBe('unknown')
  })
  test('source revision and cross-subject object-evidence remain UNKNOWN even with valid clause receipt', () => {
    const p = seeded.find(x => x.domain === 'G04')!
    const input = instances(p)
    input[0]!.instance.evidence!.rawSourceSha256 = '0'.repeat(64)
    input[1]!.instance.evidence!.forInstanceKey = 'A'
    const result = evaluateB4R25ClauseBoundConditions(raw(),r13(),r14(),archive,
      selected(p),input)
    expect(result.findings.map(x => x.candidatePredicate)).toEqual(['unknown','unknown'])
    expect(result.findings.every(x => x.reason === 'INSTANCE_UNRESOLVED')).toBe(true)
  })
})
