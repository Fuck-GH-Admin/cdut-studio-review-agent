import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const raw = readFileSync(new URL('../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/B4-50-CANDIDATE-SOURCE-LEDGER.csv', import.meta.url), 'utf8')
const lines = raw.trimEnd().split(/\r?\n/)
const decode = (s: string): string[] => s.slice(1, -1).split('","').map((cell) => cell.replaceAll('""', '"'))
const columns = decode(lines[0]!)
const rows = lines.slice(1).map((line) =>
  Object.fromEntries(decode(line).map((value, i) => [columns[i]!, value])),
)

describe('B-ASSET-01 preliminary: historical candidate index, not source obligation Gold', () => {
  test('all 50 cataloged candidates are distinct and still held, never published/CI-passed', () => {
    expect(rows).toHaveLength(50)
    expect(new Set(rows.map((x) => x.templateId)).size).toBe(50)
    const count = Object.fromEntries(
      ['G01','G02','G03','G04','G05','G06','G07','G08'].map(
        (domain) => [domain, rows.filter((x) => x.domain === domain).length],
      ),
    )
    expect(count).toEqual({ G01:5, G02:3, G03:10, G04:8, G05:6, G06:9, G07:7, G08:2 })
    for (const row of rows) {
      expect(row.publication).toBe('candidate-held')
      expect(row.integrationStatus).toBe('NOT_RUN')
      expect(row.policyApproval).toBe('NOT_VERIFIED')
      expect(row.obligationMappingStatus).toBe('PENDING_PER_OBLIGATION_DIFF')
      expect(row.workspaceGitBlobSha).toMatch(/^[a-f0-9]{40}$/)
      expect(row.sourceSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(row.sourceHeadSha).toMatch(/^[a-f0-9]{40}$/)
    }
  })
  test('G03 remains explicitly GENERATED_NOT_RUN; G04/G07 gaps have no fake pass', () => {
    for (const row of rows.filter((x) => x.domain === 'G03')) {
      expect(row.historicalStatus).toBe('GENERATED_NOT_RUN')
      expect(row.risk).toContain('GENERATED_NOT_RUN')
    }
    for (const row of rows.filter((x) => x.domain === 'G04' || x.domain === 'G07')) {
      expect(row.risk).toContain('partial original obligation')
    }
  })
})
