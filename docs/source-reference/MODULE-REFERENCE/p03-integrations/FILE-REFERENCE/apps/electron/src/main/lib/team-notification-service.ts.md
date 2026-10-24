---
path: apps/electron/src/main/lib/team-notification-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 334e9f4775014dbf780ecd47530418a316e2e5fe
sha256: 9103d19d3c7bf799cf43db9d680f71c5713c6dfa6b7c4c24619d83be502e57c1
lines: 250
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/team-notification-service.ts

## 1. 结论与边界

团队**桌面通知服务**（250 行）：监听 SSE 事件，窗口不在前台时弹 Electron 原生通知；SSE 不可用时走 sync-manager 变更信封降级路径（`:3-5`）。通知语义：过滤自己的操作、前台不打扰、30s 缓冲合并防轰炸。

不做的事：不持久化设置（内存态，重启回默认——照实记录）；不做工作区级聚焦判断（`:71`"简化：仅检查聚焦状态"）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `NotificationSettings` | `:13-21` | 7 开关（enabled/fileUpload/fileDelete/memberJoin/memberLeave/invitation/planningReminder） |
| `teamNotificationService` | `:250` | 类单例（类 `:35-248` 不导出） |

类 API：`setCurrentUserId:44`（自操作过滤）、`updateSettings:49`（浅合并）、`getSettings:54`（拷贝）、`handleSSEEvent:59-79`、`notifyFromSync:82-97`（降级）。
内部：`enqueue:100-114`（缓冲；满 5 立即合并）、`flush:117-140`（≥5 或强制→合并"N 项团队更新"+前 3 条+"... 还有 N 项"）、`showNotification:143-165`（`silent:true`、body 截 200 字符、点击聚焦+恢复最小化窗口）、`buildNotification:168-228`（5 事件类型分发）、`buildNotificationFromSync:231-247`（仅 file_updated/file_deleted 简化文案）。
常量：`DEFAULT_SETTINGS:23-31`（memberLeave 默认 false，其余 true）、`BUFFER_WINDOW_MS=30_000:39`、`MAX_BUFFER_SIZE=5:40`。

## 3. 内部逻辑与关键流程

判定序（`handleSSEEvent:59-79`）：enabled→自操作过滤（`data.userId===currentUserId`）→前台检查（任一窗口 focused 且未最小化则静默）→构建→入队。`buildNotification` 分支：file_updated（action rename/move/上传三态文案 `:177`）、file_deleted、member_changed（joined/invited vs removed/left 双开关）、planning_reminder_due（**recipientId 过滤** `:211-212`）、invitation_changed。

## 4. 调用者与调用链

SSE 客户端（`handleSSEEvent`）、sync-manager（`notifyFromSync`）；出向 `electron`（Notification/BrowserWindow）、`./sse-client`（SSEEvent 类型）。

## 5. 数据 I/O、读写与副作用

弹原生通知；无持久化、无网络。

## 6. 分支、失败、取消与恢复

Notification 不可用→try/catch warn 静默（`:161-164`）；缓冲 timer 清理（flush 幂等）；空 body 事件不发。

## 7. 权限与权威状态

- **不打扰原则**：前台静默、自操作过滤、`silent:true`（`:148`）、body 限 200。
- recipientId 定向提醒（`:211-212`）。
- 设置权威在内存（`updateSettings` 浅合并）。

## 8. 修改影响面

改事件类型映射影响通知覆盖；改缓冲参数影响打扰频率；设置持久化缺口（见 §10）影响用户体验一致性。

## 9. 测试证据

无直接测试（同批无 test 覆盖）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件结构/5 事件分发/缓冲合并 | 已证实 | 250 行全读 |
| **边界①** 设置仅内存（重启回默认）；**②** 降级路径只覆盖 2 事件类型（成员/邀请/提醒不降级）；**③** 点击聚焦 `getAllWindows()[0]`（首个窗口非团队窗口，可能错焦）；**④** `:71` 工作区级聚焦判断简化 | 已证实 | `:36`/`:237-246`/`:153`/`:71` |
| SSE 事件契约（data 字段） | 未知 | sse-client 实现不在本批 |

## 11. 覆盖表

全文件 covered；测试/服务端契约 unknown。
