---
path: apps/electron/src/renderer/lib/external-agent-run.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d4378a69a9558abc818826cc39f3fe9b1f3237f5
sha256: 6e48d15738a7bd067f485d8fed462c6de336d06aa425208bc2de9d274e8950dd
lines: 96
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/external-agent-run.test.ts

## 1. 测试目标

直接测试 `external-agent-run.ts` 的 `buildExternalAgentRunActivation`（1 个 describe `:15`）。4 个 `test(`，Given-When-Then 中文命名（飞书触发场景）。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1 | `:16-35` | 飞书新会话→`tabs toEqual([agent Tab])`+`activeTabId toBe(id)`+`workspaceId`+`streamState toMatchObject({running:true, model, startedAt})` |
| 2 | `:37-66` | Tab 已存在→`tabs toBe(tabs)`（复用同一数组）+`toolActivities toBe(旧引用)`（保留）+content 保留+startedAt 更新 200 |
| 3 | `:68-80` | session 不在列表→`title toBe('新 Agent 会话')`+`workspaceId toBeUndefined()` |
| 4 | `:82-95` | 无 currentStreamState→running true+content ''+toolActivities []+model undefined+startedAt 400 |

## 3. 真实断言

`toEqual`/`toBe`/`toMatchObject`/`toBeUndefined`。工厂构造 AgentSessionMeta/Tab；无 mock 框架。

## 4. 未覆盖

- title 入参显式覆盖分支；modelId 缺失但 currentStreamState.model 存在；5 种 Tab type 的非 agent 组合。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读（96 行） |
| 引用保留断言（toBe 同引用） | 已证实 | 用例 2 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 新建/复用/兜底/默认 | §2 | `:16-95` | covered |
| §4 边缘 | — | — | unknown |
