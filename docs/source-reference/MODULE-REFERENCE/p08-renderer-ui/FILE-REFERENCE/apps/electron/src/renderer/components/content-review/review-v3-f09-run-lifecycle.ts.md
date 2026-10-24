---
path: apps/electron/src/renderer/components/content-review/review-v3-f09-run-lifecycle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1bafe381505c8cbc4a5cdc0a6da06c88ce623253
sha256: 2034cc53f0cc93f9c603a411a221545b34a336b1a77c8e7a8fb088909ad5947e
lines: 90
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f09-run-lifecycle.ts

## 1. 结论与边界

**F09 运行生命周期投影**（`apps/electron/src/renderer/components/content-review/review-v3-f09-run-lifecycle.ts:1-4`）：从 Main 已持久化 Run+受理状态生成用户可读进度。**无启动权/审批权/写入权；不根据 Spinner 猜测后台是否运行**。`coverage` 注释（`:14`）：来自持久化检查覆盖账本，**不能当模型 token 或阶段百分比**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F09RunLifecycleView` | interface | `:7-17` | `{title, explanation, nextStep, startLabel, canStart, canStop, coverage, executionFailures}` |
| `projectF09RunLifecycle` | 函数 | `:19-89` | `(state, run, stale) => F09RunLifecycleView` 纯投影 |

## 3. 内部逻辑与关键流程

覆盖账本钳制（`:24-28`）：`completed≤planned`、`percent=round(completed/planned*100)` 或 null；`executionFailures` 统计 `execution-failed`（`:28`）。**状态机分支**（`:34-89`）：

1. 无 state/run→「尚未开始」（可启动，`:34-36`）。
2. **身份不一致→「运行身份待核验」不可启动/停止**（`:38-40`）。
3. `preparing`+running→「等待执行器受理」——**不能把预写的 running 当实际执行成功**（`:42-44`）。
4. `accepted`+running→「Pi 正在审核」（可停止，`:46-48`）。
5. running 但无受理回执→「运行状态待核验」（`:50-52`）。
6. `stale===null`→「输入版本待核验」（不臆断旧结果有效，`:54-56`）。
7. `stale===true`→「原运行已过期」——**旧决定不得自动沿用**（`:58-60`）。
8. `switch(run.status)` 七态（`:62-89`）：partially-completed（含执行失败提示 Main 决定沿用/新建）、cancelled、failed、awaiting-input、awaiting-decision（**自动步骤不能代替审核员或学校有权审批**，`:80`）、paused、completed（**自动执行结束不代表业务审批通过**，`:86`）。

## 4. 调用者与调用链

消费方：F09 运行进度 UI。出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯投影；无写。

## 6. 分支、失败、取消与恢复

见第 3 节 8+7 分支；无抛错路径（`switch` 全覆盖 `run.status`）。

## 7. 权限与权威状态

- 无启动/审批/写入权（`:3`）。
- 「不猜测后台」（`:3`）、「不冒充学校正式通过」（`:86`）、「旧决定不得自动沿用」（`:60`）是披露红线。

## 8. 修改影响面

- 状态机分支与 `ReviewRunV2.status`/`phase` 联合绑定。
- 文案（explanation/nextStep）是用户披露口径。

## 9. 测试证据

`review-v3-f09-run-lifecycle.test.ts`（79 行，8 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、全状态机 | 已证实 | `:7-89` |
| 三红线（不猜测/不冒充/不沿用） | 已证实 | `:3`、`:60`、`:86` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:7-89` | covered |
| 前置分支 | `:34-60` | covered |
| 七态 switch | `:62-89` | covered |
