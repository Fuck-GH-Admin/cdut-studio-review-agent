---
path: apps/electron/src/renderer/components/content-review/ReviewV3T02VisualOcrPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 63cd7a6b9d88f33652fcd04a130c3db44898c592
sha256: e414cdaa62cfdec5b357b3b47698749f71948cba10b2d6e7543d2eae6d6b5493
lines: 55
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T02VisualOcrPanel.tsx

## 1. 结论与边界

**T02 来源限定 OCR 证据面板**（`ReviewV3T02VisualOcrPanel.tsx:1-4` 注释）：**只读、无伪造确认/审批**；签名候选读取与持久化由 Main/L 负责。页面明示「候选材料预览，不是已确认的事实、正式 DocumentVersion 或业务审核决定；所有 OCR 字句需结合原图核验」（`:21-22`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T02VisualOcrPanel` | function（export） | `:8-55` | `({result: T02StagedVisualOcrPreview})` |

内部：`visible`（useState 30 起、增量 +50 `:11/:49`）。

## 3. 内部逻辑与关键流程

头部：识别引擎（缺省「不可用」`:16`）/已获取图像数/待识别数（`:17-18`）；warnings 列表（`:24-28`）；OCR 正文：空→「没有可供人工核对的 OCR 文字」（`:30`）；否则分页列表（page/sourceBlockKey/置信度（null→「未知」，否则百分比 `:37`）/bbox 百分比四值 `:38-40`）；「再显示 N 条」按钮（`:47-52`）。

## 4. 调用者与调用链

入向：T02 原件核验流程（跨文件）。出向：`../../../main/lib/review/review-v3-t02-staged-visual-ocr`（类型 `:6`）、react。

## 5. 数据 I/O、读写与副作用

纯渲染；分页仅本地 state。

## 6. 分支、失败、取消与恢复

空文本/警告/分页三分支。不适用。

## 7. 权限与权威状态

红线：只读不伪造确认（`:1-3`）；候选预览定位明示（`:21-22`）。

## 8. 修改影响面

改面板 → T02 OCR 人工核对 UX 与事实边界文案。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T02VisualOcrPanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+三分支+只读语义 | 已证实 | 逐行读 `:1-55` |
| OCR 引擎数据源 | 未知 | Main/L 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:8-55` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
