---
path: packages/core/src/pdf-engine/ocr-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6fbe8356126c52c4ff309e5589b7a3f050590a90
sha256: f7c39b95933f328d06e6c7feeb215b3eb6e6234211f00ee055dcd35dc9ea1a4a
lines: 116
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/ocr-bridge.ts

## 1. 结论与边界

专用 OCR 信道**端口契约 + 桥接器**：纯位图/扫描区域交 OCR 端口识别后映射为排版节点（`ocr-bridge.ts:1-9`）。端口模式——不绑定具体 OCR 引擎；未注入/不可用时**如实返空数组，绝不伪造**（`:7-8`）。**预留未接线**：`bridgeVisualRegionToOcr`/`transformToNormalizedBBox` 全树无生产调用者（grep 全冻结树 `*.ts` 仅 index.ts 再导出，见 §10）；`PdfEngineOptions.enableOcrBridge` 在管道中无消费者（跨文件，pdf-engine.ts:155）。

## 2. 导出与关键符号

`export` 逐条核：5 个导出（4 接口 + 1 函数 + 1 函数=6 个导出对象：`PdfOcrBlock`、`PdfOcrResult`、`PdfOcrPort`、`OcrPageInfo`、`transformToNormalizedBBox`、`bridgeVisualRegionToOcr`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PdfOcrBlock` | 导出接口 | `:15` | text/rect{x,y,w,h}/confidence | OCR 字块（像素坐标） |
| `PdfOcrResult` | 导出接口 | `:21` | blocks/imageWidth/imageHeight | 识别结果 |
| `PdfOcrPort` | 导出接口 | `:28` | `available`/`unavailableReason?`/`recognize({imageBuffer,regionBBox,language?})` | 端口契约（可接 TesseractOcrPort 等，`:27`） |
| `OcrPageInfo` | 导出接口 | `:39` | pageNumber/width/height | 页面尺寸 |
| `transformToNormalizedBBox` | 导出函数 | `:46` | `(rect,regionBBox,imageWidth,imageHeight): NormalizedBBox` | 像素 rect→区域归一化，clamp01（`:60-61`） |
| `bridgeVisualRegionToOcr` | 导出函数 | `:72` | `(imageRegionBuffer,regionBBox,ocrPort?,pageInfo?): Promise<LayoutNode[]>` | 桥接主入口 |

## 3. 内部逻辑与关键流程

- `transformToNormalizedBBox`（`:46-62`）：按 region 宽高把像素坐标映射到归一化（`:52-59`）；宽高 0 防护 safeW/safeH（`:54-55`）；四值 clamp01。
- `bridgeVisualRegionToOcr`（`:72-116`）：无端口或 `available=false` → `[]`（`:78`）；`recognize` 抛错 → `console.warn` + `[]`（`:83-86`）；`language?` 形参存在但**桥接从不传**（`:82` 仅 imageBuffer/regionBBox，照实记录）；pageInfo 缺省 pageNumber=1、宽高=1（`:88-90`，pointBbox 退化为归一化值）；过滤空文本块（`:94`）；映射 `LayoutNode`（kind 'paragraph'、`isOcrRecognized:true`、confidence clamp0-1（`:110`）、id `ocr-blk-${Date.now().toString(36)}-${i}`（`:91,104`）、readingStreamId/readingOrderIndex 初值 0（`:111-112`））。

## 4. 调用者与调用链

- 入向：**无生产调用者**（否定结论，检索=全冻结树 `*.ts` grep `bridgeVisualRegionToOcr|transformToNormalizedBBox`，仅 `pdf-engine/index.ts:15` 再导出命中）。预留端口。
- 出向：类型 `./types`（`:12`）+ `@profer/shared`（`:11`）。
- 测试：无（检索=全树 `*.test.ts`，0 命中）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络；副作用仅 `console.warn`（`:84`）；`Date.now()` 用于 id 生成（`:91`）。

## 6. 分支、失败、取消与恢复

- 失败：`recognize` 异常被捕获→warn+空数组（`:83-86`），不向上传播。
- 取消/恢复：不适用，依据：无取消接口。

## 7. 权限与权威状态

无权限分支，依据：无 sender/路径检查（预留端口）。

## 8. 修改影响面

当前无消费方（预留态）；一旦接入管道，将成为 OCR 节点进入对齐/排序的入口；`PdfOcrPort` 与 review 目录的 `OcrPort`（`./ocr-port`）是**不同类型**，不得混引（QA 预读提示，已核实本文件类型名 `PdfOcrPort`，`review` 侧类型未深读=边界）。

## 9. 测试证据

`NOT_RUN`。直接/间接测试均无（检索范围如 §4）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 不可用→[]、失败→warn+[]、不伪造 | 已证实 | `:78,83-86` |
| `language?` 从不传 | 已证实 | `:82`（recognize 调用） |
| 全树无生产调用者（预留） | 已证实（否定结论） | grep 全冻结树 `*.ts` |
| 与 review/OcrPort 类型无关 | 推断（名称/包域不同）+边界 | review 侧未深读 |
| 接入后的识别质量 | 未知 | 未接线，NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | 15-77 | covered |
| 桥接流程 | §3 | 46-116 | covered |
| 预留未接线 | §4/§10 | — | covered（检索范围明示） |
