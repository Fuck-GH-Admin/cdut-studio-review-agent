---
path: apps/electron/src/renderer/components/agent/AgentMessages.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1cbc3293b3f177ba73991ed803feed0c8a4ea693
sha256: a46945f31c6df207ef6feafdf3c2fd72a23a097ea322c1ccde7d6cb9d71ca70a
lines: 995
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentMessages.tsx

## 1. 结论与边界

Agent 消息列表（文件头 `:1-5`）：复用 Chat 的 Conversation/Message 原语；流式输出走 SDK 渲染路径（`MessageGroupRenderer`）展示工具活动。纯展示+滚动/历史加载控制器。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `formatDuration` | function | `:469-477` | 毫秒→可读耗时 |
| `buildUsageTooltip` | function | `:479-493` | usage tooltip 多行（token 明细） |
| `DurationBadge` | 组件 | `:495-509` | 耗时徽章（悬浮显示 token 用量） |
| `AgentMessages` | 组件 | `:537-995` | 主组件（props 30+：sessionId/streaming/streamState/liveMessages/persistedSDKMessages/回调族/历史加载态等，`:102-147`） |

内部：`stableStringify`+`getSDKMessageStableKey`（`:55-99`，WeakMap 缓存——**内容相同的消息不产生重复 key**，`:62`）；`EmptyState`（WelcomeEmptyState）；`TopHistoryLoader`（`:157-199`，移动端触顶自动拉更早消息+顶部状态条，须在 `<Conversation>` 内取 scrollRef）；`StreamScrollFollow`（`:214-244`）；`AssistantLogo`（`:245`）；`RetryingNotice`/`RetryAttemptItem`（`:265/:376`，折叠式重试提示/单条尝试记录）；`AgentRunningIndicator`（`:511`，Shimmer Spinner+无括号运行时间）。

## 3. 内部逻辑与关键流程

### 3.1 流式跟随（`:200-244`，关键修复注释）

use-stick-to-bottom 一旦 `escapedFromLock=true` 后 `isAtBottom` 不自动恢复，滚动锁定导致“翻历史后输入不跟随”。修复：两信号任一即 `scrollToBottom()`（不带 preserveScrollPosition，先解锁再平滑回底）——①streaming false→true（新轮）；②本 session 的 pending AskUser 请求由有→无（追问期间 streaming 恒 true 无 false→true，需独立信号补，`:210-212`）。

### 3.2 历史加载

`TopHistoryLoader` 触顶拉更早（`onLoadEarlierHistory`/`historyMoreAvailable`/`historyLoadingEarlier`）。

### 3.2b 消息合并不变式（NB91-SEM-01 补录，`:654/:676/:43`）

`mergeMessagesByUuid`（`@/lib/agent-message-merge`）合并持久化与流式消息，三条不变式：**UUID 为唯一身份**、**有序尾部重叠**（流式尾段覆盖同 UUID 持久化段）、**禁内容全局去重**（内容相同的两条不同 UUID 消息必须都保留）。配套：

- **resolvedBlob 覆盖层**（`:682-691`）：被外部化的消息经 `resolvedBlobMessagesAtom`+`applyResolvedBlobMessages` 在用户点「加载全文」后替换为完整版（per-session Map）。
- **suppressAgentRunning**（`:699`）：`isCompacting || compactInFlight` 时压掉运行指示（压缩期间不误报运行中）。
- **historicalTaskSubjects**（`:737/:878`）：历史任务主题集防重复任务卡**雪崩**渲染。

### 3.3 主组件（`:537-995`）

消息按稳定 key 渲染；持久化消息（`persistedSDKMessages`）与流式消息合并展示；重试/分叉/探索/回溯/压缩/停止等回调透传消息头操作；`imageGenerations` 注入图片生成卡；`explorationEnabled` 门禁嵌入分支；`emptyState` 可定制。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 会话视图主体。出向：Chat 原语（Conversation/Message/MessageGroupRenderer）、`@profer/shared`（SDKMessage/AgentStreamState）、`use-stick-to-bottom`、ContentBlock 族。

## 5. 数据 I/O、读写与副作用

滚动操作；其余经 props 回调。无直接 I/O。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 滚动脱锁 | `:200-213` | 双信号回底 |
| 重试中 | `:265-467` | 折叠重试提示+尝试记录 |
| 空列表 | `:148-151` | EmptyState |
| 历史未载 | `messagesLoaded` | 骨架/loading |

## 7. 权限与权威状态

滚动行为口径如实记录（use-stick-to-bottom 限制与两信号修复）；重试展示以 `streamState.retrying` 为权威。

## 8. 修改影响面

改渲染/滚动 → 影响消息流体验；`AgentStreamState`/SDK 消息契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 稳定 key 防重复 | 已证实 | `:55-99` |
| 双信号滚动跟随（含 AskUser 补信号） | 已证实 | `:200-244` |
| 重试/耗时徽章/运行指示 | 已证实 | `:265-535` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出四件 | 2 | `:469-509` | covered |
| 稳定 key/EmptyState/历史加载 | 2/3.2 | `:55-199` | covered |
| `StreamScrollFollow` | 3.1 | `:200-244` | covered |
| 重试族/运行指示/主组件 | 3.3 | `:245-995` | covered |
