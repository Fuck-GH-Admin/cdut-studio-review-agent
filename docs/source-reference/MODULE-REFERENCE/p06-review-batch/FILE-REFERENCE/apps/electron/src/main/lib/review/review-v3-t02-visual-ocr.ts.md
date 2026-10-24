---
path: apps/electron/src/main/lib/review/review-v3-t02-visual-ocr.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3b695ef84a50a1b7908d0e9c512019e17fa902de
sha256: 99ceb545d7a15d20aada47ff785e0c676f66fcd833ecba89334b86d4c6933110
lines: 256
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t02-visual-ocr.ts

## 1. 结论与边界

T02：对物理栅格原件、PPTX 图片、PDF 页面栅格的**可选真实 OCR 富化**（文件头 `:1-8`）：产出**源锚定的 OCR 假设**，绝不产出人工确认结论、不写新 Case/Run。Main 侧领域适配器：路径来自可信 source loader，不接受渲染层任意路径。**无 OCR 可执行/资源 → 覆盖降级 + 显式 warning**（不冒充已读）。异步 + 子进程 + 临时目录。

不做的事：不做确认结论（`source.parseStatus` 保持 partial 到审核员核验，`:138`）；不把 Office 嵌入图的图内矩形冒充幻灯片坐标（`:96-98`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T02OcrInput` | interface | `:18-31` | `{filePath（Main 核验路径，`:19`）; fileName; role; assetRelativePath?; assetDirectory?; ocr: OcrPort; inspectPdfPages?（显式跳过页渲染；默认全页检查含混排/扫描，`:26-28`）; maxPdfPages?（显式工作上界，余页报 partial，`:29`）}` |
| `T02OcrOutcome` | interface | `:33-40` | `{source; ocrBlocks; inspectedImages; imagesAwaitingInspection; warnings; engine: string\|null}` |
| `parseT02VisualMaterialWithOcr` | function | `:140-256` | 主入口 |

内部：`execute`（`:42-65`，spawn 子进程，120s 超时 SIGTERM、非 0/不可用带 stderr 截断报错）；`rasterizePdfPages`（`:68-94`，Poppler `pdfinfo`+`pdftoppm`（1800px PNG）；pdfinfo 失败仍可渲染、总页数报 unknown）；`ocrBlocksForImage`（`:100-120`，仅非空文本出块；**bbox 仅整页画布时可定位**，clamp 0-1；PPTX 图保留 image link 不伪造 bbox）；`readImage`（`:122-133`，`ocr.recognize` 语言 chi_sim+eng、60s 超时）。

## 3. 内部逻辑与关键流程

`parseT02VisualMaterialWithOcr`：

1. `parseFileIntoSourceDocument` 复用既有纯文本解析（`:141-144`）。
2. **PDF 栅格化**（`:156-191`）：需 `assetDirectory+assetRelativePath`（否则 warning“未登记临时页为正式来源”）；maxPages=clamp(1..100, 默认 24)；总页数未知/超界分别 warning，**省略页计入 imagesAwaitingInspection**（“不显示误导性的 0 待检”，`:167-169`）；每页 hash 命名落 assetDirectory（`t02-pdf-page-N-{hash12}.png`）+ image 块（imageAlt“真实渲染，尚需视觉核验”）；渲染失败 warning 不中断。
3. **物理路径解析**（`:194-207`）：assetDirectory 同相对目录的 imageAssetPath → 真实路径；独立图片格式（png/jpg/jpeg/gif/bmp/webp）→ 整个 filePath。
4. **逐图 OCR**（`:209-234`）：无物理路径或 `ocr.available===false` → awaiting++；`fullPageImage` = 独立图片或 PDF 页栅格（Office 嵌入图不是）；无可靠文字/异常 → awaiting++ + warning“需视觉核验/OCR 未完成”。
5. **收尾**（`:235-248`）：OCR 不可用 warning（unavailableReason）；有图或 warning 时 `parseStatus='partial'`、parseError 追加“OCR 已生成 N 个待人工确认的原件文字块”+warnings（“OCR 不是自动批准”，`:240`）；finally 清理临时根。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`review-v3-t02-staged-visual-ocr`（`:15`）等 T02 视觉链路；直接测试 `review-v3-t02-visual-material.test.ts`。出向：`ocr-port.OcrPort`、`document-service.parseFileIntoSourceDocument`、`node:child_process`（pdfinfo/pdftoppm，**不随包、按存在降级**）、`node:fs/promises/crypto`。

## 5. 数据 I/O、读写与副作用

- 读原件+写 assetDirectory（PDF 页栅格）+临时目录（渲染页，finally 清）。
- 子进程：pdfinfo/pdftoppm（Poppler，15s/120s 超时）；OCR 走 `OcrPort` 能力。
- 无网络（除 OCR 端口自身）/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| Poppler/pdfinfo 不可用 | `:79-81/:188-190` | 覆盖降级+warning（error 作为覆盖不丢弃，`:67`） |
| OCR 不可用 | `:211-213/:235-237` | awaiting++ + warning |
| OCR 无可靠文字/异常 | `:225-233` | awaiting++ + warning |
| 超时 | `:54-57/:130` | SIGTERM/拒绝 |
| 取消 | 无 | 无 AbortSignal；finally 清理 |

## 7. 权限与权威状态

- OCR=假设非结论（文件头、`:138`）；`parseStatus` 保持 partial 至人工核验；bbox 仅整页画布（不伪造 PPTX 幻灯片坐标）；省略页如实计待检；无引擎不冒充已读。

## 8. 修改影响面

改块/资产命名 → 影响 T02 OCR 预览与后续视觉核验锚点；`OcrPort`/`parseFileIntoSourceDocument` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t02-visual-material.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| OCR 假设非结论、partial 保持 | 已证实 | 文件头、`:138/:240-247` |
| 无引擎/无 Poppler 如实降级 | 已证实 | `:67-81/:211-237` |
| bbox 仅整页、PPTX 不伪造 | 已证实 | `:96-118/:216-219` |
| 省略页计待检 | 已证实 | `:165-170` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `T02OcrInput/Outcome` | 2 | `:18-40` | covered |
| `execute`/`rasterizePdfPages` | 2 | `:42-94` | covered |
| `ocrBlocksForImage`/`readImage` | 2 | `:100-133` | covered |
| `parseT02VisualMaterialWithOcr` | 3 | `:140-256` | covered |
