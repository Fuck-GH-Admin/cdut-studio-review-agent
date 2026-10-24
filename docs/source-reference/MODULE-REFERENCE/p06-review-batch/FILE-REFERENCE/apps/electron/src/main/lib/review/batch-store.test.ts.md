---
path: apps/electron/src/main/lib/review/batch-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cd529ee1b8e3b9c61125c1bdd477d0140df3a071
sha256: b8386cf3f3165561fb2e31d3393a6e7147215b155833b650807d7e237c213670
lines: 586
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/batch-store.test.ts

## 1. 测试目标

N5/N6 单测（文件头 `:1-3`：R08 定稿锁定/重开；R11 outbox 重启幂等/冲突持久）：批次状态机与目录、定稿业务门（done≠正式批准）、快照 hash 锁定与重开新轮次、恶意批次 ID 防穿越、中断恢复（BATCH-11 先核持久 Run）、定向重试、同案租约互斥、队列执行（坏案不阻塞/防并发双跑）、持久 outbox（幂等/冲突/异载荷/WAL/篡改/awaiting-receipt/旧版 pending/并发）。被测：`batch-store` 全部导出 + `batch-automation-service.finalizeCompletedBatch`（定稿联测）+ `external-ports.MockSchoolAdapter`。

夹具：`PROFER_CONFIG_DIR` 仓库 `work/tmp/profer-test-batch-<时间戳>`（`:15-17`）；`seedRunSync`/`markDoneWithBinding`（真实 Run+绑定，`:22-44`）；`seedFinalCase`（`submitCommand` 预置 decided+final 决定/补件/申诉，`:46-86`）。本轮 `NOT_RUN`。

## 2. 用例清单

7 describe、**33 test**：

### 2.1 批次状态机（R08，9，`:88-187`）
1. `:89-94` 目录按 createdAt 倒序。 2. `:96-107` 未完成（queued/failed/paused）拒定稿且保持 draft；空案卷拒建、不落盘。 3. `:108-116` 单案失败独立（c2 不受影响）。 4. `:118-136` 定稿 hash 64 位锁定、快照可读、再定稿/改状态拒“重开”、`reopenBatch` round 2+`reopenedFromBatchId`、**原定稿 hash 不变**。 5. `:138-145` 全 done 无正式决定拒“正式业务终态”。 6. `:147-154` 仅 stage 无最终决定拒“最终业务决定”。 7. `:156-166` 待补件/待申诉拒定稿。 8. `:168-180` 11 个恶意 ID（`../evil`、`/tmp/evil`、`a/b`、`good..bad`、129 字符等）创建/读取全拒“非法批次 ID”；`reopenBatch` 同守卫。 9. `:182-186` running 拒定稿。

### 2.2 批次中断恢复与定向重试（7，`:189-293`）
10. `:190-207` running→failed（“中断”）待人工、done 不变、原失败保留。 11. `:209-225` BATCH-11：绑定 Run completed→done（error 含“认领”）；Run 缺失→failed+`recovery-required`。 12. `:227-238` 定向重试只跑选中失败项。 13. `:240-246` done 但无可用 Run → 允许重试（技术异常）。 14. `:248-267` done 且 Run 有效 → 拒“不可重试”。 15. `:269-277` queued 不可借重试绕过、外案/重复 ID 先拒不落盘。 16. `:279-292` 执行中拒“仍在当前进程”/“执行中”。

### 2.3 持久 outbox（R11，3，`:295-322`）
17. `:296-304` 成功重放返回原回执、`attempts` 不增。 18. `:306-315` conflict 持久化、重放同回执。 19. `:317-321` 异载荷拒“不同载荷”。

### 2.4 Outbox 中断恢复与 WAL（5，`:324-465`）
20. `:325-360` 首推失败→pending+完整载荷+hash 落盘；恢复重放原载荷、`attempts=2`、`submissions` 精确 `[payload,payload]`；再 `recoverPendingPushes` 不重复。 21. `:362-390` 旧版 pending 只有 hash：恢复**不发占位载荷**（calls 0）、`needsManualReplay` 含“未保存原始载荷”、attempts 不变；原调用方显式重放才发送（calls 1、attempts 2）。 22. `:392-412` 篡改持久载荷：恢复不发端口（calls 0）、reason 含“校验失败”、再推拒“校验失败”。 23. `:414-433` `awaiting-receipt` 保持 pending、恢复复用同一 actionId 直至 accepted。 24. `:435-464` 恶意 actionId 7 种拒“非法 outbox actionId”；同 actionId 并发拒“并发”、`skippedActive` 记录、calls 1。

