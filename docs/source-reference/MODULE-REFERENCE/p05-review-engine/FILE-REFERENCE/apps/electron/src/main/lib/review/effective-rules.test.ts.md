---
path: apps/electron/src/main/lib/review/effective-rules.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a86f3a56ed5ecd1f65bfc41d96bbfe3680945b2b
sha256: 990e96db7a2736a594f5071d0a3dcacf8608537f787268fc8a1ea40297d44c4b
lines: 100
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/effective-rules.test.ts

## 1. 测试目标

唯一有效规则集：workspace 全量保留、分项规则随模板版本、同 id 案卷覆盖+稳定排序、真实发布政策相反限额并存冲突待确认、坏 hash 拒绝。

## 2. 用例清单

4 用例 / 1 describe（`唯一有效规则集` :25）。`PROFER_CONFIG_DIR` 隔离（:9-10）；真实 `policy-store`（savePolicyDraft/publishPolicy）+ 真实 `buildDeterministicRuleChecks`（v2-executor-factory）。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 无政策也含全部 workspace 规则 | 27-31 |
| 2 | 分项规则生成与排序 | 33-50 |
| 3 | 合并覆盖+稳定排序 | 52-73 |
| 4 | 相反限额并存冲突+坏 hash 拒 | 75-99 |

## 3. 真实断言

- 1：`['w1','w2','w3']`、origin 全 `workspace`。
- 2：`[['section-service-hours','service','服务时长'],['section-study-credits','study','学分要求']]`（order 2>1 排序）、origin template 同模板版本、hash 长度 64。
- 3：`['shared','w3','p2']`、`shared.requirement==='案卷覆盖'`、`origin {kind:'workspace'}`、唯一 3 条、hash 64。
- 4：两政策同裸 id `R01` 相反限额（10/8）真实发布：`report.rules` 2、`conflicts` 1、全 `execution==='manual'`、conflict candidates `['policy-faculty-clause','policy-school-clause']`；`buildDeterministicRuleChecks` 2 条全 `awaiting-confirmation`；`contentHash:'untrusted-hash'` → `toThrow('F03_POLICY_REF_INVALID')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`F03_POLICY_HASH_MISMATCH`/`CONTENT_TAMPERED`/`PROVENANCE_INVALID`/`RULE_VERSION_MISMATCH` 四 throw 分支。
- 脆弱点：用例 4 依赖 `publishPolicy` 真实落盘；`as unknown as` 夹具。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 本文件逐行 |
| 异源同名并存+冲突待确认被固定 | 已证实 | 用例 4 |
| F03 其余 throw | 未知（未测） | §4 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| workspace 全量/分项生成/覆盖合并 | §3 | covered |
| 冲突并存+待确认 | §3 | covered |
| F03_REF_INVALID | §3 | covered |
| 其余 F03 throw | §4 | unknown（未测） |
