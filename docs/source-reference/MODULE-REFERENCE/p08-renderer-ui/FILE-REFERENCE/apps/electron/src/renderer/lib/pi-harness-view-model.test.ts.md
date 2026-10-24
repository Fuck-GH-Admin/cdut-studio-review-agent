---
path: apps/electron/src/renderer/lib/pi-harness-view-model.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a817b4ce68c8b0c5bbd24824a5f39cfe4b0c0331
sha256: 1cca361e90b098add4b4728881d9966481ca69c2d16cdab949b4278fd7b00a00
lines: 46
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/pi-harness-view-model.test.ts

## 1. 测试目标

验证 `./pi-harness-view-model` 的 `presentPiHarnessTask` 投影：assurance 四态→badge 映射、goal 级暂停对 assurance 的优先级、shadow 候选的只读性（`canManuallyContinue` 只透传不生成）、无快照返回空对象。bun:test（`apps/electron/src/renderer/lib/pi-harness-view-model.test.ts:1`）。计数：`test.each` 1 处 4 参数行（`:14-21`）+ `test(` 3 处（`:23,31,43`），共 **7 个运行时用例**（实测 `grep '^\s*test('` = 3，`test.each` 另计）。

## 2. 用例清单

依赖顺序：无序（纯函数）；夹具 `view(state)`（`:5-11`，goal=active、单任务 task、assurance 固定 reason/updatedAt）。

| # | 用例 | 设置 | 动作 | 断言（行） |
| --- | --- | --- | --- | --- |
| 1-4 | `test.each` assurance→badge（verified/pending/failed/waived → 已验证-emerald/待验证-amber/验证失败-red/已接受风险-muted） | `view(state)` | `presentPiHarnessTask('task', …)` | :20 `.badge` toEqual |
| 5 | paused Goal 优先于 assurance pending | `{...view('pending'), goal:{state:'paused',activeTaskId:'task',pauseReason:'user_stop'}}` | 同上 | :28 toMatchObject `badge:{label:'已暂停'}, pauseReason:'user_stop'` |
| 6 | 候选只读：仅 ready_task/shadow_mode 可继续 | 两个快照：required_verification+blockedReason:'shadow_mode'（无 canManuallyContinue）、ready_task+canManuallyContinue:true | 同上 | :38 label 含「shadow，未执行」；:39 `canManuallyContinue` toBeUndefined；:40 toMatchObject `canManuallyContinue:true` |
| 7 | 无快照→空 | `null` | 同上 | :44 toEqual `{}` |

## 3. 真实断言

- `expect(presentPiHarnessTask('task', view(state)).badge).toEqual({ label, tone })`（`apps/electron/src/renderer/lib/pi-harness-view-model.test.ts:20`）——badge 形状整体相等。
- `expect(...).toMatchObject({ badge: { label: '已暂停' }, pauseReason: 'user_stop' })`（`:28`）——goal pauseReason 原样透传。
- `expect(...).toMatchObject({ shadowCandidateLabel: expect.stringContaining('shadow，未执行') })`（`:38`）；`expect(...).canManuallyContinue).toBeUndefined()`（`:39`）——required_verification 不可继续；`expect(...).toMatchObject({ canManuallyContinue: true })`（`:40`）——仅透传。
- `expect(presentPiHarnessTask('task', null)).toEqual({})`（`:44`）。

mock 边界：**无 mock**。类型 `PiHarnessSnapshotView` 真实来自 `@profer/shared`（`:2`，定义 `packages/shared/src/types/pi-harness.ts:50-58`）；夹具是手工字面量（`:5-11,24-36`），不经主进程投影（`snapshot-view.ts`）——即测试的是纯投影函数，Main 边界不在被测范围。

## 4. 未覆盖与脆弱点

未覆盖：`executionLabel` 7 态文案（starting/compacting/retrying/settled/interrupted/failed 均无用例）；execution 三态蓝徽标（`pi-harness-view-model.ts:53-55`）；`lastFactSummary` 透传；`assurance.state='not_required'`；任务缺失→`{}` 分支（`:31-32`）；`goal.state` 为 active/settled/cancelled；`pauseReason` 缺省回落「任务链已暂停」（`pi-harness-view-model.ts:47`）；`shadowCandidate.action` 的 ready_task 文案全文（只断言含「shadow，未执行」）。
脆弱点：用例 6 标题写「ready_task/shadow_mode」，但断言只锁 `canManuallyContinue` 透传——ready_task/shadow_mode 的产生语义在主进程投影（`packages/shared/src/types/pi-harness.ts:28-29`、`apps/electron/src/main/lib/pi-harness/snapshot-view.test.ts:48-53`），本测试不验证该语义，勿把标题当实现事实。
无异步/无失败恢复用例（纯函数不适用）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个运行时用例（test.each×4 + test×3）与逐条断言 | 已证实 | `pi-harness-view-model.test.ts:14-45` 逐行读、grep 计数 |
| 无 mock、夹具为手工快照字面量 | 已证实 | `:2,5-11,24-36` 逐行读 |
| badge/pauseReason/canManuallyContinue 的断言语义 | 已证实 | `:20,28,38-40,44` |
| 断言在真实运行下全绿 | 未知 | NOT_RUN：本轮未执行 bun test，不得写作「测试通过」 |
| `@profer/shared` 类型解析链 | 推断 | 经 workspace 包映射（`packages/shared/src/types/pi-harness.ts:50-58` 为定义处） |

## 6. 覆盖表

| 被测分支 | 手册章节 | 测试行 | 状态 |
| --- | --- | --- | --- |
| assurance 四态 badge | §2 #1-4、§3 | 14-21 | covered |
| goal paused 优先级+pauseReason | §2 #5、§3 | 23-29 | covered |
| shadowCandidate 文案/只读性 | §2 #6、§3 | 31-41 | covered |
| null 快照→{} | §2 #7、§3 | 43-45 | covered |
| executionLabel/执行徽标/lastFactSummary/not_required/任务缺失 | §4 | — | unknown（未覆盖，已声明） |
