import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const file=fileURLToPath(new URL(
  '../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/B4-G01-34-ORIGINAL-LINE-ANCHORS-R04.json',
  import.meta.url,
))
describe('B4 G01 original anchor recovery cannot fill missing business object scope',()=>{
  test('exact 34 historical Check identities carry original line locators but remain UNKNOWN',()=>{
    const x=JSON.parse(readFileSync(file,'utf8'))
    expect(x.totalUnresolved).toBe(34)
    expect(x.anchors).toHaveLength(34)
    expect(x.publicationAllowed).toBe(false)
    expect(x.policyApproval).toBe('NOT_VERIFIED')
    expect(x.originalGitBlob).toBe('aec737f471d4e648ab98a9243dcf4bc9939ce8a5')
    const ids=new Set<string>()
    for(const a of x.anchors){
      expect(ids.has(a.checkId)).toBe(false)
      ids.add(a.checkId)
      expect(a.originalGitBlob).toBe(x.originalGitBlob)
      expect(a.originalSha256).toBe(x.originalSha256)
      expect(a.originalLine).toBeGreaterThan(0)
      expect(a.originalLine).toBeLessThanOrEqual(536)
      expect(a.originalExactLine).toContain(a.sourceTag)
      expect(a.scopeState).toBe('UNKNOWN')
      expect(a.requiredDecision).toContain('NO_AUTO_DEFAULT')
      expect(a.policyApproval).toBe('NOT_VERIFIED')
    }
  })
})
