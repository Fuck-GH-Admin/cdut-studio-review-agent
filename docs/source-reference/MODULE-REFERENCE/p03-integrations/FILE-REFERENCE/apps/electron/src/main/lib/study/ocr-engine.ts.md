---
path: apps/electron/src/main/lib/study/ocr-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37043c68d0c3952bdc052446e4e582169fd26cad
sha256: dde041e92ee7c33e64d7ee22345aaf5e5884d3dac0a11f702a348eaf074f3301
lines: 219
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/ocr-engine.ts

## 1. 结论与边界

**图片 OCR→Markdown**（`apps/electron/src/main/lib/study/ocr-engine.ts`，219 行）：Tesseract（wasm 惰性加载）识别→行结构提取→Markdown 重建（标题识别/段落/包围盒合并）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `reconstructMarkdownFromLines` | 函数 | `:162-198` | `(lines: OcrLine[]) => string` |
| `ocrImageToMarkdown` | 函数 | `:199-219` | `(filePath: string) => Promise<string \| null>`（失败 null） |

内部：Tesseract 类型组（`:16-45`）、`loadTesseract`（`:48-65`，惰性加载，失败 null）、`OcrLine`（`:66-75`）、`extractLines`（`:77-128`，页数据→行）、`unionBBox`（`:129-140`）、`looksLikeHeading`（`:141-151`）、`median`（`:152-160`）。

## 3. 内部逻辑与关键流程

- `ocrImageToMarkdown`（`:199-219`）：`loadTesseract`（失败→null）→ `recognize(filePath)` → `extractLines`（`TesseractPageData`→`OcrLine[]`，含 bbox/字号中位数）→ `reconstructMarkdownFromLines`。
- `reconstructMarkdownFromLines`（`:162-198`）：按 `median` 字号/`looksLikeHeading` 判标题→`#` 语法；行合并为段落（`unionBBox` 合并包围盒）。

## 4. 调用者与调用链

消费方：study 文档索引（图片型文档）。出向：Tesseract（wasm）。

## 5. 数据 I/O、读写与副作用

读图片文件；Tesseract wasm 加载；无网络（本地 wasm）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| Tesseract 加载失败 | `:48-65`、`:199-219` | `null` |
| 识别失败 | `:199-219` | `null`（不抛） |

## 7. 权限与权威状态

无身份语义；OCR 结果为导入侧证据（质量取决于图像）。

## 8. 修改影响面

- `looksLikeHeading`/`median` 启发式影响 Markdown 结构。
- Tesseract wasm 版本耦合。

## 9. 测试证据

无专属测试（全树检索 `ocrImageToMarkdown` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、失败返 null | 已证实 | `:162-219` |
| 行提取/标题启发式 | 已证实 | `:77-160` |
| 实际识别质量 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:162-219` | covered |
| Tesseract 加载 | `:16-65` | covered |
| 行提取/重建 | `:66-198` | covered |
