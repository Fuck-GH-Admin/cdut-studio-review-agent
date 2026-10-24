---
path: apps/electron/src/renderer/components/tabs/topbar-layout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34c2e3582d32bf00634d0a1b97e34449b6aabfe6
sha256: 52d9251a80463df930f054a15385910171e7b74e1af4301c14258c9a67f34f4f
lines: 78
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/topbar-layout.ts

## 1. 结论与边界

顶栏几何纯函数（78 行）：**整数像素契约**——半像素居中是高 DPI 点击失效温床（:16-21 注释：110% zoom+Windows 缩放下全部非整数物理像素）；三处共用边缘间距防「Tab 滚到胶囊下/拖拽层压窗口按钮」（:5-11）。

## 2. 导出与关键符号

导出 8 条（`export` :1/:2/:12/:22/:26/:34/:48/:76）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `TOPBAR_HEIGHT=40`/`TOPBAR_CONTENT_HEIGHT=37` | `:1-2` | |
| `TOPBAR_ACTIONS_EDGE_GAP=12` | `:12` | 三处共用（:5-11） |
| `TOPBAR_CONTENT_OFFSET` | `:22-24` | floor(1.5→1px) |
| `TopBarGeometryInput`/`TopBarGeometry` | `:26-42` | |
| `resolveTopBarGeometry(input)` | `:48-68` | 整数偏移+bottomGutter 落下边距（:44-47） |
| `resolveTopBarDragRightInset(actionsWidth)` | `:76-78` | 拖拽层让开操作胶囊；**几何相邻不重叠**（:70-75：重叠即高 DPI 点击失效成因） |

## 3. 内部逻辑与关键流程

clamp 三级（:55-56）+floor 偏移（:57）+视口宽扣列（:59）。纯函数。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `TabBar.tsx:82-86`（常量用点 :429/:1231/:1246/:1254）；测试 topbar-layout.test:2-9。**否定：`resolveTopBarGeometry`/`resolveTopBarDragRightInset`/`TopBarGeometry` 无生产消费者（仅测试）**。出向：无（零 import）。

## 5-7. 数据/分支/权限

纯函数；整数像素契约（§1）。

## 8. 修改影响面

- 消费面：顶栏拖拽/布局。
- 依赖面：CSS 三处共用数值（:7-10）。
- 需同步测试：`topbar-layout.test.ts`（86 行，姊妹手册）。

## 9. 测试证据

`topbar-layout.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条；整数像素契约 | 已证实 | :16-24/:70-78 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出+几何链 | §2/§3 | :1-78 | covered |
