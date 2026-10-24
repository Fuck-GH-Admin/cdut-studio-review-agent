---
path: apps/electron/src/main/lib/review/review-v3-case-disk-tx.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 11ff465c33eeb12490fc3780ae0ae3fcea523fc3
sha256: 9d443a3f21b49eb7cef6ab0608dbf992a6afd46686dcd0f722d3122b9535b13c
lines: 132
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-case-disk-tx.test.ts

## 1. 测试目标

C-Tx R01 跨进程单案磁盘事务栅栏（describe 标题 :61）：真实多 PID 下的 CAS 互斥、崩溃残锁不被自动抢夺、显式离线恢复的授权/死 PID 边界、活跃 PID 永不被夺。被测 `review-v3-case-disk-tx` 全部 5 个导出 + `case-store-v2` 的 `submitCommand/readAggregate/writeAggregate/createAggregate`（:7-11）。

## 2. 用例清单

4 用例 / 1 describe。夹具与 mock 边界：
- 隔离 `PROFER_CONFIG_DIR=work/tmp/v3-c-tx-r01-{Date.now()}`（:13-15）。
- `seed()` 用真实 `createAggregate` 造案（:24）；`command()` 走真实 `submitCommand`（type `'C-Tx-ChangeTitle'`，:25-32）——**真实事务层，无 mock**。
- **真实子进程**：`startHolder`（:35-45）`spawn(process.execPath, ['-e', script])`，script 动态 import 模块 URL 后 `withC2CaseDiskTransaction` 持锁；`crash` 分支打印 `GOODBYE` 后 `process.exit(0)`（模拟崩溃残留）；`awaitLocked` 以 stdout `LOCKED` 为握手（:46-59，10s 超时）。
- win32 跳过：用例 2/3 开头 `if(process.platform==='win32') return`（:81/:105）。

| # | 用例 | 行 | 场景 |
| --- | --- | --- | --- |
| 1 | 双并发本地写者至多一个期望 revision 提交 | 62-77 | 同 case 两 `submitCommand` expectedRevision=0 |
| 2 | 真实独立 Bun PID 持锁；父进程等待而非覆盖 | 79-101 | 子进程持锁 450ms，父进程写 |
| 3 | 崩溃 PID 残锁直到独立离线精确恢复 | 103-122 | 子进程持锁后立即退出 |
| 4 | 活跃当前 PID 永不被夺 | 124-131 | 事务内尝试恢复自己的锁 |

## 3. 真实断言

- 用例 1（:68-76）：`[a.ok,b.ok]` 过滤后长度 1；失败者 `code` 数组 `toEqual(['VERSION_CONFLICT'])`；`result.caseV2.revision === 1`；`receiptLog` 长度 1；赢家以 `expectedRevision=0` 重放 `again.ok === true` 且 `receiptLog` 仍 1 条（幂等回执）。
- 用例 2（:85-100）：`inspectC2CaseDiskLock(id).locked` true 且 `owner.pid === child.pid`（:86-87）；父进程 `writeAggregate` 抛 `C_TX_RECOVERY_REQUIRED`（:88）；随后 `submitCommand` 成功（:91）且**等待 ≥100ms**（:92，证明在排队不是绕过）；`revision === 1`（:93）；子进程退出后 `locked === false`（:100）。
- 用例 3（:109-121）：崩溃后 `locked` true、`owner.pid` 仍是子 PID（:110-111）；授权回调抛 `not authorized` 时恢复 `toThrow('not authorized')` 且锁仍在（:112-114）；正确授权回调校验 `owner.pid === child.pid && owner.token === lock.owner?.token` 后恢复成功（:115-119）；恢复后 `submitCommand` ok 且 `receiptLog` 1 条（:120-121）。
- 用例 4（:126-130）：`withC2CaseDiskTransaction` 期间 `recoverC2AbandonedCaseDiskLock(id, ()=>{})` 抛含 `'alive'`（:127-128）；事务结束 `locked === false`（:130）。

## 4. 未覆盖与脆弱点

- 未覆盖：30s 等待超时（`review-v3-case-disk-tx.ts:92`）、`withC2CaseDiskWriteSync` 撞锁分支、owner 写失败清理、`.previous.json` 备份失败、恢复期 token 变更、win32 行为（用例直接 return）。
- 脆弱点：子进程握手依赖 stdout 文本与时序（450ms/10s 超时）；`process.execPath` 下 `-e` + 动态 import 依赖 Bun 行为；崩溃语义用 `process.exit(0)` 模拟（非 kill -9）；`Date.now()` 目录名在同毫秒并行跑多个测试文件时可能撞车（各文件前缀不同，缓解）。
- **NOT_RUN**：本轮未执行 bun test（含子进程用例）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言/夹具如 §2-3 | 已证实 | 本文件逐行 |
| 跨进程互斥/崩溃残锁/恢复边界被真实子进程断言 | 已证实 | :62-131 |
| `inspect/recover` 的唯一消费者即本测试 | 已证实 | 全树 grep |
| win32 分支行为 | 未知 | 用例跳过 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 并发 CAS 恰一胜 + 幂等重放 | §3 | 68-76 | covered |
| 父进程等锁不覆盖 | §3 | 85-100 | covered |
| 崩溃残锁 + 显式恢复授权 | §3 | 109-121 | covered |
| 活跃 PID 不可夺 | §3 | 126-130 | covered |
| 超时/writeSync 撞锁/备份失败/win32 | §4 | — | unknown（未测） |
