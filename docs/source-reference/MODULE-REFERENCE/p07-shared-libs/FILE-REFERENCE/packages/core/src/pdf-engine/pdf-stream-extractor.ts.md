---
path: packages/core/src/pdf-engine/pdf-stream-extractor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e04962bac9bf6fb85428d3b989e5b22364ba83b
sha256: f193f019445ae7058f101910a2f9471be5675bb7b82f662ed44545a50531e9c3
lines: 319
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/pdf-stream-extractor.ts

## 1. 结论与边界

基于 `pdfjs-dist` 的**字符流与矢量指令提取器**：PDF 字节 → 页面级几何图元（逐字符绝对坐标框 + 矢量线段）（`pdf-stream-extractor.ts:1-14`）。Category D 源保持对齐的原材料来源——文本从原始字符流反查，不经 OCR 二次生成。**诚实声明成立**（已证实）：pdfjs `getTextContent` 不暴露 Tr 渲染模式/填充透明度，`toGlyphs` 硬编码 `renderingMode:0`/`colorAlpha:1`（`pdf-stream-extractor.ts:11-13,136-137`）。边界：`pdfjs-dist` 运行时行为未深读（NOT_RUN）。

## 2. 导出与关键符号

`export` 逐条核：2 个导出（1 接口 + 1 函数）+ 6 个内部符号。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ExtractGeometryOptions` | 导出接口 | `pdf-stream-extractor.ts:244` | `{maxPages?: number}` | 提取选项 |
| `extractPdfGeometry` | 导出函数 | `pdf-stream-extractor.ts:255` | `(buffer: Uint8Array \| ArrayBuffer, options?): Promise<PdfGeometryExtractResult>` | 整份提取入口 |
| `PdfJsTextItem`/`PdfJsPage`/`PdfJsDocument`/`PdfJsModule`（内部） | 接口 | `:19,:28,:36,:42` | pdfjs 最小结构声明 | 避免绑定版本类型 |
| `isPdfJsTextItem`（内部） | 函数 | `:53` | 类型守卫 | 仅收 str+transform 数组项 |
| `loadPdfJs`（内部） | 函数 | `:65` | `(): Promise<PdfJsModule>` | 非字面量 specifier 动态 import |
| `estimateCharWidthWeight`（内部） | 函数 | `:79` | `(char): 1\|2` | CJK/全角 8 段区间→2，其余→1 |
| `toGlyphs`（内部） | 函数 | `:97` | 文本项→逐字符图元 | 宽度按权重比例分配 |
| `transformPoint`（内部） | 函数 | `:146` | 用户空间→设备空间 | |
| `extractVectorLines`（内部） | 函数 | `:152` | 绘制指令→线段（失败返 []） | 增强项 |

## 3. 内部逻辑与关键流程

- `loadPdfJs`（`:65-73`）：specifier `'pdfjs-dist/legacy/build/pdf.mjs'` 存变量防打包器静态解析（`:66-68`）；缺 `getDocument` 抛 `pdfjs-dist 加载失败：缺少 getDocument 接口`（`:69-71`）。
- `estimateCharWidthWeight`（`:79-94`）：8 个 Unicode 区间（谚文 Jamo/CJK 部首标点假名注音/谚文音节/CJK 兼容表意/CJK 兼容形式/全角 ASCII/全角符号/CJK 扩展 B+，`:82-89`）→2，其余 1。
- `toGlyphs`（`:97-143`）：`Util.transform(viewportTransform,item.transform)`（`:105`）；`fontHeight=hypot(tx[2],tx[3])||item.height||0`（`:106`）；`bbox=[charLeft,top,charRight,baseline]`（`:126`）；宽度按 `weights` 比例分摊 `totalWidth`（`:115-117`）；`isOutOfCanvas = charRight<0 || baseline<0 || charLeft>W || top>H`（`:138-139`）；`renderingMode:0`/`colorAlpha:1` 恒定（`:136-137`）。
- `extractVectorLines`（`:152-242`）：**try/catch 全包，任何失败返 `[]` 不阻塞主流程**（`:238-241`）；`OPS.rectangle` 展四边（`:176-192`）+ `OPS.constructPath`（moveTo/lineTo/rectangle/curveTo/curveTo2/curveTo3/closePath，`:194-234`）；`pushSegment` 长度<2 丢弃（`:164`）、水平/垂直判据 `max(1,|d|*0.02)`（`:165-166`）、非横竖丢弃（`:167`）、`thickness` 恒 1（`:168`）。
- `extractPdfGeometry`（`:255-319`）：Uint8Array 视图归一（Buffer 子类告警规避，`:261-264`）；`getDocument({data, disableFontFace:true, isEvalSupported:false, useWorkerFetch:false})`（`:266-271`）；`limit=min(maxPages,numPages)` 或全量（`:275-277`）；页宽/高校验序 viewport → `page.view`(cropBox∩mediaBox) → 默认 612/792（`:282-298`）；文本项经 `isPdfJsTextItem` 过滤（`:302`）；矢量线逐页提取（`:305`）；返回 `{pages, pageCount: pdf.numPages, extractMs}`（`:315`）；**`finally await pdf.destroy()`**（`:316-318`）。

## 4. 调用者与调用链

- 入向：`pdf-engine.ts:155`（管道第 1 步）；`apps/electron/src/main/lib/cslab/cslab-literature-index.ts:111` 直接调用（`maxPages: 300`，grep 全树证据）。
- 出向：运行时动态 import `pdfjs-dist/legacy/build/pdf.mjs`（`:67-68`）；类型自 `./types`（`:16`）。
- 测试：无直接单测（检索范围=全树 `*.test.ts`）；`pdf-engine/__tests__/pdf-engine.test.ts` 端到端间接覆盖（域外）。

## 5. 数据 I/O、读写与副作用

无磁盘写；**网络/worker 行为归 pdfjs**（`useWorkerFetch:false` 显式关闭 worker 拉取，`:270`）。读入参 buffer；副作用：动态 import 模块加载、`pdf.destroy()` 资源释放、无全局状态。

## 6. 分支、失败、取消与恢复

- 失败：`loadPdfJs` 抛错（`:70`）→ 由 `parsePdfDocument` 上抛给调用方回退；`extractVectorLines` 内部吞异常返 `[]`（增强项，`:238-241`）。
- 资源恢复：`finally pdf.destroy()` 保证文档句柄释放（`:316-318`）。
- 取消：不适用，依据：无 AbortSignal/取消接口。
- **截断语义**：`maxPages` 截断时 `pages.length ≤ limit` 但 `pageCount` 恒为 `pdf.numPages` 全量页数（`:315`）——消费方按 pageCount 展示会与实际解析页数不一致（照实记录）。

## 7. 权限与权威状态

无权限分支，依据：输入为调用方给定字节，无路径/身份检查。

## 8. 修改影响面

影响 `pdf-engine` 管道与 `cslab-literature-index` 的原始图元质量；`estimateCharWidthWeight` 直接决定中英混排切分精度；`renderingMode/colorAlpha` 恒定值决定 TrapDoc 检查 1/3 现状不可触发（见 trapdoc-guard 手册）。

## 9. 测试证据

`NOT_RUN`。直接测试：无。间接（域外）：`pdf-engine/__tests__/pdf-engine.test.ts`（1 用例端到端）。未覆盖：`toGlyphs` 权重分配、`extractVectorLines` 各算子分支、页尺寸三档回退。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 诚实声明成立（renderingMode/colorAlpha 硬编码 0/1） | 已证实 | `:11-13,136-137` |
| 矢量提取 try/catch → [] 不阻塞 | 已证实 | `:152-242,238-241` |
| `pageCount` 全量 vs pages 截断 | 已证实 | `:275-277,315` |
| finally destroy | 已证实 | `:316-318` |
| pdfjs 真实解析行为/性能 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 + 6 内部 | §2/§3 | 19-319 | covered |
| 失败/恢复/截断语义 | §6 | — | covered |
| 测试缺口 | §9 | — | covered（如实） |
