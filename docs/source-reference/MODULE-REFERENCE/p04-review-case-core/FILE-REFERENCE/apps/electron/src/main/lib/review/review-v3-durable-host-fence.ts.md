---
path: apps/electron/src/main/lib/review/review-v3-durable-host-fence.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 75e989ef7deb63f36d9c9e2f636d800e69064d0c
sha256: 57b5246b804c86ddd71fbcaded5eca9e1be63f185a25843d95d1cf2c2cbf1df7
lines: 114
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-durable-host-fence.ts

## 1. 结论与边界

C-R09：不可逆的**按案卷 Run 级 Host 围栏**。不是 A 技术墓碑：围栏与 C Case 聚合 CAS+Receipt **同一事务**提交，在物理案卷磁盘事务之下；冷 Main 可读围栏而不重建任何 Host 回执；须独立的真实 Main 操作员与 Owner/grant 校验者授权（文件头 `apps/electron/src/main/lib/review/review-v3-durable-host-fence.ts:1-8`）。

边界：`fenceC2HostRunDurably` **绝不**杀 PID、清锁或重新派发（`:69-71`）；围栏只记 Run ID，不做业务/学校 ACK（`:102` summary）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 1 个接口 + 3 个函数 = 5 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C2MainAuthorizeRunFence` | type（导出） | 17-18 | `(aggregate,run,reason)=>void` | 独立 Main 操作员授权回调 |
| `C2MainFencePayload` | 接口（导出） | 19-22 | `{run,reason}` | 命令载荷 |
| `assertC2HostRunNotFenced` | 函数（导出） | 51-58 | `(aggregate,run)=>void` | 已围栏即拒绝 |
| `isC2RunDurablyFenced` | 函数（导出） | 60-68 | `(run)=>boolean` | 注册表读侧（持久围栏查询） |
| `fenceC2HostRunDurably` | 函数（导出） | 72-114 | `(caseId,command,authorize)=>Promise<ReviewCommandResult>` | 提交围栏 |
| `refuse`/`hash` | 内部 | 23-24 | 抛 `C0ContractError('RECOVERY_REQUIRED',…)`；sha256(JSON) | |
| `records` | 内部 | 25-49 | 台账校验器 | 见 §3.1 |

## 3. 内部逻辑与关键流程

### 3.1 台账校验（`records`，`:25-49`）

`v3HostRunFences` 缺省=空；必须数组且 ≤4096（`Host Run fence ledger malformed/capacity`）；每条须 `schemaVersion==='review-v3-host-run-fence/1'`、run/requestId/operatorPrincipalId/reason/合法 `fencedAt`（`Host Run fence record malformed`）；`assertC0RunEvidenceIdentity`；caseId 一致且 runId 不重复（`Host Run fence case or run identity corrupt`）；**每条围栏必须恰有 1 条配套 Case Receipt**（`type==='FenceV3HostRun'`、同 requestId、`payloadHash('FenceV3HostRun',{run,reason})` 相等、actor 相等），否则 `Host Run fence lacks unique authoritative Case Receipt`（`:39-45`）。

### 3.2 查询

- `assertC2HostRunNotFenced`（`:51-58`）：Run/Case 一致；`records` 含同 runId → `Durable Run-wide Host fence: recovery required, no late receipts`。注释：案卷级 Run ID 不可被新 PID/grant/generation/attempt 复活（`:50`）。
- `isC2RunDurablyFenced`（`:60-68`）：`readAggregate` 缺失 → `Case missing or not parseable during Host admission`；聚合不可信 → `Case aggregate untrusted during Host admission`；返回是否含同 runId。**损坏的 Case/围栏 fail-closed（拒绝而非 false）**（`:59`）。

### 3.3 提交（`fenceC2HostRunDurably`，`:72-114`）

`authorize` 非函数 → reject `ACTOR_UNTRUSTED: Independent C Main operator authorization required`（`:77-78`）。`submitCommand(...,type:'FenceV3HostRun')` CAS handler（`:79-113`）：

1. `run`/`reason` 形状（reason 5–512 非空白边缘）否则 `VALIDATION_FAILED: C Main Host fence requires exact Run/reason`（`:82-84`）。
2. `run.caseId===caseId`（`VALIDATION_FAILED: Fence cannot address another Case`，`:86-87`）。
3. `records(aggregate)` 既有 ≥4096 → `DEPENDENCY_UNRESOLVED: Durable fence capacity exhausted`；已含同 runId → `INVALID_TRANSITION: Old Run ID already durably fenced`（`:88-92`）。
4. `historical=aggregate.v3TechnicalExecution?.run ?? aggregate.v3ReviewRun?.run` 必须存在、runId 相等且 `hash` 全等（`STALE_INPUT: Only exact persisted physical Run can be fenced`，`:93-96`）。
5. `authorize(aggregate,run,reason)`（独立观察，非 Renderer actor，`:97-98`）；`command.actor.actorId` 必须存在（`VALIDATION_FAILED: Current Main operator principal missing`，`:99-100`）。
6. `mutate`：追加 `{schemaVersion,run,requestId,operatorPrincipalId,reason,fencedAt:now}` 到 `v3HostRunFences`（`:103-111`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- `fenceC2HostRunDurably`/`isC2RunDurablyFenced`/`C2MainAuthorizeRunFence`：`review-v3-main-trusted-assembly.ts:17-20`（import）、`:71-73`（`isRunFenced` 注入 host-receipt-registry）、`:112-122`（`invalidateRunDurably` 调 fence）。
- `isC2RunDurablyFenced` 另注入：`review-v3-main-local-technical-review.ts`（`isRunFenced`）、`review-v3-main-host-receipt-registry.test.ts` 之外的 `review-v3-durable-host-fence.worker.ts:2`（独立 OS 进程验证）。
- `assertC2HostRunNotFenced`：测试直接调用；生产调用点本批未见（以 `isC2RunDurablyFenced` 为主）。
- 测试：`review-v3-durable-host-fence.test.ts:11-12`（本批 4 例）。

出向：`@profer/shared`（`assertC0RunEvidenceIdentity`/`C0ContractError`/类型）；`case-store-v2.ts:15`（`CommandValidationError`/`payloadHash`/`readAggregate`/`submitCommand`）；`node:crypto`。

## 5. 数据 I/O、读写与副作用

- 读：`readAggregate`（`isC2RunDurablyFenced`）。
- 写：仅经 `submitCommand` 的 Case CAS（`v3HostRunFences` + `FenceV3HostRun` 回执同事务，`:101-112`）。
- 副作用：无 IPC/网络/进程管理。
- 幂等/并发：同 requestId 重放幂等（`submitCommand`）；同 runId 二次围栏 `INVALID_TRANSITION`；CAS 冲突 `VERSION_CONFLICT`（测试断言）。

## 6. 分支、失败、取消与恢复

| 拒绝 | 触发 | 行 |
| --- | --- | --- |
| `Host Run fence ledger malformed/capacity` | 台账形状/容量 | 28 |
| `Host Run fence record malformed` | 单条形状 | 34 |
| `Host Run fence case or run identity corrupt` | caseId/runId 重复 | 38 |
| `Host Run fence lacks unique authoritative Case Receipt` | 回执不唯一/不匹配 | 45 |
| `Run/Case mismatch` | assert 入参 | 55 |
| `Durable Run-wide Host fence: recovery required, no late receipts` | 已围栏 | 57 |
| `Case missing or not parseable…`/`Case aggregate untrusted…` | 读侧损坏 | 63,66 |
| `ACTOR_UNTRUSTED: Independent C Main operator authorization required` | 无授权回调 | 78 |
| `VALIDATION_FAILED`（reason/case/actor 三种） | CAS 入参 | 84,87,100 |
| `DEPENDENCY_UNRESOLVED: Durable fence capacity exhausted` | ≥4096 | 90 |
| `INVALID_TRANSITION: Old Run ID already durably fenced` | 重复围栏 | 92 |
| `STALE_INPUT: Only exact persisted physical Run can be fenced` | 非持久 Run | 96 |

- 失败后状态：CAS 拒绝零写入（测试 `receiptLog` 长度 0 断言）。
- 恢复：**无自动恢复**——围栏不可逆；冷进程经 worker 验证（`review-v3-durable-host-fence.worker.ts`）。

## 7. 权限与权威状态

- 授权回调是“独立安装的 C Main 观察器，不是 Renderer actor”（`:97`）；operator 主体写入 `operatorPrincipalId`。
- 围栏与回执唯一绑定（`:39-45`）：无配套回执的围栏条目使整个台账 fail-closed（`records` 抛错）。
- Run ID 复用防护：案卷级墓碑（`:50`）。

## 8. 修改影响面

- 改 `records`/围栏形状影响 `review-v3-main-host-receipt-registry.ts`（`isRunFenced` 注入）、`review-v3-main-local-technical-review.ts`、`review-v3-main-trusted-assembly.ts:112-122`。
- 改 `fenceC2HostRunDurably` 影响 4 个测试与 `FenceV3HostRun` 回执语义（`payloadHash` 契约）。

## 9. 测试证据

直接测试：`review-v3-durable-host-fence.test.ts`（135 行，4 例，详见其手册）：同事务回执+围栏经**独立冷 OS PID** 验证（spawnSync worker → `DURABLE_FENCED`）、幂等重放+碰撞拒绝、撤权/陈旧 CAS/错 Run 无法伪造、围栏后旧 Run 不可再进（跨 attempt/generation）、损坏围栏 fail-closed 且不可淘汰。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

间接：`review-v3-main-trusted-assembly.test.ts`（经装配）、`review-v3-main-host-receipt-registry.test.ts`（`durable` 分支，nb-10）。

缺口：`assertC2HostRunNotFenced` 生产调用点、4096 边界单测、并发 CAS。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 围栏与回执同事务 | 已证实 | `:79-112`；测试 `:58-60` |
| 冷 PID 可读、不重建回执 | 已证实 | `:6`；测试 `:63-67`（spawnSync worker） |
| 损坏台账 fail-closed | 已证实 | `:25-49`；测试 `:119-133` |
| 不杀 PID/不清锁/不重派 | 已证实 | `:69-71` |
| Run ID 不可复活 | 已证实 | `:50,56-57`；测试 `:113-116` |
| `assertC2HostRunNotFenced` 生产使用 | 未知 | 本批检索未见生产调用 |
| 并发 CAS | 未知 | 无测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `records` | §3.1 | 25-49 | covered |
| `assertC2HostRunNotFenced`/`isC2RunDurablyFenced` | §3.2 | 51-68 | covered |
| `fenceC2HostRunDurably` | §3.3 | 72-114 | covered |
| 权威/回执绑定 | §7 | 39-45,50,97 | covered |
| 生产调用链 | §4 | 检索记录 | covered（范围已声明） |
| 并发/容量边界 | §9,§10 | — | unknown |
