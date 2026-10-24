---
path: apps/electron/src/renderer/lib/tab-preview-position.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 22fa67c2f2a2e8ff94ef108fe52b0466bfdd1462
sha256: f4b8cf2bb3636735cd3caa1e8ff6cff2f6e71a17bd54bf78453b1e51f3f38337
lines: 76
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/tab-preview-position.ts

## 1. 结论与边界

Tab 悬浮预览面板的横向落点求解（tab-preview-position.ts:1-12）：受管浏览器是原生 WebContentsView（渲染层级在 DOM 之上），预览面板与 `[data-browser-native-page]` 占位矩形相交部分会被原生视图盖住；本模块求解不遮挡的 `left`，全遮挡时回落期望位置由调用方接受裁剪。只算几何，不改 DOM。

## 2. 导出与关键符号

类型 2 个：`NativePageRect`（tab-preview-position.ts:14-19，left/right/top/bottom）、`ResolveTabPreviewLeftInput`（:25-32，desiredLeft/panelWidth/panelTop/panelHeight/hostRects/viewportWidth）；函数 2 个：`resolveTabPreviewLeft(input): number`（:34-65）、`readNativePageRects(): NativePageRect[]`（:68-76）。内部常量：`EDGE_GAP = 8`（内部，:21）、`OVERLAP_EPSILON = 1`（内部，:23，1px 亚像素余量）。

## 3. 内部逻辑与关键流程

- `resolveTabPreviewLeft`（:35-64）：`minLeft = 8`、`maxLeft = max(minLeft, viewportWidth - panelWidth - 8)`、`clamp`（:36-38）；`desired = clamp(desiredLeft)`、`panelBottom = panelTop + panelHeight`（:40-41）；`overlaps(left, rect)` 四条件相交判定带 1px 余量（:43-48），`clashing(left)` 对 hostRects 任一相交（:49）；`!clashing(desired)` 直接返回期望位置（:51）；候选 = 每矩形左空当 `clamp(rect.left - panelWidth - 8)` 与右空当 `clamp(rect.right + 8)`（:54-56）加 `minLeft/maxLeft`（:57）；遍历候选跳过相交，取 `|candidate - desired|` 最小者（:59-63）；`return best ?? desired`（:64，全遮挡回落）。
- `readNativePageRects`（:69-75）：`document.querySelectorAll<HTMLElement>('[data-browser-native-page]')` 逐个 `getBoundingClientRect()`；`width <= 4 || height <= 4` 跳过（:72，隐藏面板 0 宽占位）；输出四边矩形数组。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`apps/electron/src/renderer/components/tabs/TabBarItem.tsx:19` import、`:467` 调 `resolveTabPreviewLeft`、`:473` 调 `readNativePageRects`；测试 `tab-preview-position.test.ts:6`。无其它引用（检索范围：baseline 全树 grep `resolveTabPreviewLeft|readNativePageRects`）。
- 出向：无 import；运行时依赖 DOM `document.querySelectorAll`/`getBoundingClientRect`（:70-71）。

## 5. 数据 I/O、读写与副作用

`resolveTabPreviewLeft` 为纯函数（无状态、无副作用）；`readNativePageRects` 只读 DOM 几何（getBoundingClientRect 只读副作用），不写 DOM、不触窗口/IPC。模块级无状态。

## 6. 分支、失败、取消与恢复

hostRects 为空 → 仅窗口边界 clamp（:51、测试 tab-preview-position.test.ts:23-25 期望 300/1152/8）；desired 越界夹到 `[8, maxLeft]`（:38）；竖向不相交不算遮挡（:46-47，测试 :42）；两侧候选全相交 → 返回 desired 接受裁剪（:64，测试 :47）；0/微小占位跳过（:72）；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

改动求解规则影响 `TabBarItem.tsx:467-473` 的预览面板定位（被原生浏览器视图遮挡问题）；`EDGE_GAP`/`OVERLAP_EPSILON` 常量变更需同步 `tab-preview-position.test.ts`（6 用例含 8/512/608 等硬编码期望值）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。测试文件 `tab-preview-position.test.ts`，机械计数 `test(`=6（`it(`=0、`test.each(`=0）。真实断言：tab-preview-position.test.ts:19（保持期望 100）、:24（夹到 1152）、:31（避让 512）、:37（右侧 608）、:42（竖向不相交 700）、:47（回落 700）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 相交判定/候选/回落逻辑 | 已证实 | tab-preview-position.ts:34-65 全文 |
| DOM 读取与 0 宽过滤 | 已证实 | tab-preview-position.ts:68-76 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| resolveTabPreviewLeft 主路径 | §3 | tab-preview-position.ts:34-51 | covered |
| 候选避让/最近选择 | §3/§6 | tab-preview-position.ts:53-63 | covered |
| 全遮挡回落 | §6 | tab-preview-position.ts:64 | covered |
| readNativePageRects | §3/§5 | tab-preview-position.ts:68-76 | partial |
