---
path: apps/electron/src/main/lib/browser-view-layout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 02027a0941055c5fbd26c237d3feee98fd5695bf
sha256: 3deb8bd3829e63e6c11b6ec7686e84e80095eb975b21aa28bb9b30174b1c3b57
lines: 57
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-view-layout.ts

## 1. 结论与边界

受管浏览器视口布局纯函数（`:1-5` 注释）：把 renderer 的 CSS 像素转为 contentView 坐标并限制在主窗口内——**受管浏览器唯一允许做缩放与裁切转换的位置**。

## 2. 导出与关键符号

`export` 逐条核对：5 个函数 = 5 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `resolveBrowserViewportLayout` | 函数（导出） | 7-27 | `(bounds,zoomFactor,contentBounds)=>BrowserViewBounds` | 缩放+夹取 |
| `shouldApplyBrowserLayoutRevision` | 函数（导出） | 30-32 | `(last,next)=>boolean` | **旧代际绝不覆盖当前原生视图**（`:29` 注释：React 清理与新挂载可交错） |
| `hasUsableBrowserBounds` | 函数（导出） | 34-36 | `bounds.width>4 && height>4` | |
| `resolveBrowserPageHostBounds` | 函数（导出） | 39-49 | viewport+page 偏移合成绝对边界 | |
| `sameBrowserBounds` | 函数（导出） | 51-57 | 四字段全等（`left` 存在） | |

## 3. 内部逻辑与关键流程

`resolveBrowserViewportLayout`（`:7-27`）：`scale` 非有限或 ≤0 时回退 1（`:12`）；坐标/尺寸按 scale 取整（尺寸 `max(0,…)`）；x/y 夹取到 `[0,content]`；宽高夹取到剩余空间（`:24-25`）。

## 4. 调用者与调用链

入向：受管浏览器视图挂载/resize 链；测试：`browser-view-layout.test.ts`（31 行，本批）。出向：`@profer/shared`（`BrowserViewBounds` 类型）。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/状态。

## 6. 分支、失败、取消与恢复

非法 zoom 回退 1（`:12`）；越界夹取（`:19-25`）；旧代际 revision 判定（安全整数且严格递增）。无抛错/取消概念。

## 7. 权限与权威状态

转换权唯一归属本文件（`:3-4`）；revision 门防旧代际覆盖（`:29`）。

## 8. 修改影响面

改夹取/缩放影响浏览器视口定位；影响 `browser-view-layout.test.ts`。

## 9. 测试证据

直接测试：`browser-view-layout.test.ts`（31 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一转换点/夹取语义 | 已证实 | `:1-5,7-27` |
| 旧代际不覆盖 | 已证实 | `:29-32` |
| 真实视图挂载 | 未知 | 未逐行核 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 布局五函数 | §2,§3 | 7-57 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
