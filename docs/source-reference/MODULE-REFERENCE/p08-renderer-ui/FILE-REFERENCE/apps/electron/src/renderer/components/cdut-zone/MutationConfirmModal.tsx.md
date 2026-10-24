---
path: apps/electron/src/renderer/components/cdut-zone/MutationConfirmModal.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f3494ea19da6d8963535f5ed2c8ce796fce0bc4b
sha256: 8ee9770b79feb994877c0f2704ff467d7978ae651fe71a5ddf633f4357e4f4c1
lines: 102
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/MutationConfirmModal.tsx

## 1. 结论与边界

教务写操作二次确认弹窗（文件头 `apps/electron/src/renderer/components/cdut-zone/MutationConfirmModal.tsx:1-5`）：Pi Agent 触发选退课/报名/缓考/改密等高危写操作→主进程派发 `cdut-zone:on-mutation-request`→**仅用户点「确认执行」后底层青果教务客户端才真正提交 POST 变更**。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MutationConfirmModal` | 组件（导出） | 16-102 | 事件订阅+确认弹窗 |

## 3. 内部逻辑与关键流程

- 事件订阅（`:24-31`）：`onMutationRequest` 置 request+重置 submitting/30s。
- `respond(confirmed)`（`:33-42`）：`confirmMutation({requestId,confirmed})`；finally 清态。
- **30s 自适应倒计时防卡死**（`:44-59`）：到点自动 `respond(false)`（拒绝）；request 变化重置。
- 展示：操作类型/触发工具+警示文案（「将直接提交至成都理工大学青果教务系统…请谨慎确认」，`:87-89`）。
- `useGlobalOverlay`：弹出时智联万站视口让位（`:21-22`）。

## 4. 调用者与调用链

入向：全局（写操作请求事件）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`window.electronAPI.cdutZone`、jotai overlay、`@profer/ui`（`Z_LAYER.confirm`）。

## 5. 数据 I/O、读写与副作用

IPC 事件订阅+`confirmMutation`；倒计时 interval；全局 overlay 登记。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 超时 30s | 自动拒绝 | 44-59 |
| 无 request | null | 61 |
| 提交中 | 按钮 disabled/`正在提交…` | 92-94 |
| respond 异常 | finally 清态 | 37-41 |

## 7. 权限与权威状态

写操作权威=用户显式确认（默认拒绝+超时拒绝双保险）；POST 提交门在青果客户端层。

## 8. 修改影响面

改确认语义影响高危写操作安全面。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 确认后才提交 | 已证实 | `:1-5,33-42` |
| 超时拒绝防卡死 | 已证实 | `:44-59` |
| 真实写操作流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 16-102 | covered |
| 断言 | §9,§10 | — | unknown |
