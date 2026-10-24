---
path: apps/electron/src/main/lib/execution-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b86c300ed2ba51bcac4e4c682b8e2208364fe54
sha256: 981dbecc614379857a14ddcbed0ac6c5447abf47a19a98073c442bf994a4c87a
lines: 71
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/execution-service.test.ts

## 1. 测试目标

直接测试 `execution-service.ts` 的 `createExecutionService`（1 个 describe `:21`）：注入 executor 统一结果/取消/killed 快照。2 个 `test(`。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1 | `:22-42` | 注入 executor（onSpawn 1234+exitCode 7）→`execution.exitCode toBe(7)`、`spawnedPid toBe(1234)`、`errorKind toBeUndefined()` |
| 2 | `:44-70` | 取消同一 AbortSignal→`aborted toBe(true)`、`execution.aborted toBe(true)`、`get('handle-2').handle.status toBe('killed')` |

## 3. 真实断言

`toBe`/`toBeUndefined`。工厂构造结果对象；真实 Promise/AbortController；无 mock 框架。

## 4. 未覆盖

- Pi 三路分派（PowerShell/WSL/bash）；WSL 缺 runtimeEnv 失败路径；throw→spawn_error 归一；completed Map 长期累积。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个 `test(`、断言如 §2 | 已证实 | 文件全读（71 行） |
| killed 快照归档断言 | 已证实 | 用例 2 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 注入/取消/快照 | §2 | `:22-70` | covered |
| §4 边缘 | — | — | unknown |
