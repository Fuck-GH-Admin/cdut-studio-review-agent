---
path: apps/electron/src/main/lib/review/ocr-port.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 15e1205ff110727fd17d355a82c114a85e7ee8e7
sha256: ddbe49c327b5ce70dd3cbc2eb01072048203d30a3d4aad93aba5d5fe1e135cac
lines: 68
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/ocr-port.ts

## 1. 结论与边界

OCR 与原件预览端口（M2，头注释 :1-6）：定义契约 + Null 实现（如实声明不可用，业务走 unread 不冒充已读）。纯类型/端口模块；真实引擎（Tesseract 适配，见 `apps/electron/src/main/lib/review/tesseract-ocr-adapter.ts`）另行实现 `OcrPort`。

## 2. 导出与关键符号

导出 7 条（`export` 逐条核 :9/:16/:24/:34/:41/:50/:59）：

| 符号 | 类型 | 行 | 形状/说明 |
| --- | --- | --- | --- |
| `OcrBlock` | interface | `:9-14` | `{text, rect{x,y,w,h}, confidence}`（N2c：矩形+置信度） |
| `OcrRequest` | interface | `:16-22` | `{documentVersionId, pageAssetPath, language, signal?, timeoutMs?}` |
| `OcrResult` | interface | `:24-32` | `{engine, engineVersion, blocks, imageWidth, imageHeight}` |
| `OcrPort` | interface | `:34-38` | `{readonly available, readonly unavailableReason?, recognize(req)}` |
| `NullOcrPort` | class | `:41-47` | `available=false`，`unavailableReason='OCR 引擎未接入（N7 打包阶段提供 Tesseract.js 适配）'`；`recognize` 抛 `OCR 不可用: …`（:46） |
| `PreviewDescriptor` | interface | `:50-56` | `{documentVersionId, assetPath, mime, preview:'image'\|'needs-renderer', sizeBytes}` |
| `describePreview` | function | `:59-68` | image/* → `'image'`，其余 `'needs-renderer'`（A03：预览≠解析 :49 注释） |

## 3. 内部逻辑与关键流程

`describePreview`（:59-68）按 mime 前缀分流；`NullOcrPort` 恒不可用（构造即定）。无状态机、无异步逻辑（recognize 直接抛）。

## 4. 调用者与调用链

入向（全树检索+子agent交叉核）：
- `OcrPort`：`tesseract-ocr-adapter.ts:17`（implements :78）、`review-v3-t02-visual-ocr.ts:15`（:25/:124，`ocr.recognize` :126）、`review-v3-t02-staged-visual-ocr.ts:11`（:45）、`v2-executor-factory.ts:28`（:209/:289，`ocrPort.recognize` :231）；`system-tesseract-ocr-adapter.ts:79` `SystemTesseractOcrPort` 结构化满足（未写 implements）。
- `OcrBlock`：system-tesseract-ocr-adapter:12（:113/:120）、tesseract-ocr-adapter:17（:112）；`OcrRequest/OcrResult`：上述两适配器 + review-v3-t02-visual-ocr:101 + v2-executor-factory:205。
- `NullOcrPort`/`describePreview`：**仅测试** `coverage-ledger.test.ts:7`（:163/:169-170）；生产引用检索无命中。
出向：无 import（纯契约）。

## 5. 数据 I/O、读写与副作用

无（纯契约 + 空实现；`describePreview` 纯函数）。

## 6. 分支、失败、取消与恢复

`NullOcrPort.recognize` 恒抛（:46）；`describePreview` 二分支（:60）。不适用取消/恢复（依据：无异步状态）。

## 7. 权限与权威状态

无权限分支（依据：无 sender/role 字段）。权威语义：`available=false + unavailableReason` 是「不可用」的唯一合法表达（头注释 :4-6：调用方据此记 unread）。

## 8. 修改影响面

改契约影响 `v2-executor-factory.ts`（recognizeDocumentImages :209-283）与 `tesseract-ocr-adapter.ts`；`PreviewDescriptor` 消费方为原件预览链（preview-inspection 相关，未逐行读）。

## 9. 测试证据

无直接测试文件（`NullOcrPort`/`describePreview` 仅在 `coverage-ledger.test.ts:7`（批外）被断言使用，:163/:169-170）；间接：`tesseract-ocr-adapter.test.ts`（批内）经 `OcrPort` 契约。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 7 条；Null 恒不可用且 recognize 抛错 | 已证实 | :41-47 |
| describePreview 二分支 | 已证实 | :59-68 |
| NullOcrPort/describePreview 生产引用无命中（仅 coverage-ledger.test） | 已证实（否定） | 全树符号检索 |
| PreviewDescriptor 外部引用无命中 | 已证实（否定） | 全树符号检索 |
| 生产 OCR 注入链（run-async-service→SystemTesseractOcrPort） | 已证实（消费侧） | run-async-service.ts:49/:77/:113/:184 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 个接口 + NullOcrPort + describePreview | §2/§3 | :9-68 | covered |
| 测试断言 | §9 | — | unknown |
