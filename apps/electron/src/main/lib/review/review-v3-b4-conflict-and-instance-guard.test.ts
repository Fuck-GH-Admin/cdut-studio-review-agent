import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  B4_REQUIRED_DIMENSIONS, auditB4FrozenUnknownCoverage, inspectB4HighRiskInstanceEvidence,
  inspectB4OriginalVersion, type B4ConflictedOriginalPin,
  type B4HighRiskDomain, type B4RiskInstance,
} from './review-v3-b4-conflict-and-instance-guard'
import { validateB4TechnicalArchive, sumB4Technical, type B4Archive } from './review-v3-b4-obligation-lineage'
import type { B4HighRiskSourceEvidence } from './review-v3-b4-high-risk-semantic-evidence'

const root = new URL('../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/', import.meta.url)
const load = (name: string): unknown =>
  JSON.parse(readFileSync(fileURLToPath(new URL(name, root)), 'utf8'))
const proof = () => load('B4-R14-HIGH-RISK-32-SEMANTIC-EVIDENCE.json') as B4HighRiskSourceEvidence
const archives = Object.fromEntries(['G03', 'G04', 'G06'].map(d =>
  [d, load('B4-OBLIGATION-SOURCE-' + d + '.json')])) as Record<string, B4Archive>
const frozen = 'b68443b23293b4714e61a3b81383d3d3a56434fc'
const utf8 = (s: string) => new TextEncoder().encode(s)
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const originalPins: B4ConflictedOriginalPin[] = [
  { templateId: 'g02-t03-review', frozenD4SHA: frozen,
    frozenSourceVersion: 'C-v0.1.1',
    frozenSourceSha256: 'e3d1d01555d49564931ac38892567ea23eab5ecd898afc3b67a8e4a26abe7380' },
  { templateId: 'd4-g04-t06', frozenD4SHA: frozen,
    frozenSourceVersion: 'C-v0.1',
    frozenSourceSha256: 'd9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2' },
  { templateId: 'g08-t03', frozenD4SHA: frozen,
    frozenSourceVersion: 'C-MD-v0.1.1-r31-r01',
    frozenSourceSha256: 'f8acf03994262e621d4afac6e608d34d90b114b7103372bef25fc7a4b50f88ec' },
]
const riskTargets: Array<{ domain: B4HighRiskDomain; templateId: string; ruleId: string }> = [
  { domain: 'G03', templateId: 'g03-t12', ruleId: 'R-14' },
  { domain: 'G04', templateId: 'd4-g04-t03', ruleId: 'R-06' },
  { domain: 'G06', templateId: 'g06-t06', ruleId: 'R-12' },
]
const matrix = (domain: B4HighRiskDomain, source: string): B4RiskInstance[] => {
  const dims = B4_REQUIRED_DIMENSIONS[domain]
  const mk = (id: string) => Object.fromEntries(dims.map(k => [k, k + '-' + id]))
  const a = mk('A'), b = mk('B'), c = mk('C'), d = mk('D')
  return [
    { key: 'A', dimensions: a, observedCondition: 'true',
      evidence: { forInstanceKey: 'A', dimensions: a, rawSourceSha256: source } },
    { key: 'B', dimensions: b, observedCondition: 'false',
      evidence: { forInstanceKey: 'B', dimensions: b, rawSourceSha256: source } },
    { key: 'C', dimensions: c, observedCondition: 'true',
      evidence: { forInstanceKey: 'A', dimensions: a, rawSourceSha256: source } },
    { key: 'D', dimensions: d, observedCondition: 'unknown',
      evidence: { forInstanceKey: 'D', dimensions: d, rawSourceSha256: source } },
  ]
}
describe('B4 R24 frozen Markdown version conflict, never policy authority', () => {
  test('three raw Library versions independently rehashed, never substituted for frozen originals', () => {
    const old = load('B4-50-ORIGINAL-LIBRARY-RECOVERY-R11.json') as {
      entries: Array<{ templateId: string; claimedD4SourceSha256: string;
        observedLibrarySha256: string; status: string }> }
    const sources = (load('B4-1-ORIGINAL-RAW-RECOVERY-R12B.json') as { quarantinedStill: string[] }).quarantinedStill
    expect(new Set(sources)).toEqual(new Set(originalPins.map(x => x.templateId)))
    const rehashed = load('B4-R24-THREE-CONFLICTED-ORIGINAL-RAW-REHASH.json') as {
      frozenD4SHA: string; publicationAllowed: boolean; schoolPolicyVerified: boolean;
      conflicts: Array<{ templateId: string; observedRawSha256: string;
        observedGitBlobSha1: string; observedByteCount: number;
        frozenSourceSha256: string; sourceVerdict: string }>
    }
    expect(rehashed.frozenD4SHA).toBe(frozen)
    expect(rehashed.conflicts).toHaveLength(3)
    expect(rehashed.publicationAllowed).toBe(false)
    expect(rehashed.schoolPolicyVerified).toBe(false)
    for (const pin of originalPins) {
      const observed = old.entries.find(x => x.templateId === pin.templateId)
      expect(observed?.claimedD4SourceSha256).toBe(pin.frozenSourceSha256)
      expect(observed?.status).toBe('HASH_MISMATCH_QUARANTINED')
      expect(observed?.observedLibrarySha256).toMatch(/^[a-f0-9]{64}$/)
      expect(observed?.observedLibrarySha256).not.toBe(pin.frozenSourceSha256)
      const raw = rehashed.conflicts.find(x => x.templateId === pin.templateId)
      expect(raw?.frozenSourceSha256).toBe(pin.frozenSourceSha256)
      expect(raw?.observedRawSha256).toBe(observed?.observedLibrarySha256)
      expect(raw?.observedGitBlobSha1).toMatch(/^[a-f0-9]{40}$/)
      expect(raw?.observedByteCount).toBeGreaterThan(0)
      expect(raw?.sourceVerdict).toBe('DIFFERENT_VERSION_QUARANTINED')
      // Actual originals are NOT committed into GitHub; no bytes means the
      // runtime verifier correctly returns RAW_NOT_AVAILABLE, not fake proof.
      const result = inspectB4OriginalVersion(pin)
      expect(result.state).toBe('RAW_NOT_AVAILABLE')
      expect(result.observedSourceSha256).toBeNull()
      expect(result.canReplaceFrozenOriginal).toBe(false)
      expect(result.publicationAllowed).toBe(false)
    }
  })
  test('an independently observed byte payload is a distinct quarantined version, not replacement', () => {
    const raw = utf8('synthetic later version\n')
    const result = inspectB4OriginalVersion(originalPins[0]!, {
      bytes: raw, provenance: 'R24-synthetic-fixture-not-an-original',
    })
    expect(result.state).toBe('DIFFERENT_VERSION_QUARANTINED')
    expect(result.observedSourceSha256).toBe(sha(raw))
    expect(result.distinctObservedVersion).toBe('sha256:' + sha(raw))
    expect(result.canReplaceFrozenOriginal).toBe(false)
    expect(result.schoolPolicyVerified).toBe(false)
  })
  test('matching actual original bytes prove ONLY byte identity and cannot silently publish', () => {
    const raw = utf8('synthetic frozen bytes')
    const synthetic = { ...originalPins[0]!, frozenSourceSha256: sha(raw) }
    const result = inspectB4OriginalVersion(synthetic, {
      bytes: raw, provenance: 'synthetic', expectedOriginalGitBlob:
        createHash('sha1').update('blob ' + raw.length + '\0').update(raw).digest('hex'),
    })
    expect(result.state).toBe('FROZEN_BYTES_MATCH_CANDIDATE_ONLY')
    expect(result.canReplaceFrozenOriginal).toBe(false)
    expect(result.publicationAllowed).toBe(false)
  })
  test('false Git pin, made-up D4 SHA and empty raw bytes fail closed', () => {
    const raw = utf8('any')
    expect(() => inspectB4OriginalVersion(originalPins[0]!, {
      bytes: raw, provenance: 'synthetic', expectedOriginalGitBlob: '0'.repeat(40),
    })).toThrow('B4_R24_GIT_BLOB_MISMATCH')
    expect(() => inspectB4OriginalVersion({ ...originalPins[0]!, frozenD4SHA: '0'.repeat(40) }))
      .toThrow('B4_R24_BAD_FROZEN_PIN')
    expect(() => inspectB4OriginalVersion(originalPins[0]!, { bytes: new Uint8Array(), provenance: 'none' }))
      .toThrow('B4_R24_BAD_RAW_EVIDENCE')
  })
})
describe('B4 R24 all 32 real R14 clause anchors, technical-only per-instance semantics', () => {
  test('actual archive lineage remains 50 candidates / 3875 Checks / 34 unscoped / 4163 unknown links', () => {
    const results = ['G01','G02','G03','G04','G05','G06','G07','G08']
      .map(d => validateB4TechnicalArchive(load('B4-OBLIGATION-SOURCE-' + d + '.json')))
    const sum = sumB4Technical(results)
    expect([sum.domains, sum.templates, sum.checks, sum.unscoped, sum.unknown])
      .toEqual([8, 50, 3875, 34, 4163])
    expect(sum.policyPublicationAllowed).toBe(false)
    const everyDomain = Object.fromEntries(['G01','G02','G03','G04','G05','G06','G07','G08']
      .map(d => [d, load('B4-OBLIGATION-SOURCE-' + d + '.json')])) as Record<string, B4Archive>
    const gaps = auditB4FrozenUnknownCoverage(everyDomain)
    expect(gaps.scopeGaps).toHaveLength(34)
    expect(gaps.sourceGaps).toHaveLength(4163)
    expect(gaps.scopeGaps.every(x => x.domain === 'G01')).toBe(true)
    expect(gaps.sourceGaps.every(x => x.documentVersionId.length > 0 &&
      x.locator.length > 0 && x.reason === 'SOURCE_APPLICABILITY_UNKNOWN')).toBe(true)
    expect(gaps.publicationAllowed).toBe(false)
  })
  test('32 actual clauses keep frozen Check/source links and EXACT domain-specific missing dimensions', () => {
    const p = proof()
    expect(p.items).toHaveLength(32)
    expect(p.items.filter(x => x.domain === 'G03')).toHaveLength(7)
    expect(p.items.filter(x => x.domain === 'G04')).toHaveLength(14)
    expect(p.items.filter(x => x.domain === 'G06')).toHaveLength(11)
    for (const row of p.items) {
      const key = row.domain as B4HighRiskDomain
      expect(row.technical.expectedReviewDimensions).toEqual([...B4_REQUIRED_DIMENSIONS[key]])
      expect(row.technical.dimensionsNotEvidencedInArchivedCheckFields)
        .toEqual([...B4_REQUIRED_DIMENSIONS[key]])
      expect(row.disposition.status).toBe('CANDIDATE_CHECK_TRACEABLE_SEMANTIC_UNPROVEN')
      expect(row.disposition.authorMayPublish).toBe(false)
    }
  })

  test('fabricated CASE scope or not-applicable source cannot erase frozen UNKNOWN entries', () => {
    const all = () => Object.fromEntries(['G01','G02','G03','G04','G05','G06','G07','G08']
      .map(d => [d, load('B4-OBLIGATION-SOURCE-' + d + '.json')])) as Record<string, B4Archive>
    const scoped = all()
    const g01 = scoped.G01!.templates.flatMap(t => t.obligations)
      .find(c => !c.genericScope && !c.caseScopeJustification)!
    g01.caseScopeJustification = 'invented CASE'
    expect(() => auditB4FrozenUnknownCoverage(scoped)).toThrow('B4_R24_FROZEN_GAP_DRIFT')
    const applicability = all()
    const source = applicability.G02!.templates[0]!.obligations[0]!.sources[0]!
    expect(source.sourceApplicability).toBe('unknown')
    source.sourceApplicability = 'not-applicable'
    expect(() => auditB4FrozenUnknownCoverage(applicability))
      .toThrow('B4_R24_FROZEN_GAP_DRIFT')
  })

  for (const selected of riskTargets) {
    test(selected.domain + ': exact-instance true / known-false / cross-object / unknown stay isolated', () => {
      const row = proof().items.find(x => x.domain === selected.domain &&
        x.templateId === selected.templateId && x.original.ruleId === selected.ruleId)!
      const result = inspectB4HighRiskInstanceEvidence(proof(), archives, selected,
        matrix(selected.domain, row.rawSha256))
      expect(result.findings.map(x => x.candidatePredicate))
        .toEqual(['applicable', 'not-applicable', 'unknown', 'unknown'])
      expect(result.findings.map(x => x.reason))
        .toEqual(['INSTANCE_EVIDENCE_MATCHES_CANDIDATE','KNOWN_FALSE_EXACT_INSTANCE',
          'WRONG_OBJECT_EVIDENCE','UNKNOWN_CONDITION'])
      expect(result.findings.every(x => !x.schoolAuthorityVerified &&
        !x.publicationAllowed && !x.historicalInstanceSemanticsPreserved)).toBe(true)
      expect(result.semanticValidated).toBe(false)
    })
    test(selected.domain + ': no evidence, missing tuple, old source version cannot infer not-applicable', () => {
      const row = proof().items.find(x => x.domain === selected.domain &&
        x.templateId === selected.templateId && x.original.ruleId === selected.ruleId)!
      const inputs = matrix(selected.domain, row.rawSha256)
      inputs[0]!.evidence = undefined
      inputs[1]!.dimensions[B4_REQUIRED_DIMENSIONS[selected.domain][0]!] = null
      inputs[2]!.evidence = { forInstanceKey: 'C', dimensions: inputs[2]!.dimensions,
        rawSourceSha256: '0'.repeat(64) }
      const result = inspectB4HighRiskInstanceEvidence(proof(), archives, selected, inputs)
      expect(result.findings.map(x => x.reason)).toEqual([
        'NO_EXACT_INSTANCE_EVIDENCE','INCOMPLETE_SCOPE','STALE_SOURCE_VERSION','UNKNOWN_CONDITION',
      ])
      expect(result.findings.every(x => x.candidatePredicate === 'unknown')).toBe(true)
    })
  }
  // Exercise every one of the 32 actual R14 high-risk original rule anchors,
  // rather than only one illustrative rule per domain.
  for (const item of proof().items) {
    const selected = {
      domain: item.domain as B4HighRiskDomain,
      templateId: item.templateId,
      ruleId: item.original.ruleId,
    }
    test('all-32 ' + selected.domain + ' ' + selected.ruleId +
      ': exact object and stale/cross-object provenance', () => {
      const input = matrix(selected.domain, item.rawSha256)
      const audited = inspectB4HighRiskInstanceEvidence(proof(), archives, selected, input)
      expect(audited.sourceSha256).toBe(item.rawSha256)
      expect(audited.checkedDimensions).toEqual([...B4_REQUIRED_DIMENSIONS[selected.domain]])
      expect(audited.findings.map(x => x.candidatePredicate))
        .toEqual(['applicable','not-applicable','unknown','unknown'])
      expect(audited.findings[2]!.reason).toBe('WRONG_OBJECT_EVIDENCE')
      expect(audited.findings.every(x => !x.schoolAuthorityVerified &&
        !x.historicalInstanceSemanticsPreserved && !x.publicationAllowed)).toBe(true)
    })
  }

  test('falsified archived clause-to-Check semantics cannot be used by R24', () => {
    const p = proof()
    p.items[0]!.technical.sourceIds[0] = 'forged-source'
    const selected = riskTargets[0]!
    expect(() => inspectB4HighRiskInstanceEvidence(p, archives, selected,
      matrix(selected.domain, '0'.repeat(64)))).toThrow('B4_SEMANTIC_AUDIT_SOURCE_IDS')
  })
  test('duplicate object keys and unpinned rule references are rejected', () => {
    const p = proof()
    const s = riskTargets[0]!
    const input = matrix('G03', p.items[0]!.rawSha256)
    input[1]!.key = 'A'
    expect(() => inspectB4HighRiskInstanceEvidence(p, archives, s, input))
      .toThrow('B4_R24_BAD_INSTANCES')
    expect(() => inspectB4HighRiskInstanceEvidence(p, archives,
      { ...s, ruleId: 'R-99' }, matrix('G03', p.items[0]!.rawSha256)))
      .toThrow('B4_R24_RULE_NOT_IN_PINNED_EVIDENCE')
  })
})
