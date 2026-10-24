---
path: apps/electron/src/main/lib/review/review-v3-t02-staged-visual-ocr.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a2d281296ad0b3cc4d1016203e8e28015e29115
sha256: b946768ddb8f949ac2ba6fe44f7d67d0082548f68a2cb26c5f549012e2e7e502
lines: 90
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t02-staged-visual-ocr.ts

## 1. 结论与边界

T02 对 B2 候选的**只读、物理范围 OCR**（文件头 `:1-5`）：扩展 staged 预览；不安装 DocumentVersion、不执行正式 Case/Run；Main 仍须派生 `B2MainContext`。调用方供能力（`OcrPort`），**绝不供文件系统路径或合成 actor**（`:40`）。异步 + 临时目录。

不做的事：不落盘持久文档；不做视觉核验结论（只出 OCR 文本+置信度）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T02StagedVisualText` | interface | `:17-24` | `{sourceBlockKey; text; page; confidence: number\|null; bbox?}`（bbox 仅整图/整页 OCR 时有，**PPTX 放置位置仍未知**，`:22`） |
| `T02StagedVisualOcrPreview` | interface | `:26-38` | staging-only/candidateOnly 标记 + `ocrEngine`、`ocrText[]`、inspected/awaiting 计数、warnings |
| `previewT02StagedVisualOcr` | function | `:41-90` | `(ctx, staging, candidateId, ocr: OcrPort, {maxPdfPages?, inspectPdfPages?})` |

## 3. 内部逻辑与关键流程

1. 授权断言 + 字节长度/sha256 核对（`T02_STAGED_BYTES_CHANGED`）（`:48-54`）。
2. 临时目录写 `source{ext}`；委托 `parseT02VisualMaterialWithOcr`（`review-v3-t02-visual-ocr`），role 映射 application/evidence、assetDirectory=临时根、`assetRelativePath` 固定形状、透传 `ocr` 与 options（`:55-65`）。
3. 再断言授权；`ocrText` 只取 `id.includes('-ocr-')` 且非空文本的块（`:67`），`sourceBlockKey = {documentVersionId}:ocr:{page}:{n}`、confidence 可空、bbox 透传。
4. 返回 preview（`ocrEngine=outcome.engine`、inspected/awaiting/warnings 透传）；finally 删临时目录（`:87-89`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：T02 视觉 OCR 预览链路；直接测试 `review-v3-t02-visual-material.test.ts`（经该链路）。出向：`ocr-port.OcrPort`、`review-v3-t02-visual-ocr.parseT02VisualMaterialWithOcr`、`review-intake-adapter-v3-b2`、`node:fs/promises/crypto`。

## 5. 数据 I/O、读写与副作用

读 staging 字节；临时目录写删（finally）；OCR 调用（能力由调用方供，可能联网/本地引擎——不在本模块）。无持久写。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 撤销/字节漂移 | `:48-54/:66` | throw |
| 解析/OCR 失败 | — | 随 `outcome.warnings` 如实 |
| 取消 | 无 | 无 AbortSignal；finally 清理 |

## 7. 权限与权威状态

授权首尾夹持；candidateOnly/checkpoint 诚实标记；`confidence:null` 如实（无置信度不编造）；bbox 不在整图/整页时缺失（不伪造坐标）。

## 8. 修改影响面

改块过滤/键形状 → 影响 T02 OCR 预览消费方；`parseT02VisualMaterialWithOcr` 契约联动 `review-v3-t02-visual-ocr`。

## 9. 测试证据

本轮 `NOT_RUN`。间接测试 `review-v3-t02-visual-material.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只读+staging-only+能力注入 | 已证实 | 文件头、`:40-65` |
| 字节漂移/授权拒绝 | 已证实 | `:48-54` |
| ocrText 过滤（-ocr- 且非空） | 已证实 | `:67` |
| bbox 缺失不伪造 | 已证实 | `:22/:72` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两接口 | 2 | `:17-38` | covered |
| `previewT02StagedVisualOcr` | 3 | `:41-90` | covered |
