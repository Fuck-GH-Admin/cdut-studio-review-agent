---
path: packages/core/src/pdf-engine/source-preserving-aligner.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f3bef9d779adcdee9935d713d3e01ebf500ba571
sha256: 748ffafc97f0f14110ca590a67701617dbfe51512928046c3141d335f37b4a77
lines: 152
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/source-preserving-aligner.ts

## 1. 结论与边界

Category D **源保持二部图对齐**：视觉候选框 × 原始字符流按 IoA/中心/基线容差贪心归属；框内字符严格保持原始字节流顺序，输出文本与 PDF 内嵌文本一致（无 OCR 式拼写幻觉，`source-preserving-aligner.ts:1-12`）。纯函数、无 I/O。

## 2. 导出与关键符号

`export` 逐条核：5 个导出（3 接口 + 2 函数——`AlignerBox`、`AlignmentGroup`、`AlignOptions`、`computeIoA`、`alignGlyphsToBoxes`、`unionBBox` 共 6 个导出对象）+ 3 内部函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AlignerBox` | 导出接口 | `:18` | `{id,bbox}` | 候选框 |
| `AlignmentGroup` | 导出接口 | `:24` | `{boxId,glyphs,text,bbox\|null}` | bbox 空框为 null（`:31`） |
| `AlignOptions` | 导出接口 | `:34` | `ioaThreshold?`（缺省 0.5）、`verticalTolerance?`（缺省 2） | `:35-38` |
| `computeIoA` | 导出函数 | `:59` | `(glyph,box): number` | 相交面积/glyph 面积，面积下限 1e-6（`:60`） |
| `alignGlyphsToBoxes` | 导出函数 | `:85` | `(glyphs,boxes,options?): AlignmentGroup[]` | 贪心归属主入口 |
| `unionBBox` | 导出函数 | `:139` | `(glyphs): PointBBox\|null` | 外接矩形（空→null，`:140`） |
| `intersectionArea`（内部） | 函数 | `:49` | 两框相交面积 | `:50-55` |
| `centerInBox`（内部） | 函数 | `:64` | 中心点判定 | `:65-67` |
| `withinBaselineTolerance`（内部） | 函数 | `:71` | 基线漂移吸附 | 水平在框内+垂直 ±tol（`:74-75`） |

## 3. 内部逻辑与关键流程

`alignGlyphsToBoxes`（`:85-136`）：
1. 每 box 预建空桶（`:93-94`）；
2. 逐 glyph 对逐 box 打分（`:100-120`）：`ioa>=0.5` → `ioa + (中心命中?0.5:0)`（`:106-108`）；否则中心命中 → 0.9（`:109-110`）；否则基线容差 → 0.3（`:111-113`）；其余 -∞；
3. 取最高分 box 入桶（`:116-119`）；**无任何命中（bestScore 仍 -∞）的 glyph 静默丢弃**（`:122-124`，照实记录）；
4. 输出按 **boxes 顺序**（`:127`），桶内保持 glyph 输入顺序（=原始字节流序，`:123` push 序），`text=join('')`（`:132`）、`bbox=unionBBox(glyphsInBox)` 空→null（`:133`）。

## 4. 调用者与调用链

- 入向：`pdf-engine.ts:56-59`（管道第 3 步；注意其实参只传 `{id,bbox}`）。
- 出向：类型 `./types`（`:15`）+ `@profer/shared` `PointBBox`（`:14`）。
- 测试：无直接单测（检索=全树 `*.test.ts`）；域外 `pdf-engine/__tests__/source-preserving-aligner.test.ts` 3 用例（归属+严格原始顺序/基线漂移吸附/框外不误归属，断言体未逐行核）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用；不改入参（`readonly`，`:86-87`）。

## 6. 分支、失败、取消与恢复

仅打分三分支（`:105-114`）与丢弃分支（`:122-124`）；无抛错、无取消。

## 7. 权限与权威状态

无权限分支，依据：纯函数。

## 8. 修改影响面

归属规则/阈值决定最终文本内容与块内顺序（源保持性质）；`pdf-engine` 的文本归一、表格字形分配均依赖本文件输出。丢弃语义改动会影响"框外字符"是否进入 AST。

## 9. 测试证据

`NOT_RUN`。直接测试：无。域外 3 用例（§4）。缺口：打分三档、`computeIoA` 1e-6 下限、空框 null 均无直接断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 打分三档、阈值缺省、输出顺序、桶内原始顺序 | 已证实 | `:85-136` 逐行 |
| 无命中 glyph 静默丢弃（不进任何组） | 已证实 | `:122-124` |
| 空组 bbox=null 由 pdf-engine 回退 box.bbox | 已证实（跨文件） | `aligner:133` + `pdf-engine.ts:71` |
| 源保持性质对真实 PDF 的成立性 | 推断 | 由实现顺序保证；端到端 NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 + 3 内部 | §2 | 18-152 | covered |
| 对齐流程/丢弃语义 | §3 | 85-136 | covered |
| 测试 | §9 | — | covered（缺口如实） |
