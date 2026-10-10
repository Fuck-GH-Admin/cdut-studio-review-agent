/**
 * D3 本地、不可变的跨工作区模块库。
 * 制作态解引用固定 sha256；普通 Pi 只消费 D1/D2 编译后的完整审核任务。
 * 本地摘要防非预期更改，不提供数字签名或校方制度权限。
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, openSync, closeSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  ReviewAuthoringModuleV1, ReviewAuthoringWorkspaceV1, ReviewAuthoringUseV1,
  ReviewD3FrozenModule, ReviewD3ModuleLock, ReviewD3TransferBundle,
} from '@profer/shared'
import { getConfigDir } from '../config-paths'
import { validateReviewAuthoringV1 } from './review-authoring-v1'
import { validateDemoState } from './semantic-module-demo'
import { validateD3WorkspaceLocks } from './review-d3-workspace-locks'

const SAFE_ID = /^[a-z][a-z0-9-]{0,79}$/
const VERSION = (value: number): boolean => Number.isSafeInteger(value) && value >= 1
const digest = (value: unknown): string => createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex')
const key = (id: string, version: number): string => id + '@' + version
const sortLocks = (locks: ReviewD3ModuleLock[]): ReviewD3ModuleLock[] =>
  [...locks].sort((a, b) => key(a.moduleId, a.version).localeCompare(key(b.moduleId, b.version)))

function validateId(id: string, version: number): void {
  if (!SAFE_ID.test(id) || !VERSION(version)) throw new Error('D3_BAD_MODULE_KEY: ' + key(String(id), version))
}
function pathFor(id: string, version: number): string {
  validateId(id, version)
  return join(getConfigDir(), 'review-d3-frozen-modules', id, version + '.json')
}
function parseRecord(raw: string, label: string): ReviewD3FrozenModule {
  let record: ReviewD3FrozenModule
  try { record = JSON.parse(raw) as ReviewD3FrozenModule }
  catch { throw new Error('D3_CORRUPTED: 冻结模块 JSON 无法解析 ' + label) }
  if (!record || record.schemaVersion !== 1 || record.status !== 'shared-frozen' ||
      !record.module || !Array.isArray(record.dependencies) || !Array.isArray(record.exampleIds)) {
    throw new Error('D3_CORRUPTED: 冻结模块结构不完整 ' + label)
  }
  validateId(record.module.moduleId, record.module.version)
  if (!/^[0-9a-f]{64}$/.test(record.digest) || record.digest !== digest(record.module)) {
    throw new Error('D3_DIGEST_MISMATCH: 冻结内容已更改 ' + label)
  }
  if (!record.exampleIds.length || record.exampleIds.some((id) => typeof id !== 'string' || !id.trim())) {
    throw new Error('D3_MISSING_EXAMPLES: 冻结资产未关联回归测试定位 ' + label)
  }
  const refs = record.module.references ?? []
  const actual = sortLocks(record.dependencies)
  if (new Set(actual.map((v) => key(v.moduleId, v.version))).size !== actual.length ||
      actual.length !== refs.length ||
      refs.some((use) => !actual.some((v) => v.moduleId === use.moduleId && v.version === use.version && /^[0-9a-f]{64}$/.test(v.digest)))) {
    // 首版每个 dependency 版本只能声明一次；重复使用一个子模块通过不同实例表达，不复制依赖锁。
    const uniqueReferences = new Set(refs.map((v) => key(v.moduleId, v.version)))
    if (actual.length !== uniqueReferences.size ||
        refs.some((use) => !actual.some((v) => v.moduleId === use.moduleId && v.version === use.version))) {
      throw new Error('D3_DEPENDENCY_LOCK_INVALID: 引用图和冻结依赖锁不一致 ' + label)
    }
  }
  return record
}
function readOne(id: string, version: number): ReviewD3FrozenModule | undefined {
  const path = pathFor(id, version)
  if (!existsSync(path)) return undefined
  const record = parseRecord(readFileSync(path, 'utf8'), key(id, version))
  if (record.module.moduleId !== id || record.module.version !== version) {
    throw new Error('D3_CORRUPTED: 冻结文件身份与路径不匹配 ' + key(id, version))
  }
  return record
}
function checkChain(record: ReviewD3FrozenModule, lookup: (id: string, version: number) => ReviewD3FrozenModule | undefined, visiting = new Set<string>()): void {
  const id = key(record.module.moduleId, record.module.version)
  if (visiting.has(id)) throw new Error('D3_DEPENDENCY_CYCLE: ' + id)
  const stack = new Set(visiting)
  stack.add(id)
  for (const dep of record.dependencies) {
    validateId(dep.moduleId, dep.version)
    const ref = lookup(dep.moduleId, dep.version)
    if (!ref) throw new Error('D3_DEPENDENCY_MISSING: ' + key(dep.moduleId, dep.version) + ' ← ' + id)
    if (ref.digest !== dep.digest) throw new Error('D3_DEPENDENCY_DIGEST: ' + key(dep.moduleId, dep.version) + ' ← ' + id)
    checkChain(ref, lookup, stack)
  }
}

/** 强制读完整依赖链，防止底层文件被改而当前模块仍表现为可复用。 */
export function inspectFrozenD3Module(id: string, version: number): ReviewD3FrozenModule | undefined {
  const record = readOne(id, version)
  if (record) checkChain(record, readOne)
  return record ? structuredClone(record) : undefined
}

