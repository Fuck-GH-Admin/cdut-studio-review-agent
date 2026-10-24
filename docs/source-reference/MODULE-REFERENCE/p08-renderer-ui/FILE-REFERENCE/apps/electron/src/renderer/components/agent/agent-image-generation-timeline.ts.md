---
path: apps/electron/src/renderer/components/agent/agent-image-generation-timeline.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1bae60c43fa122cee061831d45e4848a676e10d5
sha256: c5545b681f78831eb19f3724569b127f914f4edb71d84e8eecae4aa1f309965d
lines: 39
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/agent-image-generation-timeline.ts

## 1. 结论与边界

桌面端卡片时间线合并：图片生成卡片（瞬态状态 UI）与 SDK 消息组稳定归并。设计契约（`:18-22` 注释）：**卡片刻意做成瞬态状态 UI**——完成产物走 Agent 工具结果的结构化图片附件；失败尝试留在工具审计轨，**不生成第二会话条目**。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 3 个函数 = 4 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentTimelineItem` | type（导出） | 4-6 | `{kind:'group'\|'image',id,createdAt,…}` |
| `agentMessageGroupCreatedAt` | 函数（导出） | 13-16 | assistant-turn 用 `group.createdAt`，否则消息 `_createdAt`（非有限→`MAX_SAFE_INTEGER`，`:10`） |
| `getPendingImageGenerationCards` | 函数（导出） | 23-25 | 仅 `requesting\|saving` 存活 |
| `mergeAgentImageGenerationTimeline` | 函数（导出） | 28-39 | 过滤 `version===1` 且有限 `createdAt` 的卡片（`:33`）；按 createdAt 排序，**同刻刻意 group 优先**（`:27` 注释）、同 kind 按 id |

## 3. 内部逻辑与关键流程

合并（`:28-39`）：safe 过滤→groups+cards 平铺→`a.createdAt-b.createdAt || (同 kind ? id.localeCompare : group 先)` 稳定序。`messageCreatedAt`（`:8-11`）防御性取 `_createdAt`。

## 4. 调用者与调用链

入向：桌面端会话时间线渲染（SidePanel 消息流）；测试：`agent-image-generation-timeline.test.ts`（25 行，本批）。出向：`@profer/shared`（类型）、`./SDKMessageRenderer`（`MessageGroup` 类型）。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| createdAt 非有限 | 排序末尾/过滤 | 10,33 |
| version≠1 | 卡片剔除 | 33 |
| 同刻 | group 先 | 27,38 |
| succeeded/failed 卡 | 不进 pending | 23-25 |

## 7. 权限与权威状态

时间线条目唯一权威=结构化图片附件（完成）+工具审计（失败）；卡片仅瞬态。

## 8. 修改影响面

改合并序影响时间线显示；改 pending 语义影响状态卡。

## 9. 测试证据

直接测试：`agent-image-generation-timeline.test.ts`（25 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 瞬态卡片/单条目契约 | 已证实 | `:18-22` |
| 稳定合并序 | 已证实 | `:27-39` |
| 渲染消费面 | 未知 | 未逐行核 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 四导出 | §2,§3 | 4-39 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
