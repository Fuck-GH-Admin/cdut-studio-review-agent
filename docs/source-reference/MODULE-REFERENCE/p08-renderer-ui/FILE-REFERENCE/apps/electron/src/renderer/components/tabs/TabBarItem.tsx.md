---
path: apps/electron/src/renderer/components/tabs/TabBarItem.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b44038c24a96ee00a43d14e39b76be7858674970
sha256: f3acfdf3ae295c842a0bb423cb5b416dc7a064d049750db72b0b74c1d180b194
lines: 492
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/TabBarItem.tsx

## 1. 结论与边界

单个标签页 UI（头注释 :2-7）：标题+工作区标签+流式指示+关闭按钮；点击聚焦/中键关闭/拖拽重排；**hover 预览面板由父级 TabBar 统一管理状态**（:6）。

## 2. 导出与关键符号

导出 2 条（`export` :21/:62）：`TabBarItemProps`（:21-）、`TabBarItem`（:62-）。内部：`TabPreviewDropdown`（:436-，预览浮层）。

## 3. 内部逻辑与关键流程

（头+大纲级，492 行）：多图标（agent/chat/browser/tutorial/scratch/git :12）；minimap 缓存（tabMinimapCacheAtom :17）；预览定位（readNativePageRects/resolveTabPreviewLeft :19）；portal+Z_LAYER（:10/:13）。

## 4. 调用者与调用链

入向（子agent 交叉核）：`TabBar.tsx:72`→:1295；index.ts:3 死桶。出向：TabPreviewPanel（:18→:488）、tabMinimapCacheAtom（:17）、tab-preview-position（:19）、createPortal/Z_LAYER。

## 5-7. 数据/分支/权限

纯渲染+交互回调；不适用。

## 8. 修改影响面

- 消费面：TabBar。
- 依赖面：预览定位 lib。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；预览归属契约 | 已证实 | :2-7 |
| 条目实现逐行 | 推断（头+大纲级） | :62-491 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+契约 | §2/§7 | :2-62 | covered |
| 条目实现 | §3/§10 | :62-491 | 推断 |
