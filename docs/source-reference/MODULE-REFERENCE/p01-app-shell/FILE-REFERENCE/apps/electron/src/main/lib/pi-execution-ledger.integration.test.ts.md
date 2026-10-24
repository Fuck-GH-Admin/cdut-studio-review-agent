---
path: apps/electron/src/main/lib/pi-execution-ledger.integration.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 17923e871313cbdfb97f3710c65c180e8ffbcdfc
sha256: 53026c43cb3ab215e3470cde6b022aa59547ab10541c016b1a7925a265ac4643
lines: 93
kind: test
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-execution-ledger.integration.test.ts

## 1. 测试目标

Pi 命令执行关联链的**集成**测试（93 行，bun:test）：两个被包装 Bash tool call 的 toolCallId 经 `CommandExecutionLedger` 与 Harness tool facts 保持隔离（exitCode/stdout/outputHash 各自对应），以及账本满足 orchestrator 回调所需结构形状。mock 边界：**无 mock**——真实调用 `createBashToolDefinition`（`@earendil-works/pi-coding-agent`，`:2`）、`createControlledLocalBashOperations`/`wrapToolWithPermission`（`./adapters/pi-agent-adapter`，`:3`）、`createToolFact`（`./pi-harness/tool-facts`，`:4`），会真实 spawn 测试 shell 执行命令（`printf 'first'; exit 3` 等）。

## 2. 用例清单

前置（`:8-10`）：`testShell = win32 ? detectGitBashWindows() : '/bin/bash'`（`./git-detector`，`:6`）；win32 无 git bash 时 `testShell` 为假。模板 `executionTemplate`（`:12-23`，`as const`：stdout/stderr/exitCode/signal/timedOut/aborted/durationMs/shell/cwd/truncated）供用例 2 展开。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | keeps two wrapped Bash toolCallIds separate through execution ledger and Harness facts | 26-80 | `test.skipIf(!testShell)`；ledger + `createControlledLocalBashOperations('pi-execution-correlation-test', testShell, cb→ledger.set)` + `createBashToolDefinition` + `wrapToolWithPermission(rawTool, {})` | `tool.execute('tool-first', "printf 'first'; exit 3")` 期望抛错；`tool.execute('tool-second', "printf 'second'")` 成功；建两条 `createToolFact` | 见 §3 |
| 2 | ledger retains the structured shape required by the orchestrator callback | 82-92 | 新 ledger | `set('tool-1', {...tmpl, stdout:'one'})`、`set('tool-2', {...tmpl, stdout:'two', exitCode:2})`、`delete('tool-1')` | 见 §3 |

声明合计 **2 test / 0 it**（机械计数）；运行口径：有 testShell 时 2 例运行，win32 无 git bash 时用例 1 跳过（`skipIf`，1 例）。

## 3. 真实断言

用例 1：
- `:36-38` `tool.execute('tool-first', …)` `rejects.toThrow('Command exited with code 3')`。
- `:47` `secondCall.content[0]` `toMatchObject({ type: 'text' })`。
- `:51` `firstExecution` `toMatchObject({ stdout: 'first', exitCode: 3, shell: testShell })`。
- `:52` `secondExecution` `toMatchObject({ stdout: 'second', exitCode: 0, shell: testShell })`。
- `:53` `ledger.get('tool-missing')` `toBeUndefined()`。
- `:77` `firstFact` `toMatchObject({ fingerprint: 'tool-first', outcome: 'failure', subject: { exitCode: 3 } })`。
- `:78` `secondFact` `toMatchObject({ fingerprint: 'tool-second', outcome: 'success', subject: { exitCode: 0 } })`。
- `:79` `firstFact.subject.outputHash` `not.toBe(secondFact.subject.outputHash)`。

用例 2：
- `:87` `ledger.get('tool-1')` `toMatchObject({ stdout: 'one', exitCode: 0 })`。
- `:88` `ledger.get('tool-2')` `toMatchObject({ stdout: 'two', exitCode: 2 })`。
- `:90` `ledger.get('tool-1')`（delete 后）`toBeUndefined()`。
- `:91` `ledger.get('tool-2')` `toBeDefined()`。

## 4. 未覆盖与脆弱点

- **未覆盖**：`createToolFact` 的 `isError:true` 分支仅用例 1 第一条覆盖一次；`aborted/timedOut/signal/truncated` 字段的 fact 映射无断言；win32 分支（`detectGitBashWindows` 找不到时跳过，无替代验证）；并发 tool call 交错无测试。
- **脆弱点**：用例 1 依赖真实 spawn 与 shell 行为（`printf`/`exit 3` 的可移植性）；`undefined as never` 强转第 5 参（`:37`/`:44`，工具签名演进时会静默变义）；`testShell!` 非空断言依赖 skipIf 先行（`:28`）。
- 断言≠运行：本轮 `NOT_RUN`，未执行 bun test；本集成测试若运行会真实执行 bash 命令。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例设置/动作/断言如上；skipIf 条件与模板形状 | 已证实 | `:1-93` 全文逐行 |
| 声明计数 2 test/0 it；运行口径 2/1(skipIf) | 已证实（机械计数+skipIf 语义） | grep + `:26` |
| `createToolFact`/`wrapToolWithPermission` 内部实现 | 边界（跨批未深读） | `:3-4` 引入 |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 双 toolCallId 隔离链（execute→ledger→fact） | §2.1/§3 | 26-80 | covered |
| 账本结构形状（set/get/delete） | §2.2/§3 | 82-92 | covered |
| testShell 前置/executionTemplate | §2 | 8-23 | covered |
| aborted/timedOut 映射、并发交错 | §4 | - | unknown（未覆盖） |
