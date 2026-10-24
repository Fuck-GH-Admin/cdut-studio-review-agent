---
path: apps/electron/src/renderer/components/content-review/review-v3-t08-case-report.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d9bbf6c34496d8b0b1a81b12d8913f5899c25ec2
sha256: d42ae2050090d40e736a9a92511757b35598a18c1a462b9db3f11242041f1eaa
lines: 147
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t08-case-report.test.ts

## 1. 测试目标

`review-v3-t08-case-report.ts` 的受众投影/脱敏/历史/评分快照/恢复代次（JDG-12、F16、ASSET-10、RUN-31）。被测逻辑见同组手册。

## 2. 用例清单

**5 个 `test()`**：学生版公开键值非占位符非内部字段（`:5-44`）、**F16 学生版不泄内部检查理由/来源引文/完整 manifest**（`:46-83`）、历史报告省可变当前事项+拒错案卷（`:85-98`）、JDG-12 无快照声明不含评分矩阵（`:100-125`）、ASSET-10/RUN-31 恢复代次+未授权如实提示（`:127-147`）。

## 3. 真实断言（代表性）

- `:38-43` 学生版 `publicNote：申请完成`、无 `[object Object]`、无 '内部核验说明'、json 无 `internalNote`；审核版含内部字段。
- `:72-82` 学生版 markdown+json+workbook **8 个秘密词全不出现**；含 '申请.pdf'/'hash-visible'；workbook 有「原件版本」；审核版含 internal-observation/内部证据原文/内部暗号。
- `:94-97` 历史报告无「新补写的数据」（json/markdown/workbook 均无「事项字段」表）；run.caseId='b' → `toThrow('不属于当前案卷')`。
- `:113/:122-124` 无快照→声明文案；frozen 快照→批次/轮次/revision/总分 91.25/名次 1 全出。
- `:142-146` archiveCycle 1、「最近恢复于」「恢复前决定，仅作历史展示」「未经 Main 授权」全出。

## 4. 未覆盖与脆弱点

未覆盖：`resolveT08Source` 五态、`t08AssistantContext`。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 逐行读 `:1-147` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 受众脱敏/历史/快照/代次 | 5 | covered |
| 来源解析/助手上下文 | — | unknown |
