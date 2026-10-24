---
path: apps/electron/src/main/lib/review/business-workflow.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f924b2ce617f8119e335c2e602cb3df99fa2744f
sha256: 9dc22633d92de7bb1e0c7e5c1790678e09708865f51fee30606824d0f8fc996c
lines: 125
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/business-workflow.test.ts

## 1. 测试目标

业务闭环状态机单测（文件头 `:1-3`，M4，A09/A10）：决定追加式、补件回复≠满足、申诉关联决定、并发冲突（VERSION_CONFLICT）。被测：`business-workflow` 全部 6 个函数。纯内存（`freshState()` 造 WorkflowState，teacher actor）。本轮 `NOT_RUN`。

## 2. 用例清单

3 describe、**9 test**：

### 2.1 recordDecision（A09，4，`:27-62`）
1. `:28-38` 通过决定：decisions 1 条、`stage==='decided'`、`revision===2`、`basedOnRevision===1`（基于决定前版本）。
2. `:40-47` 二次更正：两条决定并存（追加不覆盖）。
3. `:49-52` 空理由/空 basedOnRunId → 均 `ok===false`（AI 建议不是决定）。
4. `:54-61` `expectedRevision:99` → `code==='VERSION_CONFLICT'` 且 `currentRevision===1`。

### 2.2 补件（A09，3，`:64-102`）
5. `:65-75` 退回决定后开补件：`stage==='awaiting-supplement'`、`status==='open'`。
6. `:77-88` 回复仅 `responded`（回复≠满足）；`resolveSupplement satisfied` 后 `stage==='reviewing'`。
7. `:90-101` 取消无理由拒绝、带理由成功；已关闭再回复拒绝。

### 2.3 申诉（A10，2，`:104-125`）
8. `:105-119` 关联既有决定申诉 → `submitted`；`upheld` 后 `stage==='awaiting-review'` 且**原决定 `result` 仍 'reject'**（不改写）。
9. `:121-124` 关联不存在决定（'ghost'）→ `ok===false`（A10）。

## 3. 真实断言

- #1 精确断言 `basedOnRevision===1`（注释“基于决定前版本”）。
- #4 断言 `currentRevision` 字段携带当前版。
- #8 的 `decisions[0].result==='reject'` 是“申诉不改写原判”的直接反证。
- 夹具全内存 `WorkflowState`，无 mock 框架。

## 4. 未覆盖与脆弱点

**未覆盖**：`openSupplementRequest` 缺 reason/要素拒绝；`resolveSupplement` insufficient 分支；`resolveAppeal` overturned/withdrawn、已关闭拒绝、reviewDecisionId 记录；`respondSupplement` 缺材料与说明拒绝。

**脆弱点**：`freshState().revision` 固定 1，与各函数 CAS 期望耦合；`resolveSupplement('satisfied')` 推 revision 而 respond 不推的差异未被直接断言。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 describe、9 test、纯内存 | 已证实 | `:27/:64/:104`；`grep -c test(`=9 |
| 追加式+阶段推进+basedOnRevision | 已证实 | `:28-38` |
| AI≠决定（理由/依据必备） | 已证实 | `:49-52` |
| VERSION_CONFLICT 携带当前版 | 已证实 | `:54-61` |
| 回复≠满足 | 已证实 | `:77-88` |
| 申诉不改写原判 | 已证实 | `:105-119` |
| 其余拒绝分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `recordDecision` 正常/追加/拒绝/CAS | #1-#4 | `:28-61` | covered |
| `openSupplementRequest` | #5 | `:65-75` | covered |
| `respondSupplement` | #6/#7 | `:77-101` | covered |
| `resolveSupplement` | #6/#7 | `:85-101` | covered |
| `submitAppeal`/`resolveAppeal` | #8/#9 | `:105-124` | covered |
