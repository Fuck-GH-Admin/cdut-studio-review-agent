---
path: apps/electron/src/main/lib/planning-reminder-scheduler.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4c2a78a461755eb662a09a121248775c547e9859
sha256: 81934d181cb2c4893a3ca52ed57a066e8af9865ccc539d56cef57f6ca612fe2e
lines: 63
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/planning-reminder-scheduler.ts

## 1. 结论与边界

本地提醒调度器（头注释 :1-6）：仅主进程存活时运行；每条提醒首次到期及每次推迟再到期各通知一次；未确认提醒由渲染层从 SQLite 恢复。

## 2. 导出与关键符号

导出 2 条（`export` :53/:59）：`startPlanningReminderScheduler`（:53-57，30s 轮询 :14，幂等 guard :54）、`stopPlanningReminderScheduler`（:59-63）。内部：`showPlanningSystemNotification`（:19-34，原生通知 :18 注释：不依赖渲染 Web Notification；设置开关+isSupported 守卫 :20；click 聚焦首个存活窗 :27-32）、`checkDueReminders`（:36-51，checking 防重入 :37-38；claimDuePlanningReminders→逐条通知+broadcast 双事件 :40-45；异常 console.error 不中断轮询 :46-50）。

## 3. 内部逻辑与关键流程

轮询→claim→通知+广播（§2）。不适用取消/恢复（定时器 start/stop 即生命周期）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `main/index.ts:230` → 启动 `:1058`（safeRun）/停止 `:1259`。出向：electron（Notification :23/:33）、`./planning-manager`（claimDuePlanningReminders :40）、`./settings-service`（:21）、`./planning-events`（:43/:44）。

## 5. 数据 I/O、读写与副作用

定时器+原生通知+广播；读设置。

## 6. 分支、失败、取消与恢复

防重入（:37-38）；设置/平台守卫（:20）。恢复=渲染层 SQLite 恢复（:5-6 注释）。

## 7. 权限与权威状态

通知开关尊重用户设置（:20）。

## 8. 修改影响面

- 消费面：`main/index.ts:1058`（启动，safeRun）/:1259（停止）——主进程生命周期挂载。
- 依赖面：`planning-manager.claimDuePlanningReminders`（认领语义）、`planning-events`（双广播）、`settings-service`（通知开关）、electron Notification。
- 需同步测试：无专属测试；claim 语义经 planning-agent-operations.test 间接覆盖调度面，轮询/防重入未直接覆盖。

## 9. 测试证据

无专属测试文件。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；轮询/防重入/原生通知 | 已证实 | :14-63 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+调度循环 | §2/§3 | :19-63 | covered |
