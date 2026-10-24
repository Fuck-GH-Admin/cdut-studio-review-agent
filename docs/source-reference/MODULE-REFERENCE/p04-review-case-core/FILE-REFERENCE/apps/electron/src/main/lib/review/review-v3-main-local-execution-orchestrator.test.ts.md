---
path: apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bd49fd2f8f012422c6eaee449ba7b65b7853d180
sha256: a8330de4a08a7a39377acc51773921821b10550c3cfe7f58123dabfcaa12b7be
lines: 132
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `C11MainLocalExecutionOrchestrator` 的 C R11 处置契约：成功只产出 `candidate-manual-review`（永不伪造学校/Case/Run ACK）；SDK await 期间 Owner 轮换、未知 Provider、独立 Host 缺失都归 `recovery-required`；用户停止/关闭后不得自跑另一 Provider；A/C 端声称正式权威一律 fail-closed。

## 2. 用例清单

共 5 个 `test(`（`review-v3-main-local-execution-orchestrator.test.ts:66-131`，单一 `describe`）。

夹具（`:9-65`）：真实形状 `RunEvidenceIdentity`、`call`（`grantId:'grant-2'`、`tool:'review_submit_result'`）、`request`（`requestId:'main-local-1'`）、`task`（`state:'completed-technical'`）、`preview`（`status:'local-manual-review'`、`seenPhysicalEvents:2`、`terminalObserved:true`）；`authorities` 为可注入的 `currentRun/background/handoff/physicalReview`（`as unknown as C11MainLocalExecutionAuthority`，`:55`）；控制柄 `setRun/setRunner/setReview/setHandoff/calls/stops`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | only local manual review, never fabricated School/Case/Run ACK（`:67`） | 正常 `execute` | `toMatchObject({version:'c11-local-execution/1',state:'candidate-manual-review',requestId,preview:{status:'local-manual-review',officialSchoolApproved:false,schoolPolicyPublished:false,businessWriteAllowed:false,formalReviewRunSealed:false}})`；`calls()===1` |
| 2 | changing current C Main Owner while Pi SDK awaits cannot be accepted（`:79`） | runner 内 `setRun({...run,ownerGeneration:3})` | `{state:'recovery-required',reason:'MAIN_OWNER_OR_RUN_REVOKED_AFTER_A_SDK_AWAIT',officialSchoolApproved:false,businessWriteAllowed:false}` |
| 3 | unknown Provider/C physical Host not observed -> recovery, no implied successful Run（`:94`） | runner 返回 `state:'recovery-required',reason:'COLD_PID'`；另一组 `setReview` 抛错 | `{state:'recovery-required',reason:'COLD_PID'}`；`{state:'recovery-required',reason:'INDEPENDENT_C_PHYSICAL_HOST_OR_ORIGINAL_NOT_VERIFIED'}` |
| 4 | user stop, Owner session revoke and C Main close cannot self-run another Provider（`:110`） | `stop`/`stopSession`/`close` 后再 `execute`/`stop` | `stops()===2`；`execute` `rejects.toThrow('MAIN_LOCAL_EXECUTION_DISPOSED')` 且 `calls()===0`；`stop` `toThrow('MAIN_LOCAL_EXECUTION_DISPOSED')` |
| 5 | A handoff or C Host preview reporting formal authority fails closed（`:122`） | `setHandoff(()=>({run,canSealCReviewRun:true}))`；`setReview(()=>({...preview,businessWriteAllowed:true}))` | `resolves.toMatchObject({state:'recovery-required'})`；`toMatchObject({state:'recovery-required'})` |

## 3. 真实断言

- 用例 1：`expect(value).toMatchObject({...})`（`:70-76`）；`expect(f.calls()).toBe(1)`（`:77`）。
- 用例 2：`expect(value).toMatchObject({state:'recovery-required',reason:'MAIN_OWNER_OR_RUN_REVOKED_AFTER_A_SDK_AWAIT',...})`（`:89-92`）。
- 用例 3：`expect(await f.create().execute(...)).toMatchObject({state:'recovery-required',reason:'COLD_PID'})`（`:102-103`）；`toMatchObject({state:'recovery-required',reason:'INDEPENDENT_C_PHYSICAL_HOST_OR_ORIGINAL_NOT_VERIFIED'})`（`:106-108`）。
- 用例 4：`expect(f.stops()).toBe(2)`（`:114`）；`rejects.toThrow('MAIN_LOCAL_EXECUTION_DISPOSED')`（`:116-117`）；`expect(f.calls()).toBe(0)`（`:118`）；`expect(()=>worker.stop(...)).toThrow('MAIN_LOCAL_EXECUTION_DISPOSED')`（`:119-120`）。
- 用例 5：`resolves.toMatchObject({state:'recovery-required'})`（`:125-126`）；`toMatchObject({state:'recovery-required'})`（`:129-130`）。

夹具/mock 边界：纯单元——`background/handoff/physicalReview/currentRun` 全部内存 mock（`as unknown as`，`:55`）；无磁盘、无 Electron、无真实 SDK。

## 4. 未覆盖与脆弱点

- 未覆盖：`A_HANDOFF_NOT_PINNED_TO_MAIN_RUN` 的**抛错**分支（用例 5 用 `canSealCReviewRun:true` 经 catch 归 recovery——注意实现 `:92-93` 是 `deny` 抛错被 `:95` 的 try/catch 捕获转 `INDEPENDENT_C_PHYSICAL_HOST_OR_ORIGINAL_NOT_VERIFIED`？静态读：`handoff.snapshot` 与 `inspect` 同在 try 内（`:90-95`），故该 deny 也被 catch 成 `INDEPENDENT_C_PHYSICAL_HOST_OR_ORIGINAL_NOT_VERIFIED`；用例 5 断言只到 `state:'recovery-required'`，未断言 reason）。
- 未覆盖：`INVALID_MAIN_EXECUTION_REQUEST`、`NO_ACTUAL_CURRENT_MAIN_RUN`、`result.state` 为 `stopping`/`running`、`UNRESOLVED_PROVIDER_OR_UNTRUSTED_TECHNICAL_DISPOSITION`、`MAIN_OWNER_CHANGED_AFTER_C_PHYSICAL_HOST_CHECK`。
- 脆弱点：`as unknown as C11MainLocalExecutionAuthority` 绕过类型检查；用例 5 未断言具体 reason（见上）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:67,79,94,110,122` |
| 成功只产 manual-review | 已证实 | `:70-77` |
| await 轮换归 recovery | 已证实 | `:89-92` |
| 未知 Provider/Host 缺失归 recovery | 已证实 | `:102-108` |
| close 后不自跑 Provider | 已证实 | `:114-120` |
| 声称权威 fail-closed | 已证实（state 级） | `:122-130` |
| handoff deny 的 reason | 推断 | 实现 `:90-95`（deny 被同 try/catch 吞为 `INDEPENDENT_C_PHYSICAL_HOST_OR_ORIGINAL_NOT_VERIFIED`）；测试未断言 |
| 真实 A SDK 行为 | 未知 | 全 mock |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 成功处置 | 1 | 67-78 | covered |
| Owner 轮换 | 2 | 79-93 | covered |
| 未知 Provider/Host 缺失 | 3 | 94-109 | covered |
| stop/close | 4 | 110-121 | covered |
| 权威声称拒绝 | 5 | 122-131 | covered |
| 入参/无 Run/result.state 分支 | 无 | — | unknown |
| handoff deny reason | 隐含 | 122-126 | partial |
