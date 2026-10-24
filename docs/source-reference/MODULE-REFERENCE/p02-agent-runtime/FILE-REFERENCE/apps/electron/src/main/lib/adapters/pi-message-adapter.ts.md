---
path: apps/electron/src/main/lib/adapters/pi-message-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c67c2007014c5880f5b8b36ee7e7e1df68e28c4
sha256: 8dc37a360faf593c00e5995cf602a6fdee9443536b4d422dfe19c3b8fb017da6
lines: 542
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-message-adapter.ts

## 1. 结论与边界

Pi Agent **消息兼容层**（运行时代码）：主/渲染进程仍用 Claude SDK 兼容的 SDKMessage 协议，本模块集中处理 Pi AgentMessage↔SDKMessage 形状转换（`apps/electron/src/main/lib/adapters/pi-message-adapter.ts:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `displayToolName` | 导出函数 | 25-44 | pi 工具名→UI 名（find→Glob、edit 多条→MultiEdit） |
| `normalizePermissionInput` | 导出函数 | 46-73 | 权限面板输入归一（path→file_path、edit 旧新字段合并） |
| `restorePiInput` | 导出函数 | 111-126 | 编辑后回写 Pi 输入（file_path→path） |
| `EMPTY_IMAGE_PLACEHOLDER_TEXT` | 导出常量 | 128 | 空图像占位文案 |
| `sanitizePiContextMessages` | 导出函数 | 213- | 请求前历史消毒与载荷遮罩 |
| `convertPiMessage` | 导出函数 | 340-436 | `AgentMessage→SDKMessage \| null` |
| `hasTerminalErrorWithContent` | 导出函数 | 445-462 | 终态错误+有效正文检测（#1268 断流保消息） |
| `stripErrorFromContentMessage` | 导出函数 | 470-486 | 剥离 error 出纯正文消息 |
| `isAssistantPiMessage` | 导出函数 | 299-301 | assistant 角色类型守卫（QA F-NB54-01 补） |
| `isAbortedAssistantMessage` | 导出函数 | 303-305 | stopReason==='aborted' 守卫 |
| `dropTrailingAbortedAssistant` | 导出函数 | 307-310 | 丢弃末尾 aborted assistant（供 prompt-chain 用） |
| `EMPTY_OUTPUT_ERROR_MESSAGE` | 导出常量 | 312 | `'模型未生成可见回复'`（test:3 导入——此前误列内部） |
| `hasToolResult` | 导出函数 | 488-492 | user 消息含 tool_result 判定 |
| `convertResultMessage` | 导出函数 | 494-542 | 聚合 result 消息 |

内部：`normalizeToolUseInput`（`:75-109`）、`isEmptyImageBlock`（`:130-135`）、`maskLargeWriteString`/`maskHistoricalAssistantWriteCalls`（`:143-202`）、`normalizeToolResultContent`（`:271-284`）、`contentToText`（`:286-297`）、`hasVisiblePiAssistantOutput`（`:314-319`）、`usageFromAssistant`（`:321-333`）。常量：`HISTORICAL_WRITE_PAYLOAD_MAX_CHARS=1500`、`HISTORICAL_TOOL_RESULT_TEXT_MAX_CHARS=2000`、`KEEP_CHARS=1200`、`RECENT_UNMASKED_MESSAGE_COUNT=6`（`:137-141`）。

## 3. 内部逻辑与关键流程

- `sanitizePiContextMessages`（`:204-` 区段）：①空图像块→文本占位（防上游带空 data image part 挂起）；②距末尾超过 6 条的历史——折叠超大 Write/Edit 入参与 ToolResult 文本；无变更返回原数组引用（零拷贝，`:211`）。
- `convertPiMessage`（`:340-436`）：user→`type:'user'`（`parent_tool_use_id` 恒 null，`:335-339` 注释：Pi 无子代理概念，但渲染层分组逻辑为旧会话 JSONL 保留不可删）；assistant——**仅 `stopReason==='error'` 提升 error**（`:364-368`：aborted/stop/length/toolUse 带 errorMessage 只 console.warn 不误导用户）；toolCall 预览帧 `input:{}` 省性能（`:390-392`）；空可见输出→`error:'empty_output'`+`_emptyOutput`（`:408-411`）；errorType 经 `isTransientNetworkError` 判 network_error/provider_error（`:405-407`）。
- `hasTerminalErrorWithContent`（`:445-462`）：正文存在且**不等于** errorMessage（防错误文案副本冒充正文，`:458-461`）。
- `convertResultMessage`（`:494-542`）：聚合 usage/cost；terminal_reason：empty_output→'empty_output'、length→'max_tokens'、否则 'completed'；subtype 映射（`:533`）。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`、`apps/electron/src/main/lib/agent-orchestrator.ts`（import 检索）。出向：`node:crypto`、`@earendil-works/pi-agent-core`/`pi-ai/compat`（类型）、`@profer/shared`（SDKMessage 类型）、`../agent-runtime-guards`、`../error-patterns`。

## 5. 数据 I/O 与副作用

无 I/O；副作用=非终态 errorMessage 的 `console.warn`（`:374-378`）。

## 6. 分支、失败、取消与恢复

无 throw；`convertPiMessage` 非法输入返回 null（`:347`）；#1268 断流保消息=内容/错误分离（`:438-486`）。

## 7. 权限与权威状态

无权限分支；SDKMessage 协议权威=`@profer/shared` 类型；Pi 消息语义权威=SDK（未读）。

## 8. 修改影响面

改转换影响渲染层全部消息显示与会话持久化 JSONL；`_partial`/`_emptyOutput`/`_channelModelId` 下划线字段被渲染层消费。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/adapters/pi-message-adapter.test.ts`（305 行；NOT_RUN）：空输出标记（test:39-49）、预览帧省略/终帧完整（test:51-75）、result 模型窗口持久化（test:88-105）、network_error/provider_error 判定（test:108-152）、断流保消息 4 例（test:155-223）、消毒 3 例（test:227-304，含原对象不可变/原数组引用/最近 6 步不折叠）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 导出（QA F-NB54-01 校正）+全分支语义 | 已证实 | `:25-542` |
| 测试 15 用例断言 | 已证实 | pi-message-adapter.test.ts |
| Pi 侧消息形状 | 推断 | SDK 类型（未读源） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 14 导出+分支 | §2/§3 | covered |
| 测试断言 | §9 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
