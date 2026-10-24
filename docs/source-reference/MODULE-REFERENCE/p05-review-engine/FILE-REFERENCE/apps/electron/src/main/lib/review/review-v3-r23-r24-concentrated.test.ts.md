---
path: apps/electron/src/main/lib/review/review-v3-r23-r24-concentrated.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 02fbab9f19211731b39d72ecc811810137578c78
sha256: 09c56b0b17b1dd36d07be088a226f978fc065bf7076142bf86d2ac116015c080
lines: 265
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-r23-r24-concentrated.test.ts

## 1. 测试目标

R23：`A23ObservedHostTechnicalAdapter`（`review-v3-a23-physical-host-observer.ts:99`）的物理 Host 观察语义（NOT C receipt）；R24：`A24BoundedTechnicalBatchScheduler`（`review-v3-a24-bounded-technical-batch.ts:47`）的有界 hidden/batch 调度（无业务 finalizer）。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 8（`it(` :108/:124/:137/:157/:178/:200/:213/:247），2 describe（:107/:156）。fixture：`hostFixture()`（:25-86）真实 `V3ReviewOwnerAdapter` + grant + 假 executor（物理计数+观察 Map，:56-75）+ 真实 `V3AProposalProducer`（:80）；`job/task` 工厂（:88-105）。

R23（:107-154）：

| # | 用例（行） | 断言 |
| --- | --- | --- |
| 1 | R23-01（:108） | read/check/terminal kind+sequence `['read','check','terminal']`/`[1,2,3]`（:116-117）；`snapshots()` 3 条全 `cHostReceiptVerified:false`+`A_TECHNICAL_OBSERVATION_NOT_C_HOST_RECEIPT`+dispatchId null（:118-122）；`needsRecovery()` false（:123） |
| 2 | R23-02（:124） | await 中撤销授权：read 抛（:129-130）、`needsRecovery()` true（:131）、terminal 抛 'uncertain'（:132-133）、snapshots 0（:134） |
| 3 | R23-03（:137） | 复用同一物理 receipt：terminal 抛 'duplicate receipt'（:150-151）、needsRecovery true（:152）、物理计数 2（:153） |

R24（:156-264）：

| # | 用例（行） | 断言 |
| --- | --- | --- |
| 4 | R24-01（:157） | 并发上界 2（peak 2 :171）、`{started:4,completed:4,notStarted:0}`、全 outcome 'technical'（:170-173）；重复 Case `duplicate Case`（:174-176） |
| 5 | R24-02（:178） | stop 后排队不再派发：`{started:1,completed:0,notStarted:2}`、outcomes `['recovery-required','not-started','not-started']`、start 恒 1（:192-197） |
| 6 | R24-03（:200） | 非 hidden/batch 模式副作用前拒绝（`untrusted hidden/batch mode` :209-210）、计数 0（:211） |
| 7 | R24-04（:213） | progress 快照（state running/started 1/total 3/active/queued :219-224）、`stopCase('case-02')` true 且队列变 `['case-03']`（:225-227）、结果 `{started:2,completed:2,notStarted:1}`+outcomes（:229-232）、invoked `['01','03']`（:233）、完成后 progress idle（:234-236） |
| 8 | R24-05（:247） | recovery-required 不计成功批：`{started:1,completed:0,notStarted:0}`、results 精确 toEqual（:260-263） |

## 3. 真实断言

- `:116-123`：`expect([a.kind,b.kind,c.kind]).toEqual([...])`、`[a.sequence…] toEqual([1,2,3])`、`proof` toHaveLength(3)+`every(...)`、`needsRecovery() false`。
- `:129-134`：`rejects.toThrow()`、`toBe(true)`、`rejects.toThrow('uncertain')`、`toHaveLength(0)`。
- `:150-153`：`rejects.toThrow('duplicate receipt')`、`toBe(true)`、`toBe(2)`。
- `:170-176`：`toMatchObject({started:4,completed:4,notStarted:0})`、`toBe(2)`（peak）、`every(x=>x.outcome==='technical')`、`rejects.toThrow('duplicate Case')`。
- `:192-197`：`toMatchObject({started:1,completed:0,notStarted:2})`、`results.map(outcome)` toEqual 三元、`toBe(1)`。
- `:209-211`：`rejects.toThrow('untrusted hidden/batch mode')`、`toBe(0)`。
- `:219-236`：progress/stopCase/results/invoked/progress 多组断言。
- `:260-263`：`toMatchObject` + `toEqual([{caseId:'case-01',requestId:'01',outcome:'recovery-required',reason:'PROVIDER_QUOTA_OR_RECEIPT_UNKNOWN'}])`。

## 4. 未覆盖与脆弱点

- 未覆盖：A23 观察钩子缺失组合的其它变体、A24 队列容量边界、scheduler 异常路径。
- 脆弱点：R24 的 coordinator 为 mock（`as unknown as V3ABackgroundTechnicalCoordinator`，:162-167/:183-187/:204/:225/:256）——只测 scheduler 逻辑不测协调器真身；R23 观察者返回 `dispatchId:null`（:121）单一形态；`task()` 工厂以 `as` 断言拼装（:96-105）。
- mock/真实边界：R23 用真实 adapter/producer/Owner，假物理 executor；R24 全 mock coordinator。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例计数与 `it(` 一致 | 已证实 | :108-247 |
| 断言行如 §3 | 已证实 | 逐行读 :108-263 |
| R23 观察/撤销/复用拒绝、R24 有界/stop/模式门/进度/成功率被断言 | 已证实 | #1-#8 |
| R24 coordinator 为 mock | 已证实 | :162-167 等 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| A23 read/check/terminal 观察 | #1 | covered |
| A23 撤销隔离 | #2 | covered |
| A23 复用拒绝 | #3 | covered |
| A24 并发上界/重复拒 | #4 | covered |
| A24 stop/模式门/进度/取消单 Case | #5-#7 | covered |
| A24 recovery-required 不计成功 | #8 | covered |
| coordinator 真身联动（R24 内） | — | unknown（mock） |
