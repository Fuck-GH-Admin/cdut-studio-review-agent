---
path: apps/electron/src/main/lib/review/review-v3-report-snapshot.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5dd832e02c677d511ef69d637b2474dab92d58dd
sha256: 16bd042842bb182b155c87a29893b607b219f3c012eb7831e32359041733658b
lines: 139
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-report-snapshot.test.ts

## 1. 测试目标

验证 `review-v3-report-snapshot.ts` 四组语义：RUN-02 Run 选择、RUN-21 裁定 supersedes 的 Run 作用域、RUN-31/UI-15 受众授权、ASSET-10 归档代次 + 快照指纹。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 12（`test(` :26/:34/:44/:51/:63/:79/:89/:97/:104/:109/:120/:133），4 describe（:25/:62/:96/:119）。fixture 工厂：`run/decision/adjudication`（:11-23，`as unknown as` 最小对象）。

| # | 用例（行） | 断言要点 |
| --- | --- | --- |
| 1 | 决定优先（:26） | `run.id==='run-old'`、`basis==='decision'`、`historical===false`（:30-32） |
| 2 | 显式历史（:34） | run-old、`historical===true`、`basis==='explicit'`（:38-40） |
| 3 | 决定引用缺失（:44） | `run===null`、reason 含 `run-gone`（:47-48） |
| 4 | 时间+id 确定性（:51） | 双向数组顺序均选 `run-b`、basis latest（:56-58） |
| 5 | 跨 Run supersedes 不删（:63） | run-1 报告 current 仅 adj-run1/excludedOtherRun 1；run-2 报告 current adj-run2/supersededInRun 0（:68-77） |
| 6 | 同 Run 内生效（:79） | current adj-new、supersededInRun 1（:83-86） |
| 7 | inputHash 不一致排除（:89） | current 0（:92） |
| 8 | 无 actor 降级（:97） | audience student/granted false/reason 含「降级」（:99-101） |
| 9 | agent/mock 降级（:104） | 两者 audience 均 student（:105-106） |
| 10 | 角色晋级（:109） | reviewer→organizer 不授予（student/false）；organizer→organizer 授予（:110-116） |
| 11 | 归档代次（:120） | archiveCycle 2、restoredAt、恢复前/后判定 true/false（:126-131） |
| 12 | 指纹敏感性（:133） | 稳定；audience/json 变化即不同（:135-137） |

## 3. 真实断言

- `:30-32`：`expect(selection.run?.id).toBe('run-old')`、`expect(selection.basis).toBe('decision')`、`expect(selection.historical).toBe(false)`。
- `:38-40`：run-old / true / 'explicit'。
- `:47-48`：`toBeNull()`、`toContain('run-gone')`。
- `:56-58`：`first.run?.id==='run-b'`、`second.run?.id===first.run?.id`、`first.basis==='latest'`。
- `:68-77`：`current.map(id)` toEqual、`excludedOtherRun`/`supersededInRun` 计数断言。
- `:83-86`：`['adj-new']`、`supersededInRun===1`。
- `:92`：`toHaveLength(0)`。
- `:99-101`：`toBe('student')`/`toBe(false)`/`toContain('降级')`。
- `:105-106`：agent/mock `audience==='student')`。
- `:110-116`：reviewerAsOrganizer student/false；organizer 'organizer'/true。
- `:126-131`：`archiveCycle===2`、`restoredAt` 值、`isDecisionPreRestore` true/false。
- `:135-137`：指纹相等/不等三断言。

## 4. 未覆盖与脆弱点

- 未覆盖：`reportAudienceOptions`（无用例）、`latestReportDecision` 空数组、`isDecisionPreRestore` 无 restoredAt 分支、reason 文案全文。
- 脆弱点：fixture `as unknown as` 断言；`:105-106` 只断言 audience 未断 granted；日期字符串比较（`isDecisionPreRestore` 用 `<=` 字典序）未测非 ISO 输入。
- mock 边界：纯函数直调，无 mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例计数与 `test(` 一致 | 已证实 | :26-133 |
| 断言行如 §3 | 已证实 | 逐行读 :28-137 |
| 四组语义均被断言 | 已证实 | #1-#12 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| `resolveReportRun` 三分支 | #1-#4 | covered |
| `resolveReportAdjudications` | #5-#7 | covered |
| `resolveReportAudience` 四分支 | #8-#10 | covered |
| `resolveReportCaseCycle`/`isDecisionPreRestore`/`reportSnapshotDigest` | #11-#12 | covered |
| `reportAudienceOptions`/空 decisions | — | unknown |
