---
path: apps/electron/src/main/lib/team-planning-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4a215bfebef7b02424a76683b7288d85e9af950e
sha256: 72cfc1cad96d4e0811c0c9bc5231b752b023295b5966a6b07b8378d0a28bcedc
lines: 36
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/team-planning-service.ts

## 1. 结论与边界

团队规划 REST 客户端（36 行）：待办/规划组/标签/日历/提醒 5 组 API（19 个导出：todos 4+groups 4+tags 4+calendar 4+提醒 3）直连 `/v1/workspaces/{id}/planning/*`。薄封装无本地状态；错误**抛异常**（与 team-memory-service 的 result 结构风格不同——照实记录）。

## 2. 导出与关键符号

todos：`listTeamTodos:15`（注入 workspaceId）/`createTeamTodo:16`/`updateTeamTodo:17`/`deleteTeamTodo:18`；
groups：`listTeamPlanningGroups:19`（scope 查询参）/`createTeamPlanningGroup:20`/`updateTeamPlanningGroup:21`/`deleteTeamPlanningGroup:22`（body 带 scope）；
tags：`listTeamPlanningTags:23`/`createTeamPlanningTag:24`/`updateTeamPlanningTag:25`/`deleteTeamPlanningTag:26`；
calendar：`listTeamCalendarEvents:27`/`createTeamCalendarEvent:28`/`updateTeamCalendarEvent:29`/`deleteTeamCalendarEvent:30`；
reminders：`listTeamActiveReminders:31-34`（snake_case→camelCase 映射 `:33`）/`acknowledgeTeamReminder:35`/`snoozeTeamReminder:36`。

内部：`request:5-14`（auth+401 刷新重试；非 ok→**throw Error 带 code/status** `:12`）。

## 3. 内部逻辑与关键流程

统一 request 封装；list/create/update 给返回对象注入 `workspaceId`（`:15-17`/`:27-29`）；提醒行字段映射（`trigger_at`→`triggerAt` 等，`origin:'manual'`、`tags:[]` 补默认）。

## 4. 调用者与调用链

团队规划 UI/提醒投递（main）；出向 `undici.fetch`、`./auth-service`、`@profer/shared`（Todo/Planning* 类型）。

## 5. 数据 I/O、读写与副作用

HTTP(S)；无本地持久化。

## 6. 分支、失败、取消与恢复

未登录→throw'未登录团队服务'；非 2xx→throw（error.code/status 保留）；401 刷新重试一次；网络异常抛 fetch 原生异常。

## 7. 权限与权威状态

token 由 auth-service 权威；错误码透传供调用方判冲突。

## 8. 修改影响面

改动影响规划 UI/提醒；错误风格（throw vs result）如统一需同步全部调用方。

## 9. 测试证据

无直接测试（同批无 test 文件覆盖）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 19 导出/错误风格 | 已证实 | 文件全读（36 行；^export 实测 19） |
| 与 team-memory-service 错误风格不一致（throw vs ok-result） | 已证实 | `:12` vs team-memory-service `:23`（照实记录） |
| 服务端契约 | 未知 | 不在冻结树 |

## 11. 覆盖表

全文件 covered；服务端契约/测试 unknown。
