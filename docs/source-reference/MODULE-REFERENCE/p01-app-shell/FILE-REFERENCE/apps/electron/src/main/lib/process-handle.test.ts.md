---
path: apps/electron/src/main/lib/process-handle.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 434eb41d33cf3e355ba154cd61b5a6bc2ea6f5cb
sha256: 876a825d572c6b21b6748e80cb7aaee394f20f9515f8261b96b23008b9fb0b2c
lines: 57
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/process-handle.test.ts

## 1. 测试目标

验证 `process-handle.ts` 适配层：①registry 状态映射（pending→starting、exited 附 endedAt）；②launcher pid 与确认后 pid 分离保留；③完成句柄时 signal 默认 killed、exitCode 记录；④归属判定双条件（同 sessionId 且 runtime=pi）。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 4 个（`describe` 1 个；`it(` 0 个）。夹具 `makeRecord`（`:5-24`）构造完整 `RuntimeProcessRecord`（含 source/likelyService/ports 等字段）。

| # | 用例 | 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | 将 registry pending/running/exited 映射为统一 starting/running/exited 状态 | 27-31 | 三种 status 各构造一次 | status/endedAt |
| 2 | 保留 launcher pid 与确认后的实际 pid，避免混为一谈 | 33-38 | makeRecord 默认值 | shellPid=100/pid=101/startTime |
| 3 | 完成句柄时保留 exitCode/signal，默认 signal 视为 killed | 40-50 | complete 两次（signal / exitCode） | killed+signal+endedAt；exited+exitCode |
| 4 | 只接受同一 runtime 的 session handle | 52-56 | 两个 sessionId | true/false |

## 3. 真实断言

- 用例 1（`:28-30`）：`expect(processHandleFromRuntimeRecord(makeRecord({status:'pending'})).status).toBe('starting')`；running→`'running'`；`exited`→`endedAt` 为 `1_700_000_001_000`（record.lastObservedAt）。
- 用例 2（`:35-37`）：`handle.shellPid).toBe(100)`；`handle.pid).toBe(101)`；`handle.startTime).toBe(1_700_000_000_000)`。
- 用例 3（`:43-49`）：`killed.status).toBe('killed')`、`killed.signal).toBe('SIGTERM')`、`killed.endedAt).toBe(1_700_000_002_000)`；`exited.status).toBe('exited')`、`exited.exitCode).toBe(1)`。
- 用例 4（`:54-55`）：`isProcessHandleOwnedBySession(handle,'session-1')).toBe(true)`；`('session-2')` 为 false。

## 4. 未覆盖与脆弱点

- 未覆盖：`runtime:'claude'` 的 false 分支、`failed` 状态、`exit.status:'failed'`、可选字段缺省（`shellPid` undefined 时 spread 省略）。
- 脆弱点：夹具字段（`likelyService`/`ports`/`source`）与被测函数无关但保持真实形状；用例 3 默认 signal→killed 与 `exit.status` 显式覆盖的优先级只测了默认路径。
- mock 边界：无 mock；`RuntimeProcessRecord` 为类型导入（`:3`），不触真实 registry。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例与断言行号 | 已证实 | `:5-56` 逐行读 |
| 映射/完成/归属断言齐全 | 已证实 | §3 |
| 无 mock | 已证实 | 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| status 映射 | 1 | covered |
| pid 字段保留 | 2 | covered |
| complete 默认/显式 | 3 | covered |
| 归属判定 | 4 | covered |
| claude/failed 路径 | - | unknown（未覆盖） |
