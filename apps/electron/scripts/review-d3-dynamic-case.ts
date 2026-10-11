/**
 * Agent-first D3 dynamic archive instance CLI:
 * bun apps/electron/scripts/review-d3-dynamic-case.ts build <base-workspace.json> <request.json> <output-dir>
 * Pure author-side file generation: no writes to case store, no model calls, no publication.
 * Then use review-d2-plan.ts preview/create with the generated workspace + selection.
 */
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {resolve,join} from 'node:path'
import type {ReviewAuthoringWorkspaceV1} from '@profer/shared'
import {instantiateD3ArchiveCaseV1,type D3ArchiveCaseRequestV1} from '../src/main/lib/review/review-d3-dynamic-case'
import {compileD2RuntimePlan} from '../src/main/lib/review/review-d2-runtime'

const [command,workspacePath,requestPath,outputDir]=process.argv.slice(2)
if(command!=='build'||!workspacePath||!requestPath||!outputDir) {
  process.stderr.write('usage: build <base-workspace.json> <case-request.json> <output-dir>\n')
  process.exit(2)
}
const read=<T>(name:string):T=>JSON.parse(readFileSync(resolve(name),'utf8')) as T
try {
  const base=read<ReviewAuthoringWorkspaceV1>(workspacePath)
  const request=read<D3ArchiveCaseRequestV1>(requestPath)
  const instantiated=instantiateD3ArchiveCaseV1(base,request)
  const caseId='d3-dynamic-'+request.caseKey
  const now=new Date().toISOString()
  const caseV2={
    id:caseId,templateId:request.templateId,templateVersion:request.version,
    title:'合成技术预审 '+request.caseKey,objectType:'document' as const,
    stage:'draft' as const,caseFields:{},subjects:[],documents:[],
    revision:0,createdAt:now,updatedAt:now,
  }
  const plan=compileD2RuntimePlan(instantiated.workspace,instantiated.selection,caseV2)
  mkdirSync(resolve(outputDir),{recursive:true})
  for(const [name,value] of Object.entries({
    'workspace.json':instantiated.workspace,
    'selection.json':instantiated.selection,
    'synthetic-case.json':caseV2,
    'plan.json':plan,
    'origin-map.json':{
      sourceWorkspaceId:base.workspaceId,sourceWorkspaceRevision:base.revision,
      targetWorkspaceId:instantiated.workspace.workspaceId,
      requestedCaseKey:request.caseKey,
      checkSources:instantiated.originalCheckSourceMap,
      operationVocabulary:instantiated.normalizedOperations,
      administrativeApproval:false,
      businessGoldVerified:false,
    },
  }))writeFileSync(join(resolve(outputDir),name),JSON.stringify(value,null,2)+'\n','utf8')
  process.stdout.write(JSON.stringify({
    caseId,workspaceId:instantiated.workspace.workspaceId,
    actualChecks:plan.mapping.length,targets:plan.targets.length,
    fingerprint:plan.fingerprint,publicationAllowed:false,outputDir:resolve(outputDir),
  },null,2)+'\n')
} catch(err) {
  process.stderr.write(String(err instanceof Error?err.message:err)+'\n')
  process.exitCode=1
}
