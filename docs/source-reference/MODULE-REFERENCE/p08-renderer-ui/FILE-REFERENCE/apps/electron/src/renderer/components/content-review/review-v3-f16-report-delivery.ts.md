---
path: apps/electron/src/renderer/components/content-review/review-v3-f16-report-delivery.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 83b9bae45dc247cf9ee80906b4042363b0733666
sha256: 17343088832eaba642a73579a60ddeee51ef53ab202f39335132a0c978919567
lines: 128
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f16-report-delivery.ts

## 1. 结论与边界

**F16 只读交付**（`apps/electron/src/renderer/components/content-review/review-v3-f16-report-delivery.ts:1`）：冻结已投影报告的文件哈希；**不处理回件或学校回执（归 F18）**。清单 `notice`（`:97`）明示「不是数字签名、学校审批或离线业务回执」。

## 2. 导出与关键符号

`export` 共 **7 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F16DeliveryFile` | interface | `:4-7` | `{name, bytes}` |
| `F16DeliveryManifest` | interface | `:9-25` | 清单（`audienceAuthorized` 防伪装，`:15-16`） |
| `f16TextBytes` | 函数 | `:29-31` | 文本→bytes |
| `f16SafeSpreadsheetSheet` | 函数 | `:33-39` | **公式中和**（`=+@-` 开头加 `'` 前缀，`:37`） |
| `encodeF16ReportWorkbook` | 函数 | `:41-51` | async，XLSX 多 sheet |
| `makeF16DeliveryManifest` | 函数 | `:53-99` | async，清单生成（SHA-256） |
| `encodeF16ReportBundle` | 函数 | `:102-128` | async，ZIP 打包 |

## 3. 内部逻辑与关键流程

- **`makeF16DeliveryManifest`**（`:53-99`）：空文件拒（`:58`）；报告 JSON 投影与 `report.caseId/runId/status/audience/stale` **六项一致性校验**（`:65-70`，不一致抛「交接包报告与所选 Run/受众/快照不一致」）；文件名正则+去重（大小写不敏感）+保留名（manifest.json/readme.txt）拒（`:74-77`）；`crypto.subtle.digest SHA-256`（`:79-81`）；`audienceAuthorized: report.audienceGranted === true`（`:89`）。
- **`f16SafeSpreadsheetSheet`**（`:33-39`）：`/^[\s\u0000-\u001f]*[=+@-]/u` 命中加 `'`（防公式解释，`:34` 注释）。
- **`encodeF16ReportBundle`**（`:102-128`）：`report.md/report.json` 与投影**逐字节比对**（`:104-110`，不一致抛）；JSZip 打包+manifest+README（含「不构成业务审批」披露，`:117-126`）。

## 4. 调用者与调用链

- 消费方：F16 交接包入口。
- 出向：`review-v3-t08-case-report`（`t08ReportWorkbookSheets`）、`xlsx`/`jszip`（动态 import）。

## 5. 数据 I/O、读写与副作用

内存编码（XLSX/JSZip）；无磁盘写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 空文件 | `:58` | 抛 |
| 投影不一致 | `:65-70` | 抛 |
| 文件名非法/重复 | `:74-77` | 抛 |
| 报告正文不一致 | `:104-110` | 抛 |

## 7. 权限与权威状态

- `audienceAuthorized`（`:15-16`、`:89`）**防清单伪装授权**。
- notice/README 明示非签名/非审批（`:97`、`:124-125`）——只读交付边界。
- 公式中和（`:33-39`）防注入。

## 8. 修改影响面

- 六项一致性校验是清单权威；文件名正则与归档安全耦合。
- 公式中和正则（`=+@-`）改动影响注入面。

## 9. 测试证据

`review-v3-f16-report-delivery.test.ts`（86 行，5 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个导出、清单/公式中和/ZIP 链 | 已证实 | `:4-128` |
| 防伪装/非签名披露 | 已证实 | `:15-16`、`:97` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 7 个导出 | `:4-128` | covered |
| 清单一致性 | `:53-99` | covered |
| 公式中和 | `:33-39` | covered |
| ZIP 打包 | `:102-128` | covered |
