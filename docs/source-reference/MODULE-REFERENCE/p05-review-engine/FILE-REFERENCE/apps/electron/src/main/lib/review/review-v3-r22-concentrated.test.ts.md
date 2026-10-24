---
path: apps/electron/src/main/lib/review/review-v3-r22-concentrated.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b4f28b1978c3ce42401af43a100e413e02760c8
sha256: e5d122da874772e3faa01a6f2cc4d9eceaba3a05a9b03944d98c76c3368e8e59
lines: 297
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-r22-concentrated.test.ts

## 1. 测试目标

Dev-A R22 集中技术产品测试（文件头 :1-6）：真实 A Owner + 提案/调度/turn 账本 + 多 Case 持久协调器 + 冷 PID。物理 Provider 与 Main 权威在此**注入**；不合成 C Host 回执、正式 Run 或学校发布器。验证 coordinator/producer/turn-budget/handoff 链的真实行为。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 5（`it(` :122/:168/:201/:231/:270），1 describe（:121）。公共 fixture `fixture(caseId)`（:38-113）：内存 `Store`（CAS 语义 :30-37）、Principal/SourceIdentity/RunEvidenceIdentity/CanonicalPlan（REVIEW_C0_SCHEMA_VERSION）、真实 `V3ReviewOwnerAdapter`（grant :75-80）、真实 `V3ATurnBudget`/`V3ASDKDispatchFence`/`V3AProposalProducer`（假物理 Host :84-93）/`V3ASDKTurnBridge`（注入 sdkCall :94-102）/`V3ATechnicalSequenceDriver`。`coldWorker` 路径（:114-116）。

| # | 用例（行） | 设置/动作 | 断言 |
| --- | --- | --- | --- |
| 1 | R22-A/C-01（:122） | 双 Case 并行 `coordinator.run`；重复 requestId；异体 replay；新请求同 runId | aa/bb `completed-technical` 且 turns 3/2（:151-154）；inspect completed（:155-156）；usedTurns 3/2（:151-152）；dispatch 快照 3 条 settled+grant/case 绑定（:153-157）；重复回放 completed 且计数不变（:158-161）；`requestId replay collision`（:162-164）；`different request` 拒（:165-166） |
| 2 | R22-A/C-02（:168） | 挂起 SDK promise；stopSession | stopping+`STOP_REQUESTED_UNKNOWN_PROVIDER_EFFECT`（:181-183）；job 结局 recovery-required（:185-187）；迟到 resolve 不改判（:188-189）；再派发 `unresolved background technical dispatch`（:190-193）；usedTurns 0、0 提案（:194-198） |
| 3 | R22-B-01（:201） | read/check/terminal 三连 + `A22TechnicalEvidenceHandoff` | sequence `[1,2,3]`（:208）；pack trust=`A_TECHNICAL_ONLY_C_PHYSICAL_OBSERVER_REQUIRED`、canSealCReviewRun:false、sdkDispatches []、turnBudget usedTurns 0（:211-216）；technicalEvents 3、planBindings/owner 断言（:217-220）；`verifyA22TechnicalEvidenceHash(pack)` true、篡改 evidenceHash false（:221-224）；`isCurrent` 失效 snapshot 抛（:225-227） |
| 4 | R22-C-03（:231） | linux-only（:232 守卫）；spawnSync 真子 PID 冷读 | 子进程 status 0、`R22_COLD` 行解析 state/recovery-required+COLD_PID…（:250-254）；`pid !== process.pid`（:255）；journal 字节不变（:256）；迟到完成仍 recovery-required（:257-262）；90s 超时（:268） |
| 5 | R22-C-04（:270） | SDK 抛 `429 quota exceeded` | recovery-required+`PROVIDER_QUOTA_OR_RATE_LIMIT_REQUIRES_REVIEW`（:284-288）；再派发拒（:289-292）；requests 恒 1（:293-295） |

## 3. 真实断言

- `:151-154`：`expect(aa).toMatchObject({state:'completed-technical', committedUsedTurns:3, completedSteps:3})` 等。
- `:153-157`：`firstDispatches` toHaveLength(3) + `every(...)` settled/grantId/caseId/dispatchId/technicalReceiptId。
- `:162-166`：`rejects.toThrow('requestId replay collision')`、`rejects.toThrow('different request')`。
- `:181-183`：`toMatchObject([{state:'stopping', reason:'STOP_REQUESTED_UNKNOWN_PROVIDER_EFFECT'}])`。
- `:185-198`：`expect(stopped.state).toBe('recovery-required')`、`expect(a.turns.snapshot(a.lease).usedTurns).toBe(0)`、`expect(a.producer.replayCandidates()).toHaveLength(0)`。
- `:208-227`：`toEqual([1,2,3])`、`toMatchObject({trust:…, canSealCReviewRun:false, …})`、`verifyA22TechnicalEvidenceHash` true/false、`expect(()=>handoff.snapshot(a.call)).toThrow()`。
- `:250-262`：`toMatchObject({state:'recovery-required', reason:'COLD_PID_OR_UNKNOWN_PROVIDER_EFFECT'})`、`expect(observed.pid).not.toBe(process.pid)`、journal `toBe(previous)`、settled recovery-required。
- `:284-295`：`toMatchObject({state:'recovery-required', reason:'PROVIDER_QUOTA_OR_RATE_LIMIT_REQUIRES_REVIEW'})`、`expect(requests).toBe(1)`。

## 4. 未覆盖与脆弱点

- 未覆盖：`V3AProposalProducer.load` 损坏分支、`terminalCandidate`/`replayCandidates` 语义、turn-budget decode 损坏、跨 grant 覆盖统计、`stop()`（非 stopSession）单独路径、tombstone 256。
- 脆弱点：#4 仅 linux（:232 非 linux 静默 return——测试存在但不执行）；Host 为假对象（`physical-read-r22` 等固定 receiptId）；bridge/turn host outcome 由测试回调伪造（注释 :100-102 声明非伪造 SDKMessage/C 回执——但确为注入）。
- mock/真实边界：Owner/持久化/预算/producer/driver/协调器为真身；物理 Host、SDK nextTurn、A24 无涉为注入/假。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例计数与 `it(` 一致 | 已证实 | :122-270 |
| 断言行如 §3 | 已证实 | 逐行读 :122-296 |
| 幂等/停止/交接/冷读/quota 五类行为被断言 | 已证实 | #1-#5 |
| 非 linux 下 #4 不执行 | 已证实 | :232 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| coordinator 幂等/拒重派/并发 | #1 | covered |
| stopSession+迟到结果 | #2 | covered |
| producer 三连+handoff | #3 | covered |
| 冷 PID 语义 | #4 | covered（linux-only） |
| quota 分类 | #5 | covered |
| load 损坏/terminalCandidate/stop 单独 | — | unknown |
