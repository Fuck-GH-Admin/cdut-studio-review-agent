import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { validateB4RuleAnchorLedger, type B4RuleAnchorLedger } from './review-v3-b4-rule-source-diff'
import type { B4Archive } from './review-v3-b4-obligation-lineage'
const root=new URL('../../../../../../docs/design/review-agent/acceptance/v3-dev-b-r01/',import.meta.url)
const load=(name:string)=>JSON.parse(readFileSync(fileURLToPath(new URL(name,root)),'utf8'))
const archives=Object.fromEntries(['G03','G04','G06'].map(d=>[d,load('B4-OBLIGATION-SOURCE-'+d+'.json')])) as Record<string,B4Archive>
const evidence=()=>load('B4-R13-107-RAW-RULE-CHECK-ANCHOR-LEDGER.json') as B4RuleAnchorLedger
describe('B4 R13 all 107 raw Markdown rule headings vs historical D4 Check lineage',()=>{
 test('27+46+34 original rule-ID headings map to pinned workspace Checks but prove no semantic approval',()=>{
  const summary=validateB4RuleAnchorLedger(evidence(),archives)
  expect(summary.templateCount).toBe(3)
  expect(summary.rawRules).toBe(107)
  expect(summary.checkAnchorEdges).toBeGreaterThanOrEqual(107)
  expect(summary.highRiskRules).toBeGreaterThan(20)
  expect(summary.semanticApproved).toBe(0)
  expect(summary.publicationAllowed).toBe(false)
 })
 test('missing raw rule or missing D4 Check is rejected rather than hidden in a coverage percentage',()=>{
  const missing=evidence()
  missing.templates[0]!.ruleAnchors.pop()
  expect(()=>validateB4RuleAnchorLedger(missing,archives)).toThrow('B4_RULE_DIFF_TEMPLATE')
  const removed=evidence()
  removed.templates[1]!.ruleAnchors[0]!.mappedCheckIds=[]
  expect(()=>validateB4RuleAnchorLedger(removed,archives)).toThrow('B4_RULE_DIFF_RULE')
 })
 test('renaming Check or losing required source linkage does not pass evidence gate',()=>{
  const renamed=evidence()
  renamed.templates[2]!.ruleAnchors[0]!.mappedCheckIds[0]='invented-check'
  expect(()=>validateB4RuleAnchorLedger(renamed,archives)).toThrow('B4_RULE_DIFF_CHECK_RULE_MISMATCH')
  const source=evidence()
  source.templates[0]!.ruleAnchors[0]!.sourceIds=[]
  expect(()=>validateB4RuleAnchorLedger(source,archives)).toThrow('B4_RULE_DIFF_SOURCE_EDGE')
 })
 test('policy approval and source semantic promotion remain unreachable',()=>{
  const fake=evidence()
  fake.publicationAllowed=true as false
  expect(()=>validateB4RuleAnchorLedger(fake,archives)).toThrow('B4_RULE_DIFF_HEADER')
  const fake2=evidence()
  fake2.templates[0]!.ruleAnchors[0]!.semanticValidated=true as false
  expect(()=>validateB4RuleAnchorLedger(fake2,archives)).toThrow('B4_RULE_DIFF_RULE')
 })
})
