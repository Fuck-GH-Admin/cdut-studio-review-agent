---
path: packages/core/src/office-engine/office-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c0bcc4b82ca0a361a591eb47fcf6f77535783df
sha256: c203bbd47f8ed67e6f9af93daeda3f3834d00b4865bdef013d6dc9e1ffb081bf
lines: 409
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/office-engine.test.ts

## 1. 测试目标

`@profer/core/office-engine` 双平面解析引擎（`packages/core/src/office-engine/office-engine.test.ts:1-8`）：DOCX（样式继承/GDI 分行分页/OMML→LaTeX/跨页表格/虚拟表头）、PPTX（嵌套 p:grpSp 仿射拍平/p:timing 动画序/p:cxnSp→Mermaid/演讲者备注）、XLSX（SST/日期序列/合并单元格/稀疏切分/公式标注/twoCellAnchor 图表坐标）。被测 `parseOfficeBuffer`/`stripOfficeTopologyAnchors`/`officeAstToSharedLayoutAst`（`./index.ts`）。

夹具：**内存构造真实 OOXML ZIP**（`buildTestZip` `:19-105` + 自实现 `crc32` `:107-115`，deflateRaw 压缩+中央目录+EOCD 全手工拼装——零外部依赖可复现）。mock 边界：ZIP/XML 全为真实字节构造，无假解析器。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 117-172 | DOCX：样式继承+OMML→LaTeX+分页+锚点 | format docx、pageCount 2、p1-b1 heading level 1、cleanMarkdown 含 `\frac{G M}{r^{2}}`、p2-b1 level 2（**继承样式**）、锚点注释 p1-b1/p2-b2、GFM 表行、剥锚无残留+标题保留、sharedAst 转换 pageCount 2 | 独立 |
| 2 | 174-243 | PPTX：仿射拍平+动画序+Mermaid+备注 | format pptx、960×540、嵌套组内 Node A bbox≈(100/960,150/540)（EMU→pt 归一化）、cleanMarkdown 含 ```mermaid+`S11["震源激发"] --> S12["检波器接收"]`、演讲者备注文本 | 独立 |
| 3 | 245-290 | XLSX：SST+合并+公式+twoCellAnchor+sheet/cell 锚 | format xlsx、sheetName「实验数据汇总」、2 块、cellRef 'A1:B3'、锚点含 `sheet="…"`/`cell="A1:B3"`、`B3=AVERAGE(B2:B2)`、图表说明块 | 独立 |

## 3. 真实断言

（逐条见 §2；关键锚）：`:173-198`（相对 140 起算）DOCX 13 断言——含 OMML 分式 LaTeX、继承样式 headingLevel 2、双锚点注释、剥锚无 `<!-- anchor:`；`:303-322` PPTX 仿射数值 `toBeCloseTo(100/960, 2)`、Mermaid 边、备注；`:390-408` XLSX sheet/cell 锚、公式、图表说明。

## 4. 未覆盖与脆弱点

- 三用例均为最小合成 OOXML（真实 Office 变体/宏/损坏容错未测）。
- `buildTestZip` 只产 deflate(8)（store(0) 路径未测）。
- DOCX「跨页表格切分与虚拟表头克隆」（头注）在断言中仅表格行文本锚（虚拟表头克隆无显式断言——照实记录）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、自构造 ZIP 夹具 | 已证实 | `:19-115` |
| 三格式端到端断言 | 已证实 | §2/§3 |
| 虚拟表头克隆无显式断言 | 已证实（照实记录） | 头注 vs 断言核对 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| DOCX 解析+序列化+剥锚+shared 转换 | §2/§3 | 1 | covered |
| PPTX 仿射/时序/Mermaid/备注 | §2/§3 | 2 | covered |
| XLSX SST/合并/公式/图表 | §2/§3 | 3 | covered |
| store 压缩/损坏容错 | §4 | — | unknown |