/** 现有模块先通过 D0.5 组合语义验证，再冻结；依赖只能锁定已有冻结资产。 */
export function freezeD3Module(module: ReviewAuthoringModuleV1, exampleIds: string[]): ReviewD3FrozenModule {
  validateId(module.moduleId, module.version)
  if (!exampleIds.length || exampleIds.some((item) => !item?.trim())) {
    throw new Error('D3_MISSING_EXAMPLES: 冻结前需登记至少一项可复跑的合成测试')
  }
  const dependencies: ReviewD3ModuleLock[] = []
  const hydrated: ReviewAuthoringModuleV1[] = []
  const visit = (current: ReviewAuthoringModuleV1): void => {
    for (const use of current.references ?? []) {
      const ref = inspectFrozenD3Module(use.moduleId, use.version)
      if (!ref) throw new Error('D3_DEPENDENCY_MISSING: ' + key(use.moduleId, use.version))
      if (!hydrated.some((v) => key(v.moduleId, v.version) === key(ref.module.moduleId, ref.module.version))) {
        hydrated.push(structuredClone(ref.module))
        visit(ref.module)
      }
      if (current === module && !dependencies.some((v) => key(v.moduleId, v.version) === key(ref.module.moduleId, ref.module.version))) {
        dependencies.push({ moduleId: ref.module.moduleId, version: ref.module.version, digest: ref.digest })
      }
    }
  }
  visit(module)
  const errors = validateDemoState({ revision: 0, modules: [...hydrated, module], templates: [] })
  if (errors.length) throw new Error('D3_MODULE_INVALID: ' + errors.join('；'))
  if (!(module.tasks?.length || module.references?.length)) throw new Error('D3_EMPTY_MODULE: 不冻结没有审核责任的空模块')
  const record: ReviewD3FrozenModule = {
    schemaVersion: 1, status: 'shared-frozen', module: structuredClone(module), digest: digest(module),
    dependencies: sortLocks(dependencies),
    exampleIds: [...new Set(exampleIds)].sort(),
  }
  // 本地文件系统的轻量不可变身份：现存同 ID@版本不同内容不允许覆盖。
  const path = pathFor(module.moduleId, module.version)
  mkdirSync(join(getConfigDir(), 'review-d3-frozen-modules', module.moduleId), { recursive: true })
  let fd: number
  try { fd = openSync(path, 'wx') }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
    const prior = inspectFrozenD3Module(module.moduleId, module.version)!
    if (prior.digest !== record.digest || digest(prior.dependencies) !== digest(record.dependencies)) {
      throw new Error('D3_FROZEN_CONFLICT: 冻结版本已存在，修改需提升 version')
    }
    return prior
  }
  try { writeFileSync(fd, JSON.stringify(record, null, 2) + '\n', 'utf8') }
  finally { closeSync(fd) }
  return structuredClone(record)
}

