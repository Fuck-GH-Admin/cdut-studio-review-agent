/**
 * D2 Agent JSON 合约 CLI：
 * preview <workspace.json> <selection.json> <case.json>：只编译预览，不写入；
 * attach <workspace.json> <selection.json> <caseId> <expectedRevision> <actorId>：需要隔离的配置目录，实际事务写案卷。
 */
import { readFileSync } from 'node:fs'
import type { D2ScenarioSelection, ReviewAuthoringWorkspaceV1, ReviewCaseV2 } from '@profer/shared'
import { compileD2RuntimePlan, attachD2RuntimePlan } from '../src/main/lib/review/review-d2-runtime'
import { readAggregate } from '../src/main/lib/review/case-store-v2'

const [command, workspacePath, selectionPath, target, revisionArg, actorId] = process.argv.slice(2)
const json = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

async function main(): Promise<void> {
  if (!workspacePath || !selectionPath) throw new Error('用法：preview|attach <workspace.json> <selection.json> <case.json|caseId> [expectedRevision] [actorId]')
  const workspace = json<ReviewAuthoringWorkspaceV1>(workspacePath)
  const selection = json<D2ScenarioSelection>(selectionPath)
  if (command === 'preview') {
    if (!target) throw new Error('preview 缺少合成案卷 JSON 路径')
    const plan = compileD2RuntimePlan(workspace, selection, json<ReviewCaseV2>(target))
    process.stdout.write(JSON.stringify(plan, null, 2) + '\n')
    return
  }
  if (command === 'attach') {
    if (!process.env.PROFER_CONFIG_DIR) throw new Error('attach 必须明确指定 PROFER_CONFIG_DIR 以隔离受控案卷')
    if (!target || !revisionArg || !actorId?.trim()) throw new Error('attach 缺少案卷 ID、预期修订号或操作者')
    const version = Number(revisionArg)
    if (!Number.isSafeInteger(version) || version < 0) throw new Error('expectedRevision 非法')
    const aggregate = readAggregate(target)
    if (!aggregate) throw new Error('案卷不存在，不会自动创建或取得审批资格')
    const result = await attachD2RuntimePlan({
      caseId: target, requestId: 'd2-attach-' + target + '-rev-' + version,
      actor: { actorId, actorSource: 'local', role: 'reviewer' },
      expectedRevision: version, workspace, selection,
    })
    if (!result.ok) throw new Error(result.code + ': ' + result.message)
    process.stdout.write(JSON.stringify({ attached: true, caseId: target, revision: result.aggregate.caseV2.revision, fingerprint: result.entity?.fingerprint, publicationAllowed: false }, null, 2) + '\n')
    return
  }
  throw new Error('未知命令：' + String(command))
}
await main().catch((err) => {
  process.stderr.write(String(err instanceof Error ? err.message : err) + '\n')
  process.exitCode = 1
})
