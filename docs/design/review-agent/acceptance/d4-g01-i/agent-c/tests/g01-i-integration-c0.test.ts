/** Agent C independent D2 contract probes. Does not read B input/Gold or call Pi. */
import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import type { ReviewAuthoringWorkspaceV1, D2ScenarioSelection, ReviewCaseV2 } from '@profer/shared'
import { compileD2RuntimePlan } from '../../../../../../../apps/electron/src/main/lib/review/review-d2-runtime'
const a = resolve(import.meta.dir,'../../agent-a')
const load=<T>(p:string):T=>JSON.parse(readFileSync(join(a,p),'utf8')) as T
const w=()=>load<ReviewAuthoringWorkspaceV1>('workspace/workspace.json')
const s=()=>load<D2ScenarioSelection>('workspace/selection.json')
const c=()=>load<ReviewCaseV2>('runtime/synthetic-draft-case.json')
test('C0 fixed A plan contains no bound identity targets',()=>{
 const plan=compileD2RuntimePlan(w(),s(),c())
 expect(plan.publicationAllowed).toBe(false)
 expect(plan.rules).toHaveLength(49)
 expect(plan.mapping).toHaveLength(49)
 expect(plan.subjects).toHaveLength(0)
 expect(plan.targets).toHaveLength(0)
 expect(plan.mapping.every(x=>!x.subjectId&&!x.objectKey)).toBe(true)
})
test('B-like caseFields do not change D2 fingerprint or checks',()=>{
 const base=compileD2RuntimePlan(w(),s(),c())
 const other={...c(),caseFields:{studentNameOld:{kind:'text' as const,value:'OLD'},studentNameNew:{kind:'text' as const,value:'NEW'},studentLevel:{kind:'text' as const,value:'GRADUATE'}}}
 const rerun=compileD2RuntimePlan(w(),s(),other)
 expect(rerun.fingerprint).toBe(base.fingerprint)
 expect(rerun.mapping).toEqual(base.mapping)
})
test('G01 conditional scenario without campus-card target rejects',()=>{
 const ws=w();ws.definitions.templates[0]!.scenarios=['legal-name-change']
 expect(()=>compileD2RuntimePlan(ws,{...s(),scenario:'legal-name-change'},c())).toThrow('D2_SCENARIO_SCOPE_REQUIRED')
})
test('nonempty claim/evidence relationship fails closed',()=>{
 const ws=w();ws.advanced={claimKeys:['old-new'],evidenceRelations:[{claimKey:'old-new',requiredSourceIds:['md-original']}]}
 expect(()=>compileD2RuntimePlan(ws,s(),c())).toThrow('D2_UNMAPPED_ADVANCED')
})
