---
path: apps/electron/src/main/lib/review/review-v3-t09-offline-codec.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 966d5d309d78be36477b7de0943feb5d094be6c6
sha256: 000876aa4ce9e5d911450ee33815aff015d661d51a60ae5f3f8293e26385d0fe
lines: 68
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-offline-codec.test.ts

## 1. 测试目标

“T09 independent offline package”（describe `:20`）：学生任务→独立副本文件→附件→回复→预览→应用全链且重放 duplicate；评委独立评分强制锁定分配/有限分值/NA 规则；篡改载荷不得静默导入。被测：`review-v3-t09-offline-codec` 的 `issueT09Task/answerT09Task/packT09Asset/writeT09File/readT09File/previewT09Reply/importT09Reply`。纯内存（lookup/apply 注入 mock Map/计数）。

## 2. 用例清单

1 describe、**3 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:21-42` | 学生链：`issueT09Task`→`writeT09File/readT09File` 独立副本往返→`packT09Asset`（真实字节）→`answerT09Task`→预览 `ready`→`importT09Reply` `accepted`（apply 计数 1）→同包再导（state revision 4）`duplicate` 且 `applications` 仍 1 |
| 2 | `:44-59` | 评委：2 维度（d1 不可 NA/d2 可 NA）；合法分（4 + N/A）预览 `ready`；state revision 5 → `conflict`；分配 recused → `conflict`；NaN 分值 → `answerT09Task` throw |
| 3 | `:61-67` | 篡改 note（tampered）：`readT09File(JSON.stringify(altered))` throw（hash 失效）；`previewT09Reply` → `rejected` |

## 3. 真实断言

- #1 断言幂等：第二次导入 `status==='duplicate'` 且 `applications===1`（apply 不再执行）——`importT09Reply` 的 lookup 先行语义。
- #2 三个独立边界：版本冲突、回避、非法分值（NaN）；评分绑定用 `judge-1`/`asg-1`/`rubricVersion:4`。
- #3 双重拒绝（读入层 hash 校验 + 预览层语义校验）。
- 夹具 lock `{templateId:'lab', templateVersion:2, policyVersionIds:['policy-1']}` 贯穿一致性。

## 4. 未覆盖与脆弱点

**未覆盖**：`importT09Reply` 的“相同 actionId 异载荷”拒绝分支；回复缺 note/assets 分支；评分维度未知/重复/越界（min/max）分支；`judge-rating-reply` 的 batchId/round/caseRevision 绑定校验；`readT09File` 的 reply 关联缺失分支。

**脆弱点**：`applications` 计数是唯一幂等证据（mock apply）；state/lock 夹具与实现的 canonical 比较耦合。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、纯内存 | 已证实 | `:20`；无 fs/网络 import |
| 全链往返+幂等 duplicate | 已证实 | `:21-42` |
| 评分锁定/NA/有限值强制 | 已证实 | `:44-59` |
| 篡改必拒（hash+语义双层） | 已证实 | `:61-67` |
| 其余校验分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 学生链+import 幂等 | #1 | `:21-42` | covered |
| 评委校验（NA/回避/冲突/NaN） | #2 | `:44-59` | covered |
| 载荷篡改拒绝 | #3 | `:61-67` | covered |
| actionId 漂移/维度越界/绑定校验 | — | — | unknown |
