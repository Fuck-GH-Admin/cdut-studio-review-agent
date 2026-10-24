---
path: apps/electron/src/renderer/lib/tab-preview-position.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e9d5753d8302e719ca23370ea1b0a944084b3e1
sha256: 4ad0e79e87dd5ba60f5dfcc9e6a648127b9d2bbd65c7ab700e046aeff9b73306
lines: 48
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/tab-preview-position.test.ts

## 1. 测试目标

验证 `resolveTabPreviewLeft` 对 Tab 悬浮预览面板的横向落点：不遮挡保持期望位置、窗口边界 clamp、与左右栏原生浏览器矩形相交时避让、竖向不相交不算遮挡、全遮挡回落（tab-preview-position.test.ts:1-3 文件头注释）。`base` 固定 panelWidth=280/panelTop=40/panelHeight=420/viewportWidth=1440（:11-16）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数 `test(`=6、`it(`=0、`test.each(`=0，共 6 个用例（全部顶层 `test`，无 describe）：

1. `不遮挡原生区域时保持期望位置`（tab-preview-position.test.ts:18-20）
2. `没有原生区域（浏览器未打开）时只夹窗口边界`（:22-26）
3. `与右栏浏览器相交时避让到其左侧空当`（:28-32）
4. `与左栏浏览器相交且左侧放不下时避让到其右侧`（:34-38）
5. `竖向不相交（面板在原生区域下方）不算遮挡`（:40-43）
6. `原生区域铺满主区、两侧都放不下时回落期望位置（接受裁剪）`（:45-48）

## 3. 真实断言

tab-preview-position.test.ts:19 `toBe(100)`；:23-25 `toBe(300)`/`toBe(1440 - 280 - 8)`/`toBe(8)`；:31 `toBe(512)`（注释 :30 给出 800-280-8 推导）；:37 `toBe(608)`（注释 :35-36）；:42 `toBe(700)`；:47 `toBe(700)`。全部针对 `resolveTabPreviewLeft`。

## 4. 未覆盖与脆弱点

未覆盖 `readNativePageRects`（DOM 读取函数，tab-preview-position.ts:68 无直接用例）；未覆盖多矩形同时存在、贴边亚像素（OVERLAP_EPSILON=1）场景。脆弱点：512/608/1152 等期望值与 `EDGE_GAP=8` 硬编码耦合（tab-preview-position.ts:21）。被测为纯函数，无动态调用。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例与断言行真实存在 | 已证实 | tab-preview-position.test.ts:18-47 |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 不遮挡直返 | §2/§3 | tab-preview-position.test.ts:18-20 | covered |
| 边界 clamp | §3 | tab-preview-position.test.ts:22-26 | covered |
| 左/右空当避让 | §3 | tab-preview-position.test.ts:28-38 | covered |
| 竖向判定 | §3 | tab-preview-position.test.ts:40-43 | covered |
| 全遮挡回落 | §3 | tab-preview-position.test.ts:45-48 | covered |
| readNativePageRects | §4 | — | unknown |
