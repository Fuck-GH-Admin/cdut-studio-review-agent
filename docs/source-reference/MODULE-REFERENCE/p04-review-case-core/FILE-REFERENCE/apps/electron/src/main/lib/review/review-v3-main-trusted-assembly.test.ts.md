---
path: apps/electron/src/main/lib/review/review-v3-main-trusted-assembly.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1108533d3cdebd4f7232a6c15605394ef3cfeb60
sha256: 2fe07d6b8e624a7593a4526c57f3eba7ffa193adb12a00ca21ef8704f26d6e2c
lines: 222
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-trusted-assembly.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 C2-R04 单一 Main 本地 Plan/Owner/Host/Pi 装配：独立 Host 观察器 + 已 admit 磁盘原件 + Pi 共享同一权威；提议不能自证、必须独立观察后才能 record；candidate-held/Owner 轮换/原件篡改不可绕过；Run 失效墓碑 Host 回执、冷装配不可重建；异步 createPi 期间 close 即 dispose 并禁用；缺权威构造拒绝。

## 2. 用例清单

共 5 个 `test(`（`review-v3-main-trusted-assembly.test.ts:150-221`，单一 `describe`）。

夹具（`:26-148`）：真实案卷（原件 `original.txt` + `canonicalPlan`）；`authority` 为合成 `C2MainTrustedAssemblyAuthority`（`assertPublishedPlan` 可 holdCandidate、`getCurrentOwner` 可 revoke/rotate、`getObservedPhysicalReceipt` 从 `observed` Map、`createFreshSession` 可 setBuild）；read 事件 `eventId=executionProposalId(readBody)`；控制柄 `observe/revoke/rotate/holdCandidate/setBuild/admit/record`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | independent Host observer, admitted disk original and Pi share one authority（`:151`） | admit→createPi→record（无观察）→remember（无观察）→observe→remember→record | `admit.ok===true`；`pi.trustedOrigin==='https://provider.example.test'`；`createCount===1`；`record.ok===false`（自证拒绝）；`rememberObservedHostReceipt` `toThrow('independently')`；observe 后 `record.ok===true`；`events` 长度 1；`decisions` `toEqual([])` |
| 2 | published Plan, revoked Owner or physical bytes cannot be bypassed by assembly（`:168`） | `holdCandidate` 后 admit；admit+observe+remember 后 `rotate` 再 record；admit 后改原件再 createPi | `admit.ok===false` 且 `createCount===0`；`record.ok===false`；`createPi` `rejects.toThrow()` 且 `createCount===0` |
| 3 | explicit Run invalidation tombstones Host receipt; cold assembly cannot rehydrate（`:186`） | admit→observe→remember→`invalidateRun`→record→remember→close×2→remember→admit | `record.ok===false`；`remember` `toThrow('Run invalidated')`；close 后 `remember`/`admit` `toThrow('disposed')`；`decisions` `toEqual([])` |
| 4 | process close during async Pi factory await disposes fresh session and denies use（`:205`） | build 内 `assembly.close()` | `createPi` `rejects.toThrow()`；`disposeCount===1`；`createCount===1`；再 `createPi` `toThrow('disposed')` 且 `createCount` 仍 1 |
| 5 | missing privileged authority is rejected before installing any port（`:219`） | `new C2MainTrustedExecutionAssembly({} as never)` | `toThrow()` |

## 3. 真实断言

- 用例 1：`expect(pi.trustedOrigin).toBe('https://provider.example.test')`（`:155`）；`expect((await f.record()).ok).toBe(false)`（`:157`）；`toThrow('independently')`（`:158-159`）；`expect(readAggregate(f.id)?.v3TechnicalExecution?.events).toHaveLength(1)`（`:163`）。
- 用例 2：`expect((await f.admit()).ok).toBe(false)`（`:171`）；`expect(f.createCount).toBe(0)`（`:172,183`）；`await expect(h.assembly.createPi(h.request)).rejects.toThrow()`（`:182`）。
- 用例 3：`expect((await f.record()).ok).toBe(false)`（`:192`）；`toThrow('Run invalidated')`（`:193-194`）；`toThrow('disposed')`（`:197-201`）。
- 用例 4：`expect(f.disposeCount).toBe(1)`（`:213`）；`expect(() => f.assembly.createPi(f.request)).toThrow('disposed')`（`:215`）。

夹具/mock 边界：案卷/原件/plan 真实落盘（case-store-v2）；authority/会话是内存 mock（`as unknown as`/`satisfies C2MainOwnerWitness`）；无 Electron/IPC/网络。

## 4. 未覆盖与脆弱点

- 未覆盖：`invalidateRunDurably`、`seal` 入口、`record` 多事件、`isRunFenced` 持久围栏交互（由 `review-v3-durable-host-fence.test.ts` 侧覆盖）、并发。
- 脆弱点：`'independently'`/`'Run invalidated'`/`'disposed'` 为子串匹配；`createCount/disposeCount` 依赖实现调用次数；用例 4 依赖 `C2MainPiAgentSessionFactory` 失败 dispose 语义（跨模块）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:151,168,186,205,219` |
| 提议不能自证 | 已证实 | `:157-159` |
| Run 失效墓碑 + 冷不可重建 | 已证实 | `:186-203` |
| 异步 close→dispose | 已证实 | `:205-217` |
| 真实案卷 + mock 权威 | 已证实 | fixture `:26-148` |
| `invalidateRunDurably`/`seal` | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 单权威共享/自证拒绝 | 1 | 151-166 | covered |
| 三类绕过不可 | 2 | 168-184 | covered |
| Run 失效/冷语义 | 3 | 186-203 | covered |
| 异步 close | 4 | 205-217 | covered |
| 构造拒绝 | 5 | 219-221 | covered |
| fence/seal/并发 | 无 | — | unknown |
