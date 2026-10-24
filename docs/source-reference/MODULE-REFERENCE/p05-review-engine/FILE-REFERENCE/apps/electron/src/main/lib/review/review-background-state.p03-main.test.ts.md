---
path: apps/electron/src/main/lib/review/review-background-state.p03-main.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3b5b34cd7b0b6f3b830cb38f96385362a8b21f71
sha256: bed7b46c1d84ec417d1d48537e4b7fe93a9310df9da19f664fdc490ea4d74bde
lines: 84
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-background-state.p03-main.test.ts

## 1. 测试目标

P03-MAIN-S01：状态**绝不**因 V2 运行落盘为 'running' 就上报 accepted；不起真实 Pi/Electron/renderer（`apps/electron/src/main/lib/review/review-background-state.p03-main.test.ts:2-3`）。被测：`summarizeBackgroundPiReviewState`（纯投影）+ `registerReviewIpc` 的真实 IPC 通道（`:73-83`）。

夹具：tmp 配置目录（`PROFER_CONFIG_DIR`，`:13-15`）；`run()` 极简 RunSummary、`yes/no` admitted 替身（`:17-19`）；IPC 用 `globalThis.__proferElectronTestHooks.ipcMainHandlers` Map 捕获 handler（`:74-77`）。mock 边界：admitted 是函数替身；IPC handler 是真实注册实现直调。

## 2. 用例清单

共 **8 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 22-26 | 无 Pi run → not-started；普通 V2 run 不能变 Pi ACK | 空/非 `run-pi-` 前缀/他案 | summarize×3 | 独立 |
| 2 | 28-31 | persisted running/queued 不给页面离开 ACK | running+no、queued+yes | summarize×2 | 独立 |
| 3 | 33-37 | 仅真实 onRunOwned 确认成 accepted | running+yes | summarize toEqual | 独立 |
| 4 | 39-43 | 待办业务交互 ≠ 完成 | awaiting-input/awaiting-decision/completed | summarize×3 | 独立 |
| 5 | 45-49 | partial/cancel/fail/paused 恒 incomplete | 4 status 循环 | summarize | 独立 |
| 6 | 51-63 | 终态失败带出可诊断原因 | failed+error+completedAt | summarize | 独立 |
| 7 | 65-71 | 快照不含 owner sessionId/assignmentId/转写 | completed+completedAt | summarize | 独立 |
| 8 | 73-83 | 真实 Review IPC 只读通道拒非法/未知 caseId | registerReviewIpc + handler Map | fn({},'../../bad')/fn({},'missing-case') | 独立 |

## 3. 真实断言

- `:23-25` `toEqual({caseId:'sample',phase:'not-started'})`、`.phase` toBe `'not-started'`×2。
- `:29-30` `.phase` toBe `'preparing'`×2。
- `:34-36` `toEqual({caseId:'sample',runId:'run-pi-test',runStatus:'running',phase:'accepted'})`。
- `:40-42` `'needs-attention'`×2、`'finished'`。
- `:47` 循环 4 status → `'incomplete'`。
- `:58-62` `failed.phase` toBe `'incomplete'`、`failed.error` toBe 理由全文、running/completed 的 `.error` toBeUndefined。
- `:67-70` `completedAt` toBe、`'sessionId' in state`/`'assignmentId' in state`/`'messages' in state` 均 toBe false。
- `:80-82` `expect(fn).toBeDefined()`、`fn({},'../../bad')` toThrow `'非法 caseId'`、`fn({},'missing-case')` toThrow `'案卷不存在或尚未初始化'`。

## 4. 未覆盖与脆弱点

- admitted 替身（yes/no）不测真实 `isPiReviewRunAdmitted`。
- 用例 8 依赖测试钩子 `__proferElectronTestHooks`（环境约定）。
- `queued+yes` 仍 'preparing'（`:30`）是关键语义锚；`paused` 等的 error 带出未逐测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 test/1 describe | 已证实 | `:21-83` |
| running≠accepted（admitted 门） | 已证实 | `:28-37` |
| 敏感字段不外泄 | 已证实 | `:65-71` |
| IPC 拒注入路径/未知案卷 | 已证实 | `:80-82` |
| 测试通过与否 | 未知 | NOT_RUN |
| 真实 admitted 实现 | 未知 | 批外 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| not-started 过滤 | §2/§3 | 1 | covered |
| preparing/accepted 门 | §2/§3 | 2-3 | covered |
| needs-attention/finished | §2/§3 | 4 | covered |
| incomplete 4 态 | §2/§3 | 5 | covered |
| error 带出/字段屏蔽 | §2/§3 | 6-7 | covered |
| IPC handler | §2/§3 | 8 | covered |
