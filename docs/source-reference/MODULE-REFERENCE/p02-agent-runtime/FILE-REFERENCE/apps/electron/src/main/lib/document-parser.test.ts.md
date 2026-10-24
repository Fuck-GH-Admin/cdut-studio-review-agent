---
path: apps/electron/src/main/lib/document-parser.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fa85fc15113039915a83d95ed1ce18033c323f17
sha256: 5b730aaa4c059a03682c9a4ffc5467fd4247b8c5d3b4ad8447fe52eaa2f0d5e9
lines: 237
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/document-parser.test.ts

## 1. 测试目标

扩展名识别 + 真实提取：JSZip 现造最小合法 OOXML（注释 :13-15「按内容嗅探类型…扩展名变体也能解析」）验证审核结构化（DOCX 标题/加粗/表格、XLSX/XLS 坐标）与宏/模板/放映变体路由、RTF 元数据不泄漏。

## 2. 用例清单

13 用例 / 2 describe。夹具 `buildDocx/buildXlsx`（:17-67，JSZip 手工 OOXML）；真 SheetJS 造 .xls（biff8）；beforeAll mkdtemp。

| describe | # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- | --- |
| 扩展名识别 | 2 | WPS/Office 导出全支持 | 87-105 | `.wps/.xls/.et/.docm/…/.rtf/.pdf` 全 true |
| | | 大小写不敏感 | 107-111 | `.WPS/.PDF` true |
| 真实提取 | 11 | DOCX 审核块 | 115-128 | heading/`**Important rule**`/表格坐标 [0,1] |
| | | 内置 Title 样式 | 130-138 | heading+warnings 空 |
| | | XLSX 坐标+前导零 | 140-148 | `{sheet:'Sheet1',row:3,column:2,text:'00123'}` |
| | | 旧 XLS SheetJS | 150-158 | 综测分项坐标块 |
| | | .docm 提取 | 163-168 | `Hello macro document` |
| | | .xlsm 内容嗅探 | 173-178 | `SpreadsheetCellValue` |
| | | .ppsx 不卡白名单 | 182-187 | `Slideshow body text` |
| | | RTF 提取 | 190-204 | 正文两段、`Riched20`/`generator` 不泄漏 |
| | | RTF 多忽略分组嵌套 `\*` | 206-220 | 正文全留、`Acme`/`Bob`/`listtemplateid` 不泄漏 |

## 3. 真实断言

如 §2 表（逐条读自 :87-220）。

## 4. 未覆盖与脆弱点

- 未覆盖：PDF 引擎路径（属 @profer/core 他批）、WPS 失败指引分支。
- 脆弱点：手工 OOXML 与 office-engine 解析契约耦合（注释 :14-15 明示目的）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例断言如 §2 | 已证实 | 本文件逐行 |
| 内容嗅探/RTF 不泄漏被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 扩展名白名单 | §2 | covered |
| DOCX/XLSX/XLS 结构化 | §2 | covered |
| 宏/模板/放映变体路由 | §2 | covered |
| RTF skip 语义 | §2 | covered |
