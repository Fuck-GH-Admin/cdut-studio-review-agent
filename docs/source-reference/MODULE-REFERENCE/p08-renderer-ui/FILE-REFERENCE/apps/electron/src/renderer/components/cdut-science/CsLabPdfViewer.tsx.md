---
path: apps/electron/src/renderer/components/cdut-science/CsLabPdfViewer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1210b87df8ae69fdd487c919c2d72b5504dbe8b1
sha256: 9711f33f7973f239860b6c03b88bd630f9573a30dfe21c9fd8bfba20d032212d
lines: 572
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabPdfViewer.tsx

## 1. 结论与边界

社论式 PDF 阅读器（头注释 :2-8）：评审加固三点——11.3 Worker 失效自动降级主线程（fake worker）；11.4 批注按 `position.rotation` 四向仿射投影；11.6 页面滑出 ±1 缓冲立即释放 Canvas 位图、取消渲染任务并 `page.cleanup()`。

## 2. 导出与关键符号

导出 1 条（`export` :58）：`CsLabPdfViewer({labId, literature, initialPage?, onSelection})`（:58-）。内部：`withTimeout`（:42，Promise 超时包装）、`PdfPageView`（:309，单页视图）、`PageDimensions`（:33）、`SelectionRect`（:302）。全局：`GlobalWorkerOptions.workerSrc`（:24）。

## 3. 内部逻辑与关键流程

（头部+大纲级，572 行）：主组件四 useEffect（:78/:135/:163/:169——文档加载/页切换/选区/资源释放）；PdfPageView 四 useEffect（:330/:335/:355/:373——渲染/旋转/批注投影/清理）；zoteroRectToViewport 投影（shared 纯函数 :15-19）。

## 4. 调用者与调用链

入向：`CsLabStagePane.tsx:39`（pdf 分派）。出向：`pdfjs-dist`（:12-14，worker URL :14）、`@profer/shared`（zoteroRectToViewport）、`@/atoms/cslab-atoms`（CsLabPdfSelection）、`@profer/ui`（detectIsWindows）。

## 5. 数据 I/O、读写与副作用

PDF 加载/Canvas 渲染/位图释放；选区回调。

## 6. 分支、失败、取消与恢复

Worker 降级（11.3）；渲染任务取消+cleanup（11.6）；withTimeout 防悬挂。恢复=重新渲染。

## 7. 权限与权威状态

评审加固三点权威（:4-7）；批注投影口径 rotation 四向（11.4）。

## 8. 修改影响面

- 消费面：StagePane pdf 分派。
- 依赖面：pdfjs-dist（worker 行为）、shared 投影纯函数。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；评审加固三点 | 已证实 | :2-8/:24 |
| 渲染/清理实现逐行 | 推断（头+大纲级） | :58-571 |
| pdfjs 实际行为 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+加固契约 | §2/§7 | :2-58 | covered |
| 渲染/清理实现 | §3/§10 | :58-571 | 推断 |
