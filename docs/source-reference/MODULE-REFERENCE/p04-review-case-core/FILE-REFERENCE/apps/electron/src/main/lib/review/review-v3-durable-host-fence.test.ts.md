---
path: apps/electron/src/main/lib/review/review-v3-durable-host-fence.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 697c2608e6d12777cc910e79e88c14ffee0673c8
sha256: 6afa6fd60945157e163381bd0aa9a44fab22dbacadff5db7515c51f9bbf39a66
lines: 135
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-durable-host-fence.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 C-R09 Case-CAS 持久 Run 级 Host 围栏（非 SDK 业务台账）：围栏与回执同事务且经独立冷 OS PID 验证；撤权/陈旧 CAS/错 Run 不能伪造围栏；围栏后旧 Run 不能以任何 attempt/generation 再进；损坏围栏 fail-closed 且不可淘汰。

## 2. 用例清单

共 4 个 `test(`（`review-v3-durable-host-fence.test.ts:50-134`，单一 `describe`）。

夹具（`:20-49`）：`seed()` 建真实案卷（`stage:'reviewing'`）并写 `v3TechnicalExecution`（run/frozenInputDigest/admittedAtRevision/events:[]）；`command(run,reason)`；actor `verified-main-operator`。注意本测试使用真实 `C2MainPhysicalHostReceiptRegistry`（`:13` import，nb-10 模块）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | same transaction receipt and fence survives independent cold OS PID（`:51`） | 围栏→断言→spawnSync worker→幂等重放→改 reason 碰撞 | `result.ok===true`；`revision===1`；`receiptLog.map(type)` `toEqual(['FenceV3HostRun'])`；`v3HostRunFences` 长度 1；`isC2RunDurablyFenced(run)===true`；`assertC2HostRunNotFenced` `toThrow('Durable Run-wide')`；worker `{status:0,stdout:'DURABLE_FENCED'}`；重放 `ok===true` 且 `receiptLog` 仍 1；碰撞 `{ok:false,code:'REQUEST_ID_COLLISION'}` |
| 2 | revoked Main witness, stale CAS and wrong Run cannot forge a durable fence（`:75`） | `authorize=undefined`；authorize 抛错；`expectedRevision:9`；`runId:'forged-run'`；`caseId:'another-case'` | `rejects.toThrow('authorization required')`；`ok===false` 且 `isC2RunDurablyFenced===false`；`VERSION_CONFLICT`；`STALE_INPUT`；`VALIDATION_FAILED`；`receiptLog` 长度 0 |
| 3 | no physical Host callback can re-enter an old Run after fence, even under another attempt/generation（`:92`） | 真注册表登记回执→围栏→查回执/再登记；mutated run assert | 围栏后 `getPhysicalHostReceipt` `toBeUndefined()`；`rememberObservedReceipt` `toThrow('Run invalidated')`；`assertC2HostRunNotFenced(fake,mutated)` `toThrow('Run-wide')`；`isC2RunDurablyFenced({...run,runId:'different-new-run'})===false` |
| 4 | corrupt durable fence never defaults to permit and cannot be evicted（`:119`） | 手写两条同 runId 围栏（无回执） | `isC2RunDurablyFenced` 与 `assertC2HostRunNotFenced` 均 `toThrow('Host Run fence')` |

## 3. 真实断言

- 用例 1：`expect(readAggregate(id)?.caseV2.revision).toBe(1)`（`:58`）；`expect(readAggregate(id)?.receiptLog.map(x=>x.type)).toEqual(['FenceV3HostRun'])`（`:59`）；`expect({status:cold.status,stdout:…}).toMatchObject({status:0,stdout:'DURABLE_FENCED'})`（`:66-67`）；`toMatchObject({ok:false,code:'REQUEST_ID_COLLISION'})`（`:72`）。
- 用例 2：`toMatchObject({ok:false,code:'VERSION_CONFLICT'})`（`:85`）；`code:'STALE_INPUT'`（`:87`）；`code:'VALIDATION_FAILED'`（`:89`）；`expect(readAggregate(id)?.receiptLog).toHaveLength(0)`（`:90`）。
- 用例 3：`expect(registry.getPhysicalHostReceipt(...)).toBeUndefined()`（`:111`）；`toThrow('Run invalidated')`（`:112`）。
- 用例 4：两次 `toThrow('Host Run fence')`（`:132-133`）。

夹具/mock 边界：案卷/`v3TechnicalExecution` 真实落盘；`authorize` 回调为 mock；worker 为**真实独立进程**（spawnSync + `process.execPath`）；`C2MainPhysicalHostReceiptRegistry` 为真实类（观察器 mock）。

## 4. 未覆盖与脆弱点

- 未覆盖：4096 容量边界、`records` 单条形状各分支、并发 CAS、`assertC2HostRunNotFenced` 的 `Run/Case mismatch`。
- 脆弱点：spawnSync 依赖 `process.execPath` 能直跑 `.ts` worker（Bun 运行时假设）；用例 3 的 `getCurrentOwner` mock 直接 echo run；错误码子串匹配（`'Durable Run-wide'`/`'Run-wide'`/`'Host Run fence'`/`'Run invalidated'`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:51,75,92,119` |
| 冷 OS PID 验证（真实 spawnSync） | 已证实 | `:63-67` |
| 幂等/碰撞语义 | 已证实 | `:68-73` |
| 伪造四路拒绝 | 已证实 | `:75-90` |
| 围栏后旧 Run 不可进 | 已证实 | `:92-117` |
| 损坏 fail-closed | 已证实 | `:119-133` |
| 容量/并发 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 围栏+冷 PID+幂等+碰撞 | 1 | 51-74 | covered |
| 伪造拒绝 | 2 | 75-91 | covered |
| 旧 Run 阻断（含注册表联动） | 3 | 92-118 | covered |
| 损坏台账 | 4 | 119-134 | covered |
| 容量/并发 | 无 | — | unknown |
