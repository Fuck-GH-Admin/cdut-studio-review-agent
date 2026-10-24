---
path: apps/electron/src/renderer/lib/agent-message-queue.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ba3f498a4fb7122ab637103d5429b8a5d093a80b
sha256: 1f9e2f061777132990341aca6f27c8239cec4fe988bd11d0f44227dfdb63a6f9
lines: 172
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-message-queue.ts

## 1. 结论与边界

队列消息模型与操作纯函数集（172 行）：构造/删除/回队/拖拽排序/错误识别/HTML 段落化/引用解析/发送载荷。

## 2. 导出与关键符号

导出 14 条（`export`）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `QueueDropPlacement` | `:3` | 'before'\|'after' |
| `AgentQueuedMessage` | `:5-10` | id/text/createdAt/quotedSelection? |
| `createAgentQueuedMessage` | `:12-25` | trim+可选引用 |
| `removeQueuedMessage` | `:27-32` | |
| `shouldRestoreQueuedMessageAfterFailure` | `:35-41` | **epoch 契约**：同未停止 epoch 才回队（:34） |
| `restoreQueuedMessageToFront` | `:43-49` | 已存在不重复 |
| `moveQueuedMessage` | `:51-72` | 拖拽排序（同/缺源/缺标返原） |
| `ParsedQueuedMessageMentions` | `:74-79` | |
| `QueuedMessageSendPayload` | `:81-85` | |
| `isQueueTargetNoLongerActiveError` | `:102-105` | 主进程已结束旧 run 文案判定 |
| `isAgentRunAlreadyActiveError` | `:108-111` | `AGENT_RUN_ALREADY_ACTIVE:` 前缀 |
| `queuedTextToParagraphHtml` | `:125-132` | 双换行分段/单换行 br/转义（撤回保富文本 :120-124） |
| `parseQueuedMessageMentions` | `:137-155` | `/skill:`、`#mcp:`、`&session:` 三引用（:135 REF_PATTERN） |
| `buildQueuedMessageSendPayload` | `:157-172` | rawText/sdkText+mentions |

内部：`stripIpcErrorPrefix`（:94-99，剥离 Electron invoke 前缀；:87-93 注释：锚定匹配前缀会永远失配）、`escapeHtml`（:113-118）。

## 3. 内部逻辑与关键流程

错误识别双判定基于 stripIpcErrorPrefix 后匹配（:104/:110）；mention 解析剥离引用留 cleanedText（:150）。

## 4. 调用者与调用链

入向：队列 UI/发送链。出向：`@/atoms/preview-atoms`（QuotedSelection 类型）。

## 5-7. 数据/分支/权限

纯函数；epoch 防陈旧回队（:34-41）。

## 8. 修改影响面

- 消费面：消息队列全链。
- 依赖面：IPC 错误文案契约。
- 需同步测试：`agent-message-queue.test.ts`（52 行）。

## 9. 测试证据

`agent-message-queue.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 14 条；epoch/错误识别契约 | 已证实 | :34-41/:87-111 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 14 导出+操作链 | §2/§3 | :3-172 | covered |
