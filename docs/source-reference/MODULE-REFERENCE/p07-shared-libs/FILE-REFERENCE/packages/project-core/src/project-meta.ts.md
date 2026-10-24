---
path: packages/project-core/src/project-meta.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6e5a4e90ef751b7fa28470f6ff220a7372ef7214
sha256: 6f18d77d1454d5a4182ba53cd74062d49d22dea08135e0e02a5ed3032ba0c105
lines: 150
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/project-meta.ts

## 1. 结论与边界

Project 元数据管理（头注释 :1-7）：创建/更新/查询纯函数；元数据存 AgentSessionMeta 扩展字段，**持久化由调用方（主进程 project-graph-service.ts）负责**（:6-7）。

## 2. 导出与关键符号

导出 12 条（`export` :19/:38/:54/:61/:68/:77/:84/:91/:100/:108/:137/:141）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `createProjectMeta(mainSessionId, graphJsonlPath)` | `:19-33` | 状态 active、计数 0、时间戳 |
| `updateTaskCounts(meta, total, completed)` | `:38-49` | 更新计数+lastActiveAt |
| `touchProject/completeProject/archiveProject` | `:54-70` | 时间戳/状态迁移 |
| `isProjectSession/isProjectActive/isProjectCompleted` | `:77-93` | 查询（completed 或 archived 均算完成 :92） |
| `projectProgress(meta)` | `:100-103` | 0-100，total 0 返 0 |
| `projectStatusLabel(meta)` | `:108-119` | 中文标签（active 进行中（N%）/已完成/已归档） |
| `isSafeSessionId(id)` | `:137-139` | `/^[A-Za-z0-9_-]{1,128}$/`（:130，排除路径分隔符/点段/控制字符 :134-136） |
| `getGraphJsonlPath(sessionDir, sessionId)` | `:141-150` | 非法 ID 抛 `无效的会话标识`（:143）；POSIX 拼接 `${dir}/${id}-graph.jsonl`（:148-149，注释：防 `..` 逃逸） |

## 3. 内部逻辑与关键流程

纯函数群；唯一 throw 是 `getGraphJsonlPath` 的 ID 校验（:142-144）。不适用取消/恢复：无异步。

## 4. 调用者与调用链

入向：`index.ts:105-118` 聚合导出；主进程 `project-graph-service.ts`（持久化，头注释 :6）。出向：`./types`（ProjectMeta/ProjectStatus/SessionType :9）。

## 5. 数据 I/O、读写与副作用

无 I/O（持久化在调用方）；路径拼接为纯字符串。

## 6. 分支、失败、取消与恢复

状态标签三态（:109-118）、progress 除零保护（:101）、ID 校验 throw（:143）。

## 7. 权限与权威状态

`isSafeSessionId` 是文件名安全权威（:134-136 注释）；无权限分支。

## 8. 修改影响面

Project 生命周期 UI（状态标签/进度条）；`project-core.test.ts`（project-meta 组 :688-743，含 ID 安全用例 :731）。

## 9. 测试证据

`project-core.test.ts`（批内）project-meta 组（:688-743，NOT_RUN）：createProjectMeta/updateTaskCounts/projectProgress/生命周期/标签/ID 安全（:731「不能携带路径片段」）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 12 条；ID 白名单防逃逸 | 已证实 | :130-150 |
| 持久化归调用方 | 已证实 | :6-7 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出 | §2/§3 | :19-150 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |
