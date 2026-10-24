---
path: apps/electron/src/renderer/components/content-review/review-v3-t06-batch-intake.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9ad41fa949db9bde51c647d5a9bd2f00382887c3
sha256: d94ff1b398d4f8020bb781ac62b149fe86986208a378d1040c62f80e14661bc9
lines: 157
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t06-batch-intake.ts

## 1. 结论与边界

**T06 批次清单解析与映射预览**（`:1-4` 注释）：**纯客户端预览**——映射只产出已有案卷 ID，**绝不做材料上传或 CaseAggregate 写入**。红线：**不从姓名/文件名推断身份**（`:78`）；**仅精确 caseId 可自动绑定，冲突/重复须解决或排除后才可提交**（`:111-113`）。

## 2. 导出与关键符号（8 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BatchManifestRow`/`BatchManifestParse`/`BatchAssignment`/`BatchManifestCandidate` | interface（export） | `:5-29` | 行/解析/映射结果（状态 5 种 `:22`） |
| `parseBatchManifest` | function（export） | `:79-105` | CSV/TSV 解析（§3） |
| `previewBatchAssignment` | function（export） | `:115-141` | 映射预览（§3） |
| `csvCell` | function（export） | `:144-148` | **公式注入防护**（`^[=+\-@]` 前置 `'` `:146`）+引号转义 |
| `buildBatchSummaryCsv` | function（export） | `:150-157` | 汇总 CSV（9 列） |

内部：`HEADERS`（5 列中英别名表 `:31-37`）、`parseDelimited`（引号状态机，未闭合引号报错 `:43-76`）、`sameApplicant`（空白折叠+小写比较 `:107-109`）。

## 3. 内部逻辑与关键流程

1. 解析（`:79-105`）：BOM/换行归一（`:52`）；分隔符探测（tsv 后缀/首行 tab `:80-81`）；表头别名归一匹配；**全部列未识别→报错要求表头**（`:93-95`）；行号记录。
2. 映射（`:115-141`）：排除行（excluded）优先（`:123`）；人工覆盖显式（`:124-125`）；案卷不存在/缺 ID→unassigned（**:128，模板版本不匹配同样拒**）；**申报人不一致→name-conflict 人工确认**（`:130-132`）；精确/人工→ready（`:134`）；**同案卷多行→duplicate**（`:136-140`）。

## 4. 调用者与调用链

入向：`ReviewV3T06BatchIntakePreview`（nb-86 手册）、`review-v3-t06-physical-manifest`（同批）。出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

五状态映射（§3）；解析错误前置返回。不适用。

## 7. 权限与权威状态

红线：零写入（`:3`）、不推断身份（`:78`）、仅精确自动绑定（`:111`）、公式注入防护（`:146`）。

## 8. 修改影响面

- 改解析状态机/表头别名 → 清单导入兼容面。
- 改映射状态判定（name-conflict/duplicate/unassigned）→ 提交门槛与人工确认流。
- 改 `csvCell` 注入防护 → 汇总导出安全面。
- 改 `sameApplicant` 比较口径 → 身份冲突提示灵敏度。
- 测试锁定（同批 32 行测试）：见测试手册。

## 9. 测试证据

**直接测试 `review-v3-t06-batch-intake.test.ts`（同批，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出+解析/映射全链 | 已证实 | 逐行读 `:1-157` |
| 测试断言 | 已证实 | 同批测试；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2/§3 | `:5-157` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
