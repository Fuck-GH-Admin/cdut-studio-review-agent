---
path: apps/electron/src/renderer/components/content-review/ReviewAssignmentCard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 27f64584a39bf59d44e1b542b22e06f7ca0584bc
sha256: 237dfb4d0721d8ca169425b015aad4de44fbb02478cbd927edf8c262e579837e
lines: 156
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewAssignmentCard.tsx

## 1. 结论与边界

**审核操作可信指派卡片**（`apps/electron/src/renderer/components/content-review/ReviewAssignmentCard.tsx:1-6`，C1 显式指派入口）：「交给 Agent」创建结构化指派（sessionId/turnId/案卷/动作范围/工作角色）；指派列表（有效/已撤销）+撤销；会话绑定用本地单例（`:23-24`，多会话接入后替换）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewAssignmentCard` | 组件 | `:26-156` | `{caseId}` |

内部：`LOCAL_SESSION_ID`（`:23-25`，本地单用户会话标识）。

## 3. 内部逻辑与关键流程

- 列表（`:36`）：`window.reviewAPI.listAssignmentsV2(LOCAL_SESSION_ID)`。
- 自动审批开关读取（`:45`）：`getSettings().reviewAgentAutoApproval === true`。
- 创建（`:51`）：`createAssignmentV2({…sessionId/turnId/案卷/动作范围/角色…})`。
- 撤销（`:69`）：`revokeAssignmentV2(assignmentId)`。
- 自动审批开关写入（`:80`）：`setReviewAgentAutoApproval({enabled, grantedBy:'local-user'})`。

## 4. 调用者与调用链

- 消费方：案卷工作台（指派区）。
- 出向：`window.reviewAPI`（`listAssignmentsV2/createAssignmentV2/revokeAssignmentV2`）、`window.electronAPI`（设置读写）。

## 5. 数据 I/O、读写与副作用

IPC 指派 CRUD + 设置读写；无本地存储。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 指派创建失败 | `:51` | 错误显示 |
| 撤销 | `:69` | 状态→已撤销 |
| 设置读取失败 | `:45` | 静默（`.catch(() => {})`） |

## 7. 权限与权威状态

- **显式指派**是 Agent 操作授权前提（C1）；`grantedBy:'local-user'`（`:80`）记录授权来源。
- `LOCAL_SESSION_ID` 单例是当前单用户约定（`:23-24` 注释）。

## 8. 修改影响面

- 指派 API 契约（`createAssignmentV2` 等）与主进程指派服务耦合。
- `reviewAgentAutoApproval` 设置键。

## 9. 测试证据

无专属测试（全树检索 `ReviewAssignmentCard` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、指派 CRUD/开关 | 已证实 | `:26-156` |
| grantedBy 记录 | 已证实 | `:80` |
| 主进程指派执行 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ReviewAssignmentCard` | `:26-156` | covered |
| 指派/开关链 | `:36-85` | covered |
