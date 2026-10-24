---
path: apps/electron/src/main/lib/review/review-v3-main-native-removal-observer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 57971a23ac2cd042e8b63db50d77de20e910d3ff
sha256: 475b2e9f0542939c6ab1b8ff02850f6abec8fe5072c755ad5e5c65cc2acb4c85
lines: 91
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-native-removal-observer.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 C-MAIN-HUMAN-R02 原生删除确认链（`CMainNativeRemovalObserver` + `CMainRemovalConsentGate` 联用）：完整 Check×target×object×subject×version-set 可见、独立 OS 批准恰用一次；无批准/关闭/缺物理源阻止删除；篡改义务、非法 JSON 身份、缺 owner、超长列表在弹窗前拒绝；Owner/Case 修订漂移使已观察令牌在最终 CAS 失效；模态中重入不能确认第二个请求。

## 2. 用例清单

共 5 个 `test(`（`review-v3-main-native-removal-observer.test.ts:22-90`，单一 `describe`）。

夹具（`:8-20`）：`before/after` 两个 64hex 指纹；`one`/`two` 两个 5 元组义务身份 JSON；`ctx()` 构造 `CMainRemovalCommitContext`（`caseId:'case51'`、`currentCaseRevision:5`、identity 七字段）；observer 的 `physicalConfirm` 可注入返回值/记录 prompt。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | complete Check×target×object×subject×version-set is visible, independent OS approval used exactly once（`:23`） | observe→检查 prompt→consume→再 consume→close→新 gate consume→再 observe | `seen.detail` 含 `one`/`two`/`before`/`after`/`确认理由`；`approvalId` 为字符串；二次 consume `APPROVAL_ALREADY_USED_OR_INVALID`；同对象重装 gate 仍拒；再 observe `REQUEST_REUSED_OR_CAPACITY` |
| 2 | no physical approval, closed dialog or missing physical source prevents deletion（`:43`） | `()=>false`；`fresh.close()` | `HUMAN_CANCELLED`；`PHYSICAL_HUMAN_CONFIRMATION_MISSING`；`REQUEST_REUSED_OR_CAPACITY`；`CLOSED_OR_REENTRANT`；`getObservedMainHumanConsent` `toBeUndefined()` |
| 3 | rejects altered obligations, invalid JSON identity, missing owner, very long lists BEFORE dialog（`:54`） | 篡改清单/ownerId 空/非 JSON/400 条清单 | 三次 `COMPLETE_CURRENT_CAS_OBLIGATION_REQUIRED`；`FULL_OBLIGATION_LIST_TOO_LARGE_TO_SHOW`；`expect(dialogs).toBe(0)` |
| 4 | Main Owner or real Case revision drift makes physically observed token invalid at final CAS（`:71`） | consume 时换 `authorityEpoch`/`currentCaseRevision` | 两次 `MAIN_PRINCIPAL_OWNER_FRAME_OR_REVISION_CHANGED`；最终 `gate.consumeAtCommit(ctx())` 成功 |
| 5 | native reentrant confirmation cannot confirm a second request while first modal is open（`:82`） | `physicalConfirm` 回调内 observe 另一 request | `CLOSED_OR_REENTRANT`；随后 consume 成功 |

## 3. 真实断言

- 用例 1：`expect(seen?.detail).toContain(one/two/before/after/'确认理由')`（`:31-35`）；`expect(typeof id).toBe('string')`（`:37`）；`toThrow('APPROVAL_ALREADY_USED_OR_INVALID')`（`:39,42-43`）；`toThrow('REQUEST_REUSED_OR_CAPACITY')`（`:45`）。
- 用例 2：`toThrow('HUMAN_CANCELLED')`（`:48`）；`toThrow('PHYSICAL_HUMAN_CONFIRMATION_MISSING')`（`:49`）；`toThrow('CLOSED_OR_REENTRANT')`（`:53`）；`toBeUndefined()`（`:54`）。
- 用例 3：三次 `COMPLETE_CURRENT_CAS_OBLIGATION_REQUIRED`（`:61,63,65`）；`FULL_OBLIGATION_LIST_TOO_LARGE_TO_SHOW`（`:70`）；`expect(dialogs).toBe(0)`（`:71`）。
- 用例 4：两次 `MAIN_PRINCIPAL_OWNER_FRAME_OR_REVISION_CHANGED`（`:77,79`）。
- 用例 5：`toThrow('CLOSED_OR_REENTRANT')`（`:86-87`）。

夹具/mock 边界：`physicalConfirm` 是内存 mock（`()=>true/false` 或记录 prompt）；`CMainRemovalConsentGate` 是真实类；无 Electron、无磁盘。

## 4. 未覆盖与脆弱点

- 未覆盖：`OBLIGATION_ID_INVALID`（弹窗后解析失败——注意该拒绝发生在弹窗前的解析循环，用例 3 的非法 JSON 以 `COMPLETE_CURRENT_CAS_OBLIGATION_REQUIRED` 拒得更早）、`LIMIT` 容量、`HUMAN_CONFIRMATION_EXPIRED_OR_INVALID`（由 `review-v3-main-removal-consent.test.ts` 覆盖）。
- 脆弱点：用例 3 断言 `dialogs===0` 依赖“校验先于弹窗”的实现顺序；用例 5 的回调重入依赖 `observing` 标志实现。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:23,43,54,71,82` |
| 批准恰用一次（含同对象重装） | 已证实 | `:23-46` |
| 弹窗前拒绝（dialogs===0） | 已证实 | `:71` |
| 重入拒绝 | 已证实 | `:82-90` |
| gate 与 observer 联用链 | 已证实 | 全部用例 |
| 真实对话框 | 未知 | mock |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 可见+一次性 | 1 | 23-46 | covered |
| 取消/关闭/缺源 | 2 | 43-55 | covered |
| 弹窗前四类拒绝 | 3 | 54-72 | covered |
| CAS 漂移 | 4 | 71-81 | covered |
| 重入 | 5 | 82-90 | covered |
| `OBLIGATION_ID_INVALID`/容量 | 无 | — | unknown |
