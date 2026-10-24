---
path: apps/electron/src/main/lib/adapters/pi-prompt-chain.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d9bb58187ce5502cd92ff08bd4386ddeae006c17
sha256: 78f59d6d521930901055472d5e2e4b2efb3078c4fb17e70bdecde94bfa96a3c1
lines: 107
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-prompt-chain.ts

## 1. 结论与边界

Pi 的**单一 prompt owner**（运行时 async 状态机）：interrupt 只登记续轮 reservation 并 abort 当前 session；链路始终等待当前 prompt 真正 settle 后才消费 reservation，避免并行 prompt 和未关闭的事件流（`apps/electron/src/main/lib/adapters/pi-prompt-chain.ts:22-25`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状/签名 | 说明 |
| --- | --- | --- | --- | --- |
| `PiInterruptReservation` | 导出接口 | 1-5 | `{contentReady: Promise<string>, resolveAccepted, rejectAccepted}` | 续轮登记 |
| `PiPromptChainState` | 导出接口 | 7-11 | `{abortRequested, interrupting, pendingInterruptPrompts[]}` | 链状态 |
| `PiPromptChainDependencies` | 导出接口 | 13-20 | prompt/prepareInitialPrompt/shouldStopBeforeNextTurn/rejectPendingInterruptPrompts/createAbortError/dropTrailingAbortedAssistant | 依赖注入 |
| `runPiPromptChain` | 导出异步函数 | 26-107 | `(initialPrompt, state, deps): Promise<void>` | 主循环 |

## 3. 内部逻辑与关键流程

`runPiPromptChain` while 循环（`:34-107`）：

1. `shouldStopBeforeNextTurn` 为真→reject 当前 interrupt 与队列并 return（`:37-42`）。
2. `prepareInitialPrompt` 抛错→**整链中断**：当前+队内 reservation 全部 reject 再 rethrow（`:47-53` 注释：否则 accepted promise 悬挂到 cleanup 才 settle，渲染层「发送」状态卡数秒）。
3. `abortRequested` 三分支（`:57-72`）：当前 interrupt+队列非空→R1 正式开始（R2 的 abort 不令 R1 无 receipt 消失，`:59-63`）；仅队列非空→跳过旧 prompt 消费队首（`:64-66`）；否则 reject 全部 return。
4. finally：`interrupting` 时 `dropTrailingAbortedAssistant`（`:77-79`）。
5. prompt settle 后（`:82-93`）：abortRequested 且队列空→reject 并 return；`shouldStopBeforeNextTurn` 复查。
6. FIFO 消费队首 reservation（`:95-105`）：`contentReady` 抛错→rejectAccepted+rethrow。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`（import 检索）。出向：无 import（依赖全注入）。

## 5. 数据 I/O 与副作用

无直接 I/O；副作用经 `deps`（prompt/abort/reject）由调用方执行。

## 6. 分支、失败、取消与恢复

- 取消语义=abortRequested+interrupting 双标志协同（§3 各分支）；失败=prepareInitialPrompt/contentReady 抛错即断链（rethrow）；resume=restart 调用（无内部恢复）。

## 7. 权限与权威状态

无权限分支；「单一 prompt owner」是并发纪律约定（注释 `:22-25`）。

## 8. 修改影响面

改链语义影响 Pi 会话的 interrupt/续轮/发送状态机与渲染层交互。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/adapters/pi-prompt-chain.test.ts`（145 行；NOT_RUN）：断言 settle/reject 时序与 abort 仲裁（如 `:125-143` contentReady reject→accepted 与 chain 同因 reject）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+全分支语义 | 已证实 | `:1-107` |
| 测试断言存在 | 已证实 | pi-prompt-chain.test.ts（另篇） |
| 运行时序 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 4 导出+分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
