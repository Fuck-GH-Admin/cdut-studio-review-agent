/** 实际 D2 计划分块，防止 Bun stdout 单文件过长；仅合成技术案卷。 */
import {test,expect} from 'bun:test'
import {readFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import type {ReviewAuthoringWorkspaceV1,D2ScenarioSelection,ReviewCaseV2} from '@profer/shared'
import {compileD2RuntimePlan} from '../../../../../../../apps/electron/src/main/lib/review/review-d2-runtime'
test('G01-I D2 actual technical plan fragment 3',()=>{
 const root=resolve(import.meta.dir,'..')
 const load=<T>(name:string):T=>JSON.parse(readFileSync(join(root,name),'utf8')) as T
 const plan=compileD2RuntimePlan(load<ReviewAuthoringWorkspaceV1>('workspace/workspace.json'),load<D2ScenarioSelection>('workspace/selection.json'),load<ReviewCaseV2>('runtime/synthetic-draft-case.json'))
 expect(plan.rules).toHaveLength(49)
 expect(plan.fingerprint).toBe('31b1240de64e4f2038790c7f7cdbdb7f139b14ce9db8e9689620fafdcce472ef')
 const encoded=Buffer.from(JSON.stringify(plan),'utf8').toString('base64')
 const chunk=Math.ceil(encoded.length/4)
 console.log('G01I_SNAPSHOT_PART_3:'+encoded.slice(3*chunk,4*chunk))
 console.log('G01I_SNAPSHOT_BYTES_3:'+encoded.length)
})
