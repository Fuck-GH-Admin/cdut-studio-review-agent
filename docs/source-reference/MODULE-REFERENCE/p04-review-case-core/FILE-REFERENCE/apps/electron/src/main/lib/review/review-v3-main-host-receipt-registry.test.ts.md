---
path: apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a54d71db69b11caa3c0ed827f8c416806bb7d6f9
sha256: 9b9246ad83e141a79824fec1c23bc50a30c1f66bc5c46778667470ab1360f777
lines: 230
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `C2MainPhysicalHostReceiptRegistry` 的物理见证登记/查询语义（C2-R03）与 Run 级墓碑回归（C2-R06）：无独立观察即拒绝、单次接受+克隆、Owner/Grant/manifest 失效即读不到、跨 attempt/来源不匹配/ID 重绑拒绝、invalidate/close 不复活、迟到与回收 Run 身份永久拒收、容量满不淘汰旧围栏。

## 2. 用例清单

共 10 个 `test(`（`review-v3-main-host-receipt-registry.test.ts:55-229`，两个 `describe`：`:55` C2-R03 六例、`:152` C2-R06 四例）。

夹具（`:11-53`）：`run`（`caseId:'c2-registry-<n>'`、`attemptId:'attempt-1'`、`sourceVersionIds:['v1']`、`checkKeys:['c1']`）、`source`（`blockId:'block-1'`、`documentVersionId:'v1'`）、`host:C2MainHostWitness`（`kind:'read'`、`extent:'block'`、`permissionGrantId:'main-grant-4'`）、可变 `observed` Map/`active`/`grant`/`manifest`；注册表注入 `getObservedPhysicalReceipt`/`getCurrentOwner`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | no Main observer means no registry and no self-certified DTO ingestion（`:56`） | 空构造；未 observe 登记 | 构造 `toThrow()`；查询 `undefined`；登记 `toThrow('independently')` |
| 2 | accepts physical observer exactly once, clones result, and fails when source disappears（`:64`） | 登记两次；改返回对象；删观察记录 | `verified.kind==='read'`；改 `permissionGrantId='forged-copy'` 后查询仍 `'main-grant-4'`（克隆）；删记录后查询 `undefined` |
| 3 | revoked Owner, rotated grant and changed manifest invalidate read-back（`:79`） | `revoke()`/`rotate()`/`changeManifest()` 后查询 | 三例查询均 `undefined` |
| 4 | physical receipt bound to another attempt cannot be registered under current Main Owner（`:97`） | 观察记录 `attemptId:'different'` | 登记 `toThrow('Owner')`；查询 `undefined`；正确记录登记后 `run.attemptId==='attempt-1'` |
| 5 | source version mismatch and rebound physical ID are rejected（`:113`） | `documentVersionId:'not-in-run'`；登记后改 `extent` | `toThrow('manifest')`；`toThrow('rebound')`；查询 `undefined` |
| 6 | invalidateRun and close cannot resurrect a previously observed ID（`:132`） | `invalidateRun`/`close` 后再登记/查询 | 查询 `undefined`；登记 `toThrow('Run invalidated')`/`throws('closed')`；冷实例查不到 |
| 7 | invalidating before first Host callback blocks a newly observed, never-registered physical ID（`:153`） | 先 `invalidateRun` 再观察新 ID | `toThrow('Run invalidated')`；查询 `undefined`；重复 `invalidateRun` 幂等 |
| 8 | recycled Run identity remains barred across Owner generation and attempt mutations（`:168`） | 新 attempt/新 ownerGeneration 的同 `[caseId,runId]` | `toThrow('Run invalidated')`；查询 `undefined` |
| 9 | a distinct new Run ID under the same Case may proceed with an independent live Owner（`:189`） | 新 `runId` 的观察记录 | 旧 ID 被拒；新 ID 登记成功且 `run.runId` 匹配 |
| 10 | tombstone capacity never evicts old Runs to permit late receipt resurrection（`:217`） | 填满 8192 墓碑后继续 | `toThrow('capacity exhausted')`；查询 `undefined`；登记 `toThrow('closed')` |

## 3. 真实断言

- 用例 1：`expect(() => new C2MainPhysicalHostReceiptRegistry({} as never)).toThrow()`（`:57`）；`toBeUndefined()`（`:59`）；`toThrow('independently')`（`:60-61`）。
- 用例 2：`expect(value?.verified.kind).toBe('read')`（`:68`）；克隆断言（`:71-74`）；删观察后 `undefined`（`:75-76`）。
- 用例 3：三段 `expect(...getPhysicalHostReceipt(...)).toBeUndefined()`（`:82,86,92`）。
- 用例 4：`toThrow('Owner')`（`:105-106`）；`expect(...run.attemptId).toBe('attempt-1')`（`:110`）。
- 用例 5：`toThrow('manifest')`（`:120-121`）；`toThrow('rebound')`（`:128-129`）。
- 用例 6/7/8/10：`toThrow('Run invalidated')`（`:139,159,163,181`）、`toThrow('closed')`（`:145,228`）、`toThrow('capacity exhausted')`（`:225-226`）。
- 用例 9：`expect(registry.getPhysicalHostReceipt(newer.hostReceiptId)?.run.runId).toBe(nextRun.runId)`（`:212-213`）。

夹具/mock 边界：纯单元测试——观察器/Owner 全部内存 mock，无磁盘、无 Electron、无 IPC；`C2MainHostWitness`/`RunEvidenceIdentity` 是真实 `@profer/shared` 形状（`assertC0RunEvidenceIdentity` 真实执行）。

## 4. 未覆盖与脆弱点

- 未覆盖：`check`/`terminal` kind 正例、`durable.isRunFenced` 注入（本文件不传 `durable`）、`validId` 边界（512 字符）、`live` 的 `assertC0SourceIdentity` 失败细节、并发。
- 脆弱点：用例 8 的 `getCurrentOwner` mock 直接 echo `run`（`:179-183`），依赖实现以 `[caseId,runId]` 作墓碑；用例 10 循环 8192 次较慢；错误文案匹配是子串（`'Owner'`/`'manifest'`/`'rebound'`），文案改动会误报。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 个用例（6+4） | 已证实 | `grep test(`；`:56,64,79,97,113,132,153,168,189,217` |
| 自证 DTO 拒绝 | 已证实 | `:56-62` |
| 克隆隔离 | 已证实 | `:64-77` |
| 墓碑跨 generation/attempt | 已证实 | `:168-187` |
| 容量不淘汰 | 已证实 | `:217-229` |
| 测试无磁盘/Electron | 已证实 | import 仅 `bun:test`/`@profer/shared`/类型/被测模块 |
| `check`/`terminal` 正例 | 未知 | 无用例 |
| 持久围栏 `durable` 分支 | 间接 | 由 `review-v3-durable-host-fence.test.ts`（文件外）覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造/自证拒绝 | 1 | 56-62 | covered |
| 单次接受+克隆+源消失 | 2 | 64-77 | covered |
| Owner/Grant/manifest 失效 | 3 | 79-95 | covered |
| 跨 attempt 拒绝 | 4 | 97-111 | covered |
| 来源不匹配/ID 重绑 | 5 | 113-130 | covered |
| invalidate/close 不复活 | 6 | 132-150 | covered |
| 迟到 ID 拒收 | 7 | 153-166 | covered |
| 回收 Run 身份 | 8 | 168-187 | covered |
| 新 Run 可行 | 9 | 189-215 | covered |
| 容量封死 | 10 | 217-229 | covered |
| `check`/`terminal`/`durable` | 无/文件外 | — | partial |