/** 发现基于模块局部目的，而非工作树目录或政策来源权威。 */
export function discoverFrozenD3Modules(query = ''): Array<{
  moduleId: string; version: number; digest: string; name: string; purpose: string; scope: string; limits: string
}> {
  const base = join(getConfigDir(), 'review-d3-frozen-modules')
  if (!existsSync(base)) return []
  const result: ReturnType<typeof discoverFrozenD3Modules> = []
  for (const id of readdirSync(base)) {
    if (!SAFE_ID.test(id)) continue
    for (const file of readdirSync(join(base, id))) {
      if (!/^[1-9]\d*\.json$/.test(file)) continue
      const module = inspectFrozenD3Module(id, Number(file.slice(0, -5)))
      if (!module) continue
      const { name, purpose, scope, limits } = module.module
      if (query && ![id, name, purpose, scope, limits].some((value) => value.toLowerCase().includes(query.toLowerCase()))) continue
      result.push({ moduleId: id, version: module.module.version, digest: module.digest, name, purpose, scope, limits })
    }
  }
  return result.sort((a, b) => key(a.moduleId, a.version).localeCompare(key(b.moduleId, b.version)))
}

/**
 * 为工作区补入被固定引用的定义（含传递依赖），并仅改一份草稿模板。
 * 来源绑定必须由具体模板提供；不能从模块资产私下继承别的学校的权威。
 */
export function reuseFrozenD3Module(input: {
  workspace: ReviewAuthoringWorkspaceV1
  expectedRevision: number
  templateId: string
  templateVersion: number
  use: ReviewAuthoringUseV1
  expectedDigest: string
  sourceBindings: Array<{ checkId: string; sourceIds: string[]; applicabilityNote?: string }>
}): ReviewAuthoringWorkspaceV1 {
  if (input.workspace.revision !== input.expectedRevision) throw new Error('D3_REVISION_CONFLICT')
  const template = input.workspace.definitions.templates.find((t) => t.templateId === input.templateId && t.version === input.templateVersion)
  if (!template) throw new Error('D3_TEMPLATE_MISSING')
  if (template.modules.some((u) => u.id === input.use.id)) throw new Error('D3_INSTANCE_CONFLICT')
  const root = inspectFrozenD3Module(input.use.moduleId, input.use.version)
  if (!root || root.digest !== input.expectedDigest) throw new Error('D3_LOCK_MISMATCH: 引用版本或摘要错误')
  const next = structuredClone(input.workspace)
  const registered = new Set<string>()
  const hydrate = (record: ReviewD3FrozenModule): void => {
    const locked = key(record.module.moduleId, record.module.version)
    if (registered.has(locked)) return
    registered.add(locked)
    const existing = next.definitions.modules.find((m) => key(m.moduleId, m.version) === locked)
    if (existing && digest(existing) !== record.digest) throw new Error('D3_WORKSPACE_COLLISION: 本地同名模块不能遮盖冻结语义 ' + locked)
    if (!existing) next.definitions.modules.push(structuredClone(record.module))
    next.sharedModuleLocks ??= []
    const oldLock = next.sharedModuleLocks.find((lock) => key(lock.moduleId,lock.version) === locked)
    if (oldLock && oldLock.digest !== record.digest) throw new Error('D3_LOCK_MISMATCH: 工作区锁与注册资产不一致 ' + locked)
    if (!oldLock) next.sharedModuleLocks.push({
      moduleId: record.module.moduleId, version: record.module.version, digest: record.digest,
    })
    for (const dep of record.dependencies) {
      const child = inspectFrozenD3Module(dep.moduleId, dep.version)
      if (!child || child.digest !== dep.digest) throw new Error('D3_DEPENDENCY_DIGEST: ' + locked)
      hydrate(child)
    }
  }
  hydrate(root)
  next.definitions.templates.find((t) => t.templateId === input.templateId && t.version === input.templateVersion)!.modules.push(structuredClone(input.use))
  next.sourceBindings.push(...structuredClone(input.sourceBindings))
  next.revision++
  const problems = validateReviewAuthoringV1(next)
  if (problems.length) throw new Error('D3_REUSE_INVALID: ' + problems.join('；'))
  return next
}

