/**
 * D3 Agent-first 最小实际制作入口。必须使用显式隔离的 PROFER_CONFIG_DIR。
 * 命令返回 JSON；任何失败非零退出码，不生成假「已认证制度」。
 *
 * discover [query]                          查冻结库
 * inspect <moduleId> <version>              查内容/锁/边界
 * freeze <module.json> <examples.json>      冻结新版本（wx，不能覆盖）
 * reuse <workspace.json> <request.json>     预览原子修改后完整工作区 JSON（stdout），再走 D1 save
 * validate <workspace.json>                 D1 + D3 锁及来源校验
 * export <workspace.json> <output.json>     原子式新建可携包（不覆盖）
 * import <bundle.json> <output.json>        校验/安装锁并导出工作区（不覆盖）
 * diff <oldModule.json> <newModule.json>    比较任务及目的变动
 * impact <moduleId> <fromVersion> <toVersion> 列出已登记 D1 工作区的受影响消费者
 * upgrade <workspace.json> <upgrade.json>   显式迁移单实例，输出可登记的完整新工作区
 * report-gap <issue.json>                   缺口可机读校验，不吞失败
 *
 * 用完整 D1 workspace 负责来源绑定；没有真实 policy authority 的地方只输出技术预审。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ReviewAuthoringModuleV1, ReviewAuthoringWorkspaceV1, ReviewD3TransferBundle } from '@profer/shared'
import {
  discoverFrozenD3Modules, inspectFrozenD3Module, freezeD3Module, reuseFrozenD3Module,
  exportD3Bundle, importD3Bundle, diffD3Modules,
} from '../src/main/lib/review/review-d3-module-library'
import { validateReviewAuthoringV1 } from '../src/main/lib/review/review-authoring-v1'
import { inspectD3UpgradeImpact, upgradeD3ModuleUse } from '../src/main/lib/review/review-d3-upgrade'

const load = <T>(path: string): T => JSON.parse(readFileSync(resolve(path), 'utf8')) as T
const show = (value: unknown): void => process.stdout.write(JSON.stringify(value, null, 2) + '\n')
const newFile = (path: string, value: unknown): void => {
  writeFileSync(resolve(path), JSON.stringify(value, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' })
}

interface ReuseRequest {
  expectedRevision: number
  templateId: string
  templateVersion: number
  use: { id: string; moduleId: string; version: number; scenario?: string; objectKey?: string; bindings?: Record<string,string> }
  expectedDigest: string
  sourceBindings: Array<{ checkId: string; sourceIds: string[]; applicabilityNote?: string }>
}
interface D3Gap {
  sourceMd: string
  locator: string
  requirement: string
  blockedOperation: string
  owner: 'D3' | 'D4' | 'pi-runtime' | 'policy-source'
  reproduce: string
}
async function main(): Promise<void> {
  if (!process.env.PROFER_CONFIG_DIR?.trim()) throw new Error('D3_CONFIG_REQUIRED: 必须显式指定隔离 PROFER_CONFIG_DIR')
  const [operation, first, second, third] = process.argv.slice(2)
  switch (operation) {
    case 'discover':
      show(discoverFrozenD3Modules(first))
      return
    case 'inspect': {
      if (!first || !second || !/^\d+$/.test(second)) throw new Error('D3_USAGE: inspect <moduleId> <version>')
      const item = inspectFrozenD3Module(first, Number(second))
      if (!item) throw new Error('D3_MODULE_NOT_FOUND: ' + first + '@' + second)
      show(item)
      return
    }
    case 'freeze': {
      if (!first || !second) throw new Error('D3_USAGE: freeze <module.json> <examples.json>')
      const module = load<ReviewAuthoringModuleV1>(first)
      const examples = load<string[]>(second)
      show(freezeD3Module(module, examples))
      return
    }
    case 'reuse': {
      if (!first || !second) throw new Error('D3_USAGE: reuse <workspace.json> <request.json>')
      show(reuseFrozenD3Module({ workspace: load<ReviewAuthoringWorkspaceV1>(first), ...load<ReuseRequest>(second) }))
      return
    }
    case 'validate': {
      if (!first) throw new Error('D3_USAGE: validate <workspace.json>')
      const workspace = load<ReviewAuthoringWorkspaceV1>(first)
      const issues = validateReviewAuthoringV1(workspace)
      if (issues.length) { show({ ok: false, issues }); process.exitCode = 1; return }
      const bundle = exportD3Bundle(workspace)
      show({ ok: true, workspaceId: workspace.workspaceId, revision: workspace.revision,
        fingerprint: bundle.fingerprint,
        locks: bundle.frozen.map((entry) => ({ moduleId: entry.module.moduleId, version: entry.module.version, digest: entry.digest })),
        publicationAllowed: false })
      return
    }
    case 'export': {
      if (!first || !second) throw new Error('D3_USAGE: export <workspace.json> <bundle-output.json>')
      const data = exportD3Bundle(load<ReviewAuthoringWorkspaceV1>(first))
      newFile(second, data)
      show({ exported: true, fingerprint: data.fingerprint, frozenModules: data.frozen.length, publicationAllowed: false })
      return
    }
    case 'import': {
      if (!first || !second) throw new Error('D3_USAGE: import <bundle.json> <workspace-output.json>')
      const workspace = importD3Bundle(load<ReviewD3TransferBundle>(first))
      newFile(second, workspace)
      show({ imported: true, workspaceId: workspace.workspaceId, revision: workspace.revision })
      return
    }
    case 'diff': {
      if (!first || !second) throw new Error('D3_USAGE: diff <oldModule.json> <newModule.json>')
      show(diffD3Modules(load<ReviewAuthoringModuleV1>(first), load<ReviewAuthoringModuleV1>(second)))
      return
    }
    case 'impact': {
      if (!first || !second || !third || !/^\\d+$/.test(second) || !/^\\d+$/.test(third)) {
        throw new Error('D3_USAGE: impact <moduleId> <fromVersion> <toVersion>')
      }
      show(inspectD3UpgradeImpact(first,Number(second),Number(third)))
      return
    }
    case 'upgrade': {
      if (!first || !second) throw new Error('D3_USAGE: upgrade <workspace.json> <upgrade-request.json>')
      const request=load<Parameters<typeof upgradeD3ModuleUse>[0]>(second)
      show(upgradeD3ModuleUse({ ...request, workspace:load<ReviewAuthoringWorkspaceV1>(first) }))
      return
    }
    case 'report-gap': {
      if (!first) throw new Error('D3_USAGE: report-gap <issue.json>')
      const issue = load<D3Gap>(first)
      if (!issue.sourceMd?.trim() || !issue.locator?.trim() || !issue.requirement?.trim() ||
          !issue.blockedOperation?.trim() || !issue.reproduce?.trim() ||
          !['D3', 'D4', 'pi-runtime', 'policy-source'].includes(issue.owner)) {
        throw new Error('D3_GAP_INVALID: 必须提供原文定位、责任、受阻操作、归因及可复现步骤')
      }
      show({ schemaVersion: 1, status: 'tooling-blocked', ...issue })
      return
    }
    default:
      throw new Error('D3_USAGE: discover|inspect|freeze|reuse|validate|export|import|diff|impact|upgrade|report-gap')
  }
}
main().catch((error) => {
  process.stderr.write('[D3 作者工具] ' + (error instanceof Error ? error.message : String(error)) + '\n')
  process.exitCode = 1
})
