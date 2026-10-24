---
path: apps/electron/src/renderer/lib/external-agent-run.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b368b95d1bcb3745a0f3e688200442f63c8ef4e
sha256: 016c19bc44e5cf591d19ae111e2df0d2022a3f5927cb547603c70ddf5b44232f
lines: 57
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/external-agent-run.ts

## 1. 结论与边界

**外部 Agent 运行激活**纯函数（57 行）：外部渠道（如飞书）触发 Agent 运行时，前端构建 Tab 激活与流式状态（测试 `:16` 场景）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ExternalAgentRunTab` | `:4-9` | Tab 形状（5 种 type） |
| `ExternalAgentRunActivationInput` | `:11-20` | 入参（tabs/sessions/sessionId/title?/workspaceId?/modelId?/startedAt/currentStreamState?） |
| `ExternalAgentRunActivation` | `:22-29` | 出参（tabs/activeTabId/title/workspaceId?/modelId?/streamState） |
| `buildExternalAgentRunActivation` | `:31-57` | 已有 Tab 复用否则新建；title 兜底链（input→session→'新 Agent 会话'）；streamState 合并（**保留已有 content/toolActivities** `:51-52`，running=true+startedAt 覆盖） |

## 3. 内部逻辑与关键流程

单函数：查 session→定 title→查已有 agent Tab→构造流状态（旧状态 spread+运行字段覆盖）。

## 4. 调用者与调用链

外部渠道运行事件处理（channel 接收层）；被 `external-agent-run.test.ts`（4 个 `test(`）覆盖。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

session 缺失→fallback 标题；currentStreamState 缺失→空默认。

## 7. 权限与权威状态

外部运行的 Tab 激活语义（复用/新建判定）在本函数单一裁决。

## 8. 修改影响面

改合并语义影响外部触发的流式展示连续性；测试 4 用例锁定。

## 9. 测试证据

`external-agent-run.test.ts`（同批，4 个 `test(`）：新建激活/复用保留工具活动/fallback 标题/空默认。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 57 行全读 |
| 行为锁定 | 已证实 | 测试 4 用例 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
