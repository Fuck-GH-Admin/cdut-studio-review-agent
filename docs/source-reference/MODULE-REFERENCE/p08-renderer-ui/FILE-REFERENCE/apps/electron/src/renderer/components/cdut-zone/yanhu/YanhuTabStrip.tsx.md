---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuTabStrip.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: da9d998d49632366a7848794dda02c6e77489b4f
sha256: 8fa872bde2bd07d00cbc83ca9924a5a319e381bf2debf2e0c3c64bb40e160dd2
lines: 127
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuTabStrip.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

智联万站多标签栏（127 行，头注 :1-9）：新建/关闭/拖拽排序/右键**原生上下文菜单**（主进程 `Menu.popup`）。注释 :7-9——原生菜单由 OS 绘制恒悬浮于原生 WebContentsView 之上，无需隐藏网页视图，根除自绘菜单遮挡与「展开菜单视口黑白闪烁」。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuTabStrip` | 组件 | 27-127 | 标签栏 |

内部：`YanhuTabStripProps`（:14-26）、`dragIdRef`+`performReorder`（:31-47，splice 重排）。

## 3. 内部逻辑与关键流程

右键 `preventDefault+stopPropagation→onActivate→onOpenMenu(tabId)`（:33-38，交主进程 Menu.popup）；拖拽 onDragStart 记 id、onDrop `performReorder`（from/to 校验）；标签：loading 转圈/favicon/Globe 三态图标、hover 显关闭钮、激活 `bg-primary/10`；尾部新建 +。

## 4. 调用者与调用链

入向：`YanhuExpressView`（标签栏位）。出向：lucide、`@profer/shared`（YanhuTabItem）。

## 5. 数据 I/O、读写与副作用

纯渲染（回调驱动宿主 IPC）。

## 6. 分支、失败、取消与恢复

dragId/to 越界→静默不重排；不抛。

## 7. 权限与权威状态

- 原生菜单权威：右键菜单必须走主进程 `Menu.popup`（:7-9 消除遮挡/闪烁根因）。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：智联万站标签交互（新建/关闭/排序/菜单）。
- 回归关注：右键先激活再弹菜单、拖拽重排越界保护。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| 原生菜单语义 | 已证实 | :7-9/:33-38 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `YanhuTabStrip` 全链 | §3 | 27-127 | covered（未测） |
