---
path: apps/electron/src/main/lib/review/review-v3-main-removal-consent.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4de469cc240c56e7c94d49bdb6365d24d89f275e
sha256: decf62c5d772a9d3565eefcfb0d666580ee7944a71733fae48d5ab835a170cef
lines: 107
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-removal-consent.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `CMainRemovalConsentGate`（C-MAIN-REMOVAL-R01）：批准恰消费一次、物理批准 ID 永不授权另一笔交易；同观察器卸装重装保留墓碑；缺观察器/无效源/缺记录/关闭恒拒；修订、物理身份、指纹、义务清单逐字段精确；过期/未来/非整数观察时间无效；容量满无 FIFO/LRU 淘汰。

## 2. 用例清单

共 6 个 `test(`（`review-v3-main-removal-consent.test.ts:42-106`，单一 `describe`）。

夹具（`:9-41`）：`ctx`（`caseId:'case-1'`、`requestId:'up-1'`、`currentCaseRevision:7`、单义务 `['["check-1","subject:s","obj","s",["v1"]]']`、`reason:'I confirm removal…'`）；`observed` 记录（`approvalId:'main-human-observed-1'`、`observedAtMs:Date.now()`）；`observer={getObservedMainHumanConsent:()=>observed}`（内存 mock）；控制柄 `clear/edit`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | approved deletion is consumed once; physical approval ID never authorizes another Case transaction（`:43`） | consume×2；改 `requestId:'up-2'` 再 consume | 两次 `APPROVAL_ALREADY_USED_OR_INVALID` |
| 2 | uninstall/reinstall of the SAME Main observer retains one-use tombstone（`:53`） | consume→close→`new CMainRemovalConsentGate(f.observer)` 再 consume | `APPROVAL_ALREADY_USED_OR_INVALID` |
| 3 | absent observer, invalid source, missing observation or closed registry is always deny（`:61`） | `new …({} as never)`、`new …(undefined)`、`clear()`、`close()` | `PHYSICAL_HUMAN_OBSERVER_INVALID`、`MAIN_OBSERVER_NOT_INSTALLED`、`PHYSICAL_HUMAN_CONFIRMATION_MISSING`、`GATE_CLOSED` |
| 4 | Case revision, physical actor, source fingerprints and obligation identities are exact（`:72`） | 9 种 `edit` 篡改（expectedRevision/principalId/frameId/ownerGeneration/authorityEpoch/previousFingerprint/nextFingerprint/清单/reason） | 全部 `rejects.toThrow(/^C_MAIN_REMOVAL_CONSENT_/)` |
| 5 | expired, future and noninteger human observation time are all invalid（`:89`） | `now-6min`/`now+30s`/`NaN` | 三次 `HUMAN_CONFIRMATION_EXPIRED_OR_INVALID` |
| 6 | no FIFO/LRU eviction of consumed one-use confirmations at capacity（`:97`） | 循环 consume 4096 个不同 approvalId；第 4097 个 | `CAPACITY_EXHAUSTED_CLOSED`；之后 `GATE_CLOSED` |

## 3. 真实断言

- 用例 1：`toThrow('APPROVAL_ALREADY_USED_OR_INVALID')`（`:46,50-51`）。
- 用例 2：`toThrow('APPROVAL_ALREADY_USED_OR_INVALID')`（`:58-59`）。
- 用例 3：`toThrow('PHYSICAL_HUMAN_OBSERVER_INVALID')`（`:62-63`）；`MAIN_OBSERVER_NOT_INSTALLED`（`:66`）；`PHYSICAL_HUMAN_CONFIRMATION_MISSING`（`:68`）；`GATE_CLOSED`（`:70`）。
- 用例 4：`expect(()=>f.gate.consumeAtCommit(f.ctx)).toThrow(/^C_MAIN_REMOVAL_CONSENT_/)`（`:86`）。
- 用例 5：`toThrow('HUMAN_CONFIRMATION_EXPIRED_OR_INVALID')`（`:93-94`）。
- 用例 6：`toThrow('CAPACITY_EXHAUSTED_CLOSED')`（`:104`）；`toThrow('GATE_CLOSED')`（`:105`）。

夹具/mock 边界：观察器是内存 mock（`{getObservedMainHumanConsent}`）；`CMainRemovalConsentGate` 是真实类（含 WeakMap 墓碑）；无磁盘、无 Electron。

## 4. 未覆盖与脆弱点

- 未覆盖：`observeAtCommit` 端（由 `review-v3-main-native-removal-observer.test.ts` 覆盖）、恰 5 分钟边界、并发 consume、`acknowledgedRemovedIdentities` 长清单。
- 脆弱点：用例 4 用正则 `^C_MAIN_REMOVAL_CONSENT_` 断言（不区分具体码）；用例 6 循环 4096 次较慢；`observedAtMs` 依赖 `Date.now()` 夹具。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个用例 | 已证实 | `grep test(`；`:43,53,61,72,89,97` |
| 一次性 + 跨重装墓碑 | 已证实 | `:43-60` |
| 9 字段精确校验 | 已证实 | `:72-88` |
| 时效三态 | 已证实 | `:89-96` |
| 容量无淘汰 | 已证实 | `:97-106` |
| 并发/边界 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 一次性/跨请求 | 1 | 43-52 | covered |
| 跨重装墓碑 | 2 | 53-60 | covered |
| 四类恒拒 | 3 | 61-71 | covered |
| 字段精确 | 4 | 72-88 | covered |
| 时效 | 5 | 89-96 | covered |
| 容量 | 6 | 97-106 | covered |
| 并发/5 分钟边界 | 无 | — | unknown |
