---
path: apps/electron/src/main/lib/feishu/prompt-builder.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 79b6de5f741dd071d7a7a3571344090a0f550d43
sha256: 1621df20e9d862000404b0dcf96aa1e7af1b3a7f8da0b91b94d623647b3608a1
lines: 245
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/prompt-builder.ts

## 1. 结论与边界

飞书消息上下文→**Agent user message 构造器**（`apps/electron/src/main/lib/feishu/prompt-builder.ts:1-25`）：解决三真实问题——① Agent 看不到引用回复（parent_id 上下文丢失）；② 不知 chat 类型/发送者；③ 看不到被引卡片（"[card]" 占位）。借鉴 zara/feishu-claude-code-bridge 约定，但 **BRIDGE_USER_MESSAGE_PRELUDE 作为 userMessage 前置 XML 块而非 system prompt**（`:12-14`）。约定 XML 块（`:16-22`）：`<bridge_context>/<quoted_message>/<interactive_card>/<attached_files>/<group_extra>/<user_message>`。

边界：PRELUDE 含四条硬约束（`:79-94`）：**绝不调 AskUserQuestion**（无交互 UI 会挂会话）/附件优先 Read/Markdown 安全/长内容优先飞书文档交付。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `QuotedMessage` | interface | 26-37 | 被引消息（含 cardJson） |
| `BridgeContext` | interface | 39-47 | `{chatId; chatType:'p2p'\|'group'\|'topic'; sender…; threadId?}` |
| `BuildOptions` | interface | 49-61 | `{userText; context; quoted?; attachedFilesBlock?; groupExtraBlock?}` |
| `BRIDGE_USER_MESSAGE_PRELUDE` | const | 64-94 | XML 块教学+四硬约束 |
| `buildAgentUserMessage` | function | 106-132 | 组装（`:108-105` 注释为输出结构契约） |
| `fetchQuotedMessage` | function | 148-205 | im.message.get→QuotedMessage（网络失败返回 undefined） |

内部：`buildBridgeContextBlock`（`:134-144`）、`buildQuotedMessageBlock`（`:146-156`，属性 escapeAttr）、`buildInteractiveCardBlock`（`:158-160`）、`escapeAttr`（`:162-164`）、`safeJsonField`（`:207-215`）、`extractPostText`（`:219-245`，post 富文本拼接）。

## 3. 内部逻辑与关键流程

- `buildAgentUserMessage`（`:106-132`）：PRELUDE→context→quoted（card 时加 interactive_card）→附件→group_extra→user_message；空块跳过。
- `fetchQuotedMessage`（`:148-205`）：五 contentType 分支（text/post/interactive/image/file）+兜底截断 500；失败 warn+undefined（prompt 降级无 quoted 块，`:144-146` 注释）。

## 4. 调用者与调用链

出向：`@larksuiteoapi/node-sdk`（Client，`:25`）。入向（检索=符号名+模块名，全冻结树）：`feishu-bridge.ts:86-89,1665-1704`（buildAgentUserMessage/fetchQuotedMessage/BridgeContext/QuotedMessage，**唯一模块引用**）。`BuildOptions`/`BRIDGE_USER_MESSAGE_PRELUDE` 零外部引用（仅本文件）。⚠ 子串碰撞：'prompt-builder' 大量命中 `agent-prompt-builder.ts`（不同模块）。产品链：feishu-bridge ← feishu-bridge-manager ← main/index.ts:235、main/ipc.ts:448。

## 5. 数据 I/O、读写与副作用

飞书 API im.message.get（仅 fetchQuotedMessage）；console.warn。

## 6. 分支、失败、取消与恢复

拉取失败→undefined（降级无 quoted 块）；JSON 解析失败→原文回退；无 AbortSignal。

## 7. 权限与权威状态

本文件不适用（无权限代码）；PRELUDE 四硬约束（`:79-94`）是 Agent 行为权威口径（XML 对用户不可见 `:77`）。

## 8. 修改影响面

- PRELUDE 约束改动影响 Agent 飞书交互行为（AskUserQuestion 禁令等）。
- 输出结构契约（`:108-105`）是 bridge 解析口径。

## 9. 测试证据

**无任何测试**（0 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| PRELUDE 四硬约束+XML 教学 | 已证实 | `:64-94` |
| 五 contentType 分支+兜底截断 | 已证实 | `:165-193` |
| 失败降级 undefined | 已证实 | `:199-204` |
| `BuildOptions`/PRELUDE 零外部引用 | 已证实（检索式见 §4，全冻结树） | caller 图 |
| **零测试** | 已证实 | caller 图 |
| 真实飞书消息形态 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | 26-205 | covered |
| 组装/抓取 | §3 | 106-245 | covered |
| 测试锚 | §9 | — | unknown（零测试） |
