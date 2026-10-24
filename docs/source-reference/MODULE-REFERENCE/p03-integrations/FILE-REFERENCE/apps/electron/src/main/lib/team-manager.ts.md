---
path: apps/electron/src/main/lib/team-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d4f9879a2e41c6993b4150e2b32baed0f2cbbedf
sha256: e2f914b029092877cf232281268bab313c79724ad31df3363a0d2cd936ebd8b5
lines: 409
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/team-manager.ts

## 1. 结论与边界

团队管理器（409 行）：团队工作区远程 CRUD、邀请管理、成员管理、ownership 转让；"操作通过远程 API 执行，本地维护镜像"（`:4-5`）。本地镜像=agent-workspace-manager 索引（readIndex/writeIndex 的 `workspaces` 数组，软删 `isDeleted`）；成员/邀请/统计/公告**远程-only 实时拉取**。

不做的事：无 IPC（grep 零匹配，纯函数库）；无会话状态机（grep 零匹配——任务预期与实况不符照实记录）；无安全红线注释（唯一红线在 team-memory-agent-tools `:11`）。

## 2. 导出与关键符号

内部 `authedFetch:17-52`（401→刷新→**token 变化才重试一次** `:42-49`，未登录 throw）。导出（19 函数+1 接口）：

- 工作区：`listTeamWorkspaces:57`（includeDeleted；非数组抛格式非法）、`createTeamWorkspace:67-100`（slug 回退 `team-{id8}` `:82`、本地 unshift+建目录+enqueueChange）、`deleteTeamWorkspace:105-117`（**不查 res.ok 就软删+log"已删除"**）、`restoreTeamWorkspace:122-136`（**无 enqueueChange**）。
- 成员：`getMembers:141`（失败吞返回 `[]`）、`createInvitation:152`、`updateMemberRole:177`/`removeMember:192`（**不查 res.ok 静默**）、`leaveWorkspace:203-215`（不查 ok 就软删+log）、`transferOwnership:221-241`（不查 ok 就本地 role='admin' `:234-237`——语义存疑）。
- 邀请链：`verifyInvitation:247-254`（**裸 fetch 公开端点**；baseUrl 兜底 `''` `:251` 隐患）、`acceptInvitation:258-294`（本地显式重建字段+无 enqueueChange）、`declineInvitation:300`、`cancelInvitation:308-315`（错误处理裸 JSON.parse 隐患）、`listInvitations:320-339`（无参→`[]`、有参→分页空结构；`options:{}` 也走分页——truthy 判定边界）。
- 统计/公告：`getWorkspaceStats:344`（失败 null）、`Announcement:358-368`、`getAnnouncements:371`（失败 `[]`）、`createAnnouncement:382`、`deleteAnnouncement:399`。

## 3. 内部逻辑与关键流程

模式=远程先行→本地镜像→（部分）enqueueChange。失败处理三档：抛错（9 个）/吞错空值（4 个）/**不查远端结果改本地报成功**（delete/leave/transfer，矛盾⑤）。邀请生命周期为隐式流转（invite→verify→accept/decline→role→remove/leave），无枚举校验。

## 4. 调用者与调用链

团队工作区 UI/IPC 层（接线在别处）；出向 `undici`、`./auth-service`、`./agent-workspace-manager`（readIndex/writeIndex）、`./config-paths`（getAgentWorkspacePath `:95`/`:294`）、`./sync-manager`（enqueueChange `:98`/`:117`）。

## 5. 数据 I/O、读写与副作用

HTTP（/v1/workspaces 系列 + /members + /invitations + /stats + /announcements）；本地索引镜像写（writeIndex）；工作区目录物化（getAgentWorkspacePath，已核实 config-paths.ts:442-451 确实 mkdir）。

## 6. 分支、失败、取消与恢复

authedFetch 401 重试仅一次且校验 token 变化；吞错族防 UI 中断；软删+restore 可恢复（冷静期内，时长归属未知）。

## 7. 权限与权威状态

role 字符串透传（唯一硬编码 `:236` 'admin'）；transferOwnership 语义存疑（矛盾⑥）；verifyInvitation 公开端点无鉴权（token 即凭证）。

## 8. 修改影响面

改 CRUD/镜像逻辑影响团队工作区 UI；enqueueChange 缺口影响同步一致性；错误处理三档不一致是维护风险点。

## 9. 测试证据

无直接测试（目录无 team-manager.test.ts）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+原始字节核对+主根抽查）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 20 导出/三档失败处理/镜像语义 | 已证实 | 409 行全读（字节校验通过） |
| **①** 3 孤儿 import（randomUUID `:8`、ensureClaudeSkillManifest `:11` 零使用；agent-tools TeamMemoryDocument） | 已证实 | 子agent grep |
| **⑤** delete/leave/transfer 不查 res.ok 改本地+log 成功 | 已证实 | `:105-117`/`:203-215`/`:221-241` |
| **⑥** transferOwnership 无条件本地 role='admin' 与转让降权常理相悖 | 已证实 | `:234-237` |
| **⑦** enqueueChange 不一致（restore/accept/leave 不入队） | 已证实 | `:98`/`:117` 对照 |
| **⑧** cancelInvitation 错误路径裸 JSON.parse 崩溃点；**⑨** verifyInvitation baseUrl 兜底空串 | 已证实 | `:315`/`:251` |
| **⑩** 弱类型散点（as any/Promise<any>/unknown[]） | 已证实 | `:254`/`:278`/`:337`/`:350`/`:323`/`:141` |
| **③** 无 IPC/无会话状态机/无红线注释（任务预期不符照实） | 已证实 | grep 零匹配 |
| 服务端契约/冷静期时长/IPC 接线位置 | 未知 | 不在冻结树 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 20 导出全量 | §2 | covered |
| 三档失败/镜像/邀请链 | §3 | covered |
| 10 条矛盾 | §10 | covered |
| 测试/服务端 | §9/§10 | unknown |
