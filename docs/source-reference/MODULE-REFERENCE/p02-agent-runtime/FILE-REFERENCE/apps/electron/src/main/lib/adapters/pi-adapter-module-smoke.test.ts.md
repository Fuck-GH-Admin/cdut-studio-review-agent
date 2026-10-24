---
path: apps/electron/src/main/lib/adapters/pi-adapter-module-smoke.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d0b2774f51fbee335144065288836e1337b3160
sha256: 6f8804a04c4e75f3cbaea0bb8c58d18a5808e2311ccb8ca789913934726bd535
lines: 32
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-adapter-module-smoke.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Pi adapter 模块加载冒烟（SDK 0.84.3）：`pi-agent-adapter` 的 import 链在 0.84.3 下可加载、关键导出存在；`pi-retry-control` 的运行时事件映射在 0.84.3 事件形状下工作（`:3`）。

## 2. 用例清单

共 2 个 `test(`（`apps/electron/src/main/lib/adapters/pi-adapter-module-smoke.test.ts:4,13`）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | pi-agent-adapter 模块可加载（`:4`） | 动态 `import('./pi-agent-adapter')` | `mod` 有定义；`typeof mod.PiAgentAdapter==='function'`；`typeof mod.cleanupPiRuntimeResources==='function'` |
| 2 | pi-retry-control 运行时映射（`:13`） | `mapPiNativeRetryEvent` 三种事件 | `auto_retry_start`→`status:'starting'`；`auto_retry_attempt_start`→`'attempt'`；`auto_retry_end{outcome:'cancelled'}`→`'cleared'` |

## 3. 真实断言

逐条见上表（`:6-9,19,24,29`）。mock 边界：无 mock；纯模块加载 + 纯函数。

## 4. 未覆盖与脆弱点

未覆盖：`pi-retry-control` 其余事件（error/success/exhausted）、`pi-agent-adapter` 其余导出。用例 2 的事件对象为手工形状（`as` 无关，直接传字面量）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个用例 | 已证实 | `grep test(`；`:4,13` |
| 导出存在性断言 | 已证实 | `:8-9` |
| 三事件映射 | 已证实 | `:19,24,29` |
| 模块加载成功（运行时） | 未知 | NOT_RUN |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 模块加载/导出 | 1 | 4-11 | covered |
| retry 三事件映射 | 2 | 13-31 | covered |
| 其余 retry 事件 | 无 | — | unknown |
