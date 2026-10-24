---
path: apps/electron/src/renderer/atoms/conversation-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e077000bc2567a0e8ced1642cad1369b6038fd06
sha256: 9f24a6c8bd35af2c6ccbab64567833892db22789f6c74fdb22c57dc82a2d7b93
lines: 121
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/conversation-atoms.ts

## 1. 结论与边界

渠道/模型/对话元数据与流式指示状态（头注释 :2-8）：Chat 移除后保留 Agent 链路与全局 UI 所用状态。

## 2. 导出与关键符号

导出 21 条（`export`）：

- **渠道**：`channelsAtom`（:16）/`channelsLoadedAtom`（:19）/**`modelSelectorRequestAtom`**（:24，seq 自增防未挂载吞请求 :21-23）/`requestModelSelectorOpen()`（:27-30）/`SelectedModel`（:33-36）/`CONTEXT_LENGTH_OPTIONS`（:39，0-20+'infinite' 单一数据源）/`ContextLengthValue`（:42，派生类型防不同步）。
- **对话元数据**：`conversationsAtom`（:47）/`currentConversationIdAtom`（:50）/`selectedModelAtom`（:53，持久化）/`contextLengthAtom`（:59，默认 'infinite'）/`thinkingEnabledAtom`（:65）/`thinkingExpandedAtom`（:71）。
- **流式**：`ConversationStreamState`（:79-88，runId/streaming/content/reasoning/toolActivities）/`streamingStatesAtom`（:91）/**`streamingConversationIdsAtom`**（:97-104，派生只读，侧栏呼吸点）。
- **Per-conversation**：`conversationModelsAtom`/`conversationContextLengthAtom`/`conversationThinkingEnabledAtom`/`conversationParallelModeAtom`/`conversationDraftsAtom`（:109-121，Map 缺省回落全局）。

## 3. 内部逻辑与关键流程

seq 请求语义（:27-30）；派生只读过滤（:97-104）。其余纯声明。

## 4. 调用者与调用链

入向：Agent 链路/全局 UI/侧栏指示器。出向：jotai（getDefaultStore）、`@profer/shared` 类型。

## 5-7. 数据/分支/权限

纯状态；派生分支；不适用。

## 8. 修改影响面

- 消费面：tab/侧栏指示器、模型/上下文/思考设置全链。
- 依赖面：localStorage 4 键（profer-selected-model 等）。
- 需同步测试：无专属（agent-atoms.test 系测的是另一模块）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 21 条；seq 防吞契约 | 已证实 | :21-30 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 21 导出 | §2 | :16-121 | covered |
