/** G01-I D4 作者侧合成技术验证，不替代独立 Gold 或行政审批。 */
import { afterAll, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { CaseAggregateV2, D2RuleBinding, D2ScenarioSelection, ReviewAuthoringWorkspaceV1, ReviewCaseV2 } from '@profer/shared'
import { validateReviewAuthoringV1, compileReviewAuthoringCandidateV1 } from '../../../../../../../apps/electron/src/main/lib/review/review-authoring-v1'
import { saveReviewAuthoringRevisionV1, getReviewAuthoringRevisionV1, diffReviewAuthoringRevisionsV1 } from '../../../../../../../apps/electron/src/main/lib/review/review-authoring-store-v1'
import { exportD3Bundle, importD3Bundle } from '../../../../../../../apps/electron/src/main/lib/review/review-d3-module-library'
import { compileD2RuntimePlan } from '../../../../../../../apps/electron/src/main/lib/review/review-d2-runtime'
import { evaluateD2GateExpression, validateD2GuardSubmission } from '../../../../../../../apps/electron/src/main/lib/review/review-d2-execution-gates'
const dir=resolve(import.meta.dir, '..')
const load=<T>(p:string):T=>JSON.parse(readFileSync(join(dir,p),'utf8')) as T
const w=()=>load<ReviewAuthoringWorkspaceV1>('workspace/workspace.json')
const s=()=>load<D2ScenarioSelection>('workspace/selection.json')
const c=()=>load<ReviewCaseV2>('runtime/synthetic-draft-case.json')
const temps:string[]=[]
const isolate=()=>{const x=mkdtempSync(join(tmpdir(),'g01i-d4-test-'));temps.push(x);process.env.PROFER_CONFIG_DIR=x;return x}
afterAll(()=>{for(const x of temps)rmSync(x,{recursive:true,force:true})})

test('完整来源清单及 D1 来源绑定',()=>{
 const wk=w(),ledger=load<{entries:Array<{id:string;destinations:Array<{checkId?:string}>}>}>('conversion-ledger.json')
 const cat=load<{responsibilities:Array<{id:string}>}>('source-catalog.json')
 expect(validateReviewAuthoringV1(wk)).toEqual([])
 expect(wk.definitions.templates).toHaveLength(1)
 expect(wk.definitions.modules).toHaveLength(10)
 expect(wk.sourceBindings).toHaveLength(49)
 expect(wk.sharedModuleLocks).toEqual([])
 for(const [p,n] of [['R',28],['S',13],['F',28],['M',6],['P',8]] as const){
  expect(ledger.entries.filter(x=>x.id.startsWith(p))).toHaveLength(n)
  expect(cat.responsibilities.filter(x=>x.id.startsWith(p))).toHaveLength(n)
 }
 const ids=new Set(wk.sourceBindings.map(x=>x.checkId))
 for(const row of ledger.entries)for(const dest of row.destinations)if(dest.checkId)expect(ids.has(dest.checkId)).toBe(true)
})

test('D1 保存读取和不可变修订',()=>{
 isolate();const before=w()
 const first=saveReviewAuthoringRevisionV1(before,0,'g01i-technical')
 expect(getReviewAuthoringRevisionV1(before.workspaceId,1)?.digest).toBe(first.digest)
 const after=structuredClone(before);after.revision=2
 after.definitions.templates[0]!.localTasks[0]!.completion+='；作者态修订回归附加说明'
 expect(validateReviewAuthoringV1(after)).toEqual([])
 const second=saveReviewAuthoringRevisionV1(after,1,'g01i-technical')
 expect(second.parentDigest).toBe(first.digest)
 expect(getReviewAuthoringRevisionV1(before.workspaceId)?.workspace.revision).toBe(2)
 expect(diffReviewAuthoringRevisionsV1(before,after)).toBeDefined()
 expect(()=>saveReviewAuthoringRevisionV1(before,0,'rewriter')).toThrow()
})

test('D3 独立配置携包导出再导入',()=>{
 isolate();const wk=w(),bundle=exportD3Bundle(wk)
 expect(bundle.frozen).toHaveLength(0)
 expect(bundle.publicationAllowed).toBe(false)
 isolate();const restored=importD3Bundle(bundle)
 expect(restored).toEqual(wk)
 expect(exportD3Bundle(restored).fingerprint).toBe(bundle.fingerprint)
 expect(validateReviewAuthoringV1(restored)).toEqual([])
})

test('D2 真实编译：规则数/映射/政策待核/P7 门禁',()=>{
 isolate();const wk=w(),plan=compileD2RuntimePlan(wk,s(),c())
 expect(plan.mode).toBe('technical-pre-review')
 expect(plan.publicationAllowed).toBe(false)
 expect(plan.rules).toHaveLength(49)
 expect(plan.mapping).toHaveLength(49)
 expect(new Set(plan.rules.map(x=>x.id)).size).toBe(49)
 const ids=new Set(plan.rules.map(x=>x.id))
 expect(plan.mapping.every(x=>ids.has(x.ruleId)&&x.sourceIds.length>0)).toBe(true)
 expect(plan.mapping.find(x=>x.checkId.endsWith('/r011'))?.authority).toBe('unverified-policy')
 expect(plan.mapping.find(x=>x.checkId.endsWith('/p7'))?.gate?.when).toEqual({kind:'case-stage',stages:['decided','archived']})
 console.log('G01-I actual D2 fingerprint',plan.fingerprint,'checks',plan.mapping.length)
})

test('技术门禁仅区分真实 D2 CaseStage，禁止预先索取有权回执',()=>{
 isolate()
 const p7=compileD2RuntimePlan(w(),s(),c()).mapping.find(x=>x.checkId.endsWith('/p7'))!
 const a=(stage:'draft'|'decided')=>({caseV2:{...c(),stage},evidenceLinks:[],observations:[]}) as unknown as CaseAggregateV2
 expect(validateD2GuardSubmission(a('draft'),p7,'not-applicable',[])).toBeUndefined()
 expect(validateD2GuardSubmission(a('draft'),p7,'non-compliant',[])).toContain('D2_GATE_FALSE')
 expect(validateD2GuardSubmission(a('decided'),p7,'not-applicable',[])).toContain('D2_GATE_TRUE')
 expect(validateD2GuardSubmission(a('decided'),p7,'compliant',[])).toContain('D2_MATERIAL_AUTHORITY_DECISION_REQUIRED')
})

test('通用 D2 证据路径正例与反例（未集成 G01-I 主体，不得冒充）',()=>{
 const agg=(links:unknown[])=>({caseV2:{...c(),stage:'submitted',documents:[{versionId:'doc-1',active:true}]},evidenceLinks:links,observations:[]}) as unknown as CaseAggregateV2
 const link={status:'confirmed',linkedBy:'user',subjectId:'subject-1',supportsFact:'legal-name-change',documentVersionId:'doc-1'}
 const expr={kind:'evidence-any' as const,supportsFacts:['legal-name-change']}
 expect(evaluateD2GateExpression(expr,agg([link]),'subject-1',['doc-1'])).toBe('true')
 expect(evaluateD2GateExpression(expr,agg([]),'subject-1',['doc-1'])).toBe('unknown')
 expect(evaluateD2GateExpression(expr,agg([link]),'subject-2',['doc-1'])).toBe('unknown')
 const binding={checkId:'synthetic-only',ruleId:'dummy',sourceIds:['md-original'],authority:'request-scope',subjectId:'subject-1',gate:{material:{provider:'applicant',dueStages:['submitted'],alternatives:['legal-name-change']}}} as D2RuleBinding
 expect(validateD2GuardSubmission(agg([link]),binding,'compliant',['doc-1'])).toBeUndefined()
 expect(validateD2GuardSubmission(agg([]),binding,'compliant',['doc-1'])).toContain('D2_MATERIAL_ALTERNATIVE_UNVERIFIED')
 expect(validateD2GuardSubmission(agg([link]),binding,'awaiting-supplement',['doc-1'])).toContain('D2_MATERIAL_ALREADY_SUPPORTED')
})

test('没有 G01 多轴方案，改 caseFields 不会改变 D2 任务；高级证据图拒止',()=>{
 isolate()
 const plan1=compileD2RuntimePlan(w(),s(),c())
 const plan2=compileD2RuntimePlan(w(),s(),{...c(),caseFields:{applicantName:{kind:'text',value:'合成值'}}})
 expect(plan2.fingerprint).toBe(plan1.fingerprint)
 const branch=structuredClone(w());branch.definitions.templates[0]!.scenarios=['legal-name-change']
 expect(()=>compileD2RuntimePlan(branch,{...s(),scenario:'legal-name-change'},c())).toThrow('D2_SCENARIO_SCOPE_REQUIRED')
 const complex=structuredClone(w());complex.advanced={claimKeys:['name-link'],evidenceRelations:[{claimKey:'name-link',requiredSourceIds:['md-original']}]}
 expect(()=>compileD2RuntimePlan(complex,s(),c())).toThrow('D2_UNMAPPED_ADVANCED')
 expect(()=>compileReviewAuthoringCandidateV1(w(),s().templateId,s().version)).toThrow('D1_UNMAPPABLE_EXECUTION_GATE')
})