/** 仅导出已通过 D1 来源绑定及固定依赖链验证的、可离线复制的制作数据。 */
export function exportD3Bundle(workspace: ReviewAuthoringWorkspaceV1): ReviewD3TransferBundle {
  const issues = validateReviewAuthoringV1(workspace)
  if (issues.length) throw new Error('D3_WORKSPACE_INVALID: ' + issues.join('；'))
  const lockProblems = validateD3WorkspaceLocks(workspace,true)
  if (lockProblems.length) throw new Error('D3_LOCK_INVALID: ' + lockProblems.join('；'))
  const seen = new Map<string, ReviewD3FrozenModule>()
  for (const lock of workspace.sharedModuleLocks ?? []) {
    const record = inspectFrozenD3Module(lock.moduleId,lock.version)
    if (!record || record.digest !== lock.digest) throw new Error('D3_LOCK_MISMATCH: ' + key(lock.moduleId,lock.version))
    seen.set(key(lock.moduleId,lock.version),record)
  }
  // 明确区分本地草稿和冻结资产；导出不得从当前机器的目录猜测锁，更不能省略已有锁。
  for (const mod of workspace.definitions.modules) {
    const existing = readOne(mod.moduleId,mod.version)
    if (existing && !(workspace.sharedModuleLocks ?? []).some((lock) =>
      lock.moduleId === mod.moduleId && lock.version === mod.version)) {
      throw new Error('D3_AMBIGUOUS_MODULE: 本地草稿与冻结资产同名，需要显式选择来源 ' + key(mod.moduleId,mod.version))
    }
  }
  const frozen = [...seen.values()].sort((a,b) => key(a.module.moduleId,a.module.version).localeCompare(key(b.module.moduleId,b.module.version)))
  const bare: Omit<ReviewD3TransferBundle, 'fingerprint'> = {
    schemaVersion: 1, status: 'technical-authoring-only', publicationAllowed: false, workspace: structuredClone(workspace), frozen,
  }
  return { ...bare, fingerprint: digest(bare) }
}

