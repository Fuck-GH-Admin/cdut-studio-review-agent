---
path: apps/electron/src/main/lib/cslab/cslab-formats/header-data-separator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b17ce9f6f2f7c2085d43e70f12fb6f24caf7f59c
sha256: 2a1bc7e886656226afa31ec687b2baa17b384e6709626e08c896f238283376b5
lines: 195
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/header-data-separator.ts

## 1. 结论与边界

HeaderDataSeparator——科研仪器 **ASCII 导出的启发式表头/数据分离器**（`apps/electron/src/main/lib/cslab/cslab-formats/header-data-separator.ts:1-8`，移植自技术研报算法）：① 前 100 行按候选分隔符切分取列数方差最小者；② **3 行前瞻窗口**确认连续数值矩阵起始行；③ 起始行前提取 key:value 元数据、上一行提取列名与单位；④ 数值行遇无法解析行即停（机台尾部附加信息）。

边界：欧洲小数逗号归一（`1,05E-3`→`.`，不误伤分隔逗号，`:38-41`）；纯数字时间不拆键值（`:120`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TextDelimiter` | type | 10 | `','\|'\t'\|';'\|'\|'\|' '` | |
| `DelimitedParseResult` | interface | 16-22 | `{dataset; delimiter; dataStartRow; metadata; headers}` | |
| `isNumericRow` | function | 47-51 | 全 token 数值判定 | |
| `detectDelimiter` | function | 54-80 | 列数方差最小（平局取多列行数多者） | |
| `findDataStart` | function | 83-105 | 3 行前瞻（空行跳过不断链） | |
| `parseDelimitedText` | function | 118-178 | `(text, format='text') => DelimitedParseResult` | |

内部：`CANDIDATE_DELIMITERS`（5 种，`:12`）、`COMMENT_SENTINELS`（`#;///*`，`:13`）、`tokenize`（`:24-29`）、`normalizeNumericToken`/`isNumericToken`（`:32-45`）、`parsePreambleMetadata`（`:107-124`，`key[:=]value` 词法 ≤80 字符键）、`coerceHeaderTokens`（`:126-133`：列数须匹配且非全数值才认表头）、`headersExpectedStart`（`:180-182`）。

## 3. 内部逻辑与关键流程

`parseDelimitedText`（`:118-178`）：BOM 剥→分隔符检测→起始行（<0 抛「未检测到连续数值矩阵」）→表头行（上一行，列数匹配才认）→数值矩阵收集（列数不符/非数值即 break）→空矩阵抛「数值矩阵为空」→X=首列（单列时 Index）→Y 列 `splitLabelUnit` 拆单位→`buildDataset`。

## 4. 调用者与调用链

出向：`./types`（buildDataset/splitLabelUnit/ParsedDataset，`:9`）。入向（rg 全冻结树）：`cslab-iron-cage.ts:58`（parseDelimitedText，摄取中枢）、`cslab-formats.test.ts:6`、`cslab-formats/index.ts:7` 转发。产品入口：main（经 iron-cage）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯解析。

## 6. 分支、失败、取消与恢复

抛 `Error` 2 处（无矩阵/空矩阵）；数值行中断=受控停止（尾部附加信息语义）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；移植算法注释（`:2-7`）是方法权威口径。

## 8. 修改影响面

方差检测/前瞻窗口参数影响全部文本仪器导入；测试 `cslab-formats.test.ts`。

## 9. 测试证据

`apps/electron/src/main/lib/cslab/cslab-formats.test.ts`（本批，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 方差检测+3 行前瞻 | 已证实 | `:54-105` |
| 小数逗号归一不误伤 | 已证实 | `:38-41` |
| 表头两重校验（列数+非数值） | 已证实 | `:126-133` |
| 真实仪器导出覆盖 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | 10-178 | covered |
| 检测/定位/解析 | §3 | 24-178 | covered |
