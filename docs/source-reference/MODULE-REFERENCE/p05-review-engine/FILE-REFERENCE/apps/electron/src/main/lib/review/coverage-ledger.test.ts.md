---
path: apps/electron/src/main/lib/review/coverage-ledger.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b5b9fcc60c805b27c256ce3d05e145bf965a5608
sha256: 496c32e5614ba71b89b8815219264a0f8f17aedad7dbceef86695f135a816a0f
lines: 203
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/coverage-ledger.test.ts

## 1. 测试目标

覆盖账本（A08/K06 + G12）：材料账本（parse 失败/人工凭据）、检查账本（缺失记 not-executed、不任选、不共用、不折叠）、combineCoverage 全符合判定五类 blocker、组规则逐组展开。

## 2. 用例清单

22 用例 / 5 describe。夹具 `doc/rule/result`（:9-16，纯函数）+ `NullOcrPort/describePreview`（:7）。

| describe | # | 要点（行） |
| --- | --- | --- |
| 材料账本 | 3 | 混合状态全入账（19-27）；parse 失败 read→unread（29-38）；manualReadReceipt→read（40-52） |
| 检查账本 | 2 | 缺项 not-executed（56-62）；分项规则限定分项主体（64-71） |
| combineCoverage | 11 | 规则见 §3 |
| OCR 端口与预览 | 2 | NullOcrPort 拒绝（162-166）；describePreview 标注（168-171） |
| 组规则展开 | 4 | 见 §3 |

## 3. 真实断言

- 材料：`toHaveLength(3)`+原因含 `无文本层`（:25-26）；失败材料账目 `toEqual({status:'unread', reason:'自动解析失败；空占位块不代表读过原件。解析原因：文件无法解码'})` + `allClearVerdictAllowed` false（:31-37）；凭据材料 `status:'read'` + `审核员已核对原件：已逐页核对原件`（:46-51）。
- 检查：4 账目、`r2/s2` not-executed（:60-61）；分项账目 `toEqual([{ruleId:'r-study',targetKey:'s-study',status:'compliant'}])`（:70）。
- combine（11）：违规 completedChecks 1 但 allClear false（:77-78）；仅登记/空计划/全不适用 allClear false（:82-84）；blockers 含 `未完整读取`/`未执行`、pendingChecks 1（:90-92）；全清 true + `blockers []` + effectiveVerdicts 1（:98-100）；execution-failed completed 0/pending 1（:104-108）；案卷级结果 planned 2/completed 0/pending 2 + `无法与计划唯一对应`（:114-117）；一目标两结果 completed 0（:124-126）；重复 checkId 阻断（:132-133）；同名异政策 planned 2/completed 0（:139-141）；合法空发现 true、假结果 false（:147-150）；不适用无理由→not-executed、空主体 false（:156-157）。
- OCR：NullOcrPort `rejects.toThrow('OCR 不可用')`（:165）；`'image'`/`'needs-renderer'`（:169-170）。
- 组规则：3 账目、`g3` not-executed、`g1` compliant（:180-182）；无 groupBy 整作用域键 → not-executed（:187-188）；组级聚合 `toEqual([{ruleId:'r-group-real',targetKey:'group',status:'compliant'}])`（:195）；未执行组阻断 + `未执行`（:200-201）。

## 4. 未覆盖与脆弱点

- 未覆盖：sectionId 无映射分支、`unexpectedResults` 数值断言、`partially-read` 组合分支。
- 脆弱点：`hit` 夹具以 `as unknown as` 绕类型（:175-176）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 22 用例断言如 §3 | 已证实 | 本文件逐行 |
| fail-closed 语义被固定 | 已证实 | :82-157 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| buildDocumentLedger 三分支 | §3 | covered |
| reconcile 三类键/record 判定 | §3 | covered（经 combine） |
| combineCoverage 五类 blocker | §3 | covered |
| 组规则逐组展开（G12） | §3 | covered |
