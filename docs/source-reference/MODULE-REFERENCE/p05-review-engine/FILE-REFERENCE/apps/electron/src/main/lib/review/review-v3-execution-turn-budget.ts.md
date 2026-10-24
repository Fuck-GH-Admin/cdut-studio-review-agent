---
path: apps/electron/src/main/lib/review/review-v3-execution-turn-budget.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34d52ebb9716fd964aa3e9a82e7f3f5671d2e221
sha256: c0944a7daecccf9e3ca7f1775793e4837e75868857aae349b550338f9c4957ce
lines: 185
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-execution-turn-budget.ts

## 1. 结论与边界

Dev-A A3/A4 可信技术 turn 预算（文件头 :1-6）：按不可变 Run+Attempt+generation 持久计数（`v3-dev-a-turns/1`），跨 pause/grant 轮换共享、旧 grant 调用被拒；**只**可证 `needs-resume` 技术终态，永不可证业务完成或 C2 ACK。只有 Main SDK 调用方可声明一次真实完成的 Pi turn（不是 Run/Check/Model token 计数）。

不做的事：不写 Run/Check；不做业务判定；不自动重试；不消费 receipt（只记录唯一 receiptIds）。

## 2. 导出与关键符号

导出 3 条（`export` 逐条核 :71/:77/:80）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3ATurnSnapshot` | interface | `:71-75` | `{usedTurns, maxTurns, exhausted}` | 只读快照 |
| `V3ATurnExhaustion` | interface | `:77-79` | `exhausted(lease): boolean` | 注入 A2 的预算闸端口（:76 注释） |
| `V3ATurnBudget` | class | `:80-185` | `implements V3ATurnExhaustion` | 主体 |

内部符号：`TurnChain`（:16-21，runHash/maxTurns/usedTurns/receiptIds）、`TurnJournal`（:23-25）、`digest/bad/key`（:27-33，`bad` 抛 `C0ContractError('RECOVERY_REQUIRED')` :29-31）、`decode`（:34-57）、`pinned`（:58-69）。类成员：`journal/revision/busy`（:81-83）、构造（:85-95，`maxTurns` 默认 24 :88，非法抛 `CONTRACT_INVALID` :90-92）、`fresh`（:96-100）、`write`（:101-113）、`entry`（:114-123）、`exhausted`（:125-129）、`snapshot`（:130-138）、`recordCompletedTurn`（:143-184）。

## 3. 内部逻辑与关键流程

- `decode`（:34-57）：null→空；JSON/version/sha 自封校验（:36-44）；逐 run：runHash 64hex、maxTurns 安全整数≥1、`0<=usedTurns<=maxTurns`、`receiptIds.length===usedTurns` 且逐项非空字符串、去重后 size 不变（:45-55），违者 `Turn budget journal …`。
- `pinned(lease)`（:58-69）：lease 六元身份（runId/caseId/attemptId/generation/inputManifestHash/planFingerprint）全等 + `assertC0RunEvidenceIdentity`，违者 `Turn budget lacks Main-frozen Run`。
- `entry`（:114-123）：存在时校验 `runHash` 与 `maxTurns` 未漂移（漂移 `Turn budget frozen Run or maxTurns changed`）。
- `write`（:101-113）：`fresh()` 后优先 `compareAndWrite`（跨进程 CAS）；写后更新 revision + 内存。
- `recordCompletedTurn(call, mainTurnReceiptId)`（:143-184）：
  1. receiptId 非空（:144-146，`CONTRACT_INVALID`）；`call.tool === 'review_submit_result'`（:147-149，否则 `CASE_SCOPE_FORBIDDEN`）；`busy` 互斥（:150-151）。
  2. 在 `owners.withAuthorizedEvent(..., lease=>…)` 租约内（:152-182）：`fresh`+`pinned`；无 entry 初始化（:156-160）；**同 receiptId 幂等返回旧快照**（:161-166，注释 :22：retry 不得膨胀计数）；已耗尽再记抛 `RUN_IDENTITY_MISMATCH`（`Pi turn budget exhausted; only needs-resume technical status allowed` :167-170）；+1 并追加 receiptId 后 `write`（:171-179）。
  3. `finally` 释放 busy（:183）。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：
- 生产：`review-v3-main-sdk-turn-bridge.ts:16-17`（V3ATurnSnapshot/V3ATurnBudget :60/:70）、`review-v3-a25-c11-local-execution-ports.ts:14`（new :132）、`review-v3-technical-sequence-driver.ts:14`（:28/:52）、`review-v3-a-host-technical-handoff.ts:11`（:47/:58）、`review-v3-execution-proposal-producer.ts:19`（V3ATurnExhaustion :148）。
- 测试：`review-v3-r22-concentrated.test.ts:18`（批内，new :82）。

出向：`node:crypto` createHash（:28）；`@profer/shared`（C0ContractError/assertC0RunEvidenceIdentity）；`review-pi-owner-adapter`（OwnerPersistence/V3OwnerLease/V3ReviewOwnerAdapter）；`review-execution-event-adapter`（V3ReviewToolCall :143）。

## 5. 数据 I/O、读写与副作用

- 磁盘：turn journal（sha 自封），写经 `compareAndWrite` 优先（:101-113）；内存 `journal` 同步更新。
- 幂等：同 receiptId 不增计数（:161-166）；跨 grant 共享同一 `[runId,attemptId,ownerGeneration]` 计数（key :32-33）。
- 副作用：磁盘写 + Owner 租约审计。无网络/模型调用。

## 6. 分支、失败、取消与恢复

- 错误：`RECOVERY_REQUIRED`（journal 损坏/外部改动/并发写 :29-31/:39-44/:97-99/:150-151）、`CONTRACT_INVALID`（maxTurns 非法/缺 receiptId :91-92/:145-146）、`CASE_SCOPE_FORBIDDEN`（:148）、`RUN_IDENTITY_MISMATCH`（身份漂移/耗尽后再记 :66-67/:121-122/:168-170）。
- 恢复：无自动恢复；`decode` 损坏即 fail-closed。不适用取消（同步函数）。

## 7. 权限与权威状态

- `review_submit_result` 能力限定（:147-149）+ Owner 租约内执行；「只有 Main SDK 调用方可声明完成 turn」（:2-3 头注释）。
- 权威：journal（CAS+sha）为 turn 计数权威；`exhausted` 供 producer 的 needs-resume 闸（producer :234-243）。

## 8. 修改影响面

- 消费链：sdk-turn-bridge、a25 装配、technical-sequence-driver、a-host-technical-handoff、proposal-producer（needs-resume 闸）。
- 默认 `maxTurns=24`（:88）是运维契约；journal schema 改动破坏重放（:34-57）。
- 需同步测试：`review-v3-r22-concentrated.test.ts`（usedTurns 3/2、重复 request 不增计数 :151-161、停跑后 0 :198）。

## 9. 测试证据

直接测试（批内 r22 集中测试，NOT_RUN）：断言 `snapshot(lease).usedTurns` 3/2（:151-152）、同 requestId 幂等回放后仍 3（:156-159）、stopSession 后 0（:198）。间接：producer/bridge 链路断言（R22-B-01 `turnBudget:{usedTurns:0}`）。
- 未覆盖：`decode` 损坏分支、maxTurns 变更漂移（:121-122）、耗尽后再记抛、跨 grant 共享计数、`recordCompletedTurn` 幂等分支（r22 的「重复 request 不增」经由 coordinator 幂等回放路径，非直接 record 同 receiptId）。mock 边界：真实 `V3ATurnBudget` + 测试 Store（内存 CAS）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；默认 maxTurns=24 | 已证实 | :71-88 |
| 同 receiptId 幂等不增计数 | 已证实 | :161-166 |
| 耗尽后禁记（仅 needs-resume 允许） | 已证实 | :167-170 |
| 跨 grant 共享、旧 grant 拒（withAuthorizedEvent 租约语义） | 已证实 | :32-33/:152-155（注释 :137-142） |
| journal sha 自封 + CAS | 已证实 | :34-57/:101-113 |
| `decode` 损坏/漂移分支无测试断言 | 已证实 | §9 |
| `withAuthorizedEvent` 对旧 grant 的拒绝实现 | 未知（属 review-pi-owner-adapter） | :152-155 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `V3ATurnBudget.recordCompletedTurn` | §3/§9 | :143-184 | covered |
| `exhausted`/`snapshot`/`entry` | §3 | :114-138 | covered |
| `decode`/`pinned`/`write`/`fresh` | §3 | :34-113 | covered |
| `V3ATurnSnapshot`/`V3ATurnExhaustion` | §2 | :71-79 | covered |
| decode 损坏/漂移/耗尽再记 | §9 | — | unknown（无断言） |
| 租约拒旧 grant 实现 | §10 | :152-155 | unknown |
