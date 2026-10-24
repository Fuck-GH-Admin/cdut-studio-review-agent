---
path: packages/benchmark-multihop/src/report.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3bb501bea4a33c5231742ad8aa3f902d06129013
sha256: 8abc0878fd0be3c5215d486bf39e57d019f25511f1a0616b4b876282eb7522cf
lines: 269
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/report.ts

## 1. 结论与边界

评测**报告生成器**（纯函数，无 I/O）：Markdown（可读报告）/JSON（全量）/CSV（逐题明细）三种格式（`packages/benchmark-multihop/src/report.ts:1-5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `renderMarkdownReport` | 导出函数 | 44-145 | `(report): string` | 五节报告 |
| `renderJsonReport` | 导出函数 | 148-150 | `(report): string` | `JSON.stringify(…,null,2)` |
| `renderCsvReport` | 导出函数 | 160-213 | `(report): string` | 19 列逐题明细 |
| `ReportBundle` | 导出接口 | 216-220 | `{markdown, json, csv}` | |
| `buildReportBundle` | 导出函数 | 223-229 | `(report): ReportBundle` | 一次三格式 |
| `ReportHighlight` | 导出接口 | 232-248 | 引擎摘要 15 字段 | 看板消费 |
| `extractHighlights` | 导出函数 | 251-269 | `(report): ReportHighlight[]` | 提取摘要 |

内部：`pct`（`:10-12`，2 位百分比）、`fixed`（`:15-17`，4 位小数）、`typeBreakdown`（`:20-41`，按题型聚合）、`csvCell`（`:153-157`，引号/逗号/换行转义 `""`）。

## 3. 内部逻辑与关键流程

- Markdown（`:44-145`）五节：①聚合指标总览表（13 列，null 拒答率 `nullQueries>0` 否则 `N/A`，`:60`）；②分题型指标（typeBreakdown，跳过 null 题，`:25`）；③Null Query 拒答评估（含数据自校准口径三行注释，`:104-106`）；④金标证据解析审计（含「解析成功率接近 100% 才可与官方基线比较」警示，`:119-120`；未解析样例折叠 `<details>` ≤20，`:121-128`）；⑤指标口径说明（含「Recall 单独看可被多召回刷高」警示，`:137`）。
- CSV（`:160-213`）：`csvCell` 转义；null 字段空串、recall/coverage `toFixed(4)`、布尔转 1/0、keys 用 `|` 连接（`:191-205`）。
- `extractHighlights`（`:251-269`）：EngineSummary 直映射 15 字段。

## 4. 调用者与调用链

入向：`packages/benchmark-multihop/src/server.ts:19`（`buildReportBundle`/`extractHighlights`；POST `/api/export`:182-198——body `{report,format}`；GET `/api/report/export` 不存在（QA F-NB41-06 校正））。出向：`./types`（`:7`）。

## 5. 数据 I/O、读写与副作用

无（纯字符串生成）。

## 6. 分支、失败、取消与恢复

无 throw；空报告/空 engines 生成空表（防御隐含）；不适用取消恢复。

## 7. 权限与权威状态

无权限分支；报告中口径警示文字（`:70/:104-106/:119-120/:137`）是对外结论的边界声明。

## 8. 修改影响面

改格式影响 server 的 POST `/api/export` 导出端点与前端看板（`ReportHighlight` 契约）；Markdown 中文文案被最终用户阅读。

## 9. 测试证据

无专属测试（冻结树 glob `**/report*test*` 本包零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出+三格式细节+转义 | 已证实 | `:10-269` |
| 警示文案与 N/A 分支 | 已证实 | `:60/:70/:104-106/:119-120/:137` |
| 运行/渲染结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 7 导出+3 内部工具 | §2/§3 | 10-269 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
