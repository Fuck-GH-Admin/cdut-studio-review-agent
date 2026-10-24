---
path: apps/electron/src/main/lib/adapters/pi-prompt-chain.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 304eda940b5f76133a0fea26d72346012c02eadd
sha256: 5055f9af7c1d755d206c49433f7fa6c64f42b37f910bc79852dd11ed36e15f1a
lines: 145
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-prompt-chain.test.ts

## 1. 测试目标

`pi-prompt-chain.ts` 的 `runPiPromptChain` 异步状态机：interrupt reservation 的 accept/reject 时序、abort 仲裁、失败断链。mock 边界=deps 注入假 prompt/prepare/shouldStop/reject/createAbortError/dropTrailing（全假实现）。

## 2. 用例清单

1 describe、4 测试调用点（grep test(=4；QA N-NB54-06 校正；5 场景折入 4 例；`pi-prompt-chain.test.ts:1-145`）：初链执行、abort 中断、reservation FIFO 续轮、prepareInitialPrompt 失败断链、contentReady 失败→accepted 与 chain 同因 reject（`:125-143`）。用例独立（每例新建 state/deps）。

## 3. 真实断言（代表性）

- `:132-143`：`Promise.allSettled([next.accepted, chain])` 后断言双 rejected，且 `reason` 均为注入的 `contentError`（同因传递）。
- 其余断言：resolve/reject 调用次序（jest 风格 mock call 记录）、chain resolve/reject 结局（行号见文件各 test 块）。

## 4. 未覆盖与脆弱点

未覆盖：`interrupting`+`dropTrailingAbortedAssistant` 与真实渲染层交互、R2 abort 时 R1 receipt 保留分支（`:59-63` 源注释场景）与源分支的逐条对应未逐一登记。Promise 时序断言依赖微任务推进（`await Promise.resolve()`），对事件循环实现敏感。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 文件 145 行、deps 全注入 mock、同因 reject 断言 | 已证实 | `:125-143` 逐行 |
| 用例总数=4 调用点 | 已证实 | grep test(=4（QA N-NB54-06 校正） |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 断链/同因 reject | §3 | covered |
| abort 三分支逐条 | §4 | partial |
| 实际运行 | §5 | unknown（NOT_RUN） |
