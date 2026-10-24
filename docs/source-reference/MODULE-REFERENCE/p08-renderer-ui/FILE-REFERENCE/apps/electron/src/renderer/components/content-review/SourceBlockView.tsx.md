---
path: apps/electron/src/renderer/components/content-review/SourceBlockView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7de7754716ac95bdc3b7f31d5e68437f2e564fe6
sha256: babcd0978437ee391a98338bc9dd09e290e12e500cc2b3a04fc01e3ef7467daf
lines: 231
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/SourceBlockView.tsx

## 1. 结论与边界

**结构化原文块渲染器（左/中栏共用）**（`SourceBlockView.tsx:1-11`）：三栏联动（D8）落点——`data-block-id` DOM 节点供定位；订阅 focus/规则定位双通道（ruleLocate 独立因 severity 不含蓝 `:7`）；锚点精度降级（page/document）显示「仅定位到此文件/页」角标。**语义色：红=申报冲突、黄=待处理、蓝=依据原文**（`:10`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SourceBlockView` | function（export） | `:56-219` | `({document, block, highlight?, anchorPrecision?, dense?})` |

内部：`HIGHLIGHT_CLASSES` 3 色（`:27-31`）、`HIGHLIGHT_DURATION_MS=2500`（`:34`）、`precisionLabel`（`:37-41`）、`hitAnchor`（**:221-231，块级精确匹配；缺 blockId 时按文档级命中且 precision 不得为 block**）。

## 3. 内部逻辑与关键流程

1. 命中派生（`:70-86`）：focus 四锚点（subject/evidence/counterpart/rule）依次匹配；ruleLocate anchors 匹配。
2. 触发（triggerKey 拼接 nonce 与命中位，**同块重复点击再闪** `:112-114`）：rAF 后 scrollIntoView 居中（`:130-132`）→闪高亮（**依据侧恒蓝，申报/证明侧按 severity 红/黄** `:119-124`）→精度角标（`:137-139`）→2.5s 清除（`:141-146`）；卸载兜底清定时器（`:160-164`）。
3. 图片块（`:95-110/:184-195`）：`getImagePreviewPath`+`registerPreviewPath` 缩略图；点击开 FilePreviewDialog 大图；失败 console.warn。
4. 外部 `highlight` 强制优先（`:166-167`）；heading/list-item/text 分渲染（`:182-206`）。

## 4. 调用者与调用链

入向：左栏规则全文/中栏原文行（dense 区分 `:52`）。出向：`@/atoms/review-atoms`、FilePreviewDialog、`window.reviewAPI/electronAPI`。

## 5. 数据 I/O、读写与副作用

读图片预览路径；滚动/高亮副作用。

## 6. 分支、失败、取消与恢复

无命中不高亮；图片加载失败留占位（`:191`）。不适用取消/恢复。

## 7. 权限与权威状态

不适用（渲染层）；精度降级如实标注（`:208`）。

## 8. 修改影响面

改渲染 → 三栏联动定位与高亮语义。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `SourceBlockView` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+4 内部+双通道联动 | 已证实 | 逐行读 `:1-231` |
| atoms 图片预览链 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+联动 | §2/§3 | `:56-231` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