/** 校验整个随身包，再一次性检查与本地冻结库的冲突；成功后按依赖顺序安装。 */
export function importD3Bundle(bundle: ReviewD3TransferBundle): ReviewAuthoringWorkspaceV1 {
  if (!bundle || bundle.schemaVersion !== 1 || bundle.status !== 'technical-authoring-only' ||
      bundle.publicationAllowed !== false || !Array.isArray(bundle.frozen) || !bundle.workspace) {
    throw new Error('D3_BUNDLE_INVALID: 导入包结构/权限不正确')
  }
  const { fingerprint, ...bare } = bundle
  if (fingerprint !== digest(bare)) throw new Error('D3_BUNDLE_DIGEST: 包内容被修改')
  const errors = validateReviewAuthoringV1(bundle.workspace)
  if (errors.length) throw new Error('D3_BUNDLE_INVALID: ' + errors.join('；'))
  const records = new Map<string, ReviewD3FrozenModule>()
  for (const item of bundle.frozen) {
    const record = parseRecord(JSON.stringify(item), item.module?.moduleId ?? '<unknown>')
    const k = key(record.module.moduleId,record.module.version)
    if (records.has(k)) throw new Error('D3_DUPLICATE_FROZEN: ' + k)
    records.set(k,record)
    const local = bundle.workspace.definitions.modules.find((mod) => key(mod.moduleId,mod.version) === k)
    if (!local || digest(local) !== record.digest) throw new Error('D3_BUNDLE_LOCK_MISMATCH: ' + k)
    const existing = readOne(record.module.moduleId, record.module.version)
    if (existing && (existing.digest !== record.digest || digest(existing.dependencies) !== digest(record.dependencies))) {
      throw new Error('D3_FROZEN_CONFLICT: 导入不能覆盖本地冻结资产 ' + k)
    }
  }
  const expectedLocks = new Map((bundle.workspace.sharedModuleLocks ?? []).map((lock) => [key(lock.moduleId,lock.version),lock.digest]))
  if (expectedLocks.size !== (bundle.workspace.sharedModuleLocks ?? []).length ||
      records.size !== expectedLocks.size ||
      [...records.entries()].some(([id,record]) => expectedLocks.get(id) !== record.digest)) {
    throw new Error('D3_BUNDLE_LOCK_MISMATCH: 交付包冻结清单与工作区显式模块锁不一致')
  }
  for (const record of records.values()) checkChain(record, (id,v) => records.get(key(id,v)))
  // 导入库之前所有记录已经完整校验；崩溃可能留下合法前缀，但绝不覆盖既有资产。
  const visit = (record: ReviewD3FrozenModule, visited = new Set<string>()): void => {
    const k = key(record.module.moduleId,record.module.version)
    if (visited.has(k)) return
    visited.add(k)
    for (const dep of record.dependencies) visit(records.get(key(dep.moduleId,dep.version))!, visited)
    const path = pathFor(record.module.moduleId, record.module.version)
    if (existsSync(path)) return
    mkdirSync(join(getConfigDir(),'review-d3-frozen-modules', record.module.moduleId), { recursive:true })
    try { writeFileSync(path,JSON.stringify(record,null,2)+'\n',{encoding:'utf8',flag:'wx'}) }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
      const concurrent = readOne(record.module.moduleId,record.module.version)
      if (!concurrent || concurrent.digest !== record.digest) throw new Error('D3_FROZEN_CONFLICT: 导入期间版本发生竞态 ' + k)
    }
  }
  for (const record of records.values()) visit(record)
  return structuredClone(bundle.workspace)
}

export function diffD3Modules(oldModule: ReviewAuthoringModuleV1, newModule: ReviewAuthoringModuleV1) {
  const taskMap = (mod: ReviewAuthoringModuleV1) => new Map(mod.tasks.map((task) => [task.id,digest(task)]))
  const old = taskMap(oldModule), next = taskMap(newModule)
  const entries = [...new Set([...old.keys(),...next.keys()])].sort()
  return {
    from: { moduleId: oldModule.moduleId, version: oldModule.version, digest: digest(oldModule) },
    to: { moduleId: newModule.moduleId, version: newModule.version, digest: digest(newModule) },
    addedTasks: entries.filter(id=>!old.has(id)),
    removedTasks: entries.filter(id=>!next.has(id)),
    changedTasks: entries.filter(id=>old.has(id)&&next.has(id)&&old.get(id)!==next.get(id)),
    metadataChanged: digest({purpose:oldModule.purpose,scope:oldModule.scope,limits:oldModule.limits,parameters:oldModule.parameters,references:oldModule.references}) !==
      digest({purpose:newModule.purpose,scope:newModule.scope,limits:newModule.limits,parameters:newModule.parameters,references:newModule.references}),
    /** 修改某共享语义不能通过原地修改旧模板引用生效，须先显式提升版本并回归。 */
    explicitUpgradeRequired: true,
  }
}
