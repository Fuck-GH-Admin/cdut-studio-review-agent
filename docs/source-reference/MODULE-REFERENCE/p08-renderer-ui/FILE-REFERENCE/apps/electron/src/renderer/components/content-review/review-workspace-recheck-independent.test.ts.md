---
path: apps/electron/src/renderer/components/content-review/review-workspace-recheck-independent.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ff03bdfce1312df01ad95c771aaacf7c7330559
sha256: 2a1263ef2341027d93566bc31c96e774b7c524d68b1c8bb984a07692af99a9a9
lines: 163
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-workspace-recheck-independent.test.ts

## 1. 测试目标

**P06-RECHECK 独立 R1 等价物**（`:1-5` 注释）：调用真实 React/Jotai Hook 与 Controller 生产者（非历史 raw store.set 注入）；**仅合成 IPC，绝不报告为真实 Electron E05**。被测：`use-review-workspace-actions`/`review-actions-controller` 的**陈旧响应拒绝**（跨文件 Hook/控制器）。

## 2. 用例清单

**4 个 `test()`**（describe `P06-RECHECK equivalent real writer witnesses`）：旧 Hook 刷新不敌新 Controller（`:64-85`）、旧 Hook 不敌新 Hook（`:86-106`）、旧 Controller 不敌新 Workspace Hook 且**不复活旧 execution 态**（`:107-130`）、**延迟的 run-validity 结果不得覆盖后发投影**（`:132-161`）。

## 3. 真实断言

- `:77-82` 两次读；`runsByCase` 保持 fresh.id；放行旧结果后仍 fresh、execution 'running'（**stale_rejected**）。
- `:99-103` 同型 Hook 竞态。
- `:121-127` 旧 Controller 延迟返回后 runs 仍 fresh；`executionByCase` **undefined**（`:125-127` 注释：Workspace Hook 拥有工作区投影而非 execution）。
- `:150-158` run/validity 各 2 读；`runStaleByCase` 保持 false；延迟 true 放行后不覆盖（`:154-157`）；execution 'running'。
- 各用例尾 `console.log` 打 `stale_rejected=true` 见证标记（`:83/:104/:128/:159`）。

## 4. 未覆盖与脆弱点

合成 IPC（`:4`）；`until` 300×1ms 超时兜底（`:20-26`）；window 全局替身恢复（finally）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 逐行读 `:1-163` |
| 通过与否 | 未知 | NOT_RUN |
| 真实 Electron E05 | 未知（合成） | `:4` |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| Hook/Controller 竞态四型 | 4 | covered |
