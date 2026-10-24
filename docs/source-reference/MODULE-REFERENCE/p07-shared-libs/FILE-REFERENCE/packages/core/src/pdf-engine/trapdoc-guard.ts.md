---
path: packages/core/src/pdf-engine/trapdoc-guard.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ca31625610961180672744726b937453447a8c59
sha256: d72ce2f486127bb8412ddaf153377d0d63cfe0fdd57447f6205ad77baccf5655
lines: 113
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/trapdoc-guard.ts

## 1. 结论与边界

TrapDoc「隐形文本注入」防御门禁：在下游消费前对字符图元执行 **5 项硬性熔断检查**（`trapdoc-guard.ts:1-8`）。纯函数文件，无 I/O。设计原则"宁可少留，正常可见字符 0 丢失"（`:7`）。

## 2. 导出与关键符号

`export` 逐条核：3 个导出（1 常量 + 2 接口 + 1 函数——合计 4 个导出语句对象：`TRAPDOC_THRESHOLDS`、`TrapDocFilterOptions`、`TrapDocFilterResult`、`filterGhostGlyphs`）+ 2 内部函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TRAPDOC_THRESHOLDS` | 导出常量 | `:16` | `{minSize:0.1, minAlpha:0.01, invisibleRenderingMode:3}` | 阈值集中管理（`as const`，`:23`） |
| `TrapDocFilterOptions` | 导出接口 | `:25` | `{pageWidth,pageHeight}` | 页面可视尺寸（Points） |
| `TrapDocFilterResult` | 导出接口 | `:32` | `{glyphs,filteredCount}` | 结果 |
| `filterGhostGlyphs` | 导出函数 | `:61` | `(glyphs: readonly PdfGlyphItem[], options): TrapDocFilterResult` | 5 项熔断 |
| `INVISIBLE_CHAR_PATTERN`（内部） | 常量 | `:13` | 零宽/BOM/C0 控制符正则 | **保留 `\t\n\r`**（`\u0009\u000A\u000D` 不在类中） |
| `isFullyOutOfViewport`（内部） | 函数 | `:40` | 完全出视口判定 | `x1<0\|\|y1<0\|\|x0>W\|\|y0>H`（`:42`） |
| `sanitizeChar`（内部） | 函数 | `:46` | 清理不可见字符，空→null | `:47-48` |

## 3. 内部逻辑与关键流程

`filterGhostGlyphs`（`:61-113`）逐 glyph 顺序熔断（命中即 `filteredCount+=1` 并跳过）：
1. `renderingMode === 3` 丢弃（`:70-73`）；
2. `isOutOfCanvas || isFullyOutOfViewport` 丢弃（`:76-79`）；
3. `colorAlpha <= 0.01` 丢弃（`:82-85`）；
4. 零尺寸（fontSize/width/height ≤ 0.1）**仅对非空白字符生效**：`char.trim().length===0` 的空格/薄空格/字距字符豁免（`:87-99`）；
5. `sanitizeChar` 清零宽/控制字符，清理后为空丢弃，否则仅在字符被清理时复制对象（`:101-109`）。

输入只读（`readonly`，`:62`）；返回新数组 + 计数。

## 4. 调用者与调用链

- 入向：`pdf-engine.ts:40-43`（管道第 1 步，唯一生产调用）。
- 出向：仅 `./types`（`:10`）。
- 测试（域外，断言体未逐行核）：`pdf-engine/__tests__/trapdoc-guard.test.ts` 3 用例（5 类幽灵 100% 滤除且正常 0 丢失/内嵌不可见字符清理但字符保留/视口外整枚丢弃）。本批 scope 内无直接测试。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用、无全局状态（纯计算，已证实）。

## 6. 分支、失败、取消与恢复

仅 5 个 early-continue 分支（§3）；无异常路径、无抛错、无取消。

## 7. 权限与权威状态

无权限分支，依据：纯函数。

## 8. 修改影响面

阈值/检查序改动直接影响 `pdf-engine` 全部解析结果的 `trappedTokensFiltered` 计数与存活字形；检查 1/3 依赖上游填 `renderingMode`/`colorAlpha` 真实值——当前提取器恒 0/1（见 §10）。

## 9. 测试证据

`NOT_RUN`。本批 scope 内直接测试：无。域外 `__tests__/trapdoc-guard.test.ts` 3 用例（名称见 §4，不在本批 scope，不得写成"已验证通过"）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 项熔断顺序、阈值、空白豁免、清理复制优化 | 已证实 | `:61-113` 逐行 |
| **检查 1/3 现状不可触发**（renderingMode 恒 0、colorAlpha 恒 1） | 已证实 | 本文件判定 + `pdf-stream-extractor.ts:136-137` 硬编码（跨文件核对）；仅当未来提取器填回真实值才生效 |
| 正则保留 \t\n\r | 已证实 | `:13` 字符类 |
| 端到端对真实 TrapDoc 样本的效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 + 3 内部 | §2 | 13-64 | covered |
| 5 项熔断 | §3 | 68-110 | covered |
| 触发现状/测试边界 | §8/§10 | — | covered |
