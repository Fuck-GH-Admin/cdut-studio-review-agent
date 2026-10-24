/**
 * Unified Review V3: evaluating published-template deterministic checks must be
 * read-only. The real Pi admission owns the single persisted Run for a review.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { CaseAggregateV2, TemplateVersion } from '@profer/shared'
import { REVIEW_V3_OTHER_MATERIAL_SLOT_ID } from '@profer/shared'

const configDir=mkdtempSync(join(tmpdir(),'v3-unified-run-'))
process.env.PROFER_CONFIG_DIR=configDir
afterAll(()=>rmSync(configDir,{recursive:true,force:true}))

const { evaluateTemplateRuleReview } = await import('./review-v3-main-template-run')
const { listRunsV2 } = await import('./run-store-v2')

const caseId='v3-unified-run-regression'
const template:TemplateVersion={
  templateId:'unified-plan-test',version:1,schemaVersion:2,
  name:'资料审查',objectType:'document',displayName:{template:'资料审查'},
  status:'published',createdAt:'2026-10-24T00:00:00Z',
  fields:[],policyVersionIds:[],policyRefs:[],sections:[],
  materialSlots:[{
    id:'required-evidence',name:'项目佐证',purpose:'证明材料',requiredAt:'submission',
    minCount:1,maxCount:5,acceptedKinds:['pdf','office','image'],requiredElements:[],
    allowReuseAcrossSubjects:false,
  }],
  stages:[{id:'review',name:'初审',kind:'manual-review',executorRole:'reviewer'}],
  outputs:[],
}
function aggregateFor(slotId?:string):CaseAggregateV2 {
  return {
    caseV2:{
      id:caseId,templateId:template.templateId,templateVersion:1,
      title:'测试案卷',objectType:'document',caseFields:{},subjects:[],
      documents:[{
        documentId:'doc-1',versionId:'doc-1-v1',contentHash:'abcdef',byteHash:'abcdef',
        active:true,role:'application',fileName:'申请书.pdf',mimeType:'application/pdf',
        materialSlotId:slotId,sizeBytes:123,assetPath:'source-docs/doc-1-v1/申请书.pdf',
        parseRevision:1,parseStatus:'parsed',blocks:[],usage:'registered',
      }],stage:'draft',revision:1,
      createdAt:'2026-10-24T00:00:00Z',updatedAt:'2026-10-24T00:00:00Z',
    },
    observations:[],evidenceLinks:[],tasks:[],decisions:[],supplements:[],
    dispositions:[],receiptLog:[],
  } as CaseAggregateV2
}

describe('V3 template checks in one Pi Run',()=>{
  test('read-only evaluation never creates a second run-tpl-* ledger',()=>{
    const before=listRunsV2(caseId)
    const result=evaluateTemplateRuleReview({
      aggregate:aggregateFor(REVIEW_V3_OTHER_MATERIAL_SLOT_ID),template,
    })
    expect(result.checks.some(check=>check.ruleId==='required-material-required-evidence')).toBe(true)
    expect(result.checks.some(check=>check.status==='awaiting-supplement')).toBe(true)
    expect(listRunsV2(caseId)).toEqual(before)
  })
  test('unclassified input is unknown, not confirmed missing',()=>{
    const unknown=evaluateTemplateRuleReview({aggregate:aggregateFor(),template})
    const check=unknown.checks.find(x=>x.ruleId==='required-material-required-evidence')
    expect(check?.status).toBe('awaiting-confirmation')
    expect(unknown.checks.every(x=>x.status!=='compliant')).toBe(true)
    expect(listRunsV2(caseId)).toHaveLength(0)
  })
  test('classification changes the frozen plan fingerprint',()=>{
    const a=evaluateTemplateRuleReview({aggregate:aggregateFor(),template})
    const b=evaluateTemplateRuleReview({aggregate:aggregateFor(REVIEW_V3_OTHER_MATERIAL_SLOT_ID),template})
    expect(a.planFingerprint).not.toBe(b.planFingerprint)
  })
})
