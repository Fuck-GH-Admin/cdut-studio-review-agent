/**
 * D3 controlled explicit upgrade and reverse consumer/impact view.
 * Edits only one authoring workspace revision, never changes a frozen definition in place.
 */
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewAuthoringUseV1, ReviewAuthoringWorkspaceV1 } from '@profer/shared'
import { getConfigDir } from '../config-paths'
import { getReviewAuthoringRevisionV1 } from './review-authoring-store-v1'
import { inspectFrozenD3Module, reuseFrozenD3Module, diffD3Modules } from './review-d3-module-library'

const SAFE = /^[a-z][a-z0-9-]{0,79}$/
const key = (id: string, version: number): string => id + '@' + version

export interface D3UpgradeImpact {
  from: { moduleId: string; version: number; digest: string }
  to: { moduleId: string; version: number; digest: string }
  contentDiff: ReturnType<typeof diffD3Modules>
  consumers: Array<{ workspaceId: string; revision: number; templateId: string; templateVersion: number; instancePath: string }>
  requireExplicitMigration: true
}

/** Only current, complete D1 revision chains are considered. Broken histories are blockers, not silently ignored. */
export function listD3FrozenConsumers(moduleId: string, version: number): D3UpgradeImpact['consumers'] {
  const root = join(getConfigDir(),'review-authoring-v1')
  if (!existsSync(root)) return []
  const result: D3UpgradeImpact['consumers'] = []
  for (const folder of readdirSync(root, { withFileTypes: true })) {
    if (!folder.isDirectory() || !SAFE.test(folder.name)) continue
    const latest = getReviewAuthoringRevisionV1(folder.name)
    if (!latest) continue
    const w = latest.workspace
    const modules = new Map(w.definitions.modules.map((module) => [key(module.moduleId,module.version),module]))
    const locked = new Set((w.sharedModuleLocks ?? []).map((lock) => key(lock.moduleId,lock.version)))
    if (!locked.has(key(moduleId,version))) continue
    for (const template of w.definitions.templates) {
      const walk=(use:ReviewAuthoringUseV1,path:string,ancestors:Set<string>):void=>{
        const moduleKey=key(use.moduleId,use.version)
        if (moduleKey === key(moduleId,version)) result.push({
          workspaceId:w.workspaceId,revision:w.revision,
          templateId:template.templateId,templateVersion:template.version,instancePath:path,
        })
        if (ancestors.has(moduleKey)) return
        const module=modules.get(moduleKey)
        if (!module) return
        const next=new Set(ancestors);next.add(moduleKey)
        for (const nested of module.references ?? []) walk(nested,path+'/'+nested.id,next)
      }
      for (const use of template.modules) walk(use,'module/'+use.id,new Set())
    }
  }
  return result.sort((a,b) =>
    (a.workspaceId+'/'+a.templateId+'/'+a.instancePath).localeCompare(b.workspaceId+'/'+b.templateId+'/'+b.instancePath))
}

export function inspectD3UpgradeImpact(moduleId:string,fromVersion:number,toVersion:number):D3UpgradeImpact {
  if (fromVersion === toVersion) throw new Error('D3_UPGRADE_VERSION: 不能将冻结资产原地修改')
  const from=inspectFrozenD3Module(moduleId,fromVersion)
  const to=inspectFrozenD3Module(moduleId,toVersion)
  if (!from || !to) throw new Error('D3_UPGRADE_LOCK_MISSING: 新旧版本都必须先冻结')
  return {
    from:{moduleId,version:fromVersion,digest:from.digest},
    to:{moduleId,version:toVersion,digest:to.digest},
    contentDiff:diffD3Modules(from.module,to.module),
    consumers:listD3FrozenConsumers(moduleId,fromVersion),
    requireExplicitMigration:true,
  }
}

/**
 * Reuse existing D3 hydration/lock validation, but atomically replace ONE selected module instance.
 * Caller explicitly supplies all source binding rows under this instance after upgrade,
 * and acknowledges every removed checkId. No implicit "new strict policy wins".
 */
export function upgradeD3ModuleUse(input:{
  workspace:ReviewAuthoringWorkspaceV1
  expectedRevision:number
  templateId:string
  templateVersion:number
  useId:string
  expectedOldDigest:string
  newVersion:number
  expectedNewDigest:string
  sourceBindings:Array<{checkId:string;sourceIds:string[];applicabilityNote?:string}>
  acknowledgeRemovedCheckIds:string[]
}):{workspace:ReviewAuthoringWorkspaceV1;removedCheckIds:string[];newCheckIds:string[]} {
  if (input.workspace.revision !== input.expectedRevision) throw new Error('D3_REVISION_CONFLICT')
  const template=input.workspace.definitions.templates.find(t=>t.templateId===input.templateId&&t.version===input.templateVersion)
  const use=template?.modules.find(item=>item.id===input.useId)
  if (!use) throw new Error('D3_UPGRADE_INSTANCE_MISSING: '+input.templateId+'/'+input.useId)
  if (use.version===input.newVersion) throw new Error('D3_UPGRADE_VERSION: 原版本与目标版本相同')
  const from=inspectFrozenD3Module(use.moduleId,use.version)
  const to=inspectFrozenD3Module(use.moduleId,input.newVersion)
  if (!from || !to || from.digest!==input.expectedOldDigest || to.digest!==input.expectedNewDigest) {
    throw new Error('D3_UPGRADE_LOCK_MISMATCH: 旧/新冻结版本摘要不匹配')
  }
  const ref=key(use.moduleId,use.version)
  if (!(input.workspace.sharedModuleLocks ?? []).some(lock=>
    key(lock.moduleId,lock.version)===ref && lock.digest===from.digest)) {
    throw new Error('D3_UPGRADE_NOT_SHARED: 原引用不是当前工作区中已锁定共享版本')
  }
  const prefix=input.templateId+'@'+input.templateVersion+':module/'+input.useId+'/'
  const before = input.workspace.sourceBindings.filter(b=>b.checkId.startsWith(prefix)).map(b=>b.checkId)
  const updated=structuredClone(input.workspace)
  updated.definitions.templates.find(t=>t.templateId===input.templateId&&t.version===input.templateVersion)!.modules=
    template!.modules.filter(item=>item.id!==input.useId)
  updated.sourceBindings=updated.sourceBindings.filter(binding=>!binding.checkId.startsWith(prefix))
  const next=reuseFrozenD3Module({
    workspace:updated,expectedRevision:input.expectedRevision,templateId:input.templateId,
    templateVersion:input.templateVersion,
    use:{...use,version:input.newVersion},
    expectedDigest:to.digest,sourceBindings:input.sourceBindings,
  })
  const after=next.sourceBindings.filter(b=>b.checkId.startsWith(prefix)).map(b=>b.checkId)
  const removed=before.filter(id=>!after.includes(id)).sort()
  const approved=[...new Set(input.acknowledgeRemovedCheckIds)].sort()
  if (JSON.stringify(removed)!==JSON.stringify(approved)) {
    throw new Error('D3_UPGRADE_REMOVAL_NOT_ACKNOWLEDGED: 删除的审核责任需要逐项签收 '+removed.join(','))
  }
  return { workspace:next,removedCheckIds:removed,newCheckIds:after.filter(id=>!before.includes(id)).sort() }
}
