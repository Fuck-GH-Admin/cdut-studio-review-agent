---
path: apps/electron/src/renderer/components/content-review/batch-ui-feedback.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f541ec5361c468ca57e93be920e8fe27f657af78
sha256: 42fafaa7063eca65227fe4f3b4f6a916e9e24405070093954951c1e087e6c93c
lines: 50
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/batch-ui-feedback.test.ts

## 1. 测试目标

`batch-ui-feedback.ts` 三导出的反馈语义（describe「21 号本地 UI QA：反馈语义」`:5`）。被测逻辑见同组手册。

## 2. 用例清单

**3 个 `test()`**：IPC 包装剥离+业务原因保留（`:6-13`）、重入队只显本轮待审/旧回执转历史（`:15-29`）、**检查成功≠业务批准+失败/待人工计数**（`:31-49`）。

## 3. 真实断言

- `:7-12` IPC 前缀剥离两例（'全局 AI 代批授权未开启'/'案卷仍待补件'）；原文保留；`null`→`'null'` 字符串。
- `:20-28` 三态 `toEqual`：done+同 run+已落阶段→「已自动退回补件（业务已写入）」；queued→「待本轮重新审核」+history；done+异 run→当前 triage 标签+history。
- `:42-48` 汇总 `{completed:3, failed:1, pending:0, needsHuman:2, technical:0}`（technical 仅算 done 的 technical-exception）；全失败→needsHuman 0。

## 4. 未覆盖与脆弱点

未覆盖：technical 计数正例（done+technical-exception）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 逐行读 `:1-50` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 错误剥离/展示/汇总 | 3 | covered |
