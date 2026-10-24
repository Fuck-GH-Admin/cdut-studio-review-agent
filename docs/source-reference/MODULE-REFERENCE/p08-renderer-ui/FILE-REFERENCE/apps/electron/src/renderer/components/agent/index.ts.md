---
path: apps/electron/src/renderer/components/agent/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c3072552647f707f9f3ca044b23271c0d3306fe2
sha256: 32d86b971bdd53d7b38e01cbb338f4d10068f2e56dbe8fc19afce3c5d1ca87c9
lines: 9
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/index.ts

## 1. 结论与边界

Agent 模块导出索引（`:1-3`）：barrel 文件，re-export 五个模块。

## 2. 导出与关键符号

`export` 逐条核对：**5 个 re-export**（`export * from`，`:5-9`）——`AgentView`/`AgentHeader`/`AgentMessages`/`WorkspaceSelector`/`ContextUsageBadge`。无自有符号。

## 3. 内部逻辑与关键流程

无逻辑；仅聚合导出。

## 4. 调用者与调用链

入向：renderer 对 `components/agent` 的统一 import 面。出向：`./AgentView`、`./AgentHeader`、`./AgentMessages`、`./WorkspaceSelector`（本批 437 行）、`./ContextUsageBadge`（前三者为批次外文件，仅索引关系）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

无分支。

## 7. 权限与权威状态

导出面权威=五个模块的公共导出。

## 8. 修改影响面

增删 re-export 影响上层 import 面。

## 9. 测试证据

本批无专属测试（纯 barrel）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五模块聚合 | 已证实 | `:5-9` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 re-export | §2 | 5-9 | covered |
