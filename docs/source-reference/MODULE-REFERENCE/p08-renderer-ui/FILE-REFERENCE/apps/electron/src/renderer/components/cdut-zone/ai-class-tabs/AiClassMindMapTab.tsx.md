---
path: apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassMindMapTab.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5d7d1304deb18d7ddd85528bdb65d3ad1fbcaf73
sha256: d9afa278a3dbdb6af3df915c248f141243632e683b20743c76d329307b68805e
lines: 215
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassMindMapTab.tsx

## 1. 结论与边界

AI 速课堂思维导图视图（文件头 `apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassMindMapTab.tsx:1-9`）：双曲 Poincaré 投影+贝塞尔气泡（复用共享引擎 mindmap-canvas）；气泡自由拖拽**松手落盘**（`saveMindmapCoords`）；点击气泡生成深度伴学 Prompt 入剪贴板+Toast；工具栏缩放/复位/全屏/OPML 2.0 导出；滚轮以光标为锚缩放+背景平移；全屏附鸟瞰小地图。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AiClassMindMapTab` | 组件（导出） | 23-215 | `{sessionId,mindmapId}`（`:18-21`） |

内部分段：加载（`:31-57`，alive 旗标防卸载 setState）；`persistCoords`（`:64-70` 落盘失败静默 `.catch(()=>{})`）；`copyStudyPrompt`（`:72-84`，`node.studyPrompt || buildNodeStudyPrompt` 兜底）；拖拽状态机（`onBubblePointerDown`/`onPointerMove`/`onPointerUp`，`:86-117`——**moved>2px 才算拖拽落盘，否则视为点击复制**，`:98,112-113`）；`exportOpml`（`:119-128`，canceled 不报错）；`resetLayout`（`:130-142` 丢弃覆盖重算落盘）。

## 3. 内部逻辑与关键流程

视口（`useMindMapViewport`）：滚轮锚点缩放+背景平移；缩放显示 `%`（`:162`）。拖拽 delta 除以 zoom（`:96-97`）。全屏模态（`MindMapFullscreenModal`，`:198-212`）携带 overrides/onPersist/onReset。空态提示「尚未生成思维导图」（`:151-153`）。

## 4. 调用者与调用链

入向：AI 速课堂右栏脑图 Tab；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`@profer/shared`（`buildNodeStudyPrompt`/`flattenMindMap`）、`@/components/ai-elements/mindmap-canvas`、`window.electronAPI.study`（getMindmap/saveMindmapCoords/exportOpml）。

## 5. 数据 I/O、读写与副作用

IPC：getMindmap/saveMindmapCoords/exportOpml；剪贴板写入；Toast；本地 overrides 状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 加载失败 | mindmap null→空态 | 52 |
| 落盘失败 | 静默 | 67 |
| 复制失败 | toast.error 权限提示 | 79-81 |
| 导出失败/cancel | error/静默 | 124-127 |
| 拖拽 vs 点击 | moved>2px 判定 | 98,112-113 |

## 7. 权限与权威状态

坐标权威=落盘 overrides（用户拖拽优先，reset 重算）；伴学 Prompt 口径=`@profer/shared`。

## 8. 修改影响面

改交互影响脑图布局/复制；影响生成链。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 拖拽落盘/点击复制判定 | 已证实 | `:86-117` |
| 复位/导出/全屏 | 已证实 | `:119-142,198-212` |
| 真实渲染 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 23-215 | covered |
| 断言 | §9,§10 | — | unknown |
