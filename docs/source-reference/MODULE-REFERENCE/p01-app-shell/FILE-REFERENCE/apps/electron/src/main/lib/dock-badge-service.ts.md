---
path: apps/electron/src/main/lib/dock-badge-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dd738a6546617b7e451f195314c3ba921a0d7f33
sha256: 753da0f3b5a2add7edf09057677d79f493e3d9dfb5e66b150e7892132581922c
lines: 58
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/dock-badge-service.ts

## 1. 结论与边界

**Dock/Taskbar 角标服务**（58 行）：渲染层推导的待处理数同步到系统角标（macOS/Linux `app.setBadgeCount`、Windows `setOverlayIcon` 任务栏叠加 `:4-7`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `setDockBadgeCount` | `:30-58` | 归一化（有限/取整/下限 0 `:31-33`）→平台分派；0 清角标；Windows overlay SVG 红圈（`createBadgeOverlay:13-25`，>99 显示 '99+'） |

内部：`createBadgeOverlay:13-25`（SVG→nativeImage）。

## 3. 内部逻辑与关键流程

归一化→darwin/linux setBadgeCount / win32 主窗口 overlay。

## 4. 调用者与调用链

角标 IPC（渲染层 dock-badge-count 推导后同步）；出向 `electron`、`../index`（getMainWindow）。

## 5. 数据 I/O、读写与副作用

系统角标 API。

## 6. 分支、失败、取消与恢复

窗口销毁→false；overlay 生成失败→清图标+false。

## 7. 权限与权威状态

展示层旁路（计数权威在渲染层 dock-badge-count）。

## 8. 修改影响面

改分派影响三平台角标；与渲染层 dock-badge-count 的四类计数口径联动，归一化规则（下限 0/取整/99+ 封顶）是 UI 展示契约。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 58 行全读 |
| **照实**：unsupported 平台返回 false 无兜底 | 已证实 | `:57` |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
