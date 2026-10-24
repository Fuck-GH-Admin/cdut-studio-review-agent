---
path: apps/electron/src/main/lib/agent-orchestrator-permission-wiring.p06.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b56edf6cd754468dfe22d4c799aefe79b47b8298
sha256: 8bc94e0542c388a803f21b8d258b77204c9656ba9b95d8c607ef951a42023756
lines: 76
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-orchestrator-permission-wiring.p06.test.ts

## 1. 测试目标

P06-E06 实机反例：**真实 Orchestrator 必须把权限回调送入 Pi Adapter**（`:1`）。bun:test；集成级——真实 `AgentOrchestrator`+`AgentEventBus`+`permissionService`+会话/渠道，仅 `PiAgentAdapter` 用 WitnessAdapter 子类替换 query（`:23-32`）。临时 `PROFER_CONFIG_DIR`（`:10-12`）；模块按 Main 初始化顺序动态 import 防循环（`:13-19`）。

## 2. 用例清单

共 **2  个 `test(`**：auto Write 真实进入 pending、人工拒绝传回 Adapter（`:37`）；同一真实查询内 Read allow→plan 热切换 deny→bypassPermissions 恢复 allow（`:57`）。

## 3. 真实断言

- `:51-54` `adapter.calls` `>0`、`captured?.canUseTool` 是 function、`denied` `toBeTrue()`、pending 清空 `toBeFalse()`。
- `:71-74` `readAllowed/planDenied/recovered` 全 `toBeTrue()`。
- 中间断言：`request?.toolName` `toBe('Write')`（`:45`）；`respondToPermission(...,'deny',false)`（`:46`）。

## 4. 未覆盖与脆弱点

未覆盖：Claude runtime 接线、askUserHandler 链路、escalation 路径。mock 边界：WitnessAdapter 仅替换 `query()` 迭代器（权限/会话/事件链路全真实）；`action` 回调内直接调 `canUseTool` 模拟 SDK 行为。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言/替身边界 | 已证实 | 全 76 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 用例 | §2/§3 | 37-75 | covered |
| 替身边界 | §4 | — | covered（如实） |
