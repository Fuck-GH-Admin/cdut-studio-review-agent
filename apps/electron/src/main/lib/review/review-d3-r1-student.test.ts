/** R1 red-to-green G01-I public engine repro. Synthetic only; no private B / Gold. */
import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { D2ScenarioSelection, ReviewAuthoringWorkspaceV1, ReviewCaseV2 } from '@profer/shared'
import { compileD2RuntimePlan } from './review-d2-runtime'

const dir = resolve(import.meta.dir, '../../../../../../docs/design/review-agent/fixtures')
const workspace = (): ReviewAuthoringWorkspaceV1 => JSON.parse(readFileSync(resolve(dir,'d2-workspace-synthetic.json'),'utf8'))
const draft = (): ReviewCaseV2 => ({
  id:'synthetic-student-case',templateId:'text-review',templateVersion:1,title:'synthetic name and ID correction',
  objectType:'document',caseFields:{},subjects:[],documents:[],stage:'draft',revision:0,
  createdAt:'2026-10-17T00:00:00Z',updatedAt:'2026-10-17T00:00:00Z',
})
const chosen = (): D2ScenarioSelection => ({
  templateId:'text-review',version:1,
  targets:[
    {kind:'student-field',objectKey:'synthetic-student/full-name',subjectId:'student-name-check',title:'name correction',studentId:'synthetic-student',fieldKey:'full-name',intent:'correction',enrollmentStatus:'enrolled'},
    {kind:'student-field',objectKey:'synthetic-student/credential-id',subjectId:'student-credential-check',title:'ID correction',studentId:'synthetic-student',fieldKey:'credential-id',intent:'correction',enrollmentStatus:'enrolled'},
  ],
} as unknown as D2ScenarioSelection)

test('R0 red -> R1: one synthetic student, two typed field subjects and two independent checks',()=>{
  const w=workspace()
  const b=w.sourceBindings.find(x=>x.checkId==='text-review@1:module/text/structure')! as typeof w.sourceBindings[number] & Record<string,unknown>
  b.studentScope={fieldKeys:['full-name','credential-id'],intents:['correction'],enrollmentStatuses:['enrolled']}
  const plan=compileD2RuntimePlan(w,chosen(),draft())
  expect(plan.publicationAllowed).toBe(false)
  expect(plan.targets.map(x=>x.objectKey)).toEqual(['synthetic-student/full-name','synthetic-student/credential-id'])
  expect(plan.subjects).toHaveLength(2)
  expect(plan.mapping).toHaveLength(2)
  expect(new Set(plan.mapping.map(x=>x.subjectId)).size).toBe(2)
  expect(plan.mapping.every(x=>x.objectKey&&x.subjectId&&x.sourceIds.length)).toBe(true)
})

test('old D3-R0 cannot instantiate real student-field target',()=>{
  expect(()=>compileD2RuntimePlan(workspace(),chosen(),draft())).toThrow('D2_TARGET_INVALID')
})
