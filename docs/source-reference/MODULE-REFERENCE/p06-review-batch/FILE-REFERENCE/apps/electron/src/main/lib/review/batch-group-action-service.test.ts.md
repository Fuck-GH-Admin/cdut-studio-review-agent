---
path: apps/electron/src/main/lib/review/batch-group-action-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 58e49bac02338cd715fe83fe0781c24c1aa92d50
sha256: 966c8da16f2dcd350789fb84e7a6ab3365d09cee1f692b881a7415bdaae90d17
lines: 240
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/batch-group-action-service.test.ts

## 1. 测试目标

“B 阶段：人工集中处置预览与逐案 V2 事务”（describe `:86`）：双案预览确认持久化且同操作重放幂等；人工范围精确生效；缺来源案卷单独排除；预览后案卷变化拒整次提交；补件要素必填并走原单案补件事务；已发现不符合不允许组内直接通过；人工解除后才可最终通过且走既有事务；final-return 走决定服务写补件；他角色待办禁止 reviewer 代决；未确认/异载荷/非法范围不能写入。被测：`previewBatchGroupAction`/`applyBatchGroupAction`（`batch-group-action-service`）。

夹具：`PROFER_CONFIG_DIR` 仓库 `work/tmp/profer-bulk-action-<时间戳>`（`:12-14`）；模板 `batch-b-test@1`（单 review/reviewer 阶段，无政策）；`makeCase(status, source)`（`:30-64`）建聚合+真实 Run（`computeRunInputHash`、`rule-a`/`check-a`、`pendingChecks:1`）；`makeBatch` 标 done+绑定；`groupKey=JSON.stringify(['rule-a', status, '缺少证明'])`。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**10 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:87-103` | 双案 confirm-issue：`eligibleCount=2`、`applied=2/failed=0`、两案 `dispositions.at(-1)==='confirmed-issue'`；同输入重放 `toEqual(first)` 且 dispositions 各 1（幂等） |
| 2 | `:105-115` | 单案 escalate：`rows` 1、`applied=1`、另案 dispositions 0 |
| 3 | `:117-128` | 无来源案卷：`eligibleCount=1`、row reason 含“来源”、`applied=1/excluded=1`、无来源案 dispositions 0 |
| 4 | `:130-144` | 预览后 `submitCommand` 改案卷 → apply 拒“预览后…”，dispositions 0 |
| 5 | `:146-160` | request-supplement：`applied=1`、`stage:'awaiting-supplement'`、`supplements[0].requiredElements` 含“原始获奖等级证明”、`dispositions[0]==='supplement-requested'` |
| 6 | `:162-169` | 已发现不符合 → final-pass `eligibleCount=0`、reason 含“阻断” |
| 7 | `:171-190` | false-positive 解除后 final-pass：`eligibleCount=1`、`applied=1`、`stage:'decided'`、`decisions.at(-1)={result:'pass', actor.local}` |
| 8 | `:192-206` | final-return：`applied=1`、`decisions.at(-1).result==='return'`、`stage:'awaiting-supplement'`、要素含“原始获奖等级证明” |
| 9 | `:208-225` | 注入 teacher open 任务（`SeedTeacherTask`）→ `eligibleCount=0`、reason 含“其他角色” |
| 10 | `:227-239` | 未确认拒“确认”；同 operationId 异 reason 拒“不同载荷”；`caseIds:['foreign']` 预检不抛但 `eligibleCount=0` |

## 3. 真实断言

- #1 的重放断言 `toEqual(first)` + dispositions 长度不变——验证 `PersistedOp` 幂等回放。
- #3 断言排除语义（相似文本不代表证据可信，`test` 名 `:117`）。
- #7 断言 `actor.actorSource==='local'`（走 `decideWorkspaceCaseV2` 的 `local-batch-reviewer`）。
- #9 用 `submitCommand` 注入 teacher 任务后断言预检拒绝——与 `batch-automation-gates:65-66` 同语义。
- 请求构造器统一 reason“审核员核对材料和校验依据后人工认定”、补件要素“原始获奖等级证明”（`:83-84`）。

## 4. 未覆盖与脆弱点

**未覆盖**：`final-return` 的终末阶段/角色前置拒绝（`:130-135`）；“问题组已失效” throw；`REQUEST_ID_COLLISION`→conflict；中断恢复分支（`:185-196`）；要素数量/长度上限；escalate 的 `escalated` 处置值（#2 断言数量未断值）。

**脆弱点**：groupKey 依赖 `triageBatchCase` 的问题组口径（`['rule-a', status, '缺少证明']`）；文案断言（“来源”“阻断”“其他角色”“不同载荷”）；`pendingChecks:1` 的夹具形状决定分流。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、10 test、真实存储 | 已证实 | `:86`；`grep -c test(`=10 |
| 预检 advisory、写入走单案事务 | 已证实 | #1/#7 |
| 范围精确、排除显式 | 已证实 | #2/#3 |
| 颖览指纹守卫 | 已证实 | #4 |
| 补件/退回走原事务且带要素 | 已证实 | #5/#8 |
| 非符合不得直接通过、解除后才可 | 已证实 | #6/#7 |
| 他角色待办禁止代决 | 已证实 | #9 |
| 确认/载荷/范围守卫 | 已证实 | #10 |
| 中断恢复/终末阶段前置 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 预览+应用+幂等 | #1 | `:87-103` | covered |
| 范围/排除 | #2/#3 | `:105-128` | covered |
| previewHash 守卫 | #4 | `:130-144` | covered |
| request-supplement | #5 | `:146-160` | covered |
| final-pass 门槛 | #6/#7 | `:162-190` | covered |
| final-return | #8 | `:192-206` | covered |
| 他角色拒绝 | #9 | `:208-225` | covered |
| 确认/载荷/非法范围 | #10 | `:227-239` | covered |
| 中断恢复/前置拒绝分支 | — | — | unknown |
