---
path: packages/core/src/pdf-engine/native-segmenter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 91c4dd95e5a05083318c6ba509ec679d7f6ff363
sha256: b0b7dc33a6cc3863abbfa7d00f66a362af9c64ef4aee36a273d994a6f8ad81e9
lines: 323
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/native-segmenter.ts

## 1. 结论与边界

**纯 TS 确定性几何分段器**（无 ONNX 模型时的保底）：字符图元 → 文本行 → 行内片段 → 段落块 + 保守表格探测，产出候选几何框+类别初判（`native-segmenter.ts:1-9`）。最终文本由 Category D 对齐器从原始字符流反查（源保持）。纯函数、无 I/O。

## 2. 导出与关键符号

`export` 逐条核：3 个导出（1 接口 + 2 函数）+ 内部 8 个符号。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SegmentPageInput` | 导出接口 | `:15` | glyphs/vectorLines/pageWidth/pageHeight/pageNumber | **`vectorLines` 在本文件完全未用**（见 §10） |
| `inferBodyFontSize` | 导出函数 | `:39` | `(glyphs): number` | 字号直方图众数（`Math.round`，`:43`）；fontSize≤0 忽略（`:42`）；空集默认 10（`:46`） |
| `segmentPageIntoBoxes` | 导出函数 | `:272` | `(input: SegmentPageInput): LayoutCandidateBox[]` | 分段主入口 |
| `Fragment`/`TextLine`/`BlockDraft`（内部） | 接口 | `:24,:31,:165` | 行内片段/文本行/块草稿 | |
| `bboxOf`（内部） | 函数 | `:57` | 外接矩形 | |
| `buildLines`（内部） | 函数 | `:72` | 字符→行+片段 | 容差 `max(body*0.5,1)`（`:73`）、间隙 `max(body*1.6,3)`（`:74`） |
| `xOverlapRatio`（内部） | 函数 | `:117` | X 重叠比例（较窄者） | `:118-121` |
| `detectTableRegions`（内部） | 函数 | `:128` | 保守表区探测 | 纯启发式（见 §3/§10） |
| `startsNewParagraph`/`groupFragmentsIntoBlocks`/`classifyBlock`/`fragmentText`（内部） | 函数 | `:191,:208,:243,:180` | 段落合并与分类 | |

常量（内部）：`MAX_BLOCK_CHARS=1000`（`:171`）、`PARAGRAPH_INDENT_PT=8`（`:173`）、`SENTENCE_END_PATTERN`（`:175`）、`SHORT_LINE_CHARS=24`（`:177`）。

## 3. 内部逻辑与关键流程

- `buildLines`（`:72-114`）：按行中心 y 排序（容差内再按 x，`:76-81`）→ 行聚类（中心移动平均，`:90`）→ 行内按 x 排序（`:99`）→ 间隙 `> fragmentGap` 切片段（`:104`）。
- `detectTableRegions`（`:128-162`）：连续 ≥2 行、每行 **≥3 片段**（`:136,146`）、行间距 ≤ `fragmentGap*1.5`（`:147`）成表区。**注释（`:124-127`）称"以矢量横线为主锚（三线表）…回落"与实现不符**：函数不消费矢量线，纯片段行启发式（照实记录，§10）。
- `startsNewParagraph`（`:191-205`）：①行距 > 0.8×lineHeight（`:194`）②下一行右缩进 ≥8pt（`:196`）④块 glyph 数 ≥1000（`:200`）③上行句末标点+下行 ≤24 glyph（`:202-203`）。**注释编号 1/2/3/4（`:186-189`）与代码检查序 1/2/4/3 不一致**（照实记录）；`MAX_BLOCK_CHARS` 注释称"字符数"（`:170,189`），实际计 `block.glyphs.length`（图元数，`:200`）。
- `groupFragmentsIntoBlocks`（`:208-240`）：纵向窗口 `[-lineHeight, 1.5*lineHeight]`（`:219-220`）、X 重叠 ≥0.5（`:221`）、段落边界阻断（`:223`）。
- `classifyBlock`（`:243-267`）：title=大字号(≥1.25×body，`:252`)+第 1 页（`:257`）+居中 ±6%（`:255`）+宽>30% 页宽（`:257`）；section-heading=大字号或 `looksLikeSectionHeading`（`:260`）；list-item=项目符号/编号正则（`:263`）；否则 paragraph。
- `segmentPageIntoBoxes`（`:272-323`）：空 glyphs→[]（`:274`）；`lineHeight=max(body*1.4,2)`（`:278`）；表区先出（id `p{n}-tbl{i}`、kindHint 'table'、fontSize=body，`:290-298`）；剩余片段剔除表区字形后合并（`:301-304`）；块 id `p{n}-b{i}`、fontSize=块内 max 回退 body（`:312`）、kindHint 由 `classifyBlock`（`:316`）。**`detectTableRegions(lines, lineHeight)` 实参 lineHeight 而形参名 fragmentGap（`:281` 对 `:130`）——实际阈值=1.5×lineHeight**（照实记录）。

## 4. 调用者与调用链

- 入向：`pdf-engine.ts:46-52`（管道第 2 步）。
- 出向：`looksLikeSectionHeading` 自 `./max-regret-router`（`:13`，分类用）；类型 `./types`（`:12`）+ `@profer/shared`（`:11`）。
- 测试：无直接单测（检索范围=全树 `*.test.ts`）；域外 `pdf-engine/__tests__/pdf-engine.test.ts` 间接。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用、无状态（纯计算）。输出新对象，不改入参。

## 6. 分支、失败、取消与恢复

全部为 early-return/过滤分支（§3）；无抛错路径、无取消。

## 7. 权限与权威状态

无权限分支，依据：纯函数。

## 8. 修改影响面

行/段/表区判据与阈值直接影响候选框集合，进而影响对齐与阅读顺序全部下游；`classifyBlock` 的 kindHint 由 enricher 二次校正（`types.ts:69` 注释），但 title/list-item 初判错误会残留到最终 kind（enricher 行为域外=边界）。

## 9. 测试证据

`NOT_RUN`。直接测试：无。域外 `pdf-engine/__tests__/` 无 segmenter 专项文件；`pdf-engine.test.ts` 端到端间接。缺口：`buildLines` 容差、表区启发式、段落 4 判据、分类 4 分支均无直接断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §3 全部阈值/分支/ID 规则 | 已证实 | `:39-323` 逐行 |
| `vectorLines` 入参全文件未用；注释"矢量横线为主锚"与实现不符 | 已证实（矛盾存在） | `:273` 仅解构 glyphs/pageNumber；`detectTableRegions` 无矢量消费（`grep vectorLines native-segmenter.ts` 仅 `:17` 类型与 `:12` import） |
| `detectTableRegions(lines, lineHeight)` 实参/形参名不一致，阈值=1.5×lineHeight | 已证实 | `:281` vs `:130,147` |
| startsNewParagraph 注释序号与代码序不一致；MAX_BLOCK_CHARS 实为 glyph 数 | 已证实（矛盾存在） | `:186-189` vs `:193-203`; `:170,189` vs `:200` |
| 表区启发式对真实三线表的召回/精度 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 + 8 内部 + 4 常量 | §2 | 15-205 | covered |
| 分段全流程 | §3 | 272-323 | covered |
| 3 处注释≠实现 | §10 | — | covered（照实记录） |
| 测试 | §9 | — | covered（缺口如实） |
