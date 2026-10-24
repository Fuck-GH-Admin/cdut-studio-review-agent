---
path: apps/electron/src/renderer/components/agent/ProcessBlockGroup.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d2fe354c97adc8ba0c87533878fb4713b73d2f57
sha256: ffd17bb5c9d0850c6b04532105374dfd1022cbdffcc53113e3ea162e6a276f71
lines: 442
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ProcessBlockGroup.tsx

## 1. 结论与边界

**Agent 过程块折叠分组**（`apps/electron/src/renderer/components/agent/ProcessBlockGroup.tsx`，442 行）：定位「最终正文」区间（**最后一段连续 text 块**）外置，其余折叠进过程组。关键修复（`:65-78` 注释）：旧实现要求最后块必须是 text 否则整轮折叠——真实流式有 `[text, thinking]`/正文后 thinking 收尾形态，**正文必须外置**；正文后跟普通工具块则保持整组折叠；`AskUserQuestion` 已被静默过滤（AskUserBanner 承接）；Pi runtime thinking 不渲染（`:78`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `IndexedContentBlock` | interface | `:28-32` | 带索引内容块 |
| `AssistantTurnRenderItem` | type | `:33-41` | 渲染项联合 |
| `buildCompletedToolResultIds` | 函数 | `:42-64` | 已完成工具结果 ID 集 |
| `buildAssistantTurnRenderItems` | 函数 | `:136-205` | turn→渲染项（含 AskUserQuestion 静默过滤） |
| `buildProcessGroupToolNames` | 函数 | `:206-221` | 过程组工具名（能力图标去重，`:237` 用例所测） |
| `ProcessBlockGroup` | 组件 | `:222-442` | 折叠分组渲染 |

## 3. 内部逻辑与关键流程

- `buildCompletedToolResultIds`（`:42-64`）：从 `SDKMessage[]` 收集已完成工具结果。
- **最终正文定位**（`:65-78`+实现）：最后连续 text 段外置；末尾 thinking 归过程组；正文后跟工具块→整组折叠；`AskUserQuestion` 过滤后纯正文天然外置。
- 流式语义（test 13 用例锁定）：流式尾 text 形态、completed tools before trailing text、keep expanded、多工具 pending（最后 pending 与否影响分组）、trailing thinking 等。

## 4. 调用者与调用链

- 消费方：SDKMessageRenderer（过程块渲染）。
- 出向：React。

## 5. 数据 I/O、读写与副作用

纯分组+渲染；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| `[text, thinking]` | `:69-72` | 正文外置、thinking 进组 |
| 正文后跟工具块 | `:73` | 整组折叠 |
| AskUserQuestion | `:75-76` | 过滤后纯正文外置 |
| Pi runtime | `:78` | thinking 不渲染 |

## 7. 权限与权威状态

「正文必须外置」是交付内容可见性契约（`:68-72`）；不伪装折叠（test 锁定）。

## 8. 修改影响面

- 折叠口径改动影响正文可见性（13 用例锁定）。
- `AssistantTurnRenderItem` 联合形状。

## 9. 测试证据

`ProcessBlockGroup.test.ts`（314 行，13 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个导出、折叠语义 | 已证实 | `:28-442` |
| 旧实现缺陷修复说明 | 已证实（注释） | `:65-78` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 6 个导出 | `:28-442` | covered |
| 正文定位/折叠 | `:65-442` | covered |
