---
path: apps/electron/src/main/lib/agent-permission-service.powershell.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 85fecde541dcc90f526cc32ce75697aeb6b09ceb
sha256: 106be1e4563cb89d8acd6d1ea380b368e0bbc823af004b227e15d79728f3596d
lines: 54
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-permission-service.powershell.test.ts

## 1. 测试目标

`AgentPermissionService` PowerShell 处理（`:13`）：主 agent 只读直放/敏感读取走审批、worker 变更拒/只读放。bun:test；真服务直测，无 mock（`OPTIONS`/`createWorkerOptions` 夹具 `:4-11`）。

## 2. 用例清单

共 **4 个 `test(`**：主 agent 只读 PS（Get-Location）直放且不请求审批（`:14`，sendToRenderer 抛错替身=不触发即失败）；主 agent PS 读敏感文件请求审批、deny 生效（`:23`）；worker PS 变更（Remove-Item）拒且 interrupt（`:37`）；worker 只读 PS（Get-Process）放（`:46`）。

## 3. 真实断言

`:20` `result.behavior` `toBe('allow')`；`:29-34` pending 长度 1、`command` `toBe('Get-Content $HOME\\.ssh\\id_rsa')`、description `toContain('执行 PowerShell')`、deny 后 `behavior` `toBe('deny')`；`:43` `toMatchObject({behavior:'deny', interrupt:true})`；`:52` `toBe('allow')`。

## 4. 未覆盖与脆弱点

未覆盖：PowerShell 白名单路径（`PowerShell:base` 键）、`isSafePowerShellCommand` 规则边界（shared 域外）。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/断言 | 已证实 | 全 54 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 用例 | §2/§3 | 14-53 | covered |
