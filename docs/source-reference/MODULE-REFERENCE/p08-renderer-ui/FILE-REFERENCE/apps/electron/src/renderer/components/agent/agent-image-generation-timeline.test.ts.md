---
path: apps/electron/src/renderer/components/agent/agent-image-generation-timeline.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad9cbc424de78cc4f2b3ebc8e3a1fc833f564007
sha256: 0932264a471ee889c47ee963a35ede8babe9c4662ddfb40f335aefb8c674046d
lines: 25
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/agent-image-generation-timeline.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

时间线合并：独立 pending 卡片与消息组按时间确定性排序（同刻 group 先）；仅存活生命周期态进 pending。

## 2. 用例清单

共 2 个 `test(`（`apps/electron/src/renderer/components/agent/agent-image-generation-timeline.test.ts:8,16`，describe `:7`）。夹具：`group`/`card` 工厂（`:4-5`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 合并排序（`:8`） | 两组（30/10）+两卡（20/30）→ `['group:first','image:middle','group:later','image:same-time']`（同刻 30 group 先） |
| 2 | 存活态过滤（`:16`） | requesting/saving/succeeded/failed → pending 仅 `['requesting','saving']` |

## 3. 真实断言

逐条见上表（`:13,23`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：version≠1 过滤、`_createdAt` 回退（`MAX_SAFE_INTEGER`）、同 id 平局。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个用例 | 已证实 | `grep test(`；`:8-24` |
| 排序/过滤语义 | 已证实 | `:13,23` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 合并排序 | 1 | 8-14 | covered |
| pending 过滤 | 2 | 16-24 | covered |
| version/回退 | 无 | — | unknown |