### 2.5 批次绑定与同案互斥（BATCH-01/03/04，3，`:467-508`）
25. `:468-474` 决定依据其他轮次 Run → 定稿拒“不一致”。 26. `:476-492` 同案两批次并发 → 第二个拒“正在其他执行中运行”。 27. `:494-507` assist 人工批次统一定稿：快照 `decisions[0].entryRunId/runId==='test-run'`。

### 2.6 批次队列执行（5，`:510-569`）
28. `:511-527` 坏案 failed（“坏案”）不阻塞 c2 done。 29. `:529-537` 定稿拒执行“重开”。 30. `:539-542` 缺 runCase 拒“注入”。 31. `:544-548` 启动失败不遗留 running（status draft）。 32. `:550-568` 重复启动拒“正在执行”、calls 1。

### 2.7 outbox 发送前持久化（1，`:571-586`）
33. `:572-585` 延迟端口：推送中 pending 已先落盘（15ms 时文件存在且 status pending），最终 accepted。

## 3. 真实断言

- #4 断言 `finalizedSnapshotHash` 长度 64、重开后原 hash 不变（“原定稿不改写”）。
- #11 断言恢复结果的 `bindingState`（bound/recovery-required）精确值。
- #20 断言 `submissions` 逐次载荷与持久化 `payload` 逐字段相等（WAL 的“原载荷”语义）。
- #21 断言 `calls===0`（绝不发占位载荷）与 `attempts` 不变。
- #24 用 Promise 阻塞端口制造并发窗口。
- #33 用 60ms 延迟端口 + 15ms 探测文件系统时序（`existsSync` 断言）。

## 4. 未覆盖与脆弱点

**未覆盖**：`resolvePolicyVersionLock` 三分支、`configureBatchAutomation` 门槛（两者由 `batch-automation-service.test.ts`/`review-v3-t06-main-service.test.ts` 间接覆盖）；`readFinalizedSnapshot` 的 hash 不符分支；`isRequestLedgerBusy`（T06 ledger）；跨进程并发。

**脆弱点**：#33 依赖真实 15ms/60ms 时序（CI 慢机可能 flaky）；#26/#32 依赖 Promise 手动信号；大量中文文案断言；`require('./batch-store')` 动态导入与顶层 import 混用（`:199`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 describe、33 test、真实存储 | 已证实 | `grep -c test(`=33、`describe(`=7 |
| 定稿 hash 锁定/重开新轮次 | 已证实 | #4 |
| done≠正式批准（无决定/仅 stage/补件/申诉均拒） | 已证实 | #5-#7 |
| 恶意 ID fail-closed | 已证实 | #8 |
| BATCH-11 恢复先核持久 Run | 已证实 | #10/#11 |
| outbox WAL/幂等/不发伪造数据 | 已证实 | #17-#23 |
| 并发守卫（批次/案卷/操作） | 已证实 | #24/#26/#32 |
| 发送前落盘 | 已证实 | #33 |
| 政策锁/自动化配置分支 | 未知 | 本文件未测 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 状态机/目录/定稿/重开 | #1-#9 | `:88-187` | covered |
| 中断恢复/重试/租约 | #10-#16 | `:189-293` | covered |
| outbox 推送/幂等/冲突 | #17-#19 | `:295-322` | covered |
| outbox 恢复/WAL/安全 | #20-#24 | `:324-465` | covered |
| 绑定一致性/互斥 | #25-#27 | `:467-508` | covered |
| 队列执行 | #28-#32 | `:510-569` | covered |
| 发送前持久化 | #33 | `:571-586` | covered |
| `resolvePolicyVersionLock`/`configureBatchAutomation` | — | — | unknown（间接） |
