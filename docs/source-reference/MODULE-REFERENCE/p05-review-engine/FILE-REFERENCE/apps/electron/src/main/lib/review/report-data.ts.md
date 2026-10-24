---
path: apps/electron/src/main/lib/review/report-data.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1beb72709f7d21965c02fdb291e5279150693ec3
sha256: 8c79392f99b316a6e421b447cea8fd6781cc43edbbf29156ec1c83734e74831d
lines: 22
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/report-data.ts

## 1. 结论与边界

报告数据访问层（头注 :1-6）：为 `report-service` 提供最小读取接口，从 `case-store` 派生，避免报告模块依赖存储实现全部 API 面。三个符号皆为薄透传，无逻辑分支。

边界：不校验、不写盘、不排序；仅封装读取。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getCaseSafe` | fn | 12-14 | 透传 `getCase(caseId)`（找不到返 undefined） |
| `latestRunSafe` | fn | 17-20 | `listRuns` 末元素（字典序最大即最新；无记录返 undefined） |
| `getCase` | re-export | 22 | `export { getCase }` |

无内部符号。

## 3. 内部逻辑与关键流程

`latestRunSafe`（:17-20）：`listRuns(caseId)`（case-store 文件名字典序）取 `runs[runs.length-1]`；注释 :16 称「最近一次完成（或运行中/失败）」——即**不筛选状态**，任何状态的最近记录都返回（消费方需自行判断）。无 throw。

## 4. 调用者与调用链

入向：`report-service.ts:15`（`getCase, latestRunSafe`；`latestRunSafe` 用于 :74 运行选取；`getCase` 经 re-export 被 :71 使用）。测试：无专属测试文件（全树检索）。`getCaseSafe` **零消费者**（全树检索仅本文件定义）。出向：`./case-store`（:9）。

## 5. 数据 I/O、读写与副作用

纯读透传（内部走 `case-store.readCaseFile`）；无写、无日志。

## 6. 分支、失败、取消与恢复

无分支（`latestRunSafe` 的空数组分支返 undefined）；无 throw（`listRuns` 的 `assertSafeId` throw 会传播）；无取消/恢复。

## 7. 权限与权威状态

无权限分支。运行「最新」语义 = 文件名字典序末位（`newRunId` 的 `run-{ms}-{rand}` 保证字典序==时间序，见 case-store 篇）。

## 8. 修改影响面

改动影响 `report-service`（导出报告的案卷/运行选取）与 re-export 消费面。`getCaseSafe` 目前无消费方。

## 9. 测试证据

无直接/间接测试文件（全树 glob 无 `report-data.test.ts`；`report-service.test.ts` 亦不存在）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/行号如 §2 | 已证实 | 逐条 |
| `latestRunSafe` 不筛选状态 | 已证实 | :17-20 |
| `getCaseSafe` 零消费者 | 已证实（否定） | 全树检索 |
| 运行行为 | 未知 | 无测试；NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getCaseSafe` | §2 | 12-14 | covered（未测） |
| `latestRunSafe` | §3 | 17-20 | covered（未测） |
| `getCase` re-export | §2 | 22 | covered |
