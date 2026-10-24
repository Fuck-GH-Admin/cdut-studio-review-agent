---
path: apps/electron/src/main/lib/agent-permission-service.cslab.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 32e9e9466363f34ce6d1df744a9fce0086579a6d
sha256: 4cc3c70fc23b89b7b165d319ae47cb960b5375ddcbc95dd21aa61e228e453b1a
lines: 71
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-permission-service.cslab.test.ts

## 1. 测试目标

`AgentPermissionService` × CSLab Python 工具审批加固：禁用“总是允许”、无交互通道硬阻断、只读列表工具不受影响（`:2-4`）。bun:test；真服务直测（每用例 `new AgentPermissionService()`），无 mock。

## 2. 用例清单

共 **3 个 `test(`**：“总是允许”后同工具再调用仍重新审批（`:20`）；子代理调用 CSLab 无交互通道→硬阻断（`:46`）；只读 `cslab_list_lab_tools` 子代理调用不走硬阻断（`:61`）。

## 3. 真实断言

- `:29-31` 首次 pending 定义+`respondToPermission(...,'allow',true)`→allow；`:39-43` 二次 `requestId` `not.toBe` 首次+"总是允许"不写白名单（注释 `:33`）→deny。
- `:54-58` `toMatchObject({behavior:'deny', interrupt:true, message:'Custom Python tool execution is disabled in non-interactive subagent channels.'})`。
- `:69` 只读工具 `toBe('allow')`。

## 4. 未覆盖与脆弱点

未覆盖：`isCsLabExecutionTool` 工具名集合边界（shared 域外）；CSLab+白名单历史脏数据路径。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/断言（含固定文案） | 已证实 | 全 71 行 |
| 与 permission-service.ts 三重加固一致 | 已证实 | 对照 `:250,267,292`+`:142-147` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 用例 | §2/§3 | 20-70 | covered |
