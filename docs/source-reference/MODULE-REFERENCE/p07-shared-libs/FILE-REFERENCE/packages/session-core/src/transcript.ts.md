---
path: packages/session-core/src/transcript.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fbe15e3d3a0d35fb70278344e64626b1d5b7d444
sha256: 90b2b2e7be625a4a597e02e80eff5c2b3f5b963ba32b216d0a974473600b58cd
lines: 152
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/session-core/src/transcript.ts

## 1. 结论与边界

**转录层**（`packages/session-core/src/transcript.ts:1-8` 注释）：把 `MessageGroup[]` 规整为带稳定下标的扁平 `TranscriptTurn[]`，供 CLI 的 outline/search/select/export 复用。核心是**快照去重**：同一回合多行流式快照共享 `message.id`，按 id 取最后一条（最完整）快照消除"拼接单字/重复段落"（`:5-7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TurnRole` | type（export） | `:14` | `'user'\|'assistant'\|'system'` | — |
| `TranscriptTurn` | interface（export） | `:16-30` | `{ index; role; model?; createdAt?; text; toolSummaries; preview; tokens }` | index=0 基稳定下标（`:17`） |
| `summarizeToolInput` | function（export） | `:33-46` | `(name, input) => string` | `name key=value …` 单行摘要 |
| `collapseToolSummaries` | function（export） | `:49-60` | `(summaries) => string[]` | 连续重复折叠 `×N` |
| `toTranscript` | function（export） | `:100-152` | `(groups: MessageGroup[]) => TranscriptTurn[]` | 主入口 |
| `dedupSnapshotsByMessageId` | function（内部） | `:63-74` | `(messages) => SDKAssistantMessage[]` | 按 message.id 取末快照 |
| `buildAssistantContent` | function（内部） | `:77-95` | 抽正文+工具摘要 | thinking/tool_result 丢弃 |

## 3. 内部逻辑与关键流程

1. `summarizeToolInput`（`:33-46`）：非对象 input → 返回 name（`:34`）；跳过 null/undefined/''/空数组/空对象（`:37-39`）；值 `JSON.stringify` + 空白折叠（`:40-41`），超 80 字符截 77+'...'（`:42`）；拼 `name k=v …`（`:45`）。
2. `collapseToolSummaries`（`:49-60`）：双指针统计连续相同段（`:52-57`），`count>1` 追加 ` ×N`（`:56`）。
3. `dedupSnapshotsByMessageId`（`:63-74`）：`message.id` 安全读取（SDK 类型未建模，`:68-69` 注释）；无 id 者合成 `__anon_<n>`；Map 保末条 + order 保首现序（`:70-73`）。
4. `buildAssistantContent`（`:77-95`）：去重后逐块——text 块 trim 非空收集（`:84-86`）；`tool_use` → `summarizeToolInput`（`:87-89`）；thinking/其他丢弃（`:91`）；正文 `'\n\n'` 连接、工具摘要折叠（`:94`）。
5. `toTranscript`（`:100-152`）按 group 类型三分支：
   - user + **Goal 迭代消息**（`isGoalIterationMessage`）→ text=preview（`:103-114`）；
   - user 普通 → `stripScheduledRunMarker(extractUserText ?? '')` 再剥 `<attached_files>`/`<quoted_file>` 标签（正则 `:115-118`）；
   - system → text=preview（`:129-139`）；
   - assistant → `buildAssistantContent`（`:140`），带 `model/createdAt`，tokens 计正文+工具摘要（`:149`）。

## 4. 调用者与调用链

- 入向（包外 4 文件）：`apps/cli/src/commands/export.ts`、`info.ts`、`outline.ts`、`search.ts`（均 `toTranscript`）；`summarizeToolInput` 另有 `apps/electron/src/main/lib/retrospective-service.ts`；`index.ts` 再导出。
- 测试入向：`session-core.test.ts`（12 用例经 `toTranscript/summarizeToolInput/collapseToolSummaries`，§9）。
- 出向：`@profer/shared`（`SDKAssistantMessage/SDKContentBlock/SDKToolUseBlock/isGoalIterationMessage`，`:9-10`）、`./group`（`MessageGroup/extractUserText/getGroupPreview/stripScheduledRunMarker`，`:11`）、`./tokens`（`estimateTokens`，`:12`）。

## 5. 数据 I/O、读写与副作用

纯函数集：无 I/O/状态/副作用；`toTranscript` 输出确定性。

## 6. 分支、失败、取消与恢复

分支：`toTranscript` 三分支（§3-5）、`summarizeToolInput` 五跳过规则、快照匿名兜底（`:69`）。不抛错（安全取值 `??`）；`dedupSnapshotsByMessageId` 的 `order.map(id => lastById.get(id)!)` 非空断言成立（id 源自同一集合）。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支（纯工具）；`index` 稳定性是下游（search/select/export）共享契约（`:17` 注释）。

## 8. 修改影响面

改去重/摘要/正文剥除 → CLI 4 命令输出、retrospective-service 的工具摘要、`session-core.test.ts` 多条断言（`'Hello world'`/`Read file_path=/a` 等精确匹配）；改 `TranscriptTurn` 形状 → search/select 全链。

## 9. 测试证据

**直接测试 `session-core.test.ts`（12 用例，bun:test，NOT_RUN）**，与本文件相关的断言：

- 快照去重 5 用例（`:31-53`）：角色/下标 `toEqual(['user','assistant'])/[0,1]`（`:32-33`）；正文 `toBe('Hello world')` 且 `not.toContain('Hel\n')`（`:38-39`）；thinking 丢弃（`:43`）；tool_use 摘要 `toEqual(['Read file_path=/a'])` 且 tool_result 不进正文（`:47-48`）；纯 tool_result user 行不产 turn（`:52`）。
- 工具折叠 2 用例（`:57-65`）：`collapseToolSummaries([...])` `toEqual(['OCR p=1 ×3','Read f=a'])`（`:58`）；`summarizeToolInput` 跳空值（`toBe('Read file_path=/a limit=0')`，limit:0 保留）与长值截断（`<100`，`:62-64`）。
- 格式 A 归一 1 用例（`:76-79`）：`toMatchObject({role,text})`。

未覆盖：`<attached_files>/<quoted_file>` 剥除、Goal 迭代分支、`__anon_` 兜底、estimateTokens 数值。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出 + 2 内部；去重/摘要/三分支 | 已证实 | 逐行读 `:1-152` |
| 测试 8 用例直指本文件断言 | 已证实 | 测试 `:31-79` |
| `message.id` 在真实 JSONL 的存在性 | 推断 | `:68` 注释自述 |
| Goal/附件剥除分支运行时行为 | 未知 | 测试未覆盖 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `toTranscript` 三分支 | §3 | `:100-152` | covered |
| 快照去重/内容抽取 | §3 | `:63-95` | covered |
| `summarizeToolInput`/`collapseToolSummaries` | §3 | `:33-60` | covered |
| 测试断言 | §9 | 测试行号 | covered（NOT_RUN） |
| Goal/附件剥除 | §9/§10 | `:103-118` | partial（无测试） |
