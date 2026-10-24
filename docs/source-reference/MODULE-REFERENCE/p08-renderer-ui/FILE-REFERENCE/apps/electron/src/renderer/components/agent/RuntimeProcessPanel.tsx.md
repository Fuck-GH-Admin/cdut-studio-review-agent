---
path: apps/electron/src/renderer/components/agent/RuntimeProcessPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fc8a588def50b55288fdf699b9bf574781479676
sha256: 2f547dd7ef642d0b9b3d02bec1fe529ac9f4a8caf3f8062982d4424a1830a1e9
lines: 299
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/RuntimeProcessPanel.tsx

## 1. 结论与边界

**会话运行进程面板**（`apps/electron/src/renderer/components/agent/RuntimeProcessPanel.tsx:1-9`，期一 M4）：展示会话后台任务/进程——Pi 在 Bash 启动点登记并确认 PID 的服务（聊天结束后保留）、Claude SDK 活跃后台任务（补充来源）；**一键 kill（IPC `killProcess`，`{pid,startTime}` 双因子防转世；二次确认）**；**不按 CDUT Studio 会话临时目录扫描**（外部项目 dev server 真实 cwd 不在那里，`:9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RuntimeProcessPanel` | 组件 | `:58-299` | `{sessionId, className}` |

## 3. 内部逻辑与关键流程

进程列表（Pi 登记服务+SDK 后台任务）→kill（双因子 `{pid,startTime}` 防 PID 转世+二次确认）→刷新。

## 4. 调用者与调用链

- 消费方：会话面板（运行进程区）。
- 出向：IPC（`killProcess` 等）。

## 5. 数据 I/O、读写与副作用

IPC 查询/kill；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| kill | — | 双因子+二次确认 |
| 无进程 | — | 空态 |

## 7. 权限与权威状态

**双因子防转世**（`{pid,startTime}`，`:6`）——kill 只对确认身份的进程；二次确认。

## 8. 修改影响面

- `killProcess` IPC 契约（双因子）。
- 进程来源口径（Pi 登记/SDK 补充）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、双因子 kill | 已证实 | `:1-299` |
| kill 实际行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `RuntimeProcessPanel` | `:58-299` | covered |
