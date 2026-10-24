---
path: apps/electron/src/main/lib/review/review-v3-f06-evidence.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc3ff43de10581e66f1b26cebfdc0c08a394748d
sha256: a95322869e1a280f47fc5ca78841d8c644f302e872748d117387d5ca053dcbd9
lines: 117
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f06-evidence.test.ts

## 1. 测试目标

F06 证明归属与多对多读模型（describe :47）：12 图全量可见、同名主体歧义标记、来源当前性四态、同内容不折叠、建议只认真实来源、拒绝不复活、手动绑定去重与阻止条件。

## 2. 用例清单

6 用例 / 1 describe。夹具：`document/source/link` 帮手 + `fixture()`（:7-45）：15 文档（12 photo + notice/notice-copy 同哈希 + old-scan 退役）、5 链接（candidate-a/b 同 fact 异主体、notice-one/photo-two confirmed、old-evidence 带过期 blockRef）、3 主体（**student-101/102 同名「张同学」**）。纯函数，无 I/O/mock。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 12 图一张不漏、未绑定继续显示 | 48-53 |
| 2 | 同名共享合影独立候选/一证多项/多证一事 | 55-63 |
| 3 | 当前性四态（retired/stale/missing） | 65-72 |
| 4 | 同内容提醒不折叠不删除 | 74-80 |
| 5 | 真实来源才建议；不复活拒绝 | 82-99 |
| 6 | 手动绑定去重；旧版/陌生主体阻止 | 101-116 |

## 3. 真实断言

- 1：groups 15、photo 12、`photo-12.unassigned===true`（:50-52）。
- 2：photo-1 links 主体 `['student-101','student-102']`、`currentConfirmedCount===0`、`ambiguousSubjectIds===['student-101','student-102']`、`获奖等级` 命中 2 组（:58-62）。
- 3：`f06LinkValidity` `retired`/`stale-source`/`missing-document` 三态（:67-70）；old-scan `currentConfirmedCount===0`（:71）。
- 4：`notice.sameContentVersionIds===['notice-copy']` 与反向（:77-78）；`notice-one` 仍 `confirmed`（:79）。
- 5：suggestions 仅 `['student-103']` 且 sourceRef `toEqual` 原 ref（:92-93）；preview errors 含 `'已有人工拒绝的同一绑定；须先单独复核旧记录，不可静默复活'`、`subjectIdsToCreate===['student-103']`（:97-98）。
- 6：preview `errors` 空、`existing` 2、`subjectIdsToCreate===['student-103']`（:107-109）；旧原件预检 errors 含 `'旧原件已退役，不能新增当前绑定'` 与 `'目标主体已变化，请重新选择'`（:113-114）；`describeF06Location(file)==='仅文件级定位'`（:115）。

## 4. 未覆盖与脆弱点

- 未覆盖：`describeF06Location` 4 种位置文案、跨案 sourceRef 单独拒绝（用例 5 混合排除）、`stale-source` 的 caseId 分支。
- 脆弱点：`fixture()` 以 `as unknown as CaseAggregateV2` 绕类型；同名歧义断言依赖 title 相同。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §3 | 已证实 | 本文件逐行 |
| 不推断/不复活/不折叠三不变量被固定 | 已证实 | 用例 2/4/5 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| projectF06Evidence 全量/歧义/同内容/未绑定 | §3 | 50-79 | covered |
| f06LinkValidity 三态 | §3 | 67-71 | covered |
| 建议过滤+preview 防复活/去重/阻止 | §3 | 92-114 | covered |
| describeF06Location 5 文案 | §4 | 115 | partial（1/5） |
