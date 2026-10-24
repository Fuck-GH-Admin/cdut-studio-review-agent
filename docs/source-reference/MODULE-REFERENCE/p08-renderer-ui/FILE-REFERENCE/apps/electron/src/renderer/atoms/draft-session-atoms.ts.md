---
path: apps/electron/src/renderer/atoms/draft-session-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 137356aa5f9b7c32632d68802c9df0cc407f8529
sha256: b15d3e7792c971ca40e20331978d06bccd29e72f572ef734810f4f82496dbf7f
lines: 12
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/draft-session-atoms.ts

## 1. 结论与边界

"草稿"会话 ID 集合的 Jotai 状态（12 行，头注释 `:1-7`）：草稿会话是真实会话（有有效 ID）但未发首条消息、不在侧边栏显示；发消息后移出集合。Chat+Agent 共用。

**边界**：不管理会话生命周期（创建/发消息在 hooks/视图层）；不持久化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `draftSessionIdsAtom` | atom（导出） | 12 | `Set<string>` 初值 `new Set()` | 草稿会话 ID 集合 |

导出合计 1。

## 3. 内部逻辑与关键流程

无（不适用，依据：单行 atom 声明）。

## 4. 调用者与调用链

入向（全冻结树检索 `draft-session-atoms`，7 文件）：`hooks/useCreateSession.ts:19`、`hooks/useGlobalAgentListeners.ts:14`、`components/welcome/WelcomeView.tsx:18`、`components/app-shell/SearchDialog.tsx:33`、`components/app-shell/left-sidebar/use-left-sidebar.ts:92`、`components/agent/AgentView.tsx:134`、`components/tabs/TabSwitcher.tsx:28`。语义均为草稿集合读写（侧边栏过滤/首条消息移除）。
出向：`jotai`。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯内存 atom）。

## 6. 分支、失败、取消与恢复

无（不适用，依据：无逻辑代码）。

## 7. 权限与权威状态

无（不适用，依据：纯状态）。

## 8. 修改影响面

7 个消费方的会话列表可见性（侧边栏/搜索/标签）；Set 语义要求写入方保持不可变更新。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `draft-session-atoms` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出/集合语义 | 已证实 | `:1-12` 全文逐行 |
| 7 个调用方 | 已证实 | 全树检索（§4） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `draftSessionIdsAtom` | §2/§4 | 12 | covered |
