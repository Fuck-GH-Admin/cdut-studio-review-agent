---
path: apps/electron/src/renderer/components/agent/PermissionBanner.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dfdd0105fcc2acf3affdeebf4ec0762db2202152
sha256: c08e35608d9b0b2d350de7b8b3d2d4d3a6bc91972bd0c8b6131635d8bdbdd423
lines: 212
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/PermissionBanner.tsx

## 1. 结论与边界

**Agent 权限请求横幅**（`apps/electron/src/renderer/components/agent/PermissionBanner.tsx:1-8`）：内联对话流底部；显示工具名/命令内容/危险等级；允许/拒绝/总是允许。**队列模式：多并发请求 FIFO 逐个展示**（`:6`）。设计参考 Craft Agents OSS 内联权限 UI（`:8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PermissionBanner` | 组件 | `:42-212` | `{sessionId, onRequestStop}` |

内部：危险等级图标颜色（`:20-26`）、MCP 工具名解析 `server / tool`（`:27-35`）、`PermissionBannerProps`（`:36-41`）。

## 3. 内部逻辑与关键流程

待处理权限请求→横幅（工具名/命令/危险级）→允许/拒绝/总是允许→下一请求（FIFO 队列）。

## 4. 调用者与调用链

- 消费方：Agent 对话流（权限请求显示）。
- 出向：权限请求 API（允许/拒绝）。

## 5. 数据 I/O、读写与副作用

经 API 应答权限请求；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 多请求 | `:6` | FIFO 逐个 |
| 无请求 | — | null |

## 7. 权限与权威状态

权限请求是 Agent 工具执行的**人审门**（允许/拒绝/总是允许三态）；危险等级披露。

## 8. 修改影响面

- 权限请求形状/队列协议。
- 危险等级→颜色映射。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、FIFO 队列/三态应答 | 已证实 | `:1-212` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `PermissionBanner` | `:42-212` | covered |
